'use client';

// v2.222.0 THE SHEET DRILL — the org face of ONE count sheet. The
// variance map's roster rows become doors; this modal is what they
// open. READ-ONLY BY LAW: the org face watches the floor's truth — no
// count inputs, no close, no cancel (the branch sheet face keeps the
// only pens). Every status drills: COUNTING shows its progress lines,
// CLOSED its variance chips and the stored close-day cost, CANCELLED
// its void.
//
// v2.223.0 THE LINE FINDER — a big sheet's lines can outrun the fold;
// the drill grows a client-side needle (name or SKU, case-insensitive)
// over the lines it ALREADY holds — zero new fetch, the wire untouched.
// The count line says N of M (an honest arithmetic, never a hidden
// filter), the empty face names the needle and the truth ("the sheet
// holds M lines"), and a clear (×) returns the full list. The needle
// is STATE of the drill, not of the sheet: the map keys the drill per
// sheet, so a fresh door opens with an empty needle by construction.
//
// v2.224.0 THE SHEET'S COPY — the drill's lines go portable: a client-
// side CSV over the lines the drill ALREADY holds (zero new fetch, the
// wire untouched) for physical filing — the audit loop a hardware yard
// actually runs (a printed sheet in a ring binder). The law of the
// file: it speaks the WHOLE sheet (the finder narrows the reading,
// never the export); a cost-gated cell exports EMPTY (absence, never a
// hidden zero); a CANCELLED sheet exports its void truth (snapshot +
// uncounted); the button hides on a sheet that froze no lines (an
// absent control never lies).
//
// v2.227.0 THE SHEET'S PAPER — the ring binder's paper to the CSV's
// file: while a sheet drill is open the body carries the sheet-
// printing class, and the print stylesheet (globals.css) silences the
// shell and lays the open sheet on the page — header, tiles, notes,
// lines with their variance chips. The controls (close, finder, CSV/
// Print, N-of-M) stay off the paper — a control is a screen thing.
// The Print button mounts only once the sheet has loaded AND froze
// lines (the CSV sibling law: an absent control never lies);
// window.print() is the whole machinery. The twice-proven PO drill
// pattern transplanted, the amber family's turn.
//
// v2.228.0 THE CLIPBOARD — the paper becomes the floor's TOOL: a
// COUNTING sheet prints as a walk-list, not just a record. While the
// sheet still counts, its paper grows three print-only fittings (the
// base stylesheet keeps them off the screen — a screen face never
// pretends to be a pen): a floor-copy note under the header, an EMPTY
// COUNT BOX on every line (the shelf's ask — write what you see; a
// line the system already heard still gets its box, because the walk
// is the verification), and the signature rules at the foot (counted
// by / checked by / date — a walk needs its witnesses). CLOSED and
// CANCELLED sheets keep the v2.227 record face: chips, not boxes —
// the paper answers to the sheet's status, never to a toggle. The
// Print button's aria speaks the mode for the ear.
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
import { useEffect, useState } from 'react';
import { ClipboardCheck, Download, Printer, Search, X } from 'lucide-react';
import { num, timeAgo } from './primitives';

