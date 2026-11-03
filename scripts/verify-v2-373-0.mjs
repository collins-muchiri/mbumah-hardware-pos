#!/usr/bin/env node
// verify-v2-373-0.mjs — the round's FEATURE gate (v2.373.0 "the stranded
// gap settles"). The release MECHANICS live in verify-current.mjs.
// This script pins only what is NEW this round: the row-level settle
// affordance (the pure row-state voice, the list route's one-query chain,
// the four chips), the stranded-gap heal (the pure assessment, the
// transactional zero-item settle, the route's gate posture), and the
// suite that speaks for both.
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
const LIST = read('src/app/api/transactions/route.ts');
const HEAL_ROUTE = read('src/app/api/transactions/[id]/refund-heal/route.ts');
const API = read('src/lib/api.ts');
const SUITE = read('src/tests/refund-stranded-heal-v2373.test.ts');
const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the row-state voice (the pure seam) —');
ok('deriveRefundRowState IS EXPORTED from the service',
  SERVICE.includes('export function deriveRefundRowState('));
ok('THE FOUR KINDS ARE THE VOICE\u2019S WHOLE VOCABULARY',
  SERVICE.includes("'SETTLES_FULL'\n  | 'SETTLES_FULL_WITH_GAP'\n  | 'STRANDED'\n  | 'SETTLED'"));
ok('THE STRANDED EPSILON IS THE STATUS LAW\u2019S OWN TOLERANCE',
  SERVICE.includes('export const STRANDED_EPSILON = 0.004;'));
ok('THE ROW VOICE REFUSES non-sale rows and non-refundable statuses',
  SERVICE.includes("if (args.transactionType !== 'SALE' || !REFUNDABLE_ORIGINAL_STATUSES.includes(args.paymentStatus)) {\n    return null;\n  }"));
ok('THE GAP IS THE HEADER ABOVE THE LINE Σ (clamped, 2dp)',
  SERVICE.includes('round2(Math.max(0, toDec(fullRefundAmount).minus(refundableTotal).toNumber()))'));
ok('THE AFFORDANCE IS DOCUMENTED AT SOURCE',
  SERVICE.includes('THE ROW-LEVEL SETTLE AFFORDANCE (v2.373.0)'));

console.log('— the stranded assessment + the heal (the pure seam, then the transaction) —');
ok('assessStrandedOriginal IS EXPORTED and speaks the two-field truth',
  SERVICE.includes('export function assessStrandedOriginal(')
  && SERVICE.includes('return { stranded, strandedAmount: stranded ? strandedAmount : 0 };'));
ok('THE ASSESSMENT REQUIRES EVERY LINE EXHAUSTED and a positive remainder',
  SERVICE.includes('const allExhausted = views.every((l) => l.refundableQuantity <= 1e-9);')
  && SERVICE.includes('const stranded = allExhausted && strandedAmount > STRANDED_EPSILON;'));
ok('healStrandedOriginal IS EXPORTED and carries the healed marker',
  SERVICE.includes('export async function healStrandedOriginal(')
  && SERVICE.includes('healed: true,'));
ok('THE HEAL RE-DERIVES THE ASSESSMENT INSIDE ITS TRANSACTION (no TOCTOU)',
  SERVICE.indexOf('const assessment = assessStrandedOriginal(views, expectedTotal);') > SERVICE.indexOf('client.$transaction(async (tx) => {', SERVICE.indexOf('export async function healStrandedOriginal'))
  && SERVICE.includes("throw new RefundError('NOT_STRANDED', {"));
ok('NOT_STRANDED IS A TYPED CODE with a human line',
  SERVICE.includes("| 'NOT_STRANDED';")
  && SERVICE.includes('NOT_STRANDED: \u0027This sale has no stranded gap to settle'));
ok('THE REFUND EVENT IS ZERO-ITEM (the money settles the HEADER)',
  SERVICE.includes('items: { create: [] },'));
