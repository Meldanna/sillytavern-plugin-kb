---
title: 酒馆助手 API：预设（Preset）
category: helper
tags: helper, api, typescript, preset
summary: 酒馆助手 API 中与"预设（Preset）"相关的 23 个符号（含 JSDoc 原文）：importRawPreset、Preset、PresetPrompt、PresetNormalPrompt、PresetSystemPrompt、PresetPlaceholderPrompt、isPresetNormalPrompt、isPresetSystemPrompt 等。
sources: [@types.txt (行 1413-2375)]
---

# 酒馆助手 API：预设（Preset）

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 23 个符号：importRawPreset、Preset、PresetPrompt、PresetNormalPrompt、PresetSystemPrompt、PresetPlaceholderPrompt、isPresetNormalPrompt、isPresetSystemPrompt、isPresetPlaceholderPrompt、default_preset、getPresetNames、getLoadedPresetName、loadPreset、getPreset、createPreset、createOrReplacePreset、deletePreset、renamePreset、ReplacePresetOptions、replacePreset、PresetUpdater、updatePresetWith、setPreset

## importRawPreset

declare function importRawPreset(filename: string, content: string): Promise<boolean>;


## Preset

type Preset = {
  settings: {
    /** 最大上下文 token 数 */
    max_context: number;
    /** 最大回复 token 数 */
    max_completion_tokens: number;
    /** 每次生成几个回复 */
    reply_count: number;

    /** 是否流式传输 */
    should_stream: boolean;

    /** 温度 */
    temperature: number;
    /** 频率惩罚 */
    frequency_penalty: number;
    /** 存在惩罚 */
    presence_penalty: number;
    top_p: number;
    /** 重复惩罚 */
    repetition_penalty: number;
    min_p: number;
    top_k: number;
    top_a: number;

    /** 种子, -1 表示随机 */
    seed: number;

    /** 压缩系统消息: 将连续的系统消息合并为一条消息 */
    squash_system_messages: boolean;

    /** 推理强度, 即内置思维链的投入程度. 例如, 如果酒馆直连 gemini-2.5-flash, 则 `min` 将会不使用内置思维链 */
    reasoning_effort: 'auto' | 'min' | 'low' | 'medium' | 'high' | 'max';
    /** 请求思维链: 允许模型返回内置思维链的思考过程; 注意这只影响内置思维链显不显示, 不决定模型是否使用内置思维链 */
    request_thoughts: boolean;
    /** 请求图片: 允许模型在回复中返回图片 */
    request_images: boolean;
    /** 启用函数调用: 允许模型使用函数调用功能; 比如 cursor 借此在回复中读写文件、运行命令 */
    enable_function_calling: boolean;
    /** 启用网络搜索: 允许模型使用网络搜索功能 */
    enable_web_search: boolean;

    /** 是否允许发送图片作为提示词 */
    allow_sending_images: 'disabled' | 'auto' | 'low' | 'high';
    /** 是否允许发送视频作为提示词 */
    allow_sending_videos: boolean;

    /**
     * 角色名称前缀: 是否要为消息添加角色名称前缀, 以及怎么添加
     * - `none`: 不添加
     * - `default`: 为与角色卡不同名的消息添加角色名称前缀, 添加到 `content` 字段开头 (即发送的消息内容是 `角色名: 消息内容`)
     * - `content`: 为所有消息添加角色名称前缀, 添加到 `content` 字段开头 (即发送的消息内容是 `角色名: 消息内容`)
     * - `completion`: 在发送给模型时, 将角色名称写入到 `name` 字段; 仅支持字母数字和下划线, 不适用于 Claude、Google 等模型
     */
    character_name_prefix: 'none' | 'default' | 'content' | 'completion';
    /** 用引号包裹用户消息: 在发送给模型之前, 将所有用户消息用引号包裹 */
    wrap_user_messages_in_quotes: boolean;
  };

  /** 提示词列表里已经添加的提示词 */
  prompts: PresetPrompt[];
  /** 下拉框里的, 没有添加进提示词列表的提示词 */
  prompts_unused: PresetPrompt[];

  /** 额外字段, 用于为预设绑定额外数据 */
  extensions: {
    regex_scripts?: TavernRegex[];
    tavern_helper?: {
      scripts: Record<string, any>[];
      variales: Record<string, any>;
    };
    [other: string]: any;
  };
};

## PresetPrompt

