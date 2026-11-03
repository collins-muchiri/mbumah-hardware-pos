#!/usr/bin/env node
/**
 * reanchor-v2370-emdash.mjs — the v2.370.0 doc-pin re-anchor (one-off,
 * idempotent by construction: a literal that already matches the docs is
 * never touched).
 *
 * THE TIMEBOMB THIS DEFUSES: the owner's direct-to-main punctuation sweep
 * (084f9b82, "docs: replace dash punctuation with standard punctuation in
 * prose", 12:43:15Z) landed BETWEEN PR #501's checks computation (green)
 * and its squash merge — v2.369.0 shipped with the doc-pin suites already
 * broken on main's docs. The sweep's rule is ` — ` → `: ` (prose em dashes
 * to standard punctuation); the pins carried the pre-sweep bytes.
 *
 * THE LAW: the docs are the truth; a pin follows the docs. For every
 * toContain literal that (a) contains an em dash and (b) is NOT a
 * substring of the current docs, try the sweep's candidate forms and
 * adopt the first that IS a substring of the current docs. A literal with
 * no working candidate is left untouched and reported — never guessed.
 *
 * Scope: the twelve suites the residue's full vitest failed (the doc-pin
 * class). The census class lives in walk-v2370.mjs.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;

// the docs haystack — the sweep's truth
const docsDir = ROOT + 'docs';
const haystack = [
  ...readdirSync(docsDir).filter((f) => f.endsWith('.md')).map((f) => readFileSync(`${docsDir}/${f}`, 'utf8')),
  readFileSync(ROOT + 'README.md', 'utf8'),
].join('\n');

const FILES = [
  'src/tests/branches-csv-week-v2178.test.ts',
  'src/tests/store-matrix-week-v2179.test.ts',
  'src/tests/store-matrix-sort-v2180.test.ts',
  'src/tests/store-matrix-prefs-v2181.test.ts',
  'src/tests/branches-table-prefs-v2182.test.ts',
  'src/tests/trend-doors-v2175.test.ts',
  'src/tests/hr-drilldown-prefs-v2183.test.ts',
  'src/tests/hr-drilldown-rank-v2190.test.ts',
  'src/tests/hr-run-door-v2191.test.ts',
  'src/tests/hr-alerts-doors-v2192.test.ts',
  'src/tests/hr-absence-door-v2193.test.ts',
  'src/tests/consent-regrant-v2128.test.ts',
];

// candidates: the sweep's observed forms, most common first
function candidates(L) {
  const out = [];
  const variants = [
    (s) => s.split(' — ').join(': ').replace(/ —$/, ':'),
    (s) => s.split(' — ').join(', ').replace(/ —$/, ':'),
    (s) => s.split(' — ').join('; ').replace(/ —$/, ':'),
    (s) => s.split('—').join(':'),
    // the muted-dash cell: the sweep re-spelled the doc's example glyph
    (s) => s.split('"—"').join('": "'),
  ];
  for (const v of variants) {
    const c = v(L);
    if (c !== L && !out.includes(c)) out.push(c);
  }
  return out;
}

// toContain literals (single-quoted, escapes honored) — raw source bytes
const LIT_RE = /toContain\('((?:[^'\\]|\\.)*)'\)/g;

let fixed = 0, already = 0, unresolved = [];
for (const rel of FILES) {
  const abs = ROOT + rel;
  let text = readFileSync(abs, 'utf8');
  const before = text;
  const seen = new Set();
  for (const m of text.matchAll(LIT_RE)) {
    const L = m[1];
    if (seen.has(L) || !L.includes('—')) continue;
    seen.add(L);
    // unescape for the containment probe (the docs carry the real bytes)
    const plain = L.replace(/\\'/g, "'").replace(/\\`/g, '`').replace(/\\\\/g, '\\');
    if (haystack.includes(plain)) { already++; continue; }
    const cands = candidates(plain);
    const winner = cands.find((c) => haystack.includes(c));
    if (!winner) { unresolved.push(`${rel}: ${plain.slice(0, 90)}`); continue; }
    // re-escape to the source's own style
    const escaped = winner.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/`/g, '\\`');
    text = text.split(`'${L}'`).join(`'${escaped}'`);
    fixed++;
    console.log(`re-anchored [${rel}]`);
    console.log(`   was: ${plain.slice(0, 110)}`);
    console.log(`   now: ${winner.slice(0, 110)}`);
  }
  if (text !== before) writeFileSync(abs, text);
}

console.log(`— em-dash re-anchor — fixed: ${fixed}, already-true: ${already}, unresolved: ${unresolved.length}`);
for (const u of unresolved) console.log(`  UNRESOLVED ${u}`);
if (unresolved.length) process.exit(1);
