'use client';

// v2.225.0 THE PO DRILL — the org face of ONE purchase order. The
// procurement ledger's rows become doors; this modal is what they open.
// READ-ONLY BY LAW: the org face watches the pipeline — no approve, no
// receive, no cancel (the branch workspace keeps the only pens). Every
// status drills: a DRAFT shows its ink, a RECEIVED its fulfillment, a
// CANCELLED its grave.
//
// THE ORDER'S COPY — the drill's lines go portable (the sheet drill's
// v2.224.0 law, grown to the pipeline): a client-side CSV over the
// lines the drill ALREADY holds (zero new fetch). The file speaks the
// WHOLE order (the finder narrows the reading, never the export); a
// cost-gated cell exports EMPTY (absence, never a hidden zero); the
// BOM so Excel opens UTF-8 honestly; CRLF joins; the boring quoting
// law (commas/quotes/newlines ride wrapped, doubled) reused verbatim
// from the sheet drill's pure builder.
//
// THE LAWS IT INHERITS:
// • the cost law: the wire's unitCost/totalCost/totalAmount arrive
//   null past the cost gate — the face renders the honest absence
//   ("the shillings stay behind the cost gate"), never a hidden zero;
// • ONE deliberate fetch, disclosed by the loading face (the drill is
//   an act — the user OPENED a document);
// • the panel-owns-its-dark-half law: dark halves from birth; the
//   muted family (slate-500 / dark:slate-400) carries every sub-line;
//   the 3:1 contrast law on every chip; tabular-nums on every figure.

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ClipboardList, Download, Search, X } from 'lucide-react';
import { csvCell } from './sheet-drill';
import { num, timeAgo } from './primitives';

