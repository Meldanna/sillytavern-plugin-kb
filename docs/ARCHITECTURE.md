# st-plugin-kb —— 项目结构与运行说明

> 交付/学习用途的自包含文档。任何 AI 或开发者读完这一篇，就能理解这个项目是什么、怎么跑、怎么扩展。
> 项目根目录：`E:\MCP\st-plugin-kb`（属于工作区 `E:\SillyTavern` 的一部分）

## 0. 一句话定位

**给"写 SillyTavern 插件/脚本的 AI"用的本地开发知识库**：知识本体是 Markdown（53 篇 / 1057 个检索切块），通过一个**零第三方依赖的 MCP(stdio) 服务**对外提供 6 个查询/写入工具，检索用 BM25（中英混排可用）。

- **服务对象**：编码 Agent（Cline、Roo Code 等 MCP 客户端）与开发者本人。
- **不参与酒馆运行时**：它不在 `public/` 或 `plugins/` 里，不是酒馆扩展、不是 server plugin，酒馆启动时不会加载它、也不会读它。
- **使命**（详见 `knowledge/MISSION.md`）：让工作区里每一次插件开发都建立在经过核实的既有知识之上，而不是凭记忆猜 API、重复踩坑、重复造轮子。

## 1. 目录结构（实测）

```text
st-plugin-kb/                        78 个文件，约 1.02 MB（含留档原件与索引快照）
├─ server.js                     113 行   MCP stdio 入口：读 stdin 分帧 → 分发 → 写 stdout；也支持 --doctor / --help
├─ package.json                   20 行   只有 scripts，无 dependencies（engines: node >= 20）
├─ README.md                     156 行   面向人的项目说明（用法、约定、维护）
├─ mcp.json.snippet.json          11 行   手动注册 MCP 用的配置片段
├─ docs/
│  ├─ ARCHITECTURE.md                     ← 项目结构与运行（叙述性说明，给其它 AI / 接手的人看）
│  └─ SNIPPETS.md                         ← ★ 一键粘贴专用区（配置片段 / 提示词 / 命令 / 协议报文 / 规则样板）
├─ src/                                  核心库（纯 ESM，无依赖）
│  ├─ mcp.js                     256 行   JSON-RPC 2.0 / MCP 协议：握手、tools/list、tools/call、6 个工具定义与实现
│  ├─ kb.js                      286 行   KnowledgeBase 类：扫描 md → 建索引 → 检索/读取/列表/统计/写入
│  ├─ bm25.js                    109 行   分词（CJK 二元组 + 英文词边界）与 BM25 打分器
│  ├─ indexer.js                 130 行   frontmatter 解析、按标题切块、命中片段抽取
│  ├─ importers.js               255 行   外部格式 → Markdown（md/txt/json/html/docx）
│  └─ zip.js                      78 行   极简 ZIP 读取器（stored/deflate），供 docx/.zip 导入使用
├─ scripts/                              可执行工具（都支持重复执行/幂等）
│  ├─ call.mjs                   152 行   命令行查库：调一次工具或按 JSONL 批量发请求（npm run query）
│  ├─ build-index.mjs             30 行   重建索引并落盘 index/kb-index.json
│  ├─ import.mjs                 241 行   批量导入 inbox/：转换→去重(sha256)→写 knowledge/imported/→归档原件→重建索引
│  ├─ split-raw-reference.mjs    637 行   把"整坨参考转储"按语义拆成知识文档（见第 7 节）
│  ├─ make-workspace.mjs         112 行   生成 VS Code 多根工作区文件（项目组）
│  ├─ register-mcp.mjs           128 行   幂等注册 MCP 到 .roo/mcp.json 或 Cline 配置（含自动备份）
│  └─ selftest.mjs               183 行   端到端自检：真实 MCP 协议握手→工具→检索→写入→清理
├─ knowledge/                            知识本体（实测 54 篇 Markdown / 407 KB / 1077 切块）
│  ├─ MISSION.md                         使命与使用契约（第 10 节列出全部分类）
│  ├─ 00-overview.md … 25-workspace-map.md   插件开发规范与实战（16 篇）
│  ├─ helper/                            酒馆助手（JS-Slash-Runner）全局 API 声明（19 篇）
│  ├─ reference/                         ST 核心斜杠命令 + 宏（16 篇）
│  └─ shared/                            历次排查沉淀的结论（Agent 用 kb_add 写入处）
├─ index/
│  └─ kb-index.json             7458 行   索引快照（可读，仅供人工核对；服务启动时会内存重建，不依赖它）
└─ inbox/                                投递区：把文档丢进来后跑 scripts/import.mjs
   ├─ README.md                          支持的格式与参数说明
   └─ imported/                          已导入原件的留档（@types.txt 185 KB / slash_command.txt 79 KB / SillyTavern_Macros.txt 15 KB）
```

