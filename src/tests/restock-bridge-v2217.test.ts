// v2.217.0 — the reorder bridge.
//
//   - THE BRIDGE: the org console's reorder watchlist (read-only since
//     v2.197.0) gains per-branch Draft PO doors, and the restock dialog
//     (src/components/org/restock-dialog.tsx) raises the draft through
//     the SAME /api/purchase-orders endpoint the Purchase orders tab has
//     always used — the bridge composes the store's existing flow, it
//     never invents a second one.
//   - THE WIRE: /api/org/kpi-summary's named watchlist now rides the
//     PO-draft kit (storeId, costPrice, suggestedQty via the store-level
//     1.5× formula, and the supplier hint from the most recent PO line).
//   - THE FOURTH CONSUMER: the restock draft's estimate is money-voiced
//     by construction and carries the indicative strip on the SAME
//     observer terms — while the watchlist modal itself stays
//     count-voiced BY LAW.
//   - THE ZERO LAWS: a zero-quantity line ships nowhere; the submit
//     refuses an empty draft; a branch with no store on the wire never
//     opens the door; an all-unnamed group stays null; and the orphaned
//     low-stock alert panel (imported nowhere since birth) is gone.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const ROW_PATH = 'src/components/org/kpi-row.tsx';
const DIALOG_PATH = 'src/components/org/restock-dialog.tsx';
const API_PATH = 'src/app/api/org/kpi-summary/route.ts';
const PRIMS_PATH = 'src/components/org/primitives.tsx';

const row = read(ROW_PATH);
const dialog = read(DIALOG_PATH);
const api = read(API_PATH);
const prims = read(PRIMS_PATH);

// ── THE WIRE ────────────────────────────────────────────────────────────────

describe('the kpi-summary wire carries the PO-draft kit (v2.217.0)', () => {
  it('the products query resolves the store id alongside the name', () => {
    expect(api.includes("store: { select: { id: true, name: true, code: true } }")).toBe(true);
  });

  it('each named item rides the POST target, the cost fallback and the suggestion', () => {
    expect(api.includes('storeId: p.store?.id ?? null,')).toBe(true);
    expect(api.includes('costPrice: toDec(p.costPrice).toNumber(),')).toBe(true);
    expect(api.includes('suggestedQty: Math.max(0, Math.ceil(toDec(p.reorderLevel).mul(1.5).minus(toDec(p.quantityInStock)).toNumber())),')).toBe(true);
  });

  it('the suggestion is the store-level formula — one arithmetic, two surfaces', () => {
    expect(api.includes("1.5 \u00d7 RL \u2212 stock")).toBe(true);
  });

  it('the supplier hint is ONE bounded read, newest PO first', () => {
    expect(api.includes("orderBy: { purchaseOrder: { orderDate: 'desc' } },")).toBe(true);
    expect(api.includes('take: 60,')).toBe(true);
    expect(api.includes("purchaseOrder: { select: { supplierId: true, supplier: { select: { name: true } } } }")).toBe(true);
  });

  it('the hint reduces to the first hit per product, then falls back to the book cost', () => {
    expect(api.includes('if (seenLowIds.has(line.productId)) continue;')).toBe(true);
    expect(api.includes('if (item.lastUnitCost == null) item.lastUnitCost = item.costPrice;')).toBe(true);
  });

  it('the payload type carries the kit as OPTIONAL (older answers keep the count story)', () => {
    expect(prims.includes('storeId?: string | null; costPrice?: number | null; suggestedQty?: number | null; lastUnitCost?: number | null; lastSupplierId?: string | null; lastSupplierName?: string | null')).toBe(true);
  });
});

// ── THE BRIDGE DOORS ────────────────────────────────────────────────────────

