---
title: 酒馆助手 API：世界书与知识书
category: helper
tags: helper, api, typescript, worldbook, lorebook
summary: 酒馆助手 API 中与"世界书与知识书"相关的 44 个符号（含 JSDoc 原文）：importRawWorldbook、LorebookSettings、getLorebookSettings、setLorebookSettings、getLorebooks、deleteLorebook、createLorebook、CharLorebooks 等。
sources: [@types.txt (行 1426-3324)]
---

# 酒馆助手 API：世界书与知识书

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 44 个符号：importRawWorldbook、LorebookSettings、getLorebookSettings、setLorebookSettings、getLorebooks、deleteLorebook、createLorebook、CharLorebooks、GetCharLorebooksOption、getCharLorebooks、getCurrentCharPrimaryLorebook、setCurrentCharLorebooks、getChatLorebook、setChatLorebook、getOrCreateChatLorebook、LorebookEntry、GetLorebookEntriesOption、getLorebookEntries、replaceLorebookEntries、LorebookEntriesUpdater、updateLorebookEntriesWith、setLorebookEntries、createLorebookEntries、deleteLorebookEntries、getWorldbookNames、getGlobalWorldbookNames、rebindGlobalWorldbooks、CharWorldbooks、getCharWorldbookNames、rebindCharWorldbooks、getChatWorldbookName、rebindChatWorldbook、getOrCreateChatWorldbook、WorldbookEntry、getWorldbook、createWorldbook、createOrReplaceWorldbook、deleteWorldbook、ReplaceWorldbookOptions、replaceWorldbook、WorldbookUpdater、updateWorldbookWith、createWorldbookEntries、deleteWorldbookEntries

## importRawWorldbook

declare function importRawWorldbook(filename: string, content: string): Promise<Response>;


## LorebookSettings

type LorebookSettings = {
  selected_global_lorebooks: string[];
  scan_depth: number;
  context_percentage: number;
  budget_cap: number;
  min_activations: number;
  max_depth: number;
  max_recursion_steps: number;
  insertion_strategy: 'evenly' | 'character_first' | 'global_first';
  include_names: boolean;
  recursive: boolean;
  case_sensitive: boolean;
  match_whole_words: boolean;
  use_group_scoring: boolean;
  overflow_alert: boolean;
}


## getLorebookSettings

declare function getLorebookSettings(): LorebookSettings;

## setLorebookSettings

declare function setLorebookSettings(settings: Partial<LorebookSettings>): void;


## getLorebooks

declare function getLorebooks(): string[];


## deleteLorebook

declare function deleteLorebook(lorebook: string): Promise<boolean>;


## createLorebook

declare function createLorebook(lorebook: string): Promise<boolean>;


## CharLorebooks

type CharLorebooks = {
  primary: string | null;
  additional: string[];
}


## GetCharLorebooksOption

type GetCharLorebooksOption = {
  name?: string;
  type?: 'all' | 'primary' | 'additional';
}


## getCharLorebooks

declare function getCharLorebooks({ name, type }?: GetCharLorebooksOption): CharLorebooks;


## getCurrentCharPrimaryLorebook

declare function getCurrentCharPrimaryLorebook(): string | null;


## setCurrentCharLorebooks

declare function setCurrentCharLorebooks(lorebooks: Partial<CharLorebooks>): Promise<void>;


## getChatLorebook

declare function getChatLorebook(): string | null;


## setChatLorebook

declare function setChatLorebook(lorebook: string | null): Promise<void>;


## getOrCreateChatLorebook

declare function getOrCreateChatLorebook(lorebook?: string): Promise<string>;

## LorebookEntry

type LorebookEntry = {
  uid: number;
  display_index: number;
  comment: string;
  enabled: boolean;
  type: 'constant' | 'selective' | 'vectorized';
  position:
    | 'before_character_definition'
    | 'after_character_definition'
    | 'before_example_messages'
    | 'after_example_messages'
    | 'before_author_note'
    | 'after_author_note'
    | 'at_depth_as_system'
    | 'at_depth_as_assistant'
    | 'at_depth_as_user';
  depth: number | null;
  order: number;
  probability: number;
  keys: string[];
  logic: 'and_any' | 'and_all' | 'not_all' | 'not_any';
  filters: string[];
  scan_depth: 'same_as_global' | number;
  case_sensitive: 'same_as_global' | boolean;
  match_whole_words: 'same_as_global' | boolean;
  use_group_scoring: 'same_as_global' | boolean;
  automation_id: string | null;
  exclude_recursion: boolean;
  prevent_recursion: boolean;
  delay_until_recursion: boolean | number;
  content: string;
  group: string;
  group_prioritized: boolean;
  group_weight: number;
  sticky: number | null;
  cooldown: number | null;
  delay: number | null;
};


