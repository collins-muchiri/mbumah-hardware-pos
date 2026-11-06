#!/usr/bin/env node
// story-handover-v2421.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// twenty-seventh application — and, per Task 117's law (d), the codemod
// now CLAIMS the archive-door's own block: nine surfaces, one home),
// applied by WRITE (fresh per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.420.0 leads the feed`
// blocks re-key to the v2.421.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the arc's own words ('blocks
// face', 'No supplier yet', 'one block per supplier').
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
  "describe('whats-new — v2.420.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.421.0');",
  "    // the lead's story hand-over (v2.420.0, the Task 111 law's twenty-sixth",
  "    // application): the head story is the hand-over's voice — the shelf",
  "    // remembers its supplier: the Product schema grows its own nullable",
  "    // supplierId (the honest absence — no backfill, no row lies), the ONE",
  "    // arithmetic home groups the shelf by supplier with the Decimal grace",
  "    // carried, the inventory desk wears the sky lens strip (every supplier",
  "    // a card — products, units, shelf value; one press filters the roster),",
  "    // the 'No supplier yet' card is a REAL group for the unassigned",
  "    // (never hidden, never guessed a name), named rows carry the quiet",
  "    // 'via Supplier' sub-line, both form faces grow the supplier select",
  "    // behind the wires' SAME-STORE DOOR (a cross-store assignment is",
  "    // refused, never guessed; '' clears honestly), and the suppliers",
  "    // desk answers with its Products chip and CSV column.",
  "    // The drill's mirror story exits the head this round; the",
  "    // supplier's lens carries the eye.",
  "    expect(head.title).toContain('supplier');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('supplier lens'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('No supplier yet'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('same-store door'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.421.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.421.0');",
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

// ── the archive-door suite's own shape (the ninth copy, now claimed) ────
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARCHIVE_OLD = [
  '    // v2.420.0 hand-over: the lead tells the supplier-lens story now; the',
  '    // drill-mirror story lives one entry down, the expected-day two, the',
  '    // receive three, the order-handover four, the order-file five, the',
  '    // order-list six, the org-desk seven, the census-echoes eight, the',
  '    // census-speaks nine, the wire-answers ten, the desk-remembers',
  '    // eleven, the branch-voice twelve, the ghost-routes thirteen, the',
  '    // jump-door fourteen, the shares\' fifteen, the archive-door story',
  '    // sixteen — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.421.0');",
  "    expect(lead.title).toContain('supplier');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('No supplier yet'))).toBe(true);",
].join('\n');
const ARCHIVE_NEW = [
  '    // v2.421.0 hand-over: the lead tells the order-blocks story now; the',
  '    // supplier-lens story lives one entry down, the drill-mirror two, the',
  '    // expected-day three, the receive four, the order-handover five, the',
  '    // order-file six, the order-list seven, the org-desk eight, the',
  '    // census-echoes nine, the census-speaks ten, the wire-answers',
  '    // eleven, the desk-remembers twelve, the branch-voice thirteen, the',
  "    // ghost-routes fourteen, the jump-door fifteen, the shares' sixteen,",
  '    // the archive-door story seventeen — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.421.0');",
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
    console.error(`FAIL: ${suite} carries neither the v2.420.0 block nor the v2.421.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}

// the archive door's ninth copy (claimed this round — Task 117's law (d))
{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARCHIVE_NEW)) {
    console.log(`${ARCHIVE}: already handed over (idempotent no-op)`);
  } else if (!src.includes(ARCHIVE_OLD)) {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.420.0 block nor the v2.421.0 block`);
    process.exit(1);
  } else {
    src = src.split(ARCHIVE_OLD).join(ARCHIVE_NEW);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: hand-over written (the ninth copy, claimed)`);
  }
}

console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