describe('the watchlist grows per-branch Draft PO doors (v2.217.0)', () => {
  it('the branch grouping carries the store id (first non-null wins)', () => {
    expect(row.includes('if (acc[name].storeId == null && p.storeId) acc[name].storeId = p.storeId;')).toBe(true);
  });

  it('the door is disabled honestly when the rows carry no store', () => {
    expect(row.includes('disabled={!b.storeId}')).toBe(true);
  });

  it('the door opens scoped to that branch and its named rows', () => {
    expect(row.includes('data-testid={`restock-open-${b.name}`}')).toBe(true);
    expect(row.includes('onClick={() => b.storeId && setRestockStore({ id: b.storeId, name: b.name })}')).toBe(true);
    // v2.218.0: the rows ride a memoized derivation (stable identity).
    expect(row.includes('items={restockItems}')).toBe(true);
    expect(row.includes('(stockRows ?? []).filter((p) => restockStore != null && p.storeId === restockStore.id),')).toBe(true);
  });

  it('the named rows wear the suggestion chip — the honest zero stays silent', () => {
    expect(row.includes('data-testid={`restock-suggest-${p.sku}`}')).toBe(true);
    expect(row.includes('p.suggestedQty != null && p.suggestedQty > 0 && (')).toBe(true);
  });

  it('the branch rows name the supplier hints from the wire', () => {
    expect(row.includes('no supplier hints on this answer')).toBe(true);
  });
});

// ── THE RESTOCK DIALOG ──────────────────────────────────────────────────────

describe('the restock dialog composes the store\u2019s existing flow (v2.217.0)', () => {
  it('it POSTs to the SAME endpoint the Purchase orders tab has always used', () => {
    expect(dialog.includes("fetch('/api/purchase-orders', {")).toBe(true);
    // v2.218.0: the notes grew a scope suffix — the PO names which list
    // it drafted from (named watchlist vs the full branch restock list).
    // v2.221.0: the phrase composes ONCE (the scope phrase) and the
    // split run appends its own k-of-n suffix — one voice, N raises.
    expect(dialog.includes('Raised from the org console reorder watchlist (')).toBe(true);
    expect(dialog.includes("const scopePhrase = mode === 'full' ? 'full branch restock list' : 'named watchlist';")).toBe(true);
    expect(dialog.includes('Raised from the org console reorder watchlist (${scopePhrase})')).toBe(true);
  });

  it('the draft seeds from the wire: suggestion for qty, last-paid cost for unit cost', () => {
    expect(dialog.includes('qty: Math.max(0, Math.ceil(item.suggestedQty ?? 0)),')).toBe(true);
    expect(dialog.includes('unitCost: Math.max(0, item.lastUnitCost ?? 0),')).toBe(true);
  });

  it('the zero law: a zero line ships nowhere and the submit refuses an empty draft', () => {
    expect(dialog.includes('.filter((line) => line.quantity > 0);')).toBe(true);
    // v2.221.0: the composition lifted into payloadLinesFor (one
    // arithmetic, the single raise and every split step share it).
    expect(dialog.includes('if (payloadLinesFor(activeItems, lines).length === 0) return;')).toBe(true);
  });

  it('the supplier default is derived, never an effect — the ledger\u2019s hint leads', () => {
    expect(dialog.includes('const effectiveSupplierId = useMemo(')).toBe(true);
    expect(dialog.includes('if (supplierId && suppliers.some((s) => s.id === supplierId)) return supplierId;')).toBe(true);
  });

  it('the submit gate rides the EFFECTIVE supplier (found live in the v2.217 QA drive)', () => {
    // The first build gated on the RAW supplierId state — the combobox
    // showed the derived default (Bamburi) while the button stayed
    // disabled, a derived-vs-state mismatch the E2E caught before ship.
    expect(dialog.includes('disabled={submitting || !effectiveSupplierId || shippingCount === 0}')).toBe(true);
  });

  it('the supplier roster is the ONE fetch the bridge is allowed', () => {
    expect(dialog.includes("queryKey: ['restock-suppliers', storeId],")).toBe(true);
    expect(dialog.includes('/api/suppliers?storeId=${encodeURIComponent(storeId)}')).toBe(true);
  });

  it('the draft reseeds by DERIVATION — the edits are the only state', () => {
    // v2.218.0: the reseed law's final form — an untouched row renders
    // its seed (?? seededLine(item)); the lines state holds ONLY the
    // user's edits; the parent keys the dialog per branch so a fresh
    // open is a fresh mount (no reset effect to go stale).
    expect(dialog.includes('?? seededLine(item)')).toBe(true);
    expect(dialog.includes("const [lines, setLines] = useState<Record<string, { qty: number; unitCost: number }>>({});")).toBe(true);
  });

  it('the success face speaks the SERVER\u2019s own numbers', () => {
    expect(dialog.includes('data-testid="restock-po-number"')).toBe(true);
    expect(dialog.includes('Number(po.totalAmount)')).toBe(true);
  });

  it('errors surface — the refusal is never swallowed', () => {
    expect(dialog.includes('data-testid="restock-error"')).toBe(true);
    expect(dialog.includes('body?.error ?? `the draft was refused (${res.status})`')).toBe(true);
  });
});

