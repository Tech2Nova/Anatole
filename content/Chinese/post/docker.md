# Windows平台下安装Docker

## 一、安装Docker Desktop

从官网下载完Docker Desktop后，显示当前电脑wsl版本过老

<img src="images\docker\2.png" alt="2" style="zoom:50%;" />

于是尝试使用powershell运行wsl --update、wsl --install等命令，然而发现无法连接，于是按照AI建议，从GitHub上（[](https://github.com/microsoft/WSL/releases/download/2.6.3/wsl.2.6.3.0.x64.msi)）下载

![1](E:\组会&周报\周报\docker\1.png)

双击wsl.2.6.3.0.x64.msi后，安装成功，运行wsl --status只显示默认版本：2，这说明WSL 核心安装了，但 Linux 发行版还没安装，所以还需要安装ubuntu

```
wsl --install -d Ubuntu --web-download
```

![4](E:\组会&周报\周报\docker\4.png)

下载和安装Ubuntu后，会弹出wsl桌面应用，然后会初始化user和password，我这里设置的是dd和004029

<img src="images\docker\5.png" alt="5" style="zoom:50%;" />

然后，重启docker desktop，注意要在右下角托盘关闭，然后重新打开

下面测试docker是否安装成功

### 2 测试 Docker 是否能运行容器

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

![6](images\docker\6.png)

此时，需要给 Docker Desktop 配置 **镜像加速器**。

### 步骤

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



## 二、docker常见命令

![7](images\docker\7.png)

首先了解部署docker时的项目结构，通常包含Dockerfile、index.php、run.sh这三个文件

创建一个容器时使用build命令，xss是容器根目录名称

```
docker build -t xss .
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

很多出题人会直接执行：`--remove-orphans` 会删除 **compose 文件中不存在的旧容器**。

```
docker compose down --remove-orphans
```

