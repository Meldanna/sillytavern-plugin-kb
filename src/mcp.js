// MCP(stdio) 协议实现：零依赖，手写 JSON-RPC 2.0 分发。
// 只向 stdout 写 JSON-RPC 消息，其余日志一律走 stderr。

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SERVER_NAME = 'st-plugin-kb';
export const SERVER_VERSION = '1.0.0';

/** 支持的 MCP 协议版本，按优先级排列。 */
const SUPPORTED_PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const DEFAULT_PROTOCOL_VERSION = '2024-11-05';

/** 工具清单。 */
export const TOOLS = [
    {
        name: 'kb_search',
        description: '在 SillyTavern 插件开发共享知识库中做关键词检索（BM25，支持中英混排）。返回最相关的知识片段、文档 id、标题与命中位置。动手写插件或改插件前，先用它查 API 约定、加载生命周期、构建与调试方式。',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: '查询语句，例如 "前端扩展 manifest 字段" 或 "server plugin 注册路由"' },
                limit: { type: 'number', description: '返回条数，默认 5，范围 1-20' },
                category: { type: 'string', description: '按分类过滤：frontend / server / build / workflow / security / workspace / reference' },
                tags: { type: 'array', items: { type: 'string' }, description: '按标签过滤（需全部命中）' },
                docId: { type: 'string', description: '限定在某篇文档内检索' },
            },
            required: ['query'],
        },
    },
    {
        name: 'kb_get',
        description: '按 id 取回知识文档全文（含 frontmatter 与来源文件清单）。先用 kb_list 或 kb_search 拿到 id。',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: '文档 id，例如 "10-frontend-manifest"' },
            },
            required: ['id'],
        },
    },
    {
        name: 'kb_list',
        description: '列出知识库中的全部文档（可按 category / tag 过滤），返回 id、标题、分类、标签、摘要。',
        inputSchema: {
            type: 'object',
            properties: {
                category: { type: 'string', description: '按分类过滤' },
                tag: { type: 'string', description: '按单个标签过滤' },
            },
        },
    },
    {
        name: 'kb_add',
        description: '把本次排查/实现得到的新结论沉淀进共享知识库（写入 knowledge/shared/ 并重建索引），供本工作区所有插件项目复用。',
        inputSchema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: '条目标题' },
                content: { type: 'string', description: 'Markdown 正文' },
                category: { type: 'string', description: '分类，默认 shared' },
                tags: { type: 'array', items: { type: 'string' }, description: '标签' },
                id: { type: 'string', description: '自定义文件名（可选）' },
                summary: { type: 'string', description: '一句话摘要' },
                append: { type: 'boolean', description: '为 true 且文件已存在时追加而不是覆盖' },
            },
            required: ['title', 'content'],
        },
    },
    {
        name: 'kb_reindex',
        description: '重新扫描 knowledge/ 目录并重建索引（外部手工编辑过 Markdown 后调用）。',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'kb_stats',
        description: '知识库统计信息：文档数、切块数、总字节数、分类分布、索引构建时间。',
        inputSchema: { type: 'object', properties: {} },
    },
];

/** 生成内容型工具结果。 */
function textResult(text) {
    return { content: [{ type: 'text', text }] };
}

/** 生成错误型工具结果（MCP 约定：isError 而不是 JSON-RPC error）。 */
function errorResult(text) {
    return { content: [{ type: 'text', text }], isError: true };
}

/** 执行某个工具的调用。 */
async function callTool(kb, name, args) {
    const input = args ?? {};

    switch (name) {
        case 'kb_search': {
            if (!input.query) return errorResult('缺少必要参数 query');
            const results = kb.search(input.query, {
                limit: input.limit,
                category: input.category,
                tags: input.tags,
                docId: input.docId,
            });

            if (results.length === 0) {
                return textResult(`没有命中结果。可以先用 kb_list 看有哪些文档，或换个关键词（query="${input.query}"）。`);
            }

            const text = results
                .map((item, index) => [
                    `[${index + 1}] ${item.title} / ${item.heading}`,
                    `id: ${item.docId}  category: ${item.category}  tags: ${item.tags.join(', ') || '-'}  score: ${item.score}`,
                    '---',
                    item.snippet,
                ].join('\n'))
                .join('\n\n');

            return textResult(text);
        }

        case 'kb_get': {
            if (!input.id) return errorResult('缺少必要参数 id');
            const doc = kb.get(input.id);
            if (!doc) {
                const available = kb.list().map(item => item.id).join(', ');
                return errorResult(`找不到文档 "${input.id}"。可用 id：${available}`);
            }
            const header = [
                `# ${doc.title}`,
                `id: ${doc.id}`,
                `category: ${doc.category}`,
                `tags: ${doc.tags.join(', ') || '-'}`,
                doc.summary ? `summary: ${doc.summary}` : null,
                doc.sources.length > 0 ? `sources: ${doc.sources.join(', ')}` : null,
                '',
            ].filter(line => line !== null).join('\n');
            // 头部已经给出元信息，正文里的 frontmatter 去掉，避免重复占 token
            const body = doc.content.replace(/^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/, '').trim();
            return textResult(`${header}\n${body}`);
        }

        case 'kb_list': {
            const docs = kb.list({ category: input.category, tag: input.tag });
            if (docs.length === 0) return textResult('没有匹配的文档。');
            const text = docs
                .map(doc => `- ${doc.id}｜${doc.title}｜category=${doc.category}｜tags=${doc.tags.join(', ') || '-'}${doc.summary ? `\n  ${doc.summary}` : ''}`)
                .join('\n');
            return textResult(`共 ${docs.length} 篇：\n${text}`);
        }

        case 'kb_add': {
            try {
                const result = kb.add(input);
                return textResult(`${result.appended ? '已追加到' : '已写入'} ${result.file}\nid: ${result.id}\n索引已重建，当前文档数：${kb.docs.size}`);
            } catch (error) {
                return errorResult(`写入失败：${error.message}`);
            }
        }

        case 'kb_reindex': {
            kb.rebuild();
            const stats = kb.stats();
            return textResult(`索引已重建：${stats.documents} 篇文档 / ${stats.chunks} 个切块（${stats.builtAt}）`);
        }

        case 'kb_stats': {
            return textResult(JSON.stringify(kb.stats(), null, 2));
        }

        default:
            return errorResult(`未知工具：${name}`);
    }
}

