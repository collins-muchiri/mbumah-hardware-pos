#!/usr/bin/env node
// story-handover-v2406.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's twelfth application), applied by
// WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.405.0 leads the feed` block re-keys to the
// v2.406.0 story: the head version, the hand-over prose, and the bullet
// guards move to the jump-door words ('via cmd+K', 'no pill' — the
// 'strict-mode faces' guard rides on).
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
  "describe('whats-new — v2.405.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.406.0');",
  "    // the lead's story hand-over (v2.405.0, the Task 111 law's eleventh",
  "    // application): the head story is the shares' voice — the org desk's",
  "    // slice modal hands you the branch ledger (Copy beside the total, one",
  "    // pure formatter, the quiet zeroes never dropped), the rows ride the",
  "    // zebra and the share chips wear the mono badge, and the wire's",
  "    // honest nulls stop at the door. The archive door's story exits the",
  "    // head this round; the clipboard carries the eye.",
  "    expect(head.title).toContain('shares speak');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Copy button'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('one pure formatter'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('strict-mode faces'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.406.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.406.0');",
  "    // the lead's story hand-over (v2.406.0, the Task 111 law's twelfth",
  "    // application): the head story is the door's voice — the changelog",
  "    // pill speaks the route you came by (the JUMP_DOORS pure map: the",
  "    // palette rides \"via cmd+K\" with the Terminal, the announcement",
  "    // rides \"via the announcement\" with the Megaphone, a plain open",
  "    // births no pill — the absent-control law). The shares' story exits",
  "    // the head this round; the door carries the eye.",
  "    expect(head.title).toContain('jump names its door');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('via cmd+K'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('no pill'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('strict-mode faces'))).toBe(true);",
  '  });',
  '});',
].join('\n');

let replaced = 0;
for (const path of SUITES) {
  const src = readFileSync(path, 'utf8');
  if (src.includes(NEW_BLOCK)) { console.log(`${path}: already handed over (no-op)`); continue; }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.405.0 story block not found (aborting, nothing written)`);
    process.exit(1);
  }
  writeFileSync(path, src.replace(OLD_BLOCK, NEW_BLOCK));
  replaced++;
  console.log(`${path}: story handed over`);
}
console.log(`\n${replaced} replaced; a second run answers 0.`);
