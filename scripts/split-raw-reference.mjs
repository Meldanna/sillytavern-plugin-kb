#!/usr/bin/env node
// 把三个"原始参考转储"拆分成知识库条目：
//   1) @types.txt              酒馆助手(JS-Slash-Runner) 的 TS API 声明 → knowledge/helper/
//   2) slash_command.txt       ST 核心斜杠命令清单             → knowledge/reference/slash-commands-*.md
//   3) SillyTavern_Macros.txt  ST 核心宏清单                   → knowledge/reference/macros-*.md
//
// 用法：
//   node scripts/split-raw-reference.mjs                 # 从默认下载目录读取并生成
//   node scripts/split-raw-reference.mjs --dry-run       # 只报告会生成什么
//   node scripts/split-raw-reference.mjs --source <目录>  # 指定原始文件所在目录
//   node scripts/split-raw-reference.mjs --archive       # 同时把原件复制到 inbox/imported/
//
// 设计：每个条目（API 符号 / 命令 / 宏）都会生成自己的 `## 名称` 标题，
// 这样索引器按标题切块后，每个符号都能被单独检索到，而不是整篇 185KB 一个大块。

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import { createKnowledgeBase } from '../src/kb.js';

const projectDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const knowledgeDir = path.join(projectDir, 'knowledge');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const archive = args.includes('--archive');
const sourceIndex = args.indexOf('--source');
const sourceDir = sourceIndex !== -1 && args[sourceIndex + 1]
    ? path.resolve(args[sourceIndex + 1])
    : path.join(os.homedir(), 'Downloads');

const FILES = {
    types: path.join(sourceDir, '@types.txt'),
    slash: path.join(sourceDir, 'slash_command.txt'),
    macros: path.join(sourceDir, 'SillyTavern_Macros.txt'),
};

/** 收集脚本执行结果，最后统一打印。 */
const report = [];

/**
 * 写一个知识库文档。
 * @param {string} relativePath 相对 knowledge/ 的路径
 * @param {{title: string, category: string, tags: string[], summary: string, sources: string[]}} meta 元信息
 * @param {string} body 正文
 */
function writeDoc(relativePath, meta, body) {
    const full = path.join(knowledgeDir, relativePath);
    const frontmatter = [
        '---',
        `title: ${meta.title}`,
        `category: ${meta.category}`,
        `tags: ${meta.tags.join(', ')}`,
        `summary: ${meta.summary}`,
        `sources: [${meta.sources.join(', ')}]`,
        '---',
        '',
    ].join('\n');
    const content = `${frontmatter}\n${body.trim()}\n`;

    if (!dryRun) {
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf8');
    }
    report.push(`${relativePath}  ${content.length} 字符  ${meta.entries ?? ''}`);
}

/** 读取文件并按行拆开；文件不存在时直接终止并给出提示。 */
function readLines(filePath, label) {
    if (!fs.existsSync(filePath)) {
        process.stderr.write(`找不到 ${label}：${filePath}\n请用 --source 指定目录，或确认文件已下载到默认下载目录。\n`);
        process.exit(1);
    }
    return fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
}

/** 生成 markdown 安全的小标题（避免重复名称）。 */
function uniqueHeading(name, used) {
    const count = (used.get(name) ?? 0) + 1;
    used.set(name, count);
    return count === 1 ? name : `${name}（重载 ${count}）`;
}

// ---------- 通用：按顶层声明切分 ----------
const DECL_PATTERNS = [
    [/^declare\s+function\s+([A-Za-z0-9_]+)/, 'function'],
    [/^declare\s+const\s+([A-Za-z0-9_]+)/, 'const'],
    [/^declare\s+let\s+([A-Za-z0-9_]+)/, 'let'],
    [/^declare\s+class\s+([A-Za-z0-9_]+)/, 'class'],
    [/^declare\s+namespace\s+([A-Za-z0-9_]+)/, 'namespace'],
    [/^declare\s+enum\s+([A-Za-z0-9_]+)/, 'enum'],
    [/^type\s+([A-Za-z0-9_]+)/, 'type'],
    [/^interface\s+([A-Za-z0-9_]+)/, 'interface'],
];

/** 识别一行是否为顶层声明，返回种类与名称。 */
function extractDeclaration(line) {
    for (const [regex, kind] of DECL_PATTERNS) {
        const match = line.match(regex);
        if (match) return { kind, name: match[1] };
    }
    return null;
}

