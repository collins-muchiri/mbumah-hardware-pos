#!/usr/bin/env node
// walk-v2451.mjs — v2.451.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.451.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.450.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's sixty-second generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (340/341/342/373 → 341/342/343/374) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.450.0') → toBe('2.451.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2451.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (money-sort-sweep-v2451.test.ts) pins only sealed bytes — the four
// coercion seats, the safe patterns (the margin's arithmetic, the
// leaderboard's computed metrics, the identifier sorts' lexical law) —
// and no living toBe('2.450.0') literal anywhere in it (version prose
// lives in comments, not pins). THE WORD-FREE LAW also holds.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.451.0: the money-sort sweep — every desk's comparator tells the truth: the customers desk confessed in v2.450.0 and this round the sweep greps every generic aVal-comparator for the same string/string lie — and finds TWO more desks lying (the invoice register's total-amount read and the inventory desk's price, cost and stock reads — quantityInStock is a DECIMAL column in the schema, NOT an integer, so all four seats received Decimal-as-string and compared LEXICOGRAPHICALLY, "120000" before "15000"); all four seats now COERCE at the comparator (the one seat each desk owns — the v2.12.5 cost-hidden coalesce keeps its seat inside the coercion) so the biggest invoice, the priciest shelf and the fullest stock read honestly; the SAFE patterns are pinned as positive controls (the profit margin's arithmetic — subtraction and division coerce — the supplier leaderboard's computed metrics — reduce with arithmetic, numbers before the comparator — and the identifier sorts' lexical-by-design law) — the cascade's sixty-second generation\n`;

if (src.includes("the cascade's sixty-second generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's sixty-first generation")) {
  const anchorLine = src.indexOf('    // v2.450.0: the money sort');
  if (anchorLine < 0) { console.error('FAIL: the v2.450.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.450.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.451.0 nor the v2.450.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(340)", "whatsNewUnreadCount('2.110.0')).toBe(341)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(341)", "whatsNewUnreadCount('2.109.0')).toBe(342)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(342)", "whatsNewUnreadCount('2.108.0')).toBe(343)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(373)", "whatsNewUnreadCount('2.77.0')).toBe(374)"],
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
  text = text.split("toBe('2.450.0')").join("toBe('2.451.0')");
  text = text.split('toContain("version: \'2.450.0\'")').join('toContain("version: \'2.451.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.450.0')").length - 1) + (before.split('toContain("version: \'2.450.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
