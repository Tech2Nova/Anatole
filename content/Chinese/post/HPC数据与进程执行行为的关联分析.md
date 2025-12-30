+++
title = "HPC数据与进程执行行为的关联分析"
author = "chenxi"
date = 2025-12-10
categories = ["Blog"]

+++

Correlation analysis between HPC data and process execution behavior
<!--more-->



本研究提出了一种可视化框架，能够实现硬件性能计数器（HPCs）与进程执行行为的关联分析。该框架由以下三个核心组件构成： (1) 运行进程快照的构建； (2) 按进程过滤 HPC 数据； (3) 将合并后的 HPC 事件计数与进程执行细节呈现在统一的时间线图表中。 下文将对每个组件进行详细介绍和讨论。

#### 进程快照（Process Snapshot）

勒索软件在执行过程中，通常会启动多个自身进程实例以及外部进程来完成攻击目标。在利用硬件性能计数器进行侧信道分析时，明确哪些运行进程对性能计数器的数值做出了贡献、以及这些进程中哪些与勒索软件执行直接相关，具有重要意义。为此，我们在数据采集期间以固定间隔对系统中正在运行的进程列表进行快照，并仅保留试验开始后新出现的进程。这些快照为后续分析提供了宝贵的关联信息，能够推断父子进程关系，并实现对每个进程的 HPC 指标进行独立归因。

#### 数据采集（Process Filtering）

我们通过 perf 和 bpftrace 命令行接口生成了两种自定义时间线报告： 第一种报告统计了全系统范围内 HPC 事件的计数值； 第二种报告则聚焦于勒索程序开始运行后，系统内新触发产生的具体进程信息。

#### hpc可视化（Process Visualization）

基于上述进程过滤报告，我们绘制了多个HPC事件计数的时间序列曲线，并叠加了垂直条形标记，用于指示各进程的启动时间（该时间信息来源于进程快照结果），从而直观展现出xx（如下图所示）。





<img src="\images\lxc\branch-loads.png" alt="branch-loads" style="zoom:24%;" />

<img src="\images\lxc\instructions.png" alt="instructions" style="zoom:24%;" />

<img src="\images\lxc\L1-dcache-loads.png" alt="L1-dcache-loads" style="zoom:24%;" />

<img src="\images\lxc\LLC-load.png" alt="LLC-load" style="zoom:24%;" />

<img src="\images\lxc\node-loads.png" alt="node-loads" style="zoom:24%;" />

以Gonnacry为例，（MD5：1bda1b95764f6981e32f7c9452f65f51）

1、我在被攻击目录下存放了7.8G的文件内容，从五个事件可以看出，勒索软件几乎只用1.5s就完成了所有文件的加密

2、勒索软件的加密勒索大体分为两个阶段，

第一个阶段，即0.141-0.156s，系统触发多个进程

该阶段勒索软件主要进行：生成 RSA 密钥、加密客户端私钥并持久化、准备用于加密文件的公钥加密器等多项准备工作

第二个阶段，即0.504-0.517s，系统又触发多个进程

该阶段勒索软件开始主文件加密循环









lxc容器内采集进程信息，不知道什么原因，在宿主机中用lxc-attach命令执行这个脚本，无法采集到正常的进程信息，所以选择了一个原始的方法，让容器每次开机自动执行这个脚本

```bash
sudo crontab -e
#然后vim添加下面这一行命令
@reboot /home/trace_exec.sh > /home/trace.log 2>&1
```



```bash
#!/bin/bash
LOG="/home/trace.log"

> "$LOG" 

sudo bpftrace -e '
kprobe:__x64_sys_execve,
kprobe:__x64_sys_execveat
{
    $now = nsecs;
    printf("%s.%03d [EXEC] %d %s %s\n",
        strftime("%H:%M:%S", $now),
        ($now / 1000000) % 1000,   
        pid, comm, str(reg("di")));
}
' | tee -a "$LOG"
```





在ubuntu或者lxc容器中运行bpftrace命令时可能会出现报错，最可能的原因是bpftrace版本过老

```bash
bpftrace --version
```

