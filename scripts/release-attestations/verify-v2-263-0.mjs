#!/usr/bin/env node
// ============================================================================
// verify-v2-263-0.mjs — the round's gate (v2.263.0 "the lens remembered").
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
const ledger = read('src/components/org/po-ledger.tsx');
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');
const orgDrill = read('src/components/org/po-drill.tsx');
const ear = read('src/lib/use-lens-escape.ts');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('pkg version = 2.263.0', pkg.version === '2.263.0');
ok('pkg releaseVersion = 2.263.0', pkg.mbumah?.releaseVersion === '2.263.0');
ok('pkg baseVersion = 2.263.0', pkg.mbumah?.baseVersion === '2.263.0');
ok('VERSION = 2.263.0', version === '2.263.0');
ok('whats-new lead = 2.263.0 with the round\u2019s title', feed.includes("version: '2.263.0',") && feed.includes("The lens remembered"));
const leadIdx = feed.indexOf("version: '2.263.0',");
const pairIdx = feed.indexOf("version: '2.262.0',");
ok('whats-new pair order (lead 2.263.0 before pair 2.262.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.263.0]', changelog.includes("## [2.263.0] The lens remembered"));

console.log('— the one home of view memory —');
ok('the shape + the guards', memLib.includes('export interface LensMemory {') && memLib.includes('export function readLensMemory(key: string): LensMemory | null {') && memLib.includes('export function writeLensMemory(key: string, memory: LensMemory): void {'));
ok('SSR-safe + shape-checked + quota-swallowing', memLib.includes("if (typeof window === 'undefined') return null;") && memLib.includes("if (typeof r.band !== 'string' || typeof r.metric !== 'string') return null;") && memLib.includes('window.sessionStorage.setItem(key, JSON.stringify(memory));'));
ok('the needle\u2019s law is written in the home', memLib.includes('THE NEEDLE NEVER RIDES'));

console.log('— the ledger remembers —');
ok('the one-home import + its own key', ledger.includes("import { readLensMemory, writeLensMemory } from '@/lib/lens-memory';") && ledger.includes("readLensMemory('org-po-ledger')") && ledger.includes("writeLensMemory('org-po-ledger', { band: bandLens, metric: metricLens });"));
ok('the membership law (only nameable values press)', ledger.includes("const BANDS = ['fresh', 'stale', 'beyond', 'never', 'silent'];") && ledger.includes("const METRICS = ['onTime', 'late', 'open'];"));
ok('the write deps carry the lenses only (never the needle)', ledger.includes('}, [bandLens, metricLens, remembered]);') && ledger.includes("const [needle, setNeedle] = useState('');"));
ok('the remembered chip speaks its honest title', ledger.includes('data-testid="po-ledger-lens-remembered"') && ledger.includes('your last lens returned with you') && ledger.includes('const firstWriteRef = useRef(true);'));

console.log('— the branch remembers —');
ok('its own key, the same home', branch.includes("readLensMemory('branch-po-roster')") && branch.includes("writeLensMemory('branch-po-roster', { band: bandLens, metric: metricLens });") && branch.includes("const BANDS = ['fresh', 'stale', 'beyond', 'never', 'silent'];") && branch.includes('const firstWriteRef = useRef(true);'));
ok('the remembered chip at the branch\u2019s own address', branch.includes('data-testid="branch-po-lens-remembered"') && branch.includes('your last lens returned with you'));

console.log('— the ancestors untouched —');
ok('the ledger\u2019s ear + rails + hand (v2.256.0\u2013v2.261.0)', ledger.includes("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {") && (ledger.match(/useLensEscape\(/g) || []).length === 1 && ledger.includes('data-testid="po-ledger-metric-row"') && ledger.includes('data-testid="po-ledger-band-row"') && ledger.includes("metric: metricLens === 'all' ? undefined : metricLens,"));
ok('the branch\u2019s ear + rail + answer + chip (v2.259.0\u2013v2.262.0)', branch.includes("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {") && (branch.match(/useLensEscape\(/g) || []).length === 1 && branch.includes('data-testid="branch-po-metric-rail"') && branch.includes('data-testid="po-detail-metric-why"') && branch.includes('data-testid="po-detail-esc-hint"') && !branch.includes('useDrillEscape'));
ok('the drill keeps its why-strip + rung', orgDrill.includes('data-testid="po-drill-metric-why"') && orgDrill.includes('useDrillEscape(onClose);'));
ok('the ear\u2019s home keeps both rungs', ear.includes('export function useLensEscape(pressed: boolean, onClear: () => void): void {') && ear.includes('export function useDrillEscape(onClose: () => void): void {'));

console.log(`\nverify-v2-263-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('verify OK');
