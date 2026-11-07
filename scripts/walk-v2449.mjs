#!/usr/bin/env node
// walk-v2449.mjs — v2.449.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.449.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.448.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's sixtieth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (338/339/340/371 → 339/340/341/372) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.448.0') → toBe('2.449.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2449.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (sort-wardrobe-v2449.test.ts) pins only sealed bytes — the handles'
// wardrobe, the desk's own two-press law, the determinism tiebreak — and
// no living toBe('2.448.0') literal anywhere in it (version prose lives in
// comments, not pins), so the web's blind split/join cannot re-key a word
// the next treadmill owns. THE WORD-FREE LAW also holds: the suite speaks
// no lens word, so no vocabulary census ever has to admit it.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.449.0: the debt desk wears the family's wardrobe — the customers' sort handles learn the census's grammar: four rounds taught the census and the history the sort grammar and this round the CUSTOMERS DESK's three handles (Customer, Debt Balance, Loyalty) learn it (aria-sort comes to the desk that had NONE — ascending or descending on the speaking column, silence on the rest; the active voice reads SEMIBOLD under a lit arrow — up for ascending, down for descending, the always-on rotated ArrowUpDown retired; the waiting ChevronsUpDown appears on hover/focus and the zinc focus-visible ring carries the keyboard; both aria-label voices and titles speak the landing and the flip; QA gains testids on all three handles); the desk's own two-press law rides untouched — ONE sortField state means only one voice can speak at a time BY CONSTRUCTION (the exclusion is structural here, no retirements needed) and the sort's ties break by the customer's own name (the family's determinism law — return 0; is gone) — the cascade's sixtieth generation\n`;

if (src.includes("the cascade's sixtieth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's fifty-ninth generation")) {
  const anchorLine = src.indexOf('    // v2.448.0: the history\'s records voice');
  if (anchorLine < 0) { console.error('FAIL: the v2.448.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.448.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.449.0 nor the v2.448.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(338)", "whatsNewUnreadCount('2.110.0')).toBe(339)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(339)", "whatsNewUnreadCount('2.109.0')).toBe(340)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(340)", "whatsNewUnreadCount('2.108.0')).toBe(341)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(371)", "whatsNewUnreadCount('2.77.0')).toBe(372)"],
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
  text = text.split("toBe('2.448.0')").join("toBe('2.449.0')");
  text = text.split('toContain("version: \'2.448.0\'")').join('toContain("version: \'2.449.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.448.0')").length - 1) + (before.split('toContain("version: \'2.448.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
