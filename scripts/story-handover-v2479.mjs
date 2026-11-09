#!/usr/bin/env node
// story-handover-v2479.mjs — v2.479.0's story hand-over, applied by WRITE
// (the BY WRITE law: each round's codemod is WRITTEN — a full authored
// file, never derived by slicing the previous round's script). Guarded
// and idempotent — a second run answers 0 replacements.
//
//   THE TASK 111 LAW'S EIGHTY-FIFTH APPLICATION (story seventy-two):
//   the nine deep-link suites' hand-over blocks re-key to v2.479.0's
//   own story — the paper speaks the window's word (the dead-stock
//   print header grows the idle window beside the dates) — and the
//   archive door's story rides one entry deeper (seventy-one →
//   seventy-two, the lead's +1).
//
//   THE C_END PROBE, HONOURED: v2.478.0's line-carried tail ("The
//   file carries the chorus's own door.") is honoured by v2.479.0's
//   own lead title, which carries the phrase verbatim — the elder
//   chain holds. THIS ROUND'S OWN LINE-CARRIED TAIL (v2.480.0's
//   probe to honour): "The paper speaks the window's word."
//
//   THE MUSEUM RE-KEY, DATED (the guard COMES WITH THE FIND — the
//   v2.470.0 law born of the TS18048 dance):
//   • dead-stock-file-door-v2478 — the round's own whats-new pin
//     stops riding the living head: `const head = WHATS_NEW[0]`
//     becomes a find of the suite's own 2.478.0 entry WITH the
//     honest guard-throw line (never a non-null assertion — the
//     lint's 456th warning would break HOLD THE ZERO); the version
//     web moved the living pin to 2.479.0 and this re-key moves it
//     BACK to its own story, forever; the describe label stops
//     saying "leads the feed".
//
//   THE ORDER LAW: this codemod runs AFTER walk-v2479.mjs — the walk
//   already re-keyed the deep-link suites' version pins
//   (toBe('2.478.0') → toBe('2.479.0')); this codemod re-keys the
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
const FILEDOOR = 'src/tests/dead-stock-file-door-v2478.test.ts';

const FROM_BLOCK = JSON.parse("\"    // the lead's story hand-over (v2.478.0, the Task 111 law's\\n    // eighty-fourth application): the head story is the hand-over's\\n    // voice \\u2014 the carrying round: THE FILE CARRIES THE CHORUS'S\\n    // OWN DOOR \\u2014 the CSV's summary block grows the \\\"Chorus share\\n    // link\\\" row beside the Clearance chorus: the ONE home's\\n    // deadStockChorusShareUrl (the exact word the Share all handle\\n    // opens and the paper's lead card encodes, the store's own\\n    // number riding its third word when the branch keeps one on\\n    // file), quoted like every word a CSV must survive, the\\n    // canonical rows only \\u2014 the view/archive law holds (the file is\\n    // the archive's word); the desk's cards answer the hand (the\\n    // three summary cards learn the hover lift, the dead-stock\\n    // trio only), and the paper wears its second dress (the rose\\n    // rule under the chorus heading, the italic intro \\u2014 new CSS\\n    // lines, the standing bytes untouched); the census keeps its\\n    // ten voices (a word in the file, never a handle), and the\\n    // desk never spells the host's word.\\n    // The file carries the chorus's own door.\"");

