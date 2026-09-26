---
title: 调试与故障定位
category: workflow
tags: [debug, troubleshooting, console, logs]
summary: 前端/后端各自的观测点、最常见的失败特征与对应原因，以及把调试入口注册进酒馆调试面板的做法。
sources: [SillyTavern/public/scripts/extensions.js, SillyTavern/public/scripts/st-context.js]
---

# 调试与故障定位

## 前端观测点

| 位置 | 看什么 |
| --- | --- |
| 扩展面板的警告图标 | 激活失败的原因（缺依赖 / 版本不足 / 脚本报错），对应 `extensionLoadErrors` |
| DevTools → Console | 模块导入失败、`undefined` API、未捕获 Promise 拒绝 |
| DevTools → Network | `/scripts/extensions/<name>/manifest.json`、`dist/index.js?ver=x` 是否 200，加载的是哪一份 |
| DevTools → Application → Service Workers | 有 SW 的插件（如 `cocktail-plus`）是否接管了请求 |
| `window.SillyTavern.getContext()` | 在 Console 里直接确认 API 是否存在、当前角色/聊天是否已就绪 |

快速自检片段：

```js
const ctx = SillyTavern.getContext();
console.log(ctx.eventTypes.APP_READY, ctx.characterId, ctx.chatId, typeof ctx.generateQuietPrompt);
console.table(ctx.getExtensionManifest('ST-BaiBai-Inkwell'));  // 确认酒馆眼里这个扩展的 manifest
```

## 后端观测点

- 启动日志会打印每个被加载的插件路径：`Initializing plugin from …`。
- 加载失败会打印 `Failed to load plugin module; …`（缺 `info` 字段、id 非法、id 重复、`init` 不是函数）。
- 未启用时不会有任何输出：先确认 `config.yaml` 的 `enableServerPlugins: true` 并已重启。
- 插件 id 重复是最容易被忽略的失败：日志里是 `plugin ID 'x' is already in use`。

## 常见失败特征对照

| 现象 | 大概率原因 |
| --- | --- |
| 页面里插件"完全不存在" | 扩展被禁用；或目录名与 `settings.json` 的 `disabledExtensions` 不符；或 `manifest.json` 拉取失败 |
| 代码改了没变化 | 改的是 `src/` 而产物未构建；或页面加载的是另一份目录；或浏览器缓存（硬刷新/核对 `?ver=`） |
| `SlashCommandParser is undefined` | 注册时机过早，酒馆 API 尚未初始化；改到 `APP_READY` 后注册 |
| 事件回调触发两次 | 模块被重复执行（多份产物 / SW 重复注册），或未清理旧监听 |
| 后端 API 404 | 路由挂在 `/api/plugins/<id>` 下但请求路径写错；或插件加载失败导致路由未挂载 |
| 后端 API 403 | CSRF 令牌缺失：前端应使用 `getRequestHeaders()` |
| 生成结果里注入内容重复 | `setExtensionPrompt` 的 key 用了不同的值，旧条目未清空 |
| 用户反馈"更新后设置丢了" | 迁移逻辑写了整体覆盖而不是合并默认值 |

## 把调试入口做进产品

```js
ctx.registerDebugFunction('my-plugin', () => ({
    enabled: settings().enabled,
    cacheSize: cache.size,
    lastError: lastError?.message ?? null,
}));
```

注册后可在酒馆面板直接查看插件状态，比在 Console 里手动翻对象更适合交给用户自查。

## 日志纪律

- 调试期用 `console.debug`，正式版本把高频日志降级或删除，避免刷屏影响用户。
- 不要打印完整设置对象、API key、聊天正文；需要定位就打印键名、长度、hash。
- 后端日志走 stdout/stderr 即可（酒馆终端可见）；不要把日志写进用户数据目录。

## 复现问题的最小步骤

1. 记录：酒馆版本（`/version` 返回或 `package.json`）、插件版本（`manifest.json`）、改动文件、复现步骤。
2. 关闭无关扩展，只留目标插件复测（判断是否扩展间冲突）。
3. 用新建的临时聊天 / 临时用户账号复测（判断是否脏数据引起）。
4. 前后端分别在最小路径上验证：前端只测 UI 与事件，后端用 `curl` 直连接口。
