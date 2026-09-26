---
title: 斜杠命令：h–m
category: reference
tags: slash-commands, reference, st-core
summary: ST 核心斜杠命令中「首字母 H/I/J/K/L/M」的 44 条命令（含命名参数/位置参数与说明原文）：/hide /if /impersonate /import /incglobalvar /incvar /inject /input /instruct /instruct-off 等。
sources: [slash_command.txt (行 112-155)]
---

# 斜杠命令：h–m

来源：`slash_command.txt`（ST 核心斜杠命令清单，首字母 H/I/J/K/L/M），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 44 条命令。每条命令的格式：`/命令名 [命名参数] (位置参数) // 说明`，`?` 表示可选参数，`| ` 表示枚举取值。

## /hide

/hide [name=string]? (number|range)? // 从提示词中隐藏聊天消息。

## /if

/if [left=varname|string|number] [right=varname|string|number]? [rule=eq|neq|in|nin|gt|gte|lt|lte|not]?=eq [else=closure|subcommand]? (closure|subcommand) // Compares the value of the left operand a with the value of the right operand b, and if the condition yields true, then execute any valid slash command enclosed in quotes and pass the result of the command execution down the pipe. Numeric values and string literals for left and right operands supported. If the rule is not provided, it defaults to eq. If no right operand is provided, it defaults to checking the left value to be truthy. A non-empty string or non-zero number is considered truthy, as is the value true or on. Only acceptable rules for no provided right operand are not, and no provided rule - which default to returning whether it is not or is truthy. Available rules: eq => a == b (strings & numbers) neq => a !== b (strings & numbers) in => a includes b (strings & numbers as strings) nin => a not includes b (strings & numbers as strings) gt => a > b (numbers) gte => a >= b (numbers) lt => a < b (numbers) lte => a <= b (numbers) not => !a (truthy) Examples: /if left=score right=10 rule=gte "/speak You win" triggers a /speak command if the value of "score" is greater or equals 10. /if left={{lastMessage}} rule=in right=surprise {: /echo SURPISE! :} executes a subcommand defined as a closure if the given value contains a specified word. /if left=myContent {: /echo My content had some content. :} executes the defined subcommand, if the provided value of left is truthy (contains some kind of contant that is not empty or false) /if left=tree right={{getvar::object}} {: /echo The object is a tree! :} executes the defined subcommand, if the left and right values are equals.

## /impersonate

/impersonate [await=true|false]?=false (string)? // 调用冒充响应，带有可选的附加提示词。 如果传递了 await=true 命名参数，命令将在继续之前等待冒充结束。 例： /impersonate What is the meaning of life?

## /import

/import [from=string] (...string) // Import one or more closures from another Quick Reply. Only imports closures that are directly assigned a scoped variable via /let or /var. Examples: /import from=LibraryQrSet.FooBar foo | /:foo /import from=LibraryQrSet.FooBar foo bar | /:foo | /:bar /import from=LibraryQrSet.FooBar foo as x bar as y | /:x | /:y

## /incglobalvar

/incglobalvar (varname) // Increment a global variable by 1 and pass the result down the pipe. Example: /incglobalvar score

## /incvar

/incvar (varname) // Increment a local variable by 1 and pass the result down the pipe. Example: /incvar score

## /inject

/inject [id=string]? [position=before|after|chat|none]?=after [depth=number]?=4 [scan=true|false]?=false [role=system|assistant|user]? [ephemeral=true|false]?=false [filter=closure]? (string)? // 为当前聊天的 LLM 提示词中注入文本。需要一个唯一的注入 ID（若未指定则自动生成）。位置：主提示词"之前"，主提示词"之后"，"聊天"内，"隐藏"（默认: after）。深度：提示词的注入深度（默认：4）。身份: 聊天内注入的身份（默认：system）。扫描：将注入内容也纳入世界书扫描（默认：false）。"隐藏" 则不会被注入到提示词，但是可以用于触发世界书条目。返回注入 ID。

## /input

/input [default=string]? [large=on|off]?=off [wide=on|off]?=off [okButton=string]?=Ok [rows=number]? [placeholder=string]? [tooltip=string]? [onSuccess=closure]? [onCancel=closure]? (string)? // 显示带有提供的文本和输入字段的弹出窗口。 default 参数是输入字段的默认值，text 参数是要显示的文本。 例： /input default="John" placeholder="Enter your name" tooltip="Your display name" What is your name?

