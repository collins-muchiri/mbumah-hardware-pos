#!/usr/bin/env node
/**
 * admit-rep-type-v2384.mjs — the LEDGER-CITATION RIPPLE's admission pass:
 * the neighbor ledgers whose census the round's suite cites admit
 * src/tests/rep-type-deep-link-v2384.test.ts.
 *
 * THIS round's suite cites exactly FOUR neighbor words in its cross-word
 * coexistence proof (tax-period ×2, txn-pay, po-status, inv-stock) — so
 * FOUR ledgers hear the ripple (the v2.383 round's suite rode along with
 * twenty-three; this one rides narrower, and the ledgers are the honest
 * speakers). tax-period's ledger was admitted by hand in-round (the
 * derivation guard verifies it); the script re-checks it idempotently.
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

const NEW_LINE = 'src/tests/rep-type-deep-link-v2384.test.ts';

const files = [
  'src/tests/tax-period-deep-link-v2383.test.ts',
  'src/tests/inv-stock-deep-link-v2329.test.ts',
  'src/tests/proxy-gate-layering-v2328.test.ts',
  'src/tests/txn-pay-deep-link-v2333.test.ts',
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
console.log(`insertions: ${inserted}`);
