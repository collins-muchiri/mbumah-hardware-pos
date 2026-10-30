/**
 * The compliance calendar (v2.274.0 "the calendar keeps the clock").
 *
 * The statutory desk already speaks the money (the liability totals and the
 * monthly figures speak what was charged); the calendar speaks the CLOCK —
 * when each monthly obligation must be filed. The clock is the statute's
 * own, not data: Kenya's monthly payroll obligations all fall due on the
 * 9th of the following month, so the calendar is DERIVED from a point in
 * time, never guessed from state. Whether a past window was actually filed
 * is the ledger's business — this surface refuses to claim it.
 *
 * Laws carried over:
 * - The census's UTC-midnight floor law: day differences are computed on
 *   UTC midnights (floor(ms / DAY_MS)), so a 25-hour gap is 1 day, never 2.
 * - The document's-answer law: each obligation says only what the calendar
 *   carries — the due date, the window state, and whether the due date
 *   lands on a weekend (the statute does not wait for the weekend). It
 *   never invents receipts, extensions, or holiday shifts (no holiday
 *   table exists on the wire; inventing one would be a guess).
 * - The point-in-time law: the whole payload is one `asOf` moment — the
 *   same shape the census reports.
 */

export interface ComplianceObligation {
  /** Stable machine kind — the testids and any future ledger join key on it. */
  kind: 'PAYE' | 'NSSF' | 'SHIF' | 'AHL';
  /** The desk's own name for the obligation. */
  label: string;
  /** The legal instrument the deadline comes from — the calendar cites, never asserts. */
  instrument: string;
  /** The statutory day of month the obligation falls due (the 9th family). */
  dueDay: number;
  /** Which payroll month the NEXT deadline covers, e.g. "October 2026". */
  periodLabel: string;
  /** The deadline's ISO date, e.g. "2026-11-09". */
  dueDate: string;
  /** The deadline spoken plainly, e.g. "9 November 2026". */
  dueLabel: string;
  /** Calendar days (UTC midnights) from asOf to the deadline. */
  daysRemaining: number;
  /**
   * Window state: the filing window is the 1st–9th of the deadline month.
   * NOT_YET_OPEN = the window has not begun (asOf is past the previous
   * 9th); OPEN = inside the window with >= 5 days left; DUE_SOON = 2–4
   * days left; DUE_TOMORROW = 1; DUE_TODAY = 0.
   */
  status: 'NOT_YET_OPEN' | 'OPEN' | 'DUE_SOON' | 'DUE_TOMORROW' | 'DUE_TODAY';
  /** The chip's own words — the status spelled out, never a bare code. */
  statusWord: string;
  /**
   * Share of the filing window consumed (round(nowDay / 9 * 100), 0–100),
   * or null when the window has not opened — a rail for a window that
   * does not exist would be a guess.
   */
  windowElapsedPct: number | null;
  /** "day N of 9" while the window is open, else the window-opens words, else null. */
  windowWord: string | null;
  /** Non-null only when the deadline lands on a Saturday or a Sunday. */
  weekendNote: string | null;
}

export interface ComplianceCalendar {
  /** The moment the clock was read (ISO) — the whole payload speaks this instant. */
  asOf: string;
  /** One row per monthly obligation, in a stable order (the desk's order). */
  obligations: ComplianceObligation[];
}

const DAY_MS = 86_400_000;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/** The UTC midnight that contains the instant — the census's day key. */
function utcDayKey(at: Date): number {
  return Math.floor(at.getTime() / DAY_MS);
}

/**
 * The month containing `at`, spoken plain. Reads UTC fields — the same
 * clock the day-key law uses; mixing a local calendar into a UTC
 * difference would let the two faces disagree.
 */
function monthLabel(year: number, monthIndex: number): string {
  return `${MONTHS[monthIndex]} ${year}`;
}

/**
 * The 9th-of-month family: each monthly obligation falls due on the 9th
 * of the month AFTER the payroll month it covers. Given `now`:
 * - on or before the 9th → the window for the previous payroll month is
 *   open (or due today) and closes on this month's 9th;
 * - after the 9th → that window has passed and the clock rolls to this
 *   payroll month's obligation, due next month's 9th.
 * All four obligations share the statute's day but remain separate legal
 * duties — each row keeps its own instrument reference.
 */
