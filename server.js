#!/usr/bin/env node
// st-plugin-kb 的 MCP(stdio) 服务入口。
//
// 用法：
//   node server.js            # 以 MCP stdio 服务运行（供 Cline / Roo Code 等客户端启动）
//   node server.js --doctor   # 自检：打印知识库统计信息后退出
//   node server.js --help     # 帮助
//
// 说明：stdout 只用于 JSON-RPC 帧，任何日志写入 stderr，避免污染协议流。

import { createKnowledgeBase } from './src/kb.js';
import { createMcpServer, projectDirFromMetaUrl, SERVER_NAME, SERVER_VERSION } from './src/mcp.js';

const projectDir = projectDirFromMetaUrl(import.meta.url);
const kb = createKnowledgeBase(projectDir);
const handleMessage = createMcpServer({ kb });

/** 打印启动自检信息。 */
function printDoctor() {
    kb.rebuild();
    const stats = kb.stats();
    const lines = [
        `${SERVER_NAME} v${SERVER_VERSION}`,
        `project: ${projectDir}`,
        `knowledge root: ${stats.root}`,
        `documents: ${stats.documents}`,
        `chunks: ${stats.chunks}`,
        `bytes: ${stats.totalBytes}`,
        `builtAt: ${stats.builtAt}`,
        'categories:',
        ...Object.entries(stats.categories).map(([name, count]) => `  - ${name}: ${count}`),
    ];
    process.stdout.write(`${lines.join('\n')}\n`);
}

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write([
        'Usage: node server.js [--doctor] [--help]',
        '',
        '  (no args)  以 MCP stdio 服务运行',
        '  --doctor   打印知识库统计信息后退出',
        '  --help     显示帮助',
        '',
        `知识库目录可用环境变量 ST_KB_ROOT 覆盖（当前：${kb.root}）`,
        '',
    ].join('\n') + '\n');
    process.exit(0);
}

if (args.includes('--doctor')) {
    kb.rebuild();
    printDoctor();
    process.exit(0);
}

kb.rebuild();
process.stderr.write(`[${SERVER_NAME}] v${SERVER_VERSION} ready · ${kb.docs.size} docs / ${kb.chunks.length} chunks · root=${kb.root}\n`);

let buffer = '';

/** 处理一行完整的 JSON-RPC 消息。 */
async function processLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return;

    let message;
    try {
        message = JSON.parse(trimmed);
    } catch (error) {
        process.stderr.write(`[${SERVER_NAME}] JSON 解析失败: ${error.message}\n`);
        process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } })}\n`);
        return;
    }

    const response = await handleMessage(message);
    if (response) {
        process.stdout.write(`${JSON.stringify(response)}\n`);
    }
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
    buffer += chunk;
    let index = buffer.indexOf('\n');
    while (index !== -1) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 1);
        void processLine(line);
        index = buffer.indexOf('\n');
    }
});

process.stdin.on('end', () => {
    if (buffer.trim()) {
        void processLine(buffer);
        buffer = '';
    }
});

process.stdin.on('error', error => {
    process.stderr.write(`[${SERVER_NAME}] stdin 错误: ${error.message}\n`);
});

process.on('uncaughtException', error => {
    process.stderr.write(`[${SERVER_NAME}] uncaughtException: ${error?.stack ?? error}\n`);
});

process.on('unhandledRejection', reason => {
    process.stderr.write(`[${SERVER_NAME}] unhandledRejection: ${reason}\n`);
});
