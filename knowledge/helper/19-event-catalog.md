---
title: 酒馆助手 API：事件目录（全部事件名）
category: helper
tags: helper, api, typescript, event, catalog, reference
summary: 酒馆助手 API 中与"事件目录（全部事件名）"相关的 6 个符号（含 JSDoc 原文）：IframeEventType、iframe_events、TavernEventType、tavern_events、ListenerType、ListenerType。
sources: [@types.txt (行 3497-4159)]
---

# 酒馆助手 API：事件目录（全部事件名）

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 6 个符号：IframeEventType、iframe_events、TavernEventType、tavern_events、ListenerType、ListenerType

## IframeEventType

type IframeEventType = (typeof iframe_events)[keyof typeof iframe_events];


## iframe_events

declare const iframe_events: {
  MESSAGE_IFRAME_RENDER_STARTED: 'message_iframe_render_started';
  MESSAGE_IFRAME_RENDER_ENDED: 'message_iframe_render_ended';
  /** `generate` 函数发出请求时触发 */
  GENERATION_REQUESTED: 'js_generation_requested';
  /** `generate` 函数开始生成 */
  GENERATION_STARTED: 'js_generation_started';
  /** 启用流式传输的 `generate` 函数传输当前完整文本: "这是", "这是一条", "这是一条流式传输" */
  STREAM_TOKEN_RECEIVED_FULLY: 'js_stream_token_received_fully';
  /** 启用流式传输的 `generate` 函数传输当前增量文本: "这是", "一条", "流式传输" */
  STREAM_TOKEN_RECEIVED_INCREMENTALLY: 'js_stream_token_received_incrementally';
  /** `generate` 函数完成生成 */
  GENERATION_ENDED: 'js_generation_ended';
};

## TavernEventType

type TavernEventType = (typeof tavern_events)[keyof typeof tavern_events];


## tavern_events

### tavern_events（第 1 段）

