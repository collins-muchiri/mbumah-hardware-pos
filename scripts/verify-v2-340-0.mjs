#!/usr/bin/env node
// verify-v2-340-0.mjs — the round's FEATURE gate (v2.340.0 "the HR doors
// speak their bodies' shapes"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD
// LAW. Run BEFORE the walk; the last two pins pass only AFTER walk-v2340.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

function walkApi(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walkApi(full));
    else if (name.endsWith('.ts')) out.push(full);
  }
  return out;
}

const API_FILES = walkApi('src/app/api');
const BARE = API_FILES.filter((f) => /readJsonBody\(request\)/.test(read(f)));
const attendance = read('src/app/api/attendance/route.ts');
const employees = read('src/app/api/employees/route.ts');
const leaveTypes = read('src/app/api/leave-types/route.ts');
const shifts = read('src/app/api/shifts/route.ts');
const shiftEnd = read('src/app/api/shifts/[id]/end/route.ts');
const helper = read('src/lib/request-body.ts');
const desk = read('src/app/(shell)/tabs/dashboard-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the bare class falls 30 → 25 —');
ok('exactly 25 bare doors remain', BARE.length === 25);
ok('the five HR doors left the census',
  !BARE.includes('src/app/api/attendance/route.ts') &&
  !BARE.includes('src/app/api/employees/route.ts') &&
  !BARE.includes('src/app/api/leave-types/route.ts') &&
  !BARE.includes('src/app/api/shifts/route.ts') &&
  !BARE.includes('src/app/api/shifts/[id]/end/route.ts'));
ok('the loose-Record era stays over (no regressions)',
  !API_FILES.some((f) => read(f).includes('readJsonBody<Record<string, unknown>>')));
ok('the re-cast class stays gone',
  !API_FILES.some((f) => /door\.body as [A-Z]/.test(read(f))));
ok('the door default itself is untouched (the any law, documented, lint-clean)',
  helper.includes('export async function readJsonBody<T = any>(') &&
  helper.includes('eslint-disable-next-line @typescript-eslint/no-explicit-any'));

console.log('— the per-file honest bytes —');
ok('attendance: the clock trio REQUIRED + the optional pair',
  attendance.includes('employeeId: string;') && attendance.includes('storeId: string;') &&
  attendance.includes('action: string;') && attendance.includes('location?: string;') &&
  attendance.includes('notes?: string;'));
ok('employees: the four REQUIRED + the column types + employeeCode unknown',
  employees.includes('storeId: string;') && employees.includes('firstName: string;') &&
  employees.includes('lastName: string;') && employees.includes('hireDate: string;') &&
  employees.includes('basicSalary?: number;') && employees.includes('payeExempt?: boolean;') &&
  employees.includes('email?: string;') && employees.includes('employeeCode?: unknown;'));
ok('leave-types: the name/code pair REQUIRED + the column types',
  leaveTypes.includes('name: string;') && leaveTypes.includes('code: string;') &&
  leaveTypes.includes('defaultDaysPerYear?: number;') && leaveTypes.includes('isPaid?: boolean;'));
ok('shifts: the open pair REQUIRED + startingCash unknown under the Number() chain',
  shifts.includes('storeId: string;') && shifts.includes('userId: string;') &&
  shifts.includes('startingCash?: unknown;') &&
  shifts.includes('const openingCash = Number(startingCash) || 0;'));
ok('shifts/end: the cash pair unknown under the isFinite chain + notes on its column',
  shiftEnd.includes('endingCash?: unknown;') && shiftEnd.includes('countedCash?: unknown;') &&
  shiftEnd.includes('notes?: string;') &&
  shiftEnd.includes('endingCash and countedCash must be finite numbers.'));

console.log('— the law doc carries the round —');
ok('request-body.ts records the HR family pass (history keeps the 30)',
  helper.includes("v2.340.0 — THE HR FAMILY, the bare class's first pass") &&
  helper.includes('The presence-guarded fields ride REQUIRED strings') &&
  helper.includes('falls to 25 doors') &&
  helper.includes("30 doors named by the round's census"));

console.log('— the styling face —');
ok('the closing result speaks THREE voices (the material red at KES 1,000+)',
  desk.includes("const endVarianceLevel = endVariance < 1 ? 'balanced' : endVariance >= 1000 ? 'material' : 'drift';") &&
  desk.includes("'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/40'") &&
  desk.includes("'text-red-700 dark:text-red-300'"));
ok('all three voices carry their dark variants',
  desk.includes('dark:border-emerald-800 dark:bg-emerald-950/40') &&
  desk.includes('dark:border-amber-800 dark:bg-amber-950/40') &&
  desk.includes('dark:border-red-800 dark:bg-red-950/40'));
ok('the shift-variance meter draws the |variance| against the counted envelope',
  desk.includes('data-testid="shift-variance-meter"') &&
  desk.includes('role="progressbar"') &&
  desk.includes('aria-valuenow={Math.round(endVariancePct)}') &&
  desk.includes('Math.min(100, (endVariance / endResult.countedCash) * 100)') &&
  desk.includes('endResult.countedCash > 0 && ('));
ok('THE WAKING FIX: the invalidation rides the dialog\u2019s close path (exactly two calls)',
  desk.includes('// v2.340.0 THE WAKING FIX: the queries are invalidated when the dialog') &&
  desk.includes('// v2.340.0 THE WAKING FIX: the refetch lands here — after the dialog is') &&
  desk.split('void queryClient.invalidateQueries').length - 1 === 2);

console.log('— the release mechanics —');
ok('whats-new carries 2.340.0 (the raw-escape bytes)',
  whatsNew.includes("version: '2.340.0'") &&
  whatsNew.includes('bodies\\u2019 shapes') &&
  whatsNew.includes('KES 1,000+'));
ok('CHANGELOG carries the 2.340.0 head', changelog.includes('## [2.340.0]'));
ok('VERSION and package.json speak 2.340.0 in all three slots',
  read('VERSION').trim() === '2.340.0' &&
  pkg.version === '2.340.0' &&
  pkg.mbumah.releaseVersion === '2.340.0' &&
  pkg.mbumah.baseVersion === '2.340.0');

console.log('— the walk-dependent pins (green after walk-v2340) —');
ok('the unread-counter cascade landed (231/232/233/264)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(231)") &&
  changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(232)") &&
  changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(233)") &&
  changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(264)"));
ok('the history line rides the cascade block',
  changelogTest.includes('v2.340.0: the hr-doors entry joins the feed'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
