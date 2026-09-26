---
title: 酒馆插件体系总览
category: reference
tags: [overview, extension, server-plugin, architecture]
summary: SillyTavern 两类插件（前端扩展 / 后端 server plugin）的目录、入口、生命周期与选型对照，以及本工作区既有项目的整体坐标。
sources: [SillyTavern/public/scripts/extensions.js, SillyTavern/src/plugin-loader.js, SillyTavern/plugins.js]
---

# 酒馆插件体系总览

写酒馆插件之前，先判定自己在做哪一类。两者的运行时、生效方式和能力边界完全不同，混用会直接导致"改了没反应"。

## 两条路线对照

| 维度 | 前端扩展（client-side extension） | 后端 server plugin |
| --- | --- | --- |
| 代码位置 | `SillyTavern/public/scripts/extensions/third-party/<name>/`；用户目录安装则落在 `SillyTavern/data/<user>/extensions/<name>/` | `SillyTavern/plugins/<id>/` |
| 入口 | `manifest.json` 的 `js` 字段（以 ES module 注入页面） | `index.js` / `index.cjs` / `index.mjs`，或 `package.json` 的 `main` |
| 元数据 | `manifest.json` | 模块导出的 `info = { id, name, description }` |
| 生命周期 | 页面加载时统一激活，见 `callExtensionHook(name, 'activate')` | `init(router)` 启动时调用；可选 `exit()` 在关闭时调用 |
| 运行时 | 浏览器（和酒馆页面同源，可直接访问 jQuery / DOM / `SillyTavern.getContext()`） | Node（Express 路由、fs、SQLite 等） |
| 能否直接读写磁盘 | 不能，只能通过 `fetch` 调后端接口 | 可以，但必须走 `req.user.directories` 这类用户目录 |
| 生效方式 | 刷新页面（构建产物变了必须先跑 build） | 重启 Node 进程 |
| 开关 | 扩展面板，状态存于 `extension_settings.disabledExtensions` | `config.yaml` 的 `enableServerPlugins: true` |
| 自动更新 | 扩展面板的 Download/Update，需要插件目录是 git 仓库 | `enableServerPluginsAutoUpdate`（默认 true）会在启动时 `git pull` |

## 典型组合

一个功能完整的产品级插件常常同时使用两者：

- 前端扩展负责 UI、事件监听、与酒馆 DOM/API 交互（例如 `cocktail-plus`、`ST-BaiBai-Book`）。
- 后端 server plugin 负责持久化、缓存、文件系统或系统级能力（例如 `plugins/baibaoku` 提供 SQLite KV，`plugins/anima-rag` 提供检索）。
- 前端通过 `fetch('/api/plugins/<id>/...')` 调后端；跨扩展协作则通过 `window` 暴露对象 + 自定义事件（见 `plugins/baibaoku` 的 `window.BaiBaoKu` 与 `baibaoku:ready` 事件）。

## 加载顺序与依赖

- 前端扩展按 manifest 的 `loading_order` 排序后依次激活（默认 100，数字小的先加载）。
- 依赖其他扩展用 manifest 的 `dependencies`；依赖 Extras 模块用 `requires`；依赖酒馆客户端版本用 `minimum_client_version`。三者任一不满足，扩展不会激活，并会在扩展面板出现警告。
- 后端插件按 `plugins/` 目录的读取顺序加载，插件 id 全局唯一（重复 id 会导致后加载者失败）。

## 常见误判

- 把后端代码放进前端扩展目录：Node 侧代码不会被酒馆加载，页面里也 `require` 不到。
- 改了 `src/` 却只刷新页面：`manifest.js` 若指向 `dist/index.js`，必须重新 build。
- 直接改 `data/<user>/extensions/<name>/` 里的产物当源码维护：这个目录是安装产物，更新会被覆盖，源码应放在独立仓库/项目里再部署。
