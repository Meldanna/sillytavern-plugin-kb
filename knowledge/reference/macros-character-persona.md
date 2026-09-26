---
title: 宏：角色 / 人设 / 用户
category: reference
tags: macros, reference, st-core
summary: ST 核心宏中「角色 / 人设 / 用户」的 19 个宏（含 Description / Returns / Aliases）：{{char}}、{{charAuthorsNote}}、{{charAvatarPath}}、{{charCreatorNotes}}、{{charDepthPrompt}}、{{charDescription}}、{{charFirstMessage::index?<integer>}}、{{charInstruction}}、{{charPersonality}}、{{charPrompt}} 等。
sources: [SillyTavern_Macros.txt]
---

# 宏：角色 / 人设 / 用户

来源：`SillyTavern_Macros.txt`（ST 核心宏清单），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 19 个宏，每个宏一节，保留原文的 Description / Returns / Aliases。

### {{char}}
- **Description**: The character's name.
- **Returns**: Character name.

### {{charAuthorsNote}}
- **Description**: 角色作者注释的内容

### {{charAvatarPath}}
- **Description**: N/A

### {{charCreatorNotes}}
- **Description**: Creator notes from the character card.
- **Returns**: Creator notes.
- **Aliases**: {{creatorNotes}}

### {{charDepthPrompt}}
- **Description**: The character's @ Depth Note.
- **Returns**: Character @ Depth Note.

### {{charDescription}}
- **Description**: The character's description.
- **Returns**: Character description.
- **Aliases**: {{description}}

### {{charFirstMessage::index?<integer>}}
- **Description**: The character's first message / greeting. Optionally specify an index to access alternate greetings.
- **Returns**: Character greeting at the given index, or empty string if out of bounds.
- **Aliases**: {{greeting}}

### {{charInstruction}}
- **Description**: The character's Post-History Instructions override.
- **Returns**: Character Post-History Instructions override.

### {{charPersonality}}
- **Description**: The character's personality.
- **Returns**: Character personality.
- **Aliases**: {{personality}}

### {{charPrompt}}
- **Description**: The character's Main Prompt override.
- **Returns**: Character Main Prompt override.

### {{charScenario}}
- **Description**: The character's scenario.
- **Returns**: Character scenario.
- **Aliases**: {{scenario}}

### {{charVersion}}
- **Description**: The character's version number.
- **Returns**: Character version number.
- **Aliases**: {{version}}, {{char_version}}

### {{group}}
- **Description**: Comma-separated list of group member names (including muted) or the character name in solo chats.
- **Returns**: List of group member names.
- **Aliases**: {{charIfNotGroup}}

### {{groupNotMuted}}
- **Description**: Comma-separated list of group member names excluding muted members.
- **Returns**: List of group member names excluding muted members.

### {{notChar}}
- **Description**: Comma-separated list of all participants except the current speaker.
- **Returns**: List of all participants except the current speaker.

### {{original}}
- **Description**: Original message content for {{original}} substitution in in character prompt overrides.
- **Returns**: Original message content.

### {{persona}}
- **Description**: Your current Persona description.
- **Returns**: Persona description.

### {{user}}
- **Description**: Your current Persona username.
- **Returns**: Persona username.

### {{userAvatarPath}}
- **Description**: N/A
