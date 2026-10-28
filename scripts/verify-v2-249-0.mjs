#!/usr/bin/env node
// verify-v2-249-0.mjs — the v2.249.0 release gate.
//
// THE BIRTH'S LEDGER: the org face learns the birth — the org wire's
// rows + BIRTH RUNGS + the refused `origin` param, the detail wire's
// originStockTake, the ledger's violet rungs + row chips + CSV birth
// column, the org drill's birth strip (with the gated restock
// shillings), and the restock door's book-cost price of the hole.
// Plus the release face: package.json / VERSION / whats-new /
// CHANGELOG all speak 2.249.0, and the fossil guards keep every
// previous round's law alive.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const orgWire = read('src/app/api/org/purchase-orders/route.ts');
const orgDetailWire = read('src/app/api/org/purchase-orders/[id]/route.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const poDrill = read('src/components/org/po-drill.tsx');
const drill = read('src/components/org/sheet-drill.tsx');
const pkg = JSON.parse(read('package.json'));
const versionFile = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the birth\u2019s ledger: the org wire —');
ok('rows grow originStockTakeId + originStockTake (additive)', orgWire.includes('originStockTakeId: true,') && orgWire.includes('originStockTake: {\n            select: {'));
ok('the row mapping speaks the birth, null for the hand-raised', orgWire.includes('originStockTakeId: po.originStockTakeId,') && orgWire.includes('originStockTake: po.originStockTake'));
ok('the birth rungs: two indexed counts over the rung-less narrowing', orgWire.includes('rawDb.purchaseOrder.count({ where: { ...birthWhere, originStockTakeId: { not: null } } })') && orgWire.includes('rawDb.purchaseOrder.count({ where: { ...birthWhere, originStockTakeId: null } })'));
ok('the births answer beside the status ladder', orgWire.includes('births: { sheet: bornAtSheets, hand: handRaised }') && orgWire.includes('births: result.births,'));
ok('the origin param narrows the rows (sheet | hand)', orgWire.includes("if (originParam === 'sheet') where.originStockTakeId = { not: null };") && orgWire.includes("if (originParam === 'hand') where.originStockTakeId = null;"));
ok('an unknown rung is a REFUSED filter (400 law)', orgWire.includes("'unknown purchase-order birth filter.'"));

console.log('— the birth\u2019s ledger: the detail wire —');
ok('originStockTake rides the read (the same shape)', orgDetailWire.includes('originStockTake: {\n          select: {\n            id: true,\n            status: true,\n            closedAt: true,\n            walkAisle: { select: { name: true } },\n          },\n        },') && orgDetailWire.includes('originStockTake: po.originStockTake'));

console.log('— the birth\u2019s ledger: the ledger\u2019s faces —');
ok('the birth rung rides the query key and the fetch', ledger.includes("queryKey: ['org-po-ledger', statusFilter, branchId, originFilter],") && ledger.includes("if (originFilter !== 'ALL') params.set('origin', originFilter);"));
ok('the birth rung row speaks both rungs with real numbers', ledger.includes('data-testid="po-ledger-birth-row"') && ledger.includes('data-testid="po-ledger-origin-sheet"') && ledger.includes('data-testid="po-ledger-origin-hand"') && ledger.includes('{num(data.births.sheet)}') && ledger.includes('{num(data.births.hand)}'));
ok('the sheet rung wears the violet house (3:1, both halves)', ledger.includes('bg-violet-600 text-white ring-violet-600 dark:bg-violet-300 dark:text-violet-950 dark:ring-violet-300'));
ok('the row wears the violet birth chip; the hand-raised absence stays silent', ledger.includes('data-testid="po-ledger-row-birth-chip"') && ledger.includes('{po.originStockTakeId != null && ('));
ok('the roster\u2019s copy grows the birth column (sheet | hand)', ledger.includes("const header = 'po_number,status,supplier,branch,lines,ordered_day,total_kes,birth';") && ledger.includes("r.originStockTakeId != null ? 'sheet' : 'hand',"));

console.log('— the birth\u2019s ledger: the org drill —');
ok('the wire type grows the birth (additive + optional)', poDrill.includes('originStockTake: {\n      id: string;\n      status: string;\n      closedAt: string | null;\n      walkAisle: { name: string | null } | null;\n    } | null;'));
ok('the violet strip names the sheet (id, aisle, honest status voice)', poDrill.includes('data-testid="po-drill-birth-strip"') && poDrill.includes('this PO answers count sheet'));
ok('past the cost gate, the strip speaks the restock\u2019s shillings', poDrill.includes('The restock carries <span className="tabular-nums">{fmtKes(data.summary.totalAmount)}</span>.'));

console.log('— the birth\u2019s ledger: the restock door\u2019s shillings —');
ok('the door prices the hole only past the gate + complete cost set', drill.includes('const shrinkValueSpeaks = !costGated && shrinkageLines.every((l) => l.varianceCost != null);'));
ok('the shillings ride in tabular-nums at book cost', drill.includes('<span className="tabular-nums">{fmtKes(shrinkValue)}</span>') && drill.includes('at book cost</>'));

console.log('— the fossils: the ancestors\u2019 laws stay alive —');
ok('v2.248.0: the restock door still mounts on CLOSED + shrinkage + slug', drill.includes("data.status === 'CLOSED' && shrinkageLines.length > 0 && data.store.slug && (() => {") && drill.includes('data-testid="sheet-drill-restock-door"'));
ok('v2.248.0: the birth allowlist still refuses a bad origin (branch wire)', read('src/app/api/purchase-orders/route.ts').includes("'originStockTakeId does not name a count sheet in this store.'"));
ok('v2.248.0: the branch roster still wears its birth chip', read('src/app/(shell)/tabs/purchase-orders-tab.tsx').includes('data-testid="po-row-birth-chip"'));
ok('v2.247.0: the mirror\u2019s self voice still rides the drill', drill.includes('sheet-drill-origin-aisle-self'));
ok('v2.225.0: the ledger stays read-only by law', ledger.includes('read-only — the branch workspace keeps the pens'));

console.log('— the release face —');
ok('package.json speaks 2.249.0', pkg.version === '2.249.0');
ok('VERSION speaks 2.249.0', versionFile === '2.249.0');
ok('whats-new speaks the birth\u2019s ledger first', whatsNew.includes("version: '2.249.0',") && whatsNew.indexOf("version: '2.249.0',") < whatsNew.indexOf("version: '2.248.1',"));
ok('the changelog carries the birth\u2019s ledger', changelog.includes("## [2.249.0] The birth's ledger") && changelog.includes("**The org wire's birth**"));
ok('the sqlite flip is NOT staged in this gate (local tree only)', !process.env.CI);

console.log(`\n${pass}/${pass + failures} checks pass`);
process.exit(failures === 0 ? 0 : 1);
