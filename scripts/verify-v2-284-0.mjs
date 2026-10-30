#!/usr/bin/env node
// verify-v2-284-0.mjs — the round's gate (v2.284.0 "the pool speaks its true scope").
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
const svc = read('src/lib/hr/report-schedule-service.ts');
const tab = read('src/components/hr/report-schedules-tab.tsx');
const desk = read('src/app/(shell)/hr/performance/page.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/schedule-pool-scope-v284.test.ts');

console.log('— the release face —');
ok('pkg version = 2.284.0', pkg.version === '2.284.0');
ok('pkg releaseVersion = 2.284.0', pkg.mbumah?.releaseVersion === '2.284.0');
ok('pkg baseVersion = 2.284.0', pkg.mbumah?.baseVersion === '2.284.0');
ok('VERSION = 2.284.0', version === '2.284.0');
ok('whats-new lead = 2.284.0 with the round\u2019s title', feed.includes("version: '2.284.0',") && feed.includes('The pool speaks its true scope'));
const leadIdx = feed.indexOf("version: '2.284.0',");
const pairIdx = feed.indexOf("version: '2.283.0',");
ok('whats-new pair order (lead 2.284.0 before pair 2.283.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.284.0]', changelog.includes('## [2.284.0] The pool speaks its true scope'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-284-0'] === 'node scripts/verify-v2-284-0.mjs' && pkg.scripts['verify:v2-283-0'] === 'node scripts/verify-v2-283-0.mjs');

console.log('— the create door (the refusal) —');
ok('the narrowing is refused, not silently corrected', svc.includes("if (input.reportKey === 'review-cycles' && input.storeId != null) {") && svc.includes("'INVALID_SCOPE',") && svc.includes('The review pool is organization-wide — schedule it at the organization, not a branch.'));
ok('the door sits with the other input laws (before the frequency check)', svc.indexOf("'INVALID_SCOPE',") > -1 && svc.indexOf("'INVALID_SCOPE',") < svc.indexOf("'INVALID_FREQUENCY',"));

console.log('— the belt (the forced scope line) —');
ok("the digest's scope line speaks the organization, unconditionally", svc.includes("scopeLabel: 'All branches (organization)',"));
ok('the law is written where the belt lives', svc.includes('branch name over org-wide counts is a lying document'));

console.log('— the wire (the dialog lock + the card mark) —');
ok('the org-pool set exists', tab.includes("const ORG_POOL_REPORTS: ReadonlySet<string> = new Set(['review-cycles']);") && tab.includes('function isOrgPoolReport(reportKey: string): boolean {'));
ok('picking an org-pool report resets the branch pick', tab.includes("...(isOrgPoolReport(v) ? { storeId: 'all' } : {})"));
ok('the branch select locks with the swapped hint', tab.includes("value={isOrgPoolReport(form.reportKey) ? 'all' : form.storeId}") && tab.includes('disabled={isOrgPoolReport(form.reportKey)}') && tab.includes('The review pool is organization-wide — every cycle and review, whatever branch employs them.'));
ok('the card wears the slate Org pool chip', tab.includes('{isOrgPoolReport(s.reportKey) ? (') && tab.includes('Org pool') && tab.slice(tab.indexOf('Org pool') - 400, tab.indexOf('Org pool')).includes('bg-slate-100 dark:bg-slate-900/60'));

console.log('— the walk (?cycleId= + the liftable chip) —');
ok('the deep-link read is deferred, directive-free', desk.includes("const cycleId = new URLSearchParams(window.location.search).get('cycleId');") && desk.includes('const t = window.setTimeout(() => setFilterCycleId(cycleId), 0);') && !desk.includes('eslint-disable'));
ok('the chip lifts filter + param together', desk.includes('const clearDeepLinkedCycle = () => {') && desk.includes("dropUrlParam('cycleId');") && desk.includes("window.history.replaceState(null, '', url.toString());"));
ok('the chip renders only when a cycle filter is active', desk.includes("filterCycleId !== 'ALL' ? (") && desk.includes('data-testid="review-filter-cycle-chip"'));
ok('the chip wears amber (the filters\u2019 own waiting family)', desk.slice(desk.indexOf('review-filter-cycle-chip'), desk.indexOf('review-filter-cycle-chip') + 400).includes('border-amber-200 bg-amber-50'));

console.log('— the tests and the truth bytes —');
ok('the suite pins the throw', test.includes("expect(err.code).toBe('INVALID_SCOPE');"));
ok('the suite pins the acceptance', test.includes('expect(a.storeId).toBeNull();'));
ok('the suite pins the branch door stays open', test.includes("validateScheduleInput({ ...baseInput, reportKey: 'headcount', storeId: 'store-juja' })"));
ok('the suite pins the URL-truthful clear', test.includes("dropUrlParam('cycleId');"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
