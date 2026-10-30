// v2.284.0 — the pool speaks its true scope.
//
//   - THE LIE: the review models carry no storeId — cycles and reviews are
//     organization-wide BY CONSTRUCTION. A branch-scoped review-cycles
//     schedule would compute the org pool (reviewCycleReport ignores the
//     branch) but wear the BRANCH'S NAME in the scope line — a lying
//     document. The goal pool never had this hole: employeeScopeWhere
//     narrows the goal aggregate to the session's store honestly.
//   - THE CREATE DOOR: validateScheduleInput rejects review-cycles +
//     storeId outright (INVALID_SCOPE, 422) — the narrowing is refused,
//     not silently corrected.
//   - THE BELT: the digest case forces scopeLabel 'All branches
//     (organization)' — if a branch-scoped row ever exists anyway (data
//     imported by hand, a future migration), the document STILL speaks its
//     true scope. Never a branch name over org-wide counts.
//   - THE WIRE: the dialog locks the branch pick to the organization when
//     an org-pool report is chosen (disabled select + forced 'all' + the
//     swapped hint), so the 422 is un-hittable from the UI.
//   - THE CARD: an org-pool schedule wears a slate "Org pool" chip so the
//     operator sees the digest speaks the organization before opening it.
//     Slate is the QUIET family (SKIPPED/CLOSED/DRAFT) — no colour in use
//     gains a second meaning.
//   - THE WALK CONTINUES: ?cycleId= on the performance desk pre-filters the
//     reviews tab (the ?tab= read's own deferred, directive-free shape —
//     the CI lesson pre-applied), and the active cycle filter wears a
//     VISIBLE, liftable amber chip whose × drops the filter AND the
//     ?cycleId= param — the URL stays truthful, a reload after the lift
//     must not re-impose a filter nobody sees.
//   - THE RUNTIME-PIN LAW (the fourth net): the scope rejection is a truth
//     table (throws / accepts) — exactly the math a byte-pin cannot catch.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { validateScheduleInput, HrScheduleError } from '@/lib/hr/report-schedule-service';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const svcSrc = read('src/lib/hr/report-schedule-service.ts');
const tabSrc = read('src/components/hr/report-schedules-tab.tsx');
const deskSrc = read('src/app/(shell)/hr/performance/page.tsx');

const baseInput = {
  reportKey: 'review-cycles',
  frequency: 'WEEKLY',
  recipients: ['owner@mbumahhardware.co.ke'],
  weekday: 1,
  hourUtc: 2,
};

// ── the create door (RUNTIME pins — the fourth net) ──

describe('validateScheduleInput — the org pool refuses the narrowing', () => {
  it('review-cycles + a branch scope throws INVALID_SCOPE, 422', () => {
    try {
      validateScheduleInput({ ...baseInput, storeId: 'store-juja' });
      expect.unreachable('the narrowing must be refused');
    } catch (e) {
      expect(e).toBeInstanceOf(HrScheduleError);
      const err = e as HrScheduleError;
      expect(err.code).toBe('INVALID_SCOPE');
      expect(err.status).toBe(422);
      expect(err.message).toContain('organization-wide');
    }
  });

  it('review-cycles at the organization is accepted (storeId null or absent)', () => {
    const a = validateScheduleInput({ ...baseInput, storeId: null });
    expect(a.storeId).toBeNull();
    const b = validateScheduleInput({ ...baseInput });
    expect(b.reportKey).toBe('review-cycles');
  });

  it('branch-scoped reports keep their door (headcount + a store is fine)', () => {
    const ok = validateScheduleInput({ ...baseInput, reportKey: 'headcount', storeId: 'store-juja' });
    expect(ok.storeId).toBe('store-juja');
  });
});

// ── the belt (byte pins — the document's scope line) ──

describe('the review-cycles digest case — the forced scope line', () => {
  it("the scope line speaks the organization, unconditionally", () => {
    expect(svcSrc).toContain("scopeLabel: 'All branches (organization)',");
    expect(svcSrc).toContain('branch name over org-wide counts is a lying document');
  });

  it('the create door carries its own law in bytes', () => {
    expect(svcSrc).toContain("if (input.reportKey === 'review-cycles' && input.storeId != null) {");
    expect(svcSrc).toContain("'INVALID_SCOPE',");
    expect(svcSrc).toContain('The review pool is organization-wide — schedule it at the organization, not a branch.');
  });
});

// ── the wire (byte pins — the dialog lock + the card's mark) ──

describe('the schedule dialog — the 422 un-hittable from the UI', () => {
  it('the org-pool set exists and answers', () => {
    expect(tabSrc).toContain("const ORG_POOL_REPORTS: ReadonlySet<string> = new Set(['review-cycles']);");
    expect(tabSrc).toContain('function isOrgPoolReport(reportKey: string): boolean {');
  });

  it('picking an org-pool report also resets the branch pick to all', () => {
    expect(tabSrc).toContain("onValueChange={(v) => setForm((f) => ({ ...f, reportKey: v, ...(isOrgPoolReport(v) ? { storeId: 'all' } : {}) }))}");
  });

  it('the branch select locks: forced value + disabled + the swapped hint', () => {
    expect(tabSrc).toContain("value={isOrgPoolReport(form.reportKey) ? 'all' : form.storeId}");
    expect(tabSrc).toContain('disabled={isOrgPoolReport(form.reportKey)}');
    expect(tabSrc).toContain('The review pool is organization-wide — every cycle and review, whatever branch employs them.');
  });

  it('the card wears the Org pool chip (slate, the quiet family)', () => {
    expect(tabSrc).toContain('{isOrgPoolReport(s.reportKey) ? (');
    expect(tabSrc).toContain('Org pool');
    const chip = tabSrc.slice(tabSrc.indexOf('Org pool') - 400, tabSrc.indexOf('Org pool'));
    expect(chip).toContain('bg-slate-100 dark:bg-slate-900/60');
  });
});

// ── the walk (byte pins — ?cycleId= + the liftable chip) ──

describe('the performance desk — ?cycleId= lands as visible, liftable state', () => {
  it('the deep-link read is deferred one tick, directive-free (the CI lesson pre-applied)', () => {
    expect(deskSrc).toContain("const cycleId = new URLSearchParams(window.location.search).get('cycleId');");
    expect(deskSrc).toContain('const t = window.setTimeout(() => setFilterCycleId(cycleId), 0);');
    expect(deskSrc).not.toContain('eslint-disable');
  });

  it('the chip speaks the cycle and lifts filter + param together', () => {
    expect(deskSrc).toContain('const clearDeepLinkedCycle = () => {');
    expect(deskSrc).toContain("url.searchParams.delete('cycleId');");
    expect(deskSrc).toContain('window.history.replaceState(null, \'\', url.toString());');
    expect(deskSrc).toContain("data-testid=\"review-filter-cycle-chip\"");
    expect(deskSrc).toContain("filterCycleId !== 'ALL' ? (");
  });

  it('the chip wears amber — the waiting family these filters already speak', () => {
    const at = deskSrc.indexOf('review-filter-cycle-chip');
    const chip = deskSrc.slice(at, at + 400);
    expect(chip).toContain('border-amber-200 bg-amber-50');
    expect(chip).toContain('dark:bg-amber-950/40');
  });

  it('no second meaning: the desk never had amber filter chips before this one', () => {
    // the chip is the desk's ONLY amber filter chip (the status chips are
    // sky/violet/emerald/rose families — colour never means two things)
    expect((deskSrc.match(/review-filter-cycle-chip/g) ?? []).length).toBe(1);
  });
});
