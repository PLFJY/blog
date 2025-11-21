---
title: Linux 折腾相关记录
date: 2025-11-22 02:36:07
tags:
- linux
- kde
---

折腾了这么久linux，好多小问题，每解决一个我都扔进来一个，虽然可能只有我自己看的懂，就当随笔记录吧，我时不时可能会拿一些出来单独写点文章啥的

## 修复 Linux 中的一个噪音问题（Intel 必备）：
https://cyril3.github.io/2020/05/17/fix-linux-popup-noise

```
sudo vim /etc/modprobe.d/disable_snd_hda_intel_power_save.conf
options snd_hda_intel power_save=0
```

## KDE导入splash Screen的地址:
`/home/<user name>/.local/share/plasma/look-and-feel/`

## KDE Wllpaper插件：

https://github.com/slynobody/SteamOS-wallpaper-engine-kde-plugin

## Disable KDE wallet (有风险，别用，可能会让VS Code启动的时候卡住):

```
vim ~/.config/kwalletrc
```

```
[Wallet]
Enabled=false
```

建议直接：
```
paru -S kwallet-pam
```
让它自启动

## Numberlock:
### 早启动

```
paru -S mkinitcpio-numlock
sudo vim /etc/mkinitcpio.conf
```

`numlock`

```
sudo mkinitcpio -P
```

### SDDM

```
sudo vim /etc/sddm.conf
```

```
[General]
Numlock=on
```

## 腾讯会议 Nvidia看别人黑屏：

设置环境变量
`__EGL_VENDOR_LIBRARY_FILENAMES=/usr/share/glvnd/egl_vendor.d/50_mesa.json`

在Exec=后面添加
`env __EGL_VENDOR_LIBRARY_FILENAMES=/usr/share/glvnd/egl_vendor.d/50_mesa.json`

## 音量控制问题

```
paru -S plasma-pa pavucontrol`
```

## VLC编码问题

装个插件

```
paru -S vlc-plugin-ffmpeg
```

## 用 KDE 配置这么久感觉其他要装的软件(组件、插件)

```
paru -S gwenview okular elisa spectacle breeze-gtk remmina kwin-effect-rounded-corners-git
```

## KDE小组件

plasmusic-toolbar

## GRUB UEFI的图标

把 `menuentry` 开头的这一行在后面的大括号前面加上 `--class efi`

## v4l2loopback

需要装header，不然没得dkms用

`paru -S linux-headers`

启动

`sudo modprobe v4l2loopback`

列出设备

`sudo v4l2-ctl --list-devices`

重启

`sudo modprobe -r v4l2loopback & sudo modprobe v4l2loopback`

剩下查wiki

https://wiki.archlinux.org/title/V4l2loopback

## Rime

用雾凇拼音 https://github.com/iDvel/rime-ice

## fastfetch

显示图片可以用kitty的 --kitty-direct 传图片

## zsh

直接用 ohmyzsh