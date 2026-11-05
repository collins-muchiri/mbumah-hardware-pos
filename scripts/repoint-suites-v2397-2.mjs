#!/usr/bin/env node
/**
 * repoint-suites-v2397-2.mjs — the second re-point wave:
 *   1. aria-hidden pins whose desk spoke it ONLY on the chip's icons move
 *      to the loom (the icons live in the one hand now).
 *   2. the one-writer-per-word census admits the loom's own suite (the
 *      THE_ELDER block speaks every elder word it pins) — inserted in
 *      sorted position with the dated admission comment.
 *   3. the two pre-anchored voice-1 windows (et-status, sec-type) whose
 *      dismissal used to sit BEFORE the testid: the loomed chip's
 *      onDismiss is the LAST prop, so the window re-anchors forward.
 * Idempotent by construction (every replacement is guarded).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;
const LOOM_SUITE = 'src/tests/landing-chip-loom-v2394.test.ts';
const ARIA = ['ad-severity-deep-link-v2366', 'cat-stock-deep-link-v2364', 'cr-type-deep-link-v2361', 'cv-type-deep-link-v2363', 'dn-status-deep-link-v2359', 'dp-status-deep-link-v2365', 'et-status-deep-link-v2381', 'gc-status-deep-link-v2358', 'inv-status-deep-link-v2356', 'ly-type-deep-link-v2368', 'pr-status-deep-link-v2362', 'rent-status-deep-link-v2355', 'transfer-status-deep-link-v2357'];
const CENSUS = ['ad-severity-deep-link-v2366', 'cat-stock-deep-link-v2364', 'cr-type-deep-link-v2361', 'cust-debt-deep-link-v2330', 'cv-type-deep-link-v2363', 'dn-status-deep-link-v2359', 'dp-status-deep-link-v2365', 'et-status-deep-link-v2381', 'gc-status-deep-link-v2358', 'inv-status-deep-link-v2356', 'inv-stock-deep-link-v2329', 'ly-type-deep-link-v2368', 'pr-status-deep-link-v2362', 'rent-status-deep-link-v2355', 'sec-type-deep-link-v2367', 'sup-po-deep-link-v2332', 'sup-status-deep-link-v2331', 'txn-pay-deep-link-v2333', 'txn-type-deep-link-v2354', 'vc-status-deep-link-v2360'];

let touched = 0;
for (const name of new Set([...ARIA, ...CENSUS])) {
  const path = `${ROOT}src/tests/${name}.test.ts`;
  let src = readFileSync(path, 'utf8');
  const before = src;
  const notes = [];

  // 1. aria-hidden → the loom's hand
  if (ARIA.includes(name)) {
    const old = `expect(desk.includes('aria-hidden="true"')).toBe(true);`;
    if (src.includes(old)) {
      src = src.split(old).join(`expect(LOOM.includes('aria-hidden="true"')).toBe(true); // v2.397.0 THE LOOM: the icons live in the one hand`);
      notes.push('aria-hidden');
    }
  }

  // 2. the census admission — LINE-PURE insertion: the block's comment
  //    lines carry apostrophes, so quote-scanning is forbidden; only
  //    whole lines that are exactly one quoted entry participate
  if (CENSUS.includes(name) && !src.includes(LOOM_SUITE)) {
    const lines = src.split('\n');
    const entryIdx = [];
    let inCensus = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('expect(collected).toEqual(')) inCensus = true;
      if (inCensus && /^\s*'src\/[^']+',\s*$/.test(lines[i])) entryIdx.push(i);
      if (inCensus && lines[i].includes(']));')) { inCensus = false; }
    }
    if (entryIdx.length === 0) { console.error(`${name}: no pure census entries`); process.exit(1); }
    const entries = entryIdx.map((i) => lines[i].trim().replace(/',$/, '').slice(1, -1));
    const sorted = [...entries, LOOM_SUITE].sort();
    const at = sorted.indexOf(LOOM_SUITE);
    // insert after the entry that sorts before (or at the top if first)
    let insertAfter = at > 0 ? entryIdx[at - 1] : entryIdx[0] - 1;
    // skip a dangling comment line attached to the preceding entry
    while (/^\s*\/\//.test(lines[insertAfter] ?? '') && at > 0) insertAfter--;
    lines.splice(insertAfter + 1, 0,
      `      // the loom's own suite — admitted (v2.397.0: the elder loom pins`,
      `      // this desk's chip bytes, so the walk lists it)`,
      `      '${LOOM_SUITE}',`);
    src = lines.join('\n');
    notes.push('census');
  }

  // 3. the pre-anchored voice-1 windows
  if (name === 'et-status-deep-link-v2381') {
    const old = 'const block = desk.slice(Math.max(0, at - 900), at + 300);';
    if (src.includes(old)) {
      src = src.replace(old, '// v2.397.0 THE LOOM: onDismiss is the loomed chip\u2019s LAST prop — the\n    // window re-anchors forward (the pre-loom form looked BACK)\n    const block = desk.slice(at, at + 1200);');
      notes.push('et-window');
    }
  }
  if (name === 'sec-type-deep-link-v2367') {
    const old = 'const block = desk.slice(Math.max(0, at - 500), at + 300);';
    if (src.includes(old)) {
      src = src.replace(old, '// v2.397.0 THE LOOM: onDismiss is the loomed chip\u2019s LAST prop — the\n    // window re-anchors forward (the pre-loom form looked BACK)\n    const block = desk.slice(at, at + 1200);');
      notes.push('sec-window');
    }
  }

  if (src !== before) {
    writeFileSync(path, src);
    touched++;
    console.log(`${name}: ${notes.join(', ')}`);
  }
}
console.log(`touched: ${touched}`);
