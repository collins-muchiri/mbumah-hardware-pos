// v2.274.0 — the calendar keeps the clock.
//
//   - THE CLOCK IS DERIVED, NOT STORED: complianceCalendar(now) speaks
//     Kenya's monthly payroll obligations (PAYE / NSSF / SHIF / housing
//     levy) — all the 9th-of-the-following-month family — as a pure
//     function of a point in time. The RUNTIME-pin law applies twice
//     over: the calendar-day arithmetic (the census's UTC-midnight floor)
//     and the window-state bands are exactly the kind of truth bytes
//     never catch.
//   - THE WINDOW LAW: the filing window is the 1st–9th of the deadline
//     month. On or before the 9th the window for the PREVIOUS payroll
//     month is open; after the 9th the clock rolls to this month's
//     obligation due next month's 9th (NOT_YET_OPEN — the honest quiet).
//   - THE WEEKEND LAW: when a 9th lands on a Saturday or a Sunday the
//     row says so — the statute does not wait; settle before the weekend.
//   - THE SURFACE LAWS: the route is a read (guard, no audit), the card
//     renders the clock above the money with its own independent load
//     (a period-report failure must never darken the clock), and the
//     unopened window gets NO rail (a meter for a window that does not
//     exist would be a guess).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { complianceCalendar } from '@/lib/hr/compliance-calendar';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const routeSrc = read('src/app/api/hr/reports/compliance-calendar/route.ts');
const pageSrc = read('src/app/(shell)/hr/reports/page.tsx');
const libSrc = read('src/lib/hr/compliance-calendar.ts');

// ── the pin dates — built on Date.UTC so the pins never lean on the CI clock ──

