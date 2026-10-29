// v2.273.0 — the console hears the census.
//
//   - THE WIRE CARRIES THE CENSUS: hrSummaryForOrgConsole gains the five
//     census numbers derived from THREE counts by the pure
//     portalAdoptionCounts (the RUNTIME-pin law: the arithmetic gets pins,
//     bytes never catch a lie — the v2.261 lesson), riding the census's OWN
//     where-shape so the tile and the report it opens speak one truth.
//   - THE DRILL-DOWN GAINS THE COLUMN: the People & payroll by branch table
//     wears a Portal column (linked/in-scope · rate in the census's own
//     emerald) whose cell IS the door — /hr/reports?tab=portal&storeId=…
//     (the drill-down law every cell keeps). The comparator sorts the RATE
//     the cell wears; a branch with no employees in scope shows the dash
//     and sorts LAST in both directions (the payroll absence rule).
//   - THE CSV MIRRORS THE SCREEN: buildBranchesCsv grows an optional fifth
//     section (Portal adoption by branch) — the pct computed BY THE LIB,
//     the honest empty cell for a scope of nothing, and byte-silence when
//     the caller carries nothing (the optional-section evolution law).
//   - THE TILE WEARS THE COLOR: the console's People & payroll strip is six
//     tiles; the adoption tile speaks tone='good' — the census's emerald,
//     never a second meaning for the color.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { portalAdoptionCounts } from '@/lib/hr/reports';
import { defaultDirFor, nextSortState, sortHrDrillRows, type HrDrillSortRow } from '@/lib/org/hr-drilldown-sort';
import { BRANCHES_PORTAL_CSV_COLUMNS, buildBranchesCsv } from '@/lib/org/branches-csv';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const reports = read('src/lib/hr/reports.ts');
const sortLib = read('src/lib/org/hr-drilldown-sort.ts');
const csvLib = read('src/lib/org/branches-csv.ts');
const consoleSrc = read('src/components/workspace/org-console.tsx');

// ── the row factory — every field the comparator speaks, portal-varying ──
const row = (storeId: string, storeName: string, portalLinked: number, portalTotal: number): HrDrillSortRow => ({
  storeId,
  storeName,
  headcountActive: portalTotal,
  monthEmploymentCost: 0,
  monthAbsenceRatePct: 0,
  portalLinked,
  portalTotal,
  latestPayroll: null,
  expiryAlerts: { documentsExpiring90Days: 0, assetsOverdue: 0 },
});

describe('portalAdoptionCounts — the console census arithmetic (v2.273.0)', () => {
  it('derives the census five from three counts — the honest housekeeping', () => {
    // the seed's own shape: 5 in scope, 1 linked, 1 active
    expect(portalAdoptionCounts({ total: 5, linked: 1, active: 1 })).toEqual({
      total: 5,
      linked: 1,
      activeLogins: 1,
      deactivatedLogins: 0,
      unlinked: 4,
    });
    expect(portalAdoptionCounts({ total: 5, linked: 3, active: 2 })).toEqual({
      total: 5,
      linked: 3,
      activeLogins: 2,
      deactivatedLogins: 1,
      unlinked: 2,
    });
    // fully adopted, nothing closed
    expect(portalAdoptionCounts({ total: 2, linked: 2, active: 2 })).toEqual({
      total: 2,
      linked: 2,
      activeLogins: 2,
      deactivatedLogins: 0,
      unlinked: 0,
    });
  });

  it('clamps a corrupt payload — never a negative door, never a linked-over-total lie', () => {
    // linked cannot exceed the scope, active cannot exceed linked
    const corrupt = portalAdoptionCounts({ total: 3, linked: 9, active: 12 });
    expect(corrupt.total).toBe(3);
    expect(corrupt.linked).toBe(3);
    expect(corrupt.activeLogins).toBe(3);
    expect(corrupt.deactivatedLogins).toBe(0);
    expect(corrupt.unlinked).toBe(0);
    // negatives clamp to zero, fractions round to the census's integer voice
    const negative = portalAdoptionCounts({ total: -4, linked: -1, active: -9 });
    expect(negative).toEqual({ total: 0, linked: 0, activeLogins: 0, deactivatedLogins: 0, unlinked: 0 });
    const fractional = portalAdoptionCounts({ total: 5.4, linked: 2.6, active: 1.2 });
    expect(fractional.total).toBe(5);
    expect(fractional.linked).toBe(3);
    expect(fractional.activeLogins).toBe(1);
  });
});

