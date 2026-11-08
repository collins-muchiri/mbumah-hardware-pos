#!/usr/bin/env node
// walk-v2458.mjs — v2.458.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements). WRITTEN FRESH BY HAND after the
// v2457-template python-slicing incident doubled the HISTORY prefix —
// the BY WRITE law exists precisely so each round's codemod is authored,
// never derived.
//
//   1. the history line (the v2.458.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.457.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's sixty-ninth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (347/348/349/380 → 348/349/350/381) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.457.0') → toBe('2.458.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2458.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (review-tints-v2458.test.ts) pins only sealed bytes — the loom's sky
// row, the desks' rides, the once-only masquerade walk (which walks src
// code only, never src/tests), the word-map pins and the stray-walk —
// and no living toBe('2.457.0') literal anywhere in it (version prose
// lives in comments, not pins). THE WORD-FREE LAW also holds (the suite
// names no address-bar token).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.458.0: the review chips ride the registry — sky joins the tints: the elder loom's fourth weave — the performance desk's review-status filter row (the LAST hand-rolled speaker of the transparent tint idle in the desk) retired its STATUS_CHIP_ACTIVE Record and rides the loom's TINT registry; SKY joined the closed registry for the ACKNOWLEDGED word (the review table pill's own law aligned it family-wide — the filter row's hand-copy matched byte-for-byte, so the move is faithful), and the registry's shape is FIVE tones (amber, emerald, rose, slate, sky); the row's named AMBER RING voice (the review deep-link family's own keyboard ring since v2.286.0) rode the desk's className byte-preserved with focusRing="none" — the loom emits no competing zinc ring (the live DOM probe read amberRing: 6, zincRing: 0 before the weave); the desk keeps its WORDS (STATUS_TONE: DRAFT slate, SUBMITTED amber, ACKNOWLEDGED sky, CALIBRATED emerald) and the whole desk now speaks three FilterChip tint rows (goal filter slim, goal edit compact, review filter slim); the v2.455.0 ledger's fourth row exits — the taken seat is pinned by its own dated re-key, and the named remainder is the customers desk's emerald dialect alone — the cascade's sixty-ninth generation\n`;

if (src.includes("the cascade's sixty-ninth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's sixty-eighth generation")) {
  const anchorLine = src.indexOf("    // v2.457.0: the loom learns the tints");
  if (anchorLine < 0) { console.error('FAIL: the v2.457.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.457.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.458.0 nor the v2.457.0 history line found');
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
// (the v2457 walk already moved the anchors to 348/349/350/381 when it
// ran earlier this round; the FROM side below is idempotent — a second
// run answers 0)
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(347)", "whatsNewUnreadCount('2.110.0')).toBe(348)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(348)", "whatsNewUnreadCount('2.109.0')).toBe(349)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(349)", "whatsNewUnreadCount('2.108.0')).toBe(350)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(380)", "whatsNewUnreadCount('2.77.0')).toBe(381)"],
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
  text = text.split("toBe('2.457.0')").join("toBe('2.458.0')");
  text = text.split('toContain("version: \'2.457.0\'")').join('toContain("version: \'2.458.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.457.0')").length - 1) + (before.split('toContain("version: \'2.457.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
