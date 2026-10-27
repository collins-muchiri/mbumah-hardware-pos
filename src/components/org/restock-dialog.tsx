'use client';

// v2.217.0 THE REORDER BRIDGE — the restock plan dialog.
//
// The org console's reorder watchlist (v2.197.0) has been a read-only
// story: it SPEAKS the shortage but cannot ACT on it. This dialog is the
// bridge's far bank — per-branch draft purchase orders raised straight
// from the named watchlist, POSTed to /api/purchase-orders (the same
// endpoint the Purchase orders tab has always used; the bridge composes
// the store's existing flow, it never invents a second one).
//
// THE LAWS IT INHERITS:
// • the zero-fetch law (v2.199.0): the dialog composes the rows the
//   kpi-summary payload already carried (quantities, supplier hints,
//   last-paid costs) — the ONLY fetch it makes is the supplier list for
//   the chosen branch, which the watchlist wire never carried.
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

import { useEffect, useMemo, useState } from 'react';
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
  // The draft lines: qty starts at the payload's suggestion (the store-level
  // low-stock formula's own arithmetic — the two surfaces speak one number),
  // unit cost starts at the last PAID cost when the wire carried one (the
  // book cost fallback the route already resolved server-side).
  const [lines, setLines] = useState<Record<string, { qty: number; unitCost: number }>>({});
  const [supplierId, setSupplierId] = useState<string>('');
  const [expectedDate, setExpectedDate] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RestockResult | null>(null);

  // Re-seed the draft each time the dialog opens for a branch (reopening
  // for a second supplier run starts a FRESH draft — no stale quantities).
  // (One accepted react-hooks/set-state-in-effect warning: reseeding on
  // open is the honest reset — a remount would drop the supplier list
  // cache, a render-derivation would fight the user's edits mid-session.)
  useEffect(() => {
    if (!open) return;
    setError(null);
    setResult(null);
    setSubmitting(false);
    setExpectedDate('');
    const seeded: Record<string, { qty: number; unitCost: number }> = {};
    for (const item of items) {
      seeded[item.id] = {
        qty: Math.max(0, Math.ceil(item.suggestedQty ?? 0)),
        unitCost: Math.max(0, item.lastUnitCost ?? 0),
      };
    }
    setLines(seeded);
  }, [open, items]);

  const storeId = store?.id ?? null;

  // The branch's active suppliers — the ONE fetch the bridge is allowed
  // (the watchlist wire never carried the supplier roster; a PO needs one).
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

  // The effective supplier — derived, never an effect: the user's explicit
  // choice wins while it stays on the branch's active roster; otherwise the
  // hint the wire carried speaks (the MOST COMMON last supplier among the
  // branch's named items); otherwise the roster's first name. The draft
  // begins where the ledger points — never at a guess.
  const effectiveSupplierId = useMemo(() => {
    if (supplierId && suppliers.some((s) => s.id === supplierId)) return supplierId;
    const tally = new Map<string, number>();
    for (const item of items) {
      const hint = item.lastSupplierId;
      if (hint && suppliers.some((s) => s.id === hint)) tally.set(hint, (tally.get(hint) ?? 0) + 1);
    }
    const best = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    return best ?? suppliers[0]?.id ?? '';
  }, [supplierId, suppliers, items]);

  // The estimate: Σ(qty × unitCost) over the lines that would ship —
  // VAT-EXCLUSIVE, labeled as such; the server adds the org's VAT rate.
  const subTotal = useMemo(
    () => items.reduce((acc, item) => {
      const line = lines[item.id];
      if (!line || line.qty <= 0) return acc;
      return acc + line.qty * line.unitCost;
    }, 0),
    [items, lines],
  );
  const shippingCount = items.filter((item) => (lines[item.id]?.qty ?? 0) > 0).length;

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

  const setQty = (id: string, qty: number) =>
    setLines((prev) => ({ ...prev, [id]: { ...prev[id], qty: Math.max(0, Math.min(999_999, Math.floor(qty))) } }));
  const nudgeQty = (id: string, delta: number) =>
    setLines((prev) => ({ ...prev, [id]: { ...prev[id], qty: Math.max(0, Math.min(999_999, prev[id].qty + delta)) } }));

  const submit = async () => {
    if (!store || !effectiveSupplierId) return;
    const payloadItems = items
      .map((item) => ({ productId: item.id, quantity: lines[item.id]?.qty ?? 0, unitCost: lines[item.id]?.unitCost ?? 0 }))
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
          notes: 'Raised from the org console reorder watchlist (v2.217.0).',
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
              onClick={() => setResult(null)}
              className="mt-3 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/40 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-500/10"
            >
              Draft another
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* The draft lines — the named rows with their suggested
                quantities, editable in place. The zero law: a zero line
                ships nowhere and says so; the submit refuses an empty
                draft rather than POSTing a hollow PO. */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">the draft lines</p>
                <p data-testid="restock-line-count" className="text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                  {shippingCount} of {items.length} lines shipping
                </p>
              </div>
              <ul className="mt-2 space-y-2">
                {items.map((item) => {
                  const line = lines[item.id] ?? { qty: 0, unitCost: 0 };
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
                strips use (fourth consumer, v2.217.0). */}
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
