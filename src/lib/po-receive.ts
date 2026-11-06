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
 *  over-received by accident can never ask for a negative fill; a Decimal
 *  that arrives as a STRING — Prisma's JSON face — coerces first, so a
 *  minus can never str-diff and a concat can never be born). */
export function receiveRemaining(line: { quantity: number; receivedQty: number }): number {
  return Math.max(0, Number(line.quantity) - Number(line.receivedQty));
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
  // THE WIRE'S GRACE (v2.419.0): a Decimal arriving as a string must
  // never meet a `+` (a concat makes the pct clamp to a lying 100 on a
  // short line) — the line's own fields coerce before any arithmetic,
  // the same grace the pen gets.
  const ordered = Number(line.quantity);
  const received = Number(line.receivedQty);
  const remaining = Math.max(0, ordered - received);
  const qty = parseReceiveQty(rawQty);
  const isClosed = remaining <= 0;
  const isOver = !isClosed && qty > remaining;
  const isShort = !isClosed && qty > 0 && qty < remaining;
  const shortfall = isShort ? remaining - qty : 0;
  const pct =
    ordered > 0
      ? Math.min(100, Math.max(0, Math.round(((received + qty) / ordered) * 100)))
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

// ============================================================================
// v2.419.0 THE DRILL'S PROGRESS — the drill wears the receive's truth
// ============================================================================
// The drill's line rows used to speak a bare word ("Partial") over a
// bare bar — the shortfall the receive dialog counts lived unspoken one
// surface away. The drill now reads the SAME one home: its committed
// truth IS the receive at rest (every pen empty), so the drill and the
// dialog can never disagree about what "partial" means — THE DRILL'S
// MIRROR LAW. Pure; the caller owns the surface.
// --------------------------------------------------------------------------

/** One drill row's honest state — the paint (the row's family), the
 *  words (the Status cell) and the meter (the committed pct) all read
 *  from this one answer. */
export interface DrillLineState {
  /** full — nothing remaining; short — received some, owes the rest;
   *  open — nothing received yet. */
  tone: 'full' | 'short' | 'open';
  /** The words the Status cell speaks. */
  words: string;
  /** Units the line still owes (short lines only, else 0). */
  shortfall: number;
  /** The committed completion — 0–100. */
  pct: number;
  /** The row's own family (the dialog's faces, at rest — emerald for
   *  full, amber for short, transparent for open). */
  rowClass: string;
}

/** One drill row's honest state — the committed truth read through the
 *  receive's own rule (receiveRowState with the pen at rest), never a
 *  second copy of the arithmetic. */
export function drillLineState(item: ReceivePlanLine): DrillLineState {
  const s = receiveRowState(item, '0');
  if (s.isClosed) {
    return {
      tone: 'full',
      words: 'fully received',
      shortfall: 0,
      pct: s.pct,
      rowClass:
        'border-l-2 border-l-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20',
    };
  }
  if (item.receivedQty > 0) {
    return {
      tone: 'short',
      words: `short by ${s.remaining} ${s.remaining === 1 ? 'unit' : 'units'}`,
      shortfall: s.remaining,
      pct: s.pct,
      rowClass:
        'border-l-2 border-l-amber-500 bg-amber-50/40 dark:bg-amber-950/20',
    };
  }
  return {
    tone: 'open',
    words: 'nothing received yet',
    shortfall: 0,
    pct: 0,
    rowClass: 'border-l-2 border-l-transparent',
  };
}

/** The order's committed progress — the drill's Receiving Progress card
 *  speaks the plan's truth over the committed facts (units and lines,
 *  the shortfall summed, the whole-order completion honest: `complete`
 *  only when every line is closed). */
export interface DrillProgress {
  receivedUnits: number;
  orderedUnits: number;
  pct: number;
  fullLines: number;
  shortLines: number;
  openLines: number;
  shortUnits: number;
  complete: boolean;
}

export function describeDrillProgress(items: ReceivePlanLine[]): DrillProgress {
  let receivedUnits = 0;
  let orderedUnits = 0;
  let fullLines = 0;
  let shortLines = 0;
  let openLines = 0;
  let shortUnits = 0;
  for (const item of items) {
    // the wire's grace rides the sums too (a string arrival can never
    // concat its way into the card's totals)
    receivedUnits += Number(item.receivedQty);
    orderedUnits += Number(item.quantity);
    const s = receiveRowState(item, '0');
    if (s.isClosed) {
      fullLines++;
      continue;
    }
    openLines++;
    if (item.receivedQty > 0) {
      shortLines++;
      shortUnits += s.remaining;
    }
  }
  return {
    receivedUnits,
    orderedUnits,
    pct:
      orderedUnits > 0
        ? Math.min(100, Math.round((receivedUnits / orderedUnits) * 100))
        : 0,
    fullLines,
    shortLines,
    openLines,
    shortUnits,
    complete: items.length > 0 && openLines === 0,
  };
}

// ============================================================================
// v2.426.0 THE RECEIVE'S MAKER — the receipt names the maker that filled it
// ============================================================================
// The receive dialog used to be maker-blind: the actor received goods
// without the face ever saying WHO filled the order — the maker's name
// lived one surface away (the detail's description) and the phone lived
// in another desk entirely. The receipt now wears its maker: the day's
// honest read lives HERE (one home with the fill's arithmetic), the
// header chip and the call door render it, and the success toast
// speaks it. Pure; the caller owns the surface.
// --------------------------------------------------------------------------

/** The day's maker, honestly read — the shape the chip, the call door
 *  and the toast all share. */
export interface ReceiveMaker {
  /** The supplier's trimmed name (the chip's "via" word). */
  name: string;
  /** The day's phone when the wire carries a real one, else null —
   *  the call door stays silent, never a dead dial. */
  phone: string | null;
  /** The named contact when the wire carries one, else null — the
   *  door's title speaks the day's person. */
  contactPerson: string | null;
}

/** THE RECEIVE'S MAKER — the supplier's own honest read: a trimmed,
 *  non-empty name makes the maker (a whitespace name is no name); the
 *  phone and the contact ride only when they are real strings too.
 *  The honest absence is the null — a stale wire row (or an order
 *  whose maker the wire lost) renders the silent face, never a fake
 *  via, never a dead dial. The grace coerces every read (a non-string
 *  arrival is the absence, never a crash). */
export function receiveMaker(
  supplier?: { name?: string | null; phone?: string | null; contactPerson?: string | null } | null
): ReceiveMaker | null {
  const name = typeof supplier?.name === 'string' ? supplier.name.trim() : '';
  if (!name) return null;
  const phone =
    typeof supplier?.phone === 'string' && supplier.phone.trim()
      ? supplier.phone.trim()
      : null;
  const contactPerson =
    typeof supplier?.contactPerson === 'string' && supplier.contactPerson.trim()
      ? supplier.contactPerson.trim()
      : null;
  return { name, phone, contactPerson };
}

/** The receive success toast's two faces — the day's maker named when
 *  the read found one, the round's old byte when it did not (the
 *  honest silence). One home: the dialog reads THIS, never a second
 *  copy of the words. */
export function receiveSuccessVoice(maker: ReceiveMaker | null): string {
  return maker
    ? `Items received and stock updated — ${maker.name}'s goods are on the shelf`
    : 'Items received and stock updated';
}

// ============================================================================
// v2.427.0 THE SHORTFALL'S OWN DOOR — the drill wears the follow-up
// ============================================================================
// The drill's Receiving Progress card counts the shortfall ("1 short by
// 18 units") but never said WHAT TO DO about it — the maker's number
// lived in the receive dialog one surface earlier and vanished the
// moment the dialog closed. When the order OWES, the card now wears the
// follow-up door: the same call door the receipt speaks, one surface
// later — the shortfall's number exactly where the shortfall shows.
// Pure; the caller owns the surface.
// --------------------------------------------------------------------------

/** The drill's follow-up door — the shape the card's pill wears. */
export interface DrillFollowUp {
  /** The maker's own phone (the tel: href — real by the read's law). */
  phone: string;
  /** The hover/assist words (the day's contact named when the wire
   *  carries one, the maker's silence honest when it does not). */
  title: string;
  /** The pill's own words — who to follow up with, what is owed. */
  words: string;
}

/** THE SHORTFALL'S OWN DOOR — the drill's honest follow-up: the door
 *  exists only when the order OWES (short lines counted — a whole
 *  order's open lines are the plan, not a debt) AND the maker carries a
 *  real phone. The honest absences: no maker, a whitespace phone, or
 *  nothing short all read the null — never a fake door, never a dead
 *  dial, never a door on an order that owes nothing. */
export function drillFollowUpDoor(
  maker: ReceiveMaker | null,
  progress: DrillProgress
): DrillFollowUp | null {
  if (!maker || !maker.phone) return null;
  // THE DIAL'S GRACE — a whitespace phone is no dial, even when the
  // caller skipped receiveMaker's own trim (the honest law, defended
  // here too).
  const phone = maker.phone.trim();
  if (!phone) return null;
  if (progress.shortLines <= 0) return null;
  const units = progress.shortUnits;
  const { name, contactPerson } = maker;
  return {
    phone,
    title: contactPerson
      ? `Call ${contactPerson} — ${phone} — the shortfall's follow-up`
      : `Call the maker — ${phone} — the shortfall's follow-up`,
    words: `Follow up with ${name} — ${units} unit${units === 1 ? '' : 's'} short`,
  };
}

// ============================================================================
// v2.428.0 THE TOAST POINTS AT THE FOLLOW-UP — the shortfall survives the close
// ============================================================================
// The success toast used to end the story: a short submit landed, the
// dialog closed, and the words never said the order still OWES — the
// follow-up door (the drill's own pill) waited one surface away,
// unannounced. When the submit is short, the toast now speaks the
// pointer: the units still owed and WHERE the follow-up waits — the
// order's face, the drill's own door. The plan rides the submit (the
// pens' truth at the press), so the pointer speaks what WAS submitted,
// never a later render's guess. A full receipt points nowhere (the
// honest silence). Pure; the caller owns the surface.
// --------------------------------------------------------------------------

/** THE SHORTFALL'S POINTER — the toast's second line when the submit
 *  was short: the units still owed and where the follow-up waits. The
 *  honest gate: zero units (or a number that is not one — a NaN, an
 *  infinity, a negative) reads the null — a full receipt points
 *  nowhere, never a fake pointer, never a run-on of nothing. */
export function receiveShortfallPointer(shortUnits: number): string | null {
  if (!Number.isFinite(shortUnits) || shortUnits <= 0) return null;
  return `${shortUnits} unit${shortUnits === 1 ? '' : 's'} still owed — the follow-up waits on the order's face`;
}
