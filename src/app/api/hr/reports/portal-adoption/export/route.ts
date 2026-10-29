// GET /api/hr/reports/portal-adoption/export[?storeId=]
//
// v2.272.0: the census carries its copy — the roll call's own audited CSV
// door. The digest export route (/api/hr/reports/export) refuses the census
// ON PURPOSE (a digest is aggregate-only by construction; the roll call is
// name-bearing), so a name-bearing file gets its OWN door instead of
// riding an aggregate-only one:
//
// Contract:
//   • Same guard + roles as the interactive census route (hr.report.branch).
//   • Same scope law: org roles may drill down to one validated branch;
//     branch roles are pinned to theirs (validateReportStore).
//   • The CSV is built from the ALREADY-governed census DTO
//     (portalAdoptionReport — the select that refuses the email): the file
//     can never carry a field the page itself cannot.
//   • Empty census → honest 404 NO_REPORT_DATA (a CSV that "looks empty"
//     would read as a broken export).
//   • Exports are audit logged (PORTAL_ADOPTION_EXPORTED → DataExport)
//     with COUNT-ONLY metadata — the roll call's names never enter the
//     audit trail (the PII law: field names and counts, never values).

import { hrGuard } from '@/lib/hr/guard';
import { portalAdoptionReport, resolveReportScope, validateReportStore } from '@/lib/hr/reports';
import { digestOrgAndScope } from '@/lib/hr/report-schedule-service';
import { portalAdoptionToCsv } from '@/lib/hr/portal-adoption-csv';
import { hrAudit, HrEntityType } from '@/lib/hr/audit';
import { toErrorResponse } from '@/lib/hr/stage-g-shared';

export const dynamic = 'force-dynamic';

const REPORT_ROLES = ['HR_MANAGER', 'STORE_OWNER', 'ACCOUNTANT', 'BRANCH_MANAGER'] as const;

export const GET = hrGuard('hr.report.branch', REPORT_ROLES)(async (request, session) => {
  try {
    const url = new URL(request.url);
    const scope = resolveReportScope(session);
    if (!scope) {
      return Response.json(
        { success: false, error: 'You do not have permission to export reports.', code: 'PERMISSION_DENIED' },
        { status: 403 },
      );
    }
    const store = await validateReportStore(session, scope, url.searchParams.get('storeId'));

    const data = await portalAdoptionReport(session, { storeId: store?.id ?? null });
    if (!data) {
      return Response.json(
        { success: false, error: 'You do not have permission to view reports.', code: 'PERMISSION_DENIED' },
        { status: 403 },
      );
    }

    const now = new Date();
    const { organizationName, scopeLabel } = await digestOrgAndScope(
      session.organizationId,
      store?.id ?? null,
    );
    const csv = portalAdoptionToCsv(
      {
        total: data.total,
        linked: data.linked,
        activeLogins: data.activeLogins,
        deactivatedLogins: data.deactivatedLogins,
        unlinked: data.unlinked,
        rows: data.rows,
        organizationName,
        scopeLabel,
      },
      now,
    );
    if (!csv) {
      return Response.json(
        { success: false, error: 'No report data for this period.', code: 'NO_REPORT_DATA' },
        { status: 404 },
      );
    }

    // COUNT-ONLY metadata: the roll call's names never ride the audit trail.
    await hrAudit({
      actorId: session.userId,
      actorRole: session.role,
      action: 'PORTAL_ADOPTION_EXPORTED',
      resourceType: HrEntityType.DATA_EXPORT,
      resourceId: csv.filename,
      storeId: store?.id ?? session.storeId ?? undefined,
      metadata: {
        rows: data.rows.length,
        scope: scopeLabel,
        format: 'csv',
        byteSize: csv.byteSize,
        channel: 'ad_hoc_download',
      },
    }).catch(() => undefined);

    return new Response(Buffer.from(csv.content, 'utf8'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${csv.filename}"`,
        'Content-Length': String(csv.byteSize),
        'X-Census-Csv-Filename': csv.filename,
        'X-Census-Csv-Size': String(csv.byteSize),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
});
