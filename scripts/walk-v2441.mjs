#!/usr/bin/env node
// walk-v2441.mjs — v2.441.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.441.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.440.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's fifty-second generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (330/331/332/363 → 331/332/333/364) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.440.0') → toBe('2.441.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2441.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (export-withdrawn-card-v2441.test.ts) pins only sealed bytes — the
// card's zinc voice, the grid's five seats, the stylesheet's stagger rung,
// the wire's fourth key — and no living toBe('2.440.0') literal anywhere
// in it (version prose lives in comments, not pins), so the web's blind
// split/join cannot re-key a word the next treadmill will own.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.441.0: the withdrawn count takes its own card — the exports grid wears the whole census: v2.440.0 grew the stats contract the fourth key (cancelledExports) and taught the Total Exports trend line three segments, but the count rode a trend line — a census without a home; the fifth glass card takes the census (the zinc voice — the table's Cancelled badge family — and the Ban icon, the withdrawn face), seated beside Total Exports (the census pair), the Total Exports trend reads "N completed · M failed" again (one number, one home — the rich-trend node retires with the hand-over), the card's trend line speaks both states honestly (withdrawn before completion — never a file; the honest zero — stuck exports retire here), and the grid wears five cards (grid-cols-2 md:grid-cols-5, the skeleton matching, the stagger-5 delay landing the fifth card on beat — the cascade's fifty-second generation)\n`;

if (src.includes("the cascade's fifty-second generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's fifty-first generation")) {
  const anchorLine = src.indexOf('    // v2.440.0: the census learns the withdrawn word');
  if (anchorLine < 0) { console.error('FAIL: the v2.440.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.440.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.441.0 nor the v2.440.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(330)", "whatsNewUnreadCount('2.110.0')).toBe(331)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(331)", "whatsNewUnreadCount('2.109.0')).toBe(332)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(332)", "whatsNewUnreadCount('2.108.0')).toBe(333)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(363)", "whatsNewUnreadCount('2.77.0')).toBe(364)"],
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
  text = text.split("toBe('2.440.0')").join("toBe('2.441.0')");
  text = text.split('toContain("version: \'2.440.0\'")').join('toContain("version: \'2.441.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.440.0')").length - 1) + (before.split('toContain("version: \'2.440.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