declare const tavern_events: {
  APP_READY: 'app_ready';
  EXTRAS_CONNECTED: 'extras_connected';
  MESSAGE_SWIPED: 'message_swiped';
  MESSAGE_SENT: 'message_sent';
  MESSAGE_RECEIVED: 'message_received';
  MESSAGE_EDITED: 'message_edited';
  MESSAGE_DELETED: 'message_deleted';
  MESSAGE_UPDATED: 'message_updated';
  MESSAGE_FILE_EMBEDDED: 'message_file_embedded';
  MESSAGE_REASONING_EDITED: 'message_reasoning_edited';
  MESSAGE_REASONING_DELETED: 'message_reasoning_deleted';
  /** since SillyTavern v1.13.5 */
  MESSAGE_SWIPE_DELETED: 'message_swipe_deleted';
  MORE_MESSAGES_LOADED: 'more_messages_loaded';
  IMPERSONATE_READY: 'impersonate_ready';
  CHAT_CHANGED: 'chat_id_changed';
  GENERATION_AFTER_COMMANDS: 'GENERATION_AFTER_COMMANDS';
  GENERATION_STARTED: 'generation_started';
  GENERATION_STOPPED: 'generation_stopped';
  GENERATION_ENDED: 'generation_ended';
  SD_PROMPT_PROCESSING: 'sd_prompt_processing';
  EXTENSIONS_FIRST_LOAD: 'extensions_first_load';
  EXTENSION_SETTINGS_LOADED: 'extension_settings_loaded';
  SETTINGS_LOADED: 'settings_loaded';
  SETTINGS_UPDATED: 'settings_updated';
  MOVABLE_PANELS_RESET: 'movable_panels_reset';
  SETTINGS_LOADED_BEFORE: 'settings_loaded_before';
  SETTINGS_LOADED_AFTER: 'settings_loaded_after';
  CHATCOMPLETION_SOURCE_CHANGED: 'chatcompletion_source_changed';
  CHATCOMPLETION_MODEL_CHANGED: 'chatcompletion_model_changed';
  OAI_PRESET_CHANGED_BEFORE: 'oai_preset_changed_before';
  OAI_PRESET_CHANGED_AFTER: 'oai_preset_changed_after';
  OAI_PRESET_EXPORT_READY: 'oai_preset_export_ready';
  OAI_PRESET_IMPORT_READY: 'oai_preset_import_ready';
  WORLDINFO_SETTINGS_UPDATED: 'worldinfo_settings_updated';
  WORLDINFO_UPDATED: 'worldinfo_updated';
  /** since SillyTavern v1.13.5 */
  CHARACTER_EDITOR_OPENED: 'character_editor_opened';
  CHARACTER_EDITED: 'character_edited';
  CHARACTER_PAGE_LOADED: 'character_page_loaded';
  USER_MESSAGE_RENDERED: 'user_message_rendered';
  CHARACTER_MESSAGE_RENDERED: 'character_message_rendered';
  FORCE_SET_BACKGROUND: 'force_set_background';
  CHAT_DELETED: 'chat_deleted';
  CHAT_CREATED: 'chat_created';
  GENERATE_BEFORE_COMBINE_PROMPTS: 'generate_before_combine_prompts';
  GENERATE_AFTER_COMBINE_PROMPTS: 'generate_after_combine_prompts';
  GENERATE_AFTER_DATA: 'generate_after_data';
  WORLD_INFO_ACTIVATED: 'world_info_activated';
  TEXT_COMPLETION_SETTINGS_READY: 'text_completion_settings_ready';
  CHAT_COMPLETION_SETTINGS_READY: 'chat_completion_settings_ready';
  CHAT_COMPLETION_PROMPT_READY: 'chat_completion_prompt_ready';
  CHARACTER_FIRST_MESSAGE_SELECTED: 'character_first_message_selected';
  CHARACTER_DELETED: 'characterDeleted';
  CHARACTER_DUPLICATED: 'character_duplicated';
  CHARACTER_RENAMED: 'character_renamed';
  CHARACTER_RENAMED_IN_PAST_CHAT: 'character_renamed_in_past_chat';
  SMOOTH_STREAM_TOKEN_RECEIVED: 'stream_token_received';
  STREAM_TOKEN_RECEIVED: 'stream_token_received';

### tavern_events（第 2 段）

  STREAM_REASONING_DONE: 'stream_reasoning_done';
  FILE_ATTACHMENT_DELETED: 'file_attachment_deleted';
  WORLDINFO_FORCE_ACTIVATE: 'worldinfo_force_activate';
  OPEN_CHARACTER_LIBRARY: 'open_character_library';
  ONLINE_STATUS_CHANGED: 'online_status_changed';
  IMAGE_SWIPED: 'image_swiped';
  CONNECTION_PROFILE_LOADED: 'connection_profile_loaded';
  CONNECTION_PROFILE_CREATED: 'connection_profile_created';
  CONNECTION_PROFILE_DELETED: 'connection_profile_deleted';
  CONNECTION_PROFILE_UPDATED: 'connection_profile_updated';
  TOOL_CALLS_PERFORMED: 'tool_calls_performed';
  TOOL_CALLS_RENDERED: 'tool_calls_rendered';
  CHARACTER_MANAGEMENT_DROPDOWN: 'charManagementDropdown';
  SECRET_WRITTEN: 'secret_written';
  SECRET_DELETED: 'secret_deleted';
  SECRET_ROTATED: 'secret_rotated';
  SECRET_EDITED: 'secret_edited';
  PRESET_CHANGED: 'preset_changed';
  PRESET_DELETED: 'preset_deleted';
  /** since SillyTavern v1.13.5 */
  PRESET_RENAMED: 'preset_renamed';
  /** since SillyTavern v1.13.5 */
  PRESET_RENAMED_BEFORE: 'preset_renamed_before';
  MAIN_API_CHANGED: 'main_api_changed';
  WORLDINFO_ENTRIES_LOADED: 'worldinfo_entries_loaded';
  WORLDINFO_SCAN_DONE: 'worldinfo_scan_done';
  /** since SillyTavern v1.14.0 */
  MEDIA_ATTACHMENT_DELETED: 'media_attachment_deleted';
};

## ListenerType

interface ListenerType {

### [iframe_events.MESSAGE_IFRAME_RENDER_STARTED]: (if

  [iframe_events.MESSAGE_IFRAME_RENDER_STARTED]: (iframe_name: string) => void;

### [iframe_events.MESSAGE_IFRAME_RENDER_ENDED]: (ifra

  [iframe_events.MESSAGE_IFRAME_RENDER_ENDED]: (iframe_name: string) => void;

### iframe_events.GENERATION_REQUESTED

  [iframe_events.GENERATION_REQUESTED]: (
    ...args:
      | [generation_id: string, type: 'generate', generate_config: GenerateConfig]
      | [generation_id: string, type: 'generateRaw', generate_config: GenerateRawConfig]
  ) => void;

### iframe_events.GENERATION_STARTED

