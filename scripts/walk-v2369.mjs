#!/usr/bin/env node
/**
 * walk-v2369.mjs — the v2.369.0 re-anchor codemod (one-off, BY WRITE —
 * the Task 234/43-71 law: a fresh Write, never a sed of last round's
 * script).
 *
 * The treadmill law, assert-line-only (same law as walk-v2323/…/v2368):
 *   1. VERSION RE-ANCHOR — on every pinnable assert line, the STANDALONE
 *      quoted release pin `'2.368.0'` becomes `'2.369.0'`. The quote-quote
 *      form is the law: an EMBEDDED reference inside a longer string is
 *      release HISTORY, not a release pin — it never re-anchors.
 *      Comment-only lines keep their history. The v2.316 GUARD (carried):
 *      historical DOC-NOTE pins (`docs.includes('**`) are skipped.
 *   2. THE UNREAD-COUNTER CASCADE — a new WHATS_NEW entry shifts every
 *      `whatsNewUnreadCount` anchor by +1. Current anchors after
 *      v2.368.0: 258 / 259 / 260 / 291 → 259 / 260 / 261 / 292.
 *   3. THE HISTORY BLOCK — the cascade block gains its v2.369.0 line.
 *   4. THE ISLAND RE-ANCHORS — the desk's five migrated seeds changed
 *      the bytes six elder suites pin: the tab-url import line (six
 *      suites), the desk-ask regex (receipt-trail v2311), the counts
 *      door (expiry-day-window v2317), the scrub list (expiry-window-
 *      dismiss v2318), the page seed (ledger-pager v2320), the gait
 *      seed (ledger-page-size v2321), the stage seed (ly-type v2368),
 *      and the v2368 collision ledger gains the island suite (the
 *      LEDGER-CITATION RIPPLE — a ledger is an honest speaker of every
 *      word it lists).
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
  "rg -l --glob '*.test.ts' '2\\.368\\.0|whatsNewUnreadCount|buildSearchWithoutParams|deskAsk|EXPIRY_LEDGER_HREF|parseInitialPage|parseInitialLimit\\(|parseInitialStage\\(|ly-type-deep-link' src/",
  { encoding: 'utf8', cwd: new URL('..', import.meta.url).pathname },
)
  .split('\n')
  .filter(Boolean);

const ANCHORS = [
  ["whatsNewUnreadCount('2.110.0')).toBe(258)", "whatsNewUnreadCount('2.110.0')).toBe(259)"],
  ["whatsNewUnreadCount('2.109.0')).toBe(259)", "whatsNewUnreadCount('2.109.0')).toBe(260)"],
  ["whatsNewUnreadCount('2.108.0')).toBe(260)", "whatsNewUnreadCount('2.108.0')).toBe(261)"],
  ["whatsNewUnreadCount('2.77.0')).toBe(291)", "whatsNewUnreadCount('2.77.0')).toBe(292)"],
];

// (3) this round's cascade line — the ENGLISH COMPOUND (the word
// literals `ly-view`/`ly-page` would make the cascade block SPEAK the
// words — the HISTORY-LINE LITERAL law, v2.356.0 hardened; the compound
// is the island's own story)
const HISTORY_LINE =
  "    // v2.369.0: the island's homecoming entry joins the feed (+1 on every anchor → 258/259/260/291 → 259/260/261/292)";

// (4) THE ISLAND RE-ANCHORS — whole-file byte replacements, each counted
const REPLACEMENTS = [
  {
    name: 'the tab-url import line (six suites pin the desk\u2019s import)',
    from: "import { buildSearchWithoutParams, parseInitialDateRange, parseInitialLimit, parseInitialNamedMemberWithAlias, parseInitialPage, parseInitialStage } from '@/lib/tab-url';",
    to: "import { buildSearchWithoutParams, parseInitialDateRangeWithAlias, parseInitialLimitWithAlias, parseInitialNamedMemberWithAlias, parseInitialPageWithAlias, parseInitialStageWithAlias } from '@/lib/tab-url';",
  },
  {
    name: 'the desk-ask regex (receipt-trail v2311)',
    from: "/[?&](tab|view)=/.test(search)",
    to: "/[?&](tab|view|ly-view)=/.test(search)",
  },
  {
    name: 'the counts door (expiry-day-window v2317)',
    from: "`${EXPIRY_LEDGER_HREF}&from=${sweepDay}&to=${sweepDay}`",
    to: "`${EXPIRY_LEDGER_HREF}&ly-from=${sweepDay}&ly-to=${sweepDay}`",
  },
  {
    name: 'the scrub list (expiry-window-dismiss v2318)',
    from: "buildSearchWithoutParams(window.location.search, ['from', 'to'])",
    to: "buildSearchWithoutParams(window.location.search, ['ly-from', 'ly-to', 'from', 'to'])",
  },
  {
    name: 'the page seed (ledger-pager v2320)',
    from: 'return parseInitialPage(window.location.search, 1);',
    to: "return parseInitialPageWithAlias(window.location.search, 'ly-page', 'page', 1);",
  },
  {
    name: 'the gait seed (ledger-page-size v2321 — the whole assert line, the inner quotes need the outer double)',
    from: "expect(tab.includes('return parseInitialLimit(window.location.search, 100);')).toBe(true);",
    to: "expect(tab.includes(\"return parseInitialLimitWithAlias(window.location.search, 'ly-limit', 'limit', 100);\")).toBe(true);",
  },
  {
    name: 'the import adjacency fragment (ledger-census-truth v2322)',
    from: 'parseInitialLimit, parseInitialNamedMemberWithAlias, parseInitialPage',
    to: 'parseInitialLimitWithAlias, parseInitialNamedMemberWithAlias, parseInitialPageWithAlias',
  },
  {
    name: 'the stage seed (ly-type v2368)',
    from: "parseInitialStage(window.location.search, LOYALTY_SUB_TABS, 'transactions', landedLyType !== 'all', 'tiers')",
    to: "parseInitialStageWithAlias(window.location.search, 'ly-view', 'view', LOYALTY_SUB_TABS, 'transactions', landedLyType !== 'all', 'tiers')",
  },
  {
    name: 'the collision-law pin (po-deep-link v2324 — the desk keeps its OWN page word, now the desk-prefixed pair)',
    from: "expect(loyalty.includes('parseInitialPage(window.location.search, 1)')).toBe(true);",
    to: "expect(loyalty.includes(\"parseInitialPageWithAlias(window.location.search, 'ly-page', 'page', 1)\")).toBe(true);",
  },
  {
    name: 'the v2368 collision ledger gains the island suite (sorted slot)',
    from: "      'src/tests/inv-stock-deep-link-v2329.test.ts',\n      'src/tests/ly-type-deep-link-v2368.test.ts',",
    to: "      'src/tests/inv-stock-deep-link-v2329.test.ts',\n      'src/tests/ly-island-v2369.test.ts',\n      'src/tests/ly-type-deep-link-v2368.test.ts',",
  },
  {
    name: 'the transfer-status collision ledger gains the island suite (the comment-aware sorted slot)',
    from: "      // (one release, two suites — the ledger is the honest speaker here)\n      'src/tests/ly-type-deep-link-v2368.test.ts',",
    to: "      // (one release, two suites — the ledger is the honest speaker here)\n      'src/tests/ly-island-v2369.test.ts',\n      'src/tests/ly-type-deep-link-v2368.test.ts',",
  },
];

let pinLines = 0;
let counterLines = 0;
let docNoteSkips = 0;
let historyFixes = 0;
const replCounts = Object.fromEntries(REPLACEMENTS.map((r) => [r.name, 0]));
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
    if (isPinnable && line.includes("'2.368.0'")) {
      lines[i] = line.replaceAll("'2.368.0'", "'2.369.0'");
      pinLines++;
      fileChanged = true;
      continue;
    }
    if (isAssert && isDocNote && line.includes("'2.368.0'")) {
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

  // (4) the island re-anchors — exact bytes, counted. THE ISLAND SUITE
  // IS EXEMPT: its own bytes are already the new truth (written by
  // hand); a codemod must never rewrite the suite that pins it (the
  // first run rewrote the suite's NEGATIVE pins into tautologies — the
  // exemption is the law). THE CENSUS INSERT is scoped to the suites
  // whose word the island suite actually SPEAKS (the LEDGER-CITATION
  // RIPPLE: a ledger is an honest speaker of every word it lists — the
  // island suite speaks `ly-type` (the constitution's cross-pins) and
  // `transfer-status` (the constitution file's own path); the adjacent
  // pair also appears in OTHER words' censuses (the ride-along trail),
  // where the island suite does NOT belong.
  const CENSUS_INSERT_FILES = new Set([
    'src/tests/ly-type-deep-link-v2368.test.ts',
    'src/tests/transfer-status-deep-link-v2357.test.ts',
  ]);
  for (const r of REPLACEMENTS) {
    if (rel === 'src/tests/ly-island-v2369.test.ts') break;
    if (r.name.includes('collision ledger gains') && !CENSUS_INSERT_FILES.has(rel)) continue;
    if (text.includes(r.from)) {
      const n = text.split(r.from).length - 1;
      text = text.split(r.from).join(r.to);
      replCounts[r.name] += n;
      fileChanged = true;
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
for (const [name, count] of Object.entries(replCounts)) {
  console.log(`island re-anchor (${count}): ${name}`);
}
console.log(`files touched: ${touched.length}`);
for (const rel of touched) console.log(`  - ${rel}`);
