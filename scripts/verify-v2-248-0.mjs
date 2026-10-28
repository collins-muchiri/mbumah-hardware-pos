#!/usr/bin/env node
// verify-v2-248-0.mjs — the v2.248.0 release gate.
//
// THE DOOR'S ANSWER: doors land where they point (the workspace tab
// landing — the bug fix), and a finding is answerable (the restock's
// birth: the create wire's BIRTH ALLOWLIST, the drill's violet restock
// door, the dialog's pre-pick + birth strip, the roster chip + the
// record strip, the laws named on the census row and the walk picker).
// Plus the release face: package.json / VERSION / whats-new / CHANGELOG
// all speak 2.248.0, and the fossil guards keep every previous round's
// law alive.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const schema = read('prisma/schema.prisma');
const poWire = read('src/app/api/purchase-orders/route.ts');
const poDetailWire = read('src/app/api/purchase-orders/[id]/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const poTab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const links = read('src/lib/workspace/links.ts');
const gateway = read('src/components/workspace/workspace-gateway.tsx');
const workspacePage = read('src/app/(shell)/stores/[slug]/[[...rest]]/page.tsx');
const map = read('src/components/org/variance-map.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const bandLib = read('src/lib/cadence-band.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const createWire = read('src/app/api/stock-takes/route.ts');
const apiLib = read('src/lib/api.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');

console.log('— the release face —');
ok('package.json releaseVersion 2.248.0', pkg.mbumah.releaseVersion === '2.248.0');
ok('package.json baseVersion 2.248.0', pkg.mbumah.baseVersion === '2.248.0');
ok('package.json version 2.248.0', pkg.version === '2.248.0');
ok('VERSION 2.248.0', version === '2.248.0');
ok('verify gate wired', pkg.scripts['verify:v2-248-0'] === 'node scripts/verify-v2-248-0.mjs');
ok('previous gate still wired', pkg.scripts['verify:v2-247-0'] === 'node scripts/verify-v2-247-0.mjs');
ok('whats-new entry at the head', whatsNew.includes("version: '2.248.0',") && whatsNew.indexOf("version: '2.248.0',") < whatsNew.indexOf("version: '2.247.0',"));
ok('whats-new title speaks the door\u2019s answer', whatsNew.includes("title: 'The door\\u2019s answer',"));
ok('changelog anchors the section above its ancestor', changelog.indexOf('## [2.248.0]') >= 0 && changelog.indexOf('## [2.248.0]') < changelog.indexOf('## [2.247.0]'));
ok('the counters ride +1 in the counter test', changelogTest.includes("expect(whatsNewUnreadCount('2.110.0')).toBe(139);") && changelogTest.includes("expect(whatsNewUnreadCount('2.77.0')).toBe(172);"));

console.log('— the doors\u2019 landing (the bug fix) —');
ok('the workspace page forwards the catch-all segments', workspacePage.includes('const { slug, rest } = await params;') && workspacePage.includes('<WorkspaceGateway slug={slug.toLowerCase()} rest={rest} />'));
ok('the gateway maps the first segment once at ready', gateway.includes('const tab = tabFromWorkspacePath(rest);') && gateway.includes('landingSyncedRef.current = true;'));
ok('the mapper guards the AppTab list', links.includes('export function tabFromWorkspacePath(rest: readonly string[] | null | undefined): AppTab | null {') && links.includes('return TAB_SEGMENTS.has(segment) ? segment : null;'));
ok('both door addresses are mapped segments', links.includes("'dashboard', 'pos', 'catalog', 'inventory', 'customers', 'rentals',") && links.includes("'conversations', 'purchase-orders', 'analytics', 'data-exports',"));

console.log('— the restock\u2019s birth —');
ok('the schema grows originStockTakeId (nullable + SetNull + indexed)', schema.includes('originStockTakeId   String?') && schema.includes('onDelete: SetNull)') && schema.includes('@@index([originStockTakeId])'));
ok('the read-side relation stands', schema.includes('restockOrders PurchaseOrder[]'));
ok('the create wire reads the birth', poWire.includes('const { storeId, supplierId, items, notes, expectedDate, originStockTakeId } = body as {'));
ok('the allowlist rejects a cross-store or dead sheet', poWire.includes('if (!birthSheet || birthSheet.storeId !== storeId) {') && poWire.includes('originStockTakeId does not name a count sheet in this store.'));
ok('the allowlist rejects an un-CLOSED sheet', poWire.includes("if (birthSheet.status !== 'CLOSED') {") && poWire.includes('originStockTakeId names a sheet that is not CLOSED'));
ok('the birth stores only when named (never inferred)', poWire.includes("originStockTakeId: originStockTakeId != null && originStockTakeId !== '' ? originStockTakeId : null,"));
ok('the list wire grows originStockTake', poWire.includes('originStockTake: {\n          select: {') && poWire.includes('walkAisle: { select: { name: true } },'));
ok('the detail wire grows originStockTake', poDetailWire.includes('originStockTake: {\n        select: {'));
ok('the system log speaks the birth', poWire.includes('originStockTakeId: originStockTakeId ?? null }'));
ok('the client type + create call grow the birth', apiLib.includes('originStockTake?: { id: string; status: string; closedAt: string | null; walkAisle: { name: string } | null } | null;') && apiLib.includes('originStockTakeId?: string;'));

console.log('— the restock door —');
ok('the drill derives the shrinkage lines', drill.includes('const shrinkageLines = data ? data.lines.filter((l) => l.variance != null && l.variance < 0) : [];'));
ok('the violet door mounts only for a CLOSED shrinkage sheet with a slug', drill.includes("data.status === 'CLOSED' && shrinkageLines.length > 0 && data.store.slug && (() => {") && drill.includes('data-testid="sheet-drill-restock-door"'));
ok('the door\u2019s address carries the sheet', drill.includes('href={`/stores/${data.store.slug}/purchase-orders?restockFrom=${encodeURIComponent(data.id)}`}'));
ok('the door wears the violet house + the honest units voice', drill.includes('border-violet-300 bg-violet-50/60') && drill.includes('const shrinkUnits = shrinkageLines.reduce((s, l) => s + Math.abs(l.variance ?? 0), 0);'));
ok('the door stays off the paper', drill.includes('data-testid="sheet-drill-restock-door"\n                    data-sheet-print-off=""'));

console.log('— the landing + pre-pick —');
ok('the tab reads ?restockFrom= ONE time + cleans the address', poTab.includes("new URLSearchParams(window.location.search).get('restockFrom') ?? ''") && poTab.includes("window.history.replaceState(null, '', window.location.pathname + window.location.hash);"));
ok('the dialog receives the birth', poTab.includes('restockSheetId={restockFrom || null}') && poTab.includes('originStockTakeId: restockSheetId || undefined,'));
ok('the pre-pick takes shrinkage only (variance < 0)', poTab.includes('if (variance == null || !Number.isFinite(variance) || variance >= 0) continue;') && poTab.includes('const lost = Math.abs(variance);'));
ok('the pre-pick costs at the product\u2019s own cost price', poTab.includes('unitCost: String(l.product?.costPrice ?? 0),'));
ok('a refusing sheet speaks its refusal (the birth stays off the record)', poTab.includes("sheet.status !== 'CLOSED'") && poTab.includes('the birth stays off the record.'));
ok('the violet birth strip rides the dialog', poTab.includes('data-testid="po-restock-provenance"') && poTab.includes('born at a count sheet'));

console.log('— the birth\u2019s faces —');
ok('the roster wears the violet birth chip', poTab.includes('data-testid="po-row-birth-chip"') && poTab.includes('BORN AT A COUNT SHEET') && poTab.includes('{po.originStockTake && ('));
ok('the record wears the birth strip', poTab.includes('data-testid="po-detail-birth-strip"') && poTab.includes('this PO answers count sheet'));

console.log('— the laws named (the ride-along) —');
ok('the census row\u2019s title speaks the window-sum law', map.includes('the verdict sums every closed sheet born here this window'));
ok('the walk picker\u2019s title speaks the latest walk\u2019s own truth', panel.includes("the latest walk that counted here found this — one walk's own truth"));

console.log('— the fossil guards (every previous law stays alive) —');
ok('the band\u2019s one home still stands (v2.244\u2019s law)', bandLib.includes("export type CadenceBand = 'fresh' | 'stale' | 'beyond' | 'never';") && !map.includes('const bandHouse = ('));
ok('the drill\u2019s band chip still rides (v2.244\u2019s law)', drill.includes('data-testid="sheet-drill-origin-aisle-band"'));
ok('the pick strip\u2019s verdict line still rides (v2.245\u2019s law)', panel.includes('data-testid="stocktake-pick-cadence-verdict"') && panel.includes('const findings = picked.cadence.lastWalkUnits == null'));
ok('the mirror\u2019s self line still rides (v2.247\u2019s law)', drill.includes('data-testid="sheet-drill-origin-aisle-self"') && panel.includes('data-testid="stocktake-sheet-origin-aisle-self"'));
ok('the verdict rows still ride the enrichment (v2.243\u2019s law)', kpi.includes('band: bandByCategory.get(a.categoryId) ?? null,'));
ok('the origin allowlist still holds (the create wire)', createWire.includes("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;"));
ok('the census face still speaks its zero (v2.238\u2019s law)', map.includes('data-testid="cadence-door-census"'));
ok('the voice\u2019s one home still stands (v2.246\u2019s law)', bandLib.includes('export function findingsVoice(units: number): FindingsVoice {') && map.includes('findingsVoice(a.varianceUnits)') && panel.includes('findingsVoice(picked.cadence.lastWalkUnits)'));
ok('the recount door still rides (v2.232\u2019s law)', drill.includes('data-testid="sheet-drill-recount-door"') && drill.includes('href={`/stores/${data.store.slug}/inventory`}'));

console.log(`\n${pass} passed, ${failures} failed`);
process.exit(failures > 0 ? 1 : 0);
