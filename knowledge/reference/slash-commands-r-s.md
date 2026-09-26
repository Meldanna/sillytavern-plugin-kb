---
title: 斜杠命令：r–s
category: reference
tags: slash-commands, reference, st-core
summary: ST 核心斜杠命令中「首字母 R/S」的 54 条命令（含命名参数/位置参数与说明原文）：/rand /random /reasoning-collapse /reasoning-expand /reasoning-format /reasoning-get /reasoning-parse /reasoning-set /reasoning-template /reasoning-toggle 等。
sources: [slash_command.txt (行 207-260)]
---

# 斜杠命令：r–s

来源：`slash_command.txt`（ST 核心斜杠命令清单，首字母 R/S），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 54 条命令。每条命令的格式：`/命令名 [命名参数] (位置参数) // 说明`，`?` 表示可选参数，`| ` 表示枚举取值。

## /rand

/rand [from=number]?=0 [to=number]?=1 [round=round|ceil|floor]? // Returns a random number between from and to (inclusive). Examples: /rand Returns a random number between 0 and 1. /rand 10 Returns a random number between 0 and 10. /rand from=5 to=10 Returns a random number between 5 and 10.

## /random

/random (string)? // Start a new chat with a random character. If an argument is provided, only considers characters that have the specified tag.

## /reasoning-collapse

/reasoning-collapse (number|range)? // Collapse the reasoning block of a message or range of messages.

## /reasoning-expand

/reasoning-expand (number|range)? // Expand the reasoning block of a message or range of messages.

## /reasoning-format

/reasoning-format [reasoning=string] (string)? // Formats reasoning and content into a single string using Reasoning Formatting settings. Useful for preparing text that can be parsed with /reasoning-parse.

## /reasoning-get

/reasoning-get (number)? // 获取消息的推理块内容。若其没有推理块，则返回一个空字符串。

## /reasoning-parse

/reasoning-parse [regex=true|false]?=true [return=reasoning|content]?=reasoning [strict=true|false]?=true (string)? // 使用推理格式设置从字符串中提取推理块。

## /reasoning-set

/reasoning-set [at=number]? [collapse=true|false]? (string)? // 设置消息的推理块内容。返回推理块内容。

## /reasoning-template

/reasoning-template [quiet=true|false]?=false (string)? // Selects a reasoning template by name, using fuzzy search to find the closest match. Gets the current template if no name is provided. Example: /reasoning-template DeepSeek

## /reasoning-toggle

/reasoning-toggle (number|range)? // Toggle the reasoning block of a message or range of messages. Expanded blocks will be collapsed, and collapsed blocks will be expanded.

## /regenerate

/regenerate [await=true|false]?=false // Regenerates the latest reply in the chat. If await=true named argument is passed, the command will await for the regeneration before proceeding.

## /regex

/regex [name=string] (string)? // Runs a Regex extension script by name on the provided string. The script must be enabled.

## /regex-preset

/regex-preset [quiet=true|false]?=false (string)? // 根据名称或 ID 选择一个正则预设。如果没有提供参数，则获取当前正则预设的 ID。

## /regex-state

/regex-state (string) // Returns the current state of a regex script.

## /regex-toggle

/regex-toggle [state=on|off|toggle]?=toggle [quiet=true|false]?=false (string) // Toggles the state of a specified regex script. Example: /regex-toggle MyScript /regex-toggle state=off Character-specific Script

## /reload-page

/reload-page // Reloads the current page. All further commands will not be processed.

## /rename-char

/rename-char [silent=true|false]?=true [chats=true|false]?=<null> (string) // 重命名当前角色。

## /renamechat

/renamechat (string) // 重命名当前聊天。

## /replace

/replace [mode=literal|regex]?=literal [pattern=string] [replacer=string]? (string) // 根据模式替换提供的字符串中的文本。 如果 mode 为 literal（或省略），则 pattern 为字面量搜索字符串（区分大小写）。 如果 mode 为 regex，则将 pattern 解析为 ECMAScript 正则表达式。 replacer 基于输入文本中的 pattern 进行替换。 如果省略 replacer，则替换项将为空字符串。 例： /let x Blue house and blue car || /replace pattern="blue" {{var::x}}                                | /echo  |/# Blue house and  car     || /replace pattern="blue" replacer="red" {{var::x}}                 | /echo  |/# Blue house and red car  || /replace mode=regex pattern="/blue/i" replacer="red" {{var::x}}   | /echo  |/# red house and blue car  || /replace mode=regex pattern="/blue/gi" replacer="red" {{var::x}}  | /echo  |/# red house and red car   ||

