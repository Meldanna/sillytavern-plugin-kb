# 一键粘贴专用区（SNIPPETS）

本文件是**所有"可直接复制粘贴"内容的唯一来源**：配置片段、提示词、命令、协议报文、规则样板。
叙述性说明请见 `docs/ARCHITECTURE.md`；本文件里的每一段都**在本机实测过**（测法写在每节末尾）。

> 约定：以后新增可粘贴片段，一律加到本文件，不要散落在其它文档里（避免两处内容各自过期）。

## A. 把本知识库接进 MCP 客户端

### A1. 配置片段（通用，Cline / Roo / 其它 MCP 客户端）

```json
{
  "mcpServers": {
    "st-plugin-kb": {
      "command": "node",
      "args": ["E:\\MCP\\st-plugin-kb\\server.js"],
      "disabled": false
    }
  }
}
```

- 路径必须是**绝对路径**；`command` 写 `node` 需要 `node` 在 PATH，若不确定就换成 `node.exe` 的绝对路径（换 Node 版本后要同步改）。
- 如果客户端配置里已有别的服务，请把这个对象**合并**进它的 `mcpServers`，不要整文件替换。

### A2. 三处常见配置文件路径（Windows）

| 客户端/位置 | 路径 |
| --- | --- |
| Roo（工作区级） | `E:\SillyTavern\.roo\mcp.json` |
| Cline（新版） | `%USERPROFILE%\.cline\data\settings\cline_mcp_settings.json` |
| Cline（旧版 VS Code 扩展） | `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` |

### A3. 用脚本自动注册（推荐，幂等 + 自动备份）

```powershell
cd E:\MCP\st-plugin-kb
node scripts/register-mcp.mjs                 # 写入工作区 .roo/mcp.json
node scripts/register-mcp.mjs --target cline  # 写入上面两处 Cline 配置
node scripts/register-mcp.mjs --print         # 只看会写什么
```

> 实测：`--target cline` 写入两处后，两处都能解析出 `st-plugin-kb`，且 `args[0]` 路径存在。

## B. 丢给另一个 AI 的工作契约（直接粘贴到对话里）

```text
你有一个本地知识库 st-plugin-kb，工具：kb_search / kb_get / kb_list / kb_add / kb_reindex / kb_stats。

使命：让每次酒馆插件/脚本开发都建立在经过核实的既有知识上，而不是凭记忆猜 API、重复踩坑、重复造轮子。

规矩：
1) 动手前先 kb_get MISSION（或用 kb_list 建立地图），再用 kb_search 查本次要用的 API 签名、事件名、manifest 字段、构建方式与历史踩坑；
2) 结论与仓库源码冲突时以源码为准，并回头修正知识库；
3) 任务完成后把可复用结论用 kb_add 写回 knowledge/shared/。

覆盖范围：插件开发规范（id 00–25）、移动端 UI（18-mobile-positioning）、酒馆助手（JS-Slash-Runner）全局 API（helper/*）、
ST 核心斜杠命令与宏（reference/*）。本库只服务开发，与酒馆运行时无关。
```

不支持 MCP 的 AI，把这段换成：

```text
请先读 E:\MCP\st-plugin-kb\docs\ARCHITECTURE.md（项目结构与运行）与
E:\MCP\st-plugin-kb\knowledge\MISSION.md（使命与使用契约），
再按 knowledge/ 下的目录与 frontmatter（title / summary / tags）按需读取：
改前端扩展读 10–18，写酒馆助手脚本读 helper/*，查命令/宏读 reference/*。
```

## C. 命令行查库（不经过 MCP 客户端）

```powershell
cd E:\MCP\st-plugin-kb

node scripts/call.mjs kb_stats
node scripts/call.mjs kb_search query="manifest 字段" limit=3
node scripts/call.mjs kb_get id=10-frontend-manifest
node scripts/call.mjs kb_search query="事件订阅" tags=["helper"] out=C:\temp\result.txt
```

