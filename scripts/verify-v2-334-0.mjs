#!/usr/bin/env node
// verify-v2-334-0.mjs — the round's FEATURE gate (v2.334.0 "the API
// doors speak their body's shape"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD
// LAW. Pin law (Task 43-54): pins must match the SOURCE bytes. Run
// BEFORE the walk.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const CENSUS = [
  'src/app/api/hr/assets/[id]/route.ts', 'src/app/api/hr/assets/route.ts',
  'src/app/api/hr/goals/[id]/route.ts', 'src/app/api/hr/goals/route.ts',
  'src/app/api/hr/discipline/[id]/route.ts', 'src/app/api/hr/discipline/route.ts',
  'src/app/api/hr/performance/cycles/[id]/route.ts', 'src/app/api/hr/performance/cycles/route.ts',
  'src/app/api/hr/performance/reviews/[id]/route.ts', 'src/app/api/hr/performance/reviews/route.ts',
  'src/app/api/hr/privacy/consent/grant/route.ts', 'src/app/api/hr/privacy/consent/withdraw/route.ts',
  'src/app/api/hr/privacy/erasure-requests/route.ts',
  'src/app/api/hr/privacy/erasure-requests/[id]/execute/route.ts',
  'src/app/api/hr/privacy/erasure-requests/[id]/reject/route.ts',
  'src/app/api/hr/privacy/legal-hold/route.ts',
  'src/app/api/hr/reports/schedules/[id]/route.ts', 'src/app/api/hr/reports/schedules/route.ts',
  'src/app/api/self-service/me/leave/route.ts', 'src/app/api/data-exports/route.ts',
];
const census = CENSUS.map(read);
const helper = read('src/lib/request-body.ts');
const test = read('src/tests/door-tightening-v2334.test.ts');
const txnDesk = read('src/app/(shell)/tabs/transactions-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the zero-loose-generic census —');
ok('not one census door still speaks the loose Record generic',
  !census.some((s) => s.includes('readJsonBody<Record<string, unknown>>')));
ok('not one census door still calls the door bare (the `any` law)',
  !census.some((s) => /readJsonBody\(request\)/.test(s)));
ok('not one census door re-casts the body back to loose',
  !census.some((s) => s.includes('door.body as Record<string, unknown>')));
ok('all 20 still door with the marker + the 400 voice',
  census.every((s) => s.includes('readJsonBody') && s.includes('bodyDoorRejected') &&
    s.includes('THE SWALLOW DOOR: an unreadable body is a client mistake (v2.327.0)')));

console.log('— the door speaks the handler\u2019s truth (spot pins) —');
ok('create doors borrow the service signature (Parameters<typeof …>[n])',
  read('src/app/api/hr/assets/route.ts').includes('readJsonBody<Parameters<typeof assignAsset>[0]>(request)') &&
  read('src/app/api/self-service/me/leave/route.ts').includes('readJsonBody<Parameters<typeof requestMyLeave>[2]>(request)'));
ok('update doors import the service\u2019s own exported input types',
  read('src/app/api/hr/assets/[id]/route.ts').includes('readJsonBody<AssetUpdateInput>(request)') &&
  read('src/app/api/hr/goals/[id]/route.ts').includes('readJsonBody<GoalUpdateInput>(request)') &&
  read('src/app/api/hr/discipline/[id]/route.ts').includes('readJsonBody<CaseUpdateInput>(request)') &&
  read('src/app/api/hr/performance/reviews/[id]/route.ts').includes('readJsonBody<ReviewUpdateInput>(request)'));
ok('the dispatching doors speak honest literals',
  read('src/app/api/hr/performance/cycles/[id]/route.ts').includes('readJsonBody<{ action?: unknown; calibrationNotes?: unknown }>(request)') &&
  read('src/app/api/hr/privacy/erasure-requests/[id]/reject/route.ts').includes('readJsonBody<{ notes?: unknown; legalBasis?: unknown }>(request)') &&
  read('src/app/api/data-exports/route.ts').includes('filters?: unknown;'));

console.log('— the law doc and the styling face —');
ok('request-body.ts records the tightening and keeps the wider-class law',
  helper.includes('v2.334.0 — THE DOORS TIGHTENED') && helper.includes('The default `any` remains'));
ok('the transactions quick chips answer the keyboard (violet focus rings)',
  txnDesk.includes('focus-visible:ring-2 focus-visible:ring-violet-400') &&
  txnDesk.includes('focus-visible:ring-offset-1'));

console.log('— the release voice —');
ok('the tightening ledger exists and pins the census',
  test.includes('readJsonBody<Record<string, unknown>>') &&
  test.includes('CENSUS_FILES') &&
  test.includes('the zero-loose-generic census'));
ok("whats-new leads with the round\u2019s story",
  whatsNew.includes("version: '2.334.0',") &&
  whatsNew.includes('The API doors speak their body\\u2019s shape'));
ok('the CHANGELOG carries the round (Added + Styling + Tests)',
  changelog.includes("## [2.334.0] The API doors speak their body's shape") &&
  changelog.includes('THE DOORS TIGHTENED (18 routes)') &&
  changelog.includes('THE QUICK CHIPS ANSWER THE KEYBOARD'));
ok('the manifest answers 2.334.0 in all three slots',
  pkg.version === '2.334.0' && pkg.mbumah?.releaseVersion === '2.334.0' && pkg.mbumah?.baseVersion === '2.334.0');
ok('the verify gate itself is wired into the manifest',
  typeof pkg.scripts['verify:v2-334-0'] === 'string');
ok('the walk\u2019s history line landed (the cascade speaks 225/226/227/258)',
  changelogTest.includes('// v2.334.0:') && changelogTest.includes('entry joins the feed') &&
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(225)"));
ok('no stale anchor behind (the old counts are gone)',
  !changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(224)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