// ── THE FOURTH CONSUMER ─────────────────────────────────────────────────────

describe('the indicative strip reaches its fourth consumer (v2.217.0)', () => {
  it('the lens is pre-resolved on the SAME guards (pivot, finite rate, known code)', () => {
    expect(row.includes("if (activeCurrency === 'KES') return null;")).toBe(true);
    expect(row.includes('if (!entry || typeof entry.kesToRate !== \'number\' || !Number.isFinite(entry.kesToRate)) return null;')).toBe(true);
    expect(row.includes('const meta = CURRENCY_BY_CODE[activeCurrency];')).toBe(true);
  });

  it('the strip carries the family sentence — the ledger stays in KES', () => {
    expect(dialog.includes('data-testid="restock-indicative-strip"')).toBe(true);
    expect(dialog.includes('data-testid="restock-indicative-figure"')).toBe(true);
    expect(dialog.includes('data-testid="restock-indicative-rate"')).toBe(true);
    expect(dialog.includes('data-testid="restock-indicative-voice"')).toBe(true);
    expect(dialog.includes('\u2014 indicative; the ledger stays in KES.')).toBe(true);
  });

  it('the estimate is VAT-EXCLUSIVE and honest about who adds the VAT', () => {
    expect(dialog.includes('estimate (excl. VAT)')).toBe(true);
    expect(dialog.includes('VAT is added at the org&apos;s rate when the PO is raised')).toBe(true);
  });

  it('the watchlist modal itself stays count-voiced — no strip mounts there', () => {
    const watchlistModal = row.slice(row.indexOf('Reorder watchlist'), row.indexOf('THE REORDER BRIDGE'));
    expect(watchlistModal.includes('indicative-strip')).toBe(false);
  });

  it('the lens type stays honest — null at the pivot is part of the contract', () => {
    expect(dialog.includes('export type RestockLens = { code: string; name: string; rate: number; source: string } | null;')).toBe(true);
  });
});

// ── THE ZERO LAWS + THE CLEANUP ─────────────────────────────────────────────

describe('the round\u2019s honest cleanup (v2.217.0)', () => {
  it('the orphaned low-stock alert panel is gone', () => {
    let missing = false;
    try { read('src/components/inventory/low-stock-alert-panel.tsx'); } catch { missing = true; }
    expect(missing).toBe(true);
  });

  it('nothing imports the orphan anymore', () => {
    expect(row.includes('low-stock-alert-panel')).toBe(false);
    expect(dialog.includes('low-stock-alert-panel')).toBe(false);
  });

  it('the changelog of record speaks the round', () => {
    expect(read('CHANGELOG.md').includes('## [2.217.0] The reorder bridge')).toBe(true);
  });

  it('the changelog feed grows the entry (the counters moved with it)', () => {
    const feed = read('src/lib/whats-new.ts');
    expect(feed.includes("version: '2.217.0',")).toBe(true);
    expect(feed.includes("title: 'The reorder bridge',")).toBe(true);
  });
});
