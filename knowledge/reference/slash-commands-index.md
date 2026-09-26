---
title: ST 核心斜杠命令速查索引
category: reference
tags: slash-commands, reference, index, st-core
summary: ST 内置 299 条斜杠命令的速查表（命令名 + 一句话说明 + 全文所在分桶文档）。
sources: [slash_command.txt]
---

# ST 核心斜杠命令速查索引

共 299 条命令，来自 `slash_command.txt`。全文（含完整参数签名）按首字母分桶存放在 `reference/slash-commands-*.md`。

## 快速定位

- `reference/slash-commands-a-c` —— 斜杠命令：a–c（57 条）
- `reference/slash-commands-d-g` —— 斜杠命令：d–g（54 条）
- `reference/slash-commands-h-m` —— 斜杠命令：h–m（44 条）
- `reference/slash-commands-n-q` —— 斜杠命令：n–q（51 条）
- `reference/slash-commands-r-s` —— 斜杠命令：r–s（54 条）
- `reference/slash-commands-t-z` —— 斜杠命令：t–z（39 条）

## 全部命令

### #（2 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/(非常规)` | 获取关于宏、聊天格式化和命令的帮助。 | `slash-commands-a-c` |
| `/(非常规)` | (string)? // Write a comment. | `slash-commands-a-c` |

### A（17 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/abort` | 放弃批量执行的快捷命令。 | `slash-commands-a-c` |
| `/abs` | Performs an absolute value operation of a value and passes the result down the pipe. Can use variable names. Example: /a… | `slash-commands-a-c` |
| `/add` | Performs an addition of the set of values and passes the result down the pipe. Can use variable names, or a JSON array c… | `slash-commands-a-c` |
| `/addglobalvar` | Add a value to a global variable and pass the result down the pipe. Example: /addglobalvar key=score 10 | `slash-commands-a-c` |
| `/addswipe` | 向最后一条聊天消息添加备选回复。 使用 switch=true 直接切换到新回复。 | `slash-commands-a-c` |
| `/addvar` | Add a value to a local variable and pass the result down the pipe. Example: /addvar key=score 10 | `slash-commands-a-c` |
| `/api` | 连接到一个 API。如果没有提供参数，它将返回当前连接的 API。 可用的 API： ai21, aimlapi, aphrodite, azure_openai, chutes, claude, cohere, cometapi, cus… | `slash-commands-a-c` |
| `/api-url` | 设置当前选择 API 的 API URL / 服务器 URL / 端点，包括端口。如果未提供参数，它将返回当前 API URL。 如果提供手动 API 来设置 URL，请确保设置 connect=false，因为自动连接仅适用于当前选择的 … | `slash-commands-a-c` |
| `/array-unwrap` | Unwraps the first element of an array provided as an unnamed argument. If the value is not an array, returns the value a… | `slash-commands-a-c` |
| `/array-wrap` | Wraps a single unnamed argument into an array if it's not already an array. If the value is an empty string, returns an … | `slash-commands-a-c` |
| `/ask` | 向指定角色卡提出一个提示词。必须在命名参数中提供角色名称。 | `slash-commands-a-c` |
| `/audioenable` | 控制音乐播放器或音效播放器的开启与关闭。 Example: /audioenable type=bgm state=true 打开音乐播放器。 /audioenable type=ambient state=false 关闭音效播放器。 | `slash-commands-a-c` |
| `/audioimport` | 导入音频或音乐链接，并决定是否立即播放，默认为自动播放。可批量导入链接，使用英文逗号分隔。 Example: /audioimport type=bgm https://example.com/song1.mp3,https://examp… | `slash-commands-a-c` |
| `/audiomode` | 设置音频播放模式。 Example: /audiomode type=bgm mode=repeat 设置音乐为循环播放模式。 /audiomode type=ambient mode=random 设置音效为随机播放模式。 /audiom… | `slash-commands-a-c` |
| `/audioplay` | 控制音乐播放器或音效播放器的播放与暂停。 Example: /audioplay type=bgm 播放当前音乐。 /audioplay type=ambient play=false 暂停当前音效。 | `slash-commands-a-c` |
| `/audioselect` | 选择并播放音频。如果音频链接不存在，则先导入再播放。 Example: /audioselect type=bgm https://example.com/song.mp3 选择并播放指定的音乐。 /audioselect type=amb… | `slash-commands-a-c` |
| `/autobg` | Automatically changes the background based on the chat context using the AI request prompt | `slash-commands-a-c` |

