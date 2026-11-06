#!/usr/bin/env node
// story-handover-v2420.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's twenty-sixth application), applied
// by WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.419.0 leads the feed` block re-keys to the
// v2.420.0 story: the describe label, the hand-over prose, and the bullet
// guards move to the arc's own words ('supplier lens', 'No supplier yet',
// 'same-store door' — the honest-absence guard rides for the real-group
// law).
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
  "describe('whats-new — v2.419.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.420.0');",
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

const NEW_BLOCK = [
  "describe('whats-new — v2.420.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.420.0');",
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

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_BLOCK)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${suite} carries neither the v2.419.0 block nor the v2.420.0 block`);
    process.exit(1);
  }
  src = src.split(OLD_BLOCK).join(NEW_BLOCK);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}
console.log(`\n${edits} suite(s) re-keyed across ${files} file(s). A second run answers 0.`);