源代码合计约 **2823 行 JS**（`src/` 1227 + `scripts/` 1483 + `server.js` 113）。

## 2. 运行

### 前置条件

- **Node.js ≥ 20**（用到 `node:` 前缀 ESM、`structuredClone`、`fs.rmSync` 等）。
- **不需要 `npm install`**：整个项目零第三方依赖，不联网。这是刻意的设计（见第 10 节）。

### 命令一览

| 目的 | 命令 |
| --- | --- |
| 以 MCP 服务运行（供客户端拉起） | `node server.js` 或 `npm start` |
| 自检：打印文档数/切块数/分类分布 | `node server.js --doctor` 或 `npm run doctor` |
| 重建索引 | `node scripts/build-index.mjs` 或 `npm run build-index` |
| 批量导入 inbox 里的文档 | `node scripts/import.mjs` 或 `npm run import` |
| 拆分原始参考转储（@types / 斜杠命令 / 宏） | `node scripts/split-raw-reference.mjs` 或 `npm run split-raw` |
| 生成 VS Code 多根工作区 | `node scripts/make-workspace.mjs` 或 `npm run workspace` |
| 注册 MCP 到客户端 | `node scripts/register-mcp.mjs [--target roo|cline] [--print]` 或 `npm run register` |
| 端到端自检（协议+检索+写入+清理） | `node scripts/selftest.mjs` 或 `npm run selftest` |
| 命令行查库（不走 MCP 客户端） | `node scripts/call.mjs kb_stats`；或 `npm run query -- kb_search query="manifest 字段"`；JSONL 批量：`node scripts/call.mjs --jsonl requests.jsonl` |

### 三种使用方式

1. **MCP 服务（主用法）**：客户端（Cline / Roo）在配置里声明 `command: node, args: [<绝对路径>/server.js]`，由它按需拉起进程、通过 stdin/stdout 交换 JSON-RPC。注册命令：`node scripts/register-mcp.mjs --target cline`（会写入 `~/.cline/data/settings/cline_mcp_settings.json` 与 VS Code globalStorage 两处，改前自动备份）。
2. **命令行查库**：任何脚本/终端都能直接跑 `server.js` 并用换行分帧发 JSON-RPC（`selftest.mjs` 就是范例）。
3. **纯文件使用**：不跑服务也行——`knowledge/*.md` 本身就是给人/给 AI 读的 Markdown，任何 Agent 直接读文件即可。

### 关键约定（改代码时别破坏）

- **stdout 只能出现 JSON-RPC 帧**，所有日志与提示一律写 stderr（否则客户端解析失败）。
- 输入按**换行分帧**：每行一个完整 JSON 对象；进程对 `\r\n`、粘包、粘行都做了处理。
- 启动时会在内存里重建索引（毫秒级），因此**新增 md 文件不需要任何注册动作**。
- 路径解析基于 `server.js` 自身位置（`import.meta.url`），所以**在任意工作目录下启动都指向同一个知识库**。

### 环境变量

| 变量 | 作用 |
| --- | --- |
| `ST_KB_ROOT` | 覆盖知识库根目录（默认 `<项目>/knowledge`），便于把同一份代码指向另一套语料 |

## 3. MCP 接口

- **传输**：stdio；**协议**：JSON-RPC 2.0，MCP 工具能力（`capabilities.tools`）。
- **协议版本协商**：客户端请求的版本若在 `2025-06-18` / `2025-03-26` / `2024-11-05` 之内则原样返回，否则回落到 `2024-11-05`。
- **`initialize` 返回**：`serverInfo`（name=`st-plugin-kb`, version=1.0.0）+ `instructions` —— 后者会把**使命与工作习惯**直接塞给客户端（"开工前先 kb_get MISSION / kb_search，完成后 kb_add 沉淀"）。这是让新会话"一开场就知道有这个库"的关键机制之一。

### 工具定义

