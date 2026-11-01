// GET  /api/hr/performance/cycles - list review cycles (hr.performance.review)
// POST /api/hr/performance/cycles - create a cycle (hr.performance.manage)

import type { NextRequest } from 'next/server';
import { hrGuard } from '@/lib/hr/guard';
import { createCycle, listCycles } from '@/lib/hr/performance-service';
import { toErrorResponse } from '@/lib/hr/stage-g-shared';
// v2.334.0 THE DOOR TIGHTENED: the body the service consumes IS the
// service's own input type (Parameters<typeof createCycle>[0]) — the
// door can no longer drift from the handler it feeds (the per-file
// generic tightening, the `any`-law's sanctioned follow-up).
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

export const GET = hrGuard('hr.performance.review')(async (_request, session) => {
  try {
    return Response.json({ success: true, data: await listCycles(session) });
  } catch (error) {
    return toErrorResponse(error);
  }
});

export const POST = hrGuard('hr.performance.manage')(async (request: NextRequest, session) => {
  try {
    // THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0):
    const door = await readJsonBody<Parameters<typeof createCycle>[0]>(request);
    if (!door.ok) {
      return bodyDoorRejected();
    }
    const body = door.body;
    return Response.json({ success: true, data: await createCycle(body, session) }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
});
