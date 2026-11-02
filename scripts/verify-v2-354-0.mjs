#!/usr/bin/env node
// verify-v2-354-0.mjs — the round's FEATURE gate (v2.354.0 "the type lens
// answers the address bar"). The release MECHANICS live in verify-current.mjs.
// This script pins only what is NEW this round. THE OD LAW: bytes, not memory.
// Run BEFORE the walk; the walk-dependent pins sit in the tail section.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DESK = read('src/app/(shell)/tabs/transactions-tab.tsx');
const HOME = read('src/lib/tab-url.ts');
const TEST = read('src/tests/txn-type-deep-link-v2354.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();

console.log('— the seventh word —');
ok('THE WORD BLOCK speaks its law (membership, one home, collision-checked)',
  DESK.includes("export const TXN_TYPE_FILTERS = ['all', 'sale', 'refund', 'void'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'txn-type', TXN_TYPE_FILTERS, 'all')")
  && DESK.includes("THE TYPE LENS'S OWN WORD")
  && DESK.includes('Collision-checked at round start'));
ok('THE HOME CARRIES THE SEVENTH-WORD NOTE',
  HOME.includes('v2.354.0 — THE PROMISE KEPT, THE SEVENTH WORD'));
ok('THE SEED IS CAST-FREE (the generic parser IS the union)',
  DESK.includes("const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>(initialTxnType);")
  && DESK.includes('function initialTxnType(): (typeof TXN_TYPE_FILTERS)[number]')
  && DESK.includes('useState<(typeof TXN_TYPE_FILTERS)[number]>(initialTxnType)')
  && !DESK.includes('initialTxnType() as'));
ok('THE LANDING WORD IS READ-ON-MOUNT (the one-writer law)',
  DESK.includes('const [landedTxnType] = useState<(typeof TXN_TYPE_FILTERS)[number]>(initialTxnType);')
  && DESK.includes('const [txnTypeLandingLive, setTxnTypeLandingLive] = useState(true);'));

console.log('— the seventh wearing —');
ok('THE CHIP RENDERS ONLY WHILE LIVE AND UNTOUCHED',
  DESK.includes("txnTypeLandingLive && landedTxnType !== 'all' && typeFilter === landedTxnType")
  && DESK.includes('data-testid="txn-type-landing-word"'));
ok('THE CHIP NAMES THE EXACT WORD', DESK.includes('landed ?txn-type={landedTxnType}'));
ok('THE CHIP WEARS THE SEVENTH FAMILY (fuchsia) IN BOTH MODES',
  DESK.includes('border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700')
  && DESK.includes('dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300'));
ok('THE DISMISS HINT SHARPENS ON HOVER (the group-hover detail)',
  DESK.includes('opacity-60 transition-opacity group-hover:opacity-100'));
ok('THE TWO VOICES ARE HONEST (dismissal + hand-driven census chip)',
  DESK.includes("setTypeFilter('all');\n                  setTxnTypeLandingLive(false);")
  && DESK.includes('onClick={() => chooseTxnType(type)}')
  && DESK.includes("hand-driven census chip or the chip's own dismissal"));
ok('THE TOOLTIP LAW (explains itself, icons aria-hidden)',
  DESK.includes('title="The desk landed with this filter from the address bar — press to clear it"')
  && DESK.includes('aria-hidden="true"'));
ok('THE CENSUS VOICE KEEPS ITS SKY (no masquerade)',
  DESK.includes('data-testid="txn-type-lens-voice"')
  && DESK.includes('border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700'));

console.log('— the ledger family grows —');
ok('THE NEW TEST EXISTS with the truth table + ledger',
  TEST.includes("parseInitialNamedMember('?txn-type=refund', 'txn-type', TXN_TYPE_FILTERS, 'all')").valueOf() === true
  && TEST.includes("parseInitialNamedMember('?txn-type=REFUND', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('all')")
  && TEST.includes("parseInitialNamedMember('?tab=transactions&txn-type=refund&txn-pay=CASH', 'txn-type', TXN_TYPE_FILTERS, 'all')")
  && TEST.includes("'src/tests/txn-type-deep-link-v2354.test.ts',"));
ok('THE SIX NEIGHBOR LEDGERS ADMIT THE NEW TEST', [
    'src/tests/proxy-gate-layering-v2328.test.ts',
    'src/tests/inv-stock-deep-link-v2329.test.ts',
    'src/tests/cust-debt-deep-link-v2330.test.ts',
    'src/tests/sup-status-deep-link-v2331.test.ts',
    'src/tests/sup-po-deep-link-v2332.test.ts',
    'src/tests/txn-pay-deep-link-v2333.test.ts',
  ].every((f) => read(f).includes("'src/tests/txn-type-deep-link-v2354.test.ts',")));
ok('THE PAYMENT WORD SURVIVED UNTOUCHED (the sixth word still speaks)',
  DESK.includes("export const TXN_PAY_FILTERS = ['all', 'CASH', 'MPESA', 'DEBT'] as const;")
  && DESK.includes("parseInitialNamedMember(window.location.search, 'txn-pay', TXN_PAY_FILTERS, 'all')"));

console.log('— the face twin + the release —');
ok('WHATS-NEW 2.354.0 leads the feed', whatsNew.includes("version: '2.354.0',") && whatsNew.indexOf("'2.354.0'") < whatsNew.indexOf("'2.353.0'"));
ok('CHANGELOG 2.354.0 leads', changelog.startsWith('## [2.354.0]'));
ok('VERSION + package.json say 2.354.0 (three slots)', version === '2.354.0' && pkg.version === '2.354.0' && pkg.mbumah.releaseVersion === '2.354.0' && pkg.mbumah.baseVersion === '2.354.0');
ok('THE VERIFY WIRE EXISTS', Boolean(pkg.scripts['verify:v2-354-0']));

console.log('— walk-dependent pins (green after walk-v2354) —');
const changelogTest = read('src/tests/console-changelog.test.ts');
ok('THE UNREAD-COUNTER CASCADE landed (244/245/246/277)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(244)")
  && changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(245)")
  && changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(246)")
  && changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(277)"));
ok('THE HISTORY LINE rode the cascade block', changelogTest.includes('v2.354.0: the type-lens entry joins the feed'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
