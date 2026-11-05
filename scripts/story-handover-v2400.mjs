#!/usr/bin/env node
/**
 * story-handover-v2400.mjs — the v2.400.0 lead-story hand-over codemod
 * (the Task 111 law, sixth application: a fresh Write, never a sed of
 * last round's script).
 *
 * The eight ledger-admitted deep-link suites each pin the FEED HEAD's
 * story. v2.399.0's hand-over re-typed them to the health desk's env
 * doctor; v2.400.0's story — the support copy + the advisory pool's
 * first nine faces standing down — is orthogonal to it, so the
 * watchers' asserts re-type AGAIN (the established honest form: the
 * head exists, is first, and tells ITS OWN story).
 *
 * THE GUARD LAW (the Task 114 lesson, applied BEFORE trusting a re-run):
 * the idempotence guard matches a marker that exists IN the written
 * block — this round: the support-copy story marker. The version pin is
 * NEVER a valid guard (the walk re-anchors version pins BEFORE this
 * script runs).
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

const NEW_BLOCK = `describe('whats-new \u2014 v2.400.0 leads the feed', () => {
  it('the entry exists, first, with the round\\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.400.0');
    // the lead's story hand-over (v2.400.0, the Task 111 law's sixth
    // application): the head story is the support copy's \u2014 the health
    // desk's report leaves the screen as plain text (the clipboard law),
    // and the advisory pool's first nine faces stand down honestly. The
    // env-doctor story exits the head this round; the census re-types
    // honestly, again.
    expect(head.title).toContain('health');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('Copy button'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('support chat'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('strict-mode type faces'))).toBe(true);
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
  // this round: the support-copy story marker. The version pin is NOT a
  // valid guard (the walk moves the pins first; a version guard would
  // answer "already handed over" while the story still speaks last
  // round — the Task 114 lesson).
  if (block.includes("b.includes('Copy button')")) {
    console.log(`${rel}: already handed over`);
    continue;
  }
  lines.splice(start, end - start + 1, ...NEW_BLOCK.split('\n'));
  writeFileSync(abs, lines.join('\n'));
  replaced++;
  console.log(`${rel}: handed over`);
}
console.log(`blocks replaced: ${replaced}`);
