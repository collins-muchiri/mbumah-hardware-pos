// POST /api/leave/requests/[id]/reject - reject with reason

import { hrGuard } from '@/lib/hr/guard';
import { decideLeaveRequest } from '@/lib/hr/leave-service';
import { readOptionalJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

const ROLES = ['HR_MANAGER', 'BRANCH_MANAGER', 'STORE_OWNER'] as const;

export const POST = hrGuard('hr.leave.approve.branch', ROLES)(
  async (request, session, context?: { params: Promise<{ id: string }> }) => {
    const { id } = (await context?.params) ?? { id: '' };
    // THE OPTIONAL SWALLOW DOOR (v2.353.0): the rejection reason is
    // OPTIONAL (the service supplies the honest default), so an EMPTY body
    // is the legitimate call — but a PRESENT unreadable body is a client
    // mistake and answers the door's 400 instead of rejecting silently
    // with a default the sender never chose.
    const door = await readOptionalJsonBody<{ rejectionReason?: unknown }>(request);
    if (!door.ok) return bodyDoorRejected();
    const reason = typeof door.body.rejectionReason === 'string' ? door.body.rejectionReason : 'Rejected by approver.';
    try {
      const result = await decideLeaveRequest(id, session.storeId || '', session.userId, session.role, 'REJECTED', reason);
      return Response.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to reject.';
      return Response.json({ success: false, error: message }, { status: message.includes('not found') ? 404 : 500 });
    }
  },
);
