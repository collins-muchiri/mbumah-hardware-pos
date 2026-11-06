#!/usr/bin/env node
// story-handover-v2413.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's nineteenth application), applied
// by WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.412.0 leads the feed` block re-keys to the
// v2.413.0 story: the head version, the hand-over prose, and the bullet
// guards move to the org desk's words ('on the desk', 'without opening'
// — the 'strict-mode faces' guard rides on for the third round).
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
  "describe('whats-new — v2.412.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.413.0');",
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

const NEW_BLOCK = [
  "describe('whats-new — v2.413.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.413.0');",
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

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.412.0 block nor the v2.413.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}
console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
