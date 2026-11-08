#!/usr/bin/env node
// verify-v2-309-0.mjs — the round's gate (v2.309.0 "The refund leaves a paper trail").
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
const route = read('src/app/api/transactions/[id]/refund/route.ts');
const api = read('src/lib/api.ts');
const tab = read('src/app/(shell)/tabs/transactions-tab.tsx');
const admin = read('src/app/(shell)/tabs/admin-tab.tsx');
const receipt = read('src/components/receipt-print.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const pure = read('src/tests/lib/sale-refund-pure.test.ts');
const changelogTest = read('src/tests/console-changelog.test.ts');

console.log('— the release face —');
ok('pkg version = 2.309.0 (all three slots)', pkg.version === '2.309.0' && pkg.mbumah?.releaseVersion === '2.309.0' && pkg.mbumah?.baseVersion === '2.309.0');
ok('VERSION = 2.309.0', version === '2.309.0');
ok('whats-new lead = 2.309.0 with the round\u2019s title', feed.includes("version: '2.309.0',") && feed.includes('The refund leaves a paper trail'));
const leadIdx = feed.indexOf("version: '2.309.0',");
ok('the lead entry sits FIRST (newest above all)', leadIdx >= 0 && feed.indexOf('version:') < leadIdx);
ok('CHANGELOG carries [2.309.0] above [2.308.0]', changelog.indexOf('[2.309.0]') >= 0 && changelog.indexOf('[2.309.0]') < changelog.indexOf('[2.308.0]'));
ok('the verify gate is wired (verify:v2-309-0)', read('package.json').includes('"verify:v2-309-0": "node scripts/verify-v2-309-0.mjs"'));

console.log('— the loyalty clawback (sale-refund-service.ts) —');
ok('the pure clawback law exists (floor rule + wallet cap)', svc.includes('export function refundClawbackPoints(') && svc.includes('calculateEarnedPoints(refundTotal)'));
ok('the claw reuses the EARNING law (one rule, two directions)', svc.includes("import { calculateEarnedPoints } from '@/lib/loyalty-utils';"));
ok('step 8 reads the wallet INSIDE the tx', svc.includes('select: { loyaltyPoints: true }'));
ok('the claim is conditional (a concurrently-redeemed wallet forgives the claw)', svc.includes('where: { id: original.customerId, loyaltyPoints: { gte: claw } }'));
ok('the ADJUST row links to the REFUND transaction', svc.includes("transactionType: 'ADJUST'") && svc.includes("type: 'ADJUSTED'") && svc.includes('transactionId: refundTx.id'));
ok('the row names the original sale (the ledger can tell the story)', svc.includes('reason: `Refund clawback for ${original.receiptNumber}`'));
ok('the result carries the clawback (API truth, not a toast guess)', svc.includes('loyalty: { clawedBack: number; balanceAfter: number } | null') && svc.includes('loyalty,'));
ok('the docstring retracts the v2.308 out-of-scope note', svc.includes('LOYALTY CLAWBACK (v2.309.0') && !svc.includes('deliberately OUT of scope'));

console.log('— the receipt face (receipt-print.tsx) —');
ok('a REFUND receipt wears the amber banner', receipt.includes('Refund receipt — money returned to the customer'));
ok('the banner speaks to AT (role=note + aria-label)', receipt.includes('role="note"') && receipt.includes('This is a refund receipt'));
ok('the paper names the original sale (Refund of: meta line)', receipt.includes('Refund of:') && receipt.includes('notes?.match(/Refund of (\\S+)/)'));
ok('the banner only speaks on REFUND transactions', receipt.includes("transaction.transactionType === 'REFUND'"));

console.log('— the success desk (transactions-tab.tsx) —');
ok('the dialog stays open after the commit (setResult, not snap-shut)', tab.includes('setResult(committed)') && !tab.includes('onRefunded();\n      onOpenChange(false);'));
ok('the success face speaks the money returned headline', tab.includes('Money returned'));
ok('the fully/partially-refunded pill tells the truth', tab.includes("result.originalPaymentStatus === 'REFUNDED' ? 'Sale fully refunded' : 'Sale marked partially refunded'"));
ok('the loyalty clawback line speaks the wallet', tab.includes('returned with the refund — wallet now') && tab.includes('No loyalty points to return'));
ok('the remaining-refundable line stays honest', tab.includes('remains refundable on the original sale'));
ok('View refund receipt fetches the REFUND detail (transactionsApi.get)', tab.includes('transactionsApi.get(result.refund.id)'));
ok('the handover opens the branded receipt viewer', tab.includes('setReceiptTransaction(receiptTx);') && tab.includes('setReceiptOpen(true);'));
ok('the success face resets with the dialog (no stale receipt on reopen)', tab.includes('setResult(null);') && tab.includes('setReceiptBusy(false);'));

console.log('— the quiet fix (api.ts + admin-tab.tsx) —');
ok('the audit-logs shape is AuditLogEntry (the duplicate name retired)', api.includes('export interface AuditLogEntry {') && !api.split('export interface AuditLogItem {').slice(1).some((s) => s.includes('export interface AuditLogItem {')));
ok('exactly ONE AuditLogItem remains (the financial audit trail\u2019s)', api.split('export interface AuditLogItem {').length === 2);
ok('auditLogsApi speaks AuditLogEntry', api.includes('request<AuditLogEntry[]>(`/audit-logs?'));
ok('the admin tab\u2019s Activity Feed follows the rename', admin.includes('type AuditLogEntry,') && admin.includes('logs: AuditLogEntry[]'));

console.log('— the chain reference (the QA catch, v2.309.0) —');
ok('the notes ALWAYS carry the chain reference (reason or not)', svc.includes('`Refund of ${original.receiptNumber}`') && svc.includes(".filter(Boolean)"));
ok('the receipt\u2019s Refund-of line can always resolve', receipt.includes('notes?.match(/Refund of (\\S+)/)'));

console.log('— the API truth (route rides the field) —');
ok('the route returns the service result verbatim (loyalty rides along)', route.includes('Response.json({ success: true, data: result }'));
ok('RefundResult carries the clawback (client type)', api.includes('loyalty: { clawedBack: number; balanceAfter: number } | null;'));

console.log('— the re-anchor (the walk\u2019s marks) —');
ok('the cascade history line landed (console-changelog.test.ts)', changelogTest.includes('v2.309.0: the refund\'s-paper-trail entry joins the feed'));
ok('the anchors re-keyed +1 (the real asserts)', changelogTest.includes("expect(whatsNewUnreadCount('2.110.0')).toBe(200);") && changelogTest.includes("expect(whatsNewUnreadCount('2.77.0')).toBe(233);"));
ok('no stale 2.309 anchors behind (the old counts are gone)', !changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(199);"));

console.log('— the tests —');
ok('the clawback law is pinned (symmetry, cap, zero guards)', pure.includes('refundClawbackPoints') && pure.includes('SUPERADDITIVITY'));
ok('the exactness law still stands (v2.308\u2019s truth table)', pure.includes('sum EXACTLY to the line total'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
