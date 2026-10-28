'use client';

// v2.219.0 THE STOCKTAKE — the count sheet panel (the branch inventory
// tab's newest section). The cycle count's floor face: open a sheet (the
// branch's snapshot frozen), count against it (a line is re-countable
// until close — the latest count is the truth), and close the sheet so
// the variance speaks into the ledger.
//
// v2.229.0 THE BRANCH WALK — the clipboard's branch-side twin (the org
// drill proved the print pattern; THIS face is where the floor actually
// walks). While the sheet face is open the body carries `sheet-printing`
// — the SAME class the org drill reads — and the sheet lays itself on
// the page: the header (now naming its branch, straight off the detail
// wire's store block), the progress, the lines with their variance
// chips. While the sheet still COUNTS, its paper grows the clipboard's
// three print-only fittings (the floor-copy note, an EMPTY COUNT BOX on
// every line, the signature rules at the foot) — the paper is the
// floor's TOOL, not just its record. CLOSED/CANCELLED sheets keep the
// record face: chips, not boxes. The controls (back, print, CSV, count
// inputs, record buttons, close/cancel zones, the result faces) stay
// off the paper via data-sheet-print-off — a control is a screen thing.
// The CSV rides the SAME sheetLinesCsv the drill exports (never
// re-invented): the whole sheet, one file; the branch's cost gate is
// the panel's own canViewCost prop.
//
// THE LAWS IT INHERITS:
// • the one-open-sheet law: the branch's COUNTING sheet IS the sheet —
//   the create button steps aside honestly while it lives.
// • the count law: this panel is COUNT-VOICED (units are units). The
//   variance VALUE (KES at book cost) speaks only past the
//   inventory.view.cost gate, labeled as the book-cost estimate; the
//   CLOSE face re-voices the SERVER's own numbers — never the client's.
// • the zero law: zero is a count (an empty shelf is a finding, not an
//   absence); a sheet closes only with EVERY line counted — the close
//   button refuses while holes remain, and says how many.
// • the panel-owns-its-dark-half law (v2.195.0): dark:bg-slate-900 from
//   birth; the muted family (slate-500 / dark:slate-400) carries every
//   sub-line.

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ClipboardCheck, Download, FolderTree, History, Loader2, Printer } from 'lucide-react';
import { authorizedFetchJson } from '@/lib/api';
import { num } from '@/components/org/primitives';
// v2.229.0: the CSV law's one voice — the SAME pure builders the org
// drill exports (csvCell's quoting, sheetLinesCsv's BOM + CRLF + the
// cost-gated empty). Imported, never re-invented: the file a branch
// keeps must read exactly like the file the org ledger keeps.
import { sheetLinesCsv } from '@/components/org/sheet-drill';

type SheetRow = {
  id: string;
  status: string;
  notes: string | null;
  startedAt: string;
  closedAt: string | null;
  lineCount: number;
  countedCount: number;
};

type SheetLine = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  unitType: string;
  snapshotQty: number;
  countedQty: number | null;
  variance: number | null;
  varianceCost: number | null;
  bookCost: number | null;
};

type SheetDetail = {
  id: string;
  status: string;
  notes: string | null;
  startedAt: string;
  closedAt: string | null;
  startedByName: string | null;
  closedByName: string | null;
  // v2.229.0: the branch's own name rides the wire — the paper says
  // WHICH yard walked it (a ring binder holds five branches' walks).
  store: { id: string; name: string; code: string | null };
  summary: {
    totalLines: number;
    countedLines: number;
    uncountedLines: number;
    varianceUnits: number;
    varianceValueEstimate: number | null;
  };
  lines: SheetLine[];
};

type CloseResult = {
  id: string;
  status: string;
  lineCount: number;
  appliedCount: number;
  varianceUnits: number;
  varianceCostTotal: number;
};

// v2.220.0: the create flow's category rows (the population picker's
// options) — the categories wire's own includeProductCount face, so the
// picker speaks the REAL frozen count before the sheet opens.
type CategoryRow = { id: string; name: string; productCount?: number };

