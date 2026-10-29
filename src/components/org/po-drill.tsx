'use client';

// v2.225.0 THE PO DRILL — the org face of ONE purchase order. The
// procurement ledger's rows become doors; this modal is what they open.
// READ-ONLY BY LAW: the org face watches the pipeline — no approve, no
// receive, no cancel (the branch workspace keeps the only pens). Every
// status drills: a DRAFT shows its ink, a RECEIVED its fulfillment, a
// CANCELLED its grave.
//
// v2.226.0 THE PAPER TRAIL — the CSV is the ring binder's file; the
// PRINT FACE is its paper. While a drill is open, the body carries the
// po-printing class, and the print stylesheet (globals.css) silences
// the shell and lays the open document on the page: header, tiles,
// timeline, lines — the controls (close, finder, buttons) stay off the
// paper (a control is a screen thing). The Print button names the act;
// it hides on a document that never loaded (an absent control never
// lies). The line's own NOTE rides the wire now — a line that carries
// one speaks it under its name (absent stays absent).
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
import { useEffect, useState } from 'react';
import { ArrowUpRight, ClipboardList, Download, Printer, Search, X } from 'lucide-react';
import { csvCell } from './sheet-drill';
import { num, timeAgo } from './primitives';
// v2.250.0 THE AISLE'S BAND — the strip's chip wears the census's own
// four houses (one home, byte-identical classes — never a second
// constant).
import { bandHouse, chipLabel, daysVoice } from '@/lib/cadence-band';

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
    // v2.249.0 THE BIRTH'S LEDGER — the document's birth (additive +
    // optional): the sheet's id, its honest status, its closing, the
    // aisle's name when the walk order wore one. A hand-raised PO
    // answers null — the face renders the silent absence (the type
    // check, never an assumption).
    originStockTake: {
      id: string;
      status: string;
      closedAt: string | null;
      // v2.250.0: the aisle grows its band (additive + optional — a
      // failed read answers null and the strip keeps its today voice).
      walkAisle: { name: string | null; band: string | null; daysSince: number | null } | null;
    } | null;
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
      notes: string | null;
    }>;
  };
}

