#!/usr/bin/env node
// story-handover-v2404.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's tenth application), applied by
// WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.403.0 leads the feed` block re-keys to the
// v2.404.0 story: the head version, the hand-over prose, and the bullet
// guards move to the archive-door words ('Open the release archive',
// 'Release notes' — the 'proves the session honestly' guard rides on).
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
  "describe('whats-new — v2.403.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.404.0');",
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

const NEW_BLOCK = [
  "describe('whats-new — v2.404.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.404.0');",
  "    // the lead's story hand-over (v2.404.0, the Task 111 law's tenth",
  "    // application): the head story is the archive door — the main shell",
  "    // mounts the SAME ChangelogModal (one shared archive, exactly one",
  "    // mount), the whats-new announcement gains its handle (jumpTo =",
  "    // APP_VERSION, the orange ring lands), and the footer's Release",
  "    // notes door opens the archive from the top. The failure's name",
  "    // story exits the head this round; the landing glow carries the eye.",
  "    expect(head.title).toContain('archive door');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Open the release archive'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('Release notes'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('proves the session honestly'))).toBe(true);",
  '  });',
  '});',
].join('\n');

let replaced = 0;
for (const path of SUITES) {
  const src = readFileSync(path, 'utf8');
  if (src.includes(NEW_BLOCK)) { console.log(`${path}: already handed over (no-op)`); continue; }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.403.0 story block not found (aborting, nothing written)`);
    process.exit(1);
  }
  writeFileSync(path, src.replace(OLD_BLOCK, NEW_BLOCK));
  replaced++;
  console.log(`${path}: story handed over`);
}
console.log(`\n${replaced} replaced; a second run answers 0.`);
