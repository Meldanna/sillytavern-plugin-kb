---
title: 打包 → 安装 → 核对：VS Code 扩展的交付闭环
category: cline
tags: [vsce, vsix, install, reload, version, verify, workflow]
summary: 用 vsce 打包、用 code CLI 安装、版本号必须递增、必须重载窗口，以及"装上去的到底是不是新代码"的核对方法。
sources: [st-extension-preview/package.json, cline-api-manager/package.json, ~/.vscode/extensions/]
---

# 打包 → 安装 → 核对：VS Code 扩展的交付闭环

酒馆扩展改完刷新页面就行；**VS Code 扩展改完必须走一遍"打包 → 安装 → 重载窗口"**，少一步就会出现"改了没反应"。

## 四条命令（本机实测）

```bash
cd E:\你的扩展项目
npx -y @vscode/vsce package                       # 产出 <name>-<version>.vsix
"/e/Microsoft VS Code/bin/code" --install-extension ./<name>-<version>.vsix --force
"/e/Microsoft VS Code/bin/code" --list-extensions --show-versions | grep -i <publisher>
# 然后在 VS Code 里 Ctrl+Shift+P → Developer: Reload Window
```

- `--force`：同版本重装必须加，否则 CLI 会跳过。
- **`code` CLI 路径**：Windows 下是 `<安装目录>/bin/code`（bash 里用 `/e/Microsoft VS Code/bin/code` 这种写法）；`code.cmd` 同理可用。
- **重载窗口是必须的**：运行中的窗口已经加载了旧扩展代码，不重载永远看不到新行为。安装成功 ≠ 生效。

## 版本号必须递增（否则装了也不换）

VS Code 以 **目录名 `publisher.name-version`** 区分已安装版本，CLI 也会拿 `version` 判断是否已存在。改了代码但没改 `package.json.version`：

- `vsce package` 会产出同名 vsix，安装时容易"The extension is already installed"，或装完目录不变、实际仍是旧代码；
- 旧版本目录（如 `freebuff.st-extension-preview-0.3.4`）会一直留着，直到 VS Code 自己清理。

**约定**：每次交付前 `version` +1（本工作区插件用三位语义化版本，如 `0.3.5 → 0.3.6`）。

## 核对"装上去的到底是不是新代码"

装完不要只看"successfully installed"，按顺序核对：

1. **确认版本**：`code --list-extensions --show-versions | grep -i <publisher>` 应显示新版本号。
2. **确认包内含新逻辑**：对已安装目录 grep 本次新增的标记字符串，例如

   ```bash
   grep -c "正在读取扩展列表" ~/.vscode/extensions/<publisher>.<name>-<新版本>/extension.js
   grep -o "onView:<viewId>" ~/.vscode/extensions/<publisher>.<name>-<新版本>/package.json
   ```
3. **对"已安装的那份"跑冒烟测试**（而不是对源码）：把测试脚本里的入口路径指向 `~/.vscode/extensions/<publisher>.<name>-<新版本>/extension.js` 再跑一遍。这是"打包过程有没有漏文件"的唯一有效验证（`.vscodeignore` 写错经常少文件）。见 `cline/05`。
4. **界面核对**：重载后点开视图，读诊断落盘文件（`sidebar-rendered.json`）确认渲染内容，见 `cline/03` / `cline/05`。

## `.vscodeignore` 与打包噪音

- 打包会把工作区所有文件按 `.vscodeignore` 过滤后塞进 vsix；测试脚本、`*.vsix`、`.vscode/`、`docs/` 建议排除，否则包体膨胀、且把旧 vsix 打进新包。
- `vsce` 的 `WARNING LICENSE, LICENSE.md, or LICENSE.txt not found` 只是警告，不影响安装；`package.json` 里写明 `"license": "MIT"` 即可正常交付。
- `package.json` 的 `scripts.package` 习惯写成 `npx vsce package`，与上面的命令等价。

## 安装产物与"已装目录"的关系（排错常用）

| 路径 | 内容 |
| --- | --- |
| `~/.vscode/extensions/<publisher>.<name>-<version>/` | 已安装的扩展本体（**运行时跑的就是这里**，不是你的源码目录） |
| `~/.vscode/extensions/extensions.json` | 已安装清单；被替换的旧版本在这里被标记为 removed，目录稍后清理 |
| `%APPDATA%/Code/User/globalStorage/<publisher>.<name>/` | 该扩展的 `globalStorageUri`（自管文件、诊断落盘） |
| `%APPDATA%/Code/User/globalStorage/state.vscdb` | **`globalState` 真正的存放处**（见 `cline/06`） |

排查"改了没生效"时，第一步永远是 `diff` 源码目录和 `~/.vscode/extensions/.../extension.js` —— 不一致就说明还没打包/没安装/没重载。
