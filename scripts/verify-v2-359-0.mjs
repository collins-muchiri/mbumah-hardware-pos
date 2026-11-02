#!/usr/bin/env node
// verify-v2-359-0.mjs — the round's FEATURE gate (v2.359.0 "the delivery's
// road answers the address bar"). The release MECHANICS live in
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

const DESK = read('src/app/(shell)/tabs/delivery-notes-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/dn-status-deep-link-v2359.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the twelfth word —');
ok('THE WORD BLOCK speaks its law (membership, one home, collision-checked)',
  DESK.includes("export const DN_STATUS_FILTERS = ['all', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'dn-status', DN_STATUS_FILTERS, 'all')")
  && DESK.includes("THE DELIVERY DESK'S OWN WORD")
  && DESK.includes('Collision-checked at round start'));
ok('THE HOME CARRIES THE TWELFTH-WORD NOTE',
  HOME.includes('v2.359.0 — THE PROMISE KEPT, THE TWELFTH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('const [statusFilter, setStatusFilter] = useState<(typeof DN_STATUS_FILTERS)[number]>(initialDnStatus);')
  && DESK.includes('function initialDnStatus(): (typeof DN_STATUS_FILTERS)[number]')
  && !DESK.includes('initialDnStatus() as'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedDnStatus] = useState<(typeof DN_STATUS_FILTERS)[number]>(initialDnStatus);')
  && DESK.includes('const [dnLandingLive, setDnLandingLive] = useState(true);'));
ok('THE NEUTRAL IS LOWERCASE (the desk\u2019s own all-lens spelling)',
  DESK.includes("return 'all';")
  && DESK.includes("['all', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']"));
ok('THE QUERY RIDES THE LENS (key + params, the list filters, not just the face)',
  DESK.includes("queryKey: ['delivery-notes', currentStoreId, statusFilter],")
  && DESK.includes("status: statusFilter !== 'all' ? statusFilter : undefined,"));

console.log('— the twelfth wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("dnLandingLive && landedDnStatus !== 'all' && statusFilter === landedDnStatus")
  && DESK.includes('data-testid="dn-status-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?dn-status={landedDnStatus}'));
ok('THE CHIP WEARS THE TWELFTH FAMILY (sky) IN BOTH MODES',
  DESK.includes('border-sky-200 bg-sky-50 text-sky-700')
  && DESK.includes('dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300'));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE TWO VOICES ARE HONEST (dismissal + hand-driven Select)',
  DESK.includes("setStatusFilter('all');\n                  setDnLandingLive(false);")
  && DESK.includes('<Select value={statusFilter} onValueChange={chooseDnStatus}>')
  && DESK.includes("hand-driven Select change or the chip's own dismissal"));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The desk landed with this filter from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));
ok('THE COLLISION NOTE NAMES NO FOREIGN WORD (the prose-collision shadow, applied)',
  !DESK.includes("'inv-status'") && !DESK.includes("'transfer-status'") && !DESK.includes("'gc-status'"));
ok('THE DESK\u2019S OWN VOICES KEEP THEIR FAMILIES (no masquerade)',
  DESK.includes('bg-amber-100 text-amber-700')
  && DESK.includes('bg-blue-100 text-blue-700')
  && DESK.includes('bg-green-100 text-green-700')
  && DESK.includes('bg-red-100 text-red-700'));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + the lowercase-neutral inversion + ledger',
  TEST.includes("parseInitialNamedMember('?dn-status=IN_TRANSIT', 'dn-status', DN_STATUS_FILTERS, 'all')").valueOf() === true
  && TEST.includes("parseInitialNamedMember('?dn-status=ALL', 'dn-status', DN_STATUS_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?tab=delivery&dn-status=CANCELLED&gc-status=REDEEMED', 'dn-status', DN_STATUS_FILTERS, 'all')")
  && TEST.includes("'src/tests/dn-status-deep-link-v2359.test.ts',"));
ok('THE ELEVEN NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
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
  ].every((f) => read(f).includes("'src/tests/dn-status-deep-link-v2359.test.ts',")));
ok('THE CONSTITUTION\u2019S TWELFTH ROW LANDED (registry + title + promise roll)',
  read('src/tests/transfer-status-deep-link-v2357.test.ts').includes("{ word: 'dn-status', desk: 'src/app/(shell)/tabs/delivery-notes-tab.tsx', family: 'border-sky-200', suite: 'src/tests/dn-status-deep-link-v2359.test.ts' }")
  && read('src/tests/transfer-status-deep-link-v2357.test.ts').includes('(twelve words, ten desks)')
  && read('src/tests/transfer-status-deep-link-v2357.test.ts').includes("'TWELFTH'"));
ok('THE TENTH AND ELEVENTH WORDS SURVIVED UNTOUCHED',
  read('src/app/(shell)/tabs/transfers-tab.tsx').includes("export const TRANSFER_STATUS_FILTERS = ['all', 'PENDING', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED', 'PARTIAL'] as const;")
  && read('src/app/(shell)/tabs/gift-cards-tab.tsx').includes("export const GC_STATUS_FILTERS = ['ALL', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED', 'PARTIALLY_REDEEMED'] as const;"));

console.log('— the face + the release —');
ok('WHATS-NEW 2.359.0 leads the feed', whatsNew.includes("version: '2.359.0',") && whatsNew.indexOf("'2.359.0'") < whatsNew.indexOf("'2.358.0'"));
ok('CHANGELOG 2.359.0 leads', changelog.startsWith('## [2.359.0]'));
ok('VERSION + package.json say 2.359.0 (three slots)', version === '2.359.0' && pkg.version === '2.359.0' && pkg.mbumah.releaseVersion === '2.359.0' && pkg.mbumah.baseVersion === '2.359.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-359-0']));

console.log('— walk-dependent pins (green after walk-v2359) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (249/250/251/282)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(249)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(250)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(251)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(282)"));
ok('THE HISTORY LINE rode the cascade block (the English compound, not the word)', changelogTest.includes('v2.359.0: the delivery-note-status entry joins the feed')
  && !changelogTest.includes('dn-status'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
