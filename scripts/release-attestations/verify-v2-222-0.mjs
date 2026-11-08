#!/usr/bin/env node
// verify-v2-222-0.mjs — the v2.222.0 release gate.
//
// Reads the SOURCE OF RECORD and asserts the release's laws: THE ORG
// DRILL WIRE (ORG_ROLES gate, runWithoutTenant, the store carried,
// 404 honest), THE COST LAW ON THE DRILL (the summary tile + per-line
// cost null past inventory.view.cost), READ-ONLY BY LAW (no pens on
// the org face), EVERY STATUS DRILLS (COUNTING re-read / CLOSED cost /
// CANCELLED void), THE MAP'S DOORS (roster + live rows, chevron), THE
// NEAR-REORDER BAND (default off, includeNear rides only when on,
// both states disclose, NEAR_REORDER chips), and the release face:
// package.json / VERSION / whats-new / CHANGELOG all speak 2.222.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const wire = read('src/app/api/org/stock-takes/[id]/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const map = read('src/components/org/variance-map.tsx');
const dialog = read('src/components/org/restock-dialog.tsx');
const test = read('src/tests/sheet-drill-v2222.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('package.json releaseVersion 2.222.0', pkg.mbumah.releaseVersion === '2.222.0');
ok('package.json baseVersion 2.222.0', pkg.mbumah.baseVersion === '2.222.0');
ok('package.json version 2.222.0', pkg.version === '2.222.0');
ok('VERSION 2.222.0', version === '2.222.0');
ok('whats-new entry at the head', whatsNew.includes("version: '2.222.0',") && whatsNew.indexOf("version: '2.222.0',") < whatsNew.indexOf("version: '2.221.0',"));
ok('changelog entry leads', changelog.includes('## [2.222.0] The sheet drill') && changelog.indexOf('## [2.222.0]') < changelog.indexOf('## [2.221.0]'));
ok('verify gate wired', pkg.scripts['verify:v2-222-0'] === 'node scripts/verify-v2-222-0.mjs');

console.log('— the org drill wire —');
ok('ORG_ROLES gate (the kpi-summary contract)', wire.includes("const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];") && wire.includes('requireAuth(orgStockTakeDetailHandler, { roles: ORG_ROLES })'));
ok('the read runs WITHOUT tenant', wire.includes('runWithoutTenant'));
ok('the sheet carries its store', wire.includes('store: { id: sheet.store.id, name: sheet.store.name, code: sheet.store.code }'));
ok('a missing sheet is a 404', wire.includes("error: 'count sheet not found.'"));

console.log('— the cost law on the drill —');
ok('the gate reads the session role', wire.includes("hasFeaturePermission(session.role, 'inventory.view.cost')"));
ok('the summary shillings gate', wire.includes('varianceValue: canViewCost ? Math.round(varianceValueEstimate * 100) / 100 : null,'));
ok('the per-line shillings gate', wire.includes('varianceCost: canViewCost && l.varianceCost != null ? Number(l.varianceCost) : null,'));

console.log('— read-only by law —');
ok('the footer names the law', drill.includes('data-testid="sheet-drill-read-only"'));
ok('no pens on the org face (no count inputs / close / cancel)', !drill.includes('stocktake-count-input') && !drill.includes('stocktake-close-btn') && !drill.includes('stocktake-cancel'));
ok('the loading face discloses the one fetch', drill.includes('opening the sheet — one fetch of its lines…'));

console.log('— every status drills —');
ok('the COUNTING voice + the live re-read', drill.includes("'the floor is speaking'") && drill.includes("refetchInterval: target?.status === 'COUNTING' ? 10_000 : false,"));
ok('the CLOSED voice', drill.includes("'the books heard it'"));
ok('the CANCELLED void voice', drill.includes("'the void'") && drill.includes('a void — no adjustments, no movements'));
ok('the honest empty face', drill.includes('the sheet froze no lines — nothing to count.'));

console.log('— the map\u2019s doors —');
ok('the map mounts the drill', map.includes('{drill && <SheetDrill target={drill} onClose={() => setDrill(null)} />}'));
ok('roster AND live rows are doors', (map.match(/variance-map-open-sheet-\$\{s\.id\}/g) ?? []).length === 2);
ok('the chevron affordance', map.includes('<ChevronRight'));

console.log('— the near-reorder band —');
ok('the toggle is aria-pressed, full mode only', dialog.includes('data-testid="restock-near-toggle"') && dialog.includes('aria-pressed={nearBand}') && dialog.includes("{mode === 'full' && ("));
ok('defaults OFF', dialog.includes('const [nearBand, setNearBand] = useState(false);'));
ok('includeNear rides only when on', dialog.includes("nearBand ? '&includeNear=true' : ''") && dialog.includes("queryKey: ['restock-full', storeId, nearBand],"));
ok('both states disclose', dialog.includes('the list widened to level \u00d7 1.5 — near-band lines wear their chip.') && dialog.includes('the list stops at the reorder level — widen to catch items approaching it.'));
ok('NEAR_REORDER rows wear their chip', dialog.includes("const near = item.urgency === 'NEAR_REORDER';") && dialog.includes('restock-near-chip-${item.sku}'));
ok('the urgency rides RestockItem', dialog.includes('urgency: r.urgency,') && dialog.includes('urgency?: string;'));

console.log('— the source pins —');
ok('the drill test pins the org gate', test.includes("const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];"));
ok('the drill test pins the read-only law', test.includes("expect(drill.includes('stocktake-count-input')).toBe(false);"));
ok('the drill test pins the near band', test.includes("const near = item.urgency === 'NEAR_REORDER';"));

console.log('');
if (failures === 0) {
  console.log(`${pass} passed, 0 failed`);
  process.exit(0);
} else {
  console.log(`${pass} passed, ${failures} FAILED`);
  process.exit(1);
}
