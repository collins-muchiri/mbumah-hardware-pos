#!/usr/bin/env node
// story-handover-v2477.mjs — v2.477.0's story hand-over, applied by WRITE
// (the BY WRITE law: each round's codemod is WRITTEN — a full authored
// file, never derived by slicing the previous round's script). Guarded
// and idempotent — a second run answers 0 replacements.
//
//   THE TASK 111 LAW'S EIGHTY-THIRD APPLICATION (story seventy):
//   the nine deep-link suites' hand-over blocks re-key to v2.477.0's
//   own story — the chorus learns the paper's scannable door (the
//   lead card, the collective word's own scan) — and the archive
//   door's story rides one entry deeper (sixty-nine → seventy, the
//   lead's +1).
//
//   THE C_END PROBE, HONOURED: v2.476.0's line-carried tail ("The
//   chorus rides the chat door.") is honoured by v2.477.0's own
//   lead title, which carries the phrase verbatim — the elder chain
//   holds. THIS ROUND'S OWN LINE-CARRIED TAIL (v2.478.0's probe to
//   honour): "The chorus learns the paper's scannable door."
//
//   THE MUSEUM RE-KEYS, DATED (the guard COMES WITH THE FIND — the
//   v2.470.0 law born of the TS18048 dance):
//   • dead-stock-view-voice-v2475 — the view's whats-new pin stops
//     riding the living head (the v2.476.0 round re-pointed it; this
//     round retires it): `const head = WHATS_NEW[0]` becomes a find
//     of the suite's own 2.475.0 entry WITH the honest guard-throw
//     line (never a non-null assertion — the lint's 456th warning
//     would break HOLD THE ZERO); the version web moved the living
//     pin to 2.477.0 and this re-key moves it BACK to its own story,
//     forever; the describe label stops saying "leads the feed".
//   • dead-stock-chorus-chat-v2476 — the round's own whats-new pin
//     stops riding the living head: the find of its own 2.476.0
//     entry WITH the guard line; the release-parity test sheds its
//     version literal (the living parity line carries it now —
//     WHATS_NEW[0].version, never a stamped '2.476.0'), the
//     changelog's historical order pins keep their bytes; the
//     describe label stops saying "leads the feed".
//
//   THE ORDER LAW: this codemod runs AFTER walk-v2477.mjs — the walk
//   already re-keyed the deep-link suites' version pins
//   (toBe('2.476.0') → toBe('2.477.0')); this codemod re-keys the
//   story prose the walk must never touch, and back-keys the two
//   museums the walk moved. THE PAIR RUNS ONCE (v2.472.0's process
//   law): after this codemod's museum back-keys, the walk never
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
const VIEW = 'src/tests/dead-stock-view-voice-v2475.test.ts';
const CHAT = 'src/tests/dead-stock-chorus-chat-v2476.test.ts';

const FROM_BLOCK = JSON.parse("\"    // the lead's story hand-over (v2.476.0, the Task 111 law's\\n    // eighty-second application): the head story is the hand-over's\\n    // voice \\u2014 the carrying round: THE CHORUS RIDES THE CHAT\\n    // DOOR \\u2014 the dead-stock ledger's collective word learns its\\n    // own reach-out: the ledger header grows the Share all handle\\n    // beside the Copy all handle, one press opening WhatsApp with\\n    // the WHOLE clearance chorus pre-filled \\u2014 the SAME\\n    // deadStockClearanceNotes bytes the clipboard carries, never a\\n    // re-typed word \\u2014 pre-addressed to the store's own chat when\\n    // the branch keeps a phone on file (the contact's phone rides\\n    // the composer's third word, the ONE home's own guard), the\\n    // chat picker answering for the branch with none; the composer\\n    // deadStockChorusShareUrl lives in the ONE home (the desk\\n    // never spells the host's word), the handle wears the compact\\n    // face and the share family's emerald hover, the double voice\\n    // every handle wears, the honesty law holds \\u2014 it only shows\\n    // when rows exist, a blocked window speaks its side \\u2014 the\\n    // census grows its tenth voice (the dated re-key holds it),\\n    // and the view/archive law stands: the file, the clipboard's\\n    // copy all chorus and the print door keep the canonical rows.\\n    // The chorus rides the chat door.\"");

const TO_BLOCK = JSON.parse("\"    // the lead's story hand-over (v2.477.0, the Task 111 law's\\n    // eighty-third application): the head story is the hand-over's\\n    // voice \\u2014 the carrying round: THE CHORUS LEARNS THE PAPER'S\\n    // SCANNABLE DOOR \\u2014 the print appendix's scan grid grows the\\n    // LEAD card: one QR drawn by the qrcode house encoding the ONE\\n    // home's deadStockChorusShareUrl (the exact bytes the Share all\\n    // handle opens, the store's own number riding its third word\\n    // when the branch keeps one on file), captioned \\\"The ledger's\\n    // chorus\\\" with the honest count note, the teal dress marking\\n    // the collective door beside the rows' own cards; the paper\\n    // wears its own dress (the rose markers on the numbered asks,\\n    // the note in the teal word \\u2014 new CSS lines, the standing\\n    // bytes untouched), the gate stays the dead-stock stage with\\n    // rows, the window still opens first, a failed draw prints\\n    // the paper without the cards, the census keeps its ten\\n    // voices (a drawn image, never a handle), and the desk never\\n    // spells the host's word.\\n    // The chorus learns the paper's scannable door.\"");