### B（9 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/bbs-get` | 读取柏宝书的只读记忆数据，并把结果传入 STscript 管道。 /bbs-get resource=var path="关系.爱丽丝.好感度" floor=42 at=after format=raw /bbs-get resource=… | `slash-commands-a-c` |
| `/beep` | 播放收到消息的音效。 | `slash-commands-a-c` |
| `/bg` | 根据提供的文件名设置背景。允许部分名称。 如果没有提供背景，这将返回当前选择的背景。 例： /bg beach.jpg /bg | `slash-commands-a-c` |
| `/bgcol` | Generates a new theme based on a dominant color of the specified background image. Saves as "bgcol - background name". | `slash-commands-a-c` |
| `/branch-create` | Create a new branch from the selected message. If no message id is provided, will use the last message. Creating a branc… | `slash-commands-a-c` |
| `/break` | Break out of a loop or closure executed through /run or /: | `slash-commands-a-c` |
| `/breakpoint` | Set a breakpoint for debugging in the QR Editor. | `slash-commands-a-c` |
| `/bubble` | 设置气泡聊天模式的消息样式。 | `slash-commands-a-c` |
| `/buttons` | 显示带有指定文本和按钮的阻塞弹出窗口。 将点击的按钮标签返回到管道中，如果取消则返回空字符串。 Labels can be simple strings or objects with text, tooltip, and icon (Fo… | `slash-commands-a-c` |

### C（29 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/caption` | Caption an image with an optional prompt and passes the caption down the pipe. Only multimodal sources support custom pr… | `slash-commands-a-c` |
| `/char-create` | Creates a new character with the specified attributes. Returns the avatar key of the created character. Required argumen… | `slash-commands-a-c` |
| `/char-delete` | Deletes a character from the system. If no char argument is provided, deletes the currently selected character. 警告： 此操作不… | `slash-commands-a-c` |
| `/char-duplicate` | Duplicates a character. Returns the avatar key of the duplicated character. Use /char-update afterwards to modify the du… | `slash-commands-a-c` |
| `/char-find` | 搜索角色并返回其头像键。 如果您有多个同名角色，这可用于为 /sendas 或其他需要角色名称的命令选择正确的角色。 例： /char-find name="Chloe" 返回 "Chloe" 的头像键。 /search name="Chl… | `slash-commands-a-c` |
| `/char-get` | Retrieves character data. Can get all data or a specific field. 例： /char-get field=description \| /echo Outputs the curre… | `slash-commands-a-c` |
| `/char-update` | Updates an existing character's attributes. The character does not need to be currently selected. If no char argument is… | `slash-commands-a-c` |
| `/chat-jump` | 将聊天视图滚动到指定的消息索引。索引从 0 开始。 例： /chat-jump 10 滚动到第 11 条消息 (id=10)。 | `slash-commands-a-c` |
| `/chat-manager` | 为当前角色/群聊打开聊天管理 | `slash-commands-a-c` |
| `/chat-reload` | 重新加载当前聊天。 | `slash-commands-a-c` |
| `/chat-render` | 在聊天窗口中渲染指定数量的消息。如果未提供参数，则显示所有消息。 | `slash-commands-a-c` |
| `/checkpoint-create` | Create a new checkpoint for the selected message with the provided name. If no message id is provided, will use the last… | `slash-commands-a-c` |
| `/checkpoint-exit` | Exit the checkpoint chat.If not in a checkpoint chat, returns empty string. | `slash-commands-a-c` |
| `/checkpoint-get` | Get the name of the checkpoint linked to the selected message. If no message id is provided, will use the last message. … | `slash-commands-a-c` |
| `/checkpoint-go` | Open the checkpoint linked to the selected message. If no message id is provided, will use the last message. Use /checkp… | `slash-commands-a-c` |
| `/checkpoint-list` | List all existing checkpoints in this chat. Returns a list of all message ids that have a checkpoint, or all checkpoint … | `slash-commands-a-c` |
| `/checkpoint-parent` | Get the name of the parent chat for this checkpoint.If not in a checkpoint chat, returns empty string. | `slash-commands-a-c` |
| `/clipboard-get` | 检索操作系统剪贴板中的文本。仅在安全上下文（HTTPS 或 localhost）中有效。浏览器可能会请求权限。 | `slash-commands-a-c` |
| `/clipboard-set` | 将提供的文本复制到操作系统剪贴板。返回空字符串。 | `slash-commands-a-c` |
| `/closechat` | 关闭当前聊天。 | `slash-commands-a-c` |
| `/closure-deserialize` | Deserialize a closure from text. Examples: /closure-deserialize {{getvar::myClosure}} \| /let myClosure {{pipe}} \| /let y… | `slash-commands-a-c` |
| `/closure-serialize` | Serialize a closure as text that can be stored in global and chat variables. Examples: /closure-serialize {: x=1 /echo x… | `slash-commands-a-c` |
| `/comment` | 添加不属于聊天的备注/评论消息。 如果 compact 设置为 true，则使用紧凑布局发送消息。 例： /comment This is a comment /comment compact=true This is a compact … | `slash-commands-a-c` |
| `/context` | 根据名字选择上下文模板。若未提供名字，则获取当前模板。 | `slash-commands-a-c` |
| `/continue` | 继续聊天的最后一条消息，带有可选的附加提示词。 如果传递了 await=true 命名参数，命令将在继续之前等待继续生成。 例： /continue 不带附加提示词继续聊天，并立即执行下一条命令。 /continue await=true … | `slash-commands-a-c` |
| `/cos` | Performs a cosine operation of a value and passes the result down the pipe. Can use variable names. Example: /cos i | `slash-commands-a-c` |
| `/createentry` | Create a new record in the specified book with the key and content (both are optional) and pass the UID down the pipe. E… | `slash-commands-a-c` |
| `/css-var` | Sets a CSS variable to a specified value on a target element. Only setting of variable names is supported. They have to … | `slash-commands-a-c` |
| `/cut` | Cuts the specified message or continuous chunk from the chat. Ranges are inclusive! Example: /cut 0-10 | `slash-commands-a-c` |

### D（19 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/db` | Open the data bank | `slash-commands-d-g` |
| `/db-add` | Add an attachment to the Data Bank. If name is not provided, it will be generated automatically. Returns the URL of the … | `slash-commands-d-g` |
| `/db-delete` | Delete an attachment from the Data Bank. | `slash-commands-d-g` |
| `/db-disable` | Disable an attachment in the Data Bank by its name or URL. Optionally, provide the source of the attachment. | `slash-commands-d-g` |
| `/db-enable` | Enable an attachment in the Data Bank by its name or URL. Optionally, provide the source of the attachment. | `slash-commands-d-g` |
| `/db-get` | Get attachment text from the Data Bank. Either provide the name or URL of the attachment. Optionally, provide the source… | `slash-commands-d-g` |
| `/db-ingest` | Force the ingestion of all Data Bank attachments. | `slash-commands-d-g` |
| `/db-list` | List attachments in the Data Bank as a JSON-serialized array. Optionally, provide the source of the attachments and the … | `slash-commands-d-g` |
| `/db-purge` | Purge the vector index for all Data Bank attachments. | `slash-commands-d-g` |
| `/db-search` | Search the Data Bank for a specific query using vector similarity. Returns a list of file URLs with the most relevant co… | `slash-commands-d-g` |
| `/db-update` | Update an attachment in the Data Bank, preserving its name. Returns a new URL of the attachment. | `slash-commands-d-g` |
| `/decglobalvar` | Decrement a global variable by 1 and pass the result down the pipe. Example: /decglobalvar score | `slash-commands-d-g` |
| `/decvar` | Decrement a local variable by 1 and pass the result down the pipe. Example: /decvar score | `slash-commands-d-g` |
| `/del` | Enter message deletion mode, and auto-deletes last N messages if numeric argument is provided. | `slash-commands-d-g` |
| `/delay` | 将管道中的下一条命令延迟指定的毫秒数。 例： /delay 1000 | `slash-commands-d-g` |
| `/delchat` | 删除当前聊天。 | `slash-commands-d-g` |
| `/delname` | 删除所有归属于指定名称的消息。 例： /delname John | `slash-commands-d-g` |
| `/delswipe` | 删除最后一条聊天消息的备选回复。如果未提供 ID，则删除当前备选回复。 例： /delswipe 删除当前备选回复。 /delswipe 2 删除最后一条聊天消息的第二个备选回复。 | `slash-commands-d-g` |
| `/div` | Performs a division of two values and passes the result down the pipe. Can use variable names. Example: /div 10 i | `slash-commands-d-g` |

### E（16 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/echo` | Echoes the provided text to a toast message. Can be used to display informational messages or for pipes debugging. Examp… | `slash-commands-d-g` |
| `/ejs` | Execute template code | `slash-commands-d-g` |
| `/ejs-refresh` | Preload world info | `slash-commands-d-g` |
| `/event-emit` | 发送 `event` 事件, 同时可以发送一些数据. 所有正在监听该消息频道的 listener 函数都会自动运行, 并能用函数参数接收发送来的数据. 由于酒馆 STScript 输入方式的局限性, 所有数据将会以字符串 string 类型… | `slash-commands-d-g` |
| `/expression-classify` | Performs an emotion classification of the given text and returns a label. Allows to specify which Classifier API to perf… | `slash-commands-d-g` |
| `/expression-fallback` | Gets the currently selected expression fallback for all characters. If a valid expression label is sent, it will be set … | `slash-commands-d-g` |
| `/expression-folder-override` | Sets an override sprite folder for the current character. In groups, this will apply to the character who last sent a me… | `slash-commands-d-g` |
| `/expression-last` | Returns the last set expression for the named character. | `slash-commands-d-g` |
| `/expression-list` | Returns a list of available expressions, including custom expressions. | `slash-commands-d-g` |
| `/expression-set` | Force sets the expression for the current character. | `slash-commands-d-g` |
| `/expression-upload` | Upload a sprite from a URL. Example: /uploadsprite name=Seraphina label=joy /user/images/Seraphina/Seraphina_2024-12-22@… | `slash-commands-d-g` |
| `/extension-disable` | Disables a specified extension. By default, the page will be reloaded automatically, stopping any further commands. If r… | `slash-commands-d-g` |
| `/extension-enable` | Enables a specified extension. By default, the page will be reloaded automatically, stopping any further commands. If re… | `slash-commands-d-g` |
| `/extension-exists` | Checks if a specified extension exists. Example: /extension-exists SillyTavern-LALib | `slash-commands-d-g` |
| `/extension-state` | Returns the state of a specified extension (true if enabled, false if disabled). Example: /extension-state Summarize | `slash-commands-d-g` |
| `/extension-toggle` | Toggles the state of a specified extension. By default, the page will be reloaded automatically, stopping any further co… | `slash-commands-d-g` |

### F（7 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/findentry` | Find a UID of the record from the specified book using the fuzzy match of a field value (default: key) and pass it down … | `slash-commands-d-g` |
| `/flat` | 设置平面聊天模式的消息样式。 | `slash-commands-d-g` |
| `/flushglobalvar` | Deletes the specified global variable. Example: /flushglobalvar score Deletes the global variable score. | `slash-commands-d-g` |
| `/flushinject` | 移除当前聊天的脚本注入。如果没有提供 ID，则移除所有脚本注入。 | `slash-commands-d-g` |
| `/flushvar` | Delete a local variable. Example: /flushvar score | `slash-commands-d-g` |
| `/forcesave` | 强制保存当前聊天和设置 | `slash-commands-d-g` |
| `/fuzzy` | 对 list 中的每一项与 text to search 进行模糊匹配。如果有任何项目匹配，则返回其名称。如果没有项目匹配文本，则不返回任何值。 可选的 threshold（默认值为 0.4）允许控制匹配的严格程度。 较低的值（最小 0.0… | `slash-commands-d-g` |

### G（12 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/gen` | 使用提供的提示词生成文本并通过管道将其传递给下一条命令，可选择在生成时锁定用户输入，并允许配置指令模式的提示词内名称（默认为 "System"）。 "as" 参数控制输出提示词的身份：system（默认）或 char。如果 "length"… | `slash-commands-d-g` |
| `/genraw` | 使用提供的提示词生成文本并通过管道将其传递给下一条命令，可选择在生成时锁定用户输入。不包括聊天历史记录或角色卡。 使用 instruct=off 跳过指令格式化，例如 /genraw instruct=off 为什么天空是蓝色的？ Use … | `slash-commands-d-g` |
| `/getcharbook` | Get a name of the character-bound lorebook and pass it down the pipe. Returns empty string if character lorebook is not … | `slash-commands-d-g` |
| `/getchatbook` | Get a name of the chat-bound lorebook or create a new one if was unbound, and pass it down the pipe. | `slash-commands-d-g` |
| `/getchatname` | 将当前聊天文件名返回到管道中。 | `slash-commands-d-g` |
| `/getentryfield` | Get a field value (default: content) of the record with the UID from the specified book and pass it down the pipe. Examp… | `slash-commands-d-g` |
| `/getglobalbooks` | Get a list of names of the selected global lorebooks and pass it down the pipe. | `slash-commands-d-g` |
| `/getglobalvar` | Get a global variable value and pass it down the pipe. The index argument is optional. Examples: /getglobalvar height /g… | `slash-commands-d-g` |
| `/getpersonabook` | Get a name of the current persona-bound lorebook and pass it down the pipe. Returns empty string if persona lorebook is … | `slash-commands-d-g` |
| `/getpromptentry` | 获取指定提示词条目的状态。 如果 return 为 simple（默认），则如果只检索到一个值，则返回单个值；否则使用字典（如果使用了 identifier 参数）或列表。 | `slash-commands-d-g` |
| `/getvar` | Get a local variable value and pass it down the pipe. The index argument is optional. Examples: /getvar height /getvar k… | `slash-commands-d-g` |
| `/go` | 用它的名称打开与角色或群聊的聊天 | `slash-commands-d-g` |

### H（1 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/hide` | 从提示词中隐藏聊天消息。 | `slash-commands-h-m` |

### I（12 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/if` | Compares the value of the left operand a with the value of the right operand b, and if the condition yields true, then e… | `slash-commands-h-m` |
| `/impersonate` | 调用冒充响应，带有可选的附加提示词。 如果传递了 await=true 命名参数，命令将在继续之前等待冒充结束。 例： /impersonate What is the meaning of life? | `slash-commands-h-m` |
| `/import` | Import one or more closures from another Quick Reply. Only imports closures that are directly assigned a scoped variable… | `slash-commands-h-m` |
| `/incglobalvar` | Increment a global variable by 1 and pass the result down the pipe. Example: /incglobalvar score | `slash-commands-h-m` |
| `/incvar` | Increment a local variable by 1 and pass the result down the pipe. Example: /incvar score | `slash-commands-h-m` |
| `/inject` | 为当前聊天的 LLM 提示词中注入文本。需要一个唯一的注入 ID（若未指定则自动生成）。位置：主提示词"之前"，主提示词"之后"，"聊天"内，"隐藏"（默认: after）。深度：提示词的注入深度（默认：4）。身份: 聊天内注入的身份（默认… | `slash-commands-h-m` |
| `/input` | 显示带有提供的文本和输入字段的弹出窗口。 default 参数是输入字段的默认值，text 参数是要显示的文本。 例： /input default="John" placeholder="Enter your name" tooltip=… | `slash-commands-h-m` |
| `/instruct` | 按名称选择指令模式。如果尚未启用指令模式，则启用它。 如果没有提供名称且启用了指令模式，或者传递了 forceGet=true，则获取当前指令模式。 例： /instruct creative | `slash-commands-h-m` |
| `/instruct-off` | 关闭格式指引模式 | `slash-commands-h-m` |
| `/instruct-on` | 开启格式指引模式 | `slash-commands-h-m` |
| `/instruct-state` | 获取当前格式指引模式的状态。若提供了状态，则将格式指引模式设定为指定状态。 | `slash-commands-h-m` |
| `/is-mobile` | 如果当前设备是移动设备，则返回 true，否则返回 false。等同于 {{isMobile}} 宏。 | `slash-commands-h-m` |

### L（12 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/len` | Gets the length of a value and passes the result down the pipe. For strings, returns the number of characters. For lists… | `slash-commands-h-m` |
| `/let` | Declares a new variable in the current scope. Examples: /let x foo bar \| /echo {{var::x}} /let key=x foo bar \| /echo {{v… | `slash-commands-h-m` |
| `/list-gallery` | List images in the gallery of the current char / group or a specified char / group. | `slash-commands-h-m` |
| `/listinjects` | 列出当前聊天的所有脚本注入。默认在弹窗中显示注入内容。使用 return 参数来更改返回类型。 | `slash-commands-h-m` |
| `/listvar` | List registered chat variables. Displays variables in a popup by default. Use the return argument to change the return t… | `slash-commands-h-m` |
| `/loader-hide` | Hides an action loader that was shown with /loader-show. If no handle is provided, hides all active loaders. Example: /l… | `slash-commands-h-m` |
| `/loader-show` | Manually shows an action loader. Returns a handle ID that can be used with /loader-hide to hide it. Use this for fine-gr… | `slash-commands-h-m` |
| `/loader-stop` | Triggers the stop action on a specific action loader, as if the user clicked the stop button. Unlike /loader-hide, this … | `slash-commands-h-m` |
| `/loader-wrap` | Wraps a closure execution with an action loader overlay and optional toast notification. By default, the loader blocks U… | `slash-commands-h-m` |
| `/lockbg` | Locks a background for the currently selected chat | `slash-commands-h-m` |
| `/log` | Performs a logarithm operation of a value and passes the result down the pipe. Can use variable names. Example: /log i | `slash-commands-h-m` |
| `/lower` | 将提供的字符串转换为小写。 | `slash-commands-h-m` |

### M（19 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/match` | 检索给定文本中的正则表达式匹配项 返回组数组（第一个组为完全匹配）。如果正则表达式包含全局标志（即 /g），则为每个匹配项返回多个嵌套数组。如果正则表达式是全局的，如果未找到匹配项则返回 []，否则返回空字符串。 例： /let x col… | `slash-commands-h-m` |
| `/max` | Returns the maximum value of the set of values and passes the result down the pipe. Can use variable names, or a JSON ar… | `slash-commands-h-m` |
| `/member-add` | 向群聊添加成员。 例： /member-add John Doe | `slash-commands-h-m` |
| `/member-count` | 返回群人数。 | `slash-commands-h-m` |
| `/member-disable` | 禁言群成员。 | `slash-commands-h-m` |
| `/member-down` | 将群成员在列表中下移。 | `slash-commands-h-m` |
| `/member-enable` | 解除群成员禁言。 | `slash-commands-h-m` |
| `/member-get` | 获取群成员的名称、索引、ID 或头像。 | `slash-commands-h-m` |
| `/member-peek` | 在不切换聊天的情况下显示群成员角色卡。 例： /peek Gloria 显示角色名为 "Gloria" 的角色卡。 | `slash-commands-h-m` |
| `/member-remove` | 从群聊中移除成员。 例： /member-remove 2 /member-remove John Doe | `slash-commands-h-m` |
| `/member-up` | 将群成员在列表中上移。 | `slash-commands-h-m` |
| `/message-name` | Changes the name of a message sender to one of your choice. If no name is provided, just gets the current name of the me… | `slash-commands-h-m` |
| `/message-role` | Changes the role of a message sender to one of your choice. If no role is provided, just gets the current role of the me… | `slash-commands-h-m` |
| `/messages` | 以字符串形式返回指定的消息或消息范围。 使用 hidden=off 参数排除隐藏消息。 使用 role 参数按身份过滤消息。可能的值为：system、assistant、user。 例： /messages 10 返回第 10 条消息。 /… | `slash-commands-h-m` |
| `/min` | Returns the minimum value of the set of values and passes the result down the pipe. Can use variable names, or a JSON ar… | `slash-commands-h-m` |
| `/mod` | Performs a modulo operation of two values and passes the result down the pipe. Can use variable names. Example: /mod i 2 | `slash-commands-h-m` |
| `/model` | 设置当前 API 的模型。若留空，则获取当前模型名称。 | `slash-commands-h-m` |
| `/movingui` | activates a movingUI preset by name | `slash-commands-h-m` |
| `/mul` | Performs a multiplication of the set of values and passes the result down the pipe. Can use variable names, or a JSON ar… | `slash-commands-h-m` |

### N（6 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/newchat` | Start a new chat with the current character | `slash-commands-n-q` |
| `/note` | Sets an author's note for the currently selected chat if specified and returns the current note. | `slash-commands-n-q` |
| `/note-depth` | Sets an author's note depth for in-chat positioning if specified and returns the current depth. | `slash-commands-n-q` |
| `/note-frequency` | Sets an author's note insertion frequency if specified and returns the current frequency. | `slash-commands-n-q` |
| `/note-position` | Sets an author's note position if specified and returns the current position. | `slash-commands-n-q` |
| `/note-role` | Sets an author's note chat insertion role if specified and returns the current role. | `slash-commands-n-q` |

### P（24 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/panels` | 切换 UI 面板显示开关 | `slash-commands-n-q` |
| `/parser-flag` | Set a parser flag. | `slash-commands-n-q` |
| `/pass` | /pass (text) – 通过管道将文本传递给下一条命令。 例： /pass Hello world | `slash-commands-n-q` |
| `/persona-create` | Creates a new persona with the specified attributes. Returns the avatar key of the created persona. Required arguments: … | `slash-commands-n-q` |
| `/persona-delete` | Deletes a persona and its avatar from the system. If no persona argument is provided, deletes the currently active perso… | `slash-commands-n-q` |
| `/persona-duplicate` | Duplicates a persona including all its data and avatar. Returns the avatar key of the new persona. Use /persona-update a… | `slash-commands-n-q` |
| `/persona-get` | Retrieves persona data. Can return all data as JSON or a specific field value. If no persona argument is provided, uses … | `slash-commands-n-q` |
| `/persona-lock` | Locks/unlocks the current persona to a chat, character, or as the default. Returns the lock state if no value is provide… | `slash-commands-n-q` |
| `/persona-set` | Selects an existing persona by name or avatar key, or sets a temporary user name. If a matching persona exists, it will … | `slash-commands-n-q` |
| `/persona-sync` | Syncs the user persona (name and avatar) in user-attributed messages in the current chat. If from is set, only messages … | `slash-commands-n-q` |
| `/persona-update` | Updates an existing persona's attributes. Only the provided fields are changed; others are left untouched. If no persona… | `slash-commands-n-q` |
| `/pick-icon` | 打开包含所有可用 Font Awesome 图标的弹出窗口，并返回所选图标的名称。 例： /pick-icon \| /if left={{pipe}} rule=eq right=false else={: /echo chosen ico… | `slash-commands-n-q` |
| `/pm-render` | Rerenders the prompt manager content. Use this if you have made changes to the prompt entries through slash commands and… | `slash-commands-n-q` |
| `/popup` | 显示带有指定文本和按钮的阻塞弹出窗口。 返回弹出文本。 例： /popup large=on wide=on okButton="Confirm" Please confirm this action. /popup okButton="L… | `slash-commands-n-q` |
| `/pow` | Performs a power operation of two values and passes the result down the pipe. Can use variable names. Example: /pow i 2 | `slash-commands-n-q` |
| `/preset` | Sets a preset by name for the current API. Gets the current preset if no name is provided. Example: /preset myPreset /pr… | `slash-commands-n-q` |
| `/profile` | Switch to a connection profile or return the name of the current profile in no argument is provided. Use <None> to switc… | `slash-commands-n-q` |
| `/profile-create` | Create a new connection profile using the current settings. | `slash-commands-n-q` |
| `/profile-genstream` | Generates text using Connection Manager with streaming display. Shows live generation progress including reasoning (thin… | `slash-commands-n-q` |
| `/profile-get` | Get the details of the connection profile. Returns the selected profile if no argument is provided. | `slash-commands-n-q` |
| `/profile-list` | List all connection profile names. | `slash-commands-n-q` |
| `/profile-update` | Update the selected connection profile. | `slash-commands-n-q` |
| `/prompt-post-processing` | 设置 "提示词后处理" 类型。如果没有提供值，则获取当前选择。 例： /prompt-post-processing \| /echo /prompt-post-processing single | `slash-commands-n-q` |
| `/proxy` | Sets a proxy preset by name. | `slash-commands-n-q` |

### Q（21 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/qr` | Activates the specified Quick Reply | `slash-commands-n-q` |
| `/qr-arg` | Set a fallback value for a Quick Reply argument. Example: /qr-arg x foo \| /echo {{arg::x}} | `slash-commands-n-q` |
| `/qr-chat-set` | Toggle chat QR set | `slash-commands-n-q` |
| `/qr-chat-set-off` | Deactivate chat QR set | `slash-commands-n-q` |
| `/qr-chat-set-on` | Activate chat QR set | `slash-commands-n-q` |
| `/qr-contextadd` | Add a context menu preset to a QR. If id and label are both provided, id will be used. Example: /qr-contextadd set=MyQRS… | `slash-commands-n-q` |
| `/qr-contextclear` | Remove all context menu presets from a QR. If id and a label are both provided, id will be used. Example: /qr-contextcle… | `slash-commands-n-q` |
| `/qr-contextdel` | Remove context menu preset from a QR. If id and label are both provided, id will be used. Example: /qr-contextdel set=My… | `slash-commands-n-q` |
| `/qr-create` | Creates a new Quick Reply. Example: /qr-create set=MyPreset label=MyButton /echo 123 | `slash-commands-n-q` |
| `/qr-delete` | Deletes a Quick Reply from the specified set. (Label must be provided via named or unnamed argument) | `slash-commands-n-q` |
| `/qr-get` | Get a Quick Reply's properties. Examples: /qr-get set=MyPreset label=MyButton \| /echo /qr-get set=MyPreset id=42 \| /echo | `slash-commands-n-q` |
| `/qr-list` | Gets a list of the names of all quick replies in this quick reply set. | `slash-commands-n-q` |
| `/qr-set` | Toggle global QR set | `slash-commands-n-q` |
| `/qr-set-create` | Create a new preset (overrides existing ones). Example: /qr-set-add MyNewPreset | `slash-commands-n-q` |
| `/qr-set-delete` | Delete an existing preset. Example: /qr-set-delete MyPreset | `slash-commands-n-q` |
| `/qr-set-list` | Gets a list of the names of all quick reply sets. | `slash-commands-n-q` |
| `/qr-set-off` | Deactivate global QR set | `slash-commands-n-q` |
| `/qr-set-on` | Activate global QR set | `slash-commands-n-q` |
| `/qr-set-update` | Update an existing preset. Example: /qr-set-update enabled=false MyPreset | `slash-commands-n-q` |
| `/qr-update` | Updates Quick Reply. Example: /qr-update set=MyPreset label=MyButton newlabel=MyRenamedButton /echo 123 | `slash-commands-n-q` |
| `/qrset` | DEPRECATED – The command /qrset has been deprecated. Use /qr-set, /qr-set-on, and /qr-set-off instead. | `slash-commands-n-q` |

### R（23 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/rand` | Returns a random number between from and to (inclusive). Examples: /rand Returns a random number between 0 and 1. /rand … | `slash-commands-r-s` |
| `/random` | Start a new chat with a random character. If an argument is provided, only considers characters that have the specified … | `slash-commands-r-s` |
| `/reasoning-collapse` | Collapse the reasoning block of a message or range of messages. | `slash-commands-r-s` |
| `/reasoning-expand` | Expand the reasoning block of a message or range of messages. | `slash-commands-r-s` |
| `/reasoning-format` | Formats reasoning and content into a single string using Reasoning Formatting settings. Useful for preparing text that c… | `slash-commands-r-s` |
| `/reasoning-get` | 获取消息的推理块内容。若其没有推理块，则返回一个空字符串。 | `slash-commands-r-s` |
| `/reasoning-parse` | 使用推理格式设置从字符串中提取推理块。 | `slash-commands-r-s` |
| `/reasoning-set` | 设置消息的推理块内容。返回推理块内容。 | `slash-commands-r-s` |
| `/reasoning-template` | Selects a reasoning template by name, using fuzzy search to find the closest match. Gets the current template if no name… | `slash-commands-r-s` |
| `/reasoning-toggle` | Toggle the reasoning block of a message or range of messages. Expanded blocks will be collapsed, and collapsed blocks wi… | `slash-commands-r-s` |
| `/regenerate` | Regenerates the latest reply in the chat. If await=true named argument is passed, the command will await for the regener… | `slash-commands-r-s` |
| `/regex` | Runs a Regex extension script by name on the provided string. The script must be enabled. | `slash-commands-r-s` |
| `/regex-preset` | 根据名称或 ID 选择一个正则预设。如果没有提供参数，则获取当前正则预设的 ID。 | `slash-commands-r-s` |
| `/regex-state` | Returns the current state of a regex script. | `slash-commands-r-s` |
| `/regex-toggle` | Toggles the state of a specified regex script. Example: /regex-toggle MyScript /regex-toggle state=off Character-specifi… | `slash-commands-r-s` |
| `/reload-page` | Reloads the current page. All further commands will not be processed. | `slash-commands-r-s` |
| `/rename-char` | 重命名当前角色。 | `slash-commands-r-s` |
| `/renamechat` | 重命名当前聊天。 | `slash-commands-r-s` |
| `/replace` | 根据模式替换提供的字符串中的文本。 如果 mode 为 literal（或省略），则 pattern 为字面量搜索字符串（区分大小写）。 如果 mode 为 regex，则将 pattern 解析为 ECMAScript 正则表达式。 re… | `slash-commands-r-s` |
| `/reroll-pick` | 重新随机选择当前聊天中的所有 {{pick}} 宏选项。 {{pick}} 宏通常在每个聊天中保持稳定的选择。此命令更改用于所有选择的种子，导致它们解析为（可能）不同的值。 如果提供了数字，则将种子设置为该值。否则，将当前种子增加 1。 例… | `slash-commands-r-s` |
| `/resetpanels` | resets UI panels to original state | `slash-commands-r-s` |
| `/round` | Rounds a value and passes the result down the pipe. Can use variable names. Example: /round i | `slash-commands-r-s` |
| `/run` | 运行来自作用域变量的闭包，或来自当前活动预设或另一个预设的具有指定名称的快捷回复。 命名参数可以在 QR 中用 {{arg::key}} 引用。 | `slash-commands-r-s` |

### S（31 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/secret-delete` | Deletes a secret key by ID. | `slash-commands-r-s` |
| `/secret-id` | Sets the ID of a currently active secret key. Gets the ID of the secret key if no value is provided. | `slash-commands-r-s` |
| `/secret-read` | Reads a secret key by ID. If key exposure is disabled, this command will not work! | `slash-commands-r-s` |
| `/secret-rename` | Renames a secret key by ID. | `slash-commands-r-s` |
| `/secret-write` | Writes a secret key with a value and an optional label. | `slash-commands-r-s` |
| `/send` | 向聊天记录添加用户消息，而不触发生成。 如果 compact 设置为 true，则使用紧凑布局发送消息。 如果设置了 name，它将显示为消息发送者。可以为空以表示没有名称。 例： /send Hello there! /send comp… | `slash-commands-r-s` |
| `/sendas` | 作为特定角色发送消息。如果字符列表中存在角色头像，则使用该头像。 例： /sendas name="Chloe" Hello, guys! 将从 "Chloe" 发送 "Hello, guys!"。 /sendas name="Chloe"… | `slash-commands-r-s` |
| `/setentryfield` | Set a field value (default: content) of the record with the UID from the specified book. To set multiple values for key … | `slash-commands-r-s` |
| `/setglobalvar` | Set a global variable value and pass it down the pipe. The index argument is optional. To convert the value to a specifi… | `slash-commands-r-s` |
| `/setinput` | 将用户输入设置为指定文本，并通过管道将其传递给下一条命令。 例： /setinput Hello world | `slash-commands-r-s` |
| `/setpromptentry` | 开启或关闭指定的提示词管理器条目。 | `slash-commands-r-s` |
| `/setvar` | Set a local variable value and pass it down the pipe. The index argument is optional. To convert the value to a specific… | `slash-commands-r-s` |
| `/show-gallery` | Shows the gallery. | `slash-commands-r-s` |
| `/sin` | Performs a sine operation of a value and passes the result down the pipe. Can use variable names. Example: /sin i | `slash-commands-r-s` |
| `/single` | 设置消息样式为单文档样式，不显示名称或头像。 | `slash-commands-r-s` |
| `/sort` | Sorts a list or dictionary in ascending order and passes the result down the pipe. For lists, returns the list sorted by… | `slash-commands-r-s` |
| `/sqrt` | Performs a square root operation of a value and passes the result down the pipe. Can use variable names. Example: /sqrt … | `slash-commands-r-s` |
| `/st-api-manager` | 打开 ST-ApiManager 面板 | `slash-commands-r-s` |
| `/start-reply-with` | Sets a "Start Reply With". Gets the current value if no value is provided. Use a "force" argument to force set an empty … | `slash-commands-r-s` |
| `/stop` | 若当前正在运行，则停止所有生成和流式传输。 注意：此命令无法从聊天输入执行，因为在生成期间会阻止从那里发送任何消息或脚本。但它可以通过自动化或 QR 脚本/按钮执行。 | `slash-commands-r-s` |
| `/stop-strings` | Sets a list of custom stopping strings. Gets the list if no value is provided. Use a "force" argument to force set an em… | `slash-commands-r-s` |
| `/sub` | Performs a subtraction of the set of values and passes the result down the pipe. Can use variable names, or a JSON array… | `slash-commands-r-s` |
| `/substr` | 从提供的字符串中提取文本。 如果省略 start，则视为 0。 如果 start < 0，则从字符串末尾开始计数。 如果 start >= 字符串长度，则返回空字符串。 如果省略 end，或者 end >= 字符串长度，则提取到字符串末尾。… | `slash-commands-r-s` |
| `/swipe` | Swipes the latest reply. Defaults to direction=right; use direction=left to go to the previous reply. If no next swipe e… | `slash-commands-r-s` |
| `/sys` | 作为系统旁白发送消息。 如果 compact 设置为 true，则使用紧凑布局发送消息。 例： /sys The sun sets in the west. /sys compact=true A brief note. | `slash-commands-r-s` |
| `/sysgen` | 使用指定提示词生成系统消息。 | `slash-commands-r-s` |
| `/sysname` | 设置此聊天中未来旁白的名称（仅显示）。默认：系统。留空以重置。 | `slash-commands-r-s` |
| `/sysprompt` | Selects a system prompt by name, using fuzzy search to find the closest match. Gets the current system prompt if no name… | `slash-commands-r-s` |
| `/sysprompt-off` | Disables system prompt | `slash-commands-r-s` |
| `/sysprompt-on` | Enables system prompt. | `slash-commands-r-s` |
| `/sysprompt-state` | Gets the current system prompt state. If an argument is provided, it will set the system prompt state. | `slash-commands-r-s` |

### T（23 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/tag-add` | Adds a tag to the character. If no character is provided, it adds it to the current character ({{char}}). If the tag doe… | `slash-commands-t-z` |
| `/tag-exists` | Checks whether the given tag is assigned to the character. If no character is provided, it checks the current character … | `slash-commands-t-z` |
| `/tag-import` | Imports character card tags as SillyTavern tags for folder/filter use. Character cards can have embedded tags (set via t… | `slash-commands-t-z` |
| `/tag-list` | Lists all assigned tags of the character. If no character is provided, it uses the current character ({{char}}). Note th… | `slash-commands-t-z` |
| `/tag-remove` | Removes a tag from the character. If no character is provided, it removes it from the current character ({{char}}). Exam… | `slash-commands-t-z` |
| `/tempchat` | 和助手临时聊天。 | `slash-commands-t-z` |
| `/test` | 测试文本是否匹配正则表达式。 如果找到匹配项，则返回 true，否则返回 false。 例： /let x Blue house and green car \|\| /test pattern="green" {{var::x}} \| /ec… | `slash-commands-t-z` |
| `/theme` | Sets a UI theme by name. If no theme name is is provided, this will return the currently active theme. Example: /theme C… | `slash-commands-t-z` |
| `/times` | Execute any valid slash command enclosed in quotes repeats number of times. Examples: /setvar key=i 1 \| /times 5 "/addva… | `slash-commands-t-z` |
| `/tlg_anchor` | 凝固当前因果刻度 | `slash-commands-t-z` |
| `/tlg_filter` | 切换记忆视野滤镜 | `slash-commands-t-z` |
| `/tlg_world` | 打开世界档案面板 | `slash-commands-t-z` |
| `/tokenizer` | 按名称选择分词器。如果没有提供名称，则获取当前分词器。 可用的分词器： best_match, none, gpt2, llama, llama3, gemma, jamba, qwen2, command_r, command_a, ne… | `slash-commands-t-z` |
| `/tokens` | 统计给定文本中的 Token 数量。 | `slash-commands-t-z` |
| `/tools-invoke` | Invokes a registered tool by name. The parameters argument MUST be a JSON-serialized object. | `slash-commands-t-z` |
| `/tools-list` | Gets a list of all registered tools in the OpenAI function JSON format. Use the return argument to specify the return va… | `slash-commands-t-z` |
| `/tools-register` | Registers a new tool with the tool registry. The parameters argument MUST be a JSON-serialized object with a valid JSON … | `slash-commands-t-z` |
| `/tools-unregister` | Unregisters a tool from the tool registry. | `slash-commands-t-z` |
| `/translate` | Translate text to a target language. If target language is not provided, the value from the extension settings will be u… | `slash-commands-t-z` |
| `/trigger` | 触发消息生成。如果在群聊中，可以为指定索引或名字的群成员触发消息。 如果传递了 await=true 命名参数，命令将在继续之前等待触发的生成。 | `slash-commands-t-z` |
| `/trimend` | 将文本修剪到最后一个完整句子的末尾。 | `slash-commands-t-z` |
| `/trimstart` | 将文本修剪到第一个完整句子的开头。 例： /trimstart This is a sentence. And here is another sentence. | `slash-commands-t-z` |
| `/trimtokens` | 将文本的开头或结尾修剪为指定的 Token 数量。 例： /trimtokens limit=5 direction=start This is a long sentence with many words | `slash-commands-t-z` |

### U（3 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/unhide` | 从提示词中取消隐藏消息。 | `slash-commands-t-z` |
| `/unlockbg` | Unlocks a background for the currently selected chat | `slash-commands-t-z` |
| `/upper` | 将提供的字符串转换为大写。 | `slash-commands-t-z` |

### V（8 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/var` | Get or set a variable. Use index to access elements of a JSON-serialized list or dictionary. To convert the value to a s… | `slash-commands-t-z` |
| `/vector-chats-state` | Set whether chat vectorization is enabled or return the current boolean if no argument is provided | `slash-commands-t-z` |
| `/vector-files-state` | Set whether file vectorization is enabled or return the current boolean if no argument is provided | `slash-commands-t-z` |
| `/vector-max-entries` | Set the vector world info max entries or returns the current max entries if no argument is provided | `slash-commands-t-z` |
| `/vector-query` | Set the vector query messages or returns the current query messages count if no argument is provided | `slash-commands-t-z` |
| `/vector-threshold` | Set the vector score threshold or return the current threshold if no argument is provided. | `slash-commands-t-z` |
| `/vector-worldinfo-state` | Set whether world info vectorization is enabled or return the current boolean if no argument is provided | `slash-commands-t-z` |
| `/vn` | Swaps Visual Novel Mode On/Off | `slash-commands-t-z` |

### W（4 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/while` | Compares the value of the left operand a with the value of the right operand b, and if the condition yields true, then e… | `slash-commands-t-z` |
| `/wi-get-timed-effect` | Get the current state of the timed effect for the record with the UID from the specified book. Example: /wi-get-timed-ef… | `slash-commands-t-z` |
| `/wi-set-timed-effect` | Set a timed effect for the record with the UID from the specified book. The duration must be set in the entry itself. Wi… | `slash-commands-t-z` |
| `/world` | Sets active World, or unsets if no args provided, use state=off and state=toggle to deactivate or toggle a World, use si… | `slash-commands-t-z` |

### Y（1 条）

| 命令 | 说明 | 全文所在 |
| --- | --- | --- |
| `/yt-script` | Scrape a transcript from a YouTube video by ID or URL. | `slash-commands-t-z` |


## 编写插件时怎么用

- 想在插件里调用 ST 能力，优先"复用已有命令"而不是自己重写：先在这里搜关键词（如"world"、"var"、"audio"），再在插件里用 `ctx.executeSlashCommandsWithOptions('/命令 ...')`。
- 命令的命名参数一律写成 `key=value`；位置参数按 `(...)` 顺序给。
- 与插件自己注册的命令（见 `15-slash-commands`）区分：这里是 ST 内置命令，插件自定义命令要用带前缀的名字避免冲突。
