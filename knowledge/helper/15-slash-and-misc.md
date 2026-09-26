---
title: 酒馆助手 API：斜杠命令调用与其它
category: helper
tags: helper, api, typescript, slash, misc
summary: 酒馆助手 API 中与"斜杠命令调用与其它"相关的 9 个符号（含 JSDoc 原文）：CurrentAudio、getCurrentCharacterName、getCurrentCharacterId、CreateChatMessagesOption、getExtensionInstallationInfo、stopAllGeneration、getCurrentPersonaName、getCurrentPersonaId 等。
sources: [@types.txt (行 107-2625)]
---

# 酒馆助手 API：斜杠命令调用与其它

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 9 个符号：CurrentAudio、getCurrentCharacterName、getCurrentCharacterId、CreateChatMessagesOption、getExtensionInstallationInfo、stopAllGeneration、getCurrentPersonaName、getCurrentPersonaId、triggerSlash

## CurrentAudio

type CurrentAudio = {
  /** 当前选中/正在播放的音频链接, 未选中曲目时为空字符串 */
  src: string;
  /** 当前选中音频的标题, 未匹配到时为空字符串 */
  title: string;
  /** 是否正在播放 */
  playing: boolean;
  /** 播放进度 (0-100) */
  progress: number;
};


## getCurrentCharacterName

declare function getCurrentCharacterName(): string | null;


## getCurrentCharacterId

declare function getCurrentCharacterId(): string | null;


## CreateChatMessagesOption

type CreateChatMessagesOption = SetChatMessagesOption & {
  /** @deprecated 请使用 `insert_before` */
  insert_at?: number | 'end';

  /** 插入到指定楼层前或末尾; 默认为末尾 */
  insert_before?: number | 'end';
};


## getExtensionInstallationInfo

declare function getExtensionInstallationInfo(extension_id: string): Promise<ExtensionInstallationInfo | null>;


## stopAllGeneration

declare function stopAllGeneration(): boolean;

## getCurrentPersonaName

declare function getCurrentPersonaName(): string | null;


## getCurrentPersonaId

declare function getCurrentPersonaId(): string | null;


## triggerSlash

declare function triggerSlash(command: string): Promise<string>;
