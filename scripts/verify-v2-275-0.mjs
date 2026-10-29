#!/usr/bin/env node
// verify-v2-275-0.mjs — the round's gate (v2.275.0 "the expert hears the census").
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
const panel = read('src/components/finance/people-payroll-by-branch.tsx');
const links = read('src/lib/workspace/links.ts');
const calendar = read('src/lib/hr/compliance-calendar.ts');
const consoleSrc = read('src/components/workspace/org-console.tsx');
const page = read('src/app/(shell)/hr/reports/page.tsx');
const schedule = read('src/lib/hr/report-schedule-service.ts');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/panel-portal-v2275.test.ts');

console.log('— the release face —');
ok('pkg version = 2.275.0', pkg.version === '2.275.0');
ok('pkg releaseVersion = 2.275.0', pkg.mbumah?.releaseVersion === '2.275.0');
ok('pkg baseVersion = 2.275.0', pkg.mbumah?.baseVersion === '2.275.0');
ok('VERSION = 2.275.0', version === '2.275.0');
ok('whats-new lead = 2.275.0 with the round\u2019s title', feed.includes("version: '2.275.0',") && feed.includes('The expert hears the census'));
const leadIdx = feed.indexOf("version: '2.275.0',");
const pairIdx = feed.indexOf("version: '2.274.0',");
ok('whats-new pair order (lead 2.275.0 before pair 2.274.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.275.0]', changelog.includes('## [2.275.0] The expert hears the census'));

console.log('— the ONE writer of the census door —');
ok('buildPortalReportHref lives in the links lib', links.includes('export function buildPortalReportHref(storeId: string): string'));
ok('the builder composes the census deep link', links.includes("params.set('tab', 'portal');") && links.includes("params.set('storeId', storeId || '');"));
ok('the org console speaks the builder (the inline template retired)', consoleSrc.includes('href={buildPortalReportHref(row.storeId)}') && !consoleSrc.includes('href={`/hr/reports?tab=portal&storeId=${row.storeId}`}'));

console.log('— the shared panel wears the census —');
ok('the pure rate function is exported', panel.includes('export function portalAdoptionPct(portalLinked: number, portalTotal: number): number | null'));
ok('the rate of nothing is null (no guess)', panel.includes('if (!Number.isFinite(portalTotal) || portalTotal <= 0) return null;'));
ok('the corrupt payload clamps into the scope', panel.includes('Math.max(0, Math.min(portalLinked, portalTotal))'));
ok('the PortalCell is the door — builder + census testid + emerald', panel.includes('href={buildPortalReportHref(row.storeId)}') && panel.includes('data-testid="people-payroll-portal-door"') && panel.includes('font-semibold text-emerald-700 dark:text-emerald-400'));
ok('the honest dash for a scope of nothing', panel.includes('title="No employees in scope for this branch"'));
ok('the cell mounts twice — the table AND the mobile card', (panel.match(/<PortalCell row=\{row\} \/>/g) ?? []).length === 2);
ok('the header enumeration stays honest', panel.includes('headcount, cost, absence, latest run, portal adoption, expiry alerts per branch'));
ok('the bell rides the cell (the roster vocabulary)', panel.includes('<BellRing className="h-3 w-3 self-center shrink-0 text-emerald-600 dark:text-emerald-400"'));

console.log('— the ledger learns the clock —');
ok('statutoryDueForPeriod is exported from the calendar lib', calendar.includes('export function statutoryDueForPeriod(month: string): StatutoryDue | null'));
ok('the helper speaks Due, never Filed (the column-name law)', page.includes("label: 'Due' }") && schedule.includes("'Due by'") && !page.includes("'Filed'") && !schedule.includes("'Filed'"));
ok('the desk\u2019s Due column is resizable like its siblings', page.includes("<TableHead {...head('due')}    className={`text-right ${col('due')}`}>Due</TableHead>"));
ok('the weekend 9th wears the amber and speaks the words', page.includes("due?.weekendNote ? 'text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'") && calendar.includes('the statute does not wait; settle before the weekend'));
ok('the digest carries the ISO due through the ONE seam', schedule.includes("columns: ['Month', 'PAYE', 'NSSF', 'SHIF', 'AHL', 'Total', 'Due by']") && schedule.includes('statutoryDueForPeriod(m.month)?.dueDate'));
ok('the malformed month key is an honest null', calendar.includes("const m = /^(\\d{4})-(\\d{2})$/.exec(month ?? '');") && calendar.includes('if (!m) return null;'));

console.log('— the tests are present —');
ok('the vitest pins exist (23 tests)', test.split('it(').length - 1 === 23);

console.log('— the openapi mirror —');
const openapi = read('src/lib/openapi.ts');
ok('openapi info.version mirrors APP_VERSION (the single-truth law)', openapi.includes("import { APP_VERSION } from './version'") && openapi.includes('version: APP_VERSION'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
