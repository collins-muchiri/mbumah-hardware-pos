#!/usr/bin/env node
// walk-v2416.mjs — v2.416.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.416.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.415.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's twenty-seventh generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (305/306/307/338 → 306/307/308/339) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.415.0') → toBe('2.416.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2416.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.416.0: the order's handover — the banner's pair grows its third face: Send (testid inv-order-send) folds the same order rows into a sessionStorage pocket (buildOrderHandoff — the reorder gap is the ask, the nothing-to-order law defends the fold too) and walks the shell to the purchase-order desk, whose create dialog opens with the carried rows pre-picked (mapOrderHandoffToPoItems — a sku the shelf no longer knows is dropped and COUNTED, a cost the gate hides leaves the pen empty) under an amber carriage strip that speaks lines, units and the honest drop; the pocket is one-way (consumed once at mount, a manual New PO never inherits a birth by accident — the ?restockFrom= door's own law) (the entry joins the feed — +1 on every unread anchor, the cascade's twenty-seventh generation)\n`;

if (src.includes("the cascade's twenty-seventh generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's twenty-sixth generation")) {
  const anchorLine = src.indexOf("    // v2.415.0: the order file leaves the desk");
  if (anchorLine < 0) { console.error('FAIL: the v2.415.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.415.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.416.0 nor the v2.415.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(305)", "whatsNewUnreadCount('2.110.0')).toBe(306)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(306)", "whatsNewUnreadCount('2.109.0')).toBe(307)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(307)", "whatsNewUnreadCount('2.108.0')).toBe(308)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(338)", "whatsNewUnreadCount('2.77.0')).toBe(339)"],
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
  text = text.split("toBe('2.415.0')").join("toBe('2.416.0')");
  text = text.split('toContain("version: \'2.415.0\'")').join('toContain("version: \'2.416.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.415.0')").length - 1) + (before.split('toContain("version: \'2.415.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