参数规则：`key=value`；值会先尝试按 JSON 解析（失败当字符串），所以数组/数字可直接写；`out=` 把结果写文件。

批量请求（JSONL 文件，每行一条 JSON-RPC 消息）：

```powershell
node scripts/call.mjs --jsonl requests.jsonl out=C:\temp\batch-result.txt
```

> 实测：`kb_stats` 返回 JSON；`kb_search`/`kb_get` 返回文本且退出码 0；`--jsonl` 按请求条数收齐响应后正常退出（不超时）。

### C2. 完全不用辅助脚本（纯协议，验证过）

把请求写进文件（每行一条 JSON），用重定向喂给服务：

```powershell
cmd /c "node E:\MCP\st-plugin-kb\server.js < %TEMP%\requests.jsonl > %TEMP%\responses.jsonl"
```

## D. 手写 JSON-RPC 报文（协议最小示例）

把下面三行存成 `requests.jsonl`（**每行一条**，换行分帧）：

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"manual","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"kb_search","arguments":{"query":"manifest 字段","limit":3}}}
```

运行：

```powershell
cmd /c "node E:\MCP\st-plugin-kb\server.js < requests.jsonl > responses.jsonl"
```

预期：`responses.jsonl` 有 3 行，`id:1` 含 `protocolVersion` / `capabilities` / `serverInfo` / `instructions`，`id:2` 含 `tools` 数组，`id:3` 含 `content`。

> 实测：用 `id:1`（initialize）+ `id:3`（tools/call kb_stats）两条请求运行，返回 2 行，键分别为 `protocolVersion,capabilities,serverInfo,instructions` 与 `content`。

## E. 把这套"开工即知"装到别的项目

一个工作区要"新窗口的 AI 一开场就知道有知识库"，需要三处（Cline 读 ①/②，Roo 读 ①/③；`AGENTS.md` 两边都读）：

### E1. `AGENTS.md`（放项目根，两套工具都自动加载）

```markdown
# 工作区说明

本工作区有一个共享开发知识库：`st-plugin-kb`（本地 MCP 服务 + Markdown 知识）。
开工前先 `kb_get MISSION` 或 `kb_list` 建立地图，再用 `kb_search` 查本次要用的 API/事件/字段；
结论与源码冲突以源码为准；任务完成后用 `kb_add` 把可复用结论写回。

- 知识库位置：`E:\MCP\st-plugin-kb`（MCP：`node .../server.js`）
- 覆盖范围：插件开发规范（id `00`–`25`）、移动端 UI（`18`）、酒馆助手 API（`helper/*`）、命令与宏（`reference/*`）
- 约束：不擅自 commit/push；不读写用户数据目录；不混用两套 API 体系
```

### E2. `.clinerules/10-plugin-dev.md`（Cline，支持 `paths:` 条件触发）

```markdown
---
paths:
  - "SillyTavern/public/scripts/extensions/**"
  - "SillyTavern/plugins/**"
  - "st-plugin-kb/**"
---

# 插件开发流程

