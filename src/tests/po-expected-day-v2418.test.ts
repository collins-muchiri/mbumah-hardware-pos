// THE EXPECTED DAY SUITE (v2.418.0) — the day the supplier names, spoken
// everywhere.
//
//   - suggestExpectedDay: the walk's honest default — 'yyyy-mm-dd' in the
//     date-input's own dialect, LOCAL parts, seven days out (the lead is
//     the walk's own law); month and year rollovers land whole.
//   - poDaysBetween: the calendar-day gap (UTC midnights — the wire's own
//     dates): twenty-five hours past midnight is ONE day after, never two.
//   - poExpectedDayVoice: ONE rule for every face that names a day — the
//     day ladder for open orders (past → late, the named day itself → due
//     today, the soon window, then far), the received split calling the
//     METRIC's own predicate (THE AGREEMENT LAW — a roster cell and an
//     on-time tile can never disagree about what "late" means), the
//     cancelled silence, and the honest absence ("no day named").
//   - poExpectedDayFamily: the metric families' text shades — rose late,
//     amber today, blue soon, green on-time — never a new palette.
//   - the faces: the dialog's quick fill + live hint and the roster cell's
//     voice all read the same helpers (source pins — the house rule).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import {
  suggestExpectedDay,
  poDaysBetween,
  poExpectedDayVoice,
  poExpectedDayFamily,
  poMetricPredicate,
  EXPECTED_DAY_LEAD_DAYS,
  EXPECTED_DAY_SOON_DAYS,
} from '@/lib/po-metrics';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const TAB = 'src/app/(shell)/tabs/purchase-orders-tab.tsx';
const tabSrc = read(TAB);
const metricsSrc = read('src/lib/po-metrics.ts');

const DAY_MS = 86_400_000;
/** A UTC noon anchor — the voice's day math is UTC midnights, so a noon
 *  clock keeps every assertion a full day from either edge. */
const noon = (utcDay: number) => new Date(Date.UTC(2026, 10, 6, 12) + utcDay * DAY_MS);
const expectedISO = (utcDay: number) => new Date(Date.UTC(2026, 10, 6) + utcDay * DAY_MS).toISOString();

describe('suggestExpectedDay (v2.418.0) — the walk\u2019s honest default', () => {
  it('names the day EXPECTED_DAY_LEAD_DAYS out, in the date-input\u2019s own dialect', () => {
    expect(EXPECTED_DAY_LEAD_DAYS).toBe(7);
    // local parts: built from a LOCAL noon, so the dialect string must
    // land on the same local calendar day either side of the lead
    const from = new Date(2026, 10, 6, 12, 0, 0);
    expect(suggestExpectedDay(from)).toBe('2026-11-13');
  });

  it('rolls over months and years whole (a local-DST-safe construction)', () => {
    expect(suggestExpectedDay(new Date(2026, 0, 31))).toBe('2026-02-07');
    expect(suggestExpectedDay(new Date(2026, 11, 29))).toBe('2027-01-05');
  });

  it('honours a custom lead (zero lands on the caller\u2019s own day)', () => {
    expect(suggestExpectedDay(new Date(2026, 10, 6), 0)).toBe('2026-11-06');
    expect(suggestExpectedDay(new Date(2026, 10, 6), 1)).toBe('2026-11-07');
  });

  it('pads the month and the day to two digits (the input\u2019s dialect)', () => {
    expect(suggestExpectedDay(new Date(2026, 2, 5), 3)).toBe('2026-03-08');
  });
});

describe('poDaysBetween (v2.418.0) — the calendar\u2019s own gap', () => {
  it('counts UTC midnights, not hours (25h past a midnight is ONE day after)', () => {
    const from = new Date(Date.UTC(2026, 10, 6, 0));
    const to = new Date(Date.UTC(2026, 10, 7, 1));
    expect(poDaysBetween(from, to)).toBe(1);
    // and a 26h span that crosses TWO midnights honestly counts two
    expect(poDaysBetween(new Date(Date.UTC(2026, 10, 6, 23)), new Date(Date.UTC(2026, 10, 8, 1)))).toBe(2);
  });

  it('counts backwards negative and same-day zero', () => {
    const a = new Date(Date.UTC(2026, 10, 6, 6));
    const b = new Date(Date.UTC(2026, 10, 4, 22));
    expect(poDaysBetween(a, b)).toBe(-2);
    expect(poDaysBetween(a, new Date(Date.UTC(2026, 10, 6, 20)))).toBe(0);
  });
});

