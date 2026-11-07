#!/usr/bin/env node
// story-handover-v2438.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// forty-fourth application; the archive-door copy stays claimed inside
// the codemod — thirty-one surfaces, one home), applied by WRITE (fresh
// per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.437.0 leads the feed`
// blocks re-key to the v2.438.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the expiry's own words
// ('the world learns to expire', 'the badge owns the past', '410 Gone').
//
// THE ORDER LAW: the walk's version web re-keys the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape.
//
// THE COUNTER'S LABEL LAW (v2.434.0's archaeology, honoured): the
// archive-door story ordinal is a hand-written LABEL, not a count of
// anything — the honest response is a steady +1: this round bumps
// thirty → thirty-one.
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

const OLD_LABEL = "describe('whats-new — v2.437.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.438.0 leads the feed', () => {";

const OLD_COMMENT = [
  "    // the lead's story hand-over (v2.437.0, the Task 111 law's",
  "    // forty-third application): the head story is the hand-over's",
  "    // voice — the taxman joins the door: npm run db:fixtures grows",
  "    // its third face (the M-Pesa ledger's script leads, the exports",
  "    // world follows, the taxman's world closes the parade — six",
  "    // invoices speaking all five submission statuses, four audit",
  "    // rows for the submitted faces, eight tax filings across the",
  "    // four types and the schema-honest statuses, the sandbox",
  "    // profile — verified live on the current schema, idempotent),",
  "    // and the exports world wears the schema's own default status",
  "    // (one PENDING history row — the one wire face the fixtures",
  "    // never spoke — the processing word's union answering it under",
  "    // processing and all, never stranded; the coherence law holds:",
  "    // a waiting row carries neither completion nor failure faces).",
  "    // The fixture world's vocabulary story exits the head this",
  "    // round; the taxman's own door carries the eye.",
].join('\n');

const NEW_COMMENT = [
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

const OLD_GUARDS = [
  "    expect(head.title).toContain('door');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('the taxman joins the door'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the default face speaks'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('never stranded'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('expire');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('the world learns to expire'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the badge owns the past'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('410 Gone'))).toBe(true);",
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
      console.error(`FAIL: ${suite} lost its v2.437.0 ${label}`);
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

// ── the archive door's twenty-sixth copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.437.0 hand-over: the lead tells the taxman\u2019s-door story now; the';
const ARC_NEW_HEAD = '    // v2.438.0 hand-over: the lead tells the expiry story now; the';
const ARC_OLD_MID = [
  '    // archive-door story thirty — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.438.0');",
  "    expect(lead.title).toContain('door');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('the taxman joins the door'))).toBe(true);",
].join('\n');
const ARC_NEW_MID = [
  '    // archive-door story thirty-one — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.438.0');",
  "    expect(lead.title).toContain('expire');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('the world learns to expire'))).toBe(true);",
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
    console.log(`${ARCHIVE}: hand-over written (the twenty-sixth copy)`);
  } else {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.437.0 nor the v2.438.0 block`);
    process.exit(1);
  }
}

console.log(`\n${edits} hand-over(s) across ${files} file(s). A second run answers 0.`);
