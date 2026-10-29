// v2.272.0 — the census carries its copy.
//
//   - THE NAME-BEARING FILE GETS ITS OWN DOOR: the digest export route
//     refuses the census on purpose (a digest is aggregate-only by
//     construction; the roll call is name-bearing). The census therefore
//     gains /api/hr/reports/portal-adoption/export — the same governed
//     guard, the same scope law, its own audit action.
//   - THE AUDIT CARRIES COUNTS, NEVER NAMES: PORTAL_ADOPTION_EXPORTED →
//     DataExport with rows/scope/size metadata only — the roll call's
//     names never ride the audit trail.
//   - THE FILE IS THE GOVERNED HOUSE FORMAT: header block, Summary, the
//     roll call table, the OWASP formula-injection guard (csvCell), CRLF,
//     honest point-in-time filename — and NO email column, because the
//     builder shapes only what the ALREADY-governed DTO carries.
//   - THE PAGE WEARS THE DOOR: an emerald "Roll call CSV" button in the
//     roll call header (the linked-login color — a color never means two
//     things), busy words while it builds, and its own role="status" note.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { portalAdoptionToCsv, portalStateWord } from '@/lib/hr/portal-adoption-csv';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const builder = read('src/lib/hr/portal-adoption-csv.ts');
const route = read('src/app/api/hr/reports/portal-adoption/export/route.ts');
const page = read('src/app/(shell)/hr/reports/page.tsx');
const digestRoute = read('src/app/api/hr/reports/export/route.ts');

const censusInput = {
  total: 2,
  linked: 1,
  activeLogins: 1,
  deactivatedLogins: 0,
  unlinked: 1,
  organizationName: 'MBUMAH Hardware',
  scopeLabel: 'All branches',
  rows: [
    {
      id: 'emp_1',
      name: 'Grace Achieng',
      employeeCode: 'EMP-002',
      jobTitle: 'Accounts Assistant',
      status: 'ACTIVE',
      storeName: 'MBUMAH HARDWARE - Juja Main',
      portalLinked: false,
      portalRole: null,
      portalActive: null,
    },
    {
      id: 'emp_2',
      name: 'John Mwangi',
      employeeCode: 'EMP-001',
      jobTitle: 'Branch Manager',
      status: 'ACTIVE',
      storeName: 'MBUMAH HARDWARE - Juja Main',
      portalLinked: true,
      portalRole: 'BRANCH_MANAGER',
      portalActive: true,
    },
  ],
};

