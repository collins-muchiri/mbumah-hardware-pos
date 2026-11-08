#!/usr/bin/env node
// story-handover-v2462.mjs — the lead story's hand-over to the NINE
// deep-link suites AND the archive-door suite (the Task 111 law's
// sixty-eighth application; the archive-door copy stays claimed inside
// the codemod — forty-six surfaces, one home), applied by WRITE
// (fresh per round, guarded, idempotent). WRITTEN FRESH BY HAND — the
// BY WRITE law: authored, never derived.
//
// The nine deep-link suites' `whats-new — v2.461.0 leads the feed`
// blocks re-key to the v2.462.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the resting-ledger round's own
// words ('resting ledger', 'thirty-third word', 'rose byte', 'category',
// 'clearance note', 'clipboard').
//
// THE CENSUS DISCIPLINE (this round's own law): the hand-over prose and
// guards speak the story WITHOUT the hyphenated word literal — the
// thirty-third word's one-writer ledger counts exactly the files that
// speak it, and a hand-over that named the word would drag all nine
// elders into the ledger under a false flag. The story is told by its
// own nouns.
//
// THE ORDER LAW: the walk's version web re-keyed the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape
// (each suite's toBe already reads 2.462.0 here).
//
// THE IDEMPOTENCY-ORDER LAW (v2.440.0's correction, honoured): the
// handed-over check runs FIRST — if the reference already wears the new
// label, the extraction is skipped and the run is a clean no-op.
//
// THE COUNTER'S LABEL LAW (v2.434.0's archaeology, honoured): the
// archive-door story ordinal is a hand-written LABEL, not a count of
// anything — the honest response is a steady +1: this round bumps
// fifty-four → fifty-five.
//
// THE EXTRACTION DRIFT LAW (the v2450 lesson, honoured): the OLD
// comment is read from the reference suite's own bytes — and the C_END
// probe is the LINE-CARRIED tail ("the stock speaks." — the v2461
// round's own line-carried tail, honoured this round) because the tail
// phrase wraps mid-phrase in the prose; next round's codemod probes
// THIS round's own line-carried tail ("the clipboard is the door.").
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

const OLD_LABEL = "describe('whats-new — v2.461.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.462.0 leads the feed', () => {";

// The OLD comment is read from the reference suite's own bytes (the
// sixty-seventh application's prose) — never re-transcribed by hand, so
// an em-dash or apostrophe drift can never fail the guard.
const REF = SUITES[4];
const ref = readFileSync(REF, 'utf8');
const C_START = "    // the lead's story hand-over (v2.461.0, the Task 111 law's";
// The tail phrase lands at the END of a line in the reference's own
// prose — the honest probe is the LINE-CARRIED tail, unique in the
// reference.
const C_END_PROBE = "the stock speaks.";
const NEW_LABEL_PROBE = NEW_LABEL;
const OLD_COMMENT = (() => {
  if (ref.includes(NEW_LABEL_PROBE)) return null; // already handed over
  const cStart = ref.indexOf(C_START);
  const tailAt = ref.indexOf(C_END_PROBE, cStart);
  if (cStart < 0 || tailAt < 0) {
    console.error('FAIL: the reference suite lost its v2.461.0 hand-over comment');
    process.exit(1);
  }
  // The prose wraps mid-clause, so the tail probe is a SUBSTRING: slice
  // from the comment's head line to the END OF THE LINE that carries the
  // tail (the next newline after the probe).
  const cEnd = ref.indexOf('\n', tailAt);
  return ref.slice(cStart, cEnd);
})();

const NEW_COMMENT = [
  "    // the lead's story hand-over (v2.462.0, the Task 111 law's",
  "    // sixty-eighth application): the head story is the hand-over's",
  "    // voice — the resting-ledger round: THE LENS TAKES AN ADDRESS —",
  "    // the ninth report's idle window joins the deep-link family as",
  "    // its thirty-third word: the words are the window tuple's OWN",
  "    // spellings read through the generic parser from the ONE home",
  "    // the classifier keeps (a made-up window is an unknown word,",
  "    // the default is 90), the lens WRITES BACK — a hand-driven turn",
  "    // replaceState's the word into the address (the preserve law),",
  "    // so a turned lens is a shareable address; the landing chip",
  "    // wears the ROSE byte at 300/100 — the two-storey census was",
  "    // FULL, so the family grew one line rather than masquerade;",
  "    // the chip lives in the SECTION (the lens is inside the dead",
  "    // stock stage — the sub-tab law's shape), the default wears no",
  "    // chip, and navigation is never a lens change; THE CAPITAL",
  "    // DRAWS ITS SHAPE — the Chart Type row covers the ninth report",
  "    // with the two honest faces (bar and pie of capital tied by",
  "    // category, grouped in the classifier's one home; line and",
  "    // area are time-series words categorical capital cannot wear;",
  "    // zero new fetches; the chart draws only when rows rest); AND",
  "    // EVERY ROW LEARNS TO ASK — the Ask button carries a",
  "    // deterministic WhatsApp-ready clearance note to the clipboard",
  "    // (units and base unit, capital at cost, the ISO day, the",
  "    // never-sold row's honest absence; no supplier name invented).",
  "    // The lens shares; the capital draws; the clipboard is the door.",
].join('\n');

const OLD_GUARDS = [
  "    expect(head.title).toContain('dead stock');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('three-by-three'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('idle window'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('loom'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('never sold'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('resting ledger');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('thirty-third word'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('rose byte'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('category'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('clipboard'))).toBe(true);",
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
      console.error(`FAIL: ${suite} lost its v2.461.0 ${label}`);
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

// ── the archive door's fifty-fifth copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.461.0 hand-over: the lead tells the dead-stock story now; the';
const ARC_NEW_HEAD = '    // v2.462.0 hand-over: the lead tells the resting-ledger story now; the';
const ARC_OLD_MID = '    // archive-door story fifty-four — all still in the feed';
const ARC_NEW_MID = '    // archive-door story fifty-five — all still in the feed';

{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARC_NEW_MID)) {
    console.log(`${ARCHIVE}: already at story fifty-five (idempotent no-op)`);
  } else {
    for (const [label, piece] of [['head', ARC_OLD_HEAD], ['mid', ARC_OLD_MID]]) {
      if (!src.includes(piece)) {
        console.error(`FAIL: ${ARCHIVE} lost its v2.461.0 ${label}`);
        process.exit(1);
      }
    }
    src = src.split(ARC_OLD_HEAD).join(ARC_NEW_HEAD);
    src = src.split(ARC_OLD_MID).join(ARC_NEW_MID);
    writeFileSync(ARCHIVE, src);
    files++;
    edits += 2;
    console.log(`${ARCHIVE}: story fifty-five written`);
  }
}

console.log(`\n${edits} hand-over edit(s) across ${files} file(s). A second run answers 0.`);
