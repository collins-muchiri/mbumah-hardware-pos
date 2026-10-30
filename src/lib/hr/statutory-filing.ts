/**
 * The filing ledger (v2.276.0 "the ledger takes the receipt").
 *
 * The calendar (v2.274.0) speaks the CLOCK and v2.275.0 put the clock
 * beside the money, but "whether a window was filed" had no ledger face —
 * the card's own footer law deferred to a ledger that did not exist. This
 * lib IS that ledger's one home: the pure input validation (the RUNTIME
 * pin law — the arithmetic and the gates get pins, bytes never catch a
 * lie), the org-scoped read, and the upsert write the Statutory desk
 * speaks when a return or payment goes in.
 *
 * Laws carried over:
 * - The document's-answer law: a receipt is an ASSERTION the filer makes,
 *   never a guess the system makes — no surface derives a filing from
 *   money moved (the journal carries the charge; the ledger carries the
 *   receipt; the two never borrow each other's words).
 * - The tenant law: the statute does not vary by branch (the calendar's
 *   own law), so the ledger is org-scoped — organizationId + kind +
 *   periodMonth is the compound unique; a re-record AMENDS the row, it
 *   never forks a second truth.
 * - The client-clocks-lie law: filedAt is what the filer asserts (the
 *   actual date the return/payment was made), validated server-side to
 *   be no further than one minute in the future — a dated-tomorrow
 *   receipt would be a lie with a timestamp.
 */

import { db } from '@/lib/db';
import type { AuthSession } from '@/lib/auth';

/** The four monthly obligations — the calendar's own kinds, byte-equal. */
export const STATUTORY_FILING_KINDS = ['PAYE', 'NSSF', 'SHIF', 'AHL'] as const;

export type StatutoryFilingKind = (typeof STATUTORY_FILING_KINDS)[number];

export interface StatutoryFilingInput {
  kind: string;
  periodMonth: string;
  filedAt: string;
  reference?: string | null;
  note?: string | null;
}

export type StatutoryFilingValidated =
  | { ok: true; value: { kind: StatutoryFilingKind; periodMonth: string; filedAt: Date; reference: string | null; note: string | null } }
  | { ok: false; code: 'INVALID_KIND' | 'INVALID_MONTH' | 'INVALID_FILED_AT' | 'FILED_AT_IN_FUTURE' | 'REFERENCE_TOO_LONG' | 'NOTE_TOO_LONG' };

const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;
/** The filer's words have caps — a reference is a voucher number, not a letter. */
const REFERENCE_MAX = 120;
const NOTE_MAX = 500;
/** One minute of skew: "filed now" typed on a slow client still passes. */
const FUTURE_SLACK_MS = 60_000;

/**
 * The pure gate every write passes through. Total: any malformed field
 * returns its own precise code (the fail-closed law — never a guessed
 * default, never a silent coercion of an unknown kind into a known one).
 */
export function validateFilingInput(input: StatutoryFilingInput, now: Date): StatutoryFilingValidated {
  const kind = input.kind as StatutoryFilingKind;
  if (!(STATUTORY_FILING_KINDS as readonly string[]).includes(kind)) return { ok: false, code: 'INVALID_KIND' };
  if (typeof input.periodMonth !== 'string' || !MONTH_KEY.test(input.periodMonth)) return { ok: false, code: 'INVALID_MONTH' };

  const filed = new Date(input.filedAt ?? '');
  if (!input.filedAt || Number.isNaN(filed.getTime())) return { ok: false, code: 'INVALID_FILED_AT' };
  if (filed.getTime() > now.getTime() + FUTURE_SLACK_MS) return { ok: false, code: 'FILED_AT_IN_FUTURE' };

  const reference = typeof input.reference === 'string' ? input.reference.trim().slice(0, REFERENCE_MAX) : null;
  if (typeof input.reference === 'string' && input.reference.trim().length > REFERENCE_MAX) {
    return { ok: false, code: 'REFERENCE_TOO_LONG' };
  }
  const note = typeof input.note === 'string' ? input.note.trim().slice(0, NOTE_MAX) : null;
  if (typeof input.note === 'string' && input.note.trim().length > NOTE_MAX) {
    return { ok: false, code: 'NOTE_TOO_LONG' };
  }

  return { ok: true, value: { kind, periodMonth: input.periodMonth, filedAt: filed, reference: reference || null, note: note || null } };
}

