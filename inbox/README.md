# 投递区（inbox）

把要收进共享知识库的开发文档丢到这个文件夹里，然后跑一次导入：

```powershell
cd E:\MCP\st-plugin-kb
node scripts/import.mjs        # 等价于 npm run import
```

## 支持的格式

| 格式 | 说明 |
| --- | --- |
| `.md` / `.markdown` | 直接导入；已有 frontmatter 会被保留并补全缺失字段 |
| `.txt` | 按纯文本导入，首行/首个 `#` 作标题 |
| `.json` | 规格化为缩进 JSON 并包成代码块，便于 AI 读结构化内容 |
| `.html` / `.htm` | 去脚本样式、把标题/列表/换行转成 Markdown 风格纯文本 |
| `.docx` | 零依赖解包 `word/document.xml`，保留 Heading1-6 层级与实体解码 |
| `.zip` | 解包后按条目逐个导入（可含子目录、中文名），适合一次投一整套文档 |

`.pdf`、`.doc`（旧格式）、图片暂不支持，请先转成 `.md` / `.txt`，或打包成 `.zip` 再投。

## 行为

1. 按 sha256 去重：同一份内容重复导入会被跳过（`--force` 强制重导）。
2. 原件导入成功后移动到 `inbox/imported/`，保持 inbox 干净；`inbox/.import-manifest.json` 记录 内容哈希 → 知识文件 的映射。
3. 生成的知识文件写入 `knowledge/imported/`，带 frontmatter（title / category / tags / summary / sources / imported）。
4. 导入结束自动重建索引，立刻可以被 `kb_search` 检索到。
5. 本说明文件（`inbox/README.md`）不会被自动导入；确实要导入它需显式指定路径。

## 常用参数

```powershell
node scripts/import.mjs --category frontend            # 指定分类（默认 imported）
node scripts/import.mjs --tags st,tutorial             # 追加标签
node scripts/import.mjs --dry-run                      # 只看会做什么，不落盘
node scripts/import.mjs --force                        # 忽略去重，强制重导
node scripts/import.mjs E:\某处\插件开发笔记.md        # 直接指定文件/目录（不移动原件）
node scripts/import.mjs --title-from-first-line        # 标题取首行而非首个 # 标题
```

## 导入后建议

- 用 `kb_search` 抽查几条，确认标题/摘要/切块合理；不满意就改 `knowledge/imported/` 下的 md（可自由编辑），然后 `node scripts/build-index.mjs`。
- 内容与 `00-*` ~ `25-*` 规范文档冲突时，以源码实测为准，并回头修正规范文档。
