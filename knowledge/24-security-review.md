---
title: 插件安全与代码审查清单
category: security
tags: [security, review, xss, path-traversal, csrf, checklist]
summary: 酒馆插件审查的固定顺序与高危点：HTML 注入、路径穿越、命令执行、越权外联、密钥处理、跨用户隔离，以及 AI 输出被当作代码执行的问题。
sources: [.github/skills/sillytavern-plugin-review/SKILL.md, SillyTavern/src/plugin-loader.js, SillyTavern/public/scripts/extensions.js]
---

# 插件安全与代码审查清单

审查按固定顺序推进，先定位入口，再看高风险面，最后给结论。第三方插件代码默认视为**不可信**。

## 1. 定位入口

- 前端：`manifest.json` 的 `js` / `css`、目录里的 `index.js`、`settings.html`。
- 后端：`plugins/<id>/index.{js,cjs,mjs}` 或 `package.json.main`。
- 构建：`vite.config.ts` / `webpack.config.js` 里的 `external`，确认没有把酒馆公共模块重复打包。

## 2. HTML 注入与 XSS

- 所有把数据插入 DOM 的地方：`innerHTML`、`$.append(html)`、模板渲染。
- 用户/模型可控内容必须经酒馆的消毒路径：`messageFormatting`、`renderExtensionTemplateAsync`（默认 `sanitize: true`）、`DOMPurify`。
- 高危写法：把 AI 生成内容直接 `innerHTML`；在 `settings.html` 中用未消毒的插值；用 `javascript:` 链接。

## 3. 路径与文件

- 后端拼路径：只要出现 `path.join(dir, req.query.x)` 就要检查是否做了白名单或规范化校验（`path.resolve` + 前缀比较）。
- 禁止把用户输入直接当文件名；禁止根据请求参数改变写入根目录。
- 只写 `req.user.directories.*` 或插件自己的目录；不要写酒馆安装根、不要写 `data/` 顶层。

## 4. 命令执行与动态代码

- `child_process` / `exec` / `spawn`：确认参数不是用户输入；优先改用纯 JS 实现（如读 `.git/HEAD` 而不是调 `git`）。
- `eval` / `new Function` / `import(dataUrl)`：任何由模型或用户内容构造的执行都必须视为严重问题（除非是产品明确定位，如"JS 运行器"类插件，且需强隔离与醒目告警）。
- 动态 `import()` 的路径参数同样要校验。

## 5. 网络与外联

- 后端插件不应在未告知用户的情况下向第三方域名发请求，尤其不要把聊天内容或密钥外传。
- 前端 `fetch` 的目标域名要固定；禁止把用户输入当作 URL 主机。
- Service Worker 会拦截全部请求，需要审查其匹配范围，避免吞掉/改道无关接口。

## 6. 密钥与隐私

- 密钥应走酒馆的 secrets 机制（`/api/secrets/*`），不要塞进 `extension_settings` 或插件目录的明文 JSON。
- 日志、错误信息、遥测里不得出现 API key、cookie、完整聊天记录。
- 读取用户数据要最小化：只读当前聊天/角色，不要遍历 `data/` 全目录。

## 7. CSRF 与会话

- 前端请求必须带 `getRequestHeaders()`（含 `x-csrf-token`）。
- 后端路由挂在 `/api/plugins/<id>` 下即可继承酒馆会话中间件，不要私自关闭或绕过 CSRF 校验。
- 不要实现"无令牌即可调用"的调试后门。

## 8. 多用户与隔离

- 后端必须使用 `req.user.directories`，**禁止硬编码 `default-user`**。
- 缓存键、数据库名、临时文件名都要按用户维度隔离；跨用户共享的缓存要确认不含用户数据。
- 前端插件无法与其它前端插件强隔离（同一页面环境），文档里要说明这一点，不要把"插件间隔离"当作安全边界。

## 9. 生命周期与资源

- 事件监听、定时器、Observer、Service Worker 是否在禁用/卸载时释放。
- 重复初始化是否幂等（UI 重复、请求风暴）。

## 10. 设置与迁移

- 默认值是否合并而不是覆盖；脏数据是否会导致崩溃；迁移是否幂等。

## 审查产出格式

- 先给**已确认问题**并标注严重级别（高/中/低）、文件路径与符号名。
- 再给**测试缺口**（没有覆盖的行为）。
- 不确定的按"假设"单列，不要与确认问题混在一起。
- 不做无关重构建议；不提交改动，除非明确要求。
