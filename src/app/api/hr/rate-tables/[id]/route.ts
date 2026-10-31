// PATCH /api/hr/rate-tables/[id] - close a table's effective window (v2.303.0)
//
// The OVERLAPPING_RATE_TABLES fix's write half: the engine refuses to price
// a run while two same-code windows answer for one day, and the keeper's
// insert guard refuses to CREATE that state — the remaining move is closing
// one of the overlapping versions, which is THIS route. Closing sets
// effectiveTo only: the table keeps its rows and every payslip it priced
// stays priced by it (insert-only versioning, never deletion).
//
// hr.rate-table.manage (SUPER_ADMIN) via the service (spec rule 15: routes
// never touch Prisma for HR mutations; the service writes the audit row).

import { hrGuard, type HrRouteContext } from '@/lib/hr/guard';
import { closeRateTable, RateTableError } from '@/lib/hr/rate-table-service';

export const dynamic = 'force-dynamic';

export const PATCH = hrGuard('hr.rate-table.manage')(
  async (request, session, context?: HrRouteContext) => {
    const params = context?.params ? await context.params : undefined;
    const id = params?.id;
    if (!id) {
      return Response.json({ success: false, error: 'Missing table id.' }, { status: 400 });
    }
    let body: { effectiveTo?: string };
    try {
      body = (await request.json()) as { effectiveTo?: string };
    } catch {
      return Response.json({ success: false, error: 'The request body is not valid JSON.' }, { status: 400 });
    }
    try {
      const closed = await closeRateTable(session, id, String(body.effectiveTo ?? ''));
      return Response.json({ success: true, data: closed });
    } catch (e) {
      if (e instanceof RateTableError) {
        return Response.json({ success: false, error: e.message, code: e.code }, { status: e.status });
      }
      throw e;
    }
  },
);
