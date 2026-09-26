---
title: 本地开发闭环：刷新还是重启
category: workflow
tags: [workflow, dev-loop, restart, refresh, deploy]
summary: 改动类型与生效方式的对应关系、构建产物类改动的正确顺序、部署脚本约定，以及"改了没生效"的排查顺序。
sources: [.github/skills/sillytavern-local-dev/SKILL.md, SillyTavern/Start.bat, SillyTavern/Dev-Start.bat]
---

# 本地开发闭环：刷新还是重启

## 判定表

| 改动位置 | 生效方式 |
| --- | --- |
| `public/scripts/extensions/third-party/<x>/*.js` / `.html` / `.css`（未打包的原生文件） | 刷新页面（必要时硬刷新 Ctrl+F5） |
| `<x>/src/**`（TypeScript / Vue 源码） | 先跑该项目的 `build`（或保持 `watch` 运行），再刷新页面 |
| `manifest.json`、`i18n/*.json` | 刷新页面 |
| `SillyTavern/plugins/<id>/**`、`server-plugins/**` | **重启 Node 进程** |
| `SillyTavern/src/**`、`server.js`、`config.yaml`、依赖变更 | **重启 Node 进程** |
| `data/<user>/settings.json` 手工修改 | 刷新页面（酒馆会重新读取），改坏时用 `data/<user>/backups/` 回滚 |

一句话：**浏览器能看到的靠刷新，Node 侧跑起来的靠重启。**

## 推荐节奏

1. 源码目录起 `npm run watch`（vite watch 或 webpack watch），保持产物自动更新。
2. 改前端：刷新 → 复现 → 看 Console 报错。
3. 改后端：停掉当前酒馆进程 → 用项目惯用命令启动（本工作区有 `Start.bat`、`Dev-Start.bat`）→ 看终端日志确认插件已加载。
4. 前后端一体的插件（`cocktail-plus`）：前端刷新 + 后端重启都要做，或者直接用其 `npm run deploy` 脚本一次完成构建+部署。

## 部署类脚本约定

以 `cocktail-plus/scripts/deploy-to-sillytavern.ps1` 为例，部署应当：

1. 缺 `node_modules` 就先 `npm install`。
2. 执行 `npm run build`。
3. 覆盖前端产物到 `SillyTavern/public/scripts/extensions/third-party/<id>/`。
4. 覆盖后端产物到 `SillyTavern/plugins/<id>/`，并**保留**目标端的 `config.json` 与 `cache/`。
5. 覆盖前把旧版本备份到 `.deploy-backups/`。

反向操作（把酒馆里的运行目录当作唯一源码来改）是不可持续的：扩展面板的 Update 会 `git pull` 覆盖掉改动。

## 排查"改了没生效"的顺序

1. 改的是 `src/` 还是产物？产物没更新 → 跑 build / 看 watch 是否还在跑。
2. 加载的是哪个目录？`data/<user>/extensions/<x>/` 与 `public/scripts/extensions/third-party/<x>/` 可能同时存在两份，改了一份、页面用的是另一份。
3. 浏览器缓存？硬刷新；也可以在 DevTools → Network 里确认请求的是最新文件（带 `?ver=` 时核对版本号）。
4. 扩展是否被禁用？扩展面板状态存于 `settings.json` 的 `extension_settings.disabledExtensions`。
5. 后端改动是否只刷了页面？重启 Node。
6. 看启动日志：插件加载失败（后端）或扩展激活失败（前端面板警告）都会明确写出来。

## 不要做的事

- 不要 `taskkill` 掉所有 Node 进程来"重启酒馆"，会误杀其它工具链进程。
- 不要在 watch 正在覆盖产物时手工编辑 `dist/`，改动会被下一次构建吞掉。
- 不要在未确认目标路径的情况下批量复制目录（容易把 `data/` 用户数据当代码覆盖）。
