#!/usr/bin/env node
// walk-v2457.mjs — v2.457.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.457.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.456.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's sixty-eighth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (346/347/348/379 → 347/348/349/380) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.456.0') → toBe('2.457.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2457.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (goal-tints-v2457.test.ts) pins only sealed bytes — the loom's tint
// registry rows, the desks' rides, the once-only masquerade walk (which
// walks src code only, never src/tests), the word-map pins and the
// sky-absence walk — and no living toBe('2.456.0') literal anywhere in it
// (version prose lives in comments, not pins). THE WORD-FREE LAW also
// holds (the suite names no address-bar token).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.457.0: the loom learns the tints — the goal chips ride one registry: the elder loom's third weave — the goal chips (the HR performance desk's filter row, its park-or-reopen switch, and the self-service portal's My-goals row) had carried the badge-family palette in THREE hand-copied Record constants, and the copies had drifted (the portal's OPEN chip still wore the old sky pressed-state the console's v2.306.0 one-colour law retired — the same word wore a second colour one bundle away); the tints moved to ONE home in the loom (CHIP_TINT_ACTIVE / CHIP_TINT_IDLE — amber, emerald, rose, slate, the transparent idle face tone-independent as all three desks already shared it) and the desks keep only their WORDS (the GOAL_TONE maps — which status wears which family, never the wardrobe bytes); the slim head (px-2.5 py-0.5, transition-colors) joined the loom's head family beside the regular and compact faces; the goal chips gained the family's zinc keyboard ring (the live DOM probe read zero rings before the weave) while the pressed voice rides every loomed chip; the review chips' dialect and the customers desk's emerald dialect stay hand-rolled (the ledger's remaining map) — the cascade's sixty-eighth generation\n`;

if (src.includes("the cascade's sixty-eighth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's sixty-seventh generation")) {
  const anchorLine = src.indexOf("    // v2.456.0: the loom learns the tones");
  if (anchorLine < 0) { console.error('FAIL: the v2.456.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.456.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.457.0 nor the v2.456.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(346)", "whatsNewUnreadCount('2.110.0')).toBe(347)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(347)", "whatsNewUnreadCount('2.109.0')).toBe(348)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(348)", "whatsNewUnreadCount('2.108.0')).toBe(349)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(379)", "whatsNewUnreadCount('2.77.0')).toBe(380)"],
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
  text = text.split("toBe('2.456.0')").join("toBe('2.457.0')");
  text = text.split('toContain("version: \'2.456.0\'")').join('toContain("version: \'2.457.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.456.0')").length - 1) + (before.split('toContain("version: \'2.456.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
