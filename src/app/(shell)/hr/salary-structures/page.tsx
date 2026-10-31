'use client';

// MBUMAH HARDWARE POS - /hr/salary-structures (v2.304.0)
//
// The salary desk: the management face the issue rows' honest-null law had
// to leave doorless (UNRESOLVED_DEPENDENCY — "salary structures have no
// management UI"). The run service has always read these structures (the
// newest structure that has begun answers; its components feed the payslip);
// this desk finally writes them.
//
// The desk's law: what it shows agrees with what payroll will pay, BY
// CONSTRUCTION — the in-force marker, the status chips and the component
// estimates run the same pure predicates and the same arithmetic as the run
// service (salary-structure-view.ts), the same-day guard replicates the
// engine's tie resolution at write time (two structures beginning the same
// day resolve by input order — a coin flip, not versioning — so the desk
// refuses to create that state), and there is NO close-window affordance:
// the engine ignores `effectiveTo`, so a close that would not stop payment
// would be a lie with a button on it. The one honest off-switch is
// WITHDRAW (soft delete): future runs stop reading the structure; issued
// payslips keep their numbers.
//
// Capability is honest: the write affordances render only for the role the
// session API reports (hr.salary-structure.manage = HR_MANAGER/STORE_OWNER),
// the API guards stay the fail-closed authority, and the service's refusal
// messages speak verbatim in the dialogs — the same voice the issue rows
// carry.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Banknote,
  CheckCircle2,
  Clock,
  Coins,
  History,
  Layers,
  PenLine,
  Plus,
  RefreshCw,
  ShieldAlert,
  Undo2,
  Wallet,
} from 'lucide-react';
import {
  PAY_FREQUENCIES,
  SALARY_COMPONENT_COMPUTATIONS,
  SALARY_COMPONENT_TYPES,
  assignmentValueWords,
  formatKes,
  resolveComponentCents,
  salaryStructureInForce,
  salaryStructureSameDayClashes,
  salaryStructureStatus,
  salaryStructureWindowLapsed,
  type SalaryComponentType,
  type SalaryStructureStatus,
} from '@/lib/hr/salary-structure-view';

interface ComponentDto {
  id: string;
  code: string;
  name: string;
  type: string;
  computation: string;
  amountCents: number | null;
  percentBps: number | null;
  isTaxable: boolean;
  isActive: boolean;
}

interface AssignmentDto {
  id: string;
  salaryComponentId: string;
  overrideAmountCents: number | null;
  overridePercentBps: number | null;
  salaryComponent: ComponentDto;
}

interface StructureDto {
  id: string;
  employeeId: string;
  payFrequency: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  deletedAt: string | null;
  employee: { id: string; firstName: string; lastName: string; employeeCode: string | null; basicSalary: string | number };
  components: AssignmentDto[];
}

interface EmployeeDto {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
}

/** The status chip's own face — one family per lifecycle state, same tone
 * law as the issue rows (color never carries the meaning alone: the label
 * says the word). */
const STATUS_FACES: Record<SalaryStructureStatus, { chip: string; label: string }> = {
  ACTIVE: {
    chip: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
    label: 'Active',
  },
  SCHEDULED: {
    chip: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900',
    label: 'Scheduled',
  },
  SUPERSEDED: {
    chip: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-950/50 dark:text-slate-300 dark:border-slate-800',
    label: 'Superseded',
  },
};

const TYPE_FACES: Record<string, { chip: string; label: string }> = {
  EARNING: {
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    label: 'Earning',
  },
  DEDUCTION: {
    chip: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
    label: 'Deduction',
  },
  EMPLOYER_CONTRIBUTION: {
    chip: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900',
    label: 'Employer contribution',
  },
};

const fmtDay = (iso: string | null) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : 'open';

/** The component's engine-read value as the row chip's words: the flat
 * amount, else the percent of basic — the SAME resolution the run service
 * runs (amountCents first, percent second). */