  [iframe_events.GENERATION_STARTED]: (generation_id: string) => void;

### [iframe_events.STREAM_TOKEN_RECEIVED_FULLY]: (full

  [iframe_events.STREAM_TOKEN_RECEIVED_FULLY]: (full_text: string, generation_id: string) => void;

### [iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY

  [iframe_events.STREAM_TOKEN_RECEIVED_INCREMENTALLY]: (incremental_text: string, generation_id: string) => void;

### iframe_events.GENERATION_ENDED

  [iframe_events.GENERATION_ENDED]: (text: string, generation_id: string) => void;


### tavern_events.APP_READY

  [tavern_events.APP_READY]: () => void;

### tavern_events.EXTRAS_CONNECTED

  [tavern_events.EXTRAS_CONNECTED]: (modules: any) => void;

### tavern_events.MESSAGE_SWIPED

  [tavern_events.MESSAGE_SWIPED]: (message_id: number) => void;

### tavern_events.MESSAGE_SENT

  [tavern_events.MESSAGE_SENT]: (message_id: number) => void;

### tavern_events.MESSAGE_RECEIVED

  [tavern_events.MESSAGE_RECEIVED]: (
    message_id: number,
    type: TypeFest.LiteralUnion<
      | 'normal'
      | 'quiet'
      | 'regenerate'
      | 'impersonate'
      | 'continue'
      | 'swipe'
      | 'append'
      | 'appendFinal'
      | 'first_message'
      | 'command'
      | 'extension',
      string
    >,
  ) => void;

### tavern_events.MESSAGE_EDITED

  [tavern_events.MESSAGE_EDITED]: (message_id: number) => void;

### tavern_events.MESSAGE_DELETED

  [tavern_events.MESSAGE_DELETED]: (message_id: number) => void;

### tavern_events.MESSAGE_UPDATED

  [tavern_events.MESSAGE_UPDATED]: (message_id: number) => void;

### tavern_events.MESSAGE_FILE_EMBEDDED

  [tavern_events.MESSAGE_FILE_EMBEDDED]: (message_id: number) => void;

### tavern_events.MESSAGE_REASONING_EDITED

  [tavern_events.MESSAGE_REASONING_EDITED]: (message_id: number) => void;

### tavern_events.MESSAGE_REASONING_DELETED

  [tavern_events.MESSAGE_REASONING_DELETED]: (message_id: number) => void;

### tavern_events.MESSAGE_SWIPE_DELETED

  [tavern_events.MESSAGE_SWIPE_DELETED]: (event_data: {
    messageId: number;
    swipeId: number;
    newSwipeId: number;
  }) => void;

### tavern_events.MORE_MESSAGES_LOADED

  [tavern_events.MORE_MESSAGES_LOADED]: () => void;

### tavern_events.IMPERSONATE_READY

  [tavern_events.IMPERSONATE_READY]: (message: string) => void;

### tavern_events.CHAT_CHANGED

  [tavern_events.CHAT_CHANGED]: (chat_file_name: string) => void;

### tavern_events.GENERATION_AFTER_COMMANDS

  [tavern_events.GENERATION_AFTER_COMMANDS]: (
    type: string,
    option: {
      automatic_trigger?: boolean;
      force_name2?: boolean;
      quiet_prompt?: string;
      quietToLoud?: boolean;
      skipWIAN?: boolean;
      force_chid?: number;
      signal?: AbortSignal;
      quietImage?: string;
      quietName?: string;
      depth?: number;
    },
    dry_run: boolean,
  ) => void;

### tavern_events.GENERATION_STARTED

  [tavern_events.GENERATION_STARTED]: (
    type: string,
    option: {
      automatic_trigger?: boolean;
      force_name2?: boolean;
      quiet_prompt?: string;
      quietToLoud?: boolean;
      skipWIAN?: boolean;
      force_chid?: number;
      signal?: AbortSignal;
      quietImage?: string;
      quietName?: string;
      depth?: number;
    },
    dry_run: boolean,
  ) => void;

### tavern_events.GENERATION_STOPPED

  [tavern_events.GENERATION_STOPPED]: () => void;

### tavern_events.GENERATION_ENDED

  [tavern_events.GENERATION_ENDED]: (message_id: number) => void;

### tavern_events.SD_PROMPT_PROCESSING

