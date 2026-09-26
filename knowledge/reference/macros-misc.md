---
title: 宏：其它（扩展、模型、推理等）
category: reference
tags: macros, reference, st-core
summary: ST 核心宏中「其它（扩展、模型、推理等）」的 11 个宏（含 Description / Returns / Aliases）：{{exampleSeparator}}、{{hasExtension::extensionName<string>}}、{{isMobile}}、{{lastCharMessage}}、{{lastGenerationType}}、{{lastUserMessage}}、{{model}}、{{outlet::key<string>}}、{{reasoningPrefix}}、{{reasoningSeparator}} 等。
sources: [SillyTavern_Macros.txt]
---

# 宏：其它（扩展、模型、推理等）

来源：`SillyTavern_Macros.txt`（ST 核心宏清单），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 11 个宏，每个宏一节，保留原文的 Description / Returns / Aliases。

### {{exampleSeparator}}
- **Description**: Separator used between example chat blocks in text completion prompts.
- **Aliases**: {{chatSeparator}}

### {{hasExtension::extensionName<string>}}
- **Description**: Checks if a specific extension is enabled. If the extension does not exist, returns false.
- **Returns**: true if the extension is enabled, false otherwise.

### {{isMobile}}
- **Description**: "true" if currently running in a mobile environment, "false" otherwise.
- **Returns**: Whether the environment is mobile.

### {{lastCharMessage}}
- **Description**: Last character/bot message in the chat.
- **Returns**: Last character/bot message in the chat.

### {{lastGenerationType}}
- **Description**: Type of the last queued generation request (e.g. "normal", "impersonate", "regenerate", "quiet", "swipe", "continue"). Empty if none yet or chat was switched.
- **Returns**: Type of the last queued generation request.

### {{lastUserMessage}}
- **Description**: Last user message in the chat.
- **Returns**: Last user message in the chat.

### {{model}}
- **Description**: Model name for the currently selected API (Chat Completion or Chat Completion).
- **Returns**: Model name.

### {{outlet::key<string>}}
- **Description**: Returns the world info outlet prompt for a given outlet key.
- **Returns**: World info outlet prompt.

### {{reasoningPrefix}}
- **Description**: 推理块开头使用的前缀字符串

### {{reasoningSeparator}}
- **Description**: 思考内容与回复之间的分隔符

### {{reasoningSuffix}}
- **Description**: 推理块结尾使用的后缀字符串
