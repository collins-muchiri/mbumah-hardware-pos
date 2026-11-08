#!/usr/bin/env node
// story-handover-v2468.mjs — the lead story's hand-over to the NINE
// deep-link suites AND the archive-door suite (the Task 111 law's
// seventy-fourth application; the archive-door copy stays claimed inside
// the codemod — forty-six surfaces, one home), applied by WRITE
// (fresh per round, guarded, idempotent). WRITTEN FRESH BY HAND — the
// BY WRITE law: authored, never derived.
//
// The nine deep-link suites' `whats-new — v2.467.0 leads the feed`
// blocks re-key to the v2.468.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the carrying round's own words
// ('edit door', 'pre-addressed', 'clearance note', 'chat picker').
//
// THE CENSUS DISCIPLINE (the v2462 law, honoured): the hand-over prose
// and guards speak the story by its own nouns and NEVER carry the
// hyphenated word literal the thirty-third word's one-writer ledger
// counts — the ledger's census stays exact.
//
// THE ORDER LAW: the walk's version web re-keyed the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape
// (each suite's toBe already reads 2.468.0 here).
//
// THE IDEMPOTENCY-ORDER LAW (v2.440.0's correction, honoured): the
// handed-over check runs FIRST — if the reference already wears the new
// label, the extraction is skipped and the run is a clean no-op.
//
// THE COUNTER'S LABEL LAW (v2.434.0's archaeology, honoured): the
// archive-door story ordinal is a hand-written LABEL, not a count of
// anything — the honest response is a steady +1: this round bumps
// sixty → sixty-one.
//
// THE EXTRACTION DRIFT LAW (the v2450 lesson, honoured): the OLD
// comment is read from the reference suite's own bytes — and the C_END
// probe is the LINE-CARRIED tail ("The door knows its store." — the
// v2467 round's own line-carried tail, honoured this round) because
// the tail phrase wraps mid-phrase in the prose; next round's codemod
// probes THIS round's own line-carried tail ("The number learns its
// edit door.").
import { readFileSync, writeFileSync } from 'node:fs';

const SUITES = [
  'src/tests/bank-type-deep-link-v2387.test.ts',
  'src/tests/bank-mpesa-deep-link-v2388.test.ts',
  'src/tests/debt-status-deep-link-v2389.test.ts',
  'src/tests/debt-channel-deep-link-v2390.test.ts',
  'src/tests/exp-status-deep-link-v2391.test.ts',
  'src/tests/exp-type-deep-link-v2392.test.ts',
  'src/tests/msg-template-deep-link-v2393.test.ts',
  'src/tests/rep-type-deep-link-v2384.test.ts',
  'src/tests/dead-window-deep-link-v2462.test.ts',
];

const OLD_LABEL = "describe('whats-new — v2.467.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.468.0 leads the feed', () => {";

// The OLD comment is read from the reference suite's own bytes (the
// seventy-third application's prose) — never re-transcribed by hand, so
// an em-dash or apostrophe drift can never fail the guard.
const REF = SUITES[4];
const ref = readFileSync(REF, 'utf8');
const C_START = "    // the lead's story hand-over (v2.467.0, the Task 111 law's";
// The tail phrase lands at the END of a line in the reference's own
// prose — the honest probe is the LINE-CARRIED tail, unique in the
// reference.
const C_END_PROBE = "The door knows its store.";
const NEW_LABEL_PROBE = NEW_LABEL;
const OLD_COMMENT = (() => {
  if (ref.includes(NEW_LABEL_PROBE)) return null; // already handed over
  const cStart = ref.indexOf(C_START);
  const tailAt = ref.indexOf(C_END_PROBE, cStart);
  if (cStart < 0 || tailAt < 0) {
    console.error('FAIL: the reference suite lost its v2.467.0 hand-over comment');
    process.exit(1);
  }
  // The prose wraps mid-clause, so the tail probe is a SUBSTRING: slice
  // from the comment's head line to the END OF THE LINE that carries the
  // tail (the next newline after the probe).
  const cEnd = ref.indexOf('\n', tailAt);
  return ref.slice(cStart, cEnd);
})();

const NEW_COMMENT = [
  "    // the lead's story hand-over (v2.468.0, the Task 111 law's",
  "    // seventy-fourth application): the head story is the hand-over's",
  "    // voice — the carrying round: THE NUMBER LEARNS ITS EDIT DOOR —",
  "    // the picker chip's promise kept on the desk where the promise",
  "    // lives: the quiet picker face grew its press (a real button, the",
  "    // double voice every handle wears, the dashed border the pressable",
  "    // hint), one press opens the edit dialog (one Input, Enter saves,",
  "    // the door's own normalize spoken as the helper word), and the",
  "    // save rides the owner-only PATCH (SUPER_ADMIN or STORE_OWNER,",
  "    // the write shaped org-scoped — a foreign store is a calm 404 —",
  "    // the number stored exactly as typed, the ONE home normalizes at",
  "    // composition time, the log masked to the last three digits); THE",
  "    // LIVE FLIP — the save invalidates the desk's own wire and the",
  "    // chip flips to the pre-addressed face in place, no other tab, no",
  "    // re-load; the census grows its fourth voice — the edit door's",
  "    // own handle.",
  "    // The number learns its edit door.",
].join('\n');

