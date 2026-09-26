---
title: 酒馆助手脚本实战：iframe 运行环境、按聊天持久化、浮层拖拽定位
category: shared
tags: tavern-helper, js-slash-runner, iframe, chat-variables, persistence, mobile, smoke-test, pitfall
summary: 改「酒馆助手（JS-Slash-Runner）脚本」时必须知道的 8 条硬结论：iframe 注入面、内容不能含 </script>、CHAT_CHANGED 的真实值、不存在的角色卡 API、按聊天分开的存储降级写法、挂顶层 body 的清理、移动端拖拽的正误写法、以及能离线跑脚本的 mock 冒烟测试法。
updated: 2026-09-14
---

# 酒馆助手脚本实战：iframe 运行环境、按聊天持久化、浮层拖拽定位

来源：`E:\SillyTavern\pet-npc`（「NPC 桌宠 · Desktop Pet NPC」v1.0.0 → v2.0.0 改造工程）实测 +
`SillyTavern/public/scripts/extensions/third-party/JS-Slash-Runner/src/iframe/predefine.js`、
`src/panel/script/iframe.ts` 源码核对。

## 一、脚本运行在 iframe 里，注意注入面

`createSrcContent()`（`src/panel/script/iframe.ts`）把脚本 `content` 放进 `<script type="module">`，iframe 用
`srcdoc` 或 blob URL（由设置 `render.use_blob_url` 决定），**没有 sandbox 属性**，所以与酒馆同源、`localStorage` 可用。

`src/iframe/predefine.js` 注入的内容：

- `window._`、`EjsTemplate`、`TavernHelper`、`YAML`、`showdown`、`toastr`、`z`
- `TavernHelper._bind` 里的 API 逐个去掉下划线前缀后挂到 iframe window（`getVariables`、`eventOn`、`getChatMessages`…）
- `window.SillyTavern`：**getter**，每次访问都返回 `{ ...getContext(), getContext }`

**结论：脚本里没有裸 `getContext()`**，必须写 `window.SillyTavern.getContext()`。
原版桌宠写的 `typeof getContext === 'function' ? getContext() : null` 恒为 false，
导致「注入当前聊天上下文」功能静默失效。

**另一个坑**：content 里不能出现 `</script>`，否则 HTML 会被截断（脚本直接不执行或半截）。构建时值得加一条断言。

## 二、事件名别猜：`CHAT_CHANGED` 的真实值是 `'chat_id_changed'`

`tavern_events.CHAT_CHANGED === 'chat_id_changed'`（不是 `'chat_changed'`）。
脚本里优先用常量：`window.tavern_events?.CHAT_CHANGED || 'chat_id_changed'`，再交给 `eventOn(名字, fn)`。

## 三、不存在的 API 名（必须避免，异常会被 catch 吞掉）

1.0.0 桌宠调用了 `getCharacterByName` / `getCharWorldbookNames` —— 这两个函数在酒馆助手声明里**不存在**，
`try/catch` 一吞，`charData` 永远是 null，表现为「头像空白、人设/世界书全空」。

正确写法（都在 `@types` 清单里）：

| 用途 | 正确 API |
| --- | --- |
| 角色卡数据(v1 字段) | `getCharData(name)` / `getCharacter(name)`（v2 归一化，`first_messages[]`） |
| 头像路径 | `getCharAvatarPath(name)`；兜底 `/characters/<encodeURIComponent(avatar)>` 或顶层 `getThumbnailUrl('avatar', file)` |
| 角色绑定的世界书 | `getCharLorebooks({ name })` → `{ primary, additional }` |
| 世界书条目 | `getWorldbook(bookName)` → `WorldbookEntry[]{ content, comment, enabled, keys… }` |
| 角色名列表 | `getCharacterNames()`（async） |

**建议做法**：写一个 `verify-api.mjs` 之类的工具，把脚本里按名字调用的 API 与 `@types` 声明清单对账，
杜绝「幽灵函数」再次发生（本项目 142 处调用，0 缺失）。

## 四、对话记录「按聊天窗口分开」的正确存法

裸 `localStorage` 单键（`pet_npc_chat`）= 所有聊天共用一份，用户会理解为「保存不了」。
改成三级降级，主通道写进**当前聊天的变量表**：

