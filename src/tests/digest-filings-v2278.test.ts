// v2.278.0 — the digest learns the receipt.
//
//   - THE MIRROR LAW: v2.275.0 named the digest's statutory column "Due
//     by", never "Filed", because the ledger did not exist; v2.276.0 built
//     the ledger; the desk's Due cell learned to count receipts
//     (v2.276.0/277.0). This round the digest completes the mirror — the
//     SAME case feeds the scheduled email, the ad-hoc CSV and the desk's
//     own table CSV, so one seam clothes every surface.
//   - THE AGGREGATE LAW: COUNTS only. "N of 4 filed · K amended" is an
//     aggregate; the receipt's name, reference and note are the ledger
//     desk's own words and never ride a digest.
//   - THE CLOCK GOVERNS THE FIRST RECORD: a payroll month whose filing
//     window has not opened (before the 1st of the due month, the census's
//     UTC-midnight floor law) keeps the cell QUIET — a "0 of 4" cried over
//     an unopened window would be neglect where none is possible.
//   - THE HONEST ABSENCE: a ledger that cannot speak (pre-migration
//     database, read failure) leaves the composition null and the cell
//     quiet — the money still tells the truth (the load-erasure law).
//   - THE RUNTIME-PIN LAW (twice over): the voice's grammar and clamps are
//     exactly the kind of truth bytes never catch, and the window-open
//     derivation must agree with statutoryDueForPeriod (the ONE
//     derivation, never a second 9th-minus-8 math).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  digestFilingVoice,
  filingWindowOpensForPeriod,
  STATUTORY_OBLIGATION_KINDS,
  statutoryDueForPeriod,
} from '@/lib/hr/compliance-calendar';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const calSrc = read('src/lib/hr/compliance-calendar.ts');
const reportsSrc = read('src/lib/hr/reports.ts');
const scheduleSrc = read('src/lib/hr/report-schedule-service.ts');
const pageSrc = read('src/app/(shell)/hr/reports/page.tsx');
const v2275 = read('src/tests/panel-portal-v2275.test.ts');
const v2276 = read('src/tests/filing-ledger-v2276.test.ts');

// ── the window's open day (RUNTIME pins) ──

describe('filingWindowOpensForPeriod — the day filing becomes possible', () => {
  it('opens on the 1st of the due month — the same month the deadline speaks', () => {
    // October 2026's obligations fall due 9 November; the window opens 1 November.
    expect(statutoryDueForPeriod('2026-10')?.dueDate).toBe('2026-11-09');
    expect(filingWindowOpensForPeriod('2026-10')).toBe('2026-11-01');
  });

  it('the December roll — a December payroll month opens in the next January', () => {
    expect(filingWindowOpensForPeriod('2026-12')).toBe('2027-01-01');
    expect(filingWindowOpensForPeriod('2025-12')).toBe('2026-01-01');
  });

  it('the January roll — a January payroll month opens in February', () => {
    expect(filingWindowOpensForPeriod('2027-01')).toBe('2027-02-01');
  });

  it('malformed month keys stay honest — null, never a guessed window', () => {
    expect(filingWindowOpensForPeriod('')).toBeNull();
    expect(filingWindowOpensForPeriod('2026-13')).toBeNull();
    expect(filingWindowOpensForPeriod('not-a-month')).toBeNull();
    expect(filingWindowOpensForPeriod('2026-10 ')).toBeNull();
  });
});

// ── the voice's grammar (RUNTIME pins) ──

