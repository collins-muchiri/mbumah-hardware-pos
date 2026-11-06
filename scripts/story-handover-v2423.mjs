#!/usr/bin/env node
// story-handover-v2423.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// twenty-ninth application; the archive-door copy stays claimed inside
// the codemod — eleven surfaces, one home), applied by WRITE (fresh per
// round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.422.0 leads the feed`
// blocks re-key to the v2.423.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the shelf's own words ('the
// Products chip grew the PRESS', 'provides nothing yet', 'stale row
// never rides').
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
  "describe('whats-new — v2.422.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.423.0');",
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

const NEW_BLOCK = [
  "describe('whats-new — v2.423.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.423.0');",
  "    // the lead's story hand-over (v2.423.0, the Task 111 law's twenty-ninth",
  "    // application): the head story is the hand-over's voice — the",
  "    // supplier opens its shelf: the Products chip grows the PRESS and a",
  "    // right-side shelf drill answers 'what does this supplier provide'",
  "    // without leaving the roster (the row's own click stays the detail",
  "    // drill; the zero chip's press keeps its honest empty face —",
  "    // 'provides nothing yet'). The summary reads the grouping strip's",
  "    // OWN reduce keyed to the supplier (one home — a stale wire row",
  "    // never rides another supplier's shelf), the rows wear the",
  "    // inventory desk's low-stock family (out / low / ok, the owed units",
  "    // floored at zero), and the wire grew the door too (/products",
  "    // answers ONE supplier's roster — the drill never downloads the",
  "    // whole catalog).",
  "    // The supplier-rides story exits the head this round; the",
  "    // shelf's door carries the eye.",
  "    expect(head.title).toContain('shelf');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('PRESS'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('provides nothing yet'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('stale row never rides'))).toBe(true);",
  '  });',
  '});',
].join('\n');

// ── the archive-door suite's own shape (the eleventh copy, still claimed) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARCHIVE_OLD = [
  '    // v2.422.0 hand-over: the lead tells the supplier-rides story now; the',
  '    // order-blocks story lives one entry down, the supplier-lens two, the',
  '    // drill-mirror three, the expected-day four, the receive five, the',
  '    // order-handover six, the order-file seven, the order-list eight, the',
  '    // org-desk nine, the census-echoes ten, the census-speaks eleven, the',
  '    // wire-answers twelve, the desk-remembers thirteen, the branch-voice',
  '    // fourteen, the ghost-routes fifteen, the jump-door sixteen, the',
  "    // shares' seventeen, the archive-door story eighteen — all still in",
  '    // the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.423.0');",
  "    expect(lead.title).toContain('supplier');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('No supplier yet'))).toBe(true);",
].join('\n');
const ARCHIVE_NEW = [
  '    // v2.423.0 hand-over: the lead tells the shelf-door story now; the',
  '    // supplier-rides story lives one entry down, the order-blocks two, the',
  '    // supplier-lens three, the drill-mirror four, the expected-day five,',
  '    // the receive six, the order-handover seven, the order-file eight,',
  '    // the order-list nine, the org-desk ten, the census-echoes eleven,',
  '    // the census-speaks twelve, the wire-answers thirteen, the',
  '    // desk-remembers fourteen, the branch-voice fifteen, the ghost-routes',
  '    // sixteen, the jump-door seventeen, the shares\u2019 eighteen, the',
  '    // archive-door story nineteen — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.423.0');",
  "    expect(lead.title).toContain('shelf');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('provides nothing yet'))).toBe(true);",
].join('\n');

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.422.0 block nor the v2.423.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}

// the archive door's eleventh copy (claimed inside the codemod — Task 117's law (d))
{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARCHIVE_NEW)) {
    console.log(`${ARCHIVE}: already handed over (idempotent no-op)`);
  } else if (!src.includes(ARCHIVE_OLD)) {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.422.0 block nor the v2.423.0 block`);
    process.exit(1);
  } else {
    src = src.split(ARCHIVE_OLD).join(ARCHIVE_NEW);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: hand-over written (the eleventh copy, claimed)`);
  }
}

console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
