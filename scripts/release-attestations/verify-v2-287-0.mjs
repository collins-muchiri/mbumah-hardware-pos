#!/usr/bin/env node
// verify-v2-287-0.mjs — the round's gate (v2.287.0 "The bell lights its landing tab").
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
const lib = read('src/lib/hr/report-desk-links.ts');
const svc = read('src/lib/hr/report-schedule-service.ts');
const desk = read('src/app/(shell)/hr/reports/page.tsx');
const hook = read('src/hooks/use-notification-count.ts');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/report-desk-beacons-v287.test.ts');

console.log('— the release face —');
ok('pkg version = 2.287.0', pkg.version === '2.287.0');
ok('pkg releaseVersion = 2.287.0', pkg.mbumah?.releaseVersion === '2.287.0');
ok('pkg baseVersion = 2.287.0', pkg.mbumah?.baseVersion === '2.287.0');
ok('VERSION = 2.287.0', version === '2.287.0');
ok('whats-new lead = 2.287.0 with the round\u2019s title', feed.includes("version: '2.287.0',") && feed.includes('The bell lights its landing tab'));
const leadIdx = feed.indexOf("version: '2.287.0',");
const pairIdx = feed.indexOf("version: '2.286.0',");
ok('whats-new pair order (lead 2.287.0 before pair 2.286.0)', leadIdx > -1 && pairIdx > leadIdx);
ok('CHANGELOG wears [2.287.0]', changelog.includes('## [2.287.0] The bell lights its landing tab'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-287-0'] === 'node scripts/verify-v2-287-0.mjs' && pkg.scripts['verify:v2-286-0'] === 'node scripts/verify-v2-286-0.mjs');

console.log('— the client-safe seam (one vocabulary, never a copy) —');
ok('the lib exists and owns the schedule keys', lib.includes('export const HR_SCHEDULE_REPORTS = [') && lib.includes("'review-cycles',"));
ok('the lib owns the tab map with every landing', lib.includes("'employment-cost': 'cost',") && lib.includes("'time-to-hire': 'tth',") && lib.includes("'goal-attainment': 'goals',"));
ok('the lib owns the URL overrides (the performance pools\u2019 honest landings)', lib.includes("'review-cycles': '/hr/performance?tab=reviews',") && lib.includes("'goal-attainment': '/hr/performance?tab=goals',"));
ok('the lib is PURE (no server-only import, no client-boundary directive)', !lib.includes('@/lib/db') && !lib.includes("'use client'"));
ok('the service pulls the seam from the lib', svc.includes("} from './report-desk-links';"));
ok('the service re-exports at the ONE path (every importer keeps its exact path)', svc.includes("export { HR_SCHEDULE_REPORTS, REPORT_KEY_TO_TAB, REPORT_KEY_TO_URL } from './report-desk-links';") && svc.includes("export type { HrScheduleReportKey } from './report-desk-links';"));
ok('the old definitions are GONE from the service (no drift, no copy)', !svc.includes("export const REPORT_KEY_TO_TAB: Record<HrScheduleReportKey, string> = {") && !svc.includes("export const REPORT_KEY_TO_URL: Partial<Record<HrScheduleReportKey, string>> = {"));

console.log('— the walk parser (never guesses) —');
ok('digestWalkTab exists and is exported', lib.includes('export function digestWalkTab(actionUrl: string | null | undefined): string | null'));
ok('only the desk\u2019s own path can light a tab', lib.includes('if (url.pathname !== REPORTS_DESK_PATH) return null;'));
ok('an empty tab word is no word at all', lib.includes("return tab && tab.length > 0 ? tab : null;"));
ok('garbage parses to silence (the try/catch door)', lib.includes('} catch {\n    return null;\n  }'));

console.log('— the beacon set (unread bells only) —');
ok('digestBeaconTabs exists and is exported', lib.includes('export function digestBeaconTabs('));
ok('a read bell goes dark', lib.includes('if (readIds.has(item.id) || dismissedIds.has(item.id)) continue;'));
ok('duplicate bells collapse into one entry (the Set law)', lib.includes('const tabs = new Set<string>();'));
ok('no feed, no light', lib.includes('if (!items) return tabs;'));

console.log('— the desk wears its unread bells —');
ok('the desk imports the seam, the store, and the badge\u2019s feed hook', desk.includes("import { digestBeaconTabs } from '@/lib/hr/report-desk-links';") && desk.includes("import { useNotificationReadState } from '@/lib/notification-read-state';") && desk.includes("import { useNotificationCount } from '@/hooks/use-notification-count';"));
ok('the desk reads the SAME query instance as the badge', desk.includes('const { activeItems } = useNotificationCount(currentStoreId);'));
ok('the raw words are intersected with the desk\u2019s own known tabs', desk.includes('(REPORT_TAB_KEYS as readonly string[]).includes(t)'));
ok('every digest-carrying trigger wears its dot (the dynamic testid)', desk.includes('data-testid={`${tab}-tab-beacon`}'));
ok('the schedules trigger also lights for a waiting ?schedule= highlight', desk.includes("lit={tab !== 'schedules' && (highlightScheduleId !== null || digestBeacons.has('schedules'))}"));
ok('the beacon never speaks on the tab you are already reading', desk.includes("lit={tab !== 'headcount' && digestBeacons.has('headcount')}"));
ok('the dot is aria-hidden and PULSES (a bell waits for a reader)', desk.includes('aria-hidden') && desk.includes('animate-pulse') && desk.includes('bg-amber-500 dark:bg-amber-400'));
ok('p10/portal/privacy carry no digest, so no beacon', !desk.includes('p10-tab-beacon') && !desk.includes('portal-tab-beacon') && !desk.includes('privacy-tab-beacon'));

console.log('— the feed hand (additive, badge untouched) —');
ok('the hook hands the active items to the desk', hook.includes('activeItems: active,'));
ok('the badge\u2019s poll cadence is untouched', hook.includes('refetchInterval: 60000,'));

console.log('— the suite (both nets) —');
ok('the round\u2019s suite exists and pins the seam identity', test.includes('expect(REPORT_KEY_TO_TAB).toBe(LINK_TABS);'));
ok('the suite truth-tables the walk parser and the beacon set', test.includes('expect(digestWalkTab(\'/hr/performance?tab=reviews&status=DRAFT\')).toBeNull();') && test.includes("expect(lit.size).toBe(0);"));

console.log(`\nverify-v2-287-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