function componentValueWords(c: ComponentDto): string {
  if (c.amountCents != null) return `KES ${formatKes(c.amountCents)}`;
  if (c.percentBps != null) return `${(c.percentBps / 100).toLocaleString('en-KE')}% of basic`;
  return 'no value';
}

/** The per-employee override face (v2.305.0): the amber chip that rides an
 * attached component's badge when the assignment — not the catalog — is
 * what payroll pays. The title names the catalog default the override
 * replaced: the word "override" never stands without the number it beat. */
const OVERRIDE_CHIP = 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300';

function StatusChip({ structure, now, inForceId }: { structure: StructureDto; now: Date; inForceId: string | null }) {
  const status = salaryStructureStatus(structure, now, inForceId);
  const face = STATUS_FACES[status];
  return (
    <Badge variant="outline" className={`text-[11px] ${face.chip}`} data-testid="salary-structure-status" data-status={status}>
      {face.label}
    </Badge>
  );
}

export default function SalaryStructuresPage() {
  const [structures, setStructures] = useState<StructureDto[] | null>(null);
  const [components, setComponents] = useState<ComponentDto[] | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const [error, setError] = useState<string | null>(null);

  const [structureOpen, setStructureOpen] = useState(false);
  const [componentOpen, setComponentOpen] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<StructureDto | null>(null);

  const load = useCallback(async () => {
    try {
      const [meRes, structRes, compRes] = await Promise.all([
        fetch('/api/auth/me', { credentials: 'include' }),
        fetch('/api/hr/salary-structures?scope=all', { credentials: 'include' }),
        fetch('/api/hr/salary-components', { credentials: 'include' }),
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
      const sj = (await structRes.json().catch(() => null)) as { data?: StructureDto[] } | null;
      setStructures(sj?.data ?? []);
      const cj = (await compRes.json().catch(() => null)) as { data?: ComponentDto[] } | null;
      setComponents(cj?.data ?? []);
      setNow(new Date());
    } catch {
      setError('Could not reach the salary read. Try Refresh.');
      setStructures([]);
      setComponents([]);
    }
  }, []);

  useEffect(() => {
    // Microtask-deferred (the timesheets desk's own hydration law): the
    // effect must not reach setState synchronously — the load's writes all
    // live past awaits, and the defer makes that true for the CALL too.
    void Promise.resolve().then(() => load());
  }, [load]);

  const canManage = role === 'SUPER_ADMIN' || role === 'HR_MANAGER' || role === 'STORE_OWNER';

  const living = useMemo(() => (structures ?? []).filter((s) => !s.deletedAt), [structures]);
  const inForceByEmployee = useMemo(() => {
    const map = new Map<string, StructureDto | null>();
    const byEmployee = new Map<string, StructureDto[]>();
    for (const s of living) {
      const list = byEmployee.get(s.employeeId) ?? [];
      list.push(s);
      byEmployee.set(s.employeeId, list);
    }
    for (const [employeeId, list] of byEmployee) {
      map.set(employeeId, salaryStructureInForce(list, now));
    }
    return map;
  }, [living, now]);

  const clashes = useMemo(() => salaryStructureSameDayClashes(living), [living]);

  const tally = useMemo(() => {
    const statuses = living.map((s) => salaryStructureStatus(s, now, inForceByEmployee.get(s.employeeId)?.id ?? null));
    return {
      active: statuses.filter((x) => x === 'ACTIVE').length,
      scheduled: statuses.filter((x) => x === 'SCHEDULED').length,
      superseded: statuses.filter((x) => x === 'SUPERSEDED').length,
      components: (components ?? []).filter((c) => c.isActive).length,
    };
  }, [living, now, inForceByEmployee, components]);

  const byEmployee = useMemo(() => {
    // The FULL fetched history groups under each employee (withdrawn rows
    // render dimmed at the end — a structure never edits in place, and the
    // withdrawal is part of the record); the in-force law runs on `living`.
    const map = new Map<string, { employee: StructureDto['employee']; structures: StructureDto[] }>();
    for (const s of structures ?? []) {
      const entry = map.get(s.employeeId) ?? { employee: s.employee, structures: [] };
      entry.structures.push(s);
      map.set(s.employeeId, entry);
    }
    for (const entry of map.values()) {
      entry.structures.sort((a, b) => {
        if (!!a.deletedAt !== !!b.deletedAt) return a.deletedAt ? 1 : -1;
        return new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime();
      });
    }
    return [...map.values()].sort((a, b) =>
      `${a.employee.firstName} ${a.employee.lastName}`.localeCompare(`${b.employee.firstName} ${b.employee.lastName}`),
    );
  }, [structures]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6" data-testid="salary-structures-page">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Wallet className="h-5 w-5 text-emerald-700" aria-hidden />
            Salary structures
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            The component catalog and the per-employee pay versions payroll resolves by period date. A pay
            change is a new structure on its own day — the newest-begun structure answers, issued payslips
            keep the numbers they were paid by. What this desk shows agrees with what payroll will pay.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} data-testid="salary-structures-refresh">
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </Button>
          {canManage ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setComponentOpen(true)} data-testid="salary-components-create">
                <Coins className="h-4 w-4" aria-hidden />
                New component
              </Button>
              <Button size="sm" onClick={() => setStructureOpen(true)} data-testid="salary-structures-create">
                <Plus className="h-4 w-4" aria-hidden />
                New structure
              </Button>
            </>
          ) : (
            <Badge variant="outline" className="gap-1 text-[11px]" title="Catalog and structure writes are hr.salary-structure.manage (HR_MANAGER / STORE_OWNER)">
              <ShieldAlert className="h-3 w-3" aria-hidden />
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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4" data-testid="salary-structures-tally">
        {[
          { icon: CheckCircle2, label: 'In force now', value: tally.active, tone: 'text-emerald-700 dark:text-emerald-300' },
          { icon: Clock, label: 'Scheduled', value: tally.scheduled, tone: 'text-sky-700 dark:text-sky-300' },
          { icon: History, label: 'Superseded', value: tally.superseded, tone: 'text-slate-600 dark:text-slate-300' },
          { icon: Layers, label: 'Components active', value: tally.components, tone: 'text-emerald-700 dark:text-emerald-300' },
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

      {structures === null || components === null ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <>
          {/* — the structures, grouped by employee — */}
          <section className="space-y-3" data-testid="salary-structures-section">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Wallet className="h-4 w-4" aria-hidden />
              Structures by employee
              <span className="font-normal">{byEmployee.length} employee{byEmployee.length === 1 ? '' : 's'} on file</span>
            </h2>
            {byEmployee.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No salary structures on file yet — every employee is paid basic salary only. Build the
                  component catalog first, then give each employee a structure that attaches their earnings
                  and deductions.
                </CardContent>
              </Card>
            ) : (
              byEmployee.map(({ employee, structures: list }) => {
                const inForce = inForceByEmployee.get(employee.id) ?? null;
                const basicKes = Number(employee.basicSalary);
                const active = inForce
                  ? inForce.components
                      .filter((a) => a.salaryComponent.isActive)
                      .map((a) => ({ a, cents: resolveComponentCents(a.salaryComponent, basicKes, a) }))
                  : [];
                const overriddenCodes = active.filter((x) => x.a.overrideAmountCents != null || x.a.overridePercentBps != null).map((x) => x.a.salaryComponent.code);
                const earnings = active.filter((x) => x.a.salaryComponent.type === 'EARNING').reduce((sum, x) => sum + x.cents, 0);
                const deductions = active.filter((x) => x.a.salaryComponent.type === 'DEDUCTION').reduce((sum, x) => sum + x.cents, 0);
                return (
                  <Card key={employee.id} data-testid="salary-employee-group">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
                        {employee.firstName} {employee.lastName}
                        {employee.employeeCode ? <Badge variant="outline" className="font-mono text-[11px]">{employee.employeeCode}</Badge> : null}
                        <span className="text-xs font-normal text-muted-foreground">basic KES {formatKes(Math.round(basicKes * 100))}</span>
                        {inForce ? (
                          <span className="text-xs font-normal text-muted-foreground" data-testid="salary-inforce-estimate">
                            in force: KES {formatKes(Math.round(basicKes * 100) + earnings)} gross · KES {formatKes(deductions)} deductions
                            {overriddenCodes.length > 0 ? (
                              <span
                                className="ml-1 font-medium text-amber-700 dark:text-amber-300"
                                title={`Per-employee override(s) included: ${overriddenCodes.join(', ')} — the same resolution the run service pays.`}
                              >
                                · {overriddenCodes.length} override{overriddenCodes.length === 1 ? '' : 's'}
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <Badge variant="outline" className="text-[11px] text-amber-700 dark:text-amber-300">
                            basic-only pay
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>Newest-begun first; a structure never edits in place.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {list.map((s) => {
                        const withdrawn = !!s.deletedAt;
                        const status = salaryStructureStatus(s, now, inForce?.id ?? null);
                        const lapsed = salaryStructureWindowLapsed(s, now);
                        const clash = clashes.get(`${s.employeeId}|${new Date(s.effectiveFrom).getTime()}`) ?? [];
                        const attached = s.components;
                        return (
                          <div
                            key={s.id}
                            data-testid="salary-structure-row"
                            className={`flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors ${withdrawn ? 'opacity-60' : 'hover:bg-muted/40'}`}
                          >
                            {withdrawn ? (
                              <Badge variant="outline" className="text-[11px] bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-950/50 dark:text-slate-400 dark:border-slate-800" data-testid="salary-structure-withdrawn-chip">
                                Withdrawn
                              </Badge>
                            ) : (
                              <StatusChip structure={s} now={now} inForceId={inForce?.id ?? null} />
                            )}
                            {!withdrawn && lapsed ? (
                              <Badge
                                variant="outline"
                                className="border-amber-200 bg-amber-50 text-[11px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
                                title={`The window ended ${fmtDay(s.effectiveTo)}, but no newer structure has begun — payroll still reads this one. The fix is a newer version, not the old window's end date.`}
                                data-testid="salary-structure-lapsed"
                              >
                                Lapsed window, still in force
                              </Badge>
                            ) : null}
                            {!withdrawn && clash.length > 1 ? (
                              <Badge
                                variant="outline"
                                className="border-amber-200 bg-amber-50 text-[11px] text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300"
                                title={`${clash.length} structures begin ${fmtDay(s.effectiveFrom)} — payroll resolves the tie by record order. Withdraw one and re-date it.`}
                                data-testid="salary-structure-clash"
                              >
                                Same-day ×{clash.length}
                              </Badge>
                            ) : null}
                            <Badge variant="outline" className="font-mono text-[11px]">{s.payFrequency}</Badge>
                            <span className="text-muted-foreground">
                              from {fmtDay(s.effectiveFrom)} → {fmtDay(s.effectiveTo)}
                            </span>
                            {attached.length > 0 ? (
                              <span className="flex flex-wrap items-center gap-1">
                                {attached.map((a) => {
                                  const value = assignmentValueWords(a.salaryComponent, a);
                                  return (
                                    <span key={a.id} className="inline-flex items-center gap-1">
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] ${
                                          a.salaryComponent.isActive
                                            ? TYPE_FACES[a.salaryComponent.type]?.chip ?? ''
                                            : 'border-slate-200 bg-slate-50 text-slate-400 line-through dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500'
                                        }`}
                                        title={
                                          a.salaryComponent.isActive
                                            ? `${a.salaryComponent.name} — payroll pays ${value.words}`
                                            : `${a.salaryComponent.name} — inactive; payroll skips it`
                                        }
                                      >
                                        {a.salaryComponent.code} · {value.words}
                                      </Badge>
                                      {a.salaryComponent.isActive && value.overridden ? (
                                        <Badge
                                          variant="outline"
                                          className={`gap-0.5 text-[10px] ${OVERRIDE_CHIP}`}
                                          title={`Per-employee override — the catalog default (${value.catalogWords}) pays everyone else; this employee pays ${value.words}.`}
                                          data-testid="salary-override-badge"
                                          data-component-code={a.salaryComponent.code}
                                        >
                                          <PenLine className="h-2.5 w-2.5" aria-hidden />
                                          override
                                        </Badge>
                                      ) : null}
                                    </span>
                                  );
                                })}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">no components attached</span>
                            )}
                            {canManage && !withdrawn ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                                onClick={() => setWithdrawTarget(s)}
                                data-testid="salary-structure-withdraw"
                              >
                                <Undo2 className="h-3.5 w-3.5" aria-hidden />
                                Withdraw
                              </Button>
                            ) : null}
                            {withdrawn ? (
                              <span className="ml-auto text-[11px] text-muted-foreground" data-testid="salary-structure-withdrawn">
                                withdrawn {s.deletedAt ? new Date(s.deletedAt).toISOString().slice(0, 10) : ''}
                              </span>
                            ) : null}
                            {!withdrawn ? <span className="sr-only">Status {STATUS_FACES[status].label}</span> : null}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </section>

          <Separator />

          {/* — the component catalog — */}
          <section className="space-y-3" data-testid="salary-components-section">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Coins className="h-4 w-4" aria-hidden />
              Component catalog
              <span className="font-normal">{(components ?? []).length} component{(components ?? []).length === 1 ? '' : 's'}</span>
            </h2>
            {(components ?? []).length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  The catalog is empty — no component exists for payroll to attach. Add the earnings and
                  deductions your payslips need (house, transport, medical, sacco…); each one carries the
                  flat amount or the percent of basic that payroll pays.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="space-y-2 pt-4">
                  {(components ?? []).map((c) => (
                    <div
                      key={c.id}
                      data-testid="salary-component-row"
                      className="flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/40"
                    >
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${TYPE_FACES[c.type]?.chip ?? ''}`}
                        data-component-type={c.type}
                      >
                        {TYPE_FACES[c.type]?.label ?? c.type}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-[11px]">{c.code}</Badge>
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">{componentValueWords(c)}</span>
                      <Badge variant="outline" className="text-[10px]">{c.computation}</Badge>
                      {c.isTaxable ? (
                        <span className="text-[11px] text-muted-foreground">taxable</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">tax-exempt</span>
                      )}
                      {c.isActive ? (
                        <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-300">active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-slate-500 dark:text-slate-400">inactive — payroll skips</Badge>
                      )}
                      {canManage ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                          onClick={() => void toggleComponent(c, !c.isActive)}
                          data-testid={`salary-component-${c.isActive ? 'deactivate' : 'activate'}`}
                        >
                          {c.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </section>
        </>
      )}

      <CreateStructureDialog
        open={structureOpen}
        onOpenChange={setStructureOpen}
        components={components ?? []}
        onCreated={() => {
          setStructureOpen(false);
          void load();
        }}
        onError={setError}
      />
      <CreateComponentDialog
        open={componentOpen}
        onOpenChange={setComponentOpen}
        onCreated={() => {
          setComponentOpen(false);
          void load();
        }}
        onError={setError}
      />
      <WithdrawDialog
        key={withdrawTarget?.id ?? 'none'}
        target={withdrawTarget}
        onOpenChange={(o) => {
          if (!o) setWithdrawTarget(null);
        }}
        onWithdrawn={() => {
          setWithdrawTarget(null);
          void load();
        }}
        onError={setError}
      />
    </div>
  );

  async function toggleComponent(c: ComponentDto, next: boolean) {
    setError(null);
    try {
      const res = await fetch(`/api/hr/salary-components/${c.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: next }),
      });
      const j = (await res.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!res.ok || !j?.success) {
        setError(j?.error || `The ${next ? 'activation' : 'deactivation'} was refused (${res.status}).`);
        return;
      }
      void load();
    } catch {
      setError('Could not reach the salary write. Check your connection and try again.');
    }
  }
}

function CreateStructureDialog({
  open,
  onOpenChange,
  components,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  components: ComponentDto[];
  onCreated: () => void;
  onError?: (m: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeDto[] | null>(null);
  const [employeeId, setEmployeeId] = useState('');
  const [payFrequency, setPayFrequency] = useState('MONTHLY');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  // v2.305.0 — per-employee overrides, keyed by component id. Sparse by
  // design: an absent entry means "catalog value pays"; an empty string
  // means the same. The input rides its component's OWN basis — flat
  // components take a KES override, percent components take a bps override
  // (the service refuses a cross-basis override with BAD_OVERRIDE_BASIS).
  const [overrides, setOverrides] = useState<Record<string, { amount: string; percent: string }>>({});

  useEffect(() => {
    if (!open || employees !== null) return;
    void Promise.resolve().then(async () => {
      try {
        const res = await fetch('/api/hr/employees', { credentials: 'include' });
        const j = (await res.json().catch(() => null)) as { data?: EmployeeDto[] } | null;
        setEmployees(j?.data ?? []);
      } catch {
        setEmployees([]);
      }
    });
  }, [open, employees]);

  const activeComponents = components.filter((c) => c.isActive);

  const reset = () => {
    setEmployeeId('');
    setPayFrequency('MONTHLY');
    setEffectiveFrom('');
    setEffectiveTo('');
    setPicked([]);
    setOverrides({});
    setFormError(null);
  };

  const submit = async () => {
    setFormError(null);
    // Client-side honesty: a typed-but-invalid override is refused HERE —
    // never silently dropped on the way to the server.
    for (const id of picked) {
      const c = components.find((x) => x.id === id);
      if (!c) continue;
      const amountRaw = overrides[id]?.amount?.trim() ?? '';
      const percentRaw = overrides[id]?.percent?.trim() ?? '';
      if (amountRaw) {
        const n = Number(amountRaw);
        if (!Number.isFinite(n) || n < 0) {
          setFormError(`The ${c.code} override must be a non-negative amount (KES).`);
          return;
        }
      }
      if (percentRaw) {
        const n = Number(percentRaw);
        if (!Number.isInteger(n) || n < 0 || n > 10_000) {
          setFormError(`The ${c.code} override must be a whole number of basis points between 0 and 10,000 (e.g. 500 = 5%).`);
          return;
        }
      }
    }
    const componentEntries = picked.map((id) => {
      const amountRaw = overrides[id]?.amount?.trim() ?? '';
      const percentRaw = overrides[id]?.percent?.trim() ?? '';
      return {
        salaryComponentId: id,
        ...(amountRaw ? { overrideAmountCents: Math.round(Number(amountRaw) * 100) } : {}),
        ...(percentRaw ? { overridePercentBps: Number(percentRaw) } : {}),
      };
    });
    setBusy(true);
    try {
      const res = await fetch('/api/hr/salary-structures', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          payFrequency,
          effectiveFrom,
          effectiveTo: effectiveTo || null,
          components: componentEntries,
        }),
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
          <DialogTitle>New salary structure</DialogTitle>
          <DialogDescription>
            A pay change is a new structure on its own day: the newest-begun structure answers for the
            employee, and two structures may never begin the same day — payroll would resolve that tie by
            record order, so this desk refuses to create it.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="ss-employee">Employee</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger id="ss-employee" data-testid="ss-employee-select"><SelectValue placeholder="Pick the employee" /></SelectTrigger>
              <SelectContent>
                {(employees ?? []).filter((e) => e.status === 'ACTIVE').map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="ss-frequency">Pay frequency</Label>
            <Select value={payFrequency} onValueChange={setPayFrequency}>
              <SelectTrigger id="ss-frequency" data-testid="ss-frequency-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAY_FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="ss-from">Effective from</Label>
            <Input id="ss-from" type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ss-to">Effective to (optional — leave open)</Label>
            <Input id="ss-to" type="date" value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} />
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Components to attach — payroll pays each one&rsquo;s catalog value; an override on a picked row pays this employee instead</Label>
            <span className="text-[11px] text-muted-foreground" data-testid="ss-picked-count">{picked.length} picked</span>
          </div>
          {activeComponents.length === 0 ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
              No active components in the catalog yet — the structure would attach nothing and the employee
              stays on basic-only pay. Add components first if you need earnings beyond basic.
            </p>
          ) : (
            <div className="space-y-1.5" data-testid="ss-component-picker">
              {activeComponents.map((c) => {
                const isPicked = picked.includes(c.id);
                return (
                  <div
                    key={c.id}
                    data-testid="ss-component-option"
                    data-picked={isPicked || undefined}
                    className={`rounded-md border bg-background px-3 py-2 text-sm transition-colors ${
                      isPicked
                        ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
                        : 'hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                        <Checkbox
                          checked={isPicked}
                          onCheckedChange={(v) => setPicked((p) => (v ? [...p, c.id] : p.filter((x) => x !== c.id)))}
                          aria-label={`Attach ${c.name}`}
                        />
                        <Badge variant="outline" className="font-mono text-[10px]">{c.code}</Badge>
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground">{componentValueWords(c)}</span>
                      </label>
                      {isPicked && c.amountCents != null ? (
                        <div className="flex items-center gap-1.5">
                          <PenLine className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                          <Input
                            data-testid="ss-override-input"
                            data-override-basis="flat"
                            inputMode="decimal"
                            value={overrides[c.id]?.amount ?? ''}
                            onChange={(e) =>
                              setOverrides((o) => ({ ...o, [c.id]: { amount: e.target.value, percent: o[c.id]?.percent ?? '' } }))
                            }
                            placeholder="catalog default"
                            aria-label={`Override ${c.code} flat amount (KES); leave empty for the catalog default`}
                            className="h-7 w-40 border-amber-300 font-mono text-xs tabular-nums focus-visible:ring-amber-400 dark:border-amber-800"
                          />
                          <span className="text-[11px] text-muted-foreground">KES override</span>
                        </div>
                      ) : null}
                      {isPicked && c.amountCents == null && c.percentBps != null ? (
                        <div className="flex items-center gap-1.5">
                          <PenLine className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                          <Input
                            data-testid="ss-override-input"
                            data-override-basis="percent"
                            inputMode="numeric"
                            value={overrides[c.id]?.percent ?? ''}
                            onChange={(e) =>
                              setOverrides((o) => ({ ...o, [c.id]: { amount: o[c.id]?.amount ?? '', percent: e.target.value } }))
                            }
                            placeholder={`${(c.percentBps / 100).toLocaleString('en-KE')}% = ${c.percentBps}`}
                            aria-label={`Override ${c.code} percent of basic (basis points); leave empty for the catalog default`}
                            className="h-7 w-36 border-amber-300 font-mono text-xs tabular-nums focus-visible:ring-amber-400 dark:border-amber-800"
                          />
                          <span className="text-[11px] text-muted-foreground">bps override</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {formError ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300" role="alert" data-testid="salary-structure-form-error">
            {formError}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={busy || !employeeId || !effectiveFrom} data-testid="salary-structure-submit">
            {busy ? 'Inserting…' : 'Insert structure'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateComponentDialog({
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
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<SalaryComponentType>('EARNING');
  const [computation, setComputation] = useState('FIXED');
  const [amount, setAmount] = useState('');
  const [percentBps, setPercentBps] = useState('');
  const [isTaxable, setIsTaxable] = useState(true);

  const reset = () => {
    setCode('');
    setName('');
    setType('EARNING');
    setComputation('FIXED');
    setAmount('');
    setPercentBps('');
    setIsTaxable(true);
    setFormError(null);
  };

  const submit = async () => {
    setFormError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/hr/salary-components', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          name,
          type,
          computation,
          amountCents: amount.trim() ? Math.round(Number(amount) * 100) : null,
          percentBps: percentBps.trim() ? Number(percentBps) : null,
          isTaxable,
        }),
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New salary component</DialogTitle>
          <DialogDescription>
            The catalog is the vocabulary payroll reads: each attached component pays its OWN flat amount
            or its percent of the employee&rsquo;s basic salary. Give it at least one value the engine can
            resolve.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="sc-code">Code</Label>
            <Input id="sc-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SACCO" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sc-name">Name</Label>
            <Input id="sc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sacco repayment" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sc-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as SalaryComponentType)}>
              <SelectTrigger id="sc-type" data-testid="sc-type-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SALARY_COMPONENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="sc-computation">Computation</Label>
            <Select value={computation} onValueChange={setComputation}>
              <SelectTrigger id="sc-computation" data-testid="sc-computation-select"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SALARY_COMPONENT_COMPUTATIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="sc-amount">Flat amount (KES)</Label>
            <Input id="sc-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="—" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sc-percent">Percent of basic (bps)</Label>
            <Input id="sc-percent" inputMode="numeric" value={percentBps} onChange={(e) => setPercentBps(e.target.value)} placeholder="e.g. 500 = 5%" />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-2">
            <Checkbox checked={isTaxable} onCheckedChange={(v) => setIsTaxable(v === true)} aria-label="Taxable component" />
            <Banknote className="h-4 w-4 text-muted-foreground" aria-hidden />
            Taxable (PAYE applies to this component)
          </label>
        </div>
        {formError ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300" role="alert" data-testid="salary-component-form-error">
            {formError}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={() => void submit()} disabled={busy} data-testid="salary-component-submit">
            {busy ? 'Inserting…' : 'Add component'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WithdrawDialog({
  target,
  onOpenChange,
  onWithdrawn,
}: {
  target: StructureDto | null;
  onOpenChange: (o: boolean) => void;
  onWithdrawn: () => void;
  onError?: (m: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async () => {
    if (!target) return;
    setFormError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/hr/salary-structures/${target.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'withdraw' }),
      });
      const j = (await res.json().catch(() => null)) as { success?: boolean; error?: string } | null;
      if (!res.ok || !j?.success) {
        setFormError(j?.error || `The withdraw was refused (${res.status}).`);
        return;
      }
      onWithdrawn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={!!target} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Withdraw this structure?</DialogTitle>
          <DialogDescription>
            Withdrawal is the one honest off-switch: future runs stop reading the structure and the
            employee falls back to basic salary until a newer version begins. Issued payslips keep the
            numbers they were paid by. There is no close-window button here on purpose — payroll ignores
            the window&rsquo;s end date, so closing it would not stop payment.
          </DialogDescription>
        </DialogHeader>
        {target ? (
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
            <span className="font-medium">{target.employee.firstName} {target.employee.lastName}</span>
            {' · '}{target.payFrequency} · from {fmtDay(target.effectiveFrom)} → {fmtDay(target.effectiveTo)}
            {' · '}{target.components.length} component{target.components.length === 1 ? '' : 's'} attached
          </p>
        ) : null}
        {formError ? (
          <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300" role="alert" data-testid="salary-structure-withdraw-error">
            {formError}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button variant="destructive" onClick={() => void submit()} disabled={busy} data-testid="salary-structure-withdraw-submit">
            {busy ? 'Withdrawing…' : 'Withdraw structure'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
