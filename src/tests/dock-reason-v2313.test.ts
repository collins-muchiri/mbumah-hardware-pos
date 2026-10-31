// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dockNeedsReason, DOCK_REASON_REQUIRED_MESSAGE, DOCK_REASON_HINT } from '@/lib/loyalty-adjust-policy';

/**
 * v2.313.0 — THE DOCK SAYS WHY.
 *
 * A negative ADJUST is a manager's judgment call against a customer's
 * balance. Until now it could land anonymously: the route accepted any
 * description (including none), both dialogs enabled Apply the moment a
 * number was typed, and the desk ledger answered '-' because the dialog
 * sent `referenceId` while the route read `reference` — the reference
 * never landed either. One law now binds all three consumers (the route
 * and both adjust dialogs) through the pure predicate below.
 */

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');
const route = read('src/app/api/loyalty/transactions/route.ts');
const dialog = read('src/app/(shell)/tabs/loyalty-tab.tsx');

describe('v2.313.0 — the pure law: dockNeedsReason', () => {
  it('a negative ADJUST without a reason is a dock that must say why', () => {
    expect(dockNeedsReason('ADJUST', -50, undefined)).toBe(true);
    expect(dockNeedsReason('ADJUST', -50, null)).toBe(true);
    expect(dockNeedsReason('ADJUST', -50, '')).toBe(true);
    expect(dockNeedsReason('ADJUST', -50, '   ')).toBe(true); // keystrokes, not words
    expect(dockNeedsReason('ADJUST', -50, 'Damage write-off')).toBe(false);
  });

  it('positive ADJUST is a grant, not a dock — no reason owed', () => {
    expect(dockNeedsReason('ADJUST', 50, undefined)).toBe(false);
    expect(dockNeedsReason('ADJUST', 50, '')).toBe(false);
  });

  it('mechanical types carry their own context — never gated', () => {
    expect(dockNeedsReason('EARN', -1, undefined)).toBe(false);
    expect(dockNeedsReason('REDEEM', -30, undefined)).toBe(false);
    expect(dockNeedsReason('BONUS', -1, undefined)).toBe(false);
    expect(dockNeedsReason('EXPIRE', -243, undefined)).toBe(false);
  });

  it('zero never reaches the law (the route answers non-zero first)', () => {
    expect(dockNeedsReason('ADJUST', 0, undefined)).toBe(false);
  });
});

describe('v2.313.0 — the route enforces the law at the door', () => {
  it('POST 400s a reason-less negative ADJUST with the shared voice', () => {
    expect(route.includes('dockNeedsReason(tType, pointsValue, description)')).toBe(true);
    expect(route.includes("import { dockNeedsReason, DOCK_REASON_REQUIRED_MESSAGE } from '@/lib/loyalty-adjust-policy';")).toBe(true);
    expect(route.includes('error: DOCK_REASON_REQUIRED_MESSAGE')).toBe(true);
    expect(route.includes('{ status: 400 }')).toBe(true);
  });

  it('the reference that never landed: the route folds both voices', () => {
    expect(route.includes('referenceId,')).toBe(true);
    expect(route.includes('const effectiveReference = reference ?? referenceId ?? null;')).toBe(true);
    expect(route.includes('reference: effectiveReference,')).toBe(true);
  });

  it('the tierless-store bomb is dead: no literal FK id hides in the create fallback', () => {
    // The round's live QA catch: `tierId: firstTier?.id || 'default'` wrote
    // a foreign key that exists nowhere — every store without configured
    // tiers 500'd (P2003) on a customer's very first grant/earn. The
    // schema's tierId is nullable BY DESIGN.
    expect(route.includes("firstTier?.id || 'default'")).toBe(false);
    expect(route.includes('tierId: firstTier?.id || null,')).toBe(true);
    expect(route.includes('tierAchievedAt: firstTier ? new Date() : null,')).toBe(true);
  });

  it('THE WALLET LAW: both ledgers move together in the same transaction', () => {
    // The round's live QA catch #2: the route maintained only the legacy
    // shadow (CustomerLoyalty.pointsBalance) while the codebase's own
    // documented law (loyalty-expiry-service.ts) says THE WALLET is
    // Customer.loyaltyPoints — so a manual adjust never moved the balance
    // the members list voices. The burst proved it: +50/−10 landed as
    // rows, the wallet stayed 0.
    expect(route.includes('data: { loyaltyPoints: { increment: finalPoints } },')).toBe(true);
    expect(route.includes("where: { id: customerId },")).toBe(true);
    // Inside the SAME $transaction (before `return loyaltyTx;`).
    const txn = route.split('await db.$transaction(async (tx) => {')[1]?.split('return loyaltyTx;')[0] ?? '';
    expect(txn.includes('tx.customer.update({')).toBe(true);
    expect(txn.includes('THE WALLET LAW')).toBe(true);
  });
});

describe('v2.313.0 — both adjust dialogs wear the law on their face', () => {
  it('the members-row Adjust Points dialog disables Apply until the reason lands', () => {
    expect(dialog.includes('aria-describedby="adjust-points-reason-hint"')).toBe(true);
    expect(dialog.includes('dockNeedsReason(adjustPointsForm.type, Number(adjustPointsForm.points), adjustPointsForm.description)')).toBe(true);
    const apply = dialog.split('disabled={!adjustPointsForm.points || dockNeedsReason')[1]?.split('\n')[0] ?? '';
    expect(apply.includes('createTxMutation.isPending')).toBe(true);
  });

  it('the Manual Points Adjustment dialog does the same and sends the real wire name', () => {
    expect(dialog.includes('aria-describedby="manual-adjust-reason-hint"')).toBe(true);
    expect(dialog.includes('dockNeedsReason(manualAdjustForm.transactionType, Number(manualAdjustForm.points), manualAdjustForm.description)')).toBe(true);
    // The historical silent-drop: referenceId on the wire, reference on the route.
    expect(dialog.includes('reference: manualAdjustForm.reference || undefined,')).toBe(true);
    expect(dialog.includes('referenceId: manualAdjustForm.reference')).toBe(false);
  });

  it('both faces voice the rose hint with the shared sentence + aria-live', () => {
    expect(dialog.includes('{DOCK_REASON_HINT}')).toBe(true);
    expect(dialog.split('DOCK_REASON_HINT').length - 1).toBe(3); // 1 import + 2 faces share the constant
    expect(dialog.includes('aria-live="polite"')).toBe(true);
    expect(dialog.includes('text-rose-600 dark:text-rose-400')).toBe(true);
    expect(dialog.includes('AlertCircle')).toBe(true);
  });

  it('the client type carries the wire name for the next caller', () => {
    const api = read('src/lib/api.ts');
    expect(api.includes('description?: string; reference?: string; referenceId?: string;')).toBe(true);
  });
});

describe('v2.313.0 — the ledger reads what the wire actually sends', () => {
  it('plain rows fall back reference-first, never a bare undefined', () => {
    expect(dialog.includes('tx.reference ?? tx.referenceId ?? \'-\'')).toBe(true);
  });

  it('the two voices stay distinct: the route sentence vs the face hint', () => {
    expect(DOCK_REASON_REQUIRED_MESSAGE).not.toBe(DOCK_REASON_HINT);
    expect(DOCK_REASON_REQUIRED_MESSAGE).toContain('requires a reason');
    expect(DOCK_REASON_HINT).toContain('the ledger must say why');
  });
});
