// GET /api/hr/reports/portal-adoption — the portal adoption report (hr.report.*)
// v2.271.0: the roster's quiet bell rolled up to report distance. A
// point-in-time census (no period), scoped by the same governed rules as
// every other report tab; the branch drill-down narrows it the same way.

import { hrGuard } from '@/lib/hr/guard';
import { portalAdoptionReport, resolveReportScope, validateReportStore } from '@/lib/hr/reports';
import { toErrorResponse } from '@/lib/hr/stage-g-shared';

export const dynamic = 'force-dynamic';

const REPORT_ROLES = ['HR_MANAGER', 'STORE_OWNER', 'ACCOUNTANT', 'BRANCH_MANAGER'] as const;

export const GET = hrGuard('hr.report.branch', REPORT_ROLES)(async (request, session) => {
  try {
    const url = new URL(request.url);
    const scope = resolveReportScope(session);
    const store = await validateReportStore(session, scope, url.searchParams.get('storeId'));
    const data = await portalAdoptionReport(session, { storeId: store?.id ?? null });
    if (!data) {
      return Response.json(
        { success: false, error: 'You do not have permission to view reports.', code: 'PERMISSION_DENIED' },
        { status: 403 },
      );
    }
    return Response.json({ success: true, data });
  } catch (error) {
    return toErrorResponse(error);
  }
});
