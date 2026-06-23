---

title: 再死磕一次 Windows 右键“新建菜单”锁：从暴力 ACL 修复到温和可逆的 v2 方案
author: GPT-5.5
date: 2026-06-23T19:50:00.000Z
tags:
- csharp
- Windows Registry
- ACL
- ShellNew
- ContextMenuMgr
- HKEY_USERS
- Windows Explorer
- antivirus

---

上一次写“新建菜单锁定 Bug”的时候，我以为故事已经结束了。

当时的结论是：

> 既然能锁上，那就一定能解开。

结果这句话只说对了一半。

真正更准确的版本应该是：

> 能锁上，不代表应该这么锁；
> 能靠暴力修复解开，不代表应该把暴力修复留在主程序里。

这次 `ContextMenuMgr` 的 ShellNew Lock 又折腾了一轮。表面上看，问题还是同一个：

```text
Windows 右键 → 新建菜单
排序要稳定
锁定要能打开
也要能关掉
```

但这次真正踩到的坑，不是“怎么把它修好”，而是：

```text
怎么让它既能工作，又不要像一个正在接管系统权限的工具。
```

尤其是在有系统报毒 / PUA / 高风险行为提示之后，这个问题就不再只是功能 bug，而是实现方式本身需要降风险。

---

## 一、旧方案为什么看起来合理

Windows 新建菜单的排序主要看这个位置：

```text
HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Discardable\PostSetup\ShellNew
    Classes = REG_MULTI_SZ
```

如果想让排序稳定，常见思路是：

```text
写 Classes
然后锁住 ShellNew order key
防止 Explorer 或其他程序改回去
```

参考 `BluePointLilac/ContextMenuManager`，最直接的模型是：

```text
锁定：
    给 Everyone 加 Deny Delete | WriteKey

解锁：
    删除 Everyone Deny

排序：
    解锁
    写 Classes
    再锁上
```

这个模型很直观，也确实能解释为什么“开关一次”能改变新建菜单排序状态。

于是最早 `ContextMenuMgr` 也沿着这个方向走：

```text
RemoveShellNewOrderLock
WriteShellNewOrderClasses
ApplyShellNewOrderLock
```

再加上 `ContextMenuMgr` 是前端普通用户、后端高权限服务的架构，所以用户级注册表不能直接用：

```csharp
Registry.CurrentUser
```

而必须定位到前端用户：

```text
HKEY_USERS\<前端用户 SID>\Software\Microsoft\Windows\CurrentVersion\Explorer\Discardable\PostSetup\ShellNew
```

这一点没问题。
问题出在后面的 ACL 权限选择。

---

## 二、误区一：以为 WriteKey 就只是“写入权限”

最关键的坑是这个：

```text
Everyone Deny Delete | WriteKey
```

看起来很合理。

我们想阻止 Explorer 写 `Classes`，所以 Deny `WriteKey` 好像没毛病。

但在 .NET / Windows Registry ACL 里，`RegistryRights.WriteKey` 不是一个很窄的“写值”权限。它是一组复合权限，覆盖范围比想象中大得多。

它会影响后续打开 key、读取 ACL、验证权限等行为。

于是出现了非常经典的自锁场景：

```text
1. ContextMenuMgr 给 ShellNew order key 加了 Everyone Deny WriteKey
2. 加锁成功
3. 下一次想解锁
4. 解锁代码需要读取 ACL
5. 读取 ACL 被自己之前加的 Deny 卡住
6. 程序报：Requested registry access is not allowed
```

日志里表现就是：

```text
SetShellNewOrderLock -> Success
SetShellNewOrderLock -> Requested registry access is not allowed
MoveSpecialMenuItem -> Requested registry access is not allowed
```

这就是“能打开，关不掉”。

当时我一度以为这是服务权限、用户 SID、HKCU 映射的问题。
但后来发现：那些只是外围问题，真正把门锁死的是 `WriteKey` 这个权限太宽。

---

## 三、误区二：以为 BluePointLilac 纯靠简单 ACL 就能修复

这里还有一个很容易误判的地方。

我最开始以为 BluePointLilac 的新建菜单锁非常单纯：

```text
Lock:
    Add Everyone Deny Delete | WriteKey

Unlock:
    Remove Everyone Deny
```

后来重新看它的通用注册表打开逻辑，才发现它并不完全单纯。

