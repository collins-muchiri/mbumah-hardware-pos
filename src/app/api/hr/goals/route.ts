// GET  /api/hr/goals - list goals (hr.performance.review)  ?employeeId=&cycleId=&status=
// POST /api/hr/goals - create a goal (hr.performance.manage)

import type { NextRequest } from 'next/server';
import { hrGuard } from '@/lib/hr/guard';
import { createGoal, listGoals } from '@/lib/hr/goal-service';
import { toErrorResponse } from '@/lib/hr/stage-g-shared';
// v2.334.0 THE DOOR TIGHTENED: the body the service consumes IS the
// service's own input type (Parameters<typeof createGoal>[0]) — the
// door can no longer drift from the handler it feeds (the per-file
// generic tightening, the `any`-law's sanctioned follow-up).
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

export const GET = hrGuard('hr.performance.review')(async (request: NextRequest, session) => {
  try {
    const url = new URL(request.url);
    const data = await listGoals(session, {
      employeeId: url.searchParams.get('employeeId') ?? undefined,
      cycleId: url.searchParams.get('cycleId') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
    });
    return Response.json({ success: true, data });
  } catch (error) {
    return toErrorResponse(error);
  }
});

export const POST = hrGuard('hr.performance.manage')(async (request: NextRequest, session) => {
  try {
    // THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0):
    const door = await readJsonBody<Parameters<typeof createGoal>[0]>(request);
    if (!door.ok) {
      return bodyDoorRejected();
    }
    const body = door.body;
    return Response.json({ success: true, data: await createGoal(body, session) }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
});