## /reroll-pick

/reroll-pick (number)? // 重新随机选择当前聊天中的所有 {{pick}} 宏选项。 {{pick}} 宏通常在每个聊天中保持稳定的选择。此命令更改用于所有选择的种子，导致它们解析为（可能）不同的值。 如果提供了数字，则将种子设置为该值。否则，将当前种子增加 1。 例： /reroll-pick 将种子增加 1。 /reroll-pick 5 将种子设置为 5。

## /resetpanels

/resetpanels // resets UI panels to original state

## /round

/round (number|varname) // Rounds a value and passes the result down the pipe. Can use variable names. Example: /round i

## /run

/run [...args=string|number|bool|list|dictionary]? (varname|string|closure) // 运行来自作用域变量的闭包，或来自当前活动预设或另一个预设的具有指定名称的快捷回复。 命名参数可以在 QR 中用 {{arg::key}} 引用。

## /secret-delete

/secret-delete [quiet=true|false]?=false [key=string]? (string) // Deletes a secret key by ID.

## /secret-id

/secret-id [quiet=true|false]?=false [key=string]? (string) // Sets the ID of a currently active secret key. Gets the ID of the secret key if no value is provided.

## /secret-read

/secret-read [quiet=true|false]?=false [key=string]? (string) // Reads a secret key by ID. If key exposure is disabled, this command will not work!

## /secret-rename

/secret-rename [quiet=true|false]?=false [key=string]? [id=string] (string) // Renames a secret key by ID.

## /secret-write

/secret-write [quiet=true|false]?=false [key=string]? [label=string]? [empty=true|false]?=false (string) // Writes a secret key with a value and an optional label.

## /send

/send [compact=true|false]?=false [at=number]? [name=string]?={{user}} [return=pipe|object|toast-html|toast-text|console|none]?=none [raw=true|false]?=true (string) // 向聊天记录添加用户消息，而不触发生成。 如果 compact 设置为 true，则使用紧凑布局发送消息。 如果设置了 name，它将显示为消息发送者。可以为空以表示没有名称。 例： /send Hello there! /send compact=true Hi

## /sendas

/sendas [name=string] [avatar=string]? [compact=true|false]?=false [at=number]? [return=pipe|object|toast-html|toast-text|console|none]?=none [raw=true|false]?=true (string) // 作为特定角色发送消息。如果字符列表中存在角色头像，则使用该头像。 例： /sendas name="Chloe" Hello, guys! 将从 "Chloe" 发送 "Hello, guys!"。 /sendas name="Chloe" avatar="BigBadBoss" Hehehe, I am the big bad evil, fear me. 将作为角色 "Chloe" 发送消息，但使用名为 "BigBadBoss" 的角色的头像。 如果 "compact" 设置为 true，则使用紧凑布局发送消息。

## /setentryfield

/setentryfield [file=string] [uid=string] [field=key|keysecondary|comment|content|constant|vectorized|selective|selectiveLogic|addMemo|order|position|disable|ignoreBudget|excludeRecursion|preventRecursion|matchPersonaDescription|matchCharacterDescription|matchCharacterPersonality|matchCharacterDepthPrompt|matchScenario|matchCreatorNotes|delayUntilRecursion|probability|useProbability|depth|outletName|group|groupOverride|groupWeight|scanDepth|caseSensitive|matchWholeWords|useGroupScoring|automationId|role|sticky|cooldown|delay|characterFilterNames|characterFilterTags|characterFilterExclude|triggers]?=content (string) // Set a field value (default: content) of the record with the UID from the specified book. To set multiple values for key fields, use comma-delimited list as a value. Example: /setentryfield file=chatLore uid=123 field=key Shadowfang,sword,weapon

## /setglobalvar

/setglobalvar [key=varname] [index=number|string]? [as=string]?=string (string|number|bool|list|dictionary) // Set a global variable value and pass it down the pipe. The index argument is optional. To convert the value to a specific JSON type when using index, use the as argument. Example: /setglobalvar key=color green /setglobalvar key=ages index=John as=number 21

## /setinput

/setinput (string) // 将用户输入设置为指定文本，并通过管道将其传递给下一条命令。 例： /setinput Hello world

## /setpromptentry

/setpromptentry [...identifier=string|list]? [...name=string|list]? (on|off|toggle)=toggle // 开启或关闭指定的提示词管理器条目。

## /setvar

/setvar [key=varname] [index=number|string]? [as=string]?=string (string|number|bool|list|dictionary) // Set a local variable value and pass it down the pipe. The index argument is optional. To convert the value to a specific JSON type when using index, use the as argument. Example: /setvar key=color green /setvar key=ages index=John as=number 21

