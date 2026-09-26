---
title: 生成调用与提示词注入
category: frontend
tags: [generation, prompt, extension-prompt, world-info, tokens]
summary: generateQuietPrompt / generateRaw 的入参、setExtensionPrompt 的注入位置与角色枚举、token 统计与世界书读取接口。
sources: [SillyTavern/public/script.js, SillyTavern/public/scripts/st-context.js]
---

# 生成调用与提示词注入

## 三种生成入口

```js
const ctx = SillyTavern.getContext();

// 1) 走完整聊天流程（会写入聊天记录、走预设与所有扩展钩子）
await ctx.generate('user', { /* GenerateParams */ }, false);

// 2) 安静生成：不写聊天记录，适合"后台让 AI 处理一段文本"
const text = await ctx.generateQuietPrompt({
    quietPrompt: '把下面这段改写成更简洁的表达：\n' + src,
    quietToLoud: false,
    skipWIAN: true,          // true 时不加载世界书/作者注等
    responseLength: 400,
    jsonSchema: null,        // 传 schema 可要求结构化输出
    removeReasoning: true,
});

// 3) 原始生成：完全自定义提示词，不走角色/世界书拼装
const raw = await ctx.generateRaw({
    prompt: '只回答一个数字。',
    systemPrompt: '你是计数器。',
    responseLength: 8,
    trimNames: true,
    jsonSchema: null,
});
```

选择原则：

- 需要"像角色在说话" → `generate` / `generateQuietPrompt`。
- 需要"纯粹的工具调用"（分类、抽取、改写） → `generateRaw`，干扰最小。
- 需要结构化结果 → 传 `jsonSchema`，不要靠正则从自然语言里抠 JSON。
- 长任务期间用 `ctx.loader.show()/hide()` 或自带进度 UI 给反馈；并考虑 `ctx.stopGeneration` 与 `GENERATION_STOPPED` 事件的联动。

## 注入扩展提示词

```js
// extension_prompt_types / extension_prompt_roles 定义在 public/script.js：
//   NONE:-1, IN_PROMPT:0, IN_CHAT:1, BEFORE_PROMPT:2
//   roles: SYSTEM:0, USER:1, ASSISTANT:2
import { extension_prompt_types, extension_prompt_roles } from '../../../../script.js';

ctx.setExtensionPrompt(
    'my-plugin-rules',            // key，重复设置会覆盖，用 '' / 空值清除
    '以下是本回合必须遵守的规则…',
    extension_prompt_types.IN_CHAT,   // 注入位置
    4,                                 // depth：IN_CHAT 时往前数几层
    false,                             // scan：是否允许宏替换后再扫描
    extension_prompt_roles.SYSTEM,     // 角色
    null,                              // filter：返回 false 则本回合不注入
);
```

`extension_prompt_types` 枚举（`public/script.js`）：

| 常量 | 值 | 含义 |
| --- | --- | --- |
| `NONE` | -1 | 不注入 |
| `IN_PROMPT` | 0 | 注入到主提示词区 |
| `IN_CHAT` | 1 | 按 depth 插入到聊天消息之间 |
| `BEFORE_PROMPT` | 2 | 注入到主提示词之前 |

`extension_prompt_roles`：`SYSTEM: 0`、`USER: 1`、`ASSISTANT: 2`。最大 depth 受 `MAX_INJECTION_DEPTH`（10000）约束。

注入的内容会进入 token 预算，**每回合都注入**时务必短；有条件的内容用 `filter` 回调控制而不是把判断写进文本。

## Token 统计

```js
const tokens = await ctx.getTokenCountAsync(text);   // 推荐
ctx.getTokenCount(text);                             // 已废弃
ctx.tokenizers; ctx.getTextTokens; ctx.getTokenizerModel;
ctx.maxContext;                                      // 当前上下文上限
```

注意 `getTokenCountAsync` 依赖已加载的 tokenizer，未就绪时结果可能偏差；对它做断言/阈值判断要留余量。

## 世界书读取

```js
const names = ctx.getWorldInfoNames();                 // 所有世界书名称
const data = await ctx.loadWorldInfo('观测者世界书');   // { entries: { uid: entry } }
const converted = ctx.convertCharacterBook(charBook);  // 角色卡内嵌书 → 世界书格式
ctx.getWorldInfoPrompt(chat, ctx.maxContext, /* isDryRun */ true); // 取本次会激活的内容
```

常用事件：

- `WORLD_INFO_ACTIVATED`：携带本回合命中的条目，适合做"这次触发了什么设定"的展示。
- `WORLDINFO_ENTRIES_LOADED` / `WORLDINFO_UPDATED` / `WORLDINFO_SCAN_DONE`：数据加载与扫描完成。

## 与其他扩展交互

- 复用别的扩展能力前先探测：`window.BaiBaoKu?.isAvailable?.()`，或监听其就绪事件（如 `baibaoku:ready`）。
- 需要传递数据时优先用 `chat_metadata`（随聊天保存）或 `variables`（酒馆变量系统），而不是全局变量。
