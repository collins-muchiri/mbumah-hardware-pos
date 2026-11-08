#!/usr/bin/env node
// story-handover-v2463.mjs — the lead story's hand-over to the NINE
// deep-link suites AND the archive-door suite (the Task 111 law's
// sixty-ninth application; the archive-door copy stays claimed inside
// the codemod — forty-six surfaces, one home), applied by WRITE
// (fresh per round, guarded, idempotent). WRITTEN FRESH BY HAND — the
// BY WRITE law: authored, never derived.
//
// The nine deep-link suites' `whats-new — v2.462.0 leads the feed`
// blocks re-key to the v2.463.0 story: the describe label, the hand-over
// prose, and the bullet guards move to the reach-out round's own words
// ('reach out', 'share door', 'clearance note', 'wa.me', 'clipboard').
//
// THE CENSUS DISCIPLINE (the v2462 law, honoured): the hand-over prose
// and guards speak the story by its own nouns and NEVER carry the
// hyphenated word literal the thirty-third word's one-writer ledger
// counts — the ledger's census stays exact.
//
// THE ORDER LAW: the walk's version web re-keyed the version assert
// BEFORE this codemod runs, so the OLD block carries the NEW version
// with the OLD prose — this mismatch is the expected hand-over shape
// (each suite's toBe already reads 2.463.0 here).
//
// THE IDEMPOTENCY-ORDER LAW (v2.440.0's correction, honoured): the
// handed-over check runs FIRST — if the reference already wears the new
// label, the extraction is skipped and the run is a clean no-op.
//
// THE COUNTER'S LABEL LAW (v2.434.0's archaeology, honoured): the
// archive-door story ordinal is a hand-written LABEL, not a count of
// anything — the honest response is a steady +1: this round bumps
// fifty-five → fifty-six.
//
// THE EXTRACTION DRIFT LAW (the v2450 lesson, honoured): the OLD
// comment is read from the reference suite's own bytes — and the C_END
// probe is the LINE-CARRIED tail ("the clipboard is the door." — the
// v2462 round's own line-carried tail, honoured this round) because the
// tail phrase wraps mid-phrase in the prose; next round's codemod probes
// THIS round's own line-carried tail ("the word rides out.").
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
  'src/tests/dead-window-deep-link-v2462.test.ts',
];

const OLD_LABEL = "describe('whats-new — v2.462.0 leads the feed', () => {";
const NEW_LABEL = "describe('whats-new — v2.463.0 leads the feed', () => {";

// The OLD comment is read from the reference suite's own bytes (the
// sixty-eighth application's prose) — never re-transcribed by hand, so
// an em-dash or apostrophe drift can never fail the guard.
const REF = SUITES[4];
const ref = readFileSync(REF, 'utf8');
const C_START = "    // the lead's story hand-over (v2.462.0, the Task 111 law's";
// The tail phrase lands at the END of a line in the reference's own
// prose — the honest probe is the LINE-CARRIED tail, unique in the
// reference.
const C_END_PROBE = "the clipboard is the door.";
const NEW_LABEL_PROBE = NEW_LABEL;
const OLD_COMMENT = (() => {
  if (ref.includes(NEW_LABEL_PROBE)) return null; // already handed over
  const cStart = ref.indexOf(C_START);
  const tailAt = ref.indexOf(C_END_PROBE, cStart);
  if (cStart < 0 || tailAt < 0) {
    console.error('FAIL: the reference suite lost its v2.462.0 hand-over comment');
    process.exit(1);
  }
  // The prose wraps mid-clause, so the tail probe is a SUBSTRING: slice
  // from the comment's head line to the END OF THE LINE that carries the
  // tail (the next newline after the probe).
  const cEnd = ref.indexOf('\n', tailAt);
  return ref.slice(cStart, cEnd);
})();

