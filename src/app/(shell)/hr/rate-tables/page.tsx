'use client';

// MBUMAH HARDWARE POS - /hr/rate-tables (v2.303.0)
//
// The statutory tables' keeper: the management face the API header promised
// since the migration plan ("management arrives with the payroll release")
// and the issue rows' door law (v2.302.0) had to leave honestly doorless.
// RATE_TABLE_MISSING's fix — add or activate the statutory tables for the
// period — and OVERLAPPING_RATE_TABLES' fix — close or correct the
// overlapping version — now both live HERE.
//
// The desk's law: what it shows agrees with what payroll will do, BY
// CONSTRUCTION — the status chips and overlap warnings run the same pure
// window predicates as the engine's resolveRates (rate-table-view.ts), the
// insert guard replicates the engine's overlap rule at write time (the
// service refuses the exact state payroll would refuse), and the close
// action only ever shrinks a window (insert-only versioning; issued
// payslips keep the table they were priced by).
//
// Capability is honest: the write affordances render only for the role the
// session API reports (hr.rate-table.manage = SUPER_ADMIN), the API guards
// stay the fail-closed authority, and the service's refusal messages speak
// verbatim in the dialogs — the same voice the issue rows carry.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarRange, CheckCircle2, Clock, Landmark, LockKeyhole, Plus, RefreshCw, Scale, ShieldAlert, X } from 'lucide-react';
import {
  RATE_TABLE_TYPES,
  rateTableOverlapMap,
  rateTableStatus,
  type RateTableStatus,
  type RateTableViewShape,
} from '@/lib/hr/rate-table-view';

interface RateTableRowDto {
  order: number;
  lowerBoundCents: number;
  upperBoundCents: number | null;
  rateBps: number | null;
  flatAmountCents: number | null;
  reliefCents: number | null;
  employerMatchBps: number | null;
}

interface RateTableDto extends RateTableViewShape {
  id: string;
  type: string;
  code: string;
  label: string;
  basis: string;
  instrumentReference: string;
  verifyWithCounsel: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  rows: RateTableRowDto[];
}

/** The status chip's own face — one family per lifecycle state, same tone
 * law as the issue rows (color never carries the meaning alone: the label
 * says the word). */
const STATUS_FACES: Record<RateTableStatus, { chip: string; label: string }> = {
  ACTIVE: {
    chip: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
    label: 'Active',
  },
  SCHEDULED: {
    chip: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900',
    label: 'Scheduled',
  },
  CLOSED: {
    chip: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-950/50 dark:text-slate-300 dark:border-slate-800',
    label: 'Closed',
  },
};

const fmtDay = (iso: string | null) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : 'open';

function StatusChip({ table, now }: { table: RateTableDto; now: Date }) {
  const status = rateTableStatus(table, now);
  const face = STATUS_FACES[status];
  return (
    <Badge variant="outline" className={`text-[11px] ${face.chip}`} data-testid="rate-table-status" data-status={status}>
      {face.label}
    </Badge>
  );
}

interface RowDraft {
  lowerBound: string;
  upperBound: string;
  rateBps: string;
  flat: string;
  relief: string;
  employerMatchBps: string;
}

const EMPTY_ROW: RowDraft = { lowerBound: '0', upperBound: '', rateBps: '', flat: '', relief: '', employerMatchBps: '' };

