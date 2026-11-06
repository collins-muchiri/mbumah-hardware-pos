// src/lib/po-receive.ts — THE RECEIVE'S FILL (v2.417.0)
//
// The Receive Items dialog used to be a bare wall of pens: the actor
// typed every number by hand, and a short delivery (the supplier sent
// less than the order asked for) looked exactly like a typo — nothing
// on the face spoke the shortfall. This module is the receive's one
// home: the pens' initial fill, each row's honest state, and the plan
// the dialog speaks before the actor commits.
//
// The laws the fill keeps:
// - THE REMAINING LAW: a pen opens at the line's remaining units
//   (ordered minus already received) — the receive's own ask; a line
//   already fully received opens at '0' and stays closed.
// - THE PEN'S GRACE: a pen that does not parse (an empty string, a
//   half-typed word) reads as 0 — never NaN, never a crash.
// - THE SHORT FACE: a line receiving more than 0 but less than its
//   remaining is a SHORT receive — the supplier's honesty problem
//   made visible (amber, counted), never silently rounded to a full
//   receipt.
// - THE PLAN'S TRUTH: the plan counts OPEN lines only (a line with
//   nothing remaining is done, not untouched) — the strip can never
//   call a finished order partial.
//
// PURE module — imported by client components, so it must stay free
// of any server-only imports (same constraint as src/lib/whats-new.ts).

/** The minimal line shape the receive dialog reads off the wire
 *  (PurchaseOrderItemDetail's receive-relevant face). */
export interface ReceivePlanLine {
  id: string;
  quantity: number;
  receivedQty: number;
}

/** One row's honest receive state — the dialog's row classes and its
 *  shortfall words both read from here, so a row can never paint one
 *  state and speak another. */
export interface ReceiveRowState {
  /** ordered − received (floored at 0 by the wire's own arithmetic). */
  remaining: number;
  /** The pen's current value, parsed with the pen's grace (bad → 0). */
  qty: number;
  /** The actor typed more than the remaining — refused at submit. */
  isOver: boolean;
  /** 0 < qty < remaining — the short-receive face. */
  isShort: boolean;
  /** remaining − qty when short, else 0 — the units the line is short by. */
  shortfall: number;
  /** The line has nothing left to receive (the pen is closed). */
  isClosed: boolean;
  /** Live completion preview for the row's meter: (received + receiving)
   *  against ordered, 0–100. */
  pct: number;
}

/** The receive plan the dialog's strip speaks — counts over OPEN lines
 *  (remaining > 0) only; closed lines are the order's past, not its plan. */
export interface ReceivePlan {
  /** Open lines carrying a full remaining fill this pass. */
  fullLines: number;
  /** Open lines carrying a short fill this pass. */
  shortLines: number;
  /** Open lines left untouched this pass. */
  untouchedLines: number;
  /** Open lines the dialog knows about (full + short + untouched). */
  openLines: number;
  /** Total units the submit would send (whole numbers and halves alike —
   *  the pen's own truth). */
  units: number;
  /** Units the short lines fall short by, summed. */
  shortUnits: number;
  /** Nothing is set to receive (the submit stays disabled). */
  empty: boolean;
  /** At least one open line is not fully covered this pass. */
  partial: boolean;
}

/** THE PEN'S GRACE — a pen's value parses or reads as 0 (never NaN). */
export function parseReceiveQty(raw: string | undefined): number {
  if (!raw) return 0;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

/** THE REMAINING LAW — a line's open units, floored at 0 (a wire that
 *  over-received by accident can never ask for a negative fill). */
export function receiveRemaining(line: { quantity: number; receivedQty: number }): number {
  return Math.max(0, line.quantity - line.receivedQty);
}

/** The pens' initial fill — every open line opens at its remaining
 *  units, every closed line at '0'. One home: the dialog's mount
 *  effect and any future re-fill read the same truth. */
export function buildReceiveInitials(lines: ReceivePlanLine[]): Record<string, string> {
  const initials: Record<string, string> = {};
  for (const line of lines) {
    const remaining = receiveRemaining(line);
    initials[line.id] = remaining > 0 ? String(remaining) : '0';
  }
  return initials;
}

/** One row's honest state — the single read both the row's paint and
 *  its words use. */
export function receiveRowState(
  line: ReceivePlanLine,
  rawQty: string | undefined
): ReceiveRowState {
  const remaining = receiveRemaining(line);
  const qty = parseReceiveQty(rawQty);
  const isClosed = remaining <= 0;
  const isOver = !isClosed && qty > remaining;
  const isShort = !isClosed && qty > 0 && qty < remaining;
  const shortfall = isShort ? remaining - qty : 0;
  const pct =
    line.quantity > 0
      ? Math.min(100, Math.max(0, Math.round(((line.receivedQty + qty) / line.quantity) * 100)))
      : 0;
  return { remaining, qty, isOver, isShort, shortfall, isClosed, pct };
}

/** The plan's truth — counts over OPEN lines only, so a finished order
 *  can never speak as partial and a fresh dialog always speaks empty. */
export function describeReceivePlan(
  lines: ReceivePlanLine[],
  qtys: Record<string, string>
): ReceivePlan {
  let fullLines = 0;
  let shortLines = 0;
  let untouchedLines = 0;
  let units = 0;
  let shortUnits = 0;
  let openLines = 0;
  for (const line of lines) {
    const remaining = receiveRemaining(line);
    if (remaining <= 0) continue;
    openLines++;
    const qty = parseReceiveQty(qtys[line.id]);
    units += qty;
    if (qty >= remaining) {
      fullLines++;
    } else if (qty > 0) {
      shortLines++;
      shortUnits += remaining - qty;
    } else {
      untouchedLines++;
    }
  }
  return {
    fullLines,
    shortLines,
    untouchedLines,
    openLines,
    units,
    shortUnits,
    empty: fullLines + shortLines === 0,
    partial: shortLines + untouchedLines > 0,
  };
}
