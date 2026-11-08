#!/usr/bin/env node
// verify-v2-333-0.mjs — the round's FEATURE gate (v2.333.0 "the ledger
// answers the address bar"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD
// LAW. Pin law (Task 43-53): pins must match the SOURCE bytes —
// straight vs curly apostrophes, line-wraps and indentation included.
// Run BEFORE the walk.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const home = read('src/lib/tab-url.ts');
const desk = read('src/app/(shell)/tabs/transactions-tab.tsx');
const test = read('src/tests/txn-pay-deep-link-v2333.test.ts');
const custTest = read('src/tests/cust-debt-deep-link-v2330.test.ts');
const invTest = read('src/tests/inv-stock-deep-link-v2329.test.ts');
const poGateTest = read('src/tests/proxy-gate-layering-v2328.test.ts');
const supTest = read('src/tests/sup-status-deep-link-v2331.test.ts');
const supPoTest = read('src/tests/sup-po-deep-link-v2332.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the promise kept a fifth time, the chips face (lib/tab-url.ts) —');
ok('the home carries the v2.333 sixth-word note (one home, sixth word)',
  home.includes('v2.333.0 — THE PROMISE KEPT, THE SIXTH WORD') &&
  home.includes('export function parseInitialNamedMember'));
ok('the law itself gained zero new bytes of parser',
  home.includes('return value as V;') && home.includes('return fallback;'));

console.log('— the transactions desk seeds and answers (transactions-tab.tsx) —');
ok('the seed reads the word through the ONE home (never a local parser)',
  desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';") &&
  desk.includes("parseInitialNamedMember(window.location.search, 'txn-pay', TXN_PAY_FILTERS, 'all')"));
ok('the seed is the lazy initializer with the SSR guard',
  desk.includes('const [paymentFilter, setPaymentFilter] = useState<string>(initialTxnPay);') &&
  desk.includes("if (typeof window === 'undefined') return 'all';"));
ok('the desk offers exactly the lenses it names',
  desk.includes("export const TXN_PAY_FILTERS = ['all', 'CASH', 'MPESA', 'DEBT'] as const;"));
ok('the landing word state exists (the chip speaks the LANDING, never the choice)',
  desk.includes('const [landedTxnPay] = useState<string>(initialTxnPay);') &&
  desk.includes('const [txnLandingLive, setTxnLandingLive] = useState(true);'));
ok('the chip renders only while the landing is live AND untouched',
  desk.includes("txnLandingLive && landedTxnPay !== 'all' && paymentFilter === landedTxnPay") &&
  desk.includes('data-testid="txn-landing-word"') &&
  desk.includes('landed ?txn-pay={landedTxnPay}'));
ok('voice 1 — the chip\u2019s own dismissal clears the lens and retires',
  desk.slice(desk.indexOf('data-testid="txn-landing-word"'), desk.indexOf('data-testid="txn-landing-word"') + 400)
    .includes("setPaymentFilter('all')"));
ok('voice 2 — a hand-driven quick-chip press retires the chip',
  desk.includes('onClick={() => chooseTxnPay(method)}') &&
  desk.includes('a hand-driven change retires the landing word'));
ok('the voices are honest — the desk claims exactly the two it has',
  desk.includes("a hand-driven quick chip or\n                the chip's own dismissal") &&
  !desk.includes('voice 3') && !desk.includes('voice 4'));
ok('the chip wears the lens\u2019s violet family in BOTH modes',
  desk.includes('border-violet-200 bg-violet-50 text-violet-700') &&
  desk.includes('dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300'));
ok('the chip explains itself (the tooltip law)',
  desk.includes('title="The desk landed with this filter from the address bar — press to clear it"'));

console.log('— the test pins the laws —');
ok('the deep-link test pins the truth table and the seed bytes',
  test.includes("parseInitialNamedMember('?txn-pay=CASH', 'txn-pay', TXN_PAY_FILTERS, 'all')") &&
  test.includes("parseInitialNamedMember('?txn-pay=cash', 'txn-pay', TXN_PAY_FILTERS, 'all')"));
ok('the deep-link test pins the two honest retirement voices',
  test.includes('voice 1') && test.includes('voice 2') &&
  test.includes('the voices are honest'));
ok('the deep-link test carries the collision ledger walk',
  test.includes('walkSrc') && test.includes("'src/app/(shell)/tabs/transactions-tab.tsx'") &&
  test.includes("'src/tests/txn-pay-deep-link-v2333.test.ts'"));
ok('the v2.330 ledger grew its honest speaker (the rides-along citation)',
  custTest.includes("'src/tests/txn-pay-deep-link-v2333.test.ts'"));
ok('the v2.329 ledger grew its honest speaker (the rides-along citation)',
  invTest.includes("'src/tests/txn-pay-deep-link-v2333.test.ts'"));
ok('the v2.328 ledger grew its honest speaker (the lineage citation)',
  poGateTest.includes("'src/tests/txn-pay-deep-link-v2333.test.ts'"));
ok('the v2.331 ledger grew its honest speaker (the rides-along citation)',
  supTest.includes("'src/tests/txn-pay-deep-link-v2333.test.ts'"));
ok('the v2.332 ledger grew its honest speaker (the rides-along citation)',
  supPoTest.includes("'src/tests/txn-pay-deep-link-v2333.test.ts'"));

console.log('— the release voice —');
ok("whats-new leads with the round\u2019s story",
  whatsNew.includes("version: '2.333.0',") &&
  whatsNew.includes('The ledger answers the address bar') &&
  whatsNew.includes('?txn-pay=CASH'));
ok('the CHANGELOG carries the round (Added + Styling + Tests)',
  changelog.includes('## [2.333.0] The ledger answers the address bar') &&
  changelog.includes("THE LEDGER'S OWN WORD") &&
  changelog.includes('THE LANDING WORD CHIP, SIXTH WEARING'));
ok('the manifest answers 2.333.0 in all three slots',
  pkg.version === '2.333.0' && pkg.mbumah?.releaseVersion === '2.333.0' && pkg.mbumah?.baseVersion === '2.333.0');
ok('the verify gate itself is wired into the manifest',
  typeof pkg.scripts['verify:v2-333-0'] === 'string');
ok('the walk\u2019s history line landed (the cascade speaks 224/225/226/257)',
  changelogTest.includes('// v2.333.0:') && changelogTest.includes('entry joins the feed') &&
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(224)"));
ok('no stale anchor behind (the old counts are gone)',
  !changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(223)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
