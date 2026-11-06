#!/usr/bin/env node
// story-handover-v2417.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's twenty-third application), applied
// by WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.416.0 leads the feed` block re-keys to the
// v2.417.0 story: the describe label, the hand-over prose, and the bullet
// guards move to the receive's own words ('Fill all remaining', 'short by'
// — the 'receive plan' guard rides on for the first round).
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
  "describe('whats-new — v2.416.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.417.0');",
  "    // the lead's story hand-over (v2.416.0, the Task 111 law's twenty-second",
  "    // application): the head story is the hand-over's voice — the order",
  "    // walks itself to the purchase-order desk: the banner's third face",
  "    // (Send) folds the same rows into a one-way sessionStorage pocket and",
  "    // the PO create form opens with the carried lines pre-picked under",
  "    // an amber carriage strip (lines, units, the honest dropped count),",
  "    // the pocket is consumed once at mount (a manual New PO never",
  "    // inherits a birth by accident), and the nothing-to-order law",
  "    // defends the fold too (the reorder gap is the ask).",
  "    // The order file's story exits the head this round; the",
  "    // handover carries the eye.",
  "    expect(head.title).toContain('handover');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Send button'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('restock order'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('nothing-to-order law'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.417.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.417.0');",
  "    // the lead's story hand-over (v2.417.0, the Task 111 law's twenty-third",
  "    // application): the head story is the hand-over's voice — the receive",
  "    // fills itself: the Receive dialog's pens stop being a bare wall —",
  "    // Fill all remaining tops every open pen up to its line's remaining",
  "    // units in one press (Clear all empties them, each row carries its",
  "    // own Fill), a short delivery speaks its shortfall (the amber row,",
  "    // the 'short by N' count, the amber meter), and the receive plan",
  "    // strip speaks the pass before the actor commits (emerald when the",
  "    // order completes, amber when lines run short or stay untouched,",
  "    // muted before anything is set).",
  "    // The order's handover story exits the head this round; the",
  "    // receive carries the eye.",
  "    expect(head.title).toContain('receive');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Fill all remaining'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('short by'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('receive plan strip'))).toBe(true);",
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
    console.error(`FAIL: ${suite} carries neither the v2.416.0 block nor the v2.417.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}
console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
