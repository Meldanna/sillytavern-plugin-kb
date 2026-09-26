#!/usr/bin/env node
// 生成 VS Code 多根工作区文件（"项目组"）：把酒馆本体、知识库、各插件项目编组到一个 .code-workspace
//
// 用法：
//   node scripts/make-workspace.mjs            # 生成 E:\SillyTavern\st-plugins.code-workspace
//   node scripts/make-workspace.mjs --print    # 只打印内容
//
// 设计：
//   1. 第一个根目录固定为工作区总目录（AGENTS.md / .clinerules / .roo/mcp.json 都在这里），
//      这样 Cline / Roo 的规则与 MCP 配置仍然生效。
//   2. 各插件项目单独作为根目录，资源管理器里就能平铺看到、Source Control 里每个仓库独立列出。
//   3. 总目录里被"提"成独立根目录的插件路径会被 files.exclude 隐藏，避免同一份代码出现两次。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
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
const workspaceRoot = findWorkspaceRoot(path.dirname(projectDir));            // E:\SillyTavern
const stRoot = path.join(workspaceRoot, 'SillyTavern');    // 酒馆本体
const outputPath = path.join(workspaceRoot, 'st-plugins.code-workspace');

// 插件项目的三个存放位置
const THIRD_PARTY = path.join(stRoot, 'public', 'scripts', 'extensions', 'third-party');
const USER_EXT = path.join(stRoot, 'data', 'default-user', 'extensions');
const SERVER_PLUGINS = path.join(stRoot, 'plugins');

/** 列出某目录下的项目子目录（含 manifest.json 或 package.json 或 .git 即认为是项目）。 */
function listProjects(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
        .filter(entry => {
            const full = path.join(dir, entry.name);
            return ['manifest.json', 'package.json', '.git', 'README.md'].some(marker => fs.existsSync(path.join(full, marker)));
        })
        .map(entry => entry.name)
        .sort((a, b) => a.localeCompare(b));
}

const thirdParty = listProjects(THIRD_PARTY);
const userExt = listProjects(USER_EXT);
const serverPlugins = listProjects(SERVER_PLUGINS);

// 用户目录里与 third-party 重名的扩展只保留一份（third-party 是源码位置）
const duplicated = userExt.filter(name => thirdParty.includes(name));

const folders = [
    { name: '🏠 总目录（AGENTS.md / .clinerules / MCP / 知识库入口）', path: workspaceRoot },
    { name: '📚 st-plugin-kb（开发知识库）', path: projectDir },
    ...thirdParty.map(name => ({ name: `🧩 ${name}`, path: path.join(THIRD_PARTY, name) })),
    ...userExt.filter(name => !duplicated.includes(name)).map(name => ({ name: `🧩 ${name}（用户目录安装）`, path: path.join(USER_EXT, name) })),
    ...serverPlugins.map(name => ({ name: `🔌 ${name}（后端 server plugin）`, path: path.join(SERVER_PLUGINS, name) })),
];

// 总目录里隐藏"已提升为独立根目录"的插件路径，避免重复显示
const hideInRoot = [
    ...thirdParty.map(name => path.join('SillyTavern', 'public', 'scripts', 'extensions', 'third-party', name)),
    ...userExt.map(name => path.join('SillyTavern', 'data', 'default-user', 'extensions', name)),
    ...serverPlugins.map(name => path.join('SillyTavern', 'plugins', name)),
].map(relative => relative.replace(/\\/g, '/'));

const filesExclude = Object.fromEntries(hideInRoot.map(relative => [relative, true]));
const searchExclude = {
    ...filesExclude,
    '**/node_modules': true,
    '**/dist': true,
    'SillyTavern/data': true,
    'SillyTavern/backups': true,
};

const workspace = {
    folders: folders.map(folder => ({ name: folder.name, path: folder.path })),
    settings: {
        'files.exclude': filesExclude,
        'search.exclude': searchExclude,
        'search.followSymlinks': false,
        'git.autoRepositoryDetection': 'subFolders',
        'files.watcherExclude': {
            '**/node_modules/**': true,
            '**/.git/objects/**': true,
            'SillyTavern/data/**': true,
        },
    },
    extensions: {
        recommendations: [
            'saoudrizwan.claude-dev',
            'rooveterinaryinc.roo-cline',
        ],
    },
};

const content = `${JSON.stringify(workspace, null, 2)}\n`;

if (process.argv.includes('--print')) {
    process.stdout.write(content);
    process.exit(0);
}

fs.writeFileSync(outputPath, content, 'utf8');

process.stdout.write([
    `已生成：${outputPath}`,
    `根目录 ${folders.length} 个：`,
    ...folders.map(folder => `  - ${folder.name}  →  ${folder.path}`),
    '',
    `总目录内隐藏的重复路径 ${hideInRoot.length} 条${duplicated.length > 0 ? `（其中用户目录与 third-party 重名的 ${duplicated.join('、')} 只保留 third-party 一份）` : ''}`,
    '',
    '打开方式：VS Code → 文件 → 打开工作区 → 选择该文件（或双击）。',
    '',
].join('\n'));
