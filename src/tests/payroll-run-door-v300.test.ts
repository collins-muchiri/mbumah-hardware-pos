// MBUMAH HARDWARE POS - the run finds its door (v2.300.0)
//
// BOTH NETS, per the runtime-pin law:
//   • the VALUE net pins the voice's truth: every guardrail code gets its
//     human sentence + next step, the engine's own detail survives verbatim,
//     unknown codes and plain errors pass through untouched.
//   • the BYTE net pins the wiring: the tab imports the SHARED dialog (never
//     a copy), the door exists for every run (never an empty actions cell),
//     the void fast-path law is untouched, both error mouths speak the voice.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { payrollGuardrailVoice } from '@/lib/hr/payroll/error-voice';
import { GUARDRAIL_CODES } from '@/lib/hr/payroll/types';

const ROOT = process.cwd();
const TAB = 'src/app/(shell)/tabs/payroll-tab.tsx';
const VOICE_LIB = 'src/lib/hr/payroll/error-voice.ts';
const DIALOG = 'src/components/hr/payroll-run-dialog.tsx';
const HR_PAGE = 'src/app/(shell)/hr/payroll/page.tsx';

const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

describe('payrollGuardrailVoice — the value net', () => {
  it('every guardrail code has a voice entry (the map is total)', () => {
    // The lib's own map must name ALL the engine's codes — a new code added
    // to types.ts without a voice fails here, before any user meets it raw.
    const lib = read(VOICE_LIB);
    for (const code of GUARDRAIL_CODES) {
      expect(new RegExp(`^  ${code}:$`, 'm').test(lib)).toBe(true);
    }
  });

  it('RATE_TABLE_MISSING: the found bug speaks a human sentence + next step', () => {
    const out = payrollGuardrailVoice(
      'RATE_TABLE_MISSING: No active PAYE rate table for 2026-10-31.'
    );
    expect(out).toContain('No statutory rate table is active');
    expect(out).toContain('Add or activate the statutory tables');
    // the engine's own detail survives verbatim — the date is a fact
    expect(out).toContain('(No active PAYE rate table for 2026-10-31.)');
    // the raw code never leaks to the user
    expect(out).not.toContain('RATE_TABLE_MISSING');
  });

  it('the detail keeps its exact bytes (never re-punctuated)', () => {
    const detail = 'No active SHIF rate table for 2026-01-15.';
    const out = payrollGuardrailVoice(`IMMUTABLE_STATUS: ${detail}`);
    expect(out.endsWith(`(${detail})`)).toBe(true);
  });

  it('a code with an empty detail speaks the voice alone (no empty parens)', () => {
    const out = payrollGuardrailVoice('MISSING_CONSENT: ');
    expect(out).toBe(
      'An employee has not consented to automated payroll processing. Record the employee\u2019s consent, then prepare again.'
    );
    expect(out).not.toContain('()');
  });

  it('unknown CODE_PREFIX strings pass through untouched', () => {
    const raw = 'TOTALLY_UNKNOWN_CODE: something broke.';
    expect(payrollGuardrailVoice(raw)).toBe(raw);
  });

  it('plain errors (no code prefix) pass through untouched', () => {
    const raw = 'Request failed';
    expect(payrollGuardrailVoice(raw)).toBe(raw);
  });

  it('an empty string stays an empty string', () => {
    expect(payrollGuardrailVoice('')).toBe('');
  });

  it('lowercase lookalikes are not codes (the prefix is exact)', () => {
    const raw = 'rate_table_missing: no table';
    expect(payrollGuardrailVoice(raw)).toBe(raw);
  });
});

