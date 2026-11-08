#!/usr/bin/env node
// walk-v2467.mjs — v2.467.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is WRITTEN — a full authored file, never
// derived by slicing the previous round's script). Guarded and idempotent
// — a second run answers 0 replacements.
//
//   1. the history line (the v2.467.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.466.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's seventy-eighth generation"), never a round prefix.
//      THE HISTORY LINE KEEPS ITS OWN PROSE (the v2.466.0 law): the anchor
//      below is the v2.466.0 line's OWN bytes as they sit in the file, not
//      the round's final title — the anchor was read from the file before
//      this codemod was written.
//   2. the count web: the four unread anchors grow their +1 legs
//      (356/357/358/389 → 357/358/359/390) across EVERY suite that pins
//      them — each pattern is version-qualified so the +1 steps can
//      never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.466.0') → toBe('2.467.0') + the feed-announcement pin).
//
//   THE CONSTITUTION RESTS (fifth round standing): no deep-link word
//   joins the family this round either — the pre-address is a prop face
//   and a chip, not an address — so the constitution's title byte stays
//   at thirty-three words over twenty-six desks and the title web is a
//   deliberate no-op. The census discipline holds: this round's prose
//   and guards speak the story by its own nouns and never carry the
//   hyphenated word literal the thirty-third word's one-writer ledger
//   counts.
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2467.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's new
// suite (dead-stock-preaddress-v2467.test.ts) pins only sealed bytes and
// CURRENT-round asserts born at toBe('2.467.0') — the lead it was
// written against — so the treadmill finds no pin of its own to move and
// no historical museum label anywhere in it.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.467.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus: the wa.me door grows its honest second face — a store with a phone on file answers its own door (the composer's optional third word: waMeDigits strips the noise, grows the 0-prefix to 254, shaves the +, and the URL pre-addresses to wa.me/<digits> with the SAME encoded note the clipboard holds — no phone, null, or a word that normalizes to nothing keeps the picker door byte-for-byte), and the ledger header speaks which door answers (the emerald pre-addressed chip names the branch and its number, the quiet picker face says the chat picker answers — a status word, never a handle, the census's three handles stay three); ONE DOOR EVERYWHERE — the share handle and the CSV's share link column ride the SAME pre-addressed composer, the chat and the sheet can never name two different doors — one voice, five doors, and now the door knows where home is — the cascade's seventy-eighth generation\n`;

if (src.includes("the cascade's seventy-eighth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's seventy-seventh generation")) {
  const anchorLine = src.indexOf("    // v2.466.0: the resting ledger learns to reach out and to carry in one breath onto paper");
  if (anchorLine < 0) { console.error('FAIL: the v2.466.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.466.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.467.0 nor the v2.466.0 history line found');
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
// (the v2466 walk moved the anchors to 356/357/358/389; the FROM side
// below is idempotent — a second run answers 0)
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(356)", "whatsNewUnreadCount('2.110.0')).toBe(357)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(357)", "whatsNewUnreadCount('2.109.0')).toBe(358)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(358)", "whatsNewUnreadCount('2.108.0')).toBe(359)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(389)", "whatsNewUnreadCount('2.77.0')).toBe(390)"],
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
// THE CONSTITUTION RESTS (fifth round standing): the pre-address is a
// prop face and a chip, not an address — the title byte "(thirty-three
// words, twenty-six desks)" stands and the web is a deliberate no-op.

// ── the version web ──────────────────────────────────────────────────────
let vFiles = 0, vEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  text = text.split("toBe('2.466.0')").join("toBe('2.467.0')");
  text = text.split('toContain("version: \'2.466.0\'")').join('toContain("version: \'2.467.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.466.0')").length - 1) + (before.split('toContain("version: \'2.466.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