/** 把声明文件切成"一条声明 + 它的 JSDoc"的块。 */
function splitDeclarations(lines) {
    const starts = [];
    lines.forEach((line, index) => {
        const decl = extractDeclaration(line);
        if (decl) starts.push({ ...decl, index });
    });

    const entries = [];
    for (let i = 0; i < starts.length; i++) {
        const from = starts[i].index;
        const nextStart = i + 1 < starts.length ? starts[i + 1].index : lines.length;
        let end = nextStart;

        if (i + 1 < starts.length) {
            // 从下一个声明往前退，把属于它的前导注释整块排除掉
            let cursor = nextStart - 1;
            while (cursor > from && lines[cursor].trim() === '') cursor--;
            while (cursor > from && /^\s*(\*|\/\*|\/\/)/.test(lines[cursor])) cursor--;
            end = Math.max(cursor + 1, from + 1);
        }

        entries.push({ ...starts[i], block: lines.slice(from, end) });
    }

    return entries;
}

// ---------- 1) 酒馆助手 @types → knowledge/helper/ ----------
const HELPER_CATEGORY = 'helper';
const HELPER_SOURCE = '@types.txt';

/** 按符号名归域；顺序即优先级，先匹配者胜。 */
const HELPER_DOMAINS = [
    {
        id: '02-audio', title: '酒馆助手 API：音频与播放器', tags: ['audio', 'bgm', 'ambient'],
        patterns: [/^Audio/, /^playAudio$/, /^pauseAudio$/, /^getAudioList$/, /^replaceAudioList$/, /^appendAudioList$/, /^getAudioSettings$/, /^setAudioSettings$/, /^getCurrentAudio$/],
    },
    {
        id: '03-character', title: '酒馆助手 API：角色卡', tags: ['character', 'card'],
        patterns: [/^Character/, /^ReplaceCharacterOptions$/, /^CharacterUpdater$/, /^getCharacter/, /^createCharacter$/, /^createOrReplaceCharacter$/, /^deleteCharacter$/, /^replaceCharacter$/, /^updateCharacterWith$/, /^RawCharacter$/, /^getChar(Data|AvatarPath|History)/, /^importRawCharacter$/],
    },
    {
        id: '04-chat-messages', title: '酒馆助手 API：聊天消息与楼层', tags: ['chat', 'message', 'floor'],
        patterns: [/^ChatMessage/, /^GetChatMessagesOption$/, /^SetChatMessagesOption$/, /^getChatMessages$/, /^setChatMessages$/, /^createChatMessages$/, /^deleteChatMessages$/, /^rotateChatMessages$/, /^retrieveDisplayedMessage$/, /^FormatAsDisplayedMessageOption$/, /^formatAsDisplayedMessage$/, /^refreshOneMessage$/, /MessageId$/, /^getChatHistory/, /^getLastMessageId$/, /^getMessageId$/],
    },
    {
        id: '05-generation', title: '酒馆助手 API：生成与模型', tags: ['generation', 'model', 'prompt'],
        patterns: [/^generate$/, /^generateRaw$/, /^getModelList$/, /^stopGeneration/, /^Generate/, /^CustomApiConfig$/, /^JsonSchema$/, /^Tool(Function|Definition|Choice)$/, /^PlaceholderPrompt$/, /^RolePrompt$/, /^Overrides$/, /^BuiltinPrompt$/, /^builtin_prompt_default_order$/, /^placeholder_prompt_default_order$/, /^getProxyPresetNames$/],
    },
    {
        id: '06-prompt-injection', title: '酒馆助手 API：提示词注入与宏', tags: ['prompt', 'injection', 'macro'],
        patterns: [/^InjectionPrompt$/, /^injectPromptsOptions$/, /^injectPrompts$/, /^uninjectPrompts$/, /^MacroLikeContext$/, /^RegisterMacroLikeReturn$/, /^registerMacroLike$/, /^unregisterMacroLike$/, /^substitudeMacros$/, /^outlet$/],
    },
    {
        id: '07-worldbook', title: '酒馆助手 API：世界书与知识书', tags: ['worldbook', 'lorebook'],
        patterns: [/Lorebook/, /Worldbook/, /^getLorebook/, /^setLorebook/, /^getChatLorebook$/, /^setChatLorebook$/, /^getOrCreateChatLorebook$/],
    },
    {
        id: '08-persona', title: '酒馆助手 API：用户人设（Persona）', tags: ['persona'],
        patterns: [/^Persona/, /^ReplacePersonaOptions$/, /^getPersona/, /^createPersona/, /^createOrReplacePersona$/, /^deletePersona$/, /^replacePersona$/, /^updatePersonaWith$/],
    },
    {
        id: '09-preset', title: '酒馆助手 API：预设（Preset）', tags: ['preset'],
        patterns: [/^Preset/, /^ReplacePresetOptions$/, /^getPreset/, /^getLoadedPresetName$/, /^loadPreset$/, /^createPreset$/, /^createOrReplacePreset$/, /^deletePreset$/, /^renamePreset$/, /^replacePreset$/, /^setPreset$/, /^updatePresetWith$/, /^default_preset$/, /^isPreset/, /^importRawPreset$/],
    },
];

