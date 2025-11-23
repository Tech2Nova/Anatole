+++
title = "Ubuntu Disk Expansion"
slug = "setup-kvm"
date = 2025-03-30
author = "chenxi"
description = "对VMware 中的ubuntu进行磁盘扩容"
categories = ["Blog"]

+++
对VMware 中的ubuntu进行磁盘扩容
<!--more-->

## 为Ubuntu系统扩容

### 1、在vmware中扩展硬盘容量

该步不能有快照，有快照的需要先删除快照

选择对应虚拟机，编辑虚拟机配置，选择硬盘-->扩展



{{< figure src="/images/ubuntu_expand/1.png" caption="" alt="" width=30% >}}

选择合适的大小修改

{{< figure src="/images/ubuntu_expand/2.png" caption="" alt="" width=50% >}}



点击扩展，此时只是在ubuntu系统上有分区，还没有扩容到内存中去。





### 2、Ubuntu命令操作：安装分区管理工具

#### 第一步：打开分区管理工具

- 使用命令安装分区管理工具gparted:

```bash
sudo apt-get install gparted
```

- 使用命令启动分区管理工具

```bash
sudo gparted
```

{{< figure src="/images/ubuntu_expand/3.png" caption="" alt="" width=50% >}}