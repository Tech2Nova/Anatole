+++
title = "Linux LXC容器使用"
author = "chenxi"
date = 2026-01-20
categories = ["Blog"]

+++
在 Ubuntu 主机中使用 LXC 容器的各类情况
<!--more-->
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

```bash
root@host:~# lxc-start --name mycontainer
```

您可以查看有关容器的状态信息。

```bash
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

```bash
root@host:~# lxc-ls --fancy
NAME        STATE   AUTOSTART GROUPS IPV4       IPV6 UNPRIVILEGED 
mycontainer RUNNING 0         -      10.0.3.224 -    false
```

LXC容器只提供命令行面板，lxc-attach命令启动容器 shell。

```bash
root@host:~# lxc-attach --name mycontainer
```

退出容器 shell。

```bash
root@mycontainer:~# exit
```

您可以停止容器。

```bash
root@host:~# lxc-stop --name mycontainer
```

如果您不再需要该容器，则可以永久销毁它。

```bash
root@host:~# lxc-destroy --name mycontainer
```



##### 1.4 LXC容器配置

容器的文件系统活动仅限于 `/var/lib/lxc/<container-name>/rootfs`

如果想实现在主机和容器之间共享某些文件，您可以创建容器外部的主机卷，然后将该卷挂载到容器内部。

首先在host中创建一个共享文件夹（记得赋予权限，chmod +x）

```bash
root@host:~# mkdir -p /home/mz/Desktop/lxc-share 
```

然后编辑容器配置文件

```bash
vim /var/lib/lxc/encrypt/config

#在最后一行追加以下内容
lxc.mount.entry = /home/mz/Desktop/lxc-share share none bind,create=dir 0 0

！！！！！容器路径不要使用绝对路径，例如/share，直接使用share
```

说明：

- lxc.mount.entry 是 LXC 的标准挂载语法
- create=dir：自动创建容器内的 /mnt/share 目录
- bind：绑定挂载
- 0 0：dump 和 fsck 顺序

配置容器后，重新启动它以使用新配置。



##### 1.5 LXC容器快照

！！注意，拍摄快照时，容器一定要是停止状态

```bash
lxc-snapshot mycontainer
```

生成的快照存放在/var/lib/lxc/你的容器名/snaps/中，快照名称依次从snap0, snap1 ... snapn

查看当前存在的快照

```bash
sudo lxc-snapshot -L -n 你的容器名          # 列出所有快照
```

恢复快照

```bash
# 恢复并覆盖原容器
sudo lxc-snapshot -r 快照名 -n 你的容器名
```

删除快照

```bash
sudo lxc-snapshot -d 快照名 -n 你的容器名
```



##### 1.6 手动创建LXC容器快照

当无法使用lxc-create命令创建容器时，例如一直卡在下载image映像

此时，我们可以手动下载

通过官网或者镜像源下载rootfs.tar.xz和meta.tar.xz
https://mirrors.tuna.tsinghua.edu.cn/lxc-images/images/ubuntu/jammy/amd64/default/20260111_07:42/rootfs.tar.xz
https://images.linuxcontainers.org/images/ubuntu/jammy/amd64/default/20260111_07:42/meta.tar.xz

然后将这两个文件放在/home/x/lxc-files/rootfs.tar.xz（或者指定目录下，在下方命令中对应替换即可）

```bash
sudo lxc-create -n lxc1 -t local -- --fstree /home/x/lxc-files/rootfs.tar.xz --metadata /home/x/lxc-files/meta.tar.xz
```

然后就创建成功



##### 1.7 手动删除容器

在跑实验时，会遇到容器损坏，无法开机，例如

```bash
x@x-Latitude-7300:~$ sudo lxc-start lxc1
lxc-start: lxc1: lxccontainer.c: wait_on_daemonized_start: 877 Received container state "ABORTING" instead of "RUNNING"
lxc-start: lxc1: tools/lxc_start.c: main: 306 The container failed to start
lxc-start: lxc1: tools/lxc_start.c: main: 309 To get more details, run the container in foreground mode
lxc-start: lxc1: tools/lxc_start.c: main: 311 Additional information can be obtained by setting the --logfile and --logpriority options
```

此时，我尝试用快照覆盖，或者直接复制快照，都无法还原容器，那只能重新创建容器，好在我们通过手动创建的速度很快

但是创建新容器前，我们需要将原来的容器删除，发现手动无法删除lxc1文件夹，即使在root权限下

```bash
root@x-Latitude-7300:/var/lib/lxc# rm -r lxc1/
rm: cannot remove 'lxc1/rootfs/etc/sudoers': Operation not permitted
rm: cannot remove 'lxc1/rootfs/etc/passwd': Operation not permitted
rm: cannot remove 'lxc1/rootfs/etc/shadow': Operation not permitted
rm: cannot remove 'lxc1/rootfs/usr/games/.ssh/authorized_keys': Operation not permitted
rm: cannot remove 'lxc1/rootfs/usr/games/.ssh/authorized_keys2': Operation not permitted
```

此时，通过查询了解到

容器里某些关键文件（/etc/passwd、/etc/shadow、authorized_keys 等）可能被某些安全脚本、模板、或你/别人手动设置了 +a 来防止意外修改。

LXC 模板有时会这么做，尤其是 privileged 容器或某些安全加固过的镜像。

```bash
root@x-Latitude-7300:/var/lib/lxc# sudo lsattr -R /var/lib/lxc/lxc1/rootfs/etc/passwd 
-----a--------e------- /var/lib/lxc/lxc1/rootfs/etc/passwd
```

所以，我们先移除 append-only 属性（必须递归全去掉）：

```bash
sudo chattr -R -a /var/lib/lxc/lxc1/rootfs
```

再次查询，a属性成功去除

```bash
root@x-Latitude-7300:/var/lib/lxc# sudo lsattr -R /var/lib/lxc/lxc1/rootfs/etc/passwd
--------------e------- /var/lib/lxc/lxc1/rootfs/etc/passwd
```

此时，我们再删除lxc容器文件夹，成功删除

```bash
sudo rm -rf /var/lib/lxc/lxc1
```




