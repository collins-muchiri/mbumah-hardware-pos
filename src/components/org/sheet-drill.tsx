'use client';

// v2.222.0 THE SHEET DRILL — the org face of ONE count sheet. The
// variance map's roster rows become doors; this modal is what they
// open. READ-ONLY BY LAW: the org face watches the floor's truth — no
// count inputs, no close, no cancel (the branch sheet face keeps the
// only pens). Every status drills: COUNTING shows its progress lines,
// CLOSED its variance chips and the stored close-day cost, CANCELLED
// its void.
//
// THE LAWS IT INHERITS:
// • the cost law: the wire's varianceValue and per-line varianceCost
//   arrive null past the cost gate — the face renders the honest
//   absence ("the shillings stay behind the cost gate"), never a
//   hidden zero;
// • the zero-new-fetch law does NOT apply here — the drill is a
//   deliberate act (the user OPENED a sheet), so ONE fetch is the
//   contract, disclosed by the loading face; the MAP itself still
//   composes the kpi payload alone;
// • the panel-owns-its-dark-half law: dark halves from birth; the
//   muted family (slate-500 / dark:slate-400) carries every sub-line;
//   the 3:1 contrast law on every chip.

import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck, X } from 'lucide-react';
import { num, timeAgo } from './primitives';

const fmtKes = (v: number) =>
  `KES ${v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusChip = (s: string) => {
  if (s === 'COUNTING') return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30';
  if (s === 'CLOSED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30';
  return 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30';
};

const varianceChip = (v: number) => {
  if (v === 0) return { text: 'exact', cls: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30' };
  if (v > 0) return { text: `+${num(v)}`, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30' };
  return { text: `${num(v)}`, cls: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30' };
};

export type SheetDrillTarget = { id: string; storeName: string; status: string } | null;

interface DrillWire {
  success: boolean;
  data: {
    id: string;
    status: string;
    notes: string | null;
    startedAt: string;
    closedAt: string | null;
    startedByName: string | null;
    closedByName: string | null;
    store: { id: string; name: string; code: string | null };
    summary: {
      totalLines: number;
      countedLines: number;
      uncountedLines: number;
      varianceUnits: number;
      varianceValue: number | null;
    };
    lines: Array<{
      id: string;
      name: string;
      sku: string;
      unitType: string;
      snapshotQty: number;
      countedQty: number | null;
      variance: number | null;
      varianceCost: number | null;
    }>;
  };
}

export function SheetDrill({ target, onClose }: { target: SheetDrillTarget; onClose: () => void }) {
  const wire = useQuery<DrillWire>({
    queryKey: ['org-sheet-drill', target?.id],
    enabled: !!target?.id,
    staleTime: 15_000,
    refetchInterval: target?.status === 'COUNTING' ? 10_000 : false,
    queryFn: async () => {
      if (!target?.id) throw new Error('no sheet on this drill');
      const res = await fetch(`/api/org/stock-takes/${encodeURIComponent(target.id)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `the sheet refused to open (${res.status})`);
      }
      return res.json();
    },
  });

  if (!target) return null;
  const data = wire.data?.data;

  return (
    <div
      data-testid="sheet-drill"
      role="dialog"
      aria-label={`Count sheet at ${target.storeName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 dark:bg-slate-950/70"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <ClipboardCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              <span data-testid="sheet-drill-title">Count sheet</span>
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ${statusChip(target.status)}`}>
                {target.status}
              </span>
              <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{target.storeName}</span>
            </h3>
            {data && (
              <p data-testid="sheet-drill-when" className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                opened {timeAgo(data.startedAt)}{data.startedByName ? ` by ${data.startedByName}` : ''}
                {data.status === 'CLOSED' && data.closedAt
                  ? ` · closed ${timeAgo(data.closedAt)}${data.closedByName ? ` by ${data.closedByName}` : ''}`
                  : ''}
                {data.status === 'CANCELLED' ? ' · a void — no adjustments, no movements' : ''}
              </p>
            )}
          </div>
          <button
            type="button"
            data-testid="sheet-drill-close"
            aria-label="Close the sheet drill"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {wire.isLoading && (
          <p data-testid="sheet-drill-loading" className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
            opening the sheet — one fetch of its lines…
          </p>
        )}
        {wire.isError && (
          <p data-testid="sheet-drill-error" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {wire.error instanceof Error ? wire.error.message : 'the sheet refused to open'}
          </p>
        )}

        {data && (
          <>
            {/* The summary tiles — units for every role, the shillings past the gate. */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Lines</p>
                <p data-testid="sheet-drill-lines" className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">{num(data.summary.totalLines)}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{data.summary.countedLines} counted{data.summary.uncountedLines > 0 ? ` · ${data.summary.uncountedLines} to go` : ''}</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Variance</p>
                <p data-testid="sheet-drill-units" className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {data.summary.varianceUnits > 0 ? '+' : ''}{num(data.summary.varianceUnits)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">units, counted − snapshot</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Ledger value</p>
                <p data-testid="sheet-drill-value" className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {data.summary.varianceValue != null ? fmtKes(data.summary.varianceValue) : '—'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {data.summary.varianceValue != null
                    ? data.status === 'CLOSED' ? 'the close-day cost' : 'book-cost estimate'
                    : 'the shillings stay behind the cost gate'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Sheet</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{data.store.code ?? data.store.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{data.status === 'COUNTING' ? 'the floor is speaking' : data.status === 'CLOSED' ? 'the books heard it' : 'the void'}</p>
              </div>
            </div>

            {data.notes && (
              <p data-testid="sheet-drill-notes" className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                {data.notes}
              </p>
            )}

            {/* The lines — read-only. Uncounted first (the wire's order),
                then alphabetical; the variance chip carries the meaning. */}
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">the lines</p>
              <ul data-testid="sheet-drill-lines-list" className="mt-1.5 max-h-[40vh] space-y-1 overflow-y-auto pr-1">
                {data.lines.map((l) => {
                  const chip = l.variance != null ? varianceChip(l.variance) : null;
                  return (
                    <li key={l.id} data-testid="sheet-drill-line" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white/70 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800/60">
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-slate-700 dark:text-slate-200">{l.name}</span>
                        <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">{l.sku}</span>
                      </span>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                          snapshot {num(l.snapshotQty)} → {l.countedQty != null ? `counted ${num(l.countedQty)}` : 'uncounted'}
                        </span>
                        {chip && (
                          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold tabular-nums ring-1 ${chip.cls}`}>
                            {chip.text}
                          </span>
                        )}
                        {l.varianceCost != null && l.varianceCost !== 0 && (
                          <span className="text-[10px] tabular-nums font-semibold text-slate-600 dark:text-slate-300">
                            {fmtKes(l.varianceCost)}
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {data.lines.length === 0 && (
                <p data-testid="sheet-drill-lines-empty" className="mt-1.5 rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                  the sheet froze no lines — nothing to count.
                </p>
              )}
              <p data-testid="sheet-drill-read-only" className="mt-1.5 text-[9px] text-slate-500 dark:text-slate-400">
                read-only — the branch sheet keeps the pens; this face watches the floor&apos;s truth.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
