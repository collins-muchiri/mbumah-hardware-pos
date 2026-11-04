'use client';

/**
 * Data Exports Tab - unified export center for the POS.
 *
 * Layout:
 *   1. Header with title + "New Export" button
 *   2. Stats cards row (ExportsStatsCards)
 *   3. "Export Types" grid - 10 cards (2/3/4 cols responsive) with stagger
 *   4. "Export History" table with filter chips
 *
 * Data is fetched via tanstack-query. Clicking a card (or the "New Export"
 * button) opens the CreateExportDialog pre-filled with that type.
 */

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Database, Loader2, Plus, RefreshCw } from 'lucide-react';
import { LandingChip } from '@/components/landing-chip';

import { useAppStore } from '@/lib/stores';
import {
  dataExportsApi,
  type DataExportItem,
  type DataExportType,
} from '@/lib/api';
import { EXP_STATUS_FILTERS, EXP_TYPE_FILTERS, parseInitialNamedMember } from '@/lib/tab-url';
import { handleError } from '@/lib/error-handler';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import {
  EXPORT_TYPES,
  ExportTypeCard,
} from '@/components/data-exports/export-type-card';
import { CreateExportDialog } from '@/components/data-exports/create-export-dialog';
import { ExportsHistoryTable } from '@/components/data-exports/exports-history-table';
import { ExportsStatsCards } from '@/components/data-exports/exports-stats-cards';

// THE EXPORT LEDGER'S OWN WORD (v2.391.0): the data-exports desk's
// history lens answers the address bar — the family's THIRTIETH word.
// `?exp-status=completed` lands the Export History section pre-filtered
// to the files that are ready — the export center's daily question
// ("which of my files are ready, and which died?") becomes a bookmark.
// The lens's words are the chip row's OWN spellings (lowercase:
// completed | failed | processing, the chip word's voice; the wire's
// UPPERCASE statuses — `COMPLETED`, `PENDING` — are NOT lens words, a
// capitalized word names nothing, never a clever match; the neutral is
// the lowercase `all`). Anything missing or unknown answers 'all'
// (never stranded). The word is desk-prefixed per the Task 44 collision
// law: `exp-status` can never leak across client-side tab switches —
// collision-checked at round start (the byte appeared NOWHERE before
// this word), and the chip wears the family's EIGHTH shade-split —
// indigo at the 300/100 storey (a hue NO badge on this desk speaks:
// the census answers amber, emerald, rose, green, red, teal, violet,
// purple, orange, cyan, blue and slate — and a hue the family's first
// indigo, the purchase-orders roster's 200-storey word, never shared a
// bar with). Read-on-mount ONLY (the one-writer law): the landing word
// is the LANDING lens, never rewritten; the table's own chips and the
// chip's own dismissal own the state after — the history table runs in
// its CONTROLLED form (the v2.391.0 hand): the filter state is lifted
// here, the chip row stays visible, and a hand-driven chip press is
// the lens's second retirement voice.
function initialExpStatus(): (typeof EXP_STATUS_FILTERS)[number] {
  if (typeof window === 'undefined') return 'all';
  return parseInitialNamedMember(window.location.search, 'exp-status', EXP_STATUS_FILTERS, 'all');
}
type ExpStatusWordValue = (typeof EXP_STATUS_FILTERS)[number];

