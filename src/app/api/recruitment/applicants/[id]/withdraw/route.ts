// POST /api/recruitment/applicants/[id]/withdraw - record the candidate's own exit (v2.127.0)
//
// The desk could reject a candidate (the company's decision, reason required)
// but had no way to record the candidate's own exit — a person who withdraws
// stayed movable forever while the schema already declared WITHDRAWN terminal.
// This route closes that gap with the same write gate as its siblings.
// Withdrawal is the candidate's act: the note is OPTIONAL (an empty body is a
// valid withdrawal) and rides the audit log only; the data retention clock is
// the same 90-day window a rejection starts.

import { hrGuard } from '@/lib/hr/guard';
import { withdrawApplicant } from '@/lib/hr/recruitment-service';
import { RECRUITMENT_WRITE_ROLES } from '@/lib/hr/recruitment-policy';
import { readOptionalJsonBody, bodyDoorRejected } from '@/lib/request-body';

export const dynamic = 'force-dynamic';

export const POST = hrGuard('hr.recruitment.manage', RECRUITMENT_WRITE_ROLES)(
  async (request, session, context?: { params: Promise<{ id: string }> }) => {
    const { id } = (await context?.params) ?? { id: '' };

    // THE OPTIONAL SWALLOW DOOR (v2.353.0): the note is optional — an empty
    // body is a valid withdrawal, so the optional door passes {}. But a
    // PRESENT unreadable body is a client mistake and answers the door's
    // 400 (the old catch withdrew the candidate in silence).
    const door = await readOptionalJsonBody<{ note?: unknown }>(request);
    if (!door.ok) return bodyDoorRejected();

    const note = typeof door.body.note === 'string' ? door.body.note.trim().slice(0, 500) : '';

    try {
      const result = await withdrawApplicant(id, session.userId, session.role, note || undefined);
      return Response.json({
        success: true,
        data: { retentionUntil: result.retentionUntil.toISOString() },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to record withdrawal.';
      const status = message.includes('not found')
        ? 404
        : message.includes('cannot be withdrawn') || message.includes('already left')
          ? 409
          : 500;
      return Response.json({ success: false, error: message }, { status });
    }
  },
);
