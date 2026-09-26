---
title: 宏：时间与日期
category: reference
tags: macros, reference, st-core
summary: ST 核心宏中「时间与日期」的 8 个宏（含 Description / Returns / Aliases）：{{date}}、{{datetimeformat::format<string>}}、{{idleDuration}}、{{isodate}}、{{isotime}}、{{time::offset?<string>}}、{{timeDiff::left<string>::right<string>}}、{{weekday}}。
sources: [SillyTavern_Macros.txt]
---

# 宏：时间与日期

来源：`SillyTavern_Macros.txt`（ST 核心宏清单），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 8 个宏，每个宏一节，保留原文的 Description / Returns / Aliases。

### {{date}}
- **Description**: Current local date as a string in the local short format.
- **Returns**: Current local date in local short format.

### {{datetimeformat::format<string>}}
- **Description**: Formats the current date/time using the given moment.js format string.
- **Returns**: Formatted date/time string.

### {{idleDuration}}
- **Description**: Human-readable duration since the last user message.
- **Returns**: Human-readable duration since the last user message.
- **Aliases**: {{idle_duration}}

### {{isodate}}
- **Description**: Current date in YYYY-MM-DD format.
- **Returns**: Current date in YYYY-MM-DD format.

### {{isotime}}
- **Description**: Current time in HH:mm format.
- **Returns**: Current time in HH:mm format.

### {{time::offset?<string>}}
- **Description**: Current local time, or UTC offset when called as {{time::UTC±(offset)}}
- **Returns**: A time string in the format HH:mm.

### {{timeDiff::left<string>::right<string>}}
- **Description**: Human-readable difference between two times. Order of times does not matter, it will return the absolute difference.
- **Returns**: Human-readable difference between two times.

### {{weekday}}
- **Description**: Current weekday name.
- **Returns**: Current weekday name.
