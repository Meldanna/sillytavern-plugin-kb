---
title: ST 核心宏速查索引
category: reference
tags: macros, reference, index, st-core
summary: ST 内置 104 个宏的速查表（宏名 + 说明 + 所属分组文档）。
sources: [SillyTavern_Macros.txt]
---

# ST 核心宏速查索引

共 104 个宏，来自 `SillyTavern_Macros.txt`。按用途分组，全文见 `reference/macros-*.md`。

## 快速定位

- `reference/macros-bbs` —— 宏：BBS（楼层状态与历史）（7 个）
- `reference/macros-character-persona` —— 宏：角色 / 人设 / 用户（19 个）
- `reference/macros-chat-floor` —— 宏：聊天、楼层与上下文（18 个）
- `reference/macros-instruct` —— 宏：Instruct 模板片段（15 个）
- `reference/macros-logic-tools` —— 宏：逻辑、随机与文本工具（12 个）
- `reference/macros-misc` —— 宏：其它（扩展、模型、推理等）（11 个）
- `reference/macros-time` —— 宏：时间与日期（8 个）
- `reference/macros-variables` —— 宏：变量（局部 / 全局）（14 个）

## 全部宏

### 宏：BBS（楼层状态与历史）（7 个）

| 宏 | 说明 |
| --- | --- |
| `{{bbsFloor::floor<integer>}}` | 返回指定楼层的正文与叶子摘要 JSON。 |
| `{{bbsHistory::before?<integer>}}` | 返回柏宝书带相对时间的压缩历史剧情文本。 |
| `{{bbsInjectedHistory}}` | 返回与正常记忆注入相同、已跳过滑动窗口的历史剧情文本。 |
| `{{bbsSnapshot::floor?<integer>::at?<string>}}` | 返回柏宝书当前或指定楼层的完整状态快照 JSON。 |
| `{{bbsState}}` | 返回柏宝书当前时间与地点状态 JSON。 |
| `{{bbsVar::path<string>::floor?<integer>::at?<string>}}` | 返回柏宝书指定路径的变量值。 |
| `{{bbsVars}}` | 返回柏宝书当前自定义变量 JSON。 |

### 宏：角色 / 人设 / 用户（19 个）

| 宏 | 说明 |
| --- | --- |
| `{{char}}` | The character's name. |
| `{{charAuthorsNote}}` | 角色作者注释的内容 |
| `{{charAvatarPath}}` | N/A |
| `{{charCreatorNotes}}` | Creator notes from the character card. |
| `{{charDepthPrompt}}` | The character's @ Depth Note. |
| `{{charDescription}}` | The character's description. |
| `{{charFirstMessage::index?<integer>}}` | The character's first message / greeting. Optionally specify an index to access alternate greetings. |
| `{{charInstruction}}` | The character's Post-History Instructions override. |
| `{{charPersonality}}` | The character's personality. |
| `{{charPrompt}}` | The character's Main Prompt override. |
| `{{charScenario}}` | The character's scenario. |
| `{{charVersion}}` | The character's version number. |
| `{{group}}` | Comma-separated list of group member names (including muted) or the character name in solo chats. |
| `{{groupNotMuted}}` | Comma-separated list of group member names excluding muted members. |
| `{{notChar}}` | Comma-separated list of all participants except the current speaker. |
| `{{original}}` | Original message content for {{original}} substitution in in character prompt overrides. |
| `{{persona}}` | Your current Persona description. |
| `{{user}}` | Your current Persona username. |
| `{{userAvatarPath}}` | N/A |

### 宏：聊天、楼层与上下文（18 个）

