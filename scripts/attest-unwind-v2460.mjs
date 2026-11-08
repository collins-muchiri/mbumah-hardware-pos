#!/usr/bin/env node
// attest-unwind-v2460.mjs — THE ATTESTATIONS COME HOME (v2.460.0)
//
// The verify-v2-* pin unwind: 347 point-in-time attestation scripts moved to
// scripts/release-attestations/ (the museum shelf, done by `git mv` before
// this codemod runs) and the 310 `verify:v2-*` package.json keys removed
// (done by node surgery before this codemod runs). What remains HERE:
//   1. remove the 86+ key-pin lines from the living suites
//      (`expect(pkg.scripts['verify:v2-X']).toBe('node scripts/verify-v2-X.mjs')`
//       and the `.toBeTruthy()` shape);
//   2. re-key every `scripts/verify-v2-...` PATH in src/tests and the docs to
//      the shelf address `scripts/release-attestations/verify-v2-...`;
//   3. re-key it() names that would lie once the pins are gone
//      ("... and the verify gate is wired" and siblings);
//   4. delete it() blocks the removal leaves EMPTY (each reported; the
//      aggregate truth re-homes in attestation-museum-v2460.test.ts).
// The CHANGELOG's historical mentions are NEVER touched (append-only history).
//
// Idempotent: a second run reports zero edits everywhere.
// GUARD-COLLISION law: this codemod's own edits are guarded by the natural
// exhaustion of its patterns (no pins left = no-op), not by a phrase.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const TESTS = join(ROOT, 'src', 'tests');
const SHELF = 'scripts/release-attestations/';
const SHELF_STEM = 'scripts/release-attestations/verify-v2-'; // the re-key keeps the file's own stem

const report = { keyPinsRemoved: 0, pathsRekeyed: 0, namesRekeyed: 0, emptiesDeleted: 0, files: [] };

function touch(file) {
  if (!report.files.includes(file)) report.files.push(file);
}

// ---- the it()/test() name re-keys (exact clauses, applied to name strings)
const NAME_CLAUSES = [
  ' and the verify gate is wired',
  ' and the verify script is wired',
  ' and registers the verify script',
  ' and the verify script is registered',
];

// ---- empty-it scanner: a block with zero expect( lines after the surgery
function findEmptyIts(src) {
  const out = [];
  const re = /\n(\s*)(?:it|test)\((['`])([^'`]*)\2, \(\) => \{([^}]*)\n\1\}\);/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    if (!m[4].includes('expect(')) out.push({ full: m[0], name: m[3] });
  }
  return out;
}

const files = readdirSync(TESTS).filter((f) => f.endsWith('.test.ts'));
for (const f of files) {
  const path = join(TESTS, f);
  let src = readFileSync(path, 'utf8');
  const before = src;

  // 1. key-pin lines (both shapes)
  src = src.replace(
    /^\s*expect\((?:pkg|PKG)\.scripts\['verify:v2-[^']+'\]\)\.(?:toBe\('node scripts\/verify-v2-[^']+\.mjs'\)|toBeTruthy\(\));\n/gm,
    (line) => {
      report.keyPinsRemoved += 1;
      touch(f);
      return '';
    },
  );

  // 2a. REPAIR (the first pass's join dropped the `verify-v2-` stem — the
  //     shelf paths must name the file's OWN stem): heal before re-keying.
  //     Idempotent: matches only digit-following shelf paths (real stems
  //     are letter-following: .../verify-v2-198-0.mjs).
  src = src.replace(/scripts\/release-attestations\/(?=\d)/g, 'scripts/release-attestations/verify-v2-');

  // 2b. path re-key to the shelf (stem preserved)
  if (src.includes('scripts/verify-v2-')) {
    const n = src.split('scripts/verify-v2-').length - 1;
    src = src.split('scripts/verify-v2-').join(SHELF_STEM);
    report.pathsRekeyed += n;
    touch(f);
  }

  // 3. name re-keys
  for (const clause of NAME_CLAUSES) {
    if (src.includes(clause)) {
      const n = src.split(clause).length - 1;
      src = src.split(clause).join('');
      report.namesRekeyed += n;
      touch(f);
    }
  }

  // 4. empty its — delete whole blocks
  for (const empty of findEmptyIts(src)) {
    src = src.replace(empty.full, '');
    report.emptiesDeleted += 1;
    touch(f);
    console.log(`  empty it() deleted: ${f} — "${empty.name}"`);
  }

  if (src !== before) writeFileSync(path, src);
}

// ---- the docs line (the one living doc that tells a reader to `npm run` a pin)
const DOC = join(ROOT, 'docs', 'payroll-run-lifecycle.md');
let doc = readFileSync(DOC, 'utf8');
const docBefore = doc;
doc = doc.replace(
  /`npm run (verify:v2-[0-9-]+)`/g,
  (_all, key) => `\`node ${SHELF}${key.replace('verify:', 'verify-')}.mjs\` (run at its own release tag)`,
);
if (doc !== docBefore) {
  writeFileSync(DOC, doc);
  report.pathsRekeyed += 1;
  touch('docs/payroll-run-lifecycle.md');
}

console.log('KEY-PINS REMOVED:', report.keyPinsRemoved);
console.log('PATHS REKEYED  :', report.pathsRekeyed);
console.log('NAMES REKEYED  :', report.namesRekeyed);
console.log('EMPTIES DELETED:', report.emptiesDeleted);
console.log('FILES TOUCHED  :', report.files.length);
report.files.sort().forEach((f) => console.log('  -', f));
