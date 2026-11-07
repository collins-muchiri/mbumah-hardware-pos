#!/usr/bin/env node
// walk-v2440.mjs — v2.440.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.440.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.439.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's fifty-first generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (329/330/331/362 → 330/331/332/363) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.439.0') → toBe('2.440.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2440.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (export-stats-cancelled-v2440.test.ts) pins only sealed bytes — the
// route's aggregate lines, the type's key seat, the card's zinc voice,
// the clarifier — and no living toBe('2.439.0') literal anywhere in it
// (the "v2.439.0 door's own census" prose is comment history, not a
// version pin), so the web's blind split/join cannot re-key a word the
// next treadmill will own.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.440.0: the census learns the withdrawn word — the exports stats speak every status they keep: v2.439.0 taught the desk to retire a stuck export but the stats contract never heard the news (totalExports / completedExports / failedExports only — the Total Exports card trend line read "10 completed · 2 failed" and the cancelled row vanished from the census), so cancelledExports joins the route's aggregate and the response contract (withdrawn before completion — the cancel door's own census), the honest denominator names its law (successRate = completed / (completed + failed) — cancelled rows excluded too, a withdrawn run never had a file, so it can be neither a success nor a failure), the Total Exports card's trend line speaks three segments (N completed · M failed · K cancelled — the cancelled segment wearing the zinc voice, the Cancelled badge family, through the new rich-trend node), and the Success Rate card names its own denominator (completed vs. failed runs, cancelled excluded — the cascade's fifty-first generation)\n`;

if (src.includes("the cascade's fifty-first generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's fiftieth generation")) {
  const anchorLine = src.indexOf('    // v2.439.0: the stuck row learns to bow out');
  if (anchorLine < 0) { console.error('FAIL: the v2.439.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.439.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.440.0 nor the v2.439.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(329)", "whatsNewUnreadCount('2.110.0')).toBe(330)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(330)", "whatsNewUnreadCount('2.109.0')).toBe(331)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(331)", "whatsNewUnreadCount('2.108.0')).toBe(332)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(362)", "whatsNewUnreadCount('2.77.0')).toBe(363)"],
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
  text = text.split("toBe('2.439.0')").join("toBe('2.440.0')");
  text = text.split('toContain("version: \'2.439.0\'")').join('toContain("version: \'2.440.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.439.0')").length - 1) + (before.split('toContain("version: \'2.439.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
