#!/usr/bin/env node
/**
 * walk-v2324.mjs — the v2.324.0 re-anchor codemod (one-off, BY WRITE —
 * the Task 234/43/44 law: a fresh Write, never a sed of last round's
 * script; the sed trap corrupted three anchors at once in v2.323's first
 * run and the tell was a silent counters-only pass).
 *
 * The treadmill law, assert-line-only (same law as walk-v2323/…/v2312):
 *   1. VERSION RE-ANCHOR — on every test line that is an assertion
 *      (contains `toBe(` or `toContain(`), the release pin '2.323.0'
 *      becomes '2.324.0'. Comment-only lines keep their history (the
 *      trail of what each earlier release pinned), so the file narrates
 *      its own past while its asserts speak the present.
 *      v2.316 GUARD (carried): historical DOC-NOTE pins are
 *      release-history, not release pins — an assert line carrying
 *      `docs.includes('**` is skipped (the docs' `**v2.323.0**` note
 *      must stay v2.323.0 forever; the doc's own chronology is the
 *      trail).
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1, in BOTH shapes: real asserts
 *      (console-changelog.test.ts) and metatest toContain strings (the
 *      census/watcher files that pin the changelog test's own source).
 *      Current anchors after v2.323.0: 214 / 215 / 216 / 247 →
 *      215 / 216 / 217 / 248.
 *   3. THE HISTORY COMMENT — console-changelog.test.ts's cascade block
 *      gains its v2.324.0 line, continuing the trail (honest transition
 *      numbers — v2.323's line duplicated v2.322's numbers; this one
 *      speaks the real 214/215/216/247 → 215/216/217/248).
 *
 * Scope: test files under src/ ONLY. Ancestor verify:/check-merge: scripts
 * are stale-by-design (they pin their own release) and are never touched.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const files = execSync("rg -l --glob '*.test.ts' '2\\.323\\.0|whatsNewUnreadCount' src/", {
  encoding: 'utf8',
  cwd: new URL('..', import.meta.url).pathname,
})
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(214)", "whatsNewUnreadCount('2.110.0')).toBe(215)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(215)", "whatsNewUnreadCount('2.109.0')).toBe(216)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(216)", "whatsNewUnreadCount('2.108.0')).toBe(217)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(247)", "whatsNewUnreadCount('2.77.0')).toBe(248)"],
];

const HISTORY_LINE =
  "    // v2.324.0: the roster's-own-word entry joins the feed (+1 on every anchor → 214/215/216/247 → 215/216/217/248)";

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
    // The doc-note guard (v2.316 law, carried): a historical doc-note pin
    // (`docs.includes('**vX…`) is the trail, not the release — skip it
    // exactly like a comment line.
    const isDocNote = line.includes("docs.includes('**");
    const isPinnable = isAssert && !isComment && !isDocNote;
    if (isDocNote && isAssert) docNoteSkips++;

    if (isPinnable && line.includes("'2.323.0'")) {
      lines[i] = line.replaceAll("'2.323.0'", "'2.324.0'");
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

  // The history comment lands just above the cascade's expect block.
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

console.log(`walk-v2324: ${touched.length} files · ${pinLines} version-pin lines · ${counterLines} counter lines · ${docNoteSkips} doc-note lines guarded`);
for (const t of touched) console.log(`  · ${t}`);
