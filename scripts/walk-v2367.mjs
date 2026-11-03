#!/usr/bin/env node
/**
 * walk-v2367.mjs — the v2.367.0 re-anchor codemod (one-off, BY WRITE —
 * the Task 234/43-71 law: a fresh Write, never a sed of last round's
 * script).
 *
 * The treadmill law, assert-line-only (same law as walk-v2323/…/v2366):
 *   1. VERSION RE-ANCHOR — on every pinnable assert line, the STANDALONE
 *      quoted release pin `'2.366.0'` becomes `'2.367.0'`. The quote-quote
 *      form is the law: an EMBEDDED reference inside a longer string is
 *      release HISTORY, not a release pin — it never re-anchors.
 *      Comment-only lines keep their history. The v2.316 GUARD (carried):
 *      historical DOC-NOTE pins (`docs.includes('**`) are skipped.
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1. Current anchors after
 *      v2.366.0: 256 / 257 / 258 / 289 → 257 / 258 / 259 / 290.
 *   3. THE HISTORY BLOCK — the cascade block gains its v2.367.0 line.
 *   4. THE TITLE-PIN RE-ANCHOR (carried from v2.364.0) — the
 *      constitution's shape title grew a row: every elder suite's assert
 *      pin of `(nineteen words, seventeen desks)` becomes
 *      `(twenty words, eighteen desks)` (the constitution's own describe
 *      re-anchored by hand BEFORE the run — the law running ahead of the
 *      suite).
 *
 * Scope: test files under src/ ONLY. Ancestor verify:/check-merge:
 * scripts are stale-by-design and are never touched.
 * THE DERIVATION-ASSERT LAW: every replacement class prints its raw
 * count, and a re-run of this script must answer ZERO everywhere
 * (idempotence is the proof the cascade landed exactly once).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync("rg -l --glob '*.test.ts' '2\\.366\\.0|whatsNewUnreadCount|nineteen words' src/", {
  encoding: 'utf8',
  cwd: new URL('..', import.meta.url).pathname,
})
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(256)", "whatsNewUnreadCount('2.110.0')).toBe(257)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(257)", "whatsNewUnreadCount('2.109.0')).toBe(258)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(258)", "whatsNewUnreadCount('2.108.0')).toBe(259)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(289)", "whatsNewUnreadCount('2.77.0')).toBe(290)"],
];

// (3) this round's cascade line — the ENGLISH COMPOUND (the word's
// literal `sec-type` would make the cascade block SPEAK the word — the
// HISTORY-LINE LITERAL law, v2.356.0 hardened; the compound is the
// desk's own words)
const HISTORY_LINE =
  "    // v2.367.0: the watchtower entry joins the feed (+1 on every anchor → 256/257/258/289 → 257/258/259/290)";

let pinLines = 0;
let counterLines = 0;
let docNoteSkips = 0;
let historyFixes = 0;
let titlePins = 0;
const touched = [];

for (const rel of files) {
  const abs = new URL(`../${rel}`, import.meta.url).pathname;
  const before = readFileSync(abs, 'utf8');
  const lines = before.split('\n');
  let fileChanged = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const isComment = trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*');
    const isAssert = line.includes('toBe(') || line.includes('toContain(');
    const isDocNote = line.includes("docs.includes('**");
    const isPinnable = isAssert && !isComment && !isDocNote;

    // (1) the release re-anchor — STANDALONE quoted pins only
    if (isPinnable && line.includes("'2.366.0'")) {
      lines[i] = line.replaceAll("'2.366.0'", "'2.367.0'");
      pinLines++;
      fileChanged = true;
      continue;
    }
    if (isAssert && isDocNote && line.includes("'2.366.0'")) {
      docNoteSkips++;
      continue;
    }

    // (4) the title-pin re-anchor — the constitution's shape title
    if (isPinnable && line.includes('(nineteen words, seventeen desks)')) {
      lines[i] = line.replaceAll('(nineteen words, seventeen desks)', '(twenty words, eighteen desks)');
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

  // (3) the history block rides the cascade block it documents
  if (rel.endsWith('console-changelog.test.ts')) {
    const joined = lines.join('\n');
    if (!joined.includes(HISTORY_LINE)) {
      const anchorIdx = lines.findIndex((l) => l.includes("whatsNewUnreadCount('2.110.0'))"));
      if (anchorIdx !== -1) {
        lines.splice(anchorIdx, 0, HISTORY_LINE);
        historyFixes++;
        fileChanged = true;
      }
    }
  }

  if (fileChanged) {
    writeFileSync(abs, lines.join('\n'));
    touched.push(rel);
  }
}

console.log(`files scanned: ${files.length}`);
console.log(`pin lines re-anchored: ${pinLines}`);
console.log(`title pins re-anchored: ${titlePins}`);
console.log(`counter lines cascaded: ${counterLines}`);
console.log(`doc-note skips: ${docNoteSkips}`);
console.log(`history fixes: ${historyFixes}`);
console.log(`files touched: ${touched.length}`);
for (const t of touched) console.log(`  - ${t}`);
