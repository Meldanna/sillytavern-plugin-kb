---
title: 斜杠命令：n–q
category: reference
tags: slash-commands, reference, st-core
summary: ST 核心斜杠命令中「首字母 N/O/P/Q」的 51 条命令（含命名参数/位置参数与说明原文）：/newchat /note /note-depth /note-frequency /note-position /note-role /panels /parser-flag /pass /persona-create 等。
sources: [slash_command.txt (行 156-206)]
---

# 斜杠命令：n–q

来源：`slash_command.txt`（ST 核心斜杠命令清单，首字母 N/O/P/Q），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 51 条命令。每条命令的格式：`/命令名 [命名参数] (位置参数) // 说明`，`?` 表示可选参数，`| ` 表示枚举取值。

## /newchat

/newchat [delete=true|false]?=false // Start a new chat with the current character

## /note

/note (string)? // Sets an author's note for the currently selected chat if specified and returns the current note.

## /note-depth

/note-depth (number)? // Sets an author's note depth for in-chat positioning if specified and returns the current depth.

## /note-frequency

/note-frequency (number)? // Sets an author's note insertion frequency if specified and returns the current frequency.

## /note-position

/note-position (before|after|chat)? // Sets an author's note position if specified and returns the current position.

## /note-role

/note-role (system|user|assistant)? // Sets an author's note chat insertion role if specified and returns the current role.

## /panels

/panels // 切换 UI 面板显示开关

## /parser-flag

/parser-flag (STRICT_ESCAPING|REPLACE_GETVAR) (on|off)?=on // Set a parser flag.

## /pass

/pass (string|number|bool|list|dictionary|closure) // /pass (text) – 通过管道将文本传递给下一条命令。 例： /pass Hello world

## /persona-create

/persona-create [name=string] [description=string]? [title=string]? [avatar=prompt|characters/...|backgrounds/...|User Avatars/...|assets/...|user/images/...]? [avatarPromptResize=true|false]?=true [descriptionPosition=inPrompt|topAN|bottomAN|atDepth|none]? [descriptionDepth=number]? [descriptionRole=user|assistant|system]? [lorebook=string]? [select=true|false]?=true // Creates a new persona with the specified attributes. Returns the avatar key of the created persona. Required arguments: name – The persona's display name. Note on avatar: The avatar argument accepts prompt to open a file picker, a local ST file path, or a base64 data URL. Can also be the return value of /imagine. If not provided, a default avatar will be used. 例： /persona-create name="Alice" description="A curious adventurer" /persona-create name="Bob" avatar=prompt lorebook="detective_lore" select=false /imagine portrait of an elf | /persona-create name="Elf" avatar="{{pipe}}"

## /persona-delete

/persona-delete [persona=string]? [silent=true|false]?=false // Deletes a persona and its avatar from the system. If no persona argument is provided, deletes the currently active persona. ⚠️ 警告： This action is irreversible. All data associated with the persona will be lost. 例： /persona-delete Deletes the current persona (shows confirmation popup). /persona-delete persona="Bob" silent=true Deletes Bob without confirmation.

## /persona-duplicate

/persona-duplicate [persona=string]? [select=true|false]?=false // Duplicates a persona including all its data and avatar. Returns the avatar key of the new persona. Use /persona-update afterwards to rename or modify the duplicated persona's fields. 例： /persona-duplicate Duplicates the currently active persona. /persona-duplicate persona="Alice" select=true Duplicates Alice and selects the new persona. /persona-duplicate | /persona-update persona="{{pipe}}" name="Clone" Duplicates the current persona, then renames the clone.

## /persona-get

/persona-get [persona=string]? [field=name|description|title|position|depth|role|lorebook|avatar|default|connections]? [return=pipe|object|popup-html|toast-html|console|none]?=pipe // Retrieves persona data. Can return all data as JSON or a specific field value. If no persona argument is provided, uses the currently active persona. 例： /persona-get field=description | /echo Outputs the current persona's description. /persona-get persona="Alice" field=name Returns Alice's persona name. /persona-get return=object | /json-get key=avatar Returns the current persona's full data as an object, then extracts the avatar key.

## /persona-lock

/persona-lock [type=chat|character|default]?=chat (string)? // Locks/unlocks the current persona to a chat, character, or as the default. Returns the lock state if no value is provided. 例： /persona-lock on Locks persona to this chat. /persona-lock type=character on Locks persona to the current character. /persona-lock type=default on Sets persona as the default for new chats. /persona-lock Returns whether the persona is locked to this chat.

## /persona-set

