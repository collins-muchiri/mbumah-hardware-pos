#!/usr/bin/env node
// walk-v2461.mjs — v2.461.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is WRITTEN — the Write tool, a full authored
// file — never derived by slicing the previous round's script; the v2458
// derivation incident doubled a prefix and silenced a web, and this law
// exists so that never happens again). Guarded and idempotent — a second
// run answers 0 replacements.
//
//   1. the history line (the v2.461.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.460.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's seventy-second generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (350/351/352/383 → 351/352/353/384) across EVERY suite that pins
//      them — each pattern is version-qualified so the +1 steps can
//      never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.460.0') → toBe('2.461.0') + the feed-announcement pin).
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2461.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new
// suites (dead-stock-v2461.test.ts) pin only sealed bytes — the
// classifier's math, the route/tab/api bytes, the vocabulary, the loom's
// word-free law — and no living toBe('2.460.0') literal anywhere in
// them (the historical v2.205.0/v2.206.0 words are sealed museum
// labels, never living pins). The re-keyed rep-type-deep-link suite
// carries its version assert through the deep-link family's OWN
// describe (v2.384.0's home), which the story-handover re-keys after.
// THE WORD-FREE LAW also holds for the loom (the suites may speak the
// reports desk's own address-bar word — the word's home is the
// vocabulary and its deep-link suite, not the wardrobe).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.461.0: the dead stock speaks — the reports desk counts what rests: the NINTH report type joins the desk — Dead Stock: every product HOLDING stock with no sale in the idle window (30 | 60 | 90, the lens's own tuple; a made-up window is a 400, default 90) or never sold at all; the MEANING lives in one home (src/lib/reports/dead-stock.ts, the pure classifier the suite proves without a database — an empty shelf is NOT dead stock, no capital rests in it; a null last-sold speaks "never", never a fabricated zero; rows sort capital-tied DESC with the name tiebreak; the honest share guards the zero total, the v2.205.0 law); the wire gathers the facts (the fast-moving sale vocabulary: SALE / COMPLETED / PARTIAL) and the payload rides rows — the NAMING AS CONTRACT law honored again (products/items/data array keys banned at source, the summary survives the trip); the Report Type grid completes its three-by-three (the ninth card, Hourglass), the window lens rides the filter-chip loom (the amber tint word — aria-pressed and the zinc ring come with the family, never hand-rolled), the ledger speaks each row's last sale or the honest never-sold badge with the idle days aged by colour (rose past 180, amber below), the CSV file carries the section's own rows client-side (the server export door is never borrowed for a report it cannot speak), and ?rep-type=dead_stock lands the report through the ONE home (REP_TYPE_FILTERS speaks nine, the deep-link suite re-keyed with the dated note) — the cascade's seventy-second generation\n`;

if (src.includes("the cascade's seventy-second generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's seventy-first generation")) {
  const anchorLine = src.indexOf("    // v2.460.0: the attestations come home");
  if (anchorLine < 0) { console.error('FAIL: the v2.460.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.460.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.461.0 nor the v2.460.0 history line found');
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
// (the v2460 walk moved the anchors to 350/351/352/383; the FROM side
// below is idempotent — a second run answers 0)
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(350)", "whatsNewUnreadCount('2.110.0')).toBe(351)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(351)", "whatsNewUnreadCount('2.109.0')).toBe(352)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(352)", "whatsNewUnreadCount('2.108.0')).toBe(353)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(383)", "whatsNewUnreadCount('2.77.0')).toBe(384)"],
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
  text = text.split("toBe('2.460.0')").join("toBe('2.461.0')");
  text = text.split('toContain("version: \'2.460.0\'")').join('toContain("version: \'2.461.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.460.0')").length - 1) + (before.split('toContain("version: \'2.460.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
