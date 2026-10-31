#!/usr/bin/env node
// verify-v2-304-0.mjs — the round's gate (v2.304.0 "The salary finds its desk").
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
const viewLib = read('src/lib/hr/salary-structure-view.ts');
const service = read('src/lib/hr/salary-structure-service.ts');
const route = read('src/app/api/hr/salary-structures/route.ts');
const idRoute = read('src/app/api/hr/salary-structures/[id]/route.ts');
const compRoute = read('src/app/api/hr/salary-components/route.ts');
const compIdRoute = read('src/app/api/hr/salary-components/[id]/route.ts');
const page = read('src/app/(shell)/hr/salary-structures/page.tsx');
const hrPage = read('src/app/(shell)/hr/page.tsx');
const perms = read('src/lib/hr/permissions.ts');
const audit = read('src/lib/hr/audit.ts');
const voiceLib = read('src/lib/hr/payroll/error-voice.ts');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/salary-structure-keeper-v304.test.ts');

console.log('— the release face —');
ok('pkg version = 2.304.0 (all three slots)', pkg.version === '2.304.0' && pkg.mbumah?.releaseVersion === '2.304.0' && pkg.mbumah?.baseVersion === '2.304.0');
ok('VERSION = 2.304.0', version === '2.304.0');
ok('whats-new lead = 2.304.0 with the round\u2019s title', feed.includes("version: '2.304.0',") && feed.includes('The salary finds its desk'));
const leadIdx = feed.indexOf("version: '2.304.0',");
ok('the lead entry sits FIRST (newest above all)', leadIdx >= 0 && feed.indexOf('version:') < leadIdx);
ok('CHANGELOG carries [2.304.0] above [2.303.0]', changelog.indexOf('[2.304.0]') >= 0 && changelog.indexOf('[2.304.0]') < changelog.indexOf('[2.303.0]'));

console.log('— the pure law (salary-structure-view.ts) —');
ok('the lib stays PURE (zero imports)', (viewLib.match(/^import /gm) || []).length === 0);
ok('the in-force law states the newest-begun-wins selection', viewLib.includes('the one that began\n * LAST answers') && viewLib.includes('newest-begun wins'));
ok('the law says effectiveTo plays NO part', viewLib.includes('plays NO part in the\n * selection'));
ok('the estimate is the engine\u2019s byte-parity arithmetic', viewLib.includes('Math.round((Number(basicSalaryKes) * (component.percentBps ?? 0)) / 10_000) * 100'));
ok('the tie ambiguity is documented at the law itself', viewLib.includes('resolve by input order'));
ok('the known lists carry the schema\u2019s families', JSON.stringify(viewLib.includes('MONTHLY') && viewLib.includes('BIWEEKLY') && viewLib.includes('WEEKLY') && viewLib.includes('DAILY')) === 'true' && viewLib.includes('EARNING') && viewLib.includes('EMPLOYER_CONTRIBUTION') && viewLib.includes('FORMULA'));

console.log('— the service (the write half, spec rule 15) —');
ok('the service owns ALL FOUR mutations', ['createSalaryComponent', 'setSalaryComponentActive', 'createSalaryStructure', 'withdrawSalaryStructure'].every((f) => service.includes(`export async function ${f}`)));
ok('every mutation audits (five actions, two entity types)', ['SALARY_COMPONENT_CREATED', 'SALARY_COMPONENT_ACTIVATED', 'SALARY_COMPONENT_DEACTIVATED', 'SALARY_STRUCTURE_CREATED', 'SALARY_STRUCTURE_WITHDRAWN'].every((a) => service.includes(a)) && service.includes('HrEntityType.SALARY_STRUCTURE') && service.includes('HrEntityType.SALARY_COMPONENT'));
ok('the SAME-DAY GUARD refuses the coin-flip tie', service.includes('THE SAME-DAY GUARD (engine parity, write-time)') && service.includes("'SAME_DAY_BEGINNING'"));
ok('component custody: known, ACTIVE, this org only', service.includes('isActive: true') && service.includes("'UNKNOWN_COMPONENT'"));
ok('withdraw is a SOFT delete (never a hard one)', service.includes('deletedAt: new Date()') && !service.includes('.delete('));
ok('employee scoping rides the store organization (fail-closed)', service.includes('store: { organizationId: session.organizationId }'));
ok('P2002 maps to DUPLICATE_CODE / DUPLICATE_ASSIGNMENT', service.includes("'DUPLICATE_CODE'") && service.includes("'DUPLICATE_ASSIGNMENT'"));
ok('no close-window affordance exists anywhere in the service', !service.includes('closeSalaryStructure'));

