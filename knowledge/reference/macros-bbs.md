---
title: 宏：BBS（楼层状态与历史）
category: reference
tags: macros, reference, st-core
summary: ST 核心宏中「BBS（楼层状态与历史）」的 7 个宏（含 Description / Returns / Aliases）：{{bbsFloor::floor<integer>}}、{{bbsHistory::before?<integer>}}、{{bbsInjectedHistory}}、{{bbsSnapshot::floor?<integer>::at?<string>}}、{{bbsState}}、{{bbsVar::path<string>::floor?<integer>::at?<string>}}、{{bbsVars}}。
sources: [SillyTavern_Macros.txt]
---

# 宏：BBS（楼层状态与历史）

来源：`SillyTavern_Macros.txt`（ST 核心宏清单），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 7 个宏，每个宏一节，保留原文的 Description / Returns / Aliases。

### {{bbsFloor::floor<integer>}}
- **Description**: 返回指定楼层的正文与叶子摘要 JSON。

### {{bbsHistory::before?<integer>}}
- **Description**: 返回柏宝书带相对时间的压缩历史剧情文本。

### {{bbsInjectedHistory}}
- **Description**: 返回与正常记忆注入相同、已跳过滑动窗口的历史剧情文本。

### {{bbsSnapshot::floor?<integer>::at?<string>}}
- **Description**: 返回柏宝书当前或指定楼层的完整状态快照 JSON。

### {{bbsState}}
- **Description**: 返回柏宝书当前时间与地点状态 JSON。

### {{bbsVar::path<string>::floor?<integer>::at?<string>}}
- **Description**: 返回柏宝书指定路径的变量值。

### {{bbsVars}}
- **Description**: 返回柏宝书当前自定义变量 JSON。
