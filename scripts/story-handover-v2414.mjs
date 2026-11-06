#!/usr/bin/env node
// story-handover-v2414.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's twentieth application), applied
// by WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.413.0 leads the feed` block re-keys to the
// v2.414.0 story: the head version, the hand-over prose, and the bullet
// guards move to the order list's words ('Copy order button',
// 'nothing-to-order law' — the new guard rides, the old ones exit).
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
  "describe('whats-new — v2.413.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.414.0');",
  "    // the lead's story hand-over (v2.413.0, the Task 111 law's nineteenth",
  "    // application): the head story is the org desk's voice — the census",
  "    // rides the Organization Console: the same provenance census under",
  "    // the header row (N admin-set · N API · N built-in beside the age",
  "    // dot) spoken without opening the currency menu — one shared cache,",
  "    // the observer law (the strip never fetches), the quiet neutral",
  "    // surface kept because the amber invitation is the actor's voice,",
  "    // and the password-rotation guard's type shrinks to what it reads",
  "    // (six strict-mode faces stand down).",
  "    // The echo's story exits the head this round; the desk",
  "    // carries the eye.",
  "    expect(head.title).toContain('org desk');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('on the desk'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('without opening'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('strict-mode faces'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.414.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.414.0');",
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

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.413.0 block nor the v2.414.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}
console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
