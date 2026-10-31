/**
 * The manual doors' laws — one home, three laws.
 *
 * v2.313.0 — the dock says why: a negative ADJUST must carry a reason.
 * v2.314.0 — the wallet is the only balance: every negative movement
 * claims THE WALLET (Customer.loyaltyPoints, the same conditional-claim
 * shape the expiry service uses), sufficiency is judged against THE
 * WALLET (never the legacy shadow — the burst proved a stale-high shadow
 * let a redeem drive the wallet to −90 and a missing shadow refused a
 * wallet holding 100 points with "0 points"), and EXPIRE is refused by
 * hand entirely (expiry is the service's FIFO voice, not a manager's
 * manual type).
 *
 * One module, shared by every consumer:
 *
 *   - POST /api/loyalty/transactions  → 400 when a law is unsatisfied
 *   - the members-row "Adjust Points" dialog          → Apply disabled
 *   - the Transactions toolbar "Manual Points Adjustment" dialog → ditto
 *     (and its type picker no longer offers Expire at all)
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

/**
 * The transaction types the manual doors may WRITE (mirrors the route's
 * whitelist minus EXPIRE — v2.314.0 retired the manual expiry bypass;
 * the ledger's filters and history views still speak EXPIRE for the
 * service-written rows).
 */
export type AdjustTransactionType = 'EARN' | 'REDEEM' | 'BONUS' | 'ADJUST';

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

/**
 * v2.314.0 — the wallet is the only balance.
 *
 * THE WALLET is `Customer.loyaltyPoints` (the law the expiry service
 * already wrote down). Sufficiency for EVERY negative movement through
 * the manual doors is judged against the wallet — never the legacy
 * `CustomerLoyalty.pointsBalance` shadow, whose only reader in all of
 * src/ was the very check this law replaces. One voice, shared by the
 * route's early 400 and its mid-flight claim-lost path (which re-reads
 * the balance at claim time so the number it names is always true).
 */
export function walletInsufficientMessage(wallet: number): string {
  return `Insufficient loyalty points. Customer has ${Math.max(0, Math.floor(wallet))} points.`;
}

/**
 * EXPIRE is the service's voice: the FIFO policy (loyalty-expiry-service)
 * is the only writer. A manual EXPIRE row bypassed the window, the FIFO
 * attribution, the conditional claim and the idempotence law — a manager
 * typing an expiry could double-expire what a policy sweep already
 * claimed. The route refuses the type outright; the desk's Expiry dialog
 * is the one honest door.
 */
export const MANUAL_EXPIRE_REFUSAL_MESSAGE =
  'Points expire through the Expiry desk (a FIFO policy sweep), not by hand. Open the Expiry dialog to run the policy.';

/** The manual dialog's face for the same law — a pointer, not a scolding. */
export const EXPIRE_POLICY_NOTE =
  'Points expire through the Expiry desk — policy sweeps, not by hand.';
