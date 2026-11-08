#!/usr/bin/env node
// verify-v2-305-0.mjs — the round's gate (v2.305.0 "The engine reads the override").
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
const runService = read('src/lib/hr/payroll/run-service.ts');
const page = read('src/app/(shell)/hr/salary-structures/page.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/salary-override-law-v305.test.ts');

console.log('— the release face —');
ok('pkg version = 2.305.0 (all three slots)', pkg.version === '2.305.0' && pkg.mbumah?.releaseVersion === '2.305.0' && pkg.mbumah?.baseVersion === '2.305.0');
ok('VERSION = 2.305.0', version === '2.305.0');
ok('whats-new lead = 2.305.0 with the round\u2019s title', feed.includes("version: '2.305.0',") && feed.includes('The engine reads the override'));
const leadIdx = feed.indexOf("version: '2.305.0',");
ok('the lead entry sits FIRST (newest above all)', leadIdx >= 0 && feed.indexOf('version:') < leadIdx);
ok('CHANGELOG carries [2.305.0] above [2.304.0]', changelog.indexOf('[2.305.0]') >= 0 && changelog.indexOf('[2.305.0]') < changelog.indexOf('[2.304.0]'));

console.log('— the pure law (salary-structure-view.ts) —');
ok('the lib stays PURE (zero imports)', (viewLib.match(/^import /gm) || []).length === 0);
ok('the resolution law exists and takes the override', viewLib.includes('export function resolveComponentCents(') && viewLib.includes('override?: Pick<SalaryComponentOverrideShape'));
ok('the law states the order: override flat first, else catalog', viewLib.includes('const flat = override?.overrideAmountCents ?? component.amountCents;'));
ok('the law states the percent path: override bps, else catalog, KES rounding', viewLib.includes('const bps = override?.overridePercentBps ?? component.percentBps;') && viewLib.includes('Math.round((Number(basicSalaryKes) * (bps ?? 0)) / 10_000) * 100'));
ok('estimateComponentCents stays as the catalog-only special case (ancestor pins)', viewLib.includes('export function estimateComponentCents(') && viewLib.includes('return resolveComponentCents(component, basicSalaryKes);'));
ok('assignmentValueWords speaks resolved + catalog words + the overridden flag', viewLib.includes('export function assignmentValueWords(') && viewLib.includes('catalogWords'));
ok('the basis law is stated: an override never changes the KIND of value that pays', viewLib.includes('changes WHAT KIND of value pays'));

console.log('— the engine (run-service.ts) —');
ok('the engine imports the SHARED law', runService.includes("import { resolveComponentCents } from '../salary-structure-view';"));
ok('the engine passes the ASSIGNMENT to the law', runService.includes('resolveComponentCents(comp, Number(employee.basicSalary), assignment)'));
ok('the inline arithmetic line is GONE', !runService.includes('comp.amountCents ?? Math.round'));

console.log('— the write half (salary-structure-service.ts) —');
ok('the service accepts the components[] override form beside the legacy componentIds', service.includes('components?: CreateStructureComponentInput[]') && service.includes('componentIds?: string[]'));
ok('both forms merge into ONE deduplicated list', service.includes('DUPLICATE_COMPONENT'));
ok('the basis guard refuses a cross-basis override (both directions)', (service.match(/BAD_OVERRIDE_BASIS/g) || []).length >= 2);
ok('the basis refusal names its law', (service.match(/never the kind of value that pays/g) || []).length >= 2);
ok('the cents/bps guards mirror the catalog\u2019s own', service.includes('BAD_OVERRIDE_AMOUNT') && service.includes('BAD_OVERRIDE_PERCENT'));
ok('the created assignments carry the override fields', service.includes('overrideAmountCents: e.overrideAmountCents') && service.includes('overridePercentBps: e.overridePercentBps'));
ok('the audit row records overrideCount', service.includes('overrideCount:'));

console.log('— the desk (page.tsx, mandatory 4) —');
ok('the picker grows override inputs on BOTH bases', page.includes('data-override-basis="flat"') && page.includes('data-override-basis="percent"'));
ok('the override inputs carry the amber face + mono numerals', page.includes('border-amber-300 font-mono text-xs tabular-nums'));
ok('picked rows wear the emerald accent', page.includes("border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"));
ok('the desk refuses an invalid override client-side (never silently dropped)', page.includes('must be a non-negative amount (KES)') && page.includes('between 0 and 10,000'));
ok('the desk submits the components[] form', page.includes('components: componentEntries') && !page.includes('componentIds: picked'));
ok('structure badges speak the RESOLVED value', page.includes('assignmentValueWords(a.salaryComponent, a)'));
ok('the amber override chip names the catalog default it beat', page.includes('data-testid="salary-override-badge"') && page.includes('the catalog default ('));
ok('the in-force estimate passes the assignment to the shared law', page.includes('resolveComponentCents(a.salaryComponent, basicKes, a)'));
ok('the in-force line counts and names its overrides', page.includes('data-testid="salary-inforce-estimate"') && page.includes('Per-employee override(s) included:'));

console.log('— the suite (both nets) —');
ok('the value net pins the KES-rounding divergence case', test.includes('123_456.789'));
ok('the value net pins zero-as-a-value', test.includes('overrideAmountCents: 0'));
ok('the byte net pins the engine custody', test.includes("import { resolveComponentCents } from '../salary-structure-view';"));
ok('the byte net pins the inline line\u2019s absence', test.includes("not.toContain('comp.amountCents ?? Math.round')"));

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILED'}: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
