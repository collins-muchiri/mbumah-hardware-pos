#!/usr/bin/env node
// story-handover-v2480.mjs — v2.480.0's story hand-over, applied by WRITE
// (the BY WRITE law: each round's codemod is WRITTEN — a full authored
// file, never derived by slicing the previous round's script). Guarded
// and idempotent — a second run answers 0 replacements.
//
//   THE TASK 111 LAW'S EIGHTY-SIXTH APPLICATION (story seventy-three):
//   the nine deep-link suites' hand-over blocks re-key to v2.480.0's
//   own story — the lens's word rides the address (the dead-stock
//   search lens answers the address bar, the amber chip names the
//   landed word) — and the archive door's story rides one entry deeper
//   (seventy-two → seventy-three, the lead's +1).
//
//   THE C_END PROBE, HONOURED: v2.479.0's line-carried tail ("The
//   paper speaks the window's word.") is honoured by v2.480.0's
//   own lead title, which carries the phrase verbatim — the elder
//   chain holds. THIS ROUND'S OWN LINE-CARRIED TAIL (v2.481.0's
//   probe to honour): "The lens's word rides the address."
//
//   THE MUSEUM RE-KEY, DATED (the guard COMES WITH THE FIND — the
//   v2.470.0 law born of the TS18048 dance):
//   • dead-stock-paper-window-v2479 — the round's own whats-new pin
//     stops riding the living head: `const head = WHATS_NEW[0]`
//     becomes a find of the suite's own 2.479.0 entry WITH the
//     honest guard-throw line (never a non-null assertion — the
//     lint's 456th warning would break HOLD THE ZERO); the version
//     web moved the living pin to 2.480.0 and this re-key moves it
//     BACK to its own story, forever; the describe label stops
//     saying "leads the feed".
//
//   THE ORDER LAW: this codemod runs AFTER walk-v2480.mjs — the walk
//   already re-keyed the deep-link suites' version pins
//   (toBe('2.479.0') → toBe('2.480.0')); this codemod re-keys the
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
const PAPERWINDOW = 'src/tests/dead-stock-paper-window-v2479.test.ts';

const FROM_BLOCK = JSON.parse("\"    // the lead's story hand-over (v2.479.0, the Task 111 law's\\n    // eighty-fifth application): the head story is the hand-over's\\n    // voice \\u2014 the carrying round: THE PAPER SPEAKS THE WINDOW'S\\n    // WORD \\u2014 the dead-stock print header's Period line grows the\\n    // idle window beside the dates (\\\" \u00b7 Idle window: N days\\\", the\\n    // ONE home's days expression \\u2014 the same word the CSV's Days\\n    // window row carries, the window IS the lens: 30, 60 or 90\\n    // changes the ledger's meaning), the other stages keeping the\\n    // bare Period line; the loom's sixth weave takes the head home\\n    // \\u2014 CHIP_HEAD leaves the family file as an export (the ring\\n    // and the faces left home in v2.460.0), the inventory ledger's\\n    // All chip rides <FilterChip> proper (the loom picks the faces,\\n    // the desk's hand face import retires) and the data-colored\\n    // tribe's last two head hand-copies (the inventory category\\n    // chips, the POS scroll row) ride the import \\u2014 one head, many\\n    // hands, the wardrobe in exactly ONE src file; the census pills\\n    // learn the family's voices (the M-Pesa census's four idle\\n    // faces gain the dark wardrobe the elder ledger named, the\\n    // M-Pesa census and the security desk's time-window pills wear\\n    // the zinc keyboard ring, the amber pressed face learning its\\n    // dark word); the census keeps its ten voices (a word in the\\n    // header, never a handle), and the desk never spells the\\n    // host's word.\\n    // The paper speaks the window's word.\"");