describe('poExpectedDayVoice (v2.418.0) — the day ladder, one rule', () => {
  it('speaks the honest absence when no day was named (and when the day does not parse)', () => {
    expect(poExpectedDayVoice({ status: 'SENT', expectedDate: null }, noon(0)))
      .toEqual({ tone: 'none', text: 'no day named' });
    expect(poExpectedDayVoice({ status: 'SENT', expectedDate: '' }, noon(0)))
      .toEqual({ tone: 'none', text: 'no day named' });
    expect(poExpectedDayVoice({ status: 'SENT', expectedDate: 'not-a-day' }, noon(0)))
      .toEqual({ tone: 'none', text: 'no day named' });
  });

  it('keeps the cancelled silence (a dead order\u2019s day speaks nothing)', () => {
    expect(poExpectedDayVoice({ status: 'CANCELLED', expectedDate: expectedISO(-3) }, noon(0)))
      .toEqual({ tone: 'none', text: '' });
  });

  it('climbs the day ladder: past, the named day itself, the soon window, then far', () => {
    const now = noon(0);
    expect(poExpectedDayVoice({ status: 'SENT', expectedDate: expectedISO(-2) }, now))
      .toEqual({ tone: 'late', text: '2 days past the day named' });
    expect(poExpectedDayVoice({ status: 'SENT', expectedDate: expectedISO(-1) }, now))
      .toEqual({ tone: 'late', text: '1 day past the day named' });
    expect(poExpectedDayVoice({ status: 'SENT', expectedDate: expectedISO(0) }, now))
      .toEqual({ tone: 'today', text: 'due today' });
    expect(EXPECTED_DAY_SOON_DAYS).toBe(3);
    expect(poExpectedDayVoice({ status: 'SENT', expectedDate: expectedISO(1) }, now))
      .toEqual({ tone: 'soon', text: 'in 1 day' });
    expect(poExpectedDayVoice({ status: 'SENT', expectedDate: expectedISO(3) }, now))
      .toEqual({ tone: 'soon', text: 'in 3 days' });
    expect(poExpectedDayVoice({ status: 'SENT', expectedDate: expectedISO(4) }, now))
      .toEqual({ tone: 'far', text: 'in 4 days' });
    expect(poExpectedDayVoice({ status: 'DRAFT', expectedDate: expectedISO(30) }, now))
      .toEqual({ tone: 'far', text: 'in 30 days' });
  });

  it('THE AGREEMENT LAW — the received split IS the metric predicate\u2019s own answer', () => {
    // a matrix across the predicate's edges: created before / on / after
    // the named day — the voice's tone must match poMetricPredicate
    // byte-for-byte on BOTH rungs (late ⇔ lateArrival, onTime ⇔ onTime).
    for (const createdDay of [-1, 0, 1, 2]) {
      for (const expectedDay of [-1, 0, 1]) {
        const po = { status: 'RECEIVED', createdAt: noon(createdDay).toISOString(), expectedDate: expectedISO(expectedDay) };
        const voice = poExpectedDayVoice(po, noon(0));
        expect(voice.tone === 'lateArrival').toBe(poMetricPredicate('late', po));
        expect(voice.tone === 'onTime').toBe(poMetricPredicate('onTime', po));
      }
    }
  });

  it('speaks the arrival\u2019s days the predicate\u2019s own arithmetic counts', () => {
    expect(
      poExpectedDayVoice(
        { status: 'RECEIVED', createdAt: noon(3).toISOString(), expectedDate: expectedISO(0) },
        noon(0),
      ),
    ).toEqual({ tone: 'lateArrival', text: 'arrived 3 days past the day named' });
    expect(
      poExpectedDayVoice(
        { status: 'RECEIVED', createdAt: noon(0).toISOString(), expectedDate: expectedISO(2) },
        noon(0),
      ),
    ).toEqual({ tone: 'onTime', text: 'arrived on time' });
  });
});

describe('poExpectedDayFamily (v2.418.0) — the metric families\u2019 own shades', () => {
  it('wears rose late, amber today, blue soon, green on-time — never a new palette', () => {
    expect(poExpectedDayFamily('late')).toBe('text-rose-600 dark:text-rose-400');
    expect(poExpectedDayFamily('lateArrival')).toBe(poExpectedDayFamily('late'));
    expect(poExpectedDayFamily('today')).toBe('text-amber-600 dark:text-amber-400');
    expect(poExpectedDayFamily('soon')).toBe('text-blue-600 dark:text-blue-400');
    expect(poExpectedDayFamily('onTime')).toBe('text-green-600 dark:text-green-400');
  });

  it('keeps the honest absence muted (an absence is not an alarm)', () => {
    expect(poExpectedDayFamily('none')).toBe('text-muted-foreground');
    expect(poExpectedDayFamily('far')).toBe(poExpectedDayFamily('none'));
  });
});

describe('THE EXPECTED DAY\u2019S FACES (v2.418.0) — one home, source-pinned', () => {
  it('the lib speaks the one-home law (the voice calls the metric predicate)', () => {
    expect(metricsSrc).toContain('poMetricPredicate(\'late\', po)');
    expect(metricsSrc).toContain("export const EXPECTED_DAY_LEAD_DAYS = 7;");
    expect(metricsSrc).toContain('no day named');
  });

  it('the walk\u2019s suggestion lands in the dialog (the carried instant names the day)', () => {
    expect(tabSrc).toContain('setExpectedDate(suggestExpectedDay(new Date(orderBirth.carriedAt)))');
    expect(tabSrc).toContain('suggested — seven days from the walk; the pen stays yours.');
  });

  it('the dialog carries the quick fill and the live hint on the one home', () => {
    expect(tabSrc).toContain('data-testid="po-expected-suggest"');
    expect(tabSrc).toContain('data-testid="po-expected-input"');
    expect(tabSrc).toContain('data-testid="po-expected-hint"');
    expect(tabSrc).toContain('poExpectedDayVoice({ status: \'DRAFT\', expectedDate }, new Date())');
  });

  it('the roster cell wears the voice and retires the bare dash', () => {
    expect(tabSrc).toContain('data-testid="po-row-expected-voice"');
    expect(tabSrc).toContain('new Date(currentTime)');
    expect(tabSrc).toContain("<span className=\"italic text-muted-foreground/60\">no day named</span>");
    // the old bare dash is gone from the expected-date cell
    expect(tabSrc).not.toContain('{po.expectedDate ? formatDate(po.expectedDate) : \'-\'}');
  });

  it('the drill speaks the day\u2019s voice beside its date', () => {
    expect(tabSrc).toContain('poExpectedDayVoice(detail, new Date())');
    expect(tabSrc).toContain(": 'no day named'");
  });
});