## /instruct

/instruct [quiet=true|false]?=false [forceGet=true|false]?=false (string)? // 按名称选择指令模式。如果尚未启用指令模式，则启用它。 如果没有提供名称且启用了指令模式，或者传递了 forceGet=true，则获取当前指令模式。 例： /instruct creative

## /instruct-off

/instruct-off // 关闭格式指引模式

## /instruct-on

/instruct-on // 开启格式指引模式

## /instruct-state

/instruct-state (true|false)? // 获取当前格式指引模式的状态。若提供了状态，则将格式指引模式设定为指定状态。

## /is-mobile

/is-mobile // 如果当前设备是移动设备，则返回 true，否则返回 false。等同于 {{isMobile}} 宏。

## /len

/len (string|number|list|dictionary) // Gets the length of a value and passes the result down the pipe. For strings, returns the number of characters. For lists and dictionaries, returns the number of elements. For numbers, returns the number of digits (including the sign and decimal point). Example: /len Lorem ipsum | /echo

## /let

/let [key=varname]? (varname)? (string|number|bool|list|dictionary|closure)? // Declares a new variable in the current scope. Examples: /let x foo bar | /echo {{var::x}} /let key=x foo bar | /echo {{var::x}} /let y

## /list-gallery

/list-gallery [char=string]? [group=string]? // List images in the gallery of the current char / group or a specified char / group.

## /listinjects

/listinjects [return=object|chat-html|popup-html|toast-html|console|none]?=popup-html // 列出当前聊天的所有脚本注入。默认在弹窗中显示注入内容。使用 return 参数来更改返回类型。

## /listvar

/listvar [scope=all|local|global]?=all [return=object|chat-html|popup-html|toast-html|console|none]?=popup-html // List registered chat variables. Displays variables in a popup by default. Use the return argument to change the return type.

## /loader-hide

/loader-hide [handle=string]? // Hides an action loader that was shown with /loader-show. If no handle is provided, hides all active loaders. Example: /loader-hide handle={{getvar::myLoader}}

## /loader-show

/loader-show [blocking=true|false]?=true [toast=none|static|stoppable]?=stoppable [message=string]?=Generating... [title=string]? [slug=string]?=slash-show [stopTooltip=string]?=Stop [onStop=closure]? [onHide=closure]? // Manually shows an action loader. Returns a handle ID that can be used with /loader-hide to hide it. Use this for fine-grained control when you need to show/hide the loader at specific points. Multiple loaders can be stacked - each gets its own toast, but the overlay stays single. Toast modes: stoppable - Shows toast with a stop button (default) static - Shows toast without stop button none - No toast, only loader overlay Set blocking=false to show only a toast without blocking the UI. Useful for background operations like image captioning or generation. The default stop behavior is calling stopGeneration(). If the wrapped action is doing something different than generating, a custom stop closure can be provided. Example: /loader-show message="Loading..." | /setvar key=myLoader | /some-operation | /loader-hide handle={{getvar::myLoader}}

## /loader-stop

/loader-stop [handle=string] // Triggers the stop action on a specific action loader, as if the user clicked the stop button. Unlike /loader-hide, this command requires a handle - you must specify which loader to stop. Example: /loader-stop handle={{getvar::myLoader}}

## /loader-wrap

/loader-wrap [blocking=true|false]?=true [toast=none|static|stoppable]?=stoppable [message=string]?=Generating... [title=string]? [slug=string]?=slash-wrap [stopTooltip=string]?=Stop [onStop=closure]? (closure) // Wraps a closure execution with an action loader overlay and optional toast notification. By default, the loader blocks UI interaction until the closure completes. Multiple loaders can be stacked - each gets its own toast, but the overlay stays single. Toast modes: stoppable - Shows toast with a stop button (default) static - Shows toast without stop button none - No toast, only loader overlay Set blocking=false to show only a toast without blocking the UI. Useful for background operations like image captioning or generation. The default stop behavior is calling stopGeneration(). If the wrapped action is doing something different than generating, a custom stop closure can be provided. Examples: /loader-wrap message="Generating summary..." {: /gen Summary of the last message | /echo Done :} /loader-wrap blocking=false message="Captioning..." {: /caption :} /loader-wrap toast=stoppable onStop={: /echo "Stopped by user" :} {: /delay 10000 :}

