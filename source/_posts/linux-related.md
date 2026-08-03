---
title: Linux 折腾相关记录
date: 2025-11-22 02:36:07
tags:
- linux
- kde
published: true
---

折腾了这么久linux，好多小问题，每解决一个我都扔进来一个，虽然可能只有我自己看的懂，就当随笔记录吧，我时不时可能会拿一些出来单独写点文章啥的

很有可能这里面能翻到你可能也会遇到的问题，我的环境是这样的：

```
                  -`                 plfjy@plfjy-arch
                 .o+`                ────────────────
                `ooo/                ┌ OS        → Arch Linux x86_64
               `+oooo:               │ Host      → ASUS S501ME_S502ME (1.0)
              `+oooooo:              │ Kernel    → Linux 7.1.5-arch1-2
              -+oooooo+:             │ Packages  → 1 (linglong), 1607 (pacman)
            `/:-:++oooo+:            │ Shell     → zsh 5.9.2
           `/++++/+++++++:           │ Dsiplay   → 1920x1080 in 24", 180 Hz [External]
          `/++++++++++++++:          │ WM / DE   → Hyprland 0.56.1 (Wayland) / Plasma 6
         `/+++ooooooooooooo/`        │ Theme     → Breeze-Dark [GTK2/3/4]
        ./ooosssso++osssssso+`       │ Icons     → breeze [GTK2/3/4]
       .oossssso-````/ossssss+`      │ Font      → NotoSans Nerd Font (10pt) [GTK2/3/4]
      -osssssso.      :ssssssso.     │ Terminal  → ghostty 0.0.0-20260731.r16748.g4d605bf.aur-ghostty-nightly-bin
     :osssssss/        osssso+++.    │ CPU       → 13th Gen Intel(R) Core(TM) i5-13400F (16) @ 4.60 GHz
    /ossssssss/        +ssssooo/-    │ GPU       → NVIDIA GeForce RTX 3060 Lite Hash Rate [Discrete]
  `/ossssso+/:-        -:/+osssso+-  │ Memory    → 6.66 GiB / 15.28 GiB (44%)
 `+sso+:-`                 `.-/+oso: │ Swap      → 647.70 MiB / 16.00 GiB (4%)
`++:.                           `-/+/│ Disk      → 151.22 GiB / 252.75 GiB (60%) - ext4
.`                                 `/└ Locale    → en_US.UTF-8
```

## 修复 Linux 中的一个噪音问题（Intel 必备）：
https://cyril3.github.io/2020/05/17/fix-linux-popup-noise

```
sudo vim /etc/modprobe.d/disable_snd_hda_intel_power_save.conf
options snd_hda_intel power_save=0
```

## KDE导入 splash Screen 的路径:
`/home/<user name>/.local/share/plasma/look-and-feel/`

## KDE Wallpaper插件：

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

HOOKS 里面 `kms` 后面加 `numlock`

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

### Plasma Login Manager

```
sudo vim /var/lib/plasmalogin/.config/kdedefaults/kcminputrc
```

```
[Keyboard]
NumLock=0
```

### Hyprland （顺便附带一个关闭鼠标加速）

```lua
hl.config({
    input = {
        force_no_accel = true,
        numlock_by_default = true
    },
})
```

## 腾讯会议 Nvidia 看别人黑屏：

原理是设置环境变量
```
__EGL_VENDOR_LIBRARY_FILENAMES=/usr/share/glvnd/egl_vendor.d/50_mesa.json
```

在Exec=后面添加
```
env __EGL_VENDOR_LIBRARY_FILENAMES=/usr/share/glvnd/egl_vendor.d/50_mesa.json
```

## 音量控制问题

```
paru -S plasma-pa pavucontrol
```

## 声音相关

