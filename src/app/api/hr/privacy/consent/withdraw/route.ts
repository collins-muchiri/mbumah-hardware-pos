// POST /api/hr/privacy/consent/withdraw - withdraw the employee's active
// consent(s): sets withdrawnAt. The payroll gate reads `withdrawnAt: null`,
// so the next run honestly reports MISSING_CONSENT for this employee.
// Decisions reserved to hr.settings.manage (canDecideErasure).

import type { NextRequest } from 'next/server';
import { hrGuard } from '@/lib/hr/guard';
import { canDecideErasure, withdrawConsent } from '@/lib/hr/data-protection';
import { toErrorResponse } from '@/lib/hr/stage-g-shared';
// v2.334.0 THE DOOR TIGHTENED: the body the service consumes IS the
// service's own input type (Parameters<typeof withdrawConsent>[0]) —
// the door can no longer drift from the handler it feeds (the
// per-file generic tightening, the `any`-law's sanctioned follow-up).
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

export const POST = hrGuard('hr.report.branch')(async (request: NextRequest, session) => {
  try {
    if (!canDecideErasure(session.role)) {
      return Response.json(
        {
          success: false,
          error: 'Only settings managers can withdraw consent records.',
          code: 'DECISION_FORBIDDEN',
        },
        { status: 403 },
      );
    }
    // THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0):
    const door = await readJsonBody<Parameters<typeof withdrawConsent>[0]>(request);
    if (!door.ok) {
      return bodyDoorRejected();
    }
    const body = door.body;
    return Response.json({ success: true, data: await withdrawConsent(body, session) });
  } catch (error) {
    return toErrorResponse(error);
  }
});