## /lockbg

/lockbg // Locks a background for the currently selected chat

## /log

/log (number|varname) // Performs a logarithm operation of a value and passes the result down the pipe. Can use variable names. Example: /log i

## /lower

/lower (string) // 将提供的字符串转换为小写。

## /match

/match [pattern=string] (string) // 检索给定文本中的正则表达式匹配项 返回组数组（第一个组为完全匹配）。如果正则表达式包含全局标志（即 /g），则为每个匹配项返回多个嵌套数组。如果正则表达式是全局的，如果未找到匹配项则返回 []，否则返回空字符串。 例： /let x color_green green lamp color_blue                                                                            || /match pattern="green" {{var::x}}            | /echo  |/# [ "green" ]                                               || /match pattern="color_(\w+)" {{var::x}}      | /echo  |/# [ "color_green", "green" ]                                || /match pattern="/color_(\w+)/g" {{var::x}}   | /echo  |/# [ [ "color_green", "green" ], [ "color_blue", "blue" ] ]  || /match pattern="orange" {{var::x}}           | /echo  |/#                                                           || /match pattern="/orange/g" {{var::x}}        | /echo  |/# []                                                        ||

## /max

/max (...number|varname|list) // Returns the maximum value of the set of values and passes the result down the pipe. Can use variable names, or a JSON array consisting of numbers and variables (with quotes). Examples: /max 10 i 30 j /max ["count", 15, 2, "i"]

## /member-add

/member-add (string) // 向群聊添加成员。 例： /member-add John Doe

## /member-count

/member-count // 返回群人数。

## /member-disable

/member-disable (number|string) // 禁言群成员。

## /member-down

/member-down (number|string) // 将群成员在列表中下移。

## /member-enable

/member-enable (number|string) // 解除群成员禁言。

## /member-get

/member-get [field=name|index|avatar|id]=name (number|string) // 获取群成员的名称、索引、ID 或头像。

## /member-peek

/member-peek (number|string) // 在不切换聊天的情况下显示群成员角色卡。 例： /peek Gloria 显示角色名为 "Gloria" 的角色卡。

## /member-remove

/member-remove (number|string) // 从群聊中移除成员。 例： /member-remove 2 /member-remove John Doe

## /member-up

/member-up (number|string) // 将群成员在列表中上移。

## /message-name

/message-name [at=number]? (string)? // Changes the name of a message sender to one of your choice. If no name is provided, just gets the current name of the message sender. If no index is provided, the last message is chosen. Example: /message-name | /echo Will output the name of the sender of the last message. /message-name at=-2 "Chloe" Will change the third message from the bottom to be sent by "Chloe".

## /message-role

/message-role [at=number]? (string)? // Changes the role of a message sender to one of your choice. If no role is provided, just gets the current role of the message sender. If no index is provided, the last message is chosen. Example: /message-role | /echo Will output the role of the sender of the last message. /message-role at=-2 assistant Will change the third message from the bottom to be sent by the assistant.

## /messages

/messages [names=on|off]?=off [hidden=on|off]?=on [role=system|assistant|user]? (number|range) // 以字符串形式返回指定的消息或消息范围。 使用 hidden=off 参数排除隐藏消息。 使用 role 参数按身份过滤消息。可能的值为：system、assistant、user。 例： /messages 10 返回第 10 条消息。 /messages names=on 5-10 返回第 5 到第 10 条消息及作者姓名。

## /min

/min (...number|varname|list) // Returns the minimum value of the set of values and passes the result down the pipe. Can use variable names, or a JSON array consisting of numbers and variables (with quotes). Example: /min 10 i 30 j /min ["count", 15, 2, "i"]

## /mod

/mod (number|varname) (number|varname) // Performs a modulo operation of two values and passes the result down the pipe. Can use variable names. Example: /mod i 2

## /model

/model [quiet=true|false]?=false (string)? // 设置当前 API 的模型。若留空，则获取当前模型名称。

## /movingui

/movingui (string) // activates a movingUI preset by name

## /mul

/mul (...number|varname|list) // Performs a multiplication of the set of values and passes the result down the pipe. Can use variable names, or a JSON array consisting of numbers and variables (with quotes). Examples: /mul 10 i 30 j /mul ["count", 15, 2, "i"]
