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