describe('digestFilingVoice — the document\'s-answer grammar', () => {
  const OPEN_MONTH = '2026-09'; // window opened 1 October 2026
  const NOW = new Date(Date.UTC(2026, 9, 30, 12, 0, 0)); // 30 Oct 2026 — after the window opened

  it('counts null → quiet: a ledger that cannot speak is never guessed', () => {
    expect(digestFilingVoice(OPEN_MONTH, null, NOW)).toBe('');
  });

  it('an unopened window stays silent — the clock governs the first record', () => {
    // October 2026's window opens 1 November; on 30 October nothing can be filed.
    expect(digestFilingVoice('2026-10', { filed: 0, amended: 0 }, NOW)).toBe('');
    expect(digestFilingVoice('2026-10', { filed: 4, amended: 0 }, NOW)).toBe('');
  });

  it('the window-edge day: the open day itself speaks', () => {
    const onOpenDay = new Date(Date.UTC(2026, 9, 1, 0, 0, 0)); // 1 Oct 2026, the open day
    expect(digestFilingVoice(OPEN_MONTH, { filed: 2, amended: 0 }, onOpenDay)).toBe('2 of 4 filed');
  });

  it('the four grammars: 0, partial, complete — and the amendment tail', () => {
    expect(digestFilingVoice(OPEN_MONTH, { filed: 0, amended: 0 }, NOW)).toBe('0 of 4 filed');
    expect(digestFilingVoice(OPEN_MONTH, { filed: 2, amended: 0 }, NOW)).toBe('2 of 4 filed');
    expect(digestFilingVoice(OPEN_MONTH, { filed: 4, amended: 0 }, NOW)).toBe('4 of 4 filed');
    expect(digestFilingVoice(OPEN_MONTH, { filed: 3, amended: 1 }, NOW)).toBe('3 of 4 filed · 1 amended');
    expect(digestFilingVoice(OPEN_MONTH, { filed: 4, amended: 2 }, NOW)).toBe('4 of 4 filed · 2 amended');
  });

  it('the clamps hold at the door — a corrupt payload cannot inflate a composition', () => {
    expect(digestFilingVoice(OPEN_MONTH, { filed: 9, amended: 0 }, NOW)).toBe('4 of 4 filed');
    expect(digestFilingVoice(OPEN_MONTH, { filed: 4, amended: 9 }, NOW)).toBe('4 of 4 filed · 4 amended');
    expect(digestFilingVoice(OPEN_MONTH, { filed: -3, amended: 0 }, NOW)).toBe('0 of 4 filed');
    expect(digestFilingVoice(OPEN_MONTH, { filed: Number.NaN, amended: Number.NaN }, NOW)).toBe('0 of 4 filed');
  });

  it('malformed months stay quiet even with counts in hand', () => {
    expect(digestFilingVoice('nope', { filed: 4, amended: 0 }, NOW)).toBe('');
  });

  it('the denominator is the calendar\'s own four — the clock\'s list, not the ledger\'s', () => {
    expect(STATUTORY_OBLIGATION_KINDS).toEqual(['PAYE', 'NSSF', 'SHIF', 'AHL']);
    expect(digestFilingVoice(OPEN_MONTH, { filed: 4, amended: 0 }, NOW)).toBe(`4 of ${STATUTORY_OBLIGATION_KINDS.length} filed`);
  });

  it('the pure lib stays import-free — the client-bundle law', () => {
    expect(calSrc.match(/^import /m)).toBeNull();
  });
});

// ── the read side: the composition rides the report ──

describe('statutoryLiabilityReport — the ledger\'s composition rides the money', () => {
  it('the read is the ledger\'s OWN read — one home, never a second roll call', () => {
    expect(reportsSrc).toContain("import { fetchStatutoryFilings } from './statutory-filing';");
    expect(reportsSrc).toContain("import { filingWasAmended } from './compliance-calendar';");
    expect(reportsSrc).toContain('await fetchStatutoryFilings(session, { fromMonth: monthKeys[0], toMonth: monthKeys[monthKeys.length - 1] })');
  });

  it('the amendment count is the slack law\'s, not the eye\'s', () => {
    expect(reportsSrc).toContain('if (filingWasAmended(row)) bucket.amended += 1;');
  });

  it('a receipt whose payroll month has no row here is another report\'s story', () => {
    expect(reportsSrc).toContain('if (!bucket) continue;');
  });

  it('a ledger that cannot speak leaves the composition null — the money never darkens', () => {
    expect(reportsSrc).toContain('catch {');
    expect(reportsSrc).toContain('filings = null; // the ledger stays quiet; the money never lies about it');
  });

  it('no monthly rows → no ledger read at all', () => {
    expect(reportsSrc).toContain('if (monthKeys.length > 0) {');
  });

  it('the report\'s answer carries the composition beside the totals', () => {
    expect(reportsSrc).toContain('filings,');
  });
});

