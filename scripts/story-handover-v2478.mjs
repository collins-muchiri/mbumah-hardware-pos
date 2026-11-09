#!/usr/bin/env node
// story-handover-v2478.mjs — v2.478.0's story hand-over, applied by WRITE
// (the BY WRITE law: each round's codemod is WRITTEN — a full authored
// file, never derived by slicing the previous round's script). Guarded
// and idempotent — a second run answers 0 replacements.
//
//   THE TASK 111 LAW'S EIGHTY-FOURTH APPLICATION (story seventy-one):
//   the nine deep-link suites' hand-over blocks re-key to v2.478.0's
//   own story — the file carries the chorus's own door (the CSV's
//   footer link, the sheet in the one-voice arc) — and the archive
//   door's story rides one entry deeper (seventy → seventy-one, the
//   lead's +1).
//
//   THE C_END PROBE, HONOURED: v2.477.0's line-carried tail ("The
//   chorus learns the paper's scannable door.") is honoured by
//   v2.478.0's own lead title, which carries the phrase verbatim —
//   the elder chain holds. THIS ROUND'S OWN LINE-CARRIED TAIL
//   (v2.479.0's probe to honour): "The file carries the chorus's
//   own door."
//
//   THE MUSEUM RE-KEY, DATED (the guard COMES WITH THE FIND — the
//   v2.470.0 law born of the TS18048 dance):
//   • dead-stock-chorus-paper-v2477 — the round's own whats-new pin
//     stops riding the living head: `const head = WHATS_NEW[0]`
//     becomes a find of the suite's own 2.477.0 entry WITH the
//     honest guard-throw line (never a non-null assertion — the
//     lint's 456th warning would break HOLD THE ZERO); the version
//     web moved the living pin to 2.478.0 and this re-key moves it
//     BACK to its own story, forever; the describe label stops
//     saying "leads the feed".
//
//   THE ORDER LAW: this codemod runs AFTER walk-v2478.mjs — the walk
//   already re-keyed the deep-link suites' version pins
//   (toBe('2.477.0') → toBe('2.478.0')); this codemod re-keys the
//   story prose the walk must never touch, and back-keys the museum
//   the walk moved. THE PAIR RUNS ONCE (v2.472.0's process law):
//   after this codemod's museum back-key, the walk never runs again
//   this round.
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
const PAPER = 'src/tests/dead-stock-chorus-paper-v2477.test.ts';

const FROM_BLOCK = JSON.parse("\"    // the lead's story hand-over (v2.477.0, the Task 111 law's\\n    // eighty-third application): the head story is the hand-over's\\n    // voice \\u2014 the carrying round: THE CHORUS LEARNS THE PAPER'S\\n    // SCANNABLE DOOR \\u2014 the print appendix's scan grid grows the\\n    // LEAD card: one QR drawn by the qrcode house encoding the ONE\\n    // home's deadStockChorusShareUrl (the exact bytes the Share all\\n    // handle opens, the store's own number riding its third word\\n    // when the branch keeps one on file), captioned \\\"The ledger's\\n    // chorus\\\" with the honest count note, the teal dress marking\\n    // the collective door beside the rows' own cards; the paper\\n    // wears its own dress (the rose markers on the numbered asks,\\n    // the note in the teal word \\u2014 new CSS lines, the standing\\n    // bytes untouched), the gate stays the dead-stock stage with\\n    // rows, the window still opens first, a failed draw prints\\n    // the paper without the cards, the census keeps its ten\\n    // voices (a drawn image, never a handle), and the desk never\\n    // spells the host's word.\\n    // The chorus learns the paper's scannable door.\"");

