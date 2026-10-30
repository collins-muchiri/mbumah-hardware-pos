// MBUMAH HARDWARE POS - the notification feed's filter lens (v2.290.0)
//
// The bell's badge counts UNREAD rows; until now the feed's filter row could
// only narrow by SEVERITY (All / Critical / Warnings / Info / Security /
// Email failed) — there was no way to isolate the exact rows the badge was
// counting. The badge asked a question the feed had no lens to answer.
// This lib is the lens' one home: the filter union and the pure predicate
// every surface (active list, dismissed list, future feeds) shares.
//
// Laws carried over:
// - The one-vocabulary law: the NotificationFilter union lives HERE, never
//   copied into a component (the component imports the type; a second copy
//   would drift the day a lens is added on one side only).
// - The document's-answer law: 'unread' is answered by the read ledger the
//   caller hands in (readIds) — the filter never guesses readness from
//   isRead wire fields that may be stale, and when no ledger is supplied
//   the lens returns the rows unchanged rather than inventing a read state.
// - The pure-predicate law (the RUNTIME pin law): a filter that claims to
//   narrow must be pinned by a truth table on the REAL function, not just
//   bytes on the render site.

import { isFailedEmailDigest } from '@/lib/hr/digest-notification-view';

/**
 * v2.290.0: 'unread' joins the lens row — the badge's own question
 * ("what are those N rows?") gets a one-tap answer. Severity lenses are
 * unchanged; 'unread' composes with nothing (one knob, as before) but
 * sheds rows LIVE: reading a row while the lens is on removes it and,
 * at the last read, the feed speaks "You're all caught up!".
 */
export type NotificationFilter =
  | 'all'
  | 'unread'
  | 'critical'
  | 'warning'
  | 'info'
  | 'security'
  | 'email_failed';

/** The shape the lens needs — NotificationItem and the Security merges satisfy it. */
export interface FilterableNotification {
  id: string;
  type: string;
  severity: string;
  category?: string | null;
}

/**
 * The feed's one filter predicate. 'security' narrows to SECURITY-category
 * rows (v2.12.7); 'email_failed' to digest copies whose email FAILED
 * (v2.57.0, via the shared isFailedEmailDigest); 'unread' (v2.290.0) to
 * rows absent from the caller's read ledger; the remaining named lenses
 * narrow by severity. 'all' answers with every row, order preserved.
 */
export function applyNotificationFilter<T extends FilterableNotification>(
  filter: NotificationFilter,
  items: readonly T[],
  readIds?: ReadonlySet<string>,
): T[] {
  if (filter === 'all') return [...items];
  if (filter === 'unread') {
    if (!readIds) return [...items];
    return items.filter((n) => !readIds.has(n.id));
  }
  if (filter === 'security') {
    return items.filter((n) => n.category === 'SECURITY' || n.type === 'security');
  }
  if (filter === 'email_failed') {
    return items.filter((n) => isFailedEmailDigest(n));
  }
  return items.filter((n) => n.severity === filter);
}
