'use client';

// v2.220.0 THE VARIANCE MAP — the stocktake's org face (phase 2 of the
// arc). The branch sheets the floor already speaks, composed org-wide on
// the console shelf: which branches hold a live count (and how far it
// has run), which closed sheets moved the books (and by how many units —
// and, past the cost gate, by how many shillings), and the org's rolling
// 30-day ledger impact as the money-voiced figure the indicative strip
// annotates (the strip family's FIFTH consumer: debt v2.214, revenue
// v2.215, desk v2.216, restock v2.217).
//
// THE LAWS IT INHERITS:
// • the zero-new-fetch law: the map composes the SAME /api/org/kpi-summary
//   payload the KPI row already carries — `data.stockTakes` is additive,
//   and an older cached answer renders the honest step-aside, never a
//   crash and never a fabricated shape.
// • the cost law: variance UNITS are units (every org role hears them);
//   the SHILLINGS arrive only when the wire carried them (the route gates
//   on inventory.view.cost) — null renders the honest absence, never a
//   hidden zero.
// • the strip's silence law (the family's): KES pivot → silent, missing
//   or non-finite rate → silent, unknown code → silent — a figure is
//   NEVER born from a fallback constant, and the strip NEVER fetches
//   (it observes the shared cache the shelf's switcher fills).
// • the panel-owns-its-dark-half law: dark halves from birth; the muted
//   family (slate-500 / dark:slate-400) carries every sub-line.

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, ChevronRight, Download, History } from 'lucide-react';
import { ADMIN_CURRENCY_RATES_QUERY_KEY, RATE_SOURCE_PHRASE, type RatesWireBody } from '@/components/currency-switcher';
import { useCurrency } from '@/hooks/use-currency';
import { CURRENCY_BY_CODE, formatCurrency } from '@/lib/currency-utils';
import { SheetDrill, csvCell, type SheetDrillTarget } from './sheet-drill';
import {
  num, timeAgo,
  parseSheetLineage, LineageChip,
  type KpiSummaryData, type StoreRow,
} from './primitives';

