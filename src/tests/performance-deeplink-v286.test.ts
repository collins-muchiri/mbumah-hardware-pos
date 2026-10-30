// v2.286.0 — the word names its pool.
//
//   - THE SYMMETRIC FACE: v2.285.0 taught the GOALS tab to answer ?status=.
//     v2.286.0 teaches the REVIEWS tab the same word. The two vocabularies
//     are disjoint (OPEN/ACHIEVED/MISSED/CLOSED vs DRAFT/SUBMITTED/
//     ACKNOWLEDGED/CALIBRATED), so the word itself names its pool: a bare
//     ?status=submitted routes to the reviews tab; a bare ?status=missed
//     still routes to the goals tab (the incumbent law, preserved).
//   - THE FACE PIN: an explicit ?tab= pins the face — the word filters
//     within it only when it belongs to that face's vocabulary. The bells
//     always carry tab= (both overrides do), so the walks land filtered;
//     a human-typed mismatch (?tab=reviews&status=OPEN) lands on the face
//     they named, never dragged elsewhere by a word that belongs to
//     another pool.
//   - THE BELL LANDS WHERE THE MASS SITS: the digest's OWN by-status table
//     names the dominant status and the walk carries it
//     (?tab=reviews&status=<dominant>) — read from the same rows the
//     reader just read, never computed from a second pool the document
//     didn't show. Ties break to the first row in table order (both report
//     builders march their statuses in vocabulary order). An empty pool,
//     an all-zero pool, or a drifted table walks the plain face — the bell
//     never guesses.
//   - THE LIFTABLE CHIP, ON BOTH FACES: the reviews face gains the amber
//     deep-link chip the goals face has spoken since v2.285; the review
//     status chips retire the param on a hand; the generic clear retires
//     both params; and the cross-link that IMPOSES a cycle filter now
//     speaks its own ?cycleId= in the URL (setUrlParam — the mirror of
//     the drop) so a reload re-lands exactly what the walk landed.
//   - THE BEACON: a filter that lives on an unvisited tab wears the amber
//     dot on the tab trigger — the deep-link family's quietest member.
//
// THE RUNTIME-PIN LAW (the fourth net): the vocabulary map and the
// dominant-status arithmetic are real objects — asserted by value, not by
// bytes, wherever the truth is math.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  REPORT_KEY_TO_URL,
  DEEP_LINK_STATUS_VOCABULARY,
  digestDominantStatus,
} from '@/lib/hr/report-schedule-service';
import { REVIEW_STATUSES } from '@/lib/hr/performance-service';
import { GOAL_STATUSES } from '@/lib/hr/goal-service';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const svcSrc = read('src/lib/hr/report-schedule-service.ts');
const deskSrc = read('src/app/(shell)/hr/performance/page.tsx');

// ── the vocabularies (RUNTIME pins — the fourth net) ──

describe('DEEP_LINK_STATUS_VOCABULARY — the word names its pool', () => {
  it('the review pool speaks the review vocabulary — the lib\u2019s own words, not a copy', () => {
    expect(DEEP_LINK_STATUS_VOCABULARY['review-cycles']).toBe(REVIEW_STATUSES);
    const review = DEEP_LINK_STATUS_VOCABULARY['review-cycles'] ?? [];
    expect([...review]).toEqual([
      'DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'CALIBRATED',
    ]);
  });

  it('the goal pool speaks the goal vocabulary (the v2.285 incumbent intact)', () => {
    expect(DEEP_LINK_STATUS_VOCABULARY['goal-attainment']).toBe(GOAL_STATUSES);
  });

  it('the vocabularies are DISJOINT — a bare word can never argue about its pool', () => {
    const review = DEEP_LINK_STATUS_VOCABULARY['review-cycles'] ?? [];
    const goal = DEEP_LINK_STATUS_VOCABULARY['goal-attainment'] ?? [];
    for (const w of review) expect(goal).not.toContain(w);
    for (const w of goal) expect(review).not.toContain(w);
  });

  it('the other seven reports speak no status vocabulary (the desk has no lens there)', () => {
    expect(DEEP_LINK_STATUS_VOCABULARY['headcount']).toBeUndefined();
    expect(DEEP_LINK_STATUS_VOCABULARY['employment-cost']).toBeUndefined();
    expect(DEEP_LINK_STATUS_VOCABULARY['turnover']).toBeUndefined();
  });

  it('the overrides stand (the v2.283/v2.285 landings intact)', () => {
    expect(REPORT_KEY_TO_URL['review-cycles']).toBe('/hr/performance?tab=reviews');
    expect(REPORT_KEY_TO_URL['goal-attainment']).toBe('/hr/performance?tab=goals');
  });
});