export default function RateTablesPage() {
  const [tables, setTables] = useState<RateTableDto[] | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [closeTarget, setCloseTarget] = useState<RateTableDto | null>(null);

  const load = useCallback(async () => {
    try {
      const [meRes, tableRes] = await Promise.all([
        fetch('/api/auth/me', { credentials: 'include' }),
        fetch('/api/hr/rate-tables?scope=all', { credentials: 'include' }),
      ]);
      // The session read's own shape is { success, data: { role, ... } } —
      // a legacy { user } shape is accepted defensively, never trusted for
      // authority (the API guards stay the fail-closed law).
      const me = (await meRes.json().catch(() => null)) as
        | { data?: { role?: string }; user?: { role?: string } }
        | null;
      // The stale-error clear lives past the first await: an effect must not
      // setState synchronously (the cascading-render law), and the clear is
      // only honest once the reads have actually answered.
      setError(null);
      setRole(me?.data?.role ?? me?.user?.role ?? null);
      const j = (await tableRes.json().catch(() => null)) as { data?: RateTableDto[] } | null;
      setTables(j?.data ?? []);
      setNow(new Date());
    } catch {
      setError('Could not reach the rate-table read. Try Refresh.');
      setTables([]);
    }
  }, []);

  useEffect(() => {
    // Microtask-deferred (the timesheets desk's own hydration law): the
    // effect must not reach setState synchronously — the load's writes all
    // live past awaits, and the defer makes that true for the CALL too.
    void Promise.resolve().then(() => load());
  }, [load]);

  const canManage = role === 'SUPER_ADMIN';
  const overlaps = useMemo(() => rateTableOverlapMap(tables ?? []), [tables]);
  const tally = useMemo(() => {
    const list = tables ?? [];
    return {
      active: list.filter((t) => rateTableStatus(t, now) === 'ACTIVE').length,
      scheduled: list.filter((t) => rateTableStatus(t, now) === 'SCHEDULED').length,
      closed: list.filter((t) => rateTableStatus(t, now) === 'CLOSED').length,
      overlap: overlaps.size,
    };
  }, [tables, now, overlaps]);

  const byType = useMemo(() => {
    const map = new Map<string, RateTableDto[]>();
    for (const t of tables ?? []) {
      const list = map.get(t.type) ?? [];
      list.push(t);
      map.set(t.type, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [tables]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6" data-testid="rate-tables-page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Landmark className="h-5 w-5 text-emerald-700" aria-hidden />
            Statutory rate tables
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Versioned statutory data payroll resolves by period date. Windows are insert-only: a new
            version is added, an old one is closed — issued payslips keep the table they were priced by.
            What this desk shows agrees with what payroll will do: same window law, same overlap rule.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} data-testid="rate-tables-refresh">
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </Button>
          {canManage ? (
            <Button size="sm" onClick={() => setCreateOpen(true)} data-testid="rate-tables-create">
              <Plus className="h-4 w-4" aria-hidden />
              New table
            </Button>
          ) : (
            <Badge variant="outline" className="gap-1 text-[11px]" title="Table inserts and closes are hr.rate-table.manage (SUPER_ADMIN)">
              <LockKeyhole className="h-3 w-3" aria-hidden />
              Read-only for {role || 'your role'}
            </Badge>
          )}
        </div>
      </div>

      {error ? (
        <Card className="border-rose-200 dark:border-rose-900">
          <CardContent className="flex items-center gap-2 py-3 text-sm text-rose-700 dark:text-rose-300">
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden />
            {error}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4" data-testid="rate-tables-tally">
        {[
          { icon: CheckCircle2, label: 'Active now', value: tally.active, tone: 'text-emerald-700 dark:text-emerald-300' },
          { icon: Clock, label: 'Scheduled', value: tally.scheduled, tone: 'text-sky-700 dark:text-sky-300' },
          { icon: CalendarRange, label: 'Closed', value: tally.closed, tone: 'text-slate-600 dark:text-slate-300' },
          { icon: Scale, label: 'Overlapping', value: tally.overlap, tone: tally.overlap > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-slate-600 dark:text-slate-300' },
        ].map(({ icon: Icon, label, value, tone }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 py-3">
              <Icon className={`h-5 w-5 shrink-0 ${tone}`} aria-hidden />
              <div>
                <div className="text-lg font-semibold leading-none">{value}</div>
                <div className="text-[11px] text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables === null ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : byType.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No rate tables on file yet. Payroll cannot prepare while its required tables are missing —
            this is exactly the desk that fixes that.
          </CardContent>
        </Card>
      ) : (
        byType.map(([type, list]) => (
          <Card key={type} data-testid="rate-table-type-group">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Landmark className="h-4 w-4 text-emerald-700" aria-hidden />
                {type}
                <span className="text-xs font-normal text-muted-foreground">
                  {list.length} version{list.length === 1 ? '' : 's'}
                </span>
              </CardTitle>
              <CardDescription>Newest effective window first; a version never edits in place.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {list.map((t) => {
                const tableOverlaps = overlaps.get(t.id) ?? [];
                return (
                  <div
                    key={t.id}
                    data-testid="rate-table-row"
                    className="flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                  >
                    <StatusChip table={t} now={now} />
                    {tableOverlaps.length > 0 ? (
                      <Badge
                        variant="outline"
                        className="border-amber-200 bg-amber-50 text-[11px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
                        title={`This window intersects ${tableOverlaps.map((o) => o.code).join(', ')} — payroll refuses to price while same-code windows overlap. Close one of them.`}
                        data-testid="rate-table-overlap"
                      >
                        Overlaps {tableOverlaps.length}
                      </Badge>
                    ) : null}
                    <Badge variant="outline" className="font-mono text-[11px]">{t.code}</Badge>
                    <span className="font-medium">{t.label}</span>
                    <span className="text-muted-foreground">
                      {fmtDay(t.effectiveFrom)} → {fmtDay(t.effectiveTo)}
                    </span>
                    {t.instrumentReference ? (
                      <span className="text-xs text-muted-foreground" title="Instrument reference">{t.instrumentReference}</span>
                    ) : null}
                    {t.verifyWithCounsel ? (
                      <Badge variant="outline" className="text-[10px] text-amber-700 dark:text-amber-300" title="Rates flagged for counsel verification before reliance">
                        verify with counsel
                      </Badge>
                    ) : null}
                    <span className="text-xs text-muted-foreground">{t.rows.length} row{t.rows.length === 1 ? '' : 's'}</span>
                    {canManage && t.effectiveTo === null ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={() => setCloseTarget(t)}
                        data-testid="rate-table-close"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                        Close window
                      </Button>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))
      )}

      <CreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          setCreateOpen(false);
          void load();
        }}
        onError={setError}
      />
      <CloseDialog
        key={closeTarget?.id ?? 'none'}
        target={closeTarget}
        overlaps={closeTarget ? (overlaps.get(closeTarget.id) ?? []) : []}
        onOpenChange={(o) => {
          if (!o) setCloseTarget(null);
        }}
        onClosed={() => {
          setCloseTarget(null);
          void load();
        }}
        onError={setError}
      />
    </div>
  );
}

function CreateDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: () => void;
  onError?: (m: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [type, setType] = useState<string>('PAYE');
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [basis, setBasis] = useState('MONTHLY');
  const [instrument, setInstrument] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [rows, setRows] = useState<RowDraft[]>([{ ...EMPTY_ROW }]);

  const reset = () => {
    setType('PAYE');
    setCode('');
    setLabel('');
    setBasis('MONTHLY');
    setInstrument('');
    setEffectiveFrom('');
    setEffectiveTo('');
    setRows([{ ...EMPTY_ROW }]);
    setFormError(null);
  };

  const submit = async () => {
    setFormError(null);
    setBusy(true);
    try {
      const payload = {
        type,
        code,
        label,
        basis,
        instrumentReference: instrument || undefined,
        effectiveFrom,
        effectiveTo: effectiveTo || null,
        rows: rows.map((r, i) => ({
          order: i,
          lowerBoundCents: Math.round(Number(r.lowerBound || 0) * 100),
          upperBoundCents: r.upperBound ? Math.round(Number(r.upperBound) * 100) : null,
          rateBps: r.rateBps ? Number(r.rateBps) : null,
          flatAmountCents: r.flat ? Math.round(Number(r.flat) * 100) : null,
          reliefCents: r.relief ? Math.round(Number(r.relief) * 100) : null,
          employerMatchBps: r.employerMatchBps ? Number(r.employerMatchBps) : null,
        })),
      };
      const res = await fetch('/api/hr/rate-tables', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = (await res.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!res.ok || !j?.success) {
        setFormError(j?.error || `The insert was refused (${res.status}).`);
        return;
      }
      reset();
      onCreated();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New statutory table version</DialogTitle>
          <DialogDescription>
            Insert-only versioning: the new window must not intersect an existing window of the same
            type and code — payroll refuses to price while same-code windows overlap, so this desk
            refuses to create that state.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="rt-type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="rt-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RATE_TABLE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="rt-basis">Basis</Label>
            <Select value={basis} onValueChange={setBasis}>
              <SelectTrigger id="rt-basis"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['MONTHLY', 'DAILY', 'HOURLY', 'ANNUAL'].map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="rt-code">Code (version name within the type)</Label>
            <Input id="rt-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. 2026-finance-act" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rt-label">Label</Label>
            <Input id="rt-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Finance Act 2026 bands" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rt-from">Effective from</Label>
            <Input id="rt-from" type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rt-to">Effective to (optional — leave open)</Label>
            <Input id="rt-to" type="date" value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="rt-instrument">Instrument reference</Label>
            <Input id="rt-instrument" value={instrument} onChange={(e) => setInstrument(e.target.value)} placeholder="e.g. Finance Act 2026, First Schedule" />
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Rate rows (amounts in KES; rates in basis points)</Label>
            <Button variant="outline" size="sm" onClick={() => setRows((rs) => [...rs, { ...EMPTY_ROW }])}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Add row
            </Button>
          </div>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 rounded-md border p-2 sm:grid-cols-6" data-testid="rate-row-editor">
              <div className="space-y-1">
                <Label className="text-[10px]">Lower (KES)</Label>
                <Input inputMode="decimal" value={r.lowerBound} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, lowerBound: e.target.value } : x)))} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Upper (KES)</Label>
                <Input inputMode="decimal" value={r.upperBound} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, upperBound: e.target.value } : x)))} placeholder="∞" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Rate (bps)</Label>
                <Input inputMode="numeric" value={r.rateBps} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, rateBps: e.target.value } : x)))} placeholder="—" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Flat (KES)</Label>
                <Input inputMode="decimal" value={r.flat} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, flat: e.target.value } : x)))} placeholder="—" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Relief (KES)</Label>
                <Input inputMode="decimal" value={r.relief} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, relief: e.target.value } : x)))} placeholder="—" />
              </div>
              <div className="flex items-end gap-1">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px]">Empl. (bps)</Label>
                  <Input inputMode="numeric" value={r.employerMatchBps} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, employerMatchBps: e.target.value } : x)))} placeholder="—" />
                </div>
                {rows.length > 1 ? (
                  <Button variant="ghost" size="sm" aria-label={`Remove row ${i + 1}`} onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        {formError ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300" role="alert" data-testid="rate-table-form-error">
            {formError}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={busy} data-testid="rate-table-submit">
            {busy ? 'Inserting…' : 'Insert version'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


/** The suggested close date (PURE): the day before the earliest overlapping
 * sibling's begin — the minimal shrink that clears every intersection — or
 * today when the window stands alone. */
function suggestedCloseDate(target: RateTableDto | null, overlaps: RateTableDto[]): string {
  if (!target) return new Date().toISOString().slice(0, 10);
  const fromTs = new Date(target.effectiveFrom).getTime();
  const siblingFroms = overlaps
    .map((o) => new Date(o.effectiveFrom).getTime())
    .filter((ts) => ts > fromTs);
  return siblingFroms.length > 0
    ? new Date(Math.min(...siblingFroms) - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
}

function CloseDialog({
  target,
  overlaps,
  onOpenChange,
  onClosed,
}: {
  target: RateTableDto | null;
  overlaps: RateTableDto[];
  onOpenChange: (o: boolean) => void;
  onClosed: () => void;
  onError?: (m: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  // The dialog is KEYED by the target's id (the parent remounts it per
  // target), so the suggested close initializes ONCE per target with no
  // effect needed: when this window overlaps a sibling, end it the day
  // before the EARLIEST overlapping window begins — the minimal shrink
  // that removes every intersection. No overlap → suggest today.
  const [date, setDate] = useState(() => suggestedCloseDate(target, overlaps));
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    if (!target) return;
    setFormError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/hr/rate-tables/${target.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ effectiveTo: date }),
      });
      const j = (await res.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!res.ok || !j?.success) {
        setFormError(j?.error || `The close was refused (${res.status}).`);
        return;
      }
      onClosed();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Close {target?.label ? `"${target.label}"` : 'window'}</DialogTitle>
          <DialogDescription>
            Closing sets the window{'\u2019'}s end date — the table keeps its rows and every payslip it priced
            stays priced by it. It simply stops answering for dates after the close.
          </DialogDescription>
        </DialogHeader>
        {overlaps.length > 0 ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            This window overlaps {overlaps.map((o) => `"${o.label}"`).join(', ')}. Payroll refuses to price
            while same-code windows intersect — the suggested date below is the minimal shrink that clears
            every intersection.
          </p>
        ) : null}
        <div className="space-y-1">
          <Label htmlFor="rt-close-date">Effective to</Label>
          <Input id="rt-close-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {formError ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300" role="alert" data-testid="rate-table-close-error">
            {formError}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={busy || !date} data-testid="rate-table-close-submit">
            {busy ? 'Closing…' : 'Close window'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
