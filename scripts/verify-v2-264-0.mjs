#!/usr/bin/env node
// ============================================================================
// verify-v2-264-0.mjs — the round's gate (v2.264.0 "the door downstairs").
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
const memLib = read('src/lib/lens-memory.ts');
const links = read('src/lib/workspace/links.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const orgDrill = read('src/components/org/po-drill.tsx');
const ear = read('src/lib/use-lens-escape.ts');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('pkg version = 2.264.0', pkg.version === '2.264.0');
ok('pkg releaseVersion = 2.264.0', pkg.mbumah?.releaseVersion === '2.264.0');
ok('pkg baseVersion = 2.264.0', pkg.mbumah?.baseVersion === '2.264.0');
ok('VERSION = 2.264.0', version === '2.264.0');
ok('whats-new lead = 2.264.0 with the round\u2019s title', feed.includes("version: '2.264.0',") && feed.includes('The door downstairs'));
const leadIdx = feed.indexOf("version: '2.264.0',");
const pairIdx = feed.indexOf("version: '2.263.0',");
ok('whats-new pair order (lead 2.264.0 before pair 2.263.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.264.0]', changelog.includes('## [2.264.0] The door downstairs'));

console.log('— the carry law (the one home) —');
ok('the shape + the families', memLib.includes('export interface LensCarry {') && memLib.includes('export function lensCarryFromParams(band: string | null, metric: string | null): LensCarry {') && memLib.includes("const CARRY_BANDS: ReadonlyArray<string> = ['fresh', 'stale', 'beyond', 'never', 'silent'];") && memLib.includes("const CARRY_METRICS: ReadonlyArray<string> = ['onTime', 'late', 'open'];"));
ok('the carry\u2019s law is written in the home', memLib.includes("THE LENS'S CARRY") && memLib.includes('THE NEEDLE NEVER RIDES'));
ok('the memory\u2019s own law untouched beneath the growth', memLib.includes('export function readLensMemory(key: string): LensMemory | null {') && memLib.includes('export function writeLensMemory(key: string, memory: LensMemory): void {') && memLib.includes('window.sessionStorage.setItem(key, JSON.stringify(memory));'));

console.log('— the door\u2019s address (the builder) —');
ok('the one home, path-forced, the pressed lenses as params', links.includes('export function buildBranchPurchaseOrdersHref(') && links.includes("buildStoreWorkspaceUrl(store, { page: '/purchase-orders', forcePath: true })") && links.includes("if (lens?.band && lens.band !== 'ALL') params.set('band', lens.band);") && links.includes("if (lens?.metric && lens.metric !== 'all') params.set('metric', lens.metric);"));
ok('the honest absence written where the reader reads', links.includes('THE DOOR DOWNSTAIRS'));

console.log('— the door itself (the org ledger) —');
ok('the testid + the named-branch gate + the new-tab law', ledger.includes('data-testid="po-ledger-branch-door"') && ledger.includes("branchId !== 'ALL' &&") && ledger.includes("'_blank',") && ledger.includes("'noopener',"));
ok('the one-home import + the carry at the call', ledger.includes("import { buildBranchPurchaseOrdersHref } from '@/lib/workspace/links';") && ledger.includes('{ id: branch.id, slug: branch.slug, subdomain: branch.subdomain },') && ledger.includes('{ band: bandLens, metric: metricLens },'));
ok('the honest words + the loaded door\u2019s colour', ledger.includes('the branch keeps the only pens') && ledger.includes('the pressed lenses ride along') && ledger.includes('metricFam ? metricFam.rail :') && ledger.includes('bandHouse(bandLens as CadenceBand).rail'));

console.log('— the door\u2019s landing (the branch face) —');
ok('the carry law read at the one home (additive import line)', branch.includes("import { lensCarryFromParams } from '@/lib/lens-memory';") && branch.includes("const carry = lensCarryFromParams(sp.get('band'), sp.get('metric'));"));
ok('the one-time strip + the precedence', branch.includes("if (sp.has('band') || sp.has('metric')) {") && branch.includes('if (carry.band) setBandLens(carry.band);') && branch.includes('if (carry.metric) setMetricLens(carry.metric);'));
ok('the chip stays the memory\u2019s voice', branch.includes('if (mem && !carry.band && !carry.metric'));
{
  const carryIdx = branch.indexOf('const carry = lensCarryFromParams(');
  const readIdx = branch.indexOf("const mem = readLensMemory('branch-po-roster');");
  const writeIdx = branch.indexOf("writeLensMemory('branch-po-roster'");
  ok('the byte order: the door above the memory above the write', carryIdx > -1 && readIdx > carryIdx && writeIdx > readIdx);
}

console.log('— the ancestors untouched —');
ok('the ledger\u2019s memory + ear + rails (v2.253.0\u2013v2.263.0)', ledger.includes("readLensMemory('org-po-ledger')") && ledger.includes("writeLensMemory('org-po-ledger', { band: bandLens, metric: metricLens });") && ledger.includes("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {") && (ledger.match(/useLensEscape\(/g) || []).length === 1 && ledger.includes('data-testid="po-ledger-metric-row"') && ledger.includes('data-testid="po-ledger-band-row"') && ledger.includes('data-testid="po-ledger-branch-select"') && ledger.includes('data-testid="po-ledger-lens-remembered"') && ledger.includes("metric: metricLens === 'all' ? undefined : metricLens,"));
ok('the branch\u2019s memory + ear + answer (v2.259.0\u2013v2.263.0)', branch.includes("import { readLensMemory, writeLensMemory } from '@/lib/lens-memory';") && branch.includes("const BANDS = ['fresh', 'stale', 'beyond', 'never', 'silent'];") && branch.includes('}, [bandLens, metricLens, remembered]);') && branch.includes('const firstWriteRef = useRef(true);') && branch.includes("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {") && (branch.match(/useLensEscape\(/g) || []).length === 1 && branch.includes('data-testid="branch-po-metric-rail"') && branch.includes('data-testid="po-detail-metric-why"') && branch.includes('data-testid="po-detail-esc-hint"') && !branch.includes('useDrillEscape'));
ok('the drill keeps its why-strip + rung', orgDrill.includes('data-testid="po-drill-metric-why"') && orgDrill.includes('useDrillEscape(onClose);'));
ok('the ear\u2019s home keeps both rungs', ear.includes('export function useLensEscape(pressed: boolean, onClear: () => void): void {') && ear.includes('export function useDrillEscape(onClose: () => void): void {'));

console.log(`\nverify-v2-264-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('verify OK');
