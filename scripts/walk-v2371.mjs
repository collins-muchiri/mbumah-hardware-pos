#!/usr/bin/env node
/**
 * walk-v2371.mjs — the v2.371.0 re-anchor codemod (one-off, BY WRITE —
 * the Task 234/43-88 law: a fresh Write, never a sed of last round's
 * script).
 *
 * The treadmill law, assert-line-only (same law as walk-v2323/…/v2370):
 *   1. VERSION RE-ANCHOR — on every pinnable assert line, the STANDALONE
 *      quoted release pin `'2.370.0'` becomes `'2.371.0'`. The quote-quote
 *      form is the law: an EMBEDDED reference inside a longer string is
 *      release HISTORY, not a release pin — it never re-anchors.
 *      Comment-only lines keep their history. The v2.316 GUARD (carried):
 *      historical DOC-NOTE pins (`docs.includes('**`) are skipped.
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1. Current anchors after
 *      v2.371.0: 260 / 261 / 262 / 293 → 261 / 262 / 263 / 294.
 *   3. THE HISTORY BLOCK — the cascade block gains its v2.371.0 line.
 *   4. THE REGISTRY CENSUS INSERT — the kind suite speaks exactly ONE
 *      word (`txn-type`, in its lens-composition and boundary pins), so
 *      exactly ONE ledger gains it (the CORRECTED census scope law,
 *      v2.370.0: the scope is derived from the file's own literals, and
 *      the insert is guarded by the already-listed check — the round's
 *      hand-insertion makes this class an idempotent no-op, recorded
 *      here so the derivation is in the walk, not in folklore).
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
  "rg -l --glob '*.test.ts' '2\\.370\\.0|whatsNewUnreadCount|txn-type-deep-link-v2354' src/",
  { encoding: 'utf8', cwd: new URL('..', import.meta.url).pathname },
)
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(260)", "whatsNewUnreadCount('2.110.0')).toBe(261)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(261)", "whatsNewUnreadCount('2.109.0')).toBe(262)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(262)", "whatsNewUnreadCount('2.108.0')).toBe(263)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(293)", "whatsNewUnreadCount('2.77.0')).toBe(294)"],
];

// (3) this round's cascade line — the ENGLISH COMPOUND (the HISTORY-LINE
// LITERAL law, v2.356.0 hardened: no word literal rides the cascade block)
const HISTORY_LINE =
  "    // v2.371.0: the refund rows' homecoming entry joins the feed (+1 on every anchor → 260/261/262/293 → 261/262/263/294)";

// (4) the registry census insert — the kind suite speaks exactly ONE
// word (the CORRECTED scope law: derived from the file's own literals —
// 'txn-type' in the lens-composition and boundary pins; no other word's
// literal appears in the suite). The insert is guarded (idempotent).
const KIND_SUITE = 'src/tests/txn-kind-v2371.test.ts';
const KIND_LEDGER = 'src/tests/txn-type-deep-link-v2354.test.ts';
const CENSUS_SCOPE = [{ suite: KIND_SUITE, ledger: KIND_LEDGER, word: 'txn-type' }];
const censusCounts = { inserted: 0, alreadyListed: 0, skipped: 0 };

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
    if (isPinnable && line.includes("'2.370.0'")) {
      lines[i] = line.replaceAll("'2.370.0'", "'2.371.0'");
      pinLines++;
      fileChanged = true;
      continue;
    }
    if (isAssert && isDocNote && line.includes("'2.370.0'")) {
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

  // (4) the registry census insert — guarded, derived, idempotent
  for (const c of CENSUS_SCOPE) {
    if (rel !== c.ledger) continue;
    if (!readFileSync(new URL(`../${c.suite}`, import.meta.url), 'utf8').includes(c.word)) {
      censusCounts.skipped++;
      continue;
    }
    if (text.includes(c.suite)) { censusCounts.alreadyListed++; continue; }
    const arr = text.split('\n');
    const pathLineRe = /^(\s*)'(src\/tests\/[^']+\.test\.ts)',$/;
    const pathLines = arr
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => pathLineRe.test(l))
      .map(({ l, i }) => ({ path: l.match(pathLineRe)[2], indent: l.match(pathLineRe)[1], i }));
    if (!pathLines.length) { censusCounts.skipped++; continue; }
    const after = pathLines.find((p) => p.path > c.suite);
    const at = after ? after.i : pathLines[pathLines.length - 1].i + 1;
    arr.splice(at, 0, `${pathLines[0].indent}'${c.suite}',`);
    text = arr.join('\n');
    censusCounts.inserted++;
    fileChanged = true;
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
console.log(`files touched: ${touched.length}`);
