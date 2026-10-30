// v2.285.0 — the goals answer their link.
//
//   - THE WALK THAT WAS NOWHERE: the goal-attainment digest's bell walked
//     /hr/reports?tab=goals — but the reports desk has NO 'goals' tab, so
//     the known-tab read fell through and the reader landed on headcount
//     silently. A bell that walks nowhere is a lying door. The override
//     map now speaks the goal pool's true home: /hr/performance?tab=goals.
//   - THE POOL'S OWN DEEP LINK: ?status= on the performance desk walks the
//     GOALS tab into a pre-filtered state — lenient about case (a
//     human-typed link is still a link), strict about vocabulary (only a
//     KNOWN goal status lands; an unknown word falls back). A valid status
//     lands the reader ON the goals tab — an invisible filter is a lie.
//   - THE LIFTABLE CHIP: an active goal-status filter — however it
//     arrived — wears the amber deep-link family (the same family the
//     cycle filter has spoken since v2.284); its × lifts BOTH the filter
//     and the ?status= param that asked for it.
//   - ONE HONEST CLEAR: the drop lives in ONE helper. The generic clears
//     (reviews + goals) retire their deep-link params with them, and a
//     hand on the cycle select or a status chip retires the param first —
//     the link speaks once; the reader's own pick owns the URL. A clear
//     that leaves its param behind is a partial clear: the next reload
//     would re-impose a filter nobody sees.
//   - THE HONEST ANSWER: a pressed house that empties the view names the
//     word it was asked for ("No goal wears missed under the current
//     filters.") — the PO lens-empty law, now on both desks.
//
// THE RUNTIME-PIN LAW (the fourth net): the deep-link maps are real
// objects — asserted by value, not by bytes, wherever the truth is math.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { REPORT_KEY_TO_URL, REPORT_KEY_TO_TAB } from '@/lib/hr/report-schedule-service';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const svcSrc = read('src/lib/hr/report-schedule-service.ts');
const deskSrc = read('src/app/(shell)/hr/performance/page.tsx');

// ── the bell's honest landing (RUNTIME pins — the fourth net) ──

describe('REPORT_KEY_TO_URL — the pools walk where they live', () => {
  it('goal-attainment overrides to the performance desk\u2019s goals tab', () => {
    expect(REPORT_KEY_TO_URL['goal-attainment']).toBe('/hr/performance?tab=goals');
  });

  it('the review-cycles override stands (the v2.283 law intact)', () => {
    expect(REPORT_KEY_TO_URL['review-cycles']).toBe('/hr/performance?tab=reviews');
  });

  it('the override is consulted BEFORE the tab fallback (the builder\u2019s order)', () => {
    const at = svcSrc.indexOf('const override = REPORT_KEY_TO_URL[');
    const fallback = svcSrc.indexOf('const tab = REPORT_KEY_TO_TAB[');
    expect(at).toBeGreaterThan(-1);
    expect(fallback).toBeGreaterThan(at);
  });

  it('the tab fallback still speaks goals (dead only while the override lives)', () => {
    expect(REPORT_KEY_TO_TAB['goal-attainment']).toBe('goals');
  });
});

// ── the goals tab's own deep link (byte pins) ──

