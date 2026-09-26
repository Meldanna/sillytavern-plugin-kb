// 知识库文档解析与切块：把 Markdown 文档拆成可检索的小块。

/**
 * 解析文档开头的 YAML-ish frontmatter（只支持简单的 key: value 行）。
 * @param {string} raw 文件原文
 * @returns {{title: string, category: string, tags: string[], summary: string, sources: string[], body: string}}
 */
export function parseFrontmatter(raw) {
    const text = String(raw ?? '').replace(/^\uFEFF/, '');
    const meta = { title: '', category: '', tags: [], summary: '', sources: [] };
    let body = text;

    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/);
    if (match) {
        body = text.slice(match[0].length);
        for (const line of match[1].split(/\r?\n/)) {
            if (!line.trim() || line.trim().startsWith('#')) continue;
            const index = line.indexOf(':');
            if (index === -1) continue;
            const key = line.slice(0, index).trim();
            const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, '');
            if (key === 'title') meta.title = value;
            else if (key === 'category') meta.category = value;
            else if (key === 'summary') meta.summary = value;
            else if (key === 'tags') meta.tags = value.replace(/^\[|\]$/g, '').split(',').map(tag => tag.trim()).filter(Boolean);
            else if (key === 'sources') meta.sources = value.replace(/^\[|\]$/g, '').split(',').map(item => item.trim()).filter(Boolean);
        }
    }

    if (!meta.title) {
        const heading = body.match(/^#\s+(.+)$/m);
        meta.title = heading ? heading[1].trim() : '';
    }

    return { ...meta, body };
}

/**
 * 把正文按 ## / ### 标题切块，代码块内的 # 不会被误判。
 * @param {string} body 正文（已去掉 frontmatter）
 * @param {string} fallbackHeading 无标题时使用的兜底标题
 * @returns {Array<{heading: string, text: string}>} 切块列表
 */
export function splitChunks(body, fallbackHeading = '') {
    const lines = String(body ?? '').split(/\r?\n/);
    const chunks = [];
    let heading = fallbackHeading;
    let buffer = [];
    let inFence = false;

    const flush = () => {
        const text = buffer.join('\n').trim();
        if (text) {
            chunks.push({ heading, text });
        }
        buffer = [];
    };

    for (const line of lines) {
        if (/^\s*(```|~~~)/.test(line)) {
            inFence = !inFence;
            buffer.push(line);
            continue;
        }

        if (!inFence && /^#{2,4}\s+/.test(line)) {
            flush();
            heading = line.replace(/^#{2,4}\s+/, '').trim();
            buffer.push(line);
            continue;
        }

        if (!inFence && /^#\s+/.test(line) && !fallbackHeading) {
            // 顶层标题只作为文档标题，不进入切块
            continue;
        }

        buffer.push(line);
    }

    flush();

    if (chunks.length === 0) {
        chunks.push({ heading: heading || fallbackHeading, text: String(body ?? '').trim() });
    }

    return chunks;
}

/**
 * 在切块里截取与查询最相关的片段，用于给 Agent 提供直接可用的上下文。
 * @param {string} text 切块原文
 * @param {string[]} queryTerms 查询词条
 * @param {number} [maxLength] 最大字符数
 * @returns {string} 片段
 */
export function extractSnippet(text, queryTerms, maxLength = 900) {
    const terms = new Set(queryTerms.filter(term => term.length >= 1));
    const lines = String(text ?? '').split(/\r?\n/);
    let bestIndex = 0;
    let bestScore = -1;

    for (let i = 0; i < lines.length; i++) {
        const lower = lines[i].toLowerCase();
        let score = 0;
        for (const term of terms) {
            if (lower.includes(term)) score += term.length > 1 ? 2 : 1;
        }
        if (score > bestScore) {
            bestScore = score;
            bestIndex = i;
        }
    }

    let start = Math.max(0, bestIndex - 3);
    let output = '';

    for (let i = start; i < lines.length; i++) {
        const candidate = output ? `${output}\n${lines[i]}` : lines[i];
        if (candidate.length > maxLength && output) break;
        output = candidate;
    }

    if (output.length > maxLength) {
        output = `${output.slice(0, maxLength)}…`;
    }

    return output.trim();
}
