// POST /api/hr/privacy/legal-hold - set or release a legal hold for one
// retention scope (HrSetting legalHold:<scope>). Releasing lets the nightly
// sweep anonymise that scope's expired records again — the destructive
// direction, so the UI asks twice; the API itself stays a single audited
// decision. Decisions reserved to hr.settings.manage (canDecideErasure) —
// the same key that decides erasures and consent records.

import type { NextRequest } from 'next/server';
import { hrGuard } from '@/lib/hr/guard';
import { canDecideErasure, setLegalHold } from '@/lib/hr/data-protection';
import { toErrorResponse } from '@/lib/hr/stage-g-shared';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';
// v2.334.0 THE DOOR TIGHTENED: the body the service consumes IS the
// service's own input type (Parameters<typeof setLegalHold>[0]) — the
// door can no longer drift from the handler it feeds (the per-file
// generic tightening, the `any`-law's sanctioned follow-up).

export const dynamic = 'force-dynamic';

export const POST = hrGuard('hr.report.branch')(async (request: NextRequest, session) => {
  try {
    if (!canDecideErasure(session.role)) {
      return Response.json(
        {
          success: false,
          error: 'Only settings managers can set or release legal holds.',
          code: 'DECISION_FORBIDDEN',
        },
        { status: 403 },
      );
    }
    // THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0):
    const door = await readJsonBody<Parameters<typeof setLegalHold>[0]>(request);
    if (!door.ok) {
      return bodyDoorRejected();
    }
    const body = door.body;
    return Response.json({ success: true, data: await setLegalHold(body, session) }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
});
