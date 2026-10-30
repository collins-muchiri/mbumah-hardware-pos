// v2.275.0 — the expert hears the census.
//
//   - THE PARITY GAP CLOSES ON BOTH HOMES AT ONCE: the shared People &
//     Payroll panel (people-payroll-by-branch.tsx) wears the census's
//     Portal column — linked over employees in scope, the rate in the
//     census's own emerald, the cell IS the door. One implementation, two
//     mounts: the Expert Console (/console) AND the Finance & Insights tab
//     both speak through it, exactly the law the panel was written under
//     (v2.109.0: one implementation, one server truth, zero duplicated
//     logic). The v2.273.0 gap — the org console heard the census while
//     the Expert system's shared panel stayed silent — is now closed.
//   - THE HREF HAS ONE WRITER: buildPortalReportHref joins the links lib
//     (the ONE writer every door composes through); the org console's
//     drill-down cell now speaks the SAME builder the panel's PortalCell
//     speaks — the two doors can never disagree about where the census
//     lives. The composed bytes are identical to the inline template the
//     v2.273 ancestor pinned (the evolution is named there).
//   - THE RATE IS A PURE FUNCTION (the runtime-pin law — bytes never catch
//     an arithmetic lie): portalAdoptionPct derives the rate over the
//     census's OWN denominator, clamps a corrupt payload honestly (a
//     linked over the total cannot inflate the rate), and returns null for
//     a scope of nothing — the honest dash, never a rate of nothing.
//   - THE LEDGER LEARNS THE CLOCK: the statutory monthly figures (the
//     reports desk's money table) gains the "Due" column — the deadline
//     the statute sets (the 9th of the following month), derived by the
//     compliance calendar's new pure helper statutoryDueForPeriod from the
//     month key the row already carries. The digest's statutory table
//     carries "Due by" (ISO) through the SAME case that feeds the digest
//     email and the ad-hoc CSV — one seam, every surface mirrors. The
//     column is named "Due", never "Filed": whether a past window was
//     actually filed is the ledger's business, and neither surface claims
//     a receipt (the document's-answer law).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { statutoryDueForPeriod } from '@/lib/hr/compliance-calendar';
import { buildPortalReportHref } from '@/lib/workspace/links';
import { portalAdoptionPct } from '@/components/finance/people-payroll-by-branch';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const panel = read('src/components/finance/people-payroll-by-branch.tsx');
const links = read('src/lib/workspace/links.ts');
const consoleSrc = read('src/components/workspace/org-console.tsx');
const page = read('src/app/(shell)/hr/reports/page.tsx');
const schedule = read('src/lib/hr/report-schedule-service.ts');

// ── the RUNTIME law — the arithmetic gets pins ──

describe('portalAdoptionPct — the census rate as a pure function', () => {
  it('speaks the rate over the census denominator — 1 of 5 is 20', () => {
    expect(portalAdoptionPct(1, 5)).toBe(20);
    expect(portalAdoptionPct(0, 5)).toBe(0);
    expect(portalAdoptionPct(5, 5)).toBe(100);
    expect(portalAdoptionPct(3, 7)).toBe(43); // Math.round, not floor
  });

  it('the rate of nothing is no rate — null for an empty or malformed scope', () => {
    expect(portalAdoptionPct(0, 0)).toBe(null);
    expect(portalAdoptionPct(2, -3)).toBe(null); // a negative scope is no scope
    expect(portalAdoptionPct(2, Number.NaN)).toBe(null);
  });

  it('a corrupt payload cannot inflate the rate — linked clamps into the scope', () => {
    // the ladder-order clamp law (v2.273's lesson): the wire's counts are
    // server-derived, but the renderer defends itself — a linked above the
    // total can never speak more than 100%.
    expect(portalAdoptionPct(9, 5)).toBe(100);
    expect(portalAdoptionPct(-2, 5)).toBe(0);
  });
});