| 宏 | 说明 |
| --- | --- |
| `{{allChatRange}}` | Range of all message IDs in the chat (e.g. "0-10"). Empty string if the chat is empty. |
| `{{authorsNote}}` | 作者注释的内容 |
| `{{chatStart}}` | Chat start marker used in text completion prompts. |
| `{{currentSwipeId}}` | 1-based index of the current swipe. |
| `{{defaultAuthorsNote}}` | 默认作者注释的内容 |
| `{{defaultSystemPrompt}}` | Default system prompt. |
| `{{firstDisplayedMessageId}}` | Index of the first displayed message in the chat. |
| `{{firstIncludedMessageId}}` | Index of the first message included in the current context. |
| `{{input}}` | Current text from the send textarea. |
| `{{lastMessage}}` | Last message in the chat. |
| `{{lastMessageId}}` | Index of the last message in the chat. |
| `{{lastSwipeId}}` | 1-based index of the last swipe for the last message. |
| `{{maxContext}}` | Maximum context token limit. |
| `{{maxPrompt}}` | Maximum prompt context size. |
| `{{maxResponse}}` | Maximum response token limit. |
| `{{mesExamples}}` | The character's dialogue examples, formatted for instruct mode when enabled. |
| `{{mesExamplesRaw}}` | Unformatted dialogue examples from the character card. |
| `{{systemPrompt}}` | Active system prompt text (optionally overridden by character prompt) |

### 宏：Instruct 模板片段（15 个）

| 宏 | 说明 |
| --- | --- |
| `{{instructAssistantPrefix}}` | Instruct output / assistant prefix sequence. |
| `{{instructAssistantSuffix}}` | Instruct output / assistant suffix sequence. |
| `{{instructFirstAssistantPrefix}}` | Instruct first assistant / output prefix sequence |
| `{{instructFirstUserPrefix}}` | Instruct first user / input prefix sequence. |
| `{{instructLastAssistantPrefix}}` | Instruct last assistant / output prefix sequence. |
| `{{instructLastUserPrefix}}` | Instruct last user / input prefix sequence. |
| `{{instructStop}}` | Instruct stop sequence. |
| `{{instructStoryStringPrefix}}` | Instruct story string prefix. |
| `{{instructStoryStringSuffix}}` | Instruct story string suffix. |
| `{{instructSystemInstructionPrefix}}` | Instruct system instruction prefix sequence. |
| `{{instructSystemPrefix}}` | Instruct system prefix sequence. |
| `{{instructSystemSuffix}}` | Instruct system suffix sequence. |
| `{{instructUserFiller}}` | Instruct user alignment filler. |
| `{{instructUserPrefix}}` | Instruct input / user prefix sequence. |
| `{{instructUserSuffix}}` | Instruct input / user suffix sequence. |

### 宏：逻辑、随机与文本工具（12 个）

