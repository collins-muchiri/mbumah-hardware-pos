#!/usr/bin/env node
/**
 * walk-v2370.mjs — the v2.370.0 re-anchor codemod (one-off, BY WRITE —
 * the Task 234/43-71 law: a fresh Write, never a sed of last round's
 * script).
 *
 * The treadmill law, assert-line-only (same law as walk-v2323/…/v2369):
 *   1. VERSION RE-ANCHOR — on every pinnable assert line, the STANDALONE
 *      quoted release pin `'2.369.0'` becomes `'2.370.0'`. The quote-quote
 *      form is the law: an EMBEDDED reference inside a longer string is
 *      release HISTORY, not a release pin — it never re-anchors.
 *      Comment-only lines keep their history. The v2.316 GUARD (carried):
 *      historical DOC-NOTE pins (`docs.includes('**`) are skipped.
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1. Current anchors after
 *      v2.369.0: 259 / 260 / 261 / 292 → 260 / 261 / 262 / 293.
 *   3. THE HISTORY BLOCK — the cascade block gains its v2.370.0 line.
 *   4. THE REGISTRY CENSUS INSERTS — the stress suite speaks ALL
 *      TWENTY-ONE words: its WORDS constant (the derived order's literal)
 *      enumerates every row, and its header's naming-history note names
 *      five more in prose. The residue's first draft claimed "exactly two
 *      words" and scoped the inserts to two ledgers — the full vitest
 *      answered with NINETEEN census failures (the sweep finds the file,
 *      the honest ledger must list it). The CORRECTED scope: every suite
 *      the constitution's rows name gains the stress file at the sorted
 *      slot (the LEDGER-CITATION RIPPLE, derived — the constitution is
 *      the input, never a hand list).
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
  "rg -l --glob '*.test.ts' '2\\.369\\.0|whatsNewUnreadCount|gc-status-deep-link-v2358' src/",
  { encoding: 'utf8', cwd: new URL('..', import.meta.url).pathname },
)
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(259)", "whatsNewUnreadCount('2.110.0')).toBe(260)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(260)", "whatsNewUnreadCount('2.109.0')).toBe(261)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(261)", "whatsNewUnreadCount('2.108.0')).toBe(262)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(292)", "whatsNewUnreadCount('2.77.0')).toBe(293)"],
];

// (3) this round's cascade line — the ENGLISH COMPOUND (the HISTORY-LINE
// LITERAL law, v2.356.0 hardened: no word literal rides the cascade block)
const HISTORY_LINE =
  "    // v2.370.0: the registry's derived-walk entry joins the feed (+1 on every anchor → 259/260/261/292 → 260/261/262/293)";

// (4) the registry census inserts — DERIVED from the constitution's
// rows (the CENSUS-INSERT SCOPE LAW with the CORRECTED census: the
// stress file speaks all twenty-one words through its WORDS constant,
// so all twenty-one ledgers gain it — a file that speaks a word must
// be listed, a ledger that omits it is a lie the sweep catches)
const CONSTITUTION = readFileSync(
  new URL('../src/tests/transfer-status-deep-link-v2357.test.ts', import.meta.url), 'utf8',
);
const ROW_RE =
  /\{ word: '([a-z-]+)', desk: '([^']+)', family: '(border-[a-z]+-200)', suite: '([^']+)' \}/g;
const STRESS_PATH = 'src/tests/family-registry-stress-v2370.test.ts';
const PATH_LINE_RE = /^(\s*)'(src\/tests\/[^']+\.test\.ts)',$/;
function insertSortedSlot(text) {
  if (text.includes(STRESS_PATH)) return { text, inserted: false, already: true };
  const arr = text.split('\n');
  const pathLines = arr
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => PATH_LINE_RE.test(l))
    .map(({ l, i }) => ({ path: l.match(PATH_LINE_RE)[2], indent: l.match(PATH_LINE_RE)[1], i }));
  if (!pathLines.length) return { text, inserted: false, already: false };
  const after = pathLines.find((p) => p.path > STRESS_PATH);
  const at = after ? after.i : pathLines[pathLines.length - 1].i + 1;
  arr.splice(at, 0, `${pathLines[0].indent}'${STRESS_PATH}',`);
  return { text: arr.join('\n'), inserted: true, already: false };
}
const censusRows = [...CONSTITUTION.matchAll(ROW_RE)].map((m) => m[4]);
const censusCounts = { inserted: 0, alreadyListed: 0, noPathLines: 0 };

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
    const isPinnable = isAssert && !isComment && !isDocNote;

    // (1) the release re-anchor — STANDALONE quoted pins only
    if (isPinnable && line.includes("'2.369.0'")) {
      lines[i] = line.replaceAll("'2.369.0'", "'2.370.0'");
      pinLines++;
      fileChanged = true;
      continue;
    }
    if (isAssert && isDocNote && line.includes("'2.369.0'")) {
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

  // (4) the registry census inserts — the constitution's twenty-one
  // ledgers, each at the stress file's sorted slot (idempotent by the
  // already-listed guard)
  if (censusRows.includes(rel)) {
    const res = insertSortedSlot(text);
    if (res.inserted) { censusCounts.inserted++; fileChanged = true; }
    else if (res.already) { censusCounts.alreadyListed++; }
    else { censusCounts.noPathLines++; }
    text = res.text;
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
for (const [name, count] of Object.entries(censusCounts)) {
  console.log(`census ${name}: ${count}`);
}
console.log(`census ledgers derived from the constitution: ${censusRows.length}`);
console.log(`files touched: ${touched.length}`);
