#!/usr/bin/env node
// verify-v2-258-0.mjs — the v2.258.0 release gate.
//
// THE METRICS' ANSWER: the supplier detail's Performance card answers
// BY the orders behind its numbers — drill chips (on time / late /
// in flight) open the Orders sub-tab with the metric lens pressed; the
// predicates live in ONE home (src/lib/po-metrics.ts) so a tile's %
// and its drill count cannot disagree; the metric lens composes with
// the band lens (AND, never OR — the composed list keeps the name the
// rows and badge read); the metric lens wears its own ear (one Escape
// lifts both instruments); the empty face names the metric and offers
// its own clear. Plus the release face: package.json / VERSION /
// whats-new / CHANGELOG all speak 2.258.0.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let failures = 0;
let pass = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { failures++; console.log(`FAIL  ${name}`); }
};
const read = (p) => readFileSync(join(process.cwd(), p), 'utf8');

const metrics = read('src/lib/po-metrics.ts');
const tab = read('src/app/(shell)/tabs/suppliers-tab.tsx');
const pkg = JSON.parse(read('package.json'));
const versionFile = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the one home —');
ok('the kinds + the one predicate (the card\u2019s on-time rule byte-matched)', metrics.includes("export type PoMetricKind = 'onTime' | 'late' | 'open';") && metrics.includes("if (kind === 'onTime') return expected == null || (created != null && created <= expected);"));
ok('late is the received complement; open is what fulfillment does not yet cover', metrics.includes('return expected != null && created != null && created > expected; // late') && metrics.includes("if (kind === 'open') return po.status !== 'CANCELLED' && po.status !== 'RECEIVED';"));
ok('the voices + families (the tile\u2019s own colour, never a new palette)', metrics.includes("return 'in flight';") && metrics.includes('chip: \'bg-green-50') && metrics.includes('chip: \'bg-rose-50') && metrics.includes('chip: \'bg-blue-50'));

console.log('— the card answers —');
ok('the drill is additive (a face without the callback keeps the plain counts)', tab.includes('onDrillToOrders?: (kind: PoMetricKind) => void') && tab.includes('onDrillToOrders ? ('));
ok('the counts read the ONE home (a tile\u2019s % and its drill count cannot disagree)', ["onTime", "late", "open"].every((k) => tab.includes(`poMetricPredicate('${k}', po)`)));
ok('the tiles mount the drill chips with the family ring', tab.includes('data-testid={`supplier-po-metric-drill-${kind}`}') && tab.includes('${poMetricFamily(kind).chip}'));

console.log('— the roster answers —');
ok('the metric rung has its own state and the surface wears ONE combined ear (one press lifts both)', tab.includes("const [metricLens, setMetricLens] = useState<PoMetricLens>('all');") && tab.includes("bandLens !== 'ALL' || metricLens !== 'all',") && tab.includes("() => { setBandLens('ALL'); setMetricLens('all'); }") && !tab.includes("useLensEscape(bandLens !== 'ALL', () => setBandLens('ALL'));"));
ok('the composition: bandOrders by the house, lensedOrders by the metric (AND, never OR)', tab.includes('const bandOrders = useMemo(') && tab.includes('bandOrders.filter((po) => poMetricPredicate(metricLens, po))') && tab.includes('[bandOrders, metricLens]'));
ok('the v2.255.0 bytes kept: the badge\u2019s answers, the rows\u2019 map, the band voices, the band clear', tab.includes('${lensedOrders.length} of ${purchaseOrders.length} orders') && tab.includes('{lensedOrders.map((po) => (') && tab.includes('No order on this roster keeps the silence') && tab.includes('No order on this roster wears ${bandLens}') && tab.includes("onClick={() => setBandLens('ALL')}"));
ok('the metric chip + the honest empty face + the metric clear', tab.includes('data-testid="supplier-po-metric-chip"') && tab.includes('? `No order on this roster ${poMetricEmptyVoice(metricLens)}`') && tab.includes('data-testid="supplier-po-metric-clear"'));

console.log('— the drill turns the wheel —');
ok('the controlled sub-tabs: the drill opens orders with the lens pressed', tab.includes("const [detailTab, setDetailTab] = useState('info');") && tab.includes('<Tabs value={detailTab} onValueChange={(v) => setDetailTab(v)}>') && tab.includes("onDrillToOrders={(kind) => { setMetricLens(kind); setDetailTab('orders'); }}"));

console.log('— the release face —');
ok('package.json version + mbumah metadata speak 2.258.0', pkg.version === '2.258.0' && pkg.mbumah?.releaseVersion === '2.258.0' && pkg.mbumah?.baseVersion === '2.258.0');
ok('VERSION speaks 2.258.0', versionFile === '2.258.0');
ok('whats-new speaks 2.258.0 (the metrics\u2019 answer)', whatsNew.includes("version: '2.258.0',") && whatsNew.includes('The metrics\\u2019 answer'));
ok('whats-new keeps the pair order (2.258.0 leads 2.257.0)', whatsNew.indexOf("version: '2.258.0',") < whatsNew.indexOf("version: '2.257.0',"));
ok('CHANGELOG leads with 2.258.0 (Added + Styled + Tests)', changelog.includes("## [2.258.0] The metrics' answer") && changelog.indexOf('## [2.258.0]') < changelog.indexOf('## [2.257.0]') && changelog.includes('### Styled'));

console.log(`\nverify-v2-258-0: ${pass} passed, ${failures} failed`);
process.exit(failures === 0 ? 0 : 1);
