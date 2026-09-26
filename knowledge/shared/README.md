---
title: 共享沉淀区（shared）
category: shared
tags: [shared, contribute, convention]
summary: knowledge/shared/ 的用途与写入约定：Agent 排查出的可复用结论放这里，与人工整理的规范文档分开放。
sources: [st-plugin-kb/src/kb.js]
---

# 共享沉淀区（shared）

`knowledge/shared/` 专门存放**由实际排查/实现中沉淀下来的结论**，与按主题人工整理的规范文档（`00-*` ~ `25-*`）分开放，便于回看和清理。

## 什么内容应该放这里

- 踩坑记录：某个 API 与文档不一致的实际行为、版本差异。
- 项目特定约定：某个插件项目的构建/部署方式、目录布局的特殊之处。
- 排查过程与结论：某个"改了没生效"最终定位到了什么原因。
- 可复用的片段：一段经过验证的写法（必须说明验证环境：酒馆版本、插件版本）。

## 写入方式

Agent 直接调用 MCP 工具：

```json
{
  "name": "kb_add",
  "arguments": {
    "title": "cocktail-plus 部署后必须重启 Node 才生效的原因",
    "content": "## 现象\n…\n## 原因\n…\n## 结论\n…",
    "category": "shared",
    "tags": ["cocktail-plus", "deploy"],
    "summary": "一句话摘要"
  }
}
```

`kb_add` 会自动补 frontmatter（title/category/tags/summary/updated）并重建索引；同名文件存在时加 `append: true` 追加而不是覆盖。

人工写入就直接新建 `knowledge/shared/<名字>.md`，然后跑 `node scripts/build-index.mjs`（或让 Agent 调 `kb_reindex`）。

## 维护约定

1. 结论里写清**验证环境**与**可复现步骤**，避免后来者照搬失效结论。
2. 与已有规范文档冲突时，以源码为准，并回头修正规范文档，而不是只在这里记一笔。
3. 结论被上游修复或版本升级后失效时，直接删除该文件，保持知识库干净。