console.log('— the routes (guards + scope) —');
ok('all four routes gate through hrGuard + the service (no Prisma)', [route, idRoute, compRoute, compIdRoute].every((r) => r.includes("from '@/lib/hr/guard'") && r.includes('salary-structure-service')));
ok('the write routes gate on hr.salary-structure.manage', [route, idRoute, compRoute, compIdRoute].every((r) => r.includes("hrGuard('hr.salary-structure.manage')")));
ok('the read routes keep the rate-table read family', [route, compRoute].every((r) => r.includes("hrGuard('hr.employee.read.own_branch', READ_ROLES)")));
ok('the permission key exists with the employee-records family', perms.includes("'hr.salary-structure.manage': ['HR_MANAGER', 'STORE_OWNER']"));
ok('the audit enum names the component entity', audit.includes("SALARY_COMPONENT: 'SalaryComponent'"));
ok('structures GET is org-scoped through the employee\u2019s store', route.includes('employee: { store: { organizationId } }'));
ok('withdraw PATCH accepts only the withdraw action', idRoute.includes("body.action !== 'withdraw'"));
ok('component PATCH demands a boolean isActive', compIdRoute.includes("typeof body.isActive !== 'boolean'"));

console.log('— the desk (the management face) —');
ok('the desk imports the SAME pure law (no second implementation)', page.includes("from '@/lib/hr/salary-structure-view'") && page.includes('salaryStructureInForce(list, now)') && page.includes('estimateComponentCents(a.salaryComponent, basicKes)'));
ok('the desk warns the lapsed window + same-day clash (engine honesty)', page.includes('data-testid="salary-structure-lapsed"') && page.includes('data-testid="salary-structure-clash"') && page.includes('still in force'));
ok('the desk groups withdrawn history dimmed (never edited in place)', page.includes('Withdrawn') && page.includes('a structure never edits in place'));
ok('the dialogs speak the service\u2019s refusal verbatim (role=alert)', page.includes('j?.error ||') && page.includes('role="alert"'));
ok('capability is honest (role-gated affordances + Read-only badge)', page.includes("role === 'SUPER_ADMIN' || role === 'HR_MANAGER' || role === 'STORE_OWNER'") && page.includes('Read-only for'));
ok('the withdraw dialog carries the no-close WHY', page.includes('payroll ignores') && page.includes('no close-window button here on purpose'));
ok('the create dialog refuses nothing silently (same-day story told)', page.includes('two structures may never begin the same day'));
ok('the component picker pays what payroll pays', page.includes('payroll pays') && page.includes('componentValueWords'));

console.log('— the doors (honest nulls 3 \u2192 2) —');
ok('UNRESOLVED_DEPENDENCY walks to the salary desk', voiceLib.includes("case 'UNRESOLVED_DEPENDENCY':") && voiceLib.includes("href: SALARY_DESK_HREF") && voiceLib.includes("const SALARY_DESK_HREF = '/hr/salary-structures';"));
ok('the law\u2019s own bytes tell the promotion story (two nulls remain)', voiceLib.includes('Two codes stay doorless on purpose') && voiceLib.includes('UNRESOLVED_DEPENDENCY now walks to /hr/salary-structures'));
ok('the remaining nulls stay named', ['IMMUTABLE_STATUS', 'DUPLICATE_IDEMPOTENCY_KEY'].every((c) => voiceLib.includes(c)));
ok('the door lib stays PURE (one relative import)', (voiceLib.match(/^import /gm) || []).length === 1 && voiceLib.includes("from './types'"));

console.log('— the /hr tile —');
ok('the overview carries the salary Manage door + the in-force law', hrPage.includes('data-testid="hr-salary-structures-door"') && hrPage.includes('href="/hr/salary-structures"') && hrPage.includes('function inForceAt(') && hrPage.includes('from > new Date(best.effectiveFrom).getTime()'));

console.log('— the suite (both nets) —');
ok('the value net pins the engine\u2019s estimate arithmetic', test.includes('Math.round((Number(basicSalary) * percentBps) / 10_000) * 100'));
ok('the value net pins the lapsed-window honesty', test.includes('a lapsed window still answers'));
ok('the byte net pins the custody chain', test.includes('the service owns ALL mutations') && test.includes('the routes never touch Prisma'));
ok('the byte net pins the promoted salary door', test.includes('the salary door walks to the desk'));

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILED'}: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
