#!/usr/bin/env node
// story-handover-v2475.mjs — v2.475.0's story hand-over, applied by WRITE
// (the BY WRITE law: each round's codemod is WRITTEN — a full authored
// file, never derived by slicing the previous round's script). Guarded
// and idempotent — a second run answers 0 replacements.
//
//   THE TASK 111 LAW'S EIGHTY-FIRST APPLICATION (story sixty-eight):
//   the nine deep-link suites' hand-over blocks re-key to v2.475.0's
//   own story — the view speaks its own word (the pressed lens's own
//   mirror, the ONE home's summary, the slice drawn) — and the archive
//   door's story rides one entry deeper (sixty-seven → sixty-eight, the
//   lead's +1).
//
//   THE C_END PROBE, HONOURED: v2.474.0's line-carried tail ("The
//   shape answers to the ledger.") is honoured by v2.475.0's own
//   lead title, which carries the phrase verbatim — the elder chain
//   holds. THIS ROUND'S OWN LINE-CARRIED TAIL (v2.476.0's probe to
//   honour): "The view speaks its own word."
//
//   THE MUSEUM RE-KEY, DATED (the guard COMES WITH THE FIND — the
//   v2.470.0 law born of the TS18048 dance):
//   • dead-stock-shape-door-v2474 — the round's own whats-new pin stops
//     riding the living head: `const head = WHATS_NEW[0]` becomes a find
//     of the suite's own 2.474.0 entry WITH the honest guard-throw line
//     (never a non-null assertion — the lint's 456th warning would break
//     HOLD THE ZERO); the version web moved the living pin to 2.475.0
//     and this re-key moves it BACK to its own story, forever; the
//     describe label stops saying "leads the feed".
//
//   THE ORDER LAW: this codemod runs AFTER walk-v2475.mjs — the walk
//   already re-keyed the deep-link suites' version pins
//   (toBe('2.474.0') → toBe('2.475.0')); this codemod re-keys the story
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
const SHAPE = 'src/tests/dead-stock-shape-door-v2474.test.ts';

const FROM_BLOCK = `    // the lead's story hand-over (v2.474.0, the Task 111 law's
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

const TO_BLOCK = `    // the lead's story hand-over (v2.475.0, the Task 111 law's
    // eighty-first application): the head story is the hand-over's
    // voice — the carrying round: THE VIEW SPEAKS ITS OWN
    // WORD — the dead-stock ledger's pressed lens learns its own
    // mirror: a footer under the table wearing the window lens's
    // amber ground speaks the honest fraction (the badge's own
    // shape), the view's own capital at cost (the family's rose
    // word) and the view's slice of the ledger's rest drawn in the
    // share-bar's own dialect; the word composed in the ONE home
    // deadStockViewSummary (the honest-share law worn — a zero
    // ledger shares ZERO, never NaN), the desk never hand-sums;
    // the word only sounds while the lens is pressed AND rows
    // answer, a spoken voice and never a handle (the census keeps
    // its nine), and the view/archive law holds — the file, the
    // clipboard's copy all chorus and the print door keep the
    // canonical rows.
    // The view speaks its own word.`;

let files = 0;
let edits = 0;

for (const path of LINKS) {
  let src = readFileSync(path, 'utf8');
  const before = src;
  if (src.includes("eighty-first application")) {
    console.log(`${path}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes("eightieth application")) {
    console.error(`FAIL: ${path} carries neither the eighty-first nor the eightieth application`);
    process.exit(1);
  }
  // 1. the describe label rides the version stamp
  src = src.replace("whats-new — v2.474.0 leads the feed", "whats-new — v2.475.0 leads the feed");
  // 2. the story prose + the honoured probe line re-key as ONE block
  if (!src.includes(FROM_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.474.0 story block drifted from the anchored bytes`);
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

// ── the archive door's story (sixty-seven → sixty-eight, the lead's +1) ───
let archive = readFileSync(ARCHIVE, 'utf8');
const aBefore = archive;
if (archive.includes("story sixty-eight")) {
  console.log(`${ARCHIVE}: already at sixty-eight (idempotent no-op)`);
} else {
  archive = archive.replace(
    "    // v2.474.0 hand-over: the lead tells the shape-door story now; the",
    "    // v2.475.0 hand-over: the lead tells the view-voice story now; the",
  );
  archive = archive.replace(
    "    // archive-door story sixty-seven — all still in the feed",
    "    // archive-door story sixty-eight — all still in the feed",
  );
  archive = archive.replace(
    `    // v2.474.0 re-key (dated): the lead speaks the shape-door round —
    // the shape answers to the ledger (the presses, the shared word),
    // and the family keeps its seats.`,
    `    // v2.475.0 re-key (dated): the lead speaks the view-voice round —
    // the view speaks its own word (the mirror, the slice), and the
    // family keeps its seats.`,
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

// ── the v2474 shape suite's museum re-key (dated — the guard rides the find) ─
let shape = readFileSync(SHAPE, 'utf8');
const sBefore = shape;
if (shape.includes("WHATS_NEW.find((e) => e.version === '2.474.0')")) {
  console.log(`${SHAPE}: museum pin already re-keyed (idempotent no-op)`);
} else {
  shape = shape.replace(
    "  const head = WHATS_NEW[0];",
    "  const head = WHATS_NEW.find((e) => e.version === '2.474.0');\n  if (!head) throw new Error('the 2.474.0 entry is gone from the feed');",
  );
  shape = shape.replace(
    "expect(head.version).toBe('2.475.0');",
    "expect(head.version).toBe('2.474.0');",
  );
  shape = shape.replace(
    "describe('whats-new — the shape leads the feed'",
    "describe('whats-new — the shape, pinned in the feed'",
  );
  if (shape !== sBefore) {
    writeFileSync(SHAPE, shape);
    files++;
    edits += 3;
    console.log(`${SHAPE}: head → own-entry find + guard + version back-key + label (3 edits)`);
  } else {
    console.error(`FAIL: ${SHAPE} — no anchored bytes matched`);
    process.exit(1);
  }
}

console.log(`\n${edits} edit(s) across ${files} file(s).`);
console.log('a second run answers 0 everywhere.');
console.log('v2.475.0\'s own line-carried tail: "The view speaks its own word."');
