#!/usr/bin/env node
// story-handover-v2461.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// sixty-seventh application; the archive-door copy stays claimed inside
// the codemod — forty-five surfaces, one home), applied by WRITE
// (fresh per round, guarded, idempotent). WRITTEN FRESH BY HAND — the
// BY WRITE law: authored, never derived.
//
// The eight deep-link suites' `whats-new — v2.460.0 leads the feed`
// blocks re-key to the v2.461.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the dead stock round's own words
// ('dead stock', 'three-by-three', 'idle window', 'never sold').
//
// THE ORDER LAW: the walk's version web re-keyed the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape
// (each suite's toBe already reads 2.461.0 here).
//
// THE IDEMPOTENCY-ORDER LAW (v2.440.0's correction, honoured): the
// handed-over check runs FIRST — if the reference already wears the new
// label, the extraction is skipped and the run is a clean no-op.
//
// THE COUNTER'S LABEL LAW (v2.434.0's archaeology, honoured): the
// archive-door story ordinal is a hand-written LABEL, not a count of
// anything — the honest response is a steady +1: this round bumps
// fifty-three → fifty-four.
//
// THE EXTRACTION DRIFT LAW (the v2450 lesson, honoured): the OLD
// comment is read from the reference suite's own bytes — and the C_END
// probe is the LINE-CARRIED tail ("ledger rests empty.") because the
// tail phrase wraps mid-phrase in the prose; next round's codemod
// probes THIS round's own line-carried tail ("the stock speaks.").
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
];

const OLD_LABEL = "describe('whats-new — v2.460.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.461.0 leads the feed', () => {";

// The OLD comment is read from the reference suite's own bytes (the
// sixty-sixth application's prose) — never re-transcribed by hand, so
// an em-dash or apostrophe drift can never fail the guard.
const REF = SUITES[4];
const ref = readFileSync(REF, 'utf8');
const C_START = "    // the lead's story hand-over (v2.460.0, the Task 111 law's";
// The tail phrase lands at the END of a line in the reference's own
// prose — the honest probe is the LINE-CARRIED tail, unique in the
// reference.
const C_END_PROBE = "ledger rests empty.";
const NEW_LABEL_PROBE = NEW_LABEL;
const OLD_COMMENT = (() => {
  if (ref.includes(NEW_LABEL_PROBE)) return null; // already handed over
  const cStart = ref.indexOf(C_START);
  const tailAt = ref.indexOf(C_END_PROBE, cStart);
  if (cStart < 0 || tailAt < 0) {
    console.error('FAIL: the reference suite lost its v2.460.0 hand-over comment');
    process.exit(1);
  }
  // The prose wraps mid-clause, so the tail probe is a SUBSTRING: slice
  // from the comment's head line to the END OF THE LINE that carries the
  // tail (the next newline after the probe).
  const cEnd = ref.indexOf('\n', tailAt);
  return ref.slice(cStart, cEnd);
})();

const NEW_COMMENT = [
  "    // the lead's story hand-over (v2.461.0, the Task 111 law's",
  "    // sixty-seventh application): the head story is the hand-over's",
  "    // voice — the dead stock round: THE NINTH REPORT — the reports",
  "    // desk learns what rests: a product is dead stock when it HOLDS",
  "    // stock and its last sale is older than the idle window (30 | 60",
  "    // | 90, the lens's own tuple — a made-up window is a 400) or it",
  "    // never sold; the MEANING lives in one home (the pure classifier",
  "    // the suite proves without a database: an empty shelf is NOT dead",
  "    // stock, no capital rests in it; a null last-sold speaks never,",
  "    // never a fabricated zero; rows sort capital-tied DESC, the",
  "    // honest share guards the zero total); THE WIRE gathers the",
  "    // facts with the fast-moving sale vocabulary and the payload",
  "    // rides rows — the naming-as-contract law honored again; THE",
  "    // GRID COMPLETES ITS THREE-BY-THREE (the ninth card, the",
  "    // Hourglass), the window lens rides the loom (the amber tint",
  "    // word — pressed voice and zinc ring with the family), the",
  "    // ledger speaks the never-sold badge and the aged idle colours,",
  "    // the CSV carries the section's own rows (the server export",
  "    // door is never borrowed), and ?rep-type=dead_stock lands the",
  "    // report through the ONE home (the vocabulary speaks nine). The",
  "    // square completes; the stock speaks.",
].join('\n');

const OLD_GUARDS = [
  "    expect(head.title).toContain('attestations');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('museum shelf'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('age-word'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('aria-pressed'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('masquerade law'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('dead stock');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('three-by-three'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('idle window'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('loom'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('never sold'))).toBe(true);",
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
      console.error(`FAIL: ${suite} lost its v2.460.0 ${label}`);
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

// ── the archive door's fifty-fourth copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.460.0 hand-over: the lead tells the museum-and-grammar story now; the';
const ARC_NEW_HEAD = '    // v2.461.0 hand-over: the lead tells the dead-stock story now; the';
const ARC_OLD_MID = '    // archive-door story fifty-three — all still in the feed';
const ARC_NEW_MID = '    // archive-door story fifty-four — all still in the feed';

{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARC_NEW_MID)) {
    console.log(`${ARCHIVE}: already at story fifty-four (idempotent no-op)`);
  } else {
    for (const [label, piece] of [['head', ARC_OLD_HEAD], ['mid', ARC_OLD_MID]]) {
      if (!src.includes(piece)) {
        console.error(`FAIL: ${ARCHIVE} lost its v2.460.0 ${label}`);
        process.exit(1);
      }
    }
    src = src.split(ARC_OLD_HEAD).join(ARC_NEW_HEAD);
    src = src.split(ARC_OLD_MID).join(ARC_NEW_MID);
    writeFileSync(ARCHIVE, src);
    files++;
    edits += 2;
    console.log(`${ARCHIVE}: story fifty-four written`);
  }
}

console.log(`\n${edits} hand-over edit(s) across ${files} file(s). A second run answers 0.`);
