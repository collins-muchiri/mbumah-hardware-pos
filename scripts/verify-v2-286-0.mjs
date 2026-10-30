#!/usr/bin/env node
// verify-v2-286-0.mjs — the round's gate (v2.286.0 "The word names its pool").
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
const test = read('src/tests/performance-deeplink-v286.test.ts');

console.log('— the release face —');
ok('pkg version = 2.286.0', pkg.version === '2.286.0');
ok('pkg releaseVersion = 2.286.0', pkg.mbumah?.releaseVersion === '2.286.0');
ok('pkg baseVersion = 2.286.0', pkg.mbumah?.baseVersion === '2.286.0');
ok('VERSION = 2.286.0', version === '2.286.0');
ok('whats-new lead = 2.286.0 with the round\u2019s title', feed.includes("version: '2.286.0',") && feed.includes('The word names its pool'));
const leadIdx = feed.indexOf("version: '2.286.0',");
const pairIdx = feed.indexOf("version: '2.285.0',");
ok('whats-new pair order (lead 2.286.0 before pair 2.285.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.286.0]', changelog.includes('## [2.286.0] The word names its pool'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-286-0'] === 'node scripts/verify-v2-286-0.mjs' && pkg.scripts['verify:v2-285-0'] === 'node scripts/verify-v2-285-0.mjs');

console.log('— the vocabularies (the word names its pool) —');
ok('the map reads the lib\u2019s own review words (never a copy)', svc.includes("import { REVIEW_STATUSES, reviewCycleReport } from './performance-service';") && svc.includes("'review-cycles': REVIEW_STATUSES,"));
ok('the map reads the lib\u2019s own goal words', svc.includes("import { GOAL_STATUSES, goalAttainmentReport } from './goal-service';") && svc.includes("'goal-attainment': GOAL_STATUSES,"));
ok('the map is exported at the ONE seam', svc.includes('export const DEEP_LINK_STATUS_VOCABULARY: Partial<Record<HrScheduleReportKey, readonly string[]>> = {'));

console.log('— the dominant status (the bell lands where the mass sits) —');
ok('the helper exists and is exported', svc.includes('export function digestDominantStatus('));
ok('the helper is vocabulary-strict', svc.includes("if (typeof status !== 'string' || !vocabulary.includes(status)) continue;"));
ok('zero/negative/unparseable masses are skipped (never NaN, never a guess)', svc.includes('if (!Number.isFinite(n) || n <= 0) continue;'));
ok('ties break to the first row (strictly-greater keeps table order)', svc.includes('if (n > bestCount) {'));
ok('the walk carries the dominant into the override', svc.includes('`${override}${dominant ? `&status=${dominant}` : \'\'}`'));
ok('the storeId hand reads the FINAL override (the ?-check)', svc.includes("overrideWithStatus?.includes('?') ? '&' : '?'"));

console.log('— the desk reads the word (the symmetric face) —');
ok('the read is lenient about case (one read, both faces)', desk.includes("get('status')?.toUpperCase()"));
ok('both vocabularies are consulted at the read', desk.includes('(GOAL_STATUSES as readonly string[]).includes(status)') && desk.includes('(REVIEW_STATUSES as readonly string[]).includes(status)'));
ok('an explicit ?tab= pins the face (the word never drags across pools)', desk.includes("if (tabParam === 'goals') {") && desk.includes("if (tabParam === 'reviews') {") && desk.includes('if (tabParam) return;'));
ok('a bare review word lands ON the reviews tab', desk.includes("setTab('reviews'); setFilterStatus(status);"));
ok('the incumbent bare-word law stands (a goal word lands the goals tab)', desk.includes("setTab('goals'); setFilterGoalStatus(status);"));
ok('the read is deferred, directive-free', !desk.includes('eslint-disable'));

console.log('— the liftable chip, on the reviews face —');
ok('the lift lives (helper + body)', desk.includes('const clearDeepLinkedReviewStatus = () => {') && desk.includes("setFilterStatus('ALL');") && desk.includes("dropUrlParam('status');"));
ok('the chip renders only when a review status filter is active', desk.includes("filterStatus !== 'ALL' ? (") && desk.includes('data-testid="review-filter-status-chip"'));
ok('the chip wears amber (the deep-link family both faces speak)', desk.slice(desk.indexOf('review-filter-status-chip'), desk.indexOf('review-filter-status-chip') + 400).includes('border-amber-200 bg-amber-50'));
ok('the chip names the word it lifts', desk.includes('Review status ${filterStatus.replace(/_/g, \' \').toLowerCase()}'));
ok('a hand on a review status chip retires the param', desk.includes("onClick={() => { dropUrlParam('status'); setFilterStatus(s); }}"));

console.log('— one honest clear, both directions —');
ok('the mirror of the drop (setUrlParam, guarded against no-op writes)', desk.includes('const setUrlParam = (param: string, value: string) => {') && desk.includes('url.searchParams.set(param, value);'));
ok('the cross-link owns its deep link (speaks cycleId, retires status)', desk.includes("setUrlParam('cycleId', cycleId);") && desk.includes("dropUrlParam('status');\n    setTab('reviews');"));
ok('the generic review clear retires BOTH params', desk.slice(desk.indexOf('const clearFilters = () => {'), desk.indexOf('const clearFilters = () => {') + 520).includes("dropUrlParam('cycleId')") && desk.slice(desk.indexOf('const clearFilters = () => {'), desk.indexOf('const clearFilters = () => {') + 520).includes("dropUrlParam('status')"));
ok('the generic goal clear still retires ?status= (the v2.285 law intact)', desk.slice(desk.indexOf('const clearGoalFilters = () => {'), desk.indexOf('const clearGoalFilters = () => {') + 300).includes("dropUrlParam('status')"));

console.log('— the beacon + the polite count (the styling face) —');
ok('the reviews trigger wears the amber beacon while a filter waits', desk.includes("tab !== 'reviews' && (filterStatus !== 'ALL' || filterCycleId !== 'ALL')") && desk.includes('data-testid="reviews-tab-beacon"'));
ok('the goals trigger wears the same beacon', desk.includes("tab !== 'goals' && filterGoalStatus !== 'ALL'") && desk.includes('data-testid="goals-tab-beacon"'));
ok('the beacons are aria-hidden (the chip does the talking)', (desk.match(/aria-hidden data-testid="(reviews|goals)-tab-beacon"/g) ?? []).length === 2);
ok('both count lines are polite live regions', desk.includes('data-testid="review-filter-count" aria-live="polite"') && desk.includes('data-testid="goal-filter-count" aria-live="polite"'));
ok('the amber chips carry the focus ring (keyboard is a first-class hand)', desk.includes('focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1'));

console.log('— the test file is the second net —');
ok('the v286 suite exists and pins the runtime truth', test.includes('describe(\'digestDominantStatus') && test.includes('DEEP_LINK_STATUS_VOCABULARY') && test.includes("import { REVIEW_STATUSES } from '@/lib/hr/performance-service';"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
