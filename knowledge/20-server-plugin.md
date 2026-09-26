---
title: 后端 server plugin 开发
category: server
tags: [server-plugin, express, routes, node, config]
summary: server plugin 的目录结构、info/init/exit 契约、路由挂载规则、用户目录与 CSRF 处理，以及前端如何调用。
sources: [SillyTavern/src/plugin-loader.js, SillyTavern/plugins.js, SillyTavern/plugins/baibaoku/README.md, SillyTavern/src/users.js]
---

# 后端 server plugin 开发

## 加载契约（plugin-loader.js）

`loadPlugins()` 扫描 `SillyTavern/plugins/`：

1. 目录：先尝试 `package.json` 的 `main`，再依次找 `index.js` / `index.cjs` / `index.mjs`。
2. 单文件：`plugins/foo.js`、`plugins/foo.cjs`、`plugins/foo.mjs` 也可直接作为插件。
3. 必须导出（ESM 支持 default 导出）：

```js
export const info = {
    id: 'my-plugin',        // 只能是 ^[a-z0-9_-]+$，且全局唯一
    name: 'My Plugin',
    description: '做什么用的',
};

export async function init(router) {
    router.get('/v1/status', (req, res) => res.json({ ok: true }));
}

export async function exit() {
    // 可选：关闭数据库、清理定时器
}
```

4. 路由挂载：`init(router)` 注册的路由会被挂到 `/api/plugins/<id>` 下；`router` 为空时不会挂载任何路由。
5. 启用开关：`config.yaml` 的 `enableServerPlugins: true`（默认 false，关闭时整个加载流程直接跳过）。

## 生命周期

- `init(router)` 在酒馆启动阶段 await 完成，**不要**在里面做长时间阻塞操作（会拖慢启动）；需要预热就后台异步跑。
- `exit()` 在服务关闭时统一 `Promise.all` 调用，用来释放 DB 句柄、停止定时器、flush 缓存。
- 加载失败只是 `console.error`，插件被静默跳过 —— 排查时先看启动日志里的 "Failed to load plugin"。

## 用户目录与多用户

多用户模式下不要硬编码 `default-user`，用请求上的 `req.user.directories`：

```js
router.get('/v1/data-path', (req, res) => {
    res.json({ root: req.user.directories.root }); // data/<handle>/...
});
```

常用键：`root`、`characters`、`chats`、`backgrounds`、`themes`、`extensions`、`files`、`userImages`、`avatars`、`assets`、`worlds`（以 `src/users.js` 的 `UserDirectoryList` 为准）。

写文件时：

- 与用户数据绑定的内容放 `req.user.directories.*`（用户备份会带上）。
- 插件自身的全局缓存/配置放 `SillyTavern/plugins/<id>/`（如 `cocktail-plus` 的 `plugins/cocktail-plus/cache/`）。
- 路径拼接务必先 `path.join` 再校验，禁止把用户输入直接当文件名（见 `24-security-review`）。

## CSRF 与鉴权

- 酒馆默认开启 CSRF 保护（`config.yaml: disableCsrfProtection: false`），前端调用必须带令牌：用 `SillyTavern.getContext().getRequestHeaders()`，它会带上 `x-csrf-token`。
- 插件路由挂在 `/api/plugins/...` 下，已经过酒馆的会话与 CSRF 中间件，**不需要**自己再实现一套鉴权，但要做参数校验和路径校验。
- 如果插件要在页面极早期发请求（例如 Early Bridge 场景），需要自行从 `/csrf-token` 取令牌后手动设置 `x-csrf-token` 头。

## 前端调用示例

```js
const headers = SillyTavern.getContext().getRequestHeaders();
const res = await fetch('/api/plugins/my-plugin/v1/status', { method: 'POST', headers, body: '{}' });
const data = await res.json();
```

## 安装与更新

- 手动安装：`git clone <repo> SillyTavern/plugins/<id>`，然后 `npm install --omit=dev`（有依赖时）。
- CLI：`node plugins.js install <git-url>`、`node plugins.js update`，对应 npm 脚本 `npm run plugins:install` / `npm run plugins:update`。
- 启动时若 `enableServerPluginsAutoUpdate: true`（默认），loader 会对 `plugins/` 下每个 git 仓库 `fetch` + `pull`。
- 前后端一体的插件（例如 `cocktail-plus`）通常把后端源码放 `server-plugins/<id>/src/`，构建成 `index.mjs` 后再复制到 `SillyTavern/plugins/<id>/`；部署脚本要保留目标端的 `config.json` 与 `cache/`。

## 调试建议

- 改后端代码必须**重启 Node 进程**，刷新浏览器无效。
- 开发期可用 `node --watch server.js` 缩短循环，但要确认与插件动态加载兼容。
- 日志直接 `console.log`，酒馆会输出到终端；不要往 stdout 写非日志内容（有子进程协议时更要注意）。
