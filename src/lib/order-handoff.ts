// src/lib/order-handoff.ts — THE ORDER'S HANDOFF (v2.416.0)
//
// The restock banner (the inventory desk's low-stock order) and the
// purchase-order desk live in different tabs, and tabs here unmount on
// switch — there is no shared parent holding the order between desks.
// The handoff is therefore a POCKET: the banner folds the order into a
// sessionStorage envelope, the purchase-order desk reads it ONCE at
// mount and consumes it (read + clear, one-way — a manual "New PO" can
// never inherit a birth by accident, the same law the restock sheet's
// ?restockFrom= door speaks).
//
// The laws the pocket keeps:
// - THE SHAPE LAW: an unreadable envelope (malformed JSON, missing
//   fields, wrong types) is refused, never half-read.
// - THE STORE LAW: an envelope addressed to another branch is not this
//   desk's mail — the reader refuses it, and the caller clears it.
// - THE ONE-WAY LAW: consumption clears the pocket. The order rides
//   once; a cancelled dialog does not resurrect it (the banner can
//   always re-send — the live shelf is the source of truth, not a
//   stale pocket).
// - THE HONEST MAP: a carried line whose sku the current shelf no
//   longer knows is dropped and COUNTED — the desk speaks the dropped
//   lines, never a silently shortened order.

import { reorderGap, type RestockRow } from '@/lib/stock-order';

export interface OrderHandoffItem {
  sku: string;
  name: string;
  /** The units the order asks for (the reorder gap — never a stock read). */
  quantity: number;
  onHand: number;
  reorderLevel: number;
}

export interface OrderHandoffPayload {
  storeId: string;
  /** The branch's name as the banner printed it (STORE_LIST's name). */
  storeName: string;
  /** ISO instant of the fold (honesty about age, not a freshness gate —
   *  the consuming desk is always the next desk in the same session). */
  carriedAt: string;
  lines: number;
  units: number;
  items: OrderHandoffItem[];
}

export const ORDER_HANDOFF_KEY = 'mbumah.order-handoff.v1';

/** The PO desk's item-row seed — exactly the create dialog's own row
 *  shape, so the carried order lands as rows the actor can edit (the
 *  carried order is a DRAFT, never a commitment). */
export interface OrderHandoffPoItem {
  productId: string;
  name: string;
  sku: string;
  quantity: string;
  unitCost: string;
  currentStock: number;
}

/** Fold the banner's rows into an envelope. Pure: the caller owns the
 *  clock. The nothing-to-order law lives upstream (the selector) — but
 *  the fold defends itself too: a row with a non-positive gap never
 *  joins (an order line asking for 0 units would be a lie). */
export function buildOrderHandoff(
  storeId: string,
  storeName: string,
  at: Date,
  rows: RestockRow[],
): OrderHandoffPayload {
  const items: OrderHandoffItem[] = rows
    .map((row) => ({ ...row, quantity: reorderGap(row) }))
    .filter((row) => row.quantity > 0)
    .map((row) => ({
      sku: row.sku,
      name: row.name,
      quantity: row.quantity,
      onHand: row.onHand,
      reorderLevel: row.reorderLevel,
    }));
  return {
    storeId,
    storeName,
    carriedAt: at.toISOString(),
    lines: items.length,
    units: orderHandoffUnits(items),
    items,
  };
}

/** The order's total ask — the strip speaks it so the actor sees the
 *  weight of what was carried before committing. */
export function orderHandoffUnits(items: OrderHandoffItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function isHandoffItem(value: unknown): value is OrderHandoffItem {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.sku === 'string' && v.sku.length > 0 &&
    typeof v.name === 'string' &&
    typeof v.quantity === 'number' && Number.isFinite(v.quantity) &&
    typeof v.onHand === 'number' && Number.isFinite(v.onHand) &&
    typeof v.reorderLevel === 'number' && Number.isFinite(v.reorderLevel)
  );
}

/** The shape law, pure: parse the envelope against the reading desk's
 *  own branch. Any doubt refuses the whole envelope (null) — a
 *  half-carried order would be a lie with rows missing. */
export function parseOrderHandoff(
  raw: string | null,
  storeId: string,
): OrderHandoffPayload | null {
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const v = parsed as Record<string, unknown>;
  if (v.storeId !== storeId) return null;
  if (typeof v.storeName !== 'string') return null;
  if (typeof v.carriedAt !== 'string') return null;
  if (!Array.isArray(v.items) || !v.items.every(isHandoffItem)) return null;
  const items = v.items.filter((item) => item.quantity > 0);
  if (items.length === 0) return null;
  return {
    storeId,
    storeName: v.storeName,
    carriedAt: v.carriedAt,
    lines: items.length,
    units: orderHandoffUnits(items),
    items,
  };
}

/** The PO desk's map: carried lines become editable rows. A line whose
 *  sku the shelf no longer knows is dropped and counted — the desk
 *  speaks the drop, never a silently shortened order. Pure. */
export function mapOrderHandoffToPoItems(
  payload: OrderHandoffPayload,
  products: ReadonlyArray<{ id: string; sku: string; costPrice: number | null; quantityInStock: number }>,
): { items: OrderHandoffPoItem[]; droppedSkus: string[] } {
  const bySku = new Map(products.map((p) => [p.sku, p]));
  const items: OrderHandoffPoItem[] = [];
  const droppedSkus: string[] = [];
  for (const item of payload.items) {
    const product = bySku.get(item.sku);
    if (!product) {
      droppedSkus.push(item.sku);
      continue;
    }
    items.push({
      productId: product.id,
      name: item.name,
      sku: item.sku,
      quantity: String(item.quantity),
      // v2.250.0's law rides along: a cost-blind pen starts EMPTY (the
      // actor's own typed truth), never the string "null" or a fake 0.
      unitCost: product.costPrice != null ? String(product.costPrice) : '',
      currentStock: product.quantityInStock,
    });
  }
  return { items, droppedSkus };
}

/** The pocket's writers and readers — the only places sessionStorage is
 *  touched, so the pure laws above stay testable without a window. */
export function writeOrderHandoff(payload: OrderHandoffPayload): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(ORDER_HANDOFF_KEY, JSON.stringify(payload));
  } catch {
    // A full/private-mode pocket refuses to carry — the banner's toast
    // speaks its side; the order is never silently lost on read.
  }
}

/** Read + clear (THE ONE-WAY LAW). The reading desk's own branch is the
 *  address the envelope must carry; wrong-branch and unreadable mail is
 *  consumed too (cleared, refused) — a stale pocket never sits in the
 *  way of the next fold. */
export function consumeOrderHandoff(storeId: string): OrderHandoffPayload | null {
  if (typeof window === 'undefined') return null;
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(ORDER_HANDOFF_KEY);
  } catch {
    return null;
  }
  const payload = parseOrderHandoff(raw, storeId);
  try {
    window.sessionStorage.removeItem(ORDER_HANDOFF_KEY);
  } catch {
    // The read already answered; a sticky clear cannot resurrect a lie.
  }
  return payload;
}
