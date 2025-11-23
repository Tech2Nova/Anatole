+++
title = "Setup Hugo"
slug = "setup-hugo"
date = 2025-04-15
author = "chenxi"
description = "在 Windows 系统下，利用Scoop安装hugo"

categories = ["Blog"]

+++
在 Windows 系统下，利用Scoop安装hugo
<!--more-->

## hugo环境搭建

### 1、安装软件包管理工具

在windows系统下配置hugo环境，需要一个软件包管理工具

hugo官方推荐了三种工具

[Chocolatey](https://chocolatey.org/) is a free and open-source package manager for Windows. To install the extended edition of Hugo:

```sh
choco install hugo-extended
```

[Scoop](https://scoop.sh/) is a free and open-source package manager for Windows. To install the extended edition of Hugo:

```sh
scoop install hugo-extended
```

[Winget](https://learn.microsoft.com/en-us/windows/package-manager/) is Microsoft’s official free and open-source package manager for Windows. To install the extended edition of Hugo:

```sh
winget install Hugo.Hugo.Extended
```

- 总结
  - **Chocolatey** 适合需要广泛软件支持和企业级功能的用户，尤其是那些需要自动化部署和管理的环境。
  - **Scoop** 更适合追求轻量级、快速安装和个人使用的场景。
  - **winget** 则是一个官方支持的选项，适合那些希望获得最新功能和安全保障的用户。

本文选择scoop安装：

```
#在PowerShell中设置远程权限
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned

# 设置环境变量
$env:SCOOP='D:\Applications\Scoop'
[Environment]::SetEnvironmentVariable('SCOOP', $env:SCOOP, 'User')
$env:SCOOP_GLOBAL='F:\GlobalScoopApps'
[Environment]::SetEnvironmentVariable('SCOOP_GLOBAL', $env:SCOOP_GLOBAL, 'Machine')

#需要科学上网

#运行下列命令
iex "& {$(irm get.scoop.sh)} -RunAsAdmin"

#默认安装 scoop install <软件名>
scoop install hugo-entend

# global目录下安装：scoop install -g <软件名>

# 添加软件库
scoop bucket add <bucketname>

```

### 2、选择hugo blox模板保存至本地

[25+ Best, Most Popular Hugo Themes for 2024 | Hugo Blox](https://hugoblox.com/templates/)

### 3、在本地修改hugoblox内容