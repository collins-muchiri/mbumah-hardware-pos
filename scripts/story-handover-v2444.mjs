#!/usr/bin/env node
// story-handover-v2444.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// fiftieth application; the archive-door copy stays claimed inside
// the codemod — thirty-seven surfaces, one home), applied by WRITE
// (fresh per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.443.0 leads the feed`
// blocks re-key to the v2.444.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the status door's own words
// ('status door opens', 'cancelled lens', 'Cancelled family',
// 'door to nowhere').
//
// THE ORDER LAW: the walk's version web re-keys the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape
// (the archive-door mid's toBe already reads 2.444.0 here).
//
// THE IDEMPOTENCY-ORDER LAW (v2.440.0's correction, honoured): the
// handed-over check runs FIRST — if the reference already wears the new
// label, the extraction is skipped and the run is a clean no-op.
//
// THE COUNTER'S LABEL LAW (v2.434.0's archaeology, honoured): the
// archive-door story ordinal is a hand-written LABEL, not a count of
// anything — the honest response is a steady +1: this round bumps
// thirty-six → thirty-seven.
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

const OLD_LABEL = "describe('whats-new — v2.443.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.444.0 leads the feed', () => {";

// The OLD comment is read from the reference suite's own bytes (the
// forty-ninth application's prose) — never re-transcribed by hand, so
// an em-dash or apostrophe drift can never fail the guard.
const REF = SUITES[4];
const ref = readFileSync(REF, 'utf8');
const C_START = "    // the lead's story hand-over (v2.443.0";
const C_END = "    // census door's seat carries the eye.";
const NEW_LABEL_PROBE = NEW_LABEL;
const OLD_COMMENT = (() => {
  if (ref.includes(NEW_LABEL_PROBE)) return null; // already handed over
  const cStart = ref.indexOf(C_START);
  const cEnd = ref.indexOf(C_END);
  if (cStart < 0 || cEnd < 0) {
    console.error('FAIL: the reference suite lost its v2.443.0 hand-over comment');
    process.exit(1);
  }
  return ref.slice(cStart, cEnd + C_END.length);
})();

const NEW_COMMENT = [
  "    // the lead's story hand-over (v2.444.0, the Task 111 law's",
  "    // fiftieth application): the head story is the hand-over's",
  "    // voice — the status door opens; the withdrawn badge lenses",
  "    // the cancelled: the census door's sibling (the withdrawn",
  "    // count was the one number on the By Type table that only",
  "    // counted) and this round its zinc badge becomes a real button",
  "    // whose press lands the history on the cancelled status lens",
  "    // through the controlled hand (chooseExpStatus, never a direct",
  "    // state write — press the pressed badge again and the lens",
  "    // releases); ONE FAMILY, THREE SEATS: the pressed wardrobe is",
  "    // the history chip's own zinc active bytes (bg-zinc-600",
  "    // text-white border-zinc-600 — beside the history chip and the",
  "    // stats card); the keyboard answers natively (a real button",
  "    // needs no manual handler) and the press stops propagation",
  "    // (the badge sits inside the type door's row — the two doors",
  "    // never conjoin a press); the honest zero stays a census (a",
  "    // zero-count door invites a pointless press) and the header",
  "    // note names both doors. The census door's seat exits the head",
  "    // this round; the status door's family carries the eye.",
].join('\n');

const OLD_GUARDS = [
  "    expect(head.title).toContain('census becomes a door');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('pressable'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('emerald seat'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('honest census'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('status door opens');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('cancelled lens'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('Cancelled family'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('door to nowhere'))).toBe(true);",
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
      console.error(`FAIL: ${suite} lost its v2.443.0 ${label}`);
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

// ── the archive door's thirty-seventh copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.443.0 hand-over: the lead tells the census-door story now; the';
const ARC_NEW_HEAD = '    // v2.444.0 hand-over: the lead tells the status-door story now; the';
const ARC_OLD_MID = [
  '    // archive-door story thirty-six — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.444.0');",
  "    expect(lead.title).toContain('census becomes a door');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('pressable'))).toBe(true);",
].join('\n');
const ARC_NEW_MID = [
  '    // archive-door story thirty-seven — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.444.0');",
  "    expect(lead.title).toContain('status door opens');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('cancelled lens'))).toBe(true);",
].join('\n');

{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARC_NEW_HEAD) || OLD_COMMENT === null) {
    console.log(`${ARCHIVE}: already handed over (idempotent no-op)`);
  } else {
    for (const [label, piece] of [['head', ARC_OLD_HEAD], ['mid', ARC_OLD_MID]]) {
      if (!src.includes(piece)) {
        console.error(`FAIL: ${ARCHIVE} lost its v2.443.0 ${label}`);
        process.exit(1);
      }
    }
    src = src.split(ARC_OLD_HEAD).join(ARC_NEW_HEAD);
    src = src.split(ARC_OLD_MID).join(ARC_NEW_MID);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: hand-over written (story thirty-seven)`);
  }
}

console.log(`\n${edits} hand-over(s) across ${files} file(s); a second run answers 0.`);