const NEW_COMMENT = [
  "    // the lead's story hand-over (v2.463.0, the Task 111 law's",
  "    // sixty-ninth application): the head story is the hand-over's",
  "    // voice — the reaching-out round: THE NOTE TAKES THE SHARE DOOR —",
  "    // every ledger row's Ask handle gains a Share sibling that opens",
  "    // the maker's own WhatsApp with the SAME deterministic clearance",
  "    // note already composed (one voice, two doors — the URL is the",
  "    // wa.me word for the note, composed in the classifier's ONE home",
  "    // THROUGH the note's own composer, so the clipboard and the chat",
  "    // can never drift apart); the row names no supplier, so the URL",
  "    // carries no phone — WhatsApp opens with the text pre-filled and",
  "    // the maker picks the chat (the recipient-addressed instrument",
  "    // stays api.ts's own); THE LAST COLUMN WEARS ITS PAIR — a tight",
  "    // two-door group, the share handle in the emerald hover the",
  "    // family already speaks, the double voice every row action wears,",
  "    // and a browser that blocks the window speaks its side (the toast",
  "    // answers, the row stays whole).",
  "    // The note copies; the share opens; the word rides out.",
].join('\n');

const OLD_GUARDS = [
  "    expect(head.title).toContain('resting ledger');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('thirty-third word'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('rose byte'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('category'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('clipboard'))).toBe(true);",
].join('\n');

const NEW_GUARDS = [
  "    expect(head.title).toContain('reach out');",
  '    expect(head.bullets.length).toBeGreaterThanOrEqual(3);',
  "    expect(head.bullets.some((b) => b.includes('share door'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('wa.me'))).toBe(true);",
  "    expect(head.bullets.some((b) => b.includes('clipboard'))).toBe(true);",
].join('\n');

