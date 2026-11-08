#!/usr/bin/env node
// verify-v2-265-0.mjs — the round's gate (v2.265.0 "the console hears the
// release"). Every check reads the SOURCE OF RECORD (bytes, not memory)
// — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const dialog = read('src/components/whats-new-dialog.tsx');
const consolePage = read('src/app/(shell)/console/page.tsx');
const mainApp = read('src/components/app/main-app.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const memLib = read('src/lib/lens-memory.ts');
const links = read('src/lib/workspace/links.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');

console.log('— the release face —');
ok('pkg version = 2.265.0', pkg.version === '2.265.0');
ok('pkg releaseVersion = 2.265.0', pkg.mbumah?.releaseVersion === '2.265.0');
ok('pkg baseVersion = 2.265.0', pkg.mbumah?.baseVersion === '2.265.0');
ok('VERSION = 2.265.0', version === '2.265.0');
ok('whats-new lead = 2.265.0 with the round\u2019s title', feed.includes("version: '2.265.0',") && feed.includes('The console hears the release'));
const leadIdx = feed.indexOf("version: '2.265.0',");
const pairIdx = feed.indexOf("version: '2.264.0',");
ok('whats-new pair order (lead 2.265.0 before pair 2.264.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.265.0]', changelog.includes('## [2.265.0] The console hears the release'));

console.log('— the announcement\u2019s hand —');
ok('the optional hand in the shared signature', dialog.includes('export function WhatsNewDialog({ onOpenChangelog }: { onOpenChangelog?: () => void } = {}) {'));
ok('the archive button (address + title + dismiss-first)', dialog.includes('data-testid="whats-new-open-archive"') && dialog.includes('Open the release archive') && dialog.includes('{ dismiss(); onOpenChangelog(); }'));
ok('the SSR gate + the seen-flag law untouched', dialog.includes('const mounted = useSyncExternalStore(') && dialog.includes("localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);"));

console.log('— the console wears the voice —');
ok('the import + the mount + the hand', consolePage.includes("import { WhatsNewDialog } from '@/components/whats-new-dialog';") && consolePage.includes("import { APP_VERSION } from '@/lib/version';") && consolePage.includes('<WhatsNewDialog onOpenChangelog={() => { setReleaseJump(APP_VERSION); setChangelogOpen(true); }} />'));
{
  const loginIdx = consolePage.indexOf('<LoginDialog open={loginOpen}');
  const dialogIdx = consolePage.indexOf('<WhatsNewDialog onOpenChangelog=');
  const modalIdx = consolePage.indexOf('<ChangelogModal open={changelogOpen}');
  ok('the byte order: modal above login above the voice', loginIdx > -1 && dialogIdx > loginIdx && modalIdx > -1 && modalIdx < dialogIdx);
}
ok('the shell\u2019s own mount stays bare (one home)', mainApp.includes('<WhatsNewDialog />') && (mainApp.match(/<WhatsNewDialog/g) || []).length === 1);

console.log('— the ancestors untouched (v2.253.0\u2013v2.264.0) —');
ok('the door\u2019s carry law + builder + gate + loaded colour', memLib.includes('export function lensCarryFromParams(band: string | null, metric: string | null): LensCarry {') && links.includes('export function buildBranchPurchaseOrdersHref(') && ledger.includes('data-testid="po-ledger-branch-door"') && ledger.includes("branchId !== 'ALL' &&") && ledger.includes('metricFam ? metricFam.rail :'));
ok('the ledger\u2019s memory + rails (v2.253.0\u2013v2.263.0)', ledger.includes("readLensMemory('org-po-ledger')") && ledger.includes("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {") && (ledger.match(/useLensEscape\(/g) || []).length === 1 && ledger.includes('data-testid="po-ledger-metric-row"') && ledger.includes('data-testid="po-ledger-lens-remembered"'));
ok('the branch\u2019s landing + memory + answer', branch.includes("const carry = lensCarryFromParams(sp.get('band'), sp.get('metric'));") && branch.includes("if (sp.has('band') || sp.has('metric')) {") && branch.includes('if (mem && !carry.band && !carry.metric') && branch.includes("writeLensMemory('branch-po-roster', { band: bandLens, metric: metricLens });") && branch.includes('const firstWriteRef = useRef(true);') && branch.includes('data-testid="po-detail-metric-why"') && !branch.includes('useDrillEscape'));

console.log(`\nverify-v2-265-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('verify OK');
