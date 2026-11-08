#!/usr/bin/env node
// story-handover-v2470.mjs — v2.470.0's story hand-over, applied by WRITE
// (the BY WRITE law: each round's codemod is WRITTEN — a full authored
// file, never derived by slicing the previous round's script). Guarded
// and idempotent — a second run answers 0 replacements.
//
//   THE TASK 111 LAW'S SEVENTY-SIXTH APPLICATION (story sixty-three):
//   the nine deep-link suites' hand-over blocks re-key to v2.470.0's
//   own story — the printed ledger learns the scannable door (the ONE
//   home's URL drawn, the window opened first, the chorus keeping the
//   closing word) — and the archive door's story rides one entry deeper
//   (sixty-two → sixty-three, the lead's +1).
//
//   THE C_END PROBE, HONOURED: v2.469.0's line-carried tail ("The
//   settings desk learns the branch's own words.") is honoured by
//   v2.470.0's own lead title, which carries the phrase verbatim — the
//   elder chain holds. THIS ROUND'S OWN LINE-CARRIED TAIL (v2.471.0's
//   probe to honour): "The paper carries a scannable door."
//
//   THE MUSEUM RE-KEYS, DATED:
//   • dead-stock-print-v2466 — the print template's junction grew the
//     scan appendix between the ledger and the chorus; the suite's
//     junction pin re-keys to the three-part seat.
//   • store-settings-honesty-v2469 — the round's own whats-new pin
//     stops riding the living head: `const head = WHATS_NEW[0]` becomes
//     a find of the suite's own 2.469.0 entry (the version web moved the
//     living pin to 2.470.0; the museum pin moves BACK to its own story,
//     forever), and the describe label stops saying "leads the feed".
//
//   THE ORDER LAW: this codemod runs AFTER walk-v2470.mjs — the walk
//   already re-keyed the deep-link suites' version pins
//   (toBe('2.469.0') → toBe('2.470.0')); this codemod re-keys the story
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
const PRINT = 'src/tests/dead-stock-print-v2466.test.ts';
const SETTINGS = 'src/tests/store-settings-honesty-v2469.test.ts';

const FROM_BLOCK = `    // the lead's story hand-over (v2.469.0, the Task 111 law's
    // seventy-fifth application): the head story is the hand-over's
    // voice — the carrying round: THE SETTINGS DESK LEARNS THE
    // BRANCH'S OWN WORDS — the admin desk's Store Settings mock
    // retired: the form spoke 'Mbumah Hardware' from component state
    // for its whole life while the save button beside it wrote only
    // the VAT rate; the branch's real name, location and phone now
    // load from the session-validated /api/stores wire (the vat
    // rate's own draft-wins pattern — a typed draft wins until save),
    // and the save walks the TWO honest doors — the details ride the
    // owner-only PATCH /api/stores/settings (SUPER_ADMIN or
    // STORE_OWNER, the write shaped org-scoped — updateMany cannot
    // rename a foreign store, a count of zero answers the calm 404),
    // the phone keeps its ONE home at PATCH /api/stores/phone; BOTH
    // wires invalidate so the reports desk's pre-addressed chip flips
    // without a re-load; the desk shows its work — dirty fields wear
    // the amber ring and the unsaved dot, the save sleeps until a
    // word changes, and the share door's exact voice is previewed
    // through the ONE home's display word.
    // The settings desk learns the branch's own words.`;

const TO_BLOCK = `    // the lead's story hand-over (v2.470.0, the Task 111 law's
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

let files = 0;
let edits = 0;

for (const path of LINKS) {
  let src = readFileSync(path, 'utf8');
  const before = src;
  if (src.includes("seventy-sixth application")) {
    console.log(`${path}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes("seventy-fifth application")) {
    console.error(`FAIL: ${path} carries neither the seventy-sixth nor the seventy-fifth application`);
    process.exit(1);
  }
  // 1. the describe label rides the version stamp
  src = src.replace("whats-new — v2.469.0 leads the feed", "whats-new — v2.470.0 leads the feed");
  // 2. the story prose + the honoured probe line re-key as ONE block
  if (!src.includes(FROM_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.469.0 story block drifted from the anchored bytes`);
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

// ── the archive door's story (sixty-two → sixty-three, the lead's +1) ───
let archive = readFileSync(ARCHIVE, 'utf8');
const aBefore = archive;
if (archive.includes("story sixty-three")) {
  console.log(`${ARCHIVE}: already at sixty-three (idempotent no-op)`);
} else {
  archive = archive.replace(
    "    // v2.469.0 hand-over: the lead tells the settings-desk story now; the",
    "    // v2.470.0 hand-over: the lead tells the scannable-door story now; the",
  );
  archive = archive.replace(
    "    // archive-door story sixty-two — all still in the feed",
    "    // archive-door story sixty-three — all still in the feed",
  );
  archive = archive.replace(
    `    // v2.469.0 re-key (dated): the lead speaks the settings-desk round —
    // the branch's own words come home (the mock retired), and the
    // details write joins the registry.`,
    `    // v2.470.0 re-key (dated): the lead speaks the scannable-door round —
    // the paper carries a scannable door (the draw rides the ONE home),
    // and the chorus keeps the closing word.`,
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

// ── the v2466 print suite's junction re-key (dated) ─────────────────────
let print = readFileSync(PRINT, 'utf8');
const pBefore = print;
if (print.includes('${scanAppendix}')) {
  console.log(`${PRINT}: junction already re-keyed (idempotent no-op)`);
} else {
  print = print.replace(
    "expect(desk.includes('${content.innerHTML}\\n          ${chorusAppendix}')).toBe(true);",
    "expect(desk.includes('${content.innerHTML}\\n          ${scanAppendix}\\n          ${chorusAppendix}')).toBe(true);",
  );
  if (print !== pBefore) {
    writeFileSync(PRINT, print);
    files++;
    edits += 1;
    console.log(`${PRINT}: the print template's junction re-keyed (1 edit)`);
  } else {
    console.error(`FAIL: ${PRINT} — the junction pin drifted from the anchored bytes`);
    process.exit(1);
  }
}

// ── the v2469 settings suite's museum re-key (dated) ────────────────────
let settings = readFileSync(SETTINGS, 'utf8');
const sBefore = settings;
if (settings.includes("WHATS_NEW.find((e) => e.version === '2.469.0')")) {
  console.log(`${SETTINGS}: museum pin already re-keyed (idempotent no-op)`);
} else {
  settings = settings.replace(
    "  const head = WHATS_NEW[0];",
    "  const head = WHATS_NEW.find((e) => e.version === '2.469.0');",
  );
  settings = settings.replace(
    "expect(head.version).toBe('2.470.0');",
    "expect(head.version).toBe('2.469.0');",
  );
  settings = settings.replace(
    "describe('whats-new — the mock retired leads the feed'",
    "describe('whats-new — the mock retired, pinned in the feed'",
  );
  if (settings !== sBefore) {
    writeFileSync(SETTINGS, settings);
    files++;
    edits += 3;
    console.log(`${SETTINGS}: head → own-entry find + version back-key + label (3 edits)`);
  } else {
    console.error(`FAIL: ${SETTINGS} — no anchored bytes matched`);
    process.exit(1);
  }
}

console.log(`\n${edits} edit(s) across ${files} file(s).`);
console.log('a second run answers 0 everywhere.');
console.log('v2.470.0\'s own line-carried tail: "The paper carries a scannable door."');