```js
// 写：chat 变量 -> chatMetadata -> localStorage(按 scope 分键)
updateVariablesWith(v => ({ ...v, pet_npc_history: list }), { type: 'chat' });  // 首选
ctx.chatMetadata.pet_npc_history = list;  ctx.saveMetadataDebounced?.();        // 兜底1
localStorage.setItem('pet_npc_chat__' + scope, JSON.stringify(list));           // 兜底2
```

- `scope = 角色名 + '::' + ctx.chatId`，切聊天时重算并重载（监听 `CHAT_CHANGED` 后延时 ~300ms 再读，等酒馆切完）。
- 用 `updateVariablesWith` 而不是 `replaceVariables`：后者是整表替换，会抹掉别人的变量。
- 设备级偏好（API 设置、浮层位置）仍放 `localStorage`，不要塞进聊天变量。

## 五、浮层挂顶层 body → 必须在 pagehide 清理，否则越积越多

脚本 iframe 重建（改脚本、切聊天、刷新）时，挂在顶层 `body` 上的 DOM **不会**自动消失：
`predefine.js` 的 `pagehide` 只做了 `eventClearAll()`，清的是事件，不是 DOM。

固定两件事：

1. 构建前 `$$('#your-widget').forEach(el => el.remove())`；
2. `window.addEventListener('pagehide', cleanup)`，cleanup 里移除 DOM 与自己注册的 resize/visualViewport 监听。

## 六、移动端拖拽浮层的正确写法

- 用 **pointer capture**（`setPointerCapture/releasePointerCapture`），监听只挂在把手上，
  不要往 `document` 上挂匿名 `pointermove/pointerup`（无法解绑、重复绑定就泄漏）。
- CSS 给把手 `touch-action: none`，滚动由它接管。
- **不要在 `touchstart` 里 `preventDefault`**：那会让浏览器不合成 `click`，点一下头像就打不开面板。
  拖拽后的误点用「位移超过阈值就置 `dragJustMoved` 并抑制随后的 click」解决。
- 阈值 8px（手机上按下到抬起几乎不可能 0 位移）；补 `pointercancel` / `lostpointercapture` 复位，
  否则被来电/系统手势打断后状态卡住。
- 边界 clamp 双向都要做，且要用 `visualViewport`（`offsetLeft/offsetTop/width/height`）而不是 `innerHeight`：
  手机键盘弹出时 `innerHeight` 不可信。resize / orientationchange / vv.resize 都要重新 clamp。
- 跟随类浮层用 `absolute` 挂在 `fixed` 容器里（容器天然是包含块，不受祖先 `transform` 影响）；
  隐藏用 `visibility/opacity` 即可，因为 absolute 本来就不占布局 —— 「面板隐藏后头像被顶开」正是
  原版用 flex 堆叠 + 只改 opacity 造成的。

## 七、一个真实的自伤 bug：const 的 TDZ 让配置读不出来

```js
let CFG = loadConfig();      // loadConfig 内部读 TOP.localStorage
const TOP = (() => { ... })();   // ← 声明在后面
```

执行到 `loadConfig()` 时 `TOP` 还在暂时性死区 → 抛 `ReferenceError` → 被 `catch` 吞掉 →
**配置全部回默认值**，用户看到的现象是「每次刷新都要重填 API」。

规则：**凡是「初始化状态变量」要用到的东西（窗口引用、存储访问器），必须声明在状态变量之前。**

## 八、没有浏览器也能验证酒馆助手脚本：mock + vm 冒烟测试

本项目 `tools/smoke-test.mjs` 的做法（约 200 行 mock，34 条断言，可复用）：

1. 写一个 mini DOM（`createElement/appendChild/remove/classList/dataset/style/addEventListener/dispatch`），
   `querySelector` 只需支持 `#id`（脚本通常只用 id 选择器）；`innerHTML` setter 用一个正则解析器建树，并把 `class`、`value` 属性同步到元素上。
2. 造两个窗口：顶层窗口（UI 挂这里）与 iframe 窗口（脚本执行处），`iframeWin.parent = topWin`，
   两者共享同一个 localStorage 对象。
