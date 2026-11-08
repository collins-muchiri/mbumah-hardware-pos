#!/usr/bin/env node
// verify-v2-272-0.mjs — the round's gate (v2.272.0 "the census carries its copy").
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
const builder = read('src/lib/hr/portal-adoption-csv.ts');
const exportRoute = read('src/app/api/hr/reports/portal-adoption/export/route.ts');
const digestRoute = read('src/app/api/hr/reports/export/route.ts');
const censusRoute = read('src/app/api/hr/reports/portal-adoption/route.ts');
const page = read('src/app/(shell)/hr/reports/page.tsx');
const roster = read('src/app/(shell)/hr/employees/page.tsx');
const tabs = read('src/app/(selfservice)/employees/me/self-service-tabs.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');

console.log('— the release face —');
ok('pkg version = 2.272.0', pkg.version === '2.272.0');
ok('pkg releaseVersion = 2.272.0', pkg.mbumah?.releaseVersion === '2.272.0');
ok('pkg baseVersion = 2.272.0', pkg.mbumah?.baseVersion === '2.272.0');
ok('VERSION = 2.272.0', version === '2.272.0');
ok('whats-new lead = 2.272.0 with the round\u2019s title', feed.includes("version: '2.272.0',") && feed.includes('The census carries its copy'));
const leadIdx = feed.indexOf("version: '2.272.0',");
const pairIdx = feed.indexOf("version: '2.271.0',");
ok('whats-new pair order (lead 2.272.0 before pair 2.271.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.272.0]', changelog.includes('## [2.272.0] The census carries its copy'));

console.log('— the audited door —');
ok('the builder is pure (csvCell reuse, DTO-typed, no db import)', builder.includes("import { csvCell } from '@/lib/hr/digest-csv';") && builder.includes("import type { PortalAdoptionDto }") && !builder.includes("from '@/lib/db'"));
ok('the roll call columns are the shaped bits, no email field', builder.includes("csvRow(['Employee', 'Employee code', 'Job title', 'Branch', 'Login role', 'Portal state'])") && !builder.includes('.email') && !builder.includes("'Email'"));
ok('the state words are the chip vocabulary spoken plain', builder.includes("return row.portalActive === false ? 'portal off' : 'portal';") && builder.includes("if (!row.portalLinked) return 'not linked';"));
ok('an empty census refuses to file', builder.includes('if (input.rows.length === 0)'));
ok('the CRLF + trailing CRLF + point-in-time filename law', builder.includes("lines.join('\\r\\n') + '\\r\\n'") && builder.includes('mbumah-portal-adoption-census-${stamp}.csv'));
ok('the export route rides the governed guard + roles + drill-down', exportRoute.includes("hrGuard('hr.report.branch', REPORT_ROLES)") && exportRoute.includes("['HR_MANAGER', 'STORE_OWNER', 'ACCOUNTANT', 'BRANCH_MANAGER'] as const") && exportRoute.includes("validateReportStore(session, scope, url.searchParams.get('storeId'))"));
ok('the file is built from the ALREADY-governed census DTO', exportRoute.includes('portalAdoptionReport(session, { storeId: store?.id ?? null })') && exportRoute.includes('portalAdoptionToCsv('));
ok('the empty census answers the honest 404', exportRoute.includes("code: 'NO_REPORT_DATA'"));
ok('the audit: its own action, count-only metadata', exportRoute.includes("action: 'PORTAL_ADOPTION_EXPORTED'") && exportRoute.includes('resourceType: HrEntityType.DATA_EXPORT') && exportRoute.includes('rows: data.rows.length') && exportRoute.includes("channel: 'ad_hoc_download'"));
ok('no employee names can ride the audit metadata', !exportRoute.includes('data.rows.map'));
ok('the digest export route still refuses the census', !digestRoute.includes('portal') && digestRoute.includes('HR_SCHEDULE_REPORTS.includes'));

console.log('— the page wears the door —');
ok('the emerald button stands (testid, busy words, print law)', page.includes('data-testid="hr-reports-portal-export"') && page.includes("{portalCsvBusy ? 'Building…' : 'Roll call CSV'}") && page.includes('border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:ring-emerald-400'));
ok('the handler rides the census\u2019s OWN endpoint, scope-aware', page.includes('fetch(`/api/hr/reports/portal-adoption/export${qs}`') && page.includes("match?.[1] ?? res.headers.get('X-Census-Csv-Filename') ?? 'mbumah-portal-adoption-census.csv'"));
ok('the note speaks the audit law', page.includes('data-testid="hr-reports-portal-export-note"') && page.includes('The export is audit logged; the file carries no emails — the same shaped bits the table shows.'));

console.log('— the v2.271.0 ancestors —');
ok('the census route bytes stand', censusRoute.includes('portalAdoptionReport(session, { storeId: store?.id ?? null })'));
ok('the census tab bytes stand', page.includes("'schedules', 'portal', 'privacy'] as const;") && page.includes('<BellRing className="h-3.5 w-3.5 text-emerald-500" aria-hidden /> Portal'));
ok('the chip vocabulary byte-kept (both desks)', page.includes("'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300'") && roster.includes("'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300'"));
ok('the meter bytes stand', page.includes('bg-gradient-to-r from-emerald-500 to-emerald-400'));
ok('the digest note still names the portal as deliberately absent from DIGEST exports', page.includes('p10 / schedules / portal / privacy'));

console.log('— the older ancestors —');
ok('the v2.270.0 lens bytes stand', roster.includes('data-testid="hr-employees-linked-toggle"') && roster.includes('const visibleRows = rows && linkedOnly ? rows.filter((r) => r.portalLinked) : rows;'));
ok('the v2.269.0 wayfinding bytes stand', (tabs.match(/aria-current=\{active \? 'page' : undefined\}/g) || []).length === 2);
ok('the v2.268.0 bell bytes stand', roster.includes('data-testid="hr-employees-portal-chip"'));

console.log(`\nverify v2.272.0: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
