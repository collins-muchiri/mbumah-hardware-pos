'use client';

// v2.217.0 THE REORDER BRIDGE — the restock plan dialog.
// v2.218.0 THE FULL RESTOCK — the bridge's scope grows: the named
// watchlist answers name only the LOUDEST twelve items org-wide, so a
// branch whose shortage outruns the cap could only draft from the rows
// the answer happened to carry. The dialog now wears a scope toggle:
//   • named — composed from this answer's rows, ZERO fetch (the
//     v2.217.0 zero-fetch law, untouched);
//   • full — ONE fetch of the branch's own low-stock wire
//     (/api/products/low-stock, the store-level route), uncapped,
//     mapped onto the same RestockItem shape (the store-level formula
//     already speaks the SAME suggested arithmetic: ceil(1.5 × RL − stock)).
// Switching the scope clears the edits (disclosed in the note) — a
// different list is a different draft, never a silent merge.
//
// The dialog is the bridge's far bank — per-branch draft purchase
// orders raised straight from the watchlist, POSTed to
// /api/purchase-orders (the same endpoint the Purchase orders tab has
// always used; the bridge composes the store's existing flow, it never
// invents a second one).
//
// THE LAWS IT INHERITS:
// • the zero-fetch law (v2.199.0, scoped): the NAMED mode composes the
//   rows the kpi-summary payload already carried — the ONLY fetches the
//   dialog may make are the supplier list for the chosen branch and the
//   branch's own low-stock wire, and only in FULL mode. Every fetch is
//   disclosed in the mode note.
// • the count law (v2.216.0): the WATCHLIST modal stays count-voiced
//   (units short are units, never shillings) — but THIS dialog is
//   money-voiced by construction (draft lines, an estimate), so it
//   carries the indicative strip as the family's FOURTH consumer, on
//   the SAME observer terms: KES pivot → silent; no cached wire →
//   silent; an indicative figure is never born from a fetch the ledger
//   made itself.
// • the panel-owns-its-dark-half law (v2.195.0): dark:bg-slate-900 on
//   the panel from birth.
// • the honesty rules: the estimate is VAT-EXCLUSIVE and says so (the
//   server adds VAT at the org's rate when the PO is raised — the
//   success face speaks the server's own total); a zero-quantity line
//   ships nowhere; a branch with no active supplier refuses to submit
//   rather than pretending.
// • the DERIVATION LAW (v2.218.0, the reseed law's final form): the
//   draft NEVER stores its seed. An untouched row RENDERS its seed —
//   the payload's suggestion at the last-paid cost — as a derivation;
//   the lines state holds ONLY the user's edits. Reseeding is clearing:
//   a scope flip and "Draft another" both set the edits to {} and the
//   seeds re-derive themselves. No effect ever writes state here (the
//   file mounts with ZERO useEffect — the identity-churn lesson made
//   structural: a parent re-render cannot wipe what it does not own),
//   and a fresh open is a fresh MOUNT — the parent keys the dialog per
//   branch, so mode and edits reset by construction, no reset effect.

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Minus, Plus, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/currency-utils';
import { num } from './primitives';

export type RestockItem = {
  id: string;
  name: string;
  sku: string;
  stockQty: number;
  reorderLevel: number;
  suggestedQty?: number | null;
  lastUnitCost?: number | null;
  lastSupplierId?: string | null;
  lastSupplierName?: string | null;
};

/** The indicative lens, pre-resolved by the parent's observer (null at the KES pivot). */
export type RestockLens = { code: string; name: string; rate: number; source: string } | null;

type SupplierRow = { id: string; name: string };

type RestockResult = { poNumber: string; itemCount: number; subTotal: number; taxAmount: number; totalAmount: number };

// v2.218.0: the branch low-stock wire's own row shape (the store-level
// route's response — one read of the source of record, no re-invention).
type FullRow = {
  id: string;
  name: string;
  sku: string;
  quantityInStock: number;
  reorderLevel: number;
  suggestedReorderQty: number;
  costPrice: number;
  supplier: { id: string; name: string; lastUnitCost: number } | null;
};

