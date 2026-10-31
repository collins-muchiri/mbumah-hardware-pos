// MBUMAH HARDWARE POS - the issue rows carry their doors (v2.302.0)
//
// BOTH NETS, per the runtime-pin law:
//     (v2.303.0 RE-ANCHORED: the rate-table keeper shipped, so the two
//     rate-table nulls were PROMOTED to doors — a null is a promise to build
//     the surface, and the promise was kept.) The value net pins
//     `payrollIssueDoor`'s truth: `payrollIssueDoor` keys off
//     the same code field the voice reads, deep-links the employee the row
//     speaks for when the fix is employee-keyed, falls back to the plain
//     desk when no id rides along, treats a blank id as absent (the door
//     never builds a half link), and returns null for the three documented
//     honest nulls + every unknown code (a door to a surface that cannot
//     perform the fix is a lie with a link on it).
//   • the BYTE net pins the wiring: BOTH issue mouths (the run dialog's
//     "Blocked employees" panel AND the /hr/payroll gate card) still render
//     the SHARED PayrollIssueRow, the row calls the door with the issue's
//     own code + employeeId, the anchor carries the new-tab safety pair +
//     the data hooks, the face map's door tints carry a visible focus ring
//     per family, and the client shapes SAY employeeId so the field that
//     always rode the server payloads can reach the door.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { payrollIssueDoor } from '@/lib/hr/payroll/error-voice';
import { GUARDRAIL_CODES } from '@/lib/hr/payroll/types';
import {
  PAYROLL_ISSUE_FACES,
  payrollIssueFace,
  type PayrollIssueFace,
} from '@/components/hr/payroll-issue-row';

const ROOT = process.cwd();
const VOICE_LIB = 'src/lib/hr/payroll/error-voice.ts';
const ROW = 'src/components/hr/payroll-issue-row.tsx';
const DIALOG = 'src/components/hr/payroll-run-dialog.tsx';
const HR_PAGE = 'src/app/(shell)/hr/payroll/page.tsx';

const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

/** The value net's narrowing helper: a null door IS the assertion failure —
 * no non-null assertions needed (the lint law keeps the baseline exact). */
function must(door: ReturnType<typeof payrollIssueDoor>) {
  if (!door) throw new Error('expected a door, got null (the honest absence)');
  return door;
}

