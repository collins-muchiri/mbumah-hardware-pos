#!/usr/bin/env node
// verify-v2-220-0.mjs — the v2.220.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE ORG
// BLOCK (stockTakes in kpi-summary — live sheets, the 12-sheet roster,
// the 30-day window read across EVERY closed sheet via aggregate), THE
// COST LAW ON THE ORG WIRE (units for every org role; shillings only
// past inventory.view.cost), THE CANCEL LAWS (COUNTING only; the atomic
// claim; no stock moves; the reason kept), THE FIFTH CONSUMER (the
// variance map's zero-fetch strip and its silence law), THE PICKER
// (server-side category resolution; the real row count on the confirm),
// the map's MOUNT on the console, and the release face: package.json /
// VERSION / whats-new / CHANGELOG all speak 2.220.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const kpiRoute = read('src/app/api/org/kpi-summary/route.ts');
const cancelRoute = read('src/app/api/stock-takes/[id]/cancel/route.ts');
const listRoute = read('src/app/api/stock-takes/route.ts');
const map = read('src/components/org/variance-map.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const page = read('src/app/(shell)/console/page.tsx');
const primitives = read('src/components/org/primitives.tsx');
const pinsTest = read('src/tests/stocktake-v2220.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the org block —');
ok('the stockTakes block exists and rides the payload', kpiRoute.includes('const stockTakes = {') && kpiRoute.includes('stockTakes,'));
ok('the block is additive (openSheets + recentSheets + window30d)', kpiRoute.includes('openCount: openSheetRows.length,') && kpiRoute.includes('recentSheets: recentSheetRows.map((s) => {') && kpiRoute.includes('window30d: {'));
ok('the roster is the 12 most recent of any status', kpiRoute.includes('orderBy: { startedAt: \'desc\' },') && kpiRoute.includes('take: 12,'));
ok('the window reads EVERY closed sheet in 30 days', kpiRoute.includes("where: { status: 'CLOSED', closedAt: { gte: windowStart } }"));
ok('the window is ONE aggregate (never a roster-only sum)', kpiRoute.includes('stockTakeLine.aggregate') && kpiRoute.includes('_sum: { variance: true, varianceCost: true },'));
ok('the type carries the optional block', primitives.includes('stockTakes?: {'));

console.log('— the cost law on the org wire —');
ok('the gate reads the SESSION role', kpiRoute.includes("hasFeaturePermission(session.role, 'inventory.view.cost')"));
ok('the window\u2019s shillings gate', kpiRoute.includes('varianceCostTotal: canViewCost ? windowCost : null,'));
ok('the roster\u2019s shillings gate', kpiRoute.includes("varianceCost: canViewCost && s.status === 'CLOSED' && v ? v.cost : null,"));
ok('units stay ungated', kpiRoute.includes('varianceUnits: s.status === \'CLOSED\' && v ? Math.round(v.units * 100) / 100 : null,'));

console.log('— the cancel laws —');
ok('the route is store-scoped and boundary-wrapped', cancelRoute.includes("withErrorBoundary(requireStoreAccess(cancelStockTakeHandler), 'STOCK_TAKE_CANCEL')"));
ok('only a COUNTING sheet cancels', cancelRoute.includes("if (sheet.status !== 'COUNTING') {") && cancelRoute.includes('only a COUNTING sheet cancels.'));
ok('the claim is atomic (updateMany COUNTING→CANCELLED)', cancelRoute.includes('db.$transaction') && cancelRoute.includes("where: { id, status: 'COUNTING' },") && cancelRoute.includes("status: 'CANCELLED'"));
ok('a lost claim reports the truth', cancelRoute.includes('if (claimed.count === 0) {'));
ok('NO stock moves, NO movements', !cancelRoute.includes('stockMovement.create') && !cancelRoute.includes('quantityInStock'));
ok('the reason rides the notes (≤300 in, ≤500 kept)', cancelRoute.includes('slice(0, 300)') && cancelRoute.includes('`cancelled: ${reason}`') && cancelRoute.includes('slice(0, 500)'));
ok('the canceller becomes the closer-of-record', cancelRoute.includes('closedById: session.userId'));

console.log('— the fifth consumer —');
ok('the map exists', map.includes('export function VarianceMap'));
ok('the map mounts on the console under the KPI row', page.includes('{kpi ? <VarianceMap data={kpi} stores={stores} /> : null}') && page.includes('<SectionErrorBoundary sectionName="Variance map">'));
ok('the strip observes the shared cache and NEVER fetches', map.includes('queryKey: ADMIN_CURRENCY_RATES_QUERY_KEY,') && map.includes('enabled: false,') && map.includes('the variance map never fetches — it observes the shared currency cache'));
ok('the silence law: cost gate, zero impact, KES pivot, missing rate', ["if (typeof windowCost !== 'number') return null;", 'if (windowCost === 0) return null;', "if (activeCurrency === 'KES') return null;", '!Number.isFinite(entry.kesToRate)'].every((s) => map.includes(s)));
ok('the strip\u2019s voice testids', ['org-variance-indicative-strip', 'org-variance-indicative-figure', 'org-variance-indicative-rate', 'org-variance-indicative-voice'].every((s) => map.includes(`data-testid="${s}"`)));
ok('the tail names the law', map.includes('the ledger stays in KES.'));
ok('the honest step-asides', ['variance-map-stale', 'variance-map-empty', 'variance-map-cap-note'].every((s) => map.includes(`data-testid="${s}"`)));
ok('the window tiles speak', ['variance-map-open', 'variance-map-closed', 'variance-map-units', 'variance-map-impact'].every((s) => map.includes(`data-testid="${s}"`)));
ok('the live rows + roster rows + dark halves', map.includes('data-testid="variance-map-live-row"') && map.includes('data-testid="variance-map-sheet-row"') && map.includes('dark:border-slate-700 dark:bg-slate-900'));

console.log('— the picker + the cancel UI —');
ok('the create route resolves the category SERVER-SIDE', listRoute.includes('const categoryId = typeof body?.categoryId === \'string\' && body.categoryId.length > 0 ? body.categoryId : null;') && listRoute.includes('? { categoryId }'));
ok('the empty-category refusal is its own honest voice', listRoute.includes("'no active products in this category — the sheet refuses an empty count.'"));
ok('the picker speaks the real row count', panel.includes('includeProductCount=true') && panel.includes('freeze ${pickedCategory.productCount ?? 0} products in ${pickedCategory.name}'));
ok('the picker reads only when it needs to', panel.includes("enabled: !!storeId && createOpen && createScope === 'category',"));
ok('the cancel zone is a two-step arm', ['stocktake-cancel-zone', 'stocktake-cancel-arm', 'stocktake-cancel-reason', 'stocktake-cancel-confirm', 'stocktake-cancel-disarm'].every((s) => panel.includes(`data-testid="${s}"`)));
ok('the cancelled face says what did NOT happen', panel.includes('data-testid="stocktake-cancelled-face"') && panel.includes('Sheet cancelled — the books never heard it') && panel.includes('no adjustments applied · no movements written'));

console.log('— the test + anchors —');
ok('the v2220 pins file speaks the map', pinsTest.includes('the variance map wears the strip family\\u2019s fifth consumer (v2.220.0)'));

console.log('— the release face —');
ok('package.json version 2.220.0', pkg.version === '2.220.0');
ok('package.json releaseVersion 2.220.0', pkg.mbumah?.releaseVersion === '2.220.0');
ok('package.json baseVersion 2.220.0', pkg.mbumah?.baseVersion === '2.220.0');
ok('VERSION 2.220.0', version === '2.220.0');
ok('whats-new entry at the head', whatsNew.includes("version: '2.220.0',") && whatsNew.includes("title: 'The variance map',"));
ok('changelog entry leads', changelog.includes('## [2.220.0] The variance map') && changelog.indexOf('2.220.0') < changelog.indexOf('2.219.0'));
ok('verify gate wired', pkg.scripts['verify:v2-220-0'] === 'node scripts/verify-v2-220-0.mjs');

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
