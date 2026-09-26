---
title: 酒馆助手 API：事件订阅与派发
category: helper
tags: helper, api, typescript, event, subscribe
summary: 酒馆助手 API 中与"事件订阅与派发"相关的 14 个符号（含 JSDoc 原文）：EventType、EventOnReturn、eventOn、eventOnButton、eventMakeLast、eventMakeFirst、eventOnce、eventEmit 等。
sources: [@types.txt (行 3336-4895)]
---

# 酒馆助手 API：事件订阅与派发

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 14 个符号：EventType、EventOnReturn、eventOn、eventOnButton、eventMakeLast、eventMakeFirst、eventOnce、eventEmit、eventEmitAndWait、eventRemoveListener、eventClearEvent、eventClearListener、eventClearAll、getButtonEvent

## EventType

type EventType = IframeEventType | TavernEventType | string;

## EventOnReturn

type EventOnReturn = {
  /** 取消监听 */
  stop: () => void;
};


## eventOn

declare function eventOn<T extends EventType>(event_type: T, listener: ListenerType[T]): EventOnReturn;


## eventOnButton

declare function eventOnButton<T extends EventType>(event_type: T, listener: ListenerType[T]): void;


## eventMakeLast

declare function eventMakeLast<T extends EventType>(event_type: T, listener: ListenerType[T]): EventOnReturn;


## eventMakeFirst

declare function eventMakeFirst<T extends EventType>(event_type: T, listener: ListenerType[T]): EventOnReturn;


## eventOnce

declare function eventOnce<T extends EventType>(event_type: T, listener: ListenerType[T]): EventOnReturn;


## eventEmit

declare function eventEmit<T extends EventType>(event_type: T, ...data: Parameters<ListenerType[T]>): Promise<void>;


## eventEmitAndWait

declare function eventEmitAndWait<T extends EventType>(event_type: T, ...data: Parameters<ListenerType[T]>): void;


## eventRemoveListener

declare function eventRemoveListener<T extends EventType>(event_type: T, listener: ListenerType[T]): void;


## eventClearEvent

declare function eventClearEvent(event_type: EventType): void;


## eventClearListener

declare function eventClearListener(listener: Function): void;


## eventClearAll

declare function eventClearAll(): void;


## getButtonEvent

declare function getButtonEvent(button_name: string): string;
