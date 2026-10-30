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
  // v2.293.0: the security dashboard's twelve — the tab's local copy is
  // dead; both surfaces import this one map. The five carried here complete
  // the dashboard's filter/chart vocabulary (the abuse set plus the
  // operational types the dashboard's events table names).
  RATE_LIMITED: 'Rate Limited',
  CSRF_FAILED: 'CSRF Failed',
  INVALID_INPUT: 'Invalid Input',
  SUSPICIOUS_ACTIVITY: 'Suspicious Activity',
  SESSION_HIJACK_ATTEMPT: 'Session Hijack',
};

/** The row tone — drives the row's face classes at the render site. */
export type SecurityTone = 'error' | 'warn' | 'info';

/**
 * The tone a SecurityEvent row wears. Severity leads; type fills the gaps;
 * unknown stays quiet. Three values, exactly — the row face is a closed set.
 *
 * v2.293.0: CRITICAL joins ERROR in the red family — the wire's own loudest
 * severity can never land on a quiet slate row. The feed's rows never
 * carried it (recorders write WARN/ERROR); the dashboard's recent-critical
 * table does, and it imports this same function.
 */
export function securityRowTone(eventType: string, severity?: string | null): SecurityTone {
  if (severity === 'CRITICAL' || severity === 'ERROR') return 'error';
  if (severity === 'WARN') return 'warn';
  if (eventType === 'ACCOUNT_LOCKED' || eventType === 'BRUTE_FORCE') return 'error';
  if ((ABUSE_EVENT_TYPES as readonly string[]).includes(eventType)) return 'warn';
  return 'info';
}

/**
 * The severity OUTLINE badge's face — the dashboard's SeverityBadge and any
 * future surface that names a severity in one chip. A closed set of five
 * (the LogSeverity vocabulary); contrast-safe -500-on-tint tokens per the
 * v2.148.0 law. v2.293.0: lifted from the dashboard tab's local copy so the
 * words AND the faces come from one home.
 */
export const SECURITY_SEVERITY_BADGE_CLASSES: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
  ERROR: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  WARN: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  INFO: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  DEBUG: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
};

/** One row of the denied-gates report: the gate and how often it said no. */
export interface DeniedGate {
  /** The recorded resource path — the gate's own address. */
  resource: string;
  /** How many PERMISSION_DENIED events named this gate. */
  count: number;
}

/**
 * The denied-gates report (v2.293.0) — which gates say no most.
 *
 * The dashboard's DB groups the PERMISSION_DENIED rows by resource; this
 * pure function voices the aggregate: sorts by count (ties by path, so the
 * order is deterministic), keeps the top `limit`, and counts the honesty
 * gap — denials whose record never named a resource (legacy rows and any
 * future writer that forgets) show up as `unnamedDenials`, never silently
 * vanished. The voice line is the card's subtitle: it always adds up.
 *
 * v2.294.0: the report learns its WINDOW. The card can now breathe over
 * time ranges (24h / 7d / 30d — the route's `?range=` lens), so the voice
 * takes an additive `windowLabel` (default '24h' keeps every v2.293.0 pin
 * green byte-for-byte). The label is interpolated verbatim — the route
 * owns the whitelist, the lib never guesses.
 *
 * Pure so the RUNTIME-PIN law holds: the suite asserts the arithmetic and
 * the voice by value; the render site just wires it.
 */
export function deniedGateReport(
  totalDenied: number,
  gates: DeniedGate[],
  limit = 5,
  windowLabel = '24h'
): { top: DeniedGate[]; namedDenials: number; unnamedDenials: number; voice: string; maxCount: number } {
  const sorted = [...gates].sort(
    (a, b) => b.count - a.count || a.resource.localeCompare(b.resource)
  );
  const top = sorted.slice(0, Math.max(0, limit));
  const namedDenials = sorted.reduce((sum, g) => sum + g.count, 0);
  const unnamedDenials = Math.max(0, totalDenied - namedDenials);
  const voice =
    namedDenials + unnamedDenials === 1
      ? `1 denial in the last ${windowLabel}.`
      : `${namedDenials + unnamedDenials} denials in the last ${windowLabel}${
          unnamedDenials > 0
            ? ` — ${unnamedDenials} never named their gate.`
            : ', every one named its gate.'
        }`;
  const maxCount = top.length > 0 ? top[0].count : 0;
  return { top, namedDenials, unnamedDenials, voice, maxCount };
}

