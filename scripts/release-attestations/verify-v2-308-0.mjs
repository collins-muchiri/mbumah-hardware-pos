#!/usr/bin/env node
// verify-v2-308-0.mjs — the round's gate (v2.308.0 "The refund comes home").
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const svc = read('src/lib/sale-refund-service.ts');
const helper = read('src/lib/account-helper.ts');
const route = read('src/app/api/transactions/[id]/refund/route.ts');
const perms = read('src/lib/permissions.ts');
const vals = read('src/lib/validations.ts');
const api = read('src/lib/api.ts');
const tab = read('src/app/(shell)/tabs/transactions-tab.tsx');
const schema = read('prisma/schema.prisma');
const migration = read('prisma/migrations/20261031150000_add_sale_refunds/migration.sql');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pure = read('src/tests/lib/sale-refund-pure.test.ts');
const audit = read('src/tests/lib/sale-refund-audit.test.ts');

console.log('— the release face —');
ok('pkg version = 2.308.0 (all three slots)', pkg.version === '2.308.0' && pkg.mbumah?.releaseVersion === '2.308.0' && pkg.mbumah?.baseVersion === '2.308.0');
ok('VERSION = 2.308.0', version === '2.308.0');
ok('whats-new lead = 2.308.0 with the round\u2019s title', feed.includes("version: '2.308.0',") && feed.includes('The refund comes home'));
const leadIdx = feed.indexOf("version: '2.308.0',");
ok('the lead entry sits FIRST (newest above all)', leadIdx >= 0 && feed.indexOf('version:') < leadIdx);
ok('CHANGELOG carries [2.308.0] above [2.306.0]', changelog.indexOf('[2.308.0]') >= 0 && changelog.indexOf('[2.308.0]') < changelog.indexOf('[2.306.0]'));

console.log('— the refund chain (schema + migration) —');
ok('the schema carries the refund chain (both columns)', schema.includes('refundedTransactionId String?') && schema.includes('refundedSaleItemId String?'));
ok('the self-relations are named (SaleRefunds / SaleItemRefunds)', schema.includes('@relation("SaleRefunds"') && schema.includes('@relation("SaleItemRefunds"'));
ok('the chain is indexed', schema.includes('@@index([refundedTransactionId])') && schema.includes('@@index([refundedSaleItemId])'));
ok('the migration matches the columns', migration.includes('ADD COLUMN "refundedTransactionId"') && migration.includes('ADD COLUMN "refundedSaleItemId"'));
ok('the migration guards its FKs (idempotent DO block)', migration.includes('IF NOT EXISTS (SELECT 1 FROM pg_constraint'));

console.log('— the pure seam (sale-refund-service.ts) —');
ok('the typed RefundError + the six codes', svc.includes("export type RefundErrorCode") && svc.includes("'LINE_OVER_REFUND'") && svc.includes("'AMOUNT_OVER_REFUND'") && svc.includes("'TENANT_MISMATCH'") && svc.includes("'NOT_REFUNDABLE'") && svc.includes("'EMPTY_REFUND'"));
ok('refundableLinesFrom builds the chain views', svc.includes('export function refundableLinesFrom('));
ok('computeRefundPlan speaks the EXACTNESS LAW (the exhausting tranche charges the remainder)', svc.includes('export function computeRefundPlan(') && svc.includes('remainingValueBefore'));
ok('the VAT-inside split law (the same formula as checkout)', svc.includes('export function splitRefundAmounts(') && svc.includes('.taxComponent('));
ok('applySaleRefund opens the ONE interactive transaction', svc.includes('export async function applySaleRefund(') && svc.includes('client.$transaction'));
ok('the guard re-reads INSIDE the tx (no TOCTOU)', svc.includes('if (original.storeId !== params.storeId) throw new RefundError(\'TENANT_MISMATCH\')'));
ok('the refund chain re-derivation (refundedTransactionId lookup)', svc.includes("where: { refundedTransactionId: original.id }"));
ok('the refund transaction carries the link both ways', svc.includes('refundedTransactionId: original.id') && svc.includes('refundedSaleItemId: a.line.saleItemId'));
ok('restock writes RETURN movements with replay keys', svc.includes("movementType: 'RETURN'") && svc.includes('idempotencyKey: `refund:${refundTx.id}:'));
ok('the drawer speaks the SIGNED negative amount', svc.includes('amount: -cashPortion'));
ok('the DEBT portion writes the credit note + conditional decrement', svc.includes('currentDebtBalance: { decrement }') && svc.includes('amountOwed: -debtPortion'));
ok('the original flips REFUNDED only when nothing remains', svc.includes("newOriginalStatus = originalRemaining <= 0.004 ? 'REFUNDED' : 'PARTIAL'"));

