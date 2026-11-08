#!/usr/bin/env node
// verify-v2-310-0.mjs — the round's FEATURE gate (v2.310.0 "The claw speaks at its desks").
// The release MECHANICS (slots, VERSION, lead placement, CHANGELOG ordering,
// walk marks) live in verify-current.mjs now — the pin unwind (Task 27's
// standing item). This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const utils = read('src/lib/loyalty-utils.ts');
const card = read('src/components/loyalty/loyalty-card.tsx');
const desk = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const route = read('src/app/api/customers/[id]/loyalty/route.ts');
const api = read('src/lib/api.ts');
const tab = read('src/app/(shell)/tabs/transactions-tab.tsx');
const faceTest = read('src/tests/lib/loyalty-clawback-face.test.ts');
const svc = read('src/lib/sale-refund-service.ts');

console.log('— the claw\u2019s voice (loyalty-utils.ts) —');
ok('the identity predicate exists (one law, two desks)', utils.includes('export function isRefundClawbackTx('));
ok('the predicate is strict: negative points + ADJUST/ADJUSTED + the reason voice', utils.includes("tx.points >= 0) return false") && utils.includes("kind !== 'ADJUST' && kind !== 'ADJUSTED'") && utils.includes("startsWith(REFUND_CLAWBACK_REASON_PREFIX)"));
ok('the contract prefix matches the v2.309 write voice', utils.includes("REFUND_CLAWBACK_REASON_PREFIX = 'Refund clawback'") && svc.includes('reason: `Refund clawback for ${original.receiptNumber}`'));
ok('the paper-trail parse exists (never invents a trail)', utils.includes('export function parseClawbackOriginalReceipt(') && utils.includes('/^Refund clawback for (\\S+)/'));

console.log('— the customer card face (loyalty-card.tsx) —');
ok('the clawback wears rose with the RotateCcw voice', card.includes("label: 'Clawback'") && card.includes('text-rose-700 dark:text-rose-400') && card.includes('icon: RotateCcw'));
ok('the row is recognized by the SAME predicate', card.includes('isRefundClawbackTx(tx)'));
ok('the row names the refund receipt (reference first, parse as fallback)', card.includes('tx.reference ?? parseClawbackOriginalReceipt(tx.reason)'));
ok('the clawback row carries its rose tint', card.includes('border-rose-200/70 bg-rose-50/40'));
ok('the lifetime claw rides the API shape', card.includes('totalClawedBack: number;'));
ok('the claw stat cell only speaks when it has something to say', card.includes('data.totalClawedBack > 0 && (') && card.includes('points returned with refunds'));
ok('the claw stat cell speaks to AT (role=note + aria-label)', card.includes('role="note"') && card.includes('Lifetime loyalty points returned with refunds'));

console.log('— the desk ledger face (loyalty-tab.tsx) —');
ok('the desk imports the SAME predicate (one law, two faces)', desk.includes("import { isRefundClawbackTx } from '@/lib/loyalty-utils';"));
ok('the desk\u2019s clawback badge wears rose', desk.includes("label: 'Clawback'") && desk.includes('icon: RotateCcw'));
ok('the desk row carries its rose tint', desk.includes('bg-rose-50/40 hover:bg-rose-50/70'));
ok('the sign law is explicit (positives speak +, negatives carry their own minus)', desk.includes("tx.points > 0 ? '+' : ''"));
ok('the reference cell shows the REFUND receipt for clawbacks', desk.includes('isClawback && tx.reference') && desk.includes('title={`Refund receipt ${tx.reference}`}'));

console.log('— the API truth (route + client type) —');
ok('the route aggregates the lifetime claw from the clawback voice', route.includes("reason: { startsWith: 'Refund clawback' }") && route.includes('totalClawedBack'));
ok('the claw is an absolute (the sum of negatives reads as a positive taken)', route.includes('Math.abs(clawAgg._sum.points ?? 0)'));
ok('the route maps the refund receipt through (reference rides)', route.includes('reference: t.reference ?? null'));
ok('the client type carries the additive fields', api.includes('reason?: string | null;') && api.includes('reference?: string | null;'));

console.log('— the direct print (transactions-tab.tsx) —');
ok('the success desk offers Print receipt beside View', tab.includes("'Print receipt'") && tab.includes('handlePrintRefundReceipt'));
ok('print fetches the SAME REFUND detail (no shortcut past the truth)', tab.includes('const receiptTx = await transactionsApi.get(result.refund.id);'));
ok('the viewer arms auto-print (one-shot tripwire, re-armed on close)', tab.includes('autoPrintFiredRef') && tab.includes('autoPrintFiredRef.current = false;') && tab.includes('autoPrintFiredRef.current = true;'));
ok('auto-print fires through the shared print pipeline', tab.includes('printReceiptElement(RECEIPT_CONTENT_ID)'));
ok('the parent disarms on viewer close (no ghost print later)', tab.includes('if (!nextOpen) setReceiptAutoPrint(false);'));

console.log('— the identity law\u2019s pins —');
ok('the face test pins both API shapes and the guards', faceTest.includes('isRefundClawbackTx') && faceTest.includes('a manual adjustment is NOT a clawback') && faceTest.includes('a redemption is NOT a clawback'));
ok('the face test pins the paper-trail parse round-trip', faceTest.includes('round-trips with the clawback write'));

console.log('— the QA catch (the modern voices pass through) —');
ok('normalizeLegacyType passes the MODERN voices unchanged', utils.includes('if ((LOYALTY_TRANSACTION_TYPES as readonly string[]).includes(legacyType))') && utils.includes('return legacyType;'));
ok('the catch is named in the source (the story stays with the code)', utils.includes('v2.310.0 QA catch'));
ok('the face test pins the pass-through (ADJUSTED never reads as Earned)', faceTest.includes("normalizeLegacyType('ADJUSTED')").valueOf() && faceTest.includes('ADJUSTED must never read as Earned'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
