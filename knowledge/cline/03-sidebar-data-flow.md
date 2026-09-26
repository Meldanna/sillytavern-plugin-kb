---
title: 侧边栏数据流：postMessage 时序、重试与"永不空白"
category: cline
tags: [webview, postmessage, race, ready, robustness, diagnostics]
summary: webview 与扩展宿主之间的消息契约、ready/state 竞态的产生与三种加固（监听先行、轮询重试、可见性补推），以及把渲染结果落盘自证的写法。
sources: [st-extension-preview/extension.js, cline-api-manager/extension.js]
---

# 侧边栏数据流：postMessage 时序、重试与"永不空白"

`enableScripts` 打开之后（见 `cline/02`），第二类问题紧接着出现：**面板能显示"加载中…"，但数据永远不来**。这是消息时序问题，而不是数据问题。

## 消息契约（本工作区两个项目的实测约定）

| 方向 | type | 载荷 | 说明 |
| --- | --- | --- | --- |
| webview → 宿主 | `ready` | 无 | 脚本启动后第一件事；宿主收到即回推全量 `state` |
| webview → 宿主 | `refresh` | 无 | 用户点"刷新" |
| 宿主 → webview | `state` | 全量状态对象 | 唯一的渲染数据源；幂等，可重复推 |
| 宿主 → webview | `config` | 设置项子集 | 设置变更时的增量通道 |
| webview → 宿主 | 动作类（`open` / `switch` / `apply` / `rename` / `delete` …） | 动作 + 必要 id | 宿主执行，改完再推一次 `state` |
| webview → 宿主 | `rendered` | 行数 / 高度 / 首段文本 | **自证**：界面真的画出来了（见下文"诊断落盘"） |

约定要点：**宿主只推数据、webview 只画**；不要在 webview 里自己算业务（它拿不到 `vscode` API）。`state` 必须可序列化（`Map`/函数/`Uri` 对象传不过去，先转成数组/字符串）。

## ready 与 state 的竞态

典型错误顺序：

```js
view.webview.html = buildHtml(...);                       // ① webview 开始加载，脚本稍后才跑
view.webview.onDidReceiveMessage(onMessage);              // ② 监听挂晚了
view.webview.postMessage({ type: 'state', state });       // ③ 这条消息被丢掉（页面还没监听）
```

`postMessage` 是即发即忘：webview 的文档还没执行到 `window.addEventListener('message', ...)` 时发出的消息**直接丢弃**，不会有队列、不会有重试。表现就是"有时能出内容，有时永远加载中"——取决于加载快慢。

### 三处加固（三个项目都建议照做）

1. **监听先于 html**：`onDidReceiveMessage` / `onDidDispose` / `onDidChangeVisibility` 全部挂在 `view.webview.html = ...` **之前**。
2. **webview 侧轮询重试**：收到 `state` 之前，每 500ms 重发一次 `ready`，最多 12 次。

   ```js
   let state = null, asked = 0;
   (function poll() {
       if (state || asked >= 12) return;
       asked++; post('ready'); setTimeout(poll, 500);
   })();
   ```
3. **可见性变化补推**：侧边栏被划走再划回来时 `retainContextWhenHidden` 下不会重发 `ready`，要补一次。

   ```js
   view.onDidChangeVisibility(() => { if (view.visible) postSidebarState(); });
   ```

## "永不空白"：先画壳，再等数据

webview 里用 `state === null` 表示"还没收到数据"，先渲染一行占位文字（`正在读取…`），收到后再进真正渲染分支：

```js
let state = null;
function render() {
    if (!state) { app.innerHTML = '<div class="hint">正在读取…</div>'; return; }
    /* …真正渲染… */
}
render();   // 立即调用一次，保证首帧不是纯白
```

好处是把"空白"这个最难查的症状变成"看得见的加载态"：面板有字 = 脚本在跑；面板全白 = 脚本没跑（回到 `cline/02`）。**这两类故障从此一眼可分。**

## 诊断落盘：让界面自己说话

两个项目都把关键状态写到 `context.globalStorageUri.fsPath/diagnostics/`，事后读文件即可，不依赖截图或控制台：

| 文件 | 谁写 | 关键字段 | 能回答什么 |
| --- | --- | --- | --- |
| `activate.json` | 扩展宿主，activate 时 | 路径、工作区、注入的库 | 扩展到底激活了没、环境是什么 |
| `sidebar-state.json` | 扩展宿主，每次推状态 | `totals` / `groups[].label,count,path` | 推给面板的**数据**长什么样 |
| `sidebar-rendered.json` | webview（`rendered` 消息）→ 宿主落盘 | `rows` / `height` / `text` 片段 | 面板**真的渲染出了什么**（脚本跑没跑、画了几行） |

`sidebar-state.json` 有、`sidebar-rendered.json` 没有 ⇒ 数据推到了但脚本没执行（`cline/02`）。
两个都有但 `text` 为空 ⇒ 渲染逻辑把数据吃掉了（画出来是空容器），去查 webview 里的渲染分支。

写诊断要**吞掉异常**（`try { … } catch (_) {}`），诊断代码本身绝不能让功能挂掉，也不能因为只读环境写不进去就报错。

## 别把"命令弹窗"当成"面板没内容"

视图标题栏的按钮（`contributes.menus["view/title"]` + `when: view == <viewId>`）执行的是**命令**，需要用户选择时会在窗口顶部中央弹 QuickPick。用户很容易理解成"内容跑到弹窗里去了"。

- 面板负责**呈现数据**（列表、状态、横幅），命令只负责**动作**（切换、新建、导入）。
- 动作的结果要回到面板里显示（横幅/徽章），而不是只丢一个通知；`cline-api-manager` 的做法是切换结果同时写 `globalState` + 面板顶部横幅，重载后仍可见。
