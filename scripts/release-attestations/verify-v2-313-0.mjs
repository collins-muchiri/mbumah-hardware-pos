#!/usr/bin/env node
// verify-v2-313-0.mjs — the round's FEATURE gate (v2.313.0 "The ask lands; the dock says why").
// The release MECHANICS (slots, VERSION, lead placement, CHANGELOG ordering,
// walk marks) live in verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const boot = read('src/app/(shell)/page.tsx');
const route = read('src/app/api/loyalty/transactions/route.ts');
const policy = read('src/lib/loyalty-adjust-policy.ts');
const dialog = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const api = read('src/lib/api.ts');
const captureTest = read('src/tests/deep-link-capture-v2313.test.ts');
const dockTest = read('src/tests/dock-reason-v2313.test.ts');

console.log('— the capture law ((shell)/page.tsx) —');
ok('the ask is captured at first render (lazy useState, SSR-guarded)', boot.includes('const [initialSearch] = useState(() =>') && boot.includes("typeof window !== 'undefined' ? window.location.search : ''"));
ok('consumeDeepLink parses the CAPTURE, never the live bar', boot.includes('parseInitialTab(\n          initialSearch,') && !boot.includes('parseInitialTab(\n          window.location.search'));
ok('the mechanism is documented where the next reader trips', boot.includes('CHILD effects before PARENT effects') && boot.includes('THE CAPTURE LAW'));
ok('the v2.311 one-consumer law still holds', boot.includes('.then(consumeDeepLink, consumeDeepLink)') && !boot.includes('sp.delete('));

console.log('— the dock says why (loyalty-adjust-policy.ts) —');
ok('the pure predicate exists and is exported', policy.includes('export function dockNeedsReason('));
ok('the law is tight: ADJUST + negative + no words', policy.includes("transactionType !== 'ADJUST'") && policy.includes('!(points < 0)') && policy.includes("description.trim().length === 0"));
ok('one voice for the route 400 and one for the face', policy.includes('DOCK_REASON_REQUIRED_MESSAGE') && policy.includes('DOCK_REASON_HINT') && policy.includes('A negative adjustment requires a reason.') && policy.includes('the ledger must say why'));

console.log('— the route door (POST /api/loyalty/transactions) —');
ok('an anonymous dock 400s with the shared voice', route.includes('dockNeedsReason(tType, pointsValue, description)') && route.includes('error: DOCK_REASON_REQUIRED_MESSAGE') && route.includes('{ status: 400 }'));
ok('the reference folds both voices (reference ?? referenceId)', route.includes('referenceId,') && route.includes('const effectiveReference = reference ?? referenceId ?? null;') && route.includes('reference: effectiveReference,'));
ok('the tierless-store bomb is dead (no literal FK id in the fallback)', !route.includes("firstTier?.id || 'default'") && route.includes('tierId: firstTier?.id || null,') && route.includes('tierAchievedAt: firstTier ? new Date() : null,'));
{
  const txn = route.split('await db.$transaction(async (tx) => {')[1]?.split('return loyaltyTx;')[0] ?? '';
  ok('THE WALLET LAW: both ledgers move in the same transaction', txn.includes('tx.customer.update({') && txn.includes('loyaltyPoints: { increment: finalPoints }') && txn.includes('THE WALLET LAW'));
}

console.log('— both dialogs wear the law —');
ok('members-row dialog: aria wiring + Apply gated', dialog.includes('aria-describedby="adjust-points-reason-hint"') && dialog.includes('disabled={!adjustPointsForm.points || dockNeedsReason(adjustPointsForm.type, Number(adjustPointsForm.points), adjustPointsForm.description) || createTxMutation.isPending}'));
ok('manual dialog: aria wiring + Apply gated + the real wire name', dialog.includes('aria-describedby="manual-adjust-reason-hint"') && dialog.includes('dockNeedsReason(manualAdjustForm.transactionType, Number(manualAdjustForm.points), manualAdjustForm.description)') && dialog.includes('reference: manualAdjustForm.reference || undefined,'));
ok('the historical silent-drop is dead (no referenceId leaves the dialog)', !dialog.includes('referenceId: manualAdjustForm.reference'));
ok('both faces voice the rose hint (aria-live, dark variants)', dialog.split('{DOCK_REASON_HINT}').length - 1 === 2 && dialog.includes('aria-live="polite"') && dialog.includes('text-rose-600 dark:text-rose-400') && dialog.includes('AlertCircle'));
ok('the ledger reads the wire field first (reference ?? referenceId)', dialog.includes("tx.reference ?? tx.referenceId ?? '-'"));

console.log('— the client type carries both names —');
ok('api.ts: reference is the wire name, referenceId stays accepted', api.includes('description?: string; reference?: string; referenceId?: string;'));

console.log('— the face tests hold the laws —');
ok('the capture test exists with the parse contracts', captureTest.includes('the ask is read once, at first render') && captureTest.includes('parseInitialTab(captured, TABS)).toBe'));
ok('the dock test exists with the full truth table', dockTest.includes('a negative ADJUST without a reason is a dock that must say why') && dockTest.includes("expect(dockNeedsReason('ADJUST', -50, '   ')).toBe(true)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