// THE EXPORT LEDGER'S SECOND WORD (v2.392.0): the data-exports desk's
// history lens answers BY THE TYPE — the desk's SECOND word (the
// banking and debt precedent), and the desk joins the family's
// TWO-WORD NEGOTIATION club. `?exp-type=products` lands the Export
// History section pre-filtered to the rows that answer one card — the
// export center's other daily question ("where is the file I
// generated for the accountant?") becomes a bookmark. The lens's words
// are the type chip row's OWN spellings (lowercase: products |
// customers | transactions | debt | inventory | employees | suppliers
// | loyalty | tax | sales-summary, the chip word's voice; the wire's
// UPPERCASE types — `PRODUCTS`, `SALES_SUMMARY` — are NOT lens words,
// the inverse-case voice the status word already speaks; the neutral
// is the lowercase `all`). Anything missing or unknown answers 'all'
// (never stranded). The word is desk-prefixed per the Task 44
// collision law: `exp-type` can never leak across client-side tab
// switches — collision-checked at round start (the byte appeared
// NOWHERE before this word), and the chip wears the family's NINTH
// shade-split — pink at the 300/100 storey (a hue NO badge on this
// desk speaks — the census answers amber, emerald, rose, green, red,
// teal, violet, purple, orange, cyan, blue and slate — and the hue the
// vouchers desk spoke at the 200 storey: a family byte the
// 200-storey can never equal, borrowing nothing from the desk's
// badges nor from its indigo sibling). Read-on-mount ONLY (the
// one-writer law): the landing word is the LANDING lens, never
// rewritten; the type chip row and the chip's own dismissal own the
// state after — the history table runs in its CONTROLLED form for
// BOTH lenses (the v2.391.0 hand's second application): the type
// state is lifted here, the type chip row stays visible, and a
// hand-driven type press is the lens's second retirement voice.
// THE TWO-WORD NEGOTIATION, SAME-PANE FORM (the debt desk's
// precedent — both lenses live in ONE history section): when either
// or both words land, the section they share shows them (each seed
// reads its own word); the two chips sit side by side before the
// table, each retiring by its own two voices (its dismissal, its chip
// row's hand change) and never touching its sibling's state — the
// two lenses CONJOIN in the table (a landed pair narrows on both
// dimensions).
function initialExpType(): (typeof EXP_TYPE_FILTERS)[number] {
  if (typeof window === 'undefined') return 'all';
  return parseInitialNamedMember(window.location.search, 'exp-type', EXP_TYPE_FILTERS, 'all');
}
type ExpTypeWordValue = (typeof EXP_TYPE_FILTERS)[number];