/** 按符号名归域；顺序即优先级，先匹配者胜。 */
const HELPER_DOMAINS_MORE = [
    {
        id: '10-variables', title: '酒馆助手 API：变量系统', tags: ['variable', 'scope'],
        patterns: [/^VariableOption/, /^getVariables$/, /^replaceVariables$/, /^updateVariablesWith$/, /^insertOrAssignVariables$/, /^insertVariables$/, /^deleteVariable$/, /^registerVariableSchema$/, /^getAllVariables$/],
    },
    {
        id: '11-events', title: '酒馆助手 API：事件系统', tags: ['event', 'iframe-event'],
        patterns: [/^Event/, /^event(On|Once|Emit|Make|Remove|Clear)/, /^IframeEventType$/, /^iframe_events$/, /^TavernEventType$/, /^tavern_events$/, /^ListenerType$/, /^getButtonEvent$/],
    },
    {
        id: '12-regex', title: '酒馆助手 API：正则与显示格式化', tags: ['regex', 'format'],
        patterns: [/^TavernRegex/, /^ReplaceTavernRegexesOption$/, /^getTavernRegexes$/, /^replaceTavernRegexes$/, /^updateTavernRegexesWith$/, /^isCharacterTavernRegexesEnabled$/, /^FormatAsTavernRegexedString/, /^formatAsTavernRegexedString$/, /^importRawTavernRegex$/, /^Reg/],
    },
    {
        id: '13-script-iframe', title: '酒馆助手 API：脚本、按钮与 iframe', tags: ['script', 'button', 'iframe'],
        patterns: [/^Script/, /^getScript/, /^replaceScript/, /^updateScript/, /^appendInexistentScriptButtons$/, /^getAllEnabledScriptButtons$/, /^reloadIframe$/, /^getIframeName$/, /^getCurrentMessageId$/],
    },
    {
        id: '14-extension-runtime', title: '酒馆助手 API：扩展管理与运行时', tags: ['extension', 'runtime', 'version'],
        patterns: [/^Extension/, /^InstallationInfo$/, /^isAdmin$/, /^isInstalledExtension$/, /^installExtension$/, /^uninstallExtension$/, /^reinstallExtension$/, /^updateExtension$/, /^getTavernHelper/, /^getTavernVersion$/, /^getExtensionType$/, /^initializeGlobal$/, /^waitGlobalInitialized$/, /^errorCatched$/, /^Window$/, /^SillyTavern$/, /^TavernHelper$/, /^builtin$/, /^importRaw/],
    },
];

/** 未命中任何规则的符号落到这里，便于事后补规则。 */
const HELPER_FALLBACK = { id: '15-slash-and-misc', title: '酒馆助手 API：斜杠命令调用与其它', tags: ['slash', 'misc'] };

