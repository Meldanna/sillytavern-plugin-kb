---
title: 斜杠命令：d–g
category: reference
tags: slash-commands, reference, st-core
summary: ST 核心斜杠命令中「首字母 D/E/F/G」的 54 条命令（含命名参数/位置参数与说明原文）：/db /db-add /db-delete /db-disable /db-enable /db-get /db-ingest /db-list /db-purge /db-search 等。
sources: [slash_command.txt (行 58-111)]
---

# 斜杠命令：d–g

来源：`slash_command.txt`（ST 核心斜杠命令清单，首字母 D/E/F/G），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 54 条命令。每条命令的格式：`/命令名 [命名参数] (位置参数) // 说明`，`?` 表示可选参数，`| ` 表示枚举取值。

## /db

/db // Open the data bank

## /db-add

/db-add [source=global|character|chat]?=chat [name=string]? (string) // Add an attachment to the Data Bank. If name is not provided, it will be generated automatically. Returns the URL of the attachment.

## /db-delete

/db-delete [source=global|character|chat]?=chat (string) // Delete an attachment from the Data Bank.

## /db-disable

/db-disable [source=global|character|chat]? (string) // Disable an attachment in the Data Bank by its name or URL. Optionally, provide the source of the attachment.

## /db-enable

/db-enable [source=global|character|chat]? (string) // Enable an attachment in the Data Bank by its name or URL. Optionally, provide the source of the attachment.

## /db-get

/db-get [source=global|character|chat]? (string) // Get attachment text from the Data Bank. Either provide the name or URL of the attachment. Optionally, provide the source of the attachment.

## /db-ingest

/db-ingest // Force the ingestion of all Data Bank attachments.

## /db-list

/db-list [source=global|character|chat]? [field=name|url]?=url // List attachments in the Data Bank as a JSON-serialized array. Optionally, provide the source of the attachments and the field to list by.

## /db-purge

/db-purge // Purge the vector index for all Data Bank attachments.

## /db-search

/db-search [threshold=number]? [count=number]? [source=global|character|chat]? [return=chunks|pipe|object|toast-html|toast-text|console|none]?=object (string) // Search the Data Bank for a specific query using vector similarity. Returns a list of file URLs with the most relevant content.

## /db-update

/db-update [source=global|character|chat]?=chat [name=string]? [url=string]? (string) // Update an attachment in the Data Bank, preserving its name. Returns a new URL of the attachment.

## /decglobalvar

/decglobalvar (varname) // Decrement a global variable by 1 and pass the result down the pipe. Example: /decglobalvar score

## /decvar

/decvar (varname) // Decrement a local variable by 1 and pass the result down the pipe. Example: /decvar score

## /del

/del (number)? // Enter message deletion mode, and auto-deletes last N messages if numeric argument is provided.

## /delay

/delay (number) // 将管道中的下一条命令延迟指定的毫秒数。 例： /delay 1000

## /delchat

/delchat // 删除当前聊天。

## /delname

/delname (string) // 删除所有归属于指定名称的消息。 例： /delname John

## /delswipe

/delswipe (number) // 删除最后一条聊天消息的备选回复。如果未提供 ID，则删除当前备选回复。 例： /delswipe 删除当前备选回复。 /delswipe 2 删除最后一条聊天消息的第二个备选回复。

## /div

/div (number|varname) (number|varname) // Performs a division of two values and passes the result down the pipe. Can use variable names. Example: /div 10 i

## /echo

/echo [title=string]? [severity=string]?=info [timeout=number]?=4000 [extendedTimeout=number]?=10000 [preventDuplicates=true|false]?=false [awaitDismissal=true|false]?=false [cssClass=string]? [color=string]? [escapeHtml=true|false]?=true [onClick=closure]? [raw=true|false]?=true (string) // Echoes the provided text to a toast message. Can be used to display informational messages or for pipes debugging. Example: /echo title="My Message" severity=warning This is a warning message /echo color=purple This message is purple /echo onClick={: /echo escapeHtml=false color=transparent cssClass=wider_dialogue_popup <img src="/img/five.png" /> :} timeout=5000 Clicking on this message within 5 seconds will open the image.

## /ejs

/ejs [ctx=dictionary]? [block=dictionary]? (string) // Execute template code

## /ejs-refresh

/ejs-refresh // Preload world info

## /event-emit

