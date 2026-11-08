#!/usr/bin/env node
// verify-v2-271-0.mjs — the round's gate (v2.271.0 "the report hears the bell").
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
const service = read('src/lib/hr/reports.ts');
const route = read('src/app/api/hr/reports/portal-adoption/route.ts');
const page = read('src/app/(shell)/hr/reports/page.tsx');
const roster = read('src/app/(shell)/hr/employees/page.tsx');
const tabs = read('src/app/(selfservice)/employees/me/self-service-tabs.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('pkg version = 2.271.0', pkg.version === '2.271.0');
ok('pkg releaseVersion = 2.271.0', pkg.mbumah?.releaseVersion === '2.271.0');
ok('pkg baseVersion = 2.271.0', pkg.mbumah?.baseVersion === '2.271.0');
ok('VERSION = 2.271.0', version === '2.271.0');
ok('whats-new lead = 2.271.0 with the round\u2019s title', feed.includes("version: '2.271.0',") && feed.includes('The report hears the bell'));
const leadIdx = feed.indexOf("version: '2.271.0',");
const pairIdx = feed.indexOf("version: '2.270.0',");
ok('whats-new pair order (lead 2.271.0 before pair 2.270.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.271.0]', changelog.includes('## [2.271.0] The report hears the bell'));

console.log('— the bell at report distance —');
ok('the route rides the governed guard + roles + drill-down', route.includes("hrGuard('hr.report.branch', REPORT_ROLES)") && route.includes("['HR_MANAGER', 'STORE_OWNER', 'ACCOUNTANT', 'BRANCH_MANAGER'] as const") && route.includes('validateReportStore(session, scope, url.searchParams.get(\'storeId\'))'));
ok('the select refuses the email (role + active only)', service.includes('user: { select: { role: true, isActive: true } },') && !service.slice(service.indexOf('portalAdoptionReport'), service.indexOf('export type PortalAdoptionDto')).includes('email: true'));
ok('the shaped bits match the roster wire', service.includes('portalLinked: e.user != null,') && service.includes('portalActive: e.user ? e.user.isActive : null,'));
ok('the census has no period (a roll call, not a trend)', (() => { const fn = service.slice(service.indexOf('export async function portalAdoptionReport('), service.indexOf('export type PortalAdoptionDto')); return !fn.includes('parsePeriod'); })());
ok('the tab key + the trigger with the bell', page.includes("'schedules', 'portal', 'privacy'] as const;") && page.includes('<TabsTrigger value="portal" className="gap-1.5">') && page.includes('<BellRing className="h-3.5 w-3.5 text-emerald-500" aria-hidden /> Portal'));
ok('the digest note names the portal as deliberately absent', page.includes('p10 / schedules / portal / privacy'));
ok('the loader rides the branch drill-down law', page.includes('const loadPortal = useCallback(async () => {') && page.includes('}, [storeId]);') && page.includes('/api/hr/reports/portal-adoption${qs}'));
ok('the tab speaks failures + freshness like its siblings', page.includes('testId="hr-reports-portal-error"') && page.includes('onRetry={() => void loadPortal()}') && page.includes('testId="hr-reports-updated-portal"'));
ok('the chip vocabulary is the roster\u2019s, byte-kept (both faces, both desks)', page.includes("'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'") && page.includes("'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'") && roster.includes("'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'") && roster.includes("'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'"));
ok('the honest dash stands on the roll call', page.includes('data-testid="hr-reports-portal-silent"') && page.includes('No linked login — the self-service portal stays behind the HR desk.'));
ok('the meter answers the rate at a glance', page.includes('bg-gradient-to-r from-emerald-500 to-emerald-400') && page.includes('data-testid="hr-reports-portal-store-row"'));

console.log('— the ancestors —');
ok('the v2.270.0 lens bytes stand', roster.includes('data-testid="hr-employees-linked-toggle"') && roster.includes('const visibleRows = rows && linkedOnly ? rows.filter((r) => r.portalLinked) : rows;'));
ok('the v2.269.0 wayfinding bytes stand', (tabs.match(/aria-current=\{active \? 'page' : undefined\}/g) || []).length === 2);
ok('the v2.268.0 bell bytes stand', roster.includes('data-testid="hr-employees-portal-chip"'));

console.log(`\nverify v2.271.0: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
