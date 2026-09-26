// 外部文档 → 知识库 Markdown 的格式适配层（零依赖）。
// 支持 .md/.markdown/.txt/.json/.html/.htm/.docx

import fs from 'node:fs';
import path from 'node:path';

import { parseFrontmatter } from './indexer.js';
import { readZipEntries } from './zip.js';

/** 支持的扩展名。 */
export const SUPPORTED_EXTENSIONS = ['.md', '.markdown', '.txt', '.json', '.html', '.htm', '.docx'];

/** 压缩包：解包后按条目逐个导入。 */
export const ARCHIVE_EXTENSIONS = ['.zip'];

const ENTITIES = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    mdash: '—', ndash: '–', hellip: '…', bull: '•', middot: '·',
    lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', copy: '©',
};

/** 解码常见 HTML/XML 实体。 */
export function decodeEntities(text) {
    return String(text ?? '')
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
        .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match);
}

/** 去掉标签，保留文本。 */
function stripTags(html) {
    return decodeEntities(String(html ?? '').replace(/<[^>]*>/g, ''));
}

/** 把 HTML 转成 Markdown 风格的纯文本。 */
export function htmlToMarkdown(html) {
    let text = String(html ?? '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');

    text = text
        .replace(/<h([1-6])[^>]*>/gi, (_, level) => `\n${'#'.repeat(Number(level))} `)
        .replace(/<\/(h[1-6])>/gi, '\n')
        .replace(/<li[^>]*>/gi, '\n- ')
        .replace(/<\/(p|div|li|tr|table|section|article)>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<td[^>]*>|<th[^>]*>/gi, ' ')
        .replace(/<[^>]+>/g, '');

    return tidyMarkdown(decodeEntities(text));
}

/** 把 docx 的 word/document.xml 转成 Markdown（识别标题层级）。 */
export function docxToMarkdown(buffer) {
    const entries = readZipEntries(buffer);
    const documentXml = entries.get('word/document.xml');

    if (!documentXml) {
        throw new Error('docx 内缺少 word/document.xml');
    }

    const xml = documentXml.toString('utf8').replace(/<w:tab\s*\/>/g, '\t').replace(/<w:br\s*\/>/g, '\n');
    const paragraphs = xml.match(/<w:p\b[\s\S]*?<\/w:p>|<w:p\s*\/>/g) ?? [];
    const lines = [];

    for (const paragraph of paragraphs) {
        const text = (paragraph.match(/<w:t\b[^>]*>[\s\S]*?<\/w:t>/g) ?? [])
            .map(node => stripTags(node.replace(/^<w:t\b[^>]*>/, '').replace(/<\/w:t>$/, '')))
            .join('')
            .trim();

        if (!text) {
            lines.push('');
            continue;
        }

        const level = headingLevel(paragraph);
        lines.push(level > 0 ? `${'#'.repeat(level)} ${text}` : text);
    }

    return tidyMarkdown(lines.join('\n'));
}

/** 判断 docx 段落是否为标题及其层级。 */
function headingLevel(paragraph) {
    const style = paragraph.match(/<w:pStyle\b[^>]*w:val="([^"]+)"/)?.[1] ?? '';
    const heading = style.match(/^heading\s*(\d)$/i) ?? style.match(/^标题\s*(\d)$/) ?? style.match(/^(\d)$/);
    if (heading) {
        return Math.min(Number(heading[1]), 6);
    }
    if (/^(title|标题)$/i.test(style)) {
        return 1;
    }
    const outline = paragraph.match(/<w:outlineLvl\b[^>]*w:val="(\d)"/)?.[1];
    return outline !== undefined ? Math.min(Number(outline) + 1, 6) : 0;
}