const fmtKes = (v: number) =>
  `KES ${v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// v2.224.0: CSV escaping — the boring law that keeps a file honest:
// a field carrying a comma, a quote or a newline rides wrapped, its
// own quotes doubled. Pure, so the pins can read it.
export function csvCell(v: string | number | null | undefined): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function sheetLinesCsv(lines: DrillWire['data']['lines'], opts: { costGated: boolean }): string {
  const header = 'product,sku,unit,snapshot,counted,variance,variance_cost_kes';
  const rows = lines.map((l) =>
    [
      csvCell(l.name),
      csvCell(l.sku),
      csvCell(l.unitType),
      l.snapshotQty,
      l.countedQty != null ? l.countedQty : '',
      l.variance != null ? l.variance : '',
      !opts.costGated && l.varianceCost != null ? l.varianceCost : '',
    ].join(','),
  );
  // The BOM: Excel opens UTF-8 honestly (the yard's machine, not ours).
  return `\ufeff${[header, ...rows].join('\r\n')}`;
}

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
  // v2.223.0: the needle — the finder's state, reset by the map's per-
  // sheet key (a fresh door is an empty needle), never an effect.
  const [needle, setNeedle] = useState('');
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

  // v2.227.0: THE SHEET'S PAPER's gate — while the drill is open, the
  // body carries the class the print stylesheet reads (the shell falls
  // silent, the sheet becomes the page). A mount/unmount lifecycle
  // effect: the class lives exactly as long as the door does. It rides
  // ABOVE the null guard — hooks never ride a conditional (the v2.226
  // lesson bank, applied before it could bite here too).
  useEffect(() => {
    document.body.classList.add('sheet-printing');
    return () => document.body.classList.remove('sheet-printing');
  }, []);

  if (!target) return null;
  const data = wire.data?.data;
  // v2.228.0: the clipboard gate — the paper's mode IS the sheet's
  // status (COUNTING walks, CLOSED/CANCELLED record). One derivation,
  // read by the card's attribute, the line boxes, the foot and the
  // Print button's aria — four faces, one law.
  const isClipboard = data?.status === 'COUNTING';

  // v2.224.0: the copy — a download of the WHOLE sheet's lines (the
  // finder narrows the reading, never the export). The cost cell obeys
  // the gate the SAME way the face does: absent is absent in the file.
  const costGated = data?.summary.varianceValue == null;
  const exportLines = () => {
    if (!data) return;
    const csv = sheetLinesCsv(data.lines, { costGated });
    const stamp = data.startedAt.slice(0, 10);
    const name = `count-sheet-${data.store.code ?? 'branch'}-${stamp}-${data.status.toLowerCase()}.csv`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };
  // v2.223.0: the finder's arithmetic — the needle filters the lines
  // the drill ALREADY holds (name or SKU, case-insensitive); the counts
  // stay honest (N of M), the tiles stay whole-sheet (the summary is
  // the SHEET's truth — the finder narrows the reading, never the
  // arithmetic).
  const cleanNeedle = needle.trim().toLowerCase();
  const shownLines = data
    ? (cleanNeedle
        ? data.lines.filter((l) => l.name.toLowerCase().includes(cleanNeedle) || l.sku.toLowerCase().includes(cleanNeedle))
        : data.lines)
    : [];

  return (
    <div
      data-testid="sheet-drill"
      data-sheet-print-overlay=""
      role="dialog"
      aria-label={`Count sheet at ${target.storeName}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 dark:bg-slate-950/70"
      onClick={onClose}
    >
      <div
        data-sheet-print=""
        {...(isClipboard ? { 'data-sheet-clipboard': '' } : {})}
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
            data-sheet-print-off=""
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
            {/* v2.228.0: the clipboard's floor-copy note — print-only
                (the base stylesheet keeps it off the screen), it tells
                the walk what this paper is and where the pens live. */}
            {isClipboard && (
              <p data-sheet-clipboard-note="" className="mt-3 rounded-lg border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2 text-[11px] font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                floor copy — walk the shelves, write what you see; the branch app holds the pens.
              </p>
            )}
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
                then alphabetical; the variance chip carries the meaning.
                v2.223.0: the LINE FINDER rides above the list — a
                client-side needle over the lines the drill already
                holds (zero new fetch), an honest N-of-M count, and an
                empty face that names the needle and the sheet's truth. */}
            <div className="mt-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">the lines</p>
                <div className="flex items-center gap-1.5">
                  {data && data.lines.length > 0 && (
                    <>
                      {/* v2.227.0: THE SHEET'S PAPER — the print act,
                          named for the ear. The stylesheet lays the
                          sheet on the page; this button only names it.
                          Mounts beside the CSV under the SAME gate (a
                          sheet that froze no lines prints nothing but
                          silence — an absent control never lies). */}
                      <button
                        type="button"
                        data-testid="sheet-drill-print"
                        data-sheet-print-off=""
                        aria-label={isClipboard
                          ? `Print the floor's clipboard — ${data.lines.length} lines with empty count boxes`
                          : `Print all ${data.lines.length} lines of the count sheet at ${target.storeName}`}
                        title={isClipboard
                          ? 'the clipboard — the paper walks the shelves with the floor; every line gets a box to write in'
                          : "the sheet's paper — the face lays itself on the page; the controls stay off the paper"}
                        onClick={() => window.print()}
                        className="flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Printer className="h-3 w-3" aria-hidden="true" />
                        Print
                      </button>
                      {/* v2.224.0: THE SHEET'S COPY — the whole sheet, one
                          file. Absent on a line-less sheet (an absent
                          control never lies); the aria names the whole-
                          sheet law so the ear reads the same contract. */}
                      <button
                        type="button"
                        data-testid="sheet-drill-export"
                        data-sheet-print-off=""
                        aria-label={`Download all ${data.lines.length} lines as CSV`}
                        title="the whole sheet, one file — the finder narrows the reading, never the export"
                        onClick={exportLines}
                        className="flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Download className="h-3 w-3" aria-hidden="true" />
                        CSV
                      </button>
                    </>
                  )}
                  <span className="relative" data-sheet-print-off="">
                    <Search className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                    <input
                      type="text"
                      data-testid="sheet-drill-finder"
                      aria-label="Find a line by name or SKU"
                      placeholder="find a line — name or SKU"
                      value={needle}
                      onChange={(e) => setNeedle(e.target.value)}
                      className="h-6 w-40 rounded-md border border-slate-200 bg-white pl-6 pr-5 text-[10px] text-slate-700 placeholder:text-slate-400 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
                    />
                    {needle !== '' && (
                      <button
                        type="button"
                        data-testid="sheet-drill-finder-clear"
                        aria-label="Clear the line finder"
                        onClick={() => setNeedle('')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </span>
                  {data && (
                    <span data-testid="sheet-drill-finder-count" data-sheet-print-off="" className="whitespace-nowrap text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                      {num(shownLines.length)} of {num(data.lines.length)}
                    </span>
                  )}
                </div>
              </div>
              <ul data-testid="sheet-drill-lines-list" className="mt-1.5 max-h-[40vh] space-y-1 overflow-y-auto pr-1">
                {shownLines.map((l) => {
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
                      {isClipboard && (
                        /* v2.228.0: THE COUNT BOX — the paper's ask. A
                            ruled write-in for the pen, one per line,
                            EVERY line (a line the system already heard
                            still walks — the walk is the verification).
                            Print-only: the base stylesheet keeps it off
                            the screen, the print stylesheet lays it on
                            the paper beside the line's snapshot. */
                        <span data-sheet-count-box="" className="flex w-full items-center gap-2 sm:w-auto">
                          <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">counted</span>
                          <span aria-hidden="true" className="h-8 min-w-[8rem] flex-1 rounded border border-dashed border-slate-300 bg-white sm:flex-none sm:w-40 dark:border-slate-600" />
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {data && cleanNeedle !== '' && shownLines.length === 0 && (
                <p data-testid="sheet-drill-finder-empty" className="mt-1.5 rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                  no line answers “{needle.trim()}” — the sheet holds {num(data.lines.length)} {data.lines.length === 1 ? 'line' : 'lines'}.
                </p>
              )}
              {data && data.lines.length === 0 && (
                <p data-testid="sheet-drill-lines-empty" className="mt-1.5 rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                  the sheet froze no lines — nothing to count.
                </p>
              )}
              {isClipboard && (
                /* v2.228.0: the walk's witnesses — print-only signature
                    rules at the foot of the clipboard. A walk needs its
                    names on the record it produced. */
                <div data-testid="sheet-drill-signatures" data-sheet-clipboard-signatures="" className="mt-4 flex items-end gap-4">
                  <span className="flex-1">
                    <span aria-hidden="true" className="block border-b border-slate-400" />
                    <span className="mt-0.5 block text-[9px] uppercase tracking-wide text-slate-500">counted by</span>
                  </span>
                  <span className="flex-1">
                    <span aria-hidden="true" className="block border-b border-slate-400" />
                    <span className="mt-0.5 block text-[9px] uppercase tracking-wide text-slate-500">checked by</span>
                  </span>
                  <span className="w-28">
                    <span aria-hidden="true" className="block border-b border-slate-400" />
                    <span className="mt-0.5 block text-[9px] uppercase tracking-wide text-slate-500">date</span>
                  </span>
                </div>
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
