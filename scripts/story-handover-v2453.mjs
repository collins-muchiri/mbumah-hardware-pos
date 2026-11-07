#!/usr/bin/env node
// story-handover-v2453.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// fifty-ninth application; the archive-door copy stays claimed inside
// the codemod — forty-five surfaces, one home), applied by WRITE
// (fresh per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.452.0 leads the feed`
// blocks re-key to the v2.453.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the reduce sweep's own words
// ('reduce', 'Outstanding Debt', 'fifth stat card', 'Decimal-as-string').
//
// THE ORDER LAW: the walk's version web re-keys the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape
// (the archive-door mid's toBe already reads 2.453.0 here).
//
// THE IDEMPOTENCY-ORDER LAW (v2.440.0's correction, honoured): the
// handed-over check runs FIRST — if the reference already wears the new
// label, the extraction is skipped and the run is a clean no-op.
//
// THE COUNTER'S LABEL LAW (v2.434.0's archaeology, honoured): the
// archive-door story ordinal is a hand-written LABEL, not a count of
// anything — the honest response is a steady +1: this round bumps
// forty-five → forty-six.
//
// THE EXTRACTION DRIFT LAW (the v2450 lesson, honoured): the OLD comment
// is read from the reference suite's own bytes — and the C_END probe
// follows THIS round's own tail ("the witnesses' arrow carries the
// eye."); next round's codemod must probe "the boundary's arrow carries
// the eye." — the tail drifts with the story.
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

const OLD_LABEL = "describe('whats-new — v2.452.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.453.0 leads the feed', () => {";

// The OLD comment is read from the reference suite's own bytes (the
// fifty-eighth application's prose) — never re-transcribed by hand, so
// an em-dash or apostrophe drift can never fail the guard.
const REF = SUITES[4];
const ref = readFileSync(REF, 'utf8');
const C_START = "    // the lead's story hand-over (v2.452.0, the Task 111 law's";
const C_END_PROBE = "the witnesses' arrow carries the eye.";
const NEW_LABEL_PROBE = NEW_LABEL;
const OLD_COMMENT = (() => {
  if (ref.includes(NEW_LABEL_PROBE)) return null; // already handed over
  const cStart = ref.indexOf(C_START);
  const tailAt = ref.indexOf(C_END_PROBE, cStart);
  if (cStart < 0 || tailAt < 0) {
    console.error('FAIL: the reference suite lost its v2.452.0 hand-over comment');
    process.exit(1);
  }
  // The prose wraps mid-clause, so the tail probe is a SUBSTRING: slice
  // from the comment's head line to the END OF THE LINE that carries the
  // tail (the next newline after the probe).
  const cEnd = ref.indexOf('\n', tailAt);
  return ref.slice(cStart, cEnd);
})();

const NEW_COMMENT = [
  "    // the lead's story hand-over (v2.453.0, the Task 111 law's",
  "    // fifty-ninth application): the head story is the hand-over's",
  "    // voice — the reduce sweep; the v2.452.0 confession promised the",
  "    // grep and the grep RAN: every desk's summing seat audited, and",
  "    // the customers wire caught feeding its sums Decimal-as-string",
  "    // (the contract declared number, the raw spread delivered JSON",
  "    // strings) — the reports desk's customer-analysis card read the",
  "    // lie LIVE (three real debts of 3500, 1200 and 0 glued into",
  "    // \"035001200\" — Ksh 35,001,200.00 for Ksh 4,700.00 of real",
  "    // debt) and the customers desk carried the same shape LATENT (a",
  "    // sum the underscore kept silent); the fix is three seats deep —",
  "    // the wire's honest boundary (the list route coerces the two",
  "    // money fields after the spread, so every future consumer is",
  "    // born honest), the live seat's own Number() with its figure in",
  "    // tabular digits, and the latent seat LIT (the customers desk's",
  "    // FIFTH STAT CARD — the desk finally speaks its own debt total",
  "    // in the risk family's rose-to-red gradient); the aging buckets",
  "    // were honest by arithmetic accident (subtraction coerces) and",
  "    // every other desk's summing seat passed the same audit. The",
  "    // witnesses' arrow exits the head this round; the boundary's",
  "    // arrow carries the eye.",
].join('\n');

const OLD_GUARDS = [
  "    expect(head.title).toContain('fixture world');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('db:fixtures'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('money bait'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('tabular'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('reduce');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Outstanding Debt'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('fifth stat card'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('Decimal-as-string'))).toBe(true);",
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
      console.error(`FAIL: ${suite} lost its v2.452.0 ${label}`);
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

// ── the archive door's forty-sixth copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.452.0 hand-over: the lead tells the fixture-world story now; the';
const ARC_NEW_HEAD = '    // v2.453.0 hand-over: the lead tells the reduce-sweep story now; the';
const ARC_OLD_MID = [
  '    // archive-door story forty-five — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.453.0');",
  "    expect(lead.title).toContain('fixture world');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('money bait'))).toBe(true);",
].join('\n');
const ARC_NEW_MID = [
  '    // archive-door story forty-six — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.453.0');",
  "    expect(lead.title).toContain('reduce');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('Outstanding Debt'))).toBe(true);",
].join('\n');

{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARC_NEW_MID)) {
    console.log(`${ARCHIVE}: already at story forty-six (idempotent no-op)`);
  } else {
    for (const [label, piece] of [['head', ARC_OLD_HEAD], ['mid', ARC_OLD_MID]]) {
      if (!src.includes(piece)) {
        console.error(`FAIL: ${ARCHIVE} lost its v2.452.0 ${label}`);
        process.exit(1);
      }
    }
    src = src.split(ARC_OLD_HEAD).join(ARC_NEW_HEAD);
    src = src.split(ARC_OLD_MID).join(ARC_NEW_MID);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: story forty-six written`);
  }
}

console.log(`\n${edits} hand-over edit(s) across ${files} file(s). A second run answers 0.`);
