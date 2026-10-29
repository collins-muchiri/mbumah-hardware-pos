#!/usr/bin/env node
// verify-v2-254-0.mjs — the v2.254.0 release gate.
//
// THE BRANCH'S LENS: the branch purchase-order roster grows the band
// rail (the org ledger's own lens ported — four houses + the silent
// absence, REAL counts over the page's rows, a press narrows the view
// composed with the search and the sort; the wire's rungs stay the
// wire's; the face's own clear-all lifts the lens), the branch birth
// chips wear their aisle's band as the rail-coloured dot, and the org
// lens-empty face grows the "clear the view" affordance. Plus the
// release face: package.json / VERSION / whats-new / CHANGELOG all
// speak 2.254.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const ledger = read('src/components/org/po-ledger.tsx');
const pkg = JSON.parse(read('package.json'));
const versionFile = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the branch\u2019s lens —');
ok('the row\u2019s band reads behind a membership check', tab.includes('const poRowBand = (po: PurchaseOrderListItem): CadenceBand | null => {') && tab.includes("return b === 'fresh' || b === 'stale' || b === 'beyond' || b === 'never' ? b : null;"));
ok('the lens state rides the view (never the query key)', tab.includes("const [bandLens, setBandLens] = useState<'ALL' | CadenceBand | 'silent'>('ALL');") && tab.includes("      'purchase-orders',\n      currentStoreId,\n      statusFilter,\n      supplierFilter,\n      dateFrom,\n      dateTo,\n      page,\n    ],"));
ok('the counts are REAL numbers over the page\u2019s rows', tab.includes('const c = { fresh: 0, stale: 0, beyond: 0, never: 0, silent: 0 };') && tab.includes('if (b) c[b] += 1;') && tab.includes('else c.silent += 1;'));
ok('the lens first, then the needle, then the sort', tab.includes("bandLens === 'silent' ? poRowBand(po) == null : poRowBand(po) === bandLens") && tab.includes('}, [purchaseOrders, search, sortField, sortDir, bandLens]);'));
ok('the face\u2019s own clear-all lifts the lens', tab.includes('    setBandLens(\'ALL\');') && tab.includes('search || statusFilter !== \'ALL\' || supplierFilter !== \'ALL\' || dateFrom || dateTo || bandLens !== \'ALL\''));
ok('the rail wears the five families', tab.includes('data-testid="po-roster-band-row"') && tab.includes('data-testid={`po-roster-band-${b}`}') && tab.includes('data-testid="po-roster-band-silent"'));
ok('the toggle law rides (pressed face from the one home)', tab.includes("onClick={() => setBandLens(pressed ? 'ALL' : b)}") && tab.includes("onClick={() => setBandLens(bandLens === 'silent' ? 'ALL' : 'silent')}") && tab.includes('${pressed ? house.pressed : house.chip}'));
ok('the disclosure rides the rail', tab.includes('title="the page\'s own lens — the filters above stay the wire\'s; a press narrows the view (the fetch stays)"'));

console.log('— the birth\u2019s dot on the branch face —');
ok('the branch roster\u2019s birth chip wears the rail-coloured dot (one home)', tab.includes('data-testid="po-row-band-dot"') && tab.includes('${bandHouse(po.originStockTake.walkAisle.band as CadenceBand).rail}'));
ok('a silent read keeps the plain violet', tab.includes('{po.originStockTake.walkAisle?.band && ('));

console.log('— the lens-empty\u2019s lift (org ledger) —');
ok('the empty face grows the clear-the-view control', ledger.includes('data-testid="po-ledger-lens-clear"') && ledger.includes("onClick={() => { setBandLens('ALL'); setNeedle(''); }}"));
ok('the lift\u2019s title speaks the law', ledger.includes('title="stand the lens down and clear the finder — the whole window returns (the fetch never moved)"'));
ok('the empty face keeps its words beside the lift', ledger.includes('data-testid="po-ledger-lens-empty"') && ledger.includes('the lens narrowed the window to nothing — lift a band house or clear the finder and the orders return.'));

console.log('— the release face —');
ok('package.json version + mbumah metadata speak 2.254.0', pkg.version === '2.254.0' && pkg.mbumah?.releaseVersion === '2.254.0' && pkg.mbumah?.baseVersion === '2.254.0');
ok('VERSION speaks 2.254.0', versionFile === '2.254.0');
ok('whats-new speaks 2.254.0 (the branch\u2019s lens)', whatsNew.includes("version: '2.254.0',") && whatsNew.includes('The branch\\u2019s lens'));
ok('CHANGELOG speaks 2.254.0', changelog.includes("## [2.254.0] The branch's lens"));

console.log(`\n${pass}/${pass + failures}`);
process.exit(failures ? 1 : 0);
