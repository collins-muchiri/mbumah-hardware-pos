// v2.271.0 — the report hears the bell.
//
//   - THE BELL AT REPORT DISTANCE: the roster answers WHICH hires hold
//     portal access (v2.268.0), the lens can ASK for them (v2.270.0) — but
//     the reports desk had no census. This round /hr/reports gains the
//     Portal tab: a point-in-time adoption roll call over the governed
//     scope — linked / active / deactivated / not-linked, the per-branch
//     meter, and the per-employee roll call.
//   - THE EMAIL NEVER RIDES: the service's select refuses the User.email —
//     role + active state only, the same shaped bits the roster wire
//     carries (the roster's own PII law, spoken at report distance).
//   - THE CHIP VOCABULARY, BYTE-KEPT: the roll call's state chips are the
//     roster's PORTAL_CHIP classes verbatim — emerald open / amber closed —
//     and the unlinked row renders the honest dash, never a look-alike.
//   - THE DRILL-DOWN KEEPS ITS LAW: the census reloads when the branch
//     chip narrows the reports surface (the storeId law every report
//     table keeps).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const service = read('src/lib/hr/reports.ts');
const route = read('src/app/api/hr/reports/portal-adoption/route.ts');
const page = read('src/app/(shell)/hr/reports/page.tsx');
const roster = read('src/app/(shell)/hr/employees/page.tsx');

describe('the portal adoption report (v2.271.0)', () => {
  it('the route rides the governed report guard — same roles, same 403 law, same drill-down', () => {
    expect(route).toContain("hrGuard('hr.report.branch', REPORT_ROLES)");
    expect(route).toContain("['HR_MANAGER', 'STORE_OWNER', 'ACCOUNTANT', 'BRANCH_MANAGER'] as const");
    expect(route).toContain('validateReportStore(session, scope, url.searchParams.get(\'storeId\'))');
    expect(route).toContain("code: 'PERMISSION_DENIED'");
    expect(route).toContain('portalAdoptionReport(session, { storeId: store?.id ?? null })');
  });

  it('the service is a census — no period, governed scope, the email refused at the select', () => {
    expect(service).toContain('export async function portalAdoptionReport(');
    expect(service).toContain('v2.271.0: the portal adoption report');
    // the select itself refuses the email — the shaper cannot leak what the query never fetched
    expect(service).toContain('user: { select: { role: true, isActive: true } },');
    expect(service).not.toContain('email: true');
    // the shaped bits match the roster wire's vocabulary
    expect(service).toContain('portalLinked: e.user != null,');
    expect(service).toContain('portalActive: e.user ? e.user.isActive : null,');
    // no parsePeriod in the census (it is a point-in-time roll call)
    const fn = service.slice(service.indexOf('export async function portalAdoptionReport('), service.indexOf('export type PortalAdoptionDto'));
    expect(fn).not.toContain('parsePeriod');
  });

  it('the report tab exists — key, trigger with the bell, deep-linkable like its siblings', () => {
    expect(page).toContain("'schedules', 'portal', 'privacy'] as const;");
    expect(page).toContain('<TabsTrigger value="portal" className="gap-1.5">');
    expect(page).toContain('<BellRing className="h-3.5 w-3.5 text-emerald-500" aria-hidden /> Portal');
    // the digest CSV note names the portal as deliberately absent
    expect(page).toContain('p10 / schedules / portal / privacy');
    // the census loader rides the branch drill-down law
    expect(page).toContain('const loadPortal = useCallback(async () => {');
    expect(page).toContain('}, [storeId]);');
    expect(page).toContain('/api/hr/reports/portal-adoption${qs}');
  });

  it('the tab speaks its failures and its freshness like every other report', () => {
    expect(page).toContain('testId="hr-reports-portal-error"');
    expect(page).toContain('The portal roll call could not be loaded — the numbers stay dark rather than guess.');
    expect(page).toContain('onRetry={() => void loadPortal()}');
    expect(page).toContain('testId="hr-reports-updated-portal"');
  });

  it('the roll call wears the roster\u2019s chip vocabulary — byte-kept, honest dash intact', () => {
    // emerald open face — the exact roster bytes
    expect(page).toContain(
      "'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'",
    );
    // amber closed face — the exact roster bytes
    expect(page).toContain(
      "'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'",
    );
    // the roster itself still wears the same faces (one vocabulary, two desks)
    expect(roster).toContain(
      "'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'",
    );
    expect(roster).toContain(
      "'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'",
    );
    // the honest dash — an unlinked row never renders a look-alike chip
    expect(page).toContain('data-testid="hr-reports-portal-silent"');
    expect(page).toContain('No linked login — the self-service portal stays behind the HR desk.');
    expect(page).toContain('data-testid="hr-reports-portal-state"');
    expect(page).toContain('data-testid="hr-reports-portal-row"');
  });

  it('the by-branch meter answers at a glance — a rate, not just counts', () => {
    expect(page).toContain('data-testid="hr-reports-portal-store-row"');
    expect(page).toContain('bg-gradient-to-r from-emerald-500 to-emerald-400');
    expect(page).toContain('aria-label={`${b.storeName}: ${b.linked} of ${b.total} employees hold a linked portal login (${pct}%)`}');
  });
});
