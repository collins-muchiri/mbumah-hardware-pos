// v2.283.0 — the cycles join the digest.
//
//   - THE SECOND PARITY FACE: v2.282.0 taught the goal pool to speak; the
//     handover named the review pool as the next gap. This round the
//     cycles/reviews aggregate joins the governed digest seam: scheduleable,
//     previewable, emailable — the ONE seam every surface mirrors.
//   - COUNTS ONLY: the spec's mask is stricter here than for goals. Ratings
//     and narratives never ride a list payload (spec rule 7); a digest is an
//     EMAIL, a fortiori no rating sum, no average, no derivation a score
//     could be reverse-engineered from. The aggregate speaks how many,
//     never how good.
//   - THE GOVERNED SCOPE: listCycles' scope (every non-deleted cycle of the
//     organization, the non-deleted reviews of those cycles) but NOT its
//     take:60 — that is a console page size, not a scope. The digest is the
//     standing pool.
//   - NO FALLTHROUGH RENAMING: a status word the vocabulary does not know is
//     bucketed AS ITSELF — tracked > the rows' sum is how a stray shows
//     itself. The document exposes what it cannot name, never renames it.
//   - THE CLOCK'S OWN COUNT: `unclosedWindows` counts ACTIVE cycles whose
//     periodEnd has passed — the pool saying "these windows are over and
//     nobody closed me". The boundary is STRICT: a window that ends this
//     instant is not yet over.
//   - THE HONEST SHARE: `reviewCyclePct` denies when the pool is empty or
//     negative (a percentage over nothing is a guess) — the SAME denior law
//     goalAttainmentPct speaks. Exported for the runtime pins (the fourth
//     net): the truth table is exactly the math a byte-pin cannot catch.
//   - THE DEEP LINK: the review pool's interactive home is the PERFORMANCE
//     desk, not the reports desk — REPORT_KEY_TO_URL overrides first, and
//     the desk now reads ?tab= so the bell action walks into the reviews
//     tab. Only a KNOWN tab id lands; an unknown word falls back to cycles.
//   - THE PREVIEW'S FACE (mandatory ④): the strip wears the report's own
//     glyph; the label column chips KNOWN lifecycle words only; numeric
//     columns right-align under their own headers. Borrowed colour
//     families — no word wears two colours across the app.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { reviewCyclePct, CYCLE_STATUSES } from '@/lib/hr/performance-service';
import {
  HR_SCHEDULE_REPORTS,
  REPORT_LABELS,
  REPORT_KEY_TO_TAB,
  REPORT_KEY_TO_URL,
} from '@/lib/hr/report-schedule-service';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const perfSrc = read('src/lib/hr/performance-service.ts');
const svcSrc = read('src/lib/hr/report-schedule-service.ts');
const tabSrc = read('src/components/hr/report-schedules-tab.tsx');
const perfPageSrc = read('src/app/(shell)/hr/performance/page.tsx');

// ── the share's truth table (RUNTIME pins — the fourth net) ──

describe('reviewCyclePct — the ONE share', () => {
  it('a percentage over an empty pool is a guess — null, never zero', () => {
    expect(reviewCyclePct(0, 0)).toBeNull();
    expect(reviewCyclePct(3, 0)).toBeNull();
  });

  it('a NEGATIVE pool is data corruption, not a denominator', () => {
    expect(reviewCyclePct(2, -4)).toBeNull();
    expect(reviewCyclePct(-2, 0)).toBeNull();
  });

  it('the arithmetic and the r1 door', () => {
    expect(reviewCyclePct(1, 4)).toBe(25);
    expect(reviewCyclePct(2, 3)).toBe(66.7);
    expect(reviewCyclePct(3, 3)).toBe(100);
    expect(reviewCyclePct(1, 7)).toBe(14.3);
    expect(reviewCyclePct(0, 5)).toBe(0);
  });

  it('the share can never exceed 100 — a subset of the pool', () => {
    expect(reviewCyclePct(5, 5)).toBe(100);
    expect(reviewCyclePct(9, 10)).toBe(90);
  });
});

// ── the vocabularies (RUNTIME pins) ──

