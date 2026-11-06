#!/usr/bin/env node
// story-handover-v2412.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's eighteenth application), applied
// by WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.411.0 leads the feed` block re-keys to the
// v2.412.0 story: the head version, the hand-over prose, and the bullet
// guards move to the echo's words ('the same rate census', 'Set rate action'
// — the 'strict-mode faces' guard rides on for the second round).
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
  "describe('whats-new — v2.411.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.412.0');",
  "    // the lead's story hand-over (v2.411.0, the Task 111 law's seventeenth",
  "    // application): the head story is the census's voice — v2.410.0's rate",
  "    // census strip gains its honest follow-through: an all-factory census",
  "    // renders a quiet amber invitation naming the door that fixes it (the",
  "    // Exchange Rates card on the System tab), a maintained census stays",
  "    // silent (no nagging), the strip's tone follows its census, and the",
  "    // payroll engine's six money inputs are coerced at the boundary",
  "    // (eight strict-mode faces stand down).",
  "    // The wire's story exits the head this round; the census",
  "    // carries the eye.",
  "    expect(head.title).toContain('census speaks first');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('factory figure'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('amber invitation'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('strict-mode faces'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.412.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.412.0');",
  "    // the lead's story hand-over (v2.412.0, the Task 111 law's eighteenth",
  "    // application): the head story is the echo's voice — the census",
  "    // reaches the door it named: the Exchange Rates admin card renders",
  "    // the same rate census the top-bar dropdown shows (same wire, the",
  "    // same pure voices), the card's own amber invitation names the",
  "    // action instead of the door (set one with the Set rate action),",
  "    // a maintained census silences both voices, and the credits ledger's",
  "    // print handler speaks the row the desk actually hands it (four",
  "    // strict-mode faces stand down).",
  "    // The census's story exits the head this round; the echo",
  "    // carries the eye.",
  "    expect(head.title).toContain('census echoes');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('the same rate census'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('Set rate action'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('strict-mode faces'))).toBe(true);",
  '  });',
  '});',
].join('\n');

let files = 0, edits = 0;
// REPAIR LEG: the first write shipped one block line without its `//`
// marker (a bare string statement — the parser's 8 faces). If a suite
// carries the broken shape, repair it to the fixed block first.
const BROKEN_LINE = "the census\n  reaches the door it named: the Exchange Rates admin card renders\n    // the same rate census";
const FIXED_LINE = "the census\n    // reaches the door it named: the Exchange Rates admin card renders\n    // the same rate census";
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(BROKEN_LINE)) {
    src = src.split(BROKEN_LINE).join(FIXED_LINE);
    writeFileSync(suite, src);
    files++;
    edits++;
    console.log(`${suite}: broken block line repaired`);
  }
}
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.411.0 block nor the v2.412.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}
console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
