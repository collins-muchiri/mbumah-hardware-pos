#!/usr/bin/env node
// story-handover-v2469.mjs — v2.469.0's story hand-over, applied by WRITE
// (the BY WRITE law: each round's codemod is WRITTEN — a full authored
// file, never derived by slicing the previous round's script). Guarded
// and idempotent — a second run answers 0 replacements.
//
//   THE TASK 111 LAW'S SEVENTY-FIFTH APPLICATION (story sixty-two):
//   the nine deep-link suites' hand-over blocks re-key to v2.469.0's
//   own story — the settings desk learns the branch's own words (the
//   admin desk's Store Settings mock retired, the two honest doors,
//   the desk's amber work) — and the archive door's story rides one
//   entry deeper (sixty-one → sixty-two, the lead's +1).
//
//   THE C_END PROBE, HONOURED: v2.468.0's line-carried tail ("The
//   number learns its edit door.") is honoured by v2.469.0's own lead
//   title, which carries the phrase verbatim — the elder chain holds.
//   THIS ROUND'S OWN LINE-CARRIED TAIL (v2.470.0's probe to honour):
//   "The settings desk learns the branch's own words."
//
//   THE ORDER LAW: this codemod runs AFTER walk-v2469.mjs — the walk
//   already re-keyed the deep-link suites' version pins
//   (toBe('2.468.0') → toBe('2.469.0')); this codemod re-keys the
//   story prose the walk must never touch.
//
//   THE BULLET WORDS: the lead's bullets carry the full standing set
//   (edit door / pre-addressed / clearance note / chat picker / copy
//   all / print button / clearance asks / clipboard / wa.me / file /
//   share door / category) — extended in whats-new.ts by hand before
//   this codemod runs, so every museum suite's assert passes unchanged.
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

const FROM_BLOCK = `    // the lead's story hand-over (v2.468.0, the Task 111 law's
    // seventy-fourth application): the head story is the hand-over's
    // voice — the carrying round: THE NUMBER LEARNS ITS EDIT DOOR —
    // the picker chip's promise kept on the desk where the promise
    // lives: the quiet picker face grew its press (a real button, the
    // double voice every handle wears, the dashed border the pressable
    // hint), one press opens the edit dialog (one Input, Enter saves,
    // the door's own normalize spoken as the helper word), and the
    // save rides the owner-only PATCH (SUPER_ADMIN or STORE_OWNER,
    // the write shaped org-scoped — a foreign store is a calm 404 —
    // the number stored exactly as typed, the ONE home normalizes at
    // composition time, the log masked to the last three digits); THE
    // LIVE FLIP — the save invalidates the desk's own wire and the
    // chip flips to the pre-addressed face in place, no other tab, no
    // re-load; the census grows its fourth voice — the edit door's
    // own handle.
    // The number learns its edit door.`;

const TO_BLOCK = `    // the lead's story hand-over (v2.469.0, the Task 111 law's
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

let files = 0;
let edits = 0;

for (const path of LINKS) {
  let src = readFileSync(path, 'utf8');
  const before = src;
  if (src.includes("seventy-fifth application")) {
    console.log(`${path}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes("seventy-fourth application")) {
    console.error(`FAIL: ${path} carries neither the seventy-fifth nor the seventy-fourth application`);
    process.exit(1);
  }
  // 1. the describe label rides the version stamp
  src = src.replace("whats-new — v2.468.0 leads the feed", "whats-new — v2.469.0 leads the feed");
  // 2. the story prose + the honoured probe line re-key as ONE block
  if (!src.includes(FROM_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.468.0 story block drifted from the anchored bytes`);
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

// ── the archive door's story (sixty-one → sixty-two, the lead's +1) ─────
let archive = readFileSync(ARCHIVE, 'utf8');
const aBefore = archive;
if (archive.includes("story sixty-two")) {
  console.log(`${ARCHIVE}: already at sixty-two (idempotent no-op)`);
} else {
  archive = archive.replace(
    "    // v2.468.0 hand-over: the lead tells the edit-door story now; the",
    "    // v2.469.0 hand-over: the lead tells the settings-desk story now; the",
  );
  archive = archive.replace(
    "    // archive-door story sixty-one — all still in the feed",
    "    // archive-door story sixty-two — all still in the feed",
  );
  archive = archive.replace(
    `    // v2.468.0 re-key (dated): the lead speaks the edit-door round —
    // the number learns its edit door (the picker chip's promise
    // kept), and the census grows its fourth voice.`,
    `    // v2.469.0 re-key (dated): the lead speaks the settings-desk round —
    // the branch's own words come home (the mock retired), and the
    // details write joins the registry.`,
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

console.log(`\n${edits} edit(s) across ${files} file(s).`);
console.log('a second run answers 0 everywhere.');
console.log('v2.469.0\'s own line-carried tail: "The settings desk learns the branch\'s own words."');
