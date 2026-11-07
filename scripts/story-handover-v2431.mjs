#!/usr/bin/env node
// story-handover-v2431.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// thirty-seventh application; the archive-door copy stays claimed inside
// the codemod — nineteen surfaces, one home), applied by WRITE (fresh
// per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.430.0 leads the feed`
// blocks re-key to the v2.431.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the echo's own words
// ('answers the walk', 'agreement is no news',
// 'never names a live order').
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
  "describe('whats-new — v2.430.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.431.0');",
  "    // the lead's story hand-over (v2.430.0, the Task 111 law's",
  "    // thirty-sixth application): the head story is the hand-over's",
  "    // voice — the census opens: the inventory banner's census chip",
  "    // became the door (orderSupplierBlocks — the census's own",
  "    // grouping, pure: rows by trimmed maker, sorted by name, units",
  "    // summed over the gaps; an unnamed row never invents a block,",
  "    // and a block whose whole ask is zero is refused — the",
  "    // nothing-to-order law, per block), the trigger wears the",
  "    // v2.421 census bytes with the chevron the door's one new word",
  "    // (one item per maker carrying the block's own line-and-unit",
  "    // census — the chip's number and the menu's items share the",
  "    // same rows, the two can never disagree), each press folds ONLY",
  "    // that maker's rows into the same pocket the whole order uses",
  "    // (buildOrderHandoff over block.rows, the one-way write, the",
  "    // walk, the receipt naming the maker), and the whole-order Send",
  "    // keeps its own face beside the door.",
  "    // The echo's story exits the head this round; the",
  "    // census's own door carries the eye.",
  "    expect(head.title).toContain('census');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('one block per supplier'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('never invents a block'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the receipt names the maker'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.431.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.431.0');",
  "    // the lead's story hand-over (v2.431.0, the Task 111 law's",
  "    // thirty-seventh application): the head story is the hand-over's",
  "    // voice — the desk answers the walk: the carriage strip on the",
  "    // purchase order desk wears the pocket's own word",
  "    // (orderHandoffPocketEcho — the strip's gate over the envelope's",
  "    // every-line-agrees maker read once as the map lands; agreement",
  "    // is no news — the pre-pick speaking the same name quiets the",
  "    // echo; a null, an empty, or a whitespace pocket reads the null,",
  "    // and the spoken name is the census's trimmed form), the amber",
  "    // chip rides the strip's header (\"the walk named {maker}\" — the",
  "    // walk's own house, never the pre-pick's sky) with the echo",
  "    // line's quote-border under the counts, the digest carries the",
  "    // pocket census beside the counts so the echo survives the",
  "    // one-way consumption, and the WORDS-ONLY law holds at the pen",
  "    // (the v2.422 derivation byte-identical — the shelf's live link",
  "    // or the actor's own call stays the only voice the select wears).",
  "    // The census's story exits the head this round; the",
  "    // echo's own answer carries the eye.",
  "    expect(head.title).toContain('echo');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('answers the walk'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('agreement is no news'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('never names a live order'))).toBe(true);",
  '  });',
  '});',
].join('\n');

// ── the archive-door suite's own shape (the nineteenth copy, still claimed) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARCHIVE_OLD = [
  '    // v2.430.0 hand-over: the lead tells the census\u2019s story now; the',
  '    // echo\u2019s story lives one entry down, the toast\u2019s two, the',
  '    // shortfall\u2019s three, the receipt\u2019s four, the row-maker\u2019s five,',
  '    // the debt\u2019s six, the shelf-door seven, the supplier-rides',
  '    // eight, the order-blocks nine, the supplier-lens ten, the',
  '    // drill-mirror eleven, the expected-day twelve, the receive',
  '    // thirteen, the order-handover fourteen, the order-file fifteen,',
  '    // the order-list sixteen, the org-desk seventeen, the',
  '    // census-echoes eighteen, the census-speaks nineteen, the',
  '    // wire-answers twenty, the desk-remembers twenty-one, the',
  '    // branch-voice twenty-two, the ghost-routes twenty-three, the',
  '    // jump-door twenty-four, the shares\u2019 twenty-five, the',
  '    // archive-door story twenty-six — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.431.0');",
  "    expect(lead.title).toContain('census');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('one block per supplier'))).toBe(true);",
].join('\n');
const ARCHIVE_NEW = [
  '    // v2.431.0 hand-over: the lead tells the echo\u2019s story now; the',
  '    // census\u2019s story lives one entry down, the toast\u2019s two, the',
  '    // shortfall\u2019s three, the receipt\u2019s four, the row-maker\u2019s five,',
  '    // the debt\u2019s six, the shelf-door seven, the supplier-rides',
  '    // eight, the order-blocks nine, the supplier-lens ten, the',
  '    // drill-mirror eleven, the expected-day twelve, the receive',
  '    // thirteen, the order-handover fourteen, the order-file fifteen,',
  '    // the order-list sixteen, the org-desk seventeen, the',
  '    // census-echoes eighteen, the census-speaks nineteen, the',
  '    // wire-answers twenty, the desk-remembers twenty-one, the',
  '    // branch-voice twenty-two, the ghost-routes twenty-three, the',
  '    // jump-door twenty-four, the shares\u2019 twenty-five, the',
  '    // archive-door story twenty-six — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.431.0');",
  "    expect(lead.title).toContain('echo');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('answers the walk'))).toBe(true);",
].join('\n');

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.430.0 block nor the v2.431.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}

// the archive door's nineteenth copy (claimed inside the codemod — Task 117's law (d))
{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARCHIVE_NEW)) {
    console.log(`${ARCHIVE}: already handed over (idempotent no-op)`);
  } else if (!src.includes(ARCHIVE_OLD)) {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.430.0 block nor the v2.431.0 block`);
    process.exit(1);
  } else {
    src = src.split(ARCHIVE_OLD).join(ARCHIVE_NEW);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: hand-over written (the nineteenth copy, claimed)`);
  }
}

console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