let files = 0, edits = 0;
if (OLD_COMMENT === null) {
  console.log(`${REF}: already handed over — skipping comment extraction (idempotent no-op)`);
}
for (const suite of SUITES) {
  if (OLD_COMMENT === null) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  let src = readFileSync(suite, 'utf8');
  if (src.includes(NEW_LABEL)) {
    console.log(`${suite}: already handed over (idempotent no-op)`);
    continue;
  }
  for (const [label, piece] of [['comment', OLD_COMMENT], ['guards', OLD_GUARDS], ['label', OLD_LABEL]]) {
    if (!src.includes(piece)) {
      console.error(`FAIL: ${suite} lost its v2.462.0 ${label}`);
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

// ── the archive door's fifty-sixth copy (claimed inside the codemod) ──
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const ARC_OLD_HEAD = '    // v2.462.0 hand-over: the lead tells the resting-ledger story now; the';
const ARC_NEW_HEAD = '    // v2.463.0 hand-over: the lead tells the reach-out story now; the';
const ARC_OLD_MID = '    // archive-door story fifty-five — all still in the feed';
const ARC_NEW_MID = '    // archive-door story fifty-six — all still in the feed';

{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARC_NEW_MID)) {
    console.log(`${ARCHIVE}: already at story fifty-six (idempotent no-op)`);
  } else {
    for (const [label, piece] of [['head', ARC_OLD_HEAD], ['mid', ARC_OLD_MID]]) {
      if (!src.includes(piece)) {
        console.error(`FAIL: ${ARCHIVE} lost its v2.462.0 ${label}`);
        process.exit(1);
      }
    }
    src = src.split(ARC_OLD_HEAD).join(ARC_NEW_HEAD);
    src = src.split(ARC_OLD_MID).join(ARC_NEW_MID);
    writeFileSync(ARCHIVE, src);
    files++;
    edits += 2;
    console.log(`${ARCHIVE}: story fifty-six written`);
  }
}

// ── the archive door's dated guard re-key (the v2462 pattern) ──
// The lead guards wear the round's own words; the version line beneath
// them is the walk's business (already re-keyed by the treadmill).
const ARC_OLD_COMMENT = [
  '    // v2.462.0 re-key (dated): the lead speaks the resting-ledger round —',
  "    // the ninth report's window takes its address (the thirty-third",
  '    // word), the capital draws its shape by category, and every row',
  '    // learns to ask.',
].join('\n');
const ARC_NEW_COMMENT = [
  '    // v2.463.0 re-key (dated): the lead speaks the reach-out round —',
  '    // the clearance note takes the share door (one voice, two doors),',
  "    // and the ledger's last column wears its pair.",
].join('\n');
const ARC_OLD_TITLE = "    expect(lead.title).toContain('resting ledger');";
const ARC_NEW_TITLE = "    expect(lead.title).toContain('reach out');";
const ARC_OLD_WORD = "    expect(lead.bullets.some((b) => b.includes('thirty-third word'))).toBe(true);";
const ARC_NEW_WORD = "    expect(lead.bullets.some((b) => b.includes('share door'))).toBe(true);";

{
  let src = readFileSync(ARCHIVE, 'utf8');
  if (src.includes(ARC_NEW_TITLE)) {
    console.log(`${ARCHIVE}: lead guards already re-keyed (idempotent no-op)`);
  } else {
    for (const [label, piece] of [['comment', ARC_OLD_COMMENT], ['title guard', ARC_OLD_TITLE], ['word guard', ARC_OLD_WORD]]) {
      if (!src.includes(piece)) {
        console.error(`FAIL: ${ARCHIVE} lost its v2.462.0 ${label}`);
        process.exit(1);
      }
    }
    src = src.split(ARC_OLD_COMMENT).join(ARC_NEW_COMMENT);
    src = src.split(ARC_OLD_TITLE).join(ARC_NEW_TITLE);
    src = src.split(ARC_OLD_WORD).join(ARC_NEW_WORD);
    writeFileSync(ARCHIVE, src);
    files++;
    edits += 3;
    console.log(`${ARCHIVE}: lead guards re-keyed to the reach-out round`);
  }
}

// ── the v2461 probe's dated re-key (the section carries TWO handles) ──
// The Ask handle gained a Share sibling: the section's aria-label census
// moves one → two, the comment speaks the pair.
const PROBE = 'src/tests/dead-stock-v2461.test.ts';
const PROBE_OLD_COMMENT = [
  "    // v2.462.0 re-anchor: the section now also carries the Ask handle's",
  "    // aria-label (the row action's own double voice — the handle law,",
  "    // not a lens face); the loom's pressed-voice law is untouched, and",
  "    // the ONE aria-label in the section is the Ask handle's own.",
].join('\n');
const PROBE_NEW_COMMENT = [
  '    // v2.463.0 re-anchor: the section now carries the TWO row-action',
  '    // handles (the Ask and the share), each with its own double voice —',
  "    // the handle law, not a lens face; the loom's pressed-voice law is",
  "    // untouched, and the TWO aria-labels are the two handles' own.",
].join('\n');
const PROBE_OLD_COUNT = "    expect(section.split('aria-label=').length - 1).toBe(1);";
const PROBE_NEW_COUNT = "    expect(section.split('aria-label=').length - 1).toBe(2);";

{
  let src = readFileSync(PROBE, 'utf8');
  if (src.includes(PROBE_NEW_COUNT)) {
    console.log(`${PROBE}: aria-label census already at two (idempotent no-op)`);
  } else {
    for (const [label, piece] of [['comment', PROBE_OLD_COMMENT], ['census', PROBE_OLD_COUNT]]) {
      if (!src.includes(piece)) {
        console.error(`FAIL: ${PROBE} lost its v2.462.0 ${label}`);
        process.exit(1);
      }
    }
    src = src.split(PROBE_OLD_COMMENT).join(PROBE_NEW_COMMENT);
    src = src.split(PROBE_OLD_COUNT).join(PROBE_NEW_COUNT);
    writeFileSync(PROBE, src);
    files++;
    edits += 2;
    console.log(`${PROBE}: the aria-label census moved one → two`);
  }
}

console.log(`\n${edits} hand-over edit(s) across ${files} file(s). A second run answers 0.`);