/**
 * 创建 MCP 服务端逻辑。
 * @param {{kb: any, writeError?: (line: string) => void}} deps 依赖
 * @returns {(message: any) => Promise<any|null>} 处理单条 JSON-RPC 消息，返回 null 表示无需响应
 */
export function createMcpServer(deps) {
    const { kb, writeError = line => process.stderr.write(line) } = deps;

    return async function handleMessage(message) {
        if (!message || typeof message !== 'object' || typeof message.method !== 'string') {
            return { jsonrpc: '2.0', id: message?.id ?? null, error: { code: -32600, message: 'Invalid Request' } };
        }

        const { method, id, params } = message;
        const isNotification = id === undefined || id === null;

        /** 统一封装响应；通知类消息返回 null。 */
        const respond = payload => (isNotification ? null : { jsonrpc: '2.0', id, ...payload });
        const ok = result => respond({ result });
        const fail = (code, msg) => respond({ error: { code, message: msg } });

        try {
            switch (method) {
                case 'initialize': {
                    const requested = params?.protocolVersion;
                    const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : DEFAULT_PROTOCOL_VERSION;
                    return ok({
                        protocolVersion,
                        capabilities: { tools: { listChanged: false } },
                        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
                        instructions: [
                            'Mission: 让本工作区（E:\\SillyTavern）的每一次酒馆插件/脚本开发，都建立在经过核实的既有知识之上，而不是凭记忆猜 API、重复踩坑、重复造轮子。',
                            '开工前先 kb_get MISSION（使命与使用契约）或 kb_list 建立地图；再用 kb_search 查本次要用的 API 签名、事件名、manifest 字段、构建方式与历史踩坑。',
                            '结论与仓库源码冲突时以源码为准，并回头修正知识库；任务完成后用 kb_add 把可复用结论写回 knowledge/shared/。',
                            '覆盖范围：插件开发规范(id 00-25)、移动端 UI(18)、酒馆助手全局 API(helper/*)、ST 核心斜杠命令与宏(reference/*)。本库只服务开发，与酒馆运行时无关。',
                        ].join(' '),
                    });
                }

                case 'notifications/initialized':
                case 'notifications/cancelled':
                case 'notifications/roots/list_changed':
                    return null;

                case 'ping':
                    return ok({});

                case 'tools/list':
                    return ok({ tools: TOOLS });

                case 'tools/call': {
                    const name = params?.name;
                    if (typeof name !== 'string') return fail(-32602, 'Invalid params: name is required');
                    if (!TOOLS.some(tool => tool.name === name)) return fail(-32602, `Unknown tool: ${name}`);
                    return ok(await callTool(kb, name, params?.arguments));
                }

                case 'resources/list':
                    return ok({ resources: [] });

                case 'prompts/list':
                    return ok({ prompts: [] });

                default: {
                    if (method.startsWith('notifications/')) return null;
                    writeError(`[${SERVER_NAME}] 未支持的方法: ${method}\n`);
                    return fail(-32601, `Method not found: ${method}`);
                }
            }
        } catch (error) {
            writeError(`[${SERVER_NAME}] 处理 ${method} 失败: ${error?.stack ?? error}\n`);
            return respond({ error: { code: -32603, message: `Internal error: ${error.message}` } });
        }
    };
}

/** 供脚本复用的项目目录解析（metaUrl 指向项目内的文件，返回其所在目录）。 */
export function projectDirFromMetaUrl(metaUrl) {
    return path.dirname(fileURLToPath(metaUrl));
}