/** 生成 helper 目录下的全部文档 + 索引。 */
function buildHelperDocs() {
    const lines = readLines(FILES.types, '@types.txt');
    const entries = splitDeclarations(lines);
    const groups = new Map();

    const allDomains = [...HELPER_DOMAINS_SPECIAL, ...HELPER_DOMAINS, ...HELPER_DOMAINS_MORE];

    for (const entry of entries) {
        const domain = allDomains.find(item => item.patterns.some(regex => regex.test(entry.name))) ?? HELPER_FALLBACK;
        if (!groups.has(domain.id)) groups.set(domain.id, { domain, entries: [] });
        groups.get(domain.id).entries.push(entry);
    }

    const indexRows = [];

    for (const [id, { domain, entries: groupEntries }] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        const used = new Map();
        const body = [
            `# ${domain.title}`,
            '',
            `来源：\`${HELPER_SOURCE}\`（酒馆助手 / JS-Slash-Runner 的全局 API 类型声明），本文件由 \`scripts/split-raw-reference.mjs\` 自动拆分。`,
            `本组共 ${groupEntries.length} 个符号：${groupEntries.map(item => item.name).join('、')}`,
            '',
            ...groupEntries.flatMap(entry => {
                entry.heading = uniqueHeading(entry.name, used);
                return expandBigBlock(entry);
            }),
        ].join('\n');

        const firstLine = Math.min(...groupEntries.map(item => item.index)) + 1;
        const lastLine = Math.max(...groupEntries.map(item => item.index)) + 1;

        writeDoc(`helper/${id}.md`, {
            title: domain.title,
            category: HELPER_CATEGORY,
            tags: ['helper', 'api', 'typescript', ...domain.tags],
            summary: `酒馆助手 API 中与"${domain.title.replace('酒馆助手 API：', '')}"相关的 ${groupEntries.length} 个符号（含 JSDoc 原文）：${groupEntries.slice(0, 8).map(item => item.name).join('、')}${groupEntries.length > 8 ? ' 等' : ''}。`,
            sources: [`${HELPER_SOURCE} (行 ${firstLine}-${lastLine})`],
            entries: `${groupEntries.length} 个符号`,
        }, body);

        indexRows.push({ id, domain, entries: groupEntries, firstLine, lastLine });
    }

    // 总索引：让 AI 一眼看到有哪些域、怎么按需 kb_get
    const indexBody = [
        '# 酒馆助手（SillyTavern Helper）API 文档索引',
        '',
        `本目录由 \`${HELPER_SOURCE}\`（酒馆助手注入的全局 API 类型声明，共 ${entries.length} 个符号）自动拆分而来，按功能域分组，每个符号都是独立可检索的小节。`,
        '',
        '| 文档 id | 主题 | 符号数 | 主要符号 |',
        '| --- | --- | --- | --- |',
        ...indexRows.map(row => `| \`helper/${row.id}\` | ${row.domain.title.replace('酒馆助手 API：', '')} | ${row.entries.length} | ${row.entries.slice(0, 6).map(item => `\`${item.name}\``).join(' ')}${row.entries.length > 6 ? ' …' : ''} |`),
        '',
        '## 使用建议',
        '',
        '- 写"酒馆助手（JS-Slash-Runner）脚本/扩展"时，先按功能域用 `kb_search` 查符号名，再 `kb_get` 对应文档拿完整签名与 JSDoc。',
        '- ⚠️ `helper/16-global-sillytavern`、`helper/18-template-globals` 是**聚合/命名空间声明**（把许多 API 又列了一遍）：想查具体接口请优先看对应功能域文档（如角色看 `03-character`、世界书看 `07-worldbook`），聚合文档用于确认"某个方法到底挂在哪个全局对象上"。',
        '- `helper/17-global-window` 是 `interface Window` 的扩展声明，用于确认酒馆助手往页面全局挂了什么。',
        '- `helper/19-event-catalog` 是**事件名总表**（`ListenerType` / `tavern_events` / `iframe_events`）：要查"有哪些事件、事件回调签名是什么"从这里入手。',
        '- 这些是**声明**（`declare function ...`），实际调用时它们挂在脚本可访问的全局作用域上，不在 `SillyTavern.getContext()` 里。',
        '- 与酒馆内置扩展（`.github/skills` 与 `00`–`25` 系列）的区别：那套是 `SillyTavern.getContext()` / `extension_settings` 体系，这套是酒馆助手自己的 API 体系，两套不要混用。',
    ].join('\n');

    writeDoc('helper/01-index.md', {
        title: '酒馆助手 API 文档索引',
        category: HELPER_CATEGORY,
        tags: ['helper', 'api', 'index'],
        summary: `酒馆助手（JS-Slash-Runner）全局 API 的拆分索引：${indexRows.length} 个功能域、${entries.length} 个符号，按域指向 helper/ 下的具体文档。`,
        sources: [HELPER_SOURCE],
        entries: `${indexRows.length} 个域`,
    }, indexBody);
}

// 超大符号（命名空间 / 聚合对象 / 事件目录）单独成篇，且内部按成员再切一层，避免一整块无法精确定位
const HELPER_DOMAINS_SPECIAL = [
    {
        id: '11-events-api', title: '酒馆助手 API：事件订阅与派发', tags: ['event', 'subscribe'],
        patterns: [/^EventType$/, /^EventOnReturn$/, /^event(On|Once|Emit|Make|Remove|Clear)/, /^getButtonEvent$/],
    },
    {
        id: '16-global-sillytavern', title: '酒馆助手 API：SillyTavern 全局对象', tags: ['global', 'namespace'],
        patterns: [/^SillyTavern$/],
    },
    {
        id: '17-global-window', title: '酒馆助手 API：Window 扩展声明', tags: ['global', 'window'],
        patterns: [/^Window$/],
    },
    {
        id: '18-template-globals', title: '酒馆助手 API：EjsTemplate / Mvu 全局', tags: ['ejs', 'mvu', 'template'],
        patterns: [/^EjsTemplate$/, /^Mvu$/],
    },
    {
        id: '19-event-catalog', title: '酒馆助手 API：事件目录（全部事件名）', tags: ['event', 'catalog', 'reference'],
        patterns: [/^ListenerType$/, /^tavern_events$/, /^iframe_events$/, /^TavernEventType$/, /^IframeEventType$/],
    },
];

/** 判断一行是否是命名空间/聚合对象的成员起点（函数签名或嵌套声明，排除普通类型字段）。 */
function isMemberStart(line) {
    const indent = (line.match(/^( *)/)?.[1] ?? '').length;
    if (indent < 2 || indent > 4) return false;
    // JSDoc / 行注释的续行不算成员
    if (/^\s*(\*|\/\*|\/\/)/.test(line)) return false;
    if (/^\s*(if|for|while|switch|return|else|case|\.)\b/.test(line)) return false;
    if (/^\s*(?:declare\s+)?(?:type|interface|const|let|var|class|enum|namespace|function)\s+[A-Za-z_$][\w$]*/.test(line)) {
        return true;
    }
    // 只把"带参数列表"的行当成员，`title: string;` 这类字段会被排除
    return line.includes('(');
}

/** 取成员名用于生成小标题（声明关键字要跳过，取真实名称）。 */
function memberName(line) {
    const decl = line.match(/^\s*(?:declare\s+)?(?:type|interface|const|let|var|class|enum|namespace|function)\s+([A-Za-z_$][\w$]*)/);
    if (decl) return decl[1];
    const fn = line.match(/^\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*[:(]/);
    if (fn) return fn[1];
    const quoted = line.match(/^\s*['"`]([^'"`]{1,40})['"`]\s*[:(]/);
    if (quoted) return quoted[1];
    const bracket = line.match(/^\s*\[([^\]]{1,40})\]/);
    if (bracket) return bracket[1];
    // 实在取不到名字就用行首片段，避免出现一堆无意义的 "section"
    return line.trim().slice(0, 50) || 'section';
}

