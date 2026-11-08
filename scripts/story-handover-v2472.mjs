#!/usr/bin/env node
// story-handover-v2472.mjs — v2.472.0's story hand-over, applied by WRITE
// (the BY WRITE law: each round's codemod is WRITTEN — a full authored
// file, never derived by slicing the previous round's script). Guarded
// and idempotent — a second run answers 0 replacements.
//
//   THE TASK 111 LAW'S SEVENTY-EIGHTH APPLICATION (story sixty-five):
//   the nine deep-link suites' hand-over blocks re-key to v2.472.0's
//   own story — the ledger answers to its own columns (the sort door:
//   the two honest orders in the ONE home, the pressed face, the
//   view/archive law) — and the archive door's story rides one entry
//   deeper (sixty-four → sixty-five, the lead's +1).
//
//   THE C_END PROBE, HONOURED: v2.471.0's line-carried tail ("The
//   file sings the chorus whole.") is honoured by v2.472.0's own
//   lead title, which carries the phrase verbatim — the elder chain
//   holds. THIS ROUND'S OWN LINE-CARRIED TAIL (v2.473.0's probe to
//   honour): "The ledger answers to its own columns."
//
//   THE MUSEUM RE-KEY, DATED (the guard COMES WITH THE FIND — the
//   v2.470.0 law born of the TS18048 dance):
//   • dead-stock-file-chorus-v2471 — the round's own whats-new pin stops
//     riding the living head: `const head = WHATS_NEW[0]` becomes a find
//     of the suite's own 2.471.0 entry WITH the honest guard-throw line
//     (never a non-null assertion — the lint's 456th warning would break
//     HOLD THE ZERO); the version web moved the living pin to 2.472.0
//     and this re-key moves it BACK to its own story, forever; the
//     describe label stops saying "leads the feed".
//
//   THE ORDER LAW: this codemod runs AFTER walk-v2472.mjs — the walk
//   already re-keyed the deep-link suites' version pins
//   (toBe('2.471.0') → toBe('2.472.0')); this codemod re-keys the story
//   prose the walk must never touch.
import { readFileSync, writeFileSync } from 'node:fs';

const LINKS = [
  'src/tests/rep-type-deep-link-v2384.test.ts',
  'src/tests/bank-type-deep-link-v2387.test.ts',
  'src/tests/bank-mpesa-deep-link-v2388.test.ts',
  'src/tests/debt-status-deep-link-v2389.test.ts',
  'src/tests/debt-channel-deep-link-v2390.test.ts',
  'src/tests/exp-status-deep-link-v2391.test.ts',
  'src/tests/exp-type-deep-link-v2392.test.ts',
  'src/tests/msg-template-deep-link-v2393.test.ts',
  'src/tests/dead-window-deep-link-v2462.test.ts',
];
const ARCHIVE = 'src/tests/archive-door-v2404.test.ts';
const CHORUS = 'src/tests/dead-stock-file-chorus-v2471.test.ts';

const FROM_BLOCK = `    // the lead's story hand-over (v2.471.0, the Task 111 law's
    // seventy-seventh application): the head story is the hand-over's
    // voice — the carrying round: THE FILE SINGS THE CHORUS WHOLE —
    // the dead-stock CSV's footer speaks the collective word: the
    // Clearance chorus row joins the summary block, the census (the
    // count, the window, the capital at cost) composed by the ONE
    // home deadStockChorusHeader the clipboard's copy all already
    // sings, quoted like every word a CSV must survive; the ledger's
    // rows learn their own bars — every Capital tied cell wears the
    // summary bar's own dialect, the row's share of the loudest debt
    // drawn under the figure, aria-hidden, the number still the
    // voice; the chorus header is the byte it always was, extracted
    // into its own ONE-home word so the five doors can never drift.
    // The file sings the chorus whole.`;

const TO_BLOCK = `    // the lead's story hand-over (v2.472.0, the Task 111 law's
    // seventy-eighth application): the head story is the hand-over's
    // voice — the carrying round: THE LEDGER ANSWERS TO ITS OWN
    // COLUMNS — the dead-stock ledger learns its sort door: the
    // Capital tied and Days idle headers answer to their own column,
    // one press speaking that column's honest order composed in the
    // ONE home sortDeadStockRows — the capital order the classifier's
    // own standing word (the loudest debt first), the idle order the
    // shelf's patience (longest idle first, the never-sold row
    // standing at the front, its null a voice and not a zero); the
    // pressed column wears aria-sort and the family's ArrowDown, the
    // resting one the muted chevrons, and the view/archive law holds
    // — the file, the clipboard's copy all chorus and the print door
    // keep the canonical rows, the sort is a lens never a rewrite.
    // The ledger answers to its own columns.`;

