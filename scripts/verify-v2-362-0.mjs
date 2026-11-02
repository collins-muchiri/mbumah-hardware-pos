#!/usr/bin/env node
// verify-v2-362-0.mjs — the round's FEATURE gate (v2.362.0 "the workforce's
// standing answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// THE OD LAW: bytes, not memory. Run BEFORE the walk; the walk-dependent
// pins sit in the tail section.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/payroll-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/pr-status-deep-link-v2362.test.ts');
const CONSTITUTION = read('src/tests/transfer-status-deep-link-v2357.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the fifteenth word —');
ok('THE WORD BLOCK speaks its law (membership, one home, collision-checked, the amendment)',
  DESK.includes("export const PR_STATUS_FILTERS = ['ALL', 'ACTIVE', 'ON_LEAVE', 'TERMINATED'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'pr-status', PR_STATUS_FILTERS, 'ALL')")
  && DESK.includes("THE PAYROLL DESK'S OWN WORD")
  && DESK.includes('Collision-checked at round start')
  && DESK.includes('THE DEFAULT-SUB-TAB AMENDMENT'));
ok('THE HOME CARRIES THE FIFTEENTH-WORD NOTE',
  HOME.includes('v2.362.0 — THE PROMISE KEPT, THE FIFTEENTH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('const [statusFilter, setStatusFilter] = useState<(typeof PR_STATUS_FILTERS)[number]>(initialPrStatus);')
  && DESK.includes('function initialPrStatus(): (typeof PR_STATUS_FILTERS)[number]')
  && !DESK.includes('initialPrStatus() as'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedPrStatus] = useState<(typeof PR_STATUS_FILTERS)[number]>(initialPrStatus);')
  && DESK.includes('const [prLandingLive, setPrLandingLive] = useState(true);'));
ok('THE NEUTRAL IS CAPITALIZED (the desk\u2019s own all-lens spelling)',
  DESK.includes("if (typeof window === 'undefined') return 'ALL';")
  && DESK.includes("['ALL', 'ACTIVE', 'ON_LEAVE', 'TERMINATED']"));
ok('THE WORD BINDS TO THE ROSTER LENS ONLY (the leave sub-tab untouched)',
  DESK.match(/onValueChange=\{setStatusFilter\}/g)?.length === 1
  && DESK.includes('const choosePrStatus = (value: (typeof PR_STATUS_FILTERS)[number]) => {'));
ok('THE AMENDMENT IS PINNED FROM THE MOUNTING BYTES (the default sub-tab)',
  DESK.includes("const [subTab, setSubTab] = useState<SubTab>('employees');")
  && DESK.includes("{subTab === 'employees' && <EmployeesSubTab storeId={currentStoreId} />}"));

console.log('— the fifteenth wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("prLandingLive && landedPrStatus !== 'ALL' && statusFilter === landedPrStatus")
  && DESK.includes('data-testid="pr-status-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?pr-status={landedPrStatus}'));
ok('THE CHIP WEARS THE FIFTEENTH FAMILY (stone) IN BOTH MODES',
  DESK.includes('border-stone-200 bg-stone-50 text-stone-700')
  && DESK.includes('dark:border-stone-500/30 dark:bg-stone-500/10 dark:text-stone-300'));
ok('THE CHIP LIVES BEFORE THE ROSTER SELECT (the position law)',
  DESK.indexOf('data-testid="pr-status-landing-word"') > -1
  && DESK.indexOf('<Select value={statusFilter} onValueChange={choosePrStatus}>') > DESK.indexOf('data-testid="pr-status-landing-word"'));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE TWO VOICES ARE HONEST (dismissal + hand-driven Select)',
  DESK.includes("setStatusFilter('ALL');\n                  setPrLandingLive(false);")
  && DESK.includes('<Select value={statusFilter} onValueChange={choosePrStatus}>')
  && DESK.includes("hand-driven Select change or the chip's own dismissal"));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The desk landed with this filter from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));
ok('THE COLLISION NOTE NAMES NO FOREIGN WORD (the prose-collision shadow, applied)',
  !DESK.includes("'gc-status'") && !DESK.includes("'dn-status'") && !DESK.includes("'transfer-status'") && !DESK.includes("'cr-type'"));
