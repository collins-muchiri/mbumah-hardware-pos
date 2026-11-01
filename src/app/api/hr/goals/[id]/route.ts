// PATCH /api/hr/goals/[id] - edit title/target/dueDate/status, or currentValue
//         for MANUAL/CUSTOM goals (POS-sourced values reject typed writes).
// DELETE /api/hr/goals/[id] - soft-delete (v2.92.0): the row stays, every
//         read filters deletedAt, so the goal leaves all lists honestly.

import type { NextRequest } from 'next/server';
import { hrGuard, type HrRouteContext } from '@/lib/hr/guard';
import { deleteGoal, updateGoal, type GoalUpdateInput } from '@/lib/hr/goal-service';
import { toErrorResponse } from '@/lib/hr/stage-g-shared';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

export const PATCH = hrGuard('hr.performance.manage')(
  async (request: NextRequest, session, context?: HrRouteContext) => {
    try {
      // [id] routes always receive params — an `as` keeps the type narrow
      // without the non-null-assertion lint warning.
      const { id } = await (context as HrRouteContext).params;
      // THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0):
      const door = await readJsonBody<GoalUpdateInput>(request);
      if (!door.ok) {
        return bodyDoorRejected();
      }
      const body = door.body;
      return Response.json({ success: true, data: await updateGoal(id, body, session) });
    } catch (error) {
      return toErrorResponse(error);
    }
  },
);
export const DELETE = hrGuard('hr.performance.manage')(
  async (_request: NextRequest, session, context?: HrRouteContext) => {
    try {
      const { id } = await (context as HrRouteContext).params;
      return Response.json({ success: true, data: await deleteGoal(id, session) });
    } catch (error) {
      return toErrorResponse(error);
    }
  },
);
