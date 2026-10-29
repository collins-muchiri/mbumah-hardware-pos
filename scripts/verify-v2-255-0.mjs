#!/usr/bin/env node
// verify-v2-255-0.mjs — the v2.255.0 release gate.
//
// THE SUPPLIERS' LENS: the supplier's orders tab (the birth's fifth face
// since v2.253) grows the band rail — the org ledger's and the branch
// roster's own lens ported to the THIRD face (four houses + the silent
// absence, REAL counts over the roster's rows, a press narrows the view;
// the wire's rungs stay the wire's), the pressed house that empties the
// view gets the honest empty face + the lift, the badge speaks the lens
// (N of M), and the cache's own honesty lands (the lastOrderDate read
// copies before it sorts — the fetched array is never reordered in
// place). Plus the release face: package.json / VERSION / whats-new /
// CHANGELOG all speak 2.255.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const tab = read('src/app/(shell)/tabs/suppliers-tab.tsx');
const pkg = JSON.parse(read('package.json'));
const versionFile = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the suppliers’ lens —');
ok('the row’s band reads behind a membership check (module-level, memos read it clean)', tab.includes('const supplierPoBand = (po: PurchaseOrderListItem): CadenceBand | null => {') && tab.includes("return b === 'fresh' || b === 'stale' || b === 'beyond' || b === 'never' ? b : null;"));
ok('the lens state rides the view (never the query key)', tab.includes("const [bandLens, setBandLens] = useState<'ALL' | CadenceBand | 'silent'>('ALL');") && tab.includes("queryKey: ['purchase-orders-supplier', storeId, supplierId],"));
ok('the counts are REAL numbers over the roster’s rows', tab.includes('const c = { fresh: 0, stale: 0, beyond: 0, never: 0, silent: 0 };') && tab.includes('if (b) c[b] += 1;') && tab.includes('else c.silent += 1;'));
ok('the lens first — the roster’s only reading control, the fetch never moves', tab.includes("bandLens === 'silent' ? supplierPoBand(po) == null : supplierPoBand(po) === bandLens") && tab.includes('[purchaseOrders, bandLens]'));
ok('the rail wears the five families', tab.includes('data-testid="supplier-po-band-row"') && tab.includes('data-testid={`supplier-po-band-${b}`}') && tab.includes('data-testid="supplier-po-band-silent"'));
ok('the toggle law rides (pressed face from the one home)', tab.includes("onClick={() => setBandLens(pressed ? 'ALL' : b)}") && tab.includes("onClick={() => setBandLens(bandLens === 'silent' ? 'ALL' : 'silent')}") && tab.includes('${pressed ? house.pressed : house.chip}'));
ok('the disclosure rides the rail (v2.256.0: the ear\u2019s words joined the title)', tab.includes('title="the roster\'s own lens — a press narrows the view (the fetch stays); Escape stands the lens down"'));
ok('the houses ride the ONE home (chipLabel joined the import)', tab.includes("import { bandHouse, chipLabel, daysVoice, type CadenceBand } from '@/lib/cadence-band';"));

console.log('— the lens’s own empty face + the lift —');
ok('the pressed house that empties the view gets its own honest face', tab.includes('data-testid="supplier-po-lens-empty"') && tab.includes('No order on this roster keeps the silence') && tab.includes('No order on this roster wears ${bandLens}'));
ok('the lift stands the lens down (one control)', tab.includes('data-testid="supplier-po-band-clear"') && tab.includes("onClick={() => setBandLens('ALL')}"));
ok('the true empty roster keeps its own face (the two empties never blur)', tab.includes('No purchase orders yet') && tab.includes('Create a PO to start tracking orders'));

console.log('— the badge speaks the lens —');
ok('a pressed house answers N of M; ALL keeps the roster’s own count', tab.includes('${lensedOrders.length} of ${purchaseOrders.length} orders') && tab.includes('${purchaseOrders.length} orders'));
ok('the rows the table draws are the LENS’s rows', tab.includes('{lensedOrders.map((po) => ('));

console.log('— the cache’s own honesty (bugfix) —');
ok('the lastOrderDate read copies before it sorts', tab.includes('[...purchaseOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())[0]?.orderDate'));
ok('the roster’s identity is the memo’s (the branch roster’s own law)', tab.includes('const purchaseOrders: PurchaseOrderListItem[] = useMemo('));

console.log('— the birth’s fifth face keeps its truth —');
ok('the birth chip and the band dot stay (v2.253 byte-kept)', tab.includes('data-testid="supplier-po-birth-chip"') && tab.includes('data-testid="supplier-po-band-dot"'));

console.log('— the release face —');
ok('package.json version + mbumah metadata speak 2.255.0', pkg.version === '2.255.0' && pkg.mbumah?.releaseVersion === '2.255.0' && pkg.mbumah?.baseVersion === '2.255.0');
ok('VERSION speaks 2.255.0', versionFile === '2.255.0');
ok('whats-new speaks 2.255.0 (the suppliers’ lens)', whatsNew.includes("version: '2.255.0',") && whatsNew.includes('The suppliers\\u2019 lens'));
ok('CHANGELOG speaks 2.255.0', changelog.includes("## [2.255.0] The suppliers' lens"));

console.log(`\n${pass}/${pass + failures}`);
process.exit(failures ? 1 : 0);