describe('complianceCalendar — the window law (RUNTIME pins)', () => {
  it('mid-window: 5 November reads October payroll, due 9 November, 4 days left, due_soon', () => {
    const cal = complianceCalendar(new Date(Date.UTC(2026, 10, 5, 10, 30, 0))); // 5 Nov 2026
    expect(cal.obligations).toHaveLength(4);
    const paye = cal.obligations.find((o) => o.kind === 'PAYE');
    if (!paye) throw new Error('PAYE row missing');
    expect(paye.periodLabel).toBe('October 2026');
    expect(paye.dueDate).toBe('2026-11-09');
    expect(paye.dueLabel).toBe('9 November 2026');
    expect(paye.daysRemaining).toBe(4); // 9 − 5, calendar midnights
    expect(paye.status).toBe('DUE_SOON');
    expect(paye.statusWord).toBe('due in 4 days');
    expect(paye.windowElapsedPct).toBe(56); // round(5/9 × 100)
    expect(paye.windowWord).toBe('day 5 of 9');
    expect(paye.weekendNote).toBeNull();
  });

  it('window edge: the 1st is OPEN with 8 days; the 9th itself is DUE_TODAY at 100%', () => {
    const first = complianceCalendar(new Date(Date.UTC(2026, 10, 1, 0, 5, 0)));
    const payeFirst = first.obligations.find((o) => o.kind === 'PAYE');
    if (!payeFirst) throw new Error('PAYE row missing');
    expect(payeFirst.status).toBe('OPEN');
    expect(payeFirst.daysRemaining).toBe(8);
    expect(payeFirst.statusWord).toBe('due in 8 days');
    expect(payeFirst.windowElapsedPct).toBe(11); // round(1/9 × 100)

    const ninth = complianceCalendar(new Date(Date.UTC(2026, 10, 9, 23, 0, 0)));
    const payeNinth = ninth.obligations.find((o) => o.kind === 'PAYE');
    if (!payeNinth) throw new Error('PAYE row missing');
    expect(payeNinth.status).toBe('DUE_TODAY');
    expect(payeNinth.statusWord).toBe('due today');
    expect(payeNinth.daysRemaining).toBe(0);
    expect(payeNinth.windowElapsedPct).toBe(100);
  });

  it('the clock rolls: past the 9th the window is NOT_YET_OPEN and the meter refuses to render a guess', () => {
    const cal = complianceCalendar(new Date(Date.UTC(2026, 10, 12, 6, 0, 0))); // 12 Nov 2026
    const paye = cal.obligations.find((o) => o.kind === 'PAYE');
    if (!paye) throw new Error('PAYE row missing');
    expect(paye.periodLabel).toBe('November 2026'); // this month's payroll…
    expect(paye.dueDate).toBe('2026-12-09'); // …due next month's 9th
    expect(paye.status).toBe('NOT_YET_OPEN');
    expect(paye.statusWord).toBe('window opens 1 December');
    expect(paye.windowWord).toBe('window opens 1 December 2026');
    expect(paye.daysRemaining).toBe(27); // 12 Nov → 9 Dec on UTC midnights
    expect(paye.windowElapsedPct).toBeNull(); // no rail for a window that does not exist
  });

  it('December rolls the year: 12 December points at January, due 9 January 2027', () => {
    const cal = complianceCalendar(new Date(Date.UTC(2026, 11, 15, 12, 0, 0)));
    const paye = cal.obligations.find((o) => o.kind === 'PAYE');
    if (!paye) throw new Error('PAYE row missing');
    expect(paye.periodLabel).toBe('December 2026');
    expect(paye.dueDate).toBe('2027-01-09');
    expect(paye.dueLabel).toBe('9 January 2027');
    expect(paye.status).toBe('NOT_YET_OPEN');
  });

  it('due tomorrow is its own status — 8 November speaks the singular', () => {
    const cal = complianceCalendar(new Date(Date.UTC(2026, 10, 8, 9, 0, 0)));
    const paye = cal.obligations.find((o) => o.kind === 'PAYE');
    if (!paye) throw new Error('PAYE row missing');
    expect(paye.status).toBe('DUE_TOMORROW');
    expect(paye.statusWord).toBe('due tomorrow');
    expect(paye.daysRemaining).toBe(1);
  });

  it('the census UTC-midnight floor law: a late-hour asOf never invents an extra day', () => {
    // 9 Nov 23:59.999 UTC is still the 9th's day-key → DUE_TODAY, not overdue.
    const late = complianceCalendar(new Date(Date.UTC(2026, 10, 9, 23, 59, 59)));
    const paye = late.obligations.find((o) => o.kind === 'PAYE');
    if (!paye) throw new Error('PAYE row missing');
    expect(paye.daysRemaining).toBe(0);
    expect(paye.status).toBe('DUE_TODAY');
    // 10 Nov 00:00.001 UTC is the next midnight → the clock has rolled.
    const rolled = complianceCalendar(new Date(Date.UTC(2026, 10, 10, 0, 0, 0)));
    const payeRolled = rolled.obligations.find((o) => o.kind === 'PAYE');
    if (!payeRolled) throw new Error('PAYE row missing');
    expect(payeRolled.status).toBe('NOT_YET_OPEN');
    expect(payeRolled.daysRemaining).toBe(29); // 10 Nov → 9 Dec
  });

  it('the four obligations share the statute day but each keeps its own name and instrument', () => {
    const cal = complianceCalendar(new Date(Date.UTC(2026, 10, 5, 0, 0, 0)));
    expect(cal.obligations.map((o) => o.kind)).toEqual(['PAYE', 'NSSF', 'SHIF', 'AHL']);
    expect(cal.obligations.map((o) => o.dueDate)).toEqual(['2026-11-09', '2026-11-09', '2026-11-09', '2026-11-09']);
    const labels = cal.obligations.map((o) => o.label);
    expect(labels).toEqual(['PAYE', 'NSSF', 'SHIF', 'Housing levy']);
    for (const o of cal.obligations) {
      expect(o.instrument.length).toBeGreaterThan(10); // the calendar cites, never asserts
      expect(o.instrument).not.toBe(o.label);
    }
  });

  it('the weekend law: a Saturday 9th warns, a weekday 9th stays silent', () => {
    // Find months whose 9th is a Saturday / Sunday, from a fixed anchor year —
    // the pin derives the month itself so the arithmetic law is what's pinned.
    let foundSaturday: { year: number; month: number } | null = null;
    let foundSunday: { year: number; month: number } | null = null;
    for (let year = 2027; year <= 2030 && (!foundSaturday || !foundSunday); year++) {
      for (let month = 0; month < 12; month++) {
        const wd = new Date(Date.UTC(year, month, 9)).getUTCDay();
        if (wd === 6 && !foundSaturday) foundSaturday = { year, month };
        if (wd === 0 && !foundSunday) foundSunday = { year, month };
      }
    }
    if (foundSaturday) {
      const { year, month } = foundSaturday;
      // sit inside that month's window (the 5th) — the due date is that same 9th
      const cal = complianceCalendar(new Date(Date.UTC(year, month, 5, 8, 0, 0)));
      const paye = cal.obligations.find((o) => o.kind === 'PAYE');
      if (!paye) throw new Error('PAYE row missing');
      expect(paye.dueDate).toBe(`${year}-${String(month + 1).padStart(2, '0')}-09`);
      if (!paye.weekendNote) throw new Error('weekend note missing on a Saturday 9th');
      expect(paye.weekendNote).toContain('Saturday');
      expect(paye.weekendNote).toContain('the statute does not wait');
    }
    if (foundSunday) {
      const { year, month } = foundSunday;
      const cal = complianceCalendar(new Date(Date.UTC(year, month, 5, 8, 0, 0)));
      const paye = cal.obligations.find((o) => o.kind === 'PAYE');
      if (!paye) throw new Error('PAYE row missing');
      if (!paye.weekendNote) throw new Error('weekend note missing on a Sunday 9th');
      expect(paye.weekendNote).toContain('Sunday');
    }
    // a known weekday 9th: 9 November 2026 is a Monday — silence is the honest face
    const monday = complianceCalendar(new Date(Date.UTC(2026, 10, 5, 8, 0, 0)));
    const payeMonday = monday.obligations.find((o) => o.kind === 'PAYE');
    if (!payeMonday) throw new Error('PAYE row missing');
    expect(payeMonday.weekendNote).toBeNull();
  });

  it('asOf is the payload own instant — the point-in-time law', () => {
    const at = new Date(Date.UTC(2026, 10, 5, 10, 30, 0));
    const cal = complianceCalendar(at);
    expect(cal.asOf).toBe(at.toISOString());
  });
});