const fmtKes = (v: number) =>
  `Ksh ${v.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const varianceChip = (v: number) => {
  if (v === 0) return { text: 'exact', cls: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30' };
  if (v > 0) return { text: `+${num(v)} over`, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30' };
  return { text: `${num(v)} short`, cls: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30' };
};

const statusChip = (s: string) => {
  if (s === 'COUNTING') return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30';
  if (s === 'CLOSED') return 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30';
  return 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30';
};

export function StockTakePanel({ storeId, canViewCost }: { storeId: string | null; canViewCost: boolean }) {
  const queryClient = useQueryClient();
  const [openSheetId, setOpenSheetId] = useState<string | null>(null);
  const [createNotes, setCreateNotes] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  // v2.220.0: the population picker — the sheet's scope. FULL (the honest
  // default: every active product) or ONE CATEGORY (the picker resolves
  // server-side; the UI never ships product ids across the wire).
  const [createScope, setCreateScope] = useState<'full' | 'category'>('full');
  const [createCategoryId, setCreateCategoryId] = useState('');
  // v2.220.0: the cancel flow — armed two-step (the same intent law a
  // destructive action owes), with an optional reason the sheet keeps.
  const [cancelArmed, setCancelArmed] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  // The edits-only count draft (the v2.218 derivation law's sibling):
  // the input renders its own session value while typing; a recorded
  // count lands on the wire and the sheet refetches.
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const listQuery = useQuery({
    queryKey: ['stock-takes', storeId],
    enabled: !!storeId,
    staleTime: 15_000,
    queryFn: async () => {
      const res = await authorizedFetchJson(`/api/stock-takes?storeId=${encodeURIComponent(storeId ?? '')}`);
      if (!res.ok || !res.json?.success) throw new Error(res.json?.error ?? `the sheets wire failed (${res.status})`);
      return res.json.data as SheetRow[];
    },
  });

  const detailQuery = useQuery({
    queryKey: ['stock-take', openSheetId],
    enabled: !!openSheetId,
    queryFn: async () => {
      const res = await authorizedFetchJson(`/api/stock-takes/${openSheetId}`);
      if (!res.ok || !res.json?.success) throw new Error(res.json?.error ?? `the sheet wire failed (${res.status})`);
      return res.json.data as SheetDetail;
    },
  });

  // v2.220.0: the picker's options — the categories wire with the REAL
  // product counts (includeProductCount=true), read only while the
  // picker needs them (the create drawer is open AND the category scope
  // is chosen). A category from another store can't leak in: the wire is
  // storeId-scoped, and the create route re-validates server-side.
  const categoriesQuery = useQuery({
    queryKey: ['stock-take-categories', storeId],
    enabled: !!storeId && createOpen && createScope === 'category',
    staleTime: 30_000,
    queryFn: async () => {
      const res = await authorizedFetchJson(`/api/categories?storeId=${encodeURIComponent(storeId ?? '')}&includeProductCount=true`);
      if (!res.ok || !res.json?.success) throw new Error(res.json?.error ?? `the categories wire failed (${res.status})`);
      return (res.json.data as CategoryRow[]).filter((c) => (c.productCount ?? 0) > 0);
    },
  });

  const invalidateSheets = () => {
    queryClient.invalidateQueries({ queryKey: ['stock-takes', storeId] });
    queryClient.invalidateQueries({ queryKey: ['stock-take', openSheetId] });
    // The close re-anchors the books — the tab's product stock and the
    // movement log must re-read (the same invalidations the manual
    // adjustment speaks).
    queryClient.invalidateQueries({ queryKey: ['products', storeId] });
    queryClient.invalidateQueries({ queryKey: ['stock-movements', storeId] });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (createScope === 'category' && !createCategoryId) {
        throw new Error('pick a category first — the sheet refuses an unnamed scope');
      }
      const res = await authorizedFetchJson('/api/stock-takes', {
        method: 'POST',
        body: JSON.stringify({
          storeId,
          ...(createNotes.trim() ? { notes: createNotes.trim() } : {}),
          ...(createScope === 'category' && createCategoryId ? { categoryId: createCategoryId } : {}),
        }),
      });
      if (!res.ok || !res.json?.success) throw new Error(res.json?.error ?? `the sheet was refused (${res.status})`);
      return res.json.data as { id: string; lineCount: number; scope?: string };
    },
    onSuccess: (data) => {
      toast.success(`Count sheet open — ${data.lineCount} lines to count`);
      setCreateNotes('');
      setCreateOpen(false);
      setCreateScope('full');
      setCreateCategoryId('');
      invalidateSheets();
      setOpenSheetId(data.id);
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'the sheet was refused');
    },
  });

  // v2.220.0: the cancel — the sheet's honest way out (the books never
  // hear a cancelled sheet). The two-step arm keeps the accident out.
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await authorizedFetchJson(`/api/stock-takes/${openSheetId}/cancel`, {
        method: 'POST',
        body: JSON.stringify(cancelReason.trim() ? { reason: cancelReason.trim() } : {}),
      });
      if (!res.ok || !res.json?.success) throw new Error(res.json?.error ?? `the cancel was refused (${res.status})`);
      return res.json.data as { id: string; status: string };
    },
    onSuccess: () => {
      toast.success('Sheet cancelled — no stock moved');
      setCancelArmed(false);
      setCancelReason('');
      invalidateSheets();
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'the cancel was refused');
    },
  });

  const countMutation = useMutation({
    mutationFn: async ({ lineId, countedQty }: { lineId: string; countedQty: number }) => {
      const res = await authorizedFetchJson(`/api/stock-takes/${openSheetId}/count`, {
        method: 'POST',
        body: JSON.stringify({ lineId, countedQty }),
      });
      if (!res.ok || !res.json?.success) throw new Error(res.json?.error ?? `the count was refused (${res.status})`);
      return res.json.data;
    },
    onSuccess: () => {
      invalidateSheets();
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'the count was refused');
    },
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      const res = await authorizedFetchJson(`/api/stock-takes/${openSheetId}/close`, { method: 'POST' });
      if (!res.ok || !res.json?.success) throw new Error(res.json?.error ?? `the close was refused (${res.status})`);
      return res.json.data as CloseResult;
    },
    onSuccess: (data) => {
      toast.success(`Sheet closed — ${data.appliedCount} adjustment(s) applied`);
      invalidateSheets();
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'the close was refused');
    },
  });

  const sheets = useMemo(() => listQuery.data ?? [], [listQuery.data]);
  const openSheet = useMemo(() => sheets.find((s) => s.status === 'COUNTING') ?? null, [sheets]);
  const detail = detailQuery.data ?? null;
  // The last close result rides the DETAIL's own status change — the
  // success face reads the wire's summary (server truth), not a memo.
  const closedFace = detail?.status === 'CLOSED' ? detail : null;
  // v2.220.0: the honest void — a CANCELLED sheet's face says what did
  // NOT happen (no stock moved), and the picker's chosen category keeps
  // its row count so the confirm button speaks the real freeze.
  const cancelledFace = detail?.status === 'CANCELLED' ? detail : null;
  // v2.229.0: the paper's mode IS the sheet's status (COUNTING walks,
  // CLOSED/CANCELLED record) — the same one-derivation law the drill
  // reads, consumed by the face's attribute, the count boxes, the
  // signatures and the Print button's aria. Four faces, one law.
  const isClipboard = detail?.status === 'COUNTING';
  // v2.229.0 THE BRANCH WALK's gate — while the sheet face is open the
  // body carries the class the print stylesheet reads (the shell falls
  // silent, the sheet becomes the page). The boolean derivation keeps
  // the effect stable across refetches (the class lives exactly as
  // long as the FACE does, not as long as one wire result). It rides
  // ABOVE the early return — hooks never ride a conditional (the
  // v2.226 lesson bank, applied before it could bite here too).
  const sheetPaperOpen = !!(openSheetId && detail);
  useEffect(() => {
    if (!sheetPaperOpen) return;
    document.body.classList.add('sheet-printing');
    return () => document.body.classList.remove('sheet-printing');
  }, [sheetPaperOpen]);
  // v2.229.0: the sheet's copy at branch level — the SAME pure builder
  // the drill exports, the SAME whole-sheet law (the file speaks every
  // line, never a narrowed reading). The branch's cost gate is the
  // panel's own prop: past it the cost cells export EMPTY (absence,
  // never a hidden zero).
  const sheetCostGated = !canViewCost;
  const exportLines = () => {
    if (!detail) return;
    const csv = sheetLinesCsv(detail.lines, { costGated: sheetCostGated });
    const stamp = detail.startedAt.slice(0, 10);
    const name = `count-sheet-${detail.store.code ?? detail.store.name}-${stamp}-${detail.status.toLowerCase()}.csv`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };
  const pickedCategory = useMemo(
    () => categoriesQuery.data?.find((c) => c.id === createCategoryId) ?? null,
    [categoriesQuery.data, createCategoryId],
  );

  const recordCount = (line: SheetLine) => {
    const raw = drafts[line.id];
    if (raw === undefined || raw.trim() === '') return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error('a count is a number ≥ 0 — zero is a finding, a negative is a lie');
      return;
    }
    countMutation.mutate({ lineId: line.id, countedQty: parsed }, { onSuccess: () => setDrafts((prev) => ({ ...prev, [line.id]: '' })) });
  };

  if (!storeId) return null;

  return (
    // v2.229.0: the overlay mark — on paper (body.sheet-printing) the
    // card IS the page; the CardHeader chrome below stays off it. With
    // the sheet face closed the body class is absent and printing
    // behaves as before.
    <Card data-testid="stocktake-panel" data-sheet-print-overlay="" className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3" data-sheet-print-off="">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4 text-amber-600" /> Stock take
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">cycle count</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {openSheetId && detail ? (
          /* ── THE SHEET FACE — the paper ───────────────────────────── */
          <div
            data-sheet-print=""
            {...(isClipboard ? { 'data-sheet-clipboard': '' } : {})}
            className="space-y-3"
          >
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    data-testid="stocktake-sheet-status"
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ${statusChip(detail.status)}`}
                  >
                    {detail.status}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {/* v2.229.0: the paper names its branch — the wire's
                        own store block, never a client-side guess (a
                        ring binder holds five branches' walks). */}
                    <span data-testid="stocktake-store-name" className="font-semibold text-slate-700 dark:text-slate-200">{detail.store.name}</span>
                    {' · '}{detail.summary.totalLines} lines · started {new Date(detail.startedAt).toLocaleDateString()}
                    {detail.startedByName ? ` · by ${detail.startedByName}` : ''}
                  </span>
                </div>
                {/* v2.229.0: the sheet's two doors — the paper (Print)
                    and the file (CSV), mounted under the SAME gate (a
                    sheet that froze no lines prints and exports nothing
                    but silence — an absent control never lies). Both
                    are controls: both stay off the paper. */}
                <span className="flex shrink-0 items-center gap-1.5" data-sheet-print-off="">
                  {detail.lines.length > 0 && (
                    <>
                      <button
                        type="button"
                        data-testid="stocktake-print"
                        aria-label={isClipboard
                          ? `Print the floor's clipboard — ${detail.lines.length} lines with empty count boxes`
                          : `Print all ${detail.lines.length} lines of the count sheet at ${detail.store.name}`}
                        title={isClipboard
                          ? 'the clipboard — the paper walks the shelves with the floor; every line gets a box to write in'
                          : "the sheet's paper — the face lays itself on the page; the controls stay off the paper"}
                        onClick={() => window.print()}
                        className="flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Printer className="h-3 w-3" aria-hidden="true" />
                        Print
                      </button>
                      <button
                        type="button"
                        data-testid="stocktake-export"
                        aria-label={`Download all ${detail.lines.length} lines as CSV`}
                        title="the whole sheet, one file — the walk's copy for the ring binder"
                        onClick={exportLines}
                        className="flex h-6 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-amber-500/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Download className="h-3 w-3" aria-hidden="true" />
                        CSV
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    data-testid="stocktake-back"
                    onClick={() => {
                      setOpenSheetId(null);
                      setCancelArmed(false);
                      setCancelReason('');
                    }}
                    className="text-[10px] font-semibold text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
                  >
                    ← all sheets
                  </button>
                </span>
              </div>
              {/* The progress bar — counted against the sheet's own total;
                  the hue is the family's amber while counting, emerald
                  when the sheet closes complete. */}
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="img" aria-label={`Counted ${detail.summary.countedLines} of ${detail.summary.totalLines} lines`}>
                <span
                  className={`block h-full rounded-full ${detail.status === 'CLOSED' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${detail.summary.totalLines > 0 ? Math.round((detail.summary.countedLines / detail.summary.totalLines) * 100) : 0}%` }}
                />
              </div>
              <p data-testid="stocktake-progress" className="mt-1 text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                {detail.summary.countedLines} of {detail.summary.totalLines} counted
                {detail.status === 'COUNTING' && detail.summary.uncountedLines > 0 ? ` · ${detail.summary.uncountedLines} to go` : ''}
                {detail.summary.varianceUnits !== 0 ? ` · variance ${num(detail.summary.varianceUnits)} units` : ''}
              </p>
              {canViewCost && detail.summary.varianceValueEstimate != null && detail.summary.varianceValueEstimate !== 0 && (
                <p className="mt-0.5 text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                  book-cost estimate {fmtKes(detail.summary.varianceValueEstimate)} — the close face speaks the server&apos;s own numbers.
                </p>
              )}
            </div>

            {/* v2.229.0: the clipboard's floor-copy note — print-only
                (the base stylesheet keeps it off the screen), it tells
                the walk what this paper is and where the pens live. */}
            {isClipboard && (
              <p
                data-sheet-clipboard-note=""
                className="rounded-lg border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2 text-[11px] font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
              >
                floor copy — walk the shelves, write what you see; this app holds the pens when you&apos;re back.
              </p>
            )}

            {/* The lines — count against the frozen snapshot. Zero is a
                count; the latest count is the truth. v2.229.0: the
                container wears the shared lines mark so the print law
                releases its scroll clamp — a 29-line walk is several
                pages of paper, never a 46vh window of it. */}
            <div data-sheet-lines="" className="max-h-[46vh] space-y-1.5 overflow-y-auto pr-1">
              {detail.lines.map((line) => {
                const chip = line.variance != null ? varianceChip(line.variance) : null;
                return (
                  <div
                    key={line.id}
                    data-testid={`stocktake-line-${line.sku}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white/70 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/60"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-slate-700 dark:text-slate-200">{line.name}</span>
                      <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">
                        {line.sku} · system {num(line.snapshotQty)} {line.unitType?.toLowerCase()}
                        {line.countedQty != null ? ` · counted ${num(line.countedQty)}` : ' · not counted'}
                        {canViewCost && line.varianceCost != null && line.varianceCost !== 0 ? ` · ${fmtKes(line.varianceCost)}` : ''}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {chip && (
                        <span
                          data-testid={`stocktake-variance-${line.sku}`}
                          className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold tabular-nums ring-1 ${chip.cls}`}
                        >
                          {chip.text}
                        </span>
                      )}
                      {detail.status === 'COUNTING' && (
                        <span className="flex items-center gap-1" data-sheet-print-off="">
                          <input
                            type="number"
                            min={0}
                            step="any"
                            inputMode="decimal"
                            aria-label={`Counted quantity for ${line.name}`}
                            data-testid={`stocktake-count-input-${line.sku}`}
                            value={drafts[line.id] ?? ''}
                            onChange={(e) => setDrafts((prev) => ({ ...prev, [line.id]: e.target.value }))}
                            onKeyDown={(e) => e.key === 'Enter' && recordCount(line)}
                            placeholder={String(line.snapshotQty)}
                            className="h-7 w-20 rounded border border-slate-200 bg-white px-1.5 text-center text-xs tabular-nums text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                          />
                          <button
                            type="button"
                            data-testid={`stocktake-record-${line.sku}`}
                            aria-label={`Record count for ${line.name}`}
                            disabled={countMutation.isPending}
                            onClick={() => recordCount(line)}
                            className="rounded bg-amber-700 px-2 py-1 text-[10px] font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-700"
                          >
                            record
                          </button>
                        </span>
                      )}
                    </span>
                    {isClipboard && (
                      /* v2.229.0: THE COUNT BOX — the paper's ask, the
                          drill's own law brought to the branch's walk:
                          a ruled write-in for the pen, one per line,
                          EVERY line (a line the system already heard
                          still walks — the walk IS the verification).
                          Print-only: the base stylesheet keeps it off
                          the screen, the print stylesheet lays it on
                          the paper beside the line's snapshot. */
                      <span data-sheet-count-box="" className="flex w-full items-center gap-2 sm:w-auto">
                        <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">counted</span>
                        <span aria-hidden="true" className="h-8 min-w-[8rem] flex-1 rounded border border-dashed border-slate-300 bg-white sm:flex-none sm:w-40 dark:border-slate-600" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {isClipboard && (
              /* v2.229.0: the walk's witnesses — print-only signature
                  rules at the foot of the clipboard (the drill's own
                  foot). A walk needs its names on the record it
                  produced. */
              <div data-testid="stocktake-signatures" data-sheet-clipboard-signatures="" className="mt-4 flex items-end gap-4">
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

            {/* The close — only a COMPLETE sheet closes (the zero-hole
                law); the success face is the SERVER's own numbers.
                v2.229.0: the whole zone is a control — it stays off
                the paper. */}
            {detail.status === 'COUNTING' && (
              <div className="space-y-2" data-sheet-print-off="">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    data-testid="stocktake-close-btn"
                    disabled={detail.summary.uncountedLines > 0 || closeMutation.isPending}
                    onClick={() => closeMutation.mutate()}
                    className="w-full rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                  >
                    {closeMutation.isPending
                      ? 'closing the sheet…'
                      : detail.summary.uncountedLines > 0
                        ? `Close refused — ${detail.summary.uncountedLines} line${detail.summary.uncountedLines === 1 ? '' : 's'} still uncounted`
                        : `Close sheet · apply ${detail.summary.countedLines} counts to the books`}
                  </button>
                  <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
                    the close applies each line&apos;s counted − system delta to current stock (sales during the count are preserved) and records an ADJUSTMENT movement per changed line.
                  </p>
                </div>
                {/* v2.220.0: the honest way out — a two-step cancel with an
                    optional reason the sheet keeps. NO stock moves, NO
                    movements: the books never hear a cancelled sheet. */}
                <div data-testid="stocktake-cancel-zone" className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                  {!cancelArmed ? (
                    <button
                      type="button"
                      data-testid="stocktake-cancel-arm"
                      disabled={cancelMutation.isPending}
                      onClick={() => setCancelArmed(true)}
                      className="w-full rounded-md border border-red-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      Cancel sheet — count abandoned
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <Input
                        data-testid="stocktake-cancel-reason"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="why is this count abandoned? (optional, kept on the sheet)"
                        className="h-7 border-slate-200 bg-white text-xs dark:border-slate-600 dark:bg-slate-900"
                      />
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          data-testid="stocktake-cancel-confirm"
                          disabled={cancelMutation.isPending}
                          onClick={() => cancelMutation.mutate()}
                          className="flex-1 rounded-md bg-red-700 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
                        >
                          {cancelMutation.isPending ? 'cancelling…' : 'Confirm cancel — no stock moves'}
                        </button>
                        <button
                          type="button"
                          data-testid="stocktake-cancel-disarm"
                          onClick={() => {
                            setCancelArmed(false);
                            setCancelReason('');
                          }}
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          keep counting
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
                    a cancelled sheet is a void — no adjustments, no movements; the counts were practice.
                  </p>
                </div>
              </div>
            )}
            {cancelledFace && (
              <div data-testid="stocktake-cancelled-face" data-sheet-print-off="" className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-600 dark:bg-slate-800/60">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Sheet cancelled — the books never heard it</p>
                <p data-testid="stocktake-cancelled-summary" className="mt-1 text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                  {cancelledFace.summary.totalLines} lines · no adjustments applied · no movements written
                  {cancelledFace.closedByName ? ` · cancelled by ${cancelledFace.closedByName}` : ''}
                  {cancelledFace.closedAt ? ` · ${new Date(cancelledFace.closedAt).toLocaleDateString()}` : ''}
                </p>
                {cancelledFace.notes && (
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{cancelledFace.notes}</p>
                )}
              </div>
            )}
            {closedFace && (
              <div data-testid="stocktake-close-success" data-sheet-print-off="" className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Sheet closed — the books hold the floor&apos;s numbers</p>
                <p data-testid="stocktake-close-summary" className="mt-1 text-[11px] tabular-nums text-emerald-900/80 dark:text-emerald-200/80">
                  {closedFace.summary.totalLines} lines · {closedFace.summary.countedLines} counted · variance {num(closedFace.summary.varianceUnits)} units
                  {canViewCost && ` · ledger impact ${fmtKes(closedFace.lines.reduce((acc, l) => acc + (l.varianceCost ?? 0), 0))}`}
                  {closedFace.closedByName ? ` · closed by ${closedFace.closedByName}` : ''}
                </p>
                <p className="mt-1 text-[9px] text-emerald-800/70 dark:text-emerald-300/70">
                  every changed line carries an ADJUSTMENT movement — the movement log below tells the same story.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* ── THE LIST FACE ─────────────────────────────────────────── */
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                count the shelves against a frozen snapshot — the close re-anchors the books.
              </p>
              {openSheet ? (
                <span className="text-[10px] text-slate-500 dark:text-slate-400" title="the one-open-sheet law: the branch's COUNTING sheet is the sheet">
                  a sheet is already counting
                </span>
              ) : (
                <Button
                  type="button"
                  data-testid="stocktake-create-btn"
                  size="sm"
                  className="h-7 bg-amber-700 px-2.5 text-[11px] font-semibold text-white hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700"
                  disabled={createMutation.isPending || listQuery.isLoading}
                  onClick={() => setCreateOpen((v) => !v)}
                >
                  {createMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ClipboardCheck className="h-3 w-3" />}
                  New count sheet
                </Button>
              )}
            </div>

            {createOpen && !openSheet && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-2 dark:border-amber-500/30 dark:bg-amber-500/10">
                <Input
                  data-testid="stocktake-create-notes"
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  placeholder="notes (optional) — e.g. month-end Juja count"
                  className="h-7 border-slate-200 bg-white text-xs dark:border-slate-600 dark:bg-slate-900"
                />
                {/* v2.220.0: the population picker — the sheet's scope
                    speaks before it freezes. FULL is the honest default
                    (every active product); ONE CATEGORY narrows the count
                    to a named aisle, resolved server-side, its real row
                    count read from the categories wire. */}
                <div className="mt-1.5 flex items-center gap-1" role="group" aria-label="Sheet population">
                  <button
                    type="button"
                    data-testid="stocktake-scope-full"
                    aria-pressed={createScope === 'full'}
                    onClick={() => setCreateScope('full')}
                    className={`rounded px-2 py-1 text-[10px] font-semibold ring-1 ${createScope === 'full' ? 'bg-amber-700 text-white ring-amber-700 dark:bg-amber-600 dark:ring-amber-600' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-600'}`}
                  >
                    Every active product
                  </button>
                  <button
                    type="button"
                    data-testid="stocktake-scope-category"
                    aria-pressed={createScope === 'category'}
                    onClick={() => setCreateScope('category')}
                    className={`inline-flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold ring-1 ${createScope === 'category' ? 'bg-amber-700 text-white ring-amber-700 dark:bg-amber-600 dark:ring-amber-600' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-600'}`}
                  >
                    <FolderTree className="h-3 w-3" /> One category
                  </button>
                </div>
                {createScope === 'category' && (
                  <div className="mt-1.5">
                    <select
                      data-testid="stocktake-create-category"
                      value={createCategoryId}
                      onChange={(e) => setCreateCategoryId(e.target.value)}
                      aria-label="Count sheet category"
                      className="h-7 w-full rounded border border-slate-200 bg-white px-1.5 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="">pick a category…</option>
                      {(categoriesQuery.data ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} · {c.productCount ?? 0} products
                        </option>
                      ))}
                    </select>
                    {categoriesQuery.isLoading && (
                      <p data-testid="stocktake-categories-loading" className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">reading the categories…</p>
                    )}
                    {categoriesQuery.isError && (
                      <p data-testid="stocktake-categories-error" className="mt-1 text-[9px] text-red-700 dark:text-red-400">the categories wire failed — the full sheet is still one click away.</p>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  data-testid="stocktake-create-confirm"
                  disabled={createMutation.isPending}
                  onClick={() => createMutation.mutate()}
                  className="mt-1.5 w-full rounded-md bg-amber-700 px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-700"
                >
                  {createMutation.isPending
                    ? 'freezing the snapshot…'
                    : createScope === 'category'
                      ? pickedCategory
                        ? `Open the sheet — freeze ${pickedCategory.productCount ?? 0} products in ${pickedCategory.name}`
                        : 'Open the sheet — pick a category first'
                      : 'Open the sheet — freeze every active product'}
                </button>
                <p className="mt-1 text-[9px] text-slate-500 dark:text-slate-400">
                  the snapshot freezes inside one transaction — the sheet counts against a moment, never a moving number.
                </p>
              </div>
            )}

            {listQuery.isLoading && (
              <p data-testid="stocktake-loading" className="text-[10px] text-slate-500 dark:text-slate-400">reading the sheets…</p>
            )}
            {listQuery.isError && (
              <p data-testid="stocktake-error" className="text-[10px] text-red-700 dark:text-red-400">
                {listQuery.error instanceof Error ? listQuery.error.message : 'the sheets wire failed'}
              </p>
            )}
            {!listQuery.isLoading && !listQuery.isError && sheets.length === 0 && (
              <p data-testid="stocktake-empty" className="rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-[10px] text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                no count sheets yet — the floor has not spoken. Open one before month-end.
              </p>
            )}
            <ul className="space-y-1.5">
              {sheets.map((sheet) => (
                <li key={sheet.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white/70 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ${statusChip(sheet.status)}`}>
                        {sheet.status}
                      </span>
                      <span className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                        {new Date(sheet.startedAt).toLocaleDateString()} · {sheet.countedCount}/{sheet.lineCount} counted
                      </span>
                    </span>
                    {sheet.notes && <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">{sheet.notes}</span>}
                  </span>
                  <button
                    type="button"
                    data-testid={`stocktake-open-${sheet.id}`}
                    onClick={() => setOpenSheetId(sheet.id)}
                    className="flex shrink-0 items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <History className="h-3 w-3" /> {sheet.status === 'COUNTING' ? 'Resume' : 'View'}
                  </button>
                </li>
              ))}
            </ul>
            {/* The variance units of the LAST closed sheet — the panel's
                quiet memory (count-voiced; the shillings live on the
                sheet face past the cost gate). */}
            {sheets.find((s) => s.status === 'CLOSED') && (
              <Badge variant="outline" className="w-fit border-slate-200 text-[9px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
                last closed sheet: {sheets.find((s) => s.status === 'CLOSED')?.countedCount}/{sheets.find((s) => s.status === 'CLOSED')?.lineCount} lines counted
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
