+++
title = "在 LXC 容器中收集HPC数据"
author = "chenxi"
date = 2025-11-26
categories = ["Blog"]

+++

Collecting HPCs data in LXC containers
<!--more-->



#### 1、编写脚本

通过在完全隔离、可精确复位的LXC容器环境中，分别运行10次良性程序（benign）和10次勒索软件（ransomware），利用Linux perf工具采集容器运行期间的硬件性能事件（指令数、缓存命中/缺失、分支预测等），定量对比两类程序在微体系结构层面的行为差异，为后续基于HPC的勒索软件检测方法提供真实、可复现的实验数据。

**实验环境**

- 宿主机系统：Ubuntu 22.04 LTS（已启用perf cgroup支持）
- 容器技术：LXC（特权容器）
- 容器名称：encrypt
- 干净快照：snap0（包含待加密/处理的原始文档，位于/root/attackfile）
- 测试程序（均位于容器内/home目录，具有可执行权限）：
  - benign：良性程序（模拟正常文件处理行为）
  - ransomware：真实/模拟勒索软件（会对/root/attackfile目录文件进行加密或破坏）
- 监控工具：perf stat（cgroup模式，监控整个容器）

**实验流程（单次实验，重复20次）**

1. 使用lxc-snapshot -r将容器恢复到干净快照snap0，确保每次实验起点完全一致
2. 启动LXC容器（前台启动）
3. 通过lxc-attach -- sudo -i /home/<program>方式在容器内以前台root身份直接运行目标程序
4. 同时在宿主机使用perf以cgroup方式对整个encrypt容器进行10秒精准采样，采集以下5个核心硬件性能事件：
   - instructions（执行指令数）
   - cache-references / cache-misses（缓存引用与缺失）
   - branches / branch-misses（分支预测与预测失败）
5. 10秒采样结束后，立即强制终止容器内程序并停止容器
6. 将perf输出保存为独立csv文件，便于后续离线分析







以下是采集脚本


```
#!/bin/bash
# run_lxc.sh  ——  最终稳定版（兼容所有 perf 版本 + 支持 Ctrl+C 安全退出）

CONTAINER="encrypt"
SNAPSHOT="snap1"
CGROUP="/lxc.payload.encrypt"
OUTPUT_DIR="./hpc_results"

mkdir -p "$OUTPUT_DIR"

# =============== Ctrl+C 安全退出处理 ===============
trap_ctrlc() {
    echo -e "\n\n[$(date +%T)] 检测到 Ctrl+C，正在安全终止所有实验..."
    echo "正在杀掉残留的 perf、容器、程序进程..."
    
    sudo pkill -9 perf 2>/dev/null || true
    sudo lxc-stop -n "$CONTAINER" -k 2>/dev/null || true
    sudo kill $LXC_PID 2>/dev/null || true
    sudo kill $PERF_PID 2>/dev/null || true
    sudo kill $PROG_PID 2>/dev/null || true
    
    echo "已安全退出。已完成的文件保留在 $OUTPUT_DIR 中。"
    exit 130
}

trap trap_ctrlc SIGINT

# =============== 单次实验函数 ===============
run_experiment() {
    local prog_name="$1"      # benign 或 ransomware
    local run_number="$2"
    local padded=$(printf "%02d" $run_number)
    local output_file="$OUTPUT_DIR/${prog_name}_${padded}.csv"

    echo "============================================"
    echo "开始 $prog_name 第 $run_number 次（第 $(( $(ls $OUTPUT_DIR/${prog_name}_*.csv 2>/dev/null | wc -l) + 1 )) 次实际执行）"
    echo "输出文件: $output_file"
    echo "============================================"

    # 1. 恢复快照
    sudo lxc-snapshot -n "$CONTAINER" -r "$SNAPSHOT"
    sleep 5

    # 2. 启动容器（前台）
    sudo lxc-start -n "$CONTAINER" -F &
    LXC_PID=$!
    sleep 5

    # 3. 先启动 perf：用 timeout 命令精确控制 10.15 秒总时长（兼容所有版本！）
    sudo timeout 10.15 perf stat -x ',' -I 10 \
        -e instructions,cache-references,cache-misses,branches,branch-misses \
        --cgroup="$CGROUP" -a \
        > "$output_file" 2>&1 &
    PERF_PID=$!

    # 4. 等待 perf 完全启动（实测 60~90ms 足够）
    sleep 0.08

    # 5. 启动目标程序
    sudo lxc-attach -n "$CONTAINER" -- sudo -i "/home/$prog_name" &
    PROG_PID=$!

    # 6. 程序运行整整 10 秒
    sleep 10

    # 7. 立即暴力终结一切
    sudo lxc-attach -n "$CONTAINER" -- pkill -9 -u user 2>/dev/null || true
    sudo lxc-attach -n "$CONTAINER" -- killall -9 -u user 2>/dev/null || true
    sleep 0.3
    sudo lxc-stop -n "$CONTAINER" -k 2>/dev/null || true
    wait $LXC_PID 2>/dev/null || true

    # 确保 perf 被 timeout 自然结束，或强制杀掉
    sudo kill $PERF_PID 2>/dev/null || true
    wait $PERF_PID 2>/dev/null || true

    echo "✓ $prog_name 第 $run_number 次完成！"
    echo "  perf 实际采集时长 ≈ 10.07 秒（程序运行 10.000 秒）"
    echo "  结果已保存: $output_file"
    echo
}

# =============== 主循环 ===============
echo "开始执行 10 次 benign + 10 次 ransomware 实验"
echo "任意时刻按 Ctrl+C 可安全中断，当前进度会自动保留"
echo

for i in {1..5}; do
    run_experiment "benign" "$i"
done

for i in {1..5}; do
    run_experiment "ransomware" "$i"
done

echo "======================================================================"
echo "所有 20 次实验成功完成！"
echo "结果目录: $OUTPUT_DIR"
echo "文件列表:"
ls -1 "$OUTPUT_DIR"/*.csv | sort
echo "======================================================================"
```



#### 2、数据结果

<img src="\images\lxc\compare.png" alt="compare" style="zoom:50%;" />

对勒索加密函数和正常加密函数分别重复运行5次，采集了5个事件的HPCs数值，求平均后可视化如上，两者之间差异明显，之后可以从代码层面分析造成这种差异的原因

