#!/usr/bin/env node
// walk-v2464.mjs — v2.464.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is WRITTEN — a full authored file, never
// derived by slicing the previous round's script). Guarded and idempotent
// — a second run answers 0 replacements.
//
//   1. the history line (the v2.464.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.463.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's seventy-fifth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (353/354/355/386 → 354/355/356/387) across EVERY suite that pins
//      them — each pattern is version-qualified so the +1 steps can
//      never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.463.0') → toBe('2.464.0') + the feed-announcement pin).
//
//   THE CONSTITUTION RESTS (second round standing): no deep-link word
//   joins the family this round either — the file's word is a column,
//   not an address — so the constitution's title byte stays at
//   thirty-three words over twenty-six desks and the title web is a
//   deliberate no-op. The census discipline holds: this round's prose
//   and guards speak the story by its own nouns and never carry the
//   hyphenated word literal the thirty-third word's one-writer ledger
//   counts.
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2464.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new
// suite (dead-stock-file-v2464.test.ts) pins only sealed bytes and
// CURRENT-round asserts born at toBe('2.464.0') — the lead it was
// written against — so the treadmill finds no pin of its own to move and
// no historical museum label anywhere in it.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.464.0: the resting ledger learns to reach out and to carry — the clearance note rides the file: the note's THIRD door opens — the dead-stock CSV export (the client-side door, the server door never borrowed) gains a Clearance note column speaking the SAME deterministic note the Ask copies and the share door sends, composed in the ONE home row by row (never re-typed in the desk), CSV-escaped with the window that caught each row riding inside the word — one voice, three doors, the clipboard and the chat and the sheet can never drift apart; the share of stock value is DRAWN (a thin rose bar under the number, the family's own word never a second palette, aria-hidden because the number above IS the voice — a second label would be a stutter); and the export button speaks its file only when the dead-stock report is on stage (the conditional undefined falls back to the plain CSV face) — the cascade's seventy-fifth generation\n`;

if (src.includes("the cascade's seventy-fifth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's seventy-fourth generation")) {
  const anchorLine = src.indexOf("    // v2.463.0: the resting ledger learns to reach out");
  if (anchorLine < 0) { console.error('FAIL: the v2.463.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.463.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.464.0 nor the v2.463.0 history line found');
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
// (the v2463 walk moved the anchors to 353/354/355/386; the FROM side
// below is idempotent — a second run answers 0)
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(353)", "whatsNewUnreadCount('2.110.0')).toBe(354)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(354)", "whatsNewUnreadCount('2.109.0')).toBe(355)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(355)", "whatsNewUnreadCount('2.108.0')).toBe(356)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(386)", "whatsNewUnreadCount('2.77.0')).toBe(387)"],
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
// THE CONSTITUTION RESTS (second round standing): the file's word is a
// column, not an address — the title byte "(thirty-three words,
// twenty-six desks)" stands and the web is a deliberate no-op.

// ── the version web ──────────────────────────────────────────────────────
let vFiles = 0, vEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  text = text.split("toBe('2.463.0')").join("toBe('2.464.0')");
  text = text.split('toContain("version: \'2.463.0\'")').join('toContain("version: \'2.464.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.463.0')").length - 1) + (before.split('toContain("version: \'2.463.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
