#!/usr/bin/env node
// verify-v2-300-0.mjs — the round's gate (v2.300.0 "The run finds its door").
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
const tab = read('src/app/(shell)/tabs/payroll-tab.tsx');
const dialog = read('src/components/hr/payroll-run-dialog.tsx');
const hrPage = read('src/app/(shell)/hr/payroll/page.tsx');
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const test = read('src/tests/payroll-run-door-v300.test.ts');

console.log('— the release face —');
ok('pkg version = 2.300.0 (all three slots)', pkg.version === '2.300.0' && pkg.mbumah?.releaseVersion === '2.300.0' && pkg.mbumah?.baseVersion === '2.300.0');
ok('VERSION = 2.300.0', version === '2.300.0');
ok('whats-new lead = 2.300.0 with the round\u2019s title', feed.includes("version: '2.300.0',") && feed.includes('The run finds its door'));
const leadIdx = feed.indexOf("version: '2.300.0',");
const prevIdx = feed.indexOf("version: '2.299.0',");
ok('whats-new pair order (lead 2.300.0 before pair 2.299.0)', leadIdx > -1 && prevIdx > leadIdx);
ok('CHANGELOG wears [2.300.0]', changelog.includes('## [2.300.0] The run finds its door'));
ok('the verify script is wired (previous gates stay)', pkg.scripts['verify:v2-300-0'] === 'node scripts/verify-v2-300-0.mjs' && pkg.scripts['verify:v2-299-0'] === 'node scripts/verify-v2-299-0.mjs');

console.log('— the voice (one home) —');
const codes = (typesLib.match(/export const GUARDRAIL_CODES = \[([\s\S]*?)\] as const/) || [])[1] || '';
const codeNames = [...codes.matchAll(/'([A-Z_]+)'/g)].map((m) => m[1]);
ok('the engine still speaks every code (fixture intact)', codeNames.length >= 12 && codeNames.includes('RATE_TABLE_MISSING'));
ok('the voice map is TOTAL (an entry per engine code)', codeNames.every((c) => new RegExp(`^  ${c}:$`, 'm').test(voiceLib)));
ok('the voice keeps the engine\u2019s detail verbatim', voiceLib.includes('return detail ? `${voice} (${detail})` : voice;'));
ok('unknown codes pass through untouched', voiceLib.includes("if (!(GUARDRAIL_CODES as readonly string[]).includes(code)) return raw;"));
ok('no-prefix strings pass through untouched', voiceLib.includes('const m = CODE_PREFIX_RE.exec(raw);') && voiceLib.includes('if (!m) return raw;'));
ok('the voice lib stays PURE (one import, no Prisma/React/network)', (voiceLib.match(/^import /gm) || []).length === 1 && voiceLib.includes("from './types'") && !/@prisma|react|fetch\(|axios/.test(voiceLib));

console.log('— the door (feature \u2465) —');
ok('the tab imports the SHARED dialog, never a copy', tab.includes("import { PayrollRunDialog } from '@/components/hr/payroll-run-dialog';") && dialog.includes('export function PayrollRunDialog'));
ok('the door exists for every run', tab.includes('data-testid="payroll-run-door"') && tab.includes('onClick={() => setOpenRunId(r.id)}'));
ok('the door names its promise', tab.includes('Manage run — prepare, submit, approve, post, lock, disburse') && tab.includes('aria-label={`Manage the ${r.runType} pay run for ${r.periodName}`}'));
ok('the dialog is rendered once with the door\u2019s state', (tab.match(/<PayrollRunDialog/g) || []).length === 1 && tab.includes('runId={openRunId}') && tab.includes('onClose={() => setOpenRunId(null)}'));
ok('onChanged re-reads the runs AND the periods', tab.includes("qc.invalidateQueries({ queryKey: ['payroll-runs', storeId] });") && tab.includes("qc.invalidateQueries({ queryKey: ['payroll-periods', storeId] });"));
ok('the void fast-path law stands', tab.includes("r.status === 'COMPLETED' || r.status === 'FAILED'") && tab.includes('Void run (only when nothing was paid and nothing was posted)'));
ok('the /hr/payroll second caller stands', hrPage.includes('<PayrollRunDialog'));

console.log('— the mouths (style \u2463) —');
ok('BOTH payroll error mouths speak the voice', (tab.match(/toast\.error\(payrollGuardrailVoice\(e\.message\)\)/g) || []).length === 2);

console.log('— the suite (both nets) —');
ok('the found bug\u2019s sentence is pinned by value', test.includes('No statutory rate table is active') && test.includes('(No active PAYE rate table for 2026-10-31.)'));
ok('the passthrough laws are pinned', test.includes("expect(payrollGuardrailVoice('')).toBe('');") && test.includes("const raw = 'TOTALLY_UNKNOWN_CODE: something broke.';"));
ok('the byte wiring is pinned', test.includes('data-testid="payroll-run-door"') && test.includes("import { PayrollRunDialog } from '@/components/hr/payroll-run-dialog';".slice(9)) && test.includes('toast.error(payrollGuardrailVoice(e.message))'));

console.log(`\nverify-v2-300-0: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