describe('the drill-down Portal column comparator (v2.273.0)', () => {
  const rows = [
    row('a', 'Juja', 3, 5), // 60%
    row('b', 'Nakuru', 2, 2), // 100%
    row('c', 'Embu', 0, 4), // 0%
    row('d', 'Quiet', 0, 0), // the dash — no employees in scope
  ];

  it('a fresh click sorts the rate loudest-first, and the dash sorts last', () => {
    expect(defaultDirFor('portal')).toBe('desc');
    const desc = sortHrDrillRows(rows, { key: 'portal', dir: 'desc' });
    expect(desc.map((r) => r.storeId)).toEqual(['b', 'a', 'c', 'd']);
  });

  it('the mirror click is the honest reverse — and the dash still sorts last', () => {
    const asc = sortHrDrillRows(rows, { key: 'portal', dir: 'asc' });
    expect(asc.map((r) => r.storeId)).toEqual(['c', 'a', 'b', 'd']);
  });

  it('ties inside one rate break directionally by the linked count', () => {
    const halfA = row('h1', 'Half A', 2, 4); // 50%, deeper roll
    const halfB = row('h2', 'Half B', 3, 6); // 50%, same rate, bigger roster
    const tie = [halfA, halfB];
    expect(sortHrDrillRows(tie, { key: 'portal', dir: 'desc' }).map((r) => r.storeId)).toEqual(['h2', 'h1']);
    expect(sortHrDrillRows(tie, { key: 'portal', dir: 'asc' }).map((r) => r.storeId)).toEqual(['h1', 'h2']);
  });

  it('a fresh click on Portal starts desc (the numeric family) — via its OWN rule, not the pinned array', () => {
    // the v2.183/v2.190 pins name the plain-field family's exact members;
    // the portal semantics live in the comparator branch + the defaultDir rule
    expect(nextSortState(null, 'portal')).toEqual({ key: 'portal', dir: 'desc' });
  });
});

describe('the branches CSV portal section (v2.273.0)', () => {
  const at = new Date('2026-10-30T03:20:00.000Z');
  const stores = [
    { name: 'Juja', code: '', location: '', status: 'active', todayRevenue: 0, todayTransactions: 0, lowStockCount: 0, overdueRentals: 0, debtOutstanding: 0, pendingMpesa: 0 },
  ];
  const portal = [
    { storeName: 'Juja', linked: 3, total: 5 },
    { storeName: 'Nakuru', linked: 2, total: 2 },
    { storeName: 'Quiet', linked: 0, total: 0 },
  ];

  it('the section mirrors the screen — header, columns, lib-computed rate, the honest empty cell', () => {
    const csv = buildBranchesCsv(stores, at, null, null, null, portal);
    expect(csv).toContain('Portal adoption by branch');
    expect(csv).toContain(BRANCHES_PORTAL_CSV_COLUMNS.join(','));
    // the rate is computed BY THE LIB (round2 of ×100) — 3/5 → 60, 2/2 → 100
    expect(csv).toContain('Juja,3,5,60');
    expect(csv).toContain('Nakuru,2,2,100');
    // a scope of nothing prints the honest empty rate cell, never 0%
    expect(csv).toContain('Quiet,0,0,');
    expect(csv).not.toContain('Quiet,0,0,0');
    // the note keeps the file self-explanatory
    expect(csv).toContain('Note,Adoption is linked logins over employees in scope — the point-in-time census the HR reports workspace answers');
  });

  it('no portal rows → byte-silence: the file ends where v2.177 ended', () => {
    const without = buildBranchesCsv(stores, at, null, null, null);
    const undefinedSixth = buildBranchesCsv(stores, at, null, null, null, undefined);
    expect(undefinedSixth).toBe(without);
    expect(without).not.toContain('Portal adoption by branch');
  });
});

describe('the census rides the org wire (source of record)', () => {
  it('hrSummaryForOrgConsole fetches three counts in the census where-shape and derives the five', () => {
    // the census's OWN where-shape — the tile can never disagree with the report
    expect(reports).toContain('db.employee.count({ where: { deletedAt: null, user: { isNot: null }, ...scopeWhere(session, scope) } })');
    // isActive ALONE — existence implied for a to-one relation; the
    // isNot+field mix is invalid Prisma (the probe caught the throw)
    expect(reports).toContain('db.employee.count({ where: { deletedAt: null, user: { isActive: true }, ...scopeWhere(session, scope) } })');
    expect(reports).toContain('db.employee.count({ where: { deletedAt: null, ...scopeWhere(session, scope) } })');
    // the pure helper, not an inline formula
    expect(reports).toContain('portalAdoption: portalAdoptionCounts({ total: portalTotal, linked: portalLinked, active: portalActive })');
  });

  it('hrPerStoreForOrgConsole groups the census denominators per store — the census definition, not the ACTIVE headcount', () => {
    expect(reports).toContain('db.employee.groupBy({\n      by: [\'storeId\'],\n      where: { deletedAt: null, user: { isNot: null }, store: { organizationId: session.organizationId } },');
    expect(reports).toContain('db.employee.groupBy({\n      by: [\'storeId\'],\n      where: { deletedAt: null, store: { organizationId: session.organizationId } },');
    expect(reports).toContain('portalLinked: portalLinkedMap.get(store.id) ?? 0');
    expect(reports).toContain('portalTotal: portalTotalMap.get(store.id) ?? 0');
  });

  it('the comparator sorts the rate the cell wears — the dash rule is the payroll absence rule carried over', () => {
    expect(sortLib).toContain("if (key === 'portal') return 'desc';");
    expect(sortLib).toContain('const missingA = a.portalTotal === 0;');
    expect(sortLib).toContain('if (missingA) return 1;');
    expect(sortLib).toContain('const ra = a.portalLinked / a.portalTotal;');
    // the pinned plain-field family keeps its exact members
    expect(sortLib).toContain("export const HR_DRILL_NUMERIC_COLUMNS = ['headcount', 'cost', 'absence', 'alerts'] as const;");
  });
});