3. 在 iframe 窗口上塞酒馆助手 API 的 mock：`SillyTavern.getContext()`、`tavern_events`、`getVariables/updateVariablesWith`（按 chatId 分桶，就能验证「按聊天分开」）、
   `getCharData/getCharAvatarPath/getCharLorebooks/getWorldbook`、`eventOn`（配 `_emit` 手动触发）。
4. `vm.createContext(sandbox)` + `runInContext(code)` 真实执行 `src/xxx.js`，
   然后断言 DOM 结构、`fetch` 请求体、存储内容、`pagehide` 清理。

用它抓到过两个只靠读代码看不出来的问题：`const TOP` 的 TDZ、设置保存时读不到元素值会中断保存。
注意 mock 里事件对象要补 `preventDefault/stopPropagation/cancelable`，否则脚本里的
`if (e.cancelable) e.preventDefault()` 会抛 TypeError。

## 九、v2.1.0 追加：布局选型、居中+拖拽切换、mock 测试的两个必备细节

### 1. flex 排布里「DOM 顺序 = 视觉顺序」，改布局先改 HTML
需求是「头像在面板顶部居中上方」。第一版把面板做成 `position:absolute; bottom:100%` 挂在头像上方 —— 方向正好相反；
改成 flex column 后又踩第二个坑：**模板里面板写在头像之前**，于是视觉上面板在上、头像在下。
改布局时先把 DOM 顺序调对，再动 CSS。

### 2. 「头像 + 面板」竖排、底边贴屏：用常流 + `display:none`，别用 `absolute`

```css
.pet-widget { position: fixed; left: 50%; bottom: calc(12px + env(safe-area-inset-bottom));
              transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; }
.pet-panel  { width: min(400px, calc(100vw - 20px)); }   /* 普通流子元素，位于头像下方 */
.pet-panel.pet-hidden { display: none; }                  /* 关键：收起时不再占位 */
```

- 只要「隐藏仍占位」（旧版只改 `opacity`），头像就会被顶开或顶到屏幕中间 —— 这正是用户看到的「UI 与头像分离」。
- 常流方案不必同时算「面板高 + 头像高 + 上下间距」，也不和 `100dvh` 打架；高度用 JS 按视口收敛即可。
- 收起/展开动画用 `animation`（display 切换会重播），不要指望 `transition`。

### 3. 默认居中 + 可拖拽：切换时要先清掉 transform

```js
widget.style.transform = 'none';        // 取消 translateX(-50%)
const [nx, ny] = clampPos(x, y);        // clampPos 用 getBoundingClientRect()：给的是含 transform 的最终屏幕坐标
widget.style.left = nx + 'px';          // 所以 left = nx 与拖拽前位置严格连续，不会跳
widget.style.top = ny + 'px';
```

「重置位置」= 把 `transform/left/top` 全部清空，即回到底部居中。

### 4. mock 冒烟测试：事件要冒泡、布尔属性要映射、选元素要选对

- **事件冒泡**：脚本里消息区/记录页用事件委托（容器挂 click，靠 `e.target.closest`）。mock 的 `dispatch`
  若只触发元素自身监听器，子按钮的点击永远到不了容器 → 表现成"功能没实现"。必须自己实现冒泡（沿 `parentNode` 上行，
  遇 `stopPropagation` 停），并实现 `closest()`（支持 `[data-act="x"]`、`.cls`、`tag`、逗号分隔）。
- **布尔属性**：`<div hidden>`、`<input checked>` 要映射成 `el.hidden = true` / `el.checked = true`，
  否则断言全在拿 undefined 做比较。
- **选对元素**：`find(el => el.attrs['data-act'] === 'reroll')` 拿到的是**第一个**（可能是开场白那条）。
  要测"重 roll 最后一条"就得 `filter(...).pop()`；挑错元素会把好功能误报成 bug。

### 5. 重 roll 的前置校验必须放在截断之前

「从第 idx 条重新生成」= 截断到 idx 再请求。若先截断再校验（例如"这条之前必须有用户消息"），
拒绝的那一刻历史已经被清空 —— **数据丢了却没重新生成**。规则：所有前置校验（是否正在生成、API 是否已配置、
用户是否确认丢弃后续）都放在截断之前；并且「只剩 system 提示」也应允许请求，等价于重抽开场白。

