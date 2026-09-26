---
title: 宏：变量（局部 / 全局）
category: reference
tags: macros, reference, st-core
summary: ST 核心宏中「变量（局部 / 全局）」的 14 个宏（含 Description / Returns / Aliases）：{{addglobalvar::name<string>::value<string|number>}}、{{addvar::name<string>::value<string|number>}}、{{decglobalvar::name<string>}}、{{decvar::name<string>}}、{{deleteglobalvar::name<string>}}、{{deletevar::name<string>}}、{{getglobalvar::name<string>}}、{{getvar::name<string>}}、{{hasglobalvar::name<string>}}、{{hasvar::name<string>}} 等。
sources: [SillyTavern_Macros.txt]
---

# 宏：变量（局部 / 全局）

来源：`SillyTavern_Macros.txt`（ST 核心宏清单），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 14 个宏，每个宏一节，保留原文的 Description / Returns / Aliases。

### {{addglobalvar::name<string>::value<string|number>}}
- **Description**: Adds a value to an existing global variable (numeric or string append). If the variable does not exist, it will be created.
- **Returns**: <empty string>

### {{addvar::name<string>::value<string|number>}}
- **Description**: Adds a value to an existing local variable (numeric or string append). If the variable does not exist, it will be created.
- **Returns**: <empty string>

### {{decglobalvar::name<string>}}
- **Description**: Decrements a global variable by 1 and returns the new value. If the variable does not exist, it will be created.
- **Returns**: The new value of the global variable.

### {{decvar::name<string>}}
- **Description**: Decrements a local variable by 1 and returns the new value. If the variable does not exist, it will be created.
- **Returns**: The new value of the local variable.

### {{deleteglobalvar::name<string>}}
- **Description**: Deletes a global variable.
- **Returns**: <empty string>
- **Aliases**: {{flushglobalvar}}

### {{deletevar::name<string>}}
- **Description**: Deletes a local variable.
- **Returns**: <empty string>
- **Aliases**: {{flushvar}}

### {{getglobalvar::name<string>}}
- **Description**: Gets the value of a global variable.
- **Returns**: The value of the global variable.

### {{getvar::name<string>}}
- **Description**: Gets the value of a local variable.
- **Returns**: The value of the local variable.

### {{hasglobalvar::name<string>}}
- **Description**: Checks if a global variable exists.
- **Returns**: "true" if the variable exists, "false" otherwise.
- **Aliases**: {{globalvarexists}}

### {{hasvar::name<string>}}
- **Description**: Checks if a local variable exists.
- **Returns**: "true" if the variable exists, "false" otherwise.
- **Aliases**: {{varexists}}

### {{incglobalvar::name<string>}}
- **Description**: Increments a global variable by 1 and returns the new value. If the variable does not exist, it will be created.
- **Returns**: The new value of the global variable.

### {{incvar::name<string>}}
- **Description**: Increments a local variable by 1 and returns the new value. If the variable does not exist, it will be created.
- **Returns**: The new value of the local variable.

### {{setglobalvar::name<string>::value<string|number>}}
- **Description**: Sets a global variable to the given value.
- **Returns**: <empty string>

### {{setvar::name<string>::value<string|number>}}
- **Description**: Sets a local variable to the given value.
- **Returns**: <empty string>
