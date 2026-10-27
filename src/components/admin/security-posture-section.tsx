'use client';

// MBUMAH HARDWARE POS - Security posture admin section (v2.213.0)
//
// The security remediation program's surface. The v2.212.1 security round
// (PR #343) landed SEC-01..SEC-04 server-side: the single fail-closed
// password verifier, the fail-closed CRON_SECRET gate on all 11 cron
// routes, the SUPER_ADMIN-gated /api/health/env, and the sanitizer drop.
// None of that was VISIBLE to the owner — a SUPER_ADMIN with a browser had
// no way to see whether the environment they are looking at is armed.
// This section reads ONE wire (booleans and counts, never secrets) and
// speaks the posture where the other admin desks speak:
//
//   • Legacy password hashes (SEC-01): the count of accounts still on the
//     retired "hashed_" format — which IS the count of people the
//     fail-closed verifier locks out until the migration script rehashes
//     them. Zero speaks calm; a positive count speaks red with the fix's
//     own command name.
//   • Cron gate (SEC-02): CRON_SECRET presence as a boolean. Armed speaks
//     emerald; unset-in-production speaks red AND says it is fail-closed
//     BY DESIGN (a 403 wall is the honest posture, not an outage);
//     unset-in-development speaks amber informational.
//   • Env diagnostics (SEC-03): gated in production (emerald), dev-open
//     with the production law spoken (slate).
//   • Auth secrets: presence-only row for JWT_SECRET / NEXTAUTH_SECRET.
//
// THE SECRET LAW: the payload carries booleans and counts only. The VALUE
// of any secret never crosses this wire, and the footer says so in the
// card's own voice.

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores';

/** The one wire key (exported for the test suite). */
export const SECURITY_POSTURE_QUERY_KEY = ['admin-security-posture'] as const;

/** Same shape the sibling admin sections use: bearer token + same-origin. */
async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mbt_token') : null;
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers, credentials: 'same-origin' });
}

interface PostureWire {
  data: {
    generatedAt: string;
    runtimeEnv: string;
    accounts: { total: number; legacyHash: number };
    secrets: { cron: boolean; jwt: boolean; nextauth: boolean };
    cron: { gatedRoutes: number };
    envDiagnosticsGated: boolean;
  };
}

const isProduction = (env: string) => env === 'production';