describe('statutoryDueForPeriod — the ledger learns the clock (pure)', () => {
  it('derives the 9th of the FOLLOWING month — October 2026 is due 9 November', () => {
    const d = statutoryDueForPeriod('2026-10');
    if (!d) throw new Error('the October 2026 deadline went missing');
    expect(d.dueDate).toBe('2026-11-09');
    expect(d.dueLabel).toBe('9 November 2026');
    expect(d.month).toBe('2026-10');
    expect(d.weekendNote).toBe(null); // 9 Nov 2026 is a Monday — the E2E face said so
  });

  it('December rolls the year — 2026-12 is due 9 January 2027', () => {
    const d = statutoryDueForPeriod('2026-12');
    if (!d) throw new Error('the December year-roll deadline went missing');
    expect(d.dueDate).toBe('2027-01-09');
    expect(d.dueLabel).toBe('9 January 2027');
  });

  it('the weekend law rides along — a weekend 9th speaks the settle-before words', () => {
    // Find a REAL Sat/Sun 9th by scanning payroll months forward from a
    // known anchor (never hardcoding a guessed date): every helper result's
    // own ISO dueDate is re-parsed by the engine's clock, so the pin also
    // cross-checks the helper's arithmetic against JS's own weekday law.
    let found: { note: string; weekday: string; dueDate: string } | null = null;
    for (let m = 0; m < 48 && !found; m++) {
      const year = 2026 + Math.floor(m / 12);
      const month1 = (m % 12) + 1; // payroll month 1..12
      const d = statutoryDueForPeriod(`${year}-${String(month1).padStart(2, '0')}`);
      if (!d) continue;
      const wd = new Date(`${d.dueDate}T00:00:00Z`).getUTCDay();
      if (wd === 0 || wd === 6) {
        found = { note: d.weekendNote ?? '', weekday: wd === 0 ? 'Sunday' : 'Saturday', dueDate: d.dueDate };
      }
    }
    expect(found).not.toBe(null);
    if (!found) throw new Error('no weekend 9th found in 48 payroll months — the scan is broken');
    expect(found.note).toContain(`falls on a ${found.weekday}`);
    expect(found.note).toContain('the statute does not wait; settle before the weekend');
    // the note names the deadline's own day-of-month (the 9th), never a shifted date
    expect(found.note).toMatch(/^9 \w+ falls on a/);
  });

  it('a malformed month key is an honest absence — null, never a guessed date', () => {
    expect(statutoryDueForPeriod('')).toBe(null);
    expect(statutoryDueForPeriod('2026-13')).toBe(null);
    expect(statutoryDueForPeriod('2026-00')).toBe(null);
    expect(statutoryDueForPeriod('October 2026')).toBe(null);
    expect(statutoryDueForPeriod('2026-10-extra')).toBe(null);
    expect(statutoryDueForPeriod(undefined as unknown as string)).toBe(null);
  });

  it('the month passed through untouched — the echo keeps the join key honest', () => {
    const echo = statutoryDueForPeriod('2025-01');
    if (!echo) throw new Error('the January 2025 echo went missing');
    expect(echo.month).toBe('2025-01');
  });
});

describe('buildPortalReportHref — the ONE writer of the census door', () => {
  it('lives in the links lib and cites the census contract in its own doc', () => {
    expect(links).toContain('export function buildPortalReportHref(storeId: string): string');
    expect(links).toContain('the `portal` tab key the reports page');
    expect(links).toContain('both speak through it, so the two doors can never');
  });

  it('composes the exact deep link the census has served since v2.271', () => {
    expect(buildPortalReportHref('store_juja_main')).toBe('/hr/reports?tab=portal&storeId=store_juja_main');
    expect(buildPortalReportHref('')).toBe('/hr/reports?tab=portal&storeId=');
  });

  it('encodes safely and stays relative — the builder law', () => {
    expect(buildPortalReportHref('a&b=c')).toBe('/hr/reports?tab=portal&storeId=a%26b%3Dc');
  });
});

// ── the BYTE law — the surfaces speak the composition ──

