---
title: 斜杠命令：t–z
category: reference
tags: slash-commands, reference, st-core
summary: ST 核心斜杠命令中「首字母 T/U/V/W/X/Y/Z」的 39 条命令（含命名参数/位置参数与说明原文）：/tag-add /tag-exists /tag-import /tag-list /tag-remove /tempchat /test /theme /times /tlg_anchor 等。
sources: [slash_command.txt (行 261-299)]
---

# 斜杠命令：t–z

来源：`slash_command.txt`（ST 核心斜杠命令清单，首字母 T/U/V/W/X/Y/Z），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 39 条命令。每条命令的格式：`/命令名 [命名参数] (位置参数) // 说明`，`?` 表示可选参数，`| ` 表示枚举取值。

## /tag-add

/tag-add [name=string]?={{char}} (string) // Adds a tag to the character. If no character is provided, it adds it to the current character ({{char}}). If the tag doesn't exist, it is created. Example: /tag-add name="Chloe" scenario will add the tag "scenario" to the character named Chloe.

## /tag-exists

/tag-exists [name=string]?={{char}} (string) // Checks whether the given tag is assigned to the character. If no character is provided, it checks the current character ({{char}}). Example: /tag-exists name="Chloe" scenario will return true if the character named Chloe has the tag "scenario".

## /tag-import

/tag-import [name=string]?={{char}} [mode=all|existing|none|ask]? // Imports character card tags as SillyTavern tags for folder/filter use. Character cards can have embedded tags (set via tags argument in /char-create or /char-update). This command imports those embedded tags as ST tags that can be used for filtering and organizing characters. If no mode is specified, uses your saved tag import setting from preferences. 例： /tag-import Imports tags for the current character using your default setting. /tag-import name="Alice" mode=all Imports all of Alice's card tags, creating new ST tags if needed.

## /tag-list

/tag-list [name=string]?={{char}} // Lists all assigned tags of the character. If no character is provided, it uses the current character ({{char}}). Note that there is no special handling for tags containing commas, they will be printed as-is. Example: /tag-list name="Chloe" could return something like OC, scenario, edited, funny

## /tag-remove

/tag-remove [name=string]?={{char}} (string) // Removes a tag from the character. If no character is provided, it removes it from the current character ({{char}}). Example: /tag-remove name="Chloe" scenario will remove the tag "scenario" from the character named Chloe.

## /tempchat

/tempchat // 和助手临时聊天。

## /test

/test [pattern=string] (string) // 测试文本是否匹配正则表达式。 如果找到匹配项，则返回 true，否则返回 false。 例： /let x Blue house and green car                         || /test pattern="green" {{var::x}}    | /echo  |/# true   || /test pattern="blue" {{var::x}}     | /echo  |/# false  || /test pattern="/blue/i" {{var::x}}  | /echo  |/# true   ||

## /theme

/theme (string)? // Sets a UI theme by name. If no theme name is is provided, this will return the currently active theme. Example: /theme Cappuccino /theme

## /times

/times [guard=on|off]? (number) (closure|subcommand) // Execute any valid slash command enclosed in quotes repeats number of times. Examples: /setvar key=i 1 | /times 5 "/addvar key=i 1" adds 1 to the value of "i" 5 times. /times 4 "/echo {{timesIndex}}" echos the numbers 0 through 4. {{timesIndex}} is replaced with the iteration number (zero-based). Loops are limited to 100 iterations by default, pass guard=off to disable.

## /tlg_anchor

/tlg_anchor // 凝固当前因果刻度

## /tlg_filter

/tlg_filter // 切换记忆视野滤镜

## /tlg_world

/tlg_world // 打开世界档案面板

## /tokenizer

/tokenizer (best_match|none|gpt2|llama|llama3|gemma|jamba|qwen2|command_r|command_a|nerd|nerd2|mistral|nemo|yi|claude|deepseek|api_current)? // 按名称选择分词器。如果没有提供名称，则获取当前分词器。 可用的分词器： best_match, none, gpt2, llama, llama3, gemma, jamba, qwen2, command_r, command_a, nerd, nerd2, mistral, nemo, yi, claude, deepseek, api_current

