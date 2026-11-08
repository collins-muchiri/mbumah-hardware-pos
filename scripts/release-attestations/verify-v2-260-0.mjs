#!/usr/bin/env node
// ============================================================================
// verify-v2-260-0.mjs — the round's gate (v2.260.0 "the ledger's instruments").
//
// Every check reads the SOURCE OF RECORD (bytes, not memory). A byte's
// verdict is spoken by the file — THE OD LAW (the transport display can
// eat [m-shaped byte pairs, so the eye's reading of source is NOT
// evidence; match counts and exact bytes are).
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
const ledger = read('src/components/org/po-ledger.tsx');
const route = read('src/app/api/org/purchase-orders/route.ts');
const lib = read('src/lib/po-metrics.ts');
const ear = read('src/lib/use-lens-escape.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const orgDrill = read('src/components/org/po-drill.tsx');
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('pkg version = 2.260.0', pkg.version === '2.260.0');
ok('pkg releaseVersion = 2.260.0', pkg.mbumah?.releaseVersion === '2.260.0');
ok('pkg baseVersion = 2.260.0', pkg.mbumah?.baseVersion === '2.260.0');
ok('VERSION = 2.260.0', version === '2.260.0');
ok('whats-new lead = 2.260.0 with the round\u2019s title', feed.includes("version: '2.260.0',") && feed.includes('The ledger\\u2019s instruments'));
const leadIdx = feed.indexOf("version: '2.260.0',");
const pairIdx = feed.indexOf("version: '2.259.0',");
ok('whats-new pair order (lead 2.260.0 before pair 2.259.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.260.0]', changelog.includes("## [2.260.0] The ledger's instruments"));

console.log('— the ledger\u2019s instruments —');
ok('the ledger imports the metrics\u2019 one home', ledger.includes("} from '@/lib/po-metrics';") && ledger.includes('poMetricPredicate,'));
ok('the lib keeps the predicate\u2019s signature', lib.includes('export function poMetricPredicate(kind: PoMetricKind, po: PoMetricShape): boolean {'));
const declared = ledger.indexOf("const [metricLens, setMetricLens] = useState<PoMetricLens>('all');");
const earCall = ledger.indexOf('useLensEscape(bandLens');
ok('the rung\u2019s state declared BEFORE the ear (the TDZ law)', declared > -1 && earCall > declared);
ok('the ledger wears ONE ear', (ledger.match(/useLensEscape\(/g) || []).length === 1);
ok('the combined press', ledger.includes("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {"));
ok('the combined lift', ledger.includes("setBandLens('ALL');\n    setMetricLens('all');\n  });"));
ok('the counts read the rows (three predicates)', ['onTime', 'late', 'open'].every((k) => ledger.includes(`if (poMetricPredicate('${k}', r)) c.${k === 'onTime' ? 'onTime' : k} += 1;`)));
const bandCounts = ledger.indexOf('const bandCounts = useMemo(');
const metricCounts = ledger.indexOf('const metricCounts = useMemo(');
const shownRows = ledger.indexOf('const shownRows = useMemo(');
ok('the memos compose in order (band counts → metric counts → view)', bandCounts > -1 && metricCounts > bandCounts && shownRows > metricCounts);
ok('the view composes band → metric → needle', ledger.includes('metricLens === \'all\'\n        ? lensed\n        : lensed.filter((r) => poMetricPredicate(metricLens, r));') && ledger.includes('if (!cleanNeedle) return metricRows;'));
ok('the deps carry the composition', ledger.includes('}, [data, cleanNeedle, bandLens, metricLens]);'));

console.log('— the wire\u2019s honest growth —');
ok('the route selects createdAt', route.includes('createdAt: true,'));
ok('the route maps the metric clock', route.includes('createdAt: po.createdAt.toISOString(),'));
ok('the row type carries createdAt', ledger.includes('createdAt: string;'));
ok('orderDate keeps its own voice', route.includes('orderDate: po.orderDate.toISOString(),') && ledger.includes('orderDate: string;'));

console.log('— the rail\u2019s face —');
ok('the rail mounts with its testid', ledger.includes('data-testid="po-ledger-metric-row"'));
ok('the three kinds map with per-kind doors', ledger.includes("(['onTime', 'late', 'open'] as const).map((k) => {") && ledger.includes('data-testid={`po-ledger-metric-${k}`}'));
ok('the press is honest (aria-pressed + toggle)', ledger.includes('aria-pressed={pressed}') && ledger.includes("onClick={() => setMetricLens(pressed ? 'all' : k)}"));
ok('the chips wear the families + the ledger\u2019s sky', ledger.includes('${pressed ? family.pressed : family.chip}') && ledger.includes('focus-visible:ring-sky-500/40'));
ok('the titles speak the window\u2019s voice', ledger.includes('on this window answers the rule; a press narrows the view (the fetch stays)`}'));
ok('the empty face names the metric + the triple stand-down', ledger.includes('`no order on this window ${poMetricEmptyVoice(metricLens)} under the pressed filters') && ledger.includes("onClick={() => { setBandLens('ALL'); setMetricLens('all'); setNeedle(''); }}"));

console.log('— the ancestors untouched —');
ok('the ear\u2019s home keeps both rungs', ear.includes('export function useLensEscape(pressed: boolean, onClear: () => void): void {') && ear.includes('export function useDrillEscape(onClose: () => void): void {'));
ok('the band rail keeps its own row', ledger.includes('data-testid="po-ledger-band-row"') && ledger.includes('data-testid="po-ledger-band-silent"'));
ok('the branch rail keeps its own addresses', branch.includes('data-testid="branch-po-metric-rail"') && !branch.includes('po-ledger-metric'));
ok('the export law unchanged', ledger.includes('title="the whole window, one file \u2014 the finder narrows the reading, never the export"'));
ok('the drills keep their rungs', orgDrill.includes('useDrillEscape(onClose);') && drill.includes('useDrillEscape(onClose);'));

console.log(`\nverify-v2-260-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('verify OK');
