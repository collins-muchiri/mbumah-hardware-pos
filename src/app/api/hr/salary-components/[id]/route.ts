// PATCH /api/hr/salary-components/[id] - activate / deactivate (v2.304.0)
//
// The honest off-switch for a catalog component: the run service skips
// inactive components before a single cent is computed, so deactivating
// stops future runs from paying it; issued payslips keep their numbers.
//
// hr.salary-structure.manage (HR_MANAGER/STORE_OWNER; SUPER_ADMIN bypasses)
// via the service (spec rule 15).

import { hrGuard, type HrRouteContext } from '@/lib/hr/guard';
import { setSalaryComponentActive, SalaryStructureError } from '@/lib/hr/salary-structure-service';

export const dynamic = 'force-dynamic';

export const PATCH = hrGuard('hr.salary-structure.manage')(
  async (request, session, context?: HrRouteContext) => {
    const params = context?.params ? await context.params : undefined;
    const id = params?.id;
    if (!id) {
      return Response.json({ success: false, error: 'Missing component id.' }, { status: 400 });
    }
    let body: { isActive?: boolean };
    try {
      body = (await request.json()) as { isActive?: boolean };
    } catch {
      return Response.json({ success: false, error: 'The request body is not valid JSON.' }, { status: 400 });
    }
    if (typeof body.isActive !== 'boolean') {
      return Response.json(
        { success: false, error: 'isActive must be true or false — the only component mutation.' },
        { status: 400 },
      );
    }
    try {
      const updated = await setSalaryComponentActive(session, id, body.isActive);
      return Response.json({ success: true, data: updated });
    } catch (e) {
      if (e instanceof SalaryStructureError) {
        return Response.json({ success: false, error: e.message, code: e.code }, { status: e.status });
      }
      throw e;
    }
  },
);
