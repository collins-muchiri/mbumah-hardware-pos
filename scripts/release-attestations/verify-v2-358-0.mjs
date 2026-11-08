#!/usr/bin/env node
// verify-v2-358-0.mjs — the round's FEATURE gate (v2.358.0 "the gift
// card's life answers the address bar"). The release MECHANICS live in
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

const DESK = read('src/app/(shell)/tabs/gift-cards-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/gc-status-deep-link-v2358.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the eleventh word —');
ok('THE WORD BLOCK speaks its law (membership, one home, collision-checked)',
  DESK.includes("export const GC_STATUS_FILTERS = ['ALL', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED', 'PARTIALLY_REDEEMED'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'gc-status', GC_STATUS_FILTERS, 'ALL')")
  && DESK.includes("THE GIFT CARD DESK'S OWN WORD")
  && DESK.includes('Collision-checked at round start'));
ok('THE HOME CARRIES THE ELEVENTH-WORD NOTE',
  HOME.includes('v2.358.0 — THE PROMISE KEPT, THE ELEVENTH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('const [statusFilter, setStatusFilter] = useState<(typeof GC_STATUS_FILTERS)[number]>(initialGcStatus);')
  && DESK.includes('function initialGcStatus(): (typeof GC_STATUS_FILTERS)[number]')
  && !DESK.includes('initialGcStatus() as'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedGcStatus] = useState<(typeof GC_STATUS_FILTERS)[number]>(initialGcStatus);')
  && DESK.includes('const [gcLandingLive, setGcLandingLive] = useState(true);'));
ok('THE NEUTRAL IS CAPITALIZED (the first const carrying an UPPERCASE neutral)',
  DESK.includes("return 'ALL';")
  && DESK.includes("['ALL', 'ACTIVE', 'REDEEMED', 'EXPIRED', 'CANCELLED', 'PARTIALLY_REDEEMED']"));

console.log('— the eleventh wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("gcLandingLive && landedGcStatus !== 'ALL' && statusFilter === landedGcStatus")
  && DESK.includes('data-testid="gc-status-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?gc-status={landedGcStatus}'));
ok('THE CHIP WEARS THE ELEVENTH FAMILY (lime) IN BOTH MODES',
  DESK.includes('border-lime-200 bg-lime-50 text-lime-700')
  && DESK.includes('dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-300'));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE TWO VOICES ARE HONEST (dismissal + hand-driven Select)',
  DESK.includes("setStatusFilter('ALL');\n                setGcLandingLive(false);")
  && DESK.includes('<Select value={statusFilter} onValueChange={chooseGcStatus}>')
  && DESK.includes("hand-driven Select change or the chip's own dismissal"));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The desk landed with this filter from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));
ok('THE COLLISION NOTE NAMES NO FOREIGN WORD (the prose-collision shadow, applied)',
  !DESK.includes("'inv-status'") && !DESK.includes("'transfer-status'") && !DESK.includes("'rent-status'"));
ok('THE DESK\u2019S OWN VOICES KEEP THEIR FAMILIES (no masquerade)',
  DESK.includes('text-pink-700 dark:text-pink-400')
  && DESK.includes('text-purple-700 dark:text-purple-400')
  && DESK.includes('border-pink-200 dark:border-pink-900/40'));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + the capitalized-neutral inversion + ledger',
  TEST.includes("parseInitialNamedMember('?gc-status=PARTIALLY_REDEEMED', 'gc-status', GC_STATUS_FILTERS, 'ALL')").valueOf() === true
  && TEST.includes("parseInitialNamedMember('?gc-status=all', 'gc-status', GC_STATUS_FILTERS, 'ALL')).toBe('ALL')")
  && TEST.includes("parseInitialNamedMember('?tab=gift-cards&gc-status=PARTIALLY_REDEEMED&rent-status=OVERDUE&transfer-status=IN_TRANSIT', 'gc-status', GC_STATUS_FILTERS, 'ALL')")
  && TEST.includes("'src/tests/gc-status-deep-link-v2358.test.ts',"));
ok('THE TEN NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
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
  ].every((f) => read(f).includes("'src/tests/gc-status-deep-link-v2358.test.ts',")));
ok('THE CONSTITUTION\u2019S ELEVENTH ROW LANDED (registry + title + promise roll)',
  read('src/tests/transfer-status-deep-link-v2357.test.ts').includes("{ word: 'gc-status', desk: 'src/app/(shell)/tabs/gift-cards-tab.tsx', family: 'border-lime-200', suite: 'src/tests/gc-status-deep-link-v2358.test.ts' }")
  && read('src/tests/transfer-status-deep-link-v2357.test.ts').includes('(eleven words, nine desks)')
  && read('src/tests/transfer-status-deep-link-v2357.test.ts').includes("'ELEVENTH'"));
ok('THE NINTH AND TENTH WORDS SURVIVED UNTOUCHED',
  read('src/app/(shell)/tabs/invoices-tab.tsx').includes("export const INV_STATUS_FILTERS = ['all', 'DRAFT', 'SENT', 'ACCEPTED', 'INVOICED', 'PAID', 'CANCELLED', 'EXPIRED'] as const;")
  && read('src/app/(shell)/tabs/transfers-tab.tsx').includes("export const TRANSFER_STATUS_FILTERS = ['all', 'PENDING', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED', 'PARTIAL'] as const;"));

console.log('— the face + the release —');
ok('WHATS-NEW 2.358.0 leads the feed', whatsNew.includes("version: '2.358.0',") && whatsNew.indexOf("'2.358.0'") < whatsNew.indexOf("'2.357.0'"));
ok('CHANGELOG 2.358.0 leads', changelog.startsWith('## [2.358.0]'));
ok('VERSION + package.json say 2.358.0 (three slots)', version === '2.358.0' && pkg.version === '2.358.0' && pkg.mbumah.releaseVersion === '2.358.0' && pkg.mbumah.baseVersion === '2.358.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-358-0']));

console.log('— walk-dependent pins (green after walk-v2358) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (248/249/250/281)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(248)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(249)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(250)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(281)"));
ok('THE HISTORY LINE rode the cascade block (the English compound, not the word)', changelogTest.includes('v2.358.0: the gift-card-status entry joins the feed')
  && !changelogTest.includes('gc-status'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
