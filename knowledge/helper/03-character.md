---
title: 酒馆助手 API：角色卡
category: helper
tags: helper, api, typescript, character, card
summary: 酒馆助手 API 中与"角色卡"相关的 15 个符号（含 JSDoc 原文）：Character、getCharacterNames、getCharacterIds、createCharacter、createOrReplaceCharacter、deleteCharacter、getCharacter、ReplaceCharacterOptions 等。
sources: [@types.txt (行 214-2492)]
---

# 酒馆助手 API：角色卡

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 15 个符号：Character、getCharacterNames、getCharacterIds、createCharacter、createOrReplaceCharacter、deleteCharacter、getCharacter、ReplaceCharacterOptions、replaceCharacter、CharacterUpdater、updateCharacterWith、importRawCharacter、RawCharacter、getCharData、getCharAvatarPath

## Character

type Character = {
  avatar: `${string}.png` | Blob;
  version: string;
  creator: string;
  creator_notes: string;

  worldbook: string | null;
  description: string;
  first_messages: string[];

  extensions: {
    regex_scripts: TavernRegex[];
    tavern_helper: {
      scripts: ScriptTree[];
      variables: Record<string, any>;
    };
    [other: string]: any;
  };
};


## getCharacterNames

declare function getCharacterNames(): string[];


## getCharacterIds

declare function getCharacterIds(): string[];


## createCharacter

declare function createCharacter(
  character_name: Exclude<string, 'current'>,
  character?: TypeFest.PartialDeep<Character>,
): Promise<boolean>;


## createOrReplaceCharacter

declare function createOrReplaceCharacter(
  character_name: Exclude<string, 'current'>,
  character?: TypeFest.PartialDeep<Character>,
  options?: ReplaceCharacterOptions,
): Promise<boolean>;


## deleteCharacter

declare function deleteCharacter(
  character_name: TypeFest.LiteralUnion<'current', string>,
  options?: { delete_chats?: boolean },
): Promise<boolean>;


## getCharacter

declare function getCharacter(character_name: TypeFest.LiteralUnion<'current', string>): Promise<Character>;

## ReplaceCharacterOptions

type ReplaceCharacterOptions = {
  /** 酒馆网页应该防抖渲染 (debounced)、立即渲染 (immediate) 还是不刷新前端显示 (none)? 默认为性能更好的防抖渲染 */
  render?: 'debounced' | 'immediate' | 'none';
};


## replaceCharacter

declare function replaceCharacter(
  character_name: Exclude<string, 'current'>,
  character: TypeFest.PartialDeep<Character>,
  options?: ReplaceCharacterOptions,
): Promise<void>;

## CharacterUpdater

type CharacterUpdater = ((character: Character) => Character) | ((character: Character) => Promise<Character>);


## updateCharacterWith

declare function updateCharacterWith(
  character_name: TypeFest.LiteralUnion<'current', string>,
  updater: CharacterUpdater,
): Promise<Character>;

## importRawCharacter

declare function importRawCharacter(filename: string, content: Blob): Promise<Response>;


## RawCharacter

declare class RawCharacter {
  constructor(characterData: SillyTavern.v1CharData);

  /**
   * 根据名称或头像id查找角色卡数据
   * @param options 查找选项
   * @returns 找到的角色卡数据，找不到为null
   */
  static find({
    name,
    allowAvatar,
  }?: {
    name: TypeFest.LiteralUnion<'current', string>;
    allowAvatar?: boolean;
  }): SillyTavern.v1CharData;

  /**
   * 根据名称查找角色卡数据在characters数组中的索引（类似this_chid）
   * @param name 角色名称
   * @returns 角色卡数据在characters数组中的索引，未找到返回-1
   */
  static findCharacterIndex(name: string): any;

  /**
   * 从服务器获取每个聊天文件的聊天内容，并将其编译成字典。
   * 该函数遍历提供的聊天元数据列表，并请求每个聊天的实际聊天内容，
   *
   * @param {Array} data - 包含每个聊天的元数据的数组，例如文件名。
   * @param {boolean} isGroupChat - 一个标志，指示聊天是否为群组聊天。
   * @returns {Promise<Object>} chat_dict - 一个字典，其中每个键是文件名，值是
   * 从服务器获取的相应聊天内容。
   */
  static getChatsFromFiles(data: any[], isGroupChat: boolean): Promise<Record<string, any>>;

  /**
   * 获取角色管理内的数据
   * @returns 完整的角色管理内的数据对象
   */
  getCardData(): SillyTavern.v1CharData;

  /**
   * 获取角色头像ID
   * @returns 头像ID/文件名
   */
  getAvatarId(): string;

  /**
   * 获取正则脚本
   * @returns 正则脚本数组
   */
  getRegexScripts(): Array<{
    id: string;
    scriptName: string;
    findRegex: string;
    replaceString: string;
    trimStrings: string[];
    placement: number[];
    disabled: boolean;
    markdownOnly: boolean;
    promptOnly: boolean;
    runOnEdit: boolean;
    substituteRegex: number | boolean;
    minDepth: number;
    maxDepth: number;
  }>;

  /**
   * 获取角色书
   * @returns 角色书数据对象或null
   */
  getCharacterBook(): {
    name: string;
    entries: Array<{
      keys: string[];
      secondary_keys?: string[];
      comment: string;
      content: string;
      constant: boolean;
      selective: boolean;
      insertion_order: number;
      enabled: boolean;
      position: string;
      extensions: any;
      id: number;
    }>;
  } | null;

  /**
   * 获取角色世界名称
   * @returns 世界名称
   */
  getWorldName(): string;
}


## getCharData

declare function getCharData(name: TypeFest.LiteralUnion<'current', string>): SillyTavern.v1CharData | null;


## getCharAvatarPath

declare function getCharAvatarPath(name: TypeFest.LiteralUnion<'current', string>): string | null;
