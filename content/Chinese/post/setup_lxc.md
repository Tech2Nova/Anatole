+++
title = "Setup LXC"
slug = "setup-lxc"
author = "chenxi"
date = 2025-11-19
description = "在 Ubuntu 主机中创建 LXC 容器"
categories = ["Blog"]

+++
在 Ubuntu 主机中创建 LXC 容器
<!--more-->

#### 一、熟悉LXC容器的使用方式，利用LXC容器运行程序并收集HPCs数据


##### 1.1 LXC介绍

Proxmox VE (PVE) 提供了两种主要的虚拟化技术：完整的虚拟机(KVM)和轻量级的Linux容器(LXC)。

LXC是Linux容器（Linux Containers）的缩写，是一种轻量级的虚拟化技术。

LXC容器利用Linux内核的cgroup和namespace技术，在应用层创建隔离的运行环境，与宿主机共享同一个内核，但拥有独立的文件系统、网络和进程空间。与Docker等应用容器不同，LXC是**系统容器**，可以运行完整的操作系统，包括init系统、后台服务和各种系统工具。PVE中的LXC容器分为两种类型：

- **无特权容器(Unprivileged Containers)**：默认选项，安全性较高
- **特权容器(Privileged Containers)**：拥有更高权限，能直接访问宿主机资源

##### 1.2 安装LXC

在大多数情况下，您会在您的 Linux 发行版中找到最新版本的 LXC。直接在发行版的软件包库中，或者通过一些移植通道。

```bash
sudo apt-get install lxc
```

您的系统将拥有所有 LXC 命令，以及所有模板，使用以下命令检查 Linux 内核是否具有必需的配置

```bash
lxc-checkconfig
```

所有可用的 LXC 模板都位于 /usr/local/share/lxc/templates 目录下。

```bash
# ls -1 /usr/local/share/lxc/templates
```

##### 1.3 创建并启动LXC容器（在root权限下进行）

特权容器是由 root 创建并作为 root 运行的容器。

特权容器是开始学习和试验 LXC 的最简单方法，但它们可能不适合生产环境使用。

```bash
root@host:~# lxc-create --name mycontainer --template download -- --dist ubuntu --release jammy --arch amd64
```

说明：

- mycontainer替换为创建容器的名字
- Distribution: ubuntu
- Release: jammy 或 noble
- Architecture: amd64

创建容器后，您可以启动它。

```
root@host:~# lxc-start --name mycontainer
```

您可以查看有关容器的状态信息。

```
root@host:~# lxc-info --name mycontainer
Name:           mycontainer
State:          RUNNING
PID:            3250
IP:             10.0.3.224
Link:           vethgmeH9z
TX bytes:      1.51 KiB
RX bytes:      2.15 KiB
Total bytes:   3.66 KiB
```

您可以查看所有容器的状态信息。

```
root@host:~# lxc-ls --fancy
NAME        STATE   AUTOSTART GROUPS IPV4       IPV6 UNPRIVILEGED 
mycontainer RUNNING 0         -      10.0.3.224 -    false
```

LXC容器只提供命令行面板，lxc-attach命令启动容器 shell。

```
root@host:~# lxc-attach --name mycontainer
```

退出容器 shell。

```
root@mycontainer:~# exit
```

您可以停止容器。

```
root@host:~# lxc-stop --name mycontainer
```

如果您不再需要该容器，则可以永久销毁它。

```
root@host:~# lxc-destroy --name mycontainer
```

##### 1.4 LXC容器配置

容器的文件系统活动仅限于 `/var/lib/lxc/<container-name>/rootfs`

如果想实现在主机和容器之间共享某些文件，您可以创建容器外部的主机卷，然后将该卷挂载到容器内部。

首先在host中创建一个共享文件夹（记得赋予权限，chmod +x）

```
root@host:~# mkdir -p /home/mz/Desktop/lxc-share 
```

然后编辑容器配置文件

```
vim /var/lib/lxc/encrypt/config

#在最后一行追加以下内容
lxc.mount.entry = /home/mz/Desktop/lxc-share /var/lib/lxc/mycontainer/rootfs/mnt/share none bind,create=dir 0 0
```

说明：

- lxc.mount.entry 是 LXC 的标准挂载语法
- create=dir：自动创建容器内的 /mnt/share 目录
- bind：绑定挂载
- 0 0：dump 和 fsck 顺序

配置容器后，重新启动它以使用新配置。

##### 1.5 LXC容器快照

！！注意，拍摄快照时，容器一定要是停止状态

```
lxc-snapshot mycontainer
```

生成的快照存放在/var/lib/lxc/你的容器名/snaps/中，快照名称依次从snap0, snap1 ... snapn

查看当前存在的快照

```
sudo lxc-snapshot -L -n 你的容器名          # 列出所有快照
```

恢复快照

```
# 恢复并覆盖原容器
sudo lxc-snapshot -r 快照名 -n 你的容器名
```

删除快照

```
sudo lxc-snapshot -d 快照名 -n 你的容器名
```



参考文档：

[Linux 容器 - LXC - 入门 - Linux 容器](https://linuxcontainers.cn/lxc/getting-started/)

[Linux lxc 命令 | 菜鸟教程](https://www.runoob.com/linux/linux-comm-lxc.html)

[使用 LXC 命令创建和启动 LXC Linux 容器-云社区-华为云](https://bbs.huaweicloud.com/blogs/379777)


