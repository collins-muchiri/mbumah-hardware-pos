#!/usr/bin/env node
// story-handover-v2437.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// forty-third application; the archive-door copy stays claimed inside
// the codemod — thirty surfaces, one home), applied by WRITE (fresh
// per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.436.0 leads the feed`
// blocks re-key to the v2.437.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the door's own words
// ('the taxman joins the door', 'the default face speaks', 'never stranded').
//
// THE ORDER LAW: the walk's version web re-keys the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape.
//
// THE COUNTER'S LABEL LAW (v2.434.0's archaeology, honoured): the
// archive-door story ordinal is a hand-written LABEL, not a count of
// anything — the honest response is a steady +1: this round bumps
// twenty-nine → thirty.
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

const OLD_LABEL = "describe('whats-new — v2.436.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.437.0 leads the feed', () => {";

const OLD_COMMENT = [
  "    // the lead's story hand-over (v2.436.0, the Task 111 law's",
  "    // forty-second application): the head story is the hand-over's",
  "    // voice — the fixture world speaks its whole vocabulary: one",
  "    // door lights both fixture worlds (npm run db:fixtures — the",
  "    // M-Pesa ledger's script leads, the exports world follows), the",
  "    // exports world stands up twelve history rows (one per each of",
  "    // the TEN card types — both lenses speak non-zero on a fresh",
  "    // world — plus the TWO off-union faces the schema's own column",
  "    // comment keeps: PAYROLL completed, ALL failed — the deliberate",
  "    // pin, never a re-type), every completed row carries real",
  "    // inline content (a history row that lies about its file is",
  "    // not fidelity), the history table's unknown type wears the",
  "    // deliberate off-card badge (the row stays visible, the lens",
  "    // never guesses across the union), and the M-Pesa pane wears",
  "    // its status census (five faces counted from the same stored",
  "    // vocabulary the rows speak, the four status chips pressing",
  "    // through the ONE door, the legacy derived face a count and",
  "    // never a lens word).",
  "    // The watch's story exits the head this round; the",
  "    // fixture world's own vocabulary carries the eye.",
].join('\n');

const NEW_COMMENT = [
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

const OLD_GUARDS = [
  "    expect(head.title).toContain('vocabulary');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('the honest zero retires'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the off-union face'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('through the ONE door'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('door');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('the taxman joins the door'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the default face speaks'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('never stranded'))).toBe(true);",
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
      console.error(`FAIL: ${suite} lost its v2.436.0 ${label}`);
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

// ── the archive door's twenty-fifth copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.436.0 hand-over: the lead tells the fixture-world story now; the';
const ARC_NEW_HEAD = '    // v2.437.0 hand-over: the lead tells the taxman\u2019s-door story now; the';
const ARC_OLD_MID = [
  '    // archive-door story twenty-nine — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.437.0');",
  "    expect(lead.title).toContain('vocabulary');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('the honest zero retires'))).toBe(true);",
].join('\n');
const ARC_NEW_MID = [
  '    // archive-door story thirty — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.437.0');",
  "    expect(lead.title).toContain('door');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('the taxman joins the door'))).toBe(true);",
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
    console.log(`${ARCHIVE}: hand-over written (the twenty-fifth copy)`);
  } else {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.436.0 nor the v2.437.0 block`);
    process.exit(1);
  }
}

console.log(`\n${edits} hand-over(s) across ${files} file(s). A second run answers 0.`);
