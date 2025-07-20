---
title: 解决Tauri2打包失败的问题
date: 2025-07-20 11:54:28
tags: 
- Tauri 2
- Rust
- Blazor
categories:
- Tauri 2
---

在打包Tauri2程序时会因为下载不了github的部分文件导致失败，结合Github Issue上的回答和大佬的脚本我对解决方案做了些许修改

创建一个ps1脚本，脚本内容如下：

```powershell
$ghproxy="https://ghproxy.net/" #这里是ghproxy加速链接，改成别的也可以

$wix311_binaries=$ghproxy+"https://github.com/wixtoolset/wix3/releases/download/wix3112rtm/wix311-binaries.zip"
$nsis_3=$ghproxy+"https://github.com/tauri-apps/binary-releases/releases/download/nsis-3/nsis-3.zip"
$NSIS_ApplicationID=$ghproxy+"https://github.com/tauri-apps/binary-releases/releases/download/nsis-plugins-v0/NSIS-ApplicationID.zip"
$nsis_tauri_utils=$ghproxy+"https://github.com/tauri-apps/nsis-tauri-utils/releases/download/nsis_tauri_utils-v0.1.1/nsis_tauri_utils.dll"

mkdir temp
cd temp

curl $wix311_binaries -LO 

Expand-Archive ./wix311-binaries.zip -DestinationPath ./WixTools314

curl $nsis_3 -LO 

Expand-Archive ./nsis-3.zip -DestinationPath ./NSIS

mv .\NSIS\nsis-3.*\* .\NSIS
rmdir .\NSIS\nsis-3.*

curl $NSIS_ApplicationID -LO

Expand-Archive .\NSIS-ApplicationID.zip -DestinationPath .\NSIS-ApplicationID

mv .\NSIS-ApplicationID\Release\* .\NSIS\Plugins\x86-unicode

curl $nsis_tauri_utils -LO

mv .\nsis_tauri_utils.dll .\NSIS\Plugins\x86-unicode

mv .\NSIS ~\AppData\Local\tauri\NSIS
mv .\WixTools314 ~\AppData\Local\tauri\WixTools314

echo "rm temp dir"

rm -r .\NSIS-ApplicationID
rm .\nsis-3.zip
rm .\NSIS-ApplicationID.zip
rm .\wix311-binaries.zip
cd ..
rm .\temp

echo "done"
```

然后pwsh启动脚本就好了，它会自动下载并安转依赖
