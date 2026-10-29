#!/usr/bin/env node
// ============================================================================
// verify-v2-261-0.mjs — the round's gate (v2.261.0 "the document's answer").
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
const lib = read('src/lib/po-metrics.ts');
const orgDrill = read('src/components/org/po-drill.tsx');
const sheetDrill = read('src/components/org/sheet-drill.tsx');
const ledger = read('src/components/org/po-ledger.tsx');
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const ear = read('src/lib/use-lens-escape.ts');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('pkg version = 2.261.0', pkg.version === '2.261.0');
ok('pkg releaseVersion = 2.261.0', pkg.mbumah?.releaseVersion === '2.261.0');
ok('pkg baseVersion = 2.261.0', pkg.mbumah?.baseVersion === '2.261.0');
ok('VERSION = 2.261.0', version === '2.261.0');
ok('whats-new lead = 2.261.0 with the round\u2019s title', feed.includes("version: '2.261.0',") && feed.includes("The document\\u2019s answer"));
const leadIdx = feed.indexOf("version: '2.261.0',");
const pairIdx = feed.indexOf("version: '2.260.0',");
ok('whats-new pair order (lead 2.261.0 before pair 2.260.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.261.0]', changelog.includes("## [2.261.0] The document's answer"));

console.log('— the one home grew the why voice —');
ok('the shape + the voice exported beside the rule', lib.includes('export interface PoMetricWhyShape {') && lib.includes('export function poMetricWhyVoice(kind: PoMetricKind, po: PoMetricWhyShape): string | null {'));
ok('the gate IS the predicate', lib.includes('if (!poMetricPredicate(kind, po)) return null;'));
ok('the on-time benefit keeps its voice', lib.includes("no day was named; the benefit of the doubt stands."));
ok('the late count is the CALENDAR gap (never ceil\u2019s two-day lie)', lib.includes('Math.floor(created / DAY_MS) - Math.floor(expected / DAY_MS)'));
ok('the same-day late speaks its own words', lib.includes("'arrived late \u2014 raised later in the day the supplier named.'"));
ok('the family grew the why face on all three kinds', ['green', 'rose', 'blue'].every((c) => lib.includes(`why: 'border-${c}-200 bg-${c}-50/60 text-${c}-800 dark:border-${c}-500/40 dark:bg-${c}-500/10 dark:text-${c}-200',`)));
ok('the ancestors\u2019 faces byte-identical (chip/pressed/rail)', lib.includes("chip: 'bg-green-50 text-green-700 ring-green-300/70") && lib.includes("pressed: 'bg-rose-600 text-white ring-rose-600") && lib.includes("rail: 'bg-blue-500',"));

console.log('— the drill wears the document\u2019s answer —');
ok('the target grew the metric hand (additive + optional)', orgDrill.includes('export type PoDrillTarget = {') && orgDrill.includes('  metric?: PoMetricKind;') && orgDrill.includes('} | null;'));
ok('the drill imports the one home', orgDrill.includes("import { poMetricFamily, poMetricWhyVoice, type PoMetricKind } from '@/lib/po-metrics';"));
ok('the gate reads the FRESH wire\u2019s own row', orgDrill.includes('const metricKind = target.metric ?? null;') && orgDrill.includes('const whyFamily = metricKind ? poMetricFamily(metricKind) : null;') && orgDrill.includes('const metricWhy = metricKind && data ? poMetricWhyVoice(metricKind, data) : null;'));
ok('the strip\u2019s honest address + family + dot', orgDrill.includes('data-testid="po-drill-metric-why"') && orgDrill.includes('data-testid="po-drill-metric-why-voice"') && orgDrill.includes('${whyFamily.why}') && orgDrill.includes('${whyFamily.rail}'));
const dataIdx = orgDrill.indexOf('{data && (');
const stripIdx = orgDrill.indexOf('data-testid="po-drill-metric-why"');
ok('the strip lives INSIDE the loaded-document block', dataIdx > -1 && stripIdx > dataIdx);
ok('the ledger hands the pressed rule (unpressed stays absent)', ledger.includes("metric: metricLens === 'all' ? undefined : metricLens,"));
ok('the ledger\u2019s door keeps the row\u2019s own fields', ledger.includes('id: po.id,\n                        poNumber: po.poNumber,\n                        status: po.status,'));

console.log('— the drills\u2019 words, not a new rung —');
ok('the branch detail wears the esc chip', branch.includes('data-testid="po-detail-esc-hint"') && branch.includes('hidden items-center rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground sm:inline-flex'));
ok('NO second listener on the branch face', !branch.includes('useDrillEscape'));
ok('the detail\u2019s Escape is Radix\u2019s own (DialogContent present)', branch.includes('DialogContent'));

console.log('— the ancestors untouched —');
ok('the ear\u2019s home keeps both rungs', ear.includes('export function useLensEscape(pressed: boolean, onClear: () => void): void {') && ear.includes('export function useDrillEscape(onClose: () => void): void {'));
ok('the drills keep their rungs', orgDrill.includes('useDrillEscape(onClose);') && sheetDrill.includes('useDrillEscape(onClose);'));
ok('the drills keep their esc chips', orgDrill.includes('data-testid="po-drill-esc-hint"') && sheetDrill.includes('data-testid="sheet-drill-esc-hint"'));
ok('the birth strip keeps its own bytes', orgDrill.includes('data-testid="po-drill-birth-strip"') && orgDrill.includes('data-testid="po-drill-birth-door"'));
ok('the ledger keeps ONE ear + the combined press', (ledger.match(/useLensEscape\(/g) || []).length === 1 && ledger.includes("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {"));
ok('the ledger keeps its rails', ledger.includes('data-testid="po-ledger-band-row"') && ledger.includes('data-testid="po-ledger-metric-row"') && ledger.includes('data-testid="po-ledger-lens-empty"'));
ok('the branch keeps its own rail + door', branch.includes('data-testid="branch-po-metric-rail"') && branch.includes('data-testid="po-detail-birth-door"'));

console.log(`\nverify-v2-261-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('verify OK');
