---
title: 酒馆助手 API：聊天消息与楼层
category: helper
tags: helper, api, typescript, chat, message, floor
summary: 酒馆助手 API 中与"聊天消息与楼层"相关的 21 个符号（含 JSDoc 原文）：ChatMessage、ChatMessageSwiped、GetChatMessagesOption、getChatMessages、getChatMessages、getChatMessages、SetChatMessagesOption、setChatMessages 等。
sources: [@types.txt (行 400-5017)]
---

# 酒馆助手 API：聊天消息与楼层

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 21 个符号：ChatMessage、ChatMessageSwiped、GetChatMessagesOption、getChatMessages、getChatMessages、getChatMessages、SetChatMessagesOption、setChatMessages、ChatMessageCreating、createChatMessages、deleteChatMessages、rotateChatMessages、retrieveDisplayedMessage、FormatAsDisplayedMessageOption、formatAsDisplayedMessage、refreshOneMessage、getChatHistoryBrief、getChatHistoryDetail、getLastMessageId、getMessageId、getCurrentMessageId

## ChatMessage

type ChatMessage = {
  message_id: number;
  name: string;
  role: 'system' | 'assistant' | 'user';
  is_hidden: boolean;
  message: string;
  data: Record<string, any>;
  extra: Record<string, any>;
};

## ChatMessageSwiped

type ChatMessageSwiped = {
  message_id: number;
  name: string;
  role: 'system' | 'assistant' | 'user';
  is_hidden: boolean;
  swipe_id: number;
  swipes: string[];
  swipes_data: Record<string, any>[];
  swipes_info: Record<string, any>[];
};

## GetChatMessagesOption

type GetChatMessagesOption = {
  /** 按 role 筛选消息; 默认为 `'all'` */
  role?: 'all' | 'system' | 'assistant' | 'user';
  /** 按是否被隐藏筛选消息; 默认为 `'all'` */
  hide_state?: 'all' | 'hidden' | 'unhidden';
  /** 是否包含未被 AI 使用的消息页信息, 如没选择的开局、通过点击箭头重 roll 的楼层. 如果不包含则返回类型为 `ChatMessage`, 否则返回类型为 `ChatMessageSwiped`; 默认为 `false` */
  include_swipes?: boolean;
};


## getChatMessages

declare function getChatMessages(
  range: string | number,
  { role, hide_state, include_swipes }?: Omit<GetChatMessagesOption, 'include_swipes'> & { include_swipes?: false },
): ChatMessage[];


## getChatMessages（重载 2）

declare function getChatMessages(
  range: string | number,
  { role, hide_state, include_swipes }?: Omit<GetChatMessagesOption, 'include_swipes'> & { include_swipes?: true },
): ChatMessageSwiped[];


## getChatMessages（重载 3）

declare function getChatMessages(
  range: string | number,
  { role, hide_state, include_swipes }?: GetChatMessagesOption,
): (ChatMessage | ChatMessageSwiped)[];

## SetChatMessagesOption

type SetChatMessagesOption = {
  /**
   * 是否更新楼层在页面上的显示; 默认为 `'affected'`
   * - `'none'`: 不更新页面的显示
   * - `'affected'`: 仅更新被影响楼层的显示, 更新显示时会发送 `tavern_events.USER_MESSAGE_RENDERED` 或 `tavern_events.CHARACTER_MESSAGE_RENDERED` 事件
   * - `'all'`: 重新载入整个聊天消息, 将会触发 `tavern_events.CHAT_CHANGED` 事件
   */
  refresh?: 'none' | 'affected' | 'all';
};


## setChatMessages

declare function setChatMessages(
  chat_messages: Array<{ message_id: number } & (Partial<ChatMessage> | Partial<ChatMessageSwiped>)>,
  { refresh }?: SetChatMessagesOption,
): Promise<void>;

## ChatMessageCreating

type ChatMessageCreating = {
  name?: string;
  role: 'system' | 'assistant' | 'user';
  is_hidden?: boolean;
  message: string;
  data?: Record<string, any>;
  extra?: Record<string, any>;
};

## createChatMessages

declare function createChatMessages(
  chat_messages: ChatMessageCreating[],
  { insert_before, refresh }?: CreateChatMessagesOption,
): Promise<void>;


## deleteChatMessages

declare function deleteChatMessages(message_ids: number[], { refresh }?: SetChatMessagesOption): Promise<void>;


## rotateChatMessages

declare function rotateChatMessages(
  begin: number,
  middle: number,
  end: number,
  { refresh }?: SetChatMessagesOption,
): Promise<void>;

## retrieveDisplayedMessage

declare function retrieveDisplayedMessage(message_id: number): JQuery<HTMLDivElement>;

## FormatAsDisplayedMessageOption

type FormatAsDisplayedMessageOption = {
  /** 消息所在的楼层, 要求该楼层已经存在, 即在 `[0, getLastMessageId()]` 范围内; 默认为 'last' */
  message_id?: 'last' | 'last_user' | 'last_char' | number;
};


## formatAsDisplayedMessage

declare function formatAsDisplayedMessage(text: string, { message_id }?: FormatAsDisplayedMessageOption): string;


## refreshOneMessage

declare function refreshOneMessage(message_id: number, $mes?: JQuery): Promise<void>;

## getChatHistoryBrief

declare function getChatHistoryBrief(
  name: TypeFest.LiteralUnion<'current', string>,
  allowAvatar?: boolean,
): Promise<any[] | null>;


## getChatHistoryDetail

declare function getChatHistoryDetail(data: any[], isGroupChat?: boolean): Promise<Record<string, any> | null>;

## getLastMessageId

declare function getLastMessageId(): number;


## getMessageId

declare function getMessageId(iframe_name: string): number;

## getCurrentMessageId

declare function getCurrentMessageId(): number;
