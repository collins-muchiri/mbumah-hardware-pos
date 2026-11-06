/**
 * THE ORDER LIST (v2.414.0) — the inventory desk hands you the words.
 *
 * The low-stock banner has always COUNTED the shelves that need attention;
 * the manager then re-typed the list by hand into a WhatsApp chat to place
 * the supplier's order. This module is the desk's voice for that chat: one
 * pure formatter that turns the wire's product rows into a plain-text
 * restock order — ready to paste, no invented figures, no invented rows.
 *
 * PURE module (client-safe, same constraint as src/lib/env-doctor.ts):
 * no server-only imports, no Date.now(), no randomness — the caller hands
 * the date label, and every byte is derivable from the inputs. The support
 * copy family's honest-absence law holds: when NOTHING needs attention the
 * formatter answers null, never a polite empty shell.
 */

/** One row the order list speaks. Shaped from ProductListItem (the wire's
 *  own fields). v2.421.0 THE ARC'S SECOND WORD: the row may carry its
 *  supplier's NAME (the wire hydrates it since v2.420.0) — the order's
 *  blocks read it. Undefined/null = the caller's world doesn't know (an
 *  older caller) or the product has none (the honest absence) — the
 *  formatter never invents a fact the caller didn't hand it. */
export interface RestockRow {
  sku: string;
  name: string;
  onHand: number;
  reorderLevel: number;
  supplierName?: string | null;
}

/** The units the floor orders in — the wire's unitType, honestly passed
 *  through (PIECE renders bare, others ride the row's own unit word). */
export interface RestockOrderInput {
  /** The branch's name as the receipts print it (STORE_LIST's name). */
  storeName: string;
  /** The caller-formatted date label (e.g. "Fri, 6 Nov 2026") — the
   *  formatter stays pure by refusing to read the clock. */
  dateLabel: string;
  /** The desk's rows (any order — the formatter sorts deterministically). */
  rows: RestockRow[];
}

/** A row needs attention — and belongs on the order — only when the shelf
 *  sits at/below its reorder level AND there is something to actually
 *  order. THE NOTHING-TO-ORDER LAW: an out-of-stock row with reorder
 *  level 0 has no order to place (the shelf's own level says "don't
 *  stock it"), so it is NOT spoken — an order line asking for 0 units
 *  would be a lie with a checkbox. */
export function restockNeedsAttention(row: RestockRow): boolean {
  if (!(row.onHand <= row.reorderLevel)) return false;
  return reorderGap(row) > 0;
}

/** The units the supplier owes the shelf: the gap back to the reorder
 *  level, never negative. */
export function reorderGap(row: RestockRow): number {
  return Math.max(0, row.reorderLevel - row.onHand);
}

/** The formatter's own sort: out-of-stock shelves first (the truck's
 *  first stop), then the deepest gap, then the SKU's alphabetical word —
 *  deterministic, so the same rows always read the same order. */
function restockSort(a: RestockRow, b: RestockRow): number {
  const aOut = a.onHand <= 0 ? 0 : 1;
  const bOut = b.onHand <= 0 ? 0 : 1;
  if (aOut !== bOut) return aOut - bOut;
  const gapDiff = reorderGap(b) - reorderGap(a);
  if (gapDiff !== 0) return gapDiff;
  return a.sku.localeCompare(b.sku);
}

/** The rows the order list speaks, in the formatter's own order. */
export function restockRowsNeedingAttention(rows: RestockRow[]): RestockRow[] {
  return rows.filter(restockNeedsAttention).sort(restockSort);
}

/** One order line: `[OUT]` when the shelf is empty, `[LOW]` when it is
 *  merely under the level — the badges the banner already teaches. */
export function formatRestockLine(row: RestockRow): string {
  const badge = row.onHand <= 0 ? 'OUT' : 'LOW';
  return `[${badge}] ${row.name} (SKU ${row.sku}) — on hand ${row.onHand} / reorder ${row.reorderLevel} — order ${reorderGap(row)}`;
}

