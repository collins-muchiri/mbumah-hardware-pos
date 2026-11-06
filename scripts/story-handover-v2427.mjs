#!/usr/bin/env node
// story-handover-v2427.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// thirty-third application; the archive-door copy stays claimed inside
// the codemod — fifteen surfaces, one home), applied by WRITE (fresh
// per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.426.0 leads the feed`
// blocks re-key to the v2.427.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the shortfall's own words
// ('Follow up with {supplier}', 'never dials a dead number',
// 'the very face that records it').
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
  "describe('whats-new — v2.426.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.427.0');",
  "    // the lead's story hand-over (v2.426.0, the Task 111 law's",
  "    // thirty-second application): the head story is the hand-over's",
  "    // voice — the receipt names its maker: the receive dialog grew",
  "    // the maker chip (receive-supplier-chip, the sky census family",
  "    // the rows taught, the Truck icon, 'via {name}' — conditional:",
  "    // a wire without the maker stays silent, never a fake via) and",
  "    // the call door (receive-supplier-call — the tel: door gated on",
  "    // the maker's own phone, so a short delivery has its number",
  "    // exactly where the shortfall shows; the day's contact speaks",
  "    // through the title), the success toast names the day",
  "    // (receiveSuccessVoice's two faces — 'Items received and stock",
  "    // updated — {maker}'s goods are on the shelf', the old byte when",
  "    // the read found nothing), and the day's honest read lives in",
  "    // the receive's ONE home (receiveMaker: a trimmed non-empty name",
  "    // makes the maker, the whitespace and non-string arrivals read",
  "    // the absence — never a crash, never a dead dial).",
  "    // THE DOM'S LAW rode the same round: the detail's description",
  "    // stays phrasing content (the div-in-p hydration wound the",
  "    // opening burst caught is healed).",
  "    // The row-maker's story exits the head this round; the",
  "    // receipt's own maker carries the eye.",
  "    expect(head.title).toContain('receipt');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('via {supplier}'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('call chip dials'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('goods are on the shelf'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.427.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.427.0');",
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

// ── the archive-door suite's own shape (the fifteenth copy, still claimed) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARCHIVE_OLD = [
  '    // v2.426.0 hand-over: the lead tells the receipt\u2019s story now; the',
  '    // row-maker\u2019s story lives one entry down, the debt\u2019s two, the',
  '    // shelf-door three, the supplier-rides four, the order-blocks',
  '    // five, the supplier-lens six, the drill-mirror seven, the',
  '    // expected-day eight, the receive nine, the order-handover ten,',
  '    // the order-file eleven, the order-list twelve, the org-desk',
  '    // thirteen, the census-echoes fourteen, the census-speaks',
  '    // fifteen, the wire-answers sixteen, the desk-remembers',
  '    // seventeen, the branch-voice eighteen, the ghost-routes',
  '    // nineteen, the jump-door twenty, the shares\u2019 twenty-one, the',
  '    // archive-door story twenty-two — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.427.0');",
  "    expect(lead.title).toContain('receipt');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('via {supplier}'))).toBe(true);",
].join('\n');
const ARCHIVE_NEW = [
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
  "    expect(lead.version).toBe('2.427.0');",
  "    expect(lead.title).toContain('shortfall');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('Follow up with {supplier}'))).toBe(true);",
].join('\n');

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.426.0 block nor the v2.427.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}

// the archive door's fifteenth copy (claimed inside the codemod — Task 117's law (d))
{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARCHIVE_NEW)) {
    console.log(`${ARCHIVE}: already handed over (idempotent no-op)`);
  } else if (!src.includes(ARCHIVE_OLD)) {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.426.0 block nor the v2.427.0 block`);
    process.exit(1);
  } else {
    src = src.split(ARCHIVE_OLD).join(ARCHIVE_NEW);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: hand-over written (the fifteenth copy, claimed)`);
  }
}

console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
