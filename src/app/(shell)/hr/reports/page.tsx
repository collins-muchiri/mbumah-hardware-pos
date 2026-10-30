'use client';

// MBUMAH HARDWARE POS - /hr/reports (v2.20.0, spec Phase 4.8)
//
// Dense report tables: sticky headers, column visibility toggles, CSV export,
// print-to-PDF, no horizontal scroll on supported viewports, no raw ids.
// Reports are aggregates; per-employee rows carry employeeCode + job title
// only. The Privacy tab governs erasure requests (decision + legal basis).

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertTriangle,
  BarChart3,
  Building2,
  Coins,
  CalendarClock,
  CalendarDays,
  CalendarX2,
  DoorOpen,
  FileDown,
  Stamp,
  Hourglass,
  Landmark,
  History,
  Loader2,
  PenLine,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  FileCheck2,
  Columns3,
  X,
  Bell,
  BellOff,
  BellRing,
  Mail,
  MailX,
} from 'lucide-react';
import { apiGet, apiSend, ErrorNote, StatusBadge, formatDate, formatKes } from '@/components/hr/self-service-ui';
import { buildConsentTimelineCsv, consentTimelineCsvFilename, type ConsentTimelineCsvRow } from '@/lib/hr/consent-timeline-csv';
import { statutoryDueForPeriod, periodMonthForDueDate, toDatetimeLocalValue, filingWasAmended } from '@/lib/hr/compliance-calendar';
import type { StatutoryFilingRow } from '@/lib/hr/statutory-filing';
import { COL_WIDTHS_STORAGE_KEY, EDGE_BAND, loadColWidths, nudgeColWidth } from '@/lib/hr/column-resize';
import { describeSweepOutcome } from '@/lib/hr/sweep-outcome';
import { formatCsvSize } from '@/lib/hr/digest-csv';
import { ReportSchedulesTab } from '@/components/hr/report-schedules-tab';

type Money = number;

// v2.52.0: tab id → schedule report key for the ad-hoc digest CSV export.
// Tabs without a digest (p10 / schedules / portal / privacy) are absent on
// purpose: P10 has its own statutory CSV, Schedules has send-now, Privacy
// has none, and the portal census is a point-in-time roll call (no period
// to schedule a digest of).
const DIGEST_EXPORT_KEYS: Record<string, string> = {
  headcount: 'headcount',
  cost: 'employment-cost',
  absence: 'absence',
  leave: 'leave-utilisation',
  turnover: 'turnover',
  tth: 'time-to-hire',
  statutory: 'statutory-liability',
};

interface Period {
  from: string;
  to: string;
}
interface HeadcountDto extends Period {
  scope: string;
  active: number;
  onLeave: number;
  suspended: number;
  hiresInPeriod: number;
  exitsInPeriod: number;
  avgTenureYears: number;
  byEmploymentType: Array<{ employmentType: string; count: number }>;
  byStore: Array<{ storeName: string; count: number }>;
}
interface EmploymentCostDto extends Period {
  totalGross: Money;
  totalEmployerStatutory: Money;
  totalCost: Money;
  totalNet: Money;
  payslipCount: number;
  monthly: Array<{ month: string; label: string; grossPay: Money; employerStatutory: Money; totalCost: Money; netPay: Money }>;
}
interface AbsenceDto extends Period {
  activeEmployees: number;
  byStatus: Array<{ status: string; days: number }>;
  absentDays: number;
  leaveDays: number;
  approvedLeaveRequestsDays: number;
  absenceRatePct: number;
  leaveRatePct: number;
  availableWorkingDays: number;
}
// v2.35.0: leave entitlement utilisation & liability (mirrors the server DTO;
// rows are employeeCode + job title only — no names, no raw ids).
interface LeaveUtilRow {
  employeeCode: string;
  jobTitle: string;
  employmentType: string;
  storeName: string;
  typeName: string;
  typeCode: string;
  allocated: number;
  carried: number;
  used: number;
  pending: number;
  encashed: number;
  available: number;
  committedPct: number;
  flag: 'OVERDRAWN' | 'EXHAUSTED' | 'LOW' | 'OPEN';
}
interface LeaveUtilDto {
  scope: string;
  year: number;
  years: number[];
  rows: LeaveUtilRow[];
  totals: {
    entitlement: number;
    used: number;
    pending: number;
    available: number;
    committedPct: number;
    overdrawn: number;
    exhausted: number;
    low: number;
    tracked: number;
  };
  byType: Array<{ type: string; code: string; allocated: number; carried: number; used: number; pending: number; available: number; committedPct: number }>;
  byStore: Array<{ store: string; allocated: number; carried: number; used: number; pending: number; available: number }>;
}
// v2.36.0: drill-down correction surface — the one DTO allowed to carry raw
// ids, because it IS the correction path; still scope-guarded server-side
// (fail-closed NOT_FOUND for rows outside the caller's branch).
interface LeaveDrillDownDto {
  scope: string;
  year: number;
  canAdjust: boolean;
  employee: { id: string; code: string; title: string; employmentType: string; storeName: string };
  type: { id: string; name: string; code: string };
  balance: {
    id: string;
    allocated: number;
    carried: number;
    used: number;
    pending: number;
    encashed: number;
    available: number;
    committedPct: number;
    flag: 'OVERDRAWN' | 'EXHAUSTED' | 'LOW' | 'OPEN';
    notes: string | null;
    updatedAt: string;
  };
  history: Array<{
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    workingDays: number;
    halfDay: boolean;
    reason: string | null;
    rejectionReason: string | null;
    createdAt: string;
    approvedAt: string | null;
  }>;
}
interface TurnoverDto extends Period {
  exits: number;
  hires: number;
  activeNow: number;
  annualisedTurnoverPct: number;
  avgTenureAtExitYears: number;
  perStoreExitCounts: Array<{ storeName: string; exits: number }>;
  exitRows: Array<{ employeeCode: string; jobTitle: string; employmentType: string; hireDate: string; terminationDate: string; tenureYears: number }>;
}
interface TimeToHireDto extends Period {
  convertedCount: number;
  medianDaysToHire: number;
  averageDaysToHire: number;
  rows: Array<{ jobTitle: string; appliedOn: string; acceptedOn: string | null; daysToHire: number | null }>;
}
interface StatutoryDto extends Period {
  totals: { paye: Money; nssf: Money; shif: Money; housingLevy: Money; payeArrears: Money; total: Money };
  monthly: Array<{ month: string; label: string; paye: Money; nssf: Money; shif: Money; housingLevy: Money; payeArrears: Money }>;
}
// v2.274.0: the filing clock — DERIVED, not stored. The calendar speaks the
// statute's own deadlines (the 9th-of-the-following-month family) for the
// four monthly obligations the statutory desk already counts; whether a
// past window was actually filed is the ledger's business and this DTO
// never claims it. windowElapsedPct is null when the window has not opened
// — a rail for a window that does not exist would be a guess.
interface CalendarDto {
  asOf: string;
  obligations: Array<{
    kind: string;
    label: string;
    instrument: string;
    dueDay: number;
    periodLabel: string;
    dueDate: string;
    dueLabel: string;
    daysRemaining: number;
    status: 'NOT_YET_OPEN' | 'OPEN' | 'DUE_SOON' | 'DUE_TOMORROW' | 'DUE_TODAY';
    statusWord: string;
    windowElapsedPct: number | null;
    windowWord: string | null;
    weekendNote: string | null;
  }>;
}
interface P10Dto {
  year: number;
  scope: string;
  rows: Array<{ employeeCode: string; employmentType: string; months: number; grossPay: Money; nssf: Money; shif: Money; housingLevy: Money; paye: Money; payeArrears: Money; netPay: Money }>;
  totals: { grossPay: Money; nssf: Money; shif: Money; housingLevy: Money; paye: Money; payeArrears: Money; netPay: Money };
  sourceRuns: number;
}
interface ErasureDto {
  canDecide: boolean;
  requests: Array<{
    id: string;
    employeeCode: string;
    employeeName: string;
    status: string;
    decision: string | null;
    legalBasis: string | null;
    retentionApplies: boolean;
    requestedAt: string;
    executedAt: string | null;
  }>;
}

// v2.119.0: the consent ledger (spec Phase 4.8 acceptance 6) — every
// in-scope employee's data-processing consent state; grant/withdraw decisions
// mirror the erasure decision gate (hr.settings.manage).
interface ConsentDto {
  canDecide: boolean;
  summary: { active: number; withdrawn: number; none: number };
  records: Array<{
    employeeId: string;
    employeeCode: string;
    employeeName: string;
    status: 'ACTIVE' | 'WITHDRAWN' | 'NONE';
    latestPurpose: string | null;
    latestPolicyVersion: string | null;
    grantedAt: string | null;
    withdrawnAt: string | null;
    /** v2.128.0: append-only history depth — rows ≥1 wear the re-granted ×N marker. */
    priorGrants: number;
  }>;
}

// v2.129.0: one employee's append-only consent timeline — the drawer's
// source. Events arrive oldest → newest with stoodDays computed SERVER-side
// (the drawer never reimplements the clock); standing closes the story.
// v2.271.0: the portal adoption report — the roster's quiet bell rolled up
// to report distance. Rows carry the SAME shaped bits the roster wire
// carries (role + active state only); the email never rides the report.
interface PortalAdoptionDto {
  scope: 'ORG' | 'BRANCH';
  total: number;
  linked: number;
  activeLogins: number;
  deactivatedLogins: number;
  unlinked: number;
  byStore: Array<{ storeName: string; total: number; linked: number }>;
  rows: Array<{
    id: string;
    name: string;
    employeeCode: string | null;
    jobTitle: string | null;
    status: string;
    storeName: string;
    portalLinked: boolean;
    portalRole: string | null;
    portalActive: boolean | null;
  }>;
}

interface ConsentHistoryDto {
  employee: { id: string; code: string; name: string };
  events: Array<{
    purpose: string;
    policyVersion: string | null;
    grantedAt: string;
    withdrawnAt: string | null;
    stoodDays: number | null;
    cycle: number;
  }>;
  standing: boolean;
}

// v2.122.0: the retention desk (spec Phase 4.8) — the reviewable retention
// policies folded with their live legal-hold state (what the nightly sweep
// will and will not touch); hold/release decisions mirror the erasure +
// consent decision gate (hr.settings.manage). windowLabel and the v2.123.0
// dry-run sweepLabel are computed server-side so this page never imports the
// service module.
interface RetentionDto {
  canDecide: boolean;
  heldCount: number;
  sweepableTotal: number;
  policies: Array<{
    scope: string;
    description: string;
    windowLabel: string;
    basis: string;
    held: boolean;
    heldAt: string | null;
    sweepable: number;
    sweepLabel: string;
  }>;
}

const YEARS = [new Date().getUTCFullYear(), new Date().getUTCFullYear() - 1, new Date().getUTCFullYear() - 2];


const REPORT_TAB_KEYS = ['headcount', 'cost', 'absence', 'leave', 'turnover', 'tth', 'statutory', 'p10', 'schedules', 'portal', 'privacy'] as const;

/** v2.35.0: flag chip tone for a leave utilisation row. */
function utilFlagTone(flag: LeaveUtilRow['flag']): string {
  switch (flag) {
    case 'OVERDRAWN':
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
    case 'EXHAUSTED':
    case 'LOW':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
    default:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
  }
}