describe('the two vocabularies — the rows\u2019 own words', () => {
  it('the cycle lifecycle in the model\u2019s own order', () => {
    expect(CYCLE_STATUSES).toEqual(['DRAFT', 'ACTIVE', 'CLOSED']);
  });

  it('the report\u2019s rows march REVIEW_STATUSES (the map, byte-pinned)', () => {
    expect(perfSrc).toContain('const rows: ReviewCycleRow[] = REVIEW_STATUSES.map((status) => ({');
  });
});

// ── the aggregate (byte pins — the scope, the laws) ──

describe('reviewCycleReport — the governed aggregate', () => {
  it('the scope rides the organization — the same governed scope listCycles obeys', () => {
    expect(perfSrc).toContain('where: { deletedAt: null, organizationId: session.organizationId }');
    expect(perfSrc).toContain('where: { deletedAt: null, cycle: { deletedAt: null, organizationId: session.organizationId } }');
  });

  it('the standing pool, NOT the console page size', () => {
    const fn = perfSrc.slice(perfSrc.indexOf('export async function reviewCycleReport'));
    expect(fn).not.toContain('take: 60');
  });

  it('COUNTS ONLY — no rating ever enters the aggregate (spec rule 7, a fortiori)', () => {
    const fn = perfSrc.slice(
      perfSrc.indexOf('export async function reviewCycleReport'),
      perfSrc.indexOf('export async function createCycle'),
    );
    expect(fn).not.toMatch(/overallRating|strengths|improvements|_avg|average/i);
    expect(fn).toContain('select: { status: true }');
  });

  it('no fallthrough renaming — the stray word buckets AS ITSELF', () => {
    const fn = perfSrc.slice(perfSrc.indexOf('export async function reviewCycleReport'));
    expect(fn).toContain('reviewBuckets.set(r.status, (reviewBuckets.get(r.status) ?? 0) + 1);');
    expect(fn).not.toContain("? r.status : 'DRAFT'");
  });

  it('the clock\u2019s own count: ACTIVE + periodEnd < now, STRICT boundary', () => {
    expect(perfSrc).toContain("if (c.status === 'ACTIVE' && c.periodEnd.getTime() < now.getTime()) unclosedWindows += 1;");
  });

  it('an empty pool digests as honest zeros — the fn never returns null', () => {
    expect(perfSrc).toContain('trackedReviews: reviews.length,');
    const fn = perfSrc.slice(perfSrc.indexOf('export async function reviewCycleReport'));
    expect(fn).not.toContain('return null;');
  });
});

// ── the digest case (byte pins — the seam) ──

describe('the review-cycles digest case — the ONE seam', () => {
  it('the key joins the schedule reports and wears its label', () => {
    expect(HR_SCHEDULE_REPORTS).toContain('review-cycles');
    expect(REPORT_LABELS['review-cycles']).toBe('Review cycles');
    expect(svcSrc).toContain("'review-cycles': 'Review cycles',");
  });

  it('the case aggregates through the performance service\u2019s own report fn', () => {
    expect(svcSrc).toContain('const r = await reviewCycleReport(session, now);');
    // v2.286.0 re-anchor: the import gains REVIEW_STATUSES (the deep-link
    // vocabulary map reads the lib's own words, never a copy).
    expect(svcSrc).toContain("import { REVIEW_STATUSES, reviewCycleReport } from './performance-service';");
  });

  it('the headline speaks the pool\u2019s counts + the clock, in order', () => {
    expect(svcSrc).toContain("{ label: 'Tracked cycles', value: String(r.trackedCycles) },");
    expect(svcSrc).toContain("{ label: 'Active cycles', value: String(r.activeCycles) },");
    expect(svcSrc).toContain("{ label: 'Tracked reviews', value: String(r.trackedReviews) },");
    expect(svcSrc).toContain("{ label: 'Awaiting acknowledgement', value: String(r.awaitingAcknowledgement) },");
    expect(svcSrc).toContain("{ label: 'Calibrated', value: String(r.calibrated) },");
    expect(svcSrc).toContain("{ label: 'Unclosed windows', value: String(r.unclosedWindows) },");
  });

  it('the table speaks the review pool by status with the honest share', () => {
    expect(svcSrc).toContain("caption: 'Review pool by status',");
    expect(svcSrc).toContain("columns: ['Status', 'Reviews', 'Share %'],");
    expect(svcSrc).toContain('rows: r.rows.map((s) => [s.status, String(s.reviews), pctOrDash(s.sharePct)]),');
  });

  it('the standing-pool period label (year-independent, the goal case\u2019s own words)', () => {
    expect((svcSrc.match(/periodLabel: 'All cycles — the standing pool',/g) ?? []).length).toBe(2);
  });
});

