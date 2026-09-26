---
title: Cline 的配置存储与"安全切换"契约
category: cline
tags: [cline, storage, globalstate, secrets, switch, profile, backup]
summary: Cline 4.x 的文件后备存储（globalState.json / secrets.json）、键分类、外部写入为何只在 Cline 未激活时可靠、热切换与冷切换脚本，以及 VS Code globalState 的真实位置。
sources: [cline-api-manager/extension.js, cline-api-manager/clineStore.js, cline-api-manager/apply-profile.js, ~/.cline/data]
---

# Cline 的配置存储与"安全切换"契约

要"给 Cline 存多套 API 配置并一键切换"（`cline-api-manager` 的需求），必须先把它的存储模型摸清。**不改 Cline 本体**是硬约束，所以做的是"读写它的状态"而不是"给它打补丁"。

## 存储是两个 JSON 文件（文件后备存储）

| 文件 | 内容 | 备注 |
| --- | --- | --- |
| `<dataDir>/globalState.json` | 全局状态；API 配置以 `planMode*` / `actMode*` 前缀存放 | 本机实测约 2–3 KB |
| `<dataDir>/secrets.json` | 密钥（`openAiApiKey` / `anthropicApiKey` / `apiKey` …） | 明文，权限 0600（这是 Cline 自己的方式，不要额外制造明文副本） |

`dataDir` 解析顺序（与 Cline 本体一致，可用设置项覆盖）：`CLINE_DATA_DIR` → `CLINE_DIR/data` → `~/.cline/data`。

**本机实测环境**：Windows，VS Code 1.138.0，Cline `saoudrizwan.claude-dev`，`dataDir = C:\Users\Lavinia\.cline\data`（含 `globalState.json` / `secrets.json` / `settings/` / `sessions/` / `db/` / `logs/`）。

## 一套"档案"由什么组成

```text
档案 = {mode}Mode* 全部键（provider / model / reasoning / 各 provider 的开关…）
     + 接口层共享键（baseUrl / 请求头 / 模型信息 / 区域 等，可关）
     + 该模式的密钥（存 VS Code SecretStorage，档案记录里不落明文）
```

**只合并档案携带的键，不整盘覆盖**：任务历史、MCP 开关、自动批准策略等一律原样保留。写入前自动备份成 `globalState.json.bak-apimanager-<时间戳>` / `secrets.json.bak-apimanager-<时间戳>`。

**偏好设置永不进档案**：`autoApprovalSettings`、`preferredLanguage`、`mode`、各种开关与版本标记都被显式排除 —— 避免"换个 API 顺手把自动批准也改了"这种事故。

键分类建议独立成一个模块（本工作区是 `clineStore.js`）并提供 `classify(key)`：`api` / `preference` / `secret` / `ignore`。分类表是唯一需要随 Cline 升级维护的地方，集中在文件顶部便于对照。

## 为什么"改文件"要区分 Cline 是否激活

Cline 启动时把两个文件**整体读进内存**，之后任何改动都**整文件回写**。因此：

| 情况 | 行为 | 可靠性 |
| --- | --- | --- |
| Cline 未激活 | 直接写盘，立即生效 | 绝对安全 |
| Cline 已激活 | 写入 → 立即重载窗口 → 激活后回读校验 | 可能被内存状态覆盖，必须校验 |

判断是否激活：`vscode.extensions.getExtension('saoudrizwan.claude-dev')?.isActive`。

校验（`verify`）的做法：写完之后把同一套档案与盘上的实际值**逐键比对**，列出不匹配的键名。**校验失败要明说失败**，并给"重试 / 导出冷切换文件"两个出路，绝不能假装成功——这正是"Cline 把内存写回文件"这类竞态最需要的诚实。

## 冷切换：100% 可靠的兜底

热切换总会受"谁先写回文件"影响。要在 VS Code 关闭状态下应用，用一个独立脚本：

```bash
node "<扩展目录>/apply-profile.js" "<导出的档案.json>"
node "<扩展目录>/apply-profile.js" "<导出的档案.json>" --dry-run   # 只看会改什么
```

流程：侧边栏 → 档案 → 导出 → "导出冷切换文件" → 关闭 VS Code → 跑脚本（脚本做同样的合并 + 备份）。

## VS Code 侧的两个"存储"别搞混（本机实测）

| 东西 | 真实位置 | 何时用 |
| --- | --- | --- |
| `context.globalState` / `workspaceState` | `%APPDATA%/Code/User/globalStorage/state.vscdb`（**一个共享的 sqlite**） | 存扩展自己的结构化数据（档案列表、上次结果）；**不要**假设每扩展一个文件夹 |
| `context.globalStorageUri` | `%APPDATA%/Code/User/globalStorage/<publisher>.<name>/` | 放扩展自管的文件（诊断落盘、导出的 JSON）；这个目录**可能压根不存在**，直到你第一次往里写 |
| `context.secrets` | VS Code 加密存储（跨机器同步时也不落明文到扩展配置） | 存 API 密钥 |

实测推论：`grep` 到 `state.vscdb` 里有 `clineApiManager.profiles`、而对应扩展目录**不存在**，是**完全正常**的（不是"没写进去"）。排查这类问题时要认准位置，避免误判。
