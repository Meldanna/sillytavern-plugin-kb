---
title: 宏：逻辑、随机与文本工具
category: reference
tags: macros, reference, st-core
summary: ST 核心宏中「逻辑、随机与文本工具」的 12 个宏（含 Description / Returns / Aliases）：{{//::comment<string>}}、{{banned::word<string>}}、{{else}}、{{if::condition<string>::content<string>}}、{{newline::count?<integer>}}、{{noop}}、{{pick}}、{{random}}、{{reverse::value<string>}}、{{roll::formula<string>}} 等。
sources: [SillyTavern_Macros.txt]
---

# 宏：逻辑、随机与文本工具

来源：`SillyTavern_Macros.txt`（ST 核心宏清单），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 12 个宏，每个宏一节，保留原文的 Description / Returns / Aliases。

### {{//::comment<string>}}
- **Description**: Comment macro that produces an empty string. Can be used for writing into prompt definitions, without being passed to the context.
- **Returns**: <empty string>
- **Aliases**: {{comment}}

### {{banned::word<string>}}
- **Description**: Bans a word for Text Completion backend. (Strips quotes surrounding the banned word, if present)
- **Returns**: <empty string>

### {{else}}
- **Description**: Marks the else branch inside a scoped {{if}} block. Only works inside {{if}}...{{/if}}. If used outside, returns an invisible marker.
- **Returns**: Invisible marker (consumed by the enclosing {{if}} macro).

### {{if::condition<string>::content<string>}}
- **Description**: Conditional macro. Returns the content if the condition is truthy, otherwise returns nothing (or the else branch if present). Prefix the condition with ! to invert. If the condition is a registered macro name (without braces), it will be resolved first. Variable shorthands (.varname for local, $varname for global) are also supported.
- **Returns**: The content if condition is truthy, else branch or empty string otherwise.

### {{newline::count?<integer>}}
- **Description**: Inserts one or more newlines. One newline by default, more if the count argument is specified.
- **Returns**: One or more \n.

### {{noop}}
- **Description**: Does nothing and produces an empty string.
- **Returns**: <empty string>

### {{pick}}
- **Description**: Picks a random item from a list, but keeps the choice stable for a given chat and macro position. Can be rerolled via /reroll-pick slash command.
- **Returns**: Stable randomly selected item from the list.

### {{random}}
- **Description**: Picks a random item from a list. Will be re-rolled every time macros are resolved.
- **Returns**: Randomly selected item from the list.

### {{reverse::value<string>}}
- **Description**: Reverses the characters of the argument provided.
- **Returns**: Reversed string.

### {{roll::formula<string>}}
- **Description**: Rolls dice using droll syntax (e.g. {{roll 1d20}}).
- **Returns**: Dice roll result.

### {{space::count?<integer>}}
- **Description**: Returns one or more spaces. One space by default, more if the count argument is specified.
- **Returns**: One or more spaces.

### {{trim::content?<string>}}
- **Description**: Trims whitespace. Non-scoped: trims newlines around the macro (post-processing). Scoped: returns the content (auto-trimmed by the engine).
- **Returns**: <empty string>
