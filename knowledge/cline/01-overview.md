---
title: Cline 扩展（VS Code 扩展）体系总览
category: cline
tags: [cline, vscode, extension, overview, activation, contributes]
summary: 给 Cline 做扩展 = 写一个普通 VS Code 扩展；与酒馆扩展的对照、最小骨架、本工作区两个现成样例项目与选型建议。
sources: [st-extension-preview/package.json, cline-api-manager/package.json, st-extension-preview/extension.js, cline-api-manager/extension.js]
---

# Cline 扩展（VS Code 扩展）体系总览

"给 Cline 做一个扩展" 的真实含义：写一个**普通 VS Code 扩展**，通过 VS Code 提供的 API 去读/写 Cline 的状态或与它协作。**不需要改 Cline 本体**，也不存在"Cline 专用插件格式"这种东西 —— 判别一份资料是否靠谱，看它讲的是 VS Code API 还是凭空发明的 Cline API。

## 与酒馆扩展的对照

本工作区的读者熟悉酒馆扩展，先建立映射（列出的都是两侧**实测**过的行为）：

| 维度 | 酒馆前端扩展 | VS Code / Cline 扩展 |
| --- | --- | --- |
| 元数据 | `manifest.json`（`display_name` / `js` / `css` / `loading_order`） | `package.json`（`name` / `publisher` / `engines.vscode` / `main` / `activationEvents` / `contributes`） |
| 入口 | `manifest.js` 指向的脚本，页面加载时注入 | `main` 指向的 CommonJS 模块，导出 `activate(context)` / `deactivate()` |
| 运行时 | 浏览器，与酒馆同源，直接用 jQuery / DOM / `SillyTavern.getContext()` | Node（扩展宿主），`require('vscode')`；UI 必须在 webview 里另写 HTML |
| UI 挂载 | 直接往酒馆 DOM 塞元素（`#extensions_settings` 等） | 只能"贡献"：活动栏图标 + 侧边栏视图 / 命令 / 菜单项，由 VS Code 渲染外壳 |
| UI 内部 | 就是页面 DOM | 独立文档（webview），与扩展宿主只能靠 `postMessage` 通信 |
| 生效方式 | 刷新页面 | 安装后**必须重载窗口**；改代码后重新打包 + 安装 + 重载 |
| 持久化 | `extension_settings`（服务端 settings.json） | `context.globalState`（写入 `User/globalStorage/state.vscdb`）、`context.workspaceState`、`context.secrets`、自管文件 |
| 调试 | 浏览器 DevTools | 扩展宿主日志 + `Developer: Open Webview Developer Tools`（见 `cline/05`） |

## 最小骨架（两个文件起）

```text
my-cline-ext/
├─ package.json      # 身份、入口、贡献点
├─ extension.js      # activate / deactivate
└─ media/            # 图标等静态资源（可选）
```

`package.json` 的最小可用形状（取值含义见 `cline/02`、`cline/04`）：

```json
{
  "name": "my-ext", "displayName": "My Ext", "publisher": "me",
  "version": "0.1.0", "license": "MIT",
  "engines": { "vscode": "^1.85.0" },
  "activationEvents": ["onView:myExt.sidebar"],
  "main": "./extension.js",
  "contributes": {
    "viewsContainers": { "activitybar": [{ "id": "myExt", "title": "My Ext", "icon": "media/activity-icon.svg" }] },
    "views": { "myExt": [{ "type": "webview", "id": "myExt.sidebar", "name": "面板", "visibility": "visible" }] }
  }
}
```

```js
const vscode = require('vscode');
function activate(context) {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('myExt.sidebar', {
            resolveWebviewView(view) {
                view.webview.options = { enableScripts: true };   // ← 必须写在这里，见 cline/02
                view.webview.html = '<body><div id="app"></div><script>acquireVsCodeApi()</script></body>';
            }
        }, { webviewOptions: { retainContextWhenHidden: true } })
    );
}
function deactivate() {}
module.exports = { activate, deactivate };
```

## 本工作区的两个现成样例

| 项目 | 干什么 | 值得抄的地方 |
| --- | --- | --- |
| `E:\st-extension-preview`（SillyTavern Extension Preview） | 在 VS Code 里用 webview 预览酒馆第三方扩展，免启动酒馆 | 侧边栏 + 面板双形态、按目录分组扫描、`import map` 桩模块、`createFileSystemWatcher` 自动重载、自诊断落盘 |
| `E:\cline-api-manager`（Cline API Manager） | 给 Cline 的 Plan/Act 各存多套 API 配置并一键切换 | 读 Cline 的文件后备存储、SecretStorage 存密钥、**写后回读校验**、冷切换脚本 `apply-profile.js` |

这两个项目的侧边栏/面板写法、打包安装闭环、无 UI 测试方法，已分别沉淀在 `cline/02`–`cline/06`。

## 选哪种视图：webview view 还是 tree view

| 需求 | 选择 | 理由 |
| --- | --- | --- |
| 列表 / 树 / 简单行内按钮 | `TreeDataProvider` + `contributes.views` | 由 VS Code 原生渲染，无 CSP、无消息时序问题，`when`/图标/上下文菜单都现成 |
| 富文本、卡片、自定义布局、内嵌表单 | `type: "webview"` + `registerWebviewViewProvider` | 完全自绘；代价是要自己处理脚本开关、CSP、消息时序（这三个坑见 `cline/02`/`cline/03`） |
| 需要占大面积的编辑器式界面 | `createWebviewPanel`（编辑器区标签页） | 与侧边栏不同：面板的 `enableScripts` 直接写在 `createWebviewPanel` 选项里，不存在"被忽略"的坑 |

**经验**：能用 tree view 表达的就别上 webview；确实要自绘时，先把 `webview.options`、消息时序、诊断落盘三件事按 `cline/02`–`cline/05` 做对，再写业务。

## 常见误判

- **"改完 Cline 扩展的代码，重载窗口却不生效"**：多半是没重新打包安装（VS Code 跑的是 `~/.vscode/extensions/<publisher>.<name>-<version>/` 里的副本），或版本号没递增导致 VS Code 认为已是最新，见 `cline/04`。
- **"侧边栏是空白，一定是数据没推过去"**：恰恰相反，最常见原因是 webview 里脚本根本没被允许执行（`enableScripts`），数据其实推到了，见 `cline/02`。
- **"把 Cline 的源码改了"**：不要改 Cline 本体（升级即失效，且用户装的是市场版本）；正确做法是读写它的状态文件，见 `cline/06`。
