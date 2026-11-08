#!/usr/bin/env node
// verify-v2-326-0.mjs — the round's FEATURE gate (v2.326.0 "the door reads
// every room" — THE POST-WIDE DOOR). The release MECHANICS (slots, VERSION,
// lead placement, CHANGELOG ordering, walk marks) live in verify-current.mjs.
// This script pins only what is NEW this round. Every check reads the SOURCE
// OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const helper = read('src/lib/request-body.ts');
const chrome = read('src/components/org/chrome.tsx');
const test = read('src/tests/body-door-class-v2326.test.ts');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pkg = JSON.parse(read('package.json'));
const docs = read('docs/cron-operations.md');
const journal = read('src/app/api/financial/journal/[id]/route.ts');

const DOOR_FILES = [
  'src/app/api/attendance/route.ts',
  'src/app/api/auth/login/route.ts',
  'src/app/api/banking/accounts/route.ts',
  'src/app/api/banking/reconciliations/route.ts',
  'src/app/api/banking/transactions/route.ts',
  'src/app/api/branches/route.ts',
  'src/app/api/cash-drawer/route.ts',
  'src/app/api/categories/route.ts',
  'src/app/api/customer-credits/route.ts',
  'src/app/api/customer-interactions/route.ts',
  'src/app/api/customers/route.ts',
  'src/app/api/debt-payment-plans/[id]/installments/[installmentId]/pay/route.ts',
  'src/app/api/debt-payment-plans/[id]/installments/[installmentId]/waive/route.ts',
  'src/app/api/debt/route.ts',
  'src/app/api/delivery-notes/route.ts',
  'src/app/api/employees/route.ts',
  'src/app/api/etims/issue-invoice/route.ts',
  'src/app/api/etims/register-product/route.ts',
  'src/app/api/etims/settings/route.ts',
  'src/app/api/expenses/route.ts',
  'src/app/api/financial/accounts/route.ts',
  'src/app/api/financial/budgets/recalculate/route.ts',
  'src/app/api/financial/budgets/route.ts',
  'src/app/api/financial/journal/route.ts',
  'src/app/api/financial/periods/route.ts',
  'src/app/api/financial/trial-balance/snapshot/route.ts',
  'src/app/api/gift-cards/[id]/adjust/route.ts',
  'src/app/api/gift-cards/[id]/redeem/route.ts',
  'src/app/api/gift-cards/redeem/route.ts',
  'src/app/api/gift-cards/route.ts',
  'src/app/api/health/circuit-breaker/route.ts',
  'src/app/api/health/dlq/route.ts',
  'src/app/api/invoices/route.ts',
  'src/app/api/leave-types/route.ts',
  'src/app/api/loyalty/campaigns/route.ts',
  'src/app/api/loyalty/tiers/route.ts',
  'src/app/api/loyalty/transactions/route.ts',
  'src/app/api/messages/route.ts',
  'src/app/api/messaging/bulk/route.ts',
  'src/app/api/payments/mpesa/callback/route.ts',
  'src/app/api/payments/mpesa/stkpush/route.ts',
  'src/app/api/products/bundles/route.ts',
  'src/app/api/products/route.ts',
  'src/app/api/profile/password/route.ts',
  'src/app/api/purchase-orders/route.ts',
  'src/app/api/rentals/[id]/return/route.ts',
  'src/app/api/rentals/route.ts',
  'src/app/api/reports/export/route.ts',
  'src/app/api/shift-schedules/[id]/route.ts',
  'src/app/api/shift-schedules/[id]/status/route.ts',
  'src/app/api/shift-schedules/route.ts',
  'src/app/api/shifts/[id]/end/route.ts',
  'src/app/api/shifts/route.ts',
  'src/app/api/stock-movements/route.ts',
  'src/app/api/store-transfers/route.ts',
  'src/app/api/subcategories/route.ts',
  'src/app/api/suppliers/[id]/send-order/route.ts',
  'src/app/api/suppliers/route.ts',
  'src/app/api/tax/categories/route.ts',
  'src/app/api/tax/filings/route.ts',
  'src/app/api/transactions/[id]/distribute-receipt/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/voucher-campaigns/route.ts',
  'src/app/api/vouchers/redeem/route.ts',
  'src/app/api/vouchers/route.ts',
  'src/app/api/whatsapp/send-document/route.ts',
  'src/app/api/whatsapp/send/route.ts',
];

const doorSrc = new Map(DOOR_FILES.map((f) => [f, read(f)]));

