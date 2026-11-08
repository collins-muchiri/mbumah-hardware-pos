#!/usr/bin/env node
// walk-v2459.mjs — v2.459.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is WRITTEN — the Write tool, a full authored
// file — never derived by slicing the previous round's script; the v2458
// derivation incident doubled a prefix and silenced a web, and this law
// exists so that never happens again). Guarded and idempotent — a second
// run answers 0 replacements.
//
//   1. the history line (the v2.459.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.458.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's seventieth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (348/349/350/381 → 349/350/351/382) across EVERY suite that pins
//      them — each pattern is version-qualified so the +1 steps can
//      never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.458.0') → toBe('2.459.0') + the feed-announcement pin).
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2459.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (customer-tints-v2459.test.ts) pins only sealed bytes — the loom's glass
// export, the registry's emerald row, the desks' rides, the once-only
// masquerade walks (which walk src code only, never src/tests) and the
// elder suites' dated re-key comments — and no living toBe('2.458.0')
// literal anywhere in it (version prose lives in comments, not pins).
// THE WORD-FREE LAW also holds (the suite names no address-bar token).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.459.0: the customers ride the loom — the glass idle joins the tints: the elder loom's fifth weave — the customers desk's four quick chips (All / Active / With Debt / Loyalty Members), the ledger's LAST named tint dialect, retired their hand-rolled button and ride the loom's TINT registry with the emerald tone; THE GLASS IDLE — the desk's historic glassy backdrop voice (bg-white/60 … dark:bg-white/5, made for the customers card's gradient face where the transparent tint idle would show the card straight through) joined the loom byte-exact as CHIP_TINT_IDLE_GLASS through the glass prop (a desk's backdrop is its own voice — the slim-head precedent); THE NAMED UNIFICATION (the shadow-sm precedent, second verse) — the hand-copy's drifted emerald (text-700, dark 900/30, -400/-700) retired for the registry byte (-800, 950/40, -200/-900 — the ACHIEVED goal chip's own face), and the desk speaks no emerald lens byte at all (its voucher type-BADGE keeps its own wash — a badge voice, never a lens face); THE PRESSED VOICE AND THE FAMILY'S ZINC RING arrived — neither chip spoke aria-pressed nor wore a ring before, and the completion is family-wide; the four per-color count badges (emerald/cyan/amber/purple) stay the desk's own children, and the hand-rolled tint dialect count across src is now ZERO — the cascade's seventieth generation\n`;

if (src.includes("the cascade's seventieth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's sixty-ninth generation")) {
  const anchorLine = src.indexOf("    // v2.458.0: the review chips ride the registry");
  if (anchorLine < 0) { console.error('FAIL: the v2.458.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.458.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.459.0 nor the v2.458.0 history line found');
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
// (the v2458 walk moved the anchors to 348/349/350/381; the FROM side
// below is idempotent — a second run answers 0)
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(348)", "whatsNewUnreadCount('2.110.0')).toBe(349)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(349)", "whatsNewUnreadCount('2.109.0')).toBe(350)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(350)", "whatsNewUnreadCount('2.108.0')).toBe(351)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(381)", "whatsNewUnreadCount('2.77.0')).toBe(382)"],
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
  text = text.split("toBe('2.458.0')").join("toBe('2.459.0')");
  text = text.split('toContain("version: \'2.458.0\'")').join('toContain("version: \'2.459.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.458.0')").length - 1) + (before.split('toContain("version: \'2.458.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
