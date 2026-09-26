---
title: 不上 UI 也能验证：假 vscode 模块、headless 渲染、日志与诊断
category: cline
tags: [testing, debugging, headless, stub, logs, diagnostics, workflow]
summary: 三种不打开 UI 的验证手段（假 vscode 模块跑 activate/resolveWebviewView、headless Chromium 渲染 webview HTML、渲染回报落盘）与 VS Code 日志位置、"点了没反应"的排查顺序。
sources: [st-extension-preview/extension.js, cline-api-manager/extension.js, ~/.vscode/extensions/rooveterinaryinc.roo-cline-3.54.0/dist/extension.js]
---

# 不上 UI 也能验证：假 vscode 模块、headless 渲染、日志与诊断

扩展的故障大多发生在"UI 没画出来"这一层，而这些环节**全部可以在命令行里复现**，不必反复让用户点、截图、复述。

## 手段一：假 `vscode` 模块，把 activate / resolver 跑起来

原理：扩展在 Node 里只是 `require('vscode')` 的一个模块。用 `Module._load` 拦截，注入一个假 `vscode`，就能在纯 Node 里调用 `activate(context)` 并拿到 provider：

```js
const Module = require('module');
let provider = null, onMsg = null;
const sent = [];
const webview = {
    cspSource: 'vscode-webview://test', html: '', postMessage: (m) => sent.push(m),
    onDidReceiveMessage: (cb) => { onMsg = cb; }
};
const fakeVscode = {
    Uri: { file: (p) => ({ fsPath: p, toString: () => 'file:///' + String(p).split(String.fromCharCode(92)).join('/') }) },
    ConfigurationTarget: { Global: 1 },
    workspace: {
        getConfiguration: () => ({ get: (k, d) => d, update: async () => {} }),
        workspaceFolders: [{ uri: { fsPath: 'e:/demo' } }],
        onDidChangeConfiguration: () => ({ dispose() {} }),
        createFileSystemWatcher: () => ({ onDidChange() {}, onDidCreate() {}, dispose() {} })
    },
    window: {
        registerWebviewViewProvider: (id, p) => { provider = p; return { dispose() {} }; },
        registerCommand: () => ({ dispose() {} }),
        showErrorMessage() {}, showInformationMessage() {}, showQuickPick: async () => null
    },
    commands: { registerCommand: () => ({ dispose() {} }), executeCommand: async () => {} }
};
const orig = Module._load;
Module._load = function (req) { return req === 'vscode' ? fakeVscode : orig.apply(this, arguments); };

require('E:/你的扩展/extension.js').activate({
    globalStorageUri: { fsPath: 'C:/temp/test-storage' },
    globalState: { get: () => undefined, update: async () => {} },
    secrets: { get: async () => undefined, store: async () => {}, delete: async () => {} },
    subscriptions: []
});
provider.resolveWebviewView({ visible: true, webview, onDidDispose() {}, onDidChangeVisibility() {} });

console.log('推给 webview 的消息:', sent.map((m) => m.type));       // 例如 ['state']
```

要点：

- 假 `vscode` 必须覆盖**扩展真正用到的每个 API**，缺哪个会立刻在栈里暴露出来（这本身就是很好的接口清单）。
- 想验证"webview 发来的动作"，把 `onDidReceiveMessage` 的回调存下来手工调用即可，例如 `onMsg({ type: 'rendered', rows: 5 })`，然后断言诊断文件被写出。
- `resolveWebviewView` 里的 `view.webview.options = { enableScripts: true }` 在假对象上只会被赋值，不会报错 —— **这个 harness 抓不到 `cline/02` 那个坑**，它靠的是手段二与真机日志。

## 手段二：headless Chromium 渲染 webview HTML

把扩展生成的 HTML 落盘，交给真 Chromium 渲染，直接看 DOM：