type PresetPrompt = {
  /**
   * 根据 id, 预设提示词分为以下三类:
   * - 普通提示词 (`isPresetNormalPrompt`): 预设界面上可以手动添加的提示词
   * - 系统提示词 (`isPresetSystemPrompt`): 酒馆所设置的系统提示词, 但其实相比于手动添加的提示词没有任何优势, 分为 `main`、`nsfw`、`jailbreak`、`enhance_definitions`
   * - 占位符提示词 (`isPresetPlaceholderPrompt`): 用于表示世界书条目、角色卡、玩家角色、聊天记录等提示词的插入位置, 分为 `world_info_before`、`persona_description`、`char_description`、`char_personality`、`scenario`、`world_info_after`、`dialogue_examples`、`chat_history`
   */
  id: TypeFest.LiteralUnion<
    | 'main'
    | 'nsfw'
    | 'jailbreak'
    | 'enhanceDefinitions'
    | 'worldInfoBefore'
    | 'personaDescription'
    | 'charDescription'
    | 'charPersonality'
    | 'scenario'
    | 'worldInfoAfter'
    | 'dialogueExamples'
    | 'chatHistory',
    string
  >;
  name: string;
  enabled: boolean;

  /**
   * 插入位置, 仅用于普通和占位符提示词
   *   - `'relative'`: 按提示词相对位置插入
   *   - `'in_chat'`: 插入到聊天记录的对应深度, 需要设置对应的深度 `depth` 和顺序 `order`
   */
  position?:
    | {
        type: 'relative';
        depth?: never;
        order?: never;
      }
    | { type: 'in_chat'; depth: number; order: number };
  role: 'system' | 'user' | 'assistant';
  /** 仅用于普通和系统提示词 */
  content?: string;

  /** 额外字段, 用于为预设提示词绑定额外数据 */
  extra?: Record<string, any>;
};

## PresetNormalPrompt

type PresetNormalPrompt = TypeFest.SetRequired<{ id: string } & Omit<PresetPrompt, 'id'>, 'position' | 'content'>;

## PresetSystemPrompt

type PresetSystemPrompt = TypeFest.SetRequired<
  { id: 'main' | 'nsfw' | 'jailbreak' | 'enhanceDefinitions' } & Omit<PresetPrompt, 'id' | 'position'>,
  'content'
>;

## PresetPlaceholderPrompt

type PresetPlaceholderPrompt = TypeFest.SetRequired<
  {
    id:
      | 'worldInfoBefore'
      | 'personaDescription'
      | 'charDescription'
      | 'charPersonality'
      | 'scenario'
      | 'worldInfoAfter'
      | 'dialogueExamples'
      | 'chatHistory';
  } & Omit<PresetPrompt, 'id' | 'content'>,
  'position'
>;

## isPresetNormalPrompt

declare function isPresetNormalPrompt(prompt: PresetPrompt): prompt is PresetNormalPrompt;

## isPresetSystemPrompt

declare function isPresetSystemPrompt(prompt: PresetPrompt): prompt is PresetSystemPrompt;

## isPresetPlaceholderPrompt

declare function isPresetPlaceholderPrompt(prompt: PresetPrompt): prompt is PresetPlaceholderPrompt;

## default_preset

declare const default_preset: Preset;


## getPresetNames

declare function getPresetNames(): string[];


## getLoadedPresetName

declare function getLoadedPresetName(): string;


## loadPreset

declare function loadPreset(preset_name: Exclude<string, 'in_use'>): boolean;


## getPreset

declare function getPreset(preset_name: TypeFest.LiteralUnion<'in_use', string>): Preset;


## createPreset

declare function createPreset(preset_name: Exclude<string, 'in_use'>, preset?: Preset): Promise<boolean>;


## createOrReplacePreset

declare function createOrReplacePreset(
  preset_name: TypeFest.LiteralUnion<'in_use', string>,
  preset?: Preset,
  { render }?: ReplacePresetOptions,
): Promise<boolean>;


## deletePreset

declare function deletePreset(preset_name: Exclude<string, 'in_use'>): Promise<boolean>;


## renamePreset

declare function renamePreset(preset_name: Exclude<string, 'in_use'>, new_name: string): Promise<boolean>;

## ReplacePresetOptions

type ReplacePresetOptions = {
  /** 如果对 `'in_use'` 预设进行操作, 应该防抖渲染 (debounced)、立即渲染 (immediate) 还是不刷新前端显示 (none)? 默认为性能更好的防抖渲染 */
  render?: 'debounced' | 'immediate' | 'none';
};

## replacePreset

declare function replacePreset(
  preset_name: TypeFest.LiteralUnion<'in_use', string>,
  preset: Preset,
  { render }?: ReplacePresetOptions,
): Promise<void>;

## PresetUpdater

type PresetUpdater = ((preset: Preset) => Preset) | ((preset: Preset) => Promise<Preset>);

## updatePresetWith

declare function updatePresetWith(
  preset_name: TypeFest.LiteralUnion<'in_use', string>,
  updater: PresetUpdater,
  { render }?: ReplacePresetOptions,
): Promise<Preset>;


## setPreset

declare function setPreset(
  preset_name: TypeFest.LiteralUnion<'in_use', string>,
  preset: TypeFest.PartialDeep<Preset>,
  { render }?: ReplacePresetOptions,
): Promise<Preset>;
