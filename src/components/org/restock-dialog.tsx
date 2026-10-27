'use client';

// v2.217.0 THE REORDER BRIDGE — the restock plan dialog.
// v2.221.0 THE SUPPLIER SPLIT — the draft learns that a yard orders
// from more than one counter. The single-supplier draft shipped every
// line to the ledger's LOUDEST hint; the split raises one PO per
// supplier, each line going where its OWN hint points (the hint-less
// rows follow the draft's effective supplier — the explicit choice
// still wins for them). The walk is SEQUENTIAL against the same
// /api/purchase-orders wire (a PO is a one-supplier document; the
// bridge composes the existing flow N times, it never invents a batch
// endpoint), and a refused group never blocks the rest — the success
// face lists every raised PO and names every refusal with the
// server's error.
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
  // v2.222.0: the full wire's urgency tag — the near-band rows wear it.
  urgency?: string;
};

/** The indicative lens, pre-resolved by the parent's observer (null at the KES pivot). */
export type RestockLens = { code: string; name: string; rate: number; source: string } | null;

type SupplierRow = { id: string; name: string };

// v2.221.0: the raise's outcome — every PO the server accepted (with
// its OWN server-truth numbers) and every group it refused (with the
// server's error, named by supplier). A single-PO draft populates
// raised[0] exactly as v2.217.0 did; a split raises one entry per
// supplier. Partial honesty is structural: an entry exists per group
// outcome, never a merged summary that could hide a refusal.
type RaisedPO = { poNumber: string; itemCount: number; subTotal: number; taxAmount: number; totalAmount: number; supplierName: string };
type RefusedGroup = { supplierName: string; lines: number; error: string };
type RestockResult = { raised: RaisedPO[]; refused: RefusedGroup[] };

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
  // v2.222.0: the wire tags each row's urgency — the near-band toggle's
  // rows carry NEAR_REORDER so the widened draft reads which lines are
  // BELOW the level and which are just approaching it.
  urgency?: string;
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
  const [nearBand, setNearBand] = useState(false);
  const [expectedDate, setExpectedDate] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RestockResult | null>(null);
  // v2.221.0: the split is a DELIBERATE act (default OFF — one PO, the
  // v2.217.0 behavior untouched). The toggle's availability is derived
  // (splitOn below), so a scope flip re-coheres it without an effect:
  // a named list with one hint and a full list with three render the
  // toggle's presence honestly from the SAME boolean.
  // The draft scope — 'named' composes this answer's rows (zero fetch),
  // 'full' reads the branch's own low-stock wire (one fetch). A fresh
  // open is a fresh MOUNT (the parent keys per branch), so every open
  // starts on the named rows: the payload's story leads, the fetch is
  // always a deliberate act.
  const [mode, setMode] = useState<'named' | 'full'>('named');
  const [splitMode, setSplitMode] = useState(false);
  // v2.222.0: the NEAR-REORDER BAND — the full scope's honest widening.
  // The wire's includeNear widens the threshold to level × 1.5 so items
  // APPROACHING the level join the draft; it defaults OFF (a restock
  // drafts the shortage, not the comfort) and flipping it refetches —
  // a different list is a different draft, the flip discloses itself.

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
    queryKey: ['restock-full', storeId, nearBand],
    enabled: open && !!storeId && mode === 'full',
    staleTime: 60_000,
    queryFn: async () => {
      if (!storeId) throw new Error('no branch on this draft');
      const res = await fetch(`/api/products/low-stock?storeId=${encodeURIComponent(storeId)}${nearBand ? '&includeNear=true' : ''}`);
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
      urgency: r.urgency,
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
  // v2.221.0: the chip speaks in ONE-PO mode only — in split mode the
  // per-group story takes over and the chip would lie by singular.
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

  // v2.221.0 THE SUPPLIER GROUPS — derived, never an effect (the
  // derivation law holds): a row's supplier is its OWN ledger hint
  // while that hint sits on the branch's ACTIVE roster, else the
  // draft's effective supplier (the explicit choice wins for the
  // hint-less rows — they need a name, and the note says so). Groups
  // carry every row (the LIST reads its cut); the SHIPPING figures
  // count only qty>0 rows (a zero line ships nowhere — a group whose
  // lines all zero raises no PO and the face says how many will).
  const supplierGroups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, RestockItem[]>();
    for (const item of activeItems) {
      const sid = item.lastSupplierId && suppliers.some((s) => s.id === item.lastSupplierId)
        ? item.lastSupplierId
        : effectiveSupplierId;
      const bucket = map.get(sid);
      if (bucket) {
        bucket.push(item);
      } else {
        map.set(sid, [item]);
        order.push(sid);
      }
    }
    return order.map((sid) => {
      const rows = map.get(sid) ?? [];
      const supplierName = suppliers.find((s) => s.id === sid)?.name ?? 'unknown supplier';
      const shippingSubTotal = rows.reduce((acc, item) => {
        const line = lines[item.id] ?? seededLine(item);
        return line.qty > 0 ? acc + line.qty * line.unitCost : acc;
      }, 0);
      const shippingLines = rows.filter((item) => (lines[item.id] ?? seededLine(item)).qty > 0).length;
      return { supplierId: sid, supplierName, rows, shippingSubTotal, shippingLines };
    });
  }, [activeItems, lines, suppliers, effectiveSupplierId]);

  // The split's honest availability: MORE than one group must EXIST
  // (a single-hint draft has nothing to split — the toggle hides
  // rather than disabling, an absent control never lies). splitOn is
  // the DERIVED state the whole dialog reads, so a scope flip or an
  // edit that empties a group re-coheres without an effect.
  const splitAvailable = supplierGroups.length > 1;
  const splitOn = splitMode && splitAvailable;
  const shippingGroupCount = supplierGroups.filter((g) => g.shippingLines > 0).length;

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
    if (payloadLinesFor(activeItems, lines).length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      // v2.221.0: the raise walks the SHIPPING groups (a group whose
      // lines all zero raises nothing) — ONE supplier per POST, the
      // same wire the Purchase orders tab has always used. In one-PO
      // mode the walk is a single step and the behavior is v2.217.0's
      // exactly. SEQUENTIAL, never parallel: a PO run is a ledger
      // sequence, and a mid-run refusal must not race the next raise.
      const groups = splitOn
        ? supplierGroups.filter((g) => g.shippingLines > 0)
        : [{ supplierId: effectiveSupplierId, supplierName: suppliers.find((s) => s.id === effectiveSupplierId)?.name ?? '', rows: activeItems, shippingSubTotal: subTotal, shippingLines: shippingCount }];
      const scopePhrase = mode === 'full' ? 'full branch restock list' : 'named watchlist';
      const raised: RaisedPO[] = [];
      const refused: RefusedGroup[] = [];
      for (let i = 0; i < groups.length; i += 1) {
        const group = groups[i];
        const payloadItems = payloadLinesFor(group.rows, lines);
        if (payloadItems.length === 0) continue;
        const notes = splitOn
          ? `Raised from the org console reorder watchlist (${scopePhrase}) — supplier split ${i + 1} of ${groups.length} (${group.supplierName}).`
          : `Raised from the org console reorder watchlist (${scopePhrase}).`;
        const res = await fetch('/api/purchase-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: store.id,
            supplierId: group.supplierId,
            items: payloadItems,
            notes,
            ...(expectedDate ? { expectedDate } : {}),
          }),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok || !body?.success) {
          // PARTIAL HONESTY: a refused group is NAMED, never swallowed
          // and never fatal to the rest — the walk continues, and the
          // face carries both truths (the raised and the refused).
          refused.push({ supplierName: group.supplierName, lines: payloadItems.length, error: body?.error ?? `the draft was refused (${res.status})` });
          continue;
        }
        const po = body.data;
        raised.push({
          poNumber: po.poNumber,
          itemCount: po.items?.length ?? payloadItems.length,
          subTotal: Number(po.subTotal),
          taxAmount: Number(po.taxAmount),
          totalAmount: Number(po.totalAmount),
          supplierName: group.supplierName,
        });
      }
      if (raised.length === 0 && refused.length === 0) {
        setError('nothing to raise — every line was refused before the walk began');
        return;
      }
      setResult({ raised, refused });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'the draft was refused');
    } finally {
      setSubmitting(false);
    }
  };

  // The payload composition for a group of rows — shared by the single
  // raise and every step of the split walk (one arithmetic, N callers,
  // the same zero law: a line ships only at qty>0).
  function payloadLinesFor(rows: RestockItem[], edits: Record<string, { qty: number; unitCost: number }>) {
    return rows
      .map((item) => ({ productId: item.id, quantity: (edits[item.id] ?? seededLine(item)).qty, unitCost: (edits[item.id] ?? seededLine(item)).unitCost }))
      .filter((line) => line.quantity > 0);
  }

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

  // v2.221.0: the line row, lifted so the flat list and every split
  // group render the SAME row (one markup, N callers — the group
  // dividers organize the list, the rows never change their voice).
  // v2.222.0: a NEAR_REORDER row wears its chip — the widened draft
  // reads which lines are below the level and which are approaching it.
  const restockLineRow = (item: RestockItem) => {
    const line = lines[item.id] ?? seededLine(item);
    const lineTotal = line.qty > 0 ? line.qty * line.unitCost : 0;
    const near = item.urgency === 'NEAR_REORDER';
    return (
      <li key={item.id} data-testid={`restock-line-${item.sku}`} className="rounded-lg border border-slate-100 bg-white/70 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
            <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">
              {item.sku} · stock {num(item.stockQty)} / level {num(item.reorderLevel)}
              {item.lastSupplierName ? ` · last via ${item.lastSupplierName}` : ''}
            </span>
            {near && (
              <span data-testid={`restock-near-chip-${item.sku}`} className="mt-0.5 inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-500/30">
                near band
              </span>
            )}
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
          /* The success face — the server's own numbers, never the estimate.
             v2.221.0: one PO keeps the v2.217.0 face EXACTLY; a split run
             raises the roster — every raised PO speaks its number, supplier
             and total, every refused group is named with the server's own
             error, and the run's server-truth grand total closes it. */
          <div data-testid="restock-success" className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" /> {result.raised.length === 1 ? 'DRAFT raised' : `${result.raised.length} DRAFT POs raised`}
            </p>
            {result.raised.length === 1 ? (
              <>
                <p data-testid="restock-po-number" className="mt-1 font-mono text-lg font-bold text-emerald-900 dark:text-emerald-200">{result.raised[0].poNumber}</p>
                <p className="mt-1 text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                  {result.raised[0].itemCount} {result.raised[0].itemCount === 1 ? 'line' : 'lines'} for {store?.name} · subtotal {formatCurrency(result.raised[0].subTotal, 'KES')} · VAT {formatCurrency(result.raised[0].taxAmount, 'KES')} · total {formatCurrency(result.raised[0].totalAmount, 'KES')}
                </p>
              </>
            ) : (
              <ul data-testid="restock-success-rows" className="mt-2 space-y-1.5">
                {result.raised.map((po) => (
                  <li key={po.poNumber} data-testid="restock-success-row" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200/70 bg-white/70 px-2.5 py-1.5 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                    <span className="flex min-w-0 items-center gap-2">
                      <span data-testid="restock-po-number" className="font-mono text-sm font-bold text-emerald-900 dark:text-emerald-200">{po.poNumber}</span>
                      <span className="truncate text-[11px] font-medium text-emerald-800/90 dark:text-emerald-300/90">{po.supplierName}</span>
                    </span>
                    <span className="text-[10px] tabular-nums text-emerald-800/80 dark:text-emerald-300/80">
                      {po.itemCount} {po.itemCount === 1 ? 'line' : 'lines'} · total {formatCurrency(po.totalAmount, 'KES')}
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-2 px-0.5 pt-1">
                  <span data-testid="restock-success-total" className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                    run total ({result.raised.length} POs)
                  </span>
                  <span className="text-sm font-bold tabular-nums text-emerald-900 dark:text-emerald-200">
                    {formatCurrency(result.raised.reduce((acc, po) => acc + po.totalAmount, 0), 'KES')}
                  </span>
                </li>
              </ul>
            )}
            {result.refused.length > 0 && (
              <div data-testid="restock-refused" className="mt-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 dark:border-red-500/30 dark:bg-red-500/10">
                <p className="text-[11px] font-semibold text-red-700 dark:text-red-300">
                  {result.refused.length === 1 ? '1 supplier was refused — the rest of the run went through:' : `${result.refused.length} suppliers were refused — the rest of the run went through:`}
                </p>
                <ul className="mt-1 space-y-1">
                  {result.refused.map((r) => (
                    <li key={r.supplierName} data-testid="restock-refused-row" className="text-[10px] text-red-700/90 dark:text-red-300/90">
                      <span className="font-semibold">{r.supplierName}</span> ({r.lines} {r.lines === 1 ? 'line' : 'lines'}) — {r.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-2 text-[10px] text-emerald-800/70 dark:text-emerald-300/70">
              The branch workspace&apos;s Purchase orders tab carries the full flow — approval, send, receive.
            </p>
            <button
              type="button"
              data-testid="restock-again"
              onClick={() => {
                // "Draft another" clears the edits — the ACTIVE scope's
                // seeds re-derive themselves (a fresh draft, never the
                // shipped one's leftovers). The split keeps its position:
                // the next draft starts where the yard's habit points.
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
              {mode === 'full' && (
                /* v2.222.0: THE NEAR-REORDER BAND — the full scope's honest
                    widening (the wire's includeNear, level × 1.5). Defaults
                    OFF: a restock drafts the shortage, not the comfort. */
                <div className="mt-1.5">
                  <button
                    type="button"
                    data-testid="restock-near-toggle"
                    aria-pressed={nearBand}
                    onClick={() => setNearBand((v) => !v)}
                    className={`rounded px-2 py-1 text-[10px] font-semibold ring-1 transition-colors ${
                      nearBand
                        ? 'bg-amber-700 text-white ring-amber-700 dark:bg-amber-600 dark:ring-amber-600'
                        : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-600'
                    }`}
                  >
                    Include near-reorder band
                  </button>
                  <span data-testid="restock-near-note" className="ml-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                    {nearBand
                      ? 'the list widened to level × 1.5 — near-band lines wear their chip.'
                      : 'the list stops at the reorder level — widen to catch items approaching it.'}
                  </span>
                </div>
              )}
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
                {splitOn
                  ? /* v2.221.0: the split draft READS its cut — the rows
                       render under their supplier's divider (name, row
                       count, the group's shipping subtotal), in group
                       order. An empty group (every line zeroed) still
                       shows its divider with the honest "nothing
                       shipping" — the cut is visible even when a side
                       of it is quiet. */
                    supplierGroups.map((group) => (
                      <li key={`group-${group.supplierId}`} className="space-y-2">
                        <div data-testid={`restock-group-divider-${group.supplierId}`} className="flex items-center justify-between gap-2 rounded-md bg-amber-50 px-2 py-1 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/30">
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">{group.supplierName}</span>
                            <span className="shrink-0 text-[9px] tabular-nums text-amber-700/80 dark:text-amber-300/80">{group.rows.length} {group.rows.length === 1 ? 'line' : 'lines'}</span>
                          </span>
                          <span className="shrink-0 text-[10px] tabular-nums font-semibold text-amber-800 dark:text-amber-300">
                            {group.shippingLines > 0 ? `${formatCurrency(group.shippingSubTotal, 'KES')}` : 'nothing shipping'}
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {group.rows.map((item) => restockLineRow(item))}
                        </ul>
                      </li>
                    ))
                  : activeItems.map((item) => restockLineRow(item))}
              </ul>
              {activeItems.length === 0 && mode === 'full' && !fullQuery.isLoading && !fullQuery.isError && (
                <p data-testid="restock-full-empty" className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                  the branch&apos;s wire names nothing at or below its levels — the named rows above carry this answer&apos;s story.
                </p>
              )}
            </div>

            {/* The supplier + expected date — the two fields a PO header
                needs that the watchlist wire could not carry. v2.221.0:
                the split toggle joins the supplier when the draft's hints
                name more than one active supplier — "One PO" is the
                honest default, the split is a deliberate act. */}
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
                {hintLed && !splitOn && (
                  <p data-testid="restock-supplier-hint" className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                    the ledger points to {hintLed} — the draft begins where the ledger points.
                  </p>
                )}
                {splitAvailable && (
                  <div className="mt-1.5">
                    <button
                      type="button"
                      data-testid="restock-split-toggle"
                      aria-pressed={splitOn}
                      onClick={() => setSplitMode((v) => !v)}
                      className={`rounded px-2 py-1 text-[10px] font-semibold ring-1 transition-colors ${
                        splitOn
                          ? 'bg-amber-700 text-white ring-amber-700 dark:bg-amber-600 dark:ring-amber-600'
                          : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-600'
                      }`}
                    >
                      {splitOn ? `Per supplier (${shippingGroupCount} PO${shippingGroupCount === 1 ? '' : 's'})` : 'Per supplier'}
                    </button>
                    <p data-testid="restock-split-note" className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      {splitOn
                        ? `the ledger’s hints name ${supplierGroups.length} suppliers — one draft each; your chosen supplier covers the hint-less lines.`
                        : `this draft’s hints span ${supplierGroups.length} suppliers — the split raises one PO each, every line where its own ledger points.`}
                    </p>
                  </div>
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
              {splitOn && (
                <ul className="mt-1.5 space-y-0.5">
                  {supplierGroups.filter((g) => g.shippingLines > 0).map((g) => (
                    <li key={`est-${g.supplierId}`} data-testid={`restock-group-estimate-${g.supplierId}`} className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="truncate text-slate-500 dark:text-slate-400">{g.supplierName} · {g.shippingLines} {g.shippingLines === 1 ? 'line' : 'lines'}</span>
                      <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(g.shippingSubTotal, 'KES')}</span>
                    </li>
                  ))}
                </ul>
              )}
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
              {submitting
                ? 'raising the draft…'
                : splitOn
                  ? `Raise ${shippingGroupCount} DRAFT POs · ${shippingCount} ${shippingCount === 1 ? 'line' : 'lines'} · ${formatCurrency(subTotal, 'KES')}`
                  : `Raise DRAFT PO · ${shippingCount} ${shippingCount === 1 ? 'line' : 'lines'} · ${formatCurrency(subTotal, 'KES')}`}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
