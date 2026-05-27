+++
author = "chenxi"
title = "基于Docker容器的攻防测评考试平台部署"
date = "2026-05-01"
description = ""
categories = ["Blog"]
+++


<!--more-->

## 本平台基于开源仓库CTFd

仓库地址 https://github.com/CTFd/CTFd.git

### 一、Windows平台下安装Docker

#### 1.1 安装Docker Desktop

最好基于windows平台部署，因为docker Desktop的可视化做的非常好

从官网下载完Docker Desktop后，可能会显示当前电脑wsl版本过老，正常来说，点击Try Again--> powershell会运行wsl --update、wsl --install等命令即可解决问题，

<br>
<img src="/images/docker/2.png" style="width:100%; display:block; margin:auto;">
<br>

存在一些特殊情况，例如发现无法连接，可以离线下载，从GitHub上（[](https://github.com/microsoft/WSL/releases/download/2.6.3/wsl.2.6.3.0.x64.msi)）下载

<br>
<img src="/images/docker/1.png" style="width:100%; display:block; margin:auto;">
<br>

双击wsl.2.6.3.0.x64.msi后，安装成功，运行wsl --status只显示默认版本：2，这说明WSL 核心安装了，但 Linux 发行版还没安装，所以还需要安装ubuntu

```
wsl --install -d Ubuntu --web-download
```

<br>
<img src="/images/docker/3.png" style="width:100%; display:block; margin:auto;">
<br>

下载和安装Ubuntu后，会弹出wsl桌面应用，然后会初始化user和password，我这里设置的是dd和004029

<br>
<img src="/images/docker/4.png" style="width:100%; display:block; margin:auto;">
<br>

然后，重启docker desktop，注意要在右下角托盘关闭，然后重新打开

<br>
<img src="/images/docker/5.png" style="width:100%; display:block; margin:auto;">
<br>

下面测试docker是否安装成功

#### 1.2 测试 Docker 是否能运行容器

输入：

```
docker --version
docker run hello-world
```

如果成功，会看到类似输出：

```
Hello from Docker!
This message shows that your installation appears to be working correctly.
```

这一步非常关键，如果成功则代表Docker 已完全安装且 可以运行容器

然而也可能遇到网络问题

<br>
<img src="/images/docker/6.png" style="width:100%; display:block; margin:auto;">
<br>

此时，需要给 Docker Desktop 配置 **镜像加速器**。**（如果能连外网则可以跳过这一步）**

步骤

打开：Docker Desktop    点击：Settings      进入：Docker Engine

你会看到一个 JSON 配置，例如：

```
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  }
}
```

把它修改成：

```
{
  "registry-mirrors": [
    "https://dockerproxy.com",
    "https://mirror.baidubce.com",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}
```

然后重启Docker ，再次运行docker run hello-world即可成功。



#### 1.3 docker常见命令

<br>
<img src="/images/docker/7.png" style="width:100%; display:block; margin:auto;">
<br>

首先了解部署docker时的项目结构，通常包含Dockerfile、index.php、run.sh这三个文件

构建镜像

```
docker build -t localctf/backup-root:latest .
```

但是当创建容器从外部引入某个功能时，例如FROM php:7.4-apache，可能由于网络问题无法实现

此时可以，单独使用pull命令

```
docker pull php:7.4-apache
```

当想实现同时开启多个容器时，可以创建docker-compose.yml文件

```
docker compose up -d

#只重建某个特定容器
docker-compose up -d --build --force-recreate ret2libc
```

当频繁创建容器，修改容器，删除容器时， compose 文件中可能会出现一些不存在的旧容器，可以通过以下参数实现

```
docker compose down --remove-orphans
```

删除镜像命令为

```
docker rmi localctf/backup-root:latest
```

### 二、安装CTFd平台

#### 2.1 CTFd平台搭建

下载https://github.com/Tech2Nova/CTFd.git

进入根目录CTFd中，第一步使用docker compose up -d构建CTFd平台，这一步可能需要连接外网，常见的报错原因都是因为网络问题无法拉取某些大镜像，此时可以单独使用docker pull，反复尝试即可

#### 2.2 docker_challenges插件使用

该插件可以实现每个客户端独立创建端口，独立访问题目容器，题目可以利用AI出题，统一把题目放在CTFd/challenge/目录下，然后切换到该目录下

在镜像目录文件夹下，一定要切换到想构建的镜像目录下

```
cd /challenges/backup-root
docker build -t localctf/backup-root:latest .
```

出题时，dockerfile可能需要拉取对应的应用镜像，可以让AI出题时用国内的镜像源拉取，**但是切记，如果用了国内的镜像源，就不要开梯子，否则会套娃**

部署好每道题目后，可以在docker desktop中进入setting，然后搜索

Expose daemon on tcp://localhost:2375 without TLS

Exposing daemon on TCP without TLS helps legacy clients connect to the daemon. It also makes yourself vulnerable to remote code execution attacks. Use with caution.

<br>
<img src="/images/docker/8.png" style="width:100%; display:block; margin:auto;">
<br>

勾选这个选项，然后到CTFd页面，找到plugin-->docker config -->往下滑就可以看到每道题的镜像，再创建题目前一定要先选择镜像，点击submit，然后再去challenge页面创建题目，会自动选择刚刚submit的容器

### 三、考试部署细节

#### 3.1 容器操作限制时间

可以在下述两部分进行修改

```python
 \# If this container is already created, we don't need another one.

​    if check != None and not (unix_time(datetime.utcnow()) - int(check.timestamp)) >= 60:

​      return abort(403,"To prevent abuse, dockers can be reverted and stopped after 1 minutes of creation.")

entry = DockerChallengeTracker(
            team_id=session.id if is_teams_mode() else None,
            user_id=session.id if not is_teams_mode() else None,
            docker_image=container,
            timestamp=unix_time(datetime.utcnow()),
            revert_time=unix_time(datetime.utcnow()) + 60,
            instance_id=create[0]['Id'],
            ports=','.join([p[0]['HostPort'] for p in ports]),
            host=str(docker.hostname).split(':')[0],
            challenge=challenge
        )
```

### Tips

1、本系统可以实现完全断网连接，服务器端开始docker服务后，各个客户端即可通过网线访问服务

2、在服务器端修改后，可能会有延迟，可能不是没有找对修改的地方，而且没更新，可以多刷新几遍，或者重启服务

3、部分题目如果无法构建，可以让AI使用离线的方法安装某些库或包