const fmtKes = (v: number) =>
  `KES ${v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusChip = (s: string) => {
  if (s === 'COUNTING') return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30';
  if (s === 'CLOSED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30';
  return 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30';
};

// v2.237.0 THE WALK'S PAPER — the cadence's own CSV: the walk order as
// the wire speaks it (blind spots first), in one file for the floor's
// clipboard. Rides the drill's CSV laws verbatim: csvCell's quoting,
// the BOM so Excel opens UTF-8 honestly, CRLF joins. The honest
// absences export as EMPTY cells — a never-heard shelf has no date,
// and the file never invents one. Pure, so the pins can read it.
export function cadenceWalkCsv(
  rows: Array<{
    name: string; storeCode: string | null; storeName: string;
    band: string; daysSince: number | null; lastCountedAt: string | null;
    productCount: number;
  }>,
): string {
  const header = 'aisle,store,band,days_since,last_counted_at,skus';
  const body = rows.map((r) =>
    [
      csvCell(r.name),
      csvCell(r.storeCode ?? r.storeName),
      csvCell(r.band),
      r.daysSince != null ? r.daysSince : '',
      r.lastCountedAt ?? '',
      r.productCount,
    ].join(','),
  );
  return `\uFEFF${[header, ...body].join('\r\n')}`;
}

const varianceChip = (v: number) => {
  if (v === 0) return { text: 'exact', cls: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30' };
  if (v > 0) return { text: `+${num(v)} over`, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30' };
  return { text: `${num(v)} short`, cls: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30' };
};

export function VarianceMap({ data, stores }: { data: KpiSummaryData; stores: StoreRow[] }) {
  const block = data.stockTakes ?? null;
  // v2.222.0 THE SHEET DRILL — a roster row (or a live row) is a door:
  // clicking it opens the sheet's lines org-side (the ONE deliberate
  // fetch the map itself never makes; the DRILL owns it).
  const [drill, setDrill] = useState<SheetDrillTarget>(null);

  // THE FIFTH CONSUMER of the indicative wire — the same pure OBSERVER
  // the debt/revenue/desk/restock strips speak: a cache watcher that
  // NEVER fetches (enabled: false; the queryFn exists only to say so).
  // The figure it annotates is the org's rolling-30-day ledger impact —
  // a REAL money figure (the closed sheets' own varianceCost, stored by
  // the close route at close-day cost), never an estimate.
  const { currency: activeCurrency } = useCurrency();
  const indicativeQuery = useQuery<RatesWireBody>({
    queryKey: ADMIN_CURRENCY_RATES_QUERY_KEY,
    queryFn: async () => {
      throw new Error('the variance map never fetches — it observes the shared currency cache');
    },
    enabled: false,
    staleTime: 30_000,
    refetchInterval: false,
  });
  const indicative = (() => {
    const windowCost = block?.window30d.varianceCostTotal;
    if (typeof windowCost !== 'number') return null; // the cost gate stayed shut — nothing to convert
    if (windowCost === 0) return null; // a zero ledger impact converts to a zero — the strip stays silent
    if (activeCurrency === 'KES') return null;
    const entry = indicativeQuery.data?.data?.currencies.find((c) => c.code === activeCurrency);
    if (!entry || typeof entry.kesToRate !== 'number' || !Number.isFinite(entry.kesToRate)) return null;
    const meta = CURRENCY_BY_CODE[activeCurrency];
    if (!meta) return null;
    return {
      meta,
      rate: entry.kesToRate,
      source: RATE_SOURCE_PHRASE[entry.source] ?? 'wire rate',
      figure: formatCurrency(windowCost * entry.kesToRate, activeCurrency),
      rateFigure: formatCurrency(entry.kesToRate, activeCurrency),
    };
  })();

  return (
    <div
      data-testid="variance-map"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <ClipboardCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            The variance map
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">cycle counts</span>
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            the org&apos;s count sheets — the floor&apos;s truth, branch by branch.
          </p>
        </div>
      </div>

      {!block ? (
        /* The honest step-aside: an older cached answer predates the block. */
        <p data-testid="variance-map-stale" className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
          this answer predates the variance map — refresh the console data and the count sheets join it.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {/* ── The org window: the money-voiced headline ─────────────────── */}
          {/* v2.236.0: the window row grows the FIFTH tile — the
              coverage. The cadence block already counts every band; the
              tile speaks their sum's story (heard / total, 30d) with
              ZERO new reads — one subtraction the face was born able to
              make. */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <div data-testid="variance-map-open" className="rounded-xl border border-slate-100 p-3 dark:border-slate-700">
              <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Counting now</p>
              <p className="text-sm font-bold tabular-nums text-amber-700 dark:text-amber-400">{num(block.openCount)}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {block.openCount > 0 ? 'a floor is speaking' : 'no open sheet'}
              </p>
            </div>
            <div data-testid="variance-map-closed" className="rounded-xl border border-slate-100 p-3 dark:border-slate-700">
              <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Closed · 30d</p>
              <p className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">{num(block.window30d.closedCount)}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">sheets the books heard</p>
            </div>
            <div data-testid="variance-map-units" className="rounded-xl border border-slate-100 p-3 dark:border-slate-700">
              <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Net variance · 30d</p>
              <p className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                {block.window30d.varianceUnits > 0 ? '+' : ''}{num(block.window30d.varianceUnits)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">units across every line</p>
            </div>
            <div data-testid="variance-map-impact" className="rounded-xl border border-slate-100 p-3 dark:border-slate-700">
              <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Ledger impact · 30d</p>
              <p className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                {block.window30d.varianceCostTotal != null ? fmtKes(block.window30d.varianceCostTotal) : '—'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {block.window30d.varianceCostTotal != null
                  ? 'the lines\u2019 close-day cost'
                  : 'the shillings stay behind the cost gate'}
              </p>
            </div>
            {/* v2.236.0 THE COVERAGE TILE — how much of the org the 30-day
                window actually heard: (fresh + stale) of total, from the
                cadence counts the payload already carries (zero new
                reads, zero new fetches). The honest absences: an older
                cached answer predating the cadence speaks 'the cadence
                has not spoken yet'; an org with no categories speaks 'no
                shelves to hear'. The fill rides the cadence's own bar
                language (h-1 rounded-full, emerald — the books-heard
                family); the dashed track is the honest absence's track,
                never a drawn zero. */}
            {(() => {
              const cad = block.cadence;
              const heard = cad ? cad.counts.fresh + cad.counts.stale : null;
              const total = cad ? cad.counts.total : null;
              const pct = cad && total != null && total > 0 ? Math.round(((heard ?? 0) / total) * 100) : null;
              const voice = !cad
                ? 'the cadence has not spoken yet'
                : total === 0
                  ? 'no shelves to hear'
                  : `${heard} of ${total} shelves heard`;
              return (
                <div data-testid="variance-map-coverage" className="rounded-xl border border-slate-100 p-3 dark:border-slate-700">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Heard · 30d</p>
                  <p className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                    {pct != null ? `${pct}%` : '—'}
                  </p>
                  <div
                    className="mt-1 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                    role="img"
                    aria-label={`Coverage: ${voice}${pct != null ? ` (${heard} of ${total} branch categories heard in the 30-day window)` : ''}`}
                  >
                    {pct != null ? (
                      <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    ) : (
                      <span className="block h-full w-full border-b border-dashed border-slate-400/70 dark:border-slate-500/70" />
                    )}
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{voice}</p>
                </div>
              );
            })()}
          </div>

          {/* THE FIFTH CONSUMER — the indicative strip on the org's ledger
              impact. Same visual family, same three-part voice, same
              silence law as the debt/revenue/desk/restock strips. */}
          {indicative && (
            <p
              data-testid="org-variance-indicative-strip"
              className="rounded-md border border-slate-200 bg-white/70 px-2 py-1 text-[10px] leading-relaxed text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400"
              aria-label={`Indicative value in ${indicative.meta.name}: approximately ${indicative.figure}, at 1 KES = ${indicative.rateFigure}, ${indicative.source}. The ledger stays in KES — this strip does not change what the variance is.`}
            >
              <span data-testid="org-variance-indicative-figure" className="font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                ≈ {indicative.figure}
              </span>{' '}
              <span data-testid="org-variance-indicative-rate" className="tabular-nums">
                · 1 KES = {indicative.rateFigure} · {indicative.source}
              </span>{' '}
              <span data-testid="org-variance-indicative-voice">— indicative; the ledger stays in KES.</span>
            </p>
          )}

          {/* ── The live sheets — the floors speaking right now ───────────── */}
          {block.openSheets.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Live counts</p>
              <ul className="mt-1.5 space-y-1.5">
                {block.openSheets.map((s) => {
                  const pct = s.lineCount > 0 ? Math.round((s.countedCount / s.lineCount) * 100) : 0;
                  return (
                    <li key={s.id} data-testid="variance-map-live-row" className="rounded-lg border border-slate-100 bg-white/70 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          data-testid={`variance-map-open-sheet-${s.id}`}
                          onClick={() => setDrill({ id: s.id, storeName: s.storeName, status: 'COUNTING' })}
                          className="flex min-w-0 flex-1 items-center gap-1.5 rounded text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ring-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">COUNTING</span>
                          <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{s.storeName}</span>
                          {s.storeCode && <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">{s.storeCode}</span>}
                          <ChevronRight className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                        </button>
                        <span className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                          {s.countedCount}/{s.lineCount} counted · {pct}%
                        </span>
                      </div>
                      {/* The live progress — amber while the floor speaks. */}
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="img" aria-label={`${s.storeName}: counted ${s.countedCount} of ${s.lineCount} lines`}>
                        <span className="block h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                      </div>
                      {/* v2.233.0 THE LINEAGE — the live row reads its own
                          note: a recount lineage wears the amber chip (the
                          raw text would only murmur), a plain note keeps
                          the verbatim murmur it always had. */}
                      {(() => {
                        const lineage = parseSheetLineage(s.notes);
                        if (lineage?.kind === 'recount' && lineage.sourceSheetId) {
                          return (
                            <p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                              opened {timeAgo(s.startedAt)}{s.startedByName ? ` by ${s.startedByName}` : ''}
                              <LineageChip lineage={lineage} testId={`variance-map-lineage-${s.id}`} />
                            </p>
                          );
                        }
                        return (
                          <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                            opened {timeAgo(s.startedAt)}{s.startedByName ? ` by ${s.startedByName}` : ''}
                            {s.notes ? ` · ${s.notes}` : ''}
                          </p>
                        );
                      })()}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* ── The roster — the recent sheets, newest first ──────────────── */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Recent sheets</p>
            {block.recentSheets.length === 0 ? (
              <p data-testid="variance-map-empty" className="mt-1.5 rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                no count sheet has ever been raised on this org — the branch inventory tab opens one before month-end.
              </p>
            ) : (
              <ul className="mt-1.5 space-y-1.5">
                {block.recentSheets.map((s) => {
                  const chip = s.status === 'CLOSED' && s.varianceUnits != null ? varianceChip(s.varianceUnits) : null;
                  const branch = stores.find((st) => st.id === s.storeId);
                  // v2.233.0 THE LINEAGE — the roster row reads its own
                  // note (the wire already carries it — zero new fetch):
                  // a recount lineage wears the amber chip beside the
                  // status; a CANCELLED sheet with a reason speaks the
                  // why on its own line (the audit trail, at a glance).
                  const lineage = parseSheetLineage(s.notes);
                  const whyLine = s.status === 'CANCELLED' && lineage?.kind === 'note' ? lineage.text : null;
                  return (
                    <li key={s.id} data-testid="variance-map-sheet-row" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white/70 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <button
                        type="button"
                        data-testid={`variance-map-open-sheet-${s.id}`}
                        onClick={() => setDrill({ id: s.id, storeName: s.storeName, status: s.status })}
                        className="flex min-w-0 flex-1 items-center gap-1.5 rounded text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ${statusChip(s.status)}`}>
                          {s.status}
                        </span>
                        {lineage?.kind === 'recount' && lineage.sourceSheetId && (
                          <LineageChip lineage={lineage} testId={`variance-map-lineage-${s.id}`} />
                        )}
                        <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{s.storeName}</span>
                        <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">{branch?.code ?? s.storeCode ?? ''}</span>
                        <ChevronRight className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                      </button>
                      <span className="flex flex-wrap items-center gap-1.5">
                        {chip && (
                          <span data-testid={`variance-map-chip-${s.id}`} className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold tabular-nums ring-1 ${chip.cls}`}>
                            {chip.text}
                          </span>
                        )}
                        <span className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                          {s.countedCount}/{s.lineCount} counted
                          {s.varianceCost != null && s.varianceCost !== 0 ? ` · ${fmtKes(s.varianceCost)}` : ''}
                          {' · '}
                          {s.status === 'CLOSED' && s.closedAt
                            ? `closed ${timeAgo(s.closedAt)}${s.closedByName ? ` by ${s.closedByName}` : ''}`
                            : `opened ${timeAgo(s.startedAt)}`}
                        </span>
                      </span>
                      {whyLine && (
                        <p
                          data-testid={`variance-map-why-${s.id}`}
                          title={whyLine}
                          className="w-full truncate border-t border-slate-100 pt-1 text-[10px] italic text-slate-500 dark:border-slate-800 dark:text-slate-400"
                        >
                          why: {whyLine}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {/* The roster cap note: the window figure above reads EVERY
                closed sheet in 30 days; this roster names the recent 12
                (any status). The window stays the truth; the roster is a
                window — and the note says so. */}
            <p className="mt-1.5 text-[9px] text-slate-500 dark:text-slate-400" data-testid="variance-map-cap-note">
              the window figures read every closed sheet in 30 days — this roster names the 12 most recent, any status.
            </p>
          </div>

          {/* ── v2.235.0 THE CADENCE — when each shelf was last heard ─────── */}
          {/* The map has said WHAT walked since v2.220.0; the cadence says
              WHEN: per branch category, the days since a CLOSED sheet last
              touched it, in the wire's own walk order (the face renders,
              it never re-sorts). Same laws as the map itself: zero new
              fetches (the block rides `data.stockTakes`), an older cached
              answer renders the honest step-aside, dark halves from birth,
              the muted family carries every sub-line. */}
          {(() => {
            const cadence = block.cadence ?? null;
            if (!cadence) {
              return (
                <p data-testid="cadence-stale" className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
                  this answer predates the cadence — refresh the console data and the shelves say when they were last heard.
                </p>
              );
            }
            const bandHouse = (band: 'fresh' | 'stale' | 'beyond' | 'never') => {
              if (band === 'fresh') return { chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30', rail: 'bg-emerald-500', bar: 'bg-emerald-500' };
              if (band === 'stale') return { chip: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30', rail: 'bg-amber-500', bar: 'bg-amber-500' };
              if (band === 'beyond') return { chip: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30', rail: 'bg-orange-500', bar: 'bg-orange-400' };
              return { chip: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30', rail: 'bg-slate-300 dark:bg-slate-600', bar: null };
            };
            const daysVoice = (c: { band: 'fresh' | 'stale' | 'beyond' | 'never'; daysSince: number | null }) => {
              if (c.band === 'never') return 'never heard';
              if (c.band === 'beyond') return 'last heard beyond the window';
              if (c.daysSince == null) return '—';
              if (c.daysSince === 0) return 'counted today';
              if (c.daysSince === 1) return '1 day ago';
              return `${c.daysSince} days ago`;
            };
            const chipLabel = (band: string) => band === 'never' ? 'never' : band;
            return (
              <div data-testid="cadence-block">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <History className="h-3 w-3 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                    The cadence
                  </p>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {/* v2.237.0 THE WALK'S PAPER — the cadence exports
                        itself: the whole walk order in the wire's own
                        order, one honest file. Zero fetches — the rows
                        the face renders are the rows the file speaks.
                        The button hides on a shelf-less cadence: an
                        absent control never lies. */}
                    {cadence.categories.length > 0 && (
                      <button
                        type="button"
                        data-testid="cadence-export"
                        aria-label={`Download all ${cadence.categories.length} aisles as CSV — the walk order as the wire speaks it, blind spots first`}
                        title="the walk order as a file — the floor's clipboard for the day"
                        onClick={() => {
                          const csv = cadenceWalkCsv(cadence.categories);
                          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `walk-order-${new Date().toISOString().slice(0, 10)}.csv`;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        }}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                      >
                        <Download className="h-3 w-3" aria-hidden="true" />
                        walk order
                      </button>
                    )}
                    {(['fresh', 'stale', 'beyond', 'never'] as const).map((band) => {
                      const house = bandHouse(band);
                      const count = cadence.counts[band];
                      return (
                        <span
                          key={band}
                          data-testid={`cadence-chip-${band}`}
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold tabular-nums ring-1 ${count > 0 ? house.chip : 'bg-white text-slate-400 ring-slate-200 opacity-60 dark:bg-slate-900 dark:text-slate-500 dark:ring-slate-700'}`}
                        >
                          {count} {chipLabel(band)}
                        </span>
                      );
                    })}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  when each shelf was last heard — the walk order for the floor, blind spots first.
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  {cadence.categories.map((c) => {
                    const house = bandHouse(c.band);
                    const pct = c.daysSince != null ? Math.max(4, Math.round((Math.min(c.daysSince, 30) / 30) * 100)) : 100;
                    const voice = daysVoice(c);
                    // v2.237.0 THE WALK'S DOOR — the cadence row becomes
                    // a door: the org face POINTS, the branch face
                    // counts (the v2.232.0 anchor-door law, now carrying
                    // the walk's order). The deep link pre-arms the
                    // branch's count sheet with THIS aisle picked — one
                    // read of the map becomes one open drawer. The door
                    // rides the store's OWN slug from the stores prop
                    // (never a guess); a slug-less store holds no door —
                    // an absent control never lies.
                    const doorSlug = stores.find((s) => s.id === c.storeId)?.slug ?? null;
                    return (
                      <li
                        key={c.categoryId}
                        data-testid={`cadence-row-${c.categoryId}`}
                        aria-label={`${c.name} in ${c.storeName}: ${voice}, ${c.productCount} products on the shelf.`}
                        className="flex items-stretch gap-2 overflow-hidden rounded-lg border border-slate-100 bg-white/70 dark:border-slate-700 dark:bg-slate-800/60"
                      >
                        <span aria-hidden="true" className={`w-1 shrink-0 ${house.rail}`} />
                        <div className="min-w-0 flex-1 px-1 py-1.5 pr-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
                            <span className="flex min-w-0 items-center gap-1.5">
                              <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{c.name}</span>
                              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">{c.storeCode ?? c.storeName}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span
                                data-testid={`cadence-band-${c.categoryId}`}
                                className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ${house.chip}`}
                              >
                                {c.band}
                              </span>
                              <span data-testid={`cadence-days-${c.categoryId}`} className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                                {voice}
                              </span>
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <div
                              className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                              role="img"
                              aria-label={`${c.name}: ${voice}${c.daysSince != null ? ` (${c.daysSince} of 30 days)` : ''}`}
                            >
                              {house.bar ? (
                                <span className={`block h-full rounded-full ${house.bar} ${c.band === 'beyond' ? 'opacity-70' : ''}`} style={{ width: `${pct}%` }} />
                              ) : (
                                <span className="block h-full w-full border-b border-dashed border-slate-400/70 dark:border-slate-500/70" />
                              )}
                            </div>
                            <span className="shrink-0 text-[9px] tabular-nums text-slate-400 dark:text-slate-500">
                              {c.productCount} {c.productCount === 1 ? 'SKU' : 'SKUs'}
                            </span>
                          </div>
                        </div>
                        {doorSlug && (
                          <a
                            data-testid={`cadence-door-${c.categoryId}`}
                            href={`/stores/${doorSlug}/inventory?countSheet=${c.categoryId}`}
                            title={`the org face points, the branch face counts — open ${c.name}'s count sheet at ${c.storeCode ?? c.storeName}`}
                            aria-label={`start the walk on ${c.name} at ${c.storeCode ?? c.storeName} — opens the branch's count sheet with this aisle picked`}
                            className="mr-2 flex shrink-0 items-center gap-0.5 self-center rounded border border-slate-200 px-1.5 py-1 text-[9px] font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-500 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                          >
                            walk
                            <ChevronRight className="h-3 w-3" aria-hidden="true" />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-1.5 text-[9px] text-slate-500 dark:text-slate-400" data-testid="cadence-cap-note">
                  the cadence reads the same 30-day window the map speaks — a shelf absent from it has not been heard in 30 days; a never-counted shelf has no closed line at all. fresh is {cadence.freshDays} days or less.
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* v2.222.0 THE SHEET DRILL — the door's room: ONE deliberate fetch
          of the sheet's lines, read-only, every status. v2.223.0: keyed
          per SHEET — a fresh door is a fresh MOUNT, so the line finder's
          needle starts empty by construction (state of the drill, not
          of the map; no effect ever resets it). */}
      {/* v2.234.0 THE VERDICT — the drill's re-walk button re-keys
          this door onto the child: a fresh drill (the key remounts,
          the instruments reset by construction), one deliberate
          fetch for the sheet the user OPENED. */}
      {drill && (
        <SheetDrill
          key={drill.id}
          target={drill}
          onClose={() => setDrill(null)}
          onOpenSheet={(next) => setDrill(next)}
        />
      )}
    </div>
  );
}
