#!/usr/bin/env node
// verify-v2-360-0.mjs — the round's FEATURE gate (v2.360.0 "the voucher's
// life answers the address bar"). The release MECHANICS live in
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

const DESK = read('src/app/(shell)/tabs/vouchers-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/vc-status-deep-link-v2360.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the thirteenth word —');
ok('THE WORD BLOCK speaks its law (membership, one home, collision-checked)',
  DESK.includes("export const VC_STATUS_FILTERS = ['all', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'vc-status', VC_STATUS_FILTERS, 'all')")
  && DESK.includes("THE VOUCHER DESK'S OWN WORD")
  && DESK.includes('Collision-checked at round start'));
ok('THE HOME CARRIES THE THIRTEENTH-WORD NOTE',
  HOME.includes('v2.360.0 — THE PROMISE KEPT, THE THIRTEENTH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('const [statusFilter, setStatusFilter] = useState<(typeof VC_STATUS_FILTERS)[number]>(initialVcStatus);')
  && DESK.includes('function initialVcStatus(): (typeof VC_STATUS_FILTERS)[number]')
  && !DESK.includes('initialVcStatus() as'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedVcStatus] = useState<(typeof VC_STATUS_FILTERS)[number]>(initialVcStatus);')
  && DESK.includes('const [vcLandingLive, setVcLandingLive] = useState(true);'));
ok('THE NEUTRAL IS LOWERCASE (the desk\u2019s own all-lens spelling)',
  DESK.includes("return 'all';")
  && DESK.includes("['all', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED']"));
ok('THE WORD BINDS TO THE VOUCHER LENS ONLY (the campaign Select untouched)',
  DESK.includes('onValueChange={setCampaignStatusFilter}')
  && !DESK.includes('chooseCampaignStatus'));
ok('THE QUERY RIDES THE LENS (key + params, the list filters, not just the face)',
  DESK.includes("queryKey: ['vouchers', currentStoreId, statusFilter, typeFilter, debouncedSearch],")
  && DESK.includes("status: statusFilter !== 'all' ? statusFilter : undefined,"));

console.log('— the thirteenth wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("vcLandingLive && landedVcStatus !== 'all' && statusFilter === landedVcStatus")
  && DESK.includes('data-testid="vc-status-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?vc-status={landedVcStatus}'));
ok('THE CHIP WEARS THE THIRTEENTH FAMILY (pink) IN BOTH MODES',
  DESK.includes('border-pink-200 bg-pink-50 text-pink-700')
  && DESK.includes('dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300'));
ok('THE CHIP LIVES IN THE ALWAYS-VISIBLE TOOLBAR (above the collapsible panel)',
  DESK.indexOf('data-testid="vc-status-landing-word"') < DESK.indexOf('{showFilters && ('));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE TWO VOICES ARE HONEST (dismissal + hand-driven Select)',
  DESK.includes("setStatusFilter('all');\n                        setVcLandingLive(false);")
  && DESK.includes('<Select value={statusFilter} onValueChange={chooseVcStatus}>')
  && DESK.includes("hand-driven Select change or the chip's own dismissal"));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The desk landed with this filter from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));
ok('THE COLLISION NOTE NAMES NO FOREIGN WORD (the prose-collision shadow, applied)',
  !DESK.includes("'gc-status'") && !DESK.includes("'dn-status'") && !DESK.includes("'transfer-status'"));
ok('THE DESK\u2019S OWN VOICES KEEP THEIR FAMILIES (no masquerade)',
  DESK.includes('bg-green-100 text-green-800')
  && DESK.includes('bg-amber-100 text-amber-800')
  && DESK.includes('bg-red-100 text-red-800'));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + the lowercase-neutral inversion + ledger',
  TEST.includes("parseInitialNamedMember('?vc-status=PAUSED', 'vc-status', VC_STATUS_FILTERS, 'all')").valueOf() === true
  && TEST.includes("parseInitialNamedMember('?vc-status=ALL', 'vc-status', VC_STATUS_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?tab=vouchers&vc-status=ACTIVE&dn-status=IN_TRANSIT', 'vc-status', VC_STATUS_FILTERS, 'all')")
  && TEST.includes("'src/tests/vc-status-deep-link-v2360.test.ts',"));
ok('THE TWELVE NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
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
  ].every((f) => read(f).includes("'src/tests/vc-status-deep-link-v2360.test.ts',")));
ok('THE CONSTITUTION\u2019S THIRTEENTH ROW LANDED (registry + title + promise roll)',
  read('src/tests/transfer-status-deep-link-v2357.test.ts').includes("{ word: 'vc-status', desk: 'src/app/(shell)/tabs/vouchers-tab.tsx', family: 'border-pink-200', suite: 'src/tests/vc-status-deep-link-v2360.test.ts' }")
  && read('src/tests/transfer-status-deep-link-v2357.test.ts').includes('(thirteen words, eleven desks)')
  && read('src/tests/transfer-status-deep-link-v2357.test.ts').includes("'THIRTEENTH'"));
ok('THE ELDERS\u2019 TITLE PINS RODE THE TREADMILL (the living-line re-anchor)',
  read('src/tests/dn-status-deep-link-v2359.test.ts').includes('(thirteen words, eleven desks)')
  && read('src/tests/gc-status-deep-link-v2358.test.ts').includes('(thirteen words, eleven desks)'));
ok('THE ELEVENTH AND TWELFTH WORDS SURVIVED UNTOUCHED',
  read('src/app/(shell)/tabs/gift-cards-tab.tsx').includes("export const GC_STATUS_FILTERS = ['ALL', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED', 'PARTIALLY_REDEEMED'] as const;")
  && read('src/app/(shell)/tabs/delivery-notes-tab.tsx').includes("export const DN_STATUS_FILTERS = ['all', 'PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const;"));

console.log('— the face + the release —');
ok('WHATS-NEW 2.360.0 leads the feed', whatsNew.includes("version: '2.360.0',") && whatsNew.indexOf("'2.360.0'") < whatsNew.indexOf("'2.359.0'"));
ok('CHANGELOG 2.360.0 leads', changelog.startsWith('## [2.360.0]'));
ok('VERSION + package.json say 2.360.0 (three slots)', version === '2.360.0' && pkg.version === '2.360.0' && pkg.mbumah.releaseVersion === '2.360.0' && pkg.mbumah.baseVersion === '2.360.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-360-0']));

console.log('— walk-dependent pins (green after walk-v2360) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (250/251/252/283)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(250)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(251)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(252)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(283)"));
ok('THE HISTORY LINE rode the cascade block (the English compound, not the word)', changelogTest.includes('v2.360.0: the voucher-status entry joins the feed')
  && !changelogTest.includes('vc-status'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
