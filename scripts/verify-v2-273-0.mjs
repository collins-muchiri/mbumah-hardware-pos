#!/usr/bin/env node
// verify-v2-273-0.mjs — the round's gate (v2.273.0 "the console hears the census").
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD LAW.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const pkg = JSON.parse(read('package.json'));
const version = read('VERSION').trim();
const reports = read('src/lib/hr/reports.ts');
const sortLib = read('src/lib/org/hr-drilldown-sort.ts');
const csvLib = read('src/lib/org/branches-csv.ts');
const consoleSrc = read('src/components/workspace/org-console.tsx');
const page = read('src/app/(shell)/hr/reports/page.tsx');
const builder = read('src/lib/hr/portal-adoption-csv.ts');
const exportRoute = read('src/app/api/hr/reports/portal-adoption/export/route.ts');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('pkg version = 2.273.0', pkg.version === '2.273.0');
ok('pkg releaseVersion = 2.273.0', pkg.mbumah?.releaseVersion === '2.273.0');
ok('pkg baseVersion = 2.273.0', pkg.mbumah?.baseVersion === '2.273.0');
ok('VERSION = 2.273.0', version === '2.273.0');
ok('whats-new lead = 2.273.0 with the round\u2019s title', feed.includes("version: '2.273.0',") && feed.includes('The console hears the census'));
const leadIdx = feed.indexOf("version: '2.273.0',");
const pairIdx = feed.indexOf("version: '2.272.0',");
ok('whats-new pair order (lead 2.273.0 before pair 2.272.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.273.0]', changelog.includes('## [2.273.0] The console hears the census'));

console.log('— the census on the org wire —');
ok('the pure helper stands (ladder clamp, export, section 7 home)', reports.includes('export function portalAdoptionCounts(input: { total: number; linked: number; active: number })') && reports.includes('const linked = Math.min(Math.max(0, Math.round(input.linked)), total);') && reports.includes('const activeLogins = Math.min(Math.max(0, Math.round(input.active)), linked);'));
ok('the three counts ride the census\u2019s OWN where-shape', reports.includes('db.employee.count({ where: { deletedAt: null, user: { isNot: null }, ...scopeWhere(session, scope) } })') && reports.includes('db.employee.count({ where: { deletedAt: null, user: { isActive: true }, ...scopeWhere(session, scope) } })') && reports.includes('db.employee.count({ where: { deletedAt: null, ...scopeWhere(session, scope) } })'));
ok('the summary derives the five through the helper (never an inline formula)', reports.includes('portalAdoption: portalAdoptionCounts({ total: portalTotal, linked: portalLinked, active: portalActive })'));
ok('the per-store groupBys speak the census definition (deletedAt null, user isNot null)', reports.includes("db.employee.groupBy({\n      by: ['storeId'],\n      where: { deletedAt: null, user: { isNot: null }, store: { organizationId: session.organizationId } },") && reports.includes("db.employee.groupBy({\n      by: ['storeId'],\n      where: { deletedAt: null, store: { organizationId: session.organizationId } },"));
ok('the per-store rows carry the pair from the maps', reports.includes('portalLinked: portalLinkedMap.get(store.id) ?? 0') && reports.includes('portalTotal: portalTotalMap.get(store.id) ?? 0'));

console.log('— the drill-down sorts the rate —');
ok('the comparator has its own portal branch (rate, missing-last, directional tiebreak)', sortLib.includes("if (key === 'portal') {") && sortLib.includes('const missingA = a.portalTotal === 0;') && sortLib.includes('if (missingA) return 1;') && sortLib.includes('const ra = a.portalLinked / a.portalTotal;') && sortLib.includes('return mul * (a.portalLinked - b.portalLinked);'));
ok('the fresh click is desc via its OWN rule — the pinned family keeps its members', sortLib.includes("if (key === 'portal') return 'desc';") && sortLib.includes("export const HR_DRILL_NUMERIC_COLUMNS = ['headcount', 'cost', 'absence', 'alerts'] as const;"));
ok('the sort row speaks the pair', sortLib.includes('portalLinked: number;') && sortLib.includes('portalTotal: number;'));

