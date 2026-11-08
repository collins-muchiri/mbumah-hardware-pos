#!/usr/bin/env node
// walk-v2455.mjs — v2.455.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is written fresh, guarded, and idempotent —
// a second run answers 0 replacements).
//
//   1. the history line (the v2.455.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.454.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's sixty-sixth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (344/345/346/377 → 345/346/347/378) across EVERY suite that pins
//      them or pins the counter's own bytes — each pattern is
//      version-qualified so the +1 steps can never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.454.0') → toBe('2.455.0') + the feed-announcement pin)
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2454.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new suite
// (chip-loom-v2455.test.ts) pins only sealed bytes — the loom's wardrobe
// constants, the six faces' rides, the once-only census (which walks code
// only, never src/tests), the ledger's named dialects and the elder violet
// pin — and no living toBe('2.454.0') literal anywhere in it (version prose
// lives in comments, not pins). THE WORD-FREE LAW also holds (the census
// tokens AND the txn-type-census handle are assembled from fragments, so
// the file never carries a forbidden literal).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.455.0: the elder loom's first weave — every lens chip speaks its pressed state: the carry that has stood since v2.397.0 took its first weave — the ELDER lens chips (the pill filters that predate the deep-link era; the landing chips loomed in v2.394.0 while these stayed hand-rolled) met ONE wardrobe component (src/components/filter-chip.tsx): the muted/50 family's head, its primary active face, its muted idle face, the compact py-1 face, the pressed voice (aria-pressed — the debt-plans desk's own precedent) and the family's zinc keyboard ring on the faces that never wore one, while the payment chips kept their signature v2.333 violet through the loom's opt-out (focusRing=\"none\" — two ring colours in one class list would resolve in the stylesheet's order, not the attribute's, and the loom refuses that coin flip); SIX faces in TWO desks migrated (the transactions desk's date presets, payment quick chips, type census and amount toggle; the reports desk's date presets and chart-type chips) and the desks speak no wardrobe byte (the masquerade law, loom form — the palette strings live in exactly one src file, the POS idle string the one named rider); the LEDGER names the remaining dialects for the next weaves (inventory's scale chips, the customers desk's emerald chips, the POS gradient chips, the HR goal chips, the registry-color chips) — the cascade's sixty-sixth generation\n`;

if (src.includes("the cascade's sixty-sixth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's sixty-fifth generation")) {
  const anchorLine = src.indexOf('    // v2.454.0: the debt voices reconcile');
  if (anchorLine < 0) { console.error('FAIL: the v2.454.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.454.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.455.0 nor the v2.454.0 history line found');
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
  ["whatsNewUnreadCount('2.110.0')).toBe(344)", "whatsNewUnreadCount('2.110.0')).toBe(345)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(345)", "whatsNewUnreadCount('2.109.0')).toBe(346)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(346)", "whatsNewUnreadCount('2.108.0')).toBe(347)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(377)", "whatsNewUnreadCount('2.77.0')).toBe(378)"],
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
  text = text.split("toBe('2.454.0')").join("toBe('2.455.0')");
  text = text.split('toContain("version: \'2.454.0\'")').join('toContain("version: \'2.455.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.454.0')").length - 1) + (before.split('toContain("version: \'2.454.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
