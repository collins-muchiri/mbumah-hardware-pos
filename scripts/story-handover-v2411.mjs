#!/usr/bin/env node
// story-handover-v2411.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's seventeenth application), applied
// by WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.410.0 leads the feed` block re-keys to the
// v2.411.0 story: the head version, the hand-over prose, and the bullet
// guards move to the census's words ('factory figures', 'amber invitation'
// — the 'strict-mode faces' guard rides on).
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
  "describe('whats-new — v2.410.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.411.0');",
  "    // the lead's story hand-over (v2.410.0, the Task 111 law's sixteenth",
  "    // application): the head story is the wire's voice — BUG 1, carried",
  "    // since Task 125, closed with four instrumented browser bursts: the",
  "    // switcher's open-gated queries never fetched on the console and org",
  "    // desks (menu open, zero requests), so the wires answer on mount and",
  "    // the open is pure display again; the footer's rate census strip",
  "    // counts the rows by provenance beside an age voice, and the",
  "    // dropdown wears its styling round.",
  "    // The desk's story exits the head this round; the wire",
  "    // carries the eye.",
  "    expect(head.title).toContain('wire answers');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('open-gated queries never fetched'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('census strip'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('emerald rail'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.411.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.411.0');",
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

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.410.0 block nor the v2.411.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}
console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
