#!/usr/bin/env node
// walk-v2424.mjs — v2.424.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.424.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.423.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's thirty-fifth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (313/314/315/346 → 314/315/316/347) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.423.0') → toBe('2.424.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2424.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.424.0: the shelf answers its debt — the drill grows the reorder press: the sheet's footer wears the debt's own strip (the census speaks what the order would carry — "2 products owe 30 units to reorder") and the press ("Reorder this shelf") folds the owed rows into the SAME pocket the inventory banner uses (one envelope, the same one-way laws), closes the sheet, and walks to the PO desk — the create form opening with the rows pre-picked, the maker's pen dressed by the desk's own pre-pick law; the owed arithmetic reads restockNeedsAttention's own nothing-to-order law (an order line asking 0 units would be a lie with a checkbox), the id is the truth (a stale row never rides another supplier's order), and the honest faces hold (amber only when owed, emerald only when every row is healthy, the disabled press keeping its voice), and the new suite's pins caught the boundary split before it ever shipped (the entry joins the feed — +1 on every unread anchor, the cascade's thirty-fifth generation)\n`;

if (src.includes("the cascade's thirty-fifth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's thirty-fourth generation")) {
  const anchorLine = src.indexOf("    // v2.423.0: the supplier opens its shelf");
  if (anchorLine < 0) { console.error('FAIL: the v2.423.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.423.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.424.0 nor the v2.423.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(313)", "whatsNewUnreadCount('2.110.0')).toBe(314)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(314)", "whatsNewUnreadCount('2.109.0')).toBe(315)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(315)", "whatsNewUnreadCount('2.108.0')).toBe(316)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(346)", "whatsNewUnreadCount('2.77.0')).toBe(347)"],
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
  text = text.split("toBe('2.423.0')").join("toBe('2.424.0')");
  text = text.split('toContain("version: \'2.423.0\'")').join('toContain("version: \'2.424.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.423.0')").length - 1) + (before.split('toContain("version: \'2.423.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
