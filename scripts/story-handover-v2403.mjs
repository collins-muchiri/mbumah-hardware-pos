#!/usr/bin/env node
// story-handover-v2403.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's ninth application), applied by
// WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.402.0 leads the feed` block re-keys to the
// v2.403.0 story: the head version, the hand-over prose, and the bullet
// guards move to the failure's name words ('typed code', 'one shared
// home' — the 'strict-mode type faces' guard rides on).
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
  "describe('whats-new — v2.402.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.403.0');",
  "    // the lead's story hand-over (v2.402.0, the Task 111 law's eighth",
  "    // application): the head story is the payload file's — the KRA filing",
  "    // trio completes (Print = the paper, Copy = the clipboard, Download =",
  "    // the FILE), the saved face riding the receipt hop's law, and the",
  "    // refund heal suite's label widen stands 29 faces down. The support",
  "    // file's story exits the head this round; the filing trio's zebra",
  '    // ledger carries the eye.',
  "    expect(head.title).toContain('payload');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Download button'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('KRA filing'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('strict-mode type faces'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.403.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.403.0');",
  "    // the lead's story hand-over (v2.403.0, the Task 111 law's ninth",
  "    // application): the head story is the failure's name — the refund",
  "    // desk's typed refusal reaches the toast and the dialog's own amber",
  "    // card (the code under its mono badge), four silent catches speak at",
  "    // last, and the route's error ladder gains the stranded rung. The",
  "    // payload file's story exits the head this round; the voice's one",
  '    // shared home carries the eye.',
  "    expect(head.title).toContain('refund');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('typed code'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('one shared home'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('strict-mode type faces'))).toBe(true);",
  '  });',
  '});',
].join('\n');

let replaced = 0;
for (const path of SUITES) {
  const src = readFileSync(path, 'utf8');
  if (src.includes(NEW_BLOCK)) { console.log(`${path}: already handed over (no-op)`); continue; }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.402.0 story block not found (aborting, nothing written)`);
    process.exit(1);
  }
  writeFileSync(path, src.replace(OLD_BLOCK, NEW_BLOCK));
  replaced++;
  console.log(`${path}: story handed over`);
}
console.log(`\n${replaced} replaced; a second run answers 0.`);