describe('payrollIssueDoor — the value net', () => {
  it('MISSING_CONSENT walks to the consent ledger (v2.135.0\u2019s precedented door)', () => {
    const door = payrollIssueDoor('MISSING_CONSENT', 'emp-1');
    expect(door).not.toBeNull();
    expect(must(door).href).toBe('/hr/reports?tab=privacy');
    expect(must(door).label).toBe('Consent ledger');
    expect(must(door).title).toContain('consent ledger');
  });

  it('TIMESHEET_NOT_APPROVED deep-links the employee the row speaks for', () => {
    const door = payrollIssueDoor('TIMESHEET_NOT_APPROVED', 'emp-42');
    expect(door).not.toBeNull();
    expect(must(door).href).toBe('/hr/timesheets?employee=emp-42');
    expect(must(door).label).toBe('Timesheet desk');
  });

  it('TIMESHEET_NOT_APPROVED falls back to the plain desk without an id', () => {
    const door = payrollIssueDoor('TIMESHEET_NOT_APPROVED');
    expect(door).not.toBeNull();
    expect(must(door).href).toBe('/hr/timesheets');
    expect(must(door).href).not.toContain('employee=');
  });

  it('NEGATIVE_NET walks to the employee record — and only with an id', () => {
    const withId = payrollIssueDoor('NEGATIVE_NET', 'emp-7');
    expect(withId).not.toBeNull();
    expect(must(withId).href).toBe('/hr/employees/emp-7');
    expect(must(withId).label).toBe('Employee record');
    expect(payrollIssueDoor('NEGATIVE_NET')).toBeNull();
  });

  it('DEDUCTION_CAP_EXCEEDED shares the employee-record door', () => {
    const withId = payrollIssueDoor('DEDUCTION_CAP_EXCEEDED', 'emp-9');
    expect(withId).not.toBeNull();
    expect(must(withId).href).toBe('/hr/employees/emp-9');
    expect(payrollIssueDoor('DEDUCTION_CAP_EXCEEDED')).toBeNull();
  });

  it('PERIOD_MISMATCH walks to the timesheet desk (dates vs period)', () => {
    const door = payrollIssueDoor('PERIOD_MISMATCH', 'emp-1');
    expect(door).not.toBeNull();
    expect(must(door).href).toBe('/hr/timesheets');
    expect(must(door).label).toBe('Timesheet desk');
  });

  it('MISSING_CHART_ACCOUNT walks to the Financial tab\u2019s accounts CRUD', () => {
    const door = payrollIssueDoor('MISSING_CHART_ACCOUNT');
    expect(door).not.toBeNull();
    expect(must(door).href).toBe('/?tab=financial');
    expect(must(door).label).toBe('Chart of accounts');
  });

  it('JOURNAL_IMBALANCE walks to the Financial tab\u2019s journal entries', () => {
    const door = payrollIssueDoor('JOURNAL_IMBALANCE');
    expect(door).not.toBeNull();
    expect(must(door).href).toBe('/?tab=financial');
    expect(must(door).label).toBe('Journal entries');
  });

  it('the three honest nulls stay doorless — each for its documented reason', () => {
    // v2.303.0: RATE_TABLE_MISSING / OVERLAPPING_RATE_TABLES were PROMOTED to
    // doors when the rate-table keeper shipped — a null is a promise to build
    // the surface, and the promise was kept. The remaining nulls: salary
    // structures have no management UI; the lifecycle is in place; the
    // duplicate's destination already exists.
    expect(payrollIssueDoor('UNRESOLVED_DEPENDENCY', 'emp-1')).toBeNull();
    expect(payrollIssueDoor('IMMUTABLE_STATUS', 'emp-1')).toBeNull();
    expect(payrollIssueDoor('DUPLICATE_IDEMPOTENCY_KEY', 'emp-1')).toBeNull();
  });

  it('the promoted rate-table doors walk to the keeper (v2.303.0)', () => {
    for (const code of ['RATE_TABLE_MISSING', 'OVERLAPPING_RATE_TABLES'] as const) {
      const door = payrollIssueDoor(code, 'emp-1');
      expect(door).not.toBeNull();
      expect(must(door).href).toBe('/hr/rate-tables');
      expect(must(door).label).toBe('Rate tables');
    }
  });

  it('an unknown code returns null — the door never guesses where a fix lives', () => {
    expect(payrollIssueDoor('SOME_FUTURE_CODE', 'emp-1')).toBeNull();
    expect(payrollIssueDoor('', 'emp-1')).toBeNull();
  });

  it('a blank or whitespace id counts as absent — no half links', () => {
    expect(payrollIssueDoor('NEGATIVE_NET', '')).toBeNull();
    expect(payrollIssueDoor('NEGATIVE_NET', '   ')).toBeNull();
    const fallback = payrollIssueDoor('TIMESHEET_NOT_APPROVED', '  ');
    expect(fallback).not.toBeNull();
    expect(must(fallback).href).toBe('/hr/timesheets');
  });

  it('a whitespace-padded id is trimmed before the deep link is built', () => {
    expect(must(payrollIssueDoor('TIMESHEET_NOT_APPROVED', ' emp-42 ')).href).toBe(
      '/hr/timesheets?employee=emp-42'
    );
  });

  it('an id with query-hostile characters is URL-encoded', () => {
    const door = payrollIssueDoor('TIMESHEET_NOT_APPROVED', 'emp?x=1&y=2');
    expect(must(door).href).toBe('/hr/timesheets?employee=emp%3Fx%3D1%26y%3D2');
  });

  it('the door decision is TOTAL over every guardrail code — no throw, door or null', () => {
    for (const code of GUARDRAIL_CODES) {
      expect(() => payrollIssueDoor(code, 'emp-1')).not.toThrow();
      const door = payrollIssueDoor(code, 'emp-1');
      if (door !== null) {
        expect(door.href).toMatch(/^\//);
        expect(door.label.length).toBeGreaterThan(0);
        expect(door.title.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('payrollIssueDoor — the purity law', () => {
  it('the door lib stays pure: no React, no Prisma, no network in error-voice.ts', () => {
    const src = read(VOICE_LIB);
    const imports = src
      .split('\n')
      .filter((l) => l.trim().startsWith('import '))
      .join('\n');
    // The lib's ONLY import is its sibling types module — a relative one,
    // which is itself a purity signal (no framework, no client surface).
    expect(imports).toContain("from './types'");
    expect(imports).not.toMatch(/react/i);
    expect(imports).not.toMatch(/prisma|@prisma/i);
    expect(imports).not.toMatch(/fetch|axios|node-fetch/i);
  });
});

describe('PayrollIssueRow — the byte net', () => {
  it('the row calls the door with the issue\u2019s own code + employeeId', () => {
    const src = read(ROW);
    expect(src).toContain('payrollIssueDoor(issue.code, issue.employeeId)');
  });

  it('the door anchor carries the new-tab safety pair and the data hooks', () => {
    const src = read(ROW);
    expect(src).toContain('target="_blank"');
    expect(src).toContain('rel="noopener noreferrer"');
    expect(src).toContain('data-testid="payroll-issue-door"');
    expect(src).toContain('data-door-href={door.href}');
    expect(src).toContain('{door.label}');
    expect(src).toContain('<ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden />');
  });

  it('a doorless row renders nothing extra — null is honest absence', () => {
    // The door anchor lives inside a conditional on the door itself; there
    // is no disabled stub, no placeholder span.
    const src = read(ROW);
    expect(src).toContain('{door ? (');
    expect(src).not.toMatch(/door.*disabled/i);
  });

  it('every face carries a family-tinted door with a visible focus ring', () => {
    for (const [, face] of Object.entries(PAYROLL_ISSUE_FACES) as [string, PayrollIssueFace][]) {
      expect(face.doorTint).toContain('focus-visible:ring-');
      expect(face.doorTint).toContain('hover:ring-1');
      expect(face.doorTint).toContain('dark:');
    }
    // The unknown-code help face owns its tint too (slate family).
    expect(payrollIssueFace('SOME_FUTURE_CODE').doorTint).toContain('slate');
  });

  it('the shape says employeeId so the server field can reach the door', () => {
    const rowSrc = read(ROW);
    expect(rowSrc).toMatch(/employeeId\?: string/);
    const pageSrc = read(HR_PAGE);
    // The page's ApiIssue carries it between employeeName and code.
    expect(pageSrc).toMatch(/export interface ApiIssue \{[\s\S]*?employeeId\?: string[\s\S]*?\}/);
  });

  it('BOTH mouths still render the shared row (no copied rows)', () => {
    const dialog = read(DIALOG);
    const page = read(HR_PAGE);
    expect(dialog).toContain("from '@/components/hr/payroll-issue-row'");
    expect(page).toContain("from '@/components/hr/payroll-issue-row'");
    expect(dialog).toContain('<PayrollIssueRow');
    expect(page).toContain('<PayrollIssueRow');
  });

  it('the row keeps its severity hook and machine badge (no regression)', () => {
    const src = read(ROW);
    expect(src).toContain('data-testid="payroll-issue-row"');
    expect(src).toContain('data-severity={face.severity}');
    expect(src).toContain('font-mono text-[11px]');
  });

  it('the lib documents the honest-null law for the doorless codes', () => {
    const src = read(VOICE_LIB);
    expect(src).toContain('THE HONEST-NULL LAW');
    for (const code of [
      'UNRESOLVED_DEPENDENCY',
      'IMMUTABLE_STATUS',
      'DUPLICATE_IDEMPOTENCY_KEY',
      // The promoted pair stays NAMED in the lib's own bytes — the promotion
      // is part of the law's story now.
      'RATE_TABLE_MISSING',
      'OVERLAPPING_RATE_TABLES',
    ]) {
      expect(src).toContain(code);
    }
  });
});
