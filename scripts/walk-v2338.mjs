#!/usr/bin/env node
/**
 * walk-v2338.mjs — the v2.338.0 re-anchor codemod (one-off, BY WRITE —
 * the Task 234/43-58 law: a fresh Write, never a sed of last round's
 * script).
 *
 * The treadmill law, assert-line-only (same law as walk-v2323/…/v2337):
 *   1. VERSION RE-ANCHOR — on every pinnable assert line, the STANDALONE
 *      quoted release pin `'2.337.0'` becomes `'2.338.0'`. The quote-quote
 *      form is the law (walk-v2337's true shape): an EMBEDDED reference
 *      inside a longer string (`'v2.337.0 — THE BANKING FAMILY…'`) is
 *      release HISTORY, not a release pin — it never re-anchors. Comment-
 *      only lines keep their history. v2.316 GUARD (carried): historical
 *      DOC-NOTE pins (`docs.includes('**`) are skipped.
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1. Current anchors after
 *      v2.337.0: 228 / 229 / 230 / 261 → 229 / 230 / 231 / 262.
 *   3. THE HISTORY COMMENT — console-changelog.test.ts's cascade block
 *      gains its v2.338.0 line (honest transition numbers —
 *      228/229/230/261 → 229/230/231/262).
 *
 * Scope: test files under src/ ONLY. Ancestor verify:/check-merge:
 * scripts are stale-by-design and are never touched.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync("rg -l --glob '*.test.ts' '2\\.337\\.0|whatsNewUnreadCount' src/", {
  encoding: 'utf8',
  cwd: new URL('..', import.meta.url).pathname,
})
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(228)", "whatsNewUnreadCount('2.110.0')).toBe(229)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(229)", "whatsNewUnreadCount('2.109.0')).toBe(230)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(230)", "whatsNewUnreadCount('2.108.0')).toBe(231)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(261)", "whatsNewUnreadCount('2.77.0')).toBe(262)"],
];

const HISTORY_LINE =
  "    // v2.338.0: the customer-doors entry joins the feed (+1 on every anchor → 228/229/230/261 → 229/230/231/262)";

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
    // '2.337.0' with both quotes; embedded v2.337.0 references are history)
    if (isPinnable && line.includes("'2.337.0'")) {
      lines[i] = line.replaceAll("'2.337.0'", "'2.338.0'");
      pinLines++;
      fileChanged = true;
      continue;
    }
    if (isAssert && isDocNote && line.includes("'2.337.0'")) {
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
