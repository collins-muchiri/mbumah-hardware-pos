'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, EyeOff, FilePlus2, Link2, Loader2, ShieldAlert, ShieldCheck, Unlink } from 'lucide-react';
import { useAuthStore } from '@/lib/stores';
import { canManagePortalLinks, portalRoleTone, type PortalLinkCandidate } from '@/lib/hr/portal-account';

interface EmployeeDetail {
  id: string;
  employeeCode: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  role: string;
  employmentType: string;
  status: string;
  hireDate: string;
  basicSalary?: number;
  houseAllowance?: number;
  transportAllowance?: number;
  medicalAllowance?: number;
  otherAllowances?: number;
  bankName?: string | null;
  nationalId?: string;
  kraPin?: string;
  nssfNumber?: string;
  nhifNumber?: string;
  /** v2.267.0: the login bound to this employee (null = unlinked). */
  portalUser?: PortalUserDto | null;
}

interface DocumentDto {
  id: string;
  type: string;
  fileName: string;
  expiryDate?: string | null;
  verificationStatus: string;
}

/** v2.267.0: the linked portal account rides the detail wire. */
interface PortalUserDto {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
}

const fmtKes = (n: number | undefined) =>
  typeof n === 'number'
    ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(n)
    : '-';

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [documents, setDocuments] = useState<DocumentDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unmasked, setUnmasked] = useState(false);
  const [loadingUnmask, setLoadingUnmask] = useState(false);

  const load = useCallback(
    async (withUnmask: boolean) => {
      setError(null);
      try {
        const res = await fetch(`/api/hr/employees/${id}${withUnmask ? '?unmask=1' : ''}`, {
          credentials: 'include',
        });
        const body = (await res.json()) as { success: boolean; data?: EmployeeDetail; error?: string };
        if (!res.ok || !body.success || !body.data) {
          setError(body.error || `Load failed (${res.status}).`);
          return;
        }
        setEmployee(body.data);
        setUnmasked(withUnmask);
      } catch {
        setError('Employee detail is unreachable.');
      }
    },
    [id],
  );

  useEffect(() => {
    if (id) void load(false);
  }, [id, load]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/hr/employees/${id}/documents`, { credentials: 'include' });
        const body = (await res.json()) as { success: boolean; data?: DocumentDto[] };
        if (!cancelled && body.success) setDocuments(body.data ?? []);
      } catch {
        if (!cancelled) setDocuments([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function toggleUnmask() {
    setLoadingUnmask(true);
    try {
      await load(!unmasked);
    } finally {
      setLoadingUnmask(false);
    }
  }

  if (error) {
    return (
      <Card className="border-destructive/40">
        <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const piiRows: Array<[string, string | undefined]> = [
    ['National ID', employee.nationalId],
    ['KRA PIN', employee.kraPin],
    ['NSSF number', employee.nssfNumber],
    ['NHIF/SHIF number', employee.nhifNumber],
  ];

  const payRows: Array<[string, number | undefined]> = [
    ['Basic salary', employee.basicSalary],
    ['House allowance', employee.houseAllowance],
    ['Transport allowance', employee.transportAllowance],
    ['Medical allowance', employee.medicalAllowance],
    ['Other allowances', employee.otherAllowances],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {employee.jobTitle ?? 'No job title'} · {employee.employmentType} · Code {employee.employeeCode ?? '-'} ·
            Hired {new Date(employee.hireDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={employee.status === 'ACTIVE' ? 'default' : 'outline'}>{employee.status}</Badge>
          <Button variant={unmasked ? 'secondary' : 'outline'} size="sm" onClick={toggleUnmask} disabled={loadingUnmask}>
            {unmasked ? <EyeOff className="mr-1.5 h-4 w-4" aria-hidden /> : <Eye className="mr-1.5 h-4 w-4" aria-hidden />}
            {loadingUnmask ? 'Working...' : unmasked ? 'Re-mask PII' : 'Unmask PII'}
          </Button>
        </div>
      </div>

      {unmasked ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Statutory identifiers are unmasked for this view. The read was recorded in the audit trail.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statutory identifiers</CardTitle>
            <CardDescription>Masked by default. Unmasking is permission-gated and audit logged.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {piiRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-mono text-xs">
                    {value ? (unmasked ? value : '[REDACTED]') : 'Not on file'}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pay (current record)</CardTitle>
            <CardDescription>Amounts are the live employee record; versioned structures arrive with payroll.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {payRows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium tabular-nums">{fmtKes(value)}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>

      <PortalAccountCard employee={employee} onMutated={() => void load(false)} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Documents</CardTitle>
            <CardDescription>Contracts, statutory cards, and certificates with expiry tracking.</CardDescription>
          </div>
          <FilePlus2 className="h-4 w-4 text-muted-foreground" aria-hidden />
        </CardHeader>
        <CardContent>
          {documents === null ? (
            <div className="space-y-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents registered yet.</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{d.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.type}
                      {d.expiryDate ? ` · expires ${new Date(d.expiryDate).toLocaleDateString()}` : ' · no expiry'}
                    </p>
                  </div>
                  <Badge
                    variant={d.verificationStatus === 'VERIFIED' ? 'default' : d.verificationStatus === 'REJECTED' ? 'destructive' : 'secondary'}
                    className="shrink-0 text-[10px]"
                  >
                    {d.verificationStatus}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── v2.267.0: the Portal account card ──────────────────────────────────
//
// The employee-detail face of the portal-link keystone. The binding lived
// only in the payroll tab's row dialog; the record where an HR reader
// actually reviews an employee (this page: pay, PII, documents) said
// nothing about it. The card reads `portalUser` off the detail wire and
// offers the governed door (the candidates wire + POST/DELETE
// /api/employees/[id]/portal-link) to the same trio the route enforces;
// every other role gets the honest denial voice, never a silent absence.
// The service's own messages speak verbatim — the card never paraphrases
// an outcome it did not receive.

function PortalAccountCard({ employee, onMutated }: {
  employee: EmployeeDetail;
  onMutated: () => void;
}) {
  const sessionRole = useAuthStore((s) => s.user)?.role;
  // The store's word when it has one; otherwise the SERVER's. The auth store
  // hydrates in the home shell and the workspace gateway — a DIRECT load of
  // an /hr page (fresh document, no pass through home) leaves `user` null,
  // and a client-only gate would deny the trio its own card. The candidates
  // probe is the honest tiebreak: a 200 vouches for this session's manage
  // rights (the same gate the route enforces), a 403 speaks the denial.
  const storeKnowsRole = !!sessionRole;
  const [probe, setProbe] = useState<{ ok: boolean; candidates: PortalLinkCandidate[] } | null>(null);
  const canManage = storeKnowsRole ? canManagePortalLinks(sessionRole) : probe?.ok === true;
  const linked = employee.portalUser ?? null;

  const [pickUserId, setPickUserId] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refetchCandidates = useCallback(async () => {
    try {
      const res = await fetch(`/api/employees/${employee.id}/portal-link/candidates`, { credentials: 'include' });
      const body = (await res.json()) as { success: boolean; data?: { candidates?: PortalLinkCandidate[] } };
      setProbe({ ok: res.ok, candidates: res.ok && body.success && body.data?.candidates ? body.data.candidates : [] });
    } catch {
      setProbe({ ok: false, candidates: [] });
    }
  }, [employee.id]);

  useEffect(() => {
    if (storeKnowsRole) return; // the store's word is enough — no probe
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/employees/${employee.id}/portal-link/candidates`, { credentials: 'include' });
        const body = (await res.json()) as { success: boolean; data?: { candidates?: PortalLinkCandidate[] } };
        if (!cancelled) setProbe({ ok: res.ok, candidates: res.ok && body.success && body.data?.candidates ? body.data.candidates : [] });
      } catch {
        if (!cancelled) setProbe({ ok: false, candidates: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [storeKnowsRole, employee.id]);

  const candidates: PortalLinkCandidate[] | null = canManage ? probe?.candidates ?? null : null;

  async function mutate(fn: () => Promise<string>) {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const msg = await fn();
      setMessage(msg);
      onMutated();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The portal link request failed.');
    } finally {
      setBusy(false);
    }
  }

  const linkAccount = () =>
    mutate(async () => {
      const res = await fetch(`/api/employees/${employee.id}/portal-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: pickUserId }),
      });
      const body = (await res.json()) as { success: boolean; message?: string; error?: string };
      if (!res.ok || !body.success) throw new Error(body.error || `Link failed (${res.status}).`);
      setPickUserId('');
      void refetchCandidates();
      return body.message || 'Portal account linked.';
    });

  const unlinkAccount = () =>
    mutate(async () => {
      const res = await fetch(`/api/employees/${employee.id}/portal-link`, { method: 'DELETE', credentials: 'include' });
      const body = (await res.json()) as { success: boolean; message?: string; error?: string };
      if (!res.ok || !body.success) throw new Error(body.error || `Unlink failed (${res.status}).`);
      void refetchCandidates();
      return body.message || 'Portal account unlinked.';
    });

  const handleUnlink = () => {
    if (!linked) return;
    if (window.confirm(`Unlink ${linked.email} from ${employee.firstName} ${employee.lastName}? They will stop receiving in-app leave and payroll notifications.`)) {
      void unlinkAccount();
    }
  };

  const stateChip = linked ? (
    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900" data-testid="portal-state-chip">
      Linked
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground" data-testid="portal-state-chip">
      Not linked
    </Badge>
  );

  return (
    <Card data-testid="portal-account-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="min-w-0">
          <CardTitle className="text-base">Portal account</CardTitle>
          <CardDescription className="truncate">
            The login that opens {employee.firstName}&apos;s self-service portal — payslips, leave, goals, documents.
          </CardDescription>
        </div>
        {stateChip}
      </CardHeader>
      <CardContent className="space-y-3">
        {linked ? (
          <div
            className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-950/30"
            data-testid="portal-account-linked"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{linked.name || linked.email}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">{linked.email}</p>
                </div>
                <Badge variant="outline" className={`ml-1 shrink-0 text-[10px] ring-1 ${portalRoleTone(linked.role)}`}>
                  {linked.role.replace('_', ' ')}
                </Badge>
              </div>
              {canManage ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={handleUnlink}
                  data-testid="portal-unlink-button"
                  className="h-8 shrink-0 gap-1.5 border-rose-200 px-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/40"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" aria-hidden />}
                  Unlink
                </Button>
              ) : null}
            </div>
            {!linked.isActive ? (
              <p className="mt-2 text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                This account is deactivated — the portal is closed for {employee.firstName} until it is reactivated in Settings → Users.
              </p>
            ) : (
              <p className="mt-2 text-[11px] leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
                This account gets a bell row whenever leave is filed for, decided on, or cancelled for {employee.firstName} — plus payroll run notifications.
              </p>
            )}
          </div>
        ) : !canManage ? (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900 dark:bg-amber-950/30"
            data-testid="portal-account-denied"
          >
            <p className="flex items-start gap-1.5 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
              <ShieldAlert className="h-3.5 w-3.5 mt-px shrink-0" aria-hidden />
              <span>
                No portal account is linked — {employee.firstName} cannot open the self-service portal, and leave and payroll
                notifications have nowhere to land in the app. Your role can view this link but not change it; only store owners,
                HR managers and super admins manage portal account links.
              </span>
            </p>
          </div>
        ) : (
          <div className="space-y-2.5" data-testid="portal-account-absence">
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs leading-relaxed text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              <span className="font-semibold">Not linked.</span> Without a linked account {employee.firstName} never sees in-app
              notifications and cannot open the self-service portal — payslips, leave and goals stay behind the HR desk.
            </div>
            {candidates === null ? (
              <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading candidates…
              </div>
            ) : candidates.length === 0 ? (
              <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
                No active users in this store are free to link — create user accounts first (Settings → Users).
              </p>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative sm:flex-1">
                  <select
                    value={pickUserId}
                    onChange={(e) => setPickUserId(e.target.value)}
                    disabled={busy}
                    data-testid="portal-candidates-select"
                    aria-label="Candidate portal users"
                    className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Pick an account to link…</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id} disabled={!!c.linkedToEmployeeName}>
                        {c.name} · {c.role.replace('_', ' ')}
                        {c.linkedToEmployeeName ? ` — linked to ${c.linkedToEmployeeName}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  size="sm"
                  disabled={!pickUserId || busy}
                  onClick={() => void linkAccount()}
                  data-testid="portal-link-button"
                  className="h-9 shrink-0 gap-1.5 bg-emerald-700 text-white hover:bg-emerald-800"
                >
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" aria-hidden />}
                  Link account
                </Button>
              </div>
            )}
          </div>
        )}

        {message ? (
          <p className="text-xs leading-relaxed text-emerald-700 dark:text-emerald-300" role="status" data-testid="portal-account-message">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="text-xs leading-relaxed text-destructive" role="alert" data-testid="portal-account-error">
            {error}
          </p>
        ) : null}

        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden />
          Every link and unlink is recorded in the HR audit trail. The employee sees only their own data in the portal.
        </p>
      </CardContent>
    </Card>
  );
}