/**
 * The gate drill's subtitle (v2.295.0) — the drill panel's own voice.
 *
 * v2.295.0 makes the Most denied gates card's rows HANDLES: clicking a gate
 * opens a drill panel listing exactly the PERMISSION_DENIED records that
 * named that resource (the events API's new `?resource=` filter, windowed
 * to the card's lens). This pure composer speaks the panel's one-line
 * answer — the gate's address, its count in the window, the window itself —
 * so the drill never shows a bare list without its question.
 *
 * Pure so the RUNTIME-PIN law holds: the suite pins the sentences by value
 * (singular/plural, default window, custom window); the render site just
 * wires it.
 */
export function gateDrillVoice(resource: string, count: number, windowLabel = '24h'): string {
  return `${count} ${count === 1 ? 'denial' : 'denials'} at ${resource} in the last ${windowLabel}.`;
}

/**
 * The gate drill's honest-empty voice (v2.295.0) — spoken when the drill's
 * fetch returns no rows for a gate the report just counted (the ledger can
 * move between the report fetch and the drill fetch; the panel says so
 * instead of rendering a blank box).
 */
export function gateDrillEmptyVoice(resource: string): string {
  return `No denial records at ${resource} right now — the ledger moved since the count.`;
}

/**
 * The gate drill's page size (v2.296.0) — how many records one step of the
 * walk brings. One constant so the fetch's limit and the "show earlier"
 * arithmetic can never drift apart.
 */
export const GATE_DRILL_PAGE_SIZE = 8;

/**
 * The gate drill's row shape (v2.296.0) — moved here from the tab so the
 * walk's merge helper can be pure and RUNTIME-pinned (the tab imports it,
 * never copies it — the same one-home law the voices already obey).
 */
export interface GateDrillEvent {
  id: string;
  eventType: string;
  severity: string;
  ipAddress: string | null;
  action: string | null;
  createdAt: string;
  blocked: boolean;
  /**
   * v2.297.0: the recorder's payload — `{ role, permission, email }` on the
   * rows recordPermissionDenied writes. Parsed to an object by the events
   * route, but typed `unknown` on purpose: the ONE parse is
   * drillActorFromDetails, and legacy/garbage payloads stay anonymous.
   */
  details?: unknown;
}

/**
 * The walk's merge (v2.296.0) — appended earlier rows dedupe by id against
 * everything already shown. The window slides: a denial minted between two
 * page fetches pushes a row the older page already delivered, and the walk
 * must never show the same record twice (nor let a duplicate lie about how
 * many remain). Pure so the RUNTIME-PIN law holds.
 */
export function mergeDrillRows(
  existing: GateDrillEvent[],
  incoming: GateDrillEvent[]
): GateDrillEvent[] {
  const seen = new Set(existing.map((e) => e.id));
  return [...existing, ...incoming.filter((e) => !seen.has(e.id))];
}

/**
 * The walk's count voice (v2.296.0) — how many earlier records the window
 * still holds. It replaces the v2.295.0 "+N earlier in this window." static
 * line: the number is LIVE now, it shrinks with every page the walk shows.
 */
export function gateDrillEarlierVoice(remaining: number): string {
  return `${remaining} earlier ${remaining === 1 ? 'denial' : 'denials'} in this window.`;
}

/**
 * The walk's button label (v2.296.0) — names exactly what the click WILL
 * show (min(page size, remaining)), so the number on the button is a
 * promise the fetch can keep.
 */
export function gateDrillShowEarlierLabel(count: number): string {
  return `Show ${count} earlier ${count === 1 ? 'denial' : 'denials'}`;
}

/**
 * The walk's closing voice (v2.296.0) — spoken when every record the window
 * holds is on screen; the button retires and the ledger says it is complete.
 */
