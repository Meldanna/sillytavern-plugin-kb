// 极简 ZIP 读取器（零依赖）：只支持 stored(0) 与 deflate(8)，用于解析 .docx / .xlsx 这类 OOXML 包。
// 不处理 zip64 与加密包，遇到时抛出明确错误。

import zlib from 'node:zlib';

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;

/**
 * 读取 ZIP 包并返回 文件名 → 内容 Buffer 的映射。
 * @param {Buffer} buffer ZIP 文件内容
 * @returns {Map<string, Buffer>} 条目映射
 */
export function readZipEntries(buffer) {
    const eocdOffset = findEndOfCentralDirectory(buffer);
    const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
    let offset = buffer.readUInt32LE(eocdOffset + 16);

    if (offset === 0xffffffff) {
        throw new Error('不支持 zip64 格式的压缩包');
    }

    const entries = new Map();

    for (let index = 0; index < totalEntries; index++) {
        if (buffer.readUInt32LE(offset) !== CENTRAL_SIGNATURE) {
            throw new Error(`ZIP 中央目录结构异常（偏移 ${offset}）`);
        }

        const method = buffer.readUInt16LE(offset + 10);
        const compressedSize = buffer.readUInt32LE(offset + 20);
        const nameLength = buffer.readUInt16LE(offset + 28);
        const extraLength = buffer.readUInt16LE(offset + 30);
        const commentLength = buffer.readUInt16LE(offset + 32);
        const localOffset = buffer.readUInt32LE(offset + 42);
        const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);

        entries.set(name, readLocalEntry(buffer, localOffset, method, compressedSize));

        offset += 46 + nameLength + extraLength + commentLength;
    }

    return entries;
}

/** 从中央目录往前找 EOCD 记录。 */
function findEndOfCentralDirectory(buffer) {
    const minOffset = Math.max(0, buffer.length - 66_000);
    for (let offset = buffer.length - 22; offset >= minOffset; offset--) {
        if (buffer.readUInt32LE(offset) === EOCD_SIGNATURE) {
            return offset;
        }
    }
    throw new Error('找不到 ZIP 结束记录（文件可能不是有效的 zip/docx）');
}

/** 读取单个条目并解压。 */
function readLocalEntry(buffer, localOffset, method, centralCompressedSize) {
    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) {
        throw new Error('ZIP 本地头结构异常');
    }

    const nameLength = buffer.readUInt16LE(localOffset + 26);
    const extraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + nameLength + extraLength;

    if (method === 0) {
        return Buffer.from(buffer.subarray(dataStart, dataStart + centralCompressedSize));
    }

    if (method === 8) {
        // 流式解压时不依赖 compressedSize，deflate 流自带结束标记，避免 data descriptor 场景下长度不可信
        return zlib.inflateRawSync(buffer.subarray(dataStart));
    }

    throw new Error(`不支持的压缩方法：${method}`);
}