let files = 0;
let edits = 0;

for (const path of LINKS) {
  let src = readFileSync(path, 'utf8');
  const before = src;
  if (src.includes("seventy-eighth application")) {
    console.log(`${path}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes("seventy-seventh application")) {
    console.error(`FAIL: ${path} carries neither the seventy-eighth nor the seventy-seventh application`);
    process.exit(1);
  }
  // 1. the describe label rides the version stamp
  src = src.replace("whats-new — v2.471.0 leads the feed", "whats-new — v2.472.0 leads the feed");
  // 2. the story prose + the honoured probe line re-key as ONE block
  if (!src.includes(FROM_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.471.0 story block drifted from the anchored bytes`);
    process.exit(1);
  }
  src = src.replace(FROM_BLOCK, TO_BLOCK);
  if (src !== before) {
    writeFileSync(path, src);
    files++;
    edits += 2;
    console.log(`${path}: label + story block re-keyed (2 edits)`);
  }
}

// ── the archive door's story (sixty-four → sixty-five, the lead's +1) ────
let archive = readFileSync(ARCHIVE, 'utf8');
const aBefore = archive;
if (archive.includes("story sixty-five")) {
  console.log(`${ARCHIVE}: already at sixty-five (idempotent no-op)`);
} else {
  archive = archive.replace(
    "    // v2.471.0 hand-over: the lead tells the file-chorus story now; the",
    "    // v2.472.0 hand-over: the lead tells the sort-door story now; the",
  );
  archive = archive.replace(
    "    // archive-door story sixty-four — all still in the feed",
    "    // archive-door story sixty-five — all still in the feed",
  );
  archive = archive.replace(
    `    // v2.471.0 re-key (dated): the lead speaks the file-chorus round —
    // the file sings the chorus whole (the footer's collective word,
    // the rows' own bars), and the census closes the file.`,
    `    // v2.472.0 re-key (dated): the lead speaks the sort-door round —
    // the ledger answers to its own columns (the capital and the idle
    // orders), and the family keeps its seats.`,
  );
  if (archive !== aBefore) {
    writeFileSync(ARCHIVE, archive);
    files++;
    edits += 3;
    console.log(`${ARCHIVE}: hand-over line + story count + dated re-key (3 edits)`);
  } else {
    console.error(`FAIL: ${ARCHIVE} — no anchored bytes matched`);
    process.exit(1);
  }
}

// ── the v2471 chorus suite's museum re-key (dated — the guard rides the find) ─
let chorus = readFileSync(CHORUS, 'utf8');
const cBefore = chorus;
if (chorus.includes("WHATS_NEW.find((e) => e.version === '2.471.0')")) {
  console.log(`${CHORUS}: museum pin already re-keyed (idempotent no-op)`);
} else {
  chorus = chorus.replace(
    "  const head = WHATS_NEW[0];",
    "  const head = WHATS_NEW.find((e) => e.version === '2.471.0');\n  if (!head) throw new Error('the 2.471.0 entry is gone from the feed');",
  );
  chorus = chorus.replace(
    "expect(head.version).toBe('2.472.0');",
    "expect(head.version).toBe('2.471.0');",
  );
  chorus = chorus.replace(
    "describe('whats-new — the file sings the chorus whole, leads the feed'",
    "describe('whats-new — the file sings the chorus whole, pinned in the feed'",
  );
  if (chorus !== cBefore) {
    writeFileSync(CHORUS, chorus);
    files++;
    edits += 3;
    console.log(`${CHORUS}: head → own-entry find + guard + version back-key + label (3 edits)`);
  } else {
    console.error(`FAIL: ${CHORUS} — no anchored bytes matched`);
    process.exit(1);
  }
}

console.log(`\n${edits} edit(s) across ${files} file(s).`);
console.log('a second run answers 0 everywhere.');
console.log('v2.472.0\'s own line-carried tail: "The ledger answers to its own columns."');