let files = 0;
let edits = 0;

for (const path of LINKS) {
  let src = readFileSync(path, 'utf8');
  const before = src;
  if (src.includes("eighty-third application")) {
    console.log(`${path}: already handed over (idempotent no-op)`);
    continue;
  }
  if (!src.includes("eighty-second application")) {
    console.error(`FAIL: ${path} carries neither the eighty-third nor the eighty-second application`);
    process.exit(1);
  }
  // 1. the describe label rides the version stamp (the v2.476.0 round
  //    left the labels at v2.475.0 — this handover takes them whole)
  src = src.replace("whats-new — v2.475.0 leads the feed", "whats-new — v2.477.0 leads the feed");
  // 2. the story prose + the honoured probe line re-key as ONE block
  if (!src.includes(FROM_BLOCK)) {
    console.error(`FAIL: ${path} — the v2.476.0 story block drifted from the anchored bytes`);
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

// ── the archive door's story (sixty-nine → seventy, the lead's +1) ───
let archive = readFileSync(ARCHIVE, 'utf8');
const aBefore = archive;
if (archive.includes("story seventy")) {
  console.log(`${ARCHIVE}: already at seventy (idempotent no-op)`);
} else {
  archive = archive.replace(
    "    // v2.476.0 hand-over: the lead tells the chat-door story now; the",
    "    // v2.477.0 hand-over: the lead tells the chorus-paper story now; the",
  );
  archive = archive.replace(
    "    // archive-door story sixty-nine — all still in the feed",
    "    // archive-door story seventy — all still in the feed",
  );
  archive = archive.replace(
    `    // v2.476.0 re-key (dated): the lead speaks the chat-door round —
    // the chorus rides the chat door (the Share all handle, the
    // collective word's own reach-out), and the family keeps its seats.`,
    `    // v2.477.0 re-key (dated): the lead speaks the chorus-paper round —
    // the chorus learns the paper's scannable door (the lead card, the
    // collective word's own scan), and the family keeps its seats.`,
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

// ── the v2475 view suite's museum re-key (dated — the guard rides the find) ─
let view = readFileSync(VIEW, 'utf8');
const vBefore = view;
if (view.includes("WHATS_NEW.find((e) => e.version === '2.475.0')")) {
  console.log(`${VIEW}: museum pin already re-keyed (idempotent no-op)`);
} else {
  view = view.replace(
    "  const head = WHATS_NEW[0];",
    "  const head = WHATS_NEW.find((e) => e.version === '2.475.0');\n  if (!head) throw new Error('the 2.475.0 entry is gone from the feed');",
  );
  view = view.replace(
    "expect(head.version).toBe('2.477.0');",
    "expect(head.version).toBe('2.475.0');",
  );
  view = view.replace(
    "describe('whats-new — the view leads the feed'",
    "describe('whats-new — the view, pinned in the feed'",
  );
  if (view !== vBefore) {
    writeFileSync(VIEW, view);
    files++;
    edits += 3;
    console.log(`${VIEW}: head → own-entry find + guard + version back-key + label (3 edits)`);
  } else {
    console.error(`FAIL: ${VIEW} — no anchored bytes matched`);
    process.exit(1);
  }
}

// ── the v2476 chat suite's museum re-key (dated — the guard rides the find) ─
let chat = readFileSync(CHAT, 'utf8');
const cBefore = chat;
if (chat.includes("WHATS_NEW.find((e) => e.version === '2.476.0')")) {
  console.log(`${CHAT}: museum pin already re-keyed (idempotent no-op)`);
} else {
  chat = chat.replace(
    "    const head = WHATS_NEW[0];",
    "    const head = WHATS_NEW.find((e) => e.version === '2.476.0');\n    if (!head) throw new Error('the 2.476.0 entry is gone from the feed');",
  );
  chat = chat.replace(
    "expect(head.version).toBe('2.477.0');",
    "expect(head.version).toBe('2.476.0');",
  );
  chat = chat.replace(
    "expect(pkg.version).toBe('2.477.0');",
    "expect(pkg.version).toBe(WHATS_NEW[0].version);",
  );
  chat = chat.replace(
    "describe('whats-new — the round leads the feed'",
    "describe('whats-new — the round, pinned in the feed'",
  );
  if (chat !== cBefore) {
    writeFileSync(CHAT, chat);
    files++;
    edits += 4;
    console.log(`${CHAT}: head → own-entry find + guard + version back-key + parity literal shed + label (4 edits)`);
  } else {
    console.error(`FAIL: ${CHAT} — no anchored bytes matched`);
    process.exit(1);
  }
}

console.log(`\n${edits} edit(s) across ${files} file(s).`);
console.log('a second run answers 0 everywhere.');
console.log("v2.477.0's own line-carried tail: \"The chorus learns the paper's scannable door.\"");
