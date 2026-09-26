#!/usr/bin/env node
// 重建知识库索引并落盘到 index/kb-index.json，便于人工查看或纳入版本管理。
//
// 用法：node scripts/build-index.mjs [--quiet]

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createKnowledgeBase } from '../src/kb.js';

const projectDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const quiet = process.argv.includes('--quiet');

const kb = createKnowledgeBase(projectDir).rebuild();
const indexPath = path.join(projectDir, 'index', 'kb-index.json');
kb.writeIndex(indexPath);

const stats = kb.stats();

if (!quiet) {
    process.stdout.write([
        `知识库索引已重建：${stats.documents} 篇文档 / ${stats.chunks} 个切块`,
        `索引文件：${indexPath}`,
        `文档总字节：${stats.totalBytes}`,
        '分类分布：',
        ...Object.entries(stats.categories).map(([name, count]) => `  - ${name}: ${count}`),
        '',
    ].join('\n') + '\n');
}
