# st-plugin-kb · SillyTavern 插件开发共享知识库

面向"写酒馆插件"的**共享知识库**：把插件开发的 API、生命周期、构建、调试、审查规范沉淀成一套 Markdown，并通过一个**本地 MCP(stdio) 服务**暴露给本工作区所有插件项目的 AI Agent 查询。

- 知识库位于 `knowledge/`，单一真源，所有插件项目共用这一份，不复制、不各自维护。
- MCP 服务零第三方依赖（只要求 Node ≥ 20），不需要 `npm install`，不联网。
- 检索为 BM25 + 中文二元组切分，中英混排查询可直接用。

## 目录结构

```text
st-plugin-kb/
├─ server.js                  # MCP stdio 服务入口（也可 --doctor / --help）
├─ src/
│  ├─ kb.js                   # 知识库：加载 / 建索引 / 检索 / 读取 / 写入
│  ├─ bm25.js                 # BM25 打分 + 中英分词
│  ├─ indexer.js              # frontmatter 解析、按标题切块、片段抽取
│  └─ mcp.js                  # JSON-RPC / MCP 协议与工具定义
├─ scripts/
│  ├─ call.mjs                # 命令行查库：调一次工具 / JSONL 批量（npm run query）
│  ├─ build-index.mjs         # 重建索引并写入 index/kb-index.json
│  ├─ selftest.mjs            # 端到端协议自检
│  └─ register-mcp.mjs        # 注册到 .roo/mcp.json 或 Cline 全局配置
├─ docs/
│  ├─ ARCHITECTURE.md         # 项目结构与运行说明（给其它 AI / 新接手的人看，自包含）
│  └─ SNIPPETS.md             # ★ 一键粘贴专用区：配置片段 / 提示词 / 命令 / 协议报文 / 规则样板
├─ knowledge/                 # 知识本体（Markdown + frontmatter）
├─ index/kb-index.json        # 生成的索引（可读，便于核对）
└─ mcp.json.snippet.json      # 手动注册时可直接复制的片段
```

## 快速开始

```bash
cd E:\MCP\st-plugin-kb

node server.js --doctor        # 自检：打印文档数、切块数、分类分布
node scripts/build-index.mjs    # 重建索引文件
node scripts/selftest.mjs       # 以真实 MCP 协议跑一遍握手/检索/写入（会临时写一条再删掉）
```

## 导入你自己的开发文档

把文档丢进 `inbox/`，然后跑一次：

```bash
node scripts/import.mjs                        # 或 npm run import
```

- 支持 `.md` / `.markdown` / `.txt` / `.json` / `.html` / `.htm` / `.docx`（docx 是零依赖解包，保留标题层级）。
- 自动抽标题与摘要、补 frontmatter、按 sha256 去重、把原件归档到 `inbox/imported/`，最后重建索引。
- 常用参数：`--category frontend`、`--tags st,tutorial`、`--dry-run`、`--force`、`--title-from-first-line`，也可以直接 `node scripts/import.mjs <文件或目录>`。
- 支持的格式与细节见 `inbox/README.md`。

> 提示：`.pdf` / `.doc`（旧格式）不支持，先转成 `.md` / `.txt`。

## 注册给 Agent 使用

```bash
node scripts/register-mcp.mjs                 # 写入 E:\SillyTavern\.roo\mcp.json（自动备份原文件）
node scripts/register-mcp.mjs --print         # 只看将要写入的内容
node scripts/register-mcp.mjs --target cline  # Cline 全局 MCP 配置（存在才写，否则打印片段）
```

注册后重启 MCP 客户端（或重新加载工作区），工具列表会出现：

| 工具 | 用途 |
| --- | --- |
| `kb_search` | 关键词检索，返回相关片段 + 文档 id（支持 `category` / `tags` / `docId` 过滤） |
| `kb_get` | 按 id 读全文 |
| `kb_list` | 列出全部文档（可按分类/标签过滤） |
| `kb_add` | 把新结论沉淀回知识库（写入 `knowledge/shared/` 并重建索引） |
| `kb_reindex` | 手工编辑 Markdown 后重建索引 |
| `kb_stats` | 统计信息 |

给 Agent 的建议用法：改插件前先 `kb_search` 查规范；需要完整背景再 `kb_get`；排查出新结论后 `kb_add` 回写，让其它插件项目直接受益。

> 知识库路径可用环境变量 `ST_KB_ROOT` 指向别处（默认 `<项目>/knowledge`）。

## 知识条目约定

每篇 Markdown 头部带简单 frontmatter：

```markdown
---
title: 前端扩展 manifest.json 规范
category: frontend
tags: [manifest, extension]
summary: 一句话摘要，会出现在 kb_list 里
sources: [SillyTavern/public/scripts/extensions.js]
---

# 正文…

## 小节（会被切成独立检索块）
```

- `category` 现有取值：`reference`、`frontend`、`server`、`build`、`workflow`、`security`、`workspace`、`cline`、`meta`，新增可自定义。
- `sources` 写上真实文件路径，便于 Agent 回到源码核对结论，避免知识库与代码脱节。
- 一个二级标题就是一个检索块，标题写清"这是什么问题"，比写"概述"更好被命中。

