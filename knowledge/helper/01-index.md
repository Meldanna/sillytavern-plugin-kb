---
title: 酒馆助手 API 文档索引
category: helper
tags: helper, api, index
summary: 酒馆助手（JS-Slash-Runner）全局 API 的拆分索引：18 个功能域、258 个符号，按域指向 helper/ 下的具体文档。
sources: [@types.txt]
---

# 酒馆助手（SillyTavern Helper）API 文档索引

本目录由 `@types.txt`（酒馆助手注入的全局 API 类型声明，共 258 个符号）自动拆分而来，按功能域分组，每个符号都是独立可检索的小节。

| 文档 id | 主题 | 符号数 | 主要符号 |
| --- | --- | --- | --- |
| `helper/02-audio` | 音频与播放器 | 11 | `Audio` `AudioWithOptionalTitle` `playAudio` `pauseAudio` `getAudioList` `replaceAudioList` … |
| `helper/03-character` | 角色卡 | 15 | `Character` `getCharacterNames` `getCharacterIds` `createCharacter` `createOrReplaceCharacter` `deleteCharacter` … |
| `helper/04-chat-messages` | 聊天消息与楼层 | 21 | `ChatMessage` `ChatMessageSwiped` `GetChatMessagesOption` `getChatMessages` `getChatMessages` `getChatMessages` … |
| `helper/05-generation` | 生成与模型 | 19 | `getProxyPresetNames` `generate` `generateRaw` `getModelList` `stopGenerationById` `GenerateConfig` … |
| `helper/06-prompt-injection` | 提示词注入与宏 | 9 | `InjectionPrompt` `injectPromptsOptions` `injectPrompts` `uninjectPrompts` `MacroLikeContext` `RegisterMacroLikeReturn` … |
| `helper/07-worldbook` | 世界书与知识书 | 44 | `importRawWorldbook` `LorebookSettings` `getLorebookSettings` `setLorebookSettings` `getLorebooks` `deleteLorebook` … |
| `helper/08-persona` | 用户人设（Persona） | 13 | `PersonaConnection` `Persona` `ReplacePersonaOptions` `getPersonaNames` `getPersonaIds` `getPersonaAvatarPath` … |
| `helper/09-preset` | 预设（Preset） | 23 | `importRawPreset` `Preset` `PresetPrompt` `PresetNormalPrompt` `PresetSystemPrompt` `PresetPlaceholderPrompt` … |
| `helper/10-variables` | 变量系统 | 15 | `VariableOptionNormal` `VariableOptionCharacter` `VariableOptionMessage` `VariableOptionScript` `VariableOptionExtension` `VariableOption` … |
| `helper/11-events-api` | 事件订阅与派发 | 14 | `EventType` `EventOnReturn` `eventOn` `eventOnButton` `eventMakeLast` `eventMakeFirst` … |
| `helper/12-regex` | 正则与显示格式化 | 14 | `importRawTavernRegex` `FormatAsTavernRegexedStringOption` `formatAsTavernRegexedString` `TavernRegex` `isCharacterTavernRegexesEnabled` `TavernRegexOptionGlobal` … |
| `helper/13-script-iframe` | 脚本、按钮与 iframe | 21 | `getAllEnabledScriptButtons` `ScriptButton` `Script` `ScriptFolder` `ScriptTree` `ScriptTreesOptions` … |
| `helper/14-extension-runtime` | 扩展管理与运行时 | 17 | `builtin` `isAdmin` `getTavernHelperExtensionId` `getExtensionType` `ExtensionInstallationInfo` `isInstalledExtension` … |
| `helper/15-slash-and-misc` | 斜杠命令调用与其它 | 9 | `CurrentAudio` `getCurrentCharacterName` `getCurrentCharacterId` `CreateChatMessagesOption` `getExtensionInstallationInfo` `stopAllGeneration` … |
| `helper/16-global-sillytavern` | SillyTavern 全局对象 | 2 | `SillyTavern` `SillyTavern` |
| `helper/17-global-window` | Window 扩展声明 | 1 | `Window` |
| `helper/18-template-globals` | EjsTemplate / Mvu 全局 | 4 | `EjsTemplate` `EjsTemplate` `Mvu` `Mvu` |
| `helper/19-event-catalog` | 事件目录（全部事件名） | 6 | `IframeEventType` `iframe_events` `TavernEventType` `tavern_events` `ListenerType` `ListenerType` |

## 使用建议

- 写"酒馆助手（JS-Slash-Runner）脚本/扩展"时，先按功能域用 `kb_search` 查符号名，再 `kb_get` 对应文档拿完整签名与 JSDoc。
- ⚠️ `helper/16-global-sillytavern`、`helper/18-template-globals` 是**聚合/命名空间声明**（把许多 API 又列了一遍）：想查具体接口请优先看对应功能域文档（如角色看 `03-character`、世界书看 `07-worldbook`），聚合文档用于确认"某个方法到底挂在哪个全局对象上"。
- `helper/17-global-window` 是 `interface Window` 的扩展声明，用于确认酒馆助手往页面全局挂了什么。
- `helper/19-event-catalog` 是**事件名总表**（`ListenerType` / `tavern_events` / `iframe_events`）：要查"有哪些事件、事件回调签名是什么"从这里入手。
- 这些是**声明**（`declare function ...`），实际调用时它们挂在脚本可访问的全局作用域上，不在 `SillyTavern.getContext()` 里。
- 与酒馆内置扩展（`.github/skills` 与 `00`–`25` 系列）的区别：那套是 `SillyTavern.getContext()` / `extension_settings` 体系，这套是酒馆助手自己的 API 体系，两套不要混用。
