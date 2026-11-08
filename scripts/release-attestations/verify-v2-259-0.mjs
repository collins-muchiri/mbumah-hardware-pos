#!/usr/bin/env node
// ============================================================================
// verify-v2-259-0.mjs — the round's gate (v2.259.0 "the branch's instruments
// + the branch's door").
//
// Every check reads the SOURCE OF RECORD (bytes, not memory). A byte's
// verdict is spoken by the file — THE OD LAW (this round's lesson: the
// transport display can eat [m-shaped byte pairs, so the eye's reading of
// source is NOT evidence; match counts and exact bytes are).
// ============================================================================

import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const tab = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const lib = read('src/lib/po-metrics.ts');
const ear = read('src/lib/use-lens-escape.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const orgDrill = read('src/components/org/po-drill.tsx');
const suppliers = read('src/app/(shell)/tabs/suppliers-tab.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const detailRoute = read('src/app/api/purchase-orders/[id]/route.ts');
const apiLib = read('src/lib/api.ts');

console.log('— the release face —');
ok('pkg version = 2.259.0', pkg.version === '2.259.0');
ok('pkg releaseVersion = 2.259.0', pkg.mbumah?.releaseVersion === '2.259.0');
ok('pkg baseVersion = 2.259.0', pkg.mbumah?.baseVersion === '2.259.0');
ok('VERSION = 2.259.0', version === '2.259.0');
ok('whats-new lead = 2.259.0 with the round\u2019s title', feed.includes("version: '2.259.0',") && feed.includes('The branch\\u2019s instruments + the branch\\u2019s door'));
const leadIdx = feed.indexOf("version: '2.259.0',");
const pairIdx = feed.indexOf("version: '2.258.0',");
ok('whats-new pair order (lead 2.259.0 before pair 2.258.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.259.0]', changelog.includes("## [2.259.0] The branch's instruments + the branch's door"));

console.log('— the branch\u2019s instruments —');
ok('the tab imports the metrics\u2019 one home', tab.includes("} from '@/lib/po-metrics';") && tab.includes('poMetricPredicate,'));
ok('the lib keeps the predicate\u2019s signature', lib.includes('export function poMetricPredicate(kind: PoMetricKind, po: PoMetricShape): boolean {'));
const declared = tab.indexOf("const [metricLens, setMetricLens] = useState<PoMetricLens>('all');");
const earCall = tab.indexOf('useLensEscape(bandLens');
ok('the rung\u2019s state declared BEFORE the ear (the TDZ law)', declared > -1 && earCall > declared);
ok('the surface wears ONE ear', (tab.match(/useLensEscape\(/g) || []).length === 1);
ok('the combined press', tab.includes("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {"));
ok('the combined lift (the ear\u2019s)', tab.includes("setBandLens('ALL');\n    setMetricLens('all');\n  });"));
ok('the combined lift (the clear-all\u2019s)', tab.includes("setBandLens('ALL');\n    setMetricLens('all');\n  };"));
ok('hasActiveFilters reads both instruments', tab.includes("bandLens !== 'ALL' || metricLens !== 'all';"));
ok('the counts read the rows (three predicates)', ["onTime", "late", "open"].every((k) => tab.includes(`poMetricPredicate('${k}', po)).length`)));
const band = tab.indexOf('const bandOrders = useMemo(');
const lensed = tab.indexOf('const lensedOrders = useMemo(');
const sorted = tab.indexOf('const sortedPOs = useMemo(');
ok('the memos compose in order (band → metric → sort)', band > -1 && lensed > band && sorted > lensed);
ok('the composed filter reads the one home', tab.includes('bandOrders.filter((po) => poMetricPredicate(metricLens, po))'));

console.log('— the rail\u2019s face —');
ok('the rail mounts with its testid', tab.includes('data-testid="branch-po-metric-rail"'));
ok('the three kinds map with per-kind doors', tab.includes("(['onTime', 'late', 'open'] as const).map((k) => {") && tab.includes('data-testid={`branch-po-metric-${k}`}'));
ok('the press is honest (aria-pressed + family)', tab.includes('aria-pressed={pressed}') && tab.includes('${pressed ? family.pressed : family.chip}'));
ok('the rail\u2019s rings stay the branch\u2019s sky (focus-visible)', tab.includes('focus-visible:ring-sky-500/40 ${pressed ? family.pressed : family.chip}'));
ok('the empty face names the metric + its stand-down', tab.includes('`No order on this page ${poMetricEmptyVoice(metricLens)}`') && tab.includes('data-testid="branch-po-metric-clear"'));

console.log('— the branch\u2019s door —');
ok('the detail grows the optional hand', tab.includes('onOpenSheet?: (t: { id: string; storeName: string; status: string }) => void;'));
ok('the door\u2019s address is honest (fresh wire or absence)', tab.includes('detail?.originStockTake && detail.store?.name'));
ok('the door wears the org\u2019s bytes (testid + words + violet ring)', tab.includes('data-testid="po-detail-birth-door"') && tab.includes("the detail's reading moves to the sheet that birthed this order") && tab.includes('focus-visible:ring-violet-500/60'));
const closeIdx = tab.indexOf('setDetailOpen(false);\n          setSheetDrill(t);');
ok('the parent\u2019s hand (detail closes before the sheet opens)', closeIdx > -1);
ok('the sheet drill renders (the rung rides it)', tab.includes('{sheetDrill && <SheetDrill target={sheetDrill} onClose={() => setSheetDrill(null)} />}'));
ok('the wire carries the store (route include)', detailRoute.includes('store: { select: { id: true, name: true, code: true } },'));
ok('the type carries the store (additive + optional)', apiLib.includes('store?: { id: string; name: string; code?: string | null } | null;'));

console.log('— the ancestors untouched —');
ok('the ear\u2019s home keeps both rungs', ear.includes('export function useLensEscape(pressed: boolean, onClear: () => void): void {') && ear.includes('export function useDrillEscape(onClose: () => void): void {'));
ok('the supplier\u2019s combined ear keeps its bytes', suppliers.includes("const [metricLens, setMetricLens] = useState<PoMetricLens>('all');") && suppliers.includes("bandLens !== 'ALL' || metricLens !== 'all',"));
ok('the org drill\u2019s door keeps its bytes', orgDrill.includes('data-testid="po-drill-birth-door"'));
ok('the sheet drill\u2019s contract keeps its shape', drill.includes('export type SheetDrillTarget = { id: string; storeName: string; status: string } | null;') && drill.includes('useDrillEscape(onClose);'));

console.log(`\nverify-v2-259-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('verify OK');