describe('the console wears the census (source of record)', () => {
  it('the wire type carries the census five and the per-branch pair', () => {
    expect(consoleSrc).toContain('portalAdoption: { total: number; linked: number; activeLogins: number; deactivatedLogins: number; unlinked: number };');
    expect(consoleSrc).toContain('portalLinked: number;\n        portalTotal: number;');
  });

  it('the adoption tile speaks the census — emerald face, honest composition, report-distance door', () => {
    expect(consoleSrc).toContain('label="Portal adoption"');
    expect(consoleSrc).toContain('href="/hr/reports?tab=portal"');
    expect(consoleSrc).toContain('title="Open the portal adoption census"');
    expect(consoleSrc).toContain("tone={summary.hr.portalAdoption.total > 0 ? 'good' : undefined}");
    // the value is the rate; the footer is the composition
    expect(consoleSrc).toContain('summary.hr.portalAdoption.linked} of {summary.hr.portalAdoption.total} linked');
    // the strip is six tiles now
    expect(consoleSrc).toContain('xl:grid-cols-6');
  });

  it("the 'good' tone is the census's emerald — the same pair the report tab speaks", () => {
    expect(consoleSrc).toContain("tone === 'good'\n                ? 'text-emerald-700 dark:text-emerald-400'");
    // warn stays amber; a color never means two things
    expect(consoleSrc).toContain("tone === 'warn'\n              ? 'text-amber-700 dark:text-amber-400'");
  });

  it('the drill-down column spec carries Portal with an honest hint', () => {
    expect(consoleSrc).toContain("key: 'portal',\n    label: 'Portal',");
    expect(consoleSrc).toContain("'Sorts by adoption rate — linked logins over employees in scope. Click again for the mirror. Branches with no employees in scope sort last.'");
    // the header's enumeration stays honest about the column set
    expect(consoleSrc).toContain('expiry alerts, portal adoption per branch');
  });

  it('the cell IS the door — the census narrowed to the branch, the dash for nothing', () => {
    expect(consoleSrc).toContain('data-testid="org-console-hr-portal-door"');
    expect(consoleSrc).toContain('href={`/hr/reports?tab=portal&storeId=${row.storeId}`}');
    expect(consoleSrc).toContain('font-semibold text-emerald-700 dark:text-emerald-400');
    expect(consoleSrc).toContain('title="No employees in scope for this branch"');
    // aria speaks the composition aloud, AT gets what the eye gets
    expect(consoleSrc).toContain('aria-label={`${row.portalLinked} of ${row.portalTotal} employees hold a linked portal login at ${row.storeName}');
  });

  it('the CSV mirrors the screen — the fifth section rides the SAME sorted rows, and the note counts it', () => {
    expect(consoleSrc).toContain('hrRows.map((r) => ({ storeName: r.storeName, linked: r.portalLinked, total: r.portalTotal }))');
    // the sections counter grew with the file
    expect(consoleSrc).toMatch(/const sections =\s*\n\s*1 \+\s*\n\s*\(summary\.hrPerStore && summary\.hrPerStore\.length > 0 \? 1 : 0\) \+\s*\n\s*\(desk \? 1 : 0\) \+\s*\n\s*\(trendRows\.length > 0 \? 1 : 0\) \+\s*\n\s*\(summary\.hrPerStore && summary\.hrPerStore\.length > 0 \? 1 : 0\);/);
  });

  it('the CSV lib names the fifth section and computes the rate itself', () => {
    expect(csvLib).toContain("'Linked logins',\n  'Employees in scope',\n  'Adoption (%)',");
    expect(csvLib).toContain('p.total > 0 ? Math.round((p.linked / p.total) * 10000) / 100 : \'\',');
    expect(csvLib).toContain('portal?: readonly BranchPortalCsvRow[] | null');
  });
});
