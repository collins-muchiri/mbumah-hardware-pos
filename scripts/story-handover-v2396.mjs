#!/usr/bin/env node
/**
 * story-handover-v2396.mjs — the v2.396.0 lead-story hand-over codemod
 * (the Task 111 law, second application: a fresh Write, never a sed of
 * last round's script).
 *
 * The eight ledger-admitted deep-link suites each pin the FEED HEAD's
 * story. v2.395.0's hand-over re-typed them to the receipt story;
 * v2.396.0's story — the M-Pesa statuses — is orthogonal to it, so the
 * watchers' asserts re-type AGAIN (the established honest form: the
 * head exists, is first, and tells ITS OWN story).
 *
 * Idempotent by the guard: a re-run answers 0 replacements.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILES = [
  'src/tests/bank-type-deep-link-v2387.test.ts',
  'src/tests/bank-mpesa-deep-link-v2388.test.ts',
  'src/tests/debt-status-deep-link-v2389.test.ts',
  'src/tests/debt-channel-deep-link-v2390.test.ts',
  'src/tests/exp-status-deep-link-v2391.test.ts',
  'src/tests/exp-type-deep-link-v2392.test.ts',
  'src/tests/msg-template-deep-link-v2393.test.ts',
  'src/tests/rep-type-deep-link-v2384.test.ts',
];

const NEW_BLOCK = `describe('whats-new — v2.396.0 leads the feed', () => {
  it('the entry exists, first, with the round\\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.396.0');
    // the lead's story hand-over (v2.396.0, the Task 111 law's second
    // application): the head story is the M-Pesa statuses' — the lens's
    // words became real, reachable and honest. The receipt story exits
    // the head this round; the census re-types honestly, again.
    expect(head.title).toContain('M-Pesa');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('no row lies'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('Dispute'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('every word it offers'))).toBe(true);
  });
});`;

let replaced = 0;
for (const rel of FILES) {
  const abs = new URL(`../${rel}`, import.meta.url).pathname;
  const lines = readFileSync(abs, 'utf8').split('\n');
  const start = lines.findIndex((l) => l.startsWith("describe('whats-new"));
  if (start === -1) { console.error(`${rel}: no whats-new describe`); process.exit(1); }
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i] === '});') { end = i; break; }
  }
  if (end === -1) { console.error(`${rel}: no describe end`); process.exit(1); }
  if (lines[start + 1].includes("M-Pesa statuses'")) { console.log(`${rel}: already handed over`); continue; }
  lines.splice(start, end - start + 1, ...NEW_BLOCK.split('\n'));
  writeFileSync(abs, lines.join('\n'));
  replaced++;
  console.log(`${rel}: story re-typed`);
}
console.log(`replaced: ${replaced}`);
