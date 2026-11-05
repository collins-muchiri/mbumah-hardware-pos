#!/usr/bin/env node
// story-handover-v2409.mjs — the lead story's hand-over to the EIGHT
// deep-link suites (the Task 111 law's fifteenth application), applied by
// WRITE (fresh per round, guarded, idempotent).
//
// Each suite's `whats-new — v2.408.0 leads the feed` block re-keys to the
// v2.409.0 story: the head version, the hand-over prose, and the bullet
// guards move to the desk-remembers words ('seed read factory state',
// 'remembers its lens' — the 'strict-mode faces' guard rides on).
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
  "describe('whats-new — v2.408.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.409.0');",
  "    // the lead's story hand-over (v2.408.0, the Task 111 law's fourteenth",
  "    // application): the head story is the branch's voice — the currency",
  "    // choice the branch made greets a session whose user never explicitly",
  "    // chose (the seed's three honest refusals, the re-seed honesty, the",
  "    // one explicit switch that outranks forever), the switcher names the",
  "    // branch's row with a mono chip, and the wire's types stop lying.",
  "    // The ghost routes' story exits the head this round; the branch",
  "    // carries the eye.",
  "    expect(head.title).toContain('branch speaks first');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('never explicitly chose'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('branch default'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('strict-mode faces'))).toBe(true);",
  '  });',
  '});',
].join('\n');

const NEW_BLOCK = [
  "describe('whats-new — v2.409.0 leads the feed', () => {",
  "  it('the entry exists, first, with the round\\u2019s own story', () => {",
  '    const head = WHATS_NEW[0];',
  "    expect(head.version).toBe('2.409.0');",
  "    // the lead's story hand-over (v2.409.0, the Task 111 law's fifteenth",
  "    // application): the head story is the desk's voice — the opening QA",
  "    // burst caught the branch greeting steamrolling an explicit choice on",
  "    // the org desk (the seed read factory state there — skipHydration's",
  "    // honest ask was never asked), so every surface now boots and the",
  "    // seed waits, the audit desk's lens persists across visits, and the",
  "    // greeting wears its exact provenance.",
  "    // The branch's story exits the head this round; the desk",
  "    // carries the eye.",
  "    expect(head.title).toContain('desk remembers');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('seed read factory state'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('remembers its lens'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('strict-mode faces'))).toBe(true);",
  '  });',
  '});',
].join('\n');

let replaced = 0;
for (const path of SUITES) {
  const src = readFileSync(path, 'utf8');
  if (src.includes(NEW_BLOCK)) { console.log(`${path}: already handed over (no-op)`); continue; }
  if (!src.includes(OLD_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.408.0 story block not found (aborting, nothing written)`);
    process.exit(1);
  }
  writeFileSync(path, src.replace(OLD_BLOCK, NEW_BLOCK));
  replaced++;
  console.log(`${path}: handed over`);
}
console.log(`\n${replaced} suite(s) re-keyed to the v2.409.0 story. A second run answers 0.`);
