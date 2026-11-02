// POST /api/leave/requests/[id]/approve - approve with optional delegation

import { hrGuard } from '@/lib/hr/guard';
import { decideLeaveRequest } from '@/lib/hr/leave-service';
import { readOptionalJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

const ROLES = ['HR_MANAGER', 'BRANCH_MANAGER', 'STORE_OWNER'] as const;

export const POST = hrGuard('hr.leave.approve.branch', ROLES)(
  async (request, session, context?: { params: Promise<{ id: string }> }) => {
    const { id } = (await context?.params) ?? { id: '' };
    // THE OPTIONAL SWALLOW DOOR (v2.353.0): approval carries no required
    // field — the optional delegation id rides an optional key and an EMPTY
    // body is the legitimate call, so the optional door passes {}. But a
    // PRESENT unreadable body is a client mistake and answers the door's
    // 400 — the old catch turned it into silence and approved anyway (the
    // silent-proceed class the swallow census named).
    const door = await readOptionalJsonBody<{ delegateApproverUserId?: unknown }>(request);
    if (!door.ok) return bodyDoorRejected();
    try {
      const result = await decideLeaveRequest(
        id,
        session.storeId || '',
        session.userId,
        session.role,
        'APPROVED',
        undefined,
        typeof door.body.delegateApproverUserId === 'string' ? door.body.delegateApproverUserId : undefined,
      );
      return Response.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to approve.';
      return Response.json({ success: false, error: message }, { status: message.includes('not found') ? 404 : 500 });
    }
  },
);
