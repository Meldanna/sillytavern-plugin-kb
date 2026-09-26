---
title: 酒馆助手 API：变量系统
category: helper
tags: helper, api, typescript, variable, scope
summary: 酒馆助手 API 中与"变量系统"相关的 15 个符号（含 JSDoc 原文）：VariableOptionNormal、VariableOptionCharacter、VariableOptionMessage、VariableOptionScript、VariableOptionExtension、VariableOption、getVariables、replaceVariables 等。
sources: [@types.txt (行 2803-5035)]
---

# 酒馆助手 API：变量系统

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 15 个符号：VariableOptionNormal、VariableOptionCharacter、VariableOptionMessage、VariableOptionScript、VariableOptionExtension、VariableOption、getVariables、replaceVariables、updateVariablesWith、updateVariablesWith、insertOrAssignVariables、insertVariables、deleteVariable、registerVariableSchema、getAllVariables

## VariableOptionNormal

type VariableOptionNormal = {
  /** 对聊天变量 (`'chat'`)、当前预设 (`'preset'`) 或全局变量 (`'global'`) 进行操作 */
  type: 'chat' | 'preset' | 'global';
};

## VariableOptionCharacter

type VariableOptionCharacter = {
  /**
   * 对当前角色卡 (`'character'`) 进行操作
   *
   * @throws 如果没有打开角色卡, 将会抛出错误
   */
  type: 'character';
};

## VariableOptionMessage

type VariableOptionMessage = {
  /** 对消息楼层变量 (`message`) 进行操作 */
  type: 'message';
  /**
   * 指定要获取变量的消息楼层号, 如果为负数则为深度索引, 例如 `-1` 表示获取最新的消息楼层; 默认为 `'latest'`
   *
   * @throws 如果提供的消息楼层号 `message_id` 超出了范围 `[-chat.length, chat.length)`, 将会抛出错误
   */
  message_id?: number | 'latest';
};

## VariableOptionScript

type VariableOptionScript = {
  /** 对脚本变量 (`'script'`) 进行操作 */
  type: 'script';
  /** 指定要操作变量的脚本 ID; 如果在脚本内调用, 则无须指定, 当然你也可以用 `getScriptId()` 获取该脚本 ID */
  script_id?: string;
};

## VariableOptionExtension

type VariableOptionExtension = {
  /** 对扩展变量 (`'extension'`) 进行操作 */
  type: 'extension';
  /** 指定要操作变量的扩展 ID */
  extension_id: string;
};

## VariableOption

type VariableOption = VariableOptionNormal | VariableOptionCharacter | VariableOptionMessage | VariableOptionScript | VariableOptionExtension;


## getVariables

declare function getVariables(option: VariableOption): Record<string, any>;


## replaceVariables

declare function replaceVariables(variables: Record<string, any>, option: VariableOption): void;


## updateVariablesWith

declare function updateVariablesWith(
  updater: (variables: Record<string, any>) => Record<string, any>,
  option: VariableOption,
): Record<string, any>;


## updateVariablesWith（重载 2）

declare function updateVariablesWith(
  updater: (variables: Record<string, any>) => Promise<Record<string, any>>,
  option: VariableOption,
): Promise<Record<string, any>>;


## insertOrAssignVariables

declare function insertOrAssignVariables(variables: Record<string, any>, option: VariableOption): Record<string, any>;


## insertVariables

declare function insertVariables(variables: Record<string, any>, option: VariableOption): Record<string, any>;


## deleteVariable

declare function deleteVariable(
  variable_path: string,
  option: VariableOption,
): { variables: Record<string, any>; delete_occurred: boolean };


## registerVariableSchema

declare function registerVariableSchema(
  schema: z.ZodType<any>,
  option: { type: 'global' | 'preset' | 'character' | 'chat' | 'message' },
): void;

## getAllVariables

declare function getAllVariables(): Record<string, any>;
