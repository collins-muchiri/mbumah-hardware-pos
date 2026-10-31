'use client';

/**
 * v2.312.0 — the points that expire, at the desk.
 *
 * The EXPIRE voice has hung on the ledger since the tab shipped with no
 * writer behind it; this dialog is the manager's door to the writer the
 * nightly cron now shares. Two steps, one honest door per intent:
 *
 *  1. PREVIEW (GET /api/loyalty/expiry?policyDays=N): the per-wallet plan
 *     — who would lose what — rendered BEFORE anything moves. Zero
 *     writes; the pure seam's dry-run shape.
 *  2. RUN (POST, after an explicit confirm press): the same plan claimed
 *     per wallet (the clawback's conditional decrement), one EXPIRE row
 *     per wallet. Idempotent by construction — a double-press can never
 *     double-expire; the second plan answers zero.
 *
 * The policy window is editable (min 30 days — a month guards against
 * fat-finger sweeps); changing it re-fetches the preview. Lost claims
 * (a wallet redeemed mid-run) are voiced, not hidden.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Hourglass, Loader2, ShieldAlert, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { loyaltyApi, type LoyaltyExpiryPreview, type LoyaltyExpiryRunSummary } from '@/lib/api';

/** The policy input's floor — mirrored from the service's LOYALTY_EXPIRY_MIN_DAYS. */
const MIN_POLICY_DAYS = 30;
const DEFAULT_POLICY_DAYS = 365;

export interface ExpiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  /** Called after a successful run — the desk invalidates its ledgers. */
  onExpired?: () => void;
}

type Phase = 'preview' | 'confirm' | 'running' | 'done';