## 当前收录

| id | 内容 |
| --- | --- |
| `MISSION` | **知识库使命与使用契约**：服务谁、AI 开工三条习惯、覆盖范围、质量门槛、新会话如何得知它 |
| `00-overview` | 前端扩展 vs 后端 server plugin 的体系总览与选型 |
| `10-frontend-manifest` | manifest.json 字段与校验规则 |
| `11-frontend-lifecycle` | 加载时序、扩展钩子、初始化时机与清理 |
| `12-st-context` | `SillyTavern.getContext()` 的能力分组清单 |
| `13-events` | 事件订阅方式 + `event_types` 完整清单 |
| `14-settings-persistence` | `extension_settings` 用法、默认值合并与版本迁移 |
| `15-slash-commands` | Slash 命令注册与参数定义 |
| `16-ui-i18n` | 挂载点、模板渲染、i18n、主题样式约定 |
| `17-generation-worldinfo` | 生成入口、提示词注入枚举、token 与世界书 API |
| `18-mobile-positioning` | 移动端浮层定位（fixed/inset、flex 遮罩、absolute 跟随小窗）与触屏事件接管 |
| `20-server-plugin` | 后端插件的加载契约、路由、用户目录、CSRF |
| `21-build-toolchain` | vite / webpack / esbuild 三种范式与 external 约定 |
| `22-local-dev-loop` | 刷新还是重启、部署脚本约定、失效排查顺序 |
| `23-debugging` | 观测点、失败特征对照表、调试入口注册 |
| `24-security-review` | 审查顺序与高危点清单 |
| `25-workspace-map` | 本工作区各插件项目地图与构建命令 |
| `helper/01-index` + `helper/02`–`helper/19` | **酒馆助手（JS-Slash-Runner）全局 API 声明**：258 个符号按 18 个功能域拆分，每个符号一个 `##` 小节 |
| `reference/slash-commands-index` + `slash-commands-{a-c…t-z}` | **ST 核心斜杠命令** 299 条：速查索引 + 6 个首字母分桶全文 |
| `reference/macros-index` + `macros-{…}` | **ST 核心宏** 104 个：速查索引 + 8 个用途分类全文 |
| `cline/01`–`cline/06` | **给 Cline / VS Code 做扩展**：体系与骨架对照、webview 侧边栏 `enableScripts` 坑、消息时序与「永不空白」、打包安装核对闭环、无 UI 验证与排错、Cline 配置存储与安全切换（来源：本机 `st-extension-preview` / `cline-api-manager` 两个扩展的实测） |

## 生成 VS Code 多根工作区（项目组）

把酒馆本体、知识库与各插件项目编组到一个工作区文件里，资源管理器平铺显示、每个插件仓库独立出现在源代码管理：

```bash
node scripts/make-workspace.mjs          # 或 npm run workspace
```

生成 `E:\SillyTavern\st-plugins.code-workspace`（14 个根目录：总目录 + 知识库 + 8 个 third-party 扩展 + 2 个用户目录扩展 + 2 个后端 server plugin）。**第一个根目录固定是总目录**，因为 `AGENTS.md`、`.clinerules/`、`.cline/rules/`、`.roo/mcp.json` 都在那里——Cline / Roo 的规则与 MCP 配置按工作区根目录读取，这样才不会被切掉。新增/删除插件项目后重跑即可。

## 拆分参考文档（原始转储 → 知识库条目）

如果手上只有"一整坨"参考转储（例如从酒馆助手导出的 `@types.txt`、`/help` 导出的命令清单），用这个脚本按语义拆分：

```bash
node scripts/split-raw-reference.mjs                 # 从默认下载目录读取
node scripts/split-raw-reference.mjs --source <目录>  # 指定原始文件目录
node scripts/split-raw-reference.mjs --dry-run        # 只报告将生成什么
node scripts/split-raw-reference.mjs --archive        # 同时把原件复制到 inbox/imported/
```

处理三类输入：`@types.txt`（TS 声明，按符号名归域，大块内部再按成员切一层）、`slash_command.txt`（命令行清单，按首字母分桶）、`SillyTavern_Macros.txt`（宏清单，按用途分组）。每个条目都会成为独立可检索的小节，并生成对应的 `*-index` 速查索引。脚本是幂等的，可反复重跑覆盖生成结果。

## 维护

- 改了 `knowledge/` 下的文件后：Agent 可调 `kb_reindex`，人工可跑 `node scripts/build-index.mjs`。
- 服务每次启动都会重新扫描 `knowledge/`，所以**新文件不需要额外注册**。
- 提交前建议跑一次 `node scripts/selftest.mjs`，它同时验证了写入路径与索引一致性。

## 设计取舍

- **不引入向量模型**：当前语料是结构化规范文档，BM25 + 标题/标签加权已足够，且启动零成本、可离线、结果可解释。
- **不依赖 SDK 包**：手写 JSON-RPC 分发，避免在工作区里多一套 `node_modules`；协议版本支持 `2025-06-18` / `2025-03-26` / `2024-11-05`。
- **写入走 `knowledge/shared/`**：Agent 沉淀的结论与人工整理的规范分开存放，便于回溯与清理。
