#!/usr/bin/env node
// ============================================================================
// verify-v2-262-0.mjs — the round's gate (v2.262.0 "the branch's answer").
//
// Every check reads the SOURCE OF RECORD (bytes, not memory). A byte's
// verdict is spoken by the file — THE OD LAW (the transport display can
// eat byte pairs, so the eye's reading of source is NOT evidence;
// match counts and exact bytes are).
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
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const orgDrill = read('src/components/org/po-drill.tsx');
const ledger = read('src/components/org/po-ledger.tsx');
const lib = read('src/lib/po-metrics.ts');
const ear = read('src/lib/use-lens-escape.ts');
const sheetDrill = read('src/components/org/sheet-drill.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('pkg version = 2.262.0', pkg.version === '2.262.0');
ok('pkg releaseVersion = 2.262.0', pkg.mbumah?.releaseVersion === '2.262.0');
ok('pkg baseVersion = 2.262.0', pkg.mbumah?.baseVersion === '2.262.0');
ok('VERSION = 2.262.0', version === '2.262.0');
ok('whats-new lead = 2.262.0 with the round\u2019s title', feed.includes("version: '2.262.0',") && feed.includes("The branch\\u2019s answer"));
const leadIdx = feed.indexOf("version: '2.262.0',");
const pairIdx = feed.indexOf("version: '2.261.0',");
ok('whats-new pair order (lead 2.262.0 before pair 2.261.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.262.0]', changelog.includes("## [2.262.0] The branch's answer"));

console.log('— the branch\u2019s answer —');
ok('the door grew the metric hand (additive + optional)', branch.includes('  metric?: PoMetricKind;') && branch.includes('  metric,\n}: {'));
ok('the tab imports the why voice + the kind', branch.includes("poMetricWhyVoice,\n  type PoMetricKind,\n  type PoMetricLens,\n} from '@/lib/po-metrics';"));
const guardIdx = branch.indexOf('if (!detail) return null;');
const gateIdx = branch.indexOf('const whyVoice = metric && detail');
ok('the gate reads the FRESH wire\u2019s own row, AFTER the guard', branch.includes('const whyVoice = metric && detail ? poMetricWhyVoice(metric, detail) : null;') && branch.includes('const whyFamily = metric ? poMetricFamily(metric) : null;') && guardIdx > -1 && gateIdx > guardIdx);
ok('the strip\u2019s honest address + family + dot', branch.includes('data-testid="po-detail-metric-why"') && branch.includes('data-testid="po-detail-metric-why-voice"') && branch.includes('${whyFamily.why}') && branch.includes('${whyFamily.rail}'));
const whyIdx = branch.indexOf('data-testid="po-detail-metric-why"');
const birthIdx = branch.indexOf('data-testid="po-detail-birth-strip"');
ok('the strip lives ABOVE the birth strip', whyIdx > -1 && birthIdx > whyIdx);
ok('the roster hands the pressed rule (unpressed stays absent)', branch.includes("metric={metricLens === 'all' ? undefined : metricLens}"));

console.log('— the shared words (one answer, two surfaces) —');
const label = 'why this document answers';
const title = "the one rule \u2014 the Performance card, the rails and the tiles all read it; this document's own facts answer it here";
ok('the label is byte-shared across both strips', branch.includes(label) && orgDrill.includes(label));
ok('the title is byte-shared across both strips', branch.includes(title) && orgDrill.includes(title));
ok('the one home\u2019s voice unchanged (both surfaces read the same gate)', lib.includes('export function poMetricWhyVoice(kind: PoMetricKind, po: PoMetricWhyShape): string | null {') && lib.includes('if (!poMetricPredicate(kind, po)) return null;'));

console.log('— the ancestors untouched —');
ok('the ledger drill keeps its own why-strip + hand', orgDrill.includes('data-testid="po-drill-metric-why"') && orgDrill.includes('const metricWhy = metricKind && data ? poMetricWhyVoice(metricKind, data) : null;') && ledger.includes("metric: metricLens === 'all' ? undefined : metricLens,"));
ok('the detail\u2019s earlier growth keeps its bytes (door + chip, no second listener)', branch.includes('data-testid="po-detail-birth-door"') && branch.includes('data-testid="po-detail-esc-hint"') && !branch.includes('useDrillEscape'));
ok('the tab\u2019s rail + combined ear keep their bytes', branch.includes('data-testid="branch-po-metric-rail"') && branch.includes("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {") && (branch.match(/useLensEscape\(/g) || []).length === 1);
ok('the ledger keeps its rails + ear', ledger.includes('data-testid="po-ledger-band-row"') && ledger.includes('data-testid="po-ledger-metric-row"') && (ledger.match(/useLensEscape\(/g) || []).length === 1);
ok('the ear\u2019s home keeps both rungs', ear.includes('export function useLensEscape(pressed: boolean, onClear: () => void): void {') && ear.includes('export function useDrillEscape(onClose: () => void): void {'));
ok('the drills keep their rungs + chips', orgDrill.includes('useDrillEscape(onClose);') && sheetDrill.includes('useDrillEscape(onClose);') && orgDrill.includes('data-testid="po-drill-esc-hint"') && sheetDrill.includes('data-testid="sheet-drill-esc-hint"'));

console.log(`\nverify-v2-262-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('verify OK');
