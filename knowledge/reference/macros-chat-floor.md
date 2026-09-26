---
title: 宏：聊天、楼层与上下文
category: reference
tags: macros, reference, st-core
summary: ST 核心宏中「聊天、楼层与上下文」的 18 个宏（含 Description / Returns / Aliases）：{{allChatRange}}、{{authorsNote}}、{{chatStart}}、{{currentSwipeId}}、{{defaultAuthorsNote}}、{{defaultSystemPrompt}}、{{firstDisplayedMessageId}}、{{firstIncludedMessageId}}、{{input}}、{{lastMessage}} 等。
sources: [SillyTavern_Macros.txt]
---

# 宏：聊天、楼层与上下文

来源：`SillyTavern_Macros.txt`（ST 核心宏清单），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 18 个宏，每个宏一节，保留原文的 Description / Returns / Aliases。

### {{allChatRange}}
- **Description**: Range of all message IDs in the chat (e.g. "0-10"). Empty string if the chat is empty.
- **Returns**: Range string from 0 to last message ID, or empty string.

### {{authorsNote}}
- **Description**: 作者注释的内容

### {{chatStart}}
- **Description**: Chat start marker used in text completion prompts.

### {{currentSwipeId}}
- **Description**: 1-based index of the current swipe.
- **Returns**: 1-based index of the current swipe.

### {{defaultAuthorsNote}}
- **Description**: 默认作者注释的内容

### {{defaultSystemPrompt}}
- **Description**: Default system prompt.
- **Aliases**: {{instructSystem}}, {{instructSystemPrompt}}

### {{firstDisplayedMessageId}}
- **Description**: Index of the first displayed message in the chat.
- **Returns**: Index of the first displayed message in the chat.

### {{firstIncludedMessageId}}
- **Description**: Index of the first message included in the current context.
- **Returns**: Index of the first message included in the context.

### {{input}}
- **Description**: Current text from the send textarea.
- **Returns**: Current text from the send textarea.

### {{lastMessage}}
- **Description**: Last message in the chat.
- **Returns**: Last message in the chat.

### {{lastMessageId}}
- **Description**: Index of the last message in the chat.
- **Returns**: Index of the last message in the chat.

### {{lastSwipeId}}
- **Description**: 1-based index of the last swipe for the last message.
- **Returns**: 1-based index of the last swipe.

### {{maxContext}}
- **Description**: Maximum context token limit.
- **Returns**: Maximum context token limit.
- **Aliases**: {{maxContextTokens}}

### {{maxPrompt}}
- **Description**: Maximum prompt context size.
- **Returns**: Maximum prompt context size.
- **Aliases**: {{maxPromptTokens}}

### {{maxResponse}}
- **Description**: Maximum response token limit.
- **Returns**: Maximum response token limit.
- **Aliases**: {{maxResponseTokens}}

### {{mesExamples}}
- **Description**: The character's dialogue examples, formatted for instruct mode when enabled.
- **Returns**: Formatted dialogue examples.

### {{mesExamplesRaw}}
- **Description**: Unformatted dialogue examples from the character card.
- **Returns**: Unformatted dialogue examples.

### {{systemPrompt}}
- **Description**: Active system prompt text (optionally overridden by character prompt)
