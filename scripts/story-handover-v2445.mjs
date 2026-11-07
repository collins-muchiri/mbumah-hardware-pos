#!/usr/bin/env node
// story-handover-v2445.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// fifty-first application; the archive-door copy stays claimed inside
// the codemod — thirty-eight surfaces, one home), applied by WRITE
// (fresh per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.444.0 leads the feed`
// blocks re-key to the v2.445.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the records lens's own words
// ('records lens', 'loudest-by-records', 'aria-sort', 'rides above it').
//
// THE ORDER LAW: the walk's version web re-keys the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape
// (the archive-door mid's toBe already reads 2.445.0 here).
//
// THE IDEMPOTENCY-ORDER LAW (v2.440.0's correction, honoured): the
// handed-over check runs FIRST — if the reference already wears the new
// label, the extraction is skipped and the run is a clean no-op.
//
// THE COUNTER'S LABEL LAW (v2.434.0's archaeology, honoured): the
// archive-door story ordinal is a hand-written LABEL, not a count of
// anything — the honest response is a steady +1: this round bumps
// thirty-seven → thirty-eight.
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

const OLD_LABEL = "describe('whats-new — v2.444.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.445.0 leads the feed', () => {";

// The OLD comment is read from the reference suite's own bytes (the
// fiftieth application's prose) — never re-transcribed by hand, so
// an em-dash or apostrophe drift can never fail the guard.
const REF = SUITES[4];
const ref = readFileSync(REF, 'utf8');
const C_START = "    // the lead's story hand-over (v2.444.0";
const C_END = "    // this round; the status door's family carries the eye.";
const NEW_LABEL_PROBE = NEW_LABEL;
const OLD_COMMENT = (() => {
  if (ref.includes(NEW_LABEL_PROBE)) return null; // already handed over
  const cStart = ref.indexOf(C_START);
  const cEnd = ref.indexOf(C_END);
  if (cStart < 0 || cEnd < 0) {
    console.error('FAIL: the reference suite lost its v2.444.0 hand-over comment');
    process.exit(1);
  }
  return ref.slice(cStart, cEnd + C_END.length);
})();

const NEW_COMMENT = [
  "    // the lead's story hand-over (v2.445.0, the Task 111 law's",
  "    // fifty-first application): the head story is the hand-over's",
  "    // voice — the records lens; the census learns a second sort",
  "    // voice: the census door learned to open panes and this round",
  "    // it learns to reorder itself (the By Type table's Records",
  "    // header becomes a real button — one press re-sorts the census",
  "    // loudest-by-records, the desk moving the most DATA reads",
  "    // first, not just the desk running the most exports; press",
  "    // again and the run-count law returns); the second voice RIDES",
  "    // ABOVE THE LAW (the default .sort keeps its exact seat — the",
  "    // elders' pin survives verbatim — and the records sort is a new",
  "    // pass over the sorted rows, both voices breaking ties by the",
  "    // type's own name); the header is the handle (the hover",
  "    // affordance waits at opacity-0, the active voice reads",
  "    // foreground under a lit ChevronDown, aria-sort names the",
  "    // order, the thead sits OUTSIDE the door rows so no conjoin is",
  "    // even possible). The status door's family exits the head this",
  "    // round; the records lens's arrow carries the eye.",
].join('\n');

const OLD_GUARDS = [
  "    expect(head.title).toContain('status door opens');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('cancelled lens'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('Cancelled family'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('door to nowhere'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('records lens');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('loudest-by-records'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('aria-sort'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('rides above it'))).toBe(true);",
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
      console.error(`FAIL: ${suite} lost its v2.444.0 ${label}`);
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

// ── the archive door's thirty-eighth copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.444.0 hand-over: the lead tells the status-door story now; the';
const ARC_NEW_HEAD = '    // v2.445.0 hand-over: the lead tells the records-lens story now; the';
const ARC_OLD_MID = [
  '    // archive-door story thirty-seven — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.445.0');",
  "    expect(lead.title).toContain('status door opens');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('cancelled lens'))).toBe(true);",
].join('\n');
const ARC_NEW_MID = [
  '    // archive-door story thirty-eight — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.445.0');",
  "    expect(lead.title).toContain('records lens');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('loudest-by-records'))).toBe(true);",
].join('\n');

{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARC_NEW_HEAD) || OLD_COMMENT === null) {
    console.log(`${ARCHIVE}: already handed over (idempotent no-op)`);
  } else {
    for (const [label, piece] of [['head', ARC_OLD_HEAD], ['mid', ARC_OLD_MID]]) {
      if (!src.includes(piece)) {
        console.error(`FAIL: ${ARCHIVE} lost its v2.444.0 ${label}`);
        process.exit(1);
      }
    }
    src = src.split(ARC_OLD_HEAD).join(ARC_NEW_HEAD);
    src = src.split(ARC_OLD_MID).join(ARC_NEW_MID);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: hand-over written (story thirty-eight)`);
  }
}

console.log(`\n${edits} hand-over(s) across ${files} file(s); a second run answers 0.`);
