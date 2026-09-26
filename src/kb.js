// 共享知识库核心：加载 Markdown 知识文档、构建检索索引、提供查询与写入能力。

import fs from 'node:fs';
import path from 'node:path';

import { createScorer, tokenize } from './bm25.js';
import { extractSnippet, parseFrontmatter, splitChunks } from './indexer.js';

const INDEX_VERSION = 1;

/** 递归收集目录下的 Markdown 文件。 */
function collectMarkdownFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.')) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...collectMarkdownFiles(full));
        } else if (/\.(md|markdown)$/i.test(entry.name)) {
            files.push(full);
        }
    }

    return files.sort();
}

/** 把绝对路径转成知识库内的稳定 id。 */
function toId(root, filePath) {
    return path.relative(root, filePath).replace(/\\/g, '/').replace(/\.(md|markdown)$/i, '');
}

/**
 * 术语匹配打分：CJK 按子串匹配；ASCII 词按"词边界"匹配，
 * 避免 char 命中 charData / Character 这类子串噪声（符号参考类知识库里很关键）。
 * @param {string} text 待匹配文本（已小写）
 * @param {string} term 词条（已小写）
 * @returns {0|1} 是否匹配
 */
function termHit(text, term) {
    if (!term) return 0;
    if (/[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/.test(term)) {
        return text.includes(term) ? 1 : 0;
    }
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?<![a-z0-9_$])${escaped}(?![a-z0-9_$])`).test(text) ? 1 : 0;
}

export class KnowledgeBase {
    /**
     * @param {string} root 知识库根目录（默认 <项目>/knowledge）
     */
    constructor(root) {
        this.root = root;
        /** @type {Map<string, any>} */
        this.docs = new Map();
        /** @type {any[]} */
        this.chunks = [];
        this.builtAt = null;
        this.scorer = () => [];
    }

    /** 从磁盘重新加载全部知识文档并重建索引。 */
    rebuild() {
        const docs = new Map();
        const chunks = [];

        for (const filePath of collectMarkdownFiles(this.root)) {
            const id = toId(this.root, filePath);
            const stat = fs.statSync(filePath);
            const raw = fs.readFileSync(filePath, 'utf8');
            const parsed = parseFrontmatter(raw);
            const docChunks = splitChunks(parsed.body, parsed.title || id);

            docs.set(id, {
                id,
                title: parsed.title || id,
                category: parsed.category || 'uncategorized',
                tags: parsed.tags,
                summary: parsed.summary,
                sources: parsed.sources,
                file: path.relative(this.root, filePath).replace(/\\/g, '/'),
                absolutePath: filePath,
                bytes: stat.size,
                mtime: stat.mtime.toISOString(),
                content: raw,
                headings: docChunks.map(chunk => chunk.heading),
            });

            docChunks.forEach((chunk, index) => {
                chunks.push({
                    id: `${id}#${index}`,
                    docId: id,
                    heading: chunk.heading,
                    text: chunk.text,
                });
            });
        }

        this.docs = docs;
        this.chunks = chunks;
        this.scorer = createScorer(chunks);
        this.builtAt = new Date().toISOString();
        return this;
    }

    /** 导出可落盘的索引结构。 */
    toIndex() {
        return {
            version: INDEX_VERSION,
            builtAt: this.builtAt,
            root: this.root,
            documentCount: this.docs.size,
            chunkCount: this.chunks.length,
            documents: [...this.docs.values()].map(doc => ({
                id: doc.id,
                title: doc.title,
                category: doc.category,
                tags: doc.tags,
                summary: doc.summary,
                sources: doc.sources,
                file: doc.file,
                bytes: doc.bytes,
                mtime: doc.mtime,
                headings: doc.headings,
            })),
            chunks: this.chunks.map(chunk => ({ id: chunk.id, docId: chunk.docId, heading: chunk.heading })),
        };
    }

    /** 把索引写到磁盘，便于人工查看/版本化。 */
    writeIndex(indexPath) {
        fs.mkdirSync(path.dirname(indexPath), { recursive: true });
        fs.writeFileSync(indexPath, `${JSON.stringify(this.toIndex(), null, 2)}\n`, 'utf8');
    }

    /**
     * 关键词检索。
     * @param {string} query 查询语句
     * @param {{limit?: number, category?: string, tags?: string[], docId?: string}} [options] 过滤条件
     * @returns {Array<any>} 结果列表
     */
    search(query, options = {}) {
        const limit = Math.max(1, Math.min(Number(options.limit) || 5, 20));
        const terms = tokenize(query);
        if (terms.length === 0) return [];

        const category = options.category ? String(options.category).toLowerCase() : null;
        const tagFilters = (options.tags ?? []).map(tag => String(tag).toLowerCase());
        const docId = options.docId ?? null;
        const results = [];

        for (const { chunk, score } of this.scorer(terms)) {
            const doc = this.docs.get(chunk.docId);
            if (!doc) continue;
            if (docId && doc.id !== docId) continue;
            if (category && doc.category.toLowerCase() !== category) continue;
            if (tagFilters.length > 0) {
                const docTags = doc.tags.map(tag => tag.toLowerCase());
                if (!tagFilters.every(tag => docTags.includes(tag))) continue;
            }

            // 标题命中比说明/标签命中更重要：符号名/命令名/宏名写在标题上，正是最精确的定位信号
            const headingText = chunk.heading.toLowerCase();
            const metaText = `${doc.title} ${doc.tags.join(' ')}`.toLowerCase();
            let boost = 0;
            for (const term of terms) {
                if (termHit(headingText, term)) boost += 2.2;
                else if (termHit(metaText, term)) boost += 0.5;
            }
            results.push({
                docId: doc.id,
                title: doc.title,
                category: doc.category,
                tags: doc.tags,
                heading: chunk.heading,
                score: Number((score + boost * 0.35).toFixed(4)),
                snippet: extractSnippet(chunk.text, terms),
            });
        }

        return results.slice(0, limit);
    }

    /** 取单篇文档全文。 */
    get(id) {
        return this.docs.get(String(id)) ?? null;
    }

    /** 列出文档元信息。 */
    list(options = {}) {
        const category = options.category ? String(options.category).toLowerCase() : null;
        const tag = options.tag ? String(options.tag).toLowerCase() : null;

        return [...this.docs.values()]
            .filter(doc => !category || doc.category.toLowerCase() === category)
            .filter(doc => !tag || doc.tags.map(item => item.toLowerCase()).includes(tag))
            .map(doc => ({
                id: doc.id,
                title: doc.title,
                category: doc.category,
                tags: doc.tags,
                summary: doc.summary,
                bytes: doc.bytes,
                headings: doc.headings.length,
            }));
    }

    /** 统计信息。 */
    stats() {
        const categories = new Map();
        let totalBytes = 0;

        for (const doc of this.docs.values()) {
            categories.set(doc.category, (categories.get(doc.category) ?? 0) + 1);
            totalBytes += doc.bytes;
        }

        return {
            root: this.root,
            builtAt: this.builtAt,
            documents: this.docs.size,
            chunks: this.chunks.length,
            totalBytes,
            categories: Object.fromEntries([...categories.entries()].sort()),
        };
    }

    /**
     * 新增/追加一条共享知识（Agent 沉淀结论用）。
     * @param {{title: string, content: string, category?: string, tags?: string[], id?: string, summary?: string, append?: boolean}} input 输入
     * @returns {{id: string, file: string, appended: boolean}} 写入结果
     */
    add(input) {
        const title = String(input.title ?? '').trim();
        const content = String(input.content ?? '').trim();
        if (!title) throw new Error('title 不能为空');
        if (!content) throw new Error('content 不能为空');

        const category = String(input.category ?? 'shared').trim() || 'shared';
        const tags = (input.tags ?? []).map(tag => String(tag).trim()).filter(Boolean);
        const slug = String(input.id ?? title)
            .trim()
            .toLowerCase()
            .replace(/[^\w\u4e00-\u9fff-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 60) || `note-${Date.now()}`;

        const filePath = path.join(this.root, 'shared', `${slug}.md`);
        const appended = Boolean(input.append) && fs.existsSync(filePath);

        if (appended) {
            fs.appendFileSync(filePath, `\n\n${content}\n`, 'utf8');
        } else {
            const front = [
                '---',
                `title: ${title}`,
                `category: ${category}`,
                `tags: ${tags.join(', ')}`,
                input.summary ? `summary: ${input.summary}` : null,
                `updated: ${new Date().toISOString().slice(0, 10)}`,
                '---',
                '',
            ].filter(line => line !== null).join('\n');
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, `${front}\n${content}\n`, 'utf8');
        }

        this.rebuild();
        return { id: toId(this.root, filePath), file: filePath, appended };
    }
}

/**
 * 按项目位置创建知识库实例。
 * @param {string} projectDir st-plugin-kb 项目目录
 * @returns {KnowledgeBase} 知识库实例
 */
export function createKnowledgeBase(projectDir) {
    const root = process.env.ST_KB_ROOT
        ? path.resolve(process.env.ST_KB_ROOT)
        : path.join(projectDir, 'knowledge');
    return new KnowledgeBase(root);
}
