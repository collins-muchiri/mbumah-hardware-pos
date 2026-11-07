#!/usr/bin/env node
// story-handover-v2454.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// sixtieth application; the archive-door copy stays claimed inside
// the codemod — forty-five surfaces, one home), applied by WRITE
// (fresh per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.453.0 leads the feed`
// blocks re-key to the v2.454.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the reconciliation's own words
// ('voices', 'by design', 'scope line', 'reconcile on their own terms').
//
// THE ORDER LAW: the walk's version web re-keys the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape
// (the archive-door mid's toBe already reads 2.454.0 here).
//
// THE IDEMPOTENCY-ORDER LAW (v2.440.0's correction, honoured): the
// handed-over check runs FIRST — if the reference already wears the new
// label, the extraction is skipped and the run is a clean no-op.
//
// THE COUNTER'S LABEL LAW (v2.434.0's archaeology, honoured): the
// archive-door story ordinal is a hand-written LABEL, not a count of
// anything — the honest response is a steady +1: this round bumps
// forty-six → forty-seven.
//
// THE EXTRACTION DRIFT LAW (the v2450 lesson, honoured): the OLD comment
// is read from the reference suite's own bytes — and the C_END probe
// follows THIS round's own tail ("the boundary's arrow carries the
// eye."); next round's codemod must probe "the voices' arrow carries
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

const OLD_LABEL = "describe('whats-new — v2.453.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.454.0 leads the feed', () => {";

// The OLD comment is read from the reference suite's own bytes (the
// fifty-ninth application's prose) — never re-transcribed by hand, so
// an em-dash or apostrophe drift can never fail the guard.
const REF = SUITES[4];
const ref = readFileSync(REF, 'utf8');
const C_START = "    // the lead's story hand-over (v2.453.0, the Task 111 law's";
// The tail phrase WRAPS MID-PHRASE in the reference's own prose ("the
// boundary's" ends one line, "arrow carries the eye." opens the next) —
// the honest probe is the LINE-CARRIED tail, unique in the reference.
const C_END_PROBE = "arrow carries the eye.";
const NEW_LABEL_PROBE = NEW_LABEL;
const OLD_COMMENT = (() => {
  if (ref.includes(NEW_LABEL_PROBE)) return null; // already handed over
  const cStart = ref.indexOf(C_START);
  const tailAt = ref.indexOf(C_END_PROBE, cStart);
  if (cStart < 0 || tailAt < 0) {
    console.error('FAIL: the reference suite lost its v2.453.0 hand-over comment');
    process.exit(1);
  }
  // The prose wraps mid-clause, so the tail probe is a SUBSTRING: slice
  // from the comment's head line to the END OF THE LINE that carries the
  // tail (the next newline after the probe).
  const cEnd = ref.indexOf('\n', tailAt);
  return ref.slice(cStart, cEnd);
})();

const NEW_COMMENT = [
  "    // the lead's story hand-over (v2.454.0, the Task 111 law's",
  "    // sixtieth application): the head story is the hand-over's",
  "    // voice — the debt voices reconcile; the reduce sweep's carried",
  "    // question ran its census and found the shell speaking",
  "    // \"Outstanding Debt\" through FIVE seats measuring TWO different",
  "    // ledgers — the LEDGER voice (DebtLedger.balance over the",
  "    // outstanding statuses, plan-tracked rows only) speaking at the",
  "    // dashboard KPI, the financial desk's card and the financial",
  "    // overview's card, and the MIRROR voice (Customer.currentDebtBalance",
  "    // over the customers wire) speaking at the customers desk's fifth",
  "    // card and the reports desk's analysis card; the two may disagree",
  "    // BY DESIGN and neither is wrong — every seat now says which voice",
  "    // it speaks (a small muted scope line under the figure, a testid",
  "    // apiece, and a hover coach telling which table the sum reads and",
  "    // why the other voice may honestly disagree), the figures",
  "    // themselves untouched. The boundary's arrow exits the head this",
  "    // round; the voices' arrow carries the eye.",
].join('\n');

const OLD_GUARDS = [
  "    expect(head.title).toContain('reduce');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Outstanding Debt'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('fifth stat card'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('Decimal-as-string'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('voices');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('by design'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('scope line'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('reconcile on their own terms'))).toBe(true);",
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
      console.error(`FAIL: ${suite} lost its v2.453.0 ${label}`);
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

// ── the archive door's forty-seventh copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.453.0 hand-over: the lead tells the reduce-sweep story now; the';
const ARC_NEW_HEAD = '    // v2.454.0 hand-over: the lead tells the reconciliation story now; the';
const ARC_OLD_MID = [
  '    // archive-door story forty-six — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.454.0');",
  "    expect(lead.title).toContain('reduce');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('Outstanding Debt'))).toBe(true);",
].join('\n');
const ARC_NEW_MID = [
  '    // archive-door story forty-seven — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.454.0');",
  "    expect(lead.title).toContain('voices');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('by design'))).toBe(true);",
].join('\n');

{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARC_NEW_MID)) {
    console.log(`${ARCHIVE}: already at story forty-seven (idempotent no-op)`);
  } else {
    for (const [label, piece] of [['head', ARC_OLD_HEAD], ['mid', ARC_OLD_MID]]) {
      if (!src.includes(piece)) {
        console.error(`FAIL: ${ARCHIVE} lost its v2.453.0 ${label}`);
        process.exit(1);
      }
    }
    src = src.split(ARC_OLD_HEAD).join(ARC_NEW_HEAD);
    src = src.split(ARC_OLD_MID).join(ARC_NEW_MID);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: story forty-seven written`);
  }
}

console.log(`\n${edits} hand-over edit(s) across ${files} file(s). A second run answers 0.`);