  [tavern_events.SD_PROMPT_PROCESSING]: (event_data: {
    prompt: string;
    generationType: number;
    message: string;
    trigger: string;
  }) => void;

### tavern_events.EXTENSIONS_FIRST_LOAD

  [tavern_events.EXTENSIONS_FIRST_LOAD]: () => void;

### tavern_events.EXTENSION_SETTINGS_LOADED

  [tavern_events.EXTENSION_SETTINGS_LOADED]: () => void;

### tavern_events.SETTINGS_LOADED

  [tavern_events.SETTINGS_LOADED]: () => void;

### tavern_events.SETTINGS_UPDATED

  [tavern_events.SETTINGS_UPDATED]: () => void;

### tavern_events.MOVABLE_PANELS_RESET

  [tavern_events.MOVABLE_PANELS_RESET]: () => void;

### tavern_events.SETTINGS_LOADED_BEFORE

  [tavern_events.SETTINGS_LOADED_BEFORE]: (settings: object) => void;

### tavern_events.SETTINGS_LOADED_AFTER

  [tavern_events.SETTINGS_LOADED_AFTER]: (settings: object) => void;

### [tavern_events.CHATCOMPLETION_SOURCE_CHANGED]: (so

  [tavern_events.CHATCOMPLETION_SOURCE_CHANGED]: (source: string) => void;

### [tavern_events.CHATCOMPLETION_MODEL_CHANGED]: (mod

  [tavern_events.CHATCOMPLETION_MODEL_CHANGED]: (model: string) => void;

### tavern_events.OAI_PRESET_CHANGED_BEFORE

  [tavern_events.OAI_PRESET_CHANGED_BEFORE]: (result: {
    preset: object;
    presetName: string;
    settingsToUpdate: object;
    settings: object;

### savePreset

    savePreset: (name: string, settings: Record<string, any>, trigger_ui?: boolean) => Promise<void>;
    presetNameBefore: string;
  }) => void;

### tavern_events.OAI_PRESET_CHANGED_AFTER

  [tavern_events.OAI_PRESET_CHANGED_AFTER]: () => void;

### tavern_events.OAI_PRESET_EXPORT_READY

  [tavern_events.OAI_PRESET_EXPORT_READY]: (preset: object) => void;

### tavern_events.OAI_PRESET_IMPORT_READY

  [tavern_events.OAI_PRESET_IMPORT_READY]: (result: { data: object; presetName: string }) => void;

### tavern_events.WORLDINFO_SETTINGS_UPDATED

  [tavern_events.WORLDINFO_SETTINGS_UPDATED]: () => void;

### tavern_events.WORLDINFO_UPDATED

  [tavern_events.WORLDINFO_UPDATED]: (
    name: string,
    data: { entries: { [uid: number]: SillyTavern.FlattenedWorldInfoEntry } },
  ) => void;

### tavern_events.CHARACTER_EDITOR_OPENED

  [tavern_events.CHARACTER_EDITOR_OPENED]: (chid: string) => void;

### tavern_events.CHARACTER_EDITED

  [tavern_events.CHARACTER_EDITED]: (result: { detail: { id: string; character: SillyTavern.v1CharData } }) => void;

### tavern_events.CHARACTER_PAGE_LOADED

  [tavern_events.CHARACTER_PAGE_LOADED]: () => void;

### tavern_events.USER_MESSAGE_RENDERED

  [tavern_events.USER_MESSAGE_RENDERED]: (message_id: number) => void;

### tavern_events.CHARACTER_MESSAGE_RENDERED

  [tavern_events.CHARACTER_MESSAGE_RENDERED]: (message_id: number, type: string) => void;

### tavern_events.FORCE_SET_BACKGROUND

  [tavern_events.FORCE_SET_BACKGROUND]: (background: { url: string; path: string }) => void;

### tavern_events.CHAT_DELETED

  [tavern_events.CHAT_DELETED]: (chat_file_name: string) => void;

### tavern_events.CHAT_CREATED

  [tavern_events.CHAT_CREATED]: () => void;

### [tavern_events.GENERATE_BEFORE_COMBINE_PROMPTS]: (

  [tavern_events.GENERATE_BEFORE_COMBINE_PROMPTS]: () => void;

### [tavern_events.GENERATE_AFTER_COMBINE_PROMPTS]: (r

  [tavern_events.GENERATE_AFTER_COMBINE_PROMPTS]: (result: { prompt: string; dryRun: boolean }) => void;

### tavern_events.GENERATE_AFTER_DATA

