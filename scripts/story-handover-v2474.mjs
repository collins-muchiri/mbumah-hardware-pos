#!/usr/bin/env node
// story-handover-v2474.mjs — v2.474.0's story hand-over, applied by WRITE
// (the BY WRITE law: each round's codemod is WRITTEN — a full authored
// file, never derived by slicing the previous round's script). Guarded
// and idempotent — a second run answers 0 replacements.
//
//   THE TASK 111 LAW'S EIGHTIETH APPLICATION (story sixty-seven):
//   the nine deep-link suites' hand-over blocks re-key to v2.474.0's
//   own story — the shape answers to the ledger (the chart's presses,
//   the shared vocabulary, the shape's own law) — and the archive
//   door's story rides one entry deeper (sixty-six → sixty-seven, the
//   lead's +1).
//
//   THE C_END PROBE, HONOURED: v2.473.0's line-carried tail ("The
//   ledger answers to its own name.") is honoured by v2.474.0's own
//   lead title, which carries the phrase verbatim — the elder chain
//   holds. THIS ROUND'S OWN LINE-CARRIED TAIL (v2.475.0's probe to
//   honour): "The shape answers to the ledger."
//
//   THE MUSEUM RE-KEY, DATED (the guard COMES WITH THE FIND — the
//   v2.470.0 law born of the TS18048 dance):
//   • dead-stock-search-door-v2473 — the round's own whats-new pin stops
//     riding the living head: `const head = WHATS_NEW[0]` becomes a find
//     of the suite's own 2.473.0 entry WITH the honest guard-throw line
//     (never a non-null assertion — the lint's 456th warning would break
//     HOLD THE ZERO); the version web moved the living pin to 2.474.0
//     and this re-key moves it BACK to its own story, forever; the
//     describe label stops saying "leads the feed".
//
//   THE ORDER LAW: this codemod runs AFTER walk-v2474.mjs — the walk
//   already re-keyed the deep-link suites' version pins
//   (toBe('2.473.0') → toBe('2.474.0')); this codemod re-keys the story
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
const SEARCH = 'src/tests/dead-stock-search-door-v2473.test.ts';

const FROM_BLOCK = `    // the lead's story hand-over (v2.473.0, the Task 111 law's
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

const TO_BLOCK = `    // the lead's story hand-over (v2.474.0, the Task 111 law's
    // eightieth application): the head story is the hand-over's
    // voice — the carrying round: THE SHAPE ANSWERS TO THE
    // LEDGER — the dead-stock capital chart learns its presses:
    // the pie's legend rows and the bar chart's bars become real
    // handles through the charts' own optional onPress door (the
    // double voice, aria-pressed, the keyboard's Enter and Space,
    // the pressed segment's own face), one press riding the
    // segment's own word into the search lens; the ONE home's lens
    // answers the ledger's own Uncategorised word now (the word
    // the shape already calls the unnamed shelf, so a press can
    // never draw an empty answer), and the shape keeps the WHOLE
    // ledger's capital — the chart reads the canonical rows, a
    // press re-words the lens never the picture, and the file, the
    // clipboard's copy all chorus and the print door keep the
    // canonical rows.
    // The shape answers to the ledger.`;

let files = 0;
let edits = 0;

for (const path of LINKS) {
  let src = readFileSync(path, 'utf8');
  const before = src;
  if (src.includes("eightieth application")) {
    console.log(`${path}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes("seventy-ninth application")) {
    console.error(`FAIL: ${path} carries neither the eightieth nor the seventy-ninth application`);
    process.exit(1);
  }
  // 1. the describe label rides the version stamp
  src = src.replace("whats-new — v2.473.0 leads the feed", "whats-new — v2.474.0 leads the feed");
  // 2. the story prose + the honoured probe line re-key as ONE block
  if (!src.includes(FROM_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.473.0 story block drifted from the anchored bytes`);
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

// ── the archive door's story (sixty-six → sixty-seven, the lead's +1) ───
let archive = readFileSync(ARCHIVE, 'utf8');
const aBefore = archive;
if (archive.includes("story sixty-seven")) {
  console.log(`${ARCHIVE}: already at sixty-seven (idempotent no-op)`);
} else {
  archive = archive.replace(
    "    // v2.473.0 hand-over: the lead tells the search-door story now; the",
    "    // v2.474.0 hand-over: the lead tells the shape-door story now; the",
  );
  archive = archive.replace(
    "    // archive-door story sixty-six — all still in the feed",
    "    // archive-door story sixty-seven — all still in the feed",
  );
  archive = archive.replace(
    `    // v2.473.0 re-key (dated): the lead speaks the search-door round —
    // the ledger answers to its own name (the name, the SKU and the
    // category answered), and the family keeps its seats.`,
    `    // v2.474.0 re-key (dated): the lead speaks the shape-door round —
    // the shape answers to the ledger (the presses, the shared word),
    // and the family keeps its seats.`,
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

// ── the v2473 search suite's museum re-key (dated — the guard rides the find) ─
let search = readFileSync(SEARCH, 'utf8');
const sBefore = search;
if (search.includes("WHATS_NEW.find((e) => e.version === '2.473.0')")) {
  console.log(`${SEARCH}: museum pin already re-keyed (idempotent no-op)`);
} else {
  search = search.replace(
    "  const head = WHATS_NEW[0];",
    "  const head = WHATS_NEW.find((e) => e.version === '2.473.0');\n  if (!head) throw new Error('the 2.473.0 entry is gone from the feed');",
  );
  search = search.replace(
    "expect(head.version).toBe('2.474.0');",
    "expect(head.version).toBe('2.473.0');",
  );
  search = search.replace(
    "describe('whats-new — the search door leads the feed'",
    "describe('whats-new — the search door, pinned in the feed'",
  );
  if (search !== sBefore) {
    writeFileSync(SEARCH, search);
    files++;
    edits += 3;
    console.log(`${SEARCH}: head → own-entry find + guard + version back-key + label (3 edits)`);
  } else {
    console.error(`FAIL: ${SEARCH} — no anchored bytes matched`);
    process.exit(1);
  }
}

console.log(`\n${edits} edit(s) across ${files} file(s).`);
console.log('a second run answers 0 everywhere.');
console.log('v2.474.0\'s own line-carried tail: "The shape answers to the ledger."');
