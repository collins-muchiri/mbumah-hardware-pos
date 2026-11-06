#!/usr/bin/env node
// story-handover-v2415.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's twenty-first application), applied
// by WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.414.0 leads the feed` block re-keys to the
// v2.415.0 story: the head version, the hand-over prose, and the bullet
// guards move to the order file's words ('Download button', 'restock order'
// — the 'nothing-to-order law' guard rides on for the second round).
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
  "describe('whats-new — v2.414.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.415.0');",
  "    // the lead's story hand-over (v2.414.0, the Task 111 law's twentieth",
  "    // application): the head story is the floor's voice — the order list",
  "    // hands you the words: the low-stock banner's Copy order button",
  "    // speaks the whole restock order as plain text (out of stock first,",
  "    // the gap math per line, ready to paste into a supplier chat), the",
  "    // honest absences hold twice (no rows → no button; the",
  "    // nothing-to-order law — an out shelf with reorder 0 asks for",
  "    // nothing and is never spoken), and the copy face rides the",
  "    // banner's amber family at rest and the emerald success family on",
  "    // the Copied beat (the support copy family's two-beat law).",
  "    // The org desk's story exits the head this round; the",
  "    // banner carries the eye.",
  "    expect(head.title).toContain('order list');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Copy order button'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('restock order'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('nothing-to-order law'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.415.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.415.0');",
  "    // the lead's story hand-over (v2.415.0, the Task 111 law's twenty-first",
  "    // application): the head story is the file's voice — the order file",
  "    // leaves the desk: the banner's pair grows the Download button and",
  "    // the SAME order bytes leave as a NAMED text file (the branch's slug,",
  "    // the date and the minute ride in the name — two branches' orders on",
  "    // the same day never argue about which file is which), the pair's",
  "    // co-mount law holds (Copy and Download mount together or not at",
  "    // all), and the Saved beat wears the same emerald success family as",
  "    // the Copied beat (the two-beat law, twice over).",
  "    // The order list's story exits the head this round; the",
  "    // file carries the eye.",
  "    expect(head.title).toContain('order file');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Download button'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('restock order'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('nothing-to-order law'))).toBe(true);",
  '  });',
  '});',
].join('\n');

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.414.0 block nor the v2.415.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}
console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