/** v2.35.0: fill tone for the committed-days rail. */
function utilRailTone(committedPct: number): string {
  if (committedPct >= 100) return 'bg-rose-500';
  if (committedPct >= 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

/**
 * v2.274.0: chip tone for the filing clock's window state. The family is
 * the page's own — rose acts now, amber warns, sky informs, and a window
 * that has not opened stays muted (the honest quiet — an unopened window
 * is not an emergency and must never borrow one's colors).
 */
function calendarStatusTone(status: string): string {
  switch (status) {
    case 'DUE_TODAY':
    case 'DUE_TOMORROW':
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
    case 'DUE_SOON':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
    case 'NOT_YET_OPEN':
      return 'border-border bg-muted text-muted-foreground';
    default:
      return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300';
  }
}

/** v2.274.0: fill tone for the window arc — solid, chip-free, same family. */
function calendarFillTone(status: string): string {
  switch (status) {
    case 'DUE_TODAY':
    case 'DUE_TOMORROW':
      return 'bg-rose-500 dark:bg-rose-400';
    case 'DUE_SOON':
      return 'bg-amber-500 dark:bg-amber-400';
    default:
      return 'bg-sky-500 dark:bg-sky-400';
  }
}

/** v2.36.0: chip tone for leave request statuses in the drill-down history. */
function leaveStatusTone(status: string): string {
  switch (status) {
    case 'APPROVED':
    case 'TAKEN':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'PENDING':
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300';
    case 'REJECTED':
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300';
  }
}

/** v2.36.0: compact bordered stat chip used in the drill-down balance card. */
function BalanceChip({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className={`rounded-lg border px-2.5 py-2 ${tone ?? ''}`}>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
      {hint ? <p className="text-[10px] leading-tight text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

// v2.271.0: the reports desk’s pure presentational family hoisted to module level —
// the in-render definitions warned (react-hooks/static-components) on EVERY usage
// across every tab; these four are prop-driven and closure-free, so the hoist is a
// zero-behavior change that retires the warnings at the source.
// v2.131.0: ONE strip family for the whole reports surface — the rose frame
// the Privacy tab earned in v2.130.0, now shared by every report tab, with
// a warning glyph and an in-flight retry. Loads speak here; the shared
// ErrorNote above the tabs stays reserved for actions.
const ReportFailureStrip = ({ testId, copy, retryLabel, onRetry, busy }: { testId: string; copy: string; retryLabel: string; onRetry: () => void; busy?: boolean }) => (
  <div
    data-testid={testId}
    role="status"
    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 dark:border-rose-900 dark:bg-rose-950/40"
  >
    <p className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden /> {copy}
    </p>
    <Button variant="outline" size="sm" onClick={onRetry} disabled={busy} aria-label={retryLabel}>
      {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
      Retry
    </Button>
  </div>
);

// v2.131.0: the honesty stamp — a loaded report says WHEN its numbers were
// fetched (tabular, muted, 24-hour clock). No stamp = not fetched yet.
const formatStamp = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const UpdatedStamp = ({ testId, at }: { testId: string; at: Date | null }) =>
  at ? (
    <p data-testid={testId} className="text-[11px] tabular-nums text-muted-foreground">Updated {formatStamp(at)}</p>
  ) : null;

const Stat = ({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'warn' | 'good' }) => (
  <div className="rounded-xl border bg-card p-3.5 shadow-sm print:shadow-none">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p
      className={`mt-1 text-xl font-bold tabular-nums ${
        tone === 'warn' ? 'text-amber-700 dark:text-amber-400' : tone === 'good' ? 'text-emerald-700 dark:text-emerald-400' : ''
      }`}
    >
      {value}
    </p>
    {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
  </div>
);

export default function HrReportsPage() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [from, setFrom] = useState(() => new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1)).toISOString().slice(0, 10));
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [p10Year, setP10Year] = useState(String(new Date().getUTCFullYear()));
  // v2.21.0: deep-linkable tabs (?tab=cost from the org console tiles). Read
  // window.location on mount (client-only, no Suspense boundary required)
  // and keep the URL in sync so a refreshed tab stays bookmarkable.
  const [tab, setTab] = useState<string>('headcount');
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tab');
    if (requested && (REPORT_TAB_KEYS as readonly string[]).includes(requested)) setTab(requested);
  }, []);
  const changeTab = (next: string) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    window.history.replaceState(null, '', url.toString());
  };

  // v2.23.0: per-branch drill-down (?storeId=... from the org console's
  // "People & payroll by branch" table). ORG-scope callers only — the API
  // rejects narrowing for branch-scoped sessions fail-closed. The chip below
  // the toolbar shows the active branch and clears the filter.
  const [storeId, setStoreId] = useState<string | null>(null);
  // v2.206.0: storeName is now DERIVED, not synced. The old per-storeId
  // effect reset the name with a SYNCHRONOUS setState (a cascading render)
  // on every filter clear, then re-fetched the whole /api/hr/stores list
  // for each picked branch. One fetch fills the id→name map once; the
  // chip's name is a plain lookup, so clearing the filter clears the name
  // by derivation — no reset, no race, no cascading render. A failed
  // lookup leaves the map empty and the chip falls back to the id.
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});
  // v2.27.0: per-schedule deep link (?schedule=<id> from the notification
  // center's "Manage schedule" affordance) - passed down to the Schedules
  // tab, which scrolls to and ring-highlights the matching card.
  const [highlightScheduleId, setHighlightScheduleId] = useState<string | null>(null);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('schedule');
    if (requested) setHighlightScheduleId(requested);
  }, []);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('storeId');
    if (requested) setStoreId(requested);
  }, []);
  useEffect(() => {
    void (async () => {
      try {
        const stores = await apiGet<Array<{ id: string; name: string; code: string | null }>>('/api/hr/stores');
        setStoreNames(Object.fromEntries(stores.map((s) => [s.id, s.name])));
      } catch {
        // the chip speaks the id when the lookup fails — never a wrong name
      }
    })();
  }, []);
  const storeName = storeId ? storeNames[storeId] ?? null : null;
  const changeStoreId = (next: string | null) => {
    setStoreId(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set('storeId', next);
    else url.searchParams.delete('storeId');
    window.history.replaceState(null, '', url.toString());
  };

  const [headcount, setHeadcount] = useState<HeadcountDto | null>(null);
  const [cost, setCost] = useState<EmploymentCostDto | null>(null);
  const [absence, setAbsence] = useState<AbsenceDto | null>(null);
  const [turnover, setTurnover] = useState<TurnoverDto | null>(null);
  const [tth, setTth] = useState<TimeToHireDto | null>(null);
  const [statutory, setStatutory] = useState<StatutoryDto | null>(null);
  // v2.274.0: the filing clock rides its OWN load — it is derived from the
  // server's clock, not the report period, so a period-report failure must
  // never darken it (independent resilience, the loadErasure pattern).
  const [calendar, setCalendar] = useState<CalendarDto | null>(null);
  const [calendarFailed, setCalendarFailed] = useState(false);
  const [calendarBusy, setCalendarBusy] = useState(false);
  // v2.276.0: the filing ledger rides the SAME loader as the clock — one
  // fetch pair, one busy face, one failure strip family (a new loader+effect
  // pair would grow the set-state-in-effect family; folding into the
  // calendar's loader keeps the law exactly). The rows key on
  // `${kind}:${periodMonth}` — the ONE join key the card's chips, the
  // monthly figures' dots, and the dialog's submit all speak.
  const [filings, setFilings] = useState<StatutoryFilingRow[]>([]);
  const [filingsCoverage, setFilingsCoverage] = useState<{ from: string; to: string } | null>(null);
  const [filingFailed, setFilingFailed] = useState(false);
  // the receipt dialog — parameterized by the obligation being filed
  // v2.277.0: the target carries its mode — record (the window's door) or
  // amend (the chip's door). The amend mode prefills the receipt's own
  // truth and the strip speaks the original recording.
  const [filingTarget, setFilingTarget] = useState<{
    kind: string; label: string; periodMonth: string; periodLabel: string;
    amend: boolean; original: { filedAt: string; filedByName: string | null } | null;
  } | null>(null);
  // the correction that would otherwise be silent: a NEW receipt announces
  // itself (the chip appears), an AMENDED one changes nothing the eye can
  // see — this note speaks it until the next correction replaces it.
  const [filingAmendedNote, setFilingAmendedNote] = useState<string | null>(null);
  const [filingFiledAt, setFilingFiledAt] = useState('');
  const [filingRef, setFilingRef] = useState('');
  const [filingNote, setFilingNote] = useState('');
  const [filingBusy, setFilingBusy] = useState(false);
  const [filingError, setFilingError] = useState('');
  const [p10, setP10] = useState<P10Dto | null>(null);
  const [erasure, setErasure] = useState<ErasureDto | null>(null);
  // v2.130.0: the Privacy tab speaks its failures — a failed load renders an
  // honest error strip with a retry, never a Loading-forever spin (the null
  // state means "not yet answered", not "broken").
  const [erasureFailed, setErasureFailed] = useState(false);
  const [consent, setConsent] = useState<ConsentDto | null>(null);
  const [consentFailed, setConsentFailed] = useState(false);
  const [retention, setRetention] = useState<RetentionDto | null>(null);
  const [retentionFailed, setRetentionFailed] = useState(false);
  // v2.131.0: the WHOLE reports surface speaks its failures — every loader
  // that used to catch into the shared null (an eternal skeleton, a generic
  // note above the tabs) now owns an honest per-report strip with a retry,
  // and every success leaves a stamp saying WHEN the numbers were fetched.
  // The shared page-level ErrorNote stays reserved for actions.
  const [aggregateFailed, setAggregateFailed] = useState(false);
  const [aggregateLoadedAt, setAggregateLoadedAt] = useState<Date | null>(null);
  const [p10Failed, setP10Failed] = useState(false);
  const [p10LoadedAt, setP10LoadedAt] = useState<Date | null>(null);
  const [p10Busy, setP10Busy] = useState(false);
  const [leaveFailed, setLeaveFailed] = useState(false);
  const [leaveLoadedAt, setLeaveLoadedAt] = useState<Date | null>(null);
  const [leaveBusy, setLeaveBusy] = useState(false);
  // v2.131.0: the refresh path speaks too — the Privacy tab's three loaders
  // disable + spin their Refresh/Retry buttons while the fetch is in flight,
  // so a slow or dead API can never read as a dead button.
  const [consentBusy, setConsentBusy] = useState(false);
  const [erasureBusy, setErasureBusy] = useState(false);
  const [retentionBusy, setRetentionBusy] = useState(false);
  const [consentLoadedAt, setConsentLoadedAt] = useState<Date | null>(null);
  const [erasureLoadedAt, setErasureLoadedAt] = useState<Date | null>(null);
  const [retentionLoadedAt, setRetentionLoadedAt] = useState<Date | null>(null);
  // v2.271.0: the portal adoption census — loaded with the page (a census is
  // cheap) and RELOADED on the branch drill-down (the storeId chip narrows
  // every report table; this one keeps that law).
  const [portal, setPortal] = useState<PortalAdoptionDto | null>(null);
  const [portalFailed, setPortalFailed] = useState(false);
  const [portalLoadedAt, setPortalLoadedAt] = useState<Date | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  // v2.129.0: the consent timeline drawer — one door, per-employee payload.
  // All four reset on close (the stale-state hygiene: one employee's history
  // must never greet the next open).
  const [historyEmp, setHistoryEmp] = useState<ConsentDto['records'][number] | null>(null);
  const [historyPayload, setHistoryPayload] = useState<ConsentHistoryDto | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  // v2.122.0: release is the destructive direction (the sweep resumes on its
  // next run) — it asks twice; releaseArm holds the scope currently armed.
  const [releaseArm, setReleaseArm] = useState<string | null>(null);
  // v2.124.0: the manual sweep is the dry run's destructive sibling — it asks
  // twice too; sweepArm is card-level (the run covers every scope at once).
  const [sweepArm, setSweepArm] = useState(false);
  const [retentionNote, setRetentionNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [leaveUtil, setLeaveUtil] = useState<LeaveUtilDto | null>(null);
  const [leaveYear, setLeaveYear] = useState(String(new Date().getUTCFullYear()));
  // v2.36.0: drill-down correction surface (balance + history + adjust form).
  const [drill, setDrill] = useState<{ open: boolean; loading: boolean; data: LeaveDrillDownDto | null }>({
    open: false,
    loading: false,
    data: null,
  });
  const [adjustDelta, setAdjustDelta] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustBusy, setAdjustBusy] = useState(false);
  const [adjustError, setAdjustError] = useState('');
  const [adjustResult, setAdjustResult] = useState<{ bell: boolean; email: boolean } | null>(null);

  const [hiddenCols, setHiddenCols] = useState<Record<string, boolean>>({});

  // v2.132.0: resizable columns — the EMS spec Phase 4.8 acceptance's last
  // unsatisfied table affordance (sticky headers, visibility, CSV and print
  // already shipped). Widths live per column key, persist in localStorage,
  // and ride onto every resizable TableHead through head(); the drag itself
  // is DELEGATED to the tabs container (no new DOM, no table-layout flip).
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const [exportAllBusy, setExportAllBusy] = useState(false);
  const [exportAllError, setExportAllError] = useState<string | null>(null);
  const colResize = useRef<{ key: string; startX: number; startW: number } | null>(null);
  const colWidthsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    try {
      const loaded = loadColWidths(window.localStorage.getItem(COL_WIDTHS_STORAGE_KEY));
      setColWidths(loaded);
      colWidthsRef.current = loaded;
    } catch {
      // private mode or blocked storage: the desk renders default widths
    }
  }, []);

  const persistColWidths = useCallback((next: Record<string, number>) => {
    colWidthsRef.current = next;
    try {
      window.localStorage.setItem(COL_WIDTHS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // a blocked store never breaks the drag — the width still applies live
    }
  }, []);
  const [rejectTarget, setRejectTarget] = useState<ErasureDto['requests'][number] | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [rejectBasis, setRejectBasis] = useState('');

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const qs = `from=${new Date(from).toISOString()}&to=${new Date(`${to}T23:59:59.999Z`).toISOString()}${storeId ? `&storeId=${encodeURIComponent(storeId)}` : ''}`;
      const [h, c, a, t, g, s] = await Promise.all([
        apiGet<HeadcountDto>(`/api/hr/reports/headcount?${qs}`),
        apiGet<EmploymentCostDto>(`/api/hr/reports/employment-cost?${qs}`),
        apiGet<AbsenceDto>(`/api/hr/reports/absence?${qs}`),
        apiGet<TurnoverDto>(`/api/hr/reports/turnover?${qs}`),
        apiGet<TimeToHireDto>(`/api/hr/reports/time-to-hire?${qs}`),
        apiGet<StatutoryDto>(`/api/hr/reports/statutory-liability?${qs}`),
      ]);
      setHeadcount(h);
      setCost(c);
      setAbsence(a);
      setTurnover(t);
      setTth(g);
      setStatutory(s);
      setAggregateFailed(false);
      setAggregateLoadedAt(new Date());
    } catch {
      // v2.131.0: speak the failure on the tab itself — all six desks go dark
      // together (they share one Promise.all), and each tab offers the retry.
      setHeadcount(null);
      setCost(null);
      setAbsence(null);
      setTurnover(null);
      setTth(null);
      setStatutory(null);
      setAggregateFailed(true);
    } finally {
      setBusy(false);
    }
  }, [from, to, storeId]);

  const loadP10 = useCallback(async (year: string) => {
    setP10Busy(true);
    try {
      setP10(await apiGet<P10Dto>(`/api/hr/reports/p10?year=${year}`));
      setP10Failed(false);
      setP10LoadedAt(new Date());
    } catch {
      setP10(null);
      setP10Failed(true); // v2.131.0: speak the failure on the tab itself
    } finally {
      setP10Busy(false);
    }
  }, []);

  const loadCalendar = useCallback(async () => {
    // v2.274.0: the busy face paints one microtask late — the yield keeps the
    // first setState out of the effect's synchronous path (the lint family
    // law: the 57-strong set-state-in-effect family must not grow).
    await Promise.resolve();
    setCalendarBusy(true);
    try {
      const cal = await apiGet<CalendarDto>('/api/hr/reports/compliance-calendar');
      setCalendar(cal);
      setCalendarFailed(false);
      // v2.276.0: the ledger rides along — the read window is the calendar's
      // own payroll month back through 24 months (the monthly figures'
      // default year-lookback fits; a row outside the window never claims a
      // receipt or a missing one — the coverage bounds are spoken, not guessed).
      try {
        const period0 = cal.obligations[0] ? periodMonthForDueDate(cal.obligations[0].dueDate) : null;
        const now = new Date();
        const to = period0 ?? `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
        const fromD = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 24, 1));
        const from = `${fromD.getUTCFullYear()}-${String(fromD.getUTCMonth() + 1).padStart(2, '0')}`;
        // apiGet UNWRAPS the envelope (it returns json.data or throws) — the
        // rows ARE the payload, an envelope-shaped read here would quietly
        // read .data off an array and file nothing (caught by E2E, pinned below)
        const rows = await apiGet<StatutoryFilingRow[]>(`/api/hr/reports/compliance-filing?from=${from}&to=${to}`);
        setFilings(rows ?? []);
        setFilingsCoverage({ from, to });
        setFilingFailed(false);
      } catch {
        // the clock still speaks — only the receipts go quiet (the strip says so)
        setFilings([]);
        setFilingFailed(true);
      }
    } catch {
      setCalendar(null);
      setCalendarFailed(true); // the clock speaks its own failure — never a spin forever
    } finally {
      setCalendarBusy(false);
    }
  }, []);

  // ── v2.276.0: the filing ledger's desk helpers ──
  // The ONE join key the card's chips, the monthly figures' dots, and the
  // dialog's submit all speak: `${kind}:${periodMonth}`.
  const filingFor = (kind: string, periodMonth: string | null | undefined): StatutoryFilingRow | null =>
    periodMonth ? filings.find((f) => f.kind === kind && f.periodMonth === periodMonth) ?? null : null;
  // v2.278.0: monthFullyFiled retired — the single all-four check dot grew
  // into the receipt rail (per-obligation dots), whose face no longer needs
  // a separate all-four gate; the rail IS the composition.
  const monthFiledCount = (periodMonth: string): number =>
    ['PAYE', 'NSSF', 'SHIF', 'AHL'].filter((k) => filings.some((f) => f.kind === k && f.periodMonth === periodMonth)).length;
  const monthInCoverage = (periodMonth: string): boolean =>
    Boolean(filingsCoverage && periodMonth >= filingsCoverage.from && periodMonth <= filingsCoverage.to);
  /** v2.277.0: how many of the month's receipts were genuinely amended —
   * the Due cell's title counts corrections the same way it counts receipts. */
  const monthAmendedCount = (periodMonth: string): number =>
    ['PAYE', 'NSSF', 'SHIF', 'AHL'].filter((k) => {
      const f = filingFor(k, periodMonth);
      return f ? filingWasAmended(f) : false;
    }).length;

  /** Open the receipt dialog for one obligation. Without a receipt, the
   * RECORD mode opens — the datetime defaults to now. With the receipt's
   * own row (v2.277.0, the chip's door), the AMEND mode opens — every
   * field prefills from what the ledger already holds, so a correction
   * starts from the truth it corrects, never from a blank. */
  const openFilingDialog = (
    o: CalendarDto['obligations'][number],
    periodMonth: string,
    existing?: StatutoryFilingRow | null,
  ) => {
    setFilingTarget({
      kind: o.kind,
      label: o.label,
      periodMonth,
      periodLabel: o.periodLabel,
      amend: Boolean(existing),
      original: existing ? { filedAt: existing.filedAt, filedByName: existing.filedByName } : null,
    });
    setFilingFiledAt(existing ? toDatetimeLocalValue(existing.filedAt) : toDatetimeLocalValue(new Date()));
    setFilingRef(existing?.reference ?? '');
    setFilingNote(existing?.note ?? '');
    setFilingError('');
  };

  const submitFiling = async () => {
    if (!filingTarget) return;
    setFilingBusy(true);
    setFilingError('');
    try {
      // apiSend UNWRAPS the envelope — the payload IS { filing, amended }
      const res = await apiSend<{ filing: { kind: string }; amended: boolean }>('/api/hr/reports/compliance-filing', 'POST', {
        kind: filingTarget.kind,
        periodMonth: filingTarget.periodMonth,
        filedAt: new Date(filingFiledAt).toISOString(),
        reference: filingRef || null,
        note: filingNote || null,
      });
      if (res?.amended) {
        // the silent difference gets its words: the chip looks the same
        // after a correction — the note is the only face that speaks it
        setFilingAmendedNote(`${filingTarget.label} — ${filingTarget.periodLabel}`);
      }
      setFilingTarget(null);
      await loadCalendar(); // the receipt joins the map — the chip and the dot speak it
    } catch (err) {
      // the route's precise code rides the message; the strip never guesses
      const msg = err instanceof Error ? err.message : 'The filing could not be recorded.';
      setFilingError(msg || 'The filing could not be recorded.');
    } finally {
      setFilingBusy(false);
    }
  };

  const loadErasure = useCallback(async () => {
    setErasureBusy(true);
    try {
      setErasure(await apiGet<ErasureDto>('/api/hr/privacy/erasure-requests'));
      setErasureFailed(false);
      setErasureLoadedAt(new Date());
    } catch {
      setErasure(null);
      setErasureFailed(true); // v2.130.0: speak the failure, offer the retry
    } finally {
      setErasureBusy(false); // v2.131.0: the retry path spins while it runs
    }
  }, []);

  const loadPortal = useCallback(async () => {
    setPortalBusy(true);
    try {
      const qs = storeId ? `?storeId=${encodeURIComponent(storeId)}` : '';
      setPortal(await apiGet<PortalAdoptionDto>(`/api/hr/reports/portal-adoption${qs}`));
      setPortalFailed(false);
      setPortalLoadedAt(new Date());
    } catch {
      setPortal(null);
      setPortalFailed(true); // the failure speaks on the tab, like the rest
    } finally {
      setPortalBusy(false);
    }
  }, [storeId]);

  // v2.272.0: the census carries its copy — the roll call's own audited CSV
  // door. The digest export refuses the census ON PURPOSE (a digest is
  // aggregate-only by construction; the roll call is name-bearing), so the
  // download rides the census's OWN endpoint: the same governed scope the
  // tab answers for, the same shaped bits the table shows (no emails), and
  // the export lands in the audit trail (PORTAL_ADOPTION_EXPORTED,
  // count-only metadata — the names never ride it).
  const [portalCsvBusy, setPortalCsvBusy] = useState(false);
  const [portalCsvNote, setPortalCsvNote] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  const exportPortalCsv = useCallback(async () => {
    if (portalCsvBusy) return;
    setPortalCsvBusy(true);
    setPortalCsvNote(null);
    try {
      const qs = storeId ? `?storeId=${encodeURIComponent(storeId)}` : '';
      const res = await fetch(`/api/hr/reports/portal-adoption/export${qs}`, { credentials: 'include' });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `Export failed (${res.status}).`);
      }
      const blob = await res.blob();
      const match = (res.headers.get('Content-Disposition') ?? '').match(/filename="([^"]+)"/);
      const filename =
        match?.[1] ?? res.headers.get('X-Census-Csv-Filename') ?? 'mbumah-portal-adoption-census.csv';
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
      setPortalCsvNote({
        tone: 'ok',
        text: `Roll call CSV downloaded — ${filename} (${formatCsvSize(blob.size)}). The export is audit logged; the file carries no emails — the same shaped bits the table shows.`,
      });
    } catch (e) {
      setPortalCsvNote({ tone: 'err', text: e instanceof Error ? e.message : 'Export failed.' });
    } finally {
      setPortalCsvBusy(false);
    }
  }, [storeId, portalCsvBusy]);

  // v2.129.0: the timeline door opens — fresh fetch per open, retry reuses
  // the door's employee (openHistory is the single loader).
  const openHistory = useCallback((r: ConsentDto['records'][number]) => {
    setHistoryEmp(r);
    setHistoryPayload(null);
    setHistoryError(null);
    setHistoryLoading(true);
    apiGet<ConsentHistoryDto>(`/api/hr/privacy/consent/${encodeURIComponent(r.employeeId)}/history`)
      .then(setHistoryPayload)
      .catch((e: unknown) => setHistoryError(e instanceof Error ? e.message : 'Failed to load consent history.'))
      .finally(() => setHistoryLoading(false));
  }, []);

  const closeHistory = useCallback(() => {
    setHistoryEmp(null);
    setHistoryPayload(null);
    setHistoryError(null);
    setHistoryLoading(false);
  }, []);

  // v2.130.0: the timeline files its copy — the export-honesty theme's third
  // beat. The CSV carries the LEDGER's own columns (who, when, what purpose,
  // which policy, how long stood) and nothing more: there is no content field
  // on a ConsentRecord and none in the serializer's row type, so an export
  // can never become a back door. Disabled while loading/errored/empty.
  const exportHistoryCsv = useCallback(() => {
    if (!historyPayload || historyPayload.events.length === 0) return;
    const rows: ConsentTimelineCsvRow[] = historyPayload.events.map((ev) => ({
      cycle: ev.cycle,
      grantedAt: ev.grantedAt,
      withdrawnAt: ev.withdrawnAt,
      stoodDays: ev.stoodDays,
      purpose: ev.purpose,
      policyVersion: ev.policyVersion,
      employeeCode: historyPayload.employee.code,
      employeeName: historyPayload.employee.name,
    }));
    const blob = new Blob([buildConsentTimelineCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = consentTimelineCsvFilename(historyPayload.employee.code);
    a.click();
    URL.revokeObjectURL(url);
  }, [historyPayload]);

  // v2.132.0: the branch files itself — the export-honesty theme's fourth
  // beat (case list v2.115 → access ledger v2.118 → one drawer's timeline
  // v2.130 → every timeline in scope). One flat CSV built server-side by the
  // drawer's own serializer; the file carries who, when, and what purpose,
  // and the row type guarantees nothing else exists to carry.
  const exportAllTimelines = useCallback(async () => {
    if (exportAllBusy) return;
    setExportAllBusy(true);
    setExportAllError(null);
    try {
      const res = await fetch('/api/hr/privacy/consent/export', { credentials: 'include' });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `Export failed (${res.status}).`);
      }
      const blob = await res.blob();
      const match = (res.headers.get('Content-Disposition') ?? '').match(/filename="([^"]+)"/);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = match?.[1] ?? 'consent-timelines.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e: unknown) {
      setExportAllError(
        e instanceof Error
          ? `The export could not be built — nothing was downloaded. ${e.message}`
          : 'The export could not be built — nothing was downloaded.',
      );
    } finally {
      setExportAllBusy(false);
    }
  }, [exportAllBusy]);

  // v2.119.0: the consent ledger loads with the Privacy tab.
  const loadConsent = useCallback(async () => {
    setConsentBusy(true);
    try {
      setConsent(await apiGet<ConsentDto>('/api/hr/privacy/consent'));
      setConsentFailed(false);
      setConsentLoadedAt(new Date());
    } catch {
      setConsent(null);
      setConsentFailed(true); // v2.130.0: speak the failure, offer the retry
    } finally {
      setConsentBusy(false); // v2.131.0: the refresh path spins while it runs
    }
  }, []);

  // v2.122.0: the retention desk loads with the Privacy tab.
  const loadRetention = useCallback(async () => {
    setRetentionBusy(true);
    try {
      setRetention(await apiGet<RetentionDto>('/api/hr/privacy/retention'));
      setRetentionFailed(false);
      setRetentionLoadedAt(new Date());
    } catch {
      setRetention(null);
      setRetentionFailed(true); // v2.130.0: speak the failure, offer the retry
    } finally {
      setRetentionBusy(false); // v2.131.0: the retry path spins while it runs
    }
  }, []);

  // v2.35.0: leave balances follow the leave YEAR (calendar year), not the
  // global reporting period — loaded independently so the year picker only
  // refetches this report.
  const loadLeaveUtil = useCallback(async () => {
    setLeaveBusy(true);
    try {
      const qs = `year=${encodeURIComponent(leaveYear)}${storeId ? `&storeId=${encodeURIComponent(storeId)}` : ''}`;
      setLeaveUtil(await apiGet<LeaveUtilDto>(`/api/hr/reports/leave-utilisation?${qs}`));
      setLeaveFailed(false);
      setLeaveLoadedAt(new Date());
    } catch {
      setLeaveUtil(null);
      setLeaveFailed(true); // v2.131.0: speak the failure on the tab itself
    } finally {
      setLeaveBusy(false);
    }
  }, [leaveYear, storeId]);

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    void loadP10(p10Year);
  }, [loadP10, p10Year]);
  useEffect(() => {
    void loadErasure();
  }, [loadErasure]);
  // v2.274.0: the clock loads once per mount — the deadlines are calendar
  // law, not period data; a reload re-reads the server's own now(). The
  // first tick defers a microtask: the effect body itself never touches
  // state (the lint family law — the set-state-in-effect family must not
  // grow), while the fetch keeps its own independent state and failure strip.
  useEffect(() => {
    queueMicrotask(() => void loadCalendar());
  }, [loadCalendar]);
  useEffect(() => {
    void loadConsent();
  }, [loadConsent]);
  useEffect(() => {
    void loadRetention();
  }, [loadRetention]);
  useEffect(() => {
    void loadPortal();
  }, [loadPortal]);
  // v2.36.0: resolve one report row into the governed correction surface.
  const openDrill = useCallback(async (employeeCode: string, typeCode: string) => {
    setDrill({ open: true, loading: true, data: null });
    setAdjustDelta('');
    setAdjustReason('');
    setAdjustError('');
    setAdjustResult(null);
    try {
      const qs = `year=${encodeURIComponent(leaveYear)}&employeeCode=${encodeURIComponent(employeeCode)}&typeCode=${encodeURIComponent(typeCode)}`;
      const data = await apiGet<LeaveDrillDownDto>(`/api/hr/reports/leave-utilisation/drill-down?${qs}`);
      setDrill({ open: true, loading: false, data });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load balance details.');
      setDrill({ open: false, loading: false, data: null });
    }
  }, [leaveYear]);

  const closeDrill = (open: boolean) => {
    setDrill((d) => ({ ...d, open }));
    if (!open) setAdjustError('');
  };

  const submitAdjust = async () => {
    if (!drill.data) return;
    setAdjustBusy(true);
    setAdjustError('');
    try {
      const outcome = await apiSend<{ notified?: { bell: boolean; email: boolean } }>('/api/hr/leave-balances/adjust', 'POST', {
        balanceId: drill.data.balance.id,
        deltaDays: Number(adjustDelta),
        reason: adjustReason,
      });
      setAdjustDelta('');
      setAdjustReason('');
      await loadLeaveUtil();
      await openDrill(drill.data.employee.code, drill.data.type.code);
      // Set AFTER openDrill (which resets form state) so the delivery chips
      // stay visible for the adjustment that was just applied.
      setAdjustResult(outcome?.notified ?? { bell: false, email: false });
    } catch (e) {
      setAdjustError(e instanceof Error ? e.message : 'Adjustment failed.');
    } finally {
      setAdjustBusy(false);
    }
  };

  useEffect(() => {
    void loadLeaveUtil();
  }, [loadLeaveUtil]);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      await loadErasure();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  // v2.122.0: hold/release reports where the action lives (the card's own
  // note — the page-level error sits behind three other cards), refetches
  // the desk, and disarms whatever release was armed.
  const runHold = async (scope: string, held: boolean) => {
    setBusy(true);
    setRetentionNote(null);
    try {
      await apiSend('/api/hr/privacy/legal-hold', 'POST', { scope, held });
      setReleaseArm(null);
      await loadRetention();
      setRetentionNote({
        ok: true,
        text: held
          ? `Hold set — the nightly sweep skips ${scope} until a settings manager releases it.`
          : `Hold released — ${scope}'s expired records are swept again on the next nightly run.`,
      });
    } catch (e) {
      setRetentionNote({ ok: false, text: e instanceof Error ? e.message : 'Hold action failed.' });
    } finally {
      setBusy(false);
    }
  };

  const toggleCol = (key: string) => setHiddenCols((prev) => ({ ...prev, [key]: !prev[key] }));

  // v2.124.0: the manual sweep — the dry run's destructive sibling. Running
  // now (instead of waiting for the nightly cron) asks twice, reports in the
  // card's own note per scope (the pure describeSweepOutcome), and refetches
  // the desk so the counts drop to the honest zero.
  const runSweepNow = async () => {
    setBusy(true);
    setRetentionNote(null);
    try {
      const res = await apiSend<{ results: Array<{ scope: string; held: boolean; anonymised: number }> }>(
        '/api/hr/privacy/retention-sweep',
        'POST',
        {},
      );
      setSweepArm(false);
      await loadRetention();
      setRetentionNote(describeSweepOutcome(res.results));
    } catch (e) {
      setRetentionNote({ ok: false, text: e instanceof Error ? e.message : 'Sweep failed.' });
    } finally {
      setBusy(false);
    }
  };

  // v2.52.0: ad-hoc digest CSV export — the tab the user is LOOKING at, for
  // the period the user has APPLIED, in the exact governed format a scheduled
  // digest email carries. One builder on the server (buildDigestPayload) so
  // the downloaded file can never disagree with the email.
  const [digestBusy, setDigestBusy] = useState(false);
  const [digestNote, setDigestNote] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  const exportDigestCsv = useCallback(async () => {
    const reportKey = DIGEST_EXPORT_KEYS[tab];
    if (!reportKey || digestBusy) return;
    setDigestBusy(true);
    setDigestNote(null);
    try {
      const qs = new URLSearchParams({ report: reportKey });
      if (reportKey === 'leave-utilisation') {
        qs.set('year', leaveYear);
      } else {
        qs.set('from', from);
        qs.set('to', to);
      }
      if (storeId) qs.set('storeId', storeId);
      const res = await fetch(`/api/hr/reports/export?${qs.toString()}`, { credentials: 'include' });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `Export failed (${res.status}).`);
      }
      const blob = await res.blob();
      const match = (res.headers.get('Content-Disposition') ?? '').match(/filename="([^"]+)"/);
      const filename =
        match?.[1] ?? res.headers.get('X-Digest-Csv-Filename') ?? `mbumah-${reportKey}-digest.csv`;
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
      setDigestNote({
        tone: 'ok',
        text: `Digest CSV downloaded — ${filename} (${formatCsvSize(blob.size)}). Same aggregates, labels and scope a scheduled digest email carries.`,
      });
    } catch (e) {
      setDigestNote({ tone: 'err', text: e instanceof Error ? e.message : 'Export failed.' });
    } finally {
      setDigestBusy(false);
    }
  }, [tab, from, to, leaveYear, storeId, digestBusy]);

  // v2.58.0: per-table CSV exports ride the SAME governed server builder the
  // digest emails use (header block, OWASP formula-injection guard, honest
  // filename) — the table section only, so the button delivers the table the
  // user is LOOKING at in the exact shape every other filing file uses. The
  // unguarded client-side builder this replaces had neither the guard nor
  // the header, so a downloaded table could disagree with the email.
  const [tableBusy, setTableBusy] = useState<string | null>(null);

  const exportTableCsv = useCallback(async (reportKey: string) => {
    if (tableBusy) return;
    setTableBusy(reportKey);
    setDigestNote(null);
    try {
      const qs = new URLSearchParams({ report: reportKey, table: '1' });
      if (reportKey === 'leave-utilisation') {
        qs.set('year', leaveYear);
      } else {
        qs.set('from', from);
        qs.set('to', to);
      }
      if (storeId) qs.set('storeId', storeId);
      const res = await fetch(`/api/hr/reports/export?${qs.toString()}`, { credentials: 'include' });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || `Export failed (${res.status}).`);
      }
      const blob = await res.blob();
      const match = (res.headers.get('Content-Disposition') ?? '').match(/filename="([^"]+)"/);
      const filename =
        match?.[1] ?? res.headers.get('X-Digest-Csv-Filename') ?? `mbumah-${reportKey}-table.csv`;
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
      setDigestNote({
        tone: 'ok',
        text: `Table CSV downloaded — ${filename} (${formatCsvSize(blob.size)}). The governed digest format, table section only.`,
      });
    } catch (e) {
      setDigestNote({ tone: 'err', text: e instanceof Error ? e.message : 'Export failed.' });
    } finally {
      setTableBusy(null);
    }
  }, [from, to, leaveYear, storeId, tableBusy]);

  const TableToolbar = ({ columns, exportCsv, busyKey }: { columns: Array<{ key: string; label: string }>; exportCsv: () => void; busyKey?: string }) => (
    <div className="mb-2 flex flex-wrap items-center justify-end gap-2 print:hidden">
      <Select
        value={columns.filter((c) => !hiddenCols[c.key]).length === columns.length ? 'all' : 'custom'}
        onValueChange={(v) => {
          if (v === 'all') setHiddenCols((prev) => ({ ...prev, ...Object.fromEntries(columns.map((c) => [c.key, false])) }));
        }}
      >
        <SelectTrigger className="h-8 w-44" aria-label="Column visibility">
          <Columns3 className="mr-1 h-3.5 w-3.5" aria-hidden /> Columns
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Show all columns</SelectItem>
          {columns.map((c) => (
            <div key={c.key} className="flex items-center gap-2 px-2 py-1.5">
              <Checkbox id={`col-${c.key}`} checked={!hiddenCols[c.key]} onCheckedChange={() => toggleCol(c.key)} />
              <Label htmlFor={`col-${c.key}`} className="cursor-pointer text-xs font-normal">
                {c.label}
              </Label>
            </div>
          ))}
        </SelectContent>
      </Select>
      {/* v2.58.0: the table CSV is the governed digest file (table section) —
          the tooltip says so, the busy state spins while the server builds,
          and the button disables while any table export is in flight. */}
      <Button
        size="sm"
        variant="outline"
        onClick={exportCsv}
        disabled={tableBusy !== null}
        title="Table CSV - the governed digest format (header block, injection guard), table section only"
        aria-label={busyKey && tableBusy === busyKey ? 'Building the table CSV' : 'Download table CSV'}
      >
        <FileSpreadsheet
          className={`h-3.5 w-3.5 ${busyKey && tableBusy === busyKey ? 'animate-pulse' : ''}`}
          aria-hidden
        />
        {busyKey && tableBusy === busyKey ? 'Building…' : 'CSV'}
      </Button>
      <Button size="sm" variant="outline" onClick={() => window.print()}>
        <Printer className="h-3.5 w-3.5" aria-hidden /> Print PDF
      </Button>
    </div>
  );

  const col = (key: string) => (hiddenCols[key] ? 'hidden' : '');

  // v2.132.0: head(key) is the ONE-SPREAD way a TableHead becomes resizable —
  // the key is the delegated handlers' identity, the style is the live width,
  // and the tooltip says the edge is grabbable. A column the user has never
  // dragged renders exactly as before (no width, browser's own layout).
  const head = (key: string) => ({
    'data-resize-key': key,
    style: colWidths[key] ? { width: colWidths[key], minWidth: colWidths[key] } : undefined,
    title: 'Drag the right edge to resize · double-click the edge to reset',
  });

  // The resize lives HERE, delegated once for every table on the desk: a
  // pointerdown within EDGE_BAND of a resizable th's right edge opens the
  // drag (the move/up halves ride window listeners so a drag that leaves the
  // table still lands), double-click on the edge resets that one column,
  // and hovering the band shows col-resize so the affordance is visible.
  const edgeOf = (e: { clientX: number; target: EventTarget | null }) => {
    const th = (e.target as HTMLElement).closest?.('th[data-resize-key]') as HTMLElement | null;
    if (!th) return null;
    const rect = th.getBoundingClientRect();
    if (rect.right - e.clientX > EDGE_BAND) return null;
    const key = th.getAttribute('data-resize-key') ?? '';
    return key ? { key, right: rect.right, width: colWidthsRef.current[key] ?? rect.width } : null;
  };

  const onReportPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const hit = edgeOf(e);
    if (!hit) return;
    e.preventDefault();
    colResize.current = { key: hit.key, startX: e.clientX, startW: hit.width };
  };

  const onReportDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const hit = edgeOf(e);
    if (!hit) return;
    const next = { ...colWidthsRef.current };
    if (!(hit.key in next)) return;
    delete next[hit.key];
    persistColWidths(next);
    setColWidths(next);
  };

  const onReportPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const th = (e.target as HTMLElement).closest?.('th[data-resize-key]') as HTMLElement | null;
    const near = th ? th.getBoundingClientRect().right - e.clientX <= EDGE_BAND : false;
    const wasNear = el.dataset.colCursorNear === '1';
    if (near !== wasNear) {
      el.style.cursor = near ? 'col-resize' : '';
      if (near) el.dataset.colCursorNear = '1';
      else delete el.dataset.colCursorNear;
    }
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const r = colResize.current;
      if (!r) return;
      const next = nudgeColWidth(r.startW, e.clientX - r.startX);
      // the REF is the source of truth during a drag (state only mirrors it)
      // — pointerup persists exactly what the last move produced
      colWidthsRef.current = { ...colWidthsRef.current, [r.key]: next };
      setColWidths(colWidthsRef.current);
    };
    const up = () => {
      if (!colResize.current) return;
      colResize.current = null;
      persistColWidths(colWidthsRef.current);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [persistColWidths]);

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <BarChart3 className="h-6 w-6 text-sky-500" aria-hidden /> HR reports
          </h1>
          <p className="text-sm text-muted-foreground">
            Aggregates only — no names or raw ids. P10 reproduces from stored posted payroll lines, never recomputed.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="rep-from" className="text-xs">From</Label>
            <Input id="rep-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 w-40" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rep-to" className="text-xs">To</Label>
            <Input id="rep-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 w-40" />
          </div>
          <Button size="sm" onClick={() => void load()} disabled={busy}>
            Apply period
          </Button>
          {DIGEST_EXPORT_KEYS[tab] ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => void exportDigestCsv()}
              disabled={digestBusy}
              aria-label={`Download the digest CSV of this report${tab === 'leave' ? ' for the selected leave year' : ' for the applied period'}`}
              title="The governed digest file: header block, summary and table — the same one a scheduled digest email carries"
              className="border-violet-300 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-700 dark:bg-violet-950/30 dark:text-violet-300 dark:hover:bg-violet-900/40 dark:hover:text-violet-200"
            >
              <FileDown className="h-3.5 w-3.5" aria-hidden />
              {digestBusy ? 'Exporting…' : 'Digest CSV'}
            </Button>
          ) : null}
        </div>
      </div>

      {digestNote ? (
        <p
          role="status"
          className={`print:hidden ${
            digestNote.tone === 'ok'
              ? 'text-xs font-medium text-violet-700 dark:text-violet-300'
              : 'text-xs font-medium text-red-600 dark:text-red-400'
          }`}
        >
          {digestNote.text}
        </p>
      ) : null}

      {error ? <ErrorNote message={error} /> : null}

      {/* v2.23.0: active per-branch filter chip (deep-linked from the org
          console drill-down; clears back to the whole organization). */}
      {storeId ? (
        <div className="flex items-center gap-2 print:hidden" role="status">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
            <Building2 className="h-3.5 w-3.5" aria-hidden />
            Branch: {storeName ?? storeId}
            <button
              type="button"
              onClick={() => changeStoreId(null)}
              aria-label="Clear branch filter and show the whole organization"
              className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-sky-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-sky-900/70"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </span>
          <span className="text-xs text-muted-foreground">Report tables are narrowed to this branch (organization scope only).</span>
        </div>
      ) : null}

      <Tabs
        value={tab}
        onValueChange={changeTab}
        className="space-y-4"
        onPointerDown={onReportPointerDown}
        onDoubleClick={onReportDoubleClick}
        onPointerMove={onReportPointerMove}
      >
        <TabsList className="flex-wrap print:hidden">
          <TabsTrigger value="headcount">Headcount</TabsTrigger>
          <TabsTrigger value="cost">Employment cost</TabsTrigger>
          <TabsTrigger value="absence">Absence</TabsTrigger>
          <TabsTrigger value="leave" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-500" aria-hidden /> Leave balances
          </TabsTrigger>
          <TabsTrigger value="turnover">Turnover</TabsTrigger>
          <TabsTrigger value="tth">Time to hire</TabsTrigger>
          <TabsTrigger value="statutory">Statutory</TabsTrigger>
          <TabsTrigger value="p10">P10</TabsTrigger>
          <TabsTrigger value="schedules" className="gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" aria-hidden /> Schedules
          </TabsTrigger>
          <TabsTrigger value="portal" className="gap-1.5">
            <BellRing className="h-3.5 w-3.5 text-emerald-500" aria-hidden /> Portal
          </TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* ── Schedules (v2.22.0) ── */}
        <TabsContent value="schedules" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Repeating email digests of any aggregate report. Computed on the server through the same
            governed scope rules as the interactive tabs — aggregates only, no names, no raw ids.
          </p>
          <ReportSchedulesTab highlightScheduleId={highlightScheduleId} />
        </TabsContent>

        {/* ── Headcount ── */}
        <TabsContent value="headcount" className="space-y-4">
          {!headcount ? (
            aggregateFailed ? (
              <ReportFailureStrip
                testId="hr-reports-headcount-error"
                copy="The headcount desk could not be loaded — the numbers stay dark rather than guess."
                retryLabel="Retry loading the headcount report"
                onRetry={() => void load()}
                busy={busy}
              />
            ) : (
              <Skeleton className="h-40 w-full" />
            )
          ) : (
            <>
              <UpdatedStamp testId="hr-reports-updated-headcount" at={aggregateLoadedAt} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                <Stat label="Active" value={String(headcount.active)} tone="good" />
                <Stat label="On leave" value={String(headcount.onLeave)} />
                <Stat label="Suspended" value={String(headcount.suspended)} tone={headcount.suspended ? 'warn' : undefined} />
                <Stat label="Hires in period" value={String(headcount.hiresInPeriod)} />
                <Stat label="Exits in period" value={String(headcount.exitsInPeriod)} />
                <Stat label="Avg tenure" value={`${headcount.avgTenureYears}y`} />
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">By employment type</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead className="sticky top-0 bg-card">Type</TableHead><TableHead className="sticky top-0 bg-card text-right">Count</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {headcount.byEmploymentType.map((t) => (
                          <TableRow key={t.employmentType}><TableCell>{t.employmentType.toLowerCase()}</TableCell><TableCell className="text-right tabular-nums">{t.count}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">By branch</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead className="sticky top-0 bg-card">Branch</TableHead><TableHead className="sticky top-0 bg-card text-right">Count</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {headcount.byStore.map((s) => (
                          <TableRow key={s.storeName}><TableCell>{s.storeName}</TableCell><TableCell className="text-right tabular-nums">{s.count}</TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Employment cost ── */}
        <TabsContent value="cost" className="space-y-4">
          {!cost ? (
            aggregateFailed ? (
              <ReportFailureStrip
                testId="hr-reports-cost-error"
                copy="The employment-cost desk could not be loaded — the numbers stay dark rather than guess."
                retryLabel="Retry loading the employment cost report"
                onRetry={() => void load()}
                busy={busy}
              />
            ) : (
              <Skeleton className="h-40 w-full" />
            )
          ) : (
            <>
              <UpdatedStamp testId="hr-reports-updated-cost" at={aggregateLoadedAt} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Total gross" value={formatKes(cost.totalGross)} />
                <Stat label="Employer statutory" value={formatKes(cost.totalEmployerStatutory)} hint="NSSF + AHL employer match" />
                <Stat label="Total employment cost" value={formatKes(cost.totalCost)} tone="good" />
                <Stat label="Net paid" value={formatKes(cost.totalNet)} hint={`${cost.payslipCount} payslips`} />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm"><Coins className="h-4 w-4 text-amber-500" aria-hidden /> Monthly cost</CardTitle>
                  <CardDescription>From posted payroll lines; employer match mirrors the engine.</CardDescription>
                </CardHeader>
                <CardContent>
                  <TableToolbar
                    columns={[
                      { key: 'label', label: 'Period' },
                      { key: 'gross', label: 'Gross' },
                      { key: 'er', label: 'Employer' },
                      { key: 'total', label: 'Total' },
                      { key: 'net', label: 'Net' },
                    ]}
                    exportCsv={() => void exportTableCsv('employment-cost')}
                    busyKey='employment-cost'
                  />
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-card">
                        <TableRow>
                          <TableHead {...head('label')}    className={col('label')}>Period</TableHead>
                          <TableHead {...head('gross')}   className={`text-right ${col('gross')}`}>Gross</TableHead>
                          <TableHead {...head('er')}   className={`text-right ${col('er')}`}>Employer statutory</TableHead>
                          <TableHead {...head('total')}   className={`text-right ${col('total')}`}>Total cost</TableHead>
                          <TableHead {...head('net')}   className={`text-right ${col('net')}`}>Net paid</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cost.monthly.map((m) => (
                          <TableRow key={m.month}>
                            <TableCell className={col('label')}>{m.label}</TableCell>
                            <TableCell className={`text-right tabular-nums ${col('gross')}`}>{formatKes(m.grossPay)}</TableCell>
                            <TableCell className={`text-right tabular-nums ${col('er')}`}>{formatKes(m.employerStatutory)}</TableCell>
                            <TableCell className={`text-right font-medium tabular-nums ${col('total')}`}>{formatKes(m.totalCost)}</TableCell>
                            <TableCell className={`text-right tabular-nums ${col('net')}`}>{formatKes(m.netPay)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── Absence ── */}
        <TabsContent value="absence" className="space-y-4">
          {!absence ? (
            aggregateFailed ? (
              <ReportFailureStrip
                testId="hr-reports-absence-error"
                copy="The absence desk could not be loaded — the numbers stay dark rather than guess."
                retryLabel="Retry loading the absence report"
                onRetry={() => void load()}
                busy={busy}
              />
            ) : (
              <Skeleton className="h-40 w-full" />
            )
          ) : (
            <>
              <UpdatedStamp testId="hr-reports-updated-absence" at={aggregateLoadedAt} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <Stat label="Absence rate" value={`${absence.absenceRatePct}%`} tone={absence.absenceRatePct >= 10 ? 'warn' : 'good'} hint="unscheduled, all recorded days" />
                <Stat label="Leave rate" value={`${absence.leaveRatePct}%`} />
                <Stat label="Absent days" value={String(absence.absentDays)} />
                <Stat label="Leave days recorded" value={String(absence.leaveDays)} />
                <Stat label="Approved leave (range)" value={`${absence.approvedLeaveRequestsDays}d`} hint={`${absence.activeEmployees} active employees`} />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm"><CalendarX2 className="h-4 w-4 text-rose-500" aria-hidden /> Recorded days by status</CardTitle>
                </CardHeader>
                <CardContent>
                  <TableToolbar
                    columns={[{ key: 'status', label: 'Status' }, { key: 'days', label: 'Days' }, { key: 'share', label: 'Share' }]}
                    exportCsv={() => void exportTableCsv('absence')}
                    busyKey='absence'
                  />
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead {...head('status')}   className={`sticky top-0 bg-card ${col('status')}`}>Status</TableHead>
                      <TableHead {...head('days')}   className={`sticky top-0 bg-card text-right ${col('days')}`}>Days</TableHead>
                      <TableHead {...head('share')}   className={`sticky top-0 bg-card text-right ${col('share')}`}>Share</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {absence.byStatus.map((s) => (
                        <TableRow key={s.status}>
                          <TableCell className={col('status')}><StatusBadge status={s.status} /></TableCell>
                          <TableCell className={`text-right tabular-nums ${col('days')}`}>{s.days}</TableCell>
                          <TableCell className={`text-right tabular-nums ${col('share')}`}>{shareOf(s.days, absence.byStatus)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── Leave entitlement utilisation (v2.35.0) ── */}
        <TabsContent value="leave" className="space-y-4">
          {!leaveUtil ? (
            leaveFailed ? (
              <ReportFailureStrip
                testId="hr-reports-leave-error"
                copy="The leave balances could not be loaded — the balances stay dark rather than guess."
                retryLabel="Retry loading the leave balances"
                onRetry={() => void loadLeaveUtil()}
                busy={leaveBusy}
              />
            ) : (
              <Skeleton className="h-40 w-full" />
            )
          ) : (
            <>
              <UpdatedStamp testId="hr-reports-updated-leave" at={leaveLoadedAt} />
              <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
                <p className="text-xs text-muted-foreground">
                  Leave year {leaveUtil.year} — balances are year-keyed (calendar year), independent of the reporting period above.
                </p>
                <div className="flex items-center gap-2">
                  <Label htmlFor="leave-year" className="text-xs">Leave year</Label>
                  <Select value={leaveYear} onValueChange={setLeaveYear}>
                    <SelectTrigger id="leave-year" className="h-8 w-28" aria-label="Leave year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveUtil.years.map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <Stat
                  label="Liability days"
                  value={`${leaveUtil.totals.available}d`}
                  tone={leaveUtil.totals.available > 0 ? 'warn' : 'good'}
                  hint="entitlement still available"
                />
                <Stat
                  label="Committed"
                  value={`${leaveUtil.totals.committedPct}%`}
                  tone={leaveUtil.totals.committedPct >= 80 ? 'warn' : 'good'}
                  hint="used + pending vs entitlement"
                />
                <Stat
                  label="Over-drawn"
                  value={String(leaveUtil.totals.overdrawn)}
                  tone={leaveUtil.totals.overdrawn > 0 ? 'warn' : 'good'}
                  hint="balances below zero"
                />
                <Stat label="Pending days" value={`${leaveUtil.totals.pending}d`} hint="awaiting decision" />
                <Stat
                  label="Tracked rows"
                  value={String(leaveUtil.totals.tracked)}
                  hint={`${leaveUtil.totals.exhausted} exhausted · ${leaveUtil.totals.low} low`}
                />
              </div>
              {leaveUtil.byType.length > 0 ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <CalendarDays className="h-4 w-4 text-emerald-500" aria-hidden /> Entitlement by leave type
                    </CardTitle>
                    <CardDescription>Committed share of allocated + carried-forward days.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {leaveUtil.byType.map((t) => {
                      const pool = t.allocated + t.carried;
                      return (
                        <div key={t.code} className="flex items-center gap-3">
                          <div className="w-40 shrink-0 truncate text-xs font-medium" title={t.type}>{t.type}</div>
                          <div
                            className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted"
                            role="img"
                            aria-label={`${t.type}: ${t.committedPct}% committed of ${pool} days`}
                          >
                            <div
                              className={`absolute inset-y-0 left-0 rounded-full ${utilRailTone(t.committedPct)}`}
                              style={{ width: `${Math.min(100, Math.max(0, t.committedPct))}%` }}
                            />
                          </div>
                          <div className="w-56 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                            {t.used + t.pending}d / {pool}d · {t.available}d free
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ) : null}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-emerald-500" aria-hidden /> Per-employee balances
                  </CardTitle>
                  <CardDescription>
                    employeeCode + job title only — no names, no raw ids. Click a row for the year&apos;s request history and balance correction; OVERDRAWN rows need a governed adjustment before further requests can be approved.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TableToolbar
                    columns={[
                      { key: 'code', label: 'Employee' },
                      { key: 'title', label: 'Title' },
                      { key: 'type', label: 'Branch' },
                      { key: 'ltype', label: 'Leave type' },
                      { key: 'alloc', label: 'Allocated' },
                      { key: 'used', label: 'Used' },
                      { key: 'pend', label: 'Pending' },
                      { key: 'avail', label: 'Available' },
                      { key: 'rail', label: 'Committed' },
                      { key: 'flag', label: 'Flag' },
                    ]}
                    exportCsv={() => void exportTableCsv('leave-utilisation')}
                    busyKey='leave-utilisation'
                  />
                  {leaveUtil.rows.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No entitlement balances recorded for {leaveUtil.year} yet — balances appear once leave types are allocated to employees.
                    </p>
                  ) : (
                    <div className="max-h-[520px] overflow-auto">
                      <Table>
                        <TableHeader><TableRow>
                          <TableHead {...head('code')}   className={`sticky top-0 bg-card ${col('code')}`}>Employee</TableHead>
                          <TableHead {...head('title')}   className={`sticky top-0 bg-card ${col('title')}`}>Title</TableHead>
                          <TableHead {...head('type')}   className={`sticky top-0 bg-card ${col('type')}`}>Branch</TableHead>
                          <TableHead {...head('ltype')}   className={`sticky top-0 bg-card ${col('ltype')}`}>Leave type</TableHead>
                          <TableHead {...head('alloc')}   className={`sticky top-0 bg-card text-right ${col('alloc')}`}>Allocated</TableHead>
                          <TableHead {...head('used')}   className={`sticky top-0 bg-card text-right ${col('used')}`}>Used</TableHead>
                          <TableHead {...head('pend')}   className={`sticky top-0 bg-card text-right ${col('pend')}`}>Pending</TableHead>
                          <TableHead {...head('avail')}   className={`sticky top-0 bg-card text-right ${col('avail')}`}>Available</TableHead>
                          <TableHead {...head('rail')}   className={`sticky top-0 bg-card ${col('rail')}`}>Committed</TableHead>
                          <TableHead {...head('flag')}   className={`sticky top-0 bg-card ${col('flag')}`}>Flag</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {leaveUtil.rows.map((r) => (
                            <TableRow
                              key={`${r.employeeCode}-${r.typeCode}`}
                              onClick={() => void openDrill(r.employeeCode, r.typeCode)}
                              className={`cursor-pointer transition-colors hover:bg-emerald-500/[0.06] dark:hover:bg-emerald-400/[0.08] ${
                                r.flag === 'OVERDRAWN'
                                  ? 'bg-rose-500/[0.05] dark:bg-rose-400/[0.07]'
                                  : ''
                              }`}
                              title="View request history & balance correction"
                            >
                              <TableCell className={`font-medium tabular-nums ${col('code')}`}>
                                <span className="inline-flex items-center gap-1">
                                  {r.employeeCode}
                                  <ChevronRight className="h-3 w-3 text-muted-foreground/50" aria-hidden />
                                </span>
                              </TableCell>
                              <TableCell className={`max-w-44 truncate ${col('title')}`} title={r.jobTitle}>{r.jobTitle}</TableCell>
                              <TableCell className={`text-xs text-muted-foreground ${col('type')}`}>{r.storeName}</TableCell>
                              <TableCell className={col('ltype')}>{r.typeName}</TableCell>
                              <TableCell className={`text-right tabular-nums ${col('alloc')}`}>{r.allocated.toFixed(1)}</TableCell>
                              <TableCell className={`text-right tabular-nums ${col('used')}`}>{r.used.toFixed(1)}</TableCell>
                              <TableCell className={`text-right tabular-nums ${col('pend')}`}>{r.pending > 0 ? r.pending.toFixed(1) : '—'}</TableCell>
                              <TableCell className={`text-right font-semibold tabular-nums ${r.available < 0 ? 'text-rose-600 dark:text-rose-400' : ''} ${col('avail')}`}>
                                {r.available.toFixed(1)}
                              </TableCell>
                              <TableCell className={col('rail')}>
                                <div className="flex items-center justify-end gap-2">
                                  <div
                                    className="relative h-1.5 w-20 overflow-hidden rounded-full bg-muted"
                                    role="img"
                                    aria-label={`${r.committedPct}% committed`}
                                  >
                                    <div
                                      className={`absolute inset-y-0 left-0 rounded-full ${utilRailTone(r.committedPct)}`}
                                      style={{ width: `${Math.min(100, Math.max(0, r.committedPct))}%` }}
                                    />
                                  </div>
                                  <span className="w-11 text-right text-xs tabular-nums">{r.committedPct}%</span>
                                </div>
                              </TableCell>
                              <TableCell className={col('flag')}>
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${utilFlagTone(r.flag)}`}>
                                  {r.flag}
                                  <ChevronRight className="h-3 w-3 opacity-60" aria-hidden />
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* v2.36.0: drill-down — balance card + request history + governed correction */}
              <Dialog open={drill.open} onOpenChange={closeDrill}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                  {drill.loading || !drill.data ? (
                    <div className="space-y-3 py-6">
                      <DialogTitle className="sr-only">Leave balance details</DialogTitle>
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  ) : (
                    <>
                      <DialogHeader>
                        <DialogTitle className="flex flex-wrap items-center gap-2 text-base">
                          <CalendarDays className="h-4 w-4 text-emerald-500" aria-hidden />
                          <span className="tabular-nums">{drill.data.employee.code}</span>
                          <span className="text-muted-foreground">·</span>
                          <span>{drill.data.type.name}</span>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${utilFlagTone(drill.data.balance.flag)}`}>
                            {drill.data.balance.flag}
                          </span>
                        </DialogTitle>
                        <DialogDescription>
                          {drill.data.employee.title} · {drill.data.employee.employmentType.toLowerCase()} · {drill.data.employee.storeName} — leave year {drill.data.year}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                        <BalanceChip
                          label="Allocated"
                          value={`${drill.data.balance.allocated.toFixed(1)}d`}
                          hint={drill.data.balance.carried > 0 ? `+${drill.data.balance.carried.toFixed(1)} carried` : undefined}
                        />
                        <BalanceChip label="Used" value={`${drill.data.balance.used.toFixed(1)}d`} />
                        <BalanceChip label="Pending" value={drill.data.balance.pending > 0 ? `${drill.data.balance.pending.toFixed(1)}d` : '—'} />
                        <BalanceChip
                          label="Available"
                          value={`${drill.data.balance.available.toFixed(1)}d`}
                          tone={
                            drill.data.balance.available < 0
                              ? 'border-rose-300 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40'
                              : 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40'
                          }
                        />
                        <BalanceChip label="Encashed" value={drill.data.balance.encashed > 0 ? `${drill.data.balance.encashed.toFixed(1)}d` : '—'} />
                      </div>

                      {drill.data.balance.notes ? (
                        <div className="rounded-lg border bg-muted/40 px-3 py-2">
                          <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                            <ShieldCheck className="h-3 w-3" aria-hidden /> Governance notes
                          </p>
                          <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{drill.data.balance.notes}</p>
                        </div>
                      ) : null}

                      <div className="rounded-lg border">
                        <p className="flex items-center gap-1.5 border-b px-3 py-2 text-xs font-medium">
                          <History className="h-3.5 w-3.5 text-sky-500" aria-hidden />
                          Requests starting in {drill.data.year}
                          <span className="ml-auto text-[11px] font-normal text-muted-foreground">{drill.data.history.length} recorded</span>
                        </p>
                        {drill.data.history.length === 0 ? (
                          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                            No {drill.data.type.name} requests started in {drill.data.year}.
                          </p>
                        ) : (
                          <ul className="max-h-52 divide-y overflow-y-auto">
                            {drill.data.history.map((h) => (
                              <li key={h.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2 text-xs">
                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${leaveStatusTone(h.status)}`}>{h.status}</span>
                                <span className="tabular-nums">{formatDate(h.startDate)} → {formatDate(h.endDate)}</span>
                                <span className="font-medium tabular-nums">{h.workingDays}d{h.halfDay ? ' (½)' : ''}</span>
                                {h.reason ? <span className="w-full truncate text-muted-foreground" title={h.reason}>Reason: {h.reason}</span> : null}
                                {h.rejectionReason ? <span className="w-full truncate text-rose-600 dark:text-rose-400" title={h.rejectionReason}>Rejected: {h.rejectionReason}</span> : null}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {drill.data.canAdjust ? (
                        <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-900 dark:bg-violet-950/20">
                          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium">
                            <ShieldCheck className="h-3.5 w-3.5 text-violet-500" aria-hidden /> Governed balance correction
                          </p>
                          <div className="grid gap-2 sm:grid-cols-[130px_1fr]">
                            <div className="space-y-1">
                              <Label htmlFor="adjust-delta">Days (± 0.5)</Label>
                              <Input
                                id="adjust-delta"
                                type="number"
                                step="0.5"
                                placeholder="e.g. 2 or -1.5"
                                value={adjustDelta}
                                onChange={(e) => setAdjustDelta(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="adjust-reason">Reason (required, audited)</Label>
                              <Textarea
                                id="adjust-reason"
                                rows={2}
                                placeholder="Why is entitlement being corrected?"
                                value={adjustReason}
                                onChange={(e) => setAdjustReason(e.target.value)}
                              />
                            </div>
                          </div>
                          {(() => {
                            const d = Number(adjustDelta);
                            if (!adjustDelta || !Number.isFinite(d)) return null;
                            const newAllocated = Math.round((drill.data.balance.allocated + d) * 10) / 10;
                            const newAvailable = Math.round((newAllocated + drill.data.balance.carried - drill.data.balance.used - drill.data.balance.pending) * 10) / 10;
                            return (
                              <p className={`mt-2 text-xs tabular-nums ${newAvailable < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                Preview: allocated {drill.data.balance.allocated.toFixed(1)}d → <strong>{newAllocated.toFixed(1)}d</strong>, available {drill.data.balance.available.toFixed(1)}d → <strong>{newAvailable.toFixed(1)}d</strong>
                              </p>
                            );
                          })()}
                          {adjustError ? <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">{adjustError}</p> : null}
                          {adjustResult ? (
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                              {adjustResult.bell ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                  <Bell className="h-3 w-3" aria-hidden /> In-app notification sent
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                  <BellOff className="h-3 w-3" aria-hidden /> No portal account — in-app notice skipped
                                </span>
                              )}
                              {adjustResult.email ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                  <Mail className="h-3 w-3" aria-hidden /> Email sent
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                  <MailX className="h-3 w-3" aria-hidden /> Email not delivered
                                </span>
                              )}
                            </div>
                          ) : null}
                          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                            Every adjustment is written to the hash-chained audit trail with your reason, and the employee is notified. Corrections are restricted to HR managers and store owners.
                          </p>
                          <div className="mt-3 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => closeDrill(false)} disabled={adjustBusy}>Close</Button>
                            <Button
                              size="sm"
                              className="bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
                              onClick={() => void submitAdjust()}
                              disabled={adjustBusy || adjustDelta === '' || adjustReason.trim().length < 8}
                            >
                              {adjustBusy ? 'Applying…' : 'Apply adjustment'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                          Balance corrections are restricted to HR managers and store owners — contact them to fix an over-drawn balance.
                        </p>
                      )}
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
        </TabsContent>

        {/* ── Turnover ── */}
        <TabsContent value="turnover" className="space-y-4">
          {!turnover ? (
            aggregateFailed ? (
              <ReportFailureStrip
                testId="hr-reports-turnover-error"
                copy="The turnover desk could not be loaded — the numbers stay dark rather than guess."
                retryLabel="Retry loading the turnover report"
                onRetry={() => void load()}
                busy={busy}
              />
            ) : (
              <Skeleton className="h-40 w-full" />
            )
          ) : (
            <>
              <UpdatedStamp testId="hr-reports-updated-turnover" at={aggregateLoadedAt} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Exits in period" value={String(turnover.exits)} tone={turnover.exits ? 'warn' : 'good'} />
                <Stat label="Hires in period" value={String(turnover.hires)} />
                <Stat label="Annualised turnover" value={`${turnover.annualisedTurnoverPct}%`} />
                <Stat label="Avg tenure at exit" value={`${turnover.avgTenureAtExitYears}y`} />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm"><DoorOpen className="h-4 w-4 text-rose-500" aria-hidden /> Exit register</CardTitle>
                  <CardDescription>employeeCode + job title only — no names, no raw ids.</CardDescription>
                </CardHeader>
                <CardContent>
                  <TableToolbar
                    columns={[
                      { key: 'code', label: 'Code' }, { key: 'title', label: 'Title' }, { key: 'type', label: 'Type' },
                      { key: 'hired', label: 'Hired' }, { key: 'left', label: 'Left' }, { key: 'tenure', label: 'Tenure' },
                    ]}
                    exportCsv={() => void exportTableCsv('turnover')}
                    busyKey='turnover'
                  />
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-card"><TableRow>
                        <TableHead {...head('code')}    className={col('code')}>Code</TableHead>
                        <TableHead {...head('title')}    className={col('title')}>Title</TableHead>
                        <TableHead {...head('type')}    className={col('type')}>Type</TableHead>
                        <TableHead {...head('hired')}    className={col('hired')}>Hired</TableHead>
                        <TableHead {...head('left')}    className={col('left')}>Left</TableHead>
                        <TableHead {...head('tenure')}   className={`text-right ${col('tenure')}`}>Tenure</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {turnover.exitRows.length === 0 ? (
                          <TableRow><TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">No exits in this period.</TableCell></TableRow>
                        ) : (
                          turnover.exitRows.map((r) => (
                            <TableRow key={`${r.employeeCode}-${r.terminationDate}`}>
                              <TableCell className={`font-mono text-xs ${col('code')}`}>{r.employeeCode}</TableCell>
                              <TableCell className={col('title')}>{r.jobTitle}</TableCell>
                              <TableCell className={col('type')}>{r.employmentType.toLowerCase()}</TableCell>
                              <TableCell className={col('hired')}>{formatDate(r.hireDate)}</TableCell>
                              <TableCell className={col('left')}>{formatDate(r.terminationDate)}</TableCell>
                              <TableCell className={`text-right tabular-nums ${col('tenure')}`}>{r.tenureYears}y</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── Time to hire ── */}
        <TabsContent value="tth" className="space-y-4">
          {!tth ? (
            aggregateFailed ? (
              <ReportFailureStrip
                testId="hr-reports-tth-error"
                copy="The time-to-hire desk could not be loaded — the numbers stay dark rather than guess."
                retryLabel="Retry loading the time to hire report"
                onRetry={() => void load()}
                busy={busy}
              />
            ) : (
              <Skeleton className="h-40 w-full" />
            )
          ) : (
            <>
              <UpdatedStamp testId="hr-reports-updated-tth" at={aggregateLoadedAt} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <Stat label="Converted hires" value={String(tth.convertedCount)} tone="good" />
                <Stat label="Median days to hire" value={`${tth.medianDaysToHire}d`} />
                <Stat label="Average days to hire" value={`${tth.averageDaysToHire}d`} />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm"><Hourglass className="h-4 w-4 text-sky-500" aria-hidden /> Pipeline (applied → offer accepted)</CardTitle>
                </CardHeader>
                <CardContent>
                  <TableToolbar
                    columns={[{ key: 'job', label: 'Position' }, { key: 'applied', label: 'Applied' }, { key: 'accepted', label: 'Accepted' }, { key: 'days', label: 'Days' }]}
                    exportCsv={() => void exportTableCsv('time-to-hire')}
                    busyKey='time-to-hire'
                  />
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-card"><TableRow>
                        <TableHead {...head('job')}    className={col('job')}>Position</TableHead>
                        <TableHead {...head('applied')}    className={col('applied')}>Applied</TableHead>
                        <TableHead {...head('accepted')}    className={col('accepted')}>Accepted</TableHead>
                        <TableHead {...head('days')}   className={`text-right ${col('days')}`}>Days</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {tth.rows.length === 0 ? (
                          <TableRow><TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">No converted applicants in this period.</TableCell></TableRow>
                        ) : (
                          tth.rows.map((r, i) => (
                            <TableRow key={`${r.jobTitle}-${i}`}>
                              <TableCell className={col('job')}>{r.jobTitle}</TableCell>
                              <TableCell className={col('applied')}>{formatDate(r.appliedOn)}</TableCell>
                              <TableCell className={col('accepted')}>{r.acceptedOn ? formatDate(r.acceptedOn) : '—'}</TableCell>
                              <TableCell className={`text-right tabular-nums ${col('days')}`}>{r.daysToHire ?? '—'}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── Statutory liability ── */}
        <TabsContent value="statutory" className="space-y-4">
          {!statutory ? (
            aggregateFailed ? (
              <ReportFailureStrip
                testId="hr-reports-statutory-error"
                copy="The statutory desk could not be loaded — the numbers stay dark rather than guess."
                retryLabel="Retry loading the statutory report"
                onRetry={() => void load()}
                busy={busy}
              />
            ) : (
              <Skeleton className="h-40 w-full" />
            )
          ) : (
            <>
              <UpdatedStamp testId="hr-reports-updated-statutory" at={aggregateLoadedAt} />
              {/* v2.274.0: the filing clock — the calendar above the money.
                  The clock is the statute's own; the amounts below are what
                  was charged. Two faces, one desk. */}
              {calendarFailed ? (
                <ReportFailureStrip
                  testId="hr-compliance-calendar-error"
                  copy="The filing calendar could not be loaded — the clock stays dark rather than guess."
                  retryLabel="Retry loading the filing calendar"
                  onRetry={() => void loadCalendar()}
                  busy={calendarBusy}
                />
              ) : !calendar ? (
                <Skeleton className="h-28 w-full" data-testid="hr-compliance-calendar-skeleton" />
              ) : (
                <Card data-testid="hr-compliance-calendar">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <CalendarClock className="h-4 w-4 text-sky-700 dark:text-sky-400" aria-hidden /> Filing calendar
                      <span className="ml-auto text-xs font-normal tabular-nums text-muted-foreground" data-testid="hr-compliance-calendar-asof">
                        as of {new Date(calendar.asOf).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Kenya&apos;s monthly payroll obligations fall due on the 9th of the following month — the clock is the statute&apos;s own, weekends do not extend it.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-border">
                      {calendar.obligations.map((o) => (
                        <div key={o.kind} data-testid={`hr-cal-row-${o.kind.toLowerCase()}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          {/* the calendar page tile — day over month, tabular, quiet border */}
                          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border bg-card" aria-hidden>
                            <span className="text-lg font-semibold leading-none tabular-nums">{o.dueDate.slice(8, 10)}</span>
                            <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{o.dueLabel.split(' ')[1].slice(0, 3)}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-sm font-medium">{o.label}</span>
                              <span className="text-xs text-muted-foreground">for {o.periodLabel}</span>
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              due {o.dueLabel} · {o.daysRemaining === 1 ? '1 day' : `${o.daysRemaining} days`} remaining
                            </div>
                            {o.windowElapsedPct != null && o.windowWord ? (
                              <div className="mt-1.5 flex items-center gap-2" title={o.windowWord}>
                                <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-muted" aria-hidden>
                                  <span
                                    className={`absolute inset-y-0 left-0 rounded-full ${calendarFillTone(o.status)}`}
                                    style={{ width: `${Math.min(100, Math.max(0, o.windowElapsedPct))}%` }}
                                  />
                                </span>
                                <span className="text-[11px] tabular-nums text-muted-foreground">{o.windowWord}</span>
                              </div>
                            ) : o.windowWord ? (
                              <div className="mt-1 text-[11px] text-muted-foreground">{o.windowWord}</div>
                            ) : null}
                            {o.weekendNote ? (
                              <p className="mt-1 flex items-start gap-1 text-[11px] text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden /> {o.weekendNote}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <div className="flex items-center gap-1.5">
                              {/* v2.276.0: the receipt — the ledger's own chip. The
                                  emerald 'good' family: on THIS card emerald means
                                  "the ledger holds the receipt", and the words ride
                                  the chip so AT hears what the eye sees. It never
                                  borrows the clock's rose/amber/sky.
                                  v2.277.0: the chip IS the amendment door — the clock
                                  governs the FIRST record (the window's law holds);
                                  the LEDGER governs corrections (a receipt that
                                  exists can be amended whenever the filer needs).
                                  A genuinely amended receipt says so in its title. */}
                              {(() => {
                                const periodMonth = periodMonthForDueDate(o.dueDate);
                                const filed = filingFor(o.kind, periodMonth);
                                return filed ? (
                                  <button
                                    type="button"
                                    data-testid={`hr-cal-filed-${o.kind.toLowerCase()}`}
                                    aria-haspopup="dialog"
                                    title={`Filed ${formatDate(filed.filedAt)}${filed.filedByName ? ` by ${filed.filedByName}` : ''}${filed.reference ? ` — ref ${filed.reference}` : ''}${filingWasAmended(filed) ? ` — amended ${formatDate(filed.updatedAt)}` : ''} — open to amend`}
                                    onClick={() => {
                                      const pm = periodMonthForDueDate(o.dueDate);
                                      if (pm) openFilingDialog(o, pm, filed);
                                    }}
                                    className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-200"
                                  >
                                    <FileCheck2 className="h-3 w-3 shrink-0" aria-hidden />
                                    filed {formatDate(filed.filedAt)}
                                  </button>
                                ) : null;
                              })()}
                              <span
                                data-testid={`hr-cal-status-${o.kind.toLowerCase()}`}
                                className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${calendarStatusTone(o.status)}`}
                              >
                                {o.statusWord}
                              </span>
                            </div>
                            {/* the write door — only while the window is open and the receipt is missing:
                                a window that has not opened has nothing to file, and a filed window
                                keeps its chip — THE CHIP is the amendment door now (v2.277.0). */}
                            {o.status !== 'NOT_YET_OPEN' && !filingFor(o.kind, periodMonthForDueDate(o.dueDate)) && (
                              <button
                                type="button"
                                data-testid={`hr-cal-file-button-${o.kind.toLowerCase()}`}
                                onClick={() => {
                                  const pm = periodMonthForDueDate(o.dueDate);
                                  if (pm) openFilingDialog(o, pm);
                                }}
                                className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                              >
                                <Stamp className="h-3 w-3 shrink-0" aria-hidden /> Mark filed
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">
                      The clock speaks deadlines; the ledger speaks receipts — record a filing when the return goes in, and the chip remembers who filed it and when. Instruments: {calendar.obligations[0]?.instrument ?? '—'}; the same 9th governs NSSF, SHIF and the housing levy.
                    </p>
                    {filingFailed && (
                      <p className="mt-1.5 text-[11px] text-amber-700 dark:text-amber-400" data-testid="hr-compliance-filing-error">
                        The filing ledger could not be read — the clock still speaks, the receipts are quiet. Retry from the calendar&apos;s refresh.
                      </p>
                    )}
                    {filingAmendedNote && (
                      <p
                        className="mt-1.5 flex items-start gap-1 text-[11px] text-emerald-700 dark:text-emerald-400"
                        data-testid="hr-filing-amended-note"
                      >
                        <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                        The {filingAmendedNote} receipt was amended — the ledger keeps one truth, and the audit trail remembers the correction.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                <Stat label="PAYE" value={formatKes(statutory.totals.paye)} />
                <Stat label="NSSF" value={formatKes(statutory.totals.nssf)} />
                <Stat label="SHIF" value={formatKes(statutory.totals.shif)} />
                <Stat label="Housing levy" value={formatKes(statutory.totals.housingLevy)} />
                <Stat label="PAYE arrears" value={formatKes(statutory.totals.payeArrears)} />
                <Stat label="Total" value={formatKes(statutory.totals.total)} tone="good" />
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm"><Landmark className="h-4 w-4 text-emerald-700" aria-hidden /> Monthly statutory figures</CardTitle>
                  <CardDescription>From posted payroll lines — the journal entries already carry these.</CardDescription>
                </CardHeader>
                <CardContent>
                  <TableToolbar
                    columns={[
                      { key: 'label', label: 'Period' }, { key: 'paye', label: 'PAYE' }, { key: 'nssf', label: 'NSSF' },
                      { key: 'shif', label: 'SHIF' }, { key: 'ahl', label: 'Housing levy' }, { key: 'arr', label: 'Arrears' },
                      { key: 'due', label: 'Due' },
                    ]}
                    exportCsv={() => void exportTableCsv('statutory-liability')}
                    busyKey='statutory-liability'
                  />
                  <div className="max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-card"><TableRow>
                        <TableHead {...head('label')}    className={col('label')}>Period</TableHead>
                        <TableHead {...head('paye')}   className={`text-right ${col('paye')}`}>PAYE</TableHead>
                        <TableHead {...head('nssf')}   className={`text-right ${col('nssf')}`}>NSSF</TableHead>
                        <TableHead {...head('shif')}   className={`text-right ${col('shif')}`}>SHIF</TableHead>
                        <TableHead {...head('ahl')}   className={`text-right ${col('ahl')}`}>Housing levy</TableHead>
                        <TableHead {...head('arr')}   className={`text-right ${col('arr')}`}>Arrears</TableHead>
                        <TableHead {...head('due')}    className={`text-right ${col('due')}`}>Due</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {statutory.monthly.map((m) => {
                          // v2.275.0: the row speaks the CLOCK beside the money — the
                          // deadline is the statute's own (the 9th of the following
                          // month), derived by the compliance calendar's pure helper
                          // from the month key the row already carries. The column is
                          // named "Due", never "Filed": whether a past window was
                          // actually filed is the ledger's business, and the cell
                          // never claims a receipt. A weekend 9th rides the calendar's
                          // amber words as the cell's title (the statute does not
                          // wait; settle before the weekend).
                          const due = statutoryDueForPeriod(m.month);
                          return (
                            <TableRow key={m.month}>
                              <TableCell className={col('label')}>{m.label}</TableCell>
                              <TableCell className={`text-right tabular-nums ${col('paye')}`}>{formatKes(m.paye)}</TableCell>
                              <TableCell className={`text-right tabular-nums ${col('nssf')}`}>{formatKes(m.nssf)}</TableCell>
                              <TableCell className={`text-right tabular-nums ${col('shif')}`}>{formatKes(m.shif)}</TableCell>
                              <TableCell className={`text-right tabular-nums ${col('ahl')}`}>{formatKes(m.housingLevy)}</TableCell>
                              <TableCell className={`text-right tabular-nums ${col('arr')}`}>{formatKes(m.payeArrears)}</TableCell>
                              <TableCell
                                className={`whitespace-nowrap text-right text-xs tabular-nums ${due?.weekendNote ? 'text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'} ${col('due')}`}
                                title={(() => {
                                  // the clock's words stay; the ledger's composition joins them —
                                  // within the read window a month without receipts says so honestly,
                                  // outside it the cell keeps quiet (no coverage, no claim)
                                  const base = due?.weekendNote ?? 'Filing window: the 1st–9th of the following month — the statute does not wait for the weekend';
                                  if (!monthInCoverage(m.month)) return base;
                                  const count = monthFiledCount(m.month);
                                  if (count === 0) return `${base} — no filing recorded`;
                                  // v2.277.0: the composition's third voice — a month whose
                                  // receipts were corrected says how many (the slack law
                                  // decides what counts as a correction, not the eye)
                                  const amended = monthAmendedCount(m.month);
                                  return `${base} — filed: ${count} of 4 obligations${amended > 0 ? ` · ${amended} receipt${amended === 1 ? '' : 's'} amended` : ''}`;
                                })()}
                              >
                                {due ? due.dueLabel : '—'}
                                {monthInCoverage(m.month) && (() => {
                                  // v2.278.0: the receipt rail — the composition leaves the
                                  // hover-only title for an always-visible face. Four dots,
                                  // the calendar's own order (PAYE, NSSF, SHIF, housing levy),
                                  // emerald when the ledger holds that receipt, quiet slate
                                  // when it does not — the rail-dot law: the dots carry the
                                  // face, the aria carries the composition in the ONE grammar
                                  // the title already speaks, and no new palette is invented.
                                  // Outside the read window the cell keeps quiet (no coverage,
                                  // no claim) — the law the rail inherits, never retires.
                                  const kinds = ['PAYE', 'NSSF', 'SHIF', 'AHL'] as const;
                                  const count = monthFiledCount(m.month);
                                  const amended = monthAmendedCount(m.month);
                                  return (
                                    <span
                                      className="ml-1.5 inline-flex items-center gap-0.5 align-middle"
                                      role="img"
                                      aria-label={`filed: ${count} of ${kinds.length} obligations${amended > 0 ? ` · ${amended} receipt${amended === 1 ? '' : 's'} amended` : ''}`}
                                      data-testid="hr-due-filed-rail"
                                    >
                                      {kinds.map((k) => {
                                        const held = Boolean(filingFor(k, m.month));
                                        return (
                                          <span
                                            key={k}
                                            className={`h-1.5 w-1.5 rounded-full ${held ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`}
                                            data-testid={`hr-due-filed-dot-${k.toLowerCase()}`}
                                          />
                                        );
                                      })}
                                    </span>
                                  );
                                })()}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── P10 ── */}
        <TabsContent value="p10" className="space-y-4">
          <div className="flex flex-wrap items-end gap-2 print:hidden">
            <div className="space-y-1">
              <Label htmlFor="p10-year" className="text-xs">Tax year</Label>
              <Select value={p10Year} onValueChange={setP10Year}>
                <SelectTrigger id="p10-year" className="h-8 w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.open(`/api/hr/reports/p10?year=${p10Year}&format=csv`, '_blank')}>
              <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden /> Download CSV
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" aria-hidden /> Print PDF
            </Button>
          </div>
          <UpdatedStamp testId="hr-reports-updated-p10" at={p10LoadedAt} />
          {!p10 ? (
            p10Failed ? (
              <ReportFailureStrip
                testId="hr-reports-p10-error"
                copy="The P10 register could not be loaded — the schedule stays dark rather than guess."
                retryLabel="Retry loading the P10 register"
                onRetry={() => void loadP10(p10Year)}
                busy={p10Busy}
              />
            ) : (
              <Skeleton className="h-40 w-full" />
            )
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">P10 register {p10.year}</CardTitle>
                <CardDescription>
                  {p10.rows.length} employees from {p10.sourceRuns} posted runs. Every figure is a stored payroll line — the register reproduces exactly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card"><TableRow>
                      <TableHead {...head('p10-code')}>Code</TableHead><TableHead {...head('p10-type')}>Type</TableHead><TableHead {...head('p10-months')} className="text-right">Months</TableHead>
                      <TableHead {...head('p10-gross')} className="text-right">Gross</TableHead><TableHead {...head('p10-nssf')} className="text-right">NSSF</TableHead>
                      <TableHead {...head('p10-shif')} className="text-right">SHIF</TableHead><TableHead {...head('p10-levy')} className="text-right">Housing levy</TableHead>
                      <TableHead {...head('p10-paye')} className="text-right">PAYE</TableHead><TableHead {...head('p10-net')} className="text-right">Net</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {p10.rows.map((r) => (
                        <TableRow key={r.employeeCode}>
                          <TableCell className="font-mono text-xs">{r.employeeCode}</TableCell>
                          <TableCell>{r.employmentType.toLowerCase()}</TableCell>
                          <TableCell className="text-right tabular-nums">{r.months}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatKes(r.grossPay)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatKes(r.nssf)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatKes(r.shif)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatKes(r.housingLevy)}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">{formatKes(r.paye)}</TableCell>
                          <TableCell className="text-right tabular-nums">{formatKes(r.netPay)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell colSpan={3}>TOTAL</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKes(p10.totals.grossPay)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKes(p10.totals.nssf)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKes(p10.totals.shif)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKes(p10.totals.housingLevy)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKes(p10.totals.paye)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatKes(p10.totals.netPay)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Privacy / consent (v2.119.0) + erasure ── */}
        {/* ── Portal adoption (v2.271.0): the bell at report distance ── */}
        <TabsContent value="portal" className="space-y-4">
          {!portal ? (
            portalFailed ? (
              <ReportFailureStrip
                testId="hr-reports-portal-error"
                copy="The portal roll call could not be loaded — the numbers stay dark rather than guess."
                retryLabel="Retry loading the portal adoption report"
                onRetry={() => void loadPortal()}
                busy={portalBusy}
              />
            ) : (
              <Skeleton className="h-40 w-full" />
            )
          ) : (
            <>
              <UpdatedStamp testId="hr-reports-updated-portal" at={portalLoadedAt} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <Stat label="Employees in scope" value={String(portal.total)} />
                <Stat label="Linked logins" value={String(portal.linked)} tone="good" hint="a linked login opens the self-service portal" />
                <Stat label="Active logins" value={String(portal.activeLogins)} />
                <Stat
                  label="Deactivated logins"
                  value={String(portal.deactivatedLogins)}
                  tone={portal.deactivatedLogins ? 'warn' : undefined}
                  hint="the link stands; the account is the closed door"
                />
                <Stat label="Not linked" value={String(portal.unlinked)} tone={portal.unlinked ? 'warn' : undefined} hint="the honest dash — no login to open it" />
              </div>
              <p className="text-sm text-muted-foreground">
                The roster&rsquo;s quiet bell rolled up to report distance: who holds a self-service login,
                which of those accounts stand, and where the dash still does. A point-in-time census —
                the adoption story the leave and payslip emails assume. Role is named; the email never rides.
              </p>

              {/* per-branch rollup — the meter is the adoption rate at a glance */}
              {portal.byStore.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Adoption by branch</CardTitle>
                    <CardDescription className="text-xs">
                      Linked logins over employees in scope, per branch the scope answers for.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {portal.byStore.map((b) => {
                      const pct = b.total > 0 ? Math.round((b.linked / b.total) * 100) : 0;
                      return (
                        <div key={b.storeName} data-testid="hr-reports-portal-store-row">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-medium">{b.storeName}</span>
                            <span className="tabular-nums text-muted-foreground">
                              <span className="font-semibold text-emerald-700 dark:text-emerald-400">{b.linked}</span> of {b.total} linked · {pct}%
                            </span>
                          </div>
                          <div
                            className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                            role="img"
                            aria-label={`${b.storeName}: ${b.linked} of ${b.total} employees hold a linked portal login (${pct}%)`}
                          >
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* the roll call — the roster's chip vocabulary, byte-kept;
                  v2.272.0: the header carries the census's own CSV door —
                  emerald (the linked-login color — a color never means two
                  things), spinning while it builds, quiet in print */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-semibold">The roll call</CardTitle>
                      <CardDescription className="text-xs">
                        Every employee the scope answers for, and the state of their portal door.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void exportPortalCsv()}
                      disabled={portalCsvBusy}
                      data-testid="hr-reports-portal-export"
                      title="Roll call CSV — the governed file: header block, injection guard, and the export lands in the audit trail. No emails ride."
                      aria-label={portalCsvBusy ? 'Building the roll call CSV' : 'Download the roll call CSV of the portal adoption census'}
                      className="h-8 shrink-0 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:ring-emerald-400 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-200 print:hidden"
                    >
                      {portalCsvBusy ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : (
                        <FileDown className="h-3.5 w-3.5" aria-hidden />
                      )}
                      {portalCsvBusy ? 'Building…' : 'Roll call CSV'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/60 dark:bg-slate-900/60">
                          <TableHead {...head('portal-employee')}>Employee</TableHead>
                          <TableHead {...head('portal-job')}>Job title</TableHead>
                          <TableHead {...head('portal-branch')}>Branch</TableHead>
                          <TableHead {...head('portal-role')}>Login role</TableHead>
                          <TableHead {...head('portal-state')}>Portal state</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {portal.rows.map((r) => {
                          // the roster's PORTAL_CHIP law, byte-kept: emerald open /
                          // amber closed — and the unlinked row renders the honest
                          // dash, never a look-alike chip
                          const state = !r.portalLinked
                            ? null
                            : r.portalActive === false
                              ? {
                                  label: 'portal off',
                                  className:
                                    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300',
                                  title: 'The linked login is deactivated — the portal stays closed until the account is reactivated in Settings → Users.',
                                }
                              : {
                                  label: 'portal',
                                  className:
                                    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
                                  title: 'The linked login is active — leave and payroll notifications land in the app.',
                                };
                          return (
                            <TableRow key={r.id} data-testid="hr-reports-portal-row">
                              <TableCell>
                                <span className="font-medium">{r.name}</span>
                                {r.employeeCode && (
                                  <span className="ml-2 font-mono text-[10px] text-slate-400 dark:text-slate-500">{r.employeeCode}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{r.jobTitle || '—'}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{r.storeName}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {r.portalLinked ? (r.portalRole ?? 'linked').replace(/_/g, ' ').toLowerCase() : <span className="text-slate-300 dark:text-slate-600">—</span>}
                              </TableCell>
                              <TableCell>
                                {state ? (
                                  <span
                                    data-testid="hr-reports-portal-state"
                                    title={state.title}
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${state.className}`}
                                  >
                                    <BellRing className="h-3 w-3" aria-hidden="true" />
                                    {state.label}
                                  </span>
                                ) : (
                                  <span
                                    data-testid="hr-reports-portal-silent"
                                    className="text-xs text-slate-300 dark:text-slate-600"
                                    title="No linked login — the self-service portal stays behind the HR desk."
                                  >
                                    —
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* v2.272.0: the export's own note — the download speaks its
                  size and its audit law, or its failure, in the census's
                  emerald (or the shared red), a role="status" like the
                  digest note speaks above the tabs */}
              {portalCsvNote ? (
                <p
                  role="status"
                  data-testid="hr-reports-portal-export-note"
                  className={`print:hidden ${
                    portalCsvNote.tone === 'ok'
                      ? 'text-xs font-medium text-emerald-700 dark:text-emerald-300'
                      : 'text-xs font-medium text-red-600 dark:text-red-400'
                  }`}
                >
                  {portalCsvNote.text}
                </p>
              ) : null}
            </>
          )}
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card data-testid="hr-privacy-consent">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileCheck2 className="h-4 w-4 text-emerald-700" aria-hidden /> Consent records (Data Protection Act posture)
              </CardTitle>
              <CardDescription>
                Payroll runs on consent: an employee without an active data-processing consent is reported MISSING_CONSENT by the run check. Grant and withdraw are decisions reserved to settings managers, and both are audit-logged.
              </CardDescription>
              <p data-testid="hr-privacy-consent-counts" className="mt-1 text-xs tabular-nums text-muted-foreground">
                {consent === null ? (
                  'Loading…'
                ) : (
                  <>
                    {`${consent.summary.active} active · ${consent.summary.withdrawn} withdrawn · `}
                    {consent.summary.none > 0 ? (
                      <span
                        data-testid="hr-privacy-consent-none-count"
                        className="font-medium text-rose-600 dark:text-rose-400"
                        title="These employees will be reported MISSING_CONSENT by the next payroll run"
                      >
                        {consent.summary.none} without consent
                      </span>
                    ) : (
                      <span>0 without consent</span>
                    )}
                  </>
                )}
                {consentLoadedAt ? <span aria-hidden> · updated {formatStamp(consentLoadedAt)}</span> : null}
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center justify-end gap-2">
                {consent && consent.records.length > 0 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void exportAllTimelines()}
                    disabled={exportAllBusy}
                    aria-label="Export all consent timelines CSV"
                    title="One flat CSV: every in-scope employee's consent cycles — who, when, and what purpose. Never content."
                    data-testid="hr-privacy-consent-export-all"
                    className="border-violet-300 text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-700 dark:bg-violet-950/30 dark:text-violet-300 dark:hover:bg-violet-900/40 dark:hover:text-violet-200 print:hidden"
                  >
                    <FileDown className="h-3.5 w-3.5" aria-hidden />
                    {exportAllBusy ? 'Exporting…' : 'Export all'}
                  </Button>
                ) : null}
                <Button variant="outline" size="sm" onClick={() => void loadConsent()} disabled={consentBusy} aria-label="Refresh consent records">
                  {consentBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <History className="h-4 w-4" aria-hidden />} Refresh
                </Button>
              </div>
              {exportAllError ? (
                <p
                  role="status"
                  data-testid="hr-privacy-consent-export-error"
                  className="mb-2 text-xs font-medium text-rose-600 dark:text-rose-400"
                >
                  {exportAllError}
                </p>
              ) : null}
              {!consent ? (
                consentFailed ? (
                  <ReportFailureStrip
                    testId="hr-privacy-consent-error"
                    copy="The consent ledger could not be loaded — the desk stays dark rather than guess."
                    retryLabel="Retry loading consent records"
                    onRetry={() => void loadConsent()}
                    busy={consentBusy}
                  />
                ) : (
                  <Skeleton className="h-28 w-full" />
                )
              ) : consent.records.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No employees in scope.</p>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead {...head('c-emp')}>Employee</TableHead><TableHead {...head('c-status')}>Status</TableHead>
                    <TableHead {...head('c-policy')}>Policy</TableHead><TableHead {...head('c-granted')}>Granted</TableHead><TableHead {...head('c-withdrawn')}>Withdrawn</TableHead>
                    <TableHead {...head('c-action')} className="text-right">Action</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {consent.records.map((r) => (
                      <TableRow key={r.employeeId}>
                        <TableCell>
                          <div className="font-medium">{r.employeeCode}</div>
                          <div className="text-xs text-muted-foreground">{r.employeeName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1">
                            {r.status === 'ACTIVE' ? (
                              <span data-testid="hr-privacy-consent-chip-active" className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">Active</span>
                            ) : r.status === 'WITHDRAWN' ? (
                              <span data-testid="hr-privacy-consent-chip-withdrawn" className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300" title={r.withdrawnAt ? `Withdrawn ${formatDate(r.withdrawnAt)}` : undefined}>Withdrawn</span>
                            ) : (
                              <span data-testid="hr-privacy-consent-chip-none" className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">None on file</span>
                            )}
                            {r.priorGrants > 0 ? (
                              <span
                                data-testid="hr-privacy-consent-regrant"
                                className="inline-flex items-center gap-0.5 rounded-full border border-indigo-300 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
                                title={`Withdrawn and re-granted before — ${r.priorGrants} earlier record${r.priorGrants === 1 ? '' : 's'} stay${r.priorGrants === 1 ? 's' : ''} on file (append-only ledger).`}
                              >
                                <History className="h-3 w-3" aria-hidden /> re-granted ×{r.priorGrants}
                              </span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.latestPolicyVersion ?? '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{r.grantedAt ? formatDate(r.grantedAt) : '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{r.withdrawnAt ? formatDate(r.withdrawnAt) : '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* v2.129.0: the timeline door — a READ, so it renders for every
                                viewer of the ledger (reads are never reserved to deciders). */}
                            <Button
                              size="sm"
                              variant="ghost"
                              data-testid="hr-privacy-consent-history-open"
                              aria-label={`Consent history — ${r.employeeName}`}
                              onClick={() => openHistory(r)}
                            >
                              <History className="h-3.5 w-3.5" aria-hidden /> History
                            </Button>
                            {consent.canDecide ? (
                              r.status === 'ACTIVE' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={busy}
                                  data-testid="hr-privacy-consent-withdraw"
                                  aria-label={`Withdraw data-processing consent — ${r.employeeName}`}
                                  onClick={() => void run(() => apiSend('/api/hr/privacy/consent/withdraw', 'POST', { employeeId: r.employeeId }).then(() => loadConsent()))}
                                >
                                  Withdraw
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  disabled={busy}
                                  data-testid="hr-privacy-consent-grant"
                                  aria-label={`Grant data-processing consent — ${r.employeeName}`}
                                  onClick={() => void run(() => apiSend('/api/hr/privacy/consent/grant', 'POST', { employeeId: r.employeeId }).then(() => loadConsent()))}
                                >
                                  Grant
                                </Button>
                              )
                            ) : (
                              <span className="text-xs text-muted-foreground">settings managers decide</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden /> Erasure requests (Data Protection Act posture)
              </CardTitle>
              <CardDescription>
                Non-statutory personal data is erased; payroll and audit records stay under statutory retention with the decision and legal basis recorded.
              </CardDescription>
              {erasureLoadedAt ? (
                <p data-testid="hr-privacy-updated-erasure" className="mt-1 text-[11px] tabular-nums text-muted-foreground">Updated {formatStamp(erasureLoadedAt)}</p>
              ) : null}
            </CardHeader>
            <CardContent>
              {!erasure ? (
                erasureFailed ? (
                  <ReportFailureStrip
                    testId="hr-privacy-erasure-error"
                    copy="The erasure queue could not be loaded — the desk stays dark rather than guess."
                    retryLabel="Retry loading erasure requests"
                    onRetry={() => void loadErasure()}
                    busy={erasureBusy}
                  />
                ) : (
                  <Skeleton className="h-28 w-full" />
                )
              ) : erasure.requests.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No erasure requests.</p>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead {...head('e-emp')}>Employee</TableHead><TableHead {...head('e-status')}>Status</TableHead><TableHead {...head('e-req')}>Requested</TableHead>
                    <TableHead {...head('e-decision')}>Decision</TableHead><TableHead {...head('e-actions')} className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {erasure.requests.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="font-medium">{r.employeeCode}</div>
                          <div className="text-xs text-muted-foreground">{r.employeeName}</div>
                        </TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(r.requestedAt)}</TableCell>
                        <TableCell className="max-w-72">
                          <p className="truncate text-xs" title={r.decision ?? ''}>{r.decision ?? '—'}</p>
                          {r.legalBasis ? <p className="truncate text-[11px] text-muted-foreground" title={r.legalBasis}>{r.legalBasis}</p> : null}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.status === 'PENDING' && erasure.canDecide ? (
                            <div className="flex justify-end gap-1.5">
                              <Button size="sm" disabled={busy} onClick={() => void run(() => apiSend(`/api/hr/privacy/erasure-requests/${r.id}/execute`, 'POST', { notes: 'Erased non-statutory personal data.' }))}>
                                Execute
                              </Button>
                              <Button size="sm" variant="outline" disabled={busy} onClick={() => { setRejectTarget(r); setRejectNotes(''); setRejectBasis(''); }}>
                                Reject…
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">{r.retentionApplies ? 'statutory retention' : '—'}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          <Card data-testid="hr-privacy-retention">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Landmark className="h-4 w-4 text-amber-700" aria-hidden /> Retention &amp; legal holds (Data Protection Act posture)
              </CardTitle>
              <CardDescription>
                The nightly sweep anonymises expired personal data scope by scope — reviewable windows, never legal advice. A legal hold pauses one scope until a settings manager releases it; setting and releasing are both audit-logged. The Next sweep column is a dry run: it counts what each run would anonymise, changing nothing.
              </CardDescription>
              {retentionLoadedAt ? (
                <p data-testid="hr-privacy-updated-retention" className="mt-1 text-[11px] tabular-nums text-muted-foreground">Updated {formatStamp(retentionLoadedAt)}</p>
              ) : null}
              <p data-testid="hr-privacy-retention-hold-count" className="mt-1 text-xs tabular-nums text-muted-foreground">
                {retention === null ? (
                  'Loading holds…'
                ) : retention.heldCount > 0 ? (
                  <>
                    <span className="font-medium text-amber-700 dark:text-amber-400">{retention.heldCount} of {retention.policies.length} scopes on hold</span>
                    <span> — the sweep skips them until release</span>
                  </>
                ) : (
                  <span>0 of {retention.policies.length} scopes on hold — the sweep runs nightly</span>
                )}
              </p>
              <p data-testid="hr-privacy-retention-sweep-count" className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                {retention === null ? (
                  'Counting the sweep backlog…'
                ) : retention.sweepableTotal > 0 ? (
                  <>
                    <span className="font-medium">{retention.sweepableTotal} {retention.sweepableTotal === 1 ? 'row' : 'rows'}</span> would be anonymised on the next nightly run
                    {retention.sweepableTotal > 500 ? ' — the sweep takes up to 500 per night' : ''}
                  </>
                ) : (
                  <span>nothing to sweep tonight — every scope sits inside its window</span>
                )}
              </p>
              {retention !== null && retention.canDecide ? (
                sweepArm ? (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5" data-testid="hr-retention-sweep-arm">
                    <span className="text-xs text-rose-600 dark:text-rose-400">
                      Run the sweep now? {retention.sweepableTotal > 0 ? `${retention.sweepableTotal} ${retention.sweepableTotal === 1 ? 'row' : 'rows'} would be anonymised immediately.` : 'Nothing is in scope — held scopes are skipped, in-window rows are untouched.'}
                    </span>
                    <Button size="sm" variant="destructive" disabled={busy} onClick={() => void runSweepNow()}>Confirm sweep</Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => setSweepArm(false)}>Cancel</Button>
                  </div>
                ) : (
                  <div className="mt-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      data-testid="hr-retention-sweep-now"
                      onClick={() => { setSweepArm(true); setReleaseArm(null); setRetentionNote(null); }}
                    >
                      Sweep now…
                    </Button>
                  </div>
                )
              ) : null}
            </CardHeader>
            <CardContent>
              {!retention ? (
                retentionFailed ? (
                  <ReportFailureStrip
                    testId="hr-privacy-retention-error"
                    copy="The retention desk could not be loaded — the desk stays dark rather than guess."
                    retryLabel="Retry loading the retention desk"
                    onRetry={() => void loadRetention()}
                    busy={retentionBusy}
                  />
                ) : (
                  <Skeleton className="h-28 w-full" />
                )
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead {...head('r-scope')}>Scope</TableHead><TableHead {...head('r-window')}>Window</TableHead>
                    <TableHead
                      {...head('r-sweep')}
                      data-testid="hr-retention-preview-col"
                      className="whitespace-nowrap"
                      title="Dry run — counts rows matching the sweep's own criteria; nothing is changed."
                    >
                      Next sweep
                    </TableHead>
                    <TableHead {...head('r-hold')}>Hold</TableHead>
                    <TableHead {...head('r-actions')} className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {retention.policies.map((p) => (
                      <TableRow key={p.scope} data-testid={`hr-retention-row-${p.scope}`}>
                        <TableCell className="max-w-72">
                          <div className="font-medium">{p.description}</div>
                          <div className="truncate text-[11px] text-muted-foreground" title={p.basis}>{p.basis}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{p.windowLabel}</TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">
                          <span
                            data-testid={`hr-retention-sweep-${p.scope}`}
                            className={p.held && p.sweepable > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-muted-foreground'}
                            title={p.held && p.sweepable > 0 ? 'A hold stands — these rows wait until a settings manager releases the scope.' : 'Dry-run count — what the next nightly run would anonymise; nothing is changed.'}
                          >
                            {p.sweepLabel}
                          </span>
                        </TableCell>
                        <TableCell>
                          {p.held ? (
                            <span
                              data-testid={`hr-retention-hold-${p.scope}`}
                              className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                              title={p.heldAt ? `On hold since ${formatDate(p.heldAt)} — the nightly sweep skips this scope.` : 'On hold — the nightly sweep skips this scope.'}
                            >
                              On hold
                            </span>
                          ) : (
                            <span
                              data-testid={`hr-retention-hold-${p.scope}`}
                              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300"
                              title="No hold — the nightly sweep anonymises this scope's expired records."
                            >
                              Sweeping nightly
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {retention.canDecide ? (
                            p.held ? (
                              releaseArm === p.scope ? (
                                <div className="flex items-center justify-end gap-1.5" data-testid={`hr-retention-arm-${p.scope}`}>
                                  <span className="text-xs text-rose-600 dark:text-rose-400">Release? The sweep resumes on its next run.</span>
                                  <Button size="sm" variant="destructive" disabled={busy} onClick={() => void runHold(p.scope, false)}>Confirm release</Button>
                                  <Button size="sm" variant="outline" disabled={busy} onClick={() => setReleaseArm(null)}>Cancel</Button>
                                </div>
                              ) : (
                                <Button size="sm" variant="outline" disabled={busy} onClick={() => { setReleaseArm(p.scope); setSweepArm(false); setRetentionNote(null); }}>Release…</Button>
                              )
                            ) : (
                              <Button size="sm" variant="outline" disabled={busy} onClick={() => void runHold(p.scope, true)}>Hold</Button>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">settings managers decide</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {retentionNote ? (
                <p
                  data-testid="hr-retention-note"
                  role="status"
                  className={`mt-2 text-xs ${retentionNote.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                >
                  {retentionNote.text}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject dialog */}
      <Dialog open={rejectTarget !== null} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject erasure request — {rejectTarget?.employeeCode}</DialogTitle>
            <DialogDescription>Both the decision reason and the legal basis are mandatory and recorded.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="rej-notes">Decision reason (min 10 chars)</Label>
              <Textarea id="rej-notes" rows={3} value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rej-basis">Legal basis</Label>
              <Input id="rej-basis" value={rejectBasis} onChange={(e) => setRejectBasis(e.target.value)} placeholder="e.g. Employment Act s.74 payroll retention" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={busy || rejectNotes.trim().length < 10 || rejectBasis.trim().length < 5}
              onClick={() =>
                void run(async () => {
                  await apiSend(`/api/hr/privacy/erasure-requests/${rejectTarget!.id}/reject`, 'POST', { notes: rejectNotes, legalBasis: rejectBasis });
                  setRejectTarget(null);
                })
              }
            >
              Reject request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consent timeline drawer (v2.129.0) — the append-only ledger read verbatim:
          every grant, withdrawal, and re-grant stays on file and the timeline
          shows the journey the re-granted ×N chip only counts. */}
      <Dialog open={historyEmp !== null} onOpenChange={(open) => !open && closeHistory()}>
        <DialogContent className="print:hidden max-h-[85vh] overflow-y-auto sm:max-w-lg" data-testid="hr-privacy-consent-history">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden />
              Consent timeline — {historyEmp?.employeeName ?? ''}
            </DialogTitle>
            <DialogDescription>
              {historyEmp?.employeeCode ? `${historyEmp.employeeCode} · ` : ''}The append-only ledger — every grant, withdrawal, and re-grant stays on file. Reads never alter the record.
            </DialogDescription>
          </DialogHeader>
          {historyLoading ? (
            <Skeleton className="h-40 w-full" data-testid="hr-privacy-consent-history-loading" />
          ) : historyError ? (
            <div className="space-y-2">
              <p role="status" className="text-xs text-rose-600 dark:text-rose-400">{historyError}</p>
              <Button variant="outline" size="sm" onClick={() => historyEmp && openHistory(historyEmp)} aria-label="Retry consent history">
                Retry
              </Button>
            </div>
          ) : historyPayload && historyPayload.events.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground" data-testid="hr-privacy-consent-history-empty">
              No consent records on file — the run reports MISSING_CONSENT until a grant.
            </p>
          ) : historyPayload ? (
            <div className="space-y-3">
              <ol data-testid="hr-privacy-consent-history-timeline" className="relative space-y-4 border-l-2 border-slate-200 pl-5 dark:border-slate-700">
                {historyPayload.events.map((ev) => (
                  <li key={ev.cycle} className="relative">
                    <span
                      aria-hidden
                      data-testid={ev.withdrawnAt ? 'hr-privacy-consent-history-dot-closed' : 'hr-privacy-consent-history-dot-standing'}
                      className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-background ${ev.withdrawnAt ? 'bg-amber-500 dark:bg-amber-400' : 'bg-emerald-500 dark:bg-emerald-400'}`}
                    />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold">Cycle {ev.cycle}</span>
                      {ev.withdrawnAt ? (
                        <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">Withdrawn</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">Standing</span>
                      )}
                      {ev.withdrawnAt && ev.stoodDays !== null ? (
                        <span
                          className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
                          title="Whole days between the grant and the withdrawal"
                        >
                          stood {ev.stoodDays} day{ev.stoodDays === 1 ? '' : 's'}
                        </span>
                      ) : null}
                      {ev.cycle > 1 ? (
                        <span className="inline-flex items-center rounded-full border border-indigo-300 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">re-grant</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{ev.purpose}</p>
                    <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                      Granted {formatDate(ev.grantedAt)}
                      {ev.withdrawnAt ? ` · Withdrawn ${formatDate(ev.withdrawnAt)}` : ' · still standing'}
                      {ev.policyVersion ? ` · policy ${ev.policyVersion}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
              <p data-testid="hr-privacy-consent-history-footer" className="text-xs text-muted-foreground">
                {historyPayload.events.length} record{historyPayload.events.length === 1 ? '' : 's'} on file · append-only — nothing is edited or deleted.
                {historyPayload.standing
                  ? ' The newest consent stands; the run gates on it.'
                  : ' No active consent stands; the run reports MISSING_CONSENT until a re-grant.'}
              </p>
              {historyPayload.events.length > 0 ? (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="hr-privacy-consent-history-csv"
                    aria-label={`Export consent timeline CSV — ${historyPayload.employee.name}`}
                    title="Only who, when, and what purpose are exported — the ledger's own columns, never more."
                    onClick={exportHistoryCsv}
                  >
                    <FileDown className="h-4 w-4" aria-hidden /> Export CSV
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ── v2.276.0: the filing ledger's receipt dialog ──
          One dialog, parameterized by the obligation whose door opened it.
          v2.277.0: the dialog has TWO MODES — record (the window's door,
          defaults to now) and amend (the chip's door, prefilled from the
          receipt the ledger already holds; the strip speaks the original
          recording so a correction always knows what it corrects). The
          receipt is the FILER's assertion — the server validates it is not
          future-dated and audits the write (RECORDED vs AMENDED); the chip
          and the monthly figures' dot speak the same row afterwards. */}
      <Dialog open={filingTarget !== null} onOpenChange={(open) => !open && setFilingTarget(null)}>
        <DialogContent className="sm:max-w-md" data-testid="hr-filing-dialog">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {filingTarget?.amend ? 'Amend' : 'Record'} the {filingTarget?.label} filing — {filingTarget?.periodLabel}
            </DialogTitle>
            <DialogDescription>
              The receipt is your assertion that the return or payment went in. It lands in the filing ledger —
              one receipt per obligation per month; recording again amends it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {filingTarget?.amend && filingTarget.original ? (
              <p
                className="flex items-start gap-1.5 rounded-md border border-dashed border-emerald-300 bg-emerald-50/60 px-2 py-1.5 text-[11px] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                data-testid="hr-filing-amend-strip"
              >
                <PenLine className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                This receipt was recorded {formatDate(filingTarget.original.filedAt)}
                {filingTarget.original.filedByName ? ` by ${filingTarget.original.filedByName}` : ''} — updating it
                corrects the ledger&apos;s one truth; the audit trail remembers the correction.
              </p>
            ) : null}
            <div className="space-y-1">
              <Label htmlFor="filing-filed-at" className="text-xs">Filed on</Label>
              <Input
                id="filing-filed-at"
                type="datetime-local"
                value={filingFiledAt}
                onChange={(e) => setFilingFiledAt(e.target.value)}
                className="h-8"
                data-testid="hr-filing-filed-at"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="filing-ref" className="text-xs">Reference (optional)</Label>
              <Input
                id="filing-ref"
                value={filingRef}
                onChange={(e) => setFilingRef(e.target.value)}
                placeholder="Payment slip / KRA voucher number"
                maxLength={120}
                className="h-8"
                data-testid="hr-filing-ref"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="filing-note" className="text-xs">Note (optional)</Label>
              <Textarea
                id="filing-note"
                value={filingNote}
                onChange={(e) => setFilingNote(e.target.value)}
                placeholder="Anything the next reader of this receipt should know"
                maxLength={500}
                className="min-h-16 text-xs"
                data-testid="hr-filing-note"
              />
            </div>
            {filingError ? (
              <p className="text-xs text-rose-700 dark:text-rose-400" data-testid="hr-filing-error" role="alert">
                {filingError}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setFilingTarget(null)} disabled={filingBusy}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => void submitFiling()}
              disabled={filingBusy || !filingFiledAt}
              data-testid="hr-filing-submit"
            >
              {filingBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : filingTarget?.amend ? <PenLine className="h-3.5 w-3.5" aria-hidden /> : <Stamp className="h-3.5 w-3.5" aria-hidden />}
              {filingTarget?.amend ? 'Update filing' : 'Record filing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function shareOf(days: number, byStatus: Array<{ status: string; days: number }>): string {
  const total = byStatus.reduce((a, x) => a + x.days, 0);
  return total ? ((days / total) * 100).toFixed(1) : '0.0';
}