console.log('— the CSV mirrors the screen —');
ok('the fifth section is optional and names its columns', csvLib.includes('portal?: readonly BranchPortalCsvRow[] | null') && csvLib.includes("'Linked logins',\n  'Employees in scope',\n  'Adoption (%)',") && csvLib.includes('export interface BranchPortalCsvRow'));
ok('the rate is computed BY THE LIB, the empty cell is honest', csvLib.includes("p.total > 0 ? Math.round((p.linked / p.total) * 10000) / 100 : '',") && csvLib.includes('Portal adoption by branch') && csvLib.includes('Note,Adoption is linked logins over employees in scope — the point-in-time census the HR reports workspace answers'));

console.log('— the console wears the census —');
ok('the wire type carries the five and the per-branch pair', consoleSrc.includes('portalAdoption: { total: number; linked: number; activeLogins: number; deactivatedLogins: number; unlinked: number };') && consoleSrc.includes('portalLinked: number;\n        portalTotal: number;'));
ok('the adoption tile stands (label, emerald tone, report-distance door, composition footer)', consoleSrc.includes('label="Portal adoption"') && consoleSrc.includes("tone={summary.hr.portalAdoption.total > 0 ? 'good' : undefined}") && consoleSrc.includes('href="/hr/reports?tab=portal"') && consoleSrc.includes('title="Open the portal adoption census"') && consoleSrc.includes('summary.hr.portalAdoption.linked} of {summary.hr.portalAdoption.total} linked'));
ok('the strip is six tiles', consoleSrc.includes('xl:grid-cols-6'));
ok("the 'good' tone is the census's emerald — warn stays amber", consoleSrc.includes("tone === 'good'\n                ? 'text-emerald-700 dark:text-emerald-400'") && consoleSrc.includes("tone === 'good'\n              ? 'text-emerald-700 dark:text-emerald-400'") && consoleSrc.includes("tone === 'warn'\n              ? 'text-amber-700 dark:text-amber-400'"));
ok('the column spec carries Portal with the honest hint', consoleSrc.includes("key: 'portal',\n    label: 'Portal',") && consoleSrc.includes("'Sorts by adoption rate — linked logins over employees in scope. Click again for the mirror. Branches with no employees in scope sort last.'"));
ok('the header enumeration stays honest', consoleSrc.includes('expiry alerts, portal adoption per branch'));
ok('the cell IS the door (storeId drill-down, emerald rate, honest dash, aria speaks)', consoleSrc.includes('data-testid="org-console-hr-portal-door"') && consoleSrc.includes('href={`/hr/reports?tab=portal&storeId=${row.storeId}`}') && consoleSrc.includes('font-semibold text-emerald-700 dark:text-emerald-400') && consoleSrc.includes('title="No employees in scope for this branch"') && consoleSrc.includes('aria-label={`${row.portalLinked} of ${row.portalTotal} employees hold a linked portal login at ${row.storeName}'));
ok('the CSV caller rides the SAME sorted rows as the fifth section', consoleSrc.includes('hrRows.map((r) => ({ storeName: r.storeName, linked: r.portalLinked, total: r.portalTotal }))'));
ok('the sections note counts the portal section', consoleSrc.includes('(trendRows.length > 0 ? 1 : 0) +\n      (summary.hrPerStore && summary.hrPerStore.length > 0 ? 1 : 0);'));

console.log('— the v2.272.0 ancestors —');
ok('the census CSV door bytes stand', page.includes('data-testid="hr-reports-portal-export"') && page.includes('border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:ring-emerald-400'));
ok('the builder purity bytes stand', builder.includes("import { csvCell } from '@/lib/hr/digest-csv';") && !builder.includes('.email'));
ok('the audited export route bytes stand', exportRoute.includes("action: 'PORTAL_ADOPTION_EXPORTED'") && exportRoute.includes("code: 'NO_REPORT_DATA'"));
ok('the meter bytes stand', page.includes('bg-gradient-to-r from-emerald-500 to-emerald-400'));

console.log('— the older ancestors —');
ok('the v2.271.0 census tab bytes stand', page.includes("'schedules', 'portal', 'privacy'] as const;"));
ok('the v2.270.0 lens bytes stand', read('src/app/(shell)/hr/employees/page.tsx').includes('data-testid="hr-employees-linked-toggle"'));
ok('the v2.268.0 bell bytes stand', read('src/app/(shell)/hr/employees/page.tsx').includes('data-testid="hr-employees-portal-chip"'));

console.log(`\nverify v2.273.0: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
