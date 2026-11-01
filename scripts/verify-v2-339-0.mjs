#!/usr/bin/env node
// verify-v2-339-0.mjs — the round's FEATURE gate (v2.339.0 "the last
// exemplars speak their body's shape"). The release MECHANICS live in
// verify-current.mjs. This script pins only what is NEW this round.
// Every check reads the SOURCE OF RECORD (bytes, not memory) — THE OD
// LAW. Pin law (Task 43-59): pins must match the SOURCE bytes (the
// raw-escape law included — the law doc stores ASCII apostrophes, the
// whats-new stores raw \u2019 escapes). Run BEFORE the walk; the last
// two pins pass only AFTER walk-v2339.
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
const expensesDoor = read('src/app/api/expenses/[id]/route.ts');
const suppliersDoor = read('src/app/api/suppliers/[id]/route.ts');
const cb = read('src/app/api/health/circuit-breaker/route.ts');
const dlq = read('src/app/api/health/dlq/route.ts');
const pwd = read('src/app/api/profile/password/route.ts');
const schedCreate = read('src/app/api/shift-schedules/route.ts');
const schedPatch = read('src/app/api/shift-schedules/[id]/route.ts');
const schedStatus = read('src/app/api/shift-schedules/[id]/status/route.ts');
const ledger = read('src/tests/body-door-class-v2326.test.ts');
const ledger2335 = read('src/tests/financial-doors-v2335.test.ts');
const ledger2336 = read('src/tests/catalog-doors-v2336.test.ts');
const ledger2338 = read('src/tests/customer-doors-v2338.test.ts');
const helper = read('src/lib/request-body.ts');
const desk = read('src/app/(shell)/tabs/financial-tab.tsx');
const whatsNew = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const pkg = JSON.parse(read('package.json'));

console.log('— the era is over (the live census) —');
ok('not one door in src/app/api reads through the loose Record widening',
  !API_FILES.some((f) => read(f).includes('readJsonBody<Record<string, unknown>>')));
ok('not one door re-casts the body back to a named interface',
  !API_FILES.some((f) => /door\.body as [A-Z]/.test(read(f))));
ok('the wider bare-any class remains at exactly 30 doors (the map for the next passes)',
  API_FILES.filter((f) => /readJsonBody\(request\)/.test(read(f))).length === 30);
ok('both graduates read through an honest generic now',
  expensesDoor.includes('readJsonBody<{') && suppliersDoor.includes('readJsonBody<{'));
ok('the door default itself is untouched (the any law, documented, lint-clean)',
  helper.includes('export async function readJsonBody<T = any>(') &&
  helper.includes('eslint-disable-next-line @typescript-eslint/no-explicit-any'));

console.log('— the per-file honest bytes —');
ok('expenses/[id] names the five fields the route reads',
  expensesDoor.includes('description?: unknown;') &&
  expensesDoor.includes('category?: unknown;') &&
  expensesDoor.includes('paymentMethod?: unknown;') &&
  expensesDoor.includes('notes?: unknown;') &&
  expensesDoor.includes('amount?: unknown;'));
ok('expenses/[id] keeps the loop\u2019s honest aggregate',
  expensesDoor.includes('const updateData: Record<string, unknown> = {};') &&
  expensesDoor.includes('[key: string]: unknown;'));
ok('suppliers/[id] names the eleven loop fields',
  ['name', 'email', 'phone', 'address', 'city', 'contactPerson', 'taxPin', 'paymentTerms', 'rating', 'isActive', 'notes']
    .every((f) => suppliersDoor.includes(`${f}?: unknown;`)) &&
  suppliersDoor.includes('[key: string]: unknown;'));
ok('the health admin doors ride AdminBody inside the generic',
  cb.includes('const door = await readJsonBody<AdminBody>(request);') &&
  dlq.includes('const door = await readJsonBody<AdminBody>(request);') &&
  !cb.includes('door.body as AdminBody') && !dlq.includes('door.body as AdminBody'));
ok('the password door rides ChangePasswordBody inside the generic',
  pwd.includes('const door = await readJsonBody<ChangePasswordBody>(request);') &&
  !pwd.includes('door.body as ChangePasswordBody'));