## 十、v2.2.0 追加：让脚本「同时支持 OpenAI 兼容与 Anthropic」要处理的真实差异

### 1. 别指望用户填对端点 —— 先归一化，再准备候选队列

```js
const VERSION_SEG_RE = /\/v\d+[a-z]*$/i;        // /v1 /v1beta /v2 …
function toBaseUrl(u) {                          // 去掉已知端点后缀
  return String(u || '').trim().replace(/\/+$/, '')
    .replace(/\/chat\/completions$/i, '').replace(/\/completions$/i, '')
    .replace(/\/messages$/i, '').replace(/\/models$/i, '').replace(/\/+$/, '');
}
function resolveUrls(endpoint, provider) {
  const base = toBaseUrl(endpoint);
  const root = VERSION_SEG_RE.test(base) ? base.replace(VERSION_SEG_RE, '') : base;
  if (provider === 'anthropic') return { chat: [root + '/v1/messages'], models: [root + '/v1/models'] };
  return {
    chat: unique([root + '/v1/chat/completions', base + '/chat/completions']),
    models: unique([root + '/v1/models', base + '/models']),
  };
}
```

实测覆盖：裸 host、带 `/v1`、带 `/v1/`、完整 `/v1/chat/completions`、`openrouter.ai/api/v1`、
`http://127.0.0.1:8080` —— 都归一到同一结果；已含后缀的不会被拼成 `…/chat/completions/v1/...`。
请求时按候选顺序回退（第一个失败再试下一个），并把"补全后的实际地址"显示给用户。

### 2. 拉模型：三通道 + 失败必须可诊断

- 通道 1：酒馆助手 `getModelList({ apiurl, key })` —— 走酒馆后端，**天然免 CORS**，但只适用 OpenAI 兼容。
- 通道 2：直连候选 `/models`，按协议带对应鉴权头。
- 通道 3：**Anthropic 没有可跨域拉取的公开模型列表**。核对结论：ST 后端的
  `POST /api/backends/chat-completions/status`（`SillyTavern/src/endpoints/backends/chat-completions.js:1735`）
  **没有 claude 分支**，只覆盖 openai / openrouter / mistral / custom / cohere / makersuite / azure 等。
  所以拉不到时给内置清单兜底，并在 UI 上**明确写"内置清单"**，别让用户以为是实时结果。
- 失败时把「试过哪些地址、各自什么错（HTTP 码 / CORS / 空返回）」逐条显示。只报一句"失败"等于没报。

### 3. Anthropic 与 OpenAI 兼容的协议差异（必须分别实现）

| 点 | OpenAI 兼容 | Anthropic |
| --- | --- | --- |
| 路径 | `/v1/chat/completions` | `/v1/messages` |
| 鉴权 | `Authorization: Bearer <key>` | `x-api-key: <key>` + `anthropic-version: 2023-06-01` |
| 浏览器直连 | 看服务端 CORS | 必须额外带 `anthropic-dangerous-direct-browser-access: true`，否则被拦 |
| system 提示 | 放在 messages 里 | 单独字段 `system`；messages 里**不能**出现 system 角色 |
| 温度 | 0–2 | 0–1（要 clamp，否则 400） |
| 回复 | `choices[0].message.content` | `content[]` 中 `type === 'text'` 的片段拼接 |
| 模型列表 | `GET /v1/models` 多数可用 | 无公开跨域接口 |

若目标环境不允许浏览器直连 Anthropic，正解是走酒馆后端：
`generateRaw({ ordered_prompts, custom_api: { apiurl, key, model, source: 'claude' }, should_silence: true })`。
其中 `RolePrompt = { role, content }`（`generateRaw.ts` 里按 `item.role && item.content` 识别自定义提示词），
`source` 的取值见 `SillyTavern/src/constants.js` 的 `CHAT_COMPLETION_SOURCES`（`openai` / `claude` / `custom` …）。

### 4. UI 要能"自证"

把「协议 + 实际对话地址 + 模型列表地址」实时显示在设置面板输入框下方。
原先只写了一句"（OpenAI 兼容）"的标签，用户根本不知道后缀补成了什么，一旦失败只能靠猜。


