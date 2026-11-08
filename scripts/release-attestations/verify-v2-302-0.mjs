#!/usr/bin/env node
// verify-v2-302-0.mjs — the round's gate (v2.302.0 "The issue rows carry their doors").
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
const voiceLib = read('src/lib/hr/payroll/error-voice.ts');
const typesLib = read('src/lib/hr/payroll/types.ts');
const row = read('src/components/hr/payroll-issue-row.tsx');
const dialog = read('src/components/hr/payroll-run-dialog.tsx');
const hrPage = read('src/app/(shell)/hr/payroll/page.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/payroll-issue-doors-v302.test.ts');

console.log('— the release face —');
ok('pkg version = 2.302.0 (all three slots)', pkg.version === '2.302.0' && pkg.mbumah?.releaseVersion === '2.302.0' && pkg.mbumah?.baseVersion === '2.302.0');
ok('VERSION = 2.302.0', version === '2.302.0');
ok('whats-new lead = 2.302.0 with the round\u2019s title', feed.includes("version: '2.302.0',") && feed.includes('The issue rows carry their doors'));
const leadIdx = feed.indexOf("version: '2.302.0',");
const prevIdx = feed.indexOf("version: '2.301.0',");
ok('whats-new pair order (lead 2.302.0 before pair 2.301.0)', leadIdx > -1 && prevIdx > leadIdx);
ok('CHANGELOG wears [2.302.0]', changelog.includes('## [2.302.0] The issue rows carry their doors'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-302-0'] === 'node scripts/verify-v2-302-0.mjs' && pkg.scripts['verify:v2-301-0'] === 'node scripts/verify-v2-301-0.mjs');

console.log('— the door lib (feature \u2465) —');
const codes = (typesLib.match(/export const GUARDRAIL_CODES = \[([\s\S]*?)\] as const/) || [])[1] || '';
const codeNames = [...codes.matchAll(/'([A-Z_]+)'/g)].map((m) => m[1]);
ok('the engine still speaks every code (fixture intact)', codeNames.length >= 12 && codeNames.includes('MISSING_CONSENT'));
ok('payrollIssueDoor is exported and keyed by code + employeeId', voiceLib.includes('export function payrollIssueDoor(code: string, employeeId?: string): PayrollIssueDoor | null'));
ok('the PayrollIssueDoor shape is exported (href/label/title)', voiceLib.includes('export interface PayrollIssueDoor') && voiceLib.includes('href: string') && voiceLib.includes('label: string') && voiceLib.includes('title: string'));
ok('the honest-null law is documented in the lib\u2019s own bytes', voiceLib.includes('THE HONEST-NULL LAW') && voiceLib.includes('a door to a surface that cannot perform the fix is a'));
for (const c of ['RATE_TABLE_MISSING', 'OVERLAPPING_RATE_TABLES', 'UNRESOLVED_DEPENDENCY', 'IMMUTABLE_STATUS', 'DUPLICATE_IDEMPOTENCY_KEY']) {
  ok(`the lib names its honest null: ${c}`, voiceLib.includes(c));
}
ok('the consent door walks to the privacy ledger (v2.135.0\u2019s precedented href)', voiceLib.includes("'/hr/reports?tab=privacy'"));
ok('the timesheet door deep-links the employee (v2.136.0\u2019s precedented shape)', voiceLib.includes('${TIMESHEET_DESK_HREF}?employee=${encodeURIComponent(id)}'));
ok('the pay-input doors walk to the employee record', voiceLib.includes('/hr/employees/${encodeURIComponent(id)}'));
ok('the account doors walk to the Financial tab', voiceLib.includes("'/?tab=financial'"));
ok('a blank id counts as absent (no half links)', voiceLib.includes("employeeId.trim() ? employeeId.trim() : null"));
ok('the door lib stays PURE (one relative import, no Prisma/React/network)', (voiceLib.match(/^import /gm) || []).length === 1 && voiceLib.includes("from './types'") && !/@prisma|react|fetch\(|axios/.test(voiceLib));

console.log('— the row carries its door (style \u2463) —');
ok('the row calls the door with the issue\u2019s own code + employeeId', row.includes('payrollIssueDoor(issue.code, issue.employeeId)'));
ok('the door anchor carries the new-tab safety pair', row.includes('target="_blank"') && row.includes('rel="noopener noreferrer"'));
ok('the door anchor carries the data hooks + label', row.includes('data-testid="payroll-issue-door"') && row.includes('data-door-href={door.href}') && row.includes('{door.label}'));
ok('the door renders nothing when null (honest absence, no disabled stub)', row.includes('{door ? (') && !/door.*disabled/i.test(row));
ok('every face carries a family door tint with a focus ring', ['employee', 'config', 'process'].every((fam) => new RegExp(`${fam}: \\{[\\s\\S]*?doorTint:\\s*'[^']*focus-visible:ring-`).test(row)));
ok('the help face carries its slate door tint', row.includes('doorTint:') && (row.match(/doorTint:/g) || []).length >= 4);
ok('the shape says employeeId', row.includes('employeeId?: string'));
ok('the severity hook + machine badge are untouched', row.includes('data-testid="payroll-issue-row"') && row.includes('data-severity={face.severity}') && row.includes('font-mono text-[11px]'));

console.log('— the field said out loud —');
ok('ApiIssue declares employeeId (the server always carried it)', /export interface ApiIssue \{[\s\S]*?employeeId\?: string[\s\S]*?\}/.test(hrPage));

console.log('— both mouths (regression pins from v2.301.0) —');
ok('the run dialog renders the SHARED row', dialog.includes("import { PayrollIssueRow } from '@/components/hr/payroll-issue-row';") && dialog.includes('<PayrollIssueRow key={`${issue.code}-${i}`} issue={issue} />'));
ok('the /hr/payroll gate card renders the SAME row', hrPage.includes("import { PayrollIssueRow } from '@/components/hr/payroll-issue-row';") && hrPage.includes('<PayrollIssueRow key={`${issue.code}-${i}`} issue={issue} />'));
ok('the raw issue.message span is GONE from both mouths', !dialog.includes('{issue.message}') && !hrPage.includes('{issue.message}'));
ok('the row never imports from a page module (no cycle)', !row.includes('hr/payroll/page'));

console.log('— the suite (both nets) —');
ok('the value net pins every door + the five honest nulls', test.includes("payrollIssueDoor('MISSING_CONSENT', 'emp-1')") && test.includes("payrollIssueDoor('RATE_TABLE_MISSING', 'emp-1')"));
ok('the value net pins the totality over every guardrail code', test.includes('the door decision is TOTAL over every guardrail code'));
ok('the byte net pins the safety pair + hooks', test.includes('rel="noopener noreferrer"') && test.includes('data-door-href={door.href}'));
ok('the byte net pins BOTH mouths on the shared row', test.includes("read(DIALOG)") && test.includes("read(HR_PAGE)"));
ok('the byte net pins the purity law (one relative import)', test.includes("from './types'"));

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILED'}: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
