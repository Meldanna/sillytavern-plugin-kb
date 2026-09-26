---
title: 酒馆助手 API：用户人设（Persona）
category: helper
tags: helper, api, typescript, persona
summary: 酒馆助手 API 中与"用户人设（Persona）"相关的 13 个符号（含 JSDoc 原文）：PersonaConnection、Persona、ReplacePersonaOptions、getPersonaNames、getPersonaIds、getPersonaAvatarPath、getPersona、createPersona 等。
sources: [@types.txt (行 1847-2010)]
---

# 酒馆助手 API：用户人设（Persona）

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 13 个符号：PersonaConnection、Persona、ReplacePersonaOptions、getPersonaNames、getPersonaIds、getPersonaAvatarPath、getPersona、createPersona、createOrReplacePersona、deletePersona、replacePersona、PersonaUpdater、updatePersonaWith

## PersonaConnection

type PersonaConnection = {
  type: 'character' | 'group';
  id: string;
};

## Persona

type Persona = {
  avatar_id: string;
  avatar: `${string}.png` | Blob;
  name: string;
  title: string;
  description: string;
  position: number;
  depth: number;
  role: number;
  lorebook: string;
  connections: PersonaConnection[];
  is_default: boolean;
};

## ReplacePersonaOptions

type ReplacePersonaOptions = {
  /** 酒馆网页应该防抖渲染 persona 管理列表 (debounced)、立即渲染 (immediate) 还是不刷新前端显示 (none)? 默认为防抖渲染 */
  render?: 'debounced' | 'immediate' | 'none';
};


## getPersonaNames

declare function getPersonaNames(): string[];


## getPersonaIds

declare function getPersonaIds(): string[];


## getPersonaAvatarPath

declare function getPersonaAvatarPath(persona_id?: TypeFest.LiteralUnion<'current', string>): string | null;


## getPersona

declare function getPersona(persona_id: TypeFest.LiteralUnion<'current', string>): Persona;


## createPersona

declare function createPersona(
  persona_name: Exclude<string, 'current'>,
  persona?: TypeFest.PartialDeep<Persona>,
  options?: ReplacePersonaOptions,
): Promise<boolean>;


## createOrReplacePersona

declare function createOrReplacePersona(
  persona_name: Exclude<string, 'current'>,
  persona?: TypeFest.PartialDeep<Persona>,
  options?: ReplacePersonaOptions,
): Promise<boolean>;


## deletePersona

declare function deletePersona(persona_id: TypeFest.LiteralUnion<'current', string>): Promise<boolean>;


## replacePersona

declare function replacePersona(
  persona_id: TypeFest.LiteralUnion<'current', string>,
  persona: TypeFest.PartialDeep<Persona>,
  options?: ReplacePersonaOptions,
): Promise<void>;

## PersonaUpdater

type PersonaUpdater = ((persona: Persona) => Persona) | ((persona: Persona) => Promise<Persona>);


## updatePersonaWith

declare function updatePersonaWith(
  persona_id: TypeFest.LiteralUnion<'current', string>,
  updater: PersonaUpdater,
  options?: ReplacePersonaOptions,
): Promise<Persona>;