| 工具 | 参数 | 返回 |
| --- | --- | --- |
| `kb_search` | `query`(必填)、`limit`(默认 5，上限 20)、`category`、`tags[]`、`docId` | 文本：Top-N 命中，每条含标题 / 小节 / `id` / category / tags / score / 命中片段 |
| `kb_get` | `id`(必填) | 文本：元信息头部 + 全文正文（已剥掉重复的 frontmatter，省 token） |
| `kb_list` | `category`、`tag` | 文本：文档清单（id｜标题｜分类｜标签｜摘要） |
| `kb_add` | `title`、`content`(必填)、`category`、`tags[]`、`id`、`summary`、`append` | 写入 `knowledge/shared/*.md` 并重建索引 |
| `kb_reindex` | — | 重建索引，返回文档数/切块数 |
| `kb_stats` | — | JSON：root、builtAt、documents、chunks、totalBytes、categories |

其他协议细节：`ping`、`tools/list`、`resources/list`（返回空）、`prompts/list`（返回空）、`notifications/*` 无需响应；**未知方法 → `-32601`**；**未知工具 → `-32602`**；**工具内部失败 → `result.isError`**（而非 JSON-RPC error，符合 MCP 约定）。

## 4. 数据流与内部实现

### 读路径（检索）

```text
knowledge/**/*.md
   │  KB.rebuild()（服务启动 / kb_reindex / kb_add 后触发）
   ├─ indexer.parseFrontmatter   → title / category / tags / summary / sources + 正文
   ├─ indexer.splitChunks        → 按 ## / ### / #### 切块（**代码围栏内的 # 不切**）
   ├─ bm25.tokenize              → 词条：CJK 连续串→二元组（长度≤4 时额外保留整词）；拉丁串长度≥2 或含数字
   └─ bm25.createScorer          → BM25：k1=1.2、b=0.75，idf = ln(1 + (N-df+0.5)/(df+0.5))
                                  查询词频做 1+ln(qtf) 加权
        ↓
   kb.search(query, opts)
   ├─ 映射到 doc 的 category / tags / docId 过滤
   ├─ 加权：**标题命中 +2.2/词条**，标题未中但文档标题/标签命中 +0.5/词条
   │        （ASCII 词条按"词边界"匹配 → 避免 char 命中 charData/Character）
   ├─ indexer.extractSnippet  → 以命中行附近 ±3 行、上限 900 字符截取片段
   └─ 排序取 Top-N（默认 5）
```

要点：**每个符号/命令/宏都是自己的标题小节**，所以检索能精确落到单个 API；标题加权让"按符号名查找"这类最常见的开发动作命中率最高。

### 写路径

```text
kb_add(title, content, …)
   ├─ 生成/追加 knowledge/shared/<slug>.md（自动补 frontmatter，append 模式可续写）
   └─ 立即 rebuild 索引 → 同一会话后续检索即可命中新知识
```

### 其他实现细节

- **零依赖**：不装 `@modelcontextprotocol/sdk`，手写 JSON-RPC 分发（约 100 行），换来"离线、可审计、无 node_modules"。
- **索引不落盘也能跑**：`index/kb-index.json` 只是快照，供人核对；服务启动总是重新扫描目录。
- **ZIP 读取器**（`src/zip.js`）：自己解析 EOCD → 中央目录 → 本地头，`stored(0)` 与 `deflate(8)` 都支持；显式不支持 zip64 与加密包，并给出明确报错。
- **docx**：解包取 `word/document.xml`，`w:pStyle=HeadingN`/`标题N`/`outlineLvl` → `#` 标题，`<w:tab/>`/`<w:br/>` 与 XML 实体正确还原。

## 5. 知识文档约定

每篇 `knowledge/**/*.md` 头部是简单 frontmatter（只支持 `key: value` 行）：

```markdown
---
title: 前端扩展 manifest.json 规范
category: frontend
tags: [manifest, extension, loading_order]
summary: 一句话摘要（会出现在 kb_list 与 kb_get 头部）
sources: [SillyTavern/public/scripts/extensions.js]
---

# 正文标题

## 小节标题（= 一个独立检索块，标题写法决定能不能被搜到）
```

| 字段 | 是否必需 | 说明 |
| --- | --- | --- |
| `title` | 建议 | 正则缺失时回退到正文首个 `#` 标题，再回退文件名 |
| `category` | 建议 | 自由字符串，当前取值见第 6 节 |
| `tags` | 可选 | 逗号分隔，用于 `kb_search(tags=[…])` / `kb_list(tag=…)` 过滤 |
| `summary` | 可选 | 列表页摘要；导入器会从正文首段自动生成 |
| `sources` | **强烈建议** | 真实文件路径（或"实测结论 + 验证环境"）；这是"结论可核对"的凭证 |