type FullResponse = {
  success: boolean;
  data: FullRow[];
  summary?: { total: number; outOfStock: number; belowReorder: number; nearReorder: number };
};

// The seed — pure, per row: qty starts at the payload's suggestion (the
// store-level low-stock formula's own arithmetic — the two surfaces
// speak one number), unit cost starts at the last PAID cost when the
// wire carried one (the book cost fallback the route already resolved
// server-side). The DERIVATION LAW renders this for every untouched row.
const seededLine = (item: RestockItem) => ({
  qty: Math.max(0, Math.ceil(item.suggestedQty ?? 0)),
  unitCost: Math.max(0, item.lastUnitCost ?? 0),
});

export function RestockDialog({ open, onOpenChange, store, items, lens }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** The branch the PO belongs to (a purchase order is a ONE-store document). */
  store: { id: string; name: string } | null;
  /** The branch's named watchlist rows — quantities are editable, identities are not. */
  items: RestockItem[];
  /** The indicative lens from the SAME observer the sibling strips use. */
  lens: RestockLens;
}) {
  // The edits ONLY (the DERIVATION LAW): a row absent from this record
  // renders its seed; a row present speaks the user's hand. Clearing
  // the record IS the reseed.
  const [lines, setLines] = useState<Record<string, { qty: number; unitCost: number }>>({});
  const [supplierId, setSupplierId] = useState<string>('');
  const [expectedDate, setExpectedDate] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RestockResult | null>(null);
  // The draft scope — 'named' composes this answer's rows (zero fetch),
  // 'full' reads the branch's own low-stock wire (one fetch). A fresh
  // open is a fresh MOUNT (the parent keys per branch), so every open
  // starts on the named rows: the payload's story leads, the fetch is
  // always a deliberate act.
  const [mode, setMode] = useState<'named' | 'full'>('named');

  const storeId = store?.id ?? null;

  // The branch's active suppliers — the ONE fetch the NAMED bridge is
  // allowed (the watchlist wire never carried the supplier roster; a PO
  // needs one).
  const suppliersQuery = useQuery<{ success: boolean; data: SupplierRow[] }>({
    queryKey: ['restock-suppliers', storeId],
    enabled: open && !!storeId,
    staleTime: 60_000,
    queryFn: async () => {
      if (!storeId) throw new Error('no branch on this draft');
      const res = await fetch(`/api/suppliers?storeId=${encodeURIComponent(storeId)}&isActive=true&limit=100`);
      if (!res.ok) throw new Error(`supplier list failed (${res.status})`);
      return res.json();
    },
  });
  const suppliers = useMemo(() => suppliersQuery.data?.data ?? [], [suppliersQuery.data]);

  // v2.218.0: the branch's OWN low-stock wire — the FULL mode's single
  // fetch, uncapped. The route is store-scoped (requireStoreAccess) and
  // already carries the supplier hint (last PO line) + the SAME
  // suggested-reorder arithmetic the named wire rides.
  const fullQuery = useQuery<FullResponse>({
    queryKey: ['restock-full', storeId],
    enabled: open && !!storeId && mode === 'full',
    staleTime: 60_000,
    queryFn: async () => {
      if (!storeId) throw new Error('no branch on this draft');
      const res = await fetch(`/api/products/low-stock?storeId=${encodeURIComponent(storeId)}`);
      if (!res.ok) throw new Error(`the branch's low-stock wire failed (${res.status})`);
      return res.json();
    },
  });

  // The wire's rows mapped onto the draft's own shape — the supplier
  // hint's last-PAID cost wins over the book costPrice (the same
  // precedence the named wire's server-side reduction speaks).
  const fullItems: RestockItem[] = useMemo(
    () => (fullQuery.data?.data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      sku: r.sku,
      stockQty: r.quantityInStock,
      reorderLevel: r.reorderLevel,
      suggestedQty: r.suggestedReorderQty,
      lastUnitCost: r.supplier?.lastUnitCost ?? r.costPrice,
      lastSupplierId: r.supplier?.id ?? null,
      lastSupplierName: r.supplier?.name ?? null,
    })),
    [fullQuery.data],
  );

  // The draft's rows — the scope's list. Both derivations ride the SAME
  // RestockItem shape, so every law below (zero lines, the estimate,
  // the strip) is scope-agnostic by construction.
  const activeItems = useMemo(
    () => (mode === 'full' ? fullItems : items),
    [mode, fullItems, items],
  );

  // The effective supplier — derived, never an effect: the user's explicit
  // choice wins while it stays on the branch's active roster; otherwise the
  // hint the wire carried speaks (the MOST COMMON last supplier among the
  // branch's draft rows); otherwise the roster's first name. The draft
  // begins where the ledger points — never at a guess. v2.218.0: the
  // tally rides the ACTIVE scope's rows, so a full-list draft reads the
  // whole branch's ledger hints, not just the named twelve.
  const effectiveSupplierId = useMemo(() => {
    if (supplierId && suppliers.some((s) => s.id === supplierId)) return supplierId;
    const tally = new Map<string, number>();
    for (const item of activeItems) {
      const hint = item.lastSupplierId;
      if (hint && suppliers.some((s) => s.id === hint)) tally.set(hint, (tally.get(hint) ?? 0) + 1);
    }
    const best = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return best ?? suppliers[0]?.id ?? '';
  }, [supplierId, suppliers, activeItems]);

  // v2.218.0 styling detail: the hint chip — when the draft's supplier
  // came from the LEDGER's hints (not the user's hand), the dialog says
  // so, and names whose ledger spoke. An explicit choice silences it.
  const hintLed = useMemo(() => {
    if (supplierId && suppliers.some((s) => s.id === supplierId)) return null;
    const tally = new Map<string, number>();
    for (const item of activeItems) {
      const hint = item.lastSupplierId;
      if (hint && suppliers.some((s) => s.id === hint)) tally.set(hint, (tally.get(hint) ?? 0) + 1);
    }
    const best = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return best ? (suppliers.find((s) => s.id === best)?.name ?? null) : null;
  }, [supplierId, suppliers, activeItems]);

  // The estimate: Σ(qty × unitCost) over the ACTIVE rows that would
  // ship — VAT-EXCLUSIVE, labeled as such; the server adds the org's
  // VAT rate. The indicative strip rides the SAME figure in both scopes.
  // (The seed is re-derived inline — the deps stay the honest two.)
  const subTotal = useMemo(
    () => activeItems.reduce((acc, item) => {
      const line = lines[item.id] ?? seededLine(item);
      if (line.qty <= 0) return acc;
      return acc + line.qty * line.unitCost;
    }, 0),
    [activeItems, lines],
  );
  const shippingCount = activeItems.filter((item) => (lines[item.id] ?? seededLine(item)).qty > 0).length;

  // THE FOURTH CONSUMER: the indicative strip over the estimate. Same
  // guards, same voice family — the lens arrives pre-resolved (null at
  // the KES pivot or without a cached wire), so silence stays silence.
  const indicative = (() => {
    const activeLens = lens;
    if (!activeLens || subTotal <= 0) return null;
    return {
      figure: formatCurrency(subTotal * activeLens.rate, activeLens.code),
      rateFigure: formatCurrency(activeLens.rate, activeLens.code),
      name: activeLens.name,
      source: activeLens.source,
    };
  })();

  // Writing a quantity — an EDIT records itself over the row's SEED (an
  // untouched row's unitCost is the last-paid seed, never a silent 0).
  const setQty = (id: string, qty: number) =>
    setLines((prev) => {
      const item = activeItems.find((i) => i.id === id);
      const base = prev[id] ?? (item ? seededLine(item) : { qty: 0, unitCost: 0 });
      return { ...prev, [id]: { ...base, qty: Math.max(0, Math.min(999_999, Math.floor(qty))) } };
    });
  const nudgeQty = (id: string, delta: number) =>
    setLines((prev) => {
      const item = activeItems.find((i) => i.id === id);
      if (!item) return prev;
      const base = prev[id] ?? seededLine(item);
      return { ...prev, [id]: { ...base, qty: Math.max(0, Math.min(999_999, base.qty + delta)) } };
    });

  // The scope flip — an EVENT, never an effect: clearing the edits IS
  // the reseed (the new list's seeds re-derive themselves).
  const flipScope = (next: 'named' | 'full') => {
    if (next === mode) return;
    setMode(next);
    setLines({});
    setError(null);
  };

  const submit = async () => {
    if (!store || !effectiveSupplierId) return;
    const payloadItems = activeItems
      .map((item) => ({ productId: item.id, quantity: (lines[item.id] ?? seededLine(item)).qty, unitCost: (lines[item.id] ?? seededLine(item)).unitCost }))
      .filter((line) => line.quantity > 0);
    if (payloadItems.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          supplierId: effectiveSupplierId,
          items: payloadItems,
          notes: mode === 'full'
            ? 'Raised from the org console reorder watchlist (full branch restock list).'
            : 'Raised from the org console reorder watchlist (named watchlist).',
          ...(expectedDate ? { expectedDate } : {}),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.success) {
        setError(body?.error ?? `the draft was refused (${res.status})`);
        return;
      }
      const po = body.data;
      setResult({
        poNumber: po.poNumber,
        itemCount: po.items?.length ?? payloadItems.length,
        subTotal: Number(po.subTotal),
        taxAmount: Number(po.taxAmount),
        totalAmount: Number(po.totalAmount),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'the draft was refused');
    } finally {
      setSubmitting(false);
    }
  };

  // v2.218.0 styling detail: the per-line coverage bar — the line's
  // stock against its reorder level, the SAME hue ladder the watchlist
  // chips speak (out red → deep orange → amber → at-level emerald),
  // drawn at reading size so a full-list draft reads its urgency while
  // it edits. Decorative (aria-hidden) — the numbers carry the meaning.
  const coverageBar = (item: RestockItem) => {
    const cov = item.reorderLevel > 0 ? Math.min(1, item.stockQty / item.reorderLevel) : null;
    const hue = item.stockQty <= 0
      ? 'bg-red-500'
      : cov != null && cov <= 0.5
        ? 'bg-orange-500'
        : cov != null && cov < 1
          ? 'bg-amber-500'
          : 'bg-emerald-500';
    return (
      <span className="mt-1 flex items-center gap-1.5" aria-hidden>
        <span className="h-1 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <span className={`block h-full rounded-full ${hue}`} style={{ width: `${Math.round((cov ?? 0) * 100)}%` }} />
        </span>
        <span className="text-[9px] tabular-nums text-slate-500 dark:text-slate-400">
          {cov != null ? `${Math.round(cov * 100)}% of level` : 'no level'}
        </span>
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="restock-dialog" className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle data-testid="restock-title" className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-amber-600" /> Draft purchase order
            {store && (
              <span
                data-testid="restock-store-name"
                className="ml-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30"
              >
                {store.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {result ? (
          /* The success face — the server's own numbers, never the estimate. */
          <div data-testid="restock-success" className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> DRAFT raised
            </p>
            <p data-testid="restock-po-number" className="mt-1 font-mono text-lg font-bold text-emerald-900 dark:text-emerald-200">{result.poNumber}</p>
            <p className="mt-1 text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
              {result.itemCount} {result.itemCount === 1 ? 'line' : 'lines'} for {store?.name} · subtotal {formatCurrency(result.subTotal, 'KES')} · VAT {formatCurrency(result.taxAmount, 'KES')} · total {formatCurrency(result.totalAmount, 'KES')}
            </p>
            <p className="mt-2 text-[10px] text-emerald-800/70 dark:text-emerald-300/70">
              The branch workspace&apos;s Purchase orders tab carries the full flow — approval, send, receive.
            </p>
            <button
              type="button"
              data-testid="restock-again"
              onClick={() => {
                // "Draft another" clears the edits — the ACTIVE scope's
                // seeds re-derive themselves (a fresh draft, never the
                // shipped one's leftovers).
                setResult(null);
                setError(null);
                setLines({});
              }}
              className="mt-3 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/40 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-500/10"
            >
              Draft another
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* v2.218.0: THE SCOPE TOGGLE — the named rows (zero fetch)
                against the branch's own low-stock wire (one fetch,
                uncapped). aria-pressed pair, honest notes; switching
                clears the edits and says so. */}
            <div role="group" aria-label="Draft scope" className="rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  data-testid="restock-mode-named"
                  aria-pressed={mode === 'named'}
                  onClick={() => flipScope('named')}
                  className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                    mode === 'named'
                      ? 'bg-amber-700 text-white dark:bg-amber-600'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-700'
                  }`}
                >
                  Named watchlist ({items.length})
                </button>
                <button
                  type="button"
                  data-testid="restock-mode-full"
                  aria-pressed={mode === 'full'}
                  onClick={() => flipScope('full')}
                  className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors ${
                    mode === 'full'
                      ? 'bg-amber-700 text-white dark:bg-amber-600'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-700'
                  }`}
                >
                  Full branch list
                </button>
              </div>
              <p data-testid="restock-mode-note" className="mt-1.5 px-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                {mode === 'named'
                  ? 'composed from this answer’s named rows — zero fetch.'
                  : 'fetched live from the branch’s low-stock wire — one fetch, uncapped.'}
                {' '}Switching the list clears the edits.
              </p>
            </div>

            {/* The draft lines — the ACTIVE scope's rows at their seeds,
                editable in place (an untouched row IS its seed; the zero
                law: a zero line ships nowhere and says so; the submit
                refuses an empty draft rather than POSTing a hollow PO).
                The list scrolls at reading height — a full branch list
                can outrun the fold. */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">the draft lines</p>
                <p data-testid="restock-line-count" className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                  {shippingCount} of {activeItems.length} lines shipping
                </p>
              </div>
              {mode === 'full' && fullQuery.isLoading && (
                <p data-testid="restock-full-loading" className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                  reading the branch&apos;s low-stock wire…
                </p>
              )}
              {mode === 'full' && fullQuery.isError && (
                <p data-testid="restock-full-error" className="mt-2 text-[10px] text-red-700 dark:text-red-400">
                  the branch&apos;s low-stock wire failed — switch back to the named rows to draft from this answer.
                </p>
              )}
              {mode === 'full' && fullQuery.data?.summary && !fullQuery.isError && (
                <p data-testid="restock-full-meta" className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  {fullQuery.data.summary.total} at/below level · {fullQuery.data.summary.outOfStock} out of stock · {fullQuery.data.summary.belowReorder} below level
                </p>
              )}
              <ul className="mt-2 max-h-[42vh] space-y-2 overflow-y-auto pr-1">
                {activeItems.map((item) => {
                  const line = lines[item.id] ?? seededLine(item);
                  const lineTotal = line.qty > 0 ? line.qty * line.unitCost : 0;
                  return (
                    <li key={item.id} data-testid={`restock-line-${item.sku}`} className="rounded-lg border border-slate-100 bg-white/70 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/60">
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                          <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">
                            {item.sku} · stock {num(item.stockQty)} / level {num(item.reorderLevel)}
                            {item.lastSupplierName ? ` · last via ${item.lastSupplierName}` : ''}
                          </span>
                          {coverageBar(item)}
                        </span>
                        <span className="shrink-0 text-right">
                          <span data-testid={`restock-line-total-${item.sku}`} className="block text-xs font-semibold tabular-nums text-amber-700 dark:text-amber-400">
                            {lineTotal > 0 ? formatCurrency(lineTotal, 'KES') : '—'}
                          </span>
                          <span className="block text-[9px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {line.qty > 0 ? `excl. VAT` : 'not shipping'}
                          </span>
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {item.suggestedQty != null && item.suggestedQty > 0 ? `suggested ${item.suggestedQty}` : 'no suggestion — set a quantity'}
                        </span>
                        <span className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={`Decrease quantity for ${item.name}`}
                            data-testid={`restock-qty-minus-${item.sku}`}
                            onClick={() => nudgeQty(item.id, -1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            aria-label={`Quantity for ${item.name}`}
                            data-testid={`restock-qty-${item.sku}`}
                            value={line.qty}
                            onChange={(e) => setQty(item.id, Number(e.target.value))}
                            className="h-6 w-14 rounded border border-slate-200 bg-white px-1.5 text-center text-xs tabular-nums text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                          />
                          <button
                            type="button"
                            aria-label={`Increase quantity for ${item.name}`}
                            data-testid={`restock-qty-plus-${item.sku}`}
                            onClick={() => nudgeQty(item.id, +1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {activeItems.length === 0 && mode === 'full' && !fullQuery.isLoading && !fullQuery.isError && (
                <p data-testid="restock-full-empty" className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                  the branch&apos;s wire names nothing at or below its levels — the named rows above carry this answer&apos;s story.
                </p>
              )}
            </div>

            {/* The supplier + expected date — the two fields a PO header
                needs that the watchlist wire could not carry. */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label htmlFor="restock-supplier" className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Supplier</label>
                <Select value={effectiveSupplierId} onValueChange={setSupplierId}>
                  <SelectTrigger id="restock-supplier" data-testid="restock-supplier-select" className="mt-1 h-8 text-xs">
                    <SelectValue placeholder={suppliersQuery.isLoading ? 'loading…' : 'choose a supplier'} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!suppliersQuery.isLoading && suppliers.length === 0 && (
                  <p data-testid="restock-no-supplier" className="mt-1 text-[10px] text-red-700 dark:text-red-400">
                    no active supplier on this branch — add one in the branch workspace first
                  </p>
                )}
                {hintLed && (
                  <p data-testid="restock-supplier-hint" className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    the ledger points to {hintLed} — the draft begins where the ledger points.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="restock-expected" className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Expected (optional)</label>
                <input
                  id="restock-expected"
                  type="date"
                  data-testid="restock-expected-date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                />
              </div>
            </div>

            {/* The estimate — VAT-exclusive and honest about it; the
                indicative strip rides the SAME observer the sibling
                strips use (fourth consumer, v2.217.0), now over the
                ACTIVE scope's rows. */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">estimate (excl. VAT)</span>
                <span data-testid="restock-estimate" className="text-base font-bold tabular-nums text-slate-800 dark:text-slate-100">{formatCurrency(subTotal, 'KES')}</span>
              </div>
              <p className="mt-0.5 text-[9px] text-slate-500 dark:text-slate-400">
                VAT is added at the org&apos;s rate when the PO is raised — the success face speaks the server&apos;s own total.
              </p>
              {indicative && (
                <div
                  data-testid="restock-indicative-strip"
                  aria-label={`Indicative value in ${indicative.name}: approximately ${indicative.figure}, at 1 KES = ${indicative.rateFigure}, ${indicative.source}. The ledger stays in KES — this strip does not change what the estimate is.`}
                  className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg border border-slate-200 bg-white/70 px-2.5 py-1.5 dark:border-slate-600 dark:bg-slate-800/60"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    ≈ <span data-testid="restock-indicative-figure" className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{indicative.figure}</span>
                  </span>
                  <span className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                    1 KES = <span data-testid="restock-indicative-rate" className="tabular-nums">{indicative.rateFigure}</span> · {indicative.source}
                  </span>
                  <span data-testid="restock-indicative-voice" className="text-[10px] text-slate-500 dark:text-slate-400">
                    — indicative; the ledger stays in KES.
                  </span>
                </div>
              )}
            </div>

            {error && (
              <p data-testid="restock-error" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </p>
            )}

            <button
              type="button"
              data-testid="restock-submit"
              disabled={submitting || !effectiveSupplierId || shippingCount === 0}
              onClick={submit}
              className="w-full rounded-md bg-amber-700 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {submitting ? 'raising the draft…' : `Raise DRAFT PO · ${shippingCount} ${shippingCount === 1 ? 'line' : 'lines'} · ${formatCurrency(subTotal, 'KES')}`}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