| 宏 | 说明 |
| --- | --- |
| `{{//::comment<string>}}` | Comment macro that produces an empty string. Can be used for writing into prompt definitions, without being pa… |
| `{{banned::word<string>}}` | Bans a word for Text Completion backend. (Strips quotes surrounding the banned word, if present) |
| `{{else}}` | Marks the else branch inside a scoped {{if}} block. Only works inside {{if}}...{{/if}}. If used outside, retur… |
| `{{if::condition<string>::content<string>}}` | Conditional macro. Returns the content if the condition is truthy, otherwise returns nothing (or the else bran… |
| `{{newline::count?<integer>}}` | Inserts one or more newlines. One newline by default, more if the count argument is specified. |
| `{{noop}}` | Does nothing and produces an empty string. |
| `{{pick}}` | Picks a random item from a list, but keeps the choice stable for a given chat and macro position. Can be rerol… |
| `{{random}}` | Picks a random item from a list. Will be re-rolled every time macros are resolved. |
| `{{reverse::value<string>}}` | Reverses the characters of the argument provided. |
| `{{roll::formula<string>}}` | Rolls dice using droll syntax (e.g. {{roll 1d20}}). |
| `{{space::count?<integer>}}` | Returns one or more spaces. One space by default, more if the count argument is specified. |
| `{{trim::content?<string>}}` | Trims whitespace. Non-scoped: trims newlines around the macro (post-processing). Scoped: returns the content (… |

### 宏：其它（扩展、模型、推理等）（11 个）

| 宏 | 说明 |
| --- | --- |
| `{{exampleSeparator}}` | Separator used between example chat blocks in text completion prompts. |
| `{{hasExtension::extensionName<string>}}` | Checks if a specific extension is enabled. If the extension does not exist, returns false. |
| `{{isMobile}}` | "true" if currently running in a mobile environment, "false" otherwise. |
| `{{lastCharMessage}}` | Last character/bot message in the chat. |
| `{{lastGenerationType}}` | Type of the last queued generation request (e.g. "normal", "impersonate", "regenerate", "quiet", "swipe", "con… |
| `{{lastUserMessage}}` | Last user message in the chat. |
| `{{model}}` | Model name for the currently selected API (Chat Completion or Chat Completion). |
| `{{outlet::key<string>}}` | Returns the world info outlet prompt for a given outlet key. |
| `{{reasoningPrefix}}` | 推理块开头使用的前缀字符串 |
| `{{reasoningSeparator}}` | 思考内容与回复之间的分隔符 |
| `{{reasoningSuffix}}` | 推理块结尾使用的后缀字符串 |

### 宏：时间与日期（8 个）

| 宏 | 说明 |
| --- | --- |
| `{{date}}` | Current local date as a string in the local short format. |
| `{{datetimeformat::format<string>}}` | Formats the current date/time using the given moment.js format string. |
| `{{idleDuration}}` | Human-readable duration since the last user message. |
| `{{isodate}}` | Current date in YYYY-MM-DD format. |
| `{{isotime}}` | Current time in HH:mm format. |
| `{{time::offset?<string>}}` | Current local time, or UTC offset when called as {{time::UTC±(offset)}} |
| `{{timeDiff::left<string>::right<string>}}` | Human-readable difference between two times. Order of times does not matter, it will return the absolute diffe… |
| `{{weekday}}` | Current weekday name. |

### 宏：变量（局部 / 全局）（14 个）

| 宏 | 说明 |
| --- | --- |
| `{{addglobalvar::name<string>::value<string|number>}}` | Adds a value to an existing global variable (numeric or string append). If the variable does not exist, it wil… |
| `{{addvar::name<string>::value<string|number>}}` | Adds a value to an existing local variable (numeric or string append). If the variable does not exist, it will… |
| `{{decglobalvar::name<string>}}` | Decrements a global variable by 1 and returns the new value. If the variable does not exist, it will be create… |
| `{{decvar::name<string>}}` | Decrements a local variable by 1 and returns the new value. If the variable does not exist, it will be created… |
| `{{deleteglobalvar::name<string>}}` | Deletes a global variable. |
| `{{deletevar::name<string>}}` | Deletes a local variable. |
| `{{getglobalvar::name<string>}}` | Gets the value of a global variable. |
| `{{getvar::name<string>}}` | Gets the value of a local variable. |
| `{{hasglobalvar::name<string>}}` | Checks if a global variable exists. |
| `{{hasvar::name<string>}}` | Checks if a local variable exists. |
| `{{incglobalvar::name<string>}}` | Increments a global variable by 1 and returns the new value. If the variable does not exist, it will be create… |
| `{{incvar::name<string>}}` | Increments a local variable by 1 and returns the new value. If the variable does not exist, it will be created… |
| `{{setglobalvar::name<string>::value<string|number>}}` | Sets a global variable to the given value. |
| `{{setvar::name<string>::value<string|number>}}` | Sets a local variable to the given value. |


## 编写插件时怎么用

- 宏在**提示词文本**里生效（角色卡、世界书、预设、快速回复、扩展注入的 prompt 都算）。
- 插件里想手动展开宏，用 `ctx.substituteParams(text)`（ST 核心）或酒馆助手的 `substitudeMacros`（注意对方拼写少一个 t）。
- 变量宏（`{{getvar}}` / `{{setvar}}` 等）读写的是 ST 的变量系统，与 `SillyTavern.getContext().variables` 是同一套数据。
