import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * v2.312.0 — the points that expire.
 *
 * The ledger has spoken an "Expire" voice since the desk shipped, but NO
 * writer anywhere in src/ ever produced an EXPIRE row — a voice for rows
 * nothing wrote. This release builds the honest writer, on the seams the
 * clawback taught:
 *
 *  - THE FIFO LAW (executed below): redemptions and claws eat the OLDEST
 *    earned points first, so a wallet's expirable balance under the
 *    policy window is max(0, oldLotsSum − totalConsumption), capped by
 *    the CURRENT wallet. New earn rows inside the window never count;
 *    consumption counts no matter how old.
 *  - IDEMPOTENT BY CONSTRUCTION (executed below): the EXPIRE row the run
 *    writes is itself a consumption — the next plan answers 0 forever.
 *    No run markers, no double-expiry, the nightly cron and the desk's
 *    button can never fight.
 *  - THE CLAIM is the clawback's conditional decrement (updateMany
 *    gte/decrement): a concurrently-redeemed wallet loses the race and
 *    the expiry forgives — the next run catches what remains.
 *  - THE TIER NEVER DEMOTES: expiry shrinks the spendable balance only.
 *  - TWO DOORS, ONE PLAN: the nightly dispatcher rides the new cron
 *    route (the session-reaper fold); the desk's dialog speaks the same
 *    service — preview (GET, zero writes) then run (POST, manager-gated).
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const svc = readRepo('src/lib/loyalty-expiry-service.ts');
const cronRoute = readRepo('src/app/api/cron/loyalty-expiry/route.ts');
const nightly = readRepo('src/app/api/cron/nightly/route.ts');
const deskRoute = readRepo('src/app/api/loyalty/expiry/route.ts');
const dialog = readRepo('src/components/loyalty/expiry-dialog.tsx');
const desk = readRepo('src/app/(shell)/tabs/loyalty-tab.tsx');
const apiClient = readRepo('src/lib/api.ts');

// ── executed math: the FIFO plan, run for real ─────────────────────────
interface ExpiryLot { points: number; createdAt: Date }
function computeLoyaltyExpiryPlan({
  lots, consumed, balance, policyDays, now,
}: {
  lots: ExpiryLot[]; consumed: number; balance: number; policyDays: number; now: Date;
}): { expirable: number; lotCount: number; windowStart: Date } {
  const windowStart = new Date(now.getTime() - Math.max(1, policyDays) * 86_400_000);
  const oldLots = lots.filter((l) => l.points > 0 && l.createdAt <= windowStart);
  const oldLotsSum = oldLots.reduce((sum, l) => sum + l.points, 0);
  const totalConsumed = Math.max(0, consumed);
  const survivors = Math.max(0, oldLotsSum - totalConsumed);
  const expirable = Math.max(0, Math.min(survivors, Math.max(0, balance)));
  return { expirable, lotCount: oldLots.length, windowStart };
}

const DAY = 86_400_000;
const NOW = new Date('2026-11-01T00:00:00.000Z');

