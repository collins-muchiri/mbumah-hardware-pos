#!/usr/bin/env node
// story-handover-v2418.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's twenty-fourth application), applied
// by WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.417.0 leads the feed` block re-keys to the
// v2.418.0 story: the describe label, the hand-over prose, and the bullet
// guards move to the expected day's own words ('no day named', 'in 7 days'
// — the 'on-time tile' guard rides for the agreement law).
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
  "describe('whats-new — v2.417.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.418.0');",
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

const NEW_BLOCK = [
  "describe('whats-new — v2.418.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.418.0');",
  "    // the lead's story hand-over (v2.418.0, the Task 111 law's twenty-fourth",
  "    // application): the head story is the hand-over's voice — the day gets",
  "    // named: the walk's carried order opens the create dialog with an",
  "    // expected day suggested seven days out (the pen stays the actor's —",
  "    // a manual New PO keeps the empty pen), the roster's Expected Date",
  "    // cell speaks the day's own voice under every date (rose late, amber",
  "    // today, blue soon, green arrived-on-time — the metric families' own",
  "    // shades), the bare dash is retired for the honest 'no day named',",
  "    // and the received split calls the metric's own predicate (THE",
  "    // AGREEMENT LAW — a cell and a tile can never disagree).",
  "    // The receive's story exits the head this round; the",
  "    // expected day carries the eye.",
  "    expect(head.title).toContain('expected day');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('no day named'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('in 7 days'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('on-time tile'))).toBe(true);",
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
    console.error(`FAIL: ${suite} carries neither the v2.417.0 block nor the v2.418.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}
console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