## /tokens

/tokens (string) // 统计给定文本中的 Token 数量。

## /tools-invoke

/tools-invoke [parameters=dictionary] (string) // Invokes a registered tool by name. The parameters argument MUST be a JSON-serialized object.

## /tools-list

/tools-list [return=pipe|object|toast-html|toast-text|console|none]?=none // Gets a list of all registered tools in the OpenAI function JSON format. Use the return argument to specify the return value type.

## /tools-register

/tools-register [name=string] [description=string] [parameters=dictionary] [displayName=string]? [formatMessage=closure] [shouldRegister=closure]? [stealth=true|false]?=false (closure) // Registers a new tool with the tool registry. The parameters argument MUST be a JSON-serialized object with a valid JSON schema. The unnamed argument MUST be a closure that accepts the function parameters as local script variables. See json-schema.org and OpenAI Function Calling for more information. Example: /let key=echoSchema { "$schema": "http://json-schema.org/draft-04/schema#", "type": "object", "properties": { "message": { "type": "string", "description": "The message to echo." } }, "required": [ "message" ] } || /tools-register name=Echo description="Echoes a message. Call when the user is asking to repeat something" parameters={{var::echoSchema}} {: /echo {{var::arg.message}} :}

## /tools-unregister

/tools-unregister (string) // Unregisters a tool from the tool registry.

## /translate

/translate [target=af|sq|am|ar|hy|az|eu|be|bn|bs|bg|ca|ceb|zh-CN|zh-TW|co|hr|cs|da|nl|en|eo|et|fi|fr|fy|gl|ka|de|el|gu|ht|ha|haw|iw|hi|hmn|hu|is|ig|id|ga|it|ja|jw|kn|kk|km|ko|ku|ky|lo|la|lv|lt|lb|mk|mg|ms|ml|mt|mi|mr|mn|my|ne|no|ny|ps|fa|pl|pt-PT|pt-BR|pa|ro|ru|sm|gd|sr|st|sn|sd|si|sk|sl|so|es|su|sw|sv|tl|tg|ta|te|th|tr|uk|ur|uz|vi|cy|xh|yi|yo|zu]? [provider=string]? (string) // Translate text to a target language. If target language is not provided, the value from the extension settings will be used.

## /trigger

/trigger [await=true|false]?=false (number|string)? // 触发消息生成。如果在群聊中，可以为指定索引或名字的群成员触发消息。 如果传递了 await=true 命名参数，命令将在继续之前等待触发的生成。

## /trimend

/trimend (string) // 将文本修剪到最后一个完整句子的末尾。

## /trimstart

/trimstart (string) // 将文本修剪到第一个完整句子的开头。 例： /trimstart This is a sentence. And here is another sentence.

## /trimtokens

/trimtokens [limit=number] [direction=start|end] (string)? // 将文本的开头或结尾修剪为指定的 Token 数量。 例： /trimtokens limit=5 direction=start This is a long sentence with many words

## /unhide

/unhide [name=string]? (number|range)? // 从提示词中取消隐藏消息。

## /unlockbg

/unlockbg // Unlocks a background for the currently selected chat

## /upper

/upper (string) // 将提供的字符串转换为大写。

## /var

/var [key=varname]? [index=number]? [as=string]?=string (varname)? (string|number|bool|list|dictionary|closure)? // Get or set a variable. Use index to access elements of a JSON-serialized list or dictionary. To convert the value to a specific JSON type when using with index, use the as argument. Examples: /let x foo | /var x foo bar | /var x | /echo /let x foo | /var key=x foo bar | /var x | /echo /let x {} | /var index=cool as=number x 1337 | /echo {{var::x}}

## /vector-chats-state

/vector-chats-state (true|false)? // Set whether chat vectorization is enabled or return the current boolean if no argument is provided

## /vector-files-state

/vector-files-state (true|false)? // Set whether file vectorization is enabled or return the current boolean if no argument is provided

## /vector-max-entries

/vector-max-entries (number)? // Set the vector world info max entries or returns the current max entries if no argument is provided