/event-emit [event=string] [...data=string]? // 发送 `event` 事件, 同时可以发送一些数据. 所有正在监听该消息频道的 listener 函数都会自动运行, 并能用函数参数接收发送来的数据. 由于酒馆 STScript 输入方式的局限性, 所有数据将会以字符串 string 类型接收; 如果需要 number 等类型, 请自行转换. Example: /event-emit event="读档" /event-emit event="存档" data={{getvar::数据}} data=8 data=你好 {{user}} /event-emit event="随便什么名称" data="这是一个 数据" data={{user}}

## /expression-classify

/expression-classify [api=local|extras|llm|webllm|none]? [filter=true|false]?=true [prompt=string]? (string) // Performs an emotion classification of the given text and returns a label. Allows to specify which Classifier API to perform the classification with. Example: /classify I am so happy today!

## /expression-fallback

/expression-fallback (string)? // Gets the currently selected expression fallback for all characters. If a valid expression label is sent, it will be set as the new fallback. Example: /expression-fallback | /echo Returns the currently selected fallback. /expression-fallback admiration Sets a new expression as fallback.

## /expression-folder-override

/expression-folder-override [name=string]? (string)? // Sets an override sprite folder for the current character. In groups, this will apply to the character who last sent a message. If the name starts with a slash or a backslash, selects a sub-folder in the character-named folder. Empty value to reset to default.

## /expression-last

/expression-last (string)? // Returns the last set expression for the named character.

## /expression-list

/expression-list [return=pipe|object|toast-html|toast-text|console|none]?=pipe [filter=true|false]?=true // Returns a list of available expressions, including custom expressions.

## /expression-set

/expression-set [type=expression|sprite]?=expression (string) // Force sets the expression for the current character.

## /expression-upload

/expression-upload [name=string]? [label=string] [folder=string]? [spriteName=string]? (string) // Upload a sprite from a URL. Example: /uploadsprite name=Seraphina label=joy /user/images/Seraphina/Seraphina_2024-12-22@12h37m57s.png

## /extension-disable

/extension-disable [reload=true|false]?=true (string) // Disables a specified extension. By default, the page will be reloaded automatically, stopping any further commands. If reload=false named argument is passed, the page will not be reloaded, and the extension will stay enabled until refreshed. The page either needs to be refreshed, or /reload-page has to be called. Example: /extension-disable Summarize

## /extension-enable

/extension-enable [reload=true|false]?=true (string) // Enables a specified extension. By default, the page will be reloaded automatically, stopping any further commands. If reload=false named argument is passed, the page will not be reloaded, and the extension will stay disabled until refreshed. The page either needs to be refreshed, or /reload-page has to be called. Example: /extension-enable Summarize

## /extension-exists

/extension-exists (string) // Checks if a specified extension exists. Example: /extension-exists SillyTavern-LALib

## /extension-state

/extension-state (string) // Returns the state of a specified extension (true if enabled, false if disabled). Example: /extension-state Summarize

## /extension-toggle

/extension-toggle [reload=true|false]?=true [state=true|false]? (string) // Toggles the state of a specified extension. By default, the page will be reloaded automatically, stopping any further commands. If reload=false named argument is passed, the page will not be reloaded, and the extension will stay in its current state until refreshed. The page either needs to be refreshed, or /reload-page has to be called. Example: /extension-toggle Summarize /extension-toggle Summarize state=true

## /findentry

/findentry [file=string] [field=key|keysecondary|comment|content|constant|vectorized|selective|selectiveLogic|addMemo|order|position|disable|ignoreBudget|excludeRecursion|preventRecursion|matchPersonaDescription|matchCharacterDescription|matchCharacterPersonality|matchCharacterDepthPrompt|matchScenario|matchCreatorNotes|delayUntilRecursion|probability|useProbability|depth|outletName|group|groupOverride|groupWeight|scanDepth|caseSensitive|matchWholeWords|useGroupScoring|automationId|role|sticky|cooldown|delay|characterFilterNames|characterFilterTags|characterFilterExclude|triggers]?=key (...string) // Find a UID of the record from the specified book using the fuzzy match of a field value (default: key) and pass it down the pipe. Example: /findentry file=chatLore field=key Shadowfang

## /flat

/flat // 设置平面聊天模式的消息样式。

## /flushglobalvar

/flushglobalvar (varname|closure)? // Deletes the specified global variable. Example: /flushglobalvar score Deletes the global variable score.

## /flushinject

/flushinject (string)? // 移除当前聊天的脚本注入。如果没有提供 ID，则移除所有脚本注入。

## /flushvar

/flushvar (varname|closure)? // Delete a local variable. Example: /flushvar score

## /forcesave

/forcesave // 强制保存当前聊天和设置

## /fuzzy

