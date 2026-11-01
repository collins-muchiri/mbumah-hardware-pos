// GET   /api/hr/discipline/[id] - case detail incl. description for allowed roles
//         (RESTRICTED grievances require HR_MANAGER / STORE_OWNER / SUPER_ADMIN).
// PATCH /api/hr/discipline/[id] - RESOLVE | DISMISS (resolution notes required).

import type { NextRequest } from 'next/server';
import { hrGuard, type HrRouteContext } from '@/lib/hr/guard';
import { getCaseDetail, updateCase } from '@/lib/hr/discipline-service';
import { toErrorResponse } from '@/lib/hr/stage-g-shared';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

export const GET = hrGuard('hr.discipline.manage')(
  async (_request, session, context?: HrRouteContext) => {
    try {
      const { id } = await context!.params;
      return Response.json({ success: true, data: await getCaseDetail(id, session) });
    } catch (error) {
      return toErrorResponse(error);
    }
  },
);

export const PATCH = hrGuard('hr.discipline.manage')(
  async (request: NextRequest, session, context?: HrRouteContext) => {
    try {
      const { id } = await context!.params;
      // THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0):
      const door = await readJsonBody<Record<string, unknown>>(request);
      if (!door.ok) {
        return bodyDoorRejected();
      }
      const body = door.body as Record<string, unknown>;
      return Response.json({ success: true, data: await updateCase(id, body, session) });
    } catch (error) {
      return toErrorResponse(error);
    }
  },
);
