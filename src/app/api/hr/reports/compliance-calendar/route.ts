// GET /api/hr/reports/compliance-calendar — the filing clock (v2.274.0)
//
// The calendar is DERIVED, not stored: Kenya's monthly payroll obligations
// fall due on the 9th of the following month, so the payload is a pure
// function of the server's own clock (client clocks lie; the server is the
// one truth). No period params — the clock is not period-scoped — and no
// storeId: the statute does not vary by branch. Read surface only (no
// audit — exports get audits, reads ride the guard alone).

import { hrGuard } from '@/lib/hr/guard';
import { complianceCalendar } from '@/lib/hr/compliance-calendar';

export const dynamic = 'force-dynamic';

const REPORT_ROLES = ['HR_MANAGER', 'STORE_OWNER', 'ACCOUNTANT', 'BRANCH_MANAGER'] as const;

export const GET = hrGuard('hr.report.branch', REPORT_ROLES)(
  async () => {
    const data = complianceCalendar(new Date());
    return Response.json({ success: true, data });
  },
);
