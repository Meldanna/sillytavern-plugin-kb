---
title: Slash 命令注册与实现
category: frontend
tags: [slash-commands, SlashCommandParser, api]
summary: 用 SlashCommandParser.addCommandObject + SlashCommand.fromProps 注册 /命令 的完整写法、参数类型与返回值约定。
sources: [SillyTavern/public/scripts/slash-commands/SlashCommand.js, SillyTavern/public/scripts/slash-commands/SlashCommandParser.js, SillyTavern/public/scripts/slash-commands/SlashCommandArgument.js]
---

# Slash 命令注册与实现

Slash 命令是插件暴露能力给用户（以及其它扩展）的标准方式：用户可在输入框敲 `/命令`，其它扩展可用 `executeSlashCommandsWithOptions()` 调用。

## 最小可用写法

```js
const ctx = SillyTavern.getContext();
const { SlashCommandParser, SlashCommand, SlashCommandArgument, SlashCommandNamedArgument, ARGUMENT_TYPE } = ctx;

SlashCommandParser.addCommandObject(SlashCommand.fromProps({
    name: 'my-plugin-open',
    aliases: ['mpo'],
    helpString: '打开我的插件面板。',
    returns: '打开结果字符串',
    callback: async () => { openPanel(); return 'opened'; },
}));
```

## fromProps 支持的属性（1.18.0）

| 属性 | 说明 |
| --- | --- |
| `name` | 命令名，不含 `/`；不能与保留字冲突（`/`、`#`、`:`、`parser-flag`、`breakpoint`） |
| `callback` | `(namedArguments, unnamedArguments) => string \| Promise<string>`，返回值会成为管道值 |
| `helpString` | `/help` 中显示，建议用 `t()` 包裹做本地化 |
| `aliases` | 别名数组 |
| `returns` | 返回值说明，用于帮助文本 |
| `namedArgumentList` | `SlashCommandNamedArgument[]`，形如 `/cmd key=value` |
| `unnamedArgumentList` | `SlashCommandArgument[]`，位置参数 |
| `splitUnnamedArgument` / `splitUnnamedArgumentCount` | 是否把未命名参数按空格拆分、最多拆几个 |
| `rawQuotes` | 为 true 时不剥掉未命名参数外层引号 |

## 带参数与校验

```js
SlashCommandParser.addCommandObject(SlashCommand.fromProps({
    name: 'my-plugin-replace',
    helpString: '按规则替换当前楼层文本。',
    namedArgumentList: [
        SlashCommandNamedArgument.fromProps({
            name: 'mode',
            description: '替换模式',
            typeList: [ARGUMENT_TYPE.STRING],
            enumList: [
                new SlashCommandEnumValue('plain', '纯文本替换'),
                new SlashCommandEnumValue('regex', '正则替换'),
            ],
            defaultValue: 'plain',
            isRequired: false,
        }),
    ],
    unnamedArgumentList: [
        SlashCommandArgument.fromProps({
            description: '待替换文本',
            typeList: [ARGUMENT_TYPE.STRING],
            isRequired: true,
        }),
    ],
    callback: async (args, value) => {
        const mode = String(args.mode ?? 'plain');
        return doReplace(mode, String(value ?? ''));
    },
}));
```

要点：

- `callback` 的 `args` 中已命名参数是字符串（或 `SlashCommandClosure` / 数组），务必自行 `Number()` / `String()` 转换。
- 抛错会被酒馆捕获并提示用户，**不要**在 callback 里 `process.exit` 或 `location.reload()`。
- 命令名建议加插件前缀（如 `bby-`、`tlg_`）避免与其它扩展冲突；同一命令名重复注册会覆盖。

## 从其它代码调用

```js
const result = await ctx.executeSlashCommandsWithOptions('/my-plugin-replace mode=regex "\\d+"');
```

注意 `executeSlashCommandsWithOptions` 会走完整的解析与权限流程；插件内部直接复用逻辑函数比拼接命令字符串更安全。

## 常见坑

- 注册发生在模块顶层但酒馆 API 尚不可用时，`SlashCommandParser` 会是 undefined —— 包一层 `if (window.SillyTavern?.getContext)` 或等到 `APP_READY` 再注册。
- 中文帮助文本没有 `t()` 包裹时，英文界面会显示中文；多语言项目请走 `i18n`。
- 命令回调里做长任务要配合 `ctx.loader`（`loader.show()` / `loader.hide()`）给出反馈，否则用户以为卡死。
