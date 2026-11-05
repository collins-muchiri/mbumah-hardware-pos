'use client';

/**
 * Debt Plans Tab - main UI for the Debt Payment Plans feature.
 *
 * Layout:
 *   1. Header with title + "Create Plan" button
 *   2. Stats cards row (PlansStatsCards)
 *   3. Filter chips: All / Pending Approval / Active / Overdue / Completed
 *   4. Plans grid (PaymentPlanCard) - or empty state - or loading skeletons
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, Loader2, Plus, RefreshCw } from 'lucide-react';
import { parseInitialNamedMember } from '@/lib/tab-url';

import { useAppStore } from '@/lib/stores';
import {
  debtPaymentPlansApi,
  type DebtPaymentPlanItem,
} from '@/lib/api';
import { handleError } from '@/lib/error-handler';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { PlansStatsCards } from '@/components/debt-plans/plans-stats-cards';
import { PaymentPlanCard } from '@/components/debt-plans/payment-plan-card';
import { CreatePlanDialog } from '@/components/debt-plans/create-plan-dialog';
import { PlanDetailsDialog } from '@/components/debt-plans/plan-details-dialog';
import { LandingChip } from '@/components/landing-chip';

type FilterKey = 'all' | 'pending' | 'active' | 'overdue' | 'completed';

// v2.365.0 — THE DEBT-PLANS DESK'S OWN WORD: the repayment desk answers
// the address bar. `?dp-status=pending` lands the desk pre-filtered to the
// plans waiting for approval — the collections desk's daily question ("what
// is pending?") is now a bookmark. The lens's words are the FILTER CHIPS'
// own keys since the desk first shipped (lowercase: pending / active /
// overdue / completed), so the word's voice is LOWERCASE (the payments
// word's spelling): an UPPERCASE `PENDING` names nothing, and the neutral
// is the lowercase `all` — a capitalized `ALL` is an unknown word here,
// the exact inverse of the capitalized-neutral desks. Anything missing or
// unknown answers 'all' (never stranded). The word is desk-prefixed per
// the Task 44 collision law: a desk-prefixed word can never leak across
// client-side tab switches — Collision-checked at round start (grep-FREE
// tree-wide).
// Read-on-mount ONLY (the one-writer law): the landing word is the LANDING
// lens, never rewritten; the filter chips own the state after.
// THE FACE-KIND NOTE (the family's first non-Select control face): the
// lens's control is a BUTTON GROUP, not a Select — the chooser is the
// group's onClick, not an onValueChange. The law's intent transfers
// unchanged: a hand press is the human owning the lens, and the landing
// chip retires the moment that happens. The lens is ALWAYS RENDERED on the
// desk's top-level pane (no sub-tabs, no collapsible panel), so a landing
// that carries the word shows the chip immediately — the always-visible
// face without an amendment.
export const DP_STATUS_FILTERS = ['all', 'pending', 'active', 'overdue', 'completed'] as const;
type DpStatusFilter = (typeof DP_STATUS_FILTERS)[number];

function initialDpStatus(): (typeof DP_STATUS_FILTERS)[number] {
  if (typeof window === 'undefined') return 'all';
  return parseInitialNamedMember(window.location.search, 'dp-status', DP_STATUS_FILTERS, 'all');
}

interface FilterChip {
  key: FilterKey;
  label: string;
  icon: React.ElementType;
  color: string;
}

const FILTER_CHIPS: FilterChip[] = [
  { key: 'all', label: 'All', icon: ClipboardList, color: 'emerald' },
  { key: 'pending', label: 'Pending Approval', icon: CalendarClock, color: 'amber' },
  { key: 'active', label: 'Active', icon: CheckCircle2, color: 'emerald' },
  { key: 'overdue', label: 'Overdue', icon: AlertTriangle, color: 'rose' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, color: 'green' },
];

// Chip colour classes (statically declared so Tailwind can find them).
const CHIP_ACTIVE_CLASSES: Record<string, string> = {
  emerald: 'bg-emerald-700 text-white border-emerald-700 shadow-sm',
  amber: 'bg-amber-500 text-white border-amber-600 shadow-sm',
  rose: 'bg-rose-500 text-white border-rose-600 shadow-sm',
  green: 'bg-green-500 text-white border-green-600 shadow-sm',
};

const CHIP_IDLE_CLASSES: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900',
  rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900',
  green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900',
};

export function DebtPlansTab() {
  const { currentStoreId } = useAppStore();
  const [filter, setFilter] = useState<DpStatusFilter>(initialDpStatus);
  // v2.365.0 THE LANDING WORD — the plans' seed reads `?dp-status=` through
  // the ONE home, cast-free: the generic parser IS the five-word union, so
  // the state names it directly.
  const [landedDpStatus] = useState<DpStatusFilter>(initialDpStatus);
  const [dpLandingLive, setDpLandingLive] = useState(true);

  // v2.365.0: a hand-driven chip press retires the landing word — the chip
  // speaks the ADDRESS BAR's landing, never the human's next choice. (The
  // FACE-KIND NOTE: the chooser is the button group's onClick — the
  // family's first non-Select control face, the law's intent unchanged.)
  const chooseDpStatus = (value: DpStatusFilter) => {
    setFilter(value);
    setDpLandingLive(false);
  };
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsPlan, setDetailsPlan] = useState<DebtPaymentPlanItem | null>(null);

  // Data: stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['debt-payment-plans-stats', currentStoreId],
    queryFn: async () => {
      const res = await debtPaymentPlansApi.stats(currentStoreId);
      return res.data;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (statsError) {
      const msg = handleError(statsError, 'Load debt plans stats');
      toast.error('Failed to load stats', { description: msg });
    }
  }, [statsError]);

  // Data: plans list (filtered)
  // We fetch one large bounded page and filter client-side, so filter chips
  // are instant and don't trigger extra network round-trips (truncation is
  // surfaced via the pagination envelope).
  const queryParams = useMemo(
    () => ({ storeId: currentStoreId, page: 1, pageSize: 100 }),
    [currentStoreId],
  );

  const {
    data: listData,
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
    isFetching,
  } = useQuery({
    queryKey: ['debt-payment-plans', queryParams],
    queryFn: async () => {
      // Task 12-d: request is now server-capped (pageSize 100) and reports
      // truncation via the pagination envelope - the old call was an
      // unbounded findMany.
      const res = await debtPaymentPlansApi.list(queryParams);
      return {
        rows: res.data ?? [],
        pagination: res.pagination ?? null,
      };
    },
    staleTime: 15_000,
  });

  const plans = listData?.rows;
  const plansTotal = listData?.pagination?.total ?? null;

  useEffect(() => {
    if (plansError) {
      const msg = handleError(plansError, 'Load debt payment plans');
      toast.error('Failed to load plans', { description: msg });
    }
  }, [plansError]);

  const filteredPlans = useMemo(() => {
    if (!Array.isArray(plans)) return [];
    switch (filter) {
      case 'pending':
        return plans.filter((p) => p.status === 'PENDING_APPROVAL');
      case 'active':
        return plans.filter((p) => p.status === 'ACTIVE' || p.status === 'PAUSED');
      case 'overdue':
        return plans.filter((p) => (p.installmentsOverdue ?? 0) > 0);
      case 'completed':
        return plans.filter((p) => p.status === 'COMPLETED');
      case 'all':
      default:
        return plans;
    }
  }, [plans, filter]);

  // Per-filter counts for the chip badges.
  const filterCounts = useMemo(() => {
    if (!Array.isArray(plans)) return { all: 0, pending: 0, active: 0, overdue: 0, completed: 0 };
    return {
      all: plans.length,
      pending: plans.filter((p) => p.status === 'PENDING_APPROVAL').length,
      active: plans.filter((p) => p.status === 'ACTIVE' || p.status === 'PAUSED').length,
      overdue: plans.filter((p) => (p.installmentsOverdue ?? 0) > 0).length,
      completed: plans.filter((p) => p.status === 'COMPLETED').length,
    };
  }, [plans]);

  const handleRefresh = () => {
    refetchPlans();
    refetchStats();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-emerald-500" />
            Debt Payment Plans
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set up installment-based repayment schedules for outstanding customer debts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <PlansStatsCards stats={stats} isLoading={statsLoading} />

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {/* v2.365.0 THE LANDING WORD, out loud: while the landing is
            live AND the lens still wears the word it seeded, the chip
            names the exact word — an honest face. It wears the
            EIGHTEENTH family (zinc — the galvanized hue, the coating on
            this yard's steel; byte-free on this desk — emerald/amber/
            rose/green are the lens chips' own voices, and a voice must
            not masquerade as a badge) with dark-mode variants, the Link2
            icon, a `title` tooltip, and a one-press dismissal that
            clears the lens the word seeded. The chip retires the moment
            the human owns the filter. THE TWO VOICES: a hand-driven
            chip press or the chip's own dismissal.
            `data-testid="dp-status-landing-word"` — the QA walk's
            handle. */}
        {dpLandingLive && landedDpStatus !== 'all' && filter === landedDpStatus && (
          <LandingChip
            variant="compact"
            storey={200}
            hue="zinc"
            data-testid="dp-status-landing-word"
            title="The desk landed with this filter from the address bar — press to clear it"
            label={`landed ?dp-status=${landedDpStatus}`}
            onDismiss={() => {
              setFilter('all');
              setDpLandingLive(false);
            }}
          />
        )}
        {FILTER_CHIPS.map((chip) => {
          const isActive = filter === chip.key;
          const count = filterCounts[chip.key] ?? 0;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => chooseDpStatus(chip.key)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isActive
                  ? CHIP_ACTIVE_CLASSES[chip.color]
                  : CHIP_IDLE_CLASSES[chip.color]
              }`}
            >
              <chip.icon className="h-3.5 w-3.5" />
              {chip.label}
              <span
                className={`ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-semibold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-background text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Plans grid / empty / loading */}
      {plansLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : plansError ? (
        // Task 12-d: a load failure previously looked identical to the empty
        // state (toast only) - show an explicit error banner with a retry.
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl">
          <AlertTriangle className="h-12 w-12 text-rose-400 mb-3" />
          <h3 className="text-lg font-semibold">Failed to load payment plans</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {handleError(plansError, 'Load debt payment plans')}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => refetchPlans()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl">
          {filter === 'all' ? (
            <>
              <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-semibold">No payment plans yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Create your first debt payment plan to set up an installment-based
                repayment schedule for a customer with an outstanding balance.
              </p>
              <Button
                className="mt-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Plan
              </Button>
            </>
          ) : (
            <>
              <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-semibold">No plans match this filter</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try switching to a different filter or creating a new plan.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          {plansTotal !== null && plansTotal > (plans?.length ?? 0) && (
            <p className="text-xs text-muted-foreground">
              Showing the most recent {plans?.length} of {plansTotal} plans.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map((plan) => (
              <PaymentPlanCard
                key={plan.id}
                plan={plan}
                onViewDetails={setDetailsPlan}
              />
            ))}
          </div>
        </>
      )}

      {/* Floating loading indicator when refreshing in background */}
      {isFetching && !plansLoading && (
        <div className="fixed bottom-4 right-4 bg-background/90 backdrop-blur-sm border rounded-full px-3 py-1.5 text-xs text-muted-foreground shadow-md flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          Syncing…
        </div>
      )}

      {/* Dialogs */}
      <CreatePlanDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        storeId={currentStoreId}
      />

      <PlanDetailsDialog
        open={Boolean(detailsPlan)}
        onOpenChange={(o) => !o && setDetailsPlan(null)}
        plan={detailsPlan}
      />
    </div>
  );
}

// React.lazy() loaders (see src/lib/tab-preload.ts) expect a default export.
// Its absence made `default` undefined at render time → React error #306
// ("Element type is invalid") → SectionErrorBoundary showed "Unable to load
// Debt Plans". Export the component as default to match every other tab.
export default DebtPlansTab;