// • v2.256.0 THE BIRTH'S DOOR — the strip's words grew a control: when
//   the parent hands the drill an `onOpenSheet`, the birth strip grows a
//   "open the sheet" button (data-testid=po-drill-birth-door) that
//   hands the parent {id, storeName, status} — the SheetDrill's own
//   target shape, read from data the wire ALREADY carries (the sheet's
//   id + status ride the birth; the store name rides the PO's store —
//   a birth happens at the document's own yard). The parent closes the
//   PO drill as the sheet opens: ONE drill at a time, the reading
//   moves, nothing fetches twice. A face that cannot open the sheet
//   (no callback) keeps the strip's words — the door is additive,
//   never assumed.
export function PoDrill({ target, onClose, onOpenSheet }: { target: PoDrillTarget; onClose: () => void; onOpenSheet?: (t: { id: string; storeName: string; status: string }) => void }) {
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

  // v2.226.0: THE PAPER TRAIL's gate — while the drill is open, the
  // body carries the class the print stylesheet reads (the shell falls
  // silent, the document becomes the page). A mount/unmount lifecycle
  // effect: the class lives exactly as long as the door does. It rides
  // ABOVE the null guard — hooks never ride a conditional.
  useEffect(() => {
    document.body.classList.add('po-printing');
    return () => document.body.classList.remove('po-printing');
  }, []);

  if (!target) return null;
  const data = wire.data?.data;
  // v2.256.0 THE BIRTH'S DOOR — the target captured once (no non-null
  // assertions inside the JSX closure: the narrowing dies at the arrow,
  // the house keeps its warning baseline).
  const birthTarget = data?.originStockTake && data.store
    ? { id: data.originStockTake.id, storeName: data.store.name, status: data.originStockTake.status }
    : null;

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
      data-po-print-overlay=""
      role="dialog"
      aria-label={`Purchase order ${target.poNumber}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 dark:bg-slate-950/70"
      onClick={onClose}
    >
      <div
        data-po-print=""
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
            data-po-print-off=""
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
            {/* v2.249.0 THE BIRTH'S LEDGER — the org drill names the
                count sheet this PO was born from (the violet door
                family, the SAME voice the branch record speaks): the
                sheet's id, its aisle when it wore one, the honest
                status voice — and, past the cost gate, the restock's
                own shillings (the summary tile's gated total — the
                answer's cost, spoken where the birth is spoken). An
                older cached wire or a hand-raised PO renders the
                silent absence (the type check, never an assumption). */}
            {data.originStockTake && (
              <div
                data-testid="po-drill-birth-strip"
                title={`born at count sheet ${data.originStockTake.id}${data.originStockTake.walkAisle?.name ? ` — the walk order named ${data.originStockTake.walkAisle.name}` : ''}`}
                className="mt-2.5 rounded-lg border border-violet-200 bg-violet-50/60 px-3 py-2 text-[11px] text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200"
              >
                <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                  <ClipboardList className="h-3 w-3" aria-hidden="true" />
                  born at a count sheet
                </p>
                <p className="mt-0.5 font-medium">
                  this PO answers count sheet <span className="tabular-nums">{data.originStockTake.id}</span>
                  {data.originStockTake.walkAisle?.name ? <> — the walk order named {data.originStockTake.walkAisle.name}</> : null}
                  {data.originStockTake.status === 'CLOSED' ? ' (the books heard it).' : ` (${data.originStockTake.status.toLowerCase()}).`}
                  {/* v2.250.0 THE AISLE'S BAND — the walk order's own cadence
                  chip: the variance map's four houses (fresh/stale/beyond/
                  never) read the census's way; the chip's title speaks the
                  days voice, the word the chipLabel names. A band the read
                  could not answer stays absent — never a guessed house. */}
                  {data.originStockTake.walkAisle?.band ? (
                    <span
                      data-testid="po-drill-aisle-band"
                      className={`ml-1.5 inline-flex translate-y-[-0.5px] items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ring-inset ${bandHouse(data.originStockTake.walkAisle.band).chip}`}
                      title={daysVoice({ band: data.originStockTake.walkAisle.band as 'fresh' | 'stale' | 'beyond' | 'never', daysSince: data.originStockTake.walkAisle.daysSince })}
                    >
                      {chipLabel(data.originStockTake.walkAisle.band)}
                    </span>
                  ) : null}
                  {data.summary.totalAmount != null ? (
                    <> The restock carries <span className="tabular-nums">{fmtKes(data.summary.totalAmount)}</span>.</>
                  ) : null}
                </p>
                {/* v2.256.0 THE BIRTH'S DOOR — the words' own control: one
                    button that hands the parent the SheetDrill's target
                    shape and lets the reading move to the sheet. The id
                    above stays text (the words keep their truth); the
                    door is the affordance. Focus rings speak only to
                    keyboards (focus-visible — a mouse press leaves no
                    ring), the same law the lens chips wear this round. */}
                {onOpenSheet && birthTarget && (
                  <button
                    type="button"
                    data-testid="po-drill-birth-door"
                    onClick={() => onOpenSheet(birthTarget)}
                    title={`open count sheet ${birthTarget.id} — the drill's reading moves to the sheet that birthed this order (this drill closes; the roster's door reopens it)`}
                    className="mt-1.5 inline-flex h-6 items-center gap-1 rounded-full bg-violet-100 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800 ring-1 ring-inset ring-violet-300 transition-[filter] hover:brightness-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 dark:bg-violet-500/20 dark:text-violet-100 dark:ring-violet-500/40"
                  >
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    open the sheet
                  </button>
                )}
              </div>
            )}
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
                    <>
                      {/* v2.226.0: THE PAPER — the print act, named for
                          the ear. The stylesheet lays the document on
                          the page; this button only names it. Absent
                          until the document loads (an absent control
                          never lies). */}
                      <button
                        type="button"
                        data-testid="po-drill-print"
                        data-po-print-off=""
                        aria-label={`Print purchase order ${data.poNumber}`}
                        title="the paper trail — the document, on one sheet; the controls stay off the paper"
                        onClick={() => window.print()}
                        className="flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Printer className="h-3 w-3" aria-hidden="true" />
                        Print
                      </button>
                      <button
                        type="button"
                        data-testid="po-drill-export"
                        data-po-print-off=""
                        aria-label={`Download all ${data.lines.length} lines as CSV`}
                        title="the whole order, one file — the finder narrows the reading, never the export"
                        onClick={exportLines}
                        className="flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Download className="h-3 w-3" aria-hidden="true" />
                        CSV
                      </button>
                    </>
                  )}
                  <span className="relative" data-po-print-off="">
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
                    <span data-testid="po-drill-finder-count" data-po-print-off="" className="whitespace-nowrap text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
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
                        {l.notes && (
                          /* v2.226.0: the line's own note — the wire now
                              carries it; a line that carries one speaks
                              it (absent stays absent). Muted family, a
                              quotation hairline: someone's voice on the
                              record, not a system field. */
                          <span data-testid="po-drill-line-note" className="mt-0.5 block border-l-2 border-slate-200 pl-1.5 text-[10px] italic text-slate-500 dark:border-slate-600 dark:text-slate-400">
                            {l.notes}
                          </span>
                        )}
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
