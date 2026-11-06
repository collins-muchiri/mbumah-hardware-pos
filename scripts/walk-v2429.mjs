#!/usr/bin/env node
// walk-v2429.mjs — v2.429.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.429.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.428.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's fortieth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (318/319/320/351 → 319/320/321/352) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.428.0') → toBe('2.429.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2429.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.429.0: the follow-up answers the toast — the shortfall's echo names the last receipt: the drill's follow-up pill grew the echo (receiveShortfallEcho — "named by the last receipt", the honest gate mirrors the pointer's own: a null, a zero, or a number that is not one reads the null — never a fake echo, never an echo on a full receipt), the callback crosses the close (the ReceiveItemsDialog's additive + optional onShortSubmit hands the drill the receipt's own truth — the short units when the pointer speaks, the honest null when the receipt was full — the echo belongs to the short receipt alone, and the drill's close ends the arc, a reopened drill starts honest), and the paint deepens (the ring-2 sky-400 echo ring over the plain census ring, the echo line's byte-identical sky family one home with the pointer's words), and the new suite's 12 pins caught the honest silences before they ever shipped (the echo speaks NO units — the pill's own words carry them — the entry joins the feed — +1 on every unread anchor, the cascade's fortieth generation)\n`;

if (src.includes("the cascade's fortieth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's thirty-ninth generation")) {
  const anchorLine = src.indexOf('    // v2.428.0: the toast points at the follow-up');
  if (anchorLine < 0) { console.error('FAIL: the v2.428.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.428.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.429.0 nor the v2.428.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(318)", "whatsNewUnreadCount('2.110.0')).toBe(319)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(319)", "whatsNewUnreadCount('2.109.0')).toBe(320)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(320)", "whatsNewUnreadCount('2.108.0')).toBe(321)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(351)", "whatsNewUnreadCount('2.77.0')).toBe(352)"],
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
  text = text.split("toBe('2.428.0')").join("toBe('2.429.0')");
  text = text.split('toContain("version: \'2.428.0\'")').join('toContain("version: \'2.429.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.428.0')").length - 1) + (before.split('toContain("version: \'2.428.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
