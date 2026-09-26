---
title: 扩展设置持久化与迁移
category: frontend
tags: [settings, extension_settings, migration, persistence]
summary: 用 extension_settings 存插件配置的正确姿势、saveSettingsDebounced 的时机、默认值合并与版本迁移写法。
sources: [SillyTavern/public/scripts/extensions.js, SillyTavern/public/script.js, SillyTavern/data/default-user/settings.json]
---

# 扩展设置持久化与迁移

## 存储位置

所有前端扩展的设置都存在酒馆的用户设置文件里（单用户模式为 `data/default-user/settings.json`）的 `extension_settings` 字段下，按扩展名分键：

```json
{
  "extension_settings": {
    "cocktail-plus": { "...": "该扩展的配置" },
    "ST-BaiBai-Inkwell": { "...": "该扩展的配置" }
  }
}
```

因此：设置随用户走、可被酒馆的备份/多用户机制覆盖，**不是** `localStorage`，也不应该用 `localStorage` 存配置（浏览器侧数据不跟随账号、清理浏览器就丢）。

## 读写范式

```js
import { extension_settings, getContext } from '../../../extensions.js';
import { saveSettingsDebounced } from '../../../../script.js';

const MODULE = 'my-plugin';
const defaults = { enabled: true, depth: 4, mode: 'auto' };

function settings() {
    if (!extension_settings[MODULE] || typeof extension_settings[MODULE] !== 'object') {
        extension_settings[MODULE] = { ...defaults };
    }
    // 缺键补齐：老版本设置缺字段时也能跑
    for (const [key, value] of Object.entries(defaults)) {
        if (extension_settings[MODULE][key] === undefined) {
            extension_settings[MODULE][key] = value;
        }
    }
    return extension_settings[MODULE];
}

export function setDepth(value) {
    settings().depth = Number(value) || defaults.depth;
    saveSettingsDebounced();   // 高频操作务必用防抖版本
}
```

要点：

1. **永远走"取设置"函数而不是直接读全局键**，避免 undefined 崩溃。
2. **合并默认值**而不是整体覆盖，用户已有的配置不能因为新增字段被重置。
3. 更改后调用 `saveSettingsDebounced()`；只有需要立刻落盘（例如卸载前、页面即将跳转）才用非防抖路径。
4. 需要跨聊天/跨角色的临时状态不要进设置文件，放进 `chat_metadata`（配合 `saveMetadataDebounced()`），随聊天保存。

## 版本迁移

给设置加一个 `version` 字段，启动时按区间升级：

```js
const CURRENT_VERSION = 3;

function migrate(store) {
    const from = Number(store.version ?? 0);
    if (from < 1) { store.exposeApi = false; }
    if (from < 2) { store.mode = store.legacyMode ?? 'auto'; delete store.legacyMode; }
    if (from < 3) { store.depth = Math.min(Number(store.depth) || 4, 10); }
    store.version = CURRENT_VERSION;
    if (from !== CURRENT_VERSION) saveSettingsDebounced();
}
```

迁移函数要满足：**幂等**（重复执行结果一致）、**不抛异常**（脏数据也要能走完）、**只做结构升级**（不做网络请求）。

## 多人/多浏览器注意事项

- 设置以酒馆服务端用户为单位保存，同一账号在不同浏览器看到的是同一份配置。
- 需要"每个浏览器独立"的数据（例如面板展开状态）可以放 `accountStorage`（`SillyTavern.getContext().accountStorage`），它同样持久化在服务端账号存储里，适合放 UI 偏好，见 `accountStorage` 的键值用法。
- 大量二进制/结构化数据不要塞进 settings.json（会拖慢设置读写），用后端插件（如 `plugins/baibaoku` 的 SQLite KV）或 `chat_metadata`。
