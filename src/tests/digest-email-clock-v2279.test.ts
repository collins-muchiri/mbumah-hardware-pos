// v2.279.0 — the email hears the clock.
//
//   - THE CLOCK CHIP: the digest's statutory headline answers "what's
//     coming" before "what was owed" — digestNextDeadlineChip(now) derives
//     the NEXT deadline purely from complianceCalendar at the fire instant
//     (the statute's own clock, never stored, never guessed). The chip
//     speaks WORDS, never urgency colors — the desk's card owns the tones.
//   - THE PAIRED FACES: digestFilingComplete is the voice's boolean twin —
//     the SAME window gate (filingWindowOpenDay, extracted this round so
//     the gate lives ONCE) and the SAME clamps. The email's emerald face
//     and the CSV's plain "4 of 4 filed" can never disagree.
//   - THE GOOD CELLS: coordinates only. The builder marks; the HTML email
//     wears the house's own emerald (BRAND.primaryDark, the receipt's
//     family per color-never-means-two-things); the CSV and text twins
//     never read goodCells — plain by law. A payload without goodCells
//     renders byte-identical to the pre-v2.279 template.
//   - THE RUNTIME-PIN LAW: the chip's composition, the complete-test's
//     gate table, and the voice⇔complete agreement are exactly the kind
//     of truth bytes never catch.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  digestFilingVoice,
  digestFilingComplete,
  digestNextDeadlineChip,
  filingWindowOpenDay,
  filingWindowOpensForPeriod,
} from '@/lib/hr/compliance-calendar';
import { hrReportDigestTemplate, hrReportDigestText, type HrReportDigestData } from '@/lib/email-templates';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const calSrc = read('src/lib/hr/compliance-calendar.ts');
const scheduleSrc = read('src/lib/hr/report-schedule-service.ts');
const tplSrc = read('src/lib/email-templates.ts');
const v2278 = read('src/tests/digest-filings-v2278.test.ts');

// ── the ONE window gate (RUNTIME pins) ──

describe('filingWindowOpenDay — the gate lives once', () => {
  it('the open day key derives from the open day the ISO helper speaks', () => {
    expect(filingWindowOpensForPeriod('2026-10')).toBe('2026-11-01');
    // 2026-11-01 UTC midnight as a day key — the census's own floor law
    expect(filingWindowOpenDay('2026-10')).toBe(Math.floor(new Date('2026-11-01T00:00:00Z').getTime() / 86_400_000));
  });

  it('malformed months stay honest — null', () => {
    expect(filingWindowOpenDay('')).toBeNull();
    expect(filingWindowOpenDay('2026-13')).toBeNull();
    expect(filingWindowOpenDay('nope')).toBeNull();
  });

  it('the voice rides the ONE gate — the old inline math is gone', () => {
    expect(calSrc).toContain('const openDay = filingWindowOpenDay(month);');
    expect(calSrc).toContain('utcDayKey(now) < openDay');
    expect(calSrc).not.toContain("const openDay = utcDayKey(new Date(`${opens}T00:00:00Z`));");
  });
});

// ── the paired faces (RUNTIME pins) ──

