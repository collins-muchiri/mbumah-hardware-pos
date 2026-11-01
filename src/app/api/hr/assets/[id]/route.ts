// PATCH /api/hr/assets/[id] - RETURN (condition required) or LOST/DAMAGED
//         (requires a named recovery authorizer distinct from the actor).

import type { NextRequest } from 'next/server';
import { hrGuard, type HrRouteContext } from '@/lib/hr/guard';
// v2.334.0 THE DOOR TIGHTENED: the body the service consumes IS the
// service's own exported AssetUpdateInput — the door can no longer
// drift from the handler it feeds (the per-file generic tightening).
import { updateAsset, type AssetUpdateInput } from '@/lib/hr/asset-service';
import { toErrorResponse } from '@/lib/hr/stage-g-shared';
import { readJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

export const PATCH = hrGuard('hr.asset.manage')(
  async (request: NextRequest, session, context?: HrRouteContext) => {
    try {
      const { id } = await context!.params;
      // THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0):
      const door = await readJsonBody<AssetUpdateInput>(request);
      if (!door.ok) {
        return bodyDoorRejected();
      }
      const body = door.body;
      return Response.json({ success: true, data: await updateAsset(id, body, session) });
    } catch (error) {
      return toErrorResponse(error);
    }
  },
);