// ── the dominant status (RUNTIME pins — the arithmetic is the truth) ──

describe('digestDominantStatus — the bell lands where the mass sits', () => {
  const REVIEW_VOCAB = DEEP_LINK_STATUS_VOCABULARY['review-cycles'] ?? [];

  it('the largest count wins', () => {
    const digest = { table: { caption: 'c', columns: ['Status', 'Reviews'], rows: [['DRAFT', '1'], ['SUBMITTED', '4'], ['ACKNOWLEDGED', '2'], ['CALIBRATED', '0']] } };
    expect(digestDominantStatus(digest, REVIEW_VOCAB)).toBe('SUBMITTED');
  });

  it('a tie breaks to the FIRST row in table order (deterministic, never a coin)', () => {
    const digest = { table: { caption: 'c', columns: ['Status', 'Reviews'], rows: [['ACKNOWLEDGED', '3'], ['SUBMITTED', '3']] } };
    expect(digestDominantStatus(digest, REVIEW_VOCAB)).toBe('ACKNOWLEDGED');
  });

  it('number cells count too (the table\u2019s cells are string | number)', () => {
    const digest = { table: { caption: 'c', columns: ['Status', 'Reviews'], rows: [['DRAFT', 0], ['SUBMITTED', 5]] } };
    expect(digestDominantStatus(digest, REVIEW_VOCAB)).toBe('SUBMITTED');
  });

  it('an all-zero pool walks the plain face (null — the bell never guesses)', () => {
    const digest = { table: { caption: 'c', columns: ['Status', 'Reviews'], rows: [['DRAFT', '0'], ['SUBMITTED', '0']] } };
    expect(digestDominantStatus(digest, REVIEW_VOCAB)).toBeNull();
  });

  it('a word outside the vocabulary is skipped (a drifted table cannot lie the walk)', () => {
    const digest = { table: { caption: 'c', columns: ['Status', 'Reviews'], rows: [['BANANA', '9'], ['SUBMITTED', '2']] } };
    expect(digestDominantStatus(digest, REVIEW_VOCAB)).toBe('SUBMITTED');
  });

  it('an unparseable count is skipped, never NaN-propagated', () => {
    const digest = { table: { caption: 'c', columns: ['Status', 'Reviews'], rows: [['DRAFT', 'many'], ['SUBMITTED', '2']] } };
    expect(digestDominantStatus(digest, REVIEW_VOCAB)).toBe('SUBMITTED');
  });

  it('a negative count is corruption, not a mass', () => {
    const digest = { table: { caption: 'c', columns: ['Status', 'Reviews'], rows: [['DRAFT', '-4'], ['SUBMITTED', '1']] } };
    expect(digestDominantStatus(digest, REVIEW_VOCAB)).toBe('SUBMITTED');
  });

  it('no digest, no table, no rows — all walk the plain face', () => {
    expect(digestDominantStatus(null, REVIEW_VOCAB)).toBeNull();
    expect(digestDominantStatus(undefined, REVIEW_VOCAB)).toBeNull();
    expect(digestDominantStatus({ table: undefined }, REVIEW_VOCAB)).toBeNull();
    expect(digestDominantStatus({ table: { caption: 'c', columns: [], rows: [] } }, REVIEW_VOCAB)).toBeNull();
  });

  it('an empty vocabulary can never name a word', () => {
    const digest = { table: { caption: 'c', columns: ['Status', 'Reviews'], rows: [['DRAFT', '4']] } };
    expect(digestDominantStatus(digest, [])).toBeNull();
  });
});