1. **查库**：`kb_search` 查本次要用的 API / 事件 / 字段（不确定是否踩过坑时加"坑""注意""失效"）。
2. **定位**：确认改的是哪一份目录（同名扩展可能有两份）。
3. **改**：沿用该项目既有约定，不引入新的构建体系。
4. **验证**：前端→刷新页面；`src/`→先 build；后端→重启 Node 并看启动日志。
5. **沉淀**：可复用结论用 `kb_add` 写回；修正旧结论直接改对应 md 再 `kb_reindex`。
```

### E3. `.cline/rules/10-plugin-dev.md` 与 `.roo/rules/10-plugin-dev.md`

- `.cline/rules/` 是**新版 Cline** 的项目规则目录（官方 Config 页写法），内容与 `.clinerules/` 那份保持一致即可（两处都放，覆盖不同版本）。
- `.roo/rules/` 是 **Roo Code** 的目录（`%USERPROFILE%\.roo\rules\` 为全局版）；Roo 无 `paths:` 条件机制，因此这份要写得短、且默认常驻。
- Roo 还会默认加载根目录 `AGENTS.md`（可关：`roo-cline.useAgentRules: false`）。

> 实测：本工作区按上面三处部署后，Cline 的 **Rules 面板**（入口是底部「天平 ⚖」图标）能看到规则与 `AGENTS.md`；MCP 面板能看到 `st-plugin-kb` 与 6 个工具。

## F. VS Code 多根工作区（项目组）片段

```json
{
  "folders": [
    { "name": "🏠 总目录（规则 / MCP / 知识库入口）", "path": "E:\\SillyTavern" },
    { "name": "📚 st-plugin-kb（开发知识库）", "path": "E:\\MCP\\st-plugin-kb" },
    { "name": "🧩 某插件", "path": "E:\\SillyTavern\\SillyTavern\\public\\scripts\\extensions\\third-party\\ST-BaiBai-Book" }
  ],
  "settings": {
    "files.exclude": {
      "SillyTavern/public/scripts/extensions/third-party/ST-BaiBai-Book": true
    },
    "search.exclude": {
      "**/node_modules": true,
      "**/dist": true,
      "SillyTavern/data": true
    },
    "git.autoRepositoryDetection": "subFolders"
  },
  "extensions": {
    "recommendations": ["saoudrizwan.claude-dev", "rooveterinaryinc.roo-cline"]
  }
}
```

要点：

- **第一个根必须是"总目录"**——`AGENTS.md` / `.clinerules/` / `.cline/rules/` / `.roo/mcp.json` 都在那里，规则与 MCP 按工作区根目录生效。
- `files.exclude` 里把"已提升为独立根目录"的路径隐藏掉，避免同一份代码出现两次（模式按各根目录相对路径匹配，所以不会影响插件自己的根）。
- 保存为 `*.code-workspace`，用 `文件 → 打开工作区` 打开；之后可从"最近打开"一键切换。

> 实测：本工作区用 `node scripts/make-workspace.mjs` 生成 `st-plugins.code-workspace`（14 个根），`JSON.parse` 通过且 14 个路径全部存在。

## G. 检索套路（实测有效的查询写法）

| 目标 | 查询示例 | 命中 |
| --- | --- | --- |
| 按符号名找 API | `getChatMessages 读取并修改楼层消息` | `helper/04-chat-messages` |
| 按签名猜语法 | `setExtensionPrompt 注入 depth 位置` | `17-generation-worldinfo` |
| 找某个命令 | `/audioselect 选择并播放音频` | `reference/slash-commands-a-c` |
| 找某个宏 | `{{getvar}} {{setvar}} 变量宏` | `reference/macros-variables` |
| 中英混排 | `server plugin 注册 /api/plugins 路由 init` | `20-server-plugin` |
| 查"改完要不要重启" | `改了没生效 刷新 重启` | `22-local-dev-loop` |
| 查移动端问题 | `跟随小窗 坐标 混用 错位` | `18-mobile-positioning` |
| 缩小范围 | `category=helper`、`tags=["macros"]`、`docId=13-events` | — |

经验：优先用**符号名/命令名/字段名**（库里都是独立标题小节）；想找坑就带"坑/注意/失效/兼容/错位"这类词；实在找不到就 `kb_list` 看地图。

## H. 维护命令速查

```powershell
cd E:\MCP\st-plugin-kb

