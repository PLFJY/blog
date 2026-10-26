---
title: 【neo-bpsys-wpf】目前来说真的是最强的第五人格 BP 展示软件（赛事导播软件）
date: 2026-10-22
tags:
- 第五人格
- bp软件
- C#
- WPF
- .NET
categories:
- 第五人格
- bp软件
---

## 前言

之前我在这个博客里介绍过两个自己做的第五人格 BP 展示软件：最早用易语言写的 [idv-bp-asg-e](/id5/bpsys/idv-bp-asg-e/)，以及后面用 C# / WPF 重写的 [bp-sys-wpf](/id5/bpsys/bp-sys-wpf/)。现在它们都已经停止维护了。

从最开始给自己所在的赛事组做一套能用的 BP 画面，到后来有越来越多的民间赛事开始使用，软件也逐渐不只是“选个角色然后把立绘放到直播间”这么简单了。旧项目虽然也能继续堆功能，但一些早期设计留下来的限制确实越来越难处理。

所以有了这次的新作：**neo-bpsys-wpf**。

名字里虽然还有 WPF，但这次并不是给旧软件换一套 UI；从后台操作、比分计算到前台布局、插件扩展，很多地方都重新做了。我的目标还是没变：**让民间赛事也能以相对低的成本，制作出接近正式赛事观感的直播画面。**

