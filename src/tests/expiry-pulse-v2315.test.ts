// ─────────────────────────────────────────────────────────────────────────────
// Expiry pulse (v2.315.0) - "the sweep gets a face on the pulse"
// ─────────────────────────────────────────────────────────────────────────────
//
// The Automation pulse card surfaces the LAST LOYALTY_EXPIRY_RUN ledger row
// so the nightly FIFO sweep is visible beyond the raw ledger. This file pins:
//
//   1. The parser's truth table (src/lib/loyalty-expiry-pulse.ts): a fully
//      readable row sums across stores; garbage, missing stores arrays,
//      string counts, negatives and partial rows answer undefined — never a
//      partial sum; an empty stores array is the HONEST zero (a fresh store
//      swept nothing).
//   2. The route door (/api/org/automation): the sixth parallel read of the
//      latest LOYALTY_EXPIRY_RUN row and the conditional response field.
//   3. The card face (org-console.tsx): the amber sweep line, its healthy
//      zero voice, the hint register entry the loyalty-expiry chip was
//      missing since v2.312.0, and the interface field.
//   4. The housekeeping: the docs register row and the redeem door's
//      wallet-law note (the handover's by-design divergence, now written
//      where the next reader will meet it).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  parseLoyaltyExpiryRunRow,
  type LoyaltyExpiryRunPulse,
} from '@/lib/loyalty-expiry-pulse';

const AT = new Date('2026-11-01T03:00:00.000Z');

const row = (stores: unknown, extra: Record<string, unknown> = {}) =>
  JSON.stringify({ path: '/api/cron/loyalty-expiry', stores, ...extra });

describe('parseLoyaltyExpiryRunRow — the never-a-guess truth table', () => {
  it('sums a fully readable multi-store row', () => {
    const pulse = parseLoyaltyExpiryRunRow(
      row([
        { storeId: 'store_a', scanned: 12, walletsExpired: 2, pointsExpired: 450 },
        { storeId: 'store_b', scanned: 8, walletsExpired: 0, pointsExpired: 0 },
      ]),
      AT,
    );
    expect(pulse).toEqual<LoyaltyExpiryRunPulse>({
      at: AT.toISOString(),
      scanned: 20,
      walletsExpired: 2,
      pointsExpired: 450,
      storeCount: 2,
    });
  });

  it('reads the honest zero of an empty sweep (fresh store, no loyalty history)', () => {
    const pulse = parseLoyaltyExpiryRunRow(row([]), AT);
    expect(pulse).toEqual<LoyaltyExpiryRunPulse>({
      at: AT.toISOString(),
      scanned: 0,
      walletsExpired: 0,
      pointsExpired: 0,
      storeCount: 0,
    });
  });

  it('answers undefined for null / unparsable / non-object metadata', () => {
    expect(parseLoyaltyExpiryRunRow(null, AT)).toBeUndefined();
    expect(parseLoyaltyExpiryRunRow('not json {', AT)).toBeUndefined();
    expect(parseLoyaltyExpiryRunRow('"just a string"', AT)).toBeUndefined();
    expect(parseLoyaltyExpiryRunRow('42', AT)).toBeUndefined();
  });

  it('answers undefined when stores is missing or not an array', () => {
    expect(parseLoyaltyExpiryRunRow('{"path":"/api/cron/loyalty-expiry"}', AT)).toBeUndefined();
    expect(
      parseLoyaltyExpiryRunRow('{"stores":{"storeId":"store_a","scanned":1}}', AT),
    ).toBeUndefined();
  });

  it('answers undefined when ANY slice carries a dishonest count (never a partial sum)', () => {
    // a string "3" is not a count (the ledger's own sub-job filter law)
    expect(
      parseLoyaltyExpiryRunRow(
        row([
          { storeId: 'store_a', scanned: 12, walletsExpired: 2, pointsExpired: 450 },
          { storeId: 'store_b', scanned: '3', walletsExpired: 0, pointsExpired: 0 },
        ]),
        AT,
      ),
    ).toBeUndefined();
    // a negative count is garbage
    expect(
      parseLoyaltyExpiryRunRow(row([{ storeId: 'store_a', scanned: 12, walletsExpired: -1, pointsExpired: 0 }]), AT),
    ).toBeUndefined();
    // a missing count is not zero
    expect(
      parseLoyaltyExpiryRunRow(row([{ storeId: 'store_a', scanned: 12, pointsExpired: 0 }]), AT),
    ).toBeUndefined();
    // a non-object slice is unreadable
    expect(parseLoyaltyExpiryRunRow(row([12, 3]), AT)).toBeUndefined();
  });

  it('accepts zero counts as honest (the healthy no-op sweep)', () => {
    const pulse = parseLoyaltyExpiryRunRow(
      row([{ storeId: 'store_a', scanned: 7, walletsExpired: 0, pointsExpired: 0 }]),
      AT,
    );
    expect(pulse).toMatchObject({ scanned: 7, walletsExpired: 0, pointsExpired: 0, storeCount: 1 });
  });
});

