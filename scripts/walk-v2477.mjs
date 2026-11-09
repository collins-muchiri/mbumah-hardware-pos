#!/usr/bin/env node
// walk-v2477.mjs — v2.477.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is WRITTEN — a full authored file, never
// derived by slicing the previous round's script). Guarded and idempotent
// — a second run answers 0 replacements.
//
//   1. the history line (the v2.477.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.476.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's eighty-eighth generation"), never a round prefix.
//      THE HISTORY LINE KEEPS ITS OWN PROSE (the v2.466.0 law): the anchor
//      below is the v2.476.0 line's OWN bytes as they sit in the file, not
//      the round's final title — the anchor was read from the file before
//      this codemod was written.
//   2. the count web: the four unread anchors grow their +1 legs
//      (366/367/368/399 → 367/368/369/400) across EVERY suite that pins
//      them — each pattern is version-qualified so the +1 steps can
//      never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.476.0') → toBe('2.477.0') + the feed-announcement pin).
//
//   THE CONSTITUTION RESTS (fourteenth round standing): no deep-link word
//   joins the family this round either — the chorus's new door is a drawn
//   card on the paper, not an address — so the constitution's title byte
//   stays at thirty-three words over twenty-six desks and the title web is
//   a deliberate no-op. The census discipline holds: this round's prose
//   and guards speak the story by its own nouns and never carry the
//   hyphenated word literal the thirty-third word's one-writer ledger
//   counts.
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2477.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new
// suite (dead-stock-chorus-paper-v2477.test.ts) pins only sealed bytes and
// CURRENT-round asserts born at toBe('2.477.0') — the lead it was
// written against — so the treadmill finds no pin of its own to move and
// no historical museum label anywhere in it. The v2.476.0 museum ride
// (dead-stock-chorus-chat-v2476) and the v2.475.0 living pin
// (dead-stock-view-voice-v2475) are NOT museumed here: the version web
// moves their living pins to 2.477.0 and the story-handover back-keys
// BOTH to their own stories forever (the dated re-keys below in the
// hand-over codemod). THE PAIR RUNS ONCE (v2.472.0's process law): after
// the hand-over's museum back-keys, THIS codemod never runs again.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.477.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, the chorus rides the chat door, and the chorus learns the paper's scannable door: the dead-stock ledger's collective word learns the paper's own scannable door — the print appendix's scan grid grows the LEAD card, one QR drawn by the qrcode house encoding the ONE home's deadStockChorusShareUrl (the exact bytes the Share all handle opens, the store's own number riding its third word when the branch keeps one on file), captioned "The ledger's chorus" with the honest count note, the teal dress marking the collective door beside the rows' own cards; the paper wears its own dress — the chorus's numbered asks in the rose markers, the note in the teal word, new lines in the print CSS, the standing bytes untouched — the gate stays the dead-stock stage with rows (three doors), the window still opens first, a failed draw prints the paper without the cards, the census keeps its ten voices (a drawn image, never a handle), and the desk never spells the host's word — the cascade's eighty-eighth generation\n`;

if (src.includes("the cascade's eighty-eighth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's eighty-seventh generation")) {
  const anchorLine = src.indexOf("    // v2.476.0: the resting ledger learns to reach out and to carry in one breath onto paper");
  if (anchorLine < 0) { console.error('FAIL: the v2.476.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.476.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.477.0 nor the v2.476.0 history line found');
  process.exit(1);
}

writeFileSync(path, src);
console.log(`\n${writes} replacement(s) written.`);

const listTests = (dir) => {
  const acc = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) acc.push(...listTests(join(dir, e.name)));
    else if (/\.test\.ts$/.test(e.name)) acc.push(join(dir, e.name));
    else if (/\.test\.tsx$/.test(e.name)) acc.push(join(dir, e.name));
  }
  return acc;
};

// ── the count web ────────────────────────────────────────────────────────
// (the v2476 walk moved the anchors to 366/367/368/399; the FROM side
// below is idempotent — a second run answers 0)
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(366)", "whatsNewUnreadCount('2.110.0')).toBe(367)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(367)", "whatsNewUnreadCount('2.109.0')).toBe(368)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(368)", "whatsNewUnreadCount('2.108.0')).toBe(369)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(399)", "whatsNewUnreadCount('2.77.0')).toBe(400)"],
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
// THE CONSTITUTION RESTS (fourteenth round standing): the chorus's new
// door is a drawn card on the paper — not an address — so the title byte
// "(thirty-three words, twenty-six desks)" stands and the web is a
// deliberate no-op.

// ── the version web ──────────────────────────────────────────────────────
let vFiles = 0, vEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  text = text.split("toBe('2.476.0')").join("toBe('2.477.0')");
  text = text.split('toContain("version: \'2.476.0\'")').join('toContain("version: \'2.477.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.476.0')").length - 1) + (before.split('toContain("version: \'2.476.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