node server.js --doctor            # 文档数/切块数/分类分布（npm run doctor）
node scripts/build-index.mjs       # 手工改了 md 后重建索引（npm run build-index）
node scripts/import.mjs            # 批量导入 inbox/ 里的文档（npm run import）
node scripts/split-raw-reference.mjs   # 拆分原始参考转储（npm run split-raw）
node scripts/make-workspace.mjs    # 重新生成多根工作区文件（npm run workspace）
node scripts/register-mcp.mjs      # 重新注册 MCP（npm run register）
node scripts/selftest.mjs          # 端到端自检（npm run selftest）
node scripts/call.mjs kb_stats     # 命令行查库（npm run query -- kb_stats）
```

## I. 片段有效性自检（怀疑"粘贴的东西失效了"时按顺序跑）


1. `node server.js --doctor` —— 能不能扫到文档（路径/权限问题在这一步暴露）。
2. `node scripts/selftest.mjs` —— 协议、检索、写入、索引是否全部正常（应为 19 项全绿）。
3. `node scripts/call.mjs kb_stats` —— 命令行链路是否通。
4. 客户端里：**MCP 面板**是否显示 `st-plugin-kb` 且状态正常；**Rules 面板**（Cline 底部天平图标）是否显示规则与 `AGENTS.md`。
5. 新开一个对话问"这个工作区的知识库使命是什么"——答得出三条习惯，说明规则与 MCP instructions 都被加载了。

## J. 多个知识库 / "注册了却看不到"排查

### J1. 本机 MCP 配置的三处位置（Cline 实际读哪份要对齐）

| 谁读 | 路径 |
| --- | --- |
| Roo（工作区级） | `<工作区>\.roo\mcp.json` |
| Cline **旧版**（VS Code globalStorage） | `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json` |
| Cline **新版**（本机实际在用） | `%USERPROFILE%\.cline\data\settings\cline_mcp_settings.json` |

> ⚠️ 实测案例（2026-09-14）：另一个知识库 `E:\MCP\code-connect-kb` 当时只写进了"旧版"那份，**新版那份里没有它** → Cline 的 MCP 面板里看不到 → 表现为"没成功注入"。**只写一处就等于一半概率看不到。**

### J2. 注册任意知识库（不必进它的目录）

```powershell
cd E:\MCP\st-plugin-kb

# 注册另一个知识库（--name 是 mcpServers 里的键名，不要重名）
node scripts/register-mcp.mjs --name code-connect-kb --server E:\MCP\code-connect-kb\server.js --target cline,roo

# 注册本知识库
node scripts/register-mcp.mjs --name st-plugin-kb --server E:\MCP\st-plugin-kb\server.js --target cline,roo

# 只看会写什么
node scripts/register-mcp.mjs --name code-connect-kb --server E:\MCP\code-connect-kb\server.js --target cline --print
```

| 参数 | 作用 |
| --- | --- |
| `--name <id>` | 写入 `mcpServers` 的键名；**默认取脚本所在项目的目录名**（在本项目里跑可省略） |
| `--server <路径>` | 服务脚本绝对路径（默认本项目 `server.js`）；不存在会警告但仍写入 |
| `--target roo\|cline\|roo,cline` | 写哪一处；`cline` 会写上面两处（存在哪个写哪个） |
| `--workspace <路径>` | 指定写哪个工作区的 `.roo/mcp.json`（默认脚本所在项目的上一级） |
| `--print` | 只打印片段，不落盘 |

幂等：只覆盖同名那一项，其它 MCP 服务不动；写入前自动备份为 `*.bak-<时间戳>`。

### J3. 三步定位"注册了却看不到"

1. **配置在不在**：读上面三处文件，看 `mcpServers` 里有没有你的 id。
2. **路径对不对**：`args[0]` 指向的 `server.js` 必须真实存在。常见错误：JSON 里**双重转义**（文件里是 `"E:\\\\a\\\\b"`，实际值成了 `E:\\a\\b`），或误写成相对路径。
3. **服务能不能起来**：用 D 节的重定向法喂一条 `initialize`；无响应就看 stderr（缺依赖、Node 版本、路径错误都在这儿现形）。

只差第 1 步的情况，直接跑 J2 的命令补注册，然后**重启 Cline / 重新加载工作区**。

## K. 给 Cline / VS Code 做扩展（粘贴区）

对应知识库条目 `cline/01`–`cline/06`。这里只放能直接复制的东西。

### K1. 侧边栏视图：正确的最小骨架（照抄不会白屏）

```js
// package.json 的 contributes 部分
// "viewsContainers": { "activitybar": [{ "id": "myExt", "title": "My Ext", "icon": "media/activity-icon.svg" }] },
// "views": { "myExt": [{ "type": "webview", "id": "myExt.sidebar", "name": "面板", "visibility": "visible" }] }
// "activationEvents": ["onView:myExt.sidebar"]

