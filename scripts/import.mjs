#!/usr/bin/env node
// 把外部开发文档导入共享知识库：转换 → 去重 → 写 knowledge/imported/ → 重建索引。
//
// 用法：
//   node scripts/import.mjs                        # 导入 inbox/ 下的所有文件
//   node scripts/import.mjs <文件或目录> ...        # 导入指定路径（不移动原件）
//   node scripts/import.mjs --category frontend --tags st,tutorial
//   node scripts/import.mjs --dry-run | --force | --title-from-first-line

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ARCHIVE_EXTENSIONS, buildSummary, convertBuffer, slugify, SUPPORTED_EXTENSIONS } from '../src/importers.js';
import { createKnowledgeBase } from '../src/kb.js';
import { readZipEntries } from '../src/zip.js';

/** 扫描投递目录时认的文件类型：文档 + 压缩包。 */
const COLLECTABLE_EXTENSIONS = [...SUPPORTED_EXTENSIONS, ...ARCHIVE_EXTENSIONS];

const projectDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const inboxDir = path.join(projectDir, 'inbox');
const archiveDir = path.join(inboxDir, 'imported');
const manifestPath = path.join(inboxDir, '.import-manifest.json');
const outputDir = path.join(projectDir, 'knowledge', 'imported');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const titleFromFirstLine = args.includes('--title-from-first-line');

/** 取 --key value 形式的参数。 */
function option(name, fallback = null) {
    const index = args.indexOf(`--${name}`);
    return index !== -1 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback;
}

const category = option('category', 'imported');
const extraTags = (option('tags', '') ?? '').split(',').map(tag => tag.trim()).filter(Boolean);

/** 位置参数：显式指定的文件/目录。 */
const explicitPaths = args.filter((arg, index) => {
    if (arg.startsWith('--')) return false;
    const previous = args[index - 1];
    return !(previous === '--category' || previous === '--tags');
});

const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { imports: {} };
const results = { imported: [], skipped: [], failed: [] };

/** 递归收集支持的文件（跳过归档目录与隐藏文件）。 */
function collectFiles(target) {
    const stat = fs.statSync(target);
    if (stat.isFile()) {
        return COLLECTABLE_EXTENSIONS.includes(path.extname(target).toLowerCase()) ? [target] : [];
    }

    const files = [];
    for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
        if (entry.name.startsWith('.') || entry.name === 'imported') continue;
        const full = path.join(target, entry.name);
        if (entry.isDirectory()) {
            files.push(...collectFiles(full));
        } else if (COLLECTABLE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
            files.push(full);
        }
    }
    return files.sort();
}

