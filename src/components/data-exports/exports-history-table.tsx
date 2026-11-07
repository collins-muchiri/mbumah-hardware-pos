'use client';

/**
 * ExportsHistoryTable - table of past data exports with filter chips and
 * per-row Download / Delete actions. Wraps the existing shadcn/ui Table
 * components and the shared EmptyState.
 *
 * Filter chips: All, Completed, Failed, Processing (PENDING + PROCESSING).
 */

import React, { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Inbox,
  Loader2,
  Trash2,
  XCircle,
} from 'lucide-react';

import {
  dataExportsApi,
  formatDateTime,
  type DataExportItem,
  type DataExportStatus,
  type DataExportType,
} from '@/lib/api';
import { handleError } from '@/lib/error-handler';
import { type ExpTypeFilter } from '@/lib/tab-url';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { EXPORT_TYPES } from './export-type-card';

interface ExportsHistoryTableProps {
  exports: DataExportItem[];
  isLoading?: boolean;
  /**
   * Optional filter override. The legacy mixed union (the wire's
   * UPPERCASE statuses beside the chip keys) predates the controlled
   * hand — v2.391.0 widens it to include the FULL FilterKey union (the
   * chip row's own spellings) so the desk's lifted state passes
   * cast-free. The switch below answers the four chip keys; an
   * uppercase wire status lands in the default (all) branch exactly as
   * it always did.
   */
  externalFilter?: DataExportStatus | FilterKey;
  /**
   * v2.391.0 - THE CONTROLLED HAND. When provided, the filter is lifted
   * to the desk (the deep-link landing's one-writer law): the chip row
   * STAYS VISIBLE and every chip press routes through this callback so
   * the desk can retire its landing chip (the hand-driven voice) and
   * own the state afterwards. Without it the table keeps its own
   * internal state (the uncontrolled form every existing caller speaks).
   */
  onFilterChange?: (filter: FilterKey) => void;
  /**
   * v2.392.0 - THE CONTROLLED HAND'S SECOND APPLICATION (the type
   * lens). The desk's OTHER lifted lens: the type chip row reads this
   * value (the landed `?exp-type=` word or a later hand choice) and
   * every type chip press routes through `onTypeChange`, exactly as
   * the status row routes through `onFilterChange`. Optional with the
   * same law: absent, the row keeps its own internal state (the
   * uncontrolled form).
   */
  externalTypeFilter?: ExpTypeFilter;
  onTypeChange?: (type: ExpTypeFilter) => void;
}

type FilterKey = 'all' | 'completed' | 'failed' | 'processing';

/**
 * A COMPLETED export whose expiresAt (created + 7 days) has passed is no
 * longer downloadable - the download endpoint answers 410 Gone for these.
 * Surfacing it here prevents a pointless click and a confusing error toast.
 */
function isExportExpired(item: DataExportItem): boolean {
  if (!item.expiresAt) return false;
  const t = new Date(item.expiresAt).getTime();
  return Number.isFinite(t) && t < Date.now();
}

const FILTER_CHIPS: Array<{ key: FilterKey; label: string; color: string }> = [
  { key: 'all', label: 'All', color: 'emerald' },
  { key: 'completed', label: 'Completed', color: 'green' },
  { key: 'failed', label: 'Failed', color: 'rose' },
  { key: 'processing', label: 'Processing', color: 'amber' },
];

const CHIP_ACTIVE: Record<string, string> = {
  emerald: 'bg-emerald-700 text-white border-emerald-700',
  green: 'bg-green-500 text-white border-green-600',
  rose: 'bg-rose-500 text-white border-rose-600',
  amber: 'bg-amber-500 text-white border-amber-600',
};

const CHIP_IDLE: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900',
  green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900',
  rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900',
};

const TYPE_META: Record<string, { title: string; color: string }> =
  EXPORT_TYPES.reduce(
    (acc, meta) => {
      acc[meta.type] = {
        title: meta.title,
        color: meta.iconColor,
      };
      return acc;
    },
    {} as Record<string, { title: string; color: string }>,
  );

