#!/usr/bin/env node
// verify-v2-337-0.mjs — the round's FEATURE gate (v2.337.0 "the banking
// doors speak their body's shape"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD
// LAW. Pin law (Task 43-57): pins must match the SOURCE bytes (the
// raw-escape law included). Run BEFORE the walk; the last two pins
// pass only AFTER walk-v2337.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DOORS = [
  'src/app/api/banking/accounts/route.ts',
  'src/app/api/banking/reconciliations/route.ts',
  'src/app/api/banking/transactions/route.ts',
  'src/app/api/payments/mpesa/stkpush/route.ts',
  'src/app/api/payments/mpesa/b2c/queue-timeout/route.ts',
];
const doors = DOORS.map(read);
const helper = read('src/lib/request-body.ts');
const test = read('src/tests/banking-doors-v2337.test.ts');
const ledger = read('src/tests/body-door-class-v2326.test.ts');
const swallow = read('src/tests/swallow-census-v2327.test.ts');
const desk = read('src/app/(shell)/tabs/banking-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the zero-loose census (the banking family) —');
ok('not one banking door still speaks the loose Record cast',
  !doors.some((s) => s.includes('as Record<string, unknown>')));
ok('not one banking door still calls the door bare (the `any` law)',
  !doors.some((s) => /readJsonBody\(request\)/.test(s)));
ok('not one banking door re-casts the body to a named interface',
  !doors.some((s) => /door\.body as [A-Z]/.test(s)));
ok('every banking door and webhook carries the round marker',
  doors.every((s) => s.includes('v2.337.0')));

console.log('— the per-file honest bytes —');
ok('accounts speaks the nine-field shape',
  read('src/app/api/banking/accounts/route.ts').includes('    openingBalance?: unknown;') &&
  read('src/app/api/banking/accounts/route.ts').includes('    accountType?: string;'));
ok('reconciliations speaks the six-field shape with both balances unknown',
  read('src/app/api/banking/reconciliations/route.ts').includes('    statementBalance?: unknown;') &&
  read('src/app/api/banking/reconciliations/route.ts').includes('    bookBalance?: unknown;'));
ok('transactions speaks the ledger shape, amount number | string (toDec owns the widening)',
  read('src/app/api/banking/transactions/route.ts').includes('    amount?: number | string;') &&
  read('src/app/api/banking/transactions/route.ts').includes("the ledger's own toDec"));
ok('stkpush borrows the handler\u2019s own StkPushBody (the re-cast is gone)',
  read('src/app/api/payments/mpesa/stkpush/route.ts').includes('readJsonBody<StkPushBody>(request)') &&
  !/door\.body as [A-Z]/.test(read('src/app/api/payments/mpesa/stkpush/route.ts')));
ok('queue-timeout reads its contract-less body as unknown and still always answers success',
  read('src/app/api/payments/mpesa/b2c/queue-timeout/route.ts')
    .includes('const body: unknown = await request.json().catch(() => ({}));') &&
  read('src/app/api/payments/mpesa/b2c/queue-timeout/route.ts')
    .includes('Response.json({ success: true })'));

console.log('— the untouched honest pair —');
ok('the callback door still borrows MpesaCallbackBody',
  read('src/app/api/payments/mpesa/callback/route.ts').includes('readJsonBody<MpesaCallbackBody>(request)'));
ok('the b2c result webhook still wears the disbursement service\u2019s own payload type',
  read('src/app/api/payments/mpesa/b2c/result/route.ts').includes('as B2CResultPayload | null;'));

console.log('— the cross-ledger voices —');
ok('the v2.326 census still counts the banking trio and stkpush among the door files',
  ["'src/app/api/banking/accounts/route.ts',", "'src/app/api/banking/reconciliations/route.ts',",
   "'src/app/api/banking/transactions/route.ts',", "'src/app/api/payments/mpesa/stkpush/route.ts',"]
    .every((p) => ledger.includes(p)));
ok('the swallow census byte still stands in queue-timeout (both sides)',
  read('src/app/api/payments/mpesa/b2c/queue-timeout/route.ts').includes('request.json().catch') &&
  swallow.includes("honest('src/app/api/payments/mpesa/b2c/queue-timeout/route.ts').includes('request.json().catch')"));
ok('the law doc records the third pass',
  helper.includes("v2.337.0 — THE BANKING FAMILY, the wider class's third pass") &&
  helper.includes("the wider class's third pass"));

console.log('— the styling face (the recon meter) —');
ok('the waking fix: both desk queries speak their store (the sub-tabs wake)',
  desk.includes('queryFn: () => bankingApi.transactions.list({ storeId: storeId ?? undefined, limit: 100 })') &&
  desk.includes('queryFn: () => bankingApi.reconciliations.list({ storeId: storeId ?? undefined, limit: 100 })') &&
  desk.includes('THE WAKING FIX'));
ok('the reconciliation cards grow the agreement bar',
  desk.includes('THE RECON METER (v2.337.0)') &&
  desk.includes('data-testid="recon-diff-meter"') &&
  desk.includes('role="progressbar"'));
ok('the meter\u2019s math is honest (divergence against the larger balance)',
  desk.includes('const denom = Math.max(Math.abs(recon.statementBalance), Math.abs(recon.bookBalance));') &&
  desk.includes('const agreementPct = 100 - pctOfLarger;'));
ok('the meter wears both voices and survives dark mode',
  desk.includes('bg-emerald-600 dark:bg-emerald-500') &&
  desk.includes('bg-red-600 dark:bg-red-500') &&
  desk.includes('{agreementPct.toFixed(1)}% in step'));

console.log('— the release voice —');
ok('the tightening ledger exists and pins the census + bytes + meter',
  test.includes('THE BANKING DOORS SPEAK THEIR BODY SHAPE') &&
  test.includes('recon-diff-meter'));
ok("whats-new leads with the round\u2019s story",
  whatsNew.includes("version: '2.337.0',") &&
  whatsNew.includes('The banking doors speak their body\\u2019s shape'));
ok('the CHANGELOG carries the round (Added + Styling + Tests)',
  changelog.includes("## [2.337.0] The banking doors speak their body's shape") &&
  changelog.includes('THE BANKING DOORS TIGHTENED (5 files)') &&
  changelog.includes('THE RECON METER'));
ok('the manifest answers 2.337.0 in all three slots',
  pkg.version === '2.337.0' && pkg.mbumah?.releaseVersion === '2.337.0' && pkg.mbumah?.baseVersion === '2.337.0');
ok('the verify gate itself is wired into the manifest',
  typeof pkg.scripts['verify:v2-337-0'] === 'string');

console.log('— the walk\u2019s anchors (green AFTER walk-v2337) —');
ok('the walk\u2019s history line landed (the cascade speaks 228/229/230/261)',
  changelogTest.includes('// v2.337.0:') && changelogTest.includes('entry joins the feed') &&
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(228)"));
ok('no stale anchor behind (the old counts are gone)',
  !changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(227)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