```
paru -S plasma-pa pipewire
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

一些装了的插件：

```
git zsh-syntax-highlighting zsh-autosuggestions copypath copybuffer sudo colorize
```

## 好用的性能监视器

```
paru -S htop
```

## Arch pacman 自动选出最快的镜像源

https://qiedd.com/1203.html

```
paru -S reflector
sudo reflector --verbose --country 'China' -l 200 -p https --sort rate --save /etc/pacman.d/mirrorlist
```

## 音量调节 / 小数字键盘切换 / 大小写切换 UHD

```
paru -S swayosd
systemctl enable --now swayosd-libinput-backend.service
```

后续在绑定按键上

```
hl.bind("XF86AudioRaiseVolume",  hl.dsp.exec_cmd("swayosd-client --output-volume +5 --max-volume 100"), { locked = true, repeating = true })
hl.bind("XF86AudioLowerVolume",  hl.dsp.exec_cmd("swayosd-client --output-volume -5 --max-volume 100"), { locked = true, repeating = true })
hl.bind("XF86AudioMute",         hl.dsp.exec_cmd("swayosd-client --output-volume mute-toggle"),        { locked = true })
hl.bind("XF86AudioMicMute",      hl.dsp.exec_cmd("swayosd-client --input-volume mute-toggle"),         { locked = true })
hl.bind("XF86MonBrightnessUp",   hl.dsp.exec_cmd("swayosd-client --brightness +5"),                    { locked = true, repeating = true })
hl.bind("XF86MonBrightnessDown", hl.dsp.exec_cmd("swayosd-client --brightness -5"),                    { locked = true, repeating = true })
```

这样写入就好了

## Waybar Media player

https://github.com/BEST8OY/ScrollMPRIS

## Hyprland 剪贴板

```
paru -S clipvault
```

```
hl.bind(mainMod .. " + V", hl.dsp.exec_cmd([[entry="$(clipvault list | wofi -d -k /dev/null -S dmenu --pre-display-cmd "echo '%s' | cut -f 2")"; [ -n "$entry" ] || exit 0; printf '%s\n' "$entry" | clipvault get | wl-copy; sleep 0.15; wtype -M ctrl -k v -m ctrl]]))
```

## Wlogout Logout Hyprland

```
hyprctl dispatch 'hl.dsp.exit()'
```

## 网络

### plasma

```
paru -S plasma-nm
```

### Hyprland

```
paru -S nm-sidebar nm-connection-editor
```

## Nightshift

https://github.com/psi4j/sunsetr

## Dolphin Open with 空白

https://www.lorenzobettini.it/2024/05/fixing-the-empty-open-with-in-dolphin-in-hyprland/

## Hyprland 的深色模式切换相关

### 架构
Darkman 作为全局 systemd user service；使用经纬度，禁用 Geoclue；KDE/Qt 使用 KDE Platform Theme；Qt5/Qt6 不使用 qt5ct/qt6ct；GTK 使用 Breeze/Breeze-Dark；Darkman 更新 KDE、GSettings、GTK2、GTK3、GTK4；Hyprland Portal 使用 Darkman Settings backend，Plasma 继续使用 KDE Porta

### 前置条件
需要安装：`darkman`、`breeze`、`breeze-gtk`、`qt5ct`、`qt6ct`、`dconf`、`gsettings-desktop-schemas`、`xdg-desktop-portal`、`xdg-desktop-portal-hyprland`、`xdg-desktop-portal-gtk`、`xdg-desktop-portal-kde`、`plasma-integration`、`kde-gtk-config`、`breeze5 6.7.3-1`、`plasma5-integration 6.7.3-1`。

### 配置

Darkman 配置：`~/.config/darkman/config.yaml`，内容为 `lat: `、`lng: `、`usegeoclue: false`、`portal: true`。

Darkman 脚本：`~/.local/share/darkman/10-breeze-theme`。脚本使用 `set -euo pipefail`，接受 `dark/light` 参数，更新 KDE、GSettings、GTK2/3/4，并使用临时文件原子替换相关配置键。

创建 `~/.config/kded6rc`，其中 `[Module-gtkconfig]` 的 `autoload=false`。同时通过 kded6 D-Bus 接口关闭并卸载当前运行的 `gtkconfig` 模块，避免重新生成 GTK 颜色 CSS。

创建 `~/.config/xdg-desktop-portal/hyprland-portals.conf`，优先级为 `default=hyprland;gtk`，Settings 为 `darkman;gtk`。没有创建通用 `portals.conf`，没有修改系统 Portal 配置。

修改 `~/.config/hypr/autostart.lua`，为已有 D-Bus/systemd 环境同步命令显式提供 `QT_QPA_PLATFORM=wayland;xcb` 和 `QT_QPA_PLATFORMTHEME=kde`。

### Darkman 服务

执行了 `systemctl --user enable --now darkman.service`。当前状态为 `enabled`、`active`，并创建了 `~/.config/systemd/user/default.target.wants/darkman.service`。

日志确认：日出为 `2026-08-02T06:18:25+08:00`，日落为 `2026-08-02T19:27:32+08:00`。

### 常用命令

- 切换：`darkman set light`、`darkman set dark`、`darkman toggle`
- 状态：`systemctl --user status darkman.service`、`darkman get`
- 日志：`journalctl --user -u darkman.service -f`
- Portal：`busctl --user call org.freedesktop.portal.Desktop /org/freedesktop/portal/desktop org.freedesktop.portal.Settings ReadOne ss org.freedesktop.appearance color-scheme`

### 回滚


```bash
#!/usr/bin/env bash
set -euo pipefail