先查看bpftrace的版本，即使sudo apt update & apt install bpftrace，下载的版本还是0.14（目前不清楚具体原因）

解决方案：

1、在bpftrace 官方github仓库中下载需要的版本，我下载了v0.18.0

<img src="\images\lxc\bpftrace.png"  style="zoom: 50%;" />

2、查看系统当前bpftrace的路径，which bpftrace

我的ubuntu主机是在/usr/local/bin，lxc主机是在/usr/bin，在哪里就用下载好的bpftrace直接替换现有的，并给执行权限

```bash
sudo chmod +x bpftrace 
sudo mv bpftrace /usr/local/bin/
```

3、验证（立刻成功） bpftrace --version # 输出：bpftrace v0.18.0







在宿主机运行下面这个脚本，这个脚本只运行一次，并且运行完不会关闭lxc容器，进程信息保存在容器内home目录下

```bash
#!/bin/bash

CONTAINER="example"
SNAPSHOT="snap1"
CGROUP="/lxc.payload.example"
OUTPUT_DIR="./hpc_results"
TARGET_PROG="ransomware"  # 或 benign

mkdir -p "$OUTPUT_DIR"

echo "=========================================="
echo "开始采集 - 容器内真实 execve 日志（kprobe 版） + 宿主机 HPC"
echo "目标程序: $TARGET_PROG"
echo "=========================================="


# 1. 恢复快照并启动容器
echo "[1/5] 恢复快照并启动容器"
sudo lxc-snapshot -n "$CONTAINER" -r "$SNAPSHOT"
sleep 10

# 关键：后台启动 + 彻底静默 + 等完全运行
sudo lxc-start -n "$CONTAINER" -d > /dev/null 2>&1
sudo lxc-wait -n "$CONTAINER" -s RUNNING
sleep 3

# 2. 启动容器内已经预置好的 trace_exec.sh（清空旧日志并后台运行）
# echo "[2/5] 启动容器内 kprobe execve 采集脚本 → /home/trace.log"
# sudo lxc-attach -n "$CONTAINER" -- bash -c "
#     /home/trace_exec.sh &
#     echo 'trace_exec.sh 已启动，PID: \$!'
# "

sleep 1

# 3. 宿主机 perf stat 采集 HPC（10 秒总时长，每 10ms 打印一次）
echo "[3/5] 宿主机启动 perf stat HPC 采集（10s）"
sudo timeout 10.15 perf stat -x ',' -I 10 \
    -e instructions,L1-dcache-loads,LLC-load,branch-loads,node-loads \
    --cgroup="$CGROUP" -a \
    > "$OUTPUT_DIR/${TARGET_PROG}_hpc.csv" 2>&1 &
PERF_PID=$!

# 4. 运行目标程序（这里假设是 ransomware 或 benign 可执行文件）
echo "[4/5] 启动目标程序: $TARGET_PROG"
sudo lxc-attach -n "$CONTAINER" -- sudo -i "/home/$TARGET_PROG" &
PROG_PID=$!

# 5. 等待 10 秒采集完成
echo "[5/5] 等待 10 秒采集完成..."
sleep 10

# 杀掉目标进程（确保下次快照恢复后不会残留）
echo "杀掉容器内用户进程..."
sudo lxc-attach -n "$CONTAINER" -- pkill -9 || true

# 停止 perf（timeout 会自动退出，这里再保险 kill 一下）
sudo kill $PERF_PID 2>/dev/null || true
wait $PERF_PID 2>/dev/null || true

echo "=========================================="
echo "采集完成！"
echo "HPC 数据已保存至: $OUTPUT_DIR/${TARGET_PROG}_hpc.csv"
echo "真实 execve 日志请手动进入容器查看: /home/trace.log"
echo "容器已保持运行状态，可随时 lxc-attach 进去查看日志"
echo "=========================================="
```

instructions、cache-misses、cache-references、branch-misses、branches

L1-dcache-load-misses、L1-dcache-stores、LLC-load-misses、LLC-stores、dTLB-load-misses

dTLB-stores、iTLB-loads、iTLB-load-misses、branch-loads、branch-load-misses