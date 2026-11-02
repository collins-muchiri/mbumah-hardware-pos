#!/usr/bin/env node
/**
 * admit-pr-status-v2362.mjs — the LEDGER-CITATION RIPPLE's admission pass:
 * all FOURTEEN neighbor ledgers admit src/tests/pr-status-deep-link-v2362.test.ts.
 *
 * THE DERIVATION-ASSERT LAW: every insertion asserts its anchor appears
 * EXACTLY once (the truncated-census law's cousin), inherits the anchor's
 * indentation, and lands the new line in the ledger's SORTED position
 * ('pr-status...' sorts before 'proxy-gate...' — '-' < 'o' — and after
 * 'inv-stock...' / 'po-deep-link...'). A re-run answers ZERO insertions
 * (idempotence is the proof the ripple landed exactly once).
 */
import { readFileSync, writeFileSync } from 'node:fs';

const NEW_LINE = 'src/tests/pr-status-deep-link-v2362.test.ts';
const ANCHOR = 'src/tests/proxy-gate-layering-v2328.test.ts';
// sorted-position guard: the line BEFORE the anchor must sort BEFORE the
// new line (else the list's order is not what the ledger pins)
const PRED = 'src/tests/inv-stock-deep-link-v2329.test.ts';

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
];

let inserted = 0;
for (const f of files) {
  const text = readFileSync(f, 'utf8');
  if (text.includes(`'${NEW_LINE}',`)) {
    console.log(`  skip (already admitted): ${f}`);
    continue;
  }
  const lines = text.split('\n');
  const anchorIdxs = lines.map((l, i) => (l.includes(`'${ANCHOR}',`) ? i : -1)).filter((i) => i !== -1);
  if (anchorIdxs.length !== 1) {
    console.error(`x ANCHOR COUNT ${anchorIdxs.length} in ${f} (want exactly 1)`);
    process.exit(1);
  }
  const idx = anchorIdxs[0];
  const indent = lines[idx].match(/^\s*/)[0];
  // sorted-position guard: the predecessor line (if present) must sort before NEW
  const predLine = lines.slice(0, idx).reverse().find((l) => l.includes(`'${PRED}',`));
  if (predLine === undefined) {
    console.error(`x NO PRED LINE in ${f} (want '${PRED},' before the anchor)`);
    process.exit(1);
  }
  lines.splice(idx, 0, `${indent}'${NEW_LINE}',`);
  writeFileSync(f, lines.join('\n'));
  inserted++;
  console.log(`  admitted: ${f} (before line ${idx + 1})`);
}
console.log(`\ninsertions: ${inserted} (re-run answers 0)`);