/persona-set [mode=lookup|temp|all]?=all (string) // Selects an existing persona by name or avatar key, or sets a temporary user name. If a matching persona exists, it will be selected with its name and avatar. Otherwise (in "all" or "temp" mode), only the display name is changed temporarily. 例： /persona-set Alice Selects persona "Alice", or sets name to "Alice" if not found. /persona-set mode=lookup Alice Only selects if persona "Alice" exists.

## /persona-sync

/persona-sync [from=string]? [quiet=true|false]?=true (number|range)?=0-{{lastMessageId}} // Syncs the user persona (name and avatar) in user-attributed messages in the current chat. If from is set, only messages with that specific persona name will be synced. Useful when multiple personas have been used in the same chat. If quiet is set to false, a confirmation popup will be shown before syncing. 例： /persona-sync - Sync all user messages /persona-sync 5 - Sync only message 5 /persona-sync 0-10 - Sync messages 0 through 10 /persona-sync from=OldPersona 0-20 - Sync only messages with name "OldPersona" in range 0-20 /persona-sync quiet=false - Sync all with confirmation popup /persona-sync from=TempName quiet=false 5-15 - Sync messages with name "TempName" in range 5-15 with confirmation

## /persona-update

/persona-update [persona=string]? [name=string]? [description=string]? [title=string]? [avatar=prompt|characters/...|backgrounds/...|User Avatars/...|assets/...|user/images/...]? [avatarPromptResize=true|false]?=true [descriptionPosition=inPrompt|topAN|bottomAN|atDepth|none]? [descriptionDepth=number]? [descriptionRole=user|assistant|system]? [lorebook=string]? // Updates an existing persona's attributes. Only the provided fields are changed; others are left untouched. If no persona argument is provided, updates the currently active persona. 例： /persona-update description="An updated description" Updates the current persona's description. /persona-update persona="Alice" name="Alice 2.0" descriptionPosition=atDepth descriptionDepth=3 Renames Alice and sets her description to inject at depth 3. /imagine portrait | /persona-update avatar="{{pipe}}" Generates an image and sets it as the current persona's avatar.

## /pick-icon

/pick-icon // 打开包含所有可用 Font Awesome 图标的弹出窗口，并返回所选图标的名称。 例： /pick-icon | /if left={{pipe}} rule=eq right=false else={: /echo chosen icon: "{{pipe}}" :} {: /echo cancelled icon selection :} |

## /pm-render

/pm-render [refresh=true|false]?=true // Rerenders the prompt manager content. Use this if you have made changes to the prompt entries through slash commands and want to see the changes reflected in the prompt manager UI.

## /popup

/popup [scroll=true|false]?=true [large=true|false]?=false [wide=true|false]?=false [wider=true|false]?=false [transparent=true|false]?=false [okButton=string]?=OK [cancelButton=string]? [result=true|false]?=false [tooltip=string]? (string) // 显示带有指定文本和按钮的阻塞弹出窗口。 返回弹出文本。 例： /popup large=on wide=on okButton="Confirm" Please confirm this action. /popup okButton="Left" cancelButton="Right" result=true Do you want to go left or right? | /echo 0 means right, 1 means left. Choice: {{pipe}}

## /pow

/pow (number|varname) (number|varname) // Performs a power operation of two values and passes the result down the pipe. Can use variable names. Example: /pow i 2

## /preset

/preset (string)? // Sets a preset by name for the current API. Gets the current preset if no name is provided. Example: /preset myPreset /preset

## /profile

/profile [await=true|false]?=true [timeout=number]?=2000 (string)? // Switch to a connection profile or return the name of the current profile in no argument is provided. Use <None> to switch to no profile.

## /profile-create

/profile-create (string) // Create a new connection profile using the current settings.

## /profile-genstream

/profile-genstream [lock=on|off]?=off [profile=string]? [reasoning=true|false]?=false [system=string]? [length=number]?=2048 [generating=string]?=Generating... [completed=string]?=Generated [delay=infinite|any delay in seconds]?=3000 [stop=true|false]?=true [onStop=closure]? [onComplete=closure]? (string) // Generates text using Connection Manager with streaming display. Shows live generation progress including reasoning (thinking) and content. Requires Connection Manager extension. Uses the currently selected profile or the specified profile= argument. Use reasoning=true to include formatted reasoning in the output (using the defined reasoning template). This can be parsed later with /reasoning-parse. Use delay to control auto-hide behavior: number (ms), "infinite", or negative to keep the display open until manually closed. The display shows a green LED when complete. A stop button is shown by default (stop=true). Click it to abort generation and return whatever was streamed so far. Use stop=false to hide the stop button. Use onStop and onComplete closures for custom behavior when generation is stopped or completes. Example: /profile-genstream profile=my-profile-id reasoning=true Summarize the following text Example with infinite display: /profile-genstream delay=infinite Tell me a story Example with custom stop handler: /profile-genstream onStop={: /echo "Generation stopped!" :} Tell me a story

