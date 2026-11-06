#!/usr/bin/env node
// story-handover-v2422.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// twenty-eighth application; the archive-door copy stays claimed inside
// the codemod — ten surfaces, one home), applied by WRITE (fresh per
// round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.421.0 leads the feed`
// blocks re-key to the v2.422.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the arc's own words ('supplier
// pen', 'No supplier yet', 'stale pocket never names a live order').
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
  "describe('whats-new — v2.421.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.422.0');",
  "    // the lead's story hand-over (v2.421.0, the Task 111 law's twenty-seventh",
  "    // application): the head story is the hand-over's voice — the restock",
  "    // order rides with its supplier: the banner's copy/download faces group",
  "    // the order into per-supplier blocks when the rows' world names ANY",
  "    // supplier (named blocks alphabetical, the honest-absence block",
  "    // 'No supplier yet:' always LAST, the selector's own sort holding",
  "    // inside every block, a blank line between blocks, the header and the",
  "    // count line staying global), a world that never names suppliers reads",
  "    // the FLAT order byte-for-byte as v2.414 shipped it (the formatter",
  "    // never invents a fact the caller didn't hand it), the banner wears",
  "    // the census chip ('via N suppliers', the sky family, only when",
  "    // earned), and the copy button's title tells the truth about the",
  "    // blocks.",
  "    // The supplier lens's story exits the head this round; the",
  "    // order's blocks carry the eye.",
  "    expect(head.title).toContain('supplier');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('ONE BLOCK PER SUPPLIER'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('No supplier yet'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('never invents a fact'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.422.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.422.0');",
  "    // the lead's story hand-over (v2.422.0, the Task 111 law's twenty-eighth",
  "    // application): the head story is the hand-over's voice — the walk's",
  "    // order knows its maker: the banner's Send face folds the supplier",
  "    // names into the handoff pocket (every line's maker rides, absent",
  "    // lines ride null) and the purchase-order desk's create form dresses",
  "    // the supplier pen itself when every carried line names the same",
  "    // maker (the walk's order arrives supplier-aware — the shelf's own",
  "    // link is the only voice, a stale pocket never names a live order);",
  "    // two makers, or a maker and an absence, and the pen stays the",
  "    // actor's (the honest absence, never a majority's guess). The",
  "    // carriage strip wears the sky chip ('via {name}') and speaks 'the",
  "    // order names {name}' — the chip retires the moment the actor names",
  "    // a different supplier — and the send toast speaks 'for {name}'.",
  "    // The order-blocks story exits the head this round; the",
  "    // supplier's ride carries the eye.",
  "    expect(head.title).toContain('maker');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('supplier pen'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('No supplier yet'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('stale pocket never names a live order'))).toBe(true);",
  '  });',
  '});',
].join('\n');

// ── the archive-door suite's own shape (the tenth copy, still claimed) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARCHIVE_OLD = [
  '    // v2.421.0 hand-over: the lead tells the order-blocks story now; the',
  '    // supplier-lens story lives one entry down, the drill-mirror two, the',
  '    // expected-day three, the receive four, the order-handover five, the',
  '    // order-file six, the order-list seven, the org-desk eight, the',
  '    // census-echoes nine, the census-speaks ten, the wire-answers',
  '    // eleven, the desk-remembers twelve, the branch-voice thirteen, the',
  '    // ghost-routes fourteen, the jump-door fifteen, the shares\' sixteen,',
  '    // the archive-door story seventeen — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.422.0');",
  "    expect(lead.title).toContain('supplier');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('No supplier yet'))).toBe(true);",
].join('\n');
const ARCHIVE_NEW = [
  '    // v2.422.0 hand-over: the lead tells the supplier-rides story now; the',
  '    // order-blocks story lives one entry down, the supplier-lens two, the',
  '    // drill-mirror three, the expected-day four, the receive five, the',
  '    // order-handover six, the order-file seven, the order-list eight, the',
  '    // org-desk nine, the census-echoes ten, the census-speaks eleven, the',
  '    // wire-answers twelve, the desk-remembers thirteen, the branch-voice',
  '    // fourteen, the ghost-routes fifteen, the jump-door sixteen, the',
  '    // shares\' seventeen, the archive-door story eighteen — all still in',
  '    // the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.422.0');",
  "    expect(lead.title).toContain('supplier');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('No supplier yet'))).toBe(true);",
].join('\n');

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.421.0 block nor the v2.422.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}

// the archive door's tenth copy (claimed inside the codemod — Task 117's law (d))
{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARCHIVE_NEW)) {
    console.log(`${ARCHIVE}: already handed over (idempotent no-op)`);
  } else if (!src.includes(ARCHIVE_OLD)) {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.421.0 block nor the v2.422.0 block`);
    process.exit(1);
  } else {
    src = src.split(ARCHIVE_OLD).join(ARCHIVE_NEW);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: hand-over written (the tenth copy, claimed)`);
  }
}

console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