console.log('— the mirror journal (account-helper.ts) —');
ok('recordRefundJournalEntry exists (the sale entry\u2019s mirror)', helper.includes('export async function recordRefundJournalEntry('));
ok('it debits revenue + VAT and credits the tender legs', helper.includes('Sales revenue reversal for ${originalReceiptNumber}') && helper.includes('Cash refunded for ${originalReceiptNumber}'));
ok('the COGS reversal puts the goods back (Inventory debit)', helper.includes('Inventory returned for ${originalReceiptNumber}'));
ok('referenceType is REFUND', helper.includes("referenceType: 'REFUND',"));
ok('the golden-rule backstop throws on imbalance', helper.includes('Refund journal entry unbalanced for'));

console.log('— the API route —');
ok('the route is store-scoped (requireStoreAccess)', route.includes('requireStoreAccess(refundTransactionHandler)'));
ok('the feature gate feeds the abuse engine', route.includes("hasFeaturePermission(session.role, 'pos.refund')") && route.includes("noteDeniedAndMaybeLock({ session, request, permission: 'pos.refund' })"));
ok('RefundError codes map to safe statuses (no internals)', route.includes('REFUND_ERROR_STATUS[error.code]'));
ok('the audit trail is best-effort (never blocks a committed refund)', route.includes("action: 'REFUND'") && route.includes('audit chain must never block a committed refund'));
ok('GET returns the refundable-line views (the dialog\u2019s truth)', route.includes('requireStoreAccess(refundableLinesHandler)') && route.includes('toRefundableTotal(lines)'));

console.log('— the permission + validation faces —');
ok('pos.refund is a manager-tier key', perms.includes("'pos.refund': ['BRANCH_MANAGER', 'STORE_OWNER', 'SUPER_ADMIN'],"));
ok('the denial message speaks', perms.includes('"You don\u0027t have permission to refund sales. Ask your Branch Manager."') || perms.includes("Ask your Branch Manager."));
ok('refundSchema validates per-line quantities', vals.includes('export const refundSchema') && vals.includes("saleItemId: z.string().min(1)") && vals.includes('quantity: z.coerce.number().positive()'));
ok('REFUND_REASONS vocabulary exists', vals.includes('export const REFUND_REASONS') && vals.includes("'WARRANTY_CLAIM'"));

console.log('— the client (api.ts + the transactions desk) —');
ok('transactionsApi.refund + refundableLines ride api.ts', api.includes('refundableLines: async (id: string)') && api.includes('`/transactions/${id}/refund`'));
ok('the RefundDialog replaced the placeholder confirm', tab.includes('function RefundDialog(') && !tab.includes('Refund placeholder - would call API'));
ok('the desk fetches the server\u2019s refundable lines (never a client guess)', tab.includes('transactionsApi.refundableLines(transaction.id)'));
ok('the exhausted line wears the honest pill', tab.includes('Fully refunded'));
ok('the Refund button is feature-gated (manager tier)', tab.includes("hasFeaturePermission(user?.role, 'pos.refund')"));
ok('the button also speaks on PARTIAL sales', tab.includes("['COMPLETED', 'PARTIAL'].includes(transaction.paymentStatus)"));
ok('the restock toggle keeps its emerald identity', tab.includes('accent-emerald-600'));

console.log('— the tests —');
ok('the pure truth table exists (the exactness law pinned)', pure.includes('computeRefundPlan') && pure.includes('sum EXACTLY to the line total'));
ok('the DB truth exists (the atomic truth pinned)', audit.includes('applySaleRefund') && audit.includes('balanced audit trail') && audit.includes("hasFeaturePermission('CASHIER', 'pos.refund')).toBe(false)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
