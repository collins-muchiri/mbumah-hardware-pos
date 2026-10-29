// GET /api/employees/[id]/portal-link/candidates
//
// v2.267.0: the picker's own governed read. Before this wire the ONLY
// user-list source was GET /api/users — the staff directory, gated
// SUPER_ADMIN/STORE_OWNER by law — so a BRANCH_MANAGER or ACCOUNTANT opening
// the portal-link dialog (a tab MGMT_ROLES can all reach) got a silent empty
// list: the read was refused and the refusal was never spoken. The candidates
// wire is gated by the portal-link route's OWN privilege set — the same trio
// as POST/DELETE /api/employees/[id]/portal-link — and returns the employee's
// same-store ACTIVE users, each annotated with the employee their login is
// already bound to (the picker disables the row and says to whom, it never
// silently hides a name).
//
// Security: requireStoreAccess (DB session + tenant scoping) plus the same
// role gate as the parent link route. All reads and shaping live in the
// service (spec rule 15); this handler is a thin, honest voice over it.

import { type NextRequest } from 'next/server';
import { requireStoreAccess } from '@/lib/auth';
import { listPortalLinkCandidates, PortalLinkError } from '@/lib/hr/employee-service';
import { canManagePortalLinks } from '@/lib/hr/portal-account';
import { withErrorBoundary } from '@/lib/logger';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function candidatesHandler(
  _request: NextRequest,
  session: { userId: string; role: string; email: string },
  context: RouteContext
): Promise<Response> {
  const { id } = await context.params;
  if (!canManagePortalLinks(session.role)) {
    return Response.json(
      {
        success: false,
        error: 'Only store owners, HR managers and super admins can manage portal account links.',
      },
      { status: 403 },
    );
  }

  try {
    const result = await listPortalLinkCandidates(id);
    return Response.json({ success: true, data: result });
  } catch (e) {
    if (e instanceof PortalLinkError) {
      return Response.json({ success: false, error: e.message, code: e.code }, { status: e.status });
    }
    throw e;
  }
}

export const GET = withErrorBoundary(
  requireStoreAccess(candidatesHandler as (...args: unknown[]) => Promise<Response>),
  'EMPLOYEES_PORTAL_CANDIDATES'
);