const TO_BLOCK = JSON.parse("\"    // the lead's story hand-over (v2.480.0, the Task 111 law's\\n    // eighty-sixth application): the head story is the hand-over's\\n    // voice \\u2014 the carrying round: THE LENS'S WORD RIDES THE\\n    // ADDRESS \\u2014 the dead-stock search lens answers the address\\n    // bar (the maker's own word rides ?dead-q into the URL, read as\\n    // typed \\u2014 trimmed and capped, never case-gamed, the ONE\\n    // home's filter lowercases its own side; the landing read once\\n    // on the shell, a dismissed chip can never resurrect; every\\n    // hand-driven lens change replaceState's its word back \\u2014 a\\n    // pressed lens is a shareable address, never a dead end \\u2014 and\\n    // an emptied lens strips its key, the address never carries a\\n    // silence), the landed word wearing the amber landing chip\\n    // beside the window's own \\u2014 amber joins the 300 registry (the\\n    // shade-split law's next form, the lens family's own tone, the\\n    // constitution's thirty-fourth word); and the patience draws its\\n    // own bar (the Days idle cell wears the capital bar's own\\n    // dialect \\u2014 the muted track, the fill in the number's own\\n    // word: amber below half a year, rose past it \\u2014 the\\n    // never-sold row's cell keeping quiet, its badge already\\n    // speaks); the census keeps its ten voices (a chip and a bar\\n    // never carry a handle's voice), and the desk never spells the\\n    // host's word.\\n    // The lens's word rides the address.\"");

let files = 0;
let edits = 0;

for (const path of LINKS) {
  let src = readFileSync(path, 'utf8');
  const before = src;
  if (src.includes("eighty-sixth application")) {
    console.log(`${path}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes("eighty-fifth application")) {
    console.error(`FAIL: ${path} carries neither the eighty-sixth nor the eighty-fifth application`);
    process.exit(1);
  }
  // 1. the describe label rides the version stamp
  src = src.replace("whats-new — v2.479.0 leads the feed", "whats-new — v2.480.0 leads the feed");
  // 2. the story prose + the honoured probe line re-key as ONE block
  if (!src.includes(FROM_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.479.0 story block drifted from the anchored bytes`);
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

// ── the archive door's story (seventy-two → seventy-three, the lead's +1) ──
let archive = readFileSync(ARCHIVE, 'utf8');
const aBefore = archive;
if (archive.includes("story seventy-three")) {
  console.log(`${ARCHIVE}: already at seventy-three (idempotent no-op)`);
} else {
  archive = archive.replace(
    "    // v2.479.0 hand-over: the lead tells the paper-window story now; the",
    "    // v2.480.0 hand-over: the lead tells the lens-address story now; the",
  );
  archive = archive.replace(
    "    // archive-door story seventy-two — all still in the feed",
    "    // archive-door story seventy-three — all still in the feed",
  );
  archive = archive.replace(
    `    // v2.479.0 re-key (dated): the lead speaks the paper-window round —
    // the paper speaks the window's word (the header line, the lens's
    // own window beside the dates), and the family keeps its seats.`,
    `    // v2.480.0 re-key (dated): the lead speaks the lens-address round —
    // the lens's word rides the address (the search lens answers the
    // bar, the amber chip names the landed word), and the family keeps
    // its seats.`,
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

// ── the v2479 paper-window suite's museum re-key (dated — the guard rides the find) ─
let paper = readFileSync(PAPERWINDOW, 'utf8');
const pBefore = paper;
if (paper.includes("WHATS_NEW.find((e) => e.version === '2.479.0')")) {
  console.log(`${PAPERWINDOW}: museum pin already re-keyed (idempotent no-op)`);
} else {
  paper = paper.replace(
    "  const head = WHATS_NEW[0];",
    "  const head = WHATS_NEW.find((e) => e.version === '2.479.0');\n  if (!head) throw new Error('the 2.479.0 entry is gone from the feed');",
  );
  paper = paper.replace(
    "expect(head.version).toBe('2.480.0');",
    "expect(head.version).toBe('2.479.0');",
  );
  paper = paper.replace(
    "describe('whats-new — the round leads the feed'",
    "describe('whats-new — the round, pinned in the feed'",
  );
  if (paper !== pBefore) {
    writeFileSync(PAPERWINDOW, paper);
    files++;
    edits += 3;
    console.log(`${PAPERWINDOW}: head → own-entry find + guard + version back-key + label (3 edits)`);
  } else {
    console.error(`FAIL: ${PAPERWINDOW} — no anchored bytes matched`);
    process.exit(1);
  }
}

console.log(`\n${edits} edit(s) across ${files} file(s).`);
console.log('a second run answers 0 everywhere.');
console.log("v2.480.0's own line-carried tail: \"The lens's word rides the address.\"");
