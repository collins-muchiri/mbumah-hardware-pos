#!/usr/bin/env node
// story-handover-v2471.mjs — v2.471.0's story hand-over, applied by WRITE
// (the BY WRITE law: each round's codemod is WRITTEN — a full authored
// file, never derived by slicing the previous round's script). Guarded
// and idempotent — a second run answers 0 replacements.
//
//   THE TASK 111 LAW'S SEVENTY-SEVENTH APPLICATION (story sixty-four):
//   the nine deep-link suites' hand-over blocks re-key to v2.471.0's
//   own story — the file sings the chorus whole (the CSV footer's
//   collective word, the rows' own bars, the chorus header living in
//   its ONE home) — and the archive door's story rides one entry deeper
//   (sixty-three → sixty-four, the lead's +1).
//
//   THE C_END PROBE, HONOURED: v2.470.0's line-carried tail ("The
//   paper carries a scannable door.") is honoured by v2.471.0's own
//   lead title, which carries the phrase verbatim — the elder chain
//   holds. THIS ROUND'S OWN LINE-CARRIED TAIL (v2.472.0's probe to
//   honour): "The file sings the chorus whole."
//
//   THE MUSEUM RE-KEY, DATED (the guard COMES WITH THE FIND — the
//   v2.470.0 law born of the TS18048 dance):
//   • dead-stock-qr-v2470 — the round's own whats-new pin stops riding
//     the living head: `const head = WHATS_NEW[0]` becomes a find of the
//     suite's own 2.470.0 entry WITH the honest guard-throw line (never
//     a non-null assertion — the lint's 456th warning would break HOLD
//     THE ZERO); the version web moved the living pin to 2.471.0 and
//     this re-key moves it BACK to its own story, forever; the describe
//     label stops saying "leads the feed".
//
//   THE ORDER LAW: this codemod runs AFTER walk-v2471.mjs — the walk
//   already re-keyed the deep-link suites' version pins
//   (toBe('2.470.0') → toBe('2.471.0')); this codemod re-keys the story
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
const QR = 'src/tests/dead-stock-qr-v2470.test.ts';

const FROM_BLOCK = `    // the lead's story hand-over (v2.470.0, the Task 111 law's
    // seventy-sixth application): the head story is the hand-over's
    // voice — the carrying round: THE PRINTED LEDGER LEARNS THE
    // SCANNABLE DOOR — the dead-stock print page carries each row's
    // own QR: the ONE home's share URL (the same word the Share
    // button, the sheet and the chat speak, the store's address
    // riding its third word) drawn as a 96px data URL by the qrcode
    // house behind a dynamic import; the print window opens FIRST
    // (the popup-blocked law keeps the gesture's tick) and the doors
    // are drawn after; the scan to share appendix sits between the
    // ledger and the chorus — the clearance asks still close the
    // printed page — and a failed draw prints the paper without the
    // cards while the toast speaks the honest word.
    // The paper carries a scannable door.`;

const TO_BLOCK = `    // the lead's story hand-over (v2.471.0, the Task 111 law's
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

let files = 0;
let edits = 0;

for (const path of LINKS) {
  let src = readFileSync(path, 'utf8');
  const before = src;
  if (src.includes("seventy-seventh application")) {
    console.log(`${path}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes("seventy-sixth application")) {
    console.error(`FAIL: ${path} carries neither the seventy-seventh nor the seventy-sixth application`);
    process.exit(1);
  }
  // 1. the describe label rides the version stamp
  src = src.replace("whats-new — v2.470.0 leads the feed", "whats-new — v2.471.0 leads the feed");
  // 2. the story prose + the honoured probe line re-key as ONE block
  if (!src.includes(FROM_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.470.0 story block drifted from the anchored bytes`);
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

// ── the archive door's story (sixty-three → sixty-four, the lead's +1) ───
let archive = readFileSync(ARCHIVE, 'utf8');
const aBefore = archive;
if (archive.includes("story sixty-four")) {
  console.log(`${ARCHIVE}: already at sixty-four (idempotent no-op)`);
} else {
  archive = archive.replace(
    "    // v2.470.0 hand-over: the lead tells the scannable-door story now; the",
    "    // v2.471.0 hand-over: the lead tells the file-chorus story now; the",
  );
  archive = archive.replace(
    "    // archive-door story sixty-three — all still in the feed",
    "    // archive-door story sixty-four — all still in the feed",
  );
  archive = archive.replace(
    `    // v2.470.0 re-key (dated): the lead speaks the scannable-door round —
    // the paper carries a scannable door (the draw rides the ONE home),
    // and the chorus keeps the closing word.`,
    `    // v2.471.0 re-key (dated): the lead speaks the file-chorus round —
    // the file sings the chorus whole (the footer's collective word,
    // the rows' own bars), and the census closes the file.`,
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

// ── the v2470 QR suite's museum re-key (dated — the guard rides the find) ─
let qr = readFileSync(QR, 'utf8');
const qBefore = qr;
if (qr.includes("WHATS_NEW.find((e) => e.version === '2.470.0')")) {
  console.log(`${QR}: museum pin already re-keyed (idempotent no-op)`);
} else {
  qr = qr.replace(
    "  const head = WHATS_NEW[0];",
    "  const head = WHATS_NEW.find((e) => e.version === '2.470.0');\n  if (!head) throw new Error('the 2.470.0 entry is gone from the feed');",
  );
  qr = qr.replace(
    "expect(head.version).toBe('2.471.0');",
    "expect(head.version).toBe('2.470.0');",
  );
  qr = qr.replace(
    "describe('whats-new — the scannable door leads the feed'",
    "describe('whats-new — the scannable door, pinned in the feed'",
  );
  if (qr !== qBefore) {
    writeFileSync(QR, qr);
    files++;
    edits += 3;
    console.log(`${QR}: head → own-entry find + guard + version back-key + label (3 edits)`);
  } else {
    console.error(`FAIL: ${QR} — no anchored bytes matched`);
    process.exit(1);
  }
}

console.log(`\n${edits} edit(s) across ${files} file(s).`);
console.log('a second run answers 0 everywhere.');
console.log('v2.471.0\'s own line-carried tail: "The file sings the chorus whole."');