/**
 * 大块内部再切一层：这些块是命名空间 / 对象字面量的成员罗列，
 * 按成员名切成 `### 成员`（连同成员的 JSDoc），让每个成员都能被单独检索到。
 * 识别不到成员时按行兜底分段；类型字面量里的字段（4 空格缩进）不会被误切。
 * @param {{name: string, heading: string, block: string[]}} entry 声明条目
 * @returns {string[]} 展开后的行
 */
function expandBigBlock(entry) {
    const text = entry.block.join('\n');
    if (text.length <= 3000) {
        return [`## ${entry.heading}`, '', ...entry.block, ''];
    }

    const lines = entry.block;
    const starts = [];

    lines.forEach((line, index) => {
        if (!isMemberStart(line)) return;
        // 把紧贴成员上方的缩进 JSDoc 一起归到该成员
        let from = index;
        let cursor = index - 1;
        while (cursor >= 0 && /^\s*(\*|\/\*|\/\/)/.test(lines[cursor])) {
            from = cursor;
            cursor--;
        }
        starts.push({ index: from, name: memberName(line) });
    });

    const used = new Map();
    const out = [`## ${entry.heading}`, ''];

    if (starts.length >= 3) {
        if (starts[0].index > 0) {
            out.push(...lines.slice(0, starts[0].index), '');
        }
        starts.forEach((start, order) => {
            const to = order + 1 < starts.length ? starts[order + 1].index : lines.length;
            out.push(`### ${uniqueHeading(start.name, used)}`, '', ...lines.slice(start.index, to), '');
        });
        return out;
    }

    const chunkSize = 60;
    for (let offset = 0; offset < lines.length; offset += chunkSize) {
        out.push(`### ${entry.heading}（第 ${Math.floor(offset / chunkSize) + 1} 段）`, '', ...lines.slice(offset, offset + chunkSize), '');
    }
    return out;
}

