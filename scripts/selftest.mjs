#!/usr/bin/env node
// 端到端自检：以真实 MCP stdio 协议启动 server.js，验证握手、工具列表、检索、读取、写入。
//
// 用法：node scripts/selftest.mjs

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const serverPath = path.join(projectDir, 'server.js');
const TIMEOUT_MS = 20_000;

const child = spawn(process.execPath, [serverPath], { stdio: ['pipe', 'pipe', 'pipe'], env: process.env });

let stdoutBuffer = '';
let stderrOutput = '';
const pending = new Map();
let requestId = 0;
const failures = [];
const notes = [];

child.stderr.on('data', chunk => {
    stderrOutput += chunk.toString('utf8');
});

child.stdout.on('data', chunk => {
    stdoutBuffer += chunk.toString('utf8');
    let index = stdoutBuffer.indexOf('\n');
    while (index !== -1) {
        const line = stdoutBuffer.slice(0, index).trim();
        stdoutBuffer = stdoutBuffer.slice(index + 1);
        if (line) dispatch(line);
        index = stdoutBuffer.indexOf('\n');
    }
});

/** 处理服务端返回的一帧 JSON-RPC 消息。 */
function dispatch(line) {
    let message;
    try {
        message = JSON.parse(line);
    } catch (error) {
        failures.push(`服务端输出了非 JSON 内容: ${line.slice(0, 200)}`);
        return;
    }
    const entry = pending.get(message.id);
    if (!entry) {
        failures.push(`收到未知 id 的响应: ${line.slice(0, 200)}`);
        return;
    }
    pending.delete(message.id);
    clearTimeout(entry.timer);
    if (message.error) {
        entry.reject(new Error(`${message.error.code}: ${message.error.message}`));
    } else {
        entry.resolve(message.result);
    }
}

/** 发送一次 JSON-RPC 请求并等待响应。 */
function request(method, params) {
    const id = ++requestId;
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params });
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            pending.delete(id);
            reject(new Error(`请求超时：${method}`));
        }, TIMEOUT_MS);
        pending.set(id, { resolve, reject, timer });
        child.stdin.write(`${payload}\n`);
    });
}

/** 断言辅助。 */
function check(condition, message) {
    if (condition) {
        notes.push(`  ok  ${message}`);
    } else {
        failures.push(message);
        notes.push(`  FAIL ${message}`);
    }
}

/** 从 tools/call 结果里取出文本。 */
function resultText(result) {
    return (result?.content ?? []).filter(item => item.type === 'text').map(item => item.text).join('\n');
}

const testDocId = 'shared/selftest-temp';
const testDocPath = path.join(projectDir, 'knowledge', 'shared', 'selftest-temp.md');

try {
    process.stdout.write('MCP 自检开始…\n');

    const init = await request('initialize', {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'st-plugin-kb-selftest', version: '1.0.0' },
    });
    check(init?.protocolVersion === '2025-06-18', `initialize 协议版本协商成功（${init?.protocolVersion}）`);
    check(init?.serverInfo?.name === 'st-plugin-kb', 'initialize 返回 serverInfo.name = st-plugin-kb');

    const list = await request('tools/list');
    const toolNames = (list?.tools ?? []).map(tool => tool.name);
    check(toolNames.length === 6, `tools/list 返回 6 个工具（实际 ${toolNames.length}）`);
    for (const expected of ['kb_search', 'kb_get', 'kb_list', 'kb_add', 'kb_reindex', 'kb_stats']) {
        check(toolNames.includes(expected), `工具存在：${expected}`);
    }

    const stats = await request('tools/call', { name: 'kb_stats', arguments: {} });
    const statsPayload = JSON.parse(resultText(stats));
    check(statsPayload.documents > 0, `kb_stats 报告文档数 ${statsPayload.documents}`);

    const docList = await request('tools/call', { name: 'kb_list', arguments: { category: 'frontend' } });
    check(resultText(docList).includes('10-frontend-manifest'), 'kb_list 能按 category=frontend 过滤出 manifest 文档');

    const search = await request('tools/call', {
        name: 'kb_search',
        arguments: { query: '前端扩展 manifest 字段 js css loading_order', limit: 3 },
    });
    check(!search?.isError, 'kb_search 调用未报错');
    check(resultText(search).includes('10-frontend-manifest'), 'kb_search 命中 manifest 规范文档');

    const mixed = await request('tools/call', {
        name: 'kb_search',
        arguments: { query: 'server plugin 注册 /api/plugins 路由 init', limit: 3 },
    });
    check(resultText(mixed).includes('20-server-plugin'), 'kb_search 中英混排查询命中后端插件文档');

    const got = await request('tools/call', { name: 'kb_get', arguments: { id: '10-frontend-manifest' } });
    check(resultText(got).includes('manifest.json'), 'kb_get 能取回 manifest 文档全文');

    const added = await request('tools/call', {
        name: 'kb_add',
        arguments: {
            id: 'selftest-temp',
            title: 'self test temp note',
            category: 'shared',
            tags: ['selftest'],
            content: '## 用途\n\n这条记录由 scripts/selftest.mjs 写入，用于验证 kb_add 与索引重建，测试结束后会被删除。',
        },
    });
    check(!added?.isError, 'kb_add 写入成功');

    const foundNew = await request('tools/call', {
        name: 'kb_search',
        arguments: { query: 'selftest-temp 写入验证', limit: 5 },
    });
    check(resultText(foundNew).includes(testDocId), `新写入的记录可被检索到（${testDocId}）`);

    const reindex = await request('tools/call', { name: 'kb_reindex', arguments: {} });
    check(resultText(reindex).includes('索引已重建'), 'kb_reindex 可手动重建索引');

    const unknown = await request('tools/call', { name: 'kb_not_exists', arguments: {} }).catch(error => ({ error }));
    check(Boolean(unknown?.error || unknown?.isError), '未知工具会被拒绝');
} catch (error) {
    failures.push(`执行异常：${error.message}`);
} finally {
    child.stdin.end();
    child.kill();

    if (fs.existsSync(testDocPath)) {
        fs.rmSync(testDocPath, { force: true });
        notes.push('  · 已清理自检临时文档');
    }
}

process.stdout.write(`${notes.join('\n')}\n`);

if (failures.length > 0) {
    process.stderr.write(`\n自检失败（${failures.length} 项）：\n${failures.map(item => `  - ${item}`).join('\n')}\n`);
    if (stderrOutput) {
        process.stderr.write(`\n服务端 stderr：\n${stderrOutput}\n`);
    }
    process.exit(1);
}

process.stdout.write('\n全部自检项通过\n');
process.exit(0);