const TO_BLOCK = JSON.parse("\"    // the lead's story hand-over (v2.478.0, the Task 111 law's\\n    // eighty-fourth application): the head story is the hand-over's\\n    // voice \\u2014 the carrying round: THE FILE CARRIES THE CHORUS'S\\n    // OWN DOOR \\u2014 the CSV's summary block grows the \\\"Chorus share\\n    // link\\\" row beside the Clearance chorus: the ONE home's\\n    // deadStockChorusShareUrl (the exact word the Share all handle\\n    // opens and the paper's lead card encodes, the store's own\\n    // number riding its third word when the branch keeps one on\\n    // file), quoted like every word a CSV must survive, the\\n    // canonical rows only \\u2014 the view/archive law holds (the file is\\n    // the archive's word); the desk's cards answer the hand (the\\n    // three summary cards learn the hover lift, the dead-stock\\n    // trio only), and the paper wears its second dress (the rose\\n    // rule under the chorus heading, the italic intro \\u2014 new CSS\\n    // lines, the standing bytes untouched); the census keeps its\\n    // ten voices (a word in the file, never a handle), and the\\n    // desk never spells the host's word.\\n    // The file carries the chorus's own door.\"");

let files = 0;
let edits = 0;

for (const path of LINKS) {
  let src = readFileSync(path, 'utf8');
  const before = src;
  if (src.includes("eighty-fourth application")) {
    console.log(`${path}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes("eighty-third application")) {
    console.error(`FAIL: ${path} carries neither the eighty-fourth nor the eighty-third application`);
    process.exit(1);
  }
  // 1. the describe label rides the version stamp
  src = src.replace("whats-new — v2.477.0 leads the feed", "whats-new — v2.478.0 leads the feed");
  // 2. the story prose + the honoured probe line re-key as ONE block
  if (!src.includes(FROM_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.477.0 story block drifted from the anchored bytes`);
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

// ── the archive door's story (seventy → seventy-one, the lead's +1) ───
let archive = readFileSync(ARCHIVE, 'utf8');
const aBefore = archive;
if (archive.includes("story seventy-one")) {
  console.log(`${ARCHIVE}: already at seventy-one (idempotent no-op)`);
} else {
  archive = archive.replace(
    "    // v2.477.0 hand-over: the lead tells the chorus-paper story now; the",
    "    // v2.478.0 hand-over: the lead tells the file-door story now; the",
  );
  archive = archive.replace(
    "    // archive-door story seventy — all still in the feed",
    "    // archive-door story seventy-one — all still in the feed",
  );
  archive = archive.replace(
    `    // v2.477.0 re-key (dated): the lead speaks the chorus-paper round —
    // the chorus learns the paper's scannable door (the lead card, the
    // collective word's own scan), and the family keeps its seats.`,
    `    // v2.478.0 re-key (dated): the lead speaks the file-door round —
    // the file carries the chorus's own door (the footer link, the
    // sheet in the one-voice arc), and the family keeps its seats.`,
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

// ── the v2477 paper suite's museum re-key (dated — the guard rides the find) ─
let paper = readFileSync(PAPER, 'utf8');
const pBefore = paper;
if (paper.includes("WHATS_NEW.find((e) => e.version === '2.477.0')")) {
  console.log(`${PAPER}: museum pin already re-keyed (idempotent no-op)`);
} else {
  paper = paper.replace(
    "  const head = WHATS_NEW[0];",
    "  const head = WHATS_NEW.find((e) => e.version === '2.477.0');\n  if (!head) throw new Error('the 2.477.0 entry is gone from the feed');",
  );
  paper = paper.replace(
    "expect(head.version).toBe('2.478.0');",
    "expect(head.version).toBe('2.477.0');",
  );
  paper = paper.replace(
    "describe('whats-new — the round leads the feed'",
    "describe('whats-new — the round, pinned in the feed'",
  );
  if (paper !== pBefore) {
    writeFileSync(PAPER, paper);
    files++;
    edits += 3;
    console.log(`${PAPER}: head → own-entry find + guard + version back-key + label (3 edits)`);
  } else {
    console.error(`FAIL: ${PAPER} — no anchored bytes matched`);
    process.exit(1);
  }
}

console.log(`\n${edits} edit(s) across ${files} file(s).`);
console.log('a second run answers 0 everywhere.');
console.log("v2.478.0's own line-carried tail: \"The file carries the chorus's own door.\"");
