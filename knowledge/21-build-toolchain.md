---
title: 前端扩展构建工具链
category: build
tags: [vite, webpack, esbuild, build, dist]
summary: 本工作区已在用的三种构建范式（vite / webpack / esbuild）、必须 external 的酒馆公共模块、产物与 manifest 的对接方式。
sources: [SillyTavern/public/scripts/extensions/third-party/ST-BaiBai-Inkwell/vite.config.ts, SillyTavern/public/scripts/extensions/third-party/cocktail-plus/package.json, SillyTavern/public/scripts/extensions/third-party/ST-Prompt-Template/webpack.config.js]
---

# 前端扩展构建工具链

酒馆不参与扩展的构建，扩展自己产出可直接被浏览器加载的 ESM 文件即可。工作区里已有三种成熟范式，新插件优先沿用与自身最接近的一种。

## 三种范式对照

| 范式 | 代表项目 | 特点 |
| --- | --- | --- |
| Vite + TypeScript（+ Vue） | `ST-BaiBai-Inkwell`、`ST-BaiBai-Book`、`JS-Slash-Runner` | `vite build` 产出 `dist/index.js`，支持 HMR 式 watch，适合 UI 重的插件 |
| esbuild（前后端一体） | `cocktail-plus` | 前端用 vite，后端 `server-plugins/<id>/src/index.ts` 用 esbuild 打成 `index.mjs` |
| webpack + TS | `ST-Prompt-Template` | 老牌方案，配置重但插件生态成熟 |

## 必须 external 的东西

酒馆页面里已经有这些库，重新打包会造成体积膨胀和"双实例"问题（例如两份 jQuery 的事件系统不互通）：

```
/script.js  →  其实是 https 根路径下的公共模块
jquery → $
lodash → _
toastr → toastr
@sillytavern/*  →  SillyTavern/public 下的文件
```

`ST-BaiBai-Inkwell` 的写法值得直接复用（`vite.config.ts`）：

```ts
plugins: [
  {
    name: 'sillytavern-resolver',
    enforce: 'pre',
    resolveId(id) {
      if (id.startsWith('@sillytavern/')) {
        return { id: toRelativePublicRoot(id.replace('@sillytavern/', '')) + '.js', external: true };
      }
      if (id in globals) return { id, external: true };
    },
  },
],
build: {
  rollupOptions: {
    input: 'src/index.ts',
    output: { format: 'es', entryFileNames: '[name].js', globals },
    external: id => id in globals,
  },
  outDir: 'dist',
  emptyOutDir: false,
  target: 'esnext',
}
```

约定：`@sillytavern/script` → `public/script.js`，`@sillytavern/scripts/extensions.js` → `public/scripts/extensions.js`。裸相对路径导入（`../../../events.js`）同样要标 external，否则会试图打包酒馆源码。

## 产物与 manifest 的对接

1. `manifest.json` 的 `js` 指向构建产物：`"js": "dist/index.js"`。
2. 产物必须是 ESM（浏览器按 `<script type="module">` 注入）。
3. 需要缓存失效时给 `js` 加版本查询串（`dist/index.js?ver=0.4.1`），并在 `prebuild` 阶段由 `scripts/sync-version.mjs` 从 `package.json` 同步版本号。
4. `css` 字段同理指向 `dist/style.css`。
5. `dist/` 通常要提交进仓库：用户端用酒馆面板直接 clone 安装，不会跑构建。`ST-BaiBai-Inkwell` 用 `emptyOutDir: false` 保证把别的手工文件保留下来。

## 常用脚本形态

```json
{
  "scripts": {
    "prebuild": "node scripts/sync-version.mjs",
    "build": "vite build --configLoader runner",
    "watch": "vite build --watch --mode development --configLoader runner",
    "typecheck": "vue-tsc --noEmit",
    "test": "vitest run",
    "deploy": "powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy-to-sillytavern.ps1"
  }
}
```

- `watch` 模式改源码即出产物，配合浏览器刷新即可验证，避免每次手动 build。
- 有部署脚本的项目（如 `cocktail-plus`）要显式保留目标端配置文件与缓存目录，并做旧版本备份（`.deploy-backups/`）。

## 常见构建坑

- **忘记 external jQuery**：插件里 `$` 与酒馆的 `$` 不是同一个实例，事件与选择器行为异常。
- **target 过低**：`target: 'esnext'` 是这类项目的默认选择，压低到 es5 会破坏依赖的现代语法（如可选链、顶层 await）。
- **sourcemap 与压缩**：生产构建通常 `minify: true`；调试期用 `--mode development` 保持可读。
- **改了源码忘了 build**：表现是"代码改了没生效"，见 `22-local-dev-loop`。