describe('the performance desk — ?status= lands as visible, liftable state', () => {
  it('the read is lenient about case and strict about vocabulary', () => {
    expect(deskSrc).toContain("get('status')?.toUpperCase()");
    expect(deskSrc).toContain("(GOAL_STATUSES as readonly string[]).includes(status)");
  });

  it('a valid status lands the reader ON the goals tab (an invisible filter is a lie)', () => {
    const at = deskSrc.indexOf("get('status')?.toUpperCase()");
    const block = deskSrc.slice(at, at + 400);
    expect(block).toContain("setTab('goals')");
    expect(block).toContain('setFilterGoalStatus(status)');
  });

  it('the read is deferred one tick, directive-free (the CI lesson pre-applied)', () => {
    const at = deskSrc.indexOf("get('status')?.toUpperCase()");
    const block = deskSrc.slice(at, at + 400);
    expect(block).toContain('window.setTimeout');
    expect(deskSrc).not.toContain('eslint-disable');
  });

  it('the active status filter wears the liftable amber chip (however it arrived)', () => {
    expect(deskSrc).toContain('const clearDeepLinkedGoalStatus = () => {');
    expect(deskSrc).toContain("dropUrlParam('status');");
    expect(deskSrc).toContain('data-testid="goal-filter-status-chip"');
    expect(deskSrc).toContain("filterGoalStatus !== 'ALL' ? (");
  });

  it('the chip\u2019s × lifts BOTH the filter and the param', () => {
    const at = deskSrc.indexOf('const clearDeepLinkedGoalStatus = () => {');
    const body = deskSrc.slice(at, at + 200);
    expect(body).toContain("setFilterGoalStatus('ALL')");
    expect(body).toContain("dropUrlParam('status')");
  });

  it('the chip wears amber — the same deep-link family the cycle filter speaks', () => {
    const at = deskSrc.indexOf('goal-filter-status-chip');
    const chip = deskSrc.slice(at, at + 400);
    expect(chip).toContain('border-amber-200 bg-amber-50');
    expect(chip).toContain('dark:bg-amber-950/40');
    expect(chip).toContain('hover:bg-amber-100');
  });

  it('the chip names the word it lifts (aria-label + face)', () => {
    const at = deskSrc.indexOf('goal-filter-status-chip');
    const chip = deskSrc.slice(at - 400, at + 400);
    expect(chip).toContain('Goal status ${filterGoalStatus.replace(/_/g, \' \').toLowerCase()}');
    expect(chip).toContain('aria-label={`Goal status ${filterGoalStatus.replace(/_/g, \' \').toLowerCase()} — clear filter`}');
  });
});

// ── one honest clear (the URL stays truthful — every hand retires the param) ──

describe('dropUrlParam — one helper, every clear retires its param', () => {
  it('the helper is the single drop body (delete + replaceState, guarded)', () => {
    expect(deskSrc).toContain('const dropUrlParam = (param: string) => {');
    expect(deskSrc).toContain('if (url.searchParams.has(param)) {');
    expect(deskSrc).toContain('url.searchParams.delete(param);');
    expect(deskSrc).toContain('window.history.replaceState(null, \'\', url.toString());');
  });

  it('the generic review clear retires ?cycleId= (never a partial clear)', () => {
    const at = deskSrc.indexOf('const clearFilters = () => {');
    const body = deskSrc.slice(at, at + 300);
    expect(body).toContain("dropUrlParam('cycleId')");
  });

  it('the generic goal clear retires ?status= (never a partial clear)', () => {
    const at = deskSrc.indexOf('const clearGoalFilters = () => {');
    const body = deskSrc.slice(at, at + 300);
    expect(body).toContain("dropUrlParam('status')");
  });

  it('a hand on the cycle select retires the deep link\u2019s param (the link speaks once)', () => {
    expect(deskSrc).toContain("onValueChange={(v) => { dropUrlParam('cycleId'); setFilterCycleId(v); }}");
  });

  it('a hand on a status chip retires the deep link\u2019s param (the link speaks once)', () => {
    expect(deskSrc).toContain("onClick={() => { dropUrlParam('status'); setFilterGoalStatus(s); }}");
  });
});

// ── the honest answer (a pressed house that empties the view names the word) ──

describe('the lens-empty law on both desks', () => {
  it('the goals empty state names the status word it was asked for', () => {
    const at = deskSrc.indexOf('No goal wears ${filterGoalStatus');
    expect(at).toBeGreaterThan(-1);
    const block = deskSrc.slice(at - 200, at + 200);
    expect(block).toContain("filterGoalStatus !== 'ALL'");
    expect(block).toContain("'No goals match the current filters.'");
  });

  it('the reviews empty state names the status word it was asked for', () => {
    const at = deskSrc.indexOf('No review wears ${filterStatus');
    expect(at).toBeGreaterThan(-1);
    const block = deskSrc.slice(at - 200, at + 200);
    expect(block).toContain("filterStatus !== 'ALL'");
    expect(block).toContain("'No reviews match the current filters.'");
  });
});
