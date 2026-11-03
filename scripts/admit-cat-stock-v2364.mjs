#!/usr/bin/env node
/**
 * admit-cat-stock-v2364.mjs — the LEDGER-CITATION RIPPLE's admission pass:
 * all SIXTEEN neighbor ledgers admit src/tests/cat-stock-deep-link-v2364.test.ts.
 *
 * THE DERIVATION-ASSERT LAW (the sorted-slot admission law, v2.362
 * generalized): every insertion lands in the ledger's SORTED position
 * (lexicographic over the quoted path — the ledgers are full walkSrc
 * censuses, so the sorted context differs per ledger). The guard: every
 * ledger's entry list must ALREADY be sorted (adjacent pairs), and the
 * insertion point is the first entry that sorts AFTER the new line.
 * Indentation is inherited. A re-run answers ZERO insertions (idempotence
 * is the proof the ripple landed exactly once).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const NEW_LINE = 'src/tests/cat-stock-deep-link-v2364.test.ts';

const files = [
  'src/tests/proxy-gate-layering-v2328.test.ts',
  'src/tests/inv-stock-deep-link-v2329.test.ts',
  'src/tests/cust-debt-deep-link-v2330.test.ts',
  'src/tests/sup-status-deep-link-v2331.test.ts',
  'src/tests/sup-po-deep-link-v2332.test.ts',
  'src/tests/txn-pay-deep-link-v2333.test.ts',
  'src/tests/txn-type-deep-link-v2354.test.ts',
  'src/tests/rent-status-deep-link-v2355.test.ts',
  'src/tests/inv-status-deep-link-v2356.test.ts',
  'src/tests/transfer-status-deep-link-v2357.test.ts',
  'src/tests/gc-status-deep-link-v2358.test.ts',
  'src/tests/dn-status-deep-link-v2359.test.ts',
  'src/tests/vc-status-deep-link-v2360.test.ts',
  'src/tests/cr-type-deep-link-v2361.test.ts',
  'src/tests/pr-status-deep-link-v2362.test.ts',
  'src/tests/cv-type-deep-link-v2363.test.ts',
];

const entryRe = /^(\s*)'(src\/[^']+)',?$/;

let inserted = 0;
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  if (text.includes(`'${NEW_LINE}',`)) {
    console.log(`  skip (already admitted): ${f}`);
    continue;
  }
  const lines = text.split('\n');
  // collect ledger-entry lines (quoted src/ paths) and prove the run is sorted
  const entries = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(entryRe);
    if (m) entries.push({ i, path: m[2], indent: m[1] });
  }
  for (let k = 1; k < entries.length; k++) {
    if (!(entries[k - 1].path < entries[k].path)) {
      console.error(`x UNSORTED LEDGER in ${f}: [${entries[k - 1].path}] !< [${entries[k].path}]`);
      process.exit(1);
    }
  }
  // insertion point: first entry sorting AFTER the new line
  const at = entries.find((e) => e.path > NEW_LINE);
  if (!at) {
    console.error(`x NO SORTED SLOT in ${f} (every entry sorts before ${NEW_LINE})`);
    process.exit(1);
  }
  lines.splice(at.i, 0, `${at.indent}'${NEW_LINE}',`);
  writeFileSync(f, lines.join('\n'));
  inserted++;
  console.log(`  admitted: ${f} (before '${at.path}' at line ${at.i + 1})`);
}
console.log(`\ninsertions: ${inserted} (re-run answers 0)`);
