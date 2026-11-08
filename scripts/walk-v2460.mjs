#!/usr/bin/env node
// walk-v2460.mjs — v2.460.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is WRITTEN — the Write tool, a full authored
// file — never derived by slicing the previous round's script; the v2458
// derivation incident doubled a prefix and silenced a web, and this law
// exists so that never happens again). Guarded and idempotent — a second
// run answers 0 replacements.
//
//   1. the history line (the v2.460.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.459.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's seventy-first generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (349/350/351/382 → 350/351/352/383) across EVERY suite that pins
//      them — each pattern is version-qualified so the +1 steps can
//      never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.459.0') → toBe('2.460.0') + the feed-announcement pin).
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2460.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new
// suites (attestation-museum-v2460.test.ts, data-color-loom-v2460.test.ts)
// pin only sealed bytes — the shelf's museum labels, the registry's
// exported constants, the tribes' rides, the class-context taken-seat
// probes (which walk className lines only) — and no living toBe('2.459.0')
// literal anywhere in them (the historical v2.22.0/v2.351.0/v2.352.0/
// v2.397.0 words are sealed museum labels, never living pins).
// THE WORD-FREE LAW also holds (the suites name no address-bar token).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.460.0: the attestations come home — the data-colored chips learn the grammar: two comings-home in one round — THE MUSEUM SHELF (the verify-v2-* pin unwind, Task 27's last named follow-up): the 347 point-in-time attestation scripts took scripts/release-attestations/ byte-untouched (git-mv renames), the 310 verify:v2-* keys left package.json, the 86 living key-pins left the suites (nine emptied it() blocks retired with honor — the aggregate truth re-homes in attestation-museum-v2460.test.ts), 19 shelf-path reads and the docs line re-keyed, and the census caught two mis-aged exhibits (the file wired as 307 speaks v2.351.0 — the audit-remediation gate whose wiring key was the PR number, the bytes the release; the file wired as 351 speaks v2.352.0) and re-homed both by their true ages; THE SHELF CENSUS — verify-ancestors reads the shelf byte-wise (a museum piece is read, never run): every attestation must speak its own v2.X.Y age-word, the era-proof word both header conventions carry, decay exits 1; THE DATA-COLORED TRIBES — the ledger's last two rows taken: the POS and inventory category chips (per-row inline colors, never a named tint) learned the family's grammar — aria-pressed and the zinc ring through the EXPORTED CHIP_RING_ZINC / CHIP_ACTIVE / CHIP_IDLE constants (one home, many hands); THE MASQUERADE RETIRES — .chip-active inlined its own face (scale-105 + the oklch wash) and left globals.css (a motion utility stays; a vocabulary masquerade may not); THE SCALE DIALECT RETIRES — the inventory tags ride the family head (border, no grow) and the strip's arrows wear honest glyphs (ChevronLeft / ChevronRight) instead of a rotated ChevronDown; the LEDGER IS EMPTY — every chip in src rides the loom's bytes or the loom's constants — the cascade's seventy-first generation\n`;

if (src.includes("the cascade's seventy-first generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's seventieth generation")) {
  const anchorLine = src.indexOf("    // v2.459.0: the customers ride the loom");
  if (anchorLine < 0) { console.error('FAIL: the v2.459.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.459.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.460.0 nor the v2.459.0 history line found');
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
// (the v2459 walk moved the anchors to 349/350/351/382; the FROM side
// below is idempotent — a second run answers 0)
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(349)", "whatsNewUnreadCount('2.110.0')).toBe(350)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(350)", "whatsNewUnreadCount('2.109.0')).toBe(351)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(351)", "whatsNewUnreadCount('2.108.0')).toBe(352)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(382)", "whatsNewUnreadCount('2.77.0')).toBe(383)"],
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
  text = text.split("toBe('2.459.0')").join("toBe('2.460.0')");
  text = text.split('toContain("version: \'2.459.0\'")').join('toContain("version: \'2.460.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.459.0')").length - 1) + (before.split('toContain("version: \'2.459.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