// ── the deep link (RUNTIME + byte pins — the desk, not the reports table) ──

describe('the review-cycles deep link — the performance desk', () => {
  it('the tab map stays total; the URL override wins for review-cycles', () => {
    expect(REPORT_KEY_TO_TAB['review-cycles']).toBe('reviews');
    expect(REPORT_KEY_TO_URL['review-cycles']).toBe('/hr/performance?tab=reviews');
    expect(REPORT_KEY_TO_URL['headcount']).toBeUndefined();
  });

  it('the builder consults the override FIRST and appends storeId only when present', () => {
    // v2.286.0 re-anchor: the override now gains the dominant-status suffix
    // (overrideWithStatus) before the storeId hand reads its '?' — the
    // consult order and the guarded append are the same law.
    expect(svcSrc).toContain('const override = REPORT_KEY_TO_URL[params.reportKey as HrScheduleReportKey];');
    expect(svcSrc).toContain("const storeIdQs = params.storeId ? `${overrideWithStatus?.includes('?') ? '&' : '?'}storeId=${params.storeId}` : '';");
    expect(svcSrc).toContain('? `${overrideWithStatus}${storeIdQs}`');
  });

  it('the performance desk reads ?tab= and only a KNOWN tab id lands (deferred one tick, directive-free)', () => {
    expect(perfPageSrc).toContain("const requested = new URLSearchParams(window.location.search).get('tab');");
    expect(perfPageSrc).toContain("if (requested !== 'cycles' && requested !== 'reviews' && requested !== 'goals') return;");
    expect(perfPageSrc).toContain('const t = window.setTimeout(() => setTab(requested), 0);');
    expect(perfPageSrc).not.toContain('eslint-disable'); // no directive to go stale in either eslint resolution
  });
});

// ── the card + the preview's face (byte pins — mandatory ④) ──

describe('the schedules card + the preview\u2019s face', () => {
  it('the select offers the review digest with its honest hint', () => {
    expect(tabSrc).toContain("{ value: 'review-cycles', label: 'Review cycles (all cycles)' },");
  });

  it('the review pool wears the reviewer\u2019s own clipboard glyph', () => {
    expect(tabSrc).toContain("'review-cycles': ClipboardCheck,");
  });

  it('the preview strip wears the report\u2019s own glyph', () => {
    expect(tabSrc).toContain('<ReportIcon reportKey={preview.schedule.reportKey} />');
  });

  it('the label column chips KNOWN lifecycle words only', () => {
    expect(tabSrc).toContain('const DIGEST_STATUS_CHIP: Record<string, string> = {');
    expect(tabSrc).toContain('{ci === 0 ? <DigestStatusCell word={cell} /> : cell}');
    expect(tabSrc).toContain('if (!chip) return <>{word}</>;');
  });

  it('no word wears two colours across the app — nine words, five borrowed families', () => {
    const block = tabSrc.slice(tabSrc.indexOf('const DIGEST_STATUS_CHIP'), tabSrc.indexOf('function DigestStatusCell'));
    const classes = [...block.matchAll(/'((?:bg|text|border)-[^']+)'/g)].map((m) => m[1]);
    expect(classes.length).toBe(9); // every lifecycle word dressed
    expect(new Set(classes).size).toBe(5); // amber/emerald/rose/slate/sky — borrowed, not invented
  });

  it('numeric columns right-align under their own headers', () => {
    expect(tabSrc).toContain("{preview.table.columns.map((c, ci) => (\n                          <th key={c} className={`px-3 py-1.5 font-medium ${ci > 0 ? 'text-right' : ''}`}>\n                            {c}\n                          </th>\n                        ))}");
    expect(tabSrc).toContain("ci === 0 ? 'font-medium' : 'tabular-nums text-right'");
  });
});
