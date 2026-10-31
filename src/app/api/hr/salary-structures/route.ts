// GET  /api/hr/salary-structures - list versioned salary structures
// POST /api/hr/salary-structures - create a new versioned structure (v2.304.0)
//
// The salary desk's read and write halves. The run service has always READ
// these structures (the newest structure that has begun answers; its
// components feed the payslip); v2.304.0 adds the management surface the
// issue rows' honest-null law had to leave doorless (UNRESOLVED_DEPENDENCY —
// "salary structures have no management UI"). The door now walks HERE.
//
// GET is org-scoped (the employee's store organization): SUPER_ADMIN and
// STORE_OWNER may read any org structure via ?organizationId; HR_MANAGER
// and ACCOUNTANT read their own organization. Default answers every
// non-withdrawn structure with its components (the desk groups by employee
// and computes the in-force statuses itself); ?employeeId narrows to one
// employee; ?scope=all additionally returns withdrawn structures (the
// audit-facing view; the desk default stays the living history).
//
// POST is hr.salary-structure.manage (HR_MANAGER/STORE_OWNER; SUPER_ADMIN
// bypasses) and goes through the service (spec rule 15): the service
// validates the employee, the frequency, the window, refuses a same-day
// second beginning (the engine resolves ties by input order — a coin flip,
// not versioning), verifies every picked component is a known ACTIVE
// component of this organization, and writes the hash-chained audit row.

import { db } from '@/lib/db';
import { hrGuard } from '@/lib/hr/guard';
import { createSalaryStructure, SalaryStructureError } from '@/lib/hr/salary-structure-service';

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

    const employeeFilter = url.searchParams.get('employeeId');
    const scopeAll = url.searchParams.get('scope') === 'all';

    const structures = await db.salaryStructure.findMany({
      where: {
        employee: { store: { organizationId } },
        ...(employeeFilter ? { employeeId: employeeFilter } : {}),
        ...(scopeAll ? {} : { deletedAt: null }),
      },
      orderBy: [{ employeeId: 'asc' }, { effectiveFrom: 'desc' }],
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, basicSalary: true },
        },
        components: { include: { salaryComponent: true } },
      },
    });

    return Response.json({ success: true, data: structures, count: structures.length });
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
    const created = await createSalaryStructure(session, body as Parameters<typeof createSalaryStructure>[1]);
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (e) {
    if (e instanceof SalaryStructureError) {
      return Response.json({ success: false, error: e.message, code: e.code }, { status: e.status });
    }
    throw e;
  }
});
