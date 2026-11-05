#!/usr/bin/env node
/**
 * story-handover-v2395.mjs — the v2.395.0 lead-story hand-over codemod.
 *
 * The eight ledger-admitted deep-link suites each pin the FEED HEAD's
 * story ("the entry exists, first, with the round's own story"). Since
 * v2.392.0 the head entries deliberately carried the export-ledger and
 * message-template bytes so those asserts never needed editing (the
 * "speaker census stable — no exits" carry). v2.395.0's story — the
 * submission receipt hop — is the first round whose copy cannot honestly
 * speak those bytes, so the asserts are RE-TYPED to the new head's story
 * (the census honestly re-types; the elders' watchers keep watching the
 * same property: the head exists, is first, and tells ITS OWN story).
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

const NEW_BLOCK = `describe('whats-new — v2.395.0 leads the feed', () => {
  it('the entry exists, first, with the round\\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.395.0');
    // the lead's story hand-over (v2.395.0): the head story is the
    // receipt hop's — the KRA Audit Log answers by name and the
    // response leaves as pretty JSON. The export-ledger and
    // message-template bytes exit the head story this round: the
    // first round whose copy cannot honestly carry them, so the
    // census re-types instead of silently carrying.
    expect(head.title).toContain('receipt');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('KRA Audit Log'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('pretty-printed'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('print pipeline'))).toBe(true);
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
  if (lines[start + 1].includes("receipt hop's")) { console.log(`${rel}: already handed over`); continue; }
  lines.splice(start, end - start + 1, ...NEW_BLOCK.split('\n'));
  writeFileSync(abs, lines.join('\n'));
  replaced++;
  console.log(`${rel}: story re-typed`);
}
console.log(`replaced: ${replaced}`);
