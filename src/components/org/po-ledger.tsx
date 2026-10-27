'use client';

// v2.225.0 THE PIPELINE FROM ABOVE — the procurement ledger, the org
// face of the PO pipeline. The restock dialog's hint chips (v2.224.0)
// named the documents that spoke to each row; this panel shows the
// documents themselves — every branch's purchase orders, newest first,
// filtered honestly (status chips with REAL counts, a branch picker),
// each row a door into the PO drill.
//
// v2.226.0 THE ROSTER'S COPY — the window goes portable: a client-side
// CSV over the rows the ledger ALREADY holds, the WHOLE WINDOW by law
// (the finder narrows the reading, never the export).
//
// THE LAWS IT INHERITS:
// • the cost law: the wire's totalAmount arrives null past
//   `inventory.view.cost` — the face renders the honest absence
//   ("the shillings stay behind the cost gate"), never a hidden zero;
// • the honest-window law: the roster shows the wire's take (30) and
//   SAYS SO when the pipe runs deeper — a window, disclosed, never a
//   pretend-complete list;
// • the deliberate-fetch law: this panel is a SURFACE (the org opened
//   the pipeline on purpose), so its own fetch is the contract —
//   disclosed by the loading face; filter changes refetch (the query
//   key carries the filters), the drill fetches once per door;
// • the panel-owns-its-dark-half law: dark halves from birth; the
//   muted family (slate-500 / dark:slate-400) on every sub-line; the
//   3:1 contrast law on every chip; tabular-nums on every figure;
// • READ-ONLY BY LAW — the branch workspace keeps the only pens.

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ClipboardList, Download, TriangleAlert } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PoDrill, poStatusChip, type PoDrillTarget } from './po-drill';
import { csvCell } from './sheet-drill';
import { num, timeAgo, type StoreRow } from './primitives';

