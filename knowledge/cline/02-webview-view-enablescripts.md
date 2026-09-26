---
title: webview 侧边栏空白：enableScripts 必须写在 resolver 里
category: cline
tags: [webview, sidebar, enablescripts, acquirevscodeapi, csp, trap, blank]
summary: registerWebviewViewProvider 的 webviewOptions 只认 retainContextWhenHidden，把 enableScripts 写在那儿会被静默忽略 → acquireVsCodeApi 不存在 → 面板纯白。含症状对照表、正误写法与复现方法。
sources: [st-extension-preview/extension.js, cline-api-manager/extension.js, ~/.vscode/extensions/rooveterinaryinc.roo-cline-3.54.0/dist/extension.js]
---

# webview 侧边栏空白：enableScripts 必须写在 resolver 里

这是本项目踩过最贵的一个坑：**扩展侧一切正常、日志一切正常、数据也确实推到了，但侧边栏全白**。根因与 UI 完全无关，是 webview 的脚本开关没被打开。

## 症状 → 根因对照表

| 你观察到的 | 实际情况 |
| --- | --- |
| 侧边栏点开是纯白，什么都没有 | webview 内联脚本**一行都没执行**（不是没数据） |
| 该视图的激活记录、状态推送在日志里都正常 | 扩展宿主侧没毛病：`resolveWebviewView` 跑过、`postMessage` 发出去了 |
| 侧面看，只有标题栏的按钮能用（点了弹顶部选择列表） | 命令是扩展宿主执行的，跟 webview 无关，所以照常工作 |
| 加"加载中…"占位也没用 | 占位同样是脚本画的，脚本没跑就一样看不见 |

一句话判别：**如果连静态占位文字都看不到，问题在"脚本能不能跑"，不在"数据有没有来"。**

## 错误写法（会被静默忽略）

```js
vscode.window.registerWebviewViewProvider(id, provider, {
    webviewOptions: {
        enableScripts: true,             // ❌ 无效：这里的 webviewOptions 只支持 retainContextWhenHidden
        retainContextWhenHidden: true    // ✅ 这个才有效
    }
});
```

`registerWebviewViewProvider` 第三个参数的类型里，`webviewOptions` **只声明了 `retainContextWhenHidden`**。多写的键不会报错、不会警告，直接忽略 —— 于是 `enableScripts` 保持默认 `false`，webview 里 `acquireVsCodeApi` 不存在，`<script>` 第一行就抛 `ReferenceError: acquireVsCodeApi is not defined`，整段脚本中止，面板只剩空 DOM。

## 正确写法

```js
vscode.window.registerWebviewViewProvider(viewId, {
    resolveWebviewView(view) {
        // ① 先开脚本：只能在 resolver 里设，且要在赋 html 之前
        view.webview.options = { enableScripts: true };

        // ② 再挂消息监听（要先于 html，原因见 cline/03）
        view.webview.onDidReceiveMessage((msg) => onMessage(msg));

        // ③ 最后赋 html 并推数据
        view.webview.html = buildHtml(view.webview);
        pushState();
    }
}, { webviewOptions: { retainContextWhenHidden: true } });   // 只有这个键有效
```

本机正常工作的对比样本（Roo-Cline 3.54.0）也是同一写法：

```js
r.webview.options = { enableScripts: true, localResourceRoots: [...] };
r.webview.html = ...
```

**别搞混的三种容器**：

| 容器 | 脚本开关写在哪 |
| --- | --- |
| `registerWebviewViewProvider`（侧边栏视图） | ❌ 不在 provider 选项里 → 在 `resolveWebviewView` 里 `view.webview.options = { enableScripts: true }` |
| `createWebviewPanel`（编辑器区标签页） | ✅ 直接写在面板选项：`createWebviewPanel(id, title, column, { enableScripts: true, ... })` |
| `registerWebviewPanelSerializer` / 自定义编辑器 | 同面板，写在 `open()` 返回的 `webview.options` 上 |

## CSP 与 nonce 的正确写法（不是坑，但写错也白屏）

webview 视图推荐直接抄这段（`webview.cspSource` 由 VS Code 提供）：

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
...
<script nonce="${nonce}">/* 你的脚本 */</script>
```

- 内联脚本必须带 **与 CSP 完全一致** 的 `nonce`；`nonce` 每次生成（`Math.random().toString(36).slice(2)` 就够）。
- 要引本地资源时用 `webview.asWebviewUri(vscode.Uri.file(...))`，并把目录加进 `localResourceRoots`；把 `webview.cspSource` 追加到对应的 `script-src` / `img-src` / `font-src`。
- 引用外部域名（字体、图床）前先问"预览环境允许吗"，`connect-src *` 与 `default-src 'none'` 是两回事。

## 30 秒复现（无需打开 VS Code）

真 Chromium 跑一遍侧边栏 HTML，`acquireVsCodeApi` 在不在，结果截然不同：

```bash
msedge --headless=new --disable-gpu --user-data-dir=<临时目录> \
       --virtual-time-budget=2500 --dump-dom file:///<生成的侧边栏.html>
```

- 注入一份 `window.acquireVsCodeApi=()=>({postMessage(){},getState:()=>null,setState(){}})`（用**同一个 nonce** 才不会被 CSP 拦）→ DOM 里能看到渲染结果。
- 不注入 → `<div id="app"></div>` 原样空白，与线上症状逐字一致。

完整的可复用脚本见 `cline/05`。

## 排查顺序（怀疑"侧边栏空白"时）

1. `Developer: Open Webview Developer Tools` 看 Console：出现 `acquireVsCodeApi is not defined` → 就是本文的坑；出现 CSP 拦截信息 → 检查 nonce / `cspSource`。
2. 确认 `webview.options = { enableScripts: true }` 写在 `resolveWebviewView` 内、且早于 `webview.html = ...`。
3. 若 Console 里连脚本错误都没有，说明页面根本没加载 —— 查扩展宿主日志与"视图是否真的被 resolved"（见 `cline/05`）。
