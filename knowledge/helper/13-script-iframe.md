---
title: 酒馆助手 API：脚本、按钮与 iframe
category: helper
tags: helper, api, typescript, script, button, iframe
summary: 酒馆助手 API 中与"脚本、按钮与 iframe"相关的 21 个符号（含 JSDoc 原文）：getAllEnabledScriptButtons、ScriptButton、Script、ScriptFolder、ScriptTree、ScriptTreesOptions、getScriptTrees、replaceScriptTrees 等。
sources: [@types.txt (行 2515-5026)]
---

# 酒馆助手 API：脚本、按钮与 iframe

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 21 个符号：getAllEnabledScriptButtons、ScriptButton、Script、ScriptFolder、ScriptTree、ScriptTreesOptions、getScriptTrees、replaceScriptTrees、updateScriptTreesWith、updateScriptTreesWith、getScriptButtons、replaceScriptButtons、updateScriptButtonsWith、updateScriptButtonsWith、appendInexistentScriptButtons、getScriptName、getScriptInfo、replaceScriptInfo、reloadIframe、getIframeName、getScriptId

## getAllEnabledScriptButtons

declare function getAllEnabledScriptButtons(): { [script_id: string]: { button_id: string; button_name: string }[] };

## ScriptButton

type ScriptButton = {
  name: string;
  visible: boolean;
};

## Script

type Script = {
  type: 'script';
  enabled: boolean;
  name: string;
  id: string;
  content: string;
  info: string;
  button: {
    enabled: boolean;
    buttons: Array<ScriptButton>;
  };
  data: Record<string, any>;
  export_with: {
    data: boolean;
    button: boolean;
  };
};

## ScriptFolder

type ScriptFolder = {
  type: 'folder';
  enabled: boolean;
  name: string;
  id: string;
  icon: string;
  color: string;
  scripts: Script[];
};

## ScriptTree

type ScriptTree = Script | ScriptFolder;

## ScriptTreesOptions

type ScriptTreesOptions = {
  /** 对全局脚本 (`'chat'`)、当前预设脚本 (`'preset'`) 或当前角色卡脚本 (`'global'`) 进行操作 */
  type: 'global' | 'preset' | 'character';
};


## getScriptTrees

declare function getScriptTrees(option: ScriptTreesOptions): ScriptTree[];


## replaceScriptTrees

declare function replaceScriptTrees(script_trees: TypeFest.PartialDeep<ScriptTree>[], option: ScriptTreesOptions): void;


## updateScriptTreesWith

declare function updateScriptTreesWith(
  updater: (script_trees: ScriptTree[]) => TypeFest.PartialDeep<ScriptTree>[],
  option: ScriptTreesOptions,
): ScriptTree[];


## updateScriptTreesWith（重载 2）

declare function updateScriptTreesWith(
  updater: (script_trees: ScriptTree[]) => Promise<TypeFest.PartialDeep<ScriptTree>[]>,
  option: ScriptTreesOptions,
): Promise<ScriptTree[]>;

## getScriptButtons

declare function getScriptButtons(): ScriptButton[];


## replaceScriptButtons

declare function replaceScriptButtons(buttons: ScriptButton[]): void;


## updateScriptButtonsWith

declare function updateScriptButtonsWith(updater: (buttons: ScriptButton[]) => ScriptButton[]): ScriptButton[];


## updateScriptButtonsWith（重载 2）

declare function updateScriptButtonsWith(
  updater: (buttons: ScriptButton[]) => Promise<ScriptButton[]>,
): Promise<ScriptButton[]>;


## appendInexistentScriptButtons

declare function appendInexistentScriptButtons(buttons: ScriptButton[]): void;


## getScriptName

declare function getScriptName(): string;


## getScriptInfo

declare function getScriptInfo(): string;


## replaceScriptInfo

declare function replaceScriptInfo(info: string): void;

## reloadIframe

declare function reloadIframe(): void;


## getIframeName

declare function getIframeName(): string;


## getScriptId

declare function getScriptId(): string;
