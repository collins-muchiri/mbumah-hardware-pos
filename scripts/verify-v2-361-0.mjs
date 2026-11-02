#!/usr/bin/env node
// verify-v2-361-0.mjs — the round's FEATURE gate (v2.361.0 "the credit
// ledger answers the address bar"). The release MECHANICS live in
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

const DESK = read('src/app/(shell)/tabs/credits-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/cr-type-deep-link-v2361.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the fourteenth word —');
ok('THE WORD BLOCK speaks its law (membership, one home, collision-checked)',
  DESK.includes("export const CR_TYPE_FILTERS = ['all', 'CREDIT', 'DEBIT', 'ADJUSTMENT', 'REFUND'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'cr-type', CR_TYPE_FILTERS, 'all')")
  && DESK.includes("THE CREDITS DESK'S OWN WORD")
  && DESK.includes('Collision-checked at round start'));
ok('THE HOME CARRIES THE FOURTEENTH-WORD NOTE',
  HOME.includes('v2.361.0 — THE PROMISE KEPT, THE FOURTEENTH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('const [creditTypeFilter, setCreditTypeFilter] = useState<(typeof CR_TYPE_FILTERS)[number]>(initialCrType);')
  && DESK.includes('function initialCrType(): (typeof CR_TYPE_FILTERS)[number]')
  && !DESK.includes('initialCrType() as'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedCrType] = useState<(typeof CR_TYPE_FILTERS)[number]>(initialCrType);')
  && DESK.includes('const [crLandingLive, setCrLandingLive] = useState(true);'));
ok('THE NEUTRAL IS LOWERCASE (the desk\u2019s own all-lens spelling)',
  DESK.includes("if (typeof window === 'undefined') return 'all';")
  && DESK.includes("['all', 'CREDIT', 'DEBIT', 'ADJUSTMENT', 'REFUND']"));
ok('THE WORD BINDS TO THE TYPE LENS ONLY (the customer Select untouched)',
  DESK.includes('onValueChange={setSelectedCustomerId}')
  && !DESK.includes('chooseCustomerType'));
ok('THE QUERY RIDES THE LENS (key + params, the list filters, not just the face)',
  DESK.includes("queryKey: ['customer-credits', currentStoreId, selectedCustomerId, creditTypeFilter],")
  && DESK.includes("creditType: creditTypeFilter !== 'all' ? creditTypeFilter : undefined,"));

console.log('— the fourteenth wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("crLandingLive && landedCrType !== 'all' && creditTypeFilter === landedCrType")
  && DESK.includes('data-testid="cr-type-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?cr-type={landedCrType}'));
ok('THE CHIP WEARS THE FOURTEENTH FAMILY (yellow) IN BOTH MODES',
  DESK.includes('border-yellow-200 bg-yellow-50 text-yellow-700')
  && DESK.includes('dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300'));
ok('THE CHIP LIVES IN THE ALWAYS-RENDERED FILTERS ROW (before the type Select)',
  DESK.indexOf('data-testid="cr-type-landing-word"') > -1
  && DESK.indexOf('<Select value={creditTypeFilter} onValueChange={chooseCrType}>') > DESK.indexOf('data-testid="cr-type-landing-word"'));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE TWO VOICES ARE HONEST (dismissal + hand-driven Select)',
  DESK.includes("setCreditTypeFilter('all');\n                  setCrLandingLive(false);")
  && DESK.includes('<Select value={creditTypeFilter} onValueChange={chooseCrType}>')
  && DESK.includes("hand-driven Select change or the chip's own dismissal"));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The desk landed with this filter from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));
ok('THE COLLISION NOTE NAMES NO FOREIGN WORD (the prose-collision shadow, applied)',
  !DESK.includes("'gc-status'") && !DESK.includes("'dn-status'") && !DESK.includes("'transfer-status'"));
ok('THE DESK\u2019S OWN VOICES KEEP THEIR FAMILIES (no masquerade)',
  DESK.includes('bg-green-100 text-green-800')
  && DESK.includes('bg-red-100 text-red-800')
  && DESK.includes('bg-amber-100 text-amber-800')
  && DESK.includes('bg-blue-100 text-blue-800'));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + the lowercase-neutral inversion + ledger',
  TEST.includes("parseInitialNamedMember('?cr-type=DEBIT', 'cr-type', CR_TYPE_FILTERS, 'all')").valueOf() === true
  && TEST.includes("parseInitialNamedMember('?cr-type=ALL', 'cr-type', CR_TYPE_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?tab=credits&cr-type=DEBIT&vc-status=ACTIVE', 'cr-type', CR_TYPE_FILTERS, 'all')")
  && TEST.includes("'src/tests/cr-type-deep-link-v2361.test.ts',"));
ok('THE THIRTEEN NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
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
  ].every((f) => read(f).includes("'src/tests/cr-type-deep-link-v2361.test.ts',")));
ok('THE CONSTITUTION\u2019S FOURTEENTH ROW LANDED (registry + title + promise roll)',
  read('src/tests/transfer-status-deep-link-v2357.test.ts').includes("{ word: 'cr-type', desk: 'src/app/(shell)/tabs/credits-tab.tsx', family: 'border-yellow-200', suite: 'src/tests/cr-type-deep-link-v2361.test.ts' }")
  && read('src/tests/transfer-status-deep-link-v2357.test.ts').includes('(fourteen words, twelve desks)')
  && read('src/tests/transfer-status-deep-link-v2357.test.ts').includes("'FOURTEENTH'"));
ok('THE ELDERS\u2019 TITLE PINS RODE THE TREADMILL (the living-line re-anchor)',
  read('src/tests/dn-status-deep-link-v2359.test.ts').includes('(fourteen words, twelve desks)')
  && read('src/tests/gc-status-deep-link-v2358.test.ts').includes('(fourteen words, twelve desks)')
  && read('src/tests/vc-status-deep-link-v2360.test.ts').includes('(fourteen words, twelve desks)'));
ok('THE THIRTEENTH WORD SURVIVED UNTOUCHED',
  read('src/app/(shell)/tabs/vouchers-tab.tsx').includes("export const VC_STATUS_FILTERS = ['all', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED'] as const;"));

console.log('— the face + the release —');
ok('WHATS-NEW 2.361.0 leads the feed', whatsNew.includes("version: '2.361.0',") && whatsNew.indexOf("'2.361.0'") < whatsNew.indexOf("'2.360.0'"));
ok('CHANGELOG 2.361.0 leads', changelog.startsWith('## [2.361.0]'));
ok('VERSION + package.json say 2.361.0 (three slots)', version === '2.361.0' && pkg.version === '2.361.0' && pkg.mbumah.releaseVersion === '2.361.0' && pkg.mbumah.baseVersion === '2.361.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-361-0']));

console.log('— walk-dependent pins (green after walk-v2361) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (251/252/253/284)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(251)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(252)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(253)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(284)"));
ok('THE HISTORY LINE rode the cascade block (the English compound, not the word)', changelogTest.includes('v2.361.0: the credit-type entry joins the feed')
  && !changelogTest.includes('cr-type'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