const fmtKes = (v: number) =>
  `KES ${v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// The pipeline's chip ladder — progress reads left-to-right cold-to-warm
// to green: slate ink → amber waiting → sky green-lit → indigo on the
// road → cyan acknowledged → amber arriving → emerald home → red grave.
// House families only, 3:1 on every face, dark halves from birth.
export const poStatusChip = (s: string) => {
  if (s === 'DRAFT') return 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30';
  if (s === 'PENDING_APPROVAL') return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30';
  if (s === 'APPROVED') return 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30';
  if (s === 'SENT') return 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30';
  if (s === 'CONFIRMED') return 'bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-500/30';
  if (s === 'PARTIALLY_RECEIVED') return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30';
  if (s === 'RECEIVED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30';
  return 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30';
};

// v2.225.0: the order's copy — the pure builder the pins read. Seven
// columns; the cost cells obey the gate IN THE FILE (absence is
// absence); the BOM rides; CRLF joins.
export function poLinesCsv(lines: PoDrillWire['data']['lines'], opts: { costGated: boolean }): string {
  const header = 'product,sku,unit,ordered,received,unit_cost_kes,line_total_kes';
  const rows = lines.map((l) =>
    [
      csvCell(l.name),
      csvCell(l.sku),
      csvCell(l.unitType),
      l.qty,
      l.receivedQty,
      !opts.costGated && l.unitCost != null ? l.unitCost : '',
      !opts.costGated && l.totalCost != null ? l.totalCost : '',
    ].join(','),
  );
  return `\ufeff${[header, ...rows].join('\r\n')}`;
}

export type PoDrillTarget = { id: string; poNumber: string; status: string } | null;

interface PoDrillWire {
  success: boolean;
  data: {
    id: string;
    poNumber: string;
    status: string;
    notes: string | null;
    orderDate: string;
    expectedDate: string | null;
    createdAt: string;
    approvedAt: string | null;
    receivedAt: string | null;
    cancelledAt: string | null;
    createdByName: string | null;
    approvedByName: string | null;
    receivedByName: string | null;
    cancelledByName: string | null;
    store: { id: string; name: string; code: string | null };
    supplierName: string;
    summary: {
      lineCount: number;
      orderedUnits: number;
      receivedUnits: number;
      totalAmount: number | null;
    };
    lines: Array<{
      id: string;
      name: string;
      sku: string;
      unitType: string;
      qty: number;
      receivedQty: number;
      unitCost: number | null;
      totalCost: number | null;
    }>;
  };
}

export function PoDrill({ target, onClose }: { target: PoDrillTarget; onClose: () => void }) {
  // The finder's needle — the sheet drill's v2.223.0 law: state of the
  // drill, not of the ledger (the ledger keys the drill per document,
  // so a fresh door opens with an empty needle by construction).
  const [needle, setNeedle] = useState('');
  const wire = useQuery<PoDrillWire>({
    queryKey: ['org-po-drill', target?.id],
    enabled: !!target?.id,
    staleTime: 15_000,
    queryFn: async () => {
      if (!target?.id) throw new Error('no document on this drill');
      const res = await fetch(`/api/org/purchase-orders/${encodeURIComponent(target.id)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `the document refused to open (${res.status})`);
      }
      return res.json();
    },
  });

  if (!target) return null;
  const data = wire.data?.data;

  const costGated = data?.summary.totalAmount == null;
  const exportLines = () => {
    if (!data) return;
    const csv = poLinesCsv(data.lines, { costGated });
    const name = `po-${data.poNumber}-${data.status.toLowerCase()}.csv`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // The finder's arithmetic — the needle filters the lines the drill
  // ALREADY holds (name or SKU, case-insensitive); the counts stay
  // honest (N of M), the tiles stay whole-document.
  const cleanNeedle = needle.trim().toLowerCase();
  const shownLines = data
    ? (cleanNeedle
        ? data.lines.filter((l) => l.name.toLowerCase().includes(cleanNeedle) || l.sku.toLowerCase().includes(cleanNeedle))
        : data.lines)
    : [];

  return (
    <div
      data-testid="po-drill"
      role="dialog"
      aria-label={`Purchase order ${target.poNumber}`}
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
              <ClipboardList className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
              <span data-testid="po-drill-number" className="font-mono tabular-nums">{target.poNumber}</span>
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ${poStatusChip(target.status)}`}>
                {target.status.replaceAll('_', ' ')}
              </span>
              <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{data?.supplierName ?? ''}</span>
            </h3>
            {data && (
              <p data-testid="po-drill-when" className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                raised {timeAgo(data.createdAt)}{data.createdByName ? ` by ${data.createdByName}` : ''} at {data.store.code ?? data.store.name}
                {data.status === 'RECEIVED' && data.receivedAt
                  ? ` · received ${timeAgo(data.receivedAt)}${data.receivedByName ? ` by ${data.receivedByName}` : ''}`
                  : ''}
                {data.status === 'CANCELLED' ? ' · a cancelled order — the intent ended, nothing rides on it' : ''}
              </p>
            )}
          </div>
          <button
            type="button"
            data-testid="po-drill-close"
            aria-label="Close the purchase order drill"
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {wire.isLoading && (
          <p data-testid="po-drill-loading" className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
            opening the document — one fetch of its lines…
          </p>
        )}
        {wire.isError && (
          <p data-testid="po-drill-error" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {wire.error instanceof Error ? wire.error.message : 'the document refused to open'}
          </p>
        )}

        {data && (
          <>
            {/* The summary tiles — units for every role, the shillings past the gate. */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Lines</p>
                <p data-testid="po-drill-lines" className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">{num(data.summary.lineCount)}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">ordered from the supplier</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Units</p>
                <p data-testid="po-drill-units" className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {num(data.summary.receivedUnits)}/{num(data.summary.orderedUnits)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">received / ordered</p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Value</p>
                <p data-testid="po-drill-value" className="text-sm font-bold tabular-nums text-slate-800 dark:text-slate-100">
                  {data.summary.totalAmount != null ? fmtKes(data.summary.totalAmount) : '—'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {data.summary.totalAmount != null ? 'the order\u2019s till face' : 'the shillings stay behind the cost gate'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-2.5 dark:border-slate-700">
                <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Expected</p>
                <p data-testid="po-drill-expected" className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {data.expectedDate ? new Date(data.expectedDate).toLocaleDateString('en-KE') : '—'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{data.expectedDate ? 'the day the supplier named' : 'no day was named'}</p>
              </div>
            </div>

            {/* The pipeline timeline — the document's receipts, in ladder
                order. Every rung the wire carried speaks; the absent rungs
                stay absent (an absent control never lies). */}
            <div data-testid="po-drill-timeline" className="mt-2.5 flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 dark:bg-slate-800/60">
              {[
                { at: data.createdAt, by: data.createdByName, label: 'raised' },
                { at: data.approvedAt, by: data.approvedByName, label: 'approved' },
                { at: data.receivedAt, by: data.receivedByName, label: 'received' },
                { at: data.cancelledAt, by: data.cancelledByName, label: 'cancelled' },
              ].filter((r) => r.at).map((r) => (
                <span key={r.label} className="inline-flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-600">
                  {r.label}{r.at ? ` ${timeAgo(r.at)}` : ''}{r.by ? ` by ${r.by}` : ''}
                </span>
              ))}
              {data.approvedAt == null && data.status !== 'DRAFT' && (
                <span className="text-[9px] text-slate-500 dark:text-slate-400">no approval on the record</span>
              )}
            </div>

            {data.notes && (
              <p data-testid="po-drill-notes" className="mt-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                {data.notes}
              </p>
            )}

            {/* The lines — read-only, with each line's received progress
                as a hairline bar. The finder rides above the list (the
                sheet drill's law): a client-side needle over the lines
                the drill already holds, an honest N-of-M count, an empty
                face that names the needle and the document's truth. */}
            <div className="mt-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">the lines</p>
                <div className="flex items-center gap-1.5">
                  {data && data.lines.length > 0 && (
                    <button
                      type="button"
                      data-testid="po-drill-export"
                      aria-label={`Download all ${data.lines.length} lines as CSV`}
                      title="the whole order, one file — the finder narrows the reading, never the export"
                      onClick={exportLines}
                      className="flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Download className="h-3 w-3" aria-hidden="true" />
                      CSV
                    </button>
                  )}
                  <span className="relative">
                    <Search className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                    <input
                      type="text"
                      data-testid="po-drill-finder"
                      aria-label="Find a line by name or SKU"
                      placeholder="find a line — name or SKU"
                      value={needle}
                      onChange={(e) => setNeedle(e.target.value)}
                      className="h-6 w-40 rounded-md border border-slate-200 bg-white pl-6 pr-5 text-[10px] text-slate-700 placeholder:text-slate-400 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
                    />
                    {needle !== '' && (
                      <button
                        type="button"
                        data-testid="po-drill-finder-clear"
                        aria-label="Clear the line finder"
                        onClick={() => setNeedle('')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </span>
                  {data && (
                    <span data-testid="po-drill-finder-count" className="whitespace-nowrap text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                      {num(shownLines.length)} of {num(data.lines.length)}
                    </span>
                  )}
                </div>
              </div>
              <ul data-testid="po-drill-lines-list" className="mt-1.5 max-h-[40vh] space-y-1 overflow-y-auto pr-1">
                {shownLines.map((l) => {
                  const pct = l.qty > 0 ? Math.min(100, Math.round((l.receivedQty / l.qty) * 100)) : 0;
                  const done = l.receivedQty >= l.qty && l.qty > 0;
                  return (
                    <li key={l.id} data-testid="po-drill-line" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white/70 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800/60">
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-medium text-slate-700 dark:text-slate-200">{l.name}</span>
                        <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">{l.sku}</span>
                      </span>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                          ordered {num(l.qty)} → {l.receivedQty > 0 ? `received ${num(l.receivedQty)}` : 'nothing yet'}
                        </span>
                        {l.totalCost != null && (
                          <span className="text-[10px] tabular-nums font-semibold text-slate-600 dark:text-slate-300">
                            {fmtKes(l.totalCost)}
                          </span>
                        )}
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold tabular-nums ring-1 ${done ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30' : 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30'}`}>
                          {pct}%
                        </span>
                      </span>
                      {/* The received progress — emerald when the line
                          landed, slate while it is on the road. */}
                      <span className="h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="img" aria-label={`${l.name}: received ${l.receivedQty} of ${l.qty} ordered`}>
                        <span className={`block h-full rounded-full ${done ? 'bg-emerald-500' : 'bg-sky-500'}`} style={{ width: `${pct}%` }} />
                      </span>
                    </li>
                  );
                })}
              </ul>
              {data && cleanNeedle !== '' && shownLines.length === 0 && (
                <p data-testid="po-drill-finder-empty" className="mt-1.5 rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                  no line answers “{needle.trim()}” — the order holds {num(data.lines.length)} {data.lines.length === 1 ? 'line' : 'lines'}.
                </p>
              )}
              {data && data.lines.length === 0 && (
                <p data-testid="po-drill-lines-empty" className="mt-1.5 rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                  the order holds no lines — ink without intent.
                </p>
              )}
              <p data-testid="po-drill-read-only" className="mt-1.5 text-[9px] text-slate-500 dark:text-slate-400">
                read-only — the branch workspace keeps the pens; this face watches the pipeline.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
