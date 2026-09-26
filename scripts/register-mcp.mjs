#!/usr/bin/env node
// 把（任意）知识库的 MCP 服务注册进客户端配置，供 Cline / Roo Code 等调用。
//
// 用法（在本项目里执行时，默认注册本项目自己的 server.js）：
//   node scripts/register-mcp.mjs                       # 写入 <工作区>/.roo/mcp.json（自动备份）
//   node scripts/register-mcp.mjs --target roo          # 同上
//   node scripts/register-mcp.mjs --target cline        # 写入 Cline 的两处配置（存在就写，否则打印片段）
//   node scripts/register-mcp.mjs --target roo,cline    # 两处都写
//   node scripts/register-mcp.mjs --print               # 只打印片段，不落盘
//
// 注册**另一个**知识库（不必进那个目录，用 --name/--server 指定即可）：
//   node scripts/register-mcp.mjs --name code-connect-kb --server E:\MCP\code-connect-kb\server.js --target cline
//
// 幂等：重复执行只会覆盖同名的这一项，其他 MCP 服务保持原样；写前自动备份。

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const defaultServerPath = path.join(projectDir, 'server.js');

const args = process.argv.slice(2);
const printOnly = args.includes('--print');

/** 取 --key value 形式的参数。 */
function option(name, fallback = null) {
    const index = args.indexOf(`--${name}`);
    return index !== -1 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback;
}

/** 工作区根（决定 roo 目标写哪份 .roo/mcp.json）；可用 --workspace 覆盖。 */
/**
 * 找酒馆工作区根（Cline / Roo 从工作区根读 .roo/mcp.json，工作区文件也写在这里）。
 * 知识库已移出酒馆目录，所以从知识库的父目录出发逐层找含 .roo / SillyTavern 的那一层：
 *   E:\MCP\st-plugin-kb → 上级 E:\MCP（无 .roo）→ 再上级 E:\SillyTavern（有 .roo）✔
 * 旧布局（知识库还在酒馆目录里）结果不变，仍返回知识库的父目录。
 */
function findWorkspaceRoot(start) {
    const candidates = [
        start,
        path.join(start, 'SillyTavern'),
        path.resolve(start, '..', 'SillyTavern'),
        path.resolve(start, '..'),
    ];
    return candidates.find(dir => fs.existsSync(path.join(dir, '.roo'))) ?? start;
}
const workspaceRoot = path.resolve(option('workspace', findWorkspaceRoot(path.dirname(projectDir))));

/** 服务 id（写入 mcpServers 的键名）；默认取项目目录名，避免误覆盖另一个知识库。 */
const serverId = option('name', path.basename(projectDir));
/** 启动命令：默认当前 node 可执行文件；可用 --command 覆盖（例如写 "node"）。 */
const command = option('command', process.execPath);
/** 服务脚本绝对路径。 */
const serverPath = path.resolve(option('server', defaultServerPath));
/** 目标：roo / cline，可用逗号组合。 */
const targets = (option('target', 'roo') ?? 'roo').split(',').map(item => item.trim()).filter(Boolean);

if (!fs.existsSync(serverPath)) {
    process.stderr.write(`警告：server 脚本不存在 → ${serverPath}\n（仍然会写入配置，但客户端启动时会失败）\n`);
}

/** 生成要写入的 MCP 服务条目。 */
function serverEntry() {
    return {
        command,
        // 注意：这里放原始路径即可，JSON.stringify 会负责转义
        args: [serverPath],
        disabled: false,
        autoApprove: [],
        env: {},
    };
}

/** 相对工作区的展示用路径。 */
function rel(filePath) {
    return path.relative(workspaceRoot, filePath).replace(/\\/g, '/');
}

/** 备份 + 写入 JSON。 */
function writeJson(filePath, data) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    if (fs.existsSync(filePath)) {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        fs.copyFileSync(filePath, `${filePath}.bak-${stamp}`);
    }
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 4)}\n`, 'utf8');
}

/** 合并条目到 mcpServers 结构（只动自己这一项）。 */
function mergeConfig(existing, entry) {
    const config = existing && typeof existing === 'object' ? structuredClone(existing) : {};
    config.mcpServers = config.mcpServers ?? {};
    config.mcpServers[serverId] = entry;
    return config;
}

const entry = serverEntry();
const snippet = { mcpServers: { [serverId]: entry } };

/** 写入工作区级 `.roo/mcp.json`。 */
function registerRoo() {
    const configPath = path.join(workspaceRoot, '.roo', 'mcp.json');
    if (printOnly) {
        process.stdout.write(`将写入 ${configPath}：\n${JSON.stringify(snippet, null, 4)}\n`);
        return;
    }

    let existing = {};
    if (fs.existsSync(configPath)) {
        try {
            existing = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            process.stderr.write(`现有 ${rel(configPath)} 解析失败：${error.message}\n`);
            return;
        }
    }

    writeJson(configPath, mergeConfig(existing, entry));
    process.stdout.write([
        `已注册 ${serverId} → ${rel(configPath)}`,
        `  command: ${entry.command}`,
        `  args:    ${serverPath}`,
        '',
    ].join('\n'));
}

/** 写入 Cline 的两处配置（存在哪个写哪个）。 */
function registerCline() {
    const appData = process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming');
    // Cline 有两代配置位置：新版在 ~/.cline/data，旧版在 VS Code globalStorage。
    // 注意：只写旧版一份是"注册了却看不到"的最常见原因——一定要对齐客户端实际读取的那份。
    const candidates = [
        path.join(appData, 'Code', 'User', 'globalStorage', 'saoudrizwan.claude-dev', 'settings', 'cline_mcp_settings.json'),
        path.join(os.homedir(), '.cline', 'data', 'settings', 'cline_mcp_settings.json'),
    ];
    const present = candidates.filter(file => fs.existsSync(file));

    if (printOnly || present.length === 0) {
        process.stdout.write([
            `Cline 的 MCP 配置文件（已存在 ${present.length} 个）：`,
            ...candidates.map(file => `  ${fs.existsSync(file) ? '[存在]' : '[无]  '} ${file}`),
            '把下面这段合并进该文件的 mcpServers 字段即可：',
            '',
            JSON.stringify(snippet, null, 4),
            '',
        ].join('\n'));
        return;
    }

    for (const configPath of present) {
        let config = {};
        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (error) {
            process.stderr.write(`现有配置解析失败（跳过）：${configPath} — ${error.message}\n`);
            continue;
        }
        writeJson(configPath, mergeConfig(config, entry));
        process.stdout.write(`已注册 ${serverId} → ${configPath}\n`);
    }
}

let handled = false;

for (const target of targets) {
    if (target === 'roo') {
        registerRoo();
        handled = true;
    } else if (target === 'cline') {
        registerCline();
        handled = true;
    } else {
        process.stderr.write(`未知 --target：${target}（可选 roo / cline，可用逗号组合）\n`);
    }
}

if (!handled) {
    process.exit(1);
}

if (!printOnly) {
    process.stdout.write(`重启 MCP 客户端（或重新加载工作区）后，工具列表里会出现 ${serverId} 的 kb_* 工具。\n`);
}
process.exit(0);
