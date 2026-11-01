#!/usr/bin/env node
// verify-v2-335-0.mjs — the round's FEATURE gate (v2.335.0 "the financial
// doors speak their body's shape"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD
// LAW. Pin law (Task 43-55): pins must match the SOURCE bytes (the
// raw-escape law included — the whats-new title stores \u2019 raw). Run
// BEFORE the walk; the last two pins pass only AFTER walk-v2335.
import { readFileSync } from 'node:fs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.error(`x FAIL ${name}`); }
};
const read = (p) => readFileSync(p, 'utf8');

const DOORS = [
  'src/app/api/financial/accounts/route.ts', 'src/app/api/financial/accounts/[id]/route.ts',
  'src/app/api/financial/budgets/route.ts', 'src/app/api/financial/budgets/[id]/route.ts',
  'src/app/api/financial/budgets/recalculate/route.ts',
  'src/app/api/financial/journal/route.ts', 'src/app/api/financial/journal/[id]/route.ts',
  'src/app/api/financial/periods/route.ts', 'src/app/api/financial/periods/[id]/route.ts',
  'src/app/api/financial/trial-balance/snapshot/route.ts',
];
const doors = DOORS.map(read);
const helper = read('src/lib/request-body.ts');
const test = read('src/tests/financial-doors-v2335.test.ts');
const ledger = read('src/tests/body-door-class-v2326.test.ts');
const panel = read('src/app/(shell)/tabs/financial/BudgetsPanel.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the zero-loose-generic census (the financial family) —');
ok('not one financial door still speaks the loose Record generic',
  !doors.some((s) => s.includes('readJsonBody<Record<string, unknown>>')));
ok('not one financial door still calls the door bare (the `any` law)',
  !doors.some((s) => /readJsonBody\(request\)/.test(s)));
ok('all ten still door with the marker + both helpers',
  doors.every((s) => s.includes('readJsonBody') && s.includes('bodyDoorRejected') &&
    s.includes('THE BODY DOOR: an unreadable body is a client mistake')));

console.log('— the door speaks the body\u2019s own shape (spot pins) —');
ok('accounts CREATE borrows the service signature itself',
  read('src/app/api/financial/accounts/route.ts').includes('readJsonBody<Parameters<typeof createAccount>[0]>(request)'));
ok('budgets CREATE speaks the wire contract (createdById, not the helper userId)',
  read('src/app/api/financial/budgets/route.ts').includes('createdById?: string;') &&
  read('src/app/api/financial/budgets/route.ts').includes('SetBudgetInput says userId'));
ok('budgets UPDATE and periods ACTION dropped their re-casts',
  !read('src/app/api/financial/budgets/[id]/route.ts').includes('} = body as {') &&
  !read('src/app/api/financial/periods/[id]/route.ts').includes('} = body as {'));
ok('periods ACTION speaks the honest union',
  read('src/app/api/financial/periods/[id]/route.ts').includes("action?: 'CLOSE' | 'LOCK' | 'REOPEN';"));
ok('journal CREATE speaks the double-entry lines shape',
  read('src/app/api/financial/journal/route.ts')
    .includes('lines?: Array<{ accountId: string; debit: number; credit: number; description?: string }>;'));
ok('journal VOID keeps the honest String()-coerce unknown',
  read('src/app/api/financial/journal/[id]/route.ts').includes('readJsonBody<{ reason?: unknown }>(request)'));

console.log('— the cross-check the comment always promised —');
const recalc = read('src/app/api/financial/budgets/recalculate/route.ts');
ok('the recalculate door speaks its pair literal and imports db',
  recalc.includes('readJsonBody<{ storeId?: string; periodId?: string }>(request)') &&
  recalc.includes("import { db } from '@/lib/db';"));
ok('the store-membership guard answers 404 before the helper runs',
  recalc.includes('period.storeId !== storeId') &&
  recalc.includes("error: 'Period not found for this store.'") &&
  recalc.indexOf('period.storeId !== storeId') < recalc.indexOf('recalculateBudgetActuals('));
ok('the stale comment now tells the truth',
  recalc.includes('THE CROSS-CHECK THE COMMENT ALWAYS PROMISED') &&
  recalc.includes("the comment's promise is finally code"));

console.log('— the ledger, the law doc and the styling face —');
ok('the v2326 exemplar ledger grew honestly (the financial trio graduated)',
  ledger.includes('THE FINANCIAL TRIO GRADUATED') &&
  !ledger.includes("  'src/app/api/financial/budgets/[id]/route.ts',") &&
  ledger.includes("  'src/app/api/suppliers/[id]/route.ts',"));
ok('request-body.ts records the financial family pass',
  helper.includes('v2.335.0 — THE FINANCIAL FAMILY') &&
  helper.includes("the wider class's first pass"));
ok('the budgets summary wears the consumption meter',
  panel.includes('data-testid="budget-consumption-meter"') &&
  panel.includes('role="progressbar"') &&
  panel.includes("'bg-emerald-500 dark:bg-emerald-400'") &&
  panel.includes("'bg-amber-500 dark:bg-amber-400'") &&
  panel.includes("'bg-red-500 dark:bg-red-400'"));
ok('the meter speaks to screen readers and the recalc button carries its aria-label',
  panel.includes('aria-valuenow={Math.round(consumptionPct)}') &&
  panel.includes('aria-label="Recalculate budget actuals from posted journal entries for the selected period"'));

console.log('— the release voice —');
ok('the tightening ledger exists and pins the census + cross-check + meter',
  test.includes('THE FINANCIAL DOORS SPEAK THEIR BODY SHAPE') &&
  test.includes('THE CROSS-CHECK THE COMMENT ALWAYS PROMISED') &&
  test.includes('budget-consumption-meter'));
ok("whats-new leads with the round\u2019s story",
  whatsNew.includes("version: '2.335.0',") &&
  whatsNew.includes('The financial doors speak their body\\u2019s shape'));
ok('the CHANGELOG carries the round (Added + Styling + Tests)',
  changelog.includes("## [2.335.0] The financial doors speak their body's shape") &&
  changelog.includes('THE FINANCIAL DOORS TIGHTENED (9 doors / 10 files)') &&
  changelog.includes('THE CONSUMPTION METER'));
ok('the manifest answers 2.335.0 in all three slots',
  pkg.version === '2.335.0' && pkg.mbumah?.releaseVersion === '2.335.0' && pkg.mbumah?.baseVersion === '2.335.0');
ok('the verify gate itself is wired into the manifest',
  typeof pkg.scripts['verify:v2-335-0'] === 'string');

console.log('— the walk\u2019s anchors (green AFTER walk-v2335) —');
ok('the walk\u2019s history line landed (the cascade speaks 226/227/228/259)',
  changelogTest.includes('// v2.335.0:') && changelogTest.includes('entry joins the feed') &&
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(226)"));
ok('no stale anchor behind (the old counts are gone)',
  !changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(225)"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
