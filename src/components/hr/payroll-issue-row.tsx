'use client';

// PayrollIssueRow (v2.301.0) - the ONE face for a blocked-employee issue.
//
// WHY THIS COMPONENT EXISTS: v2.300.0 gave payroll guardrail errors a human
// voice (error-voice.ts) but only the toasts spoke it. The per-employee
// issue rows - in the run dialog's "Blocked employees" panel AND the
// /hr/payroll gate card - kept saying the raw engine words. This component
// is the SECOND caller of the voice: every row speaks the human sentence
// with the engine's own detail riding along verbatim, and gains a severity
// face so a manager can tell at a glance WHAT KIND of fix each row needs:
//
// - "employee" rows (rose): the fix happens on the employee record
//   (consent, timesheet approval, negative net inputs);
// - "config" rows (amber): the fix happens in settings/tables/accounts;
// - "process" rows (sky): nothing is wrong with the data - the lifecycle
//   or identity rules just need following.
//
// Presentation only: the face map lives here (NOT in the pure payroll lib),
// unknown codes fall back to the slate help face, and the row is a pure
// function of its `issue` prop (no state, no fetching).

import { Badge } from '@/components/ui/badge';
import {
  CalendarOff,
  CalendarX,
  CircleHelp,
  CopyX,
  FileWarning,
  Landmark,
  Link2,
  Scale,
  ShieldX,
  Table2,
  TrendingDown,
  Lock,
  type LucideIcon,
} from 'lucide-react';
import { payrollGuardrailIssueVoice } from '@/lib/hr/payroll/error-voice';

/** Structurally identical to the page's ApiIssue - declared locally so this
 * component never imports from a page module (no import cycle). */
export interface PayrollIssueShape {
  employeeName?: string;
  code: string;
  message: string;
}

export type PayrollIssueSeverity = 'employee' | 'config' | 'process';

export interface PayrollIssueFace {
  severity: PayrollIssueSeverity;
  icon: LucideIcon;
  /** What kind of fix this row needs - the face's own words. */
  fix: string;
  /** Chip + icon colors per severity family (light/dark). */
  chip: string;
  text: string;
}

/** The severity families. ONE entry per known guardrail code; unknown codes
 * get the slate help face (the voice never guesses, and neither does the face). */
const SEVERITY_FACES: Record<PayrollIssueSeverity, { chip: string; text: string; label: string }> = {
  employee: {
    chip: 'bg-rose-100 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900',
    text: 'text-rose-700 dark:text-rose-300',
    label: 'Employee record fix',
  },
  config: {
    chip: 'bg-amber-100 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
    text: 'text-amber-700 dark:text-amber-300',
    label: 'Settings or table fix',
  },
  process: {
    chip: 'bg-sky-100 dark:bg-sky-950/50 border-sky-200 dark:border-sky-900',
    text: 'text-sky-700 dark:text-sky-300',
    label: 'Lifecycle step needed',
  },
};

export const PAYROLL_ISSUE_FACES: Record<string, PayrollIssueFace> = {
  MISSING_CONSENT: { severity: 'employee', icon: ShieldX, fix: 'Consent', ...SEVERITY_FACES.employee },
  TIMESHEET_NOT_APPROVED: { severity: 'employee', icon: CalendarX, fix: 'Timesheet', ...SEVERITY_FACES.employee },
  NEGATIVE_NET: { severity: 'employee', icon: TrendingDown, fix: 'Pay inputs', ...SEVERITY_FACES.employee },
  PERIOD_MISMATCH: { severity: 'employee', icon: CalendarOff, fix: 'Period data', ...SEVERITY_FACES.employee },
  RATE_TABLE_MISSING: { severity: 'config', icon: Table2, fix: 'Rate tables', ...SEVERITY_FACES.config },
  OVERLAPPING_RATE_TABLES: { severity: 'config', icon: Table2, fix: 'Rate tables', ...SEVERITY_FACES.config },
  DEDUCTION_CAP_EXCEEDED: { severity: 'config', icon: Scale, fix: 'Deduction cap', ...SEVERITY_FACES.config },
  UNRESOLVED_DEPENDENCY: { severity: 'config', icon: Link2, fix: 'Salary structure', ...SEVERITY_FACES.config },
  MISSING_CHART_ACCOUNT: { severity: 'config', icon: Landmark, fix: 'Chart of accounts', ...SEVERITY_FACES.config },
  JOURNAL_IMBALANCE: { severity: 'config', icon: FileWarning, fix: 'Journal mapping', ...SEVERITY_FACES.config },
  IMMUTABLE_STATUS: { severity: 'process', icon: Lock, fix: 'Lifecycle', ...SEVERITY_FACES.process },
  DUPLICATE_IDEMPOTENCY_KEY: { severity: 'process', icon: CopyX, fix: 'Existing run', ...SEVERITY_FACES.process },
};

const HELP_FACE: PayrollIssueFace = {
  severity: 'config',
  icon: CircleHelp,
  fix: 'Review',
  chip: 'bg-slate-100 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800',
  text: 'text-slate-600 dark:text-slate-300',
};

export function payrollIssueFace(code: string): PayrollIssueFace {
  return PAYROLL_ISSUE_FACES[code] ?? HELP_FACE;
}

/** ONE row face for a blocked employee: severity chip + machine-readable
 * code badge + employee + the guardrail voice. The Badge keeps the raw code
 * on purpose - codes are greppable and tests pin them; the sentence next to
 * it is for humans. */
export function PayrollIssueRow({ issue }: { issue: PayrollIssueShape }) {
  const face = payrollIssueFace(issue.code);
  const Icon = face.icon;
  const voice = payrollGuardrailIssueVoice(issue.code, issue.message);
  return (
    <div
      data-testid="payroll-issue-row"
      data-severity={face.severity}
      className="flex flex-wrap items-start gap-2.5 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/40"
    >
      <span
        aria-hidden
        title={SEVERITY_FACES[face.severity].label}
        className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${face.chip} ${face.text}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <Badge variant="outline" className="font-mono text-[11px]">
        {issue.code}
      </Badge>
      <span className="font-medium">{issue.employeeName || 'Employee'}</span>
      <span className="text-muted-foreground">{voice}</span>
    </div>
  );
}
