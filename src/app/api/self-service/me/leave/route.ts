// GET  /api/self-service/me/leave - own balances + requests
// POST /api/self-service/me/leave - submit a leave request (employeeId forced
//      to the session-linked employee; client-supplied ids are ignored).

import type { NextRequest } from 'next/server';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';
// v2.334.0 THE DOOR TIGHTENED: the body the service consumes IS the
// service's own input type (Parameters<typeof requestMyLeave>[2]) — the
// door can no longer drift from the handler it feeds (the per-file
// generic tightening, the `any`-law's sanctioned follow-up).
import {
  selfServiceGuard,
  listMyLeave,
  requestMyLeave,
  selfServiceErrorResponse,
} from '@/lib/hr/self-service';

export const dynamic = 'force-dynamic';

export const GET = selfServiceGuard('hr.leave.read.own')(async (_request, _session, employee) => {
  try {
    return Response.json({ success: true, data: await listMyLeave(employee) });
  } catch (error) {
    return selfServiceErrorResponse(error);
  }
});

export const POST = selfServiceGuard('hr.leave.request')(async (request: NextRequest, session, employee) => {
  try {
    // THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0):
    const door = await readJsonBody<Parameters<typeof requestMyLeave>[2]>(request);
    if (!door.ok) {
      return bodyDoorRejected();
    }
    const body = door.body;
    return Response.json({ success: true, data: await requestMyLeave(employee, session, body) }, { status: 201 });
  } catch (error) {
    return selfServiceErrorResponse(error);
  }
});
