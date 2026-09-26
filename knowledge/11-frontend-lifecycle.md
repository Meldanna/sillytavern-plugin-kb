---
title: 前端扩展加载生命周期
category: frontend
tags: [lifecycle, events, activate, extension-settings]
summary: 从页面加载到扩展可用的完整时序、各阶段可安全做的事情，以及 activate 钩子与 EXTENSION_SETTINGS_LOADED / APP_READY 的取舍。
sources: [SillyTavern/public/scripts/extensions.js, SillyTavern/public/scripts/events.js]
---

# 前端扩展加载生命周期

## 时序

1. 页面加载 `public/index.html`，`<head>` 中的 Early Bridge 类脚本最先执行（可提前 patch `window.fetch`，但不要依赖此时酒馆 API 可用）。
2. `script.js` 启动，读取 `/api/settings/get`，其中包含 `extension_settings`。
3. 发现扩展并读取 `manifest.json`，按 `loading_order` 排序。
4. 对每个满足条件的扩展：`addExtensionLocale()` → `addExtensionScript()` + `addExtensionStyle()` → 标记已激活 → `callExtensionHook(name, 'activate')`。
5. 依次派发 `EXTENSIONS_FIRST_LOAD`、`EXTENSION_SETTINGS_LOADED`、`SETTINGS_LOADED`、`APP_READY` 等事件。

因此：扩展模块顶层代码执行时，`extension_settings` 通常已可用，但角色/聊天数据可能还没就绪。

## 扩展钩子（extension 目录下的 index.js 可导出）

| 钩子 | 触发时机 | 用途 |
| --- | --- | --- |
| `activate` | 每次激活时 | 注册 UI、事件、Slash 命令 |
| `enable` / `disable` | 用户在扩展面板启用/禁用 | 切换开关状态、清理 UI |
| `update` | 面板执行更新后 | 迁移设置、提示重载 |
| `clean` | 卸载/删除前 | 清理设置与残留 |
| `delete` | 删除扩展时 | 最终清理 |
| `install` | 安装完成后 | 首次安装初始化 |

前端项目更常见的做法是只在入口模块里做注册，不导出钩子。

## 初始化时机的选择

- **尽早注册、延迟取数**：在模块顶层就注册事件监听和命令，等到 `APP_READY` 或 `CHAT_CHANGED` 再去读角色/聊天数据。
- **必须等设置就绪**：读写 `extension_settings` 时优先监听 `EXTENSION_SETTINGS_LOADED`，避免被后续的设置覆盖。
- **不要只依赖 `$(document).ready`**：酒馆是单页应用，`ready` 只表示 DOM 就绪，不代表角色和聊天已加载。

```js
import { eventSource, event_types } from '../../../events.js';

const ctx = SillyTavern.getContext();

eventSource.on(event_types.EXTENSION_SETTINGS_LOADED, initSettingsOnce);
eventSource.on(event_types.APP_READY, () => {
    buildUi();
    registerSlashCommands();
});
eventSource.on(event_types.CHAT_CHANGED, () => resetPerChatState());
```

## 清理与幂等

- 页面不刷新时的重复初始化（例如插件自身重建 UI）必须幂等：先移除旧监听/旧 DOM，再重建。
- 使用 `eventSource.once()` 处理只需一次的逻辑，用 `makeFirst` / `makeLast` 控制与其他扩展的执行顺序（如 `tts` 用 `makeLast` 保证最后朗读）。
- 定时器、`MutationObserver`、`ResizeObserver`、`Service Worker` 都要在禁用/卸载路径上显式释放，否则热重载时会叠加。

## 与事件系统的关系

`event_types` 的完整清单见 `13-events` 文档；酒馆 1.18.0 中这些事件由 `public/scripts/events.js` 统一导出，第三方扩展应直接导入而不是硬编码字符串：

```js
import { eventSource, event_types } from '../../../events.js';
```
