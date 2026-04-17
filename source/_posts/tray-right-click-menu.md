---
title: Windows 原生托盘菜单为什么有的能跟随系统深色，有的却不行？一次从 Tauri 到 Win32 的实测排查
date: 2026-04-17 10:41:51
author: ChatGPT, PLFJY
tags: 
- Dotnet
- csharp
- Win32
---

{% notel blue fa-circle-info 前言 %}
本文章内容由 ChatGPT 完成，因为本人不会写 Win32 和 Rust，所以整个探究过程由我提出问题和查找思路，ChatGPT 借助 GitHub App 按照我的思路一路查找完成此文章。
{% endnotel %}

---

最近我在做一个 Windows 托盘相关功能时，遇到了一个很诡异的问题：

同样是 **Win32 原生 popup menu**，有些应用在 Windows 切到深色模式后，托盘右键菜单也会自动变成深色；但我自己用 `CreatePopupMenu + TrackPopupMenu` 写出来的菜单，却始终是浅色。

一开始我怀疑的是这些表层差异：

* `TrackPopupMenu` 和 `TrackPopupMenuEx` 的区别
* 菜单是不是“长期持有”的 `HMENU`
* 菜单宿主是不是纯 Win32 hidden window
* 还是说某些框架偷偷做了自绘

但一路排查下来，最终发现真正的关键点根本不在 popup menu 本身，而在**更上游的进程级暗色模式初始化**。

这篇文章就记录一下这个排查过程，以及最后用于验证结论的**单文件 C# 实验代码**。

---

## 现象：同样是原生托盘菜单，为什么表现不一样？

我观察到一个很明确的对比：

* 我自己写的 Win32 托盘菜单：**不跟随系统深色**
* 一个 Tauri 应用的托盘菜单：**会跟随系统深色**

关键在于，后者并不是自绘菜单，它底层同样使用的是原生 Win32 popup menu。

这就说明：

> 问题大概率不在 `TrackPopupMenu` 这一层，而是在更高层的运行时环境里。

---

## 第一步：先确认 Tauri 到底是不是原生 popup menu

顺着应用层往上翻，结论很明确：

### 1. 应用层

Tauri 应用本身只是通过菜单 builder 构建菜单对象，然后交给 tray API。

### 2. `tray-icon`

在 Windows 平台，`tray-icon` 自己创建了一个隐藏窗口，然后在托盘点击时调用：

* `SetForegroundWindow(hwnd)`
* `TrackPopupMenu(...)`

### 3. `muda`

菜单对象在 `muda` 里被构造成真正的 Win32 菜单：

* `CreateMenu()`
* `CreatePopupMenu()`
* `AppendMenuW(...)`
* `InsertMenuW(...)`
* `SetMenuItemInfoW(...)`

也就是说，**Tauri 在 Windows 上的托盘菜单，本质上就是 `HMENU + TrackPopupMenu`**。这点可以从 `tray-icon` 和 `muda` 的 Windows 实现直接看出来。 

所以，Tauri 的深色菜单并不是因为它用了什么“非原生菜单”。

---

## 第二步：排除菜单构造方式差异

接着我做了几个方向的实验：

* 用纯 Win32 hidden window 作为菜单宿主
* 菜单改成长期持有的 `HMENU`
* 使用 `TrackPopupMenu` 而不是 `TrackPopupMenuEx`

结果：

> **菜单仍然不会自动变深色。**

这说明单纯模仿 Tauri 的 popup menu 构造方式，还不够。

---

## 第三步：一路往上翻，终于在 Tao 里找到关键线索

继续往 Tauri 更上游翻，最终在 `tao` 的 Windows 事件循环初始化代码里，找到了一个很关键的调用。

在 `EventLoop::new(...)` 初始化时，Tao 会主动调用：

```rust
super::dark_mode::allow_dark_mode_for_app(true);
```

也就是说，**Tauri 在事件循环刚建立时，就把整个应用注册成了“允许 dark mode 的应用”**。

而这个 `allow_dark_mode_for_app(true)` 并不是简单的壳函数，它内部会通过 `uxtheme.dll` 的 ordinal 去调用一组 undocumented dark-mode 接口，包括：

* `AllowDarkModeForApp`
* 或更高版本上的 `SetPreferredAppMode(AllowDark)`
* `RefreshImmersiveColorPolicyState()`

这些都可以在 Tao 的 `dark_mode.rs` 中直接看到。

这就解释了现象：

