#!/usr/bin/env node
// verify-v2-381-0.mjs — the round's FEATURE gate (v2.381.0 "the taxman's
// desk answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round: the
// desk's word (the ONE-home seed, the UPPERCASE vocabulary, the cast-free
// typing), the read-once-and-lent-down landing (the remount law), the
// two-address stage seed, the red wearing (both modes + the honesty
// bounds), the lens-aware empty voice, the typed chooser, and the
// constitution's twenty-second row.
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/etims-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const SUITE = read('src/tests/et-status-deep-link-v2381.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const STRESS = read('src/tests/family-registry-stress-v2370.test.ts');
const FEED = read('src/lib/whats-new.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the home —');
ok('THE LAW DOC CARRIES THE TWENTY-SECOND WORD',
  HOME.includes('v2.381.0 — THE PROMISE KEPT, THE TWENTY-SECOND WORD')
  && HOME.includes('`et-status`'));
ok('THE PARSERS STAND (the one home, zero new bytes of law)',
  HOME.includes('export function parseInitialNamedMember')
  && HOME.includes('export function parseInitialStage'));

console.log('— the desk —');
ok('THE ONE-HOME SEED (never a local parser)',
  DESK.includes("parseInitialNamedMember(window.location.search, 'et-status', ET_STATUS_FILTERS, 'all')"));
ok('THE UPPERCASE VOCABULARY IS THE DESK\u2019S OWN',
  DESK.includes("export const ET_STATUS_FILTERS = ['all', 'PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'FAILED'] as const;"));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('function initialEtStatus(): EtStatusFilter {')
  && !DESK.includes('initialEtStatus() as')
  && !DESK.includes('initialEtStatus as unknown'));
ok('THE LANDING IS READ ONCE AND LENT DOWN (the remount law)',
  DESK.includes('const [landedEtStatus] = useState<EtStatusFilter>(initialEtStatus);')
  && DESK.includes('const [etLandingLive, setEtLandingLive] = useState(true);')
  && DESK.includes('landedStatus={landedEtStatus}')
  && DESK.includes('landingLive={etLandingLive}')
  && DESK.includes('onLandRetire={() => setEtLandingLive(false)}')
  && DESK.includes('const [statusFilter, setStatusFilter] = useState<EtStatusFilter>(landedStatus);'));
ok('THE TWO-ADDRESS STAGE SEED',
  DESK.includes("parseInitialStage(window.location.search, ET_SUB_TABS, 'invoices', landed, 'profile')"));
ok('THE WORD FILTERS THE LEDGER (the query feed)',
  DESK.includes("status: statusFilter !== 'all' ? statusFilter : undefined,"));
ok('THE TYPED CHOOSER IS THE SELECT\u2019S ONE VOICE',
  (DESK.match(/onValueChange=\{chooseEtStatus\}/g) || []).length === 1
  && !DESK.includes('onValueChange={(v) => { setStatusFilter(v); setPage(1); }}'));

console.log('— the chip —');
ok('THE RED WEARING IN BOTH MODES (the twenty-second family)',
  DESK.includes('border-red-200 bg-red-50 text-red-700')
  && DESK.includes('dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'));
ok('THE DANGER VOICE IS THE CHIP\u2019S ALONE (the honesty bounds)',
  DESK.includes('bg-rose-100 text-rose-700')
  && DESK.includes('bg-amber-100 text-amber-700')
  && !DESK.includes('dark:bg-red-900/30')
  && !DESK.includes('bg-red-100 text-red-700'));
ok('THE CHIP NAMES THE WORD AND SITS BEFORE THE SELECT',
  DESK.includes('landed ?et-status={landedStatus}')
  && DESK.includes('data-testid="et-status-landing-word"')
  && DESK.indexOf('data-testid="et-status-landing-word"') < DESK.indexOf('<Select value={statusFilter} onValueChange={chooseEtStatus}>'));

console.log('— the styling detail —');
ok('THE LENS-AWARE EMPTY VOICE (names the lens, offers the hand)',
  DESK.includes('data-testid="et-status-empty-lens"')
  && DESK.includes('No <span className="font-medium text-foreground">{statusFilter}</span> invoices in this lens yet.')
  && DESK.includes('Clear the status lens'));
ok('THE LENSED ANSWER PRECEDES THE GENERIC EMPTY',
  DESK.indexOf('data-testid="et-status-empty-lens"') < DESK.indexOf('No KRA invoices found.'));

console.log('— the registry —');
ok('THE CONSTITUTION WALKS TWENTY-TWO ROWS',
  CONSTITUTION.includes('(twenty-two words, twenty desks)')
  && CONSTITUTION.includes("{ word: 'et-status', desk: 'src/app/(shell)/tabs/etims-tab.tsx', family: 'border-red-200', suite: 'src/tests/et-status-deep-link-v2381.test.ts' }")
  && CONSTITUTION.includes("'TWENTY-SECOND'"));
ok('THE STRESS DERIVES THE NEW ARITHMETIC',
  STRESS.includes('expect(rows.length).toBe(22);')
  && STRESS.includes("'ly-type', 'et-status',")
  && STRESS.includes('.toBe(20);')
  && STRESS.includes('.toBe(22);'));
ok('THE FEED CARRIES THE ROUND',
  FEED.includes("version: '2.381.0',")
  && FEED.includes('?et-status='));

console.log('— the suites —');
ok('THE ROUND\u2019S SUITE EXISTS AND SPEAKS THE ROUND',
  SUITE.includes("THE ETIMS DESK'S OWN WORD (v2.381.0)"));

console.log('— the release slots —');
ok('pkg version = VERSION', pkg.version === version);
ok('VERSION SPEAKS THE ROUND', version === '2.381.0');
ok('THE VERIFY WIRE IS LAID', Boolean(pkg.scripts['verify:v2-381-0']));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