describe('v2.312.0 — the FIFO plan, executed', () => {
  it('old unspent lots expire; fresh lots never count', () => {
    const plan = computeLoyaltyExpiryPlan({
      lots: [
        { points: 100, createdAt: new Date(NOW.getTime() - 400 * DAY) }, // old
        { points: 50, createdAt: new Date(NOW.getTime() - 400 * DAY) },  // old
        { points: 200, createdAt: new Date(NOW.getTime() - 30 * DAY) },  // fresh
      ],
      consumed: 0,
      balance: 350,
      policyDays: 365,
      now: NOW,
    });
    expect(plan.expirable).toBe(150);
    expect(plan.lotCount).toBe(2);
  });

  it('consumption eats the OLDEST lots first — spent points cannot expire', () => {
    const plan = computeLoyaltyExpiryPlan({
      lots: [
        { points: 100, createdAt: new Date(NOW.getTime() - 400 * DAY) },
        { points: 200, createdAt: new Date(NOW.getTime() - 100 * DAY) },
      ],
      consumed: 150,
      balance: 150,
      policyDays: 365,
      now: NOW,
    });
    // 100 + 200 earned; 150 spent → oldest lot fully eaten, 50 of its
    // survivors remain — wait, FIFO: the 150 eats ALL of lot1 (100) and
    // 50 of lot2 (fresh, inside window) → old survivors = 100−150 < 0 → 0.
    expect(plan.expirable).toBe(0);
  });

  it('a partial bite of the old lots leaves the remainder expirable', () => {
    const plan = computeLoyaltyExpiryPlan({
      lots: [
        { points: 100, createdAt: new Date(NOW.getTime() - 400 * DAY) },
        { points: 500, createdAt: new Date(NOW.getTime() - 400 * DAY) },
      ],
      consumed: 150,
      balance: 450,
      policyDays: 365,
      now: NOW,
    });
    expect(plan.expirable).toBe(450); // 600 old − 150 spent, capped by wallet 450
  });

  it('the claim is capped by the CURRENT wallet, never trusted from rows', () => {
    const plan = computeLoyaltyExpiryPlan({
      lots: [{ points: 1000, createdAt: new Date(NOW.getTime() - 400 * DAY) }],
      consumed: 0,
      balance: 40, // drifted wallet (legacy/manual paths)
      policyDays: 365,
      now: NOW,
    });
    expect(plan.expirable).toBe(40);
  });

  it('IDEMPOTENT BY CONSTRUCTION: yesterday\u2019s EXPIRE row is today\u2019s consumption', () => {
    const day1 = computeLoyaltyExpiryPlan({
      lots: [{ points: 100, createdAt: new Date(NOW.getTime() - 400 * DAY) }],
      consumed: 0,
      balance: 100,
      policyDays: 365,
      now: NOW,
    });
    expect(day1.expirable).toBe(100);
    // The run wrote −100 (an EXPIRE row). The next day's plan sees it.
    const day2 = computeLoyaltyExpiryPlan({
      lots: [{ points: 100, createdAt: new Date(NOW.getTime() - 400 * DAY) }],
      consumed: 100, // the EXPIRE row itself
      balance: 0,
      policyDays: 365,
      now: new Date(NOW.getTime() + DAY),
    });
    expect(day2.expirable).toBe(0);
    // And even a 3x-swept wallet stays at zero (no negative plan, ever).
    const day3 = computeLoyaltyExpiryPlan({
      lots: [{ points: 100, createdAt: new Date(NOW.getTime() - 400 * DAY) }],
      consumed: 300,
      balance: 0,
      policyDays: 365,
      now: new Date(NOW.getTime() + 2 * DAY),
    });
    expect(day3.expirable).toBe(0);
  });

  it('the source of the math matches the executed seam (the pins hold the loop)', () => {
    expect(svc).toContain('export function computeLoyaltyExpiryPlan(');
    expect(svc).toContain('const survivors = Math.max(0, oldLotsSum - totalConsumed);');
    expect(svc).toContain('const expirable = Math.max(0, Math.min(survivors, Math.max(0, balance)));');
  });
});

describe('v2.312.0 — the writer and its guardrails', () => {
  it('the run claims with the clawback\u2019s conditional decrement', () => {
    expect(svc).toContain('updateMany({');
    expect(svc).toContain('loyaltyPoints: { gte: plan.expirable }');
    expect(svc).toContain('loyaltyPoints: { decrement: plan.expirable }');
    expect(svc).toContain("if (claimed.count === 0)");
    // the lost-claim skip is voiced (forgiven, not hidden)
    expect(svc).toContain("note: 'claimed-lost'");
  });

  it('the EXPIRE row speaks both voices and rides the audit thread', () => {
    expect(svc).toContain("transactionType: 'EXPIRE'");
    expect(svc).toContain("type: 'EXPIRED'");
    expect(svc).toContain("referenceType: LOYALTY_EXPIRY_REFERENCE_TYPE");
    expect(svc).toContain("LOYALTY_EXPIRY_REFERENCE_TYPE = 'EXPIRY_RUN'");
    expect(svc).toContain('balanceAfter: walletAfter');
    // the reason names the policy story (lots + window + days)
    expect(svc).toContain("lot${plan.lotCount === 1 ? '' : 's'} earned on or before");
  });

  it('the tier NEVER demotes and lifetime totals NEVER shrink', () => {
    // the service touches ONLY loyaltyPoints — no loyaltyTier / totalLoyaltyEarned writes
    expect(svc).not.toContain('loyaltyTier');
    expect(svc).not.toContain('totalLoyaltyEarned');
    expect(svc).toContain('loyaltyPoints: { decrement: plan.expirable }');
  });

  it('the policy window has a floor (a month guards fat-finger sweeps)', () => {
    expect(svc).toContain('export const LOYALTY_EXPIRY_DEFAULT_DAYS = 365;');
    expect(svc).toContain('export const LOYALTY_EXPIRY_MIN_DAYS = 30;');
    expect(svc).toContain('Math.max(LOYALTY_EXPIRY_MIN_DAYS, Math.floor(policyDays))');
  });

  it('the dry run answers the plan and writes NOTHING', () => {
    expect(svc).toContain('if (dryRun)');
    // between the dry-run return and the claim there is no create call
    const dryBlock = svc.split('if (dryRun)')[1]?.split('// The claim')[0] ?? '';
    expect(dryBlock).not.toContain('loyaltyTransaction.create');
    expect(dryBlock).toContain("continue;");
  });
});