/** The whole order, or null when the shelf asks for nothing. The bytes:
 *
 *   MBUMAH HARDWARE — RESTOCK ORDER
 *   Branch: MBUMAH HARDWARE - Juja Main · Fri, 6 Nov 2026
 *   2 items need attention
 *
 *   [OUT] Nails 4" (SKU NAIL-4) — on hand 0 / reorder 10 — order 10
 *   [LOW] Cement 32.5N (SKU CEM-32) — on hand 4 / reorder 10 — order 6
 *
 * The count line speaks its grammar honestly (1 item needs attention /
 * N items need attention) — the ledger-citation family's plural law.
 *
 * v2.421.0 THE ARC'S SECOND WORD — the order rides with its supplier.
 * TWO faces, chosen by the INPUT's own shape (the formatter never
 * invents a fact the caller didn't hand it):
 *
 *  - THE FLAT FACE (byte-stable, the v2.414 lines): when NO row names a
 *    supplier, the caller's world simply doesn't carry suppliers — the
 *    order speaks the flat list exactly as it always has. An absence
 *    block invented for a world that never named a supplier would be a
 *    lie.
 *  - THE BLOCKS FACE: when the world names ANY supplier, the order
 *    groups into per-supplier blocks — one block per supplier, ready to
 *    paste into THAT supplier's chat:
 *
 *      Bamburi Cement Ltd:
 *      [OUT] ... — order 50
 *
 *      No supplier yet:
 *      [LOW] ... — order 60
 *
 *    Named blocks sort alphabetically (a stable, honest paste order);
 *    the honest-absence block (NO_SUPPLIER_ORDER_LABEL) always rides
 *    LAST when the world itself carries unassigned rows; the lines keep
 *    the selector's own sort inside each block (out first, deepest gap,
 *    sku word); a blank line separates blocks; the header and the count
 *    stay global. */
export function formatRestockOrder(input: RestockOrderInput): string | null {
  const rows = restockRowsNeedingAttention(input.rows);
  if (rows.length === 0) return null;
  const countLine =
    rows.length === 1 ? '1 item needs attention' : `${rows.length} items need attention`;
  const header = [
    'MBUMAH HARDWARE — RESTOCK ORDER',
    `Branch: ${input.storeName} · ${input.dateLabel}`,
    countLine,
  ].join('\n');
  const knowsSuppliers = rows.some(
    (r) => typeof r.supplierName === 'string' && r.supplierName.trim() !== '',
  );
  if (!knowsSuppliers) {
    return [header, '', ...rows.map(formatRestockLine)].join('\n');
  }
  const named = new Map<string, RestockRow[]>();
  const absence: RestockRow[] = [];
  for (const r of rows) {
    const name = r.supplierName?.trim();
    if (name) {
      const bucket = named.get(name);
      if (bucket) bucket.push(r);
      else named.set(name, [r]);
    } else {
      absence.push(r);
    }
  }
  const blockNames = [...named.keys()].sort((a, b) => a.localeCompare(b));
  const blocks: string[][] = blockNames.map((name) => {
    const bucket = named.get(name);
    return [`${name}:`, ...(bucket ?? []).map(formatRestockLine)];
  });
  if (absence.length > 0) {
    blocks.push([`${NO_SUPPLIER_ORDER_LABEL}:`, ...absence.map(formatRestockLine)]);
  }
  return [header, '', blocks.map((b) => b.join('\n')).join('\n\n')].join('\n');
}

/** The honest absence's own voice in the blocks face — the block header
 *  the unassigned rows ride under. Never a guessed supplier name. */
export const NO_SUPPLIER_ORDER_LABEL = 'No supplier yet';

/** The order's own supplier census: how many DISTINCT named suppliers the
 *  order actually rides with (the banner chip's voice; the absence never
 *  counts — a product with no supplier is not a supplier). */
export function restockSupplierCount(rows: RestockRow[]): number {
  const names = new Set<string>();
  for (const r of restockRowsNeedingAttention(rows)) {
    const name = r.supplierName?.trim();
    if (name) names.add(name);
  }
  return names.size;
}

/** THE FILE'S NAME (v2.415.0) — the download face's pure twin, the support
 *  file family's pattern (diagnosticsFileName): the branch's slug, the date
 *  and the minute ride in the name, zero-padded, so two branches' orders on
 *  the same day never argue about which file is which.
 *
 *   restockOrderFileName('juja-main', new Date(2026, 10, 6, 14, 7))
 *     → 'mbumah-restock-juja-main-20261106-1407.txt' */
export function restockOrderFileName(storeSlug: string, at: Date): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  const y = at.getFullYear();
  const m = pad(at.getMonth() + 1);
  const d = pad(at.getDate());
  const hh = pad(at.getHours());
  const mm = pad(at.getMinutes());
  return `mbumah-restock-${storeSlug}-${y}${m}${d}-${hh}${mm}.txt`;
}
