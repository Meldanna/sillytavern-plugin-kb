---
title: 酒馆助手 API：正则与显示格式化
category: helper
tags: helper, api, typescript, regex, format
summary: 酒馆助手 API 中与"正则与显示格式化"相关的 14 个符号（含 JSDoc 原文）：importRawTavernRegex、FormatAsTavernRegexedStringOption、formatAsTavernRegexedString、TavernRegex、isCharacterTavernRegexesEnabled、TavernRegexOptionGlobal、TavernRegexOptionCharacter、TavernRegexOptionPreset 等。
sources: [@types.txt (行 1439-2756)]
---

# 酒馆助手 API：正则与显示格式化

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 14 个符号：importRawTavernRegex、FormatAsTavernRegexedStringOption、formatAsTavernRegexedString、TavernRegex、isCharacterTavernRegexesEnabled、TavernRegexOptionGlobal、TavernRegexOptionCharacter、TavernRegexOptionPreset、TavernRegexOption、getTavernRegexes、ReplaceTavernRegexesOption、replaceTavernRegexes、TavernRegexUpdater、updateTavernRegexesWith

## importRawTavernRegex

declare function importRawTavernRegex(filename: string, content: string): boolean;

## FormatAsTavernRegexedStringOption

type FormatAsTavernRegexedStringOption = {
  /** 文本所在的深度; 不填则不考虑酒馆正则的`深度`选项: 无论该深度是否在酒馆正则的`最小深度`和`最大深度`范围内都生效 */
  depth?: number;
  /** 角色卡名称; 不填则使用当前角色卡名称 */
  character_name?: string;
};


## formatAsTavernRegexedString

declare function formatAsTavernRegexedString(
  text: string,
  source: 'user_input' | 'ai_output' | 'slash_command' | 'world_info' | 'reasoning',
  destination: 'display' | 'prompt',
  { depth, character_name }?: FormatAsTavernRegexedStringOption,
): string;

## TavernRegex

type TavernRegex = {
  id: string;
  script_name: string;
  enabled: boolean;
  /** @deprecated 使用新 API 时不再返回此字段，仅在使用旧 scope 参数时返回 */
  scope?: 'global' | 'character';

  find_regex: string;
  replace_string: string;
  trim_strings: string[];

  source: {
    user_input: boolean;
    ai_output: boolean;
    slash_command: boolean;
    world_info: boolean;
    reasoning: boolean;
  };

  destination: {
    display: boolean;
    prompt: boolean;
  };
  run_on_edit: boolean;

  min_depth: number | null;
  max_depth: number | null;
};


## isCharacterTavernRegexesEnabled

declare function isCharacterTavernRegexesEnabled(): boolean;

## TavernRegexOptionGlobal

type TavernRegexOptionGlobal = {
  /** 对全局正则 (`'global'`) 进行操作 */
  type: 'global';
};

## TavernRegexOptionCharacter

type TavernRegexOptionCharacter = {
  /** 对角色卡局部 (`'character'`) 进行操作 */
  type: 'character';
  name?: string | 'current';
};

## TavernRegexOptionPreset

type TavernRegexOptionPreset = {
  /** 对预设正则 (`'preset'`) 进行操作 */
  type: 'preset';
  name?: string | 'in_use';
};

## TavernRegexOption

type TavernRegexOption = TavernRegexOptionGlobal | TavernRegexOptionCharacter | TavernRegexOptionPreset;


## getTavernRegexes

declare function getTavernRegexes(option: TavernRegexOption): TavernRegex[];

## ReplaceTavernRegexesOption

type ReplaceTavernRegexesOption = {
  scope?: 'all' | 'global' | 'character';
};


## replaceTavernRegexes

declare function replaceTavernRegexes(regexes: TavernRegex[], option: TavernRegexOption): Promise<void>;

## TavernRegexUpdater

type TavernRegexUpdater =
  | ((regexes: TavernRegex[]) => TavernRegex[])
  | ((regexes: TavernRegex[]) => Promise<TavernRegex[]>);


## updateTavernRegexesWith

declare function updateTavernRegexesWith(
  updater: TavernRegexUpdater,
  option: TavernRegexOption,
): Promise<TavernRegex[]>;