ok('THE CHAIN REFERENCE ALWAYS RIDES THE NOTES (the receipt\u2019s meta line reads it)',
  SERVICE.includes("`Refund of ${original.receiptNumber}`"));
ok('THE HEAL FLIPS THE ORIGINAL TO REFUNDED and reports the prior status',
  SERVICE.includes('data: { paymentStatus: \u0027REFUNDED\u0027 },')
  && SERVICE.includes('originalPriorPaymentStatus: original.paymentStatus,'));

console.log('— the heal route (the refund gate\u2019s own posture) —');
ok('THE ROUTE EXISTS and wraps requireStoreAccess',
  HEAL_ROUTE.includes('requireStoreAccess(refundHealHandler)')
  && HEAL_ROUTE.includes("'TRANSACTION_REFUND_HEAL',"));
ok('THE GATE IS pos.refund (the heal IS a money-out refund)',
  HEAL_ROUTE.includes("hasFeaturePermission(session.role, 'pos.refund')"));
ok('THE ABUSE ENGINE FEDS the denials (record + note)',
  HEAL_ROUTE.includes("recordPermissionDenied({ session, permission: 'pos.refund', request })")
  && HEAL_ROUTE.includes("noteDeniedAndMaybeLock({ session, request, permission: 'pos.refund' })"));
ok('AN EMPTY BODY IS LEGAL (the settle needs no allocation)',
  HEAL_ROUTE.includes('await request.json().catch(() => ({}))'));
ok('NOT_STRANDED ANSWERS 409 (nothing to settle is a state, not a crash)',
  HEAL_ROUTE.includes('NOT_STRANDED: 409,'));
ok('THE AUDIT ROW CARRIES THE PRIOR STATUS (oldValues honest)',
  HEAL_ROUTE.includes('oldValues: { paymentStatus: result.originalPriorPaymentStatus },'));

console.log('— the list route (one grouped chain query, the SAME pure law) —');
ok('THE LIST IMPORTS THE SERVICE\u2019S TWO VOICES',
  LIST.includes("import { refundableLinesFrom, deriveRefundRowState } from '@/lib/sale-refund-service';"));
ok('THE CHAIN SUMS RIDE ONE GROUPED QUERY per page',
  LIST.includes('where: { refundedTransactionId: { in: pageIds } },'));
ok('THE ROW STATE IS DERIVED FROM THE SAME SUMS (never a client guess)',
  LIST.includes('headerRemaining: Number(t.totalAmount) - (chain?.priorTotal ?? 0),'));
ok('THE WIRE CARRIES refundState per row', LIST.includes('refundState,'));

console.log('— the desk (the chips + the heal affordance) —');
ok('THE DESK RENDERS THE ROW STATE CHIP for sale rows',
  DESK.includes('txType === \u0027sale\u0027 && transaction.refundState && (')
  && DESK.includes('<RefundStateChip state={transaction.refundState} receiptNumber={transaction.receiptNumber} />'));
ok('THE FOUR CHIPS WEAR THEIR OWN INK',
  DESK.includes('data-kind="SETTLES_FULL"')
  && DESK.includes('data-kind="SETTLES_FULL_WITH_GAP"')
  && DESK.includes('data-kind="STRANDED"')
  && DESK.includes('data-kind="SETTLED"'));
ok('THE EMERALD CHIP SPEAKS THE CLEAN SETTLE',
  DESK.includes('Settles in full · {formatKES(state.fullRefundAmount)}'));
ok('THE AMBER CHIP NAMES THE GAP (+KES G gap)',
  DESK.includes('Settles in full · {formatKES(state.fullRefundAmount)} (+{formatKES(state.settleGap)} gap)'));
ok('THE ROSE CHIP SPEAKS THE STRANDED REMAINDER',
  DESK.includes('{formatKES(state.strandedAmount)} stranded'));