/** 计算文件内容 hash，用于去重。 */
function hashOf(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

fs.mkdirSync(inboxDir, { recursive: true });

const targets = explicitPaths.length > 0 ? explicitPaths : [inboxDir];
const scanningInbox = explicitPaths.length === 0;
const files = [...new Set(targets.flatMap(target => (fs.existsSync(target) ? collectFiles(target) : [])))]
    // 扫描 inbox 时跳过说明文件本身，只有显式指定路径时才会导入它
    .filter(file => !(scanningInbox && /^readme\.md$/i.test(path.basename(file))));

if (files.length === 0) {
    process.stdout.write(`没有找到可导入的文件。\n投递目录：${inboxDir}\n支持格式：${SUPPORTED_EXTENSIONS.join('、')}\n`);
    process.exit(0);
}

/** 避免与已有知识文件重名。 */
function uniqueOutputPath(baseSlug) {
    let candidate = path.join(outputDir, `${baseSlug}.md`);
    let counter = 2;
    while (fs.existsSync(candidate)) {
        candidate = path.join(outputDir, `${baseSlug}-${counter}.md`);
        counter++;
    }
    return candidate;
}

/**
 * 导入单个文档内容（可能来自压缩包内的条目）。
 * @param {{buffer: Buffer, fileName: string, sourceRelative: string, archiveName?: string}} input 输入
 */
function importDocument(input) {
    const { buffer, fileName, sourceRelative, archiveName = null } = input;
    const hash = hashOf(buffer);
    const known = manifest.imports[hash];

    if (known && !force && fs.existsSync(path.join(projectDir, 'knowledge', known.output))) {
        results.skipped.push({ file: fileName, reason: `内容未变化（已导入为 ${known.output}）` });
        return;
    }

    const converted = convertBuffer(buffer, fileName);
    const rawTitle = titleFromFirstLine
        ? (converted.body.split('\n').map(line => line.trim()).find(Boolean) ?? converted.title)
        : converted.title;
    // 防止把一整段话当标题（纯文本文件很容易出现）
    const title = rawTitle.length > 120 ? `${rawTitle.slice(0, 120)}…` : rawTitle;

    const summary = converted.meta.summary || buildSummary(converted.body);
    const tags = [...new Set([...(converted.meta.tags ?? []), ...extraTags])];
    const outputPath = uniqueOutputPath(slugify(title, 'doc'));
    const outputRelative = path.relative(path.join(projectDir, 'knowledge'), outputPath).replace(/\\/g, '/');

    const frontmatter = [
        '---',
        `title: ${title}`,
        `category: ${category}`,
        `tags: ${tags.join(', ')}`,
        summary ? `summary: ${summary}` : null,
        `sources: [${sourceRelative}]`,
        archiveName ? `archive: ${archiveName}` : null,
        `imported: ${new Date().toISOString().slice(0, 10)}`,
        '---',
        '',
    ].filter(line => line !== null).join('\n');

    if (!dryRun) {
        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(outputPath, `${frontmatter}\n${converted.body}\n`, 'utf8');
        manifest.imports[hash] = {
            output: outputRelative,
            original: converted.originalName,
            format: converted.format,
            importedAt: new Date().toISOString(),
        };
    }

    results.imported.push({
        file: fileName,
        title,
        format: converted.format,
        bytes: converted.bytes,
        output: outputRelative,
        chunks: converted.body.split(/\n(?=#{2,4}\s)/).length,
    });
}

/** inbox 投递的原件导入后归档，避免下次重复扫描。 */
function archiveOriginal(filePath) {
    if (dryRun) return;
    const fromInbox = path.relative(inboxDir, filePath);
    if (fromInbox.startsWith('..') || path.isAbsolute(fromInbox)) return;
    fs.mkdirSync(archiveDir, { recursive: true });
    fs.renameSync(filePath, path.join(archiveDir, path.basename(filePath)));
}

for (const filePath of files) {
    try {
        const buffer = fs.readFileSync(filePath);
        const sourceRelative = path.relative(projectDir, filePath).replace(/\\/g, '/');
        const extension = path.extname(filePath).toLowerCase();

        if (ARCHIVE_EXTENSIONS.includes(extension)) {
            const entries = readZipEntries(buffer);
            const archived = path.basename(filePath);
            let importedFromArchive = 0;

            for (const [entryName, entryBuffer] of entries) {
                if (entryName.endsWith('/')) continue;
                if (entryName.startsWith('__MACOSX') || path.basename(entryName).startsWith('.')) continue;
                if (!SUPPORTED_EXTENSIONS.includes(path.extname(entryName).toLowerCase())) continue;

                importDocument({
                    buffer: entryBuffer,
                    fileName: path.basename(entryName),
                    sourceRelative: `${sourceRelative}!${entryName}`,
                    archiveName: archived,
                });
                importedFromArchive++;
            }

            if (importedFromArchive === 0) {
                results.skipped.push({ file: archived, reason: '压缩包里没有支持的文档格式' });
            }
            archiveOriginal(filePath);
            continue;
        }

        importDocument({ buffer, fileName: path.basename(filePath), sourceRelative });
        archiveOriginal(filePath);
    } catch (error) {
        results.failed.push({ file: path.basename(filePath), error: error.message });
    }
}

if (!dryRun) {
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
}

// 重建索引，使新内容立即可检索
const kb = createKnowledgeBase(projectDir).rebuild();
if (!dryRun) {
    kb.writeIndex(path.join(projectDir, 'index', 'kb-index.json'));
}

const stats = kb.stats();
const lines = [];

lines.push(dryRun ? '【dry-run】以下文件会被导入：' : '导入完成：');
for (const item of results.imported) {
    lines.push(`  + ${item.file} → knowledge/${item.output}`);
    lines.push(`     标题：${item.title}｜格式：${item.format}｜${item.bytes} 字节｜约 ${item.chunks} 个切块`);
}
for (const item of results.skipped) {
    lines.push(`  = 跳过 ${item.file}：${item.reason}`);
}
for (const item of results.failed) {
    lines.push(`  ! 失败 ${item.file}：${item.error}`);
}

lines.push('');
lines.push(`导入 ${results.imported.length} / 跳过 ${results.skipped.length} / 失败 ${results.failed.length}`);
lines.push(`知识库现状：${stats.documents} 篇文档 / ${stats.chunks} 个切块${dryRun ? '（dry-run 未落盘，索引为当前状态）' : ''}`);

process.stdout.write(`${lines.join('\n')}\n`);
process.exit(results.failed.length > 0 ? 1 : 0);

