/**
 * Loyalty expiry pulse — the Automation pulse card's tolerant reader of the
 * LOYALTY_EXPIRY_RUN ledger row (v2.315.0).
 *
 * WHY: the FIFO expiry sweep has written one INFO ledger row per run since
 * v2.312.0 (`LOYALTY_EXPIRY_RUN`, metadata.stores[] carrying per-store
 * scanned/walletsExpired/pointsExpired), but the only admin surface that
 * could see it was the raw ledger. The org console's Automation pulse card
 * surfaces the LAST sweep so a healthy run — or a silent one — is visible
 * without opening the ledger.
 *
 * THE NEVER-A-GUESS LAW: this row is written by the cron route
 * (src/app/api/cron/loyalty-expiry/route.ts) whose metadata contract is
 * `{ path: string, stores: Array<{ storeId, scanned, walletsExpired,
 * pointsExpired }> }`. A row that predates the contract, carries garbage,
 * or holds ANY store entry whose numbers are missing/non-numeric/negative
 * is UNREADABLE — the card renders nothing, never a partial sum built from
 * a row it does not fully understand. An EMPTY stores array IS readable:
 * a fresh store with no loyalty history sweeps zero stores and the honest
 * zeros are the truth ("nothing to expire").
 *
 * PURE module — imported by the org/automation route; free of server-only
 * imports so it stays unit-testable like the rest of src/lib.
 */

/** The card-shaped summary of the most recent expiry sweep. */
export interface LoyaltyExpiryRunPulse {
  /** ISO timestamp of the ledger row (the sweep itself, not the read). */
  at: string;
  /** Wallets examined across all stores in the sweep. */
  scanned: number;
  /** Wallets that actually had points expire (0 = a healthy no-op sweep). */
  walletsExpired: number;
  /** Total points returned to the pool by the sweep. */
  pointsExpired: number;
  /** How many stores the sweep covered (the stores[] length). */
  storeCount: number;
}

/** A single store's slice of the sweep, as the cron route writes it. */
interface ExpiryRunStoreSlice {
  storeId?: unknown;
  scanned?: unknown;
  walletsExpired?: unknown;
  pointsExpired?: unknown;
}

/**
 * A store slice is honest only when its counts are real non-negative
 * finite numbers. A string "3" is NOT a count (the ledger's own
 * sub-job filter holds the same line), and a negative count is garbage.
 */
function isHonestCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * Parse one LOYALTY_EXPIRY_RUN ledger row into the pulse shape.
 *
 * Returns `undefined` for every unreadable row (null metadata, unparsable
 * JSON, a non-object payload, a missing/non-array `stores` field, or any
 * store slice carrying a dishonest count) — the caller renders nothing,
 * never a guess. Returns the summed pulse when EVERY slice is honest.
 */
export function parseLoyaltyExpiryRunRow(
  metadata: string | null,
  at: Date,
): LoyaltyExpiryRunPulse | undefined {
  if (!metadata) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(metadata);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== 'object') return undefined;
  const stores = (parsed as { stores?: unknown }).stores;
  if (!Array.isArray(stores)) return undefined;

  let scanned = 0;
  let walletsExpired = 0;
  let pointsExpired = 0;
  for (const entry of stores) {
    if (!entry || typeof entry !== 'object') return undefined;
    const slice = entry as ExpiryRunStoreSlice;
    if (
      !isHonestCount(slice.scanned) ||
      !isHonestCount(slice.walletsExpired) ||
      !isHonestCount(slice.pointsExpired)
    ) {
      return undefined;
    }
    scanned += slice.scanned;
    walletsExpired += slice.walletsExpired;
    pointsExpired += slice.pointsExpired;
  }
  return {
    at: at.toISOString(),
    scanned,
    walletsExpired,
    pointsExpired,
    storeCount: stores.length,
  };
}