  /** dry_run 只在 SillyTavern 1.13.15 及以后有 */
  [tavern_events.GENERATE_AFTER_DATA]: (
    generate_data: {
      prompt: SillyTavern.SendingMessage[];
    },
    dry_run: boolean,
  ) => void;

### tavern_events.WORLD_INFO_ACTIVATED

  [tavern_events.WORLD_INFO_ACTIVATED]: (entries: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[]) => void;

### [tavern_events.TEXT_COMPLETION_SETTINGS_READY]: ()

  [tavern_events.TEXT_COMPLETION_SETTINGS_READY]: () => void;

### [tavern_events.CHAT_COMPLETION_SETTINGS_READY]: (g

  [tavern_events.CHAT_COMPLETION_SETTINGS_READY]: (generate_data: {
    messages: SillyTavern.SendingMessage[];
    model: string;
    temprature: number;
    frequency_penalty: number;
    presence_penalty: number;
    top_p: number;
    max_tokens: number;
    stream: boolean;
    logit_bias: object;
    stop: string[];
    chat_comletion_source: string;
    n?: number;
    user_name: string;
    char_name: string;
    group_names: string[];
    include_reasoning: boolean;
    reasoning_effort: string;
    json_schema: {
      name: string;
      value: Record<string, any>;
      description?: string;
      strict?: boolean;
    };
    [others: string]: any;
  }) => void;

### [tavern_events.CHAT_COMPLETION_PROMPT_READY]: (eve

  [tavern_events.CHAT_COMPLETION_PROMPT_READY]: (event_data: {
    chat: SillyTavern.SendingMessage[];
    dryRun: boolean;
  }) => void;

### [tavern_events.CHARACTER_FIRST_MESSAGE_SELECTED]: 

  [tavern_events.CHARACTER_FIRST_MESSAGE_SELECTED]: (event_args: {
    input: string;
    output: string;
    character: object;
  }) => void;

### tavern_events.CHARACTER_DELETED

  [tavern_events.CHARACTER_DELETED]: (result: { id: string; character: SillyTavern.v1CharData }) => void;

### tavern_events.CHARACTER_DUPLICATED

  [tavern_events.CHARACTER_DUPLICATED]: (result: { oldAvatar: string; newAvatar: string }) => void;

### tavern_events.CHARACTER_RENAMED

  [tavern_events.CHARACTER_RENAMED]: (old_avatar: string, new_avatar: string) => void;

### [tavern_events.CHARACTER_RENAMED_IN_PAST_CHAT]: (

  [tavern_events.CHARACTER_RENAMED_IN_PAST_CHAT]: (
    current_chat: Record<string, any>,
    old_avatar: string,
    new_avatar: string,
  ) => void;

### tavern_events.STREAM_TOKEN_RECEIVED

  [tavern_events.STREAM_TOKEN_RECEIVED]: (text: string) => void;

### tavern_events.STREAM_REASONING_DONE

  [tavern_events.STREAM_REASONING_DONE]: (
    reasoning: string,
    duration: number | null,
    message_id: number,
    state: 'none' | 'thinking' | 'done' | 'hidden',
  ) => void;

### tavern_events.FILE_ATTACHMENT_DELETED

  [tavern_events.FILE_ATTACHMENT_DELETED]: (url: string) => void;

### tavern_events.WORLDINFO_FORCE_ACTIVATE

  [tavern_events.WORLDINFO_FORCE_ACTIVATE]: (entries: object[]) => void;

### tavern_events.OPEN_CHARACTER_LIBRARY

  [tavern_events.OPEN_CHARACTER_LIBRARY]: () => void;

### tavern_events.ONLINE_STATUS_CHANGED

  [tavern_events.ONLINE_STATUS_CHANGED]: () => void;

### tavern_events.IMAGE_SWIPED

  [tavern_events.IMAGE_SWIPED]: (result: {
    message: object;
    element: JQuery<HTMLElement>;
    direction: 'left' | 'right';
  }) => void;

### tavern_events.CONNECTION_PROFILE_LOADED

  [tavern_events.CONNECTION_PROFILE_LOADED]: (profile_name: string) => void;

### tavern_events.CONNECTION_PROFILE_CREATED

  [tavern_events.CONNECTION_PROFILE_CREATED]: (profile: Record<string, any>) => void;

### tavern_events.CONNECTION_PROFILE_DELETED

  [tavern_events.CONNECTION_PROFILE_DELETED]: (profile: Record<string, any>) => void;

### tavern_events.CONNECTION_PROFILE_UPDATED