## /show-gallery

/show-gallery // Shows the gallery.

## /sin

/sin (number|varname) // Performs a sine operation of a value and passes the result down the pipe. Can use variable names. Example: /sin i

## /single

/single // 设置消息样式为单文档样式，不显示名称或头像。

## /sort

/sort [keysort=true|false]?=true (string|number|list|dictionary) // Sorts a list or dictionary in ascending order and passes the result down the pipe. For lists, returns the list sorted by value. For dictionaries, returns the ordered list of keys after sorting. Setting keysort=false means keys are sorted by associated value. Examples: /sort [5,3,4,1,2] | /echo /sort keysort=false {"a": 1, "d": 3, "c": 2, "b": 5} | /echo

## /sqrt

/sqrt (number|varname) // Performs a square root operation of a value and passes the result down the pipe. Can use variable names. Example: /sqrt i

## /st-api-manager

/st-api-manager // 打开 ST-ApiManager 面板

## /start-reply-with

/start-reply-with [force=true|false]?=false (string)? // Sets a "Start Reply With". Gets the current value if no value is provided. Use a "force" argument to force set an empty value. Examples: Set the field value: /start-reply-with Sure! Force set an empty value: /start-reply-with force="true" {{noop}}

## /stop

/stop // 若当前正在运行，则停止所有生成和流式传输。 注意：此命令无法从聊天输入执行，因为在生成期间会阻止从那里发送任何消息或脚本。但它可以通过自动化或 QR 脚本/按钮执行。

## /stop-strings

/stop-strings [force=true|false]?=false (list)? // Sets a list of custom stopping strings. Gets the list if no value is provided. Use a "force" argument to force set an empty value. Examples: Force set an empty value: /stop-strings force="true" {{noop}} Value must be a JSON-serialized array: /stop-strings ["goodbye", "farewell"] Pipe characters must be escaped with a backslash: /stop-strings ["left\|right"]

## /sub

/sub (...number|varname|list) // Performs a subtraction of the set of values and passes the result down the pipe. Can use variable names, or a JSON array consisting of numbers and variables (with quotes). Example: /sub i 5 /sub ["count", 4, "i"]

## /substr

/substr [start=number]? [end=number]? (string) // 从提供的字符串中提取文本。 如果省略 start，则视为 0。 如果 start < 0，则从字符串末尾开始计数。 如果 start >= 字符串长度，则返回空字符串。 如果省略 end，或者 end >= 字符串长度，则提取到字符串末尾。 如果 end < 0，则从字符串末尾开始计数。 如果归一化负值后 end <= start，则返回空字符串。 例： /let x The morning is upon us.     || /substr start=-3 {{var::x}}         | /echo  |/# us.                    || /substr start=-3 end=-1 {{var::x}}  | /echo  |/# us                     || /substr end=-1 {{var::x}}           | /echo  |/# The morning is upon us || /substr start=4 end=-1 {{var::x}}   | /echo  |/# morning is upon us     ||

## /swipe

/swipe [direction=right|left]?=right [await=true|false]?=false // Swipes the latest reply. Defaults to direction=right; use direction=left to go to the previous reply. If no next swipe exists, behavior depends on message context. If await=true named argument is passed, the command will await for the swipe action before proceeding.

## /sys

/sys [compact=true|false]?=false [at=number]? [name=string]? [return=pipe|object|toast-html|toast-text|console|none]?=none [raw=true|false]?=true (string) // 作为系统旁白发送消息。 如果 compact 设置为 true，则使用紧凑布局发送消息。 例： /sys The sun sets in the west. /sys compact=true A brief note.

## /sysgen

/sysgen [trim=true|false]?=false [compact=true|false]?=false [at=number]? [name=string]? [return=pipe|object|toast-html|toast-text|console|none]?=none (string) // 使用指定提示词生成系统消息。

## /sysname

/sysname (string)? // 设置此聊天中未来旁白的名称（仅显示）。默认：系统。留空以重置。

## /sysprompt

/sysprompt [quiet=true|false]?=false [forceGet=true|false]?=false (string)? // Selects a system prompt by name, using fuzzy search to find the closest match. Gets the current system prompt if no name is provided and sysprompt is enabled or forceGet=true is passed. Example: /sysprompt

## /sysprompt-off

/sysprompt-off // Disables system prompt

## /sysprompt-on

/sysprompt-on // Enables system prompt.

## /sysprompt-state

/sysprompt-state (true|false)? // Gets the current system prompt state. If an argument is provided, it will set the system prompt state.