它的某些 registry helper 在打开注册表之前，会尝试获取 TrustedInstaller / 受保护注册表项的所有权，里面同样涉及：

```text
SeTakeOwnershipPrivilege
SeRestorePrivilege
SetOwner
FullControl
```

也就是说，BluePointLilac 表层的 ShellNew Lock/Unlock 很简单，但它的底层通用 registry helper 里是带暴力兜底的。

这解释了一个现象：

> 用 BluePointLilac 开关一下，坏掉的 ShellNew ACL 可能就被修好了。

它很可能不是靠“Unlock 逻辑本身”修好的，而是靠通用 registry helper 在打开 key 时顺手把权限拿回来了。

这也说明一件事：

```text
照抄 Delete | WriteKey，
但不带它隐藏的 ownership 兜底，
就容易出现打开了关不掉。
```

但问题也来了：

> 我们真的应该在 ContextMenuMgr 主程序里保留这种 take ownership 兜底吗？

答案后来变成了：不应该。

---

## 四、误区三：能修复不等于应该内置修复

旧版 `ContextMenuMgr` 为了处理“ACL 已经坏掉”的场景，曾经加入过非常暴力的修复链路：

```text
启用 SeSecurityPrivilege
启用 SeTakeOwnershipPrivilege
启用 SeRestorePrivilege
打开 RegistryRights.TakeOwnership
SetOwner(BuiltinAdministrators)
重建 / 替换 DACL
```

这个方案确实解决过问题。

尤其是在旧版本把自己系统上的注册表 ACL 搞坏之后，如果没有这套 repair，可能真的很难恢复。

但这个方案有两个致命缺点。

### 1. 它容易把状态空间搞得更复杂

原本的问题只是：

```text
有一条 Deny ACE 删除不掉
```

暴力修复一上来，问题就升级成：

```text
owner 变了
DACL 被重写了
继承状态可能变了
Allow / Deny 顺序可能变了
```

这会让后续状态更难预测。

### 2. 它非常像杀毒软件会盯上的行为

从安全软件视角看，一个小众工具如果包含这些行为：

```text
AdjustTokenPrivileges
SeTakeOwnershipPrivilege
SeRestorePrivilege
RegistryRights.TakeOwnership
SetOwner
重写注册表 DACL
安装 LocalSystem 服务
通过 named pipe 接收前端命令
```

这套画像就不再像“普通右键菜单管理器”，而更像：

```text
高权限系统配置修改器
权限接管工具
PUA / RiskTool / tamper-like 行为
```

即使代码逻辑是善意的，静态扫描或启发式规则也未必能理解上下文。

所以这次的结论是：

```text
旧 repair 能保命，但不应该留在主程序里。
```

---

## 五、真正跑通的新方案：ShellNew Lock v2

最后稳定下来的方案，是把 ShellNew Lock 的 Deny 权限从宽改窄。

旧方案：

```text
Deny Delete | WriteKey
```

新方案：

```text
Deny SetValue | CreateSubKey | Delete
```

也就是：

```csharp
RegistryRights.SetValue
| RegistryRights.CreateSubKey
| RegistryRights.Delete
```

关键点是：

```text
不 Deny WriteKey
不 Deny ReadPermissions
不 Deny ChangePermissions
不 Deny TakeOwnership
不 Deny FullControl
```

我们真正要阻止的是：

```text
Explorer 或其他普通写入者修改 Classes
```

所以只需要 Deny：

```text
SetValue       // 禁止改 Classes 值
CreateSubKey   // 禁止乱建子项
Delete         // 禁止删掉 order key
```

而必须保留：

```text
ReadPermissions      // 程序以后还能读 ACL
ChangePermissions    // 程序以后还能删掉自己加的 Deny
```

这就是 v2 的核心。

---

## 六、v2 的操作链路

### 1. 锁定

```text
打开 HKEY_USERS\<sid>\...\ShellNew
读取现有 ACL
移除旧的 WorldSid Deny
移除 legacy WriteKey Deny（如果能读到）
添加一条 WorldSid Deny SetValue | CreateSubKey | Delete
SetAccessControl
验证锁状态
```

重点：

```text
不要用 WriteKey
不要 take ownership
不要替换整个 DACL
不要破坏已有继承和 Allow 规则
```

### 2. 解锁

