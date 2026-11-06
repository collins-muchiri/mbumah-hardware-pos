#!/usr/bin/env node
// bump-changelog-v2416.mjs — the one-shot CHANGELOG prepend (idempotent).
import { readFileSync, writeFileSync } from 'node:fs';

let c = readFileSync('CHANGELOG.md', 'utf8');
if (c.includes('## [2.416.0]')) {
  console.log('already bumped (idempotent no-op)');
  process.exit(0);
}
const entry = [
  "## [2.416.0] The order's handover",
  '',
  "v2.414.0 taught the banner to speak the order, v2.415.0 taught it to leave a file. This round the order walks itself to the purchase-order desk — the banner's third face folds the rows into a one-way pocket, and the PO create form opens with the carried lines pre-picked.",
  '',
  '### Added',
  '- **THE ORDER\'S HANDOVER** (`src/lib/order-handoff.ts` + `inventory-tab.tsx` + `purchase-orders-tab.tsx`): the banner\'s pair grows the **Send** button (testid `inv-order-send`) — `buildOrderHandoff` folds the same rows into a sessionStorage pocket (the reorder gap is the ask; the nothing-to-order law defends the fold too) and the shell walks to the purchase-order desk, whose create dialog auto-opens with the carried rows pre-picked via `mapOrderHandoffToPoItems` under an amber carriage strip (testid `po-order-handoff-provenance`) that speaks lines, units and the honest dropped count.',
  '',
  '### Changed',
  '- **THE ONE-WAY POCKET** (the styling round): the envelope is consumed once at the desk\'s mount — a manual "New PO" never inherits a birth by accident (the ?restockFrom= door\'s own law), a cancelled dialog never resurrects a stale order, the co-mount law now speaks THREE faces gated on the same honest absence, and the carriage strip keeps its reading after the envelope is spent (a local digest, the amber door family).',
  '',
  '',
].join('\n');
writeFileSync('CHANGELOG.md', entry + c);
console.log('CHANGELOG entry prepended');