export function gateDrillExhaustedVoice(total: number): string {
  return `All ${total} ${total === 1 ? 'denial' : 'denials'} in this window ${
    total === 1 ? 'is' : 'are'
  } shown.`;
}

/**
 * The walk's honest-failure voice (v2.296.0) — the page fetch failed; the
 * rows already shown keep their places and the panel says so instead of
 * pretending the click never happened.
 */
export function gateDrillErrorVoice(): string {
  return 'The earlier denials did not load — try again.';
}

/**
 * The drill row's anonymous face (v2.297.0) — the word spoken when a denial
 * record carries no readable actor. The feed's Security tab has said
 * 'Unknown user' since v2.292.0; the word moves here so the drill speaks
 * the SAME vocabulary from ONE home (the feed's inline copy predates the
 * lib home and may migrate to it in a later release).
 */
export const DRILL_UNKNOWN_ACTOR = 'Unknown user';

/**
 * One denial's actor (v2.297.0) — the recorder writes
 * `details: { role, permission, email }` (auth.ts recordPermissionDenied);
 * the events API spreads the row with that field JSON-parsed. Every field
 * is nullable: legacy rows, non-recorder event types and any future writer
 * that forgets a key stay anonymous — the drill never guesses an identity.
 */
export interface DrillActor {
  email: string | null;
  role: string | null;
  permission: string | null;
}

/**
 * The ONE parse of a drill row's details (v2.297.0).
 *
 * The wire's shape has drifted across the recorder's life: today's rows
 * carry a parsed object, but a defensive writer (or an older route) may
 * deliver the raw JSON string, and rows from event types that never had an
 * actor carry null or a foreign payload. The law: ONE guarded attempt to
 * reach an object (a string gets one JSON.parse, garbage dies quietly),
 * each of the three words lands ONLY when it is a non-empty string, and
 * everything else stays null — the honest absence, never an invented
 * identity. Pure and non-throwing so the RUNTIME-PIN law holds.
 */
export function drillActorFromDetails(details: unknown): DrillActor {
  let source: unknown = details;
  if (typeof source === 'string') {
    try {
      source = JSON.parse(source);
    } catch {
      source = null;
    }
  }
  const obj =
    source !== null && typeof source === 'object' ? (source as Record<string, unknown>) : null;
  const word = (v: unknown): string | null =>
    typeof v === 'string' && v.trim().length > 0 ? v : null;
  return {
    email: obj ? word(obj.email) : null,
    role: obj ? word(obj.role) : null,
    permission: obj ? word(obj.permission) : null,
  };
}

/**
 * The distinct-actor count (v2.297.0) — how many DIFFERENT accounts stand
 * behind the drill's shown rows. The question the count answers is "one
 * misconfigured device or ten accounts hammering the gate", and an
 * anonymous row must never inflate it: a null email is an unknown, not a
 * third actor. Pure so the RUNTIME-PIN law holds.
 */
export function distinctActorEmails(actors: DrillActor[]): number {
  const seen = new Set<string>();
  for (const actor of actors) {
    if (actor.email) seen.add(actor.email);
  }
  return seen.size;
}

/**
 * The drill's actor voice (v2.297.0) — the aggregate line beneath the
 * drill's subtitle: how many accounts stand behind the denials on screen.
 *
 * THE HONESTY LAWS:
 *   • zero named actors → null — the panel stays silent rather than dress
 *     an all-anonymous ledger in a count it cannot speak;
 *   • the complete window names itself ("all N denials in this window")
 *     — shown >= total means the walk finished (or the ledger shrank;
 *     both are complete);
 *   • an unfinished walk NEVER claims the unseen rows: the voice names the
 *     slice actually shown ("the first 8 of 10 denials shown") — the
 *     count grows as the walk grows, and says so.
 */
export function gateDrillActorVoice(actors: number, shown: number, total: number): string | null {
  if (!Number.isFinite(actors) || actors <= 0) return null;
  const actorWord = actors === 1 ? '1 actor' : `${actors} actors`;
  if (shown >= total) {
    return `${actorWord} behind all ${total} ${total === 1 ? 'denial' : 'denials'} in this window.`;
  }
  return `${actorWord} behind the first ${shown} of ${total} denials shown.`;
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
