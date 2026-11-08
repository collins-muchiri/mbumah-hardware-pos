#!/usr/bin/env node
// story-handover-v2473.mjs — v2.473.0's story hand-over, applied by WRITE
// (the BY WRITE law: each round's codemod is WRITTEN — a full authored
// file, never derived by slicing the previous round's script). Guarded
// and idempotent — a second run answers 0 replacements.
//
//   THE TASK 111 LAW'S SEVENTY-NINTH APPLICATION (story sixty-six):
//   the nine deep-link suites' hand-over blocks re-key to v2.473.0's
//   own story — the ledger answers to its own name (the search door:
//   the honest lens in the ONE home, the composition, the view/archive
//   law grown one lens) — and the archive door's story rides one entry
//   deeper (sixty-five → sixty-six, the lead's +1).
//
//   THE C_END PROBE, HONOURED: v2.472.0's line-carried tail ("The
//   ledger answers to its own columns.") is honoured by v2.473.0's own
//   lead title, which carries the phrase verbatim — the elder chain
//   holds. THIS ROUND'S OWN LINE-CARRIED TAIL (v2.474.0's probe to
//   honour): "The ledger answers to its own name."
//
//   THE MUSEUM RE-KEY, DATED (the guard COMES WITH THE FIND — the
//   v2.470.0 law born of the TS18048 dance):
//   • dead-stock-sort-door-v2472 — the round's own whats-new pin stops
//     riding the living head: `const head = WHATS_NEW[0]` becomes a find
//     of the suite's own 2.472.0 entry WITH the honest guard-throw line
//     (never a non-null assertion — the lint's 456th warning would break
//     HOLD THE ZERO); the version web moved the living pin to 2.473.0
//     and this re-key moves it BACK to its own story, forever; the
//     describe label stops saying "leads the feed".
//
//   THE ORDER LAW: this codemod runs AFTER walk-v2473.mjs — the walk
//   already re-keyed the deep-link suites' version pins
//   (toBe('2.472.0') → toBe('2.473.0')); this codemod re-keys the story
//   prose the walk must never touch. THE PAIR RUNS ONCE (v2.472.0's
//   process law): after this codemod's museum back-key, the walk never
//   runs again this round.
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
const SORT = 'src/tests/dead-stock-sort-door-v2472.test.ts';

const FROM_BLOCK = `    // the lead's story hand-over (v2.472.0, the Task 111 law's
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

const TO_BLOCK = `    // the lead's story hand-over (v2.473.0, the Task 111 law's
    // seventy-ninth application): the head story is the hand-over's
    // voice — the carrying round: THE LEDGER ANSWERS TO ITS OWN
    // NAME — the dead-stock ledger learns its search door: the lens
    // above the table answers to the words a row already carries
    // (the name, the SKU, the category), composed in the ONE home
    // filterDeadStockRows — the trimmed word the honest word, the
    // case never mattering, an empty lens resting the whole ledger,
    // a null category never crashing and never lying; the two lenses
    // compose in ONE memo (filter first, then sort — a narrower
    // shelf wearing the same honest order), the count badge answers
    // the lens (the honest fraction, the whole size at rest), and
    // the view/archive law holds — the file, the clipboard's copy
    // all chorus and the print door keep the canonical rows, the
    // lens is a viewer never a rewrite.
    // The ledger answers to its own name.`;

let files = 0;
let edits = 0;

for (const path of LINKS) {
  let src = readFileSync(path, 'utf8');
  const before = src;
  if (src.includes("seventy-ninth application")) {
    console.log(`${path}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes("seventy-eighth application")) {
    console.error(`FAIL: ${path} carries neither the seventy-ninth nor the seventy-eighth application`);
    process.exit(1);
  }
  // 1. the describe label rides the version stamp
  src = src.replace("whats-new — v2.472.0 leads the feed", "whats-new — v2.473.0 leads the feed");
  // 2. the story prose + the honoured probe line re-key as ONE block
  if (!src.includes(FROM_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.472.0 story block drifted from the anchored bytes`);
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

// ── the archive door's story (sixty-five → sixty-six, the lead's +1) ────
let archive = readFileSync(ARCHIVE, 'utf8');
const aBefore = archive;
if (archive.includes("story sixty-six")) {
  console.log(`${ARCHIVE}: already at sixty-six (idempotent no-op)`);
} else {
  archive = archive.replace(
    "    // v2.472.0 hand-over: the lead tells the sort-door story now; the",
    "    // v2.473.0 hand-over: the lead tells the search-door story now; the",
  );
  archive = archive.replace(
    "    // archive-door story sixty-five — all still in the feed",
    "    // archive-door story sixty-six — all still in the feed",
  );
  archive = archive.replace(
    `    // v2.472.0 re-key (dated): the lead speaks the sort-door round —
    // the ledger answers to its own columns (the capital and the idle
    // orders), and the family keeps its seats.`,
    `    // v2.473.0 re-key (dated): the lead speaks the search-door round —
    // the ledger answers to its own name (the name, the SKU and the
    // category answered), and the family keeps its seats.`,
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

// ── the v2472 sort suite's museum re-key (dated — the guard rides the find) ─
let sort = readFileSync(SORT, 'utf8');
const sBefore = sort;
if (sort.includes("WHATS_NEW.find((e) => e.version === '2.472.0')")) {
  console.log(`${SORT}: museum pin already re-keyed (idempotent no-op)`);
} else {
  sort = sort.replace(
    "  const head = WHATS_NEW[0];",
    "  const head = WHATS_NEW.find((e) => e.version === '2.472.0');\n  if (!head) throw new Error('the 2.472.0 entry is gone from the feed');",
  );
  sort = sort.replace(
    "expect(head.version).toBe('2.473.0');",
    "expect(head.version).toBe('2.472.0');",
  );
  sort = sort.replace(
    "describe('whats-new — the sort door leads the feed'",
    "describe('whats-new — the sort door, pinned in the feed'",
  );
  if (sort !== sBefore) {
    writeFileSync(SORT, sort);
    files++;
    edits += 3;
    console.log(`${SORT}: head → own-entry find + guard + version back-key + label (3 edits)`);
  } else {
    console.error(`FAIL: ${SORT} — no anchored bytes matched`);
    process.exit(1);
  }
}

console.log(`\n${edits} edit(s) across ${files} file(s).`);
console.log('a second run answers 0 everywhere.');
console.log('v2.473.0\'s own line-carried tail: "The ledger answers to its own name."');
