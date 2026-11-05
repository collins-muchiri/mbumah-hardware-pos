#!/usr/bin/env node
// walk-v2402.mjs — v2.402.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.402.0 story) joins console-changelog.test.ts
//   2. the count web: the four unread anchors grow their +1 legs
//      (291/292/293/324 → 292/293/294/325) across EVERY suite that pins
//      them or pins the counter's own bytes
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.401.0') → toBe('2.402.0') + the feed-announcement pin)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.402.0: the payload card hands you the file — the KRA filing trio completes (Print = the paper, Copy = the clipboard, Download = the FILE: the mapped payload's card saves the same pretty JSON the clipboard carries as a named kra-payload-<invoice>-<date>.json, the saved face riding the receipt hop's two-second law), the card's eight-row ledger alternates on a quiet zebra ground, the refund heal suite's must label widens (29 faces stand down, 431 → 402), and the entry joins the feed (+1 on every unread anchor — the DERIVED anchors re-set themselves, the cascade's thirteenth generation)\n`;

if (src.includes('// v2.402.0:')) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("// v2.401.0: the health desk hands you the file")) {
  const anchorLine = src.indexOf("    expect(whatsNewUnreadCount('2.110.0'))");
  if (anchorLine < 0) { console.error('FAIL: the 2.110.0 anchor line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted before the 2.110.0 anchor');
} else {
  console.error('FAIL: neither the v2.402.0 nor the v2.401.0 history line found');
  process.exit(1);
}

writeFileSync(path, src);
console.log(`\n${writes} replacement(s) written.`);

const listTests = (dir) => {
  const acc = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) acc.push(...listTests(p));
    else if (/\.test\.ts$/.test(e.name)) acc.push(p);
  }
  return acc;
};

// ── the count web ────────────────────────────────────────────────────────
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(291)", "whatsNewUnreadCount('2.110.0')).toBe(292)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(292)", "whatsNewUnreadCount('2.109.0')).toBe(293)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(293)", "whatsNewUnreadCount('2.108.0')).toBe(294)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(324)", "whatsNewUnreadCount('2.77.0')).toBe(325)"],
];
let cFiles = 0, cEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  for (const [from, to] of COUNT_FROM) text = text.split(from).join(to);
  if (text !== before) {
    writeFileSync(file, text);
    cFiles++;
    cEdits += COUNT_FROM.reduce((n, [from]) => n + (before.split(from).length - 1), 0);
  }
}
console.log(`count web: ${cEdits} anchor edit(s) across ${cFiles} file(s).`);

// ── the version web ──────────────────────────────────────────────────────
let vFiles = 0, vEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  text = text.split("toBe('2.401.0')").join("toBe('2.402.0')");
  text = text.split('toContain("version: \'2.401.0\'")').join('toContain("version: \'2.402.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.401.0')").length - 1) + (before.split('toContain("version: \'2.401.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