## /profile-get

/profile-get (string)? // Get the details of the connection profile. Returns the selected profile if no argument is provided.

## /profile-list

/profile-list // List all connection profile names.

## /profile-update

/profile-update // Update the selected connection profile.

## /prompt-post-processing

/prompt-post-processing (string) // 设置 "提示词后处理" 类型。如果没有提供值，则获取当前选择。 例： /prompt-post-processing | /echo /prompt-post-processing single

## /proxy

/proxy (string) // Sets a proxy preset by name.

## /qr

/qr (number) // Activates the specified Quick Reply

## /qr-arg

/qr-arg (string) (string|number|bool|list|dictionary) // Set a fallback value for a Quick Reply argument. Example: /qr-arg x foo | /echo {{arg::x}}

## /qr-chat-set

/qr-chat-set [visible=true|false]?=true (string) // Toggle chat QR set

## /qr-chat-set-off

/qr-chat-set-off (string) // Deactivate chat QR set

## /qr-chat-set-on

/qr-chat-set-on [visible=true|false]?=true (string) // Activate chat QR set

## /qr-contextadd

/qr-contextadd [set=string] [label=string]? [id=number]? [chain=true|false]?=false (string) // Add a context menu preset to a QR. If id and label are both provided, id will be used. Example: /qr-contextadd set=MyQRSetWithTheButton label=MyButton chain=true MyQRSetWithContextItems

## /qr-contextclear

/qr-contextclear [set=string] [id=number]? (string)? // Remove all context menu presets from a QR. If id and a label are both provided, id will be used. Example: /qr-contextclear set=MyPreset MyButton

## /qr-contextdel

/qr-contextdel [set=string] [label=string]? [id=number]? (string) // Remove context menu preset from a QR. If id and label are both provided, id will be used. Example: /qr-contextdel set=MyPreset label=MyButton MyOtherPreset

## /qr-create

/qr-create [set=string] [label=string]? [icon=string]? [showlabel=true|false]? [hidden=true|false]?=false [startup=true|false]?=false [user=true|false]?=false [bot=true|false]?=false [load=true|false]?=false [new=true|false]?=false [group=true|false]?=false [generation=true|false]?=false [title=string]? (string) // Creates a new Quick Reply. Example: /qr-create set=MyPreset label=MyButton /echo 123

## /qr-delete

/qr-delete [set=string] [label=string]? [id=number]? (string)? // Deletes a Quick Reply from the specified set. (Label must be provided via named or unnamed argument)

## /qr-get

/qr-get [set=string] [label=string]? [id=number]? // Get a Quick Reply's properties. Examples: /qr-get set=MyPreset label=MyButton | /echo /qr-get set=MyPreset id=42 | /echo

## /qr-list

/qr-list (string) // Gets a list of the names of all quick replies in this quick reply set.

## /qr-set

/qr-set [visible=true|false]?=true (string) // Toggle global QR set

## /qr-set-create

/qr-set-create [nosend=true|false]? [before=true|false]? [inject=true|false]? (string) // Create a new preset (overrides existing ones). Example: /qr-set-add MyNewPreset

## /qr-set-delete

/qr-set-delete (string) // Delete an existing preset. Example: /qr-set-delete MyPreset

## /qr-set-list

/qr-set-list (all|global|chat)?=all // Gets a list of the names of all quick reply sets.

## /qr-set-off

/qr-set-off (string) // Deactivate global QR set

## /qr-set-on

/qr-set-on [visible=true|false]?=true (string) // Activate global QR set

## /qr-set-update

/qr-set-update [nosend=true|false]? [before=true|false]? [inject=true|false]? (string) // Update an existing preset. Example: /qr-set-update enabled=false MyPreset

## /qr-update

/qr-update [newlabel=string]? [id=number]? [set=string] [label=string]? [icon=string]? [showlabel=true|false]? [hidden=true|false]?=false [startup=true|false]?=false [user=true|false]?=false [bot=true|false]?=false [load=true|false]?=false [new=true|false]?=false [group=true|false]?=false [generation=true|false]?=false [title=string]? (string)? // Updates Quick Reply. Example: /qr-update set=MyPreset label=MyButton newlabel=MyRenamedButton /echo 123

## /qrset

/qrset // DEPRECATED – The command /qrset has been deprecated. Use /qr-set, /qr-set-on, and /qr-set-off instead.
