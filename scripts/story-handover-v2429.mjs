#!/usr/bin/env node
// story-handover-v2429.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// thirty-fifth application; the archive-door copy stays claimed inside
// the codemod — seventeen surfaces, one home), applied by WRITE (fresh
// per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.428.0 leads the feed`
// blocks re-key to the v2.429.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the echo's own words
// ('named by the last receipt', 'the callback belongs to the short
// receipt', 'the door the toast pointed at').
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
  "describe('whats-new — v2.428.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.429.0');",
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

const NEW_BLOCK = [
  "describe('whats-new — v2.429.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.429.0');",
  "    // the lead's story hand-over (v2.429.0, the Task 111 law's",
  "    // thirty-fifth application): the head story is the hand-over's",
  "    // voice — the follow-up answers the toast: the drill's pill",
  "    // wears the echo (receiveShortfallEcho — 'named by the last",
  "    // receipt', the honest gate mirrors the pointer's own: a null,",
  "    // a zero, or a number that is not one reads the null — never a",
  "    // fake echo, never an echo on a full receipt), the callback",
  "    // crosses the close (the ReceiveItemsDialog's additive +",
  "    // optional onShortSubmit hands the drill the receipt's own",
  "    // truth — the short units when the pointer speaks, the honest",
  "    // null when the receipt was full — the echo belongs to the",
  "    // short receipt alone, and the drill's close ends the arc, a",
  "    // reopened drill starts honest), and the paint deepens (the",
  "    // ring-2 sky-400 echo ring over the plain census ring, the echo",
  "    // line's byte-identical sky family one home with the pointer's",
  "    // words).",
  "    // The toast's story exits the head this round; the",
  "    // echo's own answer carries the eye.",
  "    expect(head.title).toContain('echo');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('named by the last receipt'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the callback belongs to the short receipt'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the door the toast pointed at'))).toBe(true);",
  '  });',
  '});',
].join('\n');

// ── the archive-door suite's own shape (the seventeenth copy, still claimed) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARCHIVE_OLD = [
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
  "    expect(lead.version).toBe('2.429.0');",
  "    expect(lead.title).toContain('toast');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('the follow-up waits on the order'))).toBe(true);",
].join('\n');
const ARCHIVE_NEW = [
  '    // v2.429.0 hand-over: the lead tells the echo\u2019s story now; the',
  '    // toast\u2019s story lives one entry down, the shortfall\u2019s two, the',
  '    // receipt\u2019s three, the row-maker\u2019s four, the debt\u2019s five, the',
  '    // shelf-door six, the supplier-rides seven, the order-blocks',
  '    // eight, the supplier-lens nine, the drill-mirror ten, the',
  '    // expected-day eleven, the receive twelve, the order-handover',
  '    // thirteen, the order-file fourteen, the order-list fifteen,',
  '    // the org-desk sixteen, the census-echoes seventeen, the',
  '    // census-speaks eighteen, the wire-answers nineteen, the',
  '    // desk-remembers twenty, the branch-voice twenty-one, the',
  '    // ghost-routes twenty-two, the jump-door twenty-three, the',
  '    // shares\u2019 twenty-four, the archive-door story twenty-five —',
  '    // all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.429.0');",
  "    expect(lead.title).toContain('echo');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('named by the last receipt'))).toBe(true);",
].join('\n');

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.428.0 block nor the v2.429.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}

// the archive door's seventeenth copy (claimed inside the codemod — Task 117's law (d))
{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARCHIVE_NEW)) {
    console.log(`${ARCHIVE}: already handed over (idempotent no-op)`);
  } else if (!src.includes(ARCHIVE_OLD)) {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.428.0 block nor the v2.429.0 block`);
    process.exit(1);
  } else {
    src = src.split(ARCHIVE_OLD).join(ARCHIVE_NEW);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: hand-over written (the seventeenth copy, claimed)`);
  }
}

console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
