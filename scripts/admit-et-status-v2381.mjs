#!/usr/bin/env node
/**
 * admit-et-status-v2381.mjs — the LEDGER-CITATION RIPPLE's admission pass:
 * all TWENTY-ONE neighbor ledgers admit src/tests/et-status-deep-link-v2381.test.ts.
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

const NEW_LINE = 'src/tests/et-status-deep-link-v2381.test.ts';

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
  'src/tests/cat-stock-deep-link-v2364.test.ts',
  'src/tests/dp-status-deep-link-v2365.test.ts',
  'src/tests/ad-severity-deep-link-v2366.test.ts',
  'src/tests/sec-type-deep-link-v2367.test.ts',
  'src/tests/ly-type-deep-link-v2368.test.ts',
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
  // find the ledger's expected-list block: contiguous quoted src/ paths
  const entries = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(entryRe);
    if (m) entries.push({ i, path: m[2], indent: m[1] });
  }
  if (entries.length === 0) {
    console.error(`  NO ENTRIES (skipped): ${f}`);
    continue;
  }
  // derivation guard: the entries must ALREADY be sorted
  let sorted = true;
  for (let k = 1; k < entries.length; k++) {
    if (!(entries[k - 1].path < entries[k].path)) { sorted = false; break; }
  }
  if (!sorted) {
    console.error(`  UNSORTED LEDGER (refusing): ${f}`);
    process.exit(1);
  }
  const slot = entries.find((e) => e.path > NEW_LINE);
  if (!slot) {
    console.error(`  NO SLOT AFTER (refusing): ${f}`);
    process.exit(1);
  }
  lines.splice(slot.i, 0, `${slot.indent}'${NEW_LINE}',`);
  writeFileSync(f, lines.join('\n'));
  inserted++;
  console.log(`  admitted into: ${f} (before ${slot.path})`);
}
console.log(`insertions: ${inserted} (expect ${files.length})`);
