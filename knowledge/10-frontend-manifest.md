---
title: 前端扩展 manifest.json 规范
category: frontend
tags: [manifest, extension, loading_order, i18n]
summary: manifest.json 支持的全部字段、酒馆 1.18.0 的实际校验规则，以及各项目在用的真实写法。
sources: [SillyTavern/public/scripts/extensions.js, SillyTavern/public/scripts/extensions/third-party/JS-Slash-Runner/manifest.json]
---

# 前端扩展 manifest.json 规范

`manifest.json` 是前端扩展的唯一注册表。酒馆在启动时列出扩展、逐个 `fetch('/scripts/extensions/<name>/manifest.json')`，再据此决定是否激活。

## 字段一览

```json
{
  "display_name": "柏宝砚",
  "loading_order": 101,
  "requires": [],
  "optional": [],
  "dependencies": [],
  "js": "dist/index.js?ver=0.4.1",
  "css": "dist/style.css",
  "i18n": { "en": "i18n/en.json", "zh-cn": "i18n/zh-cn.json" },
  "author": "柏柏",
  "version": "0.4.1",
  "homePage": "https://github.com/baibai-git/ST-BaiBai-Inkwell",
  "auto_update": false,
  "minimum_client_version": "1.12.13"
}
```

| 字段 | 作用 | 备注 |
| --- | --- | --- |
| `js` | 入口脚本，相对扩展目录 | 注入为 `<script type="module" async>`，支持 `?ver=` 查询串做缓存刷新 |
| `css` | 样式表，相对扩展目录 | 以 `<link rel="stylesheet">` 注入，非必填 |
| `loading_order` | 激活顺序，越小越早 | 未填时按默认值参与排序 |
| `display_name` | 扩展面板展示名 | 缺省回退到目录名 |
| `requires` | 依赖的 Extras 模块名数组 | 不满足则跳过激活 |
| `optional` | 可选 Extras 模块 | 不影响激活 |
| `dependencies` | 依赖的其他扩展名数组 | 依赖项缺失或被禁用都会导致本扩展不激活 |
| `minimum_client_version` | 最低酒馆版本 | 用 `versionCompare(clientVersion, min)` 判断，未填则不校验 |
| `i18n` | 语言到语言包路径的映射 | 按当前语言取一个文件，`fetch` 成功后 `addLocaleData()` |
| `auto_update` | 是否允许面板一键更新 | 需目录为 git 仓库 |
| `author` / `version` / `homePage` | 元信息 | 仅展示与更新用 |

## 校验与失败行为

- `requires`、`dependencies` 必须是数组；类型不对只告警，不阻止加载。
- `dependencies` 指向未安装或被禁用的扩展时，本扩展不激活，面板出现 "did not load" 警告。
- `minimum_client_version` 高于当前客户端版本时不激活。
- `js` 为空的扩展只做样式/定位用途，脚本部分直接跳过。

## 实践约定

1. `js` 指向构建产物（如 `dist/index.js`），源码放 `src/`，两者都提交，避免用户端缺少构建环境。
2. 版本号同时写入 `manifest.json` 与 `package.json`；`ST-BaiBai-Inkwell` 用 `scripts/sync-version.mjs` 在 `prebuild` 阶段自动同步，并把 `?ver=` 拼进 `js` 字段。
3. `dependencies` 只写真正强依赖的扩展，弱耦合（例如"有柏宝库就用，没有就降级"）改为运行时探测：`window.BaiBaoKu?.isAvailable()`。
4. 目录名即扩展 id，尽量与仓库名一致；改目录名等于换 id，会丢失用户原有的启用状态与设置键。
