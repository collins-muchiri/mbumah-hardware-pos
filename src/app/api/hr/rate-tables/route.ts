// GET  /api/hr/rate-tables - list versioned statutory rate tables
// POST /api/hr/rate-tables - create a new versioned table (v2.303.0, the keeper)
//
// Read surface for the compliance UI; v2.303.0 adds the WRITE surface the
// API header has been promising since the migration plan ("management is
// hr.rate-table.manage and arrives with the payroll release") — the issue
// rows' door law (v2.302.0) could only leave RATE_TABLE_MISSING and
// OVERLAPPING_RATE_TABLES honestly doorless because this surface did not
// exist; now it does, and those doors have a home.
//
// GET is org-scoped: SUPER_ADMIN and STORE_OWNER may read any org table via
// ?organizationId; HR_MANAGER reads their own organization. Default answers
// only tables EFFECTIVE at ?asOf (default now) — the payroll desk's own
// view. ?scope=all returns the full version history (closed + scheduled
// windows too) for the management desk; read roles unchanged.
//
// POST is hr.rate-table.manage (SUPER_ADMIN) and goes through the service
// (route handlers never call Prisma for HR mutations, spec rule 15): the
// service validates the shape, replicates the ENGINE'S OWN overlap law at
// write time (a same org+type+code window intersect that resolveRates would
// throw OVERLAPPING_RATE_TABLES over is refused 409 at the door), creates
// the version with its rows, and writes the hash-chained audit row.

import { db } from '@/lib/db';
import { hrGuard } from '@/lib/hr/guard';
import { createRateTable, RateTableError } from '@/lib/hr/rate-table-service';

export const dynamic = 'force-dynamic';

const READ_ROLES = ['HR_MANAGER', 'STORE_OWNER', 'ACCOUNTANT'] as const;

export const GET = hrGuard('hr.employee.read.own_branch', READ_ROLES)(
  async (request, session) => {
    const url = new URL(request.url);
    const requestedOrg = url.searchParams.get('organizationId');
    const organizationId =
      session.role === 'SUPER_ADMIN' || session.role === 'STORE_OWNER'
        ? requestedOrg || session.organizationId
        : session.organizationId;

    if (!organizationId) {
      return Response.json({ success: false, error: 'No organization context.' }, { status: 400 });
    }

    const typeFilter = url.searchParams.get('type');
    const asOf = url.searchParams.get('asOf');
    // v2.303.0: the management desk reads the FULL history — closed and
    // scheduled windows are exactly what the overlap warnings and the close
    // action exist for. The default stays effective-only (existing callers
    // see no change).
    const scopeAll = url.searchParams.get('scope') === 'all';

    const tables = await db.rateTable.findMany({
      where: {
        organizationId,
        ...(typeFilter ? { type: typeFilter } : {}),
      },
      orderBy: [{ type: 'asc' }, { effectiveFrom: 'desc' }],
      include: {
        rows: {
          orderBy: { order: 'asc' },
          select: {
            order: true,
            lowerBoundCents: true,
            upperBoundCents: true,
            rateBps: true,
            flatAmountCents: true,
            reliefCents: true,
            employerMatchBps: true,
          },
        },
      },
    });

    if (scopeAll) {
      return Response.json({ success: true, data: tables, count: tables.length });
    }

    // asOf filter: keep only tables effective at the given date (default now).
    const at = asOf ? new Date(asOf) : new Date();
    const effective = tables.filter((t) => {
      const fromOk = t.effectiveFrom.getTime() <= at.getTime();
      const toOk = !t.effectiveTo || t.effectiveTo.getTime() >= at.getTime();
      return fromOk && toOk;
    });

    return Response.json({ success: true, data: effective, count: effective.length });
  },
);

export const POST = hrGuard('hr.rate-table.manage')(async (request, session) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: 'The request body is not valid JSON.' }, { status: 400 });
  }
  try {
    const created = await createRateTable(session, body as Parameters<typeof createRateTable>[1]);
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (e) {
    if (e instanceof RateTableError) {
      return Response.json({ success: false, error: e.message, code: e.code }, { status: e.status });
    }
    throw e;
  }
});