const vscode = require('vscode');

function activate(context) {
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('myExt.sidebar', {
            resolveWebviewView(view) {
                view.webview.options = { enableScripts: true };          // ★ 只能写这里，写在 provider 选项里会被静默忽略
                view.webview.onDidReceiveMessage((msg) => onMessage(msg)); // ★ 先挂监听，再赋 html
                view.onDidChangeVisibility(() => { if (view.visible) pushState(); });
                view.webview.html = buildHtml(view.webview);
                pushState();
            }
        }, { webviewOptions: { retainContextWhenHidden: true } })
    );
}
```

webview 侧应对“数据不来”：

```js
let state = null, asked = 0;
function render() {
    const app = document.getElementById('app');
    if (!state) { app.innerHTML = '<div style="padding:12px">正在读取…</div>'; return; }  // ★ 先画壳，永不空白
    app.innerHTML = /* … */ '';
    report();   // ★ 回一条 rendered，宿主落盘，便于事后核对
}
(function poll() { if (state || asked >= 12) return; asked++; post('ready'); setTimeout(poll, 500); })();
window.addEventListener('message', (e) => { if (e.data?.type === 'state') { state = e.data.state; render(); } });
render();
```

### K2. 一次交付的四条命令

```bash
cd E:/你的扩展项目
npx -y @vscode/vsce package                                  # 先改 package.json 的 version（必须递增）
"/e/Microsoft VS Code/bin/code" --install-extension ./*.vsix --force
"/e/Microsoft VS Code/bin/code" --list-extensions --show-versions | grep -i <publisher>
# → Ctrl+Shift+P → Developer: Reload Window（不重载 = 还是旧代码）
```

### K3. 核对“装上去的是不是新代码”

```bash
E=~/.vscode/extensions/<publisher>.<name>-<新版本>
grep -c "<本次新增的标记字符串>" "$E/extension.js"      # 打包没漏文件？
grep -o "onView:<viewId>" "$E/package.json"             # 激活事件对不对？
# 再对已安装的那份跑一遍冒烟测试（入口路径指向 $E/extension.js），见 cline/05
```

### K4. 出了“面板空白 / 点了没反应”怎么查

| 顺序 | 动作 | 判断 |
| --- | --- | --- |
| 1 | `%APPDATA%/Code/logs/<最新时间戳>/window<N>/exthost/exthost.log` grep `doActivateExtension <publisher>.<name>` | 没记录 = 没激活（查 `activationEvents`） |
| 2 | 读 `globalStorage/<publisher>.<name>/diagnostics/sidebar-state.json` | 有 = provider 跑过、数据推了 |
| 3 | 读同目录 `sidebar-rendered.json` | **没有就回到 K1 的 ★ 第一条（enableScripts）** |
| 4 | 命令 `Developer: Open Webview Developer Tools` | Console 里 `acquireVsCodeApi is not defined` = 同上 |
| 5 | `renderer.log` 里的 `UNRESPONSIVE extension host` | 是宿主卡住，不是你的 bug，等/重载 |

### K5. 查库关键词（写给 AI 的检索提示）

| 想查什么 | 推荐 query | 命中条目 |
| --- | --- | --- |
| 侧边栏全白 | `webview 侧边栏 空白 enableScripts acquireVsCodeApi` | `cline/02` |
| 数据不来 / 时序 | `postMessage ready state 时序 重试 永不空白` | `cline/03` |
| 改完没生效 | `vsix 打包 安装 重载 版本号 递增` | `cline/04` |
| 不想开 UI 验证 | `假 vscode 模块 headless dump-dom 渲染回报` | `cline/05` |
| 改 Cline 的 API 配置 | `cline globalState.json secrets.json 冷切换 校验` | `cline/06` |
| 缩小范围 | `category=cline`、`docId=cline/02-webview-view-enablescripts` | — |