export function SecurityPostureSection() {
  // THE DOOR LAW (same as the Exchange Rates card): the server answers
  // SUPER_ADMIN only; the client opens the door only for that role.
  const isSuperAdmin = useAuthStore((s) => s.user?.role) === 'SUPER_ADMIN';

  const postureQuery = useQuery({
    queryKey: SECURITY_POSTURE_QUERY_KEY,
    queryFn: async (): Promise<PostureWire> => {
      const res = await authedFetch('/api/admin/security-posture');
      if (!res.ok) throw new Error(`The security posture wire answered ${res.status}`);
      return (await res.json()) as PostureWire;
    },
    enabled: isSuperAdmin,
    staleTime: 30_000,
    refetchInterval: false,
  });

  if (!isSuperAdmin) return null;

  const d = postureQuery.data?.data;
  const runtime = d?.runtimeEnv ?? 'unknown';
  const production = isProduction(runtime);
  const legacy = d?.accounts.legacyHash ?? 0;
  const gated = d?.cron.gatedRoutes ?? 11;
  const readAt = d ? new Date(d.generatedAt) : null;

  const legacyChip = legacy === 0
    ? { text: 'clear', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' }
    : { text: `${legacy} locked out`, cls: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' };

  const cronState = d
    ? d.secrets.cron
      ? { text: 'armed', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' }
      : production
        ? { text: 'fail-closed', cls: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400' }
        : { text: 'unset (dev)', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' }
    : null;

  const envState = d
    ? d.envDiagnosticsGated
      ? { text: 'gated', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' }
      : { text: 'dev-open', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' }
    : null;

  const missingSecrets = d
    ? [
        (!d.secrets.jwt ? 'JWT_SECRET' : null),
        (!d.secrets.nextauth ? 'NEXTAUTH_SECRET' : null),
      ].filter(Boolean)
    : [];

  const secretsChip = !d
    ? null
    : missingSecrets.length === 0
      ? { text: 'present', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' }
      : { text: `missing: ${missingSecrets.join(', ')}`, cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' };

  return (
    <Card data-testid="security-posture-section" className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
            <h3
              data-testid="security-posture-header"
              className="text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              Security posture
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-testid="security-posture-refresh"
            aria-label="Re-read the security posture wire"
            onClick={() => void postureQuery.refetch()}
            disabled={postureQuery.isFetching}
            className="h-7 px-2 text-xs text-slate-500 dark:text-slate-400"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${postureQuery.isFetching ? 'animate-spin' : ''}`} aria-hidden />
            Re-read
          </Button>
        </div>
        <p data-testid="security-posture-meta" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          What this environment admits — booleans and counts, never secrets. Follows the SEC-01/02/03 remediations.
        </p>

        {postureQuery.isError ? (
          <p data-testid="security-posture-error" className="mt-3 text-xs text-red-600 dark:text-red-400">
            The posture wire answered {postureQuery.error instanceof Error ? postureQuery.error.message : 'an error'} —
            the card claims nothing rather than guess.
          </p>
        ) : postureQuery.isLoading || !d ? (
          <p data-testid="security-posture-loading" className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Reading the posture wire…
          </p>
        ) : (
          <dl className="mt-3 space-y-3">
            <div data-testid="security-posture-legacy-row" className="flex items-start justify-between gap-3">
              <div>
                <dt className="text-xs font-medium text-slate-700 dark:text-slate-300">Legacy password hashes (SEC-01)</dt>
                <dd data-testid="security-posture-legacy-detail" className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {legacy === 0
                    ? `0 of ${d.accounts.total} accounts on the retired format — the fail-closed verifier locks nobody out.`
                    : `${legacy} of ${d.accounts.total} accounts cannot sign in until scripts/migrate-legacy-passwords.mjs --apply rehashes them (dry-run first).`}
                </dd>
              </div>
              <Badge data-testid="security-posture-legacy-chip" className={`${legacyChip.cls} shrink-0`} variant="outline">
                {legacyChip.text}
              </Badge>
            </div>

            <div data-testid="security-posture-cron-row" className="flex items-start justify-between gap-3">
              <div>
                <dt className="text-xs font-medium text-slate-700 dark:text-slate-300">Cron gate (SEC-02)</dt>
                <dd data-testid="security-posture-cron-detail" className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {d.secrets.cron
                    ? `CRON_SECRET is present — the ${gated} cron routes answer only to its x-cron-secret header.`
                    : production
                      ? `CRON_SECRET is unset in production — all ${gated} cron routes answer 403. That is the fail-closed law, not an outage; set the secret to arm the schedulers.`
                      : `CRON_SECRET is unset — in development the gate answers open; production fails closed.`}
                </dd>
              </div>
              <Badge data-testid="security-posture-cron-chip" className={`${cronState?.cls} shrink-0`} variant="outline">
                {cronState?.text}
              </Badge>
            </div>

            <div data-testid="security-posture-env-row" className="flex items-start justify-between gap-3">
              <div>
                <dt className="text-xs font-medium text-slate-700 dark:text-slate-300">Env diagnostics (SEC-03)</dt>
                <dd data-testid="security-posture-env-detail" className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {d.envDiagnosticsGated
                    ? '/api/health/env answers only to SUPER_ADMIN in production.'
                    : 'Open in development by design; production gates it to SUPER_ADMIN.'}
                </dd>
              </div>
              <Badge data-testid="security-posture-env-chip" className={`${envState?.cls} shrink-0`} variant="outline">
                {envState?.text}
              </Badge>
            </div>

            <div data-testid="security-posture-secrets-row" className="flex items-start justify-between gap-3">
              <div>
                <dt className="text-xs font-medium text-slate-700 dark:text-slate-300">Auth secrets (presence)</dt>
                <dd data-testid="security-posture-secrets-detail" className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {missingSecrets.length === 0
                    ? 'JWT_SECRET and NEXTAUTH_SECRET are present in this environment.'
                    : `Missing from this environment: ${missingSecrets.join(', ')}.`}
                </dd>
              </div>
              <Badge data-testid="security-posture-secrets-chip" className={`${secretsChip?.cls} shrink-0`} variant="outline">
                {secretsChip?.text}
              </Badge>
            </div>
          </dl>
        )}

        <p
          data-testid="security-posture-footer"
          className="mt-4 flex items-center gap-1.5 border-t border-slate-200 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400"
        >
          <ShieldAlert className="h-3 w-3 shrink-0" aria-hidden />
          {readAt
            ? `Read at ${readAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · booleans and counts only — the payload carries no secret material.`
            : 'Booleans and counts only — the payload carries no secret material.'}
        </p>
      </CardContent>
    </Card>
  );
}

export default SecurityPostureSection;