// ── the digest seam: one case, every surface ──

describe('buildDigestPayload — the seam learned the receipt', () => {
  it('the columns grew Filed beside Due by — the eight-column face', () => {
    expect(scheduleSrc).toContain("columns: ['Month', 'PAYE', 'NSSF', 'SHIF', 'AHL', 'Total', 'Due by', 'Filed']");
  });

  it('the row\'s last cell is the calendar\'s pure voice at the fire instant', () => {
    expect(scheduleSrc).toContain('digestFilingVoice(m.month, r.filings ? r.filings[m.month] ?? null : null, now)');
    // `now` is buildDigestPayload's own parameter — the scheduled fire's instant
    expect(scheduleSrc).toContain('now: Date = new Date()');
  });

  it('the v2.275 comment tells the new truth — the evolution is named where the law changed', () => {
    expect(scheduleSrc).toContain('v2.278.0 "the digest learns the receipt"');
    expect(scheduleSrc).toContain('the column named "Due');
    expect(scheduleSrc).toContain('COUNTS only');
    expect(scheduleSrc).toContain('never a name, reference or note');
  });

  it('COUNTS never carry the receipt\'s private words — the aggregate law at the seam', () => {
    expect(scheduleSrc).not.toContain('filedByName');
    expect(scheduleSrc).not.toContain('r.filings?.reference');
    // the row composes money + the ISO due date + the voice — nothing else
    expect(scheduleSrc).toContain('statutoryDueForPeriod(m.month)?.dueDate ?? \'\', digestFilingVoice(');
  });
});

// ── the desk's receipt rail (mandatory ④: the styling face) ──

describe('the desk\'s Due cell — the receipt rail', () => {
  it('the rail rides the coverage law — outside the read window it stays quiet', () => {
    expect(pageSrc).toContain('{monthInCoverage(m.month) && (() => {');
    expect(pageSrc).toContain('data-testid="hr-due-filed-rail"');
  });

  it('four dots, the calendar\'s own order, emerald held / quiet slate not', () => {
    expect(pageSrc).toContain("const kinds = ['PAYE', 'NSSF', 'SHIF', 'AHL'] as const;");
    expect(pageSrc).toContain("held ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'");
    expect(pageSrc).toContain('data-testid={`hr-due-filed-dot-${k.toLowerCase()}`}');
  });

  it('the aria speaks the ONE grammar the title speaks', () => {
    expect(pageSrc).toContain('aria-label={`filed: ${count} of ${kinds.length} obligations${amended > 0 ? ` · ${amended} receipt${amended === 1 ? \'\' : \'s\'} amended` : \'\'}`}');
  });

  it('monthFullyFiled retired — the rail IS the composition', () => {
    // the helper is gone; only the retirement comment speaks its name
    expect(pageSrc).not.toContain('const monthFullyFiled = (periodMonth: string): boolean =>');
    expect(pageSrc).toContain('monthFullyFiled retired');
  });
});

// ── the ancestors wear their evolutions ──

describe('the ancestor pins evolved deliberately', () => {
  it('v2275\'s digest pin speaks the eight columns and names the evolution', () => {
    expect(v2275).toContain("'Due by', 'Filed']");
    expect(v2275).toContain('v2.278.0 (deliberate evolution)');
  });

  it('v2276\'s dot pin grew the rail and named the evolution', () => {
    expect(v2276).toContain('data-testid="hr-due-filed-rail"');
    expect(v2276).toContain('v2.278.0 (deliberate evolution)');
  });
});
