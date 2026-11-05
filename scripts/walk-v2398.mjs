#!/usr/bin/env node
/**
 * walk-v2398.mjs — the v2.398.0 re-anchor codemod (one-off, BY WRITE —
 * the Task 234/43-99 law: a fresh Write, never a sed of last round's
 * script).
 *
 * The treadmill law, assert-line-only (same law as walk-v2323/…/v2397):
 *   1. VERSION RE-ANCHOR — on every pinnable assert line, the STANDALONE
 *      quoted release pin `'2.397.0'` becomes `'2.398.0'`. The quote-quote
 *      form is the law: an EMBEDDED reference inside a longer string is
 *      release HISTORY, not a release pin — it never re-anchors.
 *      Comment-only lines keep their history. The v2.316 GUARD (carried):
 *      historical DOC-NOTE pins (`docs.includes('**`) are skipped. The
 *      WALK-PROOF guard (carried): a negative pin whose LEFT side is a
 *      split-string concat (`expect('2.' + '397.0')`) is walk-proof
 *      HISTORY — never re-anchored.
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1. Current anchors after
 *      v2.397.0: 287 / 288 / 289 / 320 → 288 / 289 / 290 / 321.
 *   3. THE HISTORY BLOCK — the cascade block gains its v2.398.0 line
 *      (the ENGLISH COMPOUND — the HISTORY-LINE LITERAL law, v2.356.0:
 *      no word literal rides the cascade block). Idempotence guard: the
 *      insert skips when the line is already present (it landed by hand
 *      in this round's editing pass).
 *   4. NO CONSTITUTION TITLE RE-ANCHOR this round: the login desk's
 *      doctor adds no deep-link word and no desk — the title stays
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
  "rg -l --glob '*.test.ts' '2\\.397\\.0|whatsNewUnreadCount' src/",
  { encoding: 'utf8', cwd: new URL('..', import.meta.url).pathname },
)
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(287)", "whatsNewUnreadCount('2.110.0')).toBe(288)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(288)", "whatsNewUnreadCount('2.109.0')).toBe(289)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(289)", "whatsNewUnreadCount('2.108.0')).toBe(290)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(320)", "whatsNewUnreadCount('2.77.0')).toBe(321)"],
];

// (3) this round's cascade line — the ENGLISH COMPOUND (the HISTORY-LINE
// LITERAL law: no word literal rides the cascade block). VERBATIM the line
// already inserted by hand in this round's editing pass — the presence
// guard below makes the walk answer zero insertions on re-run.
const HISTORY_LINE =
  '    // v2.398.0: the login desk speaks the failure\u2019s name \u2014 the DB doctor renders the exposed Prisma code, its plain-language title and the documented remediation inline under the banner (the quiet face held when no detail is exposed), the repo-env guard teaches the dev runtime the launchers\u2019 env-wins law (a stray inherited DATABASE_URL can no longer silently redirect `next dev` to a foreign database; the guard speaks only for the two connection vars and no-ops when no .env exists), and the entry joins the feed (+1 on every unread anchor \u2014 the DERIVED anchors re-set themselves, the cascade\u2019s ninth generation)';

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
    if (isPinnable && line.includes("'2.397.0'")) {
      lines[i] = line.replaceAll("'2.397.0'", "'2.398.0'");
      pinLines++;
      fileChanged = true;
      continue;
    }
    if (isAssert && isDocNote && line.includes("'2.397.0'")) {
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