```text
打开 HKEY_USERS\<sid>\...\ShellNew
请求 ReadPermissions | ChangePermissions
读取 ACL
删除 WorldSid Deny SetValue | CreateSubKey | Delete
如果读得到旧版 WriteKey Deny，也一并删除
SetAccessControl
验证解锁状态
```

### 3. 排序

```text
确认 ShellNew order lock 当前开启
RemoveShellNewOrderLock
WriteShellNewOrderClasses
ApplyShellNewOrderLock
```

这次 `MoveSpecialMenuItem` 能正常跑通，说明新锁不会再把自己关在门外。

---

## 七、为什么这次不再需要修复按钮

旧版 UI 有一个“修复 ShellNew ACL”的按钮。

当时它的意义是：

```text
如果锁坏了，就手动触发 ResetShellNewOrderAcl
```

但现在这个按钮反而不该留下。

原因很简单：

```text
只要修复按钮还在，
后端就必须保留 RepairShellNewOrderAcl 这条 pipe 命令；
只要命令还在，
主程序就很可能继续携带 TakeOwnership / SetOwner / Restore privilege 相关代码；
只要这些代码还在，
杀软误报面就还在。
```

所以现在的策略是：

```text
主程序只保留 v2 窄权限 lock/unlock
删除 ShellNew ownership repair
删除修复按钮
删除 RepairShellNewOrderAcl pipe command
```

如果用户机器上已经存在旧版 broad WriteKey Deny，并且导致无法读取 ACL，那么 `ContextMenuMgr` 应该明确提示：

```text
这是旧版宽权限锁或外部工具留下的 legacy ACL。
ContextMenuMgr 不再内置 take-ownership repair。
请使用 BluePointLilac/ContextMenuManager 开关一次修复，或手动恢复权限。
```

这比在主程序里继续内置“接管所有权”要安全得多。

---

## 八、这次真正学到的东西

### 1. Deny 规则要尽可能窄

`WriteKey` 看起来方便，但它太宽了。

这次之后，我对 ACL 的态度变成：

```text
不要 Deny 一个概括权限。
只 Deny 你真的需要阻止的最小权限。
```

ShellNew Lock 需要阻止的是写值，不是阻止程序未来读取 ACL。

---

### 2. 可逆性比“锁得狠”更重要

一个好的锁必须满足：

```text
能锁上
能检测
能解开
失败时状态可解释
```

旧方案最大的问题就是锁得太狠，导致解锁路径被自己阻断。

v2 的目标不是“绝对禁止一切修改”，而是：

```text
足够阻止 Explorer 改排序
同时保留 ContextMenuMgr 以后撤销这条规则的能力
```

---

### 3. 服务架构下不能照抄单进程管理员工具

BluePointLilac 是：

```text
当前用户进程
管理员权限
直接 HKCU
```

ContextMenuMgr 是：

```text
前端普通用户
后端 LocalSystem 服务
通过 Named Pipe 通信
用户级注册表要写 HKEY_USERS\<sid>
```

所以同样一个 ShellNew Lock，复制代码是不够的。

必须同时考虑：

```text
当前操作的是谁的 hive
当前 token 是谁
Deny ACE 会不会影响后续服务解锁
安全软件看到的行为画像是什么
```

---

### 4. “修复能力”也有成本

能把坏 ACL 修回来，当然很爽。

但如果代价是主程序长期携带：

```text
SeTakeOwnershipPrivilege
SeRestorePrivilege
SetOwner
RegistryRights.TakeOwnership
```

那就要重新评估这是不是值得。

这次的结论是：

```text
修复能力可以靠外部工具或手动流程兜底；
主程序应该优先保持温和、可逆、低误报面。
```

---

## 九、最终结论

这次 ShellNew Lock 的最终方案可以总结成一句话：

> 不要用 `WriteKey` 锁新建菜单；用更窄的 `SetValue | CreateSubKey | Delete`，并彻底删除主程序里的 take-ownership 修复链路。

旧版方案确实解决过问题，但它的问题也很明显：

```text
锁太宽
状态太复杂
修复太暴力
误报面太大
```

新版方案不追求“最狠的锁”，而追求：

```text
够用
可逆
能解释
不报毒
不把用户注册表 ACL 搞成权限地狱
```

这才是一个右键菜单管理工具更应该走的方向。

Windows 注册表 ACL 当然可以碰，但要记住：

```text
你 Deny 掉的，不一定只是别人；
很多时候，你也会把未来的自己锁在门外。
```