## GetLorebookEntriesOption

type GetLorebookEntriesOption = {
  filter?: 'none' | Partial<LorebookEntry>;
};


## getLorebookEntries

declare function getLorebookEntries(lorebook: string): Promise<LorebookEntry[]>;


## replaceLorebookEntries

declare function replaceLorebookEntries(lorebook: string, entries: Partial<LorebookEntry>[]): Promise<void>;


## LorebookEntriesUpdater

type LorebookEntriesUpdater =
  | ((entries: LorebookEntry[]) => Partial<LorebookEntry>[])
  | ((entries: LorebookEntry[]) => Promise<Partial<LorebookEntry>[]>);


## updateLorebookEntriesWith

declare function updateLorebookEntriesWith(lorebook: string, updater: LorebookEntriesUpdater): Promise<LorebookEntry[]>;


## setLorebookEntries

declare function setLorebookEntries(
  lorebook: string,
  entries: Array<Pick<LorebookEntry, 'uid'> & Partial<LorebookEntry>>,
): Promise<LorebookEntry[]>;


## createLorebookEntries

declare function createLorebookEntries(
  lorebook: string,
  entries: Partial<LorebookEntry>[],
): Promise<{ entries: LorebookEntry[]; new_uids: number[] }>;


## deleteLorebookEntries

declare function deleteLorebookEntries(
  lorebook: string,
  uids: number[],
): Promise<{ entries: LorebookEntry[]; delete_occurred: boolean }>;

## getWorldbookNames

declare function getWorldbookNames(): string[];


## getGlobalWorldbookNames

declare function getGlobalWorldbookNames(): string[];

## rebindGlobalWorldbooks

declare function rebindGlobalWorldbooks(worldbook_names: string[]): Promise<void>;

## CharWorldbooks

type CharWorldbooks = {
  primary: string | null;
  additional: string[];
};

## getCharWorldbookNames

declare function getCharWorldbookNames(character_name: TypeFest.LiteralUnion<'current' | string>): CharWorldbooks;

## rebindCharWorldbooks

declare function rebindCharWorldbooks(character_name: 'current', char_worldbooks: CharWorldbooks): Promise<void>;


## getChatWorldbookName

declare function getChatWorldbookName(chat_name: 'current'): string | null;

## rebindChatWorldbook

declare function rebindChatWorldbook(chat_name: 'current', worldbook_name: string): Promise<void>;

## getOrCreateChatWorldbook

declare function getOrCreateChatWorldbook(chat_name: 'current', worldbook_name?: string): Promise<string>;

## WorldbookEntry

