// v2.306.0 — the pools speak at their desks.
//
//   - THE PARITY GAP (the round's own discovery): the goal-attainment and
//     review-cycles digests email aggregates the performance desk never
//     spoke — the email said "Attainment 50%", the desk said only rows and
//     filter chips. The bands close it: the desk speaks the digest's own
//     headline numbers from the SAME rows it already holds (no second
//     fetch, no new endpoint, no widened read).
//   - THE ONE ARITHMETIC (moved, not copied): goalAttainmentPct and
//     reviewCyclePct move INTO the pure seam (pool-voice.ts) and the
//     services re-export the same names — the digest's math and the desk's
//     band agree BY CONSTRUCTION. The old bodies are GONE from the
//     services (a copy would be two arithmetics wearing one name).
//   - THE SCOPE HONESTY, DESK-SIDE: the band speaks the rows its session
//     can see — for the org-scope session that IS the digest's pool; a
//     narrower session speaks its own truth (v2.284.0's law, desk-side).
//     The band aggregates the UNFILTERED pool: the filters narrow the
//     list, never the pool's own truth.
//   - THE CLOCK LAWS, SHARED: overdue = OPEN + a named day that ended
//     BEFORE now (STRICT boundary — due this instant is not overdue; an
//     unnamed day never is); unclosedWindows = ACTIVE + a window that ends
//     before now (the report's own boundary, verbatim).
//   - NO FALLTHROUGH RENAMING: a status word the vocabulary does not know
//     buckets AS ITSELF, appended after the known rows in first-seen
//     order — the band exposes what it cannot name, never renames it.
//   - NO WORD WEARS TWO COLOURS ACROSS THE APP: the digest preview's
//     borrowed families move to the pure seam (POOL_STATUS_CHIP); the
//     desk's filter chips ALIGN (OPEN was sky on the desk while the digest
//     wore amber — the one face where the word kept a second colour) and
//     the table pill joins (OPEN = waiting = amber in toneForStatus).
//   - THE PURITY LAW: pool-voice imports NOTHING — the client bundle may
//     carry it, the server may re-export it.
//   - BOTH NETS, EVERY ROUND: the moved arithmetic is exactly the math a
//     byte-pin alone cannot catch; the moved homes are exactly the seams
//     a runtime-pin alone cannot locate.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
// The services keep their exported names — the re-export seam every
// existing caller (and every ancestor pin) keeps using.
import { goalAttainmentPct, GOAL_STATUSES } from '@/lib/hr/goal-service';
import { reviewCyclePct } from '@/lib/hr/performance-service';
import {
  CYCLE_STATUSES,
  REVIEW_STATUSES,
  poolBandFromCycles,
  poolBandFromGoals,
  poolPctVoice,
  poolStatusChip,
} from '@/lib/hr/pool-voice';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const poolSrc = read('src/lib/hr/pool-voice.ts');
const goalSrc = read('src/lib/hr/goal-service.ts');
const perfSrc = read('src/lib/hr/performance-service.ts');
const svcSrc = read('src/lib/hr/report-schedule-service.ts');
const pageSrc = read('src/app/(shell)/hr/performance/page.tsx');
const uiSrc = read('src/components/hr/self-service-ui.tsx');

const NOW = new Date('2026-10-31T12:00:00.000Z');

// ── the moved arithmetic (RUNTIME pins — the truth tables live at the
//    arithmetic's NEW home; the services' re-exports are pinned below) ──

