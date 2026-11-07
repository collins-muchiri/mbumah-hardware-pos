#!/usr/bin/env node
// story-handover-v2433.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// thirty-ninth application; the archive-door copy stays claimed inside
// the codemod — twenty-one surfaces, one home), applied by WRITE (fresh
// per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.432.0 leads the feed`
// blocks re-key to the v2.433.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the desk's own words
// ('rode at', 'the two sides comparing clocks', 'the honest absence').
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

const OLD_LABEL = "describe('whats-new — v2.432.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.433.0 leads the feed', () => {";

const OLD_COMMENT = [
  '    // the lead\'s story hand-over (v2.432.0, the Task 111 law\'s',
  '    // thirty-eighth application): the head story is the hand-over\'s',
  '    // voice — the door remembers its send: the inventory banner\'s',
  '    // census door grew the SENDING side\'s own session memory',
  '    // (orderBlockSendWord — the block\'s send word, pure: a null, a',
  '    // broken stamp, or no send this session reads the null, the',
  '    // honest absence; the viewer\'s own clock, zero-padded, exactly',
  '    // one colon — the census\'s own brevity), the record is',
  '    // component state never persisted (a reload honestly forgets —',
  '    // a menu claiming yesterday\'s sends would be a lie), the LAST',
  '    // send wins as the record overwrites, and the word is a FACT',
  '    // never a gate (the v2.430 census row byte-kept under the',
  '    // two-row item — the block stays pressable).',
  '    // The echo\'s story exits the head this round; the',
  '    // door\'s own memory carries the eye.',
].join('\n');

const NEW_COMMENT = [
  '    // the lead\'s story hand-over (v2.433.0, the Task 111 law\'s',
  '    // thirty-ninth application): the head story is the hand-over\'s',
  '    // voice — the desk reads the door\'s memory: the READING desk',
  '    // answers the door\'s memory (orderBlockRodeStamp — the strip\'s',
  '    // stamp word, pure: the desk\'s own verb "rode at" on the door\'s',
  '    // clock law, a null, a broken stamp, or no send this session',
  '    // reads the null, the honest absence), the derived gate rides',
  '    // orderStrip\'s own null-at-hydration (no state, no effect —',
  '    // the read never meets SSR), the stamp rides UNDER the echo',
  '    // line\'s quote-border (the memory sits under the quotation,',
  '    // the Footprints glyph, the quiet italic, tabular), and the',
  '    // stamp is a FACT never a gate (it never dresses the pen —',
  '    // the v2.422 derivation byte-kept).',
  '    // The door\'s story exits the head this round; the',
  '    // desk\'s own answer carries the eye.',
].join('\n');

const OLD_GUARDS = [
  "    expect(head.title).toContain('remembers');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('sent at'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the LAST send'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('a reload honestly forgets'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('stamp');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('rode at'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the two sides comparing clocks'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the honest absence'))).toBe(true);",
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
      console.error(`FAIL: ${suite} lost its v2.432.0 ${label}`);
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

// ── the archive door's twenty-first copy (claimed inside the codemod — Task 117's law (d)) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.432.0 hand-over: the lead tells the door\u2019s-memory story now; the';
const ARC_NEW_HEAD = '    // v2.433.0 hand-over: the lead tells the desk\u2019s-answer story now; the';
const ARC_OLD_MID = [
  '    // archive-door story twenty-six — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.433.0');",
  "    expect(lead.title).toContain('remembers');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('sent at'))).toBe(true);",
].join('\n');
const ARC_NEW_MID = [
  '    // archive-door story twenty-six — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.433.0');",
  "    expect(lead.title).toContain('stamp');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('rode at'))).toBe(true);",
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
    console.log(`${ARCHIVE}: hand-over written (the twenty-first copy)`);
  } else {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.432.0 nor the v2.433.0 block`);
    process.exit(1);
  }
}

console.log(`\n${edits} hand-over(s) across ${files} file(s). A second run answers 0.`);
