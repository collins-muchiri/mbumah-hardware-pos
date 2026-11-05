#!/usr/bin/env node
/**
 * story-handover-v2399.mjs — the v2.399.0 lead-story hand-over codemod
 * (the Task 111 law, fifth application: a fresh Write, never a sed of
 * last round's script).
 *
 * The eight ledger-admitted deep-link suites each pin the FEED HEAD's
 * story. v2.398.0's hand-over re-typed them to the login desk's doctor;
 * v2.399.0's story — the health desk's env doctor + the shared card loom —
 * is orthogonal to it, so the watchers' asserts re-type AGAIN (the
 * established honest form: the head exists, is first, and tells ITS OWN
 * story).
 *
 * THE GUARD LAW (the Task 114 lesson, now applied BEFORE trusting a
 * re-run): the idempotence guard matches a marker that exists IN the
 * written block — this round: the v2.399.0 version pin the block itself
 * writes. A re-run answers 0 replacements.
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

const NEW_BLOCK = `describe('whats-new \u2014 v2.399.0 leads the feed', () => {
  it('the entry exists, first, with the round\\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.399.0');
    // the lead's story hand-over (v2.399.0, the Task 111 law's fifth
    // application): the head story is the health desk's \u2014 the Environment
    // & Connection panel speaks the raw /api/health payload the uptime
    // monitors read, and the doctor card wears the shared loom. The
    // login-desk story exits the head this round; the census re-types
    // honestly, again.
    expect(head.title).toContain('health');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('Environment & Connection'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('P2021'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('shared component'))).toBe(true);
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
  // THE GUARD LAW: a marker that exists IN the written block above —
  // this round: the panel's own story marker. NOTE: the version pin is
  // NOT a valid guard — the walk's re-anchor moves `toBe('2.398.0')` →
  // `toBe('2.399.0')` BEFORE this script runs, so a version guard would
  // match a block whose STORY still speaks last round (the Task 114
  // lesson, now hit for real and fixed by matching a STORY marker).
  if (block.includes("b.includes('Environment & Connection')")) {
    console.log(`${rel}: already handed over`);
    continue;
  }
  lines.splice(start, end - start + 1, ...NEW_BLOCK.split('\n'));
  writeFileSync(abs, lines.join('\n'));
  replaced++;
  console.log(`${rel}: handed over`);
}
console.log(`blocks replaced: ${replaced}`);
