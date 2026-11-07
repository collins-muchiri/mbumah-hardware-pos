'use client';

/**
 * ExportsStatsCards - 5 glass-card stat cards for the Data Export Dashboard
 * header: Total Exports, Cancelled Exports, Total Records, Storage Used,
 * Success Rate.
 *
 * Mirrors the styling of `PlansStatsCards` (debt-plans) so the dashboards
 * share a consistent visual language across the app.
 *
 * v2.441.0 THE WITHDRAWN CARD: the cancelled census takes a home of its
 * own — a fifth card in the zinc voice (the table's Cancelled badge
 * family, the Ban icon — the withdrawn face), seated beside Total Exports
 * (the census pair: the total, then the count that bowed out of it). The
 * Total Exports trend line hands the census over — one number, one home —
 * and the v2.440.0 rich-trend node retires with the hand-over.
 *
 * v2.442.0 THE TREND'S DARK VOICE: every trend line speaks its card's own
 * family — light 600, dark 400 (the badges' dark-pair grammar) — through
 * the trendClass field; the muted-foreground default stays for any card
 * that has no family to borrow (the fallback law).
 */

import {
  Ban,
  CheckCircle2,
  Database,
  HardDrive,
  ListChecks,
  type LucideIcon,
} from 'lucide-react';

import type { DataExportsStats } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ExportsStatsCardsProps {
  stats: DataExportsStats | undefined;
  isLoading?: boolean;
}

interface StatCardConfig {
  label: string;
  value: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  trend?: string;
  /** v2.442.0 the trend line's own voice — light 600, dark 400. */
  trendClass?: string;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const idx = Math.min(i, units.length - 1);
  const val = bytes / Math.pow(1024, idx);
  return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

export function ExportsStatsCards({ stats, isLoading }: ExportsStatsCardsProps) {
  const successRatePct = stats
    ? (stats.successRate * 100).toFixed(0)
    : '0';
  const cancelled = stats?.cancelledExports ?? 0;

  const cards: StatCardConfig[] = [
    {
      label: 'Total Exports',
      value: String(stats?.totalExports ?? 0),
      icon: Database,
      gradient: 'from-emerald-500 to-emerald-600',
      iconColor: 'text-emerald-500',
      // v2.441.0: the census handed over — the withdrawn count lives on
      // its own card now (one number, one home).
      trend: `${stats?.completedExports ?? 0} completed · ${stats?.failedExports ?? 0} failed`,
      trendClass: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      // v2.441.0 THE WITHDRAWN CARD: the fifth card takes the census —
      // the zinc voice (the table's Cancelled badge family) and the Ban
      // icon (the withdrawn face), seated beside the total it bowed out
      // of. A withdrawn run never had a file: the trend line says so
      // honestly, in both states — the loud zero stays silent, the real
      // count names its law. v2.442.0: the trend wears the zinc voice in
      // BOTH states, light and dark — the honest zero speaks the same
      // family, just quieter hours.
      label: 'Cancelled Exports',
      value: String(cancelled),
      icon: Ban,
      gradient: 'from-zinc-500 to-zinc-600',
      iconColor: 'text-zinc-500',
      trendClass: 'text-zinc-600 dark:text-zinc-400',
      trend:
        cancelled > 0
          ? 'Withdrawn before completion — never a file'
          : 'Nothing withdrawn — stuck exports retire here',
    },
    {
      label: 'Total Records',
      value: (stats?.totalRecordsExported ?? 0).toLocaleString(),
      icon: ListChecks,
      gradient: 'from-teal-500 to-teal-600',
      iconColor: 'text-teal-500',
      trend: 'Across all generated files',
      trendClass: 'text-teal-600 dark:text-teal-400',
    },
    {
      label: 'Storage Used',
      value: formatBytes(stats?.totalFileSizeBytes ?? 0),
      icon: HardDrive,
      gradient: 'from-amber-500 to-amber-600',
      iconColor: 'text-amber-500',
      trend: 'Files expire after 7 days',
      trendClass: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Success Rate',
      value: `${successRatePct}%`,
      icon: CheckCircle2,
      gradient: 'from-green-500 to-green-600',
      iconColor: 'text-green-500',
      trend: 'Completed vs. failed runs (cancelled excluded)',
      trendClass: 'text-green-600 dark:text-green-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  // Static stagger classes so Tailwind's JIT can statically detect them.
  const STAGGER_CLASSES = ['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((card, idx) => (
        <Card
          key={card.label}
          className={`glass-card ${STAGGER_CLASSES[idx] ?? 'stagger-1'} hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-default`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${card.gradient} text-white shadow-sm shrink-0`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {card.label}
                </p>
                <p className="text-xl font-bold truncate">{card.value}</p>
                {card.trend && (
                  <p
                    className={`text-[10px] ${card.trendClass ?? 'text-muted-foreground'} truncate`}
                    title={card.trend}
                  >
                    {card.trend}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
