---
title: 酒馆助手 API：提示词注入与宏
category: helper
tags: helper, api, typescript, prompt, injection, macro
summary: 酒馆助手 API 中与"提示词注入与宏"相关的 9 个符号（含 JSDoc 原文）：InjectionPrompt、injectPromptsOptions、injectPrompts、uninjectPrompts、MacroLikeContext、RegisterMacroLikeReturn、registerMacroLike、unregisterMacroLike 等。
sources: [@types.txt (行 1627-2770)]
---

# 酒馆助手 API：提示词注入与宏

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 9 个符号：InjectionPrompt、injectPromptsOptions、injectPrompts、uninjectPrompts、MacroLikeContext、RegisterMacroLikeReturn、registerMacroLike、unregisterMacroLike、substitudeMacros

## InjectionPrompt

type InjectionPrompt = {
  id: string;
  /**
   * 要注入的位置
   * - 'in_chat': 插入到聊天中
   * - 'none': 不会发给 AI, 但能用来激活世界书条目.
   */
  position: 'in_chat' | 'none';
  depth: number;

  role: 'system' | 'assistant' | 'user';
  content: string;

  /** 提示词在什么情况下启用; 默认为始终 */
  filter?: (() => boolean) | (() => Promise<boolean>);
  /** 是否作为欲扫描文本, 加入世界书绿灯条目扫描文本中; 默认为任意 */
  should_scan?: boolean;
};

## injectPromptsOptions

type injectPromptsOptions = {
  /** 是否只在下一次请求生成中有效; 默认为 false */
  once?: boolean;
};


## injectPrompts

declare function injectPrompts(prompts: InjectionPrompt[], options?: injectPromptsOptions): { uninject: () => void };


## uninjectPrompts

declare function uninjectPrompts(ids: string[]): void;

## MacroLikeContext

type MacroLikeContext = {
  message_id?: number;
  role?: 'user' | 'assistant' | 'system';
};

## RegisterMacroLikeReturn

type RegisterMacroLikeReturn = {
  /** 取消注册 */
  unregister: () => void;
};


## registerMacroLike

declare function registerMacroLike(
  regex: RegExp,
  replace: (context: MacroLikeContext, substring: string, ...args: any[]) => string,
): RegisterMacroLikeReturn;


## unregisterMacroLike

declare function unregisterMacroLike(regex: RegExp): void;

## substitudeMacros

declare function substitudeMacros(text: string): string;
