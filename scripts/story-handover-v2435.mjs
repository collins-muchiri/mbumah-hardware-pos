#!/usr/bin/env node
// story-handover-v2435.mjs — the lead story's hand-over to the EIGHT
// deep-link suites AND the archive-door suite (the Task 111 law's
// forty-first application; the archive-door copy stays claimed inside
// the codemod — twenty-three surfaces, one home), applied by WRITE (fresh
// per round, guarded, idempotent).
//
// The eight deep-link suites' `whats-new — v2.434.0 leads the feed`
// blocks re-key to the v2.435.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the watch's own words
// ('Still there?', 'the two clocks agree', 'derives its number').
//
// THE ORDER LAW: the walk's version web re-keys the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape.
//
// THE COUNTER ARCHAEOLOGY (v2.434.0's hand-over asked this round to
// verify the archive-door story counter counts what it claims): the git
// history shows the ordinal is a hand-written LABEL, not a count — the
// lineage reads 21, 22, 24, 25, 26 (×5 rounds), 27; story twenty-three
// NEVER EXISTED. The honest response is not a rewrite of history but a
// steady +1 from here: this round bumps twenty-seven → twenty-eight and
// records the skip in the worklog.
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

const OLD_LABEL = "describe('whats-new — v2.434.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.435.0 leads the feed', () => {";

const OLD_COMMENT = [
  "    // the lead's story hand-over (v2.434.0, the Task 111 law's",
  "    // fortieth application): the head story is the hand-over's",
  "    // voice — the archive reads its own timeline: the release",
  "    // changelog's story list grew the arc's own timeline",
  "    // (RELEASE_ARC — the fifteen words of the supplier-maker arc",
  "    // with their release days exactly as the tags record them,",
  "    // releaseArcWord — the pure lookup, a version outside the arc",
  "    // reads the null — the absent-control law), each arc word's",
  "    // entry wears the amber chip beside its line (\"word 7 · Nov 6\"",
  "    // — the walk's own Footprints glyph, the memory family's",
  "    // amber, tabular-nums, the title carrying the whole story),",
  "    // the short face speaks the day (arcWordFace — the MMM D",
  "    // brevity, an unparseable day reads itself), and the arc",
  "    // never leaves the archive (every word's version lives in",
  "    // the feed — the announcement dialog stays bare, one home).",
  "    // The desk's story exits the head this round; the",
  "    // arc's own timeline carries the eye.",
].join('\n');

const NEW_COMMENT = [
  "    // the lead's story hand-over (v2.435.0, the Task 111 law's",
  "    // forty-first application): the head story is the hand-over's",
  "    // voice — the watch confesses its window: the portal's idle",
  "    // lock no longer arrives without warning (the last 60 seconds",
  "    // grow the floating amber strip — \"Still there? Signing out in",
  "    // Ns\", role=status, aria-live=polite, the tabular countdown",
  "    // holding its lane, Stay signed in the one action), the",
  "    // re-arm law rides the hook's own reset (one reset owns both",
  "    // timers — the strip returns after another full window), the",
  "    // strip and the lock hang off the ONE setTimeout schedule (the",
  "    // countdown reaches zero exactly as the lock lands — the two",
  "    // clocks agree), the logout POST is guarded to fire at most",
  "    // once, the hook's grace options stay OPTIONAL (the till",
  "    // passes none — its v2.6.0 contract byte-identical), and every",
  "    // sentence that speaks the window derives its number from the",
  "    // window constant (SELF_SERVICE_IDLE_MINUTES — the copy can",
  "    // never drift from the contract it describes).",
  "    // The arc's story exits the head this round; the",
  "    // watch's own confession carries the eye.",
].join('\n');

const OLD_GUARDS = [
  "    expect(head.title).toContain('timeline');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('the arc reads itself'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('as the tag records it'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('never leaves the archive'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('grace');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('Still there?'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('the two clocks agree'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('derives its number'))).toBe(true);",
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
      console.error(`FAIL: ${suite} lost its v2.434.0 ${label}`);
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

// ── the archive door's twenty-third copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.434.0 hand-over: the lead tells the arc\u2019s-timeline story now; the';
const ARC_NEW_HEAD = '    // v2.435.0 hand-over: the lead tells the watch\u2019s-grace story now; the';
const ARC_OLD_MID = [
  '    // archive-door story twenty-seven — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.435.0');",
  "    expect(lead.title).toContain('timeline');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('the arc reads itself'))).toBe(true);",
].join('\n');
const ARC_NEW_MID = [
  '    // archive-door story twenty-eight — all still in the feed',
  '    const lead = WHATS_NEW[0];',
  "    expect(lead.version).toBe('2.435.0');",
  "    expect(lead.title).toContain('grace');",
  '    expect(lead.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(lead.bullets.some((b) => b.includes('Still there?'))).toBe(true);",
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
    console.log(`${ARCHIVE}: hand-over written (the twenty-third copy)`);
  } else {
    console.error(`FAIL: ${ARCHIVE} carries neither the v2.434.0 nor the v2.435.0 block`);
    process.exit(1);
  }
}

console.log(`\n${edits} hand-over(s) across ${files} file(s). A second run answers 0.`);