写作规范（`MISSION.md` 的"质量门槛"）：来源可核对、结论可执行（给签名/写法而不是"要注意"）、与代码一致（冲突改库而非改代码）、**标题即问题**（写"是什么/怎么用"，别写"概述"）。

## 6. 知识地图（54 篇 · 2026-09-14 实测）

> 篇数会随 `kb_add` 增长，**以 `node server.js --doctor` 实时输出为准**；下表用于说明"有哪些分类、各自装什么"。

| category | 篇数 | 覆盖内容 / id 命名 |
| --- | --- | --- |
| `meta` | 1 | `MISSION` —— 使命、契约、质量门槛、UI 核对方法 |
| `reference` | 17 | `00-overview` + ST 核心斜杠命令 `reference/slash-commands-*`（索引 + 6 个首字母分桶，共 299 条）+ ST 核心宏 `reference/macros-*`（索引 + 8 个用途分类，共 104 个） |
| `frontend` | 9 | `10-frontend-manifest`、`11-frontend-lifecycle`、`12-st-context`、`13-events`、`14-settings-persistence`、`15-slash-commands`、`16-ui-i18n`、`17-generation-worldinfo`、`18-mobile-positioning` |
| `helper` | 19 | `helper/01-index` + `helper/02`–`helper/19`：酒馆助手（JS-Slash-Runner）**258 个全局 API 符号**，按 18 个功能域拆分（音频/角色/聊天/生成/注入/世界书/人设/预设/变量/事件/正则/脚本iframe/扩展管理/斜杠杂项/全局对象/Window/模板全局/事件目录） |
| `server` | 1 | `20-server-plugin` —— 后端插件加载契约、路由、用户目录、CSRF |
| `build` | 1 | `21-build-toolchain` —— vite / webpack / esbuild 范式与 external 约定 |
| `workflow` | 2 | `22-local-dev-loop`（刷新 vs 重启）、`23-debugging` |
| `security` | 1 | `24-security-review` —— 审查顺序与高危清单 |
| `workspace` | 1 | `25-workspace-map` —— 本工作区各插件项目与构建命令 |
| `shared` | 2 | `shared/README.md`（沉淀区约定）+ Agent 实际写入的结论。实例：`shared/酒馆助手脚本实战-iframe-运行环境-按聊天持久化-浮层拖拽定位.md` —— 由另一个会话的 AI 在改造 `pet-npc` 工程后用 `kb_add` 沉淀，记录了 8 条硬结论（iframe 注入面、`content` 不能含 `</script>`、`CHAT_CHANGED` 真实值为 `'chat_id_changed'`、不存在的 API 名、按聊天分存储的降级写法、挂顶层 body 的清理、移动端拖拽正误、离线 mock 冒烟测试法） |

## 7. 维护脚本各干什么

| 脚本 | 解决的问题 | 幂等性 |
| --- | --- | --- |
| `build-index.mjs` | 手工编辑 md 后刷新 `index/kb-index.json` 与内存索引 | 是（全量重建） |
| `import.mjs` | 把外部文档批量收进库：支持 `.md/.markdown/.txt/.json/.html/.htm/.docx/.zip`（zip 按条目逐个导入，可含子目录/中文名） | 是（sha256 去重，`--force` 强导；原件归档到 `inbox/imported/`） |
| `split-raw-reference.mjs` | 把"一整坨"参考转储拆成结构化知识：`@types.txt`（按符号名归域，超大块内部再按成员切成 `###`）、`slash_command.txt`（按首字母分桶）、`SillyTavern_Macros.txt`（按用途分组）；同时生成 `*-index` 速查索引 | 是（覆盖生成） |
| `make-workspace.mjs` | 生成 VS Code 多根工作区文件（`E:\SillyTavern\st-plugins.code-workspace`），把总目录/知识库/各插件仓库编组；总目录固定第一个根（保证规则与 MCP 生效范围） | 是 |
| `register-mcp.mjs` | 把本服务注册进客户端配置（`.roo/mcp.json` / Cline 两处），写入前自动备份 | 是（只覆盖自己那一项） |
| `selftest.mjs` | 冒烟测试：真实 stdio 协议跑一遍并断言 | 是（临时文档自动清理） |