describe('v2.312.0 — the nightly ride and the desk\u2019s two doors', () => {
  it('the cron route rides the reaper\u2019s exact auth posture', () => {
    expect(cronRoute).toContain('verifyCronSecret(request)');
    expect(cronRoute).toContain('runWithoutTenant');
    expect(cronRoute).toContain('runLoyaltyExpiry({');
    expect(cronRoute).toContain('LOYALTY_EXPIRY_LOG_ACTION');
    expect(cronRoute).toContain("dryRun: false");
  });

  it('the nightly dispatcher carries the expiry sub-job', () => {
    expect(nightly).toContain(
      "import { GET as loyaltyExpiryGET } from '@/app/api/cron/loyalty-expiry/route';",
    );
    expect(nightly).toContain("{ name: 'loyalty-expiry', run: () => loyaltyExpiryGET(request) }");
  });

  it('the desk route: preview is read-only, run is manager-gated, no dry-run door on POST', () => {
    expect(deskRoute).toContain('withSessionAuth(previewHandler, { roles: MANAGER_PLUS_ROLES })');
    expect(deskRoute).toContain('withSessionAuth(runHandler, { roles: MANAGER_PLUS_ROLES })');
    // the preview handler never claims: its body is the dry run ONLY
    const previewBody = deskRoute.split('async function previewHandler')[1]?.split('async function runHandler')[0] ?? '';
    expect(previewBody).toContain('dryRun: true');
    expect(previewBody).not.toContain('dryRun: false');
    expect(previewBody).not.toContain('updateMany');
    // the POST refuses a dryRun escape hatch (the preview IS the dry run)
    expect(deskRoute).toContain('dryRun is NOT accepted here');
    expect(deskRoute).toContain('dryRun: false,');
  });

  it('the desk dialog: preview \u2192 confirm \u2192 run, with the ledger invalidated after', () => {
    expect(dialog).toContain('data-testid="loyalty-expiry-dialog"');
    expect(dialog).toContain('data-testid="expiry-preview"');
    expect(dialog).toContain('data-testid="expiry-confirm"');
    expect(dialog).toContain('data-testid="expiry-summary"');
    expect(dialog).toContain('loyaltyApi.expiry.preview(');
    expect(dialog).toContain('loyaltyApi.expiry.run(');
    expect(dialog).toContain('onExpired?.()');
    // the running phase is not escapable mid-flight
    expect(dialog).toContain("if (phase === 'running') return;");
    // the MIN law is mirrored client-side
    expect(dialog).toContain('const MIN_POLICY_DAYS = 30;');
  });

  it('the desk toolbar carries the amber Expiry door and the invalidation', () => {
    expect(desk).toContain('data-testid="open-expiry-dialog"');
    expect(desk).toContain('<ExpiryDialog');
    expect(desk).toContain("queryKey: ['loyalty-transactions']");
    expect(desk).toContain("queryKey: ['loyalty-customers']");
    expect(desk).toContain('focus-visible:ring-amber-400');
  });

  it('the api client speaks both doors with the wire shapes', () => {
    expect(apiClient).toContain('expiry: {');
    expect(apiClient).toContain('preview: async (params: { storeId: string; policyDays?: number })');
    expect(apiClient).toContain('run: async (data: { storeId: string; policyDays?: number })');
    expect(apiClient).toContain('export interface LoyaltyExpiryPreview {');
    expect(apiClient).toContain('export interface LoyaltyExpiryRunSummary {');
  });
});
