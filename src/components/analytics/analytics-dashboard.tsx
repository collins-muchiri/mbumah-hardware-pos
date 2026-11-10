'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, RefreshCw, Calendar, AlertCircle, Loader2 } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatKES } from '@/lib/api';
import type { AnalyticsPeriod } from '@/lib/analytics-utils';
import { AN_PERIOD_MEMBERS, parseInitialNamedMember } from '@/lib/tab-url';
import { LandingChip } from '@/components/landing-chip';
import { KpiGrid } from './kpi-grid';
import { SalesTrendChart, type SalesTrendData } from './sales-trend-chart';
import { TopProductsChart, type TopProductsData } from './top-products-chart';
import { PaymentDonut, type PaymentBreakdownData } from './payment-donut';
import { HourlyHeatmap, type HourlyHeatmapData } from './hourly-heatmap';

// THE ANALYTICS DESK'S OWN WORD (v2.492.0) — the lens's period answers
// the bar. `?an-period=<member>` — the period Select's OWN spellings
// (the ONE home's AN_PERIOD_MEMBERS — the four members, lowercase, read
// through the generic named-member parser; a made-up member or a wrong
// case is an unknown word, not a clever match). THE DEFAULT WEARS NO
// WORD: the resting period is `week` — the address's silence, the key
// strips when the desk rests. THE LANDING IS READ ONCE ON THE SHELL: a
// plain useState initializer — a dismissed chip can never resurrect
// (the family's FIRST component desk — the word lives where the state
// lives).
function initialAnPeriod(): AnalyticsPeriod {
  if (typeof window === 'undefined') return 'week';
  return parseInitialNamedMember(window.location.search, 'an-period', [...AN_PERIOD_MEMBERS], 'week');
}

// The write half — the period's own replaceState (preserve the other
// params: the shell's tab word and every other desk's word ride
// along). THE DEFAULT WEARS NO WORD: week strips its key — the
// address never carries the resting face's word.
function writeAnPeriodWord(next: AnalyticsPeriod): void {
  try {
    const params = new URLSearchParams(window.location.search);
    if (next === 'week') params.delete('an-period');
    else params.set('an-period', next);
    const qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
  } catch {
    // The address never lies louder than the lens
  }
}

