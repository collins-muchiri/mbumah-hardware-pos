#!/usr/bin/env node
/**
 * walk-v2360.mjs — the v2.360.0 re-anchor codemod (one-off, BY WRITE —
 * the Task 234/43-71 law: a fresh Write, never a sed of last round's
 * script).
 *
 * The treadmill law, assert-line-only (same law as walk-v2323/…/v2358):
 *   1. VERSION RE-ANCHOR — on every pinnable assert line, the STANDALONE
 *      quoted release pin `'2.359.0'` becomes `'2.360.0'`. The quote-quote
 *      form is the law: an EMBEDDED reference inside a longer string is
 *      release HISTORY, not a release pin — it never re-anchors.
 *      Comment-only lines keep their history. The v2.316 GUARD (carried):
 *      historical DOC-NOTE pins (`docs.includes('**`) are skipped.
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1. Current anchors after
 *      v2.359.0: 249 / 250 / 251 / 282 → 250 / 251 / 252 / 283.
 *   3. THE HISTORY BLOCK — the cascade block gains its v2.360.0 line
 *      (249/250/251/282 → 250/251/252/283). One line per release
 *      (asserted by verify).
 *
 * Scope: test files under src/ ONLY. Ancestor verify:/check-merge:
 * scripts are stale-by-design and are never touched.
 * THE DERIVATION-ASSERT LAW: every replacement class prints its raw
 * count, and a re-run of this script must answer ZERO everywhere
 * (idempotence is the proof the cascade landed exactly once).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync("rg -l --glob '*.test.ts' '2\\.359\\.0|whatsNewUnreadCount' src/", {
  encoding: 'utf8',
  cwd: new URL('..', import.meta.url).pathname,
})
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(249)", "whatsNewUnreadCount('2.110.0')).toBe(250)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(250)", "whatsNewUnreadCount('2.109.0')).toBe(251)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(251)", "whatsNewUnreadCount('2.108.0')).toBe(252)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(282)", "whatsNewUnreadCount('2.77.0')).toBe(283)"],
];

// (3) this round's cascade line — the ENGLISH COMPOUND (the word's
// literal `vc-status` would make the cascade block SPEAK the word — the
// HISTORY-LINE LITERAL law, v2.356.0 hardened; `vc-status` is an
// abbreviation, so the compound is the desk's own words)
const HISTORY_LINE =
  "    // v2.360.0: the voucher-status entry joins the feed (+1 on every anchor → 249/250/251/282 → 250/251/252/283)";

let pinLines = 0;
let counterLines = 0;
let docNoteSkips = 0;
let historyFixes = 0;
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

    // (1) the release re-anchor — STANDALONE quoted pins only (the law:
    // '2.359.0' with both quotes; embedded v2.359.0 references are history)
    if (isPinnable && line.includes("'2.359.0'")) {
      lines[i] = line.replaceAll("'2.359.0'", "'2.360.0'");
      pinLines++;
      fileChanged = true;
      continue;
    }
    if (isAssert && isDocNote && line.includes("'2.359.0'")) {
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

  // (3) the history block rides the cascade block it documents
  if (rel.endsWith('console-changelog.test.ts')) {
    const joined = lines.join('\n');
    // this round's line, spliced once above the first anchor
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
console.log(`counter lines cascaded: ${counterLines}`);
console.log(`doc-note skips: ${docNoteSkips}`);
console.log(`history fixes: ${historyFixes}`);
console.log(`files touched: ${touched.length}`);
for (const t of touched) console.log(`  - ${t}`);
