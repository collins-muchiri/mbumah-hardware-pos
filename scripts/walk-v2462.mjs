#!/usr/bin/env node
// walk-v2462.mjs — v2.462.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is WRITTEN — a full authored file, never
// derived by slicing the previous round's script). Guarded and idempotent
// — a second run answers 0 replacements.
//
//   1. the history line (the v2.462.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.461.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's seventy-third generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (351/352/353/384 → 352/353/354/385) across EVERY suite that pins
//      them — each pattern is version-qualified so the +1 steps can
//      never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.461.0') → toBe('2.462.0') + the feed-announcement pin).
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2462.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new
// suites (dead-window-deep-link-v2462.test.ts, dead-stock-voice-v2462.test.ts)
// pin only sealed bytes and CURRENT-round asserts born at toBe('2.461.0')
// (the head they were written against) — the version web moves them with
// the treadmill exactly as it moves the elders. No historical museum
// label anywhere in them.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.462.0: the resting ledger learns to share — the dead-stock window takes an address, the capital draws its shape, every row learns to ask: the NINTH report's three new faces land together — the idle window joins the deep-link family as its THIRTY-THIRD word (?dead-window=30|60|90 lands the lens already turned; the words are the window tuple's OWN spellings read through the generic parser from DEAD_STOCK_WINDOWS, the ONE home; a made-up window is an unknown word, the default is 90; the lens WRITES BACK — a hand-driven turn replaceState's the word into the address, the preserve law, so a turned lens is a shareable address; the landing chip wears the ROSE byte at 300/100 — the two-storey census was FULL, so the family grew one line rather than masquerade; the chip lives in the SECTION — the lens is inside the dead_stock stage, the sub-tab law's shape; the DEFAULT WEARS NO CHIP; navigation is never a lens change); the desk learns its chart (the Chart Type row covers the ninth report with the two honest faces — bar and pie of capital tied by category, grouped in the classifier's one home, line and area are time-series words categorical capital cannot wear, zero new fetches, the chart draws only when rows rest); and every row learns to ask (the Ask button carries a deterministic WhatsApp-ready clearance note to the clipboard — units and base unit, capital at cost, the ISO day, the never-sold row's honest absence; no supplier name invented; the clipboard is the door) — the cascade's seventy-third generation\n`;

if (src.includes("the cascade's seventy-third generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's seventy-second generation")) {
  const anchorLine = src.indexOf("    // v2.461.0: the dead stock speaks");
  if (anchorLine < 0) { console.error('FAIL: the v2.461.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.461.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.462.0 nor the v2.461.0 history line found');
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
// (the v2461 walk moved the anchors to 351/352/353/384; the FROM side
// below is idempotent — a second run answers 0)
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(351)", "whatsNewUnreadCount('2.110.0')).toBe(352)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(352)", "whatsNewUnreadCount('2.109.0')).toBe(353)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(353)", "whatsNewUnreadCount('2.108.0')).toBe(354)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(384)", "whatsNewUnreadCount('2.77.0')).toBe(385)"],
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

// ── the constitution-title web ───────────────────────────────────────────
// (the deep-link constitution's title byte is pinned by every elder
// suite's cross-suite section — the count web's sibling: the title's own
// +1 across EVERY suite that pins it)
const TITLE_FROM = "(thirty-two words, twenty-six desks)";
const TITLE_TO = "(thirty-three words, twenty-six desks)";
let tFiles = 0, tEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  text = text.split(TITLE_FROM).join(TITLE_TO);
  if (text !== before) {
    writeFileSync(file, text);
    tFiles++;
    tEdits += before.split(TITLE_FROM).length - 1;
  }
}
console.log(`constitution web: ${tEdits} title edit(s) across ${tFiles} file(s).`);

// ── the version web ──────────────────────────────────────────────────────
let vFiles = 0, vEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  text = text.split("toBe('2.461.0')").join("toBe('2.462.0')");
  text = text.split('toContain("version: \'2.461.0\'")').join('toContain("version: \'2.462.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.461.0')").length - 1) + (before.split('toContain("version: \'2.461.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
