#!/usr/bin/env node
// story-handover-v2439.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// forty-fifth application; the archive-door copy stays claimed inside
// the codemod — thirty-two surfaces, one home), applied by WRITE (fresh
// per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.438.0 leads the feed`
// blocks re-key to the v2.439.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the cancel door's own words
// ('the stuck row learns to bow out', 'CANCELLED', 'its own 409 message').
//
// THE ORDER LAW: the walk's version web re-keys the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape.
//
// THE COUNTER'S LABEL LAW (v2.434.0's archaeology, honoured): the
// archive-door story ordinal is a hand-written LABEL, not a count of
// anything — the honest response is a steady +1: this round bumps
// thirty-one → thirty-two.
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

const OLD_LABEL = "describe('whats-new — v2.438.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.439.0 leads the feed', () => {";

const OLD_COMMENT = [
  "    // the lead's story hand-over (v2.438.0, the Task 111 law's",
  "    // forty-fourth application): the head story is the hand-over's",
  "    // voice — the world learns to expire: the export history's",
  "    // expiry story was fully written in code and never spoken on a",
  "    // fresh world (the derived Expired badge, the disabled download",
  "    // with its honest tooltip, the endpoint's 410 Gone BEFORE the",
  "    // COMPLETED gate, the retention chip's silence — the badge owns",
  "    // the past), so the fixture world wears the face (one COMPLETED",
  "    // row whose per-row retention window is already past — the",
  "    // tuples grew the seventh column, default 7 = the endpoint's",
  "    // own law, expiry is time's own work never a status change, a",
  "    // COMPLETED row keeps its real content), the expired row dims",
  "    // to opacity-70 (the retired read, the desk knowing at a",
  "    // glance), the pair badge speaks beside the stored one, and",
  "    // the completed lens still speaks the STORED truth (expiry is",
  "    // the overlay).",
  "    // The taxman's door story exits the head this round; the",
  "    // expiry's own truth carries the eye.",
].join('\n');

const NEW_COMMENT = [
  "    // the lead's story hand-over (v2.439.0, the Task 111 law's",
  "    // forty-fifth application): the head story is the hand-over's",
  "    // voice — the stuck row learns to bow out: a PENDING/PROCESSING",
  "    // export whose invocation died used to wait forever (a spinner",
  "    // that never stops, a 409 for eternity), so the new cancel door",
  "    // (POST /api/data-exports/[id]/cancel) retires it honestly as",
  "    // CANCELLED — only a stuck row passes (a finished row is never",
  "    // rewritten), the row STAYS wearing its note, the audit speaks",
  "    // DATA_EXPORT_CANCELLED; the desk wears the whole face (the zinc",
  "    // Cancelled badge with the Ban icon, the Cancelled chip joins",
  "    // the lens row, exp-status=cancelled lands the lens, the cancel",
  "    // hand on exactly the waiting rows, the row dims to opacity-60 —",
  "    // the withdrawn read), the download route answers the cancelled",
  "    // face with its own 409 message between the FAILED gate and the",
  "    // expiry gate, and the fixture world wears the face (one LOYALTY",
  "    // row cancelled by the owner — fifteen rows, the badge wearable",
  "    // on a fresh world from day one).",
  "    // The expiry's own truth exits the head this round; the stuck",
  "    // row's honest exit carries the eye.",
].join('\n');

const OLD_GUARDS = [
  "    expect(head.title).toContain('expire');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('the world learns to expire'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the badge owns the past'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('410 Gone'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('stuck');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('the stuck row learns to bow out'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('CANCELLED'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('its own 409 message'))).toBe(true);",
].join('\n');

let files = 0, edits = 0;
for (const suite of SUITES) {
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_LABEL)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  for (const [label, piece] of [['comment', OLD_COMMENT], ['guards', OLD_GUARDS], ['label', OLD_LABEL]]) {
    if (!src.includes(piece)) {
      console.error(`FAIL: ${suite} lost its v2.438.0 ${label}`);
      process.exit(1);
    }
  }
  src = src.split(OLD_COMMENT).join(NEW_COMMENT);
  src = src.split(OLD_GUARDS).join(NEW_GUARDS);
  src = src.split(OLD_LABEL).join(NEW_LABEL);
  writeFileSync(suite, src);
  files++;
  edits++;
  console.log(`${suite}: hand-over written`);
}

// ── the archive door's twenty-seventh copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.438.0 hand-over: the lead tells the expiry story now; the';
const ARC_NEW_HEAD = '    // v2.439.0 hand-over: the lead tells the stuck-row story now; the';
const ARC_OLD_MID = [
  '    // archive-door story thirty-one — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.439.0');",
  "    expect(lead.title).toContain('expire');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('the world learns to expire'))).toBe(true);",
].join('\n');
const ARC_NEW_MID = [
  '    // archive-door story thirty-two — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.439.0');",
  "    expect(lead.title).toContain('stuck');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('the stuck row learns to bow out'))).toBe(true);",
].join('\n');

{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARC_NEW_HEAD)) {
    console.log(`${ARCHIVE}: already handed over (idempotent no-op)`);
  } else if (src.includes(ARC_OLD_HEAD) && src.includes(ARC_OLD_MID)) {
    src = src.split(ARC_OLD_HEAD).join(ARC_NEW_HEAD);
    src = src.split(ARC_OLD_MID).join(ARC_NEW_MID);
    writeFileSync(ARCHIVE, src);
    files++;
    edits++;
    console.log(`${ARCHIVE}: hand-over written (the twenty-seventh copy)`);
  } else {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.438.0 nor the v2.439.0 block`);
    process.exit(1);
  }
}

console.log(`\n${edits} hand-over(s) across ${files} file(s). A second run answers 0.`);