export function complianceCalendar(now: Date): ComplianceCalendar {
  const asOfIso = now.toISOString();
  const nowDayKey = utcDayKey(now);
  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth(); // 0-based
  const nowDay = now.getUTCDate(); // 1-based

  const obligations: ComplianceObligation[] = [];

  for (const spec of OBLIGATION_SPECS) {
    // The window is open (or due today) only on or before the statutory day.
    const windowOpen = nowDay <= spec.dueDay;

    // The deadline month/year this clock pass points at.
    const dueYear = windowOpen ? nowYear : nowMonth === 11 ? nowYear + 1 : nowYear;
    const dueMonthIndex = windowOpen ? nowMonth : nowMonth === 11 ? 0 : nowMonth + 1;
    // The payroll month the deadline covers: the month before the deadline's.
    const periodYear = dueMonthIndex === 0 ? dueYear - 1 : dueYear;
    const periodMonthIndex = dueMonthIndex === 0 ? 11 : dueMonthIndex - 1;

    const dueUtcMs = Date.UTC(dueYear, dueMonthIndex, spec.dueDay);
    const daysRemaining = Math.floor(dueUtcMs / DAY_MS) - nowDayKey;

    let status: ComplianceObligation['status'];
    let statusWord: string;
    let windowElapsedPct: number | null = null;
    let windowWord: string | null = null;

    if (!windowOpen) {
      status = 'NOT_YET_OPEN';
      statusWord = `window opens 1 ${MONTHS[dueMonthIndex]}`;
      windowWord = `window opens 1 ${MONTHS[dueMonthIndex]} ${dueYear}`;
    } else if (daysRemaining === 0) {
      status = 'DUE_TODAY';
      statusWord = 'due today';
      windowElapsedPct = 100;
      windowWord = `day ${spec.dueDay} of ${spec.dueDay} — the window closes tonight`;
    } else if (daysRemaining === 1) {
      status = 'DUE_TOMORROW';
      statusWord = 'due tomorrow';
      windowElapsedPct = Math.round((nowDay / spec.dueDay) * 100);
      windowWord = `day ${nowDay} of ${spec.dueDay}`;
    } else if (daysRemaining <= 4) {
      status = 'DUE_SOON';
      statusWord = `due in ${daysRemaining} days`;
      windowElapsedPct = Math.round((nowDay / spec.dueDay) * 100);
      windowWord = `day ${nowDay} of ${spec.dueDay}`;
    } else {
      status = 'OPEN';
      statusWord = `due in ${daysRemaining} days`;
      windowElapsedPct = Math.round((nowDay / spec.dueDay) * 100);
      windowWord = `day ${nowDay} of ${spec.dueDay}`;
    }

    const weekday = new Date(dueUtcMs).getUTCDay();
    let weekendNote: string | null = null;
    if (weekday === 0 || weekday === 6) {
      const day = WEEKDAYS[weekday];
      weekendNote = `${spec.dueDay} ${MONTHS[dueMonthIndex]} falls on a ${day} — the statute does not wait; settle before the weekend.`;
    }

    obligations.push({
      kind: spec.kind,
      label: spec.label,
      instrument: spec.instrument,
      dueDay: spec.dueDay,
      periodLabel: monthLabel(periodYear, periodMonthIndex),
      dueDate: new Date(dueUtcMs).toISOString().slice(0, 10),
      dueLabel: `${spec.dueDay} ${MONTHS[dueMonthIndex]} ${dueYear}`,
      daysRemaining,
      status,
      statusWord,
      windowElapsedPct,
      windowWord,
      weekendNote,
    });
  }

  return { asOf: asOfIso, obligations };
}

/**
 * The four monthly payroll obligations the statutory desk already speaks.
 * The day is the statute's own (the 9th-of-the-following-month family);
 * the instruments are cited as the rate tables cite them — the calendar
 * carries the reference, the counsel flag stays with the rate tables.
 */
const OBLIGATION_SPECS: ReadonlyArray<{
  kind: ComplianceObligation['kind'];
  label: string;
  instrument: string;
  dueDay: number;
}> = [
  { kind: 'PAYE', label: 'PAYE', instrument: 'Income Tax Act — employment income (PAYE) monthly return', dueDay: 9 },
  { kind: 'NSSF', label: 'NSSF', instrument: 'NSSF Act 2013 — monthly contributions', dueDay: 9 },
  { kind: 'SHIF', label: 'SHIF', instrument: 'Social Health Insurance Act 2023 — monthly contributions', dueDay: 9 },
  { kind: 'AHL', label: 'Housing levy', instrument: 'Affordable Housing Act 2024 — monthly levy', dueDay: 9 },
];

