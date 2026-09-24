/**
 * A minimal, dependency-free reader for the `.xlsx` files that carry the SDG
 * Lines operational configuration.
 *
 * An `.xlsx` file is a zip of XML parts. Adding a spreadsheet library to the
 * project to read two files at import time is a poor trade, so this module
 * reads the parts directly. It handles exactly what the SDG Lines workbooks
 * use: shared strings, inline strings, numbers and cached formula results.
 *
 * It deliberately does not evaluate formulas. The supplied workbooks were
 * exported from Google Sheets and carry no usable formulas anyway: every
 * computed cell reads `__xludf.DUMMYFUNCTION("COMPUTED_VALUE")` and only the
 * cached result survives. See `docs/quote/pricing-model.md`.
 */

import { unzip } from './unzip.mjs';

/** Resolve the five XML entities plus numeric character references. */
function decodeXml(text) {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, '&');
}

/** Turn a cell reference such as `BK12` into a zero-based column index. */
function columnIndex(reference) {
  const letters = /^[A-Z]+/.exec(reference)[0];
  let index = 0;
  for (const letter of letters) index = index * 26 + (letter.charCodeAt(0) - 64);
  return index - 1;
}

/**
 * Parse one worksheet part into an array of rows, each an array of cells.
 *
 * Positions are preserved: a value at `C5` lands at `rows[4][2]` whether or not
 * the cells before it exist. Empty cells are `undefined`, which matters because
 * several SDG Lines sheets stack unrelated tables in the same columns and are
 * separable only by their blank rows.
 */
function parseSheet(xml, shared) {
  const rows = [];

  for (const row of xml.matchAll(/<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = [];
    for (const cell of row[2].matchAll(/<c([^>]*)>([\s\S]*?)<\/c>/g)) {
      const reference = /r="([A-Z]+\d+)"/.exec(cell[1])?.[1];
      if (!reference) continue;
      const type = /t="([^"]+)"/.exec(cell[1])?.[1];

      let value = '';
      if (type === 'inlineStr') {
        for (const run of cell[2].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)) value += run[1];
        value = decodeXml(value);
      } else {
        // <v> holds the literal value, or the cached result for a formula cell.
        const raw = /<v>([\s\S]*?)<\/v>/.exec(cell[2])?.[1];
        if (raw != null) value = type === 's' ? (shared[Number(raw)] ?? '') : decodeXml(raw);
      }

      if (value !== '') cells[columnIndex(reference)] = value;
    }
    rows[Number(row[1]) - 1] = cells;
  }

  // Rows carrying only formatting are written self-closing. They must still
  // occupy their position so that later row numbers line up.
  for (const empty of xml.matchAll(/<row[^>]*r="(\d+)"[^>]*\/>/g)) {
    const index = Number(empty[1]) - 1;
    if (!rows[index]) rows[index] = [];
  }

  return rows;
}

/**
 * Open a workbook.
 *
 * @param {string} file Path to an `.xlsx` file.
 * @returns {{ sheetNames: string[], sheet(name: string): Array<Array<string|undefined>> }}
 */
export function openWorkbook(file) {
  const parts = unzip(file);
  const text = (name) => parts.get(name)?.toString('utf8');

  const shared = [];
  const sharedXml = text('xl/sharedStrings.xml');
  if (sharedXml) {
    // A shared string may be split across several <t> runs when part of it is
    // formatted differently. Concatenating the runs restores the text.
    for (const item of sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)) {
      let value = '';
      for (const run of item[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)) value += run[1];
      shared.push(decodeXml(value));
    }
  }

  const workbookXml = text('xl/workbook.xml');
  const relsXml = text('xl/_rels/workbook.xml.rels');
  if (!workbookXml || !relsXml) throw new Error(`${file} is not a readable .xlsx workbook`);

  const targets = {};
  for (const rel of relsXml.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
    targets[rel[1]] = `xl/${rel[2].replace(/^\/?xl\//, '')}`;
  }

  const index = new Map();
  const sheetNames = [];
  for (const entry of workbookXml.matchAll(/<sheet [^>]*\/>/g)) {
    const name = decodeXml(/name="([^"]*)"/.exec(entry[0])?.[1] ?? '');
    const id = /r:id="([^"]*)"/.exec(entry[0])?.[1];
    if (!id || !targets[id]) continue;
    index.set(name, targets[id]);
    sheetNames.push(name);
  }

  const cache = new Map();
  return {
    sheetNames,
    sheet(name) {
      if (cache.has(name)) return cache.get(name);
      const part = index.get(name);
      if (!part) {
        throw new Error(`Sheet "${name}" is not in ${file}. Available: ${sheetNames.join(', ')}`);
      }
      const rows = parseSheet(text(part) ?? '', shared);
      cache.set(name, rows);
      return rows;
    },
  };
}

/** Read a cell as a number, or return `null` when it is blank or not numeric. */
export function num(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Read a cell as trimmed text, or return `null` when it is blank. */
export function str(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}
