// MBUMAH HARDWARE POS - rate-table service (v2.303.0)
//
// WHY THIS SERVICE EXISTS: rate tables were insert-only data since the EMS
// migration plan — the engine READ them (resolveRates) and threw
// RATE_TABLE_MISSING / OVERLAPPING_RATE_TABLES when the data could not answer,
// but no management surface existed, so the issue rows' honest-null law had
// to leave those two codes doorless. v2.303.0 is the keeper: versioned
// inserts and window closes that REPLICATE THE ENGINE'S OWN LAWS at write
// time — refusing an insert that would create the exact overlap payroll
// would refuse at run time (parity by construction, not by hope).
//
// Spec rules honored:
//   - route handlers never call Prisma directly for HR mutations (rule 15):
//     the POST/PATCH routes call THESE functions, and every mutation writes
//     an hrAudit row (hash-chained, calm field-name-only metadata);
//   - insert-only versioning: a table is never edited in place; a new
//     effective version is added, an old window is CLOSED (effectiveTo) —
//     never deleted, so issued payslips keep the table they were priced by.

import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { hrAudit, HrEntityType } from '@/lib/hr/audit';
import { RATE_TABLE_TYPES, rateTableWindowsIntersect } from '@/lib/hr/rate-table-view';
import type { AuthSession } from '@/lib/auth';

/** The service's own refusal: the route maps `status` onto the response and
 * speaks the message verbatim — the voice already written for the issue row
 * is the same voice the manager reads here. */
export class RateTableError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'RateTableError';
  }
}

export interface RateTableRowInput {
  order?: number;
  lowerBoundCents: number;
  upperBoundCents?: number | null;
  rateBps?: number | null;
  flatAmountCents?: number | null;
  reliefCents?: number | null;
  employerMatchBps?: number | null;
}

export interface CreateRateTableInput {
  type: string;
  code: string;
  label: string;
  basis?: string;
  instrumentReference?: string;
  verifyWithCounsel?: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  rows: RateTableRowInput[];
}

/** A non-negative integer cents value (the rows' money fields). */
function isCents(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 0;
}

/** The engine's types the desk accepts — a typo'd type would be a table
 * payroll can never resolve, so the guard is the known list. */
export function isKnownRateTableType(type: string): type is (typeof RATE_TABLE_TYPES)[number] {
  return (RATE_TABLE_TYPES as readonly string[]).includes(type);
}

/**
 * Create a new versioned statutory table (with its rows) for the session's
 * organization. THE OVERLAP GUARD: for the same org+type+code, the new
 * window [effectiveFrom, effectiveTo ?? ∞) must not intersect an existing
 * window — the engine throws OVERLAPPING_RATE_TABLES when two same-code
 * windows both answer for one day, so the keeper refuses to CREATE that
 * state. Boundary-touching windows intersect by the engine's own law (both
 * answer for the boundary date) and are refused the same way.
 */