/**
 * v2.392.0 — THE TYPE CHIP ROW (the thirty-first word's lens face).
 * Each lens word pairs with the wire type it names (the LOWERCASE key
 * of the card grid's own UPPERCASE type — `sales-summary`'s kebab
 * carries `SALES_SUMMARY`'s underscore); the label borrows the card
 * title through TYPE_META so the chip row and the cards never drift
 * apart. The neutral `all` names no wire type. The row's own voice is
 * deliberately UNPAINTED — a neutral wardrobe (the shell's foreground/
 * muted pair) so the type dimension reads apart from the colorful
 * status dimension, and the pink the desk's landing chip speaks stays
 * the word's ONLY voice on this desk (the masquerade law).
 */
const EXP_TYPE_PAIRS: ReadonlyArray<readonly [ExpTypeFilter, DataExportType | null]> = [
  ['all', null],
  ['products', 'PRODUCTS'],
  ['customers', 'CUSTOMERS'],
  ['transactions', 'TRANSACTIONS'],
  ['debt', 'DEBT'],
  ['inventory', 'INVENTORY'],
  ['employees', 'EMPLOYEES'],
  ['suppliers', 'SUPPLIERS'],
  ['loyalty', 'LOYALTY'],
  ['tax', 'TAX'],
  ['sales-summary', 'SALES_SUMMARY'],
];

const EXP_TYPE_WORDS: Array<{
  key: ExpTypeFilter;
  wire: DataExportType | null;
}> = EXP_TYPE_PAIRS.map(([key, wire]) => ({ key, wire }));

const TYPE_CHIP_ACTIVE =
  'bg-slate-700 text-white border-slate-700 dark:bg-slate-500 dark:border-slate-500';
const TYPE_CHIP_IDLE =
  'bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted/60 dark:bg-card/40 dark:hover:bg-muted/50';

// Helpers

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const idx = Math.min(i, units.length - 1);
  const val = bytes / Math.pow(1024, idx);
  return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function formatDateRange(from: string | null, to: string | null): string {
  if (!from && !to) return '-';
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  if (from && to) return `${fmt(from)} → ${fmt(to)}`;
  if (from) return `From ${fmt(from)}`;
  return `Until ${fmt(to as string)}`;
}

/**
 * THE RETENTION COUNTDOWN (v2.327.0): the wire keeps an export for 7
 * days, but the history row only said so AFTER the file was already
 * gone (the expired badge above). The countdown speaks while there is
 * still time: days beyond 48h, hours inside the last two days, and an
 * amber "expires soon" inside the last day — the honest voice for a
 * file with a lifespan, so nobody plans a report around data that is
 * about to be swept.
 */
function retentionCountdown(
  expiresAt: string | null | undefined,
): { label: string; soon: boolean } | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return null; // the Expired badge owns the past
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 48) return { label: `expires in ${Math.floor(hours / 24)}d`, soon: false };
  if (hours >= 1) return { label: `expires in ${hours}h`, soon: hours < 24 };
  return { label: 'expires soon', soon: true };
}