```bash
# 1) 用手段一拿到 webview.html，写入 <临时>/with-stub.html
#    并在 <body> 后注入同 nonce 的桩：
#    window.acquireVsCodeApi=()=>({postMessage(){},getState:()=>null,setState(){}})
#    setTimeout(()=>window.dispatchEvent(new MessageEvent('message',{data:{type:'state',state:<假状态>}})),60)

msedge --headless=new --disable-gpu --user-data-dir=<临时目录A> \
       --virtual-time-budget=2500 --dump-dom file:///<临时>/with-stub.html > with-stub.dom
```

判定：

- DOM 里能 grep 到预期的条目文本（组标题、行名称）⇒ HTML/CSP/渲染逻辑都没问题，问题在 VS Code 侧或调用时序；
- DOM 里只剩 `<div id="app"></div>` ⇒ 脚本没跑（回到 `cline/02`）。

细节：

- 桩脚本必须带 **与页面相同的 nonce**，否则会被页面自己的 CSP 拦掉，测出来是假阴性。
- `--virtual-time-budget` 让 `setTimeout` 立即推进，避免等真实时间。
- `--user-data-dir` 指到临时目录，别污染本机浏览器 profile。Edge 在 Windows 上是常备项：`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`。

## 手段三：让界面自己回报（beacon）

在 webview 里渲染完成后回一条消息，宿主落盘：

```js
// webview 侧
function report() {
    try {
        post('rendered', {
            rows: document.querySelectorAll('#app .row').length,
            height: document.body.scrollHeight,
            text: (document.getElementById('app').innerText || '').replace(/[\n\r\t ]+/g, ' ').slice(0, 200)
        });
    } catch (e) { post('rendered', { error: String(e && e.message || e) }); }
}

// 宿主侧：收到 'rendered' → 写 globalStorage/diagnostics/sidebar-rendered.json
```

`text` 截一段实际画面文字是最有价值的字段：既能证明"脚本跑起来了"，又能看出"画出来的是什么"。

> 小坑：正则里写 `/[\n\r\t ]+/g` 这类**显式字符类**，不要写 `\s` —— `\s` 在多层字符串/模板里转义极易丢失成 `s`，结果把所有字母 `s` 换成了空格（`manifest.json` → `manife t.j on`）。

## VS Code 侧的观测点（本机路径）

| 想看什么 | 位置 / 命令 |
| --- | --- |
| 扩展激活记录 | `%APPDATA%/Code/logs/<时间戳>/window<N>/exthost/exthost.log`，grep `doActivateExtension <publisher>.<name>`；能看到 `activationEvent: 'onView:xxx.sidebar'` 这类真实触发来源 |
| 扩展宿主报错、宿主无响应 | 同目录 `renderer.log`（注意 `UNRESPONSIVE extension host` 会让视图长时间停在加载态，看起来像扩展的 bug） |
| 视图相关日志 | 同目录 `views.log`（多数情况为空，别指望它） |
| webview 内部报错 | 命令 `Developer: Open Webview Developer Tools`（作用于当前聚焦的 webview） |
| 扩展列表与版本 | `code --list-extensions --show-versions` |
| 扩展是否活着、耗时多少 | 命令 `Developer: Show Running Extensions` |

日志目录按**启动时间戳**分目录，同一个窗口重载仍写在同一个目录里，所以"重载后有没有新记录"很好判断。

## "点了图标没反应 / 面板空白"排查顺序

1. **有没有激活**：日志里找 `doActivateExtension <publisher>.<name>`。没有 ⇒ 检查 `activationEvents`（`onView:<viewId>`）与视图 id 是否拼错。
2. **视图有没有被 resolved**：有没有写诊断文件（`activate.json` / `sidebar-state.json`）。有 ⇒ provider 跑过了。
3. **数据推没推**：诊断里的 `totals` / 分组计数。
4. **界面渲染没渲染**：诊断里的 `sidebar-rendered.json`（beacon）。缺 ⇒ 回到 `cline/02`（`enableScripts`）。
5. **全白且一条脚本错误都没有**：用 `Developer: Open Webview Developer Tools` 看 Console；仍无线索时用手段二在命令行复现。
6. **用户看到的是命令弹窗而不是面板**：那是 `view/title` 按钮触发的 QuickPick，属于设计而非故障（见 `cline/03` 末节）。