/** 整理空行与行尾空白。 */
export function tidyMarkdown(text) {
    return String(text ?? '')
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map(line => line.replace(/[ \t]+$/g, ''))
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * 读取并转换一个外部文档（文件形式）。
 * @param {string} filePath 文件路径
 * @returns {{format: string, title: string, body: string, meta: any, originalName: string, bytes: number}} 转换结果
 */
export function readSourceFile(filePath) {
    return convertBuffer(fs.readFileSync(filePath), path.basename(filePath));
}

/**
 * 把任意来源的字节内容转换为知识库 Markdown（zip 内条目也走这里）。
 * @param {Buffer} buffer 原始字节
 * @param {string} fileName 文件名（用于判断格式）
 * @returns {{format: string, title: string, body: string, meta: any, originalName: string, bytes: number}} 转换结果
 */
export function convertBuffer(buffer, fileName) {
    const extension = path.extname(fileName).toLowerCase();
    const originalName = path.basename(fileName);

    let body = '';
    let meta = {};
    let title = '';

    switch (extension) {
        case '.md':
        case '.markdown': {
            const parsed = parseFrontmatter(buffer.toString('utf8'));
            body = tidyMarkdown(parsed.body);
            meta = parsed;
            title = parsed.title;
            break;
        }
        case '.txt': {
            body = tidyMarkdown(buffer.toString('utf8'));
            break;
        }
        case '.json': {
            let pretty = buffer.toString('utf8').trim();
            try {
                pretty = JSON.stringify(JSON.parse(pretty), null, 2);
            } catch {
                // 不是合法 JSON 就按原文放进代码块，保留信息不报错
            }
            body = `\`\`\`json\n${pretty}\n\`\`\``;
            break;
        }
        case '.html':
        case '.htm': {
            body = htmlToMarkdown(buffer.toString('utf8'));
            break;
        }
        case '.docx': {
            body = docxToMarkdown(buffer);
            break;
        }
        default:
            throw new Error(`不支持的格式：${extension}（支持 ${SUPPORTED_EXTENSIONS.join('、')}）`);
    }

    if (!title) {
        title = detectTitle(body, path.basename(fileName, extension));
    }

    return {
        format: extension.replace('.', ''),
        title,
        body,
        meta,
        originalName,
        bytes: buffer.length,
    };
}

/**
 * 从正文推断标题：优先一级标题，其次首行短句，最后回退文件名。
 * @param {string} body 正文
 * @param {string} fallback 兜底名称
 * @returns {string} 标题
 */
export function detectTitle(body, fallback) {
    const heading = body.match(/^#\s+(.+)$/m);
    if (heading) {
        return heading[1].trim();
    }

    const firstLine = body.split('\n').map(line => line.trim()).find(line => line.length > 0);
    if (firstLine && firstLine.length <= 80 && !firstLine.startsWith('```')) {
        return firstLine.replace(/^[-*>#\s]+/, '').trim();
    }

    return fallback || 'untitled';
}

/**
 * 取正文第一段有效内容作为摘要（跳过标题、代码块、列表行）。
 * @param {string} body 正文
 * @param {number} [maxLength] 最大长度
 * @returns {string} 摘要
 */
export function buildSummary(body, maxLength = 140) {
    let inFence = false;

    for (const rawLine of String(body ?? '').split('\n')) {
        const line = rawLine.trim();
        if (/^(```|~~~)/.test(line)) {
            inFence = !inFence;
            continue;
        }
        if (inFence || !line || /^#{1,6}\s/.test(line) || line.startsWith('|')) {
            continue;
        }
        const cleaned = line
            // 去掉列表/引用前缀，但不要碰 "1.5 倍" 这类正文
            .replace(/^([-*+>]\s+|\d+[.)]\s+)+/, '')
            .replace(/`/g, '')
            .replace(/\*{1,3}/g, '')
            // 只去掉作为强调用的下划线，保留 IN_CHAT / loading_order 这类标识符
            .replace(/(^|\s)_(?=\S)/g, '$1')
            .replace(/(?<=\S)_(?=\s|$)/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        if (cleaned.length >= 12) {
            return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}…` : cleaned;
        }
    }

    return '';
}

/**
 * 生成安全的文件名片段。
 * @param {string} text 原始文本
 * @param {string} [fallback] 兜底
 * @returns {string} slug
 */
export function slugify(text, fallback = 'doc') {
    const slug = String(text ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
    return slug || fallback;
}

