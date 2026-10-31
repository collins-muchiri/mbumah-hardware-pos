'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, Users, FileText, ShieldAlert, Landmark } from 'lucide-react';

interface EmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  employmentType: string;
}

interface RateTableDto {
  id: string;
  type: string;
  label: string;
  instrumentReference: string;
  verifyWithCounsel: boolean;
  effectiveFrom: string;
}

interface SettingsDto {
  moduleEnabled: boolean;
}

/** v2.304.0: the salary desk's tile — the structures in force, one per
 * employee at most (the newest-begun structure answers). */
interface SalaryStructureSummary {
  id: string;
  employeeId: string;
  effectiveFrom: string;
  deletedAt: string | null;
  employee: { firstName: string; lastName: string; employeeCode: string | null };
}

/** The in-force law at a glance (mirrors salary-structure-view's
 * salaryStructureInForce — kept inline so the overview never imports a
 * desk module; the SAME selection, stated twice, both sides pinned by
 * tests). */
function inForceAt(structures: SalaryStructureSummary[], at: Date): SalaryStructureSummary | null {
  let best: SalaryStructureSummary | null = null;
  for (const s of structures) {
    if (s.deletedAt) continue;
    const from = new Date(s.effectiveFrom).getTime();
    if (from > at.getTime()) continue;
    if (!best || from > new Date(best.effectiveFrom).getTime()) best = s;
  }
  return best;
}

export default function HrOverviewPage() {
  const [employees, setEmployees] = useState<EmployeeSummary[] | null>(null);
  const [rateTables, setRateTables] = useState<RateTableDto[] | null>(null);
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructureSummary[] | null>(null);
  const [settings, setSettings] = useState<SettingsDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [empRes, rateRes, setRes, salRes] = await Promise.all([
          fetch('/api/hr/employees', { credentials: 'include' }),
          fetch('/api/hr/rate-tables', { credentials: 'include' }),
          fetch('/api/hr/settings', { credentials: 'include' }),
          fetch('/api/hr/salary-structures', { credentials: 'include' }),
        ]);
        if (cancelled) return;
        if (!empRes.ok) {
          const body = (await empRes.json().catch(() => ({}))) as { error?: string };
          setError(body.error || `Failed to load HR data (${empRes.status}).`);
          setEmployees([]);
          return;
        }
        const emp = (await empRes.json()) as { data: EmployeeSummary[] };
        const rate = (await rateRes.json().catch(() => ({ data: [] }))) as { data: RateTableDto[] };
        const st = (await setRes.json().catch(() => ({ data: null }))) as { data: SettingsDto | null };
        const sal = (await salRes.json().catch(() => ({ data: [] }))) as { data: SalaryStructureSummary[] };
        if (cancelled) return;
        setEmployees(emp.data ?? []);
        setRateTables(rate.data ?? []);
        setSettings(st.data);
        setSalaryStructures(sal.data ?? []);
      } catch {
        if (!cancelled) {
          setError('HR workspace is unreachable. Check your connection and sign in again.');
          setEmployees([]);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const active = (employees ?? []).filter((e) => e.status === 'ACTIVE').length;
  const casual = (employees ?? []).filter((e) => e.employmentType === 'CASUAL').length;

  const stats = [
    { label: 'Active employees', value: employees ? active : null, icon: Users, hint: 'Across your store context' },
    { label: 'Casual workers', value: employees ? casual : null, icon: FileText, hint: 'Day-rate engagements' },
    { label: 'Rate tables', value: rateTables ? rateTables.length : null, icon: Landmark, hint: 'Versioned statutory data' },
    { label: 'Module flag', value: settings ? (settings.moduleEnabled ? 'On' : 'Off') : null, icon: ShieldAlert, hint: 'HR_MODULE_ENABLED' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">HR overview</h1>
        <p className="text-sm text-muted-foreground">
          Employee readiness, statutory rate data, and module status. Every figure is branch-scoped to your session.
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-xs">{stat.label}</CardDescription>
              <stat.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              {stat.value === null ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-semibold">{stat.value}</div>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Statutory rate tables in force</CardTitle>
            <CardDescription>
              Versioned data with an instrument reference. Rates marked for counsel review are defaults, not legal advice.
            </CardDescription>
          </div>
          {/* v2.303.0: the tile walks to the keeper — the management desk the
              issue rows' RATE_TABLE_MISSING / OVERLAPPING_RATE_TABLES doors
              point at lives HERE now. */}
          <a
            href="/hr/rate-tables"
            data-testid="hr-rate-tables-door"
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900 hover:ring-1 hover:ring-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200 dark:hover:ring-emerald-800"
          >
            Manage
            <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden />
          </a>
        </CardHeader>
        <CardContent>
          {rateTables === null ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : rateTables.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No rate tables visible for your organization yet. They are seeded automatically during deployment.
            </p>
          ) : (
            <ul className="divide-y rounded-md border">
              {rateTables.map((t) => (
                <li key={t.id} className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.instrumentReference}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{t.type}</Badge>
                    {t.verifyWithCounsel ? (
                      <Badge variant="secondary" className="text-[10px]">verify with counsel</Badge>
                    ) : null}
                    <span className="text-xs text-muted-foreground">
                      from {new Date(t.effectiveFrom).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* v2.304.0: the salary desk's tile — the structures in force per
          employee, with the Manage door the desk's custody deserves (same
          family tone as the keeper's door). */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Salary structures in force</CardTitle>
            <CardDescription>
              The newest-begun structure answers for each employee; a pay change is a new structure on its own day.
            </CardDescription>
          </div>
          <a
            href="/hr/salary-structures"
            data-testid="hr-salary-structures-door"
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-50 hover:text-emerald-900 hover:ring-1 hover:ring-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-200 dark:hover:ring-emerald-800"
          >
            Manage
            <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden />
          </a>
        </CardHeader>
        <CardContent>
          {salaryStructures === null ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (() => {
            // One row per employee with at least one living structure; the
            // in-force law picks what payroll reads today.
            const byEmployee = new Map<string, SalaryStructureSummary[]>();
            for (const s of salaryStructures) {
              const list = byEmployee.get(s.employeeId) ?? [];
              list.push(s);
              byEmployee.set(s.employeeId, list);
            }
            const rows = [...byEmployee.entries()]
              .map(([employeeId, list]) => ({ employeeId, inForce: inForceAt(list, new Date()), any: list[0] }))
              .filter((r): r is { employeeId: string; inForce: SalaryStructureSummary | null; any: SalaryStructureSummary } => !!r.any);
            if (rows.length === 0) {
              return (
                <p className="text-sm text-muted-foreground">
                  No salary structures on file yet — employees are paid basic salary only. The desk manages the component catalog and the per-employee versions.
                </p>
              );
            }
            return (
              <ul className="divide-y rounded-md border" data-testid="hr-salary-structures-list">
                {rows.map(({ employeeId, inForce, any }) => (
                  <li key={employeeId} className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {any.employee.firstName} {any.employee.lastName}
                      </p>
                      {any.employee.employeeCode ? (
                        <p className="truncate text-xs text-muted-foreground">{any.employee.employeeCode}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {inForce ? (
                        <>
                          <Badge variant="outline" className="text-[10px] text-emerald-700 dark:text-emerald-300">in force</Badge>
                          <span className="text-xs text-muted-foreground">from {new Date(inForce.effectiveFrom).toLocaleDateString()}</span>
                        </>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-amber-700 dark:text-amber-300">basic-only pay</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
