#!/usr/bin/env node
// verify-v2-266-0.mjs — the round's gate (v2.266.0 "the desk hears the
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
const orgConsole = read('src/components/workspace/org-console.tsx');
const consolePage = read('src/app/(shell)/console/page.tsx');
const mainApp = read('src/components/app/main-app.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const chrome = read('src/components/org/chrome.tsx');
const memLib = read('src/lib/lens-memory.ts');
const links = read('src/lib/workspace/links.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');

console.log('— the release face —');
ok('pkg version = 2.266.0', pkg.version === '2.266.0');
ok('pkg releaseVersion = 2.266.0', pkg.mbumah?.releaseVersion === '2.266.0');
ok('pkg baseVersion = 2.266.0', pkg.mbumah?.baseVersion === '2.266.0');
ok('VERSION = 2.266.0', version === '2.266.0');
ok('whats-new lead = 2.266.0 with the round\u2019s title', feed.includes("version: '2.266.0',") && feed.includes('The desk hears the release'));
const leadIdx = feed.indexOf("version: '2.266.0',");
const pairIdx = feed.indexOf("version: '2.265.0',");
ok('whats-new pair order (lead 2.266.0 before pair 2.265.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.266.0]', changelog.includes('## [2.266.0] The desk hears the release'));

console.log('— the desk wears the voice —');
ok('the imports (shared modal + shared voice + the version)', orgConsole.includes("import { ChangelogModal } from '@/components/org/chrome';") && orgConsole.includes("import { WhatsNewDialog } from '@/components/whats-new-dialog';") && orgConsole.includes("import { APP_VERSION } from '@/lib/version';"));
ok('the archive state (flag + jump)', orgConsole.includes('const [changelogOpen, setChangelogOpen] = useState(false);') && orgConsole.includes('const [releaseJump, setReleaseJump] = useState<string | null>(null);'));
ok('the hook-order law (state before every early return)', (() => {
  const stateIdx = orgConsole.indexOf('const [releaseJump, setReleaseJump]');
  const probes = ["if (phase === 'denied') {", "if (phase === 'error') {", "if (phase === 'loading' || !summary) {"];
  return probes.every((p) => {
    const i = orgConsole.indexOf(p);
    return i > -1 && i > stateIdx;
  });
})());
ok('the shared announcement + the hand', orgConsole.includes('<WhatsNewDialog onOpenChangelog={() => { setReleaseJump(APP_VERSION); setChangelogOpen(true); }} />'));
ok('the shared archive modal (jump + reset laws)', orgConsole.includes('<ChangelogModal') && orgConsole.includes('jumpTo={releaseJump}') && orgConsole.includes('onOpenChange={(o) => { setChangelogOpen(o); if (!o) setReleaseJump(null); }}'));
ok('the header\u2019s door (testid + title + no-jump open)', orgConsole.includes('data-testid="org-desk-changelog-button"') && orgConsole.includes("title=\"the release archive \u2014 every version's notes\"") && orgConsole.includes('onClick={() => { setReleaseJump(null); setChangelogOpen(true); }}'));
{
  const modalIdx = orgConsole.indexOf('<ChangelogModal');
  const voiceIdx = orgConsole.indexOf('<WhatsNewDialog onOpenChangelog=');
  const shellCloseIdx = orgConsole.indexOf('</UnifiedConsoleShell>');
  const doorIdx = orgConsole.indexOf('data-testid="org-desk-changelog-button"');
  const chatIdx = orgConsole.indexOf('<Link href="/chat">');
  ok('the byte order: door above chat; modal above the voice above shell close', modalIdx > -1 && voiceIdx > modalIdx && shellCloseIdx > voiceIdx && doorIdx > -1 && chatIdx > doorIdx);
  ok('one home per face (one announcement, one archive on the desk)', (orgConsole.match(/<WhatsNewDialog/g) || []).length === 1 && (orgConsole.match(/<ChangelogModal/g) || []).length === 1);
}
ok('the shared modal is org/chrome\u2019s export', chrome.includes('export function ChangelogModal({ open, onOpenChange, jumpTo }: { open: boolean; onOpenChange: (o: boolean) => void; jumpTo?: string | null }) {'));

console.log('— the ancestors untouched (v2.253.0\u2013v2.265.0) —');
ok('the hand\u2019s v2.265.0 bytes in the shared dialog', dialog.includes('export function WhatsNewDialog({ onOpenChangelog }: { onOpenChangelog?: () => void } = {}) {') && dialog.includes('{ dismiss(); onOpenChangelog(); }') && dialog.includes('{onOpenChangelog ? (') && dialog.includes('const mounted = useSyncExternalStore('));
ok('the console\u2019s v2.265.0 voice unchanged', consolePage.includes('<WhatsNewDialog onOpenChangelog={() => { setReleaseJump(APP_VERSION); setChangelogOpen(true); }} />') && consolePage.includes('THE CONSOLE HEARS THE RELEASE') && consolePage.includes('<ChangelogModal open={changelogOpen}'));
ok('the shell\u2019s own mount stays bare (one home)', mainApp.includes('<WhatsNewDialog />') && (mainApp.match(/<WhatsNewDialog/g) || []).length === 1);
ok('the door\u2019s carry law + builder + gate + loaded colour (v2.264.0)', memLib.includes('export function lensCarryFromParams(band: string | null, metric: string | null): LensCarry {') && links.includes('export function buildBranchPurchaseOrdersHref(') && ledger.includes('data-testid="po-ledger-branch-door"') && ledger.includes("branchId !== 'ALL' &&") && ledger.includes('metricFam ? metricFam.rail :'));
ok('the ledger\u2019s memory + rails (v2.253.0\u2013v2.263.0)', ledger.includes("readLensMemory('org-po-ledger')") && ledger.includes("useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {") && (ledger.match(/useLensEscape\(/g) || []).length === 1 && ledger.includes('data-testid="po-ledger-metric-row"') && ledger.includes('data-testid="po-ledger-lens-remembered"'));
ok('the branch\u2019s landing + memory + answer (v2.261.0\u2013v2.264.0)', branch.includes("const carry = lensCarryFromParams(sp.get('band'), sp.get('metric'));") && branch.includes("if (sp.has('band') || sp.has('metric')) {") && branch.includes('if (mem && !carry.band && !carry.metric') && branch.includes("writeLensMemory('branch-po-roster', { band: bandLens, metric: metricLens });") && branch.includes('const firstWriteRef = useRef(true);') && branch.includes('data-testid="po-detail-metric-why"') && !branch.includes('useDrillEscape'));

console.log(`\nverify-v2-266-0: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
console.log('verify OK');