ok('the shift-schedules trio rides their own interfaces',
  schedCreate.includes('const door = await readJsonBody<CreateBody>(request);') &&
  schedPatch.includes('const door = await readJsonBody<PatchBody>(request);') &&
  schedStatus.includes('const door = await readJsonBody<StatusBody>(request);'));
ok('the status-to-union narrowing stays (the route\u2019s own validator)',
  schedStatus.includes('const target = body.status as ShiftScheduleStatus;'));

console.log('— the ledgers grew honestly —');
ok('the v2.326 census carries the era-end story and the empty tombstone',
  ledger.includes('THE LOOSE-RECORD ERA IS OVER') &&
  ledger.includes('THE LAST EXEMPLARS GRADUATED') &&
  ledger.includes('EXEMPLARS: string[] = [];'));
ok('the v2.326 widening guard flipped to ABSENCE',
  ledger.includes("expect(src.includes('readJsonBody<Record<string, unknown>>(request)')).toBe(false);"));
ok('the v2.335 byte-exact pin grew with the tombstone',
  ledger2335.includes('EXEMPLARS: string[] = [];') &&
  ledger2335.includes("expect(src.includes('readJsonBody<Record<string, unknown>>(request)')).toBe(false);"));
ok('the v2.336 presence pins grew into the tombstone pins',
  ledger2336.includes('THE LAST EXEMPLARS GRADUATED') &&
  ledger2336.includes('EXEMPLARS: string[] = [];'));
ok('the v2.338 ledger grew a fourth way',
  ledger2338.includes('the era-end, a fourth') &&
  ledger2338.includes("read('src/tests/last-exemplars-v2339.test.ts')"));

console.log('— the law doc carries the round —');
ok('request-body.ts records the era\u2019s end and the re-cast closure',
  helper.includes("v2.339.0 — THE LAST EXEMPLARS, the era's end") &&
  helper.includes('THE LOOSE-RECORD ERA IS OVER') &&
  helper.includes("30 doors named by the round's census"));

console.log('— the styling face —');
ok('the expense-share meter rides every active row',
  desk.includes('data-testid="expense-share-meter"') &&
  desk.includes('role="progressbar"') &&
  desk.includes('aria-valuenow={Math.round(share)}'));
ok('the concentration voice steps through the three colours',
  desk.includes("share > 50 ? 'bg-red-500' : share > 20 ? 'bg-amber-500' : 'bg-emerald-500'"));
ok('the envelope is the active total; VOIDED rows stay silent',
  desk.includes('const periodExpenseTotal = expenses') &&
  desk.includes(".filter((e) => e.status !== 'VOIDED')") &&
  desk.includes("exp.status !== 'VOIDED' && periodExpenseTotal > 0"));

console.log('— the release mechanics —');
ok('whats-new carries 2.339.0 (the raw-escape bytes)',
  whatsNew.includes("version: '2.339.0'") &&
  whatsNew.includes('body\\u2019s shape') &&
  whatsNew.includes('loose-Record era is over'));
ok('CHANGELOG carries the 2.339.0 head',
  changelog.includes('## [2.339.0]'));
ok('VERSION and package.json speak 2.339.0 in all three slots',
  read('VERSION').trim() === '2.339.0' &&
  pkg.version === '2.339.0' &&
  pkg.mbumah.releaseVersion === '2.339.0' &&
  pkg.mbumah.baseVersion === '2.339.0');

console.log('— the walk-dependent pins (green after walk-v2339) —');
ok('the unread-counter cascade landed (230/231/232/263)',
  changelogTest.includes("whatsNewUnreadCount('2.110.0')).toBe(230)") &&
  changelogTest.includes("whatsNewUnreadCount('2.109.0')).toBe(231)") &&
  changelogTest.includes("whatsNewUnreadCount('2.108.0')).toBe(232)") &&
  changelogTest.includes("whatsNewUnreadCount('2.77.0')).toBe(263)"));
ok('the history line rides the cascade block',
  changelogTest.includes('v2.339.0: the last-exemplars entry joins the feed'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