describe('compliance-calendar surface laws (byte pins)', () => {
  it('the route is a guard-riding read — the same drill-down roles, no audit (reads ride the guard alone)', () => {
    expect(routeSrc).toContain("hrGuard('hr.report.branch'");
    expect(routeSrc).toContain("'HR_MANAGER', 'STORE_OWNER', 'ACCOUNTANT', 'BRANCH_MANAGER'");
    expect(routeSrc).toContain('complianceCalendar(new Date())');
    expect(routeSrc).toContain("dynamic = 'force-dynamic'");
    expect(routeSrc).not.toContain('auditLog'); // the read surface invents no audit row
    expect(routeSrc).not.toContain("searchParams.get('storeId')"); // the statute does not vary by branch
  });

  it('the lib cites the four instruments, and the spoken words never claim a receipt', () => {
    expect(libSrc).toContain('NSSF Act 2013');
    expect(libSrc).toContain('Social Health Insurance Act 2023');
    expect(libSrc).toContain('Affordable Housing Act 2024');
    expect(libSrc).toContain('Income Tax Act');
    // the RUNTIME face: no status word, window word, or weekend note ever
    // claims the window was filed or paid — that is the ledger's business
    const samples = [
      new Date(Date.UTC(2026, 10, 5, 8, 0, 0)),
      new Date(Date.UTC(2026, 10, 9, 12, 0, 0)),
      new Date(Date.UTC(2026, 10, 20, 12, 0, 0)),
    ];
    for (const at of samples) {
      for (const o of complianceCalendar(at).obligations) {
        const spoken = `${o.statusWord} ${o.windowWord ?? ''} ${o.weekendNote ?? ''}`;
        expect(spoken).not.toMatch(/\b(filed|paid)\b/i);
      }
    }
  });

  it('the card renders the clock above the money with its own independent load', () => {
    expect(pageSrc).toContain("data-testid=\"hr-compliance-calendar\"");
    expect(pageSrc).toContain('testId="hr-compliance-calendar-error"');
    expect(pageSrc).toContain('/api/hr/reports/compliance-calendar');
    // the independent-resilience law: the clock owns its own load, its own failure strip
    expect(pageSrc).toContain('const loadCalendar = useCallback');
    expect(pageSrc).toContain('hr-cal-status-${o.kind.toLowerCase()}');
    expect(pageSrc).toContain('hr-cal-row-${o.kind.toLowerCase()}');
    // the family law: rose acts now, amber warns, sky informs — the page's own tones
    expect(pageSrc).toContain("case 'DUE_TODAY':");
    expect(pageSrc).toContain("case 'DUE_SOON':");
    expect(pageSrc).toContain("case 'NOT_YET_OPEN':");
    expect(pageSrc).toContain("'border-border bg-muted text-muted-foreground'");
  });

  it("the card's copy keeps the honest face — the ledger's business stays the ledger's", () => {
    expect(pageSrc).toContain("whether a window was filed is the ledger&apos;s business");
    expect(pageSrc).toContain("weekends do not extend it");
  });
});