export function ExpiryDialog({
  open,
  onOpenChange,
  storeId,
  onExpired,
}: ExpiryDialogProps) {
  const [policyDays, setPolicyDays] = useState<number>(DEFAULT_POLICY_DAYS);
  const [phase, setPhase] = useState<Phase>('preview');
  const [summary, setSummary] = useState<LoyaltyExpiryRunSummary | null>(null);

  // The preview rides react-query: refetches when the window changes,
  // cached while the dialog reopens (staleTime 15s — the plan is a
  // snapshot, not a live balance).
  const preview = useQuery({
    queryKey: ['loyalty-expiry-preview', storeId, policyDays],
    queryFn: async () => {
      const res = await loyaltyApi.expiry.preview({ storeId, policyDays });
      return res.data as LoyaltyExpiryPreview | undefined;
    },
    enabled: open && !!storeId,
    staleTime: 15_000,
  });

  // NOTE: no reopen-reset effect — the desk mounts this dialog
  // CONDITIONALLY (only while open), so every open is a fresh component
  // with fresh phase/summary state. No setState-in-effect, no cascades.

  const rows = preview.data?.rows ?? [];
  const total = preview.data?.pointsExpirable ?? 0;
  const affected = preview.data?.walletsAffected ?? 0;

  const handleRun = async () => {
    setPhase('running');
    try {
      const res = await loyaltyApi.expiry.run({ storeId, policyDays });
      setSummary(res.data ?? null);
      setPhase('done');
      if ((res.data?.walletsExpired ?? 0) > 0) {
        toast.success(
          `Expired ${res.data?.pointsExpired.toLocaleString()} point(s) across ${res.data?.walletsExpired} wallet(s).`,
        );
      } else {
        toast.info('Nothing to expire — the plan already answered zero.');
      }
      onExpired?.();
    } catch (err) {
      console.error('[LOYALTY_EXPIRY_RUN_ERROR]', err);
      toast.error('The expiry run failed. Nothing was claimed — try again.');
      setPhase('preview');
    }
  };

  const clampPolicy = (raw: string) => {
    const parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return DEFAULT_POLICY_DAYS;
    return Math.max(MIN_POLICY_DAYS, Math.min(3650, parsed));
  };

  const handleOpenChange = (next: boolean) => {
    // The running phase must not be escapable mid-flight — the claim is
    // already on the wire.
    if (phase === 'running') return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" data-testid="loyalty-expiry-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hourglass className="h-5 w-5 text-amber-700 dark:text-amber-400" aria-hidden />
            Loyalty points expiry
          </DialogTitle>
          <DialogDescription>
            Points unspent after the policy window go home — the oldest earned
            points first, never past what a wallet holds. The nightly sweep
            runs the same plan; this desk runs it now.
          </DialogDescription>
        </DialogHeader>

        {/* The policy window (re-fetches the preview on change) */}
        <div className="flex items-end gap-3">
          <div className="w-40">
            <Label htmlFor="expiry-policy-days" className="text-xs">
              Policy window (days)
            </Label>
            <Input
              id="expiry-policy-days"
              data-testid="expiry-policy-days"
              type="number"
              min={MIN_POLICY_DAYS}
              max={3650}
              className="h-9 mt-1"
              value={policyDays}
              disabled={phase === 'running' || phase === 'done'}
              onChange={(e) => setPolicyDays(clampPolicy(e.target.value))}
            />
          </div>
          <p className="text-[11px] text-muted-foreground pb-2.5">
            Minimum {MIN_POLICY_DAYS} days. Earn rows older than this are the
            candidates; every redemption and clawback since has already eaten
            them first.
          </p>
        </div>

        {/* The plan (preview face) */}
        {phase !== 'done' && (
          <div className="rounded-lg border" data-testid="expiry-preview" aria-live="polite">
            {preview.isLoading ? (
              <div className="space-y-2 p-3" aria-busy="true">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ) : preview.isError ? (
              <div className="flex items-start gap-2 p-3 text-xs text-amber-700 dark:text-amber-400">
                <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
                The plan could not load. Close and reopen to retry.
              </div>
            ) : rows.length === 0 ? (
              <div className="p-6 text-center">
                <Hourglass className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" aria-hidden />
                <p className="text-sm text-muted-foreground">
                  Nothing expires under a {policyDays}-day window — every old
                  lot has already been spent or clawed back.
                </p>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto" data-testid="expiry-preview-rows">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium text-muted-foreground">Customer</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground text-right">Wallet</th>
                      <th className="px-3 py-2 font-medium text-muted-foreground text-right">Would expire</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.customerId} className="border-t">
                        <td className="px-3 py-1.5 truncate max-w-[180px]">
                          {r.customerName}
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            ({r.lotCount} lot{r.lotCount === 1 ? '' : 's'})
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-right tabular-nums text-muted-foreground">
                          {r.walletBefore.toLocaleString()}
                        </td>
                        <td
                          className="px-3 py-1.5 text-right tabular-nums font-semibold text-rose-700 dark:text-rose-400"
                          data-testid={`expiry-row-${r.customerId}`}
                        >
                          −{r.expirable.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t bg-muted/30">
                    <tr>
                      <td className="px-3 py-2 text-[11px] text-muted-foreground" colSpan={2}>
                        {affected} wallet{affected === 1 ? '' : 's'} affected
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-bold text-rose-700 dark:text-rose-400">
                        −{total.toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* The confirm face (between preview and run — the explicit press) */}
        {phase === 'confirm' && (
          <div
            className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/30"
            role="alert"
            data-testid="expiry-confirm"
          >
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
            <div className="text-xs">
              <p className="font-medium text-foreground">
                Expire {total.toLocaleString()} point{total === 1 ? '' : 's'} across{' '}
                {affected} wallet{affected === 1 ? '' : 's'}?
              </p>
              <p className="mt-1 text-muted-foreground">
                This writes EXPIRE rows the ledger cannot unwrite — balances
                drop, tiers stay earned. The nightly sweep cannot double it.
              </p>
            </div>
          </div>
        )}

        {/* The summary face (after the run) */}
        {phase === 'done' && summary && (
          <div className="rounded-lg border p-4 text-center space-y-1" data-testid="expiry-summary">
            <p className="text-sm font-medium text-foreground">
              {summary.walletsExpired > 0
                ? `Expired ${summary.pointsExpired.toLocaleString()} point(s) across ${summary.walletsExpired} wallet(s).`
                : 'Nothing to expire — the plan answered zero.'}
            </p>
            {summary.claimsLost > 0 && (
              <p className="text-xs text-muted-foreground">
                {summary.claimsLost} wallet{summary.claimsLost === 1 ? '' : 's'} redeemed
                mid-run and were skipped — the next sweep catches what remains.
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              The ledger now carries the EXPIRE rows; tonight&apos;s cron will
              find nothing left to do.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {phase === 'preview' && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={rows.length === 0 || preview.isLoading}
                data-testid="expiry-confirm-btn"
                className="bg-amber-600 hover:bg-amber-700 text-white focus-visible:ring-amber-400"
                onClick={() => setPhase('confirm')}
              >
                <Hourglass className="mr-1.5 h-4 w-4" aria-hidden />
                Review {total.toLocaleString()} point{total === 1 ? '' : 's'}
              </Button>
            </>
          )}
          {phase === 'confirm' && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPhase('preview')}
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                data-testid="expiry-run-btn"
                className="bg-amber-600 hover:bg-amber-700 text-white focus-visible:ring-amber-400"
                onClick={handleRun}
              >
                <Hourglass className="mr-1.5 h-4 w-4" aria-hidden />
                Expire {total.toLocaleString()} point{total === 1 ? '' : 's'}
              </Button>
            </>
          )}
          {phase === 'running' && (
            <Button type="button" size="sm" disabled>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
              Expiring…
            </Button>
          )}
          {phase === 'done' && (
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
