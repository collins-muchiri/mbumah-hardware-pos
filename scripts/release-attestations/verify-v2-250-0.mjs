#!/usr/bin/env node
// verify-v2-250-0.mjs — the v2.250.0 release gate.
//
// THE BRANCH'S GATE: the branch PO wires learn the cost gate (the org
// wires' own law — the roster's and the document's shillings speak
// only past `inventory.view.cost`), every face wears the honest
// absence (the KPI mask, the stood-down money sort, the em-dash
// cells, the dashed financial card, the empty pen), and the aisle
// speaks twice (the birth strip's cadence chip + the CSV's aisle
// column). Plus the release face: package.json / VERSION / whats-new /
// CHANGELOG all speak 2.250.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const listWire = read('src/app/api/purchase-orders/route.ts');
const detailWire = read('src/app/api/purchase-orders/[id]/route.ts');
const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const suppliersTab = read('src/app/(shell)/tabs/suppliers-tab.tsx');
const apiTypes = read('src/lib/api.ts');
const orgDetailWire = read('src/app/api/org/purchase-orders/[id]/route.ts');
const poDrill = read('src/components/org/po-drill.tsx');
const ledger = read('src/components/org/po-ledger.tsx');
const pkg = JSON.parse(read('package.json'));
const versionFile = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the branch\u2019s gate: the wires —');
ok('list wire reads the org gate\u2019s own permission', listWire.includes("const canViewCost = hasFeaturePermission(session.role, 'inventory.view.cost');"));
ok('list wire nulls the roster\u2019s shillings past the gate', listWire.includes('subTotal: canViewCost ? Number(poData.subTotal) : null,') && listWire.includes('totalAmount: canViewCost ? Number(poData.totalAmount) : null,'));
ok('list envelope carries costGated (the org wire\u2019s shape)', listWire.includes('costGated: !canViewCost,'));
ok('detail wire gates the header\u2019s money + the lines\u2019 money + the book cost', detailWire.includes('subTotal: canViewCost ? Number(purchaseOrder.subTotal) : null,') && detailWire.includes('unitCost: canViewCost ? Number(it.unitCost) : null,') && detailWire.includes('costPrice: canViewCost ? Number(it.product.costPrice) : null'));
ok('detail envelope carries costGated', detailWire.includes('costGated: !canViewCost,'));

console.log('— the branch\u2019s gate: the faces —');
ok('the tab reads the wire\u2019s truth + one shared mask voice', tab.includes('const costGated = poData?.costGated === true;') && tab.includes("const COST_MASK = 'the shillings stay with the cost-holders';"));
ok('the KPI wears the mask; the sum guards the absence', tab.includes("value={costGated ? '—' : formatKES(stats.totalValue)}") && tab.includes('.reduce((s, po) => s + (po.totalAmount ?? 0), 0);'));
ok('the money sort stands down (header affordance + backstop guard)', tab.includes("onClick={costGated ? undefined : () => toggleSort('totalAmount')}") && tab.includes("if (field === 'totalAmount' && costGated) return;"));
ok('the roster cell + the detail\u2019s money faces wear the em-dash', tab.includes('{po.totalAmount != null ? (') && tab.includes('{item.unitCost != null ? ('));
ok('the financial block renders the dashed absence card', tab.includes('the books hold this order&apos;s shillings — a cost-holder reads the total here.'));
ok('the create dialog\u2019s pen starts empty; the stock line speaks units alone', tab.includes("unitCost: product.costPrice != null ? String(product.costPrice) : '',") && tab.includes('{product.costPrice != null && <> &middot; {formatKES(product.costPrice)}</>}'));
ok('the suppliers card\u2019s sum guards the absence', suppliersTab.includes('.reduce((s, po) => s + (po.totalAmount ?? 0), 0);'));
ok('the types grew the gate', apiTypes.includes('costGated?: boolean;') && apiTypes.includes('totalAmount: number | null;') && apiTypes.includes('unitCost: number | null;'));

console.log('— the aisle speaks twice —');
ok('the org detail wire reads the aisle\u2019s band (the census\u2019s read, the stored law)', orgDetailWire.includes('const band = await readCategoryBand(rawDb, walkCategoryId, law, new Date());') && orgDetailWire.includes('const law = await readCadenceLaw(rawDb);'));
ok('the band rides additive + optional', orgDetailWire.includes('band: aisleBand?.band ?? null,') && orgDetailWire.includes('daysSince: aisleBand?.daysSince ?? null,'));
ok('the drill\u2019s strip wears the chip (bandHouse\u2019s one home)', poDrill.includes("import { bandHouse, chipLabel, daysVoice } from '@/lib/cadence-band';") && poDrill.includes('data-testid="po-drill-aisle-band"'));
ok('the ledger\u2019s CSV grows the aisle column', ledger.includes("const header = 'po_number,status,supplier,branch,lines,ordered_day,total_kes,birth,aisle';") && ledger.includes("r.originStockTake?.walkAisle?.name ?? '',"));

console.log('— the release face —');
ok('package.json version + mbumah metadata speak 2.250.0', pkg.version === '2.250.0' && pkg.mbumah?.releaseVersion === '2.250.0' && pkg.mbumah?.baseVersion === '2.250.0');
ok('VERSION speaks 2.250.0', versionFile === '2.250.0');
ok('whats-new speaks 2.250.0 (the branch\u2019s gate)', whatsNew.includes("version: '2.250.0',") && whatsNew.includes('The branch\\u2019s gate'));
ok('CHANGELOG speaks 2.250.0', changelog.includes("## [2.250.0] The branch's gate"));

console.log(`\n${pass}/${pass + failures}`);
process.exit(failures ? 1 : 0);