describe('the pulse face — route, card, and the housekeeping', () => {
  const route = readFileSync('src/app/api/org/automation/route.ts', 'utf8');
  const card = readFileSync('src/components/workspace/org-console.tsx', 'utf8');
  const docs = readFileSync('docs/cron-operations.md', 'utf8');
  const redeem = readFileSync('src/app/api/customers/[id]/loyalty/redeem/route.ts', 'utf8');
  const gitignore = readFileSync('.gitignore', 'utf8');

  it('the route reads the latest LOYALTY_EXPIRY_RUN row and answers it only when readable', () => {
    expect(route.includes("const EXPIRY_RUN_ACTION = 'LOYALTY_EXPIRY_RUN';")).toBe(true);
    expect(route.includes('where: { action: EXPIRY_RUN_ACTION },')).toBe(true);
    expect(route.includes('parseLoyaltyExpiryRunRow(latestExpiryRun.metadata, latestExpiryRun.createdAt)')).toBe(true);
    expect(route.includes('...(lastExpiryRun ? { lastExpiryRun } : {}),')).toBe(true);
  });

  it('the card carries the sweep line with the Expiry desk amber and the exact stamp', () => {
    expect(card.includes('data-testid="automation-expiry-run"')).toBe(true);
    expect(card.includes('Last expiry sweep')).toBe(true);
    expect(card.includes('text-amber-700 dark:text-amber-400')).toBe(true);
    expect(card.includes('<Hourglass')).toBe(true);
    expect(card.includes('Expiry sweep recorded ${formatEatStamp(new Date(run.at))}')).toBe(true);
    expect(card.includes('className="sr-only"')).toBe(true);
  });

  it('the healthy zero speaks — "nothing to expire" is its own voice', () => {
    expect(card.includes('data-testid="automation-expiry-run-clean"')).toBe(true);
    expect(card.includes('nothing to expire')).toBe(true);
    expect(card.includes('data-testid="automation-expiry-run-counts"')).toBe(true);
    expect(card.includes('tabular-nums text-amber-700 dark:text-amber-400')).toBe(true);
  });

  it('the sweep line renders in BOTH card states (one source of truth, two doors)', () => {
    // the sweep is independent evidence: the manager desk writes
    // LOYALTY_EXPIRY_RUN rows without any dispatcher tick
    expect(card.split('function expiryRunLine(').length - 1).toBe(1);
    expect(card.split('expiryRunLine(automation.lastExpiryRun)').length - 1).toBe(2);
  });

  it('the loyalty-expiry chip finally speaks its ownership line (v2.312 chip, v2.315 voice)', () => {
    expect(card.includes("'loyalty-expiry': 'Expires loyalty points unspent past the policy window (oldest earn lots first).'")).toBe(true);
  });

  it('the interface field documents the absent-row law', () => {
    expect(card.includes('lastExpiryRun?: {')).toBe(true);
    expect(card.includes('never a partial sum')).toBe(true);
  });

  it('the docs register carries the sweep row + the v2.315 reader note', () => {
    expect(docs.includes('the nightly carries FIVE')).toBe(true);
    expect(docs.includes('**v2.315.0**: the Automation pulse card surfaces the LAST')).toBe(true);
    expect(docs.includes('src/lib/loyalty-expiry-pulse.ts')).toBe(true);
  });

  it('the redeem door documents its wallet-only law (the by-design shadow divergence)', () => {
    expect(redeem.includes('THE WALLET LAW (v2.314.0)')).toBe(true);
    expect(redeem.includes('deliberately does NOT maintain')).toBe(true);
  });

  it('the QA burst scripts have their gitignored home (round-scoped, never commit)', () => {
    expect(gitignore.includes('scripts/qa-burst-*')).toBe(true);
    expect(gitignore.includes('scripts/seed-qa-*')).toBe(true);
    expect(gitignore.includes('scripts/targeted-tsc-*')).toBe(true);
  });
});