// ── the bell's walk (byte pins on the ONE construction site) ──

describe('the bell\u2019s walk carries the mass (the builder)', () => {
  it('the suffix is built from the digest\u2019s own dominant, into the override', () => {
    expect(svcSrc).toContain('const dominant = digestDominantStatus(');
    expect(svcSrc).toContain('DEEP_LINK_STATUS_VOCABULARY[params.reportKey as HrScheduleReportKey] ?? []');
    expect(svcSrc).toContain('`${override}${dominant ? `&status=${dominant}` : \'\'}`');
  });

  it('the storeId still rides the suffixed override (the ?-check reads the final URL)', () => {
    const at = svcSrc.indexOf('const overrideWithStatus');
    const block = svcSrc.slice(at, at + 400);
    expect(block).toContain("overrideWithStatus?.includes('?') ? '&' : '?'");
    expect(block).toContain('`${overrideWithStatus}${storeIdQs}`');
  });

  it('the fallback path is untouched (the tab walk keeps its own storeId hand)', () => {
    expect(svcSrc).toContain("`/hr/reports?tab=${tab}${params.storeId ? `&storeId=${params.storeId}` : ''}`");
  });
});

// ── the desk reads the word (byte pins on the routing) ──

describe('the performance desk — the word routes itself', () => {
  it('the read is lenient about case (both faces share one read)', () => {
    expect(deskSrc).toContain("get('status')?.toUpperCase()");
  });

  it('both vocabularies are consulted at the read', () => {
    expect(deskSrc).toContain('(GOAL_STATUSES as readonly string[]).includes(status)');
    expect(deskSrc).toContain('(REVIEW_STATUSES as readonly string[]).includes(status)');
  });

  it('a bare review word lands the reader ON the reviews tab (an invisible filter is a lie)', () => {
    const at = deskSrc.indexOf('const t = window.setTimeout(() => {', deskSrc.indexOf("get('status')?.toUpperCase()"));
    const block = deskSrc.slice(at, at + 700);
    expect(block).toContain("setTab('reviews')");
    expect(block).toContain('setFilterStatus(status)');
  });

  it('the incumbent bare-word law stands: a goal word still lands the goals tab', () => {
    const at = deskSrc.indexOf("get('status')?.toUpperCase()");
    const block = deskSrc.slice(at, at + 400);
    expect(block).toContain("setTab('goals')");
    expect(block).toContain('setFilterGoalStatus(status)');
  });

  it('an explicit ?tab= pins the face (the word filters within it, never drags)', () => {
    const at = deskSrc.indexOf('const t = window.setTimeout(() => {', deskSrc.indexOf("get('status')?.toUpperCase()"));
    const block = deskSrc.slice(at, at + 700);
    expect(block).toContain("if (tabParam === 'goals') {");
    expect(block).toContain("if (tabParam === 'reviews') {");
    expect(block).toContain('if (tabParam) return;');
  });

  it('the read is deferred one tick, directive-free (the CI lesson pre-applied)', () => {
    expect(deskSrc).not.toContain('eslint-disable');
  });
});

// ── the liftable chip, on the reviews face ──