// Authenticated fetch helper
// Same pattern as dashboard-tab.tsx - pulls the JWT from localStorage and
// sends it as a Bearer token. Without this, the protected analytics endpoints
// would 401 and the dashboard would silently fall back to empty states.
async function authedFetch<T>(
  endpoint: string,
  params: Record<string, string | undefined> = {},
): Promise<T | null> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('mbt_token') : null;
  const url = new URL(endpoint, window.location.origin);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: 'same-origin',
  });
  if (!res.ok) {
    // Surface a meaningful error to react-query; callers can fall back to null.
    const txt = await res.text().catch(() => '');
    throw new Error(`Analytics request failed (${res.status}): ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Analytics request returned success=false');
  }
  return (json.data ?? null) as T | null;
}

// KPI response shape
interface KPIResponse {
  todayRevenue: { current: number; previous: number; changePercent: number | null; direction: 'up' | 'down' | 'neutral' };
  transactions: { current: number; previous: number; changePercent: number | null; direction: 'up' | 'down' | 'neutral' };
  averageOrderValue: { current: number; previous: number; changePercent: number | null; direction: 'up' | 'down' | 'neutral' };
  newCustomers: { current: number; previous: number; changePercent: number | null; direction: 'up' | 'down' | 'neutral' };
  lowStockCount: { current: number; previous: number; changePercent: number | null; direction: 'up' | 'down' | 'neutral' };
  pendingOrders: { current: number; previous: number; changePercent: number | null; direction: 'up' | 'down' | 'neutral' };
  generatedAt: string;
}

// Auto-refresh countdown hook
const REFRESH_INTERVAL_MS = 60_000;

function useCountdown(active: boolean) {
  const [remaining, setRemaining] = useState(REFRESH_INTERVAL_MS / 1000);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      // Reset to full interval when reaching 1 (avoid 0 display).
      setRemaining((r) => (r <= 1 ? REFRESH_INTERVAL_MS / 1000 : r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);
  return remaining;
}

interface AnalyticsDashboardProps {
  storeId: string;
  className?: string;
}

export function AnalyticsDashboard({ storeId, className }: AnalyticsDashboardProps) {
  const [landedAnPeriod] = useState<AnalyticsPeriod>(initialAnPeriod);
  const [anPeriodLandingLive, setAnPeriodLandingLive] = useState(true);
  const [period, setPeriod] = useState<AnalyticsPeriod>(initialAnPeriod);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  // v2.492.0 THE GUARDED DOOR — the family's ONE reading from birth:
  // no turn, no write (a re-press of the standing member is not a
  // turn), and the hand's turn retires the word — the chip speaks the
  // ADDRESS BAR's landing, never the human's next choice. The drill
  // down's own period tabs ride this door too — one door, no side
  // windows.
  const choosePeriod = (next: AnalyticsPeriod) => {
    if (next === period) return;
    if (next !== landedAnPeriod) setAnPeriodLandingLive(false);
    setPeriod(next);
    writeAnPeriodWord(next);
  };

  // KPIs (refreshable)
  const kpisQuery = useQuery({
    queryKey: ['analytics', 'kpis', storeId],
    queryFn: () => authedFetch<KPIResponse>(`/api/analytics/kpis`, { storeId }),
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 30_000,
  });

  // Sales trend (depends on period)
  const trendQuery = useQuery({
    queryKey: ['analytics', 'sales-trend', storeId, period],
    queryFn: () =>
      authedFetch<SalesTrendData>(`/api/analytics/sales-trend`, { storeId, period }),
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 30_000,
  });

  // Top products
  const topProductsQuery = useQuery({
    queryKey: ['analytics', 'top-products', storeId, period],
    queryFn: () =>
      authedFetch<TopProductsData>(`/api/analytics/top-products`, {
        storeId,
        period,
        limit: '10',
      }),
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 30_000,
  });

  // Payment breakdown
  const paymentQuery = useQuery({
    queryKey: ['analytics', 'payment-breakdown', storeId, period],
    queryFn: () =>
      authedFetch<PaymentBreakdownData>(`/api/analytics/payment-breakdown`, {
        storeId,
        period,
      }),
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 30_000,
  });

  // Hourly heatmap (always last 90 days regardless of period)
  const heatmapQuery = useQuery({
    queryKey: ['analytics', 'hourly-heatmap', storeId],
    queryFn: () =>
      authedFetch<HourlyHeatmapData>(`/api/analytics/hourly-heatmap`, {
        storeId,
        days: '90',
      }),
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 60_000,
  });

  const countdown = useCountdown(true);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      ]);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  }, [queryClient]);

  // Build sparkline data from the trend buckets (last 7 points)
  const sparklines = useMemo(() => {
    const buckets = trendQuery.data?.buckets ?? [];
    if (buckets.length === 0) return {};
    const last7 = buckets.slice(-7);
    const revenue = last7.map((b) => b.revenue);
    const transactions = last7.map((b) => b.transactions);
    const aov = last7.map((b) => b.avgOrderValue);
    // Synthesise sparklines for KPIs not directly in trend data - use the
    // buckets' transaction counts as a proxy for customers/orders.
    return {
      todayRevenue: revenue,
      transactions,
      averageOrderValue: aov,
      newCustomers: last7.map((_, i) => Math.max(0, Math.round((transactions[i] || 0) * 0.35 + i))),
      lowStockCount: last7.map(() => kpisQuery.data?.lowStockCount.current ?? 0),
      pendingOrders: last7.map(() => kpisQuery.data?.pendingOrders.current ?? 0),
    } as Record<string, number[]>;
  }, [trendQuery.data, kpisQuery.data]);

  const anyError = [kpisQuery, trendQuery, topProductsQuery, paymentQuery, heatmapQuery].some(
    (q) => q.isError,
  );

  const generatedAt = kpisQuery.data?.generatedAt
    ? new Date(kpisQuery.data.generatedAt).toLocaleTimeString('en-KE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '-';

  return (
    <div className={cn('space-y-4 sm:space-y-6', className)}>
      {/* v2.492.0 THE LANDING CHIP — the landed period wears the family's
          shared slate above the desk's own header row; the chip speaks
          the ADDRESS BAR's landing (the triple condition — THE DEFAULT
          WEARS NO WORD), the dismissal retires through the one door. */}
      {anPeriodLandingLive && landedAnPeriod && landedAnPeriod !== 'week' && (
        <div className="flex items-center">
          <LandingChip
            hue="slate"
            label={`landed ?an-period=${landedAnPeriod}`}
            onDismiss={() => { setAnPeriodLandingLive(false); choosePeriod('week'); }}
            title="The period landed with this word from the address bar — dismiss to rest the analytics desk's own lens"
            data-testid="an-period-landing-word"
          />
        </div>
      )}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-500" />
          <div>
            <h2 className="text-lg font-bold tracking-tight">Analytics Dashboard</h2>
            <p className="text-xs text-muted-foreground">
              Real-time sales insights · Last updated {generatedAt}
              {anyError && (
                <span className="ml-2 inline-flex items-center gap-1 text-rose-500">
                  <AlertCircle className="h-3 w-3" />
                  Some data failed to load
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Period:</span>
          </div>
          <Select value={period} onValueChange={(v) => choosePeriod(v as AnalyticsPeriod)}>
            <SelectTrigger
              className={cn(
                'h-8 w-[140px] text-xs transition-colors',
                period !== 'week' ? 'bg-slate-100' : 'bg-background',
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground px-2 py-1 rounded-md bg-muted/40">
            <RefreshCw className="h-3 w-3" />
            <span className="tabular-nums">{countdown}s</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 gap-1.5"
          >
            {isRefreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* KPI grid */}
      <KpiGrid
        kpis={kpisQuery.data ?? null}
        sparklines={sparklines}
        loading={kpisQuery.isLoading}
      />

      {/* Sales trend + payment donut */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <SalesTrendChart
          data={trendQuery.data ?? null}
          loading={trendQuery.isLoading}
          period={period}
          onPeriodChange={choosePeriod}
          className="xl:col-span-2"
        />
        <PaymentDonut
          data={paymentQuery.data ?? null}
          loading={paymentQuery.isLoading}
        />
      </div>

      {/* Top products + heatmap */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        <TopProductsChart
          data={topProductsQuery.data ?? null}
          loading={topProductsQuery.isLoading}
        />
        <HourlyHeatmap
          data={heatmapQuery.data ?? null}
          loading={heatmapQuery.isLoading}
        />
      </div>

      {/* Summary footer */}
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <SummaryItem
              label="Period Revenue"
              value={trendQuery.data ? formatKES(trendQuery.data.summary.totalRevenue) : '-'}
            />
            <SummaryItem
              label="Period Transactions"
              value={trendQuery.data ? String(trendQuery.data.summary.totalTransactions) : '-'}
            />
            <SummaryItem
              label="Avg Order Value"
              value={trendQuery.data ? formatKES(trendQuery.data.summary.avgOrderValue) : '-'}
            />
            <SummaryItem
              label="Top Products Revenue"
              value={topProductsQuery.data ? formatKES(topProductsQuery.data.totalRevenue) : '-'}
            />
            <SummaryItem
              label="Payment Total"
              value={paymentQuery.data ? formatKES(paymentQuery.data.totalRevenue) : '-'}
            />
            <SummaryItem
              label="Heatmap Total"
              value={heatmapQuery.data?.matrix ? formatKES(heatmapQuery.data.matrix.totalRevenue) : '-'}
            />
          </div>
          <span className="text-muted-foreground">
            Auto-refreshes every 60s · KPIs compare vs yesterday
          </span>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

export default AnalyticsDashboard;
