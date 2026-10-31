#!/usr/bin/env node
// verify-v2-301-0.mjs — the round's gate (v2.301.0 "The issue rows find their voice").
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
const test = read('src/tests/payroll-issue-voice-v301.test.ts');

console.log('— the release face —');
ok('pkg version = 2.301.0 (all three slots)', pkg.version === '2.301.0' && pkg.mbumah?.releaseVersion === '2.301.0' && pkg.mbumah?.baseVersion === '2.301.0');
ok('VERSION = 2.301.0', version === '2.301.0');
ok('whats-new lead = 2.301.0 with the round\u2019s title', feed.includes("version: '2.301.0',") && feed.includes('The issue rows find their voice'));
const leadIdx = feed.indexOf("version: '2.301.0',");
const prevIdx = feed.indexOf("version: '2.300.0',");
ok('whats-new pair order (lead 2.301.0 before pair 2.300.0)', leadIdx > -1 && prevIdx > leadIdx);
ok('CHANGELOG wears [2.301.0]', changelog.includes('## [2.301.0] The issue rows find their voice'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-301-0'] === 'node scripts/verify-v2-301-0.mjs' && pkg.scripts['verify:v2-300-0'] === 'node scripts/verify-v2-300-0.mjs');

console.log('— the second caller (feature \u2465) —');
const codes = (typesLib.match(/export const GUARDRAIL_CODES = \[([\s\S]*?)\] as const/) || [])[1] || '';
const codeNames = [...codes.matchAll(/'([A-Z_]+)'/g)].map((m) => m[1]);
ok('the engine still speaks every code (fixture intact)', codeNames.length >= 12 && codeNames.includes('MISSING_CONSENT'));
ok('the issue voice looks up BY THE CODE FIELD', voiceLib.includes('export function payrollGuardrailIssueVoice(code: string, message: string): string') && voiceLib.includes('if (!(GUARDRAIL_CODES as readonly string[]).includes(code)) return message;'));
ok('the voice map is still TOTAL (an entry per engine code)', codeNames.every((c) => new RegExp(`^  ${c}:$`, 'm').test(voiceLib)));
ok('the toast voice law is untouched (first caller intact)', voiceLib.includes('export function payrollGuardrailVoice(raw: string): string') && voiceLib.includes('return detail ? `${voice} (${detail})` : voice;'));
ok('the voice lib stays PURE (one import, no Prisma/React/network)', (voiceLib.match(/^import /gm) || []).length === 1 && voiceLib.includes("from './types'") && !/@prisma|react|fetch\(|axios/.test(voiceLib));

console.log('— the shared row + both mouths —');
ok('PayrollIssueRow exists with the severity hook', row.includes('export function PayrollIssueRow') && row.includes('data-testid="payroll-issue-row"') && row.includes('data-severity={face.severity}'));
ok('the face map is total over the guardrail codes', codeNames.every((c) => row.includes(`${c}:`)));
ok('unknown codes get the honest help face (never dressed up)', row.includes('PAYROLL_ISSUE_FACES[code] ?? HELP_FACE') && row.includes('CircleHelp'));
ok('the row speaks the code-keyed voice, badge keeps the machine code', row.includes('payrollGuardrailIssueVoice(issue.code, issue.message)') && row.includes('{issue.code}'));
ok('the run dialog renders the SHARED row', dialog.includes("import { PayrollIssueRow } from '@/components/hr/payroll-issue-row';") && dialog.includes('<PayrollIssueRow key={`${issue.code}-${i}`} issue={issue} />'));
ok('the /hr/payroll gate card renders the SAME row', hrPage.includes("import { PayrollIssueRow } from '@/components/hr/payroll-issue-row';") && hrPage.includes('<PayrollIssueRow key={`${issue.code}-${i}`} issue={issue} />'));
ok('the raw issue.message span is GONE from both mouths', !dialog.includes('{issue.message}') && !hrPage.includes('{issue.message}'));
ok('the row never imports from a page module (no cycle)', !row.includes('hr/payroll/page'));

console.log('— the ping law (style \u2463 + the QA find) —');
const pingFiles = [
  'src/components/floating-home-button.tsx',
  'src/components/offline-indicator.tsx',
  'src/components/layout/offline-indicator.tsx',
  'src/components/pos/checkout-dialog.tsx',
  'src/app/(shell)/tabs/rentals-tab.tsx',
  'src/app/(shell)/tabs/system-health-tab.tsx',
  'src/app/(shell)/tabs/payroll-tab.tsx',
  'src/app/(selfservice)/employees/me/leave/leave-view.tsx',
];
let pingOk = true, pingBad = '';
for (const f of [...pingFiles, 'src/components/hr/payroll-run-dialog.tsx']) {
  const lines = read(f).split('\n').filter((l) => l.includes('animate-ping'));
  if (lines.length === 0) { pingOk = false; pingBad += ` ${f}(none)`; continue; }
  for (const l of lines) if (!l.includes('pointer-events-none')) { pingOk = false; pingBad += ` ${f}`; }
}
ok(`every decorative ping line carries pointer-events-none (${pingFiles.length + 1} files)`, pingOk);
ok('the FAB ring names the bug it fixed', read('src/components/floating-home-button.tsx').includes('stealing clicks'));

console.log('— the yield law (the FAB never stands on a click) —');
const fabSrc = read('src/components/floating-home-button.tsx');
ok('the yield decision is exported and pure', fabSrc.includes('export function fabYieldDecision(hits: Element[], fab: Element): boolean') && fabSrc.includes('if (el === fab || fab.contains(el) || el.contains(fab)) return false;'));
ok('the probe samples center + inset cross', fabSrc.includes('export function fabProbePoints') && fabSrc.includes('if (r.width === 0 || r.height === 0) return [];'));
ok('the FAB watches scroll (captured) + resize + mutations', fabSrc.includes("window.addEventListener('scroll', scheduled, { passive: true, capture: true })") && fabSrc.includes("window.addEventListener('resize', scheduled, { passive: true })") && fabSrc.includes('new MutationObserver(onMutate)'));
ok('the trailing law: mutations inside the window arm a trailing probe', fabSrc.includes('trailingTimer = setTimeout(') && fabSrc.includes('if (trailingTimer) clearTimeout(trailingTimer);'));
ok('a yielded FAB drops pointer events, tab order and aria', fabSrc.includes("yielded ? 'opacity-0 pointer-events-none' : 'opacity-100'") && fabSrc.includes('tabIndex={yielded ? -1 : 0}') && fabSrc.includes('aria-hidden={yielded || undefined}'));
ok('the POS + dashboard hide law stands (v2.12.1 untouched)', fabSrc.includes("if (activeTab === 'dashboard' || activeTab === 'pos') return null;"));

console.log('— the suite (both nets) —');
ok('the value net pins the gate\u2019s plain-sentence shape', test.includes("'No active data-processing consent on file; payroll blocked.'") && test.includes('has not consented to automated payroll processing'));
ok('the value net pins byte-identity with the toast voice', test.includes('.toBe(') && test.includes('payrollGuardrailVoice(raw)'));
ok('the byte net pins BOTH mouths on the shared row', test.includes("expect(read(HR_PAGE)).toContain('<PayrollIssueRow key={`${issue.code}-${i}`} issue={issue} />')") && test.includes("expect(read(DIALOG)).toContain('<PayrollIssueRow key={`${issue.code}-${i}`} issue={issue} />')"));
ok('the byte net pins the ping law per-line', test.includes('ping line without pointer-events-none'));

console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILED'}: ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
