#!/usr/bin/env node
// verify-v2-356-0.mjs — the round's FEATURE gate (v2.356.0 "the invoice
// pipeline answers the address bar"). The release MECHANICS live in
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

const DESK = read('src/app/(shell)/tabs/invoices-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/inv-status-deep-link-v2356.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the ninth word —');
ok('THE WORD BLOCK speaks its law (membership, one home, collision-checked)',
  DESK.includes("export const INV_STATUS_FILTERS = ['all', 'DRAFT', 'SENT', 'ACCEPTED', 'INVOICED', 'PAID', 'CANCELLED', 'EXPIRED'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'inv-status', INV_STATUS_FILTERS, 'all')")
  && DESK.includes("THE INVOICE DESK'S OWN WORD")
  && DESK.includes('Collision-checked at round start'));
ok('THE HOME CARRIES THE NINTH-WORD NOTE',
  HOME.includes('v2.356.0 — THE PROMISE KEPT, THE NINTH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes('const [statusFilter, setStatusFilter] = useState<(typeof INV_STATUS_FILTERS)[number]>(initialInvStatus);')
  && DESK.includes('function initialInvStatus(): (typeof INV_STATUS_FILTERS)[number]')
  && !DESK.includes('initialInvStatus() as'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedInvStatus] = useState<(typeof INV_STATUS_FILTERS)[number]>(initialInvStatus);')
  && DESK.includes('const [invLandingLive, setInvLandingLive] = useState(true);'));

console.log('— the ninth wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("invLandingLive && landedInvStatus !== 'all' && statusFilter === landedInvStatus")
  && DESK.includes('data-testid="inv-status-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?inv-status={landedInvStatus}'));
ok('THE CHIP WEARS THE NINTH FAMILY (teal) IN BOTH MODES',
  DESK.includes('border-teal-200 bg-teal-50 text-teal-700')
  && DESK.includes('dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300'));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE TWO VOICES ARE HONEST (dismissal + hand-driven Select)',
  DESK.includes("setStatusFilter('all');\n                  setInvLandingLive(false);")
  && DESK.includes('<Select value={statusFilter} onValueChange={chooseInvStatus}>')
  && DESK.includes("hand-driven Select change or the chip's own dismissal"));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The desk landed with this filter from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));
ok('THE COLLISION NOTE NAMES NO FOREIGN WORD (the prose-collision shadow, applied)',
  !DESK.includes('inv-stock'));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + ledger',
  TEST.includes("parseInitialNamedMember('?inv-status=PAID', 'inv-status', INV_STATUS_FILTERS, 'all')").valueOf() === true
  && TEST.includes("parseInitialNamedMember('?inv-status=paid', 'inv-status', INV_STATUS_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?tab=invoices&inv-status=INVOICED&rent-status=OVERDUE', 'inv-status', INV_STATUS_FILTERS, 'all')")
  && TEST.includes("'src/tests/inv-status-deep-link-v2356.test.ts',"));
ok('THE EIGHT NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
    'src/tests/proxy-gate-layering-v2328.test.ts',
    'src/tests/inv-stock-deep-link-v2329.test.ts',
    'src/tests/cust-debt-deep-link-v2330.test.ts',
    'src/tests/sup-status-deep-link-v2331.test.ts',
    'src/tests/sup-po-deep-link-v2332.test.ts',
    'src/tests/txn-pay-deep-link-v2333.test.ts',
    'src/tests/txn-type-deep-link-v2354.test.ts',
    'src/tests/rent-status-deep-link-v2355.test.ts',
  ].every((f) => read(f).includes("'src/tests/inv-status-deep-link-v2356.test.ts',")));
ok('THE EIGHTH WORD SURVIVED UNTOUCHED (rent-status still speaks)',
  read('src/app/(shell)/tabs/rentals-tab.tsx').includes("export const RENT_STATUS_FILTERS = ['all', 'ACTIVE', 'OVERDUE', 'RETURNED', 'DAMAGED'] as const;"));

console.log('— the face + the release —');
ok('WHATS-NEW 2.356.0 leads the feed', whatsNew.includes("version: '2.356.0',") && whatsNew.indexOf("'2.356.0'") < whatsNew.indexOf("'2.355.0'"));
ok('CHANGELOG 2.356.0 leads', changelog.startsWith('## [2.356.0]'));
ok('VERSION + package.json say 2.356.0 (three slots)', version === '2.356.0' && pkg.version === '2.356.0' && pkg.mbumah.releaseVersion === '2.356.0' && pkg.mbumah.baseVersion === '2.356.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-356-0']));

console.log('— walk-dependent pins (green after walk-v2356) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (246/247/248/279)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(246)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(247)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(248)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(279)"));
ok('THE HISTORY LINE rode the cascade block (the English compound, not the word)', changelogTest.includes('v2.356.0: the invoice-status entry joins the feed')
  && !changelogTest.includes('inv-status'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
