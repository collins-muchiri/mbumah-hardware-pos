#!/usr/bin/env node
// walk-v2456.mjs — v2.456.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.456.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.455.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's sixty-seventh generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (345/346/347/378 → 346/347/348/379) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.455.0') → toBe('2.456.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2456.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (chip-tones-v2456.test.ts) pins only sealed bytes — the loom's tone
// registry rows, the desks' rides, the once-only masquerade walk (which
// walks src code only, never src/tests), the badge census and the
// fallback guard — and no living toBe('2.455.0') literal anywhere in it
// (version prose lives in comments, not pins). THE WORD-FREE LAW also
// holds (the suite names no address-bar token — the TYPE row's testid
// token was kept OUT of it on purpose; the file census admits no new
// speaker).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.456.0: the loom learns the tones — every status lens rides one palette: the elder loom's second weave — the two registry-driven status lenses (the debt-plans desk's status filter and the exports history's status filter) had carried the SAME color palette in TWO hand-copied Record constants; the palette moved to ONE home in the loom (CHIP_TONE_ACTIVE / CHIP_TONE_IDLE — emerald, green, rose, amber, zinc, the dark: variants riding the idle faces exactly as the desks kept them) and the desks speak no wardrobe byte (the masquerade law, loom form); the shadow unification was the weave's one named, deliberate improvement (the debt-plans active face carried shadow-sm, the exports face stood flat, and the family's own primary active face already lifts — the shadow rides every tone now); the exports history's status chips GAINED the pressed voice (aria-pressed — the debt-plans desk already spoke it) and both lenses gained the family's zinc keyboard ring, while the count badges' byte-identical wardrobe moved into the FilterChipCount companion; the TYPE row's slate dialect stays hand-rolled (the ledger's remaining map) — the cascade's sixty-seventh generation\n`;

if (src.includes("the cascade's sixty-seventh generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's sixty-sixth generation")) {
  const anchorLine = src.indexOf("    // v2.455.0: the elder loom's first weave");
  if (anchorLine < 0) { console.error('FAIL: the v2.455.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.455.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.456.0 nor the v2.455.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(345)", "whatsNewUnreadCount('2.110.0')).toBe(346)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(346)", "whatsNewUnreadCount('2.109.0')).toBe(347)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(347)", "whatsNewUnreadCount('2.108.0')).toBe(348)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(378)", "whatsNewUnreadCount('2.77.0')).toBe(379)"],
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
  text = text.split("toBe('2.455.0')").join("toBe('2.456.0')");
  text = text.split('toContain("version: \'2.455.0\'")').join('toContain("version: \'2.456.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.455.0')").length - 1) + (before.split('toContain("version: \'2.455.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