const fmtKes = (v: number) =>
  `KES ${v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// v2.226.0 THE ROSTER'S COPY — the ledger's window goes portable (the
// drill's file law, grown to the list): a client-side CSV over the rows
// the ledger ALREADY holds (zero new fetch). The file speaks the WHOLE
// WINDOW the wire answered — the finder narrows the reading, never the
// export. A cost-gated cell exports EMPTY (absence, never a hidden
// zero); the BOM so Excel opens UTF-8 honestly; CRLF joins; the boring
// quoting law reused verbatim from the sheet drill's pure builder.
export function rosterCsv(rows: PoLedgerWire['data']['rows'], opts: { costGated: boolean }): string {
  const header = 'po_number,status,supplier,branch,lines,ordered_day,total_kes';
  const rowsOut = rows.map((r) =>
    [
      csvCell(r.poNumber),
      csvCell(r.status),
      csvCell(r.supplierName),
      csvCell(r.store.code ?? r.store.name),
      r.lineCount,
      r.orderDate.slice(0, 10),
      !opts.costGated && r.totalAmount != null ? r.totalAmount : '',
    ].join(','),
  );
  return `\ufeff${[header, ...rowsOut].join('\r\n')}`;
}

interface PoLedgerWire {
  success: boolean;
  data: {
    costGated: boolean;
    take: number;
    counts: Array<{ status: string; count: number }>;
    rows: Array<{
      id: string;
      poNumber: string;
      status: string;
      orderDate: string;
      expectedDate: string | null;
      lineCount: number;
      store: { id: string; name: string; code: string | null };
      supplierName: string;
      raisedByName: string | null;
      notes: string | null;
      // v2.227.0: the branch's whisper — low rows at this store whose
      // supplier of record is this row's supplier (0 = silence).
      watchlistHints: number;
      // v2.228.0: the whisper's speakers — the first three (the wire's
      // WATCHLIST_NAMES_CAP) as the branch's own numbers (stock/level);
      // empty when the count is zero (absence stays absent).
      watchlist: Array<{ name: string; stock: number; level: number }>;
      totalAmount: number | null;
    }>;
  };
}

export function ProcurementLedger({ stores }: { stores: StoreRow[] }) {
  // The filters: status (one rung or all) + branch. State of the
  // surface, carried in the query key — a filter change IS a refetch
  // (the counts come back honest for the narrowing too).
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [branchId, setBranchId] = useState<string>('ALL');
  const [drill, setDrill] = useState<PoDrillTarget>(null);
  // The finder's needle — client-side over the loaded window, the
  // sheet drill's law: the reading narrows, the fetch never does.
  const [needle, setNeedle] = useState('');

  const wire = useQuery<PoLedgerWire>({
    queryKey: ['org-po-ledger', statusFilter, branchId],
    staleTime: 15_000,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (branchId !== 'ALL') params.set('storeId', branchId);
      const res = await fetch(`/api/org/purchase-orders?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `the pipeline refused to speak (${res.status})`);
      }
      return res.json();
    },
  });

  const data = wire.data?.data;

  // The finder's arithmetic — over the rows the ledger ALREADY holds
  // (PO number, supplier or branch name, case-insensitive); the tiles
  // and chips stay whole-pipeline (the counts come from the wire).
  const cleanNeedle = needle.trim().toLowerCase();
  const shownRows = useMemo(() => {
    if (!data) return [];
    if (!cleanNeedle) return data.rows;
    return data.rows.filter((r) =>
      r.poNumber.toLowerCase().includes(cleanNeedle) ||
      r.supplierName.toLowerCase().includes(cleanNeedle) ||
      r.store.name.toLowerCase().includes(cleanNeedle) ||
      (r.store.code ?? '').toLowerCase().includes(cleanNeedle),
    );
  }, [data, cleanNeedle]);

  const totalCount = data?.counts.reduce((acc, c) => acc + c.count, 0) ?? 0;

  // v2.226.0: the roster's copy — the WHOLE WINDOW the wire answered
  // (the finder narrows the reading, never the export), gated like the
  // face (a cost-gated cell exports EMPTY).
  const exportRoster = () => {
    if (!data) return;
    const csv = rosterCsv(data.rows, { costGated: data.costGated });
    const name = `po-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      data-testid="po-ledger"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <ClipboardList className="h-4 w-4 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            The procurement ledger
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">purchase orders</span>
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            the org&apos;s pipeline — every branch&apos;s orders, newest first, read-only from up here.
          </p>
        </div>
        {/* The branch picker — the pipeline narrows honestly (a refetch,
            not a client-side mask; the counts answer for the narrowing). */}
        <Select value={branchId} onValueChange={setBranchId}>
          <SelectTrigger
            data-testid="po-ledger-branch-select"
            aria-label="Filter purchase orders by branch"
            className="h-7 w-auto min-w-[150px] gap-1 rounded-md border-slate-200 bg-white px-2 text-[11px] text-slate-700 focus:ring-1 focus:ring-sky-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-[11px]">all branches</SelectItem>
            {stores.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-[11px]">{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* The status ladder — every rung answers with its REAL count
          (the wire's groupBy); a rung with nothing behind it still
          shows zero. aria-pressed carries the filter's state. */}
      {data && (
        <div data-testid="po-ledger-status-row" className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            data-testid="po-ledger-status-ALL"
            aria-pressed={statusFilter === 'ALL'}
            onClick={() => setStatusFilter('ALL')}
            className={`inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[10px] font-semibold tabular-nums ring-1 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${statusFilter === 'ALL' ? 'bg-slate-800 text-white ring-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:ring-slate-100' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-800'}`}
          >
            all <span className="opacity-70">{num(totalCount)}</span>
          </button>
          {data.counts.map((c) => (
            <button
              key={c.status}
              type="button"
              data-testid={`po-ledger-status-${c.status}`}
              aria-pressed={statusFilter === c.status}
              onClick={() => setStatusFilter(statusFilter === c.status ? 'ALL' : c.status)}
              className={`inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[10px] font-semibold tabular-nums ring-1 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${statusFilter === c.status ? 'bg-slate-800 text-white ring-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:ring-slate-100' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-800'}`}
              title={`${c.status.replaceAll('_', ' ').toLowerCase()} — ${c.count} ${c.count === 1 ? 'order' : 'orders'} on the pipeline`}
            >
              {c.status.replaceAll('_', ' ').toLowerCase()} <span className="opacity-70">{num(c.count)}</span>
            </button>
          ))}
        </div>
      )}

      {wire.isLoading && (
        <p data-testid="po-ledger-loading" className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
          reading the pipeline — one fetch of the roster…
        </p>
      )}
      {wire.isError && (
        <p data-testid="po-ledger-error" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {wire.error instanceof Error ? wire.error.message : 'the pipeline refused to speak'}
        </p>
      )}

      {data && (
        <>
          {/* The finder — the sheet drill's law, grown to the roster:
              a client-side needle over the loaded window (PO number,
              supplier or branch), an honest N-of-M, a clear (×). The
              roster's copy rides beside it (v2.226.0): the whole
              window, one file. */}
          <div className="mt-2.5 flex items-center justify-end gap-2">
            {data && data.rows.length > 0 && (
              <button
                type="button"
                data-testid="po-ledger-export"
                aria-label={`Download all ${data.rows.length} orders as CSV`}
                title="the whole window, one file — the finder narrows the reading, never the export"
                onClick={exportRoster}
                className="flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-sky-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Download className="h-3 w-3" aria-hidden="true" />
                CSV
              </button>
            )}
            <span className="relative">
              <input
                type="text"
                data-testid="po-ledger-finder"
                aria-label="Find an order by number, supplier or branch"
                placeholder="find an order — number, supplier, branch"
                value={needle}
                onChange={(e) => setNeedle(e.target.value)}
                className="h-6 w-48 rounded-md border border-slate-200 bg-white px-2 pr-5 text-[10px] text-slate-700 placeholder:text-slate-400 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
              />
              {needle !== '' && (
                <button
                  type="button"
                  data-testid="po-ledger-finder-clear"
                  aria-label="Clear the order finder"
                  onClick={() => setNeedle('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <span aria-hidden="true" className="text-[9px] leading-none">×</span>
                </button>
              )}
            </span>
            <span data-testid="po-ledger-finder-count" className="whitespace-nowrap text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
              {num(shownRows.length)} of {num(data.rows.length)}
            </span>
          </div>

          {data.rows.length === 0 ? (
            <p data-testid="po-ledger-empty" className="mt-2 rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-3 text-[11px] text-slate-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
              {totalCount === 0
                ? 'no purchase order answers this filter — the branch restock dialog raises one when the shelf asks.'
                : 'the filter narrowed the pipe to nothing — lift a rung and the orders return.'}
            </p>
          ) : (
            <ul data-testid="po-ledger-rows" className="mt-1.5 max-h-[42vh] space-y-1.5 overflow-y-auto pr-1">
              {shownRows.map((po) => (
                <li key={po.id} data-testid="po-ledger-row" className="relative flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-white/70 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                  {/* v2.228.0: the whisper moved OUT of the door button —
                      a door inside a door is a lie the DOM refuses (the
                      chip is now its own trigger, the drill stays the
                      row's only navigation). Everything else rides the
                      door exactly as before. */}
                  <button
                    type="button"
                    data-testid={`po-ledger-open-${po.id}`}
                    onClick={() => setDrill({ id: po.id, poNumber: po.poNumber, status: po.status })}
                    className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2 rounded text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ${poStatusChip(po.status)}`}>
                        {po.status.replaceAll('_', ' ')}
                      </span>
                      <span className="font-mono text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-100">{po.poNumber}</span>
                      <span className="truncate text-xs text-slate-600 dark:text-slate-300">{po.supplierName}</span>
                      <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">{po.store.code ?? po.store.name}</span>
                      <ChevronRight className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                        {po.lineCount} {po.lineCount === 1 ? 'line' : 'lines'}
                        {po.totalAmount != null ? ` · ${fmtKes(po.totalAmount)}` : ''}
                        {' · '}
                        {timeAgo(po.orderDate)}
                      </span>
                    </span>
                  </button>
                  {po.watchlistHints > 0 && (
                    /* v2.227.0 THE WATCHLIST STITCH / v2.228.0 THE WHISPER
                        SPEAKS ITS NAMES — the row wears its branch's
                        whisper on a trigger of its own: amber (the
                        watchlist's own family, 3:1 on both halves), the
                        count on the face, the SPEAKERS one door away in
                        a read-only popover over the SAME wire response
                        (zero new fetch — the names rode along). Zero
                        stays silent: absence stays absent, never a
                        padded chip; the trigger itself is absent then. */
                    <Popover>
                      <PopoverTrigger
                        data-testid="po-ledger-watchlist-hint"
                        title={`${po.watchlistHints} ${po.watchlistHints === 1 ? 'row' : 'rows'} on ${po.store.name}'s watchlist ${po.watchlistHints === 1 ? 'hints' : 'hint'} at this supplier — open the names.`}
                        className="inline-flex shrink-0 items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-amber-700 ring-1 ring-amber-200 transition-colors hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30 dark:hover:bg-amber-500/20"
                      >
                        <TriangleAlert className="h-2.5 w-2.5" aria-hidden="true" />
                        {po.watchlistHints} on the watchlist
                      </PopoverTrigger>
                      <PopoverContent
                        data-testid="po-ledger-watchlist-popover"
                        align="end"
                        sideOffset={6}
                        role="dialog"
                        aria-label={`The ${po.watchlistHints} low ${po.watchlistHints === 1 ? 'row' : 'rows'} at ${po.store.name} hinting at ${po.supplierName}`}
                        className="w-80 rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-lg dark:border-amber-500/30 dark:bg-slate-900"
                      >
                        <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                          {po.watchlistHints} {po.watchlistHints === 1 ? 'row' : 'rows'} on {po.store.name}&apos;s watchlist {po.watchlistHints === 1 ? 'speaks' : 'speak'} to {po.supplierName}.
                        </p>
                        <ul className="mt-2 space-y-1">
                          {po.watchlist.map((w) => (
                            <li key={w.name} data-testid="po-ledger-watchlist-speaker" className="flex items-center justify-between gap-2 rounded-lg border border-amber-100 bg-white/80 px-2 py-1.5 dark:border-amber-500/20 dark:bg-slate-800/60">
                              <span className="min-w-0 truncate text-[11px] font-medium text-slate-700 dark:text-slate-200">{w.name}</span>
                              <span className="shrink-0 whitespace-nowrap text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                                {num(w.stock)} on shelf / {num(w.level)} floor
                              </span>
                            </li>
                          ))}
                        </ul>
                        {po.watchlistHints > po.watchlist.length && (
                          <p className="mt-1.5 text-[9px] text-amber-700 dark:text-amber-300">
                            +{num(po.watchlistHints - po.watchlist.length)} more on the branch&apos;s own watchlist face — the whisper names three.
                          </p>
                        )}
                        <p className="mt-1.5 text-[9px] text-slate-500 dark:text-slate-400">
                          supplier of record = the most recent PO that carried the row — the branch&apos;s own derivation, read from up here.
                        </p>
                      </PopoverContent>
                    </Popover>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* The honest-window note: the roster is a window (the wire's
              take), the counts are the pipeline's truth — the note says
              so whenever the pipe runs deeper than the window. */}
          {data.rows.length >= data.take && (
            <p data-testid="po-ledger-cap-note" className="mt-1.5 text-[9px] text-slate-500 dark:text-slate-400">
              showing the latest {num(data.take)} — the counts above read the whole pipe; narrow with a rung or a branch to see deeper.
            </p>
          )}
          {data.costGated && (
            <p data-testid="po-ledger-cost-note" className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
              the shillings stay behind the cost gate — the counts and the units still speak.
            </p>
          )}
          <p data-testid="po-ledger-read-only" className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
            read-only — the branch workspace keeps the pens; this face watches the pipeline.
          </p>
        </>
      )}

      {/* The door's room: keyed per DOCUMENT — a fresh door is a fresh
          mount, so the finder's needle starts empty by construction
          (state of the drill, not of the ledger). */}
      {drill && <PoDrill key={drill.id} target={drill} onClose={() => setDrill(null)} />}
    </div>
  );
}
