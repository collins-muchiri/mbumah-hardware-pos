#!/usr/bin/env node
// story-handover-v2428.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// thirty-fourth application; the archive-door copy stays claimed inside
// the codemod — sixteen surfaces, one home), applied by WRITE (fresh
// per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.427.0 leads the feed`
// blocks re-key to the v2.428.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the toast's own words
// ('the follow-up waits on the order', 'never points on a full receipt',
// 'the door’s own sky').
//
// The archive-door suite carries its own block shape (the comment counts
// the stories' positions down the feed) — re-keyed here too, so the next
// round's codemod finds BOTH shapes in ONE home.
//
// THE ORDER LAW: the walk's version web re-keys the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape.
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

const OLD_BLOCK = [
  "describe('whats-new — v2.427.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.428.0');",
  "    // the lead's story hand-over (v2.427.0, the Task 111 law's",
  "    // thirty-third application): the head story is the hand-over's",
  "    // voice — the shortfall's own door: the drill's Receiving",
  "    // Progress card grew the follow-up pill (po-drill-followup-call,",
  "    // the sky census family the receipt's own call door taught, the",
  "    // Phone icon, 'Follow up with {maker} — {units} units short',",
  "    // the day's contact speaking through the title — conditional:",
  "    // no maker, no phone, or nothing short and the card stays",
  "    // silent, never a fake door, never a dead dial), the door's",
  "    // honest read lives in the receive's ONE home (drillFollowUpDoor:",
  "    // the door exists only when the order OWES and the maker carries",
  "    // a real phone, the dial's grace trims even a caller-supplied",
  "    // phone), and the receive dialog stops being day-blind",
  "    // (receive-expected-day — the expected day's voice, the v2.418",
  "    // one home, the metric families' own shade, the strip conditional",
  "    // on a real day).",
  "    // The receipt's story exits the head this round; the",
  "    // shortfall's own door carries the eye.",
  "    expect(head.title).toContain('shortfall');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Follow up with {supplier}'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('never dials a dead number'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the very face that records it'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.428.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.428.0');",
  "    // the lead's story hand-over (v2.428.0, the Task 111 law's",
  "    // thirty-fourth application): the head story is the hand-over's",
  "    // voice — the toast points at the follow-up: the success toast",
  "    // grew the pointer's own second line (receiveShortfallPointer,",
  "    // the units still owed and where the follow-up waits — 'N units",
  "    // still owed — the follow-up waits on the order's face', the",
  "    // honest gate reads zero, a negative, a NaN and an infinity as",
  "    // the null — a full receipt points nowhere, never a fake",
  "    // pointer), the plan rides the submit (the pens' truth at the",
  "    // press travels with the mutation — the pointer speaks what WAS",
  "    // submitted, never a later render's guess), and the pointer",
  "    // wears the follow-up door's own sky (the conditional",
  "    // description, the byte-identical family the maker chip and the",
  "    // drill's pill taught).",
  "    // The shortfall's story exits the head this round; the",
  "    // toast's own pointer carries the eye.",
  "    expect(head.title).toContain('toast');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('the follow-up waits on the order'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('never points on a full receipt'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the door\\u2019s own sky'))).toBe(true);",
  '  });',
  '});',
].join('\n');

// ── the archive-door suite's own shape (the sixteenth copy, still claimed) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARCHIVE_OLD = [
  '    // v2.427.0 hand-over: the lead tells the shortfall\u2019s story now;',
  '    // the receipt\u2019s story lives one entry down, the row-maker\u2019s',
  '    // two, the debt\u2019s three, the shelf-door four, the',
  '    // supplier-rides five, the order-blocks six, the supplier-lens',
  '    // seven, the drill-mirror eight, the expected-day nine, the',
  '    // receive ten, the order-handover eleven, the order-file twelve,',
  '    // the order-list thirteen, the org-desk fourteen, the',
  '    // census-echoes fifteen, the census-speaks sixteen, the',
  '    // wire-answers seventeen, the desk-remembers eighteen, the',
  '    // branch-voice nineteen, the ghost-routes twenty, the jump-door',
  '    // twenty-one, the shares\u2019 twenty-two, the archive-door story',
  '    // twenty-three — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.428.0');",
  "    expect(lead.title).toContain('shortfall');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('Follow up with {supplier}'))).toBe(true);",
].join('\n');
const ARCHIVE_NEW = [
  '    // v2.428.0 hand-over: the lead tells the toast\u2019s story now; the',
  '    // shortfall\u2019s story lives one entry down, the receipt\u2019s two, the',
  '    // row-maker\u2019s three, the debt\u2019s four, the shelf-door five, the',
  '    // supplier-rides six, the order-blocks seven, the supplier-lens',
  '    // eight, the drill-mirror nine, the expected-day ten, the',
  '    // receive eleven, the order-handover twelve, the order-file',
  '    // thirteen, the order-list fourteen, the org-desk fifteen, the',
  '    // census-echoes sixteen, the census-speaks seventeen, the',
  '    // wire-answers eighteen, the desk-remembers nineteen, the',
  '    // branch-voice twenty, the ghost-routes twenty-one, the',
  '    // jump-door twenty-two, the shares\u2019 twenty-three, the',
  '    // archive-door story twenty-four — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.428.0');",
  "    expect(lead.title).toContain('toast');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('the follow-up waits on the order'))).toBe(true);",
].join('\n');

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.427.0 block nor the v2.428.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}

// the archive door's sixteenth copy (claimed inside the codemod — Task 117's law (d))
{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARCHIVE_NEW)) {
    console.log(`${ARCHIVE}: already handed over (idempotent no-op)`);
  } else if (!src.includes(ARCHIVE_OLD)) {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.427.0 block nor the v2.428.0 block`);
    process.exit(1);
  } else {
    src = src.split(ARCHIVE_OLD).join(ARCHIVE_NEW);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: hand-over written (the sixteenth copy, claimed)`);
  }
}

console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
