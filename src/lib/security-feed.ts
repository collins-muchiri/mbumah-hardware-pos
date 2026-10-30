// MBUMAH HARDWARE POS - the security feed's one vocabulary (v2.292.0)
//
// The feed's Security tab (v2.12.7) merges recent SecurityEvent rows as
// read-only entries. The vocabulary it speaks — WHICH eventTypes count as
// abuse, WHAT each type is called in shop-floor words, and WHICH tone a row
// wears — used to live inside notification-center.tsx, a component copy
// waiting to drift the day a surface (dashboard, org console, report desk)
// needed the same words. This lib is the one home, same move the
// notification lens made in v2.290.0: the component imports, never copies.
//
// THE TONE LAW (v2.292.0): a security row's color is DATA, not decoration.
// Severity leads (ERROR is red, WARN is amber — the row's own wire truth),
// and when a row carries no severity the TYPE answers: the lockout family
// (ACCOUNT_LOCKED, BRUTE_FORCE) is the red family, every other abuse type is
// amber, and an unknown type stays quiet slate — never guessed into alarm.
// Pure so the RUNTIME-PIN law holds: the tone table is asserted by value in
// the suite; the render site just wires it.

/** The abuse eventTypes merged as read-only entries under the Security tab. */
export const ABUSE_EVENT_TYPES = [
  'PERMISSION_DENIED',
  'HIGH_RISK_ATTEMPT',
  'BRUTE_FORCE',
  'ACCOUNT_LOCKED',
  'PRIVILEGE_ABUSE_PATTERN',
] as const;

export type AbuseEventType = (typeof ABUSE_EVENT_TYPES)[number];

/** Shop-floor words for each type — every abuse type MUST have a label. */
export const EVENT_TYPE_LABELS: Record<string, string> = {
  PERMISSION_DENIED: 'Permission Denied',
  HIGH_RISK_ATTEMPT: 'High-Risk Attempt',
  BRUTE_FORCE: 'Brute Force',
  ACCOUNT_LOCKED: 'Account Locked',
  PRIVILEGE_ABUSE_PATTERN: 'Privilege Abuse Pattern',
  // v2.292.0: carried over from the component map — the merged feed is
  // read-only and may name events outside the abuse set.
  UNAUTHORIZED_ACCESS: 'Unauthorized Access',
  MANAGER_AUTHORIZED: 'Manager Authorized',
};

/** The row tone — drives the row's face classes at the render site. */
export type SecurityTone = 'error' | 'warn' | 'info';

/**
 * The tone a SecurityEvent row wears. Severity leads; type fills the gaps;
 * unknown stays quiet. Three values, exactly — the row face is a closed set.
 */
export function securityRowTone(eventType: string, severity?: string | null): SecurityTone {
  if (severity === 'ERROR') return 'error';
  if (severity === 'WARN') return 'warn';
  if (eventType === 'ACCOUNT_LOCKED' || eventType === 'BRUTE_FORCE') return 'error';
  if ((ABUSE_EVENT_TYPES as readonly string[]).includes(eventType)) return 'warn';
  return 'info';
}

/** The contrast-safe face classes per tone (v2.148.0 law: tokens on their own). */
export const SECURITY_TONE_CLASSES: Record<SecurityTone, { row: string; icon: string }> = {
  error: {
    row: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40',
    icon: 'text-red-500',
  },
  warn: {
    row: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40',
    icon: 'text-amber-500',
  },
  info: {
    row: 'bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-900/40',
    icon: 'text-slate-500',
  },
};
