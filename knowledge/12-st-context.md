---
title: SillyTavern.getContext() API 面
category: frontend
tags: [context, api, getContext, reference]
summary: 前端扩展唯一官方入口 window.SillyTavern.getContext() 的能力分组清单，以及导入公共模块的两种方式。
sources: [SillyTavern/public/scripts/st-context.js]
---

# SillyTavern.getContext() API 面

前端扩展不应直接从 `script.js` 里抓一堆全局变量，而是走 `SillyTavern.getContext()`。它由 `public/scripts/st-context.js` 的 `getContext()` 提供，是相对稳定的官方契约。

```js
const ctx = SillyTavern.getContext();          // 全局对象，页面脚本可用
// 或：import { getContext } from '../../../st-context.js';
```

## 状态与元信息

`chat`、`characters`、`groups`、`chatId`、`characterId`、`groupId`、`name1`、`name2`、`chatMetadata`、`onlineStatus`、`maxContext`、`mainApi`、`menuType`、`extensionSettings`、`accountStorage`、`powerUserSettings`、`chatCompletionSettings`、`textCompletionSettings`

## 聊天与消息

`getCurrentChatId`、`getRequestHeaders`、`reloadCurrentChat`、`renameChat`、`saveChat`、`saveMetadata`、`saveMetadataDebounced`、`updateChatMetadata`、`openCharacterChat`、`openGroupChat`、`addOneMessage`、`deleteMessage`、`deleteLastMessage`、`updateMessageBlock`、`appendMediaToMessage`、`ensureMessageMediaIsArray`、`getMediaDisplay`、`getMediaIndex`、`scrollChatToBottom`、`scrollOnMediaLoad`、`printMessages`、`clearChat`、`messageFormatting`、`substituteParams`、`substituteParamsExtended`

## 角色

`getCharacters`、`getOneCharacter`、`getCharacterCardFields`、`getCharacterSource`、`selectCharacterById`、`unshallowCharacter`、`unshallowGroupMembers`、`createCharacterData`、`getThumbnailUrl`、`importTags`、`tags`、`tagMap`、`writeExtensionField`、`writeExtensionFieldBulk`

## 生成

`generate`、`generateQuietPrompt`、`generateRaw`、`generateRawData`、`sendGenerationRequest`、`sendStreamingRequest`、`stopGeneration`、`streamingProcessor`、`getTokenizerModel`、`tokenizers`、`getTextTokens`、`getTokenCountAsync`（`getTokenCount` 已废弃）、`getChatCompletionModel`、`ChatCompletionService`、`TextCompletionService`、`ConnectionManagerRequestService`、`extractMessageFromData`、`parseReasoningFromString`、`getReasoningTemplateByName`、`updateReasoningUI`

## 提示词与扩展注入

`extensionPrompts`、`setExtensionPrompt`、`ToolManager`、`registerFunctionTool`、`unregisterFunctionTool`、`isToolCallingSupported`、`canPerformToolCalls`、`macros`、`symbols`

## 世界书

`loadWorldInfo`、`saveWorldInfo`、`reloadWorldInfoEditor`、`updateWorldInfoList`、`convertCharacterBook`、`getWorldInfoPrompt`、`getWorldInfoNames`

## Slash 命令

`SlashCommandParser`、`SlashCommand`、`SlashCommandArgument`、`SlashCommandNamedArgument`、`SlashCommandEnumValue`、`ARGUMENT_TYPE`、`executeSlashCommandsWithOptions`（`registerSlashCommand`、`executeSlashCommands` 均已废弃）

## 事件与 UI

`eventSource`、`eventTypes`（兼容字段 `event_types`）、`Popup`、`POPUP_TYPE`、`POPUP_RESULT`、`callGenericPopup`、`loader`、`isMobile`、`shouldSendOnEnter`、`humanizedDateTime`、`uuidv4`、`renderExtensionTemplateAsync`、`openThirdPartyExtensionMenu`、`getExtensionManifest`、`ModuleWorkerWrapper`、`registerDebugFunction`、`registerDataBankScraper`、`importFromExternalUrl`

## 国际化

`t`、`translate`、`getCurrentLocale`、`addLocaleData`

## 变量系统

`variables.local.{get,set,del,add,inc,dec,has}`、`variables.global.{get,set,del,add,inc,dec,has}` —— 酒馆内置的局部/全局变量，比自建存储更贴合酒馆语义。

## 导入公共模块的两种方式

1. **运行时全局**：`window.SillyTavern.getContext()`，兼容性最好，适合在模块顶层延迟取值。
2. **源码导入**：直接 `import { eventSource, event_types } from '../../../events.js';`。酒馆没有提供公共 import map，构建工具需要把这类路径标记为 external（见 `21-build-toolchain`）。

判断某个 API 是否可用：

```js
const ctx = window.SillyTavern?.getContext?.() ?? null;
if (typeof ctx?.generateQuietPrompt === 'function') { /* 走安静生成 */ }
```