export async function createRateTable(
  session: AuthSession,
  input: CreateRateTableInput,
): Promise<{ id: string }> {
  const type = typeof input.type === 'string' ? input.type.trim() : '';
  const code = typeof input.code === 'string' ? input.code.trim() : '';
  const label = typeof input.label === 'string' ? input.label.trim() : '';
  if (!isKnownRateTableType(type)) {
    throw new RateTableError(400, 'UNKNOWN_TYPE', `Unknown statutory table type "${type || '(empty)'}". Choose one of the known types.`);
  }
  if (!code) throw new RateTableError(400, 'MISSING_CODE', 'The table needs a code (the version\u2019s name within its type).');
  if (!label) throw new RateTableError(400, 'MISSING_LABEL', 'The table needs a human label.');
  const basis = typeof input.basis === 'string' && input.basis.trim() ? input.basis.trim() : 'MONTHLY';
  const instrumentReference =
    typeof input.instrumentReference === 'string' && input.instrumentReference.trim()
      ? input.instrumentReference.trim()
      : '';
  const from = new Date(input.effectiveFrom);
  if (!input.effectiveFrom || Number.isNaN(from.getTime())) {
    throw new RateTableError(400, 'BAD_EFFECTIVE_FROM', 'The effective window needs a valid start date.');
  }
  let to: Date | null = null;
  if (input.effectiveTo) {
    to = new Date(input.effectiveTo);
    if (Number.isNaN(to.getTime())) {
      throw new RateTableError(400, 'BAD_EFFECTIVE_TO', 'The effective window\u2019s end date is not a valid date.');
    }
    if (to.getTime() < from.getTime()) {
      throw new RateTableError(400, 'BAD_WINDOW', 'The effective window ends before it begins.');
    }
  }
  const rows = Array.isArray(input.rows) ? input.rows : [];
  if (rows.length === 0) {
    throw new RateTableError(400, 'NO_ROWS', 'The table needs at least one rate row.');
  }
  for (const [i, r] of rows.entries()) {
    if (!isCents(r.lowerBoundCents)) {
      throw new RateTableError(400, 'BAD_ROW', `Row ${i + 1}: the lower bound must be a whole, non-negative number of cents.`);
    }
    if (r.upperBoundCents != null && (!isCents(r.upperBoundCents) || r.upperBoundCents <= r.lowerBoundCents)) {
      throw new RateTableError(400, 'BAD_ROW', `Row ${i + 1}: the upper bound must be a whole number of cents above the lower bound.`);
    }
    const hasRate = r.rateBps != null && r.rateBps !== 0;
    const hasFlat = r.flatAmountCents != null && r.flatAmountCents !== 0;
    const hasRelief = r.reliefCents != null && r.reliefCents !== 0;
    if (!hasRate && !hasFlat && !hasRelief) {
      throw new RateTableError(400, 'BAD_ROW', `Row ${i + 1}: give the row a rate (bps), a flat amount, or a relief.`);
    }
    if (r.rateBps != null && (!Number.isInteger(r.rateBps) || r.rateBps < 0)) {
      throw new RateTableError(400, 'BAD_ROW', `Row ${i + 1}: the rate must be a whole, non-negative number of basis points.`);
    }
  }

  // THE OVERLAP GUARD (engine parity, write-time).
  const siblings = await db.rateTable.findMany({
    where: { organizationId: session.organizationId, type, code },
    select: { id: true, effectiveFrom: true, effectiveTo: true, label: true },
  });
  const candidate = { effectiveFrom: from, effectiveTo: to };
  for (const s of siblings) {
    if (rateTableWindowsIntersect(candidate, s)) {
      throw new RateTableError(
        409,
        'OVERLAPPING_RATE_TABLES',
        `"${s.label}" already covers part of this window (${s.effectiveFrom.toISOString().slice(0, 10)} → ${s.effectiveTo ? s.effectiveTo.toISOString().slice(0, 10) : 'open'}). Close or correct that version first — two windows of one code may never answer for the same day.`,
      );
    }
  }

  try {
    const created = await db.rateTable.create({
      data: {
        organizationId: session.organizationId,
        type,
        code,
        label,
        basis,
        instrumentReference,
        verifyWithCounsel: input.verifyWithCounsel ?? true,
        effectiveFrom: from,
        effectiveTo: to,
        createdByUserId: session.userId,
        rows: {
          create: rows.map((r, i) => ({
            order: typeof r.order === 'number' ? r.order : i,
            lowerBoundCents: r.lowerBoundCents,
            upperBoundCents: r.upperBoundCents ?? null,
            rateBps: r.rateBps ?? null,
            flatAmountCents: r.flatAmountCents ?? null,
            reliefCents: r.reliefCents ?? null,
            employerMatchBps: r.employerMatchBps ?? null,
          })),
        },
      },
      select: { id: true },
    });
    await hrAudit({
      actorId: session.userId,
      actorRole: session.role,
      action: 'RATE_TABLE_CREATED',
      resourceType: HrEntityType.RATE_TABLE,
      resourceId: created.id,
      storeId: session.storeId,
      metadata: { type, code, rowCount: rows.length, effectiveFrom: input.effectiveFrom, fieldNames: ['type', 'code', 'effectiveFrom', 'rows'] },
    });
    return created;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new RateTableError(409, 'DUPLICATE_VERSION', 'A version of this type and code already begins on that exact date.');
    }
    throw e;
  }
}

/**
 * Close a table's window (set effectiveTo) — the OVERLAPPING fix. The table
 * keeps its rows and its payslip history; it simply stops answering for
 * dates after the close. Closing may only SHRINK a window: the date must be
 * on or after effectiveFrom, and an already-closed table is refused (a
 * close is itself append-only history — correct it by closing differently
 * is not a thing; a new version supersedes instead).
 */
export async function closeRateTable(
  session: AuthSession,
  id: string,
  effectiveTo: string,
): Promise<{ id: string }> {
  const to = new Date(effectiveTo);
  if (!effectiveTo || Number.isNaN(to.getTime())) {
    throw new RateTableError(400, 'BAD_EFFECTIVE_TO', 'The close date is not a valid date.');
  }
  const table = await db.rateTable.findFirst({
    where: { id, organizationId: session.organizationId },
    select: { id: true, label: true, effectiveFrom: true, effectiveTo: true },
  });
  if (!table) {
    throw new RateTableError(404, 'NOT_FOUND', 'No such rate table in this organization.');
  }
  if (table.effectiveTo && table.effectiveTo.getTime() <= to.getTime()) {
    throw new RateTableError(409, 'ALREADY_CLOSED', `"${table.label}" is already closed (through ${table.effectiveTo.toISOString().slice(0, 10)}); a close cannot extend a window.`);
  }
  if (to.getTime() < table.effectiveFrom.getTime()) {
    throw new RateTableError(400, 'BAD_WINDOW', 'The close date falls before the table began.');
  }
  const updated = await db.rateTable.update({
    where: { id: table.id },
    data: { effectiveTo: to },
    select: { id: true },
  });
  await hrAudit({
    actorId: session.userId,
    actorRole: session.role,
    action: 'RATE_TABLE_CLOSED',
    resourceType: HrEntityType.RATE_TABLE,
    resourceId: table.id,
    storeId: session.storeId,
    metadata: { effectiveTo, fieldNames: ['effectiveTo'] },
  });
  return updated;
}