const OLD_GUARDS = [
  "    expect(head.title).toContain('share door learns the store');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('pre-addressed'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('share door'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('chat picker'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('edit door');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('pre-addressed'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('chat picker'))).toBe(true);",
].join('\n');

let files = 0, edits = 0;
if (OLD_COMMENT === null) {
  console.log(`${REF}: already handed over — skipping comment extraction (idempotent no-op)`);
}
for (const suite of SUITES) {
  if (OLD_COMMENT === null) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_LABEL)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  for (const [label, piece] of [['comment', OLD_COMMENT], ['guards', OLD_GUARDS], ['label', OLD_LABEL]]) {
    if (!src.includes(piece)) {
      console.error(`FAIL: ${suite} lost its v2.467.0 ${label}`);
      process.exit(1);
    }
  }
  src = src.split(OLD_COMMENT).join(NEW_COMMENT);
  src = src.split(OLD_GUARDS).join(NEW_GUARDS);
  src = src.split(OLD_LABEL).join(NEW_LABEL);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}

// ── the archive door's sixty-first copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = "    // v2.467.0 hand-over: the lead tells the share-door story now; the";
const ARC_NEW_HEAD = "    // v2.468.0 hand-over: the lead tells the edit-door story now; the";
const ARC_OLD_MID = '    // archive-door story sixty — all still in the feed';
const ARC_NEW_MID = '    // archive-door story sixty-one — all still in the feed';

{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARC_NEW_MID)) {
    console.log(`${ARCHIVE}: already at story sixty-one (idempotent no-op)`);
  } else {
    for (const [label, piece] of [['head', ARC_OLD_HEAD], ['mid', ARC_OLD_MID]]) {
      if (!src.includes(piece)) {
        console.error(`FAIL: ${ARCHIVE} lost its v2.467.0 ${label}`);
        process.exit(1);
      }
    }
    src = src.split(ARC_OLD_HEAD).join(ARC_NEW_HEAD);
    src = src.split(ARC_OLD_MID).join(ARC_NEW_MID);
    writeFileSync(ARCHIVE, src);
    files++;
    edits += 2;
    console.log(`${ARCHIVE}: story sixty-one written`);
  }
}

// ── the archive door's dated guard re-key (the v2462 pattern) ──
const ARC_OLD_COMMENT = [
  '    // v2.467.0 re-key (dated): the lead speaks the pre-address round —',
  "    // the share door learns the store's own number (one door",
  '    // everywhere), and the ledger header speaks which door answers.',
].join('\n');
const ARC_NEW_COMMENT = [
  '    // v2.468.0 re-key (dated): the lead speaks the edit-door round —',
  "    // the number learns its edit door (the picker chip's promise",
  '    // kept), and the census grows its fourth voice.',
].join('\n');
const ARC_OLD_TITLE = "    expect(lead.title).toContain('own number');";
const ARC_NEW_TITLE = "    expect(lead.title).toContain('edit door');";
const ARC_OLD_WORD = "    expect(lead.bullets.some((b) => b.includes('pre-addressed'))).toBe(true);";
const ARC_NEW_WORD = "    expect(lead.bullets.some((b) => b.includes('edit door'))).toBe(true);";

{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARC_NEW_TITLE)) {
    console.log(`${ARCHIVE}: lead guards already re-keyed (idempotent no-op)`);
  } else {
    for (const [label, piece] of [['comment', ARC_OLD_COMMENT], ['title guard', ARC_OLD_TITLE], ['word guard', ARC_OLD_WORD]]) {
      if (!src.includes(piece)) {
        console.error(`FAIL: ${ARCHIVE} lost its v2.467.0 ${label}`);
        process.exit(1);
      }
    }
    src = src.split(ARC_OLD_COMMENT).join(ARC_NEW_COMMENT);
    src = src.split(ARC_OLD_TITLE).join(ARC_NEW_TITLE);
    src = src.split(ARC_OLD_WORD).join(ARC_NEW_WORD);
    writeFileSync(ARCHIVE, src);
    files++;
    edits += 3;
    console.log(`${ARCHIVE}: lead guards re-keyed to the edit-door round`);
  }
}

console.log(`\n${edits} hand-over edit(s) across ${files} file(s). A second run answers 0.`);