ok('THE DESK\u2019S OWN VOICES KEEP THEIR FAMILIES (no masquerade)',
  DESK.includes("ACTIVE: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900'")
  && DESK.includes("TERMINATED: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900'")
  && DESK.includes("ON_LEAVE: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'"));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + the capitalized-neutral inversion + ledger',
  TEST.includes("parseInitialNamedMember('?pr-status=ACTIVE', 'pr-status', PR_STATUS_FILTERS, 'ALL')")
  && TEST.includes("parseInitialNamedMember('?pr-status=all', 'pr-status', PR_STATUS_FILTERS, 'ALL')).toBe('ALL')")
  && TEST.includes("parseInitialNamedMember('?tab=payroll&pr-status=ACTIVE&txn-type=refund', 'pr-status', PR_STATUS_FILTERS, 'ALL')")
  && TEST.includes("'src/tests/pr-status-deep-link-v2362.test.ts',"));
ok('THE FOURTEEN NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
    'src/tests/proxy-gate-layering-v2328.test.ts',
    'src/tests/inv-stock-deep-link-v2329.test.ts',
    'src/tests/cust-debt-deep-link-v2330.test.ts',
    'src/tests/sup-status-deep-link-v2331.test.ts',
    'src/tests/sup-po-deep-link-v2332.test.ts',
    'src/tests/txn-pay-deep-link-v2333.test.ts',
    'src/tests/txn-type-deep-link-v2354.test.ts',
    'src/tests/rent-status-deep-link-v2355.test.ts',
    'src/tests/inv-status-deep-link-v2356.test.ts',
    'src/tests/transfer-status-deep-link-v2357.test.ts',
    'src/tests/gc-status-deep-link-v2358.test.ts',
    'src/tests/dn-status-deep-link-v2359.test.ts',
    'src/tests/vc-status-deep-link-v2360.test.ts',
    'src/tests/cr-type-deep-link-v2361.test.ts',
  ].every((f) => read(f).includes("'src/tests/pr-status-deep-link-v2362.test.ts',")));
ok('THE CONSTITUTION\u2019S FIFTEENTH ROW LANDED (registry + title + promise roll)',
  CONSTITUTION.includes("{ word: 'pr-status', desk: 'src/app/(shell)/tabs/payroll-tab.tsx', family: 'border-stone-200', suite: 'src/tests/pr-status-deep-link-v2362.test.ts' }")
  && CONSTITUTION.includes('(fifteen words, thirteen desks)')
  && CONSTITUTION.includes("'FIFTEENTH'"));
ok('THE ELDERS\u2019 TITLE PINS RODE THE TREADMILL (the living-line re-anchor)',
  read('src/tests/gc-status-deep-link-v2358.test.ts').includes('(fifteen words, thirteen desks)')
  && read('src/tests/dn-status-deep-link-v2359.test.ts').includes('(fifteen words, thirteen desks)')
  && read('src/tests/vc-status-deep-link-v2360.test.ts').includes('(fifteen words, thirteen desks)')
  && read('src/tests/cr-type-deep-link-v2361.test.ts').includes('(fifteen words, thirteen desks)'));
ok('THE FOURTEENTH WORD SURVIVED UNTOUCHED',
  read('src/app/(shell)/tabs/credits-tab.tsx').includes("export const CR_TYPE_FILTERS = ['all', 'CREDIT', 'DEBIT', 'ADJUSTMENT', 'REFUND'] as const;"));

console.log('— the face + the release —');
ok('WHATS-NEW 2.362.0 leads the feed', whatsNew.includes("version: '2.362.0',") && whatsNew.indexOf("'2.362.0'") < whatsNew.indexOf("'2.361.0'"));
ok('CHANGELOG 2.362.0 leads', changelog.startsWith('## [2.362.0]'));
ok('VERSION + package.json say 2.362.0 (three slots)', version === '2.362.0' && pkg.version === '2.362.0' && pkg.mbumah.releaseVersion === '2.362.0' && pkg.mbumah.baseVersion === '2.362.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-362-0']));

console.log('— walk-dependent pins (green after walk-v2362) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (252/253/254/285)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(252)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(253)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(254)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(285)"));
ok('THE HISTORY LINE rode the cascade block (the English compound, not the word)', changelogTest.includes('v2.362.0: the payroll entry joins the feed')
  && !changelogTest.includes('pr-status'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