describe('goalAttainmentPct — the ONE percentage, at its new home', () => {
  it('a percentage over nothing is a guess — null, never zero', () => {
    expect(goalAttainmentPct(0, 0)).toBeNull();
    expect(goalAttainmentPct(0, 42)).toBeNull();
  });
  it('a NEGATIVE target is data corruption, not a denominator', () => {
    expect(goalAttainmentPct(-5, 0)).toBeNull();
    expect(goalAttainmentPct(-5, 100)).toBeNull();
  });
  it('the arithmetic and the r1 door', () => {
    expect(goalAttainmentPct(100, 50)).toBe(50);
    expect(goalAttainmentPct(100, 100)).toBe(100);
    expect(goalAttainmentPct(3, 1)).toBe(33.3);
    expect(goalAttainmentPct(200, 150)).toBe(75);
  });
  it('the same fn the services re-export (one body, two seams)', () => {
    expect(GOAL_STATUSES).toEqual(['OPEN', 'ACHIEVED', 'MISSED', 'CLOSED']);
    expect(reviewCyclePct(1, 0)).toBeNull();
    expect(reviewCyclePct(2, -3)).toBeNull();
    expect(reviewCyclePct(1, 3)).toBe(33.3);
    expect(reviewCyclePct(5, 5)).toBe(100);
    expect(CYCLE_STATUSES).toEqual(['DRAFT', 'ACTIVE', 'CLOSED']);
    expect(REVIEW_STATUSES).toEqual(['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'CALIBRATED']);
  });
});

describe('poolPctVoice — the ONE pct face', () => {
  it('the honest absence speaks an em dash', () => {
    expect(poolPctVoice(null)).toBe('—');
    expect(poolPctVoice(undefined)).toBe('—');
  });
  it('a percentage speaks one decimal, r1', () => {
    expect(poolPctVoice(50)).toBe('50%');
    expect(poolPctVoice(42.86)).toBe('42.9%');
    expect(poolPctVoice(0)).toBe('0%');
  });
});

// ── the goal band ────────────────────────────────────────────────────────

describe('poolBandFromGoals — the digest headline, desk-side', () => {
  it('an empty pool bands as the honest absence the desk already speaks (null — the "No goals yet" line owns an empty board)', () => {
    expect(poolBandFromGoals([], NOW).tracked).toBe(0);
  });
  it('the vocabulary marches its own order; every known word speaks even at zero', () => {
    const band = poolBandFromGoals(
      [
        { status: 'ACHIEVED', targetValue: 10, currentValue: 10 },
        { status: 'OPEN', targetValue: 10, currentValue: 2 },
      ],
      NOW,
    );
    expect(band.rows.map((r) => r.status)).toEqual(['OPEN', 'ACHIEVED', 'MISSED', 'CLOSED']);
    expect(band.rows.map((r) => r.count)).toEqual([1, 1, 0, 0]);
    expect(band.tracked).toBe(2);
  });
  it('no fallthrough renaming — the stray word buckets AS ITSELF, appended first-seen', () => {
    const band = poolBandFromGoals(
      [
        { status: 'OPEN', targetValue: 1, currentValue: 0 },
        { status: 'WEIRD', targetValue: 1, currentValue: 0 },
        { status: 'ARCHIVED', targetValue: 1, currentValue: 0 },
        { status: 'WEIRD', targetValue: 1, currentValue: 0 },
      ],
      NOW,
    );
    expect(band.rows.slice(4)).toEqual([
      { status: 'WEIRD', count: 2 },
      { status: 'ARCHIVED', count: 1 },
    ]);
    expect(band.tracked).toBe(4);
  });
  it('the sums r1-round exactly as the digest rounds its buckets', () => {
    const band = poolBandFromGoals(
      [
        { status: 'OPEN', targetValue: '10.05', currentValue: '10.04' },
        { status: 'OPEN', targetValue: '10.04', currentValue: '10.05' },
      ],
      NOW,
    );
    expect(band.targetSum).toBe(20.1);
    expect(band.currentSum).toBe(20.1);
  });
  it('the attainment answers from the r1 sums through the ONE arithmetic', () => {
    const band = poolBandFromGoals([{ status: 'OPEN', targetValue: 3, currentValue: 1 }], NOW);
    expect(band.attainmentPct).toBe(33.3);
  });
  it('the honest — face: a zero target sum carries null attainment', () => {
    const band = poolBandFromGoals([{ status: 'OPEN', targetValue: 0, currentValue: 5 }], NOW);
    expect(band.attainmentPct).toBeNull();
  });
  it('the clock law: overdue = OPEN + a day that ended BEFORE now — STRICT boundary', () => {
    const band = poolBandFromGoals(
      [
        { status: 'OPEN', targetValue: 1, currentValue: 0, dueDate: '2026-10-31T11:59:59.999Z' },
        { status: 'OPEN', targetValue: 1, currentValue: 0, dueDate: '2026-10-31T12:00:00.000Z' },
        { status: 'OPEN', targetValue: 1, currentValue: 0, dueDate: '2026-10-31T12:00:00.001Z' },
        { status: 'OPEN', targetValue: 1, currentValue: 0, dueDate: null },
        { status: 'ACHIEVED', targetValue: 1, currentValue: 1, dueDate: '2020-01-01T00:00:00.000Z' },
        { status: 'MISSED', targetValue: 1, currentValue: 0, dueDate: '2020-01-01T00:00:00.000Z' },
      ],
      NOW,
    );
    expect(band.overdue).toBe(1);
  });
  it('the band speaks the rows the session can see (the scope honesty, desk-side)', () => {
    const rows = [
      { status: 'OPEN', targetValue: 1, currentValue: 0 },
      { status: 'OPEN', targetValue: 1, currentValue: 0 },
    ];
    const band = poolBandFromGoals(rows, NOW);
    expect(band.tracked).toBe(rows.length);
  });
});

// ── the cycles/reviews band ──────────────────────────────────────────────

describe('poolBandFromCycles — the counts-only band', () => {
  it('the cycle rows march the cycle vocabulary; the review rows the review vocabulary', () => {
    const band = poolBandFromCycles(
      [
        { status: 'ACTIVE', periodEnd: '2027-01-01T00:00:00.000Z' },
        { status: 'CLOSED', periodEnd: '2026-01-01T00:00:00.000Z' },
      ],
      [
        { status: 'SUBMITTED' },
        { status: 'CALIBRATED' },
        { status: 'DRAFT' },
      ],
      NOW,
    );
    expect(band.cycleRows.map((r) => r.status)).toEqual(['DRAFT', 'ACTIVE', 'CLOSED']);
    expect(band.cycleRows.map((r) => r.count)).toEqual([0, 1, 1]);
    expect(band.reviewRows.map((r) => r.status)).toEqual(['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'CALIBRATED']);
    expect(band.reviewRows.map((r) => r.count)).toEqual([1, 1, 0, 1]);
    expect(band.trackedCycles).toBe(2);
    expect(band.trackedReviews).toBe(3);
  });
  it("the clock's own count, verbatim law: ACTIVE + periodEnd < now, STRICT — a window that ends this instant is not yet over", () => {
    const band = poolBandFromCycles(
      [
        { status: 'ACTIVE', periodEnd: '2026-10-31T11:59:59.999Z' },
        { status: 'ACTIVE', periodEnd: '2026-10-31T12:00:00.000Z' },
        { status: 'CLOSED', periodEnd: '2020-01-01T00:00:00.000Z' },
        { status: 'DRAFT', periodEnd: '2020-01-01T00:00:00.000Z' },
      ],
      [],
      NOW,
    );
    expect(band.unclosedWindows).toBe(1);
  });
  it('a stray review word buckets AS ITSELF — counts only, ratings never enter', () => {
    const band = poolBandFromCycles([], [{ status: 'WEIRD' }, { status: 'WEIRD' }], NOW);
    expect(band.reviewRows.slice(4)).toEqual([{ status: 'WEIRD', count: 2 }]);
  });
});

// ── the colour map ───────────────────────────────────────────────────────

describe('POOL_STATUS_CHIP — the one colour law', () => {
  it('the known lifecycle words dress; an unknown word stays plain (null)', () => {
    expect(poolStatusChip('OPEN')).toMatch(/amber/);
    expect(poolStatusChip('CALIBRATED')).toMatch(/emerald/);
    expect(poolStatusChip('MISSED')).toMatch(/rose/);
    expect(poolStatusChip('WEIRD')).toBeNull();
  });
  it('nine words, five families — the borrowed grammar', () => {
    const block = poolSrc.slice(
      poolSrc.indexOf('export const POOL_STATUS_CHIP'),
      poolSrc.indexOf('export function poolStatusChip'),
    );
    const classes = [...block.matchAll(/'((?:bg|text|border)-[^']+)'/g)].map((m) => m[1]);
    expect(classes.length).toBe(9);
    expect(new Set(classes).size).toBe(5);
  });
});

// ── the byte net: the moves, the re-exports, the faces ──────────────────

describe('the move — one body, many seams (BYTE net)', () => {
  it('the pure seam imports nothing (the client-bundle law)', () => {
    expect(poolSrc).not.toMatch(/^import /m);
    expect(poolSrc).not.toMatch(/from '/);
    expect(poolSrc).not.toMatch(/require\(/);
  });
  it('the percentage bodies live ONLY in the pool voice', () => {
    expect(poolSrc).toContain('return target > 0 ? r1((current / target) * 100) : null;');
    expect(poolSrc).toContain('if (whole <= 0) return null;');
    expect(poolSrc).not.toContain('export function goalAttainmentPct(target: number, current: number): number | null {\n  if');
    // the old homes: the name rides a re-export, the body is GONE
    expect(goalSrc).toContain("export { goalAttainmentPct } from './pool-voice';");
    expect(goalSrc).toContain("import { goalAttainmentPct } from './pool-voice';");
    expect(goalSrc).not.toContain('return target > 0 ? goalR1((current / target) * 100) : null;');
    expect(perfSrc).toContain("export { CYCLE_STATUSES, REVIEW_STATUSES, reviewCyclePct } from './pool-voice';");
    expect(perfSrc).not.toContain('return Math.round((part / whole) * 1000) / 10;');
  });
  it('the vocabularies live ONLY in the pool voice', () => {
    expect(poolSrc).toContain("export const GOAL_STATUSES = ['OPEN', 'ACHIEVED', 'MISSED', 'CLOSED'] as const;");
    expect(poolSrc).toContain("export const REVIEW_STATUSES = ['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'CALIBRATED'] as const;");
    expect(poolSrc).toContain("export const CYCLE_STATUSES = ['DRAFT', 'ACTIVE', 'CLOSED'] as const;");
    expect(goalSrc).not.toContain("const GOAL_STATUSES = ['OPEN'");
    expect(perfSrc).not.toContain("const REVIEW_STATUSES = ['DRAFT'");
  });
  it('both digest cases say percentages through the ONE voice', () => {
    expect(svcSrc).toContain("import { poolPctVoice } from './pool-voice';");
    expect(svcSrc).toContain('poolPctVoice(r.attainmentPct)');
    expect(svcSrc).toContain('poolPctVoice(s.sharePct)');
    expect(svcSrc).toContain('poolPctVoice(s.attainmentPct)');
    expect(svcSrc).not.toContain('pctOrDash');
  });
  it('the schedules desk aliases the map (the ancestor seam intact)', () => {
    const tabSrc = read('src/components/hr/report-schedules-tab.tsx');
    expect(tabSrc).toContain('const DIGEST_STATUS_CHIP: Record<string, string> = POOL_STATUS_CHIP;');
  });
});

describe('the bands on the desk (BYTE net)', () => {
  it('the page imports the pool voice; the local vocabulary duplicates are GONE', () => {
    expect(pageSrc).toContain("} from '@/lib/hr/pool-voice';");
    expect(pageSrc).toContain("import type { PoolStatusCount } from '@/lib/hr/pool-voice';");
    expect(pageSrc).not.toContain("const GOAL_STATUSES = ['OPEN', 'ACHIEVED', 'MISSED', 'CLOSED'] as const;");
    expect(pageSrc).not.toContain("const REVIEW_STATUSES = ['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'CALIBRATED'] as const;");
  });
  it('the goal band rides the unfiltered pool; the clock resets with the pool', () => {
    expect(pageSrc).toContain('poolBandFromGoals(goals, new Date())');
    expect(pageSrc).toContain('poolBandFromCycles(cycles, reviews, new Date())');
  });
  it('both bands render over a non-empty pool only (the honest absence keeps its own line)', () => {
    expect(pageSrc).toContain('data-testid="goal-pool-band"');
    expect(pageSrc).toContain('data-testid="cycle-pool-band"');
    expect(pageSrc).toContain('goals && goals.length > 0 ? poolBandFromGoals(goals, new Date()) : null');
  });
  it('the goal band speaks the digest headline\u2019s own labels + the scope note', () => {
    expect(pageSrc).toContain('<PoolStat label="Tracked goals"');
    expect(pageSrc).toContain('<PoolStat label="Attainment" value={poolPctVoice(goalPoolBand.attainmentPct)} />');
    expect(pageSrc).toContain('The same aggregate the goal-attainment digest emails');
  });
  it('the cycles band speaks counts only — tracked cycles, unclosed windows, tracked reviews', () => {
    expect(pageSrc).toContain('<PoolStat label="Tracked cycles" value={String(cyclePoolBand.trackedCycles)} />');
    expect(pageSrc).toContain('label="Unclosed windows"');
    expect(pageSrc).toContain('<PoolStat label="Tracked reviews" value={String(cyclePoolBand.trackedReviews)} />');
    expect(pageSrc).toContain('The same counts the review-cycles digest emails');
  });
  it('the unknown word speaks itself in plain text — the no-fallthrough face', () => {
    expect(pageSrc).toContain('const chip = poolStatusChip(s.status);');
    expect(pageSrc).toContain('{s.status} {s.count}');
  });
  it('the desk\u2019s filter chips ALIGN to the one colour law — OPEN is amber, the old sky is gone', () => {
    expect(pageSrc).toMatch(/GOAL_CHIP_ACTIVE[^}]*OPEN: 'bg-amber-100/s);
    expect(pageSrc).not.toContain("OPEN: 'bg-sky-100");
  });
  it('the table pill joins the law — OPEN is waiting, waiting wears amber', () => {
    expect(uiSrc).toMatch(/case 'OPEN':[\s\S]{0,600}return 'warn';/);
    expect(uiSrc).toMatch(/return 'warn';[\s\S]{0,80}case 'PENDING':/);
  });
});