/**
 * A payroll month's statutory deadline (v2.275.0 "the expert hears the
 * census"). The calendar above speaks the clock for the NEXT window at a
 * point in time; this helper speaks the clock for ANY payroll month — the
 * same 9th-of-the-following-month statute, derived purely from the month
 * key the statutory desk's monthly rows already carry ("YYYY-MM", the
 * `monthKey` shape of reports.ts). The ledger's rows gain the deadline
 * without a wire change: the desk already holds the month, the statute
 * already holds the day.
 *
 * The document's-answer law rides along: the helper says when the window
 * CLOSED (its due date, and whether the 9th lands on a weekend — the
 * statute does not wait). It never claims a filing — whether a past window
 * was actually filed is the ledger's business, and the columns that speak
 * this helper are named "Due", never "Filed".
 */
export interface StatutoryDue {
  /** The payroll month the deadline covers, exactly as asked, e.g. "2026-10". */
  month: string;
  /** The deadline's ISO date, e.g. "2026-11-09". */
  dueDate: string;
  /** The deadline spoken plainly, e.g. "9 November 2026". */
  dueLabel: string;
  /** Non-null only when the 9th lands on a Saturday or a Sunday. */
  weekendNote: string | null;
}

/**
 * The deadline for one payroll month, pure and total: anything that is not
 * a well-formed "YYYY-MM" month key returns null (an honest absence, never
 * a guessed date). December rolls the year (2026-12 → 9 January 2027).
 * The arithmetic is the calendar's own: Date.UTC on the NEXT month index,
 * the same construction complianceCalendar uses, so a card and a row can
 * never disagree about a deadline.
 */
export function statutoryDueForPeriod(month: string): StatutoryDue | null {
  const m = /^(\d{4})-(\d{2})$/.exec(month ?? '');
  if (!m) return null;
  const year = Number(m[1]);
  const month1 = Number(m[2]); // 1-based payroll month
  if (!Number.isFinite(year) || month1 < 1 || month1 > 12) return null;

  // month1 as a 0-BASED index is exactly the following month; December's 12
  // rolls into the next January by Date.UTC's own carry.
  const dueMs = Date.UTC(year, month1, 9);
  const due = new Date(dueMs);
  const dueYear = due.getUTCFullYear();
  const dueMonthIndex = due.getUTCMonth();

  const weekday = due.getUTCDay();
  let weekendNote: string | null = null;
  if (weekday === 0 || weekday === 6) {
    const day = WEEKDAYS[weekday];
    weekendNote = `9 ${MONTHS[dueMonthIndex]} falls on a ${day} — the statute does not wait; settle before the weekend.`;
  }

  return {
    month,
    dueDate: due.toISOString().slice(0, 10),
    dueLabel: `9 ${MONTHS[dueMonthIndex]} ${dueYear}`,
    weekendNote,
  };
}

/**
 * The payroll month a deadline covers (v2.276.0 "the ledger takes the
 * receipt"): the deadline "2026-11-09" covers the payroll month "2026-10"
 * — the 9th-of-the-following-month statute read backwards. This is the
 * filing ledger's ONE join key: the card's receipt chips, the monthly
 * figures' filed dots, and the receipt dialog's submit all derive the
 * month through THIS function, so a chip and a dot can never disagree
 * about which month a receipt covers. It lives on the PURE calendar lib
 * (no server imports — the client page reads it directly; a wrong-module
 * import would pull the ledger's Prisma graph into the browser bundle and
 * panic the build). Malformed dates → null (honest absence, never a
 * guessed month).
 */
export function periodMonthForDueDate(dueDate: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate ?? '')) return null;
  const due = new Date(`${dueDate}T00:00:00Z`);
  if (Number.isNaN(due.getTime())) return null;
  const year = due.getUTCFullYear();
  const month0 = due.getUTCMonth(); // 0-based deadline month
  // one month back, with the January → December year roll
  const periodYear = month0 === 0 ? year - 1 : year;
  const periodMonth0 = month0 === 0 ? 11 : month0 - 1;
  return `${periodYear}-${String(periodMonth0 + 1).padStart(2, '0')}`;
}

/**
 * The instant a datetime-local input speaks (v2.277.0 "the chip takes its
 * correction"): the local-offset-subtracted, minute-precision "YYYY-MM-DD
 * THH:mm" value the receipt dialog's Filed-on field binds. ONE home for the
 * math both dialog modes speak — the record mode's "now" default and the
 * amend mode's prefill of the receipt's own filedAt — so a prefill can
 * never disagree with a default about what an instant looks like in a
 * field. It lives on the PURE calendar lib (the client-bundle law: the
 * page may only value-import from pure modules; the ledger lib imports
 * Prisma and would panic the build). Non-finite instants → '' (the
 * field's own honest empty — never a guessed "1970-01-01").
 */
