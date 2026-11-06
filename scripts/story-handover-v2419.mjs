#!/usr/bin/env node
// story-handover-v2419.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's twenty-fifth application), applied
// by WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.418.0 leads the feed` block re-keys to the
// v2.419.0 story: the describe label, the hand-over prose, and the bullet
// guards move to the drill's own words ('fully received',
// 'nothing received yet' — the 'mirror law' guard rides for the one-read
// agreement).
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
  "describe('whats-new — v2.418.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.419.0');",
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

const NEW_BLOCK = [
  "describe('whats-new — v2.419.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.419.0');",
  "    // the lead's story hand-over (v2.419.0, the Task 111 law's twenty-fifth",
  "    // application): the head story is the hand-over's voice — the drill",
  "    // wears the receive's truth: the PO desk's line rows read the SAME",
  "    // one home the receive dialog reads (the committed truth, the pen at",
  "    // rest — never a second copy of the arithmetic), so a fully received",
  "    // line speaks 'fully received' in the emerald family, a short line",
  "    // speaks its shortfall COUNTED ('short by N units') in the amber",
  "    // family, an untouched line speaks 'nothing received yet' (the bare",
  "    // 'Partial' word retired), every line carries the dialog's own meter",
  "    // (role=img, aria-labelled), and the Receiving Progress card speaks",
  "    // the plan's truth — 'the order completes' when every line is closed.",
  "    // The expected day's story exits the head this round; the",
  "    // drill's mirror carries the eye.",
  "    expect(head.title).toContain('drill');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('fully received'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('nothing received yet'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('mirror law'))).toBe(true);",
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
    console.error(`FAIL: ${suite} carries neither the v2.418.0 block nor the v2.419.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}
console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