**官网：** [https://bpsys.plfjy.top/](https://bpsys.plfjy.top/)  
**使用文档：** [https://docs.bpsys.plfjy.top/](https://docs.bpsys.plfjy.top/)  
**GitHub 开源地址：** [PLFJY/neo-bpsys-wpf](https://github.com/PLFJY/neo-bpsys-wpf/)  
**下载地址：** [GitHub Releases](https://github.com/PLFJY/neo-bpsys-wpf/releases/latest)

本软件基于 **C#、.NET 10 和 WPF** 开发，使用 WPF-UI 作为界面组件库，以 **GPL-3.0** 协议开源，软件本身完全免费。

![主界面](https://docs.bpsys.plfjy.top/user-guide/images/Introduction-MainPage.webp)

## 一、基础 BP 系统

先说最基本的功能。和前两作一样，软件的核心还是围绕第五人格比赛的 Ban/Pick 流程进行操作，包括角色禁用、角色选择、全局禁选、地图 BP、换边、队伍信息以及前台画面展示。

**队伍信息：** 可以填写双方的战队名称、LOGO 和选手信息，自行设置当前上场队员及其顺序。求生者和监管者分别管理，跟以前一样，选手信息也可以从 JSON 文件导入，不必每次比赛都重新手敲一遍；与以前不同的是，现在可以任意添加多名求生和监管者选手

![队伍信息编辑](https://docs.bpsys.plfjy.top/user-guide/images/TeamInfo-TeamInfoPage.webp)

**角色 Ban/Pick：** 支持使用角色全称、拼音全拼或首拼进行检索，确认之后才会把对应角色同步到前台。这里保留了我之前一直在用的操作习惯：**输入角色后按 Tab（或回车）确认，以预览框里的头像为准**。如果仅仅改了输入框里的文字而没有确认，前台不会变。

至于 26 号守卫，依然可以直接输入 `bb` 搜索。这个习惯依旧可用 🤣。

![角色禁用界面](https://docs.bpsys.plfjy.top/user-guide/images/BanCharacter-HunBanSelection.webp)

![角色选择界面](https://docs.bpsys.plfjy.top/user-guide/images/PickCharacter-PickPage.webp)

**全局禁选：** 根据对局进度和双方阵营，自动记录已经选择过的角色，并在下一次对应队伍担任相同阵营时应用到全局禁选。手动修改记录的功能也完整保留了下来。

**地图 BP：** 相比以前简单地摆几张地图图片，根据官方的规则，现在已支持多地图禁用、全局地图禁用、选图方及阵营展示，并且可以使用呼吸灯等动画当前待选的地图。

![地图 BP 操作页面](https://docs.bpsys.plfjy.top/user-guide/images/MapBP-Overview.webp)

### 对局引导

这个功能我认为对实际导播非常有用。

比赛开始前设置 BO3 / BO5 赛制、当前局数和半场，然后开启【对局引导】，之后可以通过【上一步】【下一步】按照预设比赛规则推进 BP 流程。软件会跳转到对应的后台页面、高亮需要操作的区域，并联动倒计时和呼吸灯。

![对局引导](https://docs.bpsys.plfjy.top/user-guide/images/GameInfoAndGuidance-MatchGuidanceStarted.webp)

也就是说，导播不需要每次都自己回忆“这一步应该先禁地图还是先禁角色”。直接可以把脑子丢掉了！

## 二、比分系统与赛后数据

前两作其实就已经有比分系统了，只不过随着功能增加，单纯的手动累加方式已经越来越不适合完整的赛事流程。

新作的比分系统提供**标准对局**和**自由对局**两种模式。

标准对局会根据当前的 BO3 / BO5 进度记录每个半场的对局结果，并据此计算各个前台窗口应该显示的比分。BP 主画面、游戏内比分、赛后数据、BP 总览和全局比分所需要的数据并不完全相同，现在会按各自用途提供对应的比分值，而不是所有画面共用一个简单的数字。

![标准对局比分系统](https://docs.bpsys.plfjy.top/user-guide/images/ScoreSystem-ScorePageStandard.webp)

如果是水友赛、测试或者其他不需要完整赛程记录的场景，也可以切换到自由对局，继续使用累加和手动调整比分的操作方式。

另外，软件还提供了独立的**赛后数据**页面。求生者和监管者的赛后数据可以手动编辑，并同步显示到对应的前台窗口。至于不想手动录数据的情况，下面的智慧 BP 会再提到。

![赛后数据页面](https://docs.bpsys.plfjy.top/user-guide/images/MatchStatistics-PageDetails.webp)

## 三、前台设计器 v3：终于不用只会换背景图了

如果说以前的 BP 软件想修改 UI，主要还是去替换资源文件夹里的图片、改改文字位置，那么现在这套系统就复杂得多了。

**v3 前台设计器**允许直接编辑 BP 主窗口、过场窗口、比分窗口等前台布局，也支持新建自己的前台窗口。背景、控件位置、大小、字体、图片、显示层级、数据绑定和动画都可以在设计器里修改。

![v3 前台设计器](https://docs.bpsys.plfjy.top/user-guide/advanced/images/V3Designer-Overview.webp)

和 v2.x 的版本直接对前台窗口操作的设计者模式不同，v3 有独立的编辑窗口。左侧是图层，中央是画布，右侧是属性面板，可以拖动、缩放、对齐控件，也可以撤销、重做和校验布局。编辑时不需要直接操作 OBS 正在采集的那块画面。

### 数据绑定

这是制作自定义 BPUI 时比较重要的部分。

例如，要显示当前求生者方队伍名称，可以把一个文本控件绑定到 `CurrentGame.SurTeam.Name`；以后后台更换队伍，前台的文本就会自动更新，而不需要每次都去重新修改 UI。

角色、队伍信息、比分、地图等内容都可以根据各自的数据字段进行绑定，也支持多数据源组合和动态索引。

![文本数据绑定编辑](https://docs.bpsys.plfjy.top/user-guide/advanced/images/V3Designer-TextBinding.webp)

### 动画行为

这一版设计器还引入了基于事件触发的动画行为系统。可以给控件设置在角色选择、角色禁用、比分变化、窗口显示等事件发生时播放动画，通过节点图安排渐入、移动、延时、并行、条件判断等效果。

![动画节点图编辑](https://docs.bpsys.plfjy.top/user-guide/advanced/images/V3Designer-AnimationGraph.webp)

另外，同一个布局还可以分别设计 BO3 / BO5 两种显示状态，避免切换赛制之后比分格数量不对。

最终制作好的布局可以导出为 `.bpui` 文件，连同使用的图片等布局资源一起分享给其他人。旧版本的 `.bpui` 也支持导入并尝试转换，不过复杂布局**不能保证完全还原**，建议导入后自行检查。

![导出 BPUI 布局包](https://docs.bpsys.plfjy.top/user-guide/advanced/images/V3Designer-ExportPackage.webp)

设计器的内容实在太多，这里就不写成使用说明书了。完整操作方法可以看：[v3 前台设计器文档](https://docs.bpsys.plfjy.top/user-guide/advanced/v3-designer.html)。

## 四、智慧 BP：让 OCR 帮导播做一部分工作

以前每次游戏里禁用、选择一个角色，后台都要跟着点一次。整场比赛下来，这件事其实挺重复的。

现在软件提供了独立的**智慧 BP（Smart BP）模块**，通过窗口捕获和 OCR 识别读取游戏画面，在满足条件时自动把识别结果填写到后台。

目前主要包括：

- 识别角色 Ban/Pick，并按情况更新后台数据；
- 辅助同步对局引导的 BP 阶段；
- 在角色分配阶段，根据选手 ID 尝试对应选手与角色；
- 对赛后统计画面进行 OCR 识别，并自动填充赛后数据。

![智慧 BP 自动识别](https://docs.bpsys.plfjy.top/user-guide/images/SmartBp-AutoRecognition.webp)

智慧 BP 需要单独安装功能模块，并下载、启用对应的 OCR 模型。一般情况下推荐使用文档中介绍的 PaddleOCR 方案。捕获方式通常选 Windows Graphics Capture（WGC），也可以通过预览确认软件实际读到的游戏画面。

赛后数据识别不需要开启整场 BP 的自动识别循环，只要准备好捕获画面，就可以在赛后数据页面单独触发识别。

![智慧 BP 赛后数据识别结果](https://docs.bpsys.plfjy.top/user-guide/images/SmartBp-PostGameResult.webp)

**注意：这个功能并不是“打开以后就完全不需要导播了”。**

目前智慧 BP 还不能自动完成地图 BP、天赋及辅助特质识别，也**不会自动切换 OBS 的直播场景**。OCR 也可能因为画面裁切、分辨率和文字显示情况发生误识别，所以正式比赛仍然应该安排人员检查结果。

详细的安装、模型配置和高级识别设置可以看：[智慧 BP 使用文档](https://docs.bpsys.plfjy.top/user-guide/smart-bp.html)。

---

## 五、插件系统和插件市场

早期软件的功能基本都只能由主程序提供，想增加什么东西就得等我发更新。现在新作加入了插件系统，允许开发者扩展后台页面、独立前台窗口，以及 v3 设计器里的控件和动画触发事件。

软件内置了插件管理界面和插件市场，可以查看插件介绍、安装、更新、启用或禁用插件。部分功能也由随软件提供的内置插件实现。

![插件市场](https://docs.bpsys.plfjy.top/user-guide/advanced/images/PluginSystem-Market.webp)

比如主程序目前没有自带完整的 3D 展示画面，但已经有社区开发者提供相应插件。对于不同赛事的特殊需求，不必全部塞进主程序里。

这里需要提醒一句：安装第三方插件时请注意来源和兼容性，尽量在正式比赛之前测试。插件安装、更新或启用状态发生变化后，一般还需要重启软件才能生效。

[插件系统使用说明](https://docs.bpsys.plfjy.top/user-guide/advanced/plugin-system.html)

## 六、下载与使用

本软件目前主要面向 Windows，系统要求为 **Windows 10 20H2 及以上**，并依赖 **.NET 10 桌面运行时**（通常由安装包处理）。直播导播本身还需要考虑 OBS、游戏和其他工具的资源占用，不能只看软件是否可以启动。

**下载地址：**

- [官方网站](https://bpsys.plfjy.top/)
- [GitHub Releases](https://github.com/PLFJY/neo-bpsys-wpf/releases/latest)

安装完成后，建议先填写双方队伍信息、设置 BO3 / BO5 赛制，在【前台管理】中打开需要的展示窗口，再用 OBS 等直播软件进行窗口采集。之后就可以根据【对局引导】依次操作地图、角色和比分。

![前台窗口管理](https://docs.bpsys.plfjy.top/user-guide/images/FrontendManager-Page.webp)

这篇文章主要用来介绍软件现在有什么功能，具体的使用步骤请以文档站为准：

[**neo-bpsys-wpf 使用文档**](https://docs.bpsys.plfjy.top/user-guide/quick-start.html)

如果遇到 Bug，可以到 [GitHub Issues](https://github.com/PLFJY/neo-bpsys-wpf/issues) 反馈，尽量附上版本、复现过程以及必要的截图或日志。

## 写在最后

回头看，从最早那个易语言写的 BP 小工具，到后来的 `bp-sys-wpf`，再到现在的 `neo-bpsys-wpf`，功能已经和最开始完全不是一个量级了。

现在这个项目仍然在持续更新，也肯定还有 Bug 和需要完善的地方。尤其是 v3 设计器、智慧 BP 这种比较复杂的功能，真遇到问题的话，希望大家尽量提供可以复现的反馈；

最后，感谢一路以来使用过这些软件的赛事组，以及帮助开发、测试、提供默认 UI 和插件的各位。希望这版软件能继续帮到更多民间赛事。

**项目地址：** [PLFJY/neo-bpsys-wpf](https://github.com/PLFJY/neo-bpsys-wpf/)  
**官网：** [https://bpsys.plfjy.top/](https://bpsys.plfjy.top/)  
**文档：** [https://docs.bpsys.plfjy.top/](https://docs.bpsys.plfjy.top/)

下面是各个我本人调查到的使用了 PLFJY 系列软件的赛事名单，在此特别鸣谢！你们的使用和支持就是我最大的更新动力！

ASG
MGF
IZL/CVA深圳高中联赛/全国高中邀请赛
FLN/JRL
IPL
上海科技大学校内赛
PAL
cew
广西大学杯大众赛

欧美服IEAL
IGL广州初高中联赛
东大第五人格赛事INL（东北大学）
IEL星球杯
北航校内赛
GLIV
济南第五人格高中联赛
QWQ/MCY
NJUPT
上海SHISL第五人格高中生联赛

FIAC福州市高中赛
福州大学校内赛
USTC中科大校内赛（中国科学技术大学）
第五人格西区杯
抖音东仔水友赛
小甜甜水友赛
ACS档案馆秘闻/ VML
DZ
中南财经政法大学校内赛
江苏理工校友赛

南京师范大学校内赛
ASU
FEG复旦大学校内赛
第五人格IVF赛事
武汉高校第五人格赛事（华中科技大学）
南通大学第五人格赛事
武汉理工大学校内赛
山艺第五人格赛事
USST上海理工大学校内赛
ICR第五人格联合赛事

第五人格SIV赛事
第五人格KBL赛事
SUL苏大第五人格
第五人格ICU赛事
COH第五人格海湾校赛
EVO 赛事
IVBL
西宁市第五人格校内赛
RCE
SIV

中北大学第五人格赛事
SVA
Tsia M
THC
湖南理工友谊赛
上海海洋大学校内赛
风铃杯 X 青岛平度RE动漫游戏嘉年华
柠檬水赛事ILL, COL
第五人格KCC赛事
RCF第五人格赛事

IVX第五人格赛事
MNIL
第五人格台州市高中生邀请赛
荣漫第五人格水友赛
西南交大第五人格赛事
第五人格FDM赛事
北京大学第五人格赛事 PIL
浙工大第五人格赛事
XSL
IQJC

中南大学第五人格赛事
第五人格北京高中联赛
SIL
CSU
SWG
CTCU水友赛
张之律水友赛
齐鲁工业大学校内赛
TMU校内联谊赛
ZUL

ZNJU
西狮电子竞技俱乐部哥特杯
首经贸第五人格杯
武汉大学第五人格校内赛
中国传媒大学（白杨杯）
华政杯
南昌大学校内赛
白杨杯
TIVL
第五人格事务所杯

航母杯
YTS
IIL
遵义市中建拾光荟跨年比赛
第五人格CPL高校宣传赛
星赛事
IFL、IUL
ICL
广东财经大学广财杯
温州医科大学校内赛

第五人格湛江市高中邀请赛
安徽工业大学校内赛 IVA
Europe League
哈皮杯（比分模块）

---

特此感谢以上的所有赛事组

End
