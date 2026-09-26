// 轻量 BM25 检索实现，零第三方依赖。
// 中文/CJK 按二元组(bigram)切分，英文/数字按单词切分，兼顾中英混排的酒馆插件文档。

/** CJK 字符区间：汉字、日文假名、韩文音节。 */
const CJK_SOURCE = '[\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff\\u3040-\\u30ff\\uac00-\\ud7af]';
const CJK_RUN = new RegExp(`${CJK_SOURCE}+`, 'g');
const LATIN_RUN = /[a-z0-9_@.$/\\-]+/g;

/**
 * 将文本切成检索词条。
 * @param {string} text 原始文本
 * @returns {string[]} 词条数组（允许重复，重复次数即词频）
 */
export function tokenize(text) {
    const tokens = [];
    const normalized = String(text ?? '').toLowerCase().normalize('NFKC');

    for (const word of normalized.match(LATIN_RUN) ?? []) {
        // 单字母噪声较大，除非是数字或常见短标识（如 js、ui）则保留
        if (word.length >= 2 || /[0-9]/.test(word)) {
            tokens.push(word);
        }
    }

    for (const run of normalized.match(CJK_RUN) ?? []) {
        if (run.length === 1) {
            tokens.push(run);
            continue;
        }
        for (let i = 0; i < run.length - 1; i++) {
            tokens.push(run.slice(i, i + 2));
        }
        // 短词整体保留，提升 "世界书"、"预设" 这类专有名词的精确命中
        if (run.length <= 4) {
            tokens.push(run);
        }
    }

    // 变量名 / 点号路径等希望整体命中时，额外补一个去符号版本
    for (const raw of normalized.match(/[a-z0-9_@.$/-]{4,}/g) ?? []) {
        if (/[.\-_/@$]/.test(raw)) {
            tokens.push(raw);
        }
    }

    return tokens;
}

/**
 * 用 docs 的切块构建 BM25 打分器。
 * @param {Array<{id: string, docId: string, heading: string, text: string}>} chunks 检索切块
 * @param {{k1?: number, b?: number}} [options] BM25 参数
 * @returns {(queryTerms: string[]) => Array<{chunk: any, score: number}>} 打分函数
 */
export function createScorer(chunks, options = {}) {
    const k1 = options.k1 ?? 1.2;
    const b = options.b ?? 0.75;
    const N = chunks.length;
    const df = new Map();
    let totalLength = 0;

    for (const chunk of chunks) {
        chunk.terms = tokenize(`${chunk.heading} ${chunk.text}`);
        chunk.tf = new Map();
        for (const term of chunk.terms) {
            chunk.tf.set(term, (chunk.tf.get(term) ?? 0) + 1);
        }
        totalLength += chunk.terms.length;
        for (const term of chunk.tf.keys()) {
            df.set(term, (df.get(term) ?? 0) + 1);
        }
    }

    const averageLength = N > 0 ? totalLength / N : 0;

    const idf = term => {
        const freq = df.get(term) ?? 0;
        return Math.log(1 + (N - freq + 0.5) / (freq + 0.5));
    };

    return function score(queryTerms) {
        const queryTf = new Map();
        for (const term of queryTerms) {
            queryTf.set(term, (queryTf.get(term) ?? 0) + 1);
        }

        const results = [];

        for (const chunk of chunks) {
            const length = chunk.terms.length || 1;
            const norm = k1 * (1 - b + b * (length / (averageLength || 1)));
            let score = 0;

            for (const [term, qtf] of queryTf) {
                const tf = chunk.tf.get(term);
                if (!tf) continue;
                const termScore = idf(term) * ((tf * (k1 + 1)) / (tf + norm));
                score += termScore * (1 + Math.log(qtf));
            }

            if (score > 0) {
                results.push({ chunk, score });
            }
        }

        return results.sort((a, c) => c.score - a.score);
    };
}