export function DataExportsTab() {
  const { currentStoreId } = useAppStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [presetType, setPresetType] = useState<DataExportType | undefined>(
    undefined,
  );
  // v2.391.0 THE LANDING WORD — read once on mount (the one-writer
  // law): `landedExpStatus` freezes what the address bar said, the
  // live flag retires, and `expStatusFilter` owns the lens afterwards.
  const [landedExpStatus] = useState<ExpStatusWordValue>(initialExpStatus);
  const [expLandingLive, setExpLandingLive] = useState(() => initialExpStatus() !== 'all');
  const [expStatusFilter, setExpStatusFilter] = useState<ExpStatusWordValue>(initialExpStatus);
  // v2.392.0 THE SECOND LANDING WORD — the same read-once law, the
  // desk's own sibling: `landedExpType` freezes the type word, the
  // live flag retires, and `expTypeFilter` owns the type lens after.
  const [landedExpType] = useState<ExpTypeWordValue>(initialExpType);
  const [expTypeLandingLive, setExpTypeLandingLive] = useState(() => initialExpType() !== 'all');
  const [expTypeFilter, setExpTypeFilter] = useState<ExpTypeWordValue>(initialExpType);

  // The lens's ONE voice (v2.391.0): a hand-driven change is the lens's
  // second retirement voice — any word other than the landed one
  // retires the chip (the debt desk's chooseDebtChannel precedent).
  const chooseExpStatus = (v: ExpStatusWordValue) => {
    setExpStatusFilter(v);
    if (v !== landedExpStatus) setExpLandingLive(false);
  };

  // The type lens's ONE voice (v2.392.0): the same retirement law,
  // the sibling word's state untouched (the same-pane two-word
  // negotiation — each lens owns its own door).
  const chooseExpType = (v: ExpTypeWordValue) => {
    setExpTypeFilter(v);
    if (v !== landedExpType) setExpTypeLandingLive(false);
  };

  // Data: stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['data-exports-stats', currentStoreId],
    queryFn: async () => {
      const res = await dataExportsApi.stats(currentStoreId);
      return res.data;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    if (statsError) {
      const msg = handleError(statsError, 'Load export stats');
      toast.error('Failed to load stats', { description: msg });
    }
  }, [statsError]);

  // Data: exports list
  const {
    data: exports,
    isLoading: exportsLoading,
    error: exportsError,
    refetch: refetchExports,
    isFetching,
  } = useQuery({
    queryKey: ['data-exports', currentStoreId],
    queryFn: async () => {
      const res = await dataExportsApi.list({ storeId: currentStoreId });
      return res.data ?? [];
    },
    staleTime: 15_000,
  });

  useEffect(() => {
    if (exportsError) {
      const msg = handleError(exportsError, 'Load export history');
      toast.error('Failed to load export history', { description: msg });
    }
  }, [exportsError]);

  // Handlers
  const handleRefresh = () => {
    refetchExports();
    refetchStats();
  };

  const handleGenerateFromCard = (type: DataExportType) => {
    setPresetType(type);
    setCreateOpen(true);
  };

  const handleNewExport = () => {
    setPresetType(undefined);
    setCreateOpen(true);
  };

  const handleOpenChange = (next: boolean) => {
    setCreateOpen(next);
    if (!next) {
      // Defer clearing presetType so the dialog doesn't visually "flicker"
      // back to the default type while it's animating closed.
      setTimeout(() => setPresetType(undefined), 100);
    }
  };

  // Safely coerce the exports list (defensive: API may return non-array on
  // partial failure).
  const exportsList: DataExportItem[] = Array.isArray(exports) ? exports : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-500" />
            Data Exports
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Generate CSV / JSON exports of your store&apos;s data - products,
            transactions, customers, debt, inventory, and more. Files are kept
            for 7 days.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleNewExport}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ExportsStatsCards stats={stats} isLoading={statsLoading} />

      {/* Export Types grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Export Types</h2>
          <span className="text-xs text-muted-foreground">
            {EXPORT_TYPES.length} data sources available
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {EXPORT_TYPES.map((meta, idx) => (
            <ExportTypeCard
              key={meta.type}
              meta={meta}
              index={idx}
              onGenerate={handleGenerateFromCard}
            />
          ))}
        </div>
      </section>

      {/* Export History */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Export History</h2>
          <span className="text-xs text-muted-foreground">
            {exportsList.length} export{exportsList.length === 1 ? '' : 's'} ·
            showing most recent first
          </span>
        </div>
        {/* v2.391.0 THE LANDING CHIP — the address bar's word, spoken
            while the lens still shows the landing (the two retirement
            voices: the chip's own dismissal and a hand-driven chip
            press through the table's controlled hand).
            `data-testid="exp-status-landing-word"` — the QA walk's
            handle. The chip sits before the history section, wearing
            the indigo wardrobe at the 300/100 storey (light: border-300
            + bg-100; dark: the family's 500/10 surfaces). v2.394.0: the
            chip renders through the one LandingChip loom (the wardrobe
            lives in the loom's registry). */}
        {/* v2.392.0 THE TWO CHIPS SIT SIDE BY SIDE — the same-pane
            two-word negotiation (the debt desk's precedent): the pink
            type chip joins the indigo status chip in one wrapping row,
            each owning its retirement, never its sibling's state. */}
        <div className="flex flex-wrap items-center gap-2">
          {expLandingLive && landedExpStatus !== 'all' && expStatusFilter === landedExpStatus && (
            <LandingChip
              hue="indigo"
              label={`landed ?exp-status=${landedExpStatus}`}
              onDismiss={() => {
                setExpStatusFilter('all');
                setExpLandingLive(false);
              }}
              title="The desk landed with this filter from the address bar — press to clear it"
              data-testid="exp-status-landing-word"
            />
          )}
          {/* v2.392.0 THE TYPE LANDING CHIP — the address bar's second
              word on this desk, spoken while the lens still shows the
              landing (the two retirement voices: the chip's own
              dismissal and a hand-driven type-chip press through the
              table's controlled hand). `data-testid="exp-type-landing-word"`
              — the QA walk's handle. The pink chip sits beside its
              indigo sibling, wearing the shade-split's NINTH storey at
              300/100 (light: border-300 + bg-100; dark: the family's
              500/10 surfaces). v2.394.0: both chips ride the one loom
              — one registry, ten hues, zero drift. */}
          {expTypeLandingLive && landedExpType !== 'all' && expTypeFilter === landedExpType && (
            <LandingChip
              hue="pink"
              label={`landed ?exp-type=${landedExpType}`}
              onDismiss={() => {
                setExpTypeFilter('all');
                setExpTypeLandingLive(false);
              }}
              title="The desk landed with this type filter from the address bar — press to clear it"
              data-testid="exp-type-landing-word"
            />
          )}
        </div>
        {exportsLoading ? (
          <div className="rounded-lg border bg-card p-4 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <ExportsHistoryTable
            exports={exportsList}
            externalFilter={expStatusFilter}
            onFilterChange={chooseExpStatus}
            externalTypeFilter={expTypeFilter}
            onTypeChange={chooseExpType}
          />
        )}
      </section>

      {/* Floating loading indicator when refreshing in background */}
      {isFetching && !exportsLoading && (
        <div className="fixed bottom-4 right-4 bg-background/90 backdrop-blur-sm border rounded-full px-3 py-1.5 text-xs text-muted-foreground shadow-md flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          Syncing…
        </div>
      )}

      {/* Create-export dialog */}
      <CreateExportDialog
        open={createOpen}
        onOpenChange={handleOpenChange}
        storeId={currentStoreId}
        presetType={presetType}
      />
    </div>
  );
}

export default DataExportsTab;
