#!/usr/bin/env node
// verify-v2-355-0.mjs — the round's FEATURE gate (v2.355.0 "the rental desk
// answers its daily question"). The release MECHANICS live in verify-current.mjs.
// This script pins only what is NEW this round. THE OD LAW: bytes, not memory.
// Run BEFORE the walk; the walk-dependent pins sit in the tail section.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/rentals-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/rent-status-deep-link-v2355.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the eighth word —');
ok('THE WORD BLOCK speaks its law (membership, one home, collision-checked)',
  DESK.includes("export const RENT_STATUS_FILTERS = ['all', 'ACTIVE', 'OVERDUE', 'RETURNED', 'DAMAGED'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'rent-status', RENT_STATUS_FILTERS, 'all')")
  && DESK.includes("THE RENTAL DESK'S OWN WORD")
  && DESK.includes('Collision-checked at round start'));
ok('THE HOME CARRIES THE EIGHTH-WORD NOTE',
  HOME.includes('v2.355.0 — THE PROMISE KEPT, THE EIGHTH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('const [statusFilter, setStatusFilter] = useState<(typeof RENT_STATUS_FILTERS)[number]>(initialRentStatus);')
  && DESK.includes('function initialRentStatus(): (typeof RENT_STATUS_FILTERS)[number]')
  && !DESK.includes('initialRentStatus() as'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedRentStatus] = useState<(typeof RENT_STATUS_FILTERS)[number]>(initialRentStatus);')
  && DESK.includes('const [rentLandingLive, setRentLandingLive] = useState(true);'));

console.log('— the eighth wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("rentLandingLive && landedRentStatus !== 'all' && statusFilter === landedRentStatus")
  && DESK.includes('data-testid="rent-status-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?rent-status={landedRentStatus}'));
ok('THE CHIP WEARS THE EIGHTH FAMILY (orange) IN BOTH MODES',
  DESK.includes('border-orange-200 bg-orange-50 text-orange-700')
  && DESK.includes('dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300'));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE TWO VOICES ARE HONEST (dismissal + hand-driven Select)',
  DESK.includes("setStatusFilter('all');\n                  setRentLandingLive(false);")
  && DESK.includes('<Select value={statusFilter} onValueChange={chooseRentStatus}>')
  && DESK.includes("hand-driven Select change or the chip's own dismissal"));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The desk landed with this filter from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + ledger',
  TEST.includes("parseInitialNamedMember('?rent-status=OVERDUE', 'rent-status', RENT_STATUS_FILTERS, 'all')").valueOf() === true
  && TEST.includes("parseInitialNamedMember('?rent-status=overdue', 'rent-status', RENT_STATUS_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?tab=rentals&rent-status=OVERDUE&txn-pay=CASH', 'rent-status', RENT_STATUS_FILTERS, 'all')")
  && TEST.includes("'src/tests/rent-status-deep-link-v2355.test.ts',"));
ok('THE SEVEN NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
    'src/tests/proxy-gate-layering-v2328.test.ts',
    'src/tests/inv-stock-deep-link-v2329.test.ts',
    'src/tests/cust-debt-deep-link-v2330.test.ts',
    'src/tests/sup-status-deep-link-v2331.test.ts',
    'src/tests/sup-po-deep-link-v2332.test.ts',
    'src/tests/txn-pay-deep-link-v2333.test.ts',
    'src/tests/txn-type-deep-link-v2354.test.ts',
  ].every((f) => read(f).includes("'src/tests/rent-status-deep-link-v2355.test.ts',")));
ok('THE PAYMENT AND TYPE WORDS SURVIVED UNTOUCHED (the sixth and seventh words still speak)',
  read('src/app/(shell)/tabs/transactions-tab.tsx').includes("export const TXN_TYPE_FILTERS = ['all', 'sale', 'refund', 'void'] as const;")
  && read('src/app/(shell)/tabs/transactions-tab.tsx').includes("export const TXN_PAY_FILTERS = ['all', 'CASH', 'MPESA', 'DEBT'] as const;"));

console.log('— the face + the release —');
ok('WHATS-NEW 2.355.0 leads the feed', whatsNew.includes("version: '2.355.0',") && whatsNew.indexOf("'2.355.0'") < whatsNew.indexOf("'2.354.0'"));
ok('CHANGELOG 2.355.0 leads', changelog.startsWith('## [2.355.0]'));
ok('VERSION + package.json say 2.355.0 (three slots)', version === '2.355.0' && pkg.version === '2.355.0' && pkg.mbumah.releaseVersion === '2.355.0' && pkg.mbumah.baseVersion === '2.355.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-355-0']));

console.log('— walk-dependent pins (green after walk-v2355) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (245/246/247/278)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(245)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(246)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(247)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(278)"));
ok('THE HISTORY LINE rode the cascade block', changelogTest.includes('v2.355.0: the rental-status entry joins the feed'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
