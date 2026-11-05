#!/usr/bin/env node
/**
 * walk-v2400.mjs — the v2.400.0 re-anchor codemod (one-off, BY WRITE —
 * the Task 234/43-99 law: a fresh Write, never a sed of last round's
 * script).
 *
 * The treadmill law, assert-line-only (same law as walk-v2323/…/v2399):
 *   1. VERSION RE-ANCHOR — on every pinnable assert line, the STANDALONE
 *      quoted release pin `'2.399.0'` becomes `'2.400.0'`. The quote-quote
 *      form is the law: an EMBEDDED reference inside a longer string is
 *      release HISTORY, not a release pin — it never re-anchors.
 *      Comment-only lines keep their history. The v2.316 GUARD (carried):
 *      historical DOC-NOTE pins (`docs.includes('**`) are skipped. The
 *      WALK-PROOF guard (carried): a negative pin whose LEFT side is a
 *      split-string concat (`expect('2.' + '399.0')`) is walk-proof
 *      HISTORY — never re-anchored.
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1. Current anchors after
 *      v2.399.0: 289 / 290 / 291 / 322 → 290 / 291 / 292 / 323 (the
 *      cascade's ELEVENTH generation).
 *   3. THE HISTORY BLOCK — the cascade block gains its v2.400.0 line
 *      (the ENGLISH COMPOUND — the HISTORY-LINE LITERAL law, v2.356.0:
 *      no word literal rides the cascade block). Idempotence guard: the
 *      insert skips when the line is already present.
 *   4. NO CONSTITUTION TITLE RE-ANCHOR this round: the support copy adds
 *      no deep-link word and no desk — the title stays
 *      `(thirty-two words, twenty-six desks)`.
 *
 * Scope: test files under src/ ONLY. Ancestor verify:/check-merge:
 * scripts are stale-by-design and are never touched.
 * THE DERIVATION-ASSERT LAW: every replacement class prints its raw
 * count, and a re-run of this script must answer ZERO everywhere
 * (idempotence is the proof the cascade landed exactly once).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync(
  "rg -l --glob '*.test.ts' '2\\.399\\.0|whatsNewUnreadCount' src/",
  { encoding: 'utf8', cwd: new URL('..', import.meta.url).pathname },
)
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(289)", "whatsNewUnreadCount('2.110.0')).toBe(290)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(290)", "whatsNewUnreadCount('2.109.0')).toBe(291)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(291)", "whatsNewUnreadCount('2.108.0')).toBe(292)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(322)", "whatsNewUnreadCount('2.77.0')).toBe(323)"],
];

// (3) this round's cascade line — the ENGLISH COMPOUND (the HISTORY-LINE
// LITERAL law: no word literal rides the cascade block). The walk inserts
// it exactly once; the presence guard makes a re-run answer zero.
const HISTORY_LINE =
  '    // v2.400.0: the health desk hands you the words \u2014 the Environment & Connection panel\u2019s report leaves the desk as plain text (formatEnvDiagnostics: the header, the overall verdict, one LABEL: STATUS line per row in the panel\u2019s own order, and the doctor card\u2019s diagnosis block \u2014 code, summary, the remedy table\u2019s ordered steps verbatim), the Copy button rides the panel\u2019s header with the receipt hop\u2019s two-second Copied hand-back (the icon swaps with the label, the emerald family marks the success state \u2014 the elder census registered the new honest wearer, sharedWith 11), envRowLabel retires the tab\u2019s inline label map (one home \u2014 chip and clipboard cannot drift), and the advisory pool\u2019s first nine faces stand down behavior-identically (the tab mapper\u2019s honest predicate, the shared recount guard, the DashboardStats re-type, the portal defaults, the vocabulary probe \u2014 488 \u2192 479), and the entry joins the feed (+1 on every unread anchor \u2014 the DERIVED anchors re-set themselves, the cascade\u2019s eleventh generation)';

let pinLines = 0;
let counterLines = 0;
let docNoteSkips = 0;
let historyFixes = 0;
const touched = [];

for (const rel of files) {
  const abs = new URL(`../${rel}`, import.meta.url).pathname;
  const before = readFileSync(abs, 'utf8');
  let text = before;
  const lines = text.split('\n');
  let fileChanged = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const isComment = trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
    const isAssert = line.includes('toBe(') || line.includes('toContain(');
    const isDocNote = line.includes("docs.includes('**");
    const isWalkProofNegative = /\bexpect\('2\.' \+/.test(line);
    const isPinnable = isAssert && !isComment && !isDocNote && !isWalkProofNegative;

    // (1) the release re-anchor — STANDALONE quoted pins only
    if (isPinnable && line.includes("'2.399.0'")) {
      lines[i] = line.replaceAll("'2.399.0'", "'2.400.0'");
      pinLines++;
      fileChanged = true;
      continue;
    }
    if (isAssert && isDocNote && line.includes("'2.399.0'")) {
      docNoteSkips++;
      continue;
    }

    // (2) the unread-counter cascade
    for (const [from, to] of ANCHORS) {
      if (line.includes(from)) {
        lines[i] = line.split(from).join(to);
        counterLines++;
        fileChanged = true;
        break;
      }
    }
  }
  text = lines.join('\n');

  // (3) the history block rides the cascade block it documents
  if (rel.endsWith('console-changelog.test.ts')) {
    if (!text.includes(HISTORY_LINE)) {
      const anchorIdx = text.split('\n').findIndex((l) => l.includes("whatsNewUnreadCount('2.110.0'))"));
      if (anchorIdx !== -1) {
        const arr = text.split('\n');
        arr.splice(anchorIdx, 0, HISTORY_LINE);
        text = arr.join('\n');
        historyFixes++;
        fileChanged = true;
      }
    }
  }

  if (fileChanged && text !== before) {
    writeFileSync(abs, text);
    touched.push(rel);
  }
}

console.log(`files scanned: ${files.length}`);
console.log(`pin lines re-anchored: ${pinLines}`);
console.log(`counter lines cascaded: ${counterLines}`);
console.log(`doc-note skips: ${docNoteSkips}`);
console.log(`history lines inserted: ${historyFixes}`);
console.log(`files touched: ${touched.length}`);
for (const t of touched) console.log(`  ${t}`);