export interface StatutoryFilingRow {
  kind: string;
  periodMonth: string;
  filedAt: string;
  reference: string | null;
  note: string | null;
  filedByName: string | null;
  // v2.277.0: the receipt's own history — the chip reads whether the row
  // was genuinely amended (filingWasAmended's slack law) and the amend
  // dialog's strip speaks the original recording. ISO strings on the wire.
  createdAt: string;
  updatedAt: string;
}

const MONTH_KEY_SHAPE = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * The org-scoped read: every filing whose payroll month falls inside the
 * requested [fromMonth, toMonth] window (inclusive, "YYYY-MM" keys — the
 * monthKey shape the monthly rows speak). The filer's NAME rides the row
 * (this desk is role-gated and already speaks names at roster distance),
 * the filer's id never does.
 */
export async function fetchStatutoryFilings(
  session: AuthSession,
  opts?: { fromMonth?: string | null; toMonth?: string | null },
): Promise<StatutoryFilingRow[]> {
  const organizationId = session.organizationId;
  if (!organizationId) return [];

  const fromMonth = opts?.fromMonth && MONTH_KEY_SHAPE.test(opts.fromMonth) ? opts.fromMonth : null;
  const toMonth = opts?.toMonth && MONTH_KEY_SHAPE.test(opts.toMonth) ? opts.toMonth : null;

  const rows = await db.statutoryFiling.findMany({
    where: {
      organizationId,
      ...(fromMonth || toMonth
        ? { periodMonth: { ...(fromMonth ? { gte: fromMonth } : {}), ...(toMonth ? { lte: toMonth } : {}) } }
        : {}),
    },
    orderBy: [{ periodMonth: 'desc' }, { kind: 'asc' }],
    select: {
      kind: true,
      periodMonth: true,
      filedAt: true,
      reference: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      filedBy: { select: { name: true } },
    },
  });

  return rows.map((r) => ({
    kind: r.kind,
    periodMonth: r.periodMonth,
    filedAt: r.filedAt.toISOString(),
    reference: r.reference,
    note: r.note,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    filedByName: r.filedBy?.name ?? null,
  }));
}

export interface UpsertResult {
  filing: StatutoryFilingRow;
  /** true = the compound unique found an existing receipt and this write AMENDED it. */
  amended: boolean;
}

/**
 * The one write: validate → upsert on the compound unique. A re-record
 * for a (kind, month) that already has a receipt AMENDS it (filedAt,
 * reference, note, filer updated — the updatedAt speaks); the response
 * says which it did, so the desk never wonders whether it filed twice.
 */
export async function upsertStatutoryFiling(session: AuthSession, input: StatutoryFilingInput): Promise<UpsertResult> {
  const v = validateFilingInput(input, new Date());
  if (!v.ok) throw new StatutoryFilingError(v.code);

  const organizationId = session.organizationId;
  if (!organizationId) throw new StatutoryFilingError('NO_ORGANIZATION');

  const existing = await db.statutoryFiling.findUnique({
    where: { organizationId_kind_periodMonth: { organizationId, kind: v.value.kind, periodMonth: v.value.periodMonth } },
    select: { id: true },
  });

  const row = await db.statutoryFiling.upsert({
    where: { organizationId_kind_periodMonth: { organizationId, kind: v.value.kind, periodMonth: v.value.periodMonth } },
    create: {
      organizationId,
      kind: v.value.kind,
      periodMonth: v.value.periodMonth,
      filedAt: v.value.filedAt,
      reference: v.value.reference,
      note: v.value.note,
      filedByUserId: session.userId ?? null,
    },
    update: {
      filedAt: v.value.filedAt,
      reference: v.value.reference,
      note: v.value.note,
      filedByUserId: session.userId ?? null,
    },
    select: {
      kind: true,
      periodMonth: true,
      filedAt: true,
      reference: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      filedBy: { select: { name: true } },
    },
  });

  return {
    amended: Boolean(existing),
    filing: {
      kind: row.kind,
      periodMonth: row.periodMonth,
      filedAt: row.filedAt.toISOString(),
      reference: row.reference,
      note: row.note,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      filedByName: row.filedBy?.name ?? null,
    },
  };
}

/** The precise machine code the route speaks (never a bare 500). */
export class StatutoryFilingError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}