## 8. 验证方式（怎么确认它没坏）

```bash
node server.js --doctor      # 期望：扫到全部文档（当前实测 documents=54 / chunks=1077）
node scripts/selftest.mjs    # 期望：全部自检项通过（19 项）
```

`selftest.mjs` 覆盖的断言（按源码为 **19 项**，全部通过才算绿）：

| # | 断言 |
| --- | --- |
| 1 | `initialize` 协议版本协商（请求 `2025-06-18` → 原样返回） |
| 2 | `initialize` 返回 `serverInfo.name = st-plugin-kb` |
| 3 | `tools/list` 返回 **6 个**工具 |
| 4–9 | 六个工具逐个点名存在：`kb_search` / `kb_get` / `kb_list` / `kb_add` / `kb_reindex` / `kb_stats` |
| 10 | `kb_stats` 文档数 > 0 |
| 11 | `kb_list(category=frontend)` 能筛出 `10-frontend-manifest` |
| 12 | `kb_search` 调用不报错 |
| 13 | `kb_search("前端扩展 manifest 字段 js css loading_order")` 命中 `10-frontend-manifest` |
| 14 | `kb_search("server plugin 注册 /api/plugins 路由 init")` 命中 `20-server-plugin`（中英混排） |
| 15 | `kb_get("10-frontend-manifest")` 能取回全文（含 `manifest.json`） |
| 16 | `kb_add` 写入成功 |
| 17 | 新写入的记录可被 `kb_search` 检索到 |
| 18 | `kb_reindex` 可手动重建索引 |
| 19 | 未知工具会被拒绝 |

> 另有一批**不在 selftest 内**的验证：导入器的 md/txt/json/html/docx/zip 六种格式都是用真实文件手工跑通的（含中文文件名、zip 子目录、故意放入不支持的扩展名确认被跳过）；`docx` 的测试包是用自写的 zip 写入器生成的真 deflate 包。这些属于一次性验证，不进每次自检。

一次真实检索的样子（可直接照抄验证）：

```text
kb_search("跟随小窗 getBoundingClientRect offsetWidth 混用 错位")
→ [1] 移动端浮层定位与触屏事件（插件 UI 实战总结） / 三、跟随小窗（如地理 Info Box）
     id: 18-mobile-positioning  category: frontend  tags: mobile, css, positioning, touch…
     score: 32.31  ← 片段包含"混用是移动端错位的第一大杀手"那一行
```

## 9. 扩展指南

**加知识**（三种，任选）：
1. Agent 侧：`kb_add(title, content, category?, tags?)` → 落到 `knowledge/shared/<slug>.md`。
2. 人工：直接在 `knowledge/**` 新建 md（见第 5 节），跑 `node scripts/build-index.mjs`（或不跑——服务启动会自己扫）。
3. 批量：文件丢进 `inbox/` → `node scripts/import.mjs`（自动转格式、去重、归档、重建索引）。

**加一个 MCP 工具**：`src/mcp.js` 里 ① 往 `TOOLS` 数组加定义（name/description/inputSchema）；② 在 `callTool()` 的 switch 里实现分支，返回 `textResult(...)` 或 `errorResult(...)`；③ 在 `scripts/selftest.mjs` 加一条断言。

**调检索**：分词在 `src/bm25.js` 的 `tokenize()`；打分器在同一文件的 `createScorer()`（k1/b）；标题与元信息加权、过滤逻辑在 `src/kb.js` 的 `search()`（`termHit()` 决定 ASCII 词是否按词边界匹配）。

**加导入格式**：`src/importers.js` 里 ① `SUPPORTED_EXTENSIONS` 加扩展名；② `convertBuffer()` 加分支（入参是 Buffer，返回值 `{format,title,body,meta}`）；③ 若是压缩包，加到 `ARCHIVE_EXTENSIONS` 并在 `import.mjs` 里处理分包。

**改完必做**：`node scripts/selftest.mjs`（协议与检索）+ `node scripts/build-index.mjs`（刷新快照）。

## 10. 设计取舍（为什么这么做）