describe('the portal adoption census CSV (v2.272.0)', () => {
  it('the builder is pure and shapes only what the governed DTO carries — no email column, ever', () => {
    expect(builder).toContain("import { csvCell } from '@/lib/hr/digest-csv';");
    expect(builder).toContain("import type { PortalAdoptionDto } from '@/lib/hr/reports';");
    // the file cannot leak what the census never fetched: no email FIELD
    expect(builder).not.toContain('.email');
    expect(builder).not.toContain("'Email'");
    // the columns are exactly the shaped bits the roster wire carries
    expect(builder).toContain("csvRow(['Employee', 'Employee code', 'Job title', 'Branch', 'Login role', 'Portal state'])");
  });

  it('the file speaks the house format — header block, Summary, the roll call, CRLF, honest filename', () => {
    const csv = portalAdoptionToCsv(censusInput, new Date('2026-10-30T02:36:00.000Z'));
    if (!csv) throw new Error('the census refuses to file');
    const text = csv.content;
    // header block, point-in-time edition
    expect(text).toContain('Report,Portal adoption census');
    expect(text).toContain('Organization,MBUMAH Hardware');
    expect(text).toContain('Scope,All branches');
    expect(text).toContain('Period,Point in time (2026-10-30)');
    expect(text).toContain('Generated (UTC),2026-10-30T02:36:00.000Z');
    // the census numbers ride the Summary block
    expect(text).toContain('Employees in scope,2');
    expect(text).toContain('Linked logins,1');
    expect(text).toContain('Not linked,1');
    // the roll call: role words the page speaks, state words the chips speak
    expect(text).toContain('John Mwangi,EMP-001,Branch Manager,MBUMAH HARDWARE - Juja Main,branch manager,portal');
    expect(text).toContain('Grace Achieng,EMP-002,Accounts Assistant,MBUMAH HARDWARE - Juja Main,,not linked');
    // RFC-4180: CRLF records, trailing CRLF (no lone \n — every \n is \r\n)
    expect(text.endsWith('\r\n')).toBe(true);
    expect(text.replace(/\r\n/g, '')).not.toContain('\n');
    // honest point-in-time filename
    expect(csv.filename).toBe('mbumah-portal-adoption-census-2026-10-30.csv');
    expect(csv.byteSize).toBe(Buffer.byteLength(text, 'utf8'));
  });

  it('the state words are the chip vocabulary spoken plain — and the guard rides every cell', () => {
    expect(portalStateWord({ portalLinked: false, portalActive: null })).toBe('not linked');
    expect(portalStateWord({ portalLinked: true, portalActive: true })).toBe('portal');
    expect(portalStateWord({ portalLinked: true, portalActive: false })).toBe('portal off');
    // the OWASP guard is csvCell itself, not a look-alike
    expect(builder).toContain('cells.map(csvCell).join');
    const guarded = portalAdoptionToCsv(
      {
        ...censusInput,
        rows: [{ ...censusInput.rows[0], name: '=SUM(A1:A2)' }, ...censusInput.rows.slice(1)],
      },
      new Date('2026-10-30T02:36:00.000Z'),
    );
    if (!guarded) throw new Error('the guard case refuses to file');
    expect(guarded.content).toContain("'=SUM(A1:A2)");
  });

  it('an empty census refuses to file — the honest 404 law the digest export keeps', () => {
    expect(portalAdoptionToCsv({ ...censusInput, rows: [] })).toBeNull();
  });

  it('the export route rides the governed guard with its own audited action — counts, never names', () => {
    expect(route).toContain("hrGuard('hr.report.branch', REPORT_ROLES)");
    expect(route).toContain('resolveReportScope(session)');
    expect(route).toContain('validateReportStore(session, scope, url.searchParams.get(\'storeId\'))');
    expect(route).toContain('portalAdoptionReport(session, { storeId: store?.id ?? null })');
    // the file is built from the ALREADY-governed census DTO
    expect(route).toContain('portalAdoptionToCsv(');
    // the audit: its own action, count-only metadata
    expect(route).toContain("action: 'PORTAL_ADOPTION_EXPORTED'");
    expect(route).toContain('resourceType: HrEntityType.DATA_EXPORT');
    expect(route).toContain('rows: data.rows.length');
    expect(route).toContain('channel: \'ad_hoc_download\'');
    expect(route).toContain('COUNT-ONLY metadata');
    // no employee name can ride the metadata
    expect(route).not.toContain('data.rows.map');
    // empty census → honest 404
    expect(route).toContain("code: 'NO_REPORT_DATA'");
  });

  it('the digest export route still refuses the census — two doors, never one shared lie', () => {
    // the census is NOT in the schedule reports list the digest export serves
    expect(digestRoute).toContain('HR_SCHEDULE_REPORTS.includes');
    expect(digestRoute).not.toContain('portal');
  });

  it('the page wears the door — emerald button, busy words, its own status note', () => {
    expect(page).toContain('data-testid="hr-reports-portal-export"');
    expect(page).toContain("onClick={() => void exportPortalCsv()}");
    expect(page).toContain('disabled={portalCsvBusy}');
    // the census's color, not the digest's violet
    expect(page).toContain('border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:ring-emerald-400');
    expect(page).toContain("{portalCsvBusy ? 'Building…' : 'Roll call CSV'}");
    // the handler rides the census's OWN endpoint, scope-aware like the loader
    expect(page).toContain('fetch(`/api/hr/reports/portal-adoption/export${qs}`');
    expect(page).toContain("match?.[1] ?? res.headers.get('X-Census-Csv-Filename') ?? 'mbumah-portal-adoption-census.csv'");
    // the note speaks the audit law
    expect(page).toContain('data-testid="hr-reports-portal-export-note"');
    expect(page).toContain('The export is audit logged; the file carries no emails — the same shaped bits the table shows.');
    // quiet in print, like every export control
    expect(page).toContain('dark:hover:text-emerald-200 print:hidden');
  });
});