## /vector-query

/vector-query (number)? // Set the vector query messages or returns the current query messages count if no argument is provided

## /vector-threshold

/vector-threshold (number)? // Set the vector score threshold or return the current threshold if no argument is provided.

## /vector-worldinfo-state

/vector-worldinfo-state (true|false)? // Set whether world info vectorization is enabled or return the current boolean if no argument is provided

## /vn

/vn // Swaps Visual Novel Mode On/Off

## /while

/while [left=varname|string|number] [right=varname|string|number]? [rule=eq|neq|in|nin|gt|gte|lt|lte|not]?=eq [guard=on|off]?=off (closure|subcommand) // Compares the value of the left operand a with the value of the right operand b, and if the condition yields true, then execute any valid slash command enclosed in quotes. Numeric values and string literals for left and right operands supported. Available rules: eq => a == b (strings & numbers) neq => a !== b (strings & numbers) in => a includes b (strings & numbers as strings) nin => a not includes b (strings & numbers as strings) gt => a > b (numbers) gte => a >= b (numbers) lt => a < b (numbers) lte => a <= b (numbers) not => !a (truthy) Examples: /setvar key=i 0 | /while left=i right=10 rule=lte "/addvar key=i 1" adds 1 to the value of "i" until it reaches 10. /while left={{getvar::currentword}} {: /setvar key=currentword {: /do-something-and-return :}() | /echo The current work is "{{getvar::currentword}}" :} executes the defined subcommand as long as the "currentword" variable is truthy (has any content that is not false/empty) Loops are limited to 100 iterations by default, pass guard=off to disable.

## /wi-get-timed-effect

/wi-get-timed-effect [file=string] [effect=string] [format=bool|number]?=bool (string) // Get the current state of the timed effect for the record with the UID from the specified book. Example: /wi-get-timed-effect file=chatLore format=bool effect=sticky 123 - returns true or false if the effect is active or not /wi-get-timed-effect file=chatLore format=number effect=sticky 123 - returns the remaining duration of the effect, or 0 if inactive

## /wi-set-timed-effect

/wi-set-timed-effect [file=string] [uid=string] [effect=string] (on|off|toggle) // Set a timed effect for the record with the UID from the specified book. The duration must be set in the entry itself. Will only be applied for the current chat. Enabling an effect that was already active refreshes the duration. If the last chat message is swiped or deleted, the effect will be removed. Example: /wi-set-timed-effect file=chatLore uid=123 effect=sticky on

## /world

/world [state=on|off|toggle]? [silent=true|false]? (string)? // Sets active World, or unsets if no args provided, use state=off and state=toggle to deactivate or toggle a World, use silent=true to suppress toast messages.

## /yt-script

/yt-script [lang=aa|ab|ae|af|ak|am|an|ar|as|av|ay|az|ba|be|bg|bh|bi|bm|bn|bo|br|bs|ca|ce|ch|co|cr|cs|cu|cv|cy|da|de|dv|dz|ee|el|en|eo|es|et|eu|fa|ff|fi|fj|fo|fr|fy|ga|gd|gl|gn|gu|gv|ha|he|hi|ho|hr|ht|hu|hy|hz|ia|id|ie|ig|ii|ik|io|is|it|iu|ja|jv|ka|kg|ki|kj|kk|kl|km|kn|ko|kr|ks|ku|kv|kw|ky|la|lb|lg|li|ln|lo|lt|lu|lv|mg|mh|mi|mk|ml|mn|mr|ms|mt|my|na|nb|nd|ne|ng|nl|nn|no|nr|nv|ny|oc|oj|om|or|os|pa|pi|pl|ps|pt|qu|rm|rn|ro|ru|rw|sa|sc|sd|se|sg|si|sk|sl|sm|sn|so|sq|sr|ss|st|su|sv|sw|ta|te|tg|th|ti|tk|tl|tn|to|tr|ts|tt|tw|ty|ug|uk|ur|uz|ve|vi|vo|wa|wo|xh|yi|yo|za|zh|zu]? (string) // Scrape a transcript from a YouTube video by ID or URL.
