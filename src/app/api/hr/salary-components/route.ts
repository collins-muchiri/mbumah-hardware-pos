// GET  /api/hr/salary-components - the salary component catalog
// POST /api/hr/salary-components - create a component (v2.304.0)
//
// The catalog is the vocabulary payroll reads: the run service pays each
// attached component by the component's OWN amountCents/percentBps (the
// assignment's override fields are recorded data the engine does not
// read — the desk shows what payroll pays, never a promise it doesn't keep).
//
// GET is org-scoped (the component's store organization) and answers every
// non-deleted component; ?includeInactive=none narrows to active only (the
// default keeps both — the desk shows the inactive state honestly).
//
// POST is hr.salary-structure.manage (HR_MANAGER/STORE_OWNER; SUPER_ADMIN
// bypasses) and goes through the service (spec rule 15): known type,
// known computation, at least one value the engine resolves, P2002 →
// DUPLICATE_CODE 409, hash-chained audit row.

import { db } from '@/lib/db';
import { hrGuard } from '@/lib/hr/guard';
import { createSalaryComponent, SalaryStructureError } from '@/lib/hr/salary-structure-service';

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

    const activeOnly = url.searchParams.get('includeInactive') === 'none';

    const components = await db.salaryComponent.findMany({
      where: {
        store: { organizationId },
        deletedAt: null,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [{ code: 'asc' }],
    });

    return Response.json({ success: true, data: components, count: components.length });
  },
);

export const POST = hrGuard('hr.salary-structure.manage')(async (request, session) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: 'The request body is not valid JSON.' }, { status: 400 });
  }
  try {
    const created = await createSalaryComponent(session, body as Parameters<typeof createSalaryComponent>[1]);
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (e) {
    if (e instanceof SalaryStructureError) {
      return Response.json({ success: false, error: e.message, code: e.code }, { status: e.status });
    }
    throw e;
  }
});
