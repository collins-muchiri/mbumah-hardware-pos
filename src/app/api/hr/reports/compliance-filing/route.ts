// GET/POST /api/hr/reports/compliance-filing — the filing ledger (v2.276.0)
//
// The ledger's door on the Statutory desk. GET speaks the receipts for a
// month window (org-scoped — the statute does not vary by branch, the
// calendar's own law). POST records (or amends) ONE receipt and gets the
// audit row the write deserves (the consent-export law: a write that
// matters gets its own audited action; field names and month keys ride
// the metadata, never values).
//
// Fail-closed: a pre-migration database (the table not yet created) speaks
// FILING_LEDGER_UNAVAILABLE — the precise reason code, never a guessed
// blank, never a bare 500.

import { hrGuard } from '@/lib/hr/guard';
import { fetchStatutoryFilings, upsertStatutoryFiling, StatutoryFilingError } from '@/lib/hr/statutory-filing';
import { hrAudit, HrEntityType } from '@/lib/hr/audit';
import type { AuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const REPORT_ROLES = ['HR_MANAGER', 'STORE_OWNER', 'ACCOUNTANT', 'BRANCH_MANAGER'] as const;

export const GET = hrGuard('hr.report.branch', REPORT_ROLES)(
  async (req: Request, session: AuthSession) => {
    try {
      const url = new URL(req.url);
      const from = url.searchParams.get('from');
      const to = url.searchParams.get('to');
      const data = await fetchStatutoryFilings(session, { fromMonth: from, toMonth: to });
      return Response.json({ success: true, data });
    } catch {
      // the ledger's read fails closed — the card speaks the strip, never a spin forever
      return Response.json({ success: false, error: 'FILING_LEDGER_UNAVAILABLE' }, { status: 503 });
    }
  },
);

export const POST = hrGuard('hr.report.branch', REPORT_ROLES)(
  async (req: Request, session: AuthSession) => {
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return Response.json({ success: false, error: 'INVALID_BODY' }, { status: 400 });
    }
    try {
      const { amended, filing } = await upsertStatutoryFiling(session, {
        kind: String(body.kind ?? ''),
        periodMonth: String(body.periodMonth ?? ''),
        filedAt: String(body.filedAt ?? ''),
        reference: typeof body.reference === 'string' ? body.reference : null,
        note: typeof body.note === 'string' ? body.note : null,
      });
      // the write's audit row — field names and month keys only, never values
      await hrAudit({
        actorId: session.userId,
        actorRole: session.role,
        action: amended ? 'STATUTORY_FILING_AMENDED' : 'STATUTORY_FILING_RECORDED',
        resourceType: HrEntityType.STATUTORY_FILING,
        resourceId: `${filing.kind}:${filing.periodMonth}`,
        reason: amended ? 'Filing amended from the Statutory desk' : 'Filing recorded from the Statutory desk',
        metadata: { kind: filing.kind, periodMonth: filing.periodMonth, amended },
      }).catch(() => null); // fire-and-tolerate: an audit failure must never corrupt the receipt
      return Response.json({ success: true, data: { filing, amended } });
    } catch (error) {
      if (error instanceof StatutoryFilingError) {
        return Response.json({ success: false, error: error.code }, { status: 400 });
      }
      return Response.json({ success: false, error: 'FILING_LEDGER_UNAVAILABLE' }, { status: 503 });
    }
  },
);