const TO_BLOCK = JSON.parse("\"    // the lead's story hand-over (v2.479.0, the Task 111 law's\\n    // eighty-fifth application): the head story is the hand-over's\\n    // voice \\u2014 the carrying round: THE PAPER SPEAKS THE WINDOW'S\\n    // WORD \\u2014 the dead-stock print header's Period line grows the\\n    // idle window beside the dates (\\\" \u00b7 Idle window: N days\\\", the\\n    // ONE home's days expression \\u2014 the same word the CSV's Days\\n    // window row carries, the window IS the lens: 30, 60 or 90\\n    // changes the ledger's meaning), the other stages keeping the\\n    // bare Period line; the loom's sixth weave takes the head home\\n    // \\u2014 CHIP_HEAD leaves the family file as an export (the ring\\n    // and the faces left home in v2.460.0), the inventory ledger's\\n    // All chip rides <FilterChip> proper (the loom picks the faces,\\n    // the desk's hand face import retires) and the data-colored\\n    // tribe's last two head hand-copies (the inventory category\\n    // chips, the POS scroll row) ride the import \\u2014 one head, many\\n    // hands, the wardrobe in exactly ONE src file; the census pills\\n    // learn the family's voices (the M-Pesa census's four idle\\n    // faces gain the dark wardrobe the elder ledger named, the\\n    // M-Pesa census and the security desk's time-window pills wear\\n    // the zinc keyboard ring, the amber pressed face learning its\\n    // dark word); the census keeps its ten voices (a word in the\\n    // header, never a handle), and the desk never spells the\\n    // host's word.\\n    // The paper speaks the window's word.\"");

let files = 0;
let edits = 0;

for (const path of LINKS) {
  let src = readFileSync(path, 'utf8');
  const before = src;
  if (src.includes("eighty-fifth application")) {
    console.log(`${path}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes("eighty-fourth application")) {
    console.error(`FAIL: ${path} carries neither the eighty-fifth nor the eighty-fourth application`);
    process.exit(1);
  }
  // 1. the describe label rides the version stamp
  src = src.replace("whats-new — v2.478.0 leads the feed", "whats-new — v2.479.0 leads the feed");
  // 2. the story prose + the honoured probe line re-key as ONE block
  if (!src.includes(FROM_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.478.0 story block drifted from the anchored bytes`);
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

// ── the archive door's story (seventy-one → seventy-two, the lead's +1) ──
let archive = readFileSync(ARCHIVE, 'utf8');
const aBefore = archive;
if (archive.includes("story seventy-two")) {
  console.log(`${ARCHIVE}: already at seventy-two (idempotent no-op)`);
} else {
  archive = archive.replace(
    "    // v2.478.0 hand-over: the lead tells the file-door story now; the",
    "    // v2.479.0 hand-over: the lead tells the paper-window story now; the",
  );
  archive = archive.replace(
    "    // archive-door story seventy-one — all still in the feed",
    "    // archive-door story seventy-two — all still in the feed",
  );
  archive = archive.replace(
    `    // v2.478.0 re-key (dated): the lead speaks the file-door round —
    // the file carries the chorus's own door (the footer link, the
    // sheet in the one-voice arc), and the family keeps its seats.`,
    `    // v2.479.0 re-key (dated): the lead speaks the paper-window round —
    // the paper speaks the window's word (the header line, the lens's
    // own window beside the dates), and the family keeps its seats.`,
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

// ── the v2478 file-door suite's museum re-key (dated — the guard rides the find) ─
let filedoor = readFileSync(FILEDOOR, 'utf8');
const fBefore = filedoor;
if (filedoor.includes("WHATS_NEW.find((e) => e.version === '2.478.0')")) {
  console.log(`${FILEDOOR}: museum pin already re-keyed (idempotent no-op)`);
} else {
  filedoor = filedoor.replace(
    "  const head = WHATS_NEW[0];",
    "  const head = WHATS_NEW.find((e) => e.version === '2.478.0');\n  if (!head) throw new Error('the 2.478.0 entry is gone from the feed');",
  );
  filedoor = filedoor.replace(
    "expect(head.version).toBe('2.479.0');",
    "expect(head.version).toBe('2.478.0');",
  );
  filedoor = filedoor.replace(
    "describe('whats-new — the round leads the feed'",
    "describe('whats-new — the round, pinned in the feed'",
  );
  if (filedoor !== fBefore) {
    writeFileSync(FILEDOOR, filedoor);
    files++;
    edits += 3;
    console.log(`${FILEDOOR}: head → own-entry find + guard + version back-key + label (3 edits)`);
  } else {
    console.error(`FAIL: ${FILEDOOR} — no anchored bytes matched`);
    process.exit(1);
  }
}

console.log(`\n${edits} edit(s) across ${files} file(s).`);
console.log('a second run answers 0 everywhere.');
console.log("v2.479.0's own line-carried tail: \"The paper speaks the window's word.\"");
