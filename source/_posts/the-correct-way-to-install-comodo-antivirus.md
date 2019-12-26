---
uuid: 7bacb100-27f4-11ea-969c-810bd320836c
title: “正确” 安装 COMODO Antivirus 的方式
s: the-correct-way-to-install-comodo-antivirus
date: 2019-12-26 23:29:18
tags:
  - comodo
  - antivirus
  - tools
categories:
  - Trick
coauthor: liupeixin
---
## 前言
由于某些奇怪的原因，要在Mac系统安装杀毒软件，我们选择了COMODO。然而这软件太不给力，许多人安装了，都会出现卡死，进不了系统等莫名问题。所以，要寻找一条“稳妥”的安装方法。

## 安装

- 下载安装
- 选择英文语言
- 要求重启，拒绝
- 停止更新
<!-- more -->
## 配置

#### Varius Scanner Settings

- Open Scaner Settings
![scanner_settings.png](http://blog-assets.liupei.xin/assets/the-correct-way-to-install-comodo-antivirus/scanner_settings.png)

- Disable Real Time Scanning
![real time scanning](http://blog-assets.liupei.xin/assets/the-correct-way-to-install-comodo-antivirus/scanner_settings.png)

- Disable Manual Scanning
![manual_scanning.png](http://blog-assets.liupei.xin/assets/the-correct-way-to-install-comodo-antivirus/manual_scanning.png)

- Disable Scheduled Scanning
![scheduled_scanning.png](http://blog-assets.liupei.xin/assets/the-correct-way-to-install-comodo-antivirus/scheduled_scanning.png)

- Exclusions Root Directory
![exclusions.png](http://blog-assets.liupei.xin/assets/the-correct-way-to-install-comodo-antivirus/exclusions.png)



#### Preferences
- Open Preferences
![preferences.png](http://blog-assets.liupei.xin/assets/the-correct-way-to-install-comodo-antivirus/preferences.png)

- Disable automatically check update
![disable_automatically_check_update.png](http://blog-assets.liupei.xin/assets/the-correct-way-to-install-comodo-antivirus/disable_automatically_check_update.png)

- Remove Update Host
![remove_update _host.png](http://blog-assets.liupei.xin/assets/the-correct-way-to-install-comodo-antivirus/remove_update _host.png)



#### 替换素材

```bash
cd /Applications/Comodo/COMODO\ Antivirus.app/Contents/Resources/
sudo cp -f green_square.png red_square.png
sudo cp -f StatusGreen.png StatusRed.png
sudo cp -f StatusGreen.png StatusBlue.png
sudo cp -f StatusGreen.png StatusYellow.png
```



#### 编辑国际化文件

使用任何文本编辑器皆可
```bash
subl en.lproj/cfp.strings
```

我使用的 Sublime Text 从命令行打开该文件，保存的时候有权限提示。

还有一种做法是，把该文件复制到你有权限的目录，然后用你熟悉的编辑器编辑，然后再覆盖回当前路径。

```bash
cp en.lproj/cfp.strings ~/Downloads/cfp.strings
open -t ~/Downloads/cfp.strings
......去 下载 目录编辑完成
sudo mv -f ~/Downloads/cfp.strings en.lproj/cfp.strings
```

以下为搜索，替换操作， `-` 是删除当前行，`+` 是增加当前行。 其实就是把当前行内容替换。

目的就是把界面上显示的 文本 A 改为 B，可能每个人的状态不一样，改的地方不一样，可以依此思路，搜索替换。

```git
- "33" = "Never Updated";
+ "33" = "Dec 31, 2019 at 03:29 PM"; // 改成某个合适的时间

- "314" = "Run Diagnostics";
+ "314" = "Run Scan";

- "d2095c3346" = "Disabled";
+ "d2095c3346" = "On Access";

- "33251" = "Enable now";
+ "33251" = "Run Scan";

// 必须
- "346" = "The virus scanner is not functioning properly!";
+ "346" = "All systems are active and running.";


// 可选
- "342" = "Please run the diagnostics utility to fix the problem.";
+ "342" = "All systems are active and running.";

- "343" = "The network firewall is not functioning properly!";
+ "343" = "All systems are active and running.";

- "344" = "The Defense+ is not functioning properly!";
+ "344" = "All systems are active and running.";

- "345" = "COMODO Application Agent is not running!";
+ "345" = "All systems are active and running.";

- "347" = "The virus signature database is NOT up-to-date.";
+ "347" = "All systems are active and running.";

- "349" = "You haven't performed a full scan yet!";
+ "349" = "All systems are active and running.";
```



重启 COMODO Antivirus

```bash
for pid in $(ps aux | grep "COMODO Antivirus" | awk '{print $2}'); do kill -9 $pid; done
```

CMD + Space, 输入 comodo 打开 COMODO Antivirus。



#### 最终显示

![all_done.png](http://blog-assets.liupei.xin/assets/the-correct-way-to-install-comodo-antivirus/all_done.png)

搞定！



#### 更改 tray bar icon

```bash
cd /Library/Application\ Support/Comodo/Antivirus/TrayMenu.app/Contents/Resources
sudo cp -f ok_mode.png block_mode.png
sudo cp -f ok_mode.png alert_mode.png
sudo cp -f ok_mode_dark.png block_mode_dark.png
sudo cp -f ok_mode_dark.png alert_mode_dark.png
```



#### 不想要 tray bar？

```bash
launchctl unload -wF /Library/LaunchAgents/com.comodo.TrayMenu.plist
launchctl unload -wF /Library/LaunchAgents/com.comodo.Agent.plist

sudo rm /Library/LaunchDaemons/com.comodo.fileaccessdaemon.plist
sudo rm /Library/LaunchAgents/com.comodo.Agent.plist
sudo rm /Library/LaunchAgents/com.comodo.TrayMenu.plist
```

之后通过关闭按钮直接关闭 APP。



## 卸载
- 运行自带的 Uninstall COMODO Antivirus.app
- 第三方 AppCleaner.app



## 后续

- 其实不用卸载，不用了直接关闭该APP，待到来年再用，改下日期再打开就行
- 如果有时间，以上步骤可(~~never~~)做个脚本



[全文完]