readonly backup_dir='/home/plfjy/.local/state/hypr-theme-backup-20260801-231447'
readonly config_home="${XDG_CONFIG_HOME:-$HOME/.config}"

if [[ ! -d "$backup_dir" ]]; then
  printf 'backup directory not found: %s\n' "$backup_dir" >&2
  exit 1
fi

restore_file() {
  local source="$1"
  local target="$2"
  if [[ -e "$source" ]]; then
    mkdir -p "$(dirname "$target")"
    cp -a -- "$source" "$target"
    printf '[rollback] restored %s\n' "$target"
  fi
}

systemctl --user disable --now darkman.service || true

restore_file "$backup_dir/gtk-3.0/settings.ini" "$config_home/gtk-3.0/settings.ini"
restore_file "$backup_dir/gtk-3.0/gtk.css" "$config_home/gtk-3.0/gtk.css"
restore_file "$backup_dir/gtk-3.0/colors.css" "$config_home/gtk-3.0/colors.css"
restore_file "$backup_dir/gtk-4.0/settings.ini" "$config_home/gtk-4.0/settings.ini"
restore_file "$backup_dir/gtk-4.0/gtk.css" "$config_home/gtk-4.0/gtk.css"
restore_file "$backup_dir/gtk-4.0/colors.css" "$config_home/gtk-4.0/colors.css"
restore_file "$backup_dir/gtkrc" "$config_home/gtkrc"
restore_file "$backup_dir/gtkrc-2.0" "$config_home/gtkrc-2.0"
restore_file "$backup_dir/.gtkrc-2.0" "$HOME/.gtkrc-2.0"
restore_file "$backup_dir/kdeglobals" "$config_home/kdeglobals"
restore_file "$backup_dir/plasmarc" "$config_home/plasmarc"
restore_file "$backup_dir/kcminputrc" "$config_home/kcminputrc"
restore_file "$backup_dir/dconf/user" "$config_home/dconf/user"

rm -f -- "$config_home/darkman/config.yaml"
rm -f -- "$HOME/.local/share/darkman/10-breeze-theme"
rm -f -- "$config_home/xdg-desktop-portal/hyprland-portals.conf"
rm -f -- "$config_home/kded6rc"

if busctl --user status org.kde.kded6 >/dev/null 2>&1; then
  busctl --user call org.kde.kded6 /kded org.kde.kded6 setModuleAutoloading sb gtkconfig true || true
  busctl --user call org.kde.kded6 /kded org.kde.kded6 loadModule s gtkconfig || true
fi

printf '[rollback] completed; log out/in to fully reload dconf and KDE services\n'

```

回滚脚本不会自动卸载 `breeze5` 或 `plasma5-integration`。如果确认不再需要，可另行执行 `sudo pacman -Rns breeze5 plasma5-integration`。

### 已知限制

1. Plasma Portal 的运行时选择没有通过重新登录 KDE 实际测试；系统仍保留 KDE Portal 配置，没有创建通用用户 Portal 配置。
2. 已禁用 `kde-gtk-config` 自动加载，因此 Plasma 不会继续自动生成 GTK 颜色 CSS 覆盖文件。
3. systemd user environment 中的 Qt Platform Theme 是全局用户级环境