console.log('— the door home widened (lib/request-body.ts) —');
ok('the POST-WIDE law is written where the next reader meets it',
  helper.includes('THE POST-WIDE DOOR') && helper.includes('sweep widened from 19 files to 67'));
ok('the default generic IS the pre-door semantics (any, documented, lint-clean)',
  helper.includes('export async function readJsonBody<T = any>(') &&
  helper.includes('eslint-disable-next-line @typescript-eslint/no-explicit-any') &&
  helper.includes('zero type drift across the mechanical pass'));
ok('the door never throws and rejects non-objects (the v2.325 law stands)',
  helper.includes("if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))") &&
  helper.includes('return { ok: false };'));

console.log('— the class is gone from every room (67 files read through the door) —');
let doorImports = 0, doorMarkers = 0, bareReads = 0;
for (const [, src] of doorSrc) {
  if (src.includes("from '@/lib/request-body'")) doorImports++;
  if (src.includes('THE BODY DOOR: an unreadable body is a client mistake (v2.326.0)')) doorMarkers++;
  if (/(?:const|let|var)\s+\w+\s*=\s*await request\.json\(\)/.test(src)) bareReads++;
}
ok(`all 67 import the door (${doorImports}/67)`, doorImports === 67);
ok(`all 67 carry the marker (${doorMarkers}/67)`, doorMarkers === 67);
ok('not one declaring bare read remains (0/67)', bareReads === 0);
ok('the login route itself now reads through the door',
  doorSrc.get('src/app/api/auth/login/route.ts').includes('readJsonBody'));
ok('the webhook-heavy routes wear the door too (mpesa callback + stkpush)',
  doorSrc.get('src/app/api/payments/mpesa/callback/route.ts').includes('readJsonBody') &&
  doorSrc.get('src/app/api/payments/mpesa/stkpush/route.ts').includes('readJsonBody'));
ok('the named catch-swallow outlier converted (financial/journal/[id] — the 400 no longer lies)',
  !/await\s+request\.json\(\)\s*\.catch/.test(journal) &&
  journal.includes("readJsonBody<{ reason?: unknown }>(request)") &&
  journal.includes('the old `.catch(() => ({}))` swallow made a MALFORMED body look like'));
ok('the v2.325 exemplars keep their tightened generics (the widening never touched them)',
  ['src/app/api/categories/[id]/route.ts', 'src/app/api/gift-cards/[id]/route.ts', 'src/app/api/suppliers/[id]/route.ts']
    .every((f) => read(f).includes('readJsonBody<Record<string, unknown>>(request)')));

console.log('— the honest error face (the login dialog wears the LoginScreen law) —');
ok('the mistake is announced, iconed, and dark-mode-safe',
  chrome.includes('THE HONEST ERROR FACE (v2.326.0)') &&
  chrome.includes('role="alert"') && chrome.includes('aria-live="assertive"') &&
  chrome.includes('<AlertCircle') &&
  chrome.includes('dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'));
ok('the honest gate answers an empty submission before the network',
  chrome.includes('THE HONEST GATE (v2.326.0)') &&
  chrome.includes("'Enter both your email and your password to sign in.'"));
ok('a stale error cannot outlive its cause (both inputs clear on edit)',
  (chrome.match(/if \(err\) setErr\(null\);/g) || []).length >= 2);
ok('the busy face spins',
  chrome.includes('<Loader2') && chrome.includes('animate-spin'));

console.log('— the round\u2019s own test file —');
ok('the test file pins the truth table, the 67-file sweep, the exemplars, the face',
  test.includes('THE CLASS IS GONE') && test.includes('DOOR_FILES') &&
  test.includes('EXEMPLARS') && test.includes('THE HONEST ERROR FACE'));

console.log('— the release voice —');
ok("whats-new leads with the round\u2019s story",
  whatsNew.includes("version: '2.326.0',") && whatsNew.includes('The door reads every room') && whatsNew.includes('67 API routes'));
ok('the CHANGELOG carries the round (Fixed + Added + Styling + Tests)',
  changelog.includes('## [2.326.0] The door reads every room') &&
  changelog.includes('THE POST-WIDE DOOR') && changelog.includes('THE HONEST ERROR FACE'));
ok('the manifest answers 2.326.0 in all three slots',
  pkg.version === '2.326.0' && pkg.mbumah?.releaseVersion === '2.326.0' && pkg.mbumah?.baseVersion === '2.326.0');
ok('the docs register carries the door note',
  docs.includes('**v2.326.0**') && docs.includes('the door reads every room'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
