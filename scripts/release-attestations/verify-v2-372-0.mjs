#!/usr/bin/env node
// verify-v2-372-0.mjs — the round's FEATURE gate (v2.372.0 "the gap
// comes home"). The release MECHANICS live in verify-current.mjs.
// This script pins only what is NEW this round: the gap-closure law
// (pure seam + transactional wiring), the dialog's mirror + settle hint,
// the success face's settled truth, and the chip contract's unification
// (both transactions chips scrub their words).
// THE OD LAW: bytes, not memory.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const SERVICE = read('src/lib/sale-refund-service.ts');
const DESK = read('src/app/(shell)/tabs/transactions-tab.tsx');
const SUITE = read('src/tests/refund-gap-closure-v2372.test.ts');
const TYPE_LEDGER = read('src/tests/txn-type-deep-link-v2354.test.ts');
const PAY_LEDGER = read('src/tests/txn-pay-deep-link-v2333.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log("— the gap-closure law (the pure seam) —");
ok('closeRefundGap IS EXPORTED from the service',
  SERVICE.includes('export function closeRefundGap('));
ok('THE LAW IS DOCUMENTED AT SOURCE (the stranded remainder named)',
  SERVICE.includes('THE GAP-CLOSURE LAW (v2.372.0)') && SERVICE.includes('un-refundable remainder'));
ok('THE EXHAUSTION GATE: every view\u2019s remaining quantity must be consumed',
  SERVICE.includes('l.refundableQuantity - (allocatedQtyBySaleItemId.get(l.saleItemId) ?? 0) <= 1e-9'));
ok('THE PROPORTIONAL SHARE rides each allocation (gross-weighted, 2dp)',
  SERVICE.includes('round2(toDec(gap).mul(toDec(a.refundGross)).div(refundTotalBefore))'));
ok('THE LAST ALLOCATION ABSORBS the rounding remainder',
  SERVICE.includes('adjustments[adjustments.length - 1] = round2('));
ok('AN OVER-REFUNDED HEADER IS SKIPPED (the whole-sale guard speaks instead)',
  SERVICE.includes('if (expected < 0 || refundTotalBefore <= 0 || Math.abs(gap) < 0.005) return untouched;'));

console.log('— the transactional wiring —');
const planIdx = SERVICE.indexOf('const planned = computeRefundPlan(views, params.requestedLines);');
const closeIdx = SERVICE.indexOf('const { allocations, refundTotal } = closeRefundGap(views, planned.allocations, expectedTotal);');
const guardIdx = SERVICE.indexOf("throw new RefundError('AMOUNT_OVER_REFUND', {\n        originalTotal,");
ok('THE SERVICE PLANS then CLOSES then GUARDS (in that order)',
  planIdx >= 0 && closeIdx > planIdx && guardIdx > closeIdx);
ok('THE EXPECTED TOTAL IS THE HEADER MINUS THE CHAIN SO FAR',
  SERVICE.includes('const expectedTotal = round2(toDec(originalTotal).minus(priorTotal));'));
ok('THE WIRING IS DOCUMENTED AT SOURCE',
  SERVICE.includes('THE GAP-CLOSURE LAW: when this tranche exhausts the LAST'));

console.log("— the dialog mirrors the service (the settle hint) —");
ok('THE ESTIMATE SETTLES to the header remaining when every line goes home',
  DESK.includes('const quotedTotal = settlesInFull ? headerRemaining : estimatedTotal;'));
ok('THE EXHAUSTION CHECK mirrors the service\u2019s gate',
  DESK.includes('(selected[l.saleItemId] ?? 0) + l.alreadyRefundedQuantity >= l.soldQuantity - 1e-9'));
ok('THE HEADER REMAINING comes from the wire\u2019s own figures',
  DESK.includes("data && 'totalAmount' in data ? Number(data.totalAmount) : 0")
  && DESK.includes('lines.reduce((s, l) => s + (l.lineTotal - l.refundableValue), 0)'));
ok('THE SETTLE HINT EXISTS and names the flip',
  DESK.includes('data-testid="refund-settles-hint"')
  && DESK.includes('Settles this sale in full — the original flips to REFUNDED'));
ok('THE HINT NAMES THE GAP above or below the line totals',
  DESK.includes("{settleGap > 0 ? 'above' : 'below'} the line totals"));
ok('THE BUTTON AND THE TOTAL speak the quoted figure (not the line estimate)',
  DESK.includes('{formatKES(quotedTotal)}') && DESK.includes('`Refund ${formatKES(quotedTotal)}`'));
ok('THE SUCCESS FACE SPEAKS THE SETTLED TRUTH (no KES 0 remainder line)',
  DESK.includes('The original sale is fully settled — nothing remains refundable'));

console.log('— the chip contract, unified (both transactions chips scrub) —');
ok('THE DESK IMPORTS THE SCRUB HELPER through the ONE home',
  DESK.includes("import { buildSearchWithoutParams, parseInitialNamedMember } from '@/lib/tab-url';"));
const scrubCount = (DESK.match(/const next = buildSearchWithoutParams\(window\.location\.search, \['txn-/g) ?? []).length;
ok('BOTH LANDING CHIPS SCRUB THEIR WORD (pay + type)', scrubCount === 2);
ok('THE PAY CHIP SCRUBS ?txn-pay=', DESK.includes("buildSearchWithoutParams(window.location.search, ['txn-pay'])"));
ok('THE TYPE CHIP SCRUBS ?txn-type=', DESK.includes("buildSearchWithoutParams(window.location.search, ['txn-type'])"));
ok('THE SCRUB IS SSR-GUARDED like every window touch',
  (DESK.match(/if \(typeof window !== 'undefined'\) \{\s*const next = buildSearchWithoutParams/g) ?? []).length === 2);
ok('THE CONTRACT IS DOCUMENTED AT SOURCE (the loyalty desk\u2019s law, unified)',
  (DESK.match(/THE CHIP SCRUBS ITS WORD \(the loyalty desk's/g) ?? []).length === 2);

console.log('— the round\u2019s own suite + the census ripple —');
ok('THE GAP-CLOSURE SUITE EXISTS and declares its boundary',
  SUITE.includes('REFUND GAP CLOSURE (v2.372.0)') && SUITE.includes('THE LAW'));
ok('THE SUITE PINS THE Σ-BALANCE INVARIANT', SUITE.includes('THE Σ-BALANCE INVARIANT'));
ok('THE TXN-TYPE LEDGER LISTS THE SUITE (the honest-speaker ripple)',
  TYPE_LEDGER.includes("'src/tests/refund-gap-closure-v2372.test.ts',"));
ok('THE TXN-PAY LEDGER LISTS THE SUITE (the honest-speaker ripple)',
  PAY_LEDGER.includes("'src/tests/refund-gap-closure-v2372.test.ts',"));

console.log('— the walk\u2019s own marks —');
ok('THE WALK SCRIPT EXISTS (BY WRITE, v2372 stamped)',
  read('scripts/walk-v2372.mjs').includes('walk-v2372.mjs — the v2.372.0 re-anchor codemod'));

console.log('— the release mechanics (version slots, feed, changelog) —');
ok('pkg version = VERSION (all three slots)', pkg.version === version && pkg.mbumah?.releaseVersion === version && pkg.mbumah?.baseVersion === version);
ok('the VERSION file speaks 2.372.0', version === '2.372.0');
ok('whats-new carries the lead entry', whatsNew.includes("version: '2.372.0',") && whatsNew.indexOf("version: '2.372.0',") < whatsNew.indexOf("version: '2.371.0',"));
ok('CHANGELOG carries [2.372.0] above [2.371.0]', changelog.indexOf('[2.372.0]') >= 0 && changelog.indexOf('[2.372.0]') < changelog.indexOf('[2.371.0]'));

console.log(`\nverify-v2-372-0: ${pass} ok, ${fail} FAIL`);
if (fail > 0) process.exit(1);
