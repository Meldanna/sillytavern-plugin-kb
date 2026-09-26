#!/usr/bin/env node
// 命令行查库：不经过 MCP 客户端，直接以 stdio 协议调一次工具，把结果打到终端或写入文件。
//
// 用法：
//   node scripts/call.mjs kb_stats
//   node scripts/call.mjs kb_search query="manifest 字段" limit=3
//   node scripts/call.mjs kb_get id=10-frontend-manifest
//   node scripts/call.mjs kb_search query="事件订阅" out=C:\temp\result.txt
//
// 参数规则：`key=value`，值会先尝试按 JSON 解析（失败则当字符串），因此数组/数字可直接写：
//   node scripts/call.mjs kb_search query="宏" tags=["macros"] limit=5
//
// 也支持从 JSONL 文件读整批请求（每行一个 JSON-RPC 消息）：
//   node scripts/call.mjs --jsonl requests.jsonl
//
// 注意：Windows PowerShell 会吞掉裸 JSON 里的双引号，所以这里刻意用 key=value 传参，
// 避免 `kb-call '{"id":"x"}'` 这类写法出错。

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const serverPath = path.join(projectDir, 'server.js');

const args = process.argv.slice(2);
const TIMEOUT_MS = 15_000;

/** 解析 --jsonl 模式。 */
const jsonlIndex = args.indexOf('--jsonl');

/** 解析 key=value 参数。 */
function parseArgs(list) {
    const out = { outFile: null, input: {} };
    for (const item of list) {
        if (item.startsWith('--')) continue;
        const eq = item.indexOf('=');
        if (eq === -1) continue;
        const key = item.slice(0, eq);
        const value = item.slice(eq + 1);
        if (key === 'out') {
            out.outFile = value;
            continue;
        }
        try {
            out.input[key] = JSON.parse(value);
        } catch {
            out.input[key] = value;
        }
    }
    return out;
}

const { outFile, input } = parseArgs(args);
const child = spawn(process.execPath, [serverPath], { stdio: ['pipe', 'pipe', 'inherit'] });

let buffer = '';
let finished = false;
const parts = [];
/** --jsonl 模式下：已发送的请求条数 / 已收到的响应条数。 */
let expectedReplies = 0;
let receivedReplies = 0;

/** 输出一行结果（写文件或打终端）。 */
function write(line) {
    if (outFile) {
        parts.push(line);
        return;
    }
    process.stdout.write(`${line}\n`);
}

/** 结束进程并落盘。 */
function finish(code) {
    if (finished) return;
    finished = true;
    if (outFile) {
        fs.writeFileSync(outFile, parts.join('\n'), 'utf8');
        process.stdout.write(`结果已写入 ${outFile}\n`);
    }
    child.kill();
    process.exit(code);
}

/** 发送一条 JSON-RPC 消息。 */
function send(message) {
    child.stdin.write(`${JSON.stringify(message)}\n`);
}

child.stdout.on('data', chunk => {
    buffer += chunk.toString('utf8');
    let index;
    while ((index = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, index).trim();
        buffer = buffer.slice(index + 1);
        if (!line) continue;

        let message;
        try {
            message = JSON.parse(line);
        } catch {
            continue;
        }

        if (message.id === 'init') {
            if (jsonlIndex !== -1) {
                const file = args[jsonlIndex + 1];
                const rows = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(row => row.trim());
                expectedReplies = rows.length;
                for (const row of rows) child.stdin.write(`${row.trim()}\n`);
            } else {
                send({ jsonrpc: '2.0', id: 'call', method: 'tools/call', params: { name: args[0], arguments: input } });
            }
            continue;
        }

        if (message.error) {
            write(`错误 ${message.error.code}: ${message.error.message}`);
            finish(1);
            continue;
        }

        const result = message.result;
        if (!result) continue;

        if (result.content) {
            write(result.content.filter(item => item.type === 'text').map(item => item.text).join('\n'));
        } else {
            write(JSON.stringify(result));
        }

        if (jsonlIndex !== -1 && ++receivedReplies >= expectedReplies) {
            finish(0);
        } else if (message.id === 'call') {
            finish(result.isError ? 1 : 0);
        }
    }
});

send({
    jsonrpc: '2.0',
    id: 'init',
    method: 'initialize',
    params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'call', version: '1.0' } },
});

setTimeout(() => {
    write('TIMEOUT');
    finish(2);
}, TIMEOUT_MS);
