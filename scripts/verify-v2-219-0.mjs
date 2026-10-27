#!/usr/bin/env node
// verify-v2-219-0.mjs — the v2.219.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE MODELS
// (StockTake + StockTakeLine with their migration), THE WIRE (four
// requireStoreAccess-scoped routes), THE ONE-OPEN-SHEET LAW, THE
// SNAPSHOT LAW (frozen inside the transaction), THE COUNT LAWS (zero is
// a count; the frozen sheet), THE CLOSE LAWS (holes named; the atomic
// claim; the delta against current stock; ADJUSTMENT movements with the
// session's actor; close-day pricing; server-truth response), THE COST
// GATE (inventory.view.cost on the value, units for everyone), and the
// release face: package.json / VERSION / whats-new / CHANGELOG all
// speak 2.219.0.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const schema = read('prisma/schema.prisma');
const listRoute = read('src/app/api/stock-takes/route.ts');
const detailRoute = read('src/app/api/stock-takes/[id]/route.ts');
const countRoute = read('src/app/api/stock-takes/[id]/count/route.ts');
const closeRoute = read('src/app/api/stock-takes/[id]/close/route.ts');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const tab = read('src/app/(shell)/tabs/inventory-tab.tsx');
const pinsTest = read('src/tests/stocktake-v2219.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the models —');
ok('StockTake model', schema.includes('model StockTake {') && schema.includes('@@map("stock_takes")'));
ok('StockTakeLine model with the unique pair', schema.includes('model StockTakeLine {') && schema.includes('@@unique([stockTakeId, productId])'));
ok('the snapshot/count/variance/cost columns', ['snapshotQty  Decimal', 'countedQty   Decimal?', 'variance     Decimal?', 'varianceCost Decimal?'].every((s) => schema.includes(s)));
ok('statuses stay free-text strings (the sqlite law)', schema.includes('COUNTING | CLOSED | CANCELLED') && !schema.includes('enum StockTakeStatus'));
ok('the migration of record exists', existsSync(join(process.cwd(), 'prisma/migrations/20261027230000_add_stock_takes/migration.sql')));
ok('back-relations on Store / Product / User', schema.includes('stockTakes       StockTake[]') && schema.includes('stockTakeLines     StockTakeLine[]') && schema.includes('@relation("StockTakeStartedBy")') && schema.includes('@relation("StockTakeClosedBy")'));

console.log('— the wire —');
ok('all four routes store-scoped', ['requireStoreAccess(listStockTakesHandler)', 'requireStoreAccess(createStockTakeHandler)', 'requireStoreAccess(getStockTakeHandler)', 'requireStoreAccess(countLineHandler)', 'requireStoreAccess(closeStockTakeHandler)'].every((s) => listRoute.includes(s) || detailRoute.includes(s) || countRoute.includes(s) || closeRoute.includes(s)));
ok('the one-open-sheet law (409 with the live id)', listRoute.includes("status: 'COUNTING'") && listRoute.includes('this branch already has a count sheet open') && listRoute.includes('status: 409'));
ok('the snapshot freezes inside the transaction', listRoute.includes('db.$transaction(async (tx) => {') && listRoute.includes('snapshotQty: toDec(p.quantityInStock),'));
ok('the default population is every active product', listRoute.includes('where: { storeId, isActive: true, ...(productIds ? { id: { in: productIds } } : {}) },'));

console.log('— the count laws —');
ok('zero is a count, negatives refused', countRoute.includes('countedQty must be a finite number ≥ 0.'));
ok('variance = counted − snapshot on the line', countRoute.includes('const variance = countedQty.minus(line.snapshotQty);'));
ok('counts land only while COUNTING', countRoute.includes("sheet.status !== 'COUNTING'"));

console.log('— the close laws —');
ok('the hole refusal names the count', closeRoute.includes('line(s) still uncounted — the close refuses a sheet with holes.'));
ok('the atomic COUNTING→CLOSED claim', closeRoute.includes("where: { id, status: 'COUNTING' },") && closeRoute.includes('if (claimed.count === 0) {'));
ok('the delta applies to current stock', closeRoute.includes('data: { quantityInStock: { increment: varianceNum } },'));
ok('ONE ADJUSTMENT movement with the session actor', closeRoute.includes("movementType: 'ADJUSTMENT',") && closeRoute.includes('performedBy: session.userId,'));
ok('exact counts re-anchor nothing', closeRoute.includes('if (varianceNum === 0) {'));
ok('close-day pricing stored per line', closeRoute.includes('const varianceCost = round2(varianceNum * Number(line.product.costPrice ?? 0));'));
ok('the response speaks the server\u2019s own numbers', closeRoute.includes('appliedCount: result.appliedCount,') && closeRoute.includes('varianceCostTotal: result.varianceCostTotal,'));

console.log('— the cost gate —');
ok('the value rides inventory.view.cost', detailRoute.includes("hasFeaturePermission(session.role, 'inventory.view.cost')") && detailRoute.includes('varianceValueEstimate: canViewCost'));
ok('the units speak to every role', detailRoute.includes('varianceUnits: Math.round(varianceUnits * 100) / 100,'));

console.log('— the panel —');
ok('mounted on the inventory tab with the gate', tab.includes('<StockTakePanel storeId={currentStoreId} canViewCost={canViewCost} />'));
ok('dark halves from birth + the muted family', panel.includes('dark:border-slate-700') && panel.includes('text-slate-500 dark:text-slate-400'));
ok('the 3:1 chip family (700 on light)', panel.includes('bg-emerald-700 px-3 py-2') && panel.includes('bg-red-50 text-red-700 ring-red-200'));
ok('the create flow discloses the snapshot law', panel.includes('Open the sheet — freeze every active product'));
ok('the close gate names the holes', panel.includes('Close refused — ${detail.summary.uncountedLines} line'));
ok('the success face reads the wire', panel.includes('data-testid="stocktake-close-success"') && panel.includes('data-testid="stocktake-close-summary"'));
ok('the honest states own voices', ['data-testid="stocktake-empty"', 'data-testid="stocktake-loading"', 'data-testid="stocktake-error"'].every((s) => panel.includes(s)));
ok('the per-line testids + the zero-law toast', panel.includes('data-testid={`stocktake-count-input-${line.sku}`}') && panel.includes('data-testid={`stocktake-record-${line.sku}`}') && panel.includes('a count is a number ≥ 0 — zero is a finding, a negative is a lie'));
ok('the close invalidates the books\u2019 wires', panel.includes("queryClient.invalidateQueries({ queryKey: ['products', storeId] });"));

console.log('— the test + anchors —');
ok('the v2219 pins file speaks the models', pinsTest.includes('the schema of record speaks the count sheet (v2.219.0)'));

console.log('— the release face —');
ok('package.json version 2.219.0', pkg.version === '2.219.0');
ok('package.json releaseVersion 2.219.0', pkg.mbumah?.releaseVersion === '2.219.0');
ok('package.json baseVersion 2.219.0', pkg.mbumah?.baseVersion === '2.219.0');
ok('VERSION 2.219.0', version === '2.219.0');
ok('whats-new entry at the head', whatsNew.includes("version: '2.219.0',") && whatsNew.includes("title: 'The stocktake',"));
ok('changelog entry leads', changelog.includes('## [2.219.0] The stocktake') && changelog.indexOf('2.219.0') < changelog.indexOf('2.218.0'));
ok('verify gate wired', pkg.scripts['verify:v2-219-0'] === 'node scripts/verify-v2-219-0.mjs');

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
