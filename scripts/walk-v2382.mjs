#!/usr/bin/env node
/**
 * walk-v2382.mjs — the v2.382.0 re-anchor codemod (one-off, BY WRITE —
 * the Task 234/43-98 law: a fresh Write, never a sed of last round's
 * script).
 *
 * The treadmill law, assert-line-only (same law as walk-v2323/…/v2381):
 *   1. VERSION RE-ANCHOR — on every pinnable assert line, the STANDALONE
 *      quoted release pin `'2.381.0'` becomes `'2.382.0'`. The quote-quote
 *      form is the law: an EMBEDDED reference inside a longer string is
 *      release HISTORY, not a release pin — it never re-anchors.
 *      Comment-only lines keep their history. The v2.316 GUARD (carried):
 *      historical DOC-NOTE pins (`docs.includes('**`) are skipped. The
 *      WALK-PROOF guard (carried): a negative pin whose LEFT side is a
 *      split-string concat (`expect('2.' + '381.0')`) is walk-proof
 *      HISTORY — never re-anchored.
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1. Current anchors after
 *      v2.381.0: 271 / 272 / 273 / 304 → 272 / 273 / 274 / 305.
 *   3. THE HISTORY BLOCK — the cascade block gains its v2.382.0 line
 *      (the ENGLISH COMPOUND — the HISTORY-LINE LITERAL law, v2.356.0:
 *      no word literal rides the cascade block).
 *   4. THE TITLE-PIN RE-ANCHOR (carried from v2.368.0) — the
 *      constitution's shape title grew a row: every elder suite's assert
 *      pin of `(twenty-two words, twenty desks)` becomes
 *      `(twenty-three words, twenty-one desks)` (the constitution's own
 *      describe re-anchored by hand BEFORE the run — the law running
 *      ahead of the suite).
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
  "rg -l --glob '*.test.ts' '2\\.381\\.0|whatsNewUnreadCount|twenty-two words' src/",
  { encoding: 'utf8', cwd: new URL('..', import.meta.url).pathname },
)
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(271)", "whatsNewUnreadCount('2.110.0')).toBe(272)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(272)", "whatsNewUnreadCount('2.109.0')).toBe(273)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(273)", "whatsNewUnreadCount('2.108.0')).toBe(274)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(304)", "whatsNewUnreadCount('2.77.0')).toBe(305)"],
];

// (3) this round's cascade line — the ENGLISH COMPOUND (the HISTORY-LINE
// LITERAL law: no word literal rides the cascade block)
const HISTORY_LINE =
  '    // v2.382.0: the ghost tax desk comes alive and answers the address bar \u2014 the filings ledger\u2019s type lens speaks its desk-prefixed word and the family\u2019s grammar grows its first shade-split (+1 on every anchor \u2192 271/272/273/304 \u2192 272/273/274/305)';

let pinLines = 0;
let counterLines = 0;
let docNoteSkips = 0;
let historyFixes = 0;
let titlePins = 0;
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
    if (isPinnable && line.includes("'2.381.0'")) {
      lines[i] = line.replaceAll("'2.381.0'", "'2.382.0'");
      pinLines++;
      fileChanged = true;
      continue;
    }
    if (isAssert && isDocNote && line.includes("'2.381.0'")) {
      docNoteSkips++;
      continue;
    }

    // (4) the constitution title re-anchor — the elder suites' assert pins
    if (isPinnable && line.includes('(twenty-two words, twenty desks)')) {
      lines[i] = line.replaceAll('(twenty-two words, twenty desks)', '(twenty-three words, twenty-one desks)');
      titlePins++;
      fileChanged = true;
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
console.log(`title pins re-anchored: ${titlePins}`);
console.log(`history lines inserted: ${historyFixes}`);
console.log(`files touched: ${touched.length}`);
for (const t of touched) console.log(`  ${t}`);