export function toDatetimeLocalValue(instant: string | Date): string {
  const at = typeof instant === 'string' ? new Date(instant) : instant;
  if (!at || Number.isNaN(at.getTime())) return '';
  const local = new Date(at.getTime() - at.getTimezoneOffset() * 60_000);
  // slice(0,16) is minute precision — datetime-local speaks minutes, never seconds
  return local.toISOString().slice(0, 16);
}

/** The amendment slack: same-write timestamps (created === updated to the
 * millisecond, or jitter within one second) are the receipt's BIRTH, not a
 * correction — only a genuinely later update reads as amended. */
const AMEND_SLACK_MS = 1_000;

/**
 * Whether a ledger receipt was genuinely amended (v2.277.0): the row's
 * updatedAt rides meaningfully past its createdAt. The receipt's own
 * truth, read from the row — never guessed from who touched it or when
 * the page loaded. Missing timestamps → false (honest absence: a row
 * that cannot speak its own history is not claimed as corrected).
 */
export function filingWasAmended(row: { createdAt?: string | null; updatedAt?: string | null }): boolean {
  if (!row || typeof row.createdAt !== 'string' || typeof row.updatedAt !== 'string') return false;
  const created = new Date(row.createdAt).getTime();
  const updated = new Date(row.updatedAt).getTime();
  if (Number.isNaN(created) || Number.isNaN(updated)) return false;
  return updated - created > AMEND_SLACK_MS;
}

/**
 * The statute's four monthly obligations (v2.278.0 "the digest learns the
 * receipt") — the CLOCK's own list, in the calendar's own order. The digest's
 * "Filed" denominator is how many obligations the calendar DEMANDS of a
 * payroll month, so the number lives here (the clock's home), not on the
 * ledger (the ledger's STATUTORY_FILING_KINDS speaks what the ledger ACCEPTS;
 * the two agree today, each answering its own concern — and the pure calendar
 * may never import the ledger's Prisma graph, the client-bundle law).
 */
export const STATUTORY_OBLIGATION_KINDS = ['PAYE', 'NSSF', 'SHIF', 'AHL'] as const;

export type StatutoryObligationKind = (typeof STATUTORY_OBLIGATION_KINDS)[number];

/**
 * The day a payroll month's filing window opens (v2.278.0): the 1st of the
 * due month — the same month statutoryDueForPeriod already derives, so a
 * digest cell and a desk chip can never disagree about when filing becomes
 * POSSIBLE. Read back from the due date's own first (due month + "-01",
 * UTC midnight) — the ONE derivation, never a second 9th-minus-8 math.
 * Malformed month keys → null (honest absence, never a guessed window).
 */
export function filingWindowOpensForPeriod(month: string): string | null {
  const due = statutoryDueForPeriod(month);
  if (!due) return null;
  return `${due.dueDate.slice(0, 7)}-01`;
}

/**
 * The digest's receipt voice (v2.278.0 "the digest learns the receipt").
 * v2.275.0 named the digest's statutory column "Due by", never "Filed",
 * because the ledger did not exist; v2.276.0 built the ledger, and the
 * desk's Due cell learned to count receipts (v2.276.0/277.0) — but the
 * digest stayed silent. This voice completes the mirror: COUNTS only, the
 * aggregate the digest's aggregate-only law always allowed (names,
 * references and notes stay the ledger desk's own words — they never ride
 * a digest).
 *
 * The document's-answer grammar, in order:
 * - counts null (the ledger could not speak — pre-migration database,
 *   read failure) → '' : quiet, never a guessed composition;
 * - the window has not opened yet (now before the 1st of the due month,
 *   UTC-midnight floor law) → '' : the clock governs the first record,
 *   and a "0 of 4" cried over an unopened window would be neglect where
 *   none is possible;
 * - otherwise "N of 4 filed", with " · K amended" when the slack law's
 *   corrections ride the receipts. Both counts clamp at the door (a
 *   corrupt payload cannot inflate a composition — the RUNTIME-pin law);
 *   malformed months stay quiet.
 */
export function digestFilingVoice(
  month: string,
  counts: { filed: number; amended: number } | null,
  now: Date,
): string {
  if (!counts) return '';
  const opens = filingWindowOpensForPeriod(month);
  if (!opens) return '';
  const openDay = utcDayKey(new Date(`${opens}T00:00:00Z`));
  if (Number.isNaN(openDay) || utcDayKey(now) < openDay) return '';
  const total = STATUTORY_OBLIGATION_KINDS.length;
  const filed = Math.max(0, Math.min(total, Math.floor(Number(counts.filed) || 0)));
  const amended = Math.max(0, Math.min(filed, Math.floor(Number(counts.amended) || 0)));
  return `${filed} of ${total} filed${amended > 0 ? ` · ${amended} amended` : ''}`;
}
