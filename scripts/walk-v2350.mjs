#!/usr/bin/env node
/**
 * walk-v2350.mjs — the v2.350.0 re-anchor codemod (one-off, BY WRITE —
 * the Task 234/43-69 law: a fresh Write, never a sed of last round's
 * script).
 *
 * The treadmill law, assert-line-only (same law as walk-v2323/…/v2348):
 *   1. VERSION RE-ANCHOR — on every pinnable assert line, the STANDALONE
 *      quoted release pin `'2.348.0'` becomes `'2.350.0'`. THE SLOT LAW
 *      THIS ROUND: 2.349.0 is RESERVED for the gated audit-remediation PR
 *      (#440) — the walk skips it entirely; the treadmill jumps 2.348.0 →
 *      2.350.0. The quote-quote form is the law: an EMBEDDED reference
 *      inside a longer string is release HISTORY, not a release pin — it
 *      never re-anchors. Comment-only lines keep their history. v2.316
 *      GUARD (carried): historical DOC-NOTE pins (`docs.includes('**`) are
 *      skipped.
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1. Current anchors after
 *      v2.348.0: 239 / 240 / 241 / 272 → 240 / 241 / 242 / 273.
 *   3. THE HISTORY COMMENT — console-changelog.test.ts's cascade block
 *      gains its v2.350.0 line (honest transition numbers —
 *      239/240/241/272 → 240/241/242/273).
 *
 * Scope: test files under src/ ONLY. Ancestor verify:/check-merge:
 * scripts are stale-by-design and are never touched.
 * THE DERIVATION-ASSERT LAW: every replacement class prints its raw
 * count, and a re-run of this script must answer ZERO everywhere
 * (idempotence is the proof the cascade landed exactly once).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync("rg -l --glob '*.test.ts' '2\\.348\\.0|whatsNewUnreadCount' src/", {
  encoding: 'utf8',
  cwd: new URL('..', import.meta.url).pathname,
})
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(239)", "whatsNewUnreadCount('2.110.0')).toBe(240)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(240)", "whatsNewUnreadCount('2.109.0')).toBe(241)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(241)", "whatsNewUnreadCount('2.108.0')).toBe(242)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(272)", "whatsNewUnreadCount('2.77.0')).toBe(273)"],
];

const HISTORY_LINE =
  "    // v2.350.0: the phase-2 census entry joins the feed (+1 on every anchor → 239/240/241/272 → 240/241/242/273)";

let pinLines = 0;
let counterLines = 0;
let docNoteSkips = 0;
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
    // '2.348.0' with both quotes; embedded v2.348.0 references are history;
    // 2.349.0 is the RESERVED slot and never appears in a pin)
    if (isPinnable && line.includes("'2.348.0'")) {
      lines[i] = line.replaceAll("'2.348.0'", "'2.350.0'");
      pinLines++;
      fileChanged = true;
      continue;
    }
    if (isAssert && isDocNote && line.includes("'2.348.0'")) {
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

  // (3) the history comment rides the cascade block it documents
  if (rel.endsWith('console-changelog.test.ts')) {
    const joined = lines.join('\n');
    if (!joined.includes(HISTORY_LINE)) {
      const anchorIdx = lines.findIndex((l) => l.includes("whatsNewUnreadCount('2.110.0'))"));
      if (anchorIdx !== -1) {
        lines.splice(anchorIdx, 0, HISTORY_LINE);
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
console.log(`files touched: ${touched.length}`);
for (const t of touched) console.log(`  - ${t}`);
