#!/usr/bin/env node
// verify-v2-314-0.mjs — the round's FEATURE gate (v2.314.0 "The wallet is the only balance").
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

const route = read('src/app/api/loyalty/transactions/route.ts');
const policy = read('src/lib/loyalty-adjust-policy.ts');
const dialog = read('src/app/(shell)/tabs/loyalty-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const test = read('src/tests/wallet-laws-v2314.test.ts');

console.log('— the wallet is the only balance (loyalty-adjust-policy.ts) —');
ok('the insufficient voice exists, names the canonical balance', policy.includes('export function walletInsufficientMessage(wallet: number): string') && policy.includes('Insufficient loyalty points. Customer has'));
ok('the voice clamps honest at zero', policy.includes('Math.max(0, Math.floor(wallet))'));
ok('the manual-expire refusal points at the Expiry desk', policy.includes('MANUAL_EXPIRE_REFUSAL_MESSAGE') && policy.includes('Points expire through the Expiry desk (a FIFO policy sweep), not by hand.'));
ok('the dialog note is the pointer voice', policy.includes('EXPIRE_POLICY_NOTE') && policy.includes('Points expire through the Expiry desk — policy sweeps, not by hand.'));
ok('the writable-type union shrank (no manual EXPIRE)', policy.includes("export type AdjustTransactionType = 'EARN' | 'REDEEM' | 'BONUS' | 'ADJUST';"));

console.log('— the route door (POST /api/loyalty/transactions) —');
ok('sufficiency reads the canonical wallet for every negative movement', route.includes('if (finalPoints < 0 && customer.loyaltyPoints < Math.abs(finalPoints)) {') && route.includes('error: walletInsufficientMessage(customer.loyaltyPoints)'));
ok('the shadow is no longer read by the check (only maintained as a mirror)', !route.includes('db.customerLoyalty.findFirst'));
ok('EXPIRE is refused at the door with the shared voice', route.includes("if (tType === 'EXPIRE') {") && route.includes('error: MANUAL_EXPIRE_REFUSAL_MESSAGE'));
ok('the claim shape: conditional decrement inside the transaction', route.includes('loyaltyPoints: { gte: Math.abs(finalPoints) }') && route.includes('loyaltyPoints: { decrement: Math.abs(finalPoints) }') && route.includes('if (claim.count === 0) {') && route.includes('throw new WalletClaimLostError();'));
ok('a lost claim rolls back and voices the balance at claim time', route.includes('if (transaction instanceof WalletClaimLostError) {') && route.includes('error: walletInsufficientMessage(fresh?.loyaltyPoints ?? 0)'));
ok('grants still increment unconditionally', route.includes('if (finalPoints > 0) {') && route.includes('data: { loyaltyPoints: { increment: finalPoints } },'));
ok('the v2.313 laws still stand (dock reason + reference fold + wallet law)', route.includes('dockNeedsReason(tType, pointsValue, description)') && route.includes('const effectiveReference = reference ?? referenceId ?? null;') && route.includes('THE WALLET LAW'));

console.log('— the manual dialog wears the expiry law —');
ok('the type picker no longer offers the bypass (exactly one EXPIRE SelectItem remains — the filter)', dialog.split('<SelectItem value="EXPIRE">Expire</SelectItem>').length - 1 === 1);
ok('the amber note points at the Expiry desk (the Expiry amber)', dialog.includes('{EXPIRE_POLICY_NOTE}') && dialog.includes('text-amber-700 dark:text-amber-400') && dialog.includes('bg-amber-50 dark:bg-amber-950/40') && dialog.includes('Hourglass'));
ok('the v2.313 dock-reason faces still hold', dialog.split('{DOCK_REASON_HINT}').length - 1 === 2 && dialog.includes('aria-live="polite"'));

console.log('— the face tests + release voice —');
ok('the wallet-laws test exists with the truth table', test.includes('the insufficient voice names the canonical balance, clamped at zero') && test.includes("walletInsufficientMessage(-90)).toBe('Insufficient loyalty points. Customer has 0 points.')"));
ok('whats-new leads with the round\u2019s story', whatsNew.includes("version: '2.314.0'") && whatsNew.includes('The wallet is the only balance'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
