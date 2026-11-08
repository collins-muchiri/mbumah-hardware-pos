#!/usr/bin/env node
// verify-v2-338-0.mjs — the round's FEATURE gate (v2.338.0 "the customer
// doors speak their body's shape"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD
// LAW. Pin law (Task 43-58): pins must match the SOURCE bytes (the
// raw-escape law included). Run BEFORE the walk; the last two pins
// pass only AFTER walk-v2338.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DOORS = [
  'src/app/api/customers/route.ts',
  'src/app/api/customers/[id]/route.ts',
  'src/app/api/customer-credits/route.ts',
  'src/app/api/customer-credits/[id]/route.ts',
  'src/app/api/customer-interactions/route.ts',
  'src/app/api/debt/route.ts',
  'src/app/api/debt-payment-plans/[id]/installments/[installmentId]/pay/route.ts',
  'src/app/api/debt-payment-plans/[id]/installments/[installmentId]/waive/route.ts',
];
const doors = DOORS.map(read);
const plans = read('src/app/api/debt-payment-plans/route.ts');
const planPatch = read('src/app/api/debt-payment-plans/[id]/route.ts');
const helper = read('src/lib/request-body.ts');
const test = read('src/tests/customer-doors-v2338.test.ts');
const ledger = read('src/tests/body-door-class-v2326.test.ts');
const ledger2335 = read('src/tests/financial-doors-v2335.test.ts');
const ledger2336 = read('src/tests/catalog-doors-v2336.test.ts');
const custDebtLedger = read('src/tests/cust-debt-deep-link-v2330.test.ts');
const desk = read('src/app/(shell)/tabs/customers-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the zero-loose census (the customer family) —');
ok('not one customer door still speaks the loose Record cast (body reads only)',
  !doors.some((s) => s.includes('as Record<string, unknown>')));
ok('the plan-create route\u2019s one remaining cast is the GET-side serialization row',
  plans.includes('const row = serializePlanRow(plan) as Record<string, unknown>;'));
ok('not one customer door still calls the door bare (the `any` law)',
  !doors.some((s) => /readJsonBody\(request\)/.test(s)));
ok('not one customer door re-casts the body back to a named interface',
  !doors.some((s) => /door\.body as [A-Z]/.test(s)));
ok('every customer door keeps the body-door marker',
  doors.every((s) => s.includes('THE BODY DOOR: an unreadable body is a client mistake')));

console.log('— the per-file honest bytes —');
ok('customers CREATE names the two raw fields; the re-casts are gone',
  read('src/app/api/customers/route.ts').includes('preferredChannel?: string;') &&
  read('src/app/api/customers/route.ts').includes('isActive?: boolean;') &&
  !read('src/app/api/customers/route.ts').includes('(body as Record<string, unknown>)'));
ok('the credit-ledger CREATE rides the toDec widening',
  read('src/app/api/customer-credits/route.ts').includes('amount?: number | string;'));
ok('the credit-ledger UPDATE graduated (THE EXEMPLAR GRADUATED)',
  read('src/app/api/customer-credits/[id]/route.ts').includes('THE EXEMPLAR GRADUATED') &&
  !read('src/app/api/customer-credits/[id]/route.ts').includes('readJsonBody<Record<string, unknown>>(request)'));
ok('the debt door rides the RedeemBody precedent (the trio REQUIRED)',
  read('src/app/api/debt/route.ts').includes('storeId: string;') &&
  read('src/app/api/debt/route.ts').includes('paymentMethod: string;'));
ok('the pay door borrows the route\u2019s OWN PaymentMethod union',
  read('src/app/api/debt-payment-plans/[id]/installments/[installmentId]/pay/route.ts').includes('paymentMethod?: PaymentMethod;'));
ok('the plan routes keep their own 400 voice (the door did not eat it)',
  plans.includes('Request body is not valid JSON.') &&
  planPatch.includes('Request body is not valid JSON.'));

console.log('— the ledger grew honestly (the graduation, three ways) —');
ok('the v2.326 census carries THE CUSTOMER GRADUATE and the two-remaining list',
  ledger.includes('THE CUSTOMER GRADUATE') &&
  ledger.includes("EXEMPLARS: string[] = [\n  'src/app/api/expenses/[id]/route.ts',\n  'src/app/api/suppliers/[id]/route.ts',\n];"));
ok('the v2.335 byte-exact pin grew with the honest list',
  ledger2335.includes("EXEMPLARS: string[] = [\\n  'src/app/api/expenses/[id]/route.ts',\\n  'src/app/api/suppliers/[id]/route.ts',\\n];"));
ok('the v2.336 presence pin flipped honestly',
  ledger2336.includes("'src/app/api/customer-credits/[id]/route.ts',\")).toBe(false);") &&
  ledger2336.includes('the customer graduate followed in v2.338.0'));
ok('the cust-debt collision ledger admitted the honest speaker (the ripple)',
  custDebtLedger.includes("'src/tests/customer-doors-v2338.test.ts',") &&
  custDebtLedger.includes('LEDGER-CITATION RIPPLE'));

console.log('— the law doc + the styling face —');
ok('the law doc records the fourth pass',
  helper.includes('v2.338.0 — THE CUSTOMER FAMILY') &&
  helper.includes("the wider class's fourth pass") &&
  helper.includes('exemplars (two remain)'));
ok('the credit-envelope meter wears the progressbar contract',
  desk.includes('data-testid="cust-debt-meter"') &&
  desk.includes('role="progressbar"') &&
  desk.includes('aria-valuenow={Math.round(pct)}'));
ok('the meter speaks the badge\u2019s own envelope and stays silent without one',
  desk.includes("const meterColor = pct > 50 ? 'bg-red-500' : 'bg-amber-500';") &&
  desk.includes('customer.currentDebtBalance > 0 && customer.debtLimit > 0'));

console.log('— the release voice —');
ok('the tightening ledger exists and pins the census + bytes + meter',
  test.includes('THE CUSTOMER DOORS SPEAK THEIR BODY SHAPE') &&
  test.includes('cust-debt-meter'));
ok("whats-new leads with the round\u2019s story",
  whatsNew.includes("version: '2.338.0',") &&
  whatsNew.includes('The customer doors speak their body\\u2019s shape'));
ok('the CHANGELOG carries the round (Added + Styling + Tests)',
  changelog.includes("## [2.338.0] The customer doors speak their body's shape") &&
  changelog.includes('THE CUSTOMER DOORS TIGHTENED (10 files)') &&
  changelog.includes('THE CREDIT-ENVELOPE METER'));
ok('the manifest answers 2.338.0 in all three slots',
  pkg.version === '2.338.0' && pkg.mbumah?.releaseVersion === '2.338.0' && pkg.mbumah?.baseVersion === '2.338.0');
ok('the verify gate itself is wired into the manifest',
  typeof pkg.scripts['verify:v2-338-0'] === 'string');

console.log('— the walk\u2019s anchors (green AFTER walk-v2338) —');
ok('the walk\u2019s history line landed (the cascade speaks 229/230/231/262)',
  changelogTest.includes('// v2.338.0:') && changelogTest.includes('entry joins the feed') &&
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(229)"));
ok('no stale anchor behind (the old counts are gone)',
  !changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(228)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
