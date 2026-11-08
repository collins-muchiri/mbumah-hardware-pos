#!/usr/bin/env node
// verify-v2-274-0.mjs — the round's gate (v2.274.0 "the calendar keeps the clock").
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
const lib = read('src/lib/hr/compliance-calendar.ts');
const route = read('src/app/api/hr/reports/compliance-calendar/route.ts');
const page = read('src/app/(shell)/hr/reports/page.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/compliance-calendar-v2274.test.ts');

console.log('— the release face —');
ok('pkg version = 2.274.0', pkg.version === '2.274.0');
ok('pkg releaseVersion = 2.274.0', pkg.mbumah?.releaseVersion === '2.274.0');
ok('pkg baseVersion = 2.274.0', pkg.mbumah?.baseVersion === '2.274.0');
ok('VERSION = 2.274.0', version === '2.274.0');
ok('whats-new lead = 2.274.0 with the round\u2019s title', feed.includes("version: '2.274.0',") && feed.includes('The calendar keeps the clock'));
const leadIdx = feed.indexOf("version: '2.274.0',");
const pairIdx = feed.indexOf("version: '2.273.0',");
ok('whats-new pair order (lead 2.274.0 before pair 2.273.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.274.0]', changelog.includes('## [2.274.0] The calendar keeps the clock'));

console.log('— the pure clock —');
ok('the lib exports complianceCalendar(now)', lib.includes('export function complianceCalendar(now: Date): ComplianceCalendar'));
ok('the census floor law rides (DAY_MS + utcDayKey)', lib.includes('const DAY_MS = 86_400_000;') && lib.includes('Math.floor(at.getTime() / DAY_MS)'));
ok('the window law reads on-or-before the 9th', lib.includes('const windowOpen = nowDay <= spec.dueDay;'));
ok('the roll law points December at January', lib.includes('nowMonth === 11 ? nowYear + 1 : nowYear') && lib.includes('nowMonth === 11 ? 0 : nowMonth + 1'));
ok('the unopened window refuses the rail (null, not zero)', lib.includes('windowElapsedPct: number | null') && lib.includes('let windowElapsedPct: number | null = null;'));
ok('the four obligations, the 9th family', lib.includes("kind: 'PAYE'") && lib.includes("kind: 'NSSF'") && lib.includes("kind: 'SHIF'") && lib.includes("kind: 'AHL'") && lib.includes('dueDay: 9'));
ok('the instruments are cited, not asserted', lib.includes('NSSF Act 2013') && lib.includes('Social Health Insurance Act 2023') && lib.includes('Affordable Housing Act 2024') && lib.includes('Income Tax Act'));
ok('the weekend law speaks the statute does not wait', lib.includes('the statute does not wait; settle before the weekend'));

console.log('— the read route —');
ok('the guard rides the drill-down roles', route.includes("hrGuard('hr.report.branch'") && route.includes("'HR_MANAGER', 'STORE_OWNER', 'ACCOUNTANT', 'BRANCH_MANAGER'"));
ok('the clock is the server\u2019s own (no client guess)', route.includes('complianceCalendar(new Date())'));
ok('no period params, no storeId, no audit', !route.includes('searchParams.get') && !route.includes("searchParams.get('storeId')") && !route.includes('auditLog'));

console.log('— the card above the money —');
ok('the card testids stand', page.includes('data-testid="hr-compliance-calendar"') && page.includes('testId="hr-compliance-calendar-error"') && page.includes('data-testid="hr-compliance-calendar-asof"'));
ok('the rows carry per-kind testids (template law)', page.includes('data-testid={`hr-cal-row-${o.kind.toLowerCase()}`}') && page.includes('data-testid={`hr-cal-status-${o.kind.toLowerCase()}`}'));

console.log('— the tests are present —');
ok('the vitest pins exist (13 tests)', test.split('it(').length - 1 === 13);

console.log('— the openapi mirror —');
const openapi = read('src/lib/openapi.ts');
ok('openapi info.version mirrors APP_VERSION (the single-truth law)', openapi.includes("import { APP_VERSION } from './version'") && openapi.includes('version: APP_VERSION'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
