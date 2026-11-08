#!/usr/bin/env node
// walk-v2463.mjs — v2.463.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is WRITTEN — a full authored file, never
// derived by slicing the previous round's script). Guarded and idempotent
// — a second run answers 0 replacements.
//
//   1. the history line (the v2.463.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.462.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's seventy-fourth generation"), never a round prefix.
//   2. the count web: the four unread anchors grow their +1 legs
//      (352/353/354/385 → 353/354/355/386) across EVERY suite that pins
//      them — each pattern is version-qualified so the +1 steps can
//      never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.462.0') → toBe('2.463.0') + the feed-announcement pin).
//
//   THE CONSTITUTION RESTS (this round's own note): no deep-link word
//   joins the family this round — the share door is a row action, not an
//   address — so the constitution's title byte stays at thirty-three
//   words over twenty-six desks and the title web has nothing to move.
//   The census discipline holds: this round's prose and guards speak the
//   story by its own nouns and never carry the hyphenated word literal
//   the thirty-third word's one-writer ledger counts.
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2463.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new
// suite (dead-stock-share-v2463.test.ts) pins only sealed bytes and
// CURRENT-round asserts born at toBe('2.463.0') — the lead it was
// written against — so the treadmill finds no pin of its own to move and
// no historical museum label anywhere in it.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.463.0: the resting ledger learns to reach out — the clearance note takes the share door: the note's SECOND door opens — every dead-stock row's Ask handle gains a Share sibling that opens the maker's own WhatsApp with the SAME deterministic clearance note already composed (one voice, two doors — the URL is the wa.me word for the note, composed in the classifier's ONE home THROUGH the note's own composer, so the clipboard and the chat can never drift apart); the row names no supplier, so the URL carries no phone — WhatsApp opens with the text pre-filled and the maker picks the chat (the recipient-addressed instrument stays api.ts's own, a phone-bearing word this row does not carry); the ledger's last column wears its pair — a tight two-door group, the share handle in the emerald hover the family already speaks, the double voice every row action wears, and a browser that blocks the window speaks its side (the toast answers, the row stays whole — the popup-blocked honesty law) — the cascade's seventy-fourth generation\n`;

if (src.includes("the cascade's seventy-fourth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's seventy-third generation")) {
  const anchorLine = src.indexOf("    // v2.462.0: the resting ledger learns to share");
  if (anchorLine < 0) { console.error('FAIL: the v2.462.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.462.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.463.0 nor the v2.462.0 history line found');
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
// (the v2462 walk moved the anchors to 352/353/354/385; the FROM side
// below is idempotent — a second run answers 0)
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(352)", "whatsNewUnreadCount('2.110.0')).toBe(353)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(353)", "whatsNewUnreadCount('2.109.0')).toBe(354)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(354)", "whatsNewUnreadCount('2.108.0')).toBe(355)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(385)", "whatsNewUnreadCount('2.77.0')).toBe(386)"],
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
// THE CONSTITUTION RESTS: no deep-link word joins the family this round
// (the share door is a row action, not an address), so the title byte
// "(thirty-three words, twenty-six desks)" stands and the web is a
// deliberate no-op — the honest walk speaks only what moves.

// ── the version web ──────────────────────────────────────────────────────
let vFiles = 0, vEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  text = text.split("toBe('2.462.0')").join("toBe('2.463.0')");
  text = text.split('toContain("version: \'2.462.0\'")').join('toContain("version: \'2.463.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.462.0')").length - 1) + (before.split('toContain("version: \'2.462.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