> **同样是 `TrackPopupMenu`，Tauri 的菜单能跟随系统深色，是因为它在更早阶段做了“进程级暗色模式初始化”。**

而不是因为 popup menu 本身多传了什么神秘参数。

---

## 第四步：为什么说它是“跟随系统”，而不是软件自己硬控？

这点 Tao 也处理得很清楚。

它判断当前应不应该用 dark mode 时，优先读取的是系统主题相关注册表：

* `HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize`
* `AppsUseLightTheme`

也就是说，它不是强行把菜单固定为深色，而是：

> **把应用进程放进“支持 dark mode”的状态中，再让系统根据当前主题决定最终表现。** 

这和最终观察到的行为完全一致：

* Windows 切浅色 → 菜单浅色
* Windows 切深色 → 菜单深色

---

## 最终结论

这次排查可以总结成一句话：

> **Windows 原生托盘 popup menu 能否跟随系统深色，关键不在 `TrackPopupMenu`，而在进程启动时有没有做应用级暗色模式初始化。**

对于 Tauri 来说，这一步是在 Tao 的事件循环初始化阶段完成的。 

所以如果你在 .NET / Win32 环境里想复现同样的效果，思路不是继续折腾：

* `TrackPopupMenu`
* `TrackPopupMenuEx`
* `CreatePopupMenu`
* `HMENU` 生命周期

而是应该在更早阶段补上：

* `SetPreferredAppMode(AllowDark)`
* `RefreshImmersiveColorPolicyState()`

---

# 单文件实验代码

下面这份代码就是我最后用来验证结论的**单文件 .NET 实验程序**。

它做了几件事：

* 原生 Win32 tray icon
* 原生 `HMENU + TrackPopupMenu`
* 程序启动早期调用 `uxtheme.dll` 的 dark-mode 接口
* 用来验证菜单是否会跟随系统深浅色变化

