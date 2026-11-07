#!/usr/bin/env node
// story-handover-v2443.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// forty-ninth application; the archive-door copy stays claimed inside
// the codemod — thirty-six surfaces, one home), applied by WRITE (fresh
// per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.442.0 leads the feed`
// blocks re-key to the v2.443.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the census door's own words
// ('census becomes a door', 'pressable', 'emerald seat', 'honest census').
//
// THE ORDER LAW: the walk's version web re-keys the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape
// (the archive-door mid's toBe already reads 2.443.0 here).
//
// THE IDEMPOTENCY-ORDER LAW (v2.440.0's correction, honoured): the
// handed-over check runs FIRST — if the reference already wears the new
// label, the extraction is skipped and the run is a clean no-op.
//
// THE COUNTER'S LABEL LAW (v2.434.0's archaeology, honoured): the
// archive-door story ordinal is a hand-written LABEL, not a count of
// anything — the honest response is a steady +1: this round bumps
// thirty-five → thirty-six.
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

const OLD_LABEL = "describe('whats-new — v2.442.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.443.0 leads the feed', () => {";

// The OLD comment is read from the reference suite's own bytes (the
// forty-eighth application's prose) — never re-transcribed by hand, so
// an em-dash or apostrophe drift can never fail the guard.
const REF = SUITES[4];
const ref = readFileSync(REF, 'utf8');
const C_START = "    // the lead's story hand-over (v2.442.0";
const C_END = "    // this round; the dark voice's grammar carries the eye.";
const NEW_LABEL_PROBE = NEW_LABEL;
const OLD_COMMENT = (() => {
  if (ref.includes(NEW_LABEL_PROBE)) return null; // already handed over
  const cStart = ref.indexOf(C_START);
  const cEnd = ref.indexOf(C_END);
  if (cStart < 0 || cEnd < 0) {
    console.error('FAIL: the reference suite lost its v2.442.0 hand-over comment');
    process.exit(1);
  }
  return ref.slice(cStart, cEnd + C_END.length);
})();

const NEW_COMMENT = [
  "    // the lead's story hand-over (v2.443.0, the Task 111 law's",
  "    // forty-ninth application): the head story is the hand-over's",
  "    // voice — the census becomes a door; the By Type rows lens the",
  "    // history: the By Type table landed last release as a census (a",
  "    // face that only counted) and this round its rows press through",
  "    // to the history's own lens (the door the deep-link desks",
  "    // already know, opened from the census side); a row whose wire",
  "    // type owns a lens word lands the history pre-filtered through",
  "    // the controlled hand (chooseExpType, never a direct state",
  "    // write — press the seat again and the lens releases); the",
  "    // translation lives in the ONE home (expTypeWordFor in",
  "    // tab-url.ts — the wire's UPPERCASE to the lens's kebab, and",
  "    // the NEUTRAL IS NOT A WORD: wire ALL answers null with the",
  "    // off-union rows); the active row wears the desk's emerald",
  "    // seat in both states (light 50/70, dark 500/10), the keyboard",
  "    // answers Enter and Space, and the header note names the door.",
  "    // The dark voice's grammar exits the head this round; the",
  "    // census door's seat carries the eye.",
].join('\n');

const OLD_GUARDS = [
  "    expect(head.title).toContain('dark voice');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('light and dark'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('By Type'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('withdrawn'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('census becomes a door');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('pressable'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('emerald seat'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('honest census'))).toBe(true);",
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
      console.error(`FAIL: ${suite} lost its v2.442.0 ${label}`);
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

// ── the archive door's thirty-sixth copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.442.0 hand-over: the lead tells the dark-voice story now; the';
const ARC_NEW_HEAD = '    // v2.443.0 hand-over: the lead tells the census-door story now; the';
const ARC_OLD_MID = [
  '    // archive-door story thirty-five — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.443.0');",
  "    expect(lead.title).toContain('dark voice');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('light and dark'))).toBe(true);",
].join('\n');
const ARC_NEW_MID = [
  '    // archive-door story thirty-six — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.443.0');",
  "    expect(lead.title).toContain('census becomes a door');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('pressable'))).toBe(true);",
].join('\n');

{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARC_NEW_HEAD) || OLD_COMMENT === null) {
    console.log(`${ARCHIVE}: already handed over (idempotent no-op)`);
  } else {
    for (const [label, piece] of [['head', ARC_OLD_HEAD], ['mid', ARC_OLD_MID]]) {
      if (!src.includes(piece)) {
        console.error(`FAIL: ${ARCHIVE} lost its v2.442.0 ${label}`);
        process.exit(1);
      }
    }
    src = src.split(ARC_OLD_HEAD).join(ARC_NEW_HEAD);
    src = src.split(ARC_OLD_MID).join(ARC_NEW_MID);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: hand-over written (story thirty-six)`);
  }
}

console.log(`\n${edits} hand-over(s) across ${files} file(s); a second run answers 0.`);