function StatusBadge({ status }: { status: DataExportStatus }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 hover:bg-green-100">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case 'FAILED':
      return (
        <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    case 'PROCESSING':
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Processing
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case 'EXPIRED':
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function TypeBadge({ type }: { type: string }) {
  const meta = TYPE_META[type];
  if (!meta) {
    // v2.436.0 THE OFF-CARD FACE, DELIBERATE — the schema's column
    // comment keeps a WIDER stored vocabulary than the ten cards
    // ("SUPPLIERS, PAYROLL, ... SALES_SUMMARY, ALL"): a legacy row
    // answers under NO card word, and the badge says so instead of
    // speaking a card it never wore (the fixture-fidelity carry's
    // honest pin — the row stays visible, the lens never guesses
    // across the union).
    return (
      <Badge
        variant="outline"
        data-testid="exp-type-offcard"
        title={`${type} — a legacy spelling the ten cards no longer speak (the schema's own column comment keeps it)`}
        className="border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
      >
        {type}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={`border-current/30 ${meta.color}`}>
      {meta.title}
    </Badge>
  );
}

// Component

export function ExportsHistoryTable({
  exports,
  isLoading,
  externalFilter,
  onFilterChange,
  externalTypeFilter,
  onTypeChange,
}: ExportsHistoryTableProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [typeFilter, setTypeFilter] = useState<ExpTypeFilter>('all');
  const [deleteTarget, setDeleteTarget] = useState<DataExportItem | null>(null);

  // Effective filter - allow parent override (e.g. always show 'all').
  // v2.391.0: in the CONTROLLED form (onFilterChange provided) the desk
  // owns the state and the chips stay visible; the uncontrolled form is
  // unchanged for every existing caller.
  const controlled = typeof onFilterChange === 'function';
  const effectiveFilter: FilterKey = controlled
    ? (externalFilter as FilterKey | undefined) ?? 'all'
    : (externalFilter as FilterKey | undefined) ?? filter;

  // v2.392.0 THE TYPE LENS — the same controlled-hand law, the desk's
  // second lifted lens: the type state rides the desk when the hand is
  // given, keeps its own otherwise.
  const typeControlled = typeof onTypeChange === 'function';
  const effectiveType: ExpTypeFilter = typeControlled
    ? externalTypeFilter ?? 'all'
    : (externalTypeFilter ?? typeFilter);
  const effectiveTypeWire =
    EXP_TYPE_WORDS.find((t) => t.key === effectiveType)?.wire ?? null;

  const filtered = useMemo(() => {
    if (!Array.isArray(exports)) return [];
    // v2.392.0: the two lenses CONJOIN (a landed pair narrows on both
    // dimensions — the type word AND the status word, each its own
    // chip row, never stealing the other's state).
    const byStatus = (() => {
      switch (effectiveFilter) {
        case 'completed':
          return exports.filter((e) => e.status === 'COMPLETED');
        case 'failed':
          return exports.filter((e) => e.status === 'FAILED');
        case 'processing':
          return exports.filter(
            (e) => e.status === 'PROCESSING' || e.status === 'PENDING',
          );
        case 'all':
        default:
          return exports;
      }
    })();
    if (!effectiveTypeWire) return byStatus;
    return byStatus.filter((e) => e.exportType === effectiveTypeWire);
  }, [exports, effectiveFilter, effectiveTypeWire]);

  const typeCounts = useMemo(() => {
    const empty: Record<string, number> = {};
    if (!Array.isArray(exports)) {
      return empty;
    }
    return EXP_TYPE_WORDS.reduce<Record<string, number>>(
      (acc, t) => {
        acc[t.key] =
          t.wire === null
            ? exports.length
            : exports.filter((e) => e.exportType === t.wire).length;
        return acc;
      },
      {},
    );
  }, [exports]);

  const filterCounts = useMemo(() => {
    if (!Array.isArray(exports)) {
      return { all: 0, completed: 0, failed: 0, processing: 0 };
    }
    return {
      all: exports.length,
      completed: exports.filter((e) => e.status === 'COMPLETED').length,
      failed: exports.filter((e) => e.status === 'FAILED').length,
      processing: exports.filter(
        (e) => e.status === 'PROCESSING' || e.status === 'PENDING',
      ).length,
    };
  }, [exports]);

  // Download mutation
  const downloadMutation = useMutation({
    mutationFn: async (item: DataExportItem) => {
      await dataExportsApi.download(item.id, item.exportType);
      return item;
    },
    onSuccess: (item) => {
      toast.success('Download started', {
        description: `${item.exportType} (${item.format}) - ${item.recordCount} records.`,
      });
    },
    onError: (err) => {
      const msg = handleError(err, 'Download export');
      toast.error('Download failed', { description: msg });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => dataExportsApi.delete(id),
    onSuccess: () => {
      toast.success('Export deleted');
      queryClient.invalidateQueries({ queryKey: ['data-exports'] });
      queryClient.invalidateQueries({ queryKey: ['data-exports-stats'] });
      setDeleteTarget(null);
    },
    onError: (err) => {
      const msg = handleError(err, 'Delete export');
      toast.error('Delete failed', { description: msg });
    },
  });

  return (
    <div className="space-y-3">
      {/* Filter chips (hidden if parent forces a filter WITHOUT the
          controlled hand — v2.391.0: in the controlled form the chips
          STAY VISIBLE and route through onFilterChange, the hand-driven
          retirement voice) */}
      {(!externalFilter || controlled) && (
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_CHIPS.map((chip) => {
            const isActive = effectiveFilter === chip.key;
            const count = filterCounts[chip.key] ?? 0;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => {
                  // v2.391.0 THE CONTROLLED HAND: the desk owns the
                  // state (the landing chip's second retirement voice
                  // lives there); uncontrolled callers keep the
                  // internal state.
                  if (controlled) onFilterChange(chip.key);
                  else setFilter(chip.key);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive ? CHIP_ACTIVE[chip.color] : CHIP_IDLE[chip.color]
                }`}
              >
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
      )}

      {/* v2.392.0 THE TYPE CHIP ROW — the desk's second lens face (the
          status row's sibling). Visible in the controlled form (the
          hand-driven voice must exist — a hidden lens has no second
          retirement voice); the uncontrolled form is unchanged for
          every other caller. The neutral wardrobe keeps the type
          dimension apart from the colorful status dimension and leaves
          the desk's pink to the landing chip alone (the masquerade
          law). */}
      {(!externalTypeFilter || typeControlled) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {EXP_TYPE_WORDS.map((t) => {
            const isActive = effectiveType === t.key;
            const count = typeCounts[t.key] ?? 0;
            const label =
              t.wire === null ? 'All types' : (TYPE_META[t.wire]?.title ?? t.key);
            return (
              <button
                key={t.key}
                type="button"
                data-testid={`exp-type-chip-${t.key}`}
                onClick={() => {
                  // THE CONTROLLED HAND'S SECOND APPLICATION: the desk
                  // owns the state (the landing chip's second retirement
                  // voice lives there); uncontrolled callers keep the
                  // internal state.
                  if (typeControlled) onTypeChange(t.key);
                  else setTypeFilter(t.key);
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isActive ? TYPE_CHIP_ACTIVE : TYPE_CHIP_IDLE
                }`}
              >
                {label}
                <span
                  className={`ml-0.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-semibold tabular-nums ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              {effectiveTypeWire && effectiveFilter !== 'all'
                ? `No ${effectiveFilter} exports of this type.`
                : effectiveTypeWire
                  ? `No ${TYPE_META[effectiveTypeWire]?.title ?? ''} exports yet. Pick a type above to get started.`
                  : effectiveFilter === 'all'
                    ? 'No exports generated yet. Pick a type above to get started.'
                    : `No ${effectiveFilter} exports.`}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Type</TableHead>
                <TableHead className="w-[80px]">Format</TableHead>
                <TableHead className="w-[200px]">Date Range</TableHead>
                <TableHead className="text-right w-[90px]">Records</TableHead>
                <TableHead className="text-right w-[100px]">Size</TableHead>
                <TableHead className="w-[130px]">Status</TableHead>
                <TableHead className="w-[160px]">Created</TableHead>
                <TableHead className="text-right w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <TypeBadge type={item.exportType} />
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs font-medium">
                      {item.format}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateRange(item.dateFrom, item.dateTo)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.recordCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-xs">
                    {item.fileSizeBytes > 0 ? formatBytes(item.fileSizeBytes) : '-'}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const expired = isExportExpired(item);
                      const statusNode = (
                        <span className="inline-flex items-center gap-1.5">
                          <StatusBadge status={item.status} />
                          {expired && (
                            <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 px-1.5 py-0 text-[10px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                              <Clock className="h-3 w-3" />
                              Expired
                            </Badge>
                          )}
                        </span>
                      );
                      if (item.status === 'FAILED' && item.errorMessage) {
                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex cursor-help">
                                  {statusNode}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <span className="flex items-start gap-1.5 text-xs">
                                  <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                  <span>{item.errorMessage}</span>
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }
                      return statusNode;
                    })()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex flex-col items-start gap-0.5">
                      <span>{formatDateTime(item.createdAt)}</span>
                      {(() => {
                        const retention = retentionCountdown(item.expiresAt);
                        if (!retention) return null;
                        return (
                          <span
                            data-testid="export-retention"
                            className={
                              retention.soon
                                ? 'inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                : 'inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground dark:bg-muted/50'
                            }
                          >
                            <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                            {retention.label}
                          </span>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => downloadMutation.mutate(item)}
                        disabled={
                          item.status !== 'COMPLETED' ||
                          isExportExpired(item) ||
                          downloadMutation.isPending
                        }
                        title={
                          isExportExpired(item)
                            ? 'Expired - files are kept for 7 days. Generate a new export.'
                            : 'Download'
                        }
                      >
                        {downloadMutation.isPending &&
                        downloadMutation.variables?.id === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span className="sr-only">Download</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        onClick={() => setDeleteTarget(item)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this export?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  This will permanently remove the{' '}
                  <span className="font-semibold">
                    {deleteTarget.exportType} ({deleteTarget.format})
                  </span>{' '}
                  export and its file. This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
