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
import {
  ChevronDown,
  ChevronsUpDown,
  Database,
  ListFilter,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { LandingChip } from '@/components/landing-chip';

import { useAppStore } from '@/lib/stores';
import {
  dataExportsApi,
  type DataExportItem,
  type DataExportType,
} from '@/lib/api';
import {
  EXP_STATUS_FILTERS,
  EXP_TYPE_FILTERS,
  expTypeWordFor,
  parseInitialNamedMember,
} from '@/lib/tab-url';
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
// completed | failed | processing | cancelled, the chip word's voice;
// the wire's
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
  // v2.445.0 THE RECORDS LENS — the census's sort voice (false = the
  // run-count law, the default; true = loudest-by-records, the second
  // voice; press the header again and the law returns).
  const [byRecords, setByRecords] = useState(false);

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

  // v2.442.0 THE BY-TYPE CENSUS: the stats wire's byType aggregate takes
  // its own table — each type's runs, records, and the withdrawn split
  // (count INCLUDES the withdrawn rows; the cancelled column names them).
  // Sorted loudest-first (run count desc, then the type's own name) so
  // the busiest desk reads first and the order is deterministic.
  const typeRows = stats
    ? Object.entries(stats.byType)
        .map(([type, agg]) => ({ type, ...agg, word: expTypeWordFor(type) }))
        .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type))
    : [];

  // v2.445.0 THE RECORDS LENS — the sort law's second voice rides ABOVE
  // the law: press the Records header and the census re-sorts loudest-by
  // records (the busiest DATA desk reads first, not the busiest SCHEDULE
  // desk); press again and the run-count law returns. The default law
  // keeps its exact seat above — the elders' pin survives untouched.
  const sortedRows = byRecords
    ? [...typeRows].sort(
        (a, b) => b.records - a.records || a.type.localeCompare(b.type),
      )
    : typeRows;

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

      {/* v2.442.0 THE BY-TYPE BREAKDOWN — the wire's byType aggregate
          finally takes its own face: each type's run count (WITH its
          withdrawn rows — the honest inclusion, named in the header),
          its records, and the withdrawn split in the zinc voice (the
          table's Cancelled badge family). The empty state renders NO
          table (the empty-state probe law): the census waits for its
          first run as a quiet card.
          v2.443.0 THE CENSUS BECOMES A DOOR — a row whose type owns a
          lens word presses through to the history pre-filtered (the
          controlled hand); the off-union rows stay a census, honestly. */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">By Type</h2>
          <span className="text-xs text-muted-foreground">
            {typeRows.length} type{typeRows.length === 1 ? '' : 's'} · run counts include withdrawn rows · press a row to lens the type · a withdrawn badge lenses the cancelled
          </span>
        </div>
        {statsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : typeRows.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center text-sm text-muted-foreground">
            No exports yet — the census waits for its first run
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 text-right font-medium">Runs</th>
                    {/* v2.445.0 THE RECORDS LENS — the header is the handle:
                        a real button speaking the second sort voice; the
                        affordance waits for the hover (ChevronsUpDown),
                        the active voice reads foreground under a lit
                        ChevronDown, and aria-sort names the order. */}
                    <th
                      className="group px-4 py-2.5 text-right font-medium"
                      aria-sort={byRecords ? 'descending' : undefined}
                    >
                      <button
                        type="button"
                        data-testid="census-sort-records"
                        aria-label={
                          byRecords
                            ? 'Sorted by records — press again to return to run counts'
                            : 'Sort the census by records'
                        }
                        title={
                          byRecords
                            ? 'The census reads loudest-by-records — press again for the run-count law'
                            : 'Press to sort the census by records'
                        }
                        onClick={() => setByRecords(!byRecords)}
                        className={`inline-flex items-center gap-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                          byRecords ? 'text-foreground' : 'hover:text-foreground'
                        }`}
                      >
                        Records
                        {byRecords ? (
                          <ChevronDown
                            className="h-3 w-3"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronsUpDown
                            className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-2.5 text-right font-medium">Withdrawn</th>
                  </tr>
                </thead>
                <tbody>
                  {/* v2.443.0 THE CENSUS BECOMES A DOOR: a row whose wire
                      type owns a lens word presses through to the history
                      (the controlled hand — chooseExpType, never a direct
                      state write), the SAME pane the deep-link desks
                      already know. Press = land pre-filtered; press the
                      seat again = release (the door's second voice). The
                      off-union rows (no word) stay a census — cursor-help
                      and the honest title, never a door that cannot open.
                      v2.444.0 THE STATUS DOOR, SIBLING SHAPE: the zinc
                      "N withdrawn" badge becomes a real button — its press
                      speaks the status lens's 'cancelled' word through the
                      SAME controlled hand (chooseExpStatus); the pressed
                      wardrobe is the history chip's own zinc active bytes
                      (one family, three seats), the keyboard answers
                      natively, and the honest zero stays a census — a
                      zero-count door invites a pointless press. */}
                  {sortedRows.map((row) => {
                    const word = row.word;
                    const active = word !== null && expTypeFilter === word;
                    const press =
                      word === null
                        ? undefined
                        : () => chooseExpType(active ? 'all' : word);
                    const statusActive = expStatusFilter === 'cancelled';
                    const pressStatus = () =>
                      chooseExpStatus(statusActive ? 'all' : 'cancelled');
                    const seatClass = active
                      ? 'group cursor-pointer bg-emerald-50/70 dark:bg-emerald-500/10'
                      : word !== null
                        ? 'group cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none'
                        : 'cursor-help';
                    return (
                      <tr
                        key={row.type}
                        className={`border-b last:border-0 transition-colors ${seatClass}`}
                        tabIndex={word !== null ? 0 : undefined}
                        aria-label={
                          word === null
                            ? undefined
                            : active
                              ? `${row.type} lens is on — press again to release the history filter`
                              : `Show ${row.type} runs in the history`
                        }
                        aria-current={active ? 'true' : undefined}
                        title={
                          word === null
                            ? 'This type has no history lens word — the census counts it, the lens cannot speak it'
                            : active
                              ? 'The history lens is on this type — press again to release it'
                              : 'Press to filter the export history by this type'
                        }
                        onClick={press}
                        onKeyDown={
                          press
                            ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  press();
                                }
                              }
                            : undefined
                        }
                      >
                        <td className="px-4 py-2.5 font-mono text-xs">
                          <span className="inline-flex items-center gap-1.5">
                            {row.type}
                            {word !== null && (
                              <ListFilter
                                className={`h-3 w-3 text-emerald-600 dark:text-emerald-400 transition-opacity ${
                                  active
                                    ? 'opacity-100'
                                    : 'opacity-0 group-hover:opacity-70 group-focus-visible:opacity-70'
                                }`}
                                aria-hidden="true"
                              />
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{row.count}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">
                          {row.records.toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {row.cancelled > 0 ? (
                            <button
                              type="button"
                              data-testid={`census-withdrawn-${row.type}`}
                              aria-pressed={statusActive}
                              aria-label={
                                statusActive
                                  ? 'The cancelled lens is on — press again to release'
                                  : `Lens the history to the ${row.cancelled} withdrawn runs`
                              }
                              title={
                                statusActive
                                  ? 'The cancelled lens is on — press again to release it'
                                  : 'Press to show the withdrawn runs — the history lands on the cancelled lens'
                              }
                              onClick={(e) => {
                                // the badge sits INSIDE the type door's row
                                // — the press must not bubble into
                                // chooseExpType (the two doors never
                                // conjoin a press)
                                e.stopPropagation();
                                pressStatus();
                              }}
                              onKeyDown={(e) => {
                                // THE KEYBOARD CONJOIN GUARD: the row's
                                // manual Enter/Space handler must never
                                // speak for the badge — a keyboard press
                                // on the focused badge would toggle the
                                // TYPE lens (and its preventDefault would
                                // cancel the button's native click
                                // synthesis). stopPropagation only: the
                                // native default must live.
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation();
                                }
                              }}
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1 active:scale-95 ${
                                statusActive
                                  ? 'bg-zinc-600 text-white border-zinc-600'
                                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-900'
                              }`}
                            >
                              {row.cancelled} withdrawn
                            </button>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
