---
title: 酒馆助手 API：音频与播放器
category: helper
tags: helper, api, typescript, audio, bgm, ambient
summary: 酒馆助手 API 中与"音频与播放器"相关的 11 个符号（含 JSDoc 原文）：Audio、AudioWithOptionalTitle、playAudio、pauseAudio、getAudioList、replaceAudioList、appendAudioList、AudioSettings 等。
sources: [@types.txt (行 1-128)]
---

# 酒馆助手 API：音频与播放器

来源：`@types.txt`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 `scripts/split-raw-reference.mjs` 自动拆分。
本组共 11 个符号：Audio、AudioWithOptionalTitle、playAudio、pauseAudio、getAudioList、replaceAudioList、appendAudioList、AudioSettings、getAudioSettings、setAudioSettings、getCurrentAudio

## Audio

type Audio = {
  /** 标题 */
  title: string;
  /** 音频的网络链接 */
  url: string;
};

## AudioWithOptionalTitle

type AudioWithOptionalTitle = {
  /** 标题 */
  title?: string;
  /** 音频的网络链接 */
  url: string;
};


## playAudio

declare function playAudio(type: 'bgm' | 'ambient', audio: AudioWithOptionalTitle): void;


## pauseAudio

declare function pauseAudio(type: 'bgm' | 'ambient'): void;


## getAudioList

declare function getAudioList(type: 'bgm' | 'ambient'): Audio[];


## replaceAudioList

declare function replaceAudioList(type: 'bgm' | 'ambient', audio_list: AudioWithOptionalTitle[]): void;


## appendAudioList

declare function appendAudioList(type: 'bgm' | 'ambient', audio_list: AudioWithOptionalTitle[]): void;

## AudioSettings

type AudioSettings = {
  /** 是否启用 */
  enabled: boolean;
  /**
   * 当前播放模式
   * - repeat_one: 单曲循环
   * - repeat_all: 全部循环
   * - shuffle: 随机播放
   * - play_one_and_stop: 播放一首后停止
   */
  mode: 'repeat_one' | 'repeat_all' | 'shuffle' | 'play_one_and_stop';
  /** 是否静音 */
  muted: boolean;
  /** 当前音量 (0-100) */
  volume: number;
};


## getAudioSettings

declare function getAudioSettings(type: 'bgm' | 'ambient'): AudioSettings;


## setAudioSettings

declare function setAudioSettings(type: 'bgm' | 'ambient', settings: Partial<AudioSettings>): void;

## getCurrentAudio

declare function getCurrentAudio(type: 'bgm' | 'ambient'): CurrentAudio;