describe('the reviews face — the amber chip', () => {
  it('the lift lives (helper + body)', () => {
    expect(deskSrc).toContain('const clearDeepLinkedReviewStatus = () => {');
    const at = deskSrc.indexOf('const clearDeepLinkedReviewStatus = () => {');
    const body = deskSrc.slice(at, at + 200);
    expect(body).toContain("setFilterStatus('ALL')");
    expect(body).toContain("dropUrlParam('status')");
  });

  it('the chip renders only when a review status filter is active', () => {
    expect(deskSrc).toContain("filterStatus !== 'ALL' ? (");
    expect(deskSrc).toContain('data-testid="review-filter-status-chip"');
  });

  it('the chip wears amber — the same deep-link family both faces speak', () => {
    const at = deskSrc.indexOf('review-filter-status-chip');
    const chip = deskSrc.slice(at, at + 400);
    expect(chip).toContain('border-amber-200 bg-amber-50');
    expect(chip).toContain('dark:bg-amber-950/40');
    expect(chip).toContain('hover:bg-amber-100');
  });

  it('the chip names the word it lifts (aria-label + face)', () => {
    const at = deskSrc.indexOf('review-filter-status-chip');
    const chip = deskSrc.slice(at - 400, at + 600);
    expect(chip).toContain('aria-label={`Review status ${filterStatus.replace(/_/g, \' \').toLowerCase()} — clear filter`}');
    expect(chip).toContain('Review status {filterStatus.replace(/_/g, \' \').toLowerCase()}');
  });

  it('a hand on a review status chip retires the param (the link speaks once)', () => {
    expect(deskSrc).toContain("onClick={() => { dropUrlParam('status'); setFilterStatus(s); }}");
  });
});

// ── one honest clear, both directions ──

describe('setUrlParam — the mirror of the drop', () => {
  it('the helper exists (set + replaceState, guarded against no-op writes)', () => {
    expect(deskSrc).toContain('const setUrlParam = (param: string, value: string) => {');
    const at = deskSrc.indexOf('const setUrlParam = (param: string, value: string) => {');
    const body = deskSrc.slice(at, at + 300);
    expect(body).toContain("url.searchParams.get(param) !== value");
    expect(body).toContain('url.searchParams.set(param, value);');
    expect(body).toContain("window.history.replaceState(null, '', url.toString());");
  });

  it('the cross-link owns its deep link (speaks its cycleId, retires status)', () => {
    const at = deskSrc.indexOf('const viewCycleReviews = (cycleId: string) => {');
    const body = deskSrc.slice(at, at + 500);
    expect(body).toContain("setUrlParam('cycleId', cycleId);");
    expect(body).toContain("dropUrlParam('status');");
  });

  it('the generic review clear retires BOTH params (never a partial clear)', () => {
    const at = deskSrc.indexOf('const clearFilters = () => {');
    const body = deskSrc.slice(at, at + 520);
    expect(body).toContain("dropUrlParam('cycleId')");
    expect(body).toContain("dropUrlParam('status')");
  });

  it('the generic goal clear still retires ?status= (the v2.285 law intact)', () => {
    const at = deskSrc.indexOf('const clearGoalFilters = () => {');
    const body = deskSrc.slice(at, at + 300);
    expect(body).toContain("dropUrlParam('status')");
  });
});

// ── the beacon (a filter on an unvisited tab is never invisible) ──

describe('the tab beacons — the deep-link family\u2019s quietest member', () => {
  it('the reviews trigger wears the amber dot while a filter waits on that face', () => {
    const at = deskSrc.indexOf('data-testid="reviews-tab-beacon"');
    expect(at).toBeGreaterThan(-1);
    const block = deskSrc.slice(at - 200, at + 200);
    // v2.286.0 E2E amendment: the beacon speaks for ANY filter waiting on
    // the face — a cycle deep link lands its filter invisibly too.
    expect(block).toContain("tab !== 'reviews' && (filterStatus !== 'ALL' || filterCycleId !== 'ALL')");
    expect(block).toContain('bg-amber-500 dark:bg-amber-400');
    expect(block).toContain('aria-hidden');
  });

  it('the goals trigger wears the same dot for the goal lens', () => {
    const at = deskSrc.indexOf('data-testid="goals-tab-beacon"');
    expect(at).toBeGreaterThan(-1);
    const block = deskSrc.slice(at - 200, at + 200);
    expect(block).toContain("tab !== 'goals' && filterGoalStatus !== 'ALL'");
  });
});

// ── the honest count (the count line speaks when its numbers move) ──

describe('the count lines answer politely', () => {
  it('both count lines are live regions (the number moves, the ear is told)', () => {
    expect(deskSrc).toContain('data-testid="review-filter-count" aria-live="polite"');
    expect(deskSrc).toContain('data-testid="goal-filter-count" aria-live="polite"');
  });
});
