/**
 * A minimal zip reader, enough to open an `.xlsx`.
 *
 * Node ships the inflate algorithm but no zip container reader, and pulling a
 * dependency into the build for two files at import time is not worth it. A zip
 * is a sequence of stored entries followed by a central directory, and this
 * reads the central directory and inflates the entries it is asked for.
 *
 * Only the two compression methods an `.xlsx` ever uses are supported: stored
 * (0) and deflate (8).
 */

import fs from 'node:fs';
import zlib from 'node:zlib';

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;

/**
 * Read every entry of a zip file into memory.
 *
 * @param {string} file Path to the archive.
 * @returns {Map<string, Buffer>} Entry name to its uncompressed bytes.
 */
export function unzip(file) {
  const buffer = fs.readFileSync(file);

  // The end-of-central-directory record is last, but a zip comment may follow
  // it, so scan backwards for the signature. The comment is at most 65535 bytes.
  let eocd = -1;
  const earliest = Math.max(0, buffer.length - 65557);
  for (let i = buffer.length - 22; i >= earliest; i--) {
    if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error(`${file} is not a zip archive`);

  const entryCount = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);

  const entries = new Map();
  for (let i = 0; i < entryCount; i++) {
    if (buffer.readUInt32LE(offset) !== CENTRAL_SIGNATURE) {
      throw new Error(`Corrupt central directory in ${file} at entry ${i}`);
    }

    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.toString('utf8', offset + 46, offset + 46 + nameLength);

    // The local header repeats the name and extra field, and its extra field
    // length may differ from the central one, so read the lengths from there.
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const data = buffer.subarray(dataStart, dataStart + compressedSize);

    if (!name.endsWith('/')) {
      entries.set(name, method === 0 ? Buffer.from(data) : zlib.inflateRawSync(data));
    }

    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}