  [tavern_events.CONNECTION_PROFILE_UPDATED]: (
    old_profile: Record<string, any>,
    new_profile: Record<string, any>,
  ) => void;

### tavern_events.TOOL_CALLS_PERFORMED

  [tavern_events.TOOL_CALLS_PERFORMED]: (tool_invocations: object[]) => void;

### tavern_events.TOOL_CALLS_RENDERED

  [tavern_events.TOOL_CALLS_RENDERED]: (tool_invocations: object[]) => void;

### tavern_events.WORLDINFO_ENTRIES_LOADED

  [tavern_events.WORLDINFO_ENTRIES_LOADED]: (lores: {

### globalLore

    globalLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];

### characterLore

    characterLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];

### chatLore

    chatLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];

### personaLore

    personaLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];
  }) => void;

### [tavern_events.CHARACTER_MANAGEMENT_DROPDOWN]: (ta

  [tavern_events.CHARACTER_MANAGEMENT_DROPDOWN]: (target: JQuery) => void;

### tavern_events.SECRET_WRITTEN

  [tavern_events.SECRET_WRITTEN]: (secret: string) => void;

### tavern_events.SECRET_DELETED

  [tavern_events.SECRET_DELETED]: (secret: string) => void;

### tavern_events.SECRET_ROTATED

  [tavern_events.SECRET_ROTATED]: (secret: string) => void;

### tavern_events.SECRET_EDITED

  [tavern_events.SECRET_EDITED]: (secret: string) => void;

### tavern_events.PRESET_CHANGED

  [tavern_events.PRESET_CHANGED]: (data: { apiId: string; name: string }) => void;

### tavern_events.PRESET_DELETED

  [tavern_events.PRESET_DELETED]: (data: { apiId: string; name: string }) => void;

### tavern_events.PRESET_RENAMED

  [tavern_events.PRESET_RENAMED]: (data: { apiId: string; oldName: string; newName: string }) => void;

### tavern_events.PRESET_RENAMED_BEFORE

  [tavern_events.PRESET_RENAMED_BEFORE]: (data: { apiId: string; oldName: string; newName: string }) => void;

### tavern_events.MAIN_API_CHANGED

  [tavern_events.MAIN_API_CHANGED]: (data: { apiId: string }) => void;

### tavern_events.WORLDINFO_ENTRIES_LOADED（重载 2）

  [tavern_events.WORLDINFO_ENTRIES_LOADED]: (lores: {

### globalLore（重载 2）

    globalLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];

### characterLore（重载 2）

    characterLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];

### chatLore（重载 2）

    chatLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];

### personaLore（重载 2）

    personaLore: ({ world: string } & SillyTavern.FlattenedWorldInfoEntry)[];
  }) => void;

### tavern_events.WORLDINFO_SCAN_DONE

  [tavern_events.WORLDINFO_SCAN_DONE]: (event_data: {
    state: {
      current: number;
      next: number;
      loopCount: number;
    };
    new: {
      all: SillyTavern.FlattenedWorldInfoEntry[];
      successful: SillyTavern.FlattenedWorldInfoEntry[];
    };
    activated: {
      entries: Map<`${string}.${string}`, SillyTavern.FlattenedWorldInfoEntry>;
      text: string;
    };
    sortedEntries: SillyTavern.FlattenedWorldInfoEntry[];
    recursionDelay: {
      availableLevels: number[];
      currentLevel: number;
    };
    budget: {
      current: number;
      overflowed: boolean;
    };
    timedEffects: Record<string, any>;
  }) => void;

### custom_event: string

  [custom_event: string]: (...args: any) => any;
}

## ListenerType（重载 2）

interface ListenerType {
  [Mvu.events.VARIABLE_INITIALIZED]: (variables: Mvu.MvuData, swipe_id: number) => void;

  [Mvu.events.VARIABLE_UPDATE_STARTED]: (variables: Mvu.MvuData) => void;

  [Mvu.events.COMMAND_PARSED]: (variables: Mvu.MvuData, commands: Mvu.CommandInfo[], message_content: string) => void;

  [Mvu.events.VARIABLE_UPDATE_ENDED]: (variables: Mvu.MvuData, variables_before_update: Mvu.MvuData) => void;

  [Mvu.events.BEFORE_MESSAGE_UPDATE]: (context: { variables: Mvu.MvuData; message_content: string }) => void;
}