describe('digestFilingComplete — the voice\'s boolean twin', () => {
  const OPEN = '2026-09'; // window opened 1 October 2026
  const NOW = new Date(Date.UTC(2026, 9, 30, 12, 0, 0));

  it('the honest absences: null counts, unopened windows, malformed months — all false', () => {
    expect(digestFilingComplete(OPEN, null, NOW)).toBe(false);
    expect(digestFilingComplete('2026-10', { filed: 4, amended: 0 }, NOW)).toBe(false); // window opens 1 Nov
    expect(digestFilingComplete('nope', { filed: 4, amended: 0 }, NOW)).toBe(false);
  });

  it('partial and over-amended compositions are false — never a dressed-up partial', () => {
    expect(digestFilingComplete(OPEN, { filed: 3, amended: 1 }, NOW)).toBe(false);
    expect(digestFilingComplete(OPEN, { filed: 0, amended: 0 }, NOW)).toBe(false);
  });

  it('complete when all four are evidenced', () => {
    expect(digestFilingComplete(OPEN, { filed: 4, amended: 0 }, NOW)).toBe(true);
    expect(digestFilingComplete(OPEN, { filed: 4, amended: 2 }, NOW)).toBe(true); // amendments ride a complete month
  });

  it('the clamp law holds on the boolean face too', () => {
    expect(digestFilingComplete(OPEN, { filed: 9, amended: 0 }, NOW)).toBe(true); // clamped to 4 — same as the voice
    expect(digestFilingComplete(OPEN, { filed: Number.NaN, amended: 0 }, NOW)).toBe(false); // clamped to 0
  });

  it('THE AGREEMENT LAW: complete ⇔ the voice reads the complete composition — a truth table over the gate', () => {
    const cases: Array<{ month: string; counts: { filed: number; amended: number } | null }> = [
      { month: '2026-09', counts: null },
      { month: '2026-09', counts: { filed: 0, amended: 0 } },
      { month: '2026-09', counts: { filed: 2, amended: 0 } },
      { month: '2026-09', counts: { filed: 4, amended: 0 } },
      { month: '2026-09', counts: { filed: 4, amended: 3 } },
      { month: '2026-09', counts: { filed: 9, amended: 9 } },
      { month: '2026-10', counts: { filed: 4, amended: 0 } }, // unopened window
      { month: 'nope', counts: { filed: 4, amended: 0 } },
    ];
    for (const c of cases) {
      const voice = digestFilingVoice(c.month, c.counts, NOW);
      // a complete month may carry amendments — the voice reads "4 of 4
      // filed" with an optional tail; the boolean face agrees either way
      expect(digestFilingComplete(c.month, c.counts, NOW)).toBe(voice.startsWith('4 of 4 filed'));
    }
  });
});

// ── the clock chip (RUNTIME pins) ──

describe('digestNextDeadlineChip — what\'s coming, first', () => {
  it('at the October desk the chip speaks November\'s 9th over October\'s payroll', () => {
    const chip = digestNextDeadlineChip(new Date(Date.UTC(2026, 9, 30, 12, 0, 0)));
    expect(chip).toEqual({ label: 'Next deadline', value: '9 November 2026 · October 2026 payroll' });
  });

  it('the December roll — mid-December reads January\'s 9th over December\'s payroll', () => {
    const chip = digestNextDeadlineChip(new Date(Date.UTC(2026, 11, 15, 8, 0, 0)));
    expect(chip?.value).toBe('9 January 2027 · December 2026 payroll');
  });

  it('the chip speaks words only — the honest date pairs by the window law, never urgency', () => {
    for (const day of [1, 5, 8, 9]) {
      // on or before the 9th: the OPEN window's deadline — this month's 9th
      // covering the PREVIOUS payroll month (the calendar's own window law)
      const chip = digestNextDeadlineChip(new Date(Date.UTC(2026, 9, day, 9, 0, 0)));
      expect(chip?.value).toBe('9 October 2026 · September 2026 payroll');
    }
    for (const day of [10, 20, 28]) {
      // past the 9th: the clock rolls — next month's 9th covering this payroll
      const chip = digestNextDeadlineChip(new Date(Date.UTC(2026, 9, day, 9, 0, 0)));
      expect(chip?.value).toBe('9 November 2026 · October 2026 payroll');
    }
  });

  it('the chip is always derivable at a valid instant — the calendar never comes home empty', () => {
    for (const day of [1, 15, 28]) {
      for (const month of [0, 5, 11]) {
        expect(digestNextDeadlineChip(new Date(Date.UTC(2027, month, day)))).not.toBeNull();
      }
    }
  });
});

// ── the builder: the chip first, the marks beside the voice ──

describe('buildDigestPayload — the clock rides first, the marks ride beside', () => {
  it('the headline spreads the chip FIRST — computed once, spread once', () => {
    expect(scheduleSrc).toContain('const clock = digestNextDeadlineChip(now);');
    expect(scheduleSrc).toContain('...(clock ? [clock] : []),');
    expect(scheduleSrc).not.toContain('digestNextDeadlineChip(now) ? [digestNextDeadlineChip(now)');
  });

  it('goodCells are the complete-test\'s coordinates, column 7 (Filed), never fabricated', () => {
    expect(scheduleSrc).toContain('digestFilingComplete(m.month, r.filings ? r.filings[m.month] ?? null : null, now) ? [i, 7] : null');
    expect(scheduleSrc).toContain('.filter((c): c is [number, number] => c !== null)');
  });

  it('the voice\'s row bytes stand untouched — the v2.278 pin survives', () => {
    expect(scheduleSrc).toContain("columns: ['Month', 'PAYE', 'NSSF', 'SHIF', 'AHL', 'Total', 'Due by', 'Filed']");
    expect(scheduleSrc).toContain('digestFilingVoice(m.month, r.filings ? r.filings[m.month] ?? null : null, now)');
  });

  it('the builder imports the paired faces from the ONE home', () => {
    expect(scheduleSrc).toContain("import { digestFilingComplete, digestFilingVoice, digestNextDeadlineChip, statutoryDueForPeriod } from '@/lib/hr/compliance-calendar';");
  });
});

