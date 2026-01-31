+++
title = "LXC运行脚本"
author = "chenxi"
date = 2026-01-31
categories = ["Blog"]

+++
在 Ubuntu 主机中利用 LXC 容器采集HPC数据
<!--more-->

此脚本历经一个月，终于可以正常运行，之前版本会遇到各种各样的问题，导致系统死机，无法实现连续运行，收集数据非常耗时，之前甚至还冤枉了实验室的电脑，后来有一天晚上突然想起来会不会是脚本中perf命令的问题，让AI更新了一版，果然正常了起来，原来是我太蠢了😭😭

目前版本配合👉 [Linux LXC容器使用]({{< relref "post/lxc_command.md" >}})
这篇博客一起使用，首先在ubuntu中配置LXC容器，将实验样本放入容器中并拍摄快照



```bash

#!/bin/bash
# 用途：在 LXC 容器 ubuntu22 中依次运行 /home/1 目录下所有样本
# 支持：--start N 或 -s N 从第 N 个样本继续

set -u
set -e

#相关配置信息，根据自己lxc容器的名字做相应修改
CONTAINER="lxc1"
SNAPSHOT="snap0"
CGROUP="/lxc.payload.lxc1"           
CONTAINER_SAMPLES_DIR="/home/1"
OUTPUT_DIR="./results4"
LOG_FILE="./run_lxc_log4.txt"


#在收集完hpc数据后，可能会出现没有权限写入HOST主机的情况，我猜是由于hpc是在root权限下采集的，移动hpc数据也需要root权限，以下三行解决这个问题
mkdir -p "$OUTPUT_DIR"
chmod 755 "$OUTPUT_DIR"
chown -R "$(whoami)" "$OUTPUT_DIR"

exec 1>>"$LOG_FILE" 2>&1   # 把所有输出同时记录到日志文件，便于排查

echo "脚本启动于 $(date)"
echo "当前内核: $(uname -r)"
echo "perf 版本: $(perf version 2>/dev/null || echo 'perf 未找到')"
echo

# =============== 参数解析 ===============
START_INDEX=1
while [[ $# -gt 0 ]]; do
    case $1 in
        --start|-s)
            START_INDEX="$2"
            if ! [[ "$START_INDEX" =~ ^[0-9]+$ ]] || [ "$START_INDEX" -lt 1 ]; then
                echo "错误：--start 参数必须是正整数 ≥1"
                exit 1
            fi
            shift 2
            ;;
        *)
            echo "未知参数: $1"
            echo "用法: $0 [--start N | -s N]"
            exit 1
            ;;
    esac
done

echo "运行模式：从第 $START_INDEX 个样本开始"
echo

# =============== 单次运行函数 ===============
run_experiment() {
    local sample_index="$1"
    local sample_filename="$2"
    local output_file="$OUTPUT_DIR/$(printf "%04d" $sample_index).csv"

    if [ -f "$output_file" ]; then
        echo "跳过：第 $sample_index ($sample_filename) → 已存在 $output_file"
        return 0
    fi

    echo "================================================================"
    echo "开始 第 $sample_index  → $sample_filename"
    echo "输出 → $output_file"
    echo "================================================================"

    # 1. 恢复快照
    echo "恢复快照 $SNAPSHOT ..."
    sudo lxc-snapshot -n "$CONTAINER" -r "$SNAPSHOT" || { echo "快照恢复失败"; return 1; }
    sleep 6

    # 2. 启动容器（前台 & 捕获 PID）
    echo "启动容器..."
    sudo lxc-start -n "$CONTAINER" -F &
    LXC_PID=$!
    sleep 4

    # 3. 运行程序 + perf 前台采集（最关键：perf 不能在后台运行）
    echo "启动 perf + 样本程序..."

    sudo perf stat -x ',' -I 100 \
        -e dTLB-load-misses,dTLB-store-misses,iTLB-load-misses,bus-cycles \
        --cgroup="$CGROUP" -a \
        -- bash -c "
            set -e
            timeout 7.5 \
            bash -c '
                sudo lxc-attach -n \"$CONTAINER\" --nice 19 -- \"$CONTAINER_SAMPLES_DIR/$sample_filename\" &
                PROG_PID=\$!
                sleep 7.2
                pkill -9 -u user 2>/dev/null || true
                killall -9 -u user 2>/dev/null || true
                wait \$PROG_PID 2>/dev/null || true
            '
        " > "$output_file" 2>&1

    PERF_EXIT=$?
    echo "perf 退出码: $PERF_EXIT"

    # 4. 强制清理容器（多重保险）
    echo "强制停止容器..."
    sudo lxc-stop -n "$CONTAINER" -k || true
    sleep 1.5

    # 等待状态变为 STOPPED，最多等 10 秒
    sudo lxc-wait -n "$CONTAINER" -s STOPPED -t 10 || true

    # 再暴力杀一次残留
    sudo pkill -9 -f "lxc.*$CONTAINER" 2>/dev/null || true
    sudo killall -9 -q -u "$(sudo lxc-info -n "$CONTAINER" -pH 2>/dev/null)" 2>/dev/null || true

    # 等待 lxc-start 进程结束
    wait $LXC_PID 2>/dev/null || true

    echo "✓ 第 $sample_index 完成，结果: $output_file"
    echo
    sleep 2   # 每轮之间多留一点喘息时间，减轻存储/内核压力
}

# =============== 获取样本列表 ===============
echo "获取样本列表（基于快照 $SNAPSHOT）..."
sudo lxc-snapshot -n "$CONTAINER" -r "$SNAPSHOT" >/dev/null 2>&1 || true
sudo lxc-start -n "$CONTAINER" -d
sleep 4

mapfile -t sample_files < <(
    sudo lxc-attach -n "$CONTAINER" -- ls -1 "$CONTAINER_SAMPLES_DIR" 2>/dev/null |
    grep -v '^$' | sort -V
)

sudo lxc-stop -n "$CONTAINER" -k >/dev/null 2>&1 || true
sleep 2

total_samples=${#sample_files[@]}
echo "发现 $total_samples 个样本"
if [ $total_samples -eq 0 ]; then
    echo "错误：没有样本文件！"
    exit 1
fi

if [ $START_INDEX -gt $total_samples ]; then
    echo "错误：START_INDEX=$START_INDEX > 总样本 $total_samples"
    exit 1
fi

echo "前5个样本预览："
printf "  %s\n" "${sample_files[@]:0:5}"
[ $total_samples -gt 5 ] && echo "  ..."
echo

# =============== 主循环 ===============
echo "开始批量运行（从第 $START_INDEX 个）..."
echo

for ((i = START_INDEX - 1; i < total_samples; i++)); do
    index=$((i + 1))
    filename="${sample_files[$i]}"
    run_experiment "$index" "$filename"
done

# =============== 总结 ===============
completed_count=$(ls -1 "$OUTPUT_DIR"/*.csv 2>/dev/null | wc -l)
echo "======================================================================"
echo "本次运行结束 $(date)"
echo "总样本数     : $total_samples"
echo "起始位置     : 第 $START_INDEX 个"
echo "已生成结果   : $completed_count 个"
echo "结果目录     : $OUTPUT_DIR"
echo "最近10个结果文件："
ls -1 "$OUTPUT_DIR"/*.csv 2>/dev/null | sort -V | tail -10 || true
echo "======================================================================"
echo "日志文件：$LOG_FILE"
```
