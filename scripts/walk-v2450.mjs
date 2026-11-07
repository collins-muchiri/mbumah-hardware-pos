#!/usr/bin/env node
// walk-v2450.mjs — v2.450.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.450.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.449.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's sixty-first generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (339/340/341/372 → 340/341/342/373) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.449.0') → toBe('2.450.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2450.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (money-sort-v2450.test.ts) pins only sealed bytes — the coercion at the
// comparator, the naming comment, the wardrobe's verbatim seats — and no
// living toBe('2.449.0') literal anywhere in it (version prose lives in
// comments, not pins), so the web's blind split/join cannot re-key a word
// the next treadmill owns. THE WORD-FREE LAW also holds.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.450.0: the money sort — the debt desk's loudest read tells the truth: a live QA probe caught the customers desk's debt sort LYING (the wardrobe round's honest probe proved the aria flip while the order refused to be numeric — 0, 0, 120000, 15000, 250000 as the "ascending" walk): balances arrive as DECIMAL-AS-STRING (the contract says number — the Kenya Plumbing Co. law that contract types don't enforce runtime) and string vs string compares LEXICOGRAPHICALLY ("120000" sorts before "15000"), so the loudest-debtor read put 5,000 above 45,000; the comparator now COERCES at the one seat the desk owns (Number(a.currentDebtBalance) — and loyaltyPoints with it, the same incident class) — the debt filters and the credit-envelope meter already coerced correctly (number-literal comparisons and division), the wardrobe's bytes keep their exact seats, and the ascending walk and the loudest-debtor read are honest for every balance — the cascade's sixty-first generation\n`;

if (src.includes("the cascade's sixty-first generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's sixtieth generation")) {
  const anchorLine = src.indexOf('    // v2.449.0: the debt desk wears');
  if (anchorLine < 0) { console.error('FAIL: the v2.449.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.449.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.450.0 nor the v2.449.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(339)", "whatsNewUnreadCount('2.110.0')).toBe(340)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(340)", "whatsNewUnreadCount('2.109.0')).toBe(341)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(341)", "whatsNewUnreadCount('2.108.0')).toBe(342)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(372)", "whatsNewUnreadCount('2.77.0')).toBe(373)"],
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
  text = text.split("toBe('2.449.0')").join("toBe('2.450.0')");
  text = text.split('toContain("version: \'2.449.0\'")').join('toContain("version: \'2.450.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.449.0')").length - 1) + (before.split('toContain("version: \'2.449.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