| 取舍 | 理由 |
| --- | --- |
| **零第三方依赖** | 不装 MCP SDK、不装分词库：离线可用、无 `node_modules`、代码可审计、换机器只拷目录 |
| **BM25 而非向量检索** | 语料是结构化规范/符号参考，关键词与符号名就是最短路径；BM25 无模型加载、启动零成本、结果可解释、可离线 |
| **中文二元组切分** | 无需词典即可中英混排检索；短词（≤4 字）额外保留整词，缓解"世界书/预设"被拆散 |
| **标题加权 2.2 / 词边界匹配** | 本库最大价值是"按符号名精确定位"；`char` 不该命中 `charData`，`{{char}}` 该命中 |
| **每个符号/命令/宏独立成节** | 185 KB 的参考转储若整篇一个块，检索与片段都不可用 |
| **索引内存构建、不依赖落盘** | 53 篇 1057 块的构建是毫秒级；落盘快照只为人工核对，避免"索引与文档不一致" |
| **写入只允许 `knowledge/shared/`** | Agent 沉淀不会误改人工整理的规范文档；要改规范由人/AI 显式编辑对应 md |
| **stdout 严格只走协议** | stdio 传输下任何多余输出都会破坏客户端解析 |
| **脚本全部幂等** | 可反复重跑；生成物可覆盖；导入有 sha256 去重；注册只覆盖自己那一项（改前备份） |

## 11. 已知限制与边界

- **无语义检索**：近义表述依赖 `tags` 与标题写法；查询尽量用符号名/命令名/字段名，或加"坑""注意""失效"等标签词。
- **聚合文档竞争**：`helper/16-global-sillytavern`、`helper/18-template-globals` 是命名空间/聚合声明（把许多 API 又列了一遍），按具体接口查询时偶尔会抢到 Top1；`helper/01-index` 里已写明"查具体接口优先看对应功能域文档"。
- **zip 支持范围**：仅标准 zip 的 `stored`/`deflate`，不支持 zip64 与加密包；损坏包会给出"找不到 ZIP 结束记录"的明确报错。
- **docx 支持范围**：只解析 `word/document.xml`（正文与标题层级），不含批注、页眉页脚、复杂表格结构。
- **frontmatter 解析很简陋**：只认 `key: value` 单行，不支持嵌套/多行值（够用即可，故意不引入 YAML 依赖）。
- **检索上限**：`limit` 最多 20，无分页；需要更多请用 `category`/`tags`/`docId` 缩小范围。
- **单机单用户**：stdio 由客户端拉起，**本身没有鉴权**，不要把它包成网络服务暴露出去。
- **知识时效**：结论对应的是某个版本（当前仓库酒馆 v1.18.0）。每条知识的 `sources` 可回溯；上游行为变化时应改库而不是继续沿用旧结论。

## 12. 把它交给另一个 AI（本节的用途）

**可直接复制粘贴的内容全部集中在 `docs/SNIPPETS.md`**（专用区），本文件不重复，避免两处内容各自过期。其中包含：

- **A** MCP 客户端配置片段（JSON）+ 三处配置文件路径 + 自动注册命令
- **B** 丢给另一个 AI 的**工作契约提示词**（支持 MCP 与不支持 MCP 两种）
- **C** 命令行查库命令（`scripts/call.mjs`，含 JSONL 批量与纯重定向两种实测写法）
- **D** 手写 **JSON-RPC 报文**最小示例（initialize / tools/list / tools/call）与预期响应
- **E** 把这套"开工即知"装到**别的项目**的规则样板（`AGENTS.md` / `.clinerules/` / `.cline/rules/` / `.roo/rules/`）
- **F** VS Code 多根工作区（项目组）配置片段
- **G** 实测有效的检索查询写法对照表
- **H** 维护命令速查
- **I** 片段有效性自检顺序

一句话版契约（完整版在 SNIPPETS 的 B 节）：

> 先 `kb_get MISSION` 或 `kb_list` 建立地图 → 用 `kb_search` 查本次要用的 API/事件/字段/构建方式 → 与源码冲突时以源码为准并回头改库 → 完成后把可复用结论 `kb_add` 写回。

**如果对方要"照着这个项目再做一个同类知识库"**：可复用的部分分别是——`src/bm25.js`（中英混排检索）、`src/indexer.js`（frontmatter+切块+片段）、`src/kb.js`（知识库门面）、`src/mcp.js`（零依赖 MCP 协议层）、`src/importers.js`+`src/zip.js`（格式导入）、`scripts/split-raw-reference.mjs`（大批参考转储的拆分思路：**按符号归域 + 大块内部再按成员切一层 + 自动生成索引**）。