/fuzzy [list=list|varname] [threshold=number]?=0.4 [mode=first|best]?=first (string) // 对 list 中的每一项与 text to search 进行模糊匹配。如果有任何项目匹配，则返回其名称。如果没有项目匹配文本，则不返回任何值。 可选的 threshold（默认值为 0.4）允许控制匹配的严格程度。 较低的值（最小 0.0）意味着匹配非常严格。 在 1.0（最大值）时，匹配非常宽松，可以匹配任何内容。 可选的 mode 参数允许控制多个项目匹配文本时的行为。 first（默认）返回低于阈值的第一个匹配项。 best 返回低于阈值的最佳匹配项。 返回值通过管道传递给下一条命令。 例： /fuzzy list=["a","b","c"] threshold=0.4 abc

## /gen

/gen [trim=true|false]?=false [lock=on|off]? [name=string]?=System [length=number]? [as=system|char]? (string) // 使用提供的提示词生成文本并通过管道将其传递给下一条命令，可选择在生成时锁定用户输入，并允许配置指令模式的提示词内名称（默认为 "System"）。 "as" 参数控制输出提示词的身份：system（默认）或 char。如果 "length" 参数作为 Token 数提供，则允许临时覆盖 API 响应长度。

## /genraw

/genraw [lock=on|off]?=off [instruct=on|off]?=on [stop=list]?=[] [as=system|char]?=system [system=string|varname]? [prefill=string|varname]? [length=number|varname]? [trim=on|off]?=on (string) // 使用提供的提示词生成文本并通过管道将其传递给下一条命令，可选择在生成时锁定用户输入。不包括聊天历史记录或角色卡。 使用 instruct=off 跳过指令格式化，例如 /genraw instruct=off 为什么天空是蓝色的？ Use stop=... with a JSON-serialized array to add one-time custom stop strings, e.g. /genraw stop=["\n"] Say hi "as" 参数控制输出提示词的身份：system（默认）或 char。"system" 参数在开头添加（可选）系统提示词。 如果 "length" 参数作为 Token 数提供，则允许临时覆盖 API 响应长度。

## /getcharbook

/getcharbook [type=primary|additional|all]?=primary [name=string]? [create=true|false]?=false (number|string)? // Get a name of the character-bound lorebook and pass it down the pipe. Returns empty string if character lorebook is not set. Does not work in group chats without providing a character avatar name.

## /getchatbook

/getchatbook [name=string]? [create=true|false]?=true // Get a name of the chat-bound lorebook or create a new one if was unbound, and pass it down the pipe.

## /getchatname

/getchatname // 将当前聊天文件名返回到管道中。

## /getentryfield

/getentryfield [file=string] [field=key|keysecondary|comment|content|constant|vectorized|selective|selectiveLogic|addMemo|order|position|disable|ignoreBudget|excludeRecursion|preventRecursion|matchPersonaDescription|matchCharacterDescription|matchCharacterPersonality|matchCharacterDepthPrompt|matchScenario|matchCreatorNotes|delayUntilRecursion|probability|useProbability|depth|outletName|group|groupOverride|groupWeight|scanDepth|caseSensitive|matchWholeWords|useGroupScoring|automationId|role|sticky|cooldown|delay|characterFilterNames|characterFilterTags|characterFilterExclude|triggers]?=content (string) // Get a field value (default: content) of the record with the UID from the specified book and pass it down the pipe. Example: /getentryfield file=chatLore field=content 123

## /getglobalbooks

/getglobalbooks // Get a list of names of the selected global lorebooks and pass it down the pipe.

## /getglobalvar

/getglobalvar [key=varname]? [index=number|string]? (varname)? // Get a global variable value and pass it down the pipe. The index argument is optional. Examples: /getglobalvar height /getglobalvar key=height /getglobalvar index=3 costumes

## /getpersonabook

/getpersonabook [name=string]? [create=true|false]?=false // Get a name of the current persona-bound lorebook and pass it down the pipe. Returns empty string if persona lorebook is not set.

## /getpromptentry

/getpromptentry [...identifier=string|list]? [...name=string|list]? [return=simple|list|dict]?=simple // 获取指定提示词条目的状态。 如果 return 为 simple（默认），则如果只检索到一个值，则返回单个值；否则使用字典（如果使用了 identifier 参数）或列表。

## /getvar

/getvar [key=varname]? [index=number|string]? (varname)? // Get a local variable value and pass it down the pipe. The index argument is optional. Examples: /getvar height /getvar key=height /getvar index=3 costumes

## /go

/go (string) // 用它的名称打开与角色或群聊的聊天