describe('the door — the byte net', () => {
  const tab = read(TAB);

  it('the tab imports the SHARED dialog (ONE implementation, never a copy)', () => {
    expect(tab.includes("import { PayrollRunDialog } from '@/components/hr/payroll-run-dialog';")).toBe(true);
    // the shared component remains the ONLY home of the lifecycle face
    const dialog = read(DIALOG);
    expect(dialog.includes('export function PayrollRunDialog')).toBe(true);
  });

  it('the tab imports the ONE voice home', () => {
    expect(tab.includes("import { payrollGuardrailVoice } from '@/lib/hr/payroll/error-voice';")).toBe(true);
  });

  it('the door exists for EVERY run — no status gate around it', () => {
    expect(tab.includes('data-testid="payroll-run-door"')).toBe(true);
    expect(tab.includes('onClick={() => setOpenRunId(r.id)}')).toBe(true);
    // the door button is NOT inside a status conditional: its onClick sits
    // before the void conditional's opening in the same actions cell
    const doorIdx = tab.indexOf('data-testid="payroll-run-door"');
    const voidIdx = tab.indexOf("r.status === 'COMPLETED' || r.status === 'FAILED'");
    expect(doorIdx).toBeGreaterThan(-1);
    expect(voidIdx).toBeGreaterThan(doorIdx);
  });

  it('the door names its promise (title + aria-label)', () => {
    expect(tab.includes('Manage run — prepare, submit, approve, post, lock, disburse')).toBe(true);
    expect(tab.includes('aria-label={`Manage the ${r.runType} pay run for ${r.periodName}`}')).toBe(true);
  });

  it('the dialog is rendered exactly once with the door\u2019s state', () => {
    expect(tab.split('<PayrollRunDialog').length - 1).toBe(1);
    expect(tab.includes('runId={openRunId}')).toBe(true);
    expect(tab.includes('onClose={() => setOpenRunId(null)}')).toBe(true);
  });

  it('onChanged re-reads BOTH the runs and the periods', () => {
    expect(tab.includes("qc.invalidateQueries({ queryKey: ['payroll-runs', storeId] });")).toBe(true);
    expect(tab.includes("qc.invalidateQueries({ queryKey: ['payroll-periods', storeId] });")).toBe(true);
  });

  it('the void fast-path law is untouched (COMPLETED || FAILED only)', () => {
    // the void button keeps its own title — the door did not absorb it
    expect(tab.includes('Void run (only when nothing was paid and nothing was posted)')).toBe(true);
    expect(tab.includes('Pay run voided')).toBe(true);
  });

  it('BOTH error mouths speak the voice (initiate + void)', () => {
    const mouths = tab.match(/onError: \(e: Error\) => toast\.error\(payrollGuardrailVoice\(e\.message\)\)/g) ?? [];
    expect(mouths.length).toBe(2);
    // the two payroll mutations are the mouths: each voice site sits inside
    // the initiate/void mutation bodies (their unique neighbours carry them)
    const initiateIdx = tab.indexOf('Pay run initiated successfully');
    const voidIdx = tab.indexOf('Pay run voided');
    const firstVoice = tab.indexOf('toast.error(payrollGuardrailVoice(e.message))');
    const secondVoice = tab.indexOf('toast.error(payrollGuardrailVoice(e.message))', firstVoice + 1);
    expect(initiateIdx).toBeGreaterThan(-1);
    expect(voidIdx).toBeGreaterThan(-1);
    expect(firstVoice).toBeGreaterThan(-1);
    expect(secondVoice).toBeGreaterThan(firstVoice);
    // the initiate mutation's onError follows its own success toast
    expect(firstVoice).toBeGreaterThan(initiateIdx);
    expect(firstVoice).toBeLessThan(voidIdx);
    expect(secondVoice).toBeGreaterThan(voidIdx);
  });

  it('the /hr/payroll page still opens the same dialog (the second caller stands)', () => {
    const page = read(HR_PAGE);
    expect(page.includes('<PayrollRunDialog')).toBe(true);
  });

  it('the voice lib stays PURE (no Prisma, no React, no network)', () => {
    const lib = read(VOICE_LIB);
    expect(/@prisma|react|fetch\(|axios/.test(lib)).toBe(false);
    // the ONE types import — codes come from the engine's own mouth
    expect(lib.includes("from './types'")).toBe(true);
    expect((lib.match(/^import /gm) ?? []).length).toBe(1);
  });
});
