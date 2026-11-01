#!/usr/bin/env node
/**
 * walk-v2335.mjs — the v2.335.0 re-anchor codemod (one-off, BY WRITE —
 * the Task 234/43-55 law: a fresh Write, never a sed of last round's
 * script).
 *
 * The treadmill law, assert-line-only (same law as walk-v2323/…/v2334):
 *   1. VERSION RE-ANCHOR — on every test line that is an assertion
 *      (contains `toBe(` or `toContain(`), the release pin '2.334.0'
 *      becomes '2.335.0'. Comment-only lines keep their history.
 *      v2.316 GUARD (carried): historical DOC-NOTE pins
 *      (`docs.includes('**`) are release-history, not release pins —
 *      skipped.
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1. Current anchors after
 *      v2.334.0: 225 / 226 / 227 / 258 → 226 / 227 / 228 / 259.
 *   3. THE HISTORY COMMENT — console-changelog.test.ts's cascade block
 *      gains its v2.335.0 line (honest transition numbers —
 *      225/226/227/258 → 226/227/228/259).
 *
 * Scope: test files under src/ ONLY. Ancestor verify:/check-merge:
 * scripts are stale-by-design and are never touched.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync("rg -l --glob '*.test.ts' '2\\.334\\.0|whatsNewUnreadCount' src/", {
  encoding: 'utf8',
  cwd: new URL('..', import.meta.url).pathname,
})
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(225)", "whatsNewUnreadCount('2.110.0')).toBe(226)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(226)", "whatsNewUnreadCount('2.109.0')).toBe(227)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(227)", "whatsNewUnreadCount('2.108.0')).toBe(228)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(258)", "whatsNewUnreadCount('2.77.0')).toBe(259)"],
];

const HISTORY_LINE =
  "    // v2.335.0: the financial-doors entry joins the feed (+1 on every anchor → 225/226/227/258 → 226/227/228/259)";

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
    if (isDocNote && isAssert) docNoteSkips++;

    if (isPinnable && line.includes("'2.334.0'")) {
      lines[i] = line.replaceAll("'2.334.0'", "'2.335.0'");
      pinLines++;
      fileChanged = true;
    }
    if (isPinnable) {
      let next = lines[i];
      for (const [from, to] of ANCHORS) next = next.split(from).join(to);
      if (next !== lines[i]) {
        lines[i] = next;
        counterLines++;
        fileChanged = true;
      }
    }
  }

  if (rel.endsWith('console-changelog.test.ts') && !before.includes(HISTORY_LINE)) {
    const idx = lines.findIndex((l) => l.includes("expect(whatsNewUnreadCount('2.110.0'))"));
    if (idx > 0) {
      lines.splice(idx, 0, HISTORY_LINE);
      fileChanged = true;
    }
  }

  if (fileChanged) {
    writeFileSync(abs, lines.join('\n'));
    touched.push(rel);
  }
}

console.log(`walk-v2335: ${touched.length} files, ${pinLines} pin lines, ${counterLines} counter lines, ${docNoteSkips} doc-note skips`);
for (const rel of touched) console.log(`  ${rel}`);
