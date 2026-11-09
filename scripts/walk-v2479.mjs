// walk-v2479.mjs — v2.479.0's walk marks, applied by WRITE (the BY WRITE
// law: each round's codemod is WRITTEN — a full authored file, never
// derived by slicing the previous round's script). Guarded and idempotent
// — a second run answers 0 replacements.
//
//   1. the history line (the v2.479.0 story) joins console-changelog.test.ts
//      — ABOVE the v2.478.0 line (newest first, the stacking law). The
//      GUARD-COLLISION law: the guard phrase is the history line's UNIQUE
//      tail ("the cascade's ninetieth generation"), never a round prefix.
//      THE HISTORY LINE KEEPS ITS OWN PROSE (the v2.466.0 law): the anchor
//      below is the v2.478.0 line's OWN bytes as they sit in the file, not
//      the round's final title — the anchor was read from the file before
//      this codemod was written.
//   2. the count web: the four unread anchors grow their +1 legs
//      (368/369/370/401 → 369/370/371/402) across EVERY suite that pins
//      them — each pattern is version-qualified so the +1 steps can
//      never collide.
//   3. the version web: the living version pins ride the treadmill
//      (toBe('2.478.0') → toBe('2.479.0') + the feed-announcement pin).
//
//   THE CONSTITUTION RESTS (sixteenth round standing): no address word
//   joins the family this round either — the paper's window word rides
//   the print header, not the address bar — so the constitution's title
//   byte stays at thirty-three words over twenty-six desks and the title
//   web is a deliberate no-op. The census discipline holds: this round's
//   prose and guards speak the story by its own nouns and never carry
//   the hyphenated word literal the thirty-third word's one-writer
//   ledger counts.
//
// THE ORDER LAW: this codemod runs BEFORE story-handover-v2479.mjs —
// the deep-link suites' version asserts re-key here, so the hand-over
// codemod finds the OLD prose carrying the NEW version.
//
// THE WALK-SAFETY ORDER (v2.434.0's law, honoured): this round's two new
// suites pin only sealed bytes and CURRENT-round asserts born at
// toBe('2.479.0') — the lead they were written against — so the treadmill
// finds no pin of their own to move and no historical museum label
// anywhere in them (chip-loom-head-v2479 carries NO version pins at all,
// the pure byte-pin shape). The v2.478.0 museum ride
// (dead-stock-file-door-v2478) is NOT museumed here: the version web
// moves its living pin to 2.479.0 and the story-handover back-keys it to
// its own story forever (the dated re-key below in the hand-over codemod).
// THE PAIR RUNS ONCE (v2.472.0's process law): after the hand-over's
// museum back-key, THIS codemod never runs again this round.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const path = 'src/tests/console-changelog.test.ts';
let src = readFileSync(path, 'utf8');
let writes = 0;

const HISTORY = `    // v2.479.0: the resting ledger learns to reach out and to carry in one breath onto paper — the share door learns the store's own number, the print door keeps its chorus, the number learns its edit door, the settings desk learns the branch's own words, the paper carries a scannable door, the file sings the chorus whole, the ledger answers to its own columns, the ledger answers to its own name, the shape answers to the ledger, the view speaks its own word, the chorus rides the chat door, the chorus learns the paper's scannable door, the file carries the chorus's own door, and the paper speaks the window's word: the dead-stock paper's header speaks the idle window beside the dates (the ONE home's days expression, the dead-stock stage's own gate — the window IS the lens), the loom's sixth weave takes the head home (the pill head exported beside the ring and the faces, the inventory ledger's All chip rides the family component, the data-colored tribe's last two head hand-copies ride the import — one head, many hands), and the census pills learn the family's voices (the M-Pesa census's four idle faces gain the dark wardrobe the elder ledger named, the M-Pesa census and the security desk's time-window pills wear the zinc keyboard ring) — the census keeps its ten voices, and the desk never spells the host's word — the cascade's ninetieth generation\n`;

if (src.includes("the cascade's ninetieth generation")) {
  console.log('history line: already present (idempotent no-op)');
} else if (src.includes("the cascade's eighty-ninth generation")) {
  const anchorLine = src.indexOf("    // v2.478.0: the resting ledger learns to reach out and to carry in one breath onto paper");
  if (anchorLine < 0) { console.error('FAIL: the v2.478.0 history line is gone'); process.exit(1); }
  src = src.slice(0, anchorLine) + HISTORY + src.slice(anchorLine);
  writes++;
  console.log('history line: inserted above the v2.478.0 line (newest first)');
} else {
  console.error('FAIL: neither the v2.479.0 nor the v2.478.0 history line found');
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
// (the v2478 walk moved the anchors to 368/369/370/401; the FROM side
// below is idempotent — a second run answers 0)
const COUNT_FROM = [
  ["whatsNewUnreadCount('2.110.0')).toBe(368)", "whatsNewUnreadCount('2.110.0')).toBe(369)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(369)", "whatsNewUnreadCount('2.109.0')).toBe(370)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(370)", "whatsNewUnreadCount('2.108.0')).toBe(371)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(401)", "whatsNewUnreadCount('2.77.0')).toBe(402)"],
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
// THE CONSTITUTION RESTS (sixteenth round standing): the paper's window
// word rides the print header — not an address — so the title byte
// "(thirty-three words, twenty-six desks)" stands and the web is a
// deliberate no-op.

// ── the version web ──────────────────────────────────────────────────────
let vFiles = 0, vEdits = 0;
for (const file of listTests('src/tests')) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  text = text.split("toBe('2.478.0')").join("toBe('2.479.0')");
  text = text.split('toContain("version: \'2.478.0\'")').join('toContain("version: \'2.479.0\'")');
  if (text !== before) {
    writeFileSync(file, text);
    vFiles++;
    vEdits += (before.split("toBe('2.478.0')").length - 1) + (before.split('toContain("version: \'2.478.0\'")').length - 1);
  }
}
console.log(`version web: ${vEdits} pin edit(s) across ${vFiles} file(s).`);
console.log('a second run answers 0 everywhere.');
