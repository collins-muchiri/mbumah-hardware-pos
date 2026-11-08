#!/usr/bin/env node
// verify-v2-285-0.mjs — the round's gate (v2.285.0 "the goals answer their link").
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
const desk = read('src/app/(shell)/hr/performance/page.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/performance-deeplink-v285.test.ts');

console.log('— the release face —');
ok('pkg version = 2.285.0', pkg.version === '2.285.0');
ok('pkg releaseVersion = 2.285.0', pkg.mbumah?.releaseVersion === '2.285.0');
ok('pkg baseVersion = 2.285.0', pkg.mbumah?.baseVersion === '2.285.0');
ok('VERSION = 2.285.0', version === '2.285.0');
ok('whats-new lead = 2.285.0 with the round\u2019s title', feed.includes("version: '2.285.0',") && feed.includes('The goals answer their link'));
const leadIdx = feed.indexOf("version: '2.285.0',");
const pairIdx = feed.indexOf("version: '2.284.0',");
ok('whats-new pair order (lead 2.285.0 before pair 2.284.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.285.0]', changelog.includes('## [2.285.0] The goals answer their link'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-285-0'] === 'node scripts/verify-v2-285-0.mjs' && pkg.scripts['verify:v2-284-0'] === 'node scripts/verify-v2-284-0.mjs');

console.log('— the bell\u2019s honest landing (the walk that was nowhere) —');
ok('the goal pool\u2019s override speaks its true home', svc.includes("'goal-attainment': '/hr/performance?tab=goals',"));
ok('the cycles\u2019 override stands', svc.includes("'review-cycles': '/hr/performance?tab=reviews',"));
ok('the law is written where the override lives', svc.includes('a bell that walks nowhere'));
ok('the tab fallback remains as the belt (the override wins — the builder consults URL first)', svc.includes("'goal-attainment': 'goals',"));

console.log('— the goals tab\u2019s own deep link (?status=) —');
ok('the read is lenient about case', desk.includes("get('status')?.toUpperCase()"));
ok('the read is strict about vocabulary (only a KNOWN status lands)', desk.includes('(GOAL_STATUSES as readonly string[]).includes(status)'));
ok('a valid status lands the reader ON the goals tab', desk.includes("setTab('goals');") && desk.includes('setFilterGoalStatus(status);'));
ok('the read is deferred, directive-free', !desk.includes('eslint-disable'));

console.log('— the liftable chip —');
ok('the lift lives (helper + body)', desk.includes('const clearDeepLinkedGoalStatus = () => {') && desk.includes("setFilterGoalStatus('ALL');") && desk.includes("dropUrlParam('status');"));
ok('the chip renders only when a status filter is active', desk.includes("filterGoalStatus !== 'ALL' ? (") && desk.includes('data-testid="goal-filter-status-chip"'));
ok('the chip wears amber (the cycle chip\u2019s family)', desk.slice(desk.indexOf('goal-filter-status-chip'), desk.indexOf('goal-filter-status-chip') + 400).includes('border-amber-200 bg-amber-50'));
ok('the chip names the word it lifts', desk.includes('Goal status ${filterGoalStatus.replace(/_/g, \' \').toLowerCase()}'));

console.log('— one honest clear (the URL stays truthful) —');
ok('the drop is ONE helper', desk.includes('const dropUrlParam = (param: string) => {') && desk.includes('url.searchParams.delete(param);'));
ok('the generic review clear retires ?cycleId=', desk.slice(desk.indexOf('const clearFilters = () => {'), desk.indexOf('const clearFilters = () => {') + 300).includes("dropUrlParam('cycleId')"));
ok('the generic goal clear retires ?status=', desk.slice(desk.indexOf('const clearGoalFilters = () => {'), desk.indexOf('const clearGoalFilters = () => {') + 300).includes("dropUrlParam('status')"));
ok('a hand on the cycle select retires the param', desk.includes("onValueChange={(v) => { dropUrlParam('cycleId'); setFilterCycleId(v); }}"));
ok('a hand on a status chip retires the param', desk.includes("onClick={() => { dropUrlParam('status'); setFilterGoalStatus(s); }}"));

console.log('— the honest answer (the lens-empty law) —');
ok('the goals empty state names the word', desk.includes('No goal wears ${filterGoalStatus.replace(/_/g, \' \').toLowerCase()} under the current filters.'));
ok('the reviews empty state names the word', desk.includes('No review wears ${filterStatus.replace(/_/g, \' \').toLowerCase()} under the current filters.'));

console.log('— the tests and the truth bytes —');
ok('the suite pins the override by VALUE (runtime pin)', test.includes("expect(REPORT_KEY_TO_URL['goal-attainment']).toBe('/hr/performance?tab=goals');"));
ok('the suite pins the case-lenient read', test.includes("get('status')?.toUpperCase()"));
ok('the suite pins the vocabulary gate', test.includes('(GOAL_STATUSES as readonly string[]).includes(status)'));
ok('the suite pins the one-honest-clear law', test.includes("dropUrlParam('cycleId')") && test.includes("dropUrlParam('status')"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