// ---------- 2) ST 核心斜杠命令 → knowledge/reference/ ----------
const SLASH_BUCKETS = [
    { id: 'a-c', letters: 'abc' },
    { id: 'd-g', letters: 'defg' },
    { id: 'h-m', letters: 'hijklm' },
    { id: 'n-q', letters: 'nopq' },
    { id: 'r-s', letters: 'rs' },
    { id: 't-z', letters: 'tuvwxyz' },
];
const SLASH_OTHER = { id: 'misc', title: '斜杠命令：其它与非常规行' };

/** 从命令行里取出一句话说明（`// 之后`，没有就截断原文）。 */
function commandSummary(line) {
    const afterComment = line.split('//').slice(1).join('//').trim();
    const text = (afterComment || line).replace(/\s+/g, ' ').trim();
    return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}

/** 生成斜杠命令文档（分桶全文 + 总索引）。 */
function buildSlashDocs() {
    const lines = readLines(FILES.slash, 'slash_command.txt');
    const commands = [];

    lines.forEach((line, index) => {
        if (!line.trim()) return;
        const match = line.match(/^\/([A-Za-z0-9_-]+)/);
        commands.push({ line, index, name: match ? match[1] : '', raw: line });
    });

    const buckets = new Map();
    for (const command of commands) {
        const first = command.name ? command.name[0].toLowerCase() : '';
        const bucket = SLASH_BUCKETS.find(item => item.letters.includes(first)) ?? SLASH_OTHER;
        if (!buckets.has(bucket.id)) buckets.set(bucket.id, { bucket, commands: [] });
        buckets.get(bucket.id).commands.push(command);
    }

    const indexRows = [];

    for (const [id, { bucket, commands: group }] of [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        const title = bucket.title ?? `斜杠命令：${bucket.id.replace('-', '–')}`;
        const letters = bucket.letters ? `首字母 ${bucket.letters.toUpperCase().split('').join('/')}` : '其它';
        const body = [
            `# ${title}`,
            '',
            `来源：\`slash_command.txt\`（ST 核心斜杠命令清单，${letters}），本文件由 \`scripts/split-raw-reference.mjs\` 自动拆分。`,
            `本组共 ${group.length} 条命令。每条命令的格式：\`/命令名 [命名参数] (位置参数) // 说明\`，\`?\` 表示可选参数，\`| \` 表示枚举取值。`,
            '',
            ...group.map(command => [`## /${command.name || command.raw.slice(0, 40)}`, '', command.raw, ''].join('\n')),
        ].join('\n');

        writeDoc(`reference/slash-commands-${id}.md`, {
            title,
            category: 'reference',
            tags: ['slash-commands', 'reference', 'st-core'],
            summary: `ST 核心斜杠命令中「${letters}」的 ${group.length} 条命令（含命名参数/位置参数与说明原文）：${group.slice(0, 10).map(command => `/${command.name}`).join(' ')}${group.length > 10 ? ' 等' : ''}。`,
            sources: [`slash_command.txt (行 ${Math.min(...group.map(c => c.index)) + 1}-${Math.max(...group.map(c => c.index)) + 1})`],
            entries: `${group.length} 条命令`,
        }, body);

        indexRows.push({ id, title, group });
    }

    // 速查索引：全部命令名 + 一句话说明
    const indexBody = [
        '# ST 核心斜杠命令速查索引',
        '',
        `共 ${commands.length} 条命令，来自 \`slash_command.txt\`。全文（含完整参数签名）按首字母分桶存放在 \`reference/slash-commands-*.md\`。`,
        '',
        '## 快速定位',
        '',
        ...indexRows.map(row => `- \`reference/slash-commands-${row.id}\` —— ${row.title}（${row.group.length} 条）`),
        '',
        '## 全部命令',
        '',
        ...(() => {
            // 按首字母分组，避免 299 行表格挤成一个巨大切块
            const byLetter = new Map();
            for (const command of commands) {
                const letter = (command.name ? command.name[0] : '#').toUpperCase();
                if (!byLetter.has(letter)) byLetter.set(letter, []);
                byLetter.get(letter).push(command);
            }
            const out = [];
            for (const [letter, group] of [...byLetter.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
                out.push(`### ${letter}（${group.length} 条）`, '', '| 命令 | 说明 | 全文所在 |', '| --- | --- | --- |');
                for (const command of group) {
                    const bucket = indexRows.find(row => row.group.includes(command));
                    out.push(`| \`/${command.name || '(非常规)'}\` | ${commandSummary(command.raw).replace(/\|/g, '\\|')} | \`${bucket ? `slash-commands-${bucket.id}` : '?'}\` |`);
                }
                out.push('');
            }
            return out;
        })(),
        '',
        '## 编写插件时怎么用',
        '',
        '- 想在插件里调用 ST 能力，优先"复用已有命令"而不是自己重写：先在这里搜关键词（如"world"、"var"、"audio"），再在插件里用 `ctx.executeSlashCommandsWithOptions(\'/命令 ...\')`。',
        '- 命令的命名参数一律写成 `key=value`；位置参数按 `(...)` 顺序给。',
        '- 与插件自己注册的命令（见 `15-slash-commands`）区分：这里是 ST 内置命令，插件自定义命令要用带前缀的名字避免冲突。',
    ].join('\n');

    writeDoc('reference/slash-commands-index.md', {
        title: 'ST 核心斜杠命令速查索引',
        category: 'reference',
        tags: ['slash-commands', 'reference', 'index', 'st-core'],
        summary: `ST 内置 ${commands.length} 条斜杠命令的速查表（命令名 + 一句话说明 + 全文所在分桶文档）。`,
        sources: ['slash_command.txt'],
        entries: `${commands.length} 条命令`,
    }, indexBody);
}

// ---------- 3) ST 核心宏 → knowledge/reference/ ----------
const MACRO_GROUPS = [
    { id: 'variables', title: '宏：变量（局部 / 全局）', patterns: [/^(add|dec|inc|get|set|has|delete|list)(global)?var$/] },
    { id: 'character-persona', title: '宏：角色 / 人设 / 用户', patterns: [/^char/, /^notChar$/, /^persona$/, /^user$/, /^userAvatarPath$/, /^group/, /^original$/] },
    { id: 'chat-floor', title: '宏：聊天、楼层与上下文', patterns: [/^lastMessage/, /^lastSwipeId$/, /^currentSwipeId$/, /^firstDisplayedMessageId$/, /^firstIncludedMessageId$/, /^allChatRange$/, /^chatStart$/, /^input$/, /^mesExamples/, /^max(Context|Prompt|Response)$/, /^systemPrompt$/, /^defaultSystemPrompt$/, /^authorsNote$/, /^defaultAuthorsNote$/, /^charAuthorsNote$/] },
    { id: 'time', title: '宏：时间与日期', patterns: [/^date$/, /^isodate$/, /^isotime$/, /^weekday$/, /^time$/, /^timeDiff$/, /^datetimeformat$/, /^idleDuration$/] },
    { id: 'logic-tools', title: '宏：逻辑、随机与文本工具', patterns: [/^\/\//, /^comment$/, /^if$/, /^else$/, /^noop$/, /^random$/, /^pick$/, /^roll$/, /^reverse$/, /^trim$/, /^space$/, /^newline$/, /^banned$/, /^max$/, /^min$/] },
    { id: 'instruct', title: '宏：Instruct 模板片段', patterns: [/^instruct/] },
    { id: 'bbs', title: '宏：BBS（楼层状态与历史）', patterns: [/^bbs/] },
];

/** 取宏的基础名：{{addvar::name<string>}} → addvar */
function macroBase(name) {
    return name.replace(/^\{\{/, '').replace(/\}\}$/, '').split('::')[0].replace(/\?$/, '');
}

/** 生成宏文档（分类全文 + 索引）。 */
function buildMacroDocs() {
    const lines = readLines(FILES.macros, 'SillyTavern_Macros.txt');
    const blocks = [];
    let current = null;

    for (const line of lines) {
        if (/^###\s+/.test(line)) {
            if (current) blocks.push(current);
            current = { name: line.replace(/^###\s+/, '').trim(), lines: [line], index: blocks.length };
        } else if (current) {
            current.lines.push(line);
        }
    }
    if (current) blocks.push(current);

    const groups = new Map();
    for (const block of blocks) {
        const base = macroBase(block.name);
        const group = MACRO_GROUPS.find(item => item.patterns.some(regex => regex.test(base)));
        const id = group ? group.id : 'misc';
        if (!groups.has(id)) {
            groups.set(id, { id, title: group ? group.title : '宏：其它（扩展、模型、推理等）', blocks: [] });
        }
        groups.get(id).blocks.push(block);
    }

    const indexRows = [];

    for (const [id, { title, blocks: groupBlocks }] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        const body = [
            `# ${title}`,
            '',
            `来源：\`SillyTavern_Macros.txt\`（ST 核心宏清单），本文件由 \`scripts/split-raw-reference.mjs\` 自动拆分。`,
            `本组共 ${groupBlocks.length} 个宏，每个宏一节，保留原文的 Description / Returns / Aliases。`,
            '',
            ...groupBlocks.map(block => `${block.lines.join('\n').trimEnd()}\n`),
        ].join('\n');

        writeDoc(`reference/macros-${id}.md`, {
            title,
            category: 'reference',
            tags: ['macros', 'reference', 'st-core'],
            summary: `ST 核心宏中「${title.replace('宏：', '')}」的 ${groupBlocks.length} 个宏（含 Description / Returns / Aliases）：${groupBlocks.slice(0, 10).map(b => b.name).join('、')}${groupBlocks.length > 10 ? ' 等' : ''}。`,
            sources: ['SillyTavern_Macros.txt'],
            entries: `${groupBlocks.length} 个宏`,
        }, body);

        indexRows.push({ id, title, blocks: groupBlocks });
    }

    const describe = block => {
        const line = block.lines.find(item => /^-\s+\*\*Description\*\*/.test(item));
        const text = (line ?? block.name).replace(/^-\s+\*\*Description\*\*:\s*/, '').replace(/\s+/g, ' ').trim();
        return text.length > 110 ? `${text.slice(0, 110)}…` : text;
    };

    const indexBody = [
        '# ST 核心宏速查索引',
        '',
        `共 ${blocks.length} 个宏，来自 \`SillyTavern_Macros.txt\`。按用途分组，全文见 \`reference/macros-*.md\`。`,
        '',
        '## 快速定位',
        '',
        ...indexRows.map(row => `- \`reference/macros-${row.id}\` —— ${row.title}（${row.blocks.length} 个）`),
        '',
        '## 全部宏',
        '',
        ...indexRows.flatMap(row => [
            `### ${row.title}（${row.blocks.length} 个）`,
            '',
            '| 宏 | 说明 |',
            '| --- | --- |',
            ...row.blocks.map(block => `| \`${block.name}\` | ${describe(block).replace(/\|/g, '\\|')} |`),
            '',
        ]),
        '',
        '## 编写插件时怎么用',
        '',
        '- 宏在**提示词文本**里生效（角色卡、世界书、预设、快速回复、扩展注入的 prompt 都算）。',
        '- 插件里想手动展开宏，用 `ctx.substituteParams(text)`（ST 核心）或酒馆助手的 `substitudeMacros`（注意对方拼写少一个 t）。',
        '- 变量宏（`{{getvar}}` / `{{setvar}}` 等）读写的是 ST 的变量系统，与 `SillyTavern.getContext().variables` 是同一套数据。',
    ].join('\n');

    writeDoc('reference/macros-index.md', {
        title: 'ST 核心宏速查索引',
        category: 'reference',
        tags: ['macros', 'reference', 'index', 'st-core'],
        summary: `ST 内置 ${blocks.length} 个宏的速查表（宏名 + 说明 + 所属分组文档）。`,
        sources: ['SillyTavern_Macros.txt'],
        entries: `${blocks.length} 个宏`,
    }, indexBody);
}

// ---------- 执行 ----------
/** 把原始文件复制到 inbox/imported/ 留档（原件本身不移动）。 */
function archiveOriginals() {
    if (!archive || dryRun) return;
    const target = path.join(projectDir, 'inbox', 'imported');
    fs.mkdirSync(target, { recursive: true });
    for (const file of Object.values(FILES)) {
        if (!fs.existsSync(file)) continue;
        fs.copyFileSync(file, path.join(target, path.basename(file)));
        report.push(`原件留档 → inbox/imported/${path.basename(file)}`);
    }
}

buildHelperDocs();
buildSlashDocs();
buildMacroDocs();
archiveOriginals();

const kb = createKnowledgeBase(projectDir).rebuild();
if (!dryRun) {
    kb.writeIndex(path.join(projectDir, 'index', 'kb-index.json'));
}

const stats = kb.stats();
process.stdout.write([
    dryRun ? '【dry-run】将要生成以下知识文档：' : '已生成以下知识文档：',
    ...report.map(line => `  ${line}`),
    '',
    `知识库现状：${stats.documents} 篇文档 / ${stats.chunks} 个切块`,
    dryRun ? '（dry-run 未落盘，索引为当前状态）' : `索引已重建：index/kb-index.json`,
    '',
].join('\n'));





