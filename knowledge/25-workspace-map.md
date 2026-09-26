---
title: 本工作区插件项目地图
category: workspace
tags: [workspace, projects, inventory, build-commands]
summary: 当前工作区里各插件项目的位置、类型、版本与构建/测试命令，以及需要注意的"同一插件存在两份目录"的坑。
sources: [SillyTavern/public/scripts/extensions/third-party, SillyTavern/data/default-user/extensions, SillyTavern/plugins]
---

# 本工作区插件项目地图

工作区根目录：`E:\SillyTavern`，其中 `SillyTavern/` 是酒馆本体（上游 v1.18.0，有本地改动）。

## 前端扩展（`SillyTavern/public/scripts/extensions/third-party/`）

| 目录 | 说明 | 构建 / 测试 |
| --- | --- | --- |
| `Anima-Memory-System` | 记忆系统（v3.3.1，原生 JS + 脚本目录） | 无构建脚本，改文件后刷新页面 |
| `cocktail-plus` | 启动与接口性能优化（前端 + 后端 Server Plugin） | `npm run build`、`npm run deploy` |
| `JS-Slash-Runner` | 前端脚本运行器（v4.9.1，Vue + Vite） | `npm run build` / `watch` / `test`（vitest） |
| `lilith-assistant` | 助手类扩展 | 见其自身 README |
| `ST-BaiBai-Book` | 柏宝书（v1.2.4，Vue + Vite） | `npm run build` / `watch` / `test`（node 脚本测试） |
| `ST-BaiBai-Tools` | 柏宝工具箱（v0.30.2，Vite） | `npm run build` / `watch`，`test:preset-backup-retention` 等 |
| `ST-Prompt-Template` | EJS 提示词模板（v1.17，webpack + TS） | `npm run build` |
| `The-Riparian-Gaze` | 河岸凝视（含世界档案面板） | 无构建脚本，改文件后刷新页面 |

## 用户目录扩展（`SillyTavern/data/default-user/extensions/`）

| 目录 | 说明 |
| --- | --- |
| `ST-BaiBai-Inkwell`（柏宝砚，v0.4.1） | 楼层精修改写，Vue + Vite；`npm run build` / `watch` / `typecheck` / `test`（vitest） |
| `preset-manager-momo` | 预设管理器（原生 JS，单文件 `index.js`） |
| `cocktail-plus`、`ST-Prompt-Template` | 与 third-party 下的同名扩展重复存在 |

> **重要坑**：`cocktail-plus` 与 `ST-Prompt-Template` 在 `third-party/` 和 `data/default-user/extensions/` 下各有一份。改之前先确认页面实际加载的是哪一份（看 Network 里的请求路径），否则会出现"改了没生效"。同名不同路径的扩展内部 id 相同，酒馆只按目录枚举，容易搞错。

## 后端 Server Plugin（`SillyTavern/plugins/`）

| 目录 | 说明 | 备注 |
| --- | --- | --- |
| `baibaoku` | 柏宝库：面向前端扩展的通用 KV 存储（SQLite） | v0.6.3，`main: index.js`，可选依赖 `better-sqlite3`；数据落在 `data/<user>/baibaoku/`；前端可 `import('/api/plugins/baibaoku/v1/client.js')` 拿到 `window.BaiBaoKu` |
| `anima-rag` | Anima RAG 检索后端（vectra + minisearch + jieba-wasm） | v1.0.0，`main: index.js`，有 `postinstall: patch-package` |

启用条件：`config.yaml` 中 `enableServerPlugins: true`，改完必须重启 Node 进程。

## 工作区级共享资产

| 路径 | 作用 |
| --- | --- |
| `.github/skills/sillytavern-plugin-dev` | 插件开发流程规范（范围、步骤、安全、产出格式） |
| `.github/skills/sillytavern-local-dev` | 本地开发闭环（刷新 vs 重启的判定规则） |
| `.github/skills/sillytavern-plugin-review` | 审查顺序与产出格式 |
| `.roo/mcp.json` | 工作区 MCP 服务注册表（filesystem / fetch / memory / sequential-thinking，以及本知识库） |
| `st-plugin-kb/` | **本共享知识库项目**：Markdown 知识 + 本地 MCP 服务，所有插件项目共用 |

## 使用建议

1. 动某个插件前，先用本知识库确认规范（生命周期、manifest、构建方式），再打开该插件自己的 `README.md` / `CLAUDE.md` / `docs/`。
2. 各插件自带的文档优先级高于本知识库的通用结论——它们描述的是该项目的既定实现。
3. 新增可复用结论时，通过 `kb_add` 回写到 `st-plugin-kb/knowledge/shared/`，别只写在某个插件的临时笔记里。
