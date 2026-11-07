#!/usr/bin/env node
// walk-v2442.mjs — v2.442.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.442.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.441.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's fifty-third generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (331/332/333/364 → 332/333/334/365) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.441.0') → toBe('2.442.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2442.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (export-dark-voice-bytype-v2442.test.ts) pins only sealed bytes — the
// trendClass voices, the route's split, the api type, the section seats —
// and no living toBe('2.441.0') literal anywhere in it (version prose
// lives in comments, not pins), so the web's blind split/join cannot
// re-key a word the next treadmill will own.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.442.0: the trends find their dark voice — the by-type census lands: v2.441.0's tail named the small verse (the honest-zero trend had no dark-mode-specific face) and the carried verse finally took its seat (the byType aggregate was computed, typed, and rendered nowhere); every stat card's trend line speaks its own family — light 600, dark 400 (the badges' dark-pair grammar) — through the trendClass field (the muted-foreground default the fallback law), the plans and schedule dashes wear the same grammar (the mirror law) and their trend lines gain the native title hover; the stats wire's byType entries grow the cancelled field (count INCLUDES the withdrawn rows — the honest inclusion) and the exports desk grows the By Type table (runs, records, the withdrawn split in the zinc voice — the Cancelled badge family — loudest-first, the empty state rendering no table) — the cascade's fifty-third generation\n`;

if (src.includes("the cascade's fifty-third generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's fifty-second generation")) {
  const anchorLine = src.indexOf('    // v2.441.0: the withdrawn count takes its own card');
  if (anchorLine < 0) { console.error('FAIL: the v2.441.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.441.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.442.0 nor the v2.441.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(331)", "whatsNewUnreadCount('2.110.0')).toBe(332)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(332)", "whatsNewUnreadCount('2.109.0')).toBe(333)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(333)", "whatsNewUnreadCount('2.108.0')).toBe(334)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(364)", "whatsNewUnreadCount('2.77.0')).toBe(365)"],
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
  text = text.split("toBe('2.441.0')").join("toBe('2.442.0')");
  text = text.split('toContain("version: \'2.441.0\'")').join('toContain("version: \'2.442.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.441.0')").length - 1) + (before.split('toContain("version: \'2.441.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
