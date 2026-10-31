// PATCH /api/hr/salary-structures/[id] - withdraw a structure (v2.304.0)
//
// The honest off-switch. The engine filters deletedAt: null, so withdrawing
// stops future runs from reading the structure — the employee falls back to
// basic salary until a newer version begins. Issued payslips keep the
// numbers they were paid by (append-only). There is NO close-window
// affordance on this desk on purpose: the engine ignores `effectiveTo`, so
// a close that would not stop payment would be a lie with a button on it.
//
// hr.salary-structure.manage (HR_MANAGER/STORE_OWNER; SUPER_ADMIN bypasses)
// via the service (spec rule 15: routes never touch Prisma for HR
// mutations; the service writes the audit row).

import { hrGuard, type HrRouteContext } from '@/lib/hr/guard';
import { withdrawSalaryStructure, SalaryStructureError } from '@/lib/hr/salary-structure-service';

export const dynamic = 'force-dynamic';

export const PATCH = hrGuard('hr.salary-structure.manage')(
  async (request, session, context?: HrRouteContext) => {
    const params = context?.params ? await context.params : undefined;
    const id = params?.id;
    if (!id) {
      return Response.json({ success: false, error: 'Missing structure id.' }, { status: 400 });
    }
    let body: { action?: string };
    try {
      body = (await request.json()) as { action?: string };
    } catch {
      body = {};
    }
    if (body.action && body.action !== 'withdraw') {
      return Response.json(
        { success: false, error: 'Unknown action — the only structure mutation is "withdraw".' },
        { status: 400 },
      );
    }
    try {
      const withdrawn = await withdrawSalaryStructure(session, id);
      return Response.json({ success: true, data: withdrawn });
    } catch (e) {
      if (e instanceof SalaryStructureError) {
        return Response.json({ success: false, error: e.message, code: e.code }, { status: e.status });
      }
      throw e;
    }
  },
);