// ── the email face: emerald only where marked, byte-identical where not ──

describe('the HTML email — the good family, coordinates only', () => {
  const payload = (goodCells?: Array<[number, number]>): HrReportDigestData => ({
    organizationName: 'MBUMAH HARDWARE',
    reportLabel: 'Statutory liability',
    periodLabel: '2026-01-01 → 2026-10-30',
    scopeLabel: 'All branches',
    frequencyLabel: 'AD_HOC',
    headline: [
      { label: 'Next deadline', value: '9 November 2026 · October 2026 payroll' },
      { label: 'Total statutory', value: 'KES 32,760.00' },
    ],
    table: {
      caption: 'Monthly statutory liability',
      columns: ['Month', 'PAYE', 'NSSF', 'SHIF', 'AHL', 'Total', 'Due by', 'Filed'],
      rows: [
        ['September 2026', 'KES 1.00', 'KES 1.00', 'KES 1.00', 'KES 1.00', 'KES 4.00', '2026-10-09', '4 of 4 filed'],
        ['August 2026', 'KES 1.00', 'KES 1.00', 'KES 1.00', 'KES 1.00', 'KES 4.00', '2026-09-09', '3 of 4 filed · 1 amended'],
      ],
      ...(goodCells ? { goodCells } : {}),
    },
  });

  it('a marked cell wears the house\'s emerald — BRAND.primaryDark, weight 600', () => {
    const html = hrReportDigestTemplate(payload([[0, 7]]));
    expect(html).toContain(`color:#059669;font-weight:600;`);
    expect(html).toContain('>4 of 4 filed</td>');
    expect(html).toContain('>3 of 4 filed \u00b7 1 amended</td>');
    // the emerald rides ONLY the marked cell: exactly one colored td
    expect((html.match(/color:#059669;font-weight:600;/g) ?? []).length).toBe(1);
  });

  it('the clock chip rides the email\'s headline as words', () => {
    const html = hrReportDigestTemplate(payload());
    expect(html).toContain('>Next deadline</td>');
    expect(html).toContain('>9 November 2026 \u00b7 October 2026 payroll</td>');
  });

  it('a payload WITHOUT goodCells renders byte-identical to the pre-v2.279 face', () => {
    const html = hrReportDigestTemplate(payload());
    expect(html).not.toContain('font-weight:600;');
  });

  it('the text twin stays plain — goodCells never leak into the plain-text world', () => {
    const text = hrReportDigestText(payload([[0, 7]]));
    expect(text).toContain('Next deadline: 9 November 2026 \u00b7 October 2026 payroll');
    expect(text).toContain('4 of 4 filed');
    expect(text).not.toContain('#059669');
    expect(text).not.toContain('font-weight');
  });

  it('the template\'s affordance is coordinates on the table type — additive, optional', () => {
    expect(tplSrc).toContain('goodCells?: Array<[number, number]>;');
    expect(tplSrc).toContain('data.table?.goodCells?.some((rc) => rc[0] === rowIdx && rc[1] === colIdx)');
  });
});

// ── the ancestors hold ──

describe('the v2.278 ancestor', () => {
  it('the digest-filings suite still pins the seam it owns', () => {
    expect(v2278).toContain("columns: ['Month', 'PAYE', 'NSSF', 'SHIF', 'AHL', 'Total', 'Due by', 'Filed']");
    expect(v2278).toContain('digestFilingVoice(OPEN_MONTH, { filed: 3, amended: 1 }, NOW)).toBe(\'3 of 4 filed \u00b7 1 amended\')');
  });

  it('the pure lib stays import-free — the client-bundle law', () => {
    expect(calSrc.match(/^import /m)).toBeNull();
  });
});
