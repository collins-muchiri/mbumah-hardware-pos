#!/usr/bin/env node
/**
 * story-handover-v2397.mjs — the v2.397.0 lead-story hand-over codemod
 * (the Task 111 law, third application: a fresh Write, never a sed of
 * last round's script).
 *
 * The eight ledger-admitted deep-link suites each pin the FEED HEAD's
 * story. v2.396.0's hand-over re-typed them to the M-Pesa story;
 * v2.397.0's story — the elder loom — is orthogonal to it, so the
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

const NEW_BLOCK = `describe('whats-new — v2.397.0 leads the feed', () => {
  it('the entry exists, first, with the round\\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.397.0');
    // the lead's story hand-over (v2.397.0, the Task 111 law's third
    // application): the head story is the elder loom's — the census's 22
    // loomable faces joined the shared component, the byte-fidelity law
    // held per chip. The M-Pesa story exits the head this round; the
    // census re-types honestly, again.
    expect(head.title).toContain('loom');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('22 more desks'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('one-press dismissal'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('zero drift'))).toBe(true);
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
  const block = lines.slice(start, end + 1).join('\n');
  if (block.includes('elder loom')) { console.log(`${rel}: already handed over`); continue; }
  lines.splice(start, end - start + 1, ...NEW_BLOCK.split('\n'));
  writeFileSync(abs, lines.join('\n'));
  replaced++;
  console.log(`${rel}: story re-typed`);
}
console.log(`replaced: ${replaced}`);