describe('the shared panel wears the census column', () => {
  it('the PortalCell is the door — builder href, census testid, emerald face', () => {
    expect(panel).toContain('href={buildPortalReportHref(row.storeId)}');
    expect(panel).toContain('data-testid="people-payroll-portal-door"');
    expect(panel).toContain('focus-visible:ring-emerald-400');
    expect(panel).toContain('font-semibold text-emerald-700 dark:text-emerald-400');
  });

  it('aria speaks the composition aloud, AT gets what the eye gets', () => {
    expect(panel).toContain('aria-label={`${row.portalLinked} of ${row.portalTotal} employees hold a linked portal login at ${row.storeName}');
    expect(panel).toContain('title="Linked logins over employees in scope — open the portal adoption census narrowed to this branch"');
  });

  it('the honest dash for a scope of nothing — no rate of nothing, no dead door', () => {
    expect(panel).toContain('title="No employees in scope for this branch"');
  });

  it('the rate comes from the ONE pure function — the cell never re-derives', () => {
    expect(panel).toContain('portalAdoptionPct(row.portalLinked, row.portalTotal)');
    expect(panel).not.toContain('Math.round((row.portalLinked / row.portalTotal) * 100)');
  });

  it('the table and the mobile card mount the SAME cell — one vocabulary', () => {
    // two mounts, one component
    const mounts = panel.match(/<PortalCell row=\{row\} \/>/g) ?? [];
    expect(mounts.length).toBe(2);
    expect(panel).toContain('<th scope="col" className="px-3 py-2 text-right font-medium">Portal</th>');
    expect(panel).toContain('<dt className="text-[10px] uppercase tracking-wide text-slate-400">Portal</dt>');
  });

  it('the bell rides the cell — the roster bell vocabulary, never a second icon', () => {
    expect(panel).toContain('<BellRing className="h-3 w-3 self-center shrink-0 text-emerald-600 dark:text-emerald-400"');
  });

  it('the header enumeration stays honest about the column set', () => {
    expect(panel).toContain('headcount, cost, absence, latest run, portal adoption, expiry alerts per branch');
  });

  it('amber stays the alerts, orange stays the hover — a color never means two things', () => {
    // the portal cell's only emerald; the amber family remains the expiry cell's
    expect(panel).toContain(
      "assets > 0 ? 'font-semibold text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'",
    );
    expect(panel).toContain('hover:text-orange-800');
  });
});

describe('the org console speaks the ONE writer', () => {
  it('the drill-down door rides the builder — the inline template retired', () => {
    expect(consoleSrc).toContain('href={buildPortalReportHref(row.storeId)}');
    expect(consoleSrc).not.toContain('href={`/hr/reports?tab=portal&storeId=${row.storeId}`}');
    expect(consoleSrc).toContain("buildPortalReportHref,\n  buildRunDeepLinkHref,");
  });
});

describe('the ledger learns the clock — the reports desk and the digest mirror', () => {
  it('the monthly statutory figures gains the Due column, resizable like its siblings', () => {
    expect(page).toContain("<TableHead {...head('due')}    className={`text-right ${col('due')}`}>Due</TableHead>");
    expect(page).toContain("{ key: 'due', label: 'Due' },");
  });

  it('the cell derives from the ONE helper and never claims a filing', () => {
    expect(page).toContain('const due = statutoryDueForPeriod(m.month);');
    expect(page).toContain("{due ? due.dueLabel : '—'}");
    // "Due", never "Filed" — the document's-answer law on the column name.
    // v2.278.0 (deliberate evolution): the desk's own column stays "Due" —
    // the composition arrived as the receipt RAIL inside the cell, not as a
    // second column; `label: 'Filed'` still has no home on the desk.
    expect(page).toContain("label: 'Due' }");
    expect(page).not.toContain("label: 'Filed'");
  });

  it('the weekend law colors the cell amber and speaks the settle-before words', () => {
    expect(page).toContain("due?.weekendNote ? 'text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'");
    expect(page).toContain('Filing window: the 1st–9th of the following month — the statute does not wait for the weekend');
  });

  it('the digest carries Due by (ISO) through the same case — one seam, every surface', () => {
    // v2.278.0 (deliberate evolution): the seam learned the receipt — the
    // columns grew "Filed" beside "Due by" (COUNTS only, the aggregate the
    // aggregate-only law always allowed), so the pinned array became the
    // eight-column face. One seam, every surface (email, ad-hoc CSV, the
    // desk's own table CSV) still mirrors.
    expect(schedule).toContain("columns: ['Month', 'PAYE', 'NSSF', 'SHIF', 'AHL', 'Total', 'Due by', 'Filed']");
    expect(schedule).toContain('statutoryDueForPeriod(m.month)?.dueDate');
    expect(schedule).toContain('digestFilingVoice(m.month,');
    // v2.279.0 (deliberate evolution): the import grew the voice's paired
    // faces (digestFilingComplete — the emerald mark's test — and
    // digestNextDeadlineChip — the clock chip), still from the ONE home.
    expect(schedule).toContain("} from '@/lib/hr/compliance-calendar';");
    expect(schedule).toContain('import { digestFilingComplete, digestFilingVoice, digestNextDeadlineChip, statutoryDueForPeriod }');
  });
});