ok('THE MUTED CHIP SPEAKS THE SETTLED TRUTH', DESK.includes('Nothing left to refund'));
ok('THE REFUND BUTTON YIELDS when the row knows better',
  DESK.includes("transaction.refundState?.kind !== 'STRANDED' && transaction.refundState?.kind !== 'SETTLED'"));
ok('THE ROSE SETTLE BUTTON EXISTS and is feature-gated with the refund',
  DESK.includes('Settle stranded gap')
  && DESK.indexOf('transaction.refundState?.kind === \u0027STRANDED\u0027 && canRefund') > -1);
ok('THE HEAL CONFIRM SPEAKS THE EXACT REMAINDER and the closure',
  DESK.includes('title="Settle stranded gap"')
  && DESK.includes('closes the sale as REFUNDED. This cannot be undone.'));
ok('THE HEAL HANDLER TOASTS THE SETTLED TRUTH and retires the list',
  DESK.includes('Stranded gap settled — ${formatKES(settled.refundTotal)} returned')
  && DESK.includes("await queryClient.invalidateQueries({ queryKey: ['transactions'] });"));

console.log('— the client contract —');
ok('TransactionItem CARRIES the refundState', API.includes('refundState?: RefundRowState | null;'));
ok('RefundRowState IS EXPORTED with its three figures',
  API.includes('export interface RefundRowState {')
  && API.includes('fullRefundAmount: number;')
  && API.includes('settleGap: number;')
  && API.includes('strandedAmount: number;'));
ok('HealStrandedResult IS EXPORTED with the healed marker',
  API.includes('export interface HealStrandedResult {') && API.includes('healed: true;'));
ok('transactionsApi.healStranded SPEAKS the heal route',
  API.includes('`/transactions/${id}/refund-heal`'));

console.log('— the round\u2019s own suite —');
ok('THE SUITE EXISTS and declares its boundary',
  SUITE.includes('v2.373.0 THE STRANDED-GAP HEAL') && SUITE.includes('afterAll'));
ok('THE SUITE PINS THE ROW VOICE\u2019S FOUR KINDS',
  SUITE.includes("toBe('SETTLES_FULL')") && SUITE.includes("toBe('SETTLES_FULL_WITH_GAP')")
  && SUITE.includes("toBe('STRANDED')") && SUITE.includes("toBe('SETTLED')"));
ok('THE SUITE PINS THE EPSILON BOUNDARY', SUITE.includes('0.004').valueOf() && SUITE.includes('epsilon'));
ok('THE SUITE PINS THE ZERO-ITEM EVENT', SUITE.includes('toHaveLength(0)'));
ok('THE SUITE PINS THE BALANCED JOURNAL and the untouched stock',
  SUITE.includes('Math.abs(debits - credits)).toBeLessThanOrEqual(0.01)')
  && SUITE.includes('expect(movements).toHaveLength(0);'));

console.log('— the walk\u2019s own marks —');
ok('THE WALK SCRIPT EXISTS (BY WRITE, v2373 stamped)',
  read('scripts/walk-v2373.mjs').includes('walk-v2373.mjs — the v2.373.0 re-anchor codemod'));

console.log('— the release mechanics (version slots, feed, changelog) —');
ok('pkg version = VERSION (all three slots)', pkg.version === version && pkg.mbumah?.releaseVersion === version && pkg.mbumah?.baseVersion === version);
ok('the VERSION file speaks 2.373.0', version === '2.373.0');
ok('whats-new carries the lead entry', whatsNew.includes("version: '2.373.0',") && whatsNew.indexOf("version: '2.373.0',") < whatsNew.indexOf("version: '2.372.0',"));
ok('CHANGELOG carries [2.373.0] above [2.372.0]', changelog.indexOf('[2.373.0]') >= 0 && changelog.indexOf('[2.373.0]') < changelog.indexOf('[2.372.0]'));

console.log(`\nverify-v2-373-0: ${pass} ok, ${fail} FAIL`);
if (fail > 0) process.exit(1);
