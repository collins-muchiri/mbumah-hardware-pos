/**
 * v2.313.0 — the dock says why.
 *
 * A negative ADJUST is a manager's judgment call against a customer's
 * balance: points docked by hand, outside any sale, redemption, or expiry
 * policy. The ledger has always KEPT whatever description arrived, but
 * nothing required one — a dock could land anonymously and the desk's
 * paper trail answered with a silent row. This module is the ONE law
 * shared by all three consumers:
 *
 *   - POST /api/loyalty/transactions  → 400 when the law is unsatisfied
 *   - the members-row "Adjust Points" dialog          → Apply disabled
 *   - the Transactions toolbar "Manual Points Adjustment" dialog → ditto
 *
 * Scope is deliberately tight: only `ADJUST` with negative points needs a
 * reason. EARN/BONUS/REDEEM are mechanical flows with their own context
 * (a sale, a campaign, a redemption), the expiry service always writes
 * its own reason, and a positive ADJUST is a grant, not a dock — the law
 * guards the direction that can silently take value away.
 *
 * Pure string/number logic — no window, no db — so it pins and tests
 * without a browser or a database.
 */

/** The transaction types the manual doors offer (mirrors the route's whitelist). */
export type AdjustTransactionType = 'EARN' | 'REDEEM' | 'BONUS' | 'EXPIRE' | 'ADJUST';

/**
 * Does THIS transaction require a reason before it may land?
 *
 *   - type ADJUST and points < 0  →  a dock: reason REQUIRED
 *   - anything else               →  the type's own context carries it
 *
 * Whitespace-only descriptions answer true (the law wants WORDS, not
 * keystrokes). A missing/undefined description is the anonymous dock.
 */
export function dockNeedsReason(
  transactionType: string,
  points: number,
  description?: string | null,
): boolean {
  if (transactionType !== 'ADJUST') return false;
  if (!(points < 0)) return false;
  return !description || description.trim().length === 0;
}

/** The route's 400 voice, shared so tests pin ONE sentence. */
export const DOCK_REASON_REQUIRED_MESSAGE =
  'A negative adjustment requires a reason. Tell the ledger why the points are being docked.';

/** The dialogs' inline hint — the same law, worded for the face. */
export const DOCK_REASON_HINT =
  'A docked adjustment needs a reason — the ledger must say why.';