```csharp
// RightClickMenu_Test.cs
// .NET 10 single-file experiment for Windows tray popup menu dark mode.
// Goal:
// 1. Native Win32 tray icon
// 2. Native HMENU + TrackPopupMenu
// 3. Try Tao-like app-level dark mode initialization via uxtheme ordinals

using System;
using System.Runtime.InteropServices;

internal static class Program
{
    private const string WindowClassName = "TrayNativeExperimentWindowClass";
    private const string Tooltip = "Tray Native Experiment";

    private const int WM_DESTROY = 0x0002;
    private const int WM_COMMAND = 0x0111;
    private const int WM_USER = 0x0400;
    private const int WM_NULL = 0x0000;

    private const int WM_LBUTTONUP = 0x0202;
    private const int WM_RBUTTONUP = 0x0205;

    private const int NIF_MESSAGE = 0x00000001;
    private const int NIF_ICON = 0x00000002;
    private const int NIF_TIP = 0x00000004;

    private const int NIM_ADD = 0x00000000;
    private const int NIM_DELETE = 0x00000002;
    private const int NIM_SETVERSION = 0x00000004;

    private const int NOTIFYICON_VERSION_4 = 4;

    private const uint TPM_LEFTALIGN = 0x0000;
    private const uint TPM_BOTTOMALIGN = 0x0020;
    private const uint TPM_RIGHTBUTTON = 0x0002;
    private const uint TPM_RETURNCMD = 0x0100;

    private const uint MF_STRING = 0x0000;
    private const uint MF_SEPARATOR = 0x0800;

    private const int MenuCmdShow = 1001;
    private const int MenuCmdExit = 1002;

    private static readonly uint TrayCallbackMessage = WM_USER + 1;

    private static IntPtr _hwnd;
    private static IntPtr _menu;
    private static bool _running = true;

    private static WndProcDelegate? _wndProcDelegate;

    public static int Main()
    {
        Console.WriteLine("Initializing app-level dark mode...");
        TryEnableAppDarkMode();

        _wndProcDelegate = WndProc;

        ushort atom = RegisterWindowClass();
        if (atom == 0)
        {
            Console.WriteLine("RegisterClassEx failed.");
            return 1;
        }

        _hwnd = CreateNativeWindow();
        if (_hwnd == IntPtr.Zero)
        {
            Console.WriteLine("CreateWindowEx failed.");
            return 1;
        }

        _menu = CreatePersistentMenu();
        if (_menu == IntPtr.Zero)
        {
            Console.WriteLine("CreatePopupMenu failed.");
            return 1;
        }

        if (!CreateTrayIcon(_hwnd))
        {
            Console.WriteLine("Shell_NotifyIcon(NIM_ADD) failed.");
            return 1;
        }

        Console.WriteLine("Tray icon created.");
        Console.WriteLine("Right click tray icon and see whether popup menu follows Windows dark mode.");

        MSG msg;
        while (_running && GetMessage(out msg, IntPtr.Zero, 0, 0) > 0)
        {
            TranslateMessage(ref msg);
            DispatchMessage(ref msg);
        }

        Cleanup();
        return 0;
    }

    private static void TryEnableAppDarkMode()
    {
        if (!OperatingSystem.IsWindows())
        {
            return;
        }

        Version v = Environment.OSVersion.Version;
        bool supported = v.Major == 10 && v.Build >= 17763;
        if (!supported)
        {
            Console.WriteLine($"Windows build {v.Build} < 17763, skipping dark mode init.");
            return;
        }

        IntPtr hUxTheme = LoadLibrary("uxtheme.dll");
        if (hUxTheme == IntPtr.Zero)
        {
            Console.WriteLine("LoadLibrary(uxtheme.dll) failed.");
            return;
        }

        // Tao logic:
        // - before 18362: AllowDarkModeForApp(bool)
        // - 18362 and later: SetPreferredAppMode(AllowDark)
        if (v.Build < 18362)
        {
            IntPtr pAllowDarkModeForApp = GetProcAddressByOrdinal(hUxTheme, 135);
            if (pAllowDarkModeForApp != IntPtr.Zero)
            {
                var fn = Marshal.GetDelegateForFunctionPointer<AllowDarkModeForAppDelegate>(pAllowDarkModeForApp);
                bool ok = fn(true);
                Console.WriteLine($"AllowDarkModeForApp(true) => {ok}");
            }
            else
            {
                Console.WriteLine("AllowDarkModeForApp ordinal 135 not found.");
            }
        }
        else
        {
            IntPtr pSetPreferredAppMode = GetProcAddressByOrdinal(hUxTheme, 135);
            if (pSetPreferredAppMode != IntPtr.Zero)
            {
                var fn = Marshal.GetDelegateForFunctionPointer<SetPreferredAppModeDelegate>(pSetPreferredAppMode);
                PreferredAppMode oldMode = fn(PreferredAppMode.AllowDark);
                Console.WriteLine($"SetPreferredAppMode(AllowDark) called. Previous mode: {oldMode}");
            }
            else
            {
                Console.WriteLine("SetPreferredAppMode ordinal 135 not found.");
            }
        }

        IntPtr pRefreshImmersiveColorPolicyState = GetProcAddressByOrdinal(hUxTheme, 104);
        if (pRefreshImmersiveColorPolicyState != IntPtr.Zero)
        {
            var fn = Marshal.GetDelegateForFunctionPointer<RefreshImmersiveColorPolicyStateDelegate>(pRefreshImmersiveColorPolicyState);
            fn();
            Console.WriteLine("RefreshImmersiveColorPolicyState() called.");
        }
        else
        {
            Console.WriteLine("RefreshImmersiveColorPolicyState ordinal 104 not found.");
        }
    }

    private static ushort RegisterWindowClass()
    {
        var wc = new WNDCLASSEX
        {
            cbSize = (uint)Marshal.SizeOf<WNDCLASSEX>(),
            lpfnWndProc = Marshal.GetFunctionPointerForDelegate(_wndProcDelegate!),
            hInstance = GetModuleHandle(null),
            lpszClassName = WindowClassName
        };

        return RegisterClassEx(ref wc);
    }

    private static IntPtr CreateNativeWindow()
    {
        IntPtr hInstance = GetModuleHandle(null);

        const int WS_EX_LAYERED = 0x00080000;
        const int WS_EX_NOACTIVATE = 0x08000000;
        const int WS_EX_TOOLWINDOW = 0x00000080;
        const int WS_EX_TRANSPARENT = 0x00000020;
        const int WS_OVERLAPPED = 0x00000000;

        return CreateWindowEx(
            WS_EX_NOACTIVATE | WS_EX_TRANSPARENT | WS_EX_LAYERED | WS_EX_TOOLWINDOW,
            WindowClassName,
            "Tray Native Experiment",
            WS_OVERLAPPED,
            0,
            0,
            0,
            0,
            IntPtr.Zero,
            IntPtr.Zero,
            hInstance,
            IntPtr.Zero);
    }

    private static IntPtr CreatePersistentMenu()
    {
        IntPtr menu = CreatePopupMenu();
        if (menu == IntPtr.Zero)
        {
            return IntPtr.Zero;
        }

        AppendMenu(menu, MF_STRING, (UIntPtr)MenuCmdShow, "Show main window");
        AppendMenu(menu, MF_SEPARATOR, UIntPtr.Zero, null);
        AppendMenu(menu, MF_STRING, (UIntPtr)MenuCmdExit, "Exit");

        return menu;
    }

    private static bool CreateTrayIcon(IntPtr hwnd)
    {
        IntPtr icon = LoadIcon(IntPtr.Zero, (IntPtr)32512); // IDI_APPLICATION

        var nid = new NOTIFYICONDATA
        {
            cbSize = (uint)Marshal.SizeOf<NOTIFYICONDATA>(),
            hWnd = hwnd,
            uID = 1,
            uFlags = NIF_MESSAGE | NIF_ICON | NIF_TIP,
            uCallbackMessage = TrayCallbackMessage,
            hIcon = icon,
            szTip = Tooltip
        };

        bool ok = Shell_NotifyIcon(NIM_ADD, ref nid);
        if (!ok)
        {
            return false;
        }

        nid.uVersion = NOTIFYICON_VERSION_4;
        Shell_NotifyIcon(NIM_SETVERSION, ref nid);

        return true;
    }

    private static void RemoveTrayIcon()
    {
        var nid = new NOTIFYICONDATA
        {
            cbSize = (uint)Marshal.SizeOf<NOTIFYICONDATA>(),
            hWnd = _hwnd,
            uID = 1
        };

        Shell_NotifyIcon(NIM_DELETE, ref nid);
    }

    private static IntPtr WndProc(IntPtr hwnd, uint msg, IntPtr wParam, IntPtr lParam)
    {
        if (msg == TrayCallbackMessage)
        {
            int code = LOWORD(lParam);

            if (code == WM_RBUTTONUP)
            {
                ShowTrayMenu(hwnd);
                return IntPtr.Zero;
            }

            if (code == WM_LBUTTONUP)
            {
                Console.WriteLine("[Tray] Left click");
                return IntPtr.Zero;
            }
        }

        if (msg == WM_COMMAND)
        {
            int command = LOWORD(wParam);

            switch (command)
            {
                case MenuCmdShow:
                    Console.WriteLine("[Menu] Show main window");
                    return IntPtr.Zero;

                case MenuCmdExit:
                    Console.WriteLine("[Menu] Exit");
                    _running = false;
                    PostQuitMessage(0);
                    return IntPtr.Zero;
            }
        }

        if (msg == WM_DESTROY)
        {
            _running = false;
            PostQuitMessage(0);
            return IntPtr.Zero;
        }

        return DefWindowProc(hwnd, msg, wParam, lParam);
    }

    private static void ShowTrayMenu(IntPtr hwnd)
    {
        if (!GetCursorPos(out POINT pt))
        {
            return;
        }

        SetForegroundWindow(hwnd);

        uint result = TrackPopupMenu(
            _menu,
            TPM_LEFTALIGN | TPM_BOTTOMALIGN | TPM_RIGHTBUTTON | TPM_RETURNCMD,
            pt.X,
            pt.Y,
            0,
            hwnd,
            IntPtr.Zero);

        PostMessage(hwnd, WM_NULL, IntPtr.Zero, IntPtr.Zero);

        if (result != 0)
        {
            SendMessage(hwnd, WM_COMMAND, (IntPtr)result, IntPtr.Zero);
        }
    }

    private static void Cleanup()
    {
        RemoveTrayIcon();

        if (_menu != IntPtr.Zero)
        {
            DestroyMenu(_menu);
            _menu = IntPtr.Zero;
        }

        if (_hwnd != IntPtr.Zero)
        {
            DestroyWindow(_hwnd);
            _hwnd = IntPtr.Zero;
        }
    }

    private static int LOWORD(IntPtr value)
    {
        return unchecked((ushort)((nuint)value & 0xFFFF));
    }

    private static IntPtr GetProcAddressByOrdinal(IntPtr hModule, short ordinal)
    {
        return GetProcAddress(hModule, (IntPtr)ordinal);
    }

    private delegate IntPtr WndProcDelegate(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);

    [UnmanagedFunctionPointer(CallingConvention.StdCall)]
    private delegate bool AllowDarkModeForAppDelegate(bool allow);

    [UnmanagedFunctionPointer(CallingConvention.StdCall)]
    private delegate PreferredAppMode SetPreferredAppModeDelegate(PreferredAppMode appMode);

    [UnmanagedFunctionPointer(CallingConvention.StdCall)]
    private delegate void RefreshImmersiveColorPolicyStateDelegate();

    private enum PreferredAppMode
    {
        Default = 0,
        AllowDark = 1
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct WNDCLASSEX
    {
        public uint cbSize;
        public uint style;
        public IntPtr lpfnWndProc;
        public int cbClsExtra;
        public int cbWndExtra;
        public IntPtr hInstance;
        public IntPtr hIcon;
        public IntPtr hCursor;
        public IntPtr hbrBackground;
        [MarshalAs(UnmanagedType.LPWStr)]
        public string? lpszMenuName;
        [MarshalAs(UnmanagedType.LPWStr)]
        public string lpszClassName;
        public IntPtr hIconSm;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct POINT
    {
        public int X;
        public int Y;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct MSG
    {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public POINT pt;
        public uint lPrivate;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct NOTIFYICONDATA
    {
        public uint cbSize;
        public IntPtr hWnd;
        public uint uID;
        public uint uFlags;
        public uint uCallbackMessage;
        public IntPtr hIcon;

        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 128)]
        public string szTip;

        public uint dwState;
        public uint dwStateMask;

        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)]
        public string szInfo;

        public uint uTimeoutOrVersion;

        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 64)]
        public string szInfoTitle;

        public uint dwInfoFlags;
        public Guid guidItem;
        public IntPtr hBalloonIcon;

        public uint uVersion
        {
            get => uTimeoutOrVersion;
            set => uTimeoutOrVersion = value;
        }
    }

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern ushort RegisterClassEx(ref WNDCLASSEX lpwcx);

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr CreateWindowEx(
        int dwExStyle,
        string lpClassName,
        string lpWindowName,
        int dwStyle,
        int X,
        int Y,
        int nWidth,
        int nHeight,
        IntPtr hWndParent,
        IntPtr hMenu,
        IntPtr hInstance,
        IntPtr lpParam);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool DestroyWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern IntPtr DefWindowProc(IntPtr hWnd, uint msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern sbyte GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    private static extern bool TranslateMessage(ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern IntPtr DispatchMessage(ref MSG lpmsg);

    [DllImport("user32.dll")]
    private static extern void PostQuitMessage(int nExitCode);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool PostMessage(IntPtr hWnd, int Msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SendMessage(IntPtr hWnd, int Msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr CreatePopupMenu();

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool AppendMenu(IntPtr hMenu, uint uFlags, UIntPtr uIDNewItem, string? lpNewItem);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool DestroyMenu(IntPtr hMenu);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint TrackPopupMenu(
        IntPtr hMenu,
        uint uFlags,
        int x,
        int y,
        int nReserved,
        IntPtr hWnd,
        IntPtr prcRect);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool GetCursorPos(out POINT lpPoint);

    [DllImport("shell32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool Shell_NotifyIcon(int dwMessage, ref NOTIFYICONDATA lpData);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string? lpModuleName);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr LoadIcon(IntPtr hInstance, IntPtr lpIconName);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr LoadLibrary(string lpFileName);

    [DllImport("kernel32.dll", EntryPoint = "GetProcAddress", SetLastError = true)]
    private static extern IntPtr GetProcAddress(IntPtr hModule, IntPtr procName);
}
```

---

```powershell
dotnet run .\RightClickMenu_Test.cs
```

即可在托盘菜单看到效果

---

## 实验结果

这份代码在我的实际测试中已经成功验证了目标：

* 不做 Tao 风格 dark-mode 初始化时：原生托盘菜单不跟随系统深色
* 加上 `SetPreferredAppMode(AllowDark)` + `RefreshImmersiveColorPolicyState()` 后：菜单开始跟随系统深浅色变化

也就是说，**问题确实破案了。**

---

## 后记

这个问题很容易把人带沟里，因为表面上看最可疑的是 popup menu 自身：

* `TrackPopupMenu`
* `TrackPopupMenuEx`
* `CreatePopupMenu`
* `HMENU` 生命周期

但实际上真正决定最终效果的，是更早阶段的 **应用级主题环境初始化**。

所以这类问题以后可以记住一个经验：

> **如果两个程序使用的是同一套原生菜单 API，但一个能跟随系统主题、一个不能，那么优先怀疑的应该是“进程级主题初始化”是否不同。**