type WorldbookEntry = {
  /** uid 是相对于世界书内部的, 不要跨世界书使用 */
  uid: number;
  name: string;
  enabled: boolean;

  /** 激活策略: 条目应该何时激活 */
  strategy: {
    /**
     * 激活策略类型:
     * - `'constant'`: 常量🔵, 俗称蓝灯. 只需要满足 "启用"、"激活概率%" 等别的要求即可.
     * - `'selective'`: 可选项🟢, 俗称绿灯. 除了蓝灯条件, 还需要满足 `keys` 扫描条件
     * - `'vectorized'`: 向量化🔗. 一般不使用
     */
    type: 'constant' | 'selective' | 'vectorized';
    /** 主要关键字. 绿灯条目必须在欲扫描文本中扫描到其中任意一个关键字才能激活 */
    keys: (string | RegExp)[];
    /**
     * 次要关键字. 如果次要关键字的 `keys` 数组不为空, 则条目除了在主要关键字中匹配到任意一个关键字外, 还需要满足 `logic`:
     * - `'and_any'`: 次要关键字中任意一个关键字能在欲扫描文本中匹配到
     * - `'and_all'`: 次要关键字中所有关键字都能在欲扫描文本中匹配到
     * - `'not_all'`: 次要关键字中至少有一个关键字没能在欲扫描文本中匹配到
     * - `'not_any'`: 次要关键字中所有关键字都没能欲扫描文本中匹配到
     */
    keys_secondary: { logic: 'and_any' | 'and_all' | 'not_all' | 'not_any'; keys: (string | RegExp)[] };
    /** 扫描深度: 1 为仅扫描最后一个楼层, 2 为扫描最后两个楼层, 以此类推 */
    scan_depth: 'same_as_global' | number;
  };
  /** 插入位置: 如果条目激活应该插入到什么地方 */
  position: {
    /**
     * 位置类型:
     * - `'before_character_definition'`: 角色定义之前
     * - `'after_character_definition'`: 角色定义之后
     * - `'before_example_messages'`: 示例消息之前
     * - `'after_example_messages'`: 示例消息之后
     * - `'before_author_note'`: 作者注释之前
     * - `'after_author_note'`: 作者注释之后
     * - `'at_depth'`: 插入到指定深度
     */
    type:
      | 'before_character_definition'
      | 'after_character_definition'
      | 'before_example_messages'
      | 'after_example_messages'
      | 'before_author_note'
      | 'after_author_note'
      | 'at_depth'
      | 'outlet';
    /** 该条目的消息身份, 仅位置类型为 `'at_depth'` 时有效 */
    role: 'system' | 'assistant' | 'user';
    /** 该条目要插入的深度, 仅位置类型为 `'at_depth'` 时有效 */
    depth: number;
    // TODO: 世界书条目的插入: 文档链接
    order: number;
  };

  content: string;

  probability: number;
  /** 递归表示某世界书条目被激活后, 该条目的提示词又激活了其他条目 */
  recursion: {
    /** 禁止其他条目递归激活本条目 */
    prevent_incoming: boolean;
    /** 禁止本条目递归激活其他条目 */
    prevent_outgoing: boolean;
    /** 延迟到第 n 级递归检查时才能激活本条目 */
    delay_until: null | number;
  };
  effect: {
    /** 黏性: 条目激活后, 在之后 n 条消息内始终激活, 无视激活策略、激活概率% */
    sticky: null | number;
    /** 冷却: 条目激活后, 在之后 n 条消息内不能再激活 */
    cooldown: null | number;
    /** 延迟: 聊天中至少有 n 楼消息时, 才能激活条目 */
    delay: null | number;
  };

  /** 额外字段, 用于为世界书条目绑定额外数据 */
  extra?: Record<string, any>;
};


## getWorldbook

declare function getWorldbook(worldbook_name: string): Promise<WorldbookEntry[]>;


## createWorldbook

declare function createWorldbook(worldbook_name: string, worldbook?: WorldbookEntry[]): Promise<boolean>;


## createOrReplaceWorldbook

declare function createOrReplaceWorldbook(
  worldbook_name: string,
  worldbook?: TypeFest.PartialDeep<WorldbookEntry>[],
  { render }?: ReplaceWorldbookOptions,
): Promise<boolean>;


## deleteWorldbook

declare function deleteWorldbook(worldbook_name: string): Promise<boolean>;


## ReplaceWorldbookOptions

interface ReplaceWorldbookOptions {
  /** 对于对世界书的更改, 世界书编辑器应该防抖渲染 (debounced) 还是立即渲染 (immediate)? 默认为性能更好的防抖渲染 */
  render?: 'debounced' | 'immediate';
}

## replaceWorldbook

declare function replaceWorldbook(
  worldbook_name: string,
  worldbook: TypeFest.PartialDeep<WorldbookEntry>[],
  { render }?: ReplaceWorldbookOptions,
): Promise<void>;

## WorldbookUpdater

type WorldbookUpdater =
  | ((worldbook: WorldbookEntry[]) => TypeFest.PartialDeep<WorldbookEntry>[])
  | ((worldbook: WorldbookEntry[]) => Promise<TypeFest.PartialDeep<WorldbookEntry>[]>);

## updateWorldbookWith

declare function updateWorldbookWith(
  worldbook_name: string,
  updater: WorldbookUpdater,
  { render }?: ReplaceWorldbookOptions,
): Promise<WorldbookEntry[]>;


## createWorldbookEntries

declare function createWorldbookEntries(
  worldbook_name: string,
  new_entries: TypeFest.PartialDeep<WorldbookEntry>[],
  { render }?: ReplaceWorldbookOptions,
): Promise<{ worldbook: WorldbookEntry[]; new_entries: WorldbookEntry[] }>;


## deleteWorldbookEntries

declare function deleteWorldbookEntries(
  worldbook_name: string,
  predicate: (entry: WorldbookEntry) => boolean,
  { render }?: ReplaceWorldbookOptions,
): Promise<{ worldbook: WorldbookEntry[]; deleted_entries: WorldbookEntry[] }>;
