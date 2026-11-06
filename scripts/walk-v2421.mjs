#!/usr/bin/env node
// walk-v2421.mjs — v2.421.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.421.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.420.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's thirty-second generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (310/311/312/343 → 311/312/313/344) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.420.0') → toBe('2.421.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2421.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.421.0: the restock order rides with its supplier — one block per supplier, ready for each chat: the low-stock banner's copy/download faces group the order into per-supplier blocks when the rows' world names ANY supplier (named blocks alphabetical, the honest-absence block 'No supplier yet:' always LAST, the selector's own sort holding inside every block, a blank line between blocks, the header and the count line staying global), a world that never names suppliers reads the FLAT order byte-for-byte as v2.414 shipped it (the formatter never invents a fact the caller didn't hand it), the banner wears the census chip ('via N suppliers', the sky family, only when earned) beside the item count, the copy button's title tells the truth about the blocks, and the new suite caught the char-splitting spread before it ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's thirty-second generation)\n`;

if (src.includes("the cascade's thirty-second generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's thirty-first generation")) {
  const anchorLine = src.indexOf('    // v2.420.0: the shelf remembers its supplier');
  if (anchorLine < 0) { console.error('FAIL: the v2.420.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.420.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.421.0 nor the v2.420.0 history line found');
  process.exit(1);
}

writeFileSync(path, src);
console.log(`\n${writes} replacement(s) written.`);

const listTests = (dir) => {
  const acc = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) acc.push(...listTests(join(dir, e.name)));
    else if (/\.test\.ts$/.test(e.name)) acc.push(join(dir, e.name));
  }
  return acc;
};

// ── the count web ────────────────────────────────────────────────────────
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(310)", "whatsNewUnreadCount('2.110.0')).toBe(311)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(311)", "whatsNewUnreadCount('2.109.0')).toBe(312)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(312)", "whatsNewUnreadCount('2.108.0')).toBe(313)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(343)", "whatsNewUnreadCount('2.77.0')).toBe(344)"],
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
  text = text.split("toBe('2.420.0')").join("toBe('2.421.0')");
  text = text.split('toContain("version: \'2.420.0\'")').join('toContain("version: \'2.421.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.420.0')").length - 1) + (before.split('toContain("version: \'2.420.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
