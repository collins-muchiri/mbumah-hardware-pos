#!/usr/bin/env node
// story-handover-v2401.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's seventh application), applied by
// WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.400.0 leads the feed` block re-keys to the
// v2.401.0 story: the head version, the hand-over prose, and the bullet
// guards move from the support copy's words to the support file's
// ('Download button', 'support ticket' — the 'strict-mode type faces'
// guard rides on, the pool keeps paying its rent).
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
  "describe('whats-new — v2.400.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.400.0');",
  "    // the lead's story hand-over (v2.400.0, the Task 111 law's sixth",
  "    // application): the head story is the support copy's — the health",
  "    // desk's report leaves the screen as plain text (the clipboard law),",
  "    // and the advisory pool's first nine faces stand down honestly. The",
  '    // env-doctor story exits the head this round; the census re-types',
  '    // honestly, again.',
  "    expect(head.title).toContain('health');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Copy button'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('support chat'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('strict-mode type faces'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.401.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.401.0');",
  "    // the lead's story hand-over (v2.401.0, the Task 111 law's seventh",
  "    // application): the head story is the support file's — the health",
  "    // desk's report leaves the screen as a NAMED text file (the download",
  "    // law), and the eTIMS routes' forty-eight faces stand down honestly",
  "    // (the sandbox client now speaks the full contract). The support",
  "    // copy's story exits the head this round; the census's file-level",
  '    // count holds.',
  "    expect(head.title).toContain('health');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Download button'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('support ticket'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('strict-mode type faces'))).toBe(true);",
  '  });',
  '});',
].join('\n');

let replaced = 0;
for (const path of SUITES) {
  const src = readFileSync(path, 'utf8');
  if (src.includes(NEW_BLOCK)) { console.log(`${path}: already handed over (no-op)`); continue; }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.400.0 story block not found (aborting, nothing written)`);
    process.exit(1);
  }
  writeFileSync(path, src.replace(OLD_BLOCK, NEW_BLOCK));
  replaced++;
  console.log(`${path}: story handed over`);
}
console.log(`\n${replaced} replaced; a second run answers 0.`);
