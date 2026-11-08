// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * v2.89.0: the goals speak the same shape.
 *
 * The Goals tab was the last flat list in the performance console — no
 * filters, no counts, one recompute button per card. This round:
 *   1. The service gains recomputeAllGoals — one call recomputes every
 *      POS-sourced goal in scope, folding an honest summary (achieved /
 *      missed / open / closed untouched).
 *   2. The console Goals tab gains employee + source picks and status
 *      chips with live counts, a "Showing X of Y" line, and one-tap clear
 *      — the exact shape treatment v2.88 gave the Reviews tab.
 *   3. A "Recompute all POS goals" button appears only when at least one
 *      POS-sourced goal exists.
 *
 * File-level contracts (the perf-cycle-shape.test.ts pattern); the
 * service rules live in stage-g-goals.test.ts.
 */

const readRepo = (p: string): string => readFileSync(join(process.cwd(), p), 'utf8');

describe('service — recomputeAllGoals', () => {
  const service = readRepo('src/lib/hr/goal-service.ts');

  it('exports the summary shape and the bulk recompute', () => {
    expect(service).toContain('export interface GoalRecomputeAllSummary');
    expect(service).toMatch(/recomputed:\s*number/);
    expect(service).toMatch(/achieved:\s*number/);
    expect(service).toMatch(/missed:\s*number/);
    expect(service).toMatch(/open:\s*number/);
    expect(service).toMatch(/closed:\s*number/);
    expect(service).toContain('export async function recomputeAllGoals');
  });

  it('selects only POS-sourced, non-deleted goals inside the session scope', () => {
    expect(service).toMatch(/deletedAt:\s*null,/);
    expect(service).toMatch(/metricSource:\s*\{\s*in:\s*\['SALES_TOTAL',\s*'SALES_COUNT'\]\s*\}/);
    expect(service).toMatch(/employee:\s*employeeScopeWhere\(session\)/);
  });

  it('keeps the single-recompute status rule; CLOSED goals keep their status', () => {
    expect(service).toMatch(/if \(goal\.status !== 'CLOSED'\)/);
    expect(service).toMatch(/target\.gt\(0\) && value\.gte\(target\)/);
    expect(service).toMatch(/goal\.dueDate && goal\.dueDate\.getTime\(\) < Date\.now\(\)/);
  });

  it('audits each recomputed goal with the bulk marker', () => {
    expect(service).toMatch(/action:\s*'GOAL_RECOMPUTED'/);
    expect(service).toMatch(/bulk:\s*true/);
  });

  it('the sensitive-data floor holds — no rating/narrative reads anywhere in the goal service', () => {
    expect(service).not.toContain('overallRating');
    expect(service).not.toContain('strengths');
    expect(service).not.toContain('improvements');
  });
});

describe('route — POST /api/hr/goals/recompute-all', () => {
  const route = readRepo('src/app/api/hr/goals/recompute-all/route.ts');

  it('guards the write behind hr.performance.manage', () => {
    expect(route).toContain("hrGuard('hr.performance.manage')");
    expect(route).toContain('recomputeAllGoals(session)');
    expect(route).toContain('toErrorResponse(error)');
  });
});

describe('console — the Goals tab speaks the same shape', () => {
  const page = readRepo('src/app/(shell)/hr/performance/page.tsx');
  // v2.457.0: the goal chips' wardrobe lives in the filter chip loom's
  // TINT registry — the family pins read the loom beside the desk's words.
  const loom = readRepo('src/components/filter-chip.tsx');

  it('goal filter chips exist with live counts from the FULL list', () => {
    // v2.306.0 re-anchor: the vocabulary's home is the pool voice (the
    // pure seam) — the page imports it, no local copy.
    // v2.457.0 re-anchor: the chips ride the filter chip loom — the
    // desk passes testId/active; the loom speaks aria-pressed and the
    // ring, once, family-wide.
    expect(page).toContain("} from '@/lib/hr/pool-voice';");
    expect(page).toMatch(/data-testid="goal-filters"/);
    expect(page).toMatch(/testId=\{`goal-filter-status-\$\{s\}`\}/);
    expect(loom).toMatch(/aria-pressed=\{active\}/);
    expect(page).toMatch(/goalStatusCounts\[s\] \?\? 0/);
  });

  it('chips wear their badge family when active (amber/emerald/rose/slate — the pool law)', () => {
    // v2.306.0 re-anchor: OPEN is waiting, and waiting wears amber — the
    // one colour law the digest preview has spoken since v2.283.0. The
    // old sky pressed-state was the one face where the word wore a
    // second colour; the word no longer does.
    // v2.457.0 re-anchor: the wardrobe moved into the filter chip loom's
    // TINT registry — the desk speaks the WORDS (which status wears
    // which family) and the loom speaks the four faces once.
    expect(page).toMatch(/GOAL_TONE[^}]*OPEN: 'amber'/s);
    expect(page).toMatch(/GOAL_TONE[^}]*ACHIEVED: 'emerald'/s);
    expect(page).toMatch(/GOAL_TONE[^}]*MISSED: 'rose'/s);
    expect(page).toMatch(/GOAL_TONE[^}]*CLOSED: 'slate'/s);
    expect(loom).toContain("amber: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900',");
    expect(loom).toContain("emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900',");
    expect(loom).toContain("rose: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900',");
    expect(loom).toContain("slate: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',");
  });

  it('employee + source picks join the filter row', () => {
    expect(page).toMatch(/data-testid="goal-filter-employee"/);
    expect(page).toMatch(/aria-label="Filter goals by employee"/);
    expect(page).toMatch(/data-testid="goal-filter-source"/);
    expect(page).toMatch(/aria-label="Filter goals by metric source"/);
    expect(page).toMatch(/filterGoalEmployee === 'ALL' \|\| g\.employeeId === filterGoalEmployee/);
    expect(page).toMatch(/filterGoalSource === 'ALL' \|\| g\.metricSource === filterGoalSource/);
  });

  it('the honest line and the one-tap clear keep the picture truthful', () => {
    expect(page).toMatch(/data-testid="goal-filter-count"/);
    expect(page).toMatch(/Showing \{filteredGoals\.length\} of \{\(goals \?\? \[\]\)\.length\} goals/);
    expect(page).toMatch(/data-testid="goal-filter-clear"/);
    expect(page).toContain('No goals match the current filters.');
  });

  it('the empty states are split — nothing yet vs nothing matches', () => {
    expect(page).toContain('No goals yet. Create the first one.');
    expect(page).toMatch(/goals\.length === 0 \? \(/);
    expect(page).toMatch(/filteredGoals\.length === 0 \? \(/);
  });

  it('the recompute-all door appears only when a POS-sourced goal exists', () => {
    expect(page).toMatch(/data-testid="goal-recompute-all"/);
    // v2.91.0: the door is manage-gated too — read-only viewers never see it.
    expect(page).toMatch(/\{canManage && posGoalCount > 0 \? \(/);
    expect(page).toMatch(/Recompute all POS goals/);
    expect(page).toMatch(/title=\{`Recompute \$\{posGoalCount\} POS-sourced/);
  });

  it('the bulk endpoint is the one-call refresh; per-card recompute stays', () => {
    expect(page).toContain("'/api/hr/goals/recompute-all'");
    expect(page).toContain('`/api/hr/goals/${g.id}/recompute`');
  });

  it('cards carry an anchor, source badges wear their family, numbers stay tabular', () => {
    expect(page).toMatch(/data-testid=\{`goal-card-\$\{g\.id\}`\}/);
    expect(page).toMatch(/SOURCE_CHIP\[g\.metricSource\]/);
    expect(page).toMatch(/SALES_TOTAL:\s*'border-sky-300 text-sky-700/);
    expect(page).toMatch(/CUSTOM:\s*'border-amber-300 text-amber-700/);
  });

  it('the Goals tab keeps its own filter state, independent of the reviews tab', () => {
    expect(page).toMatch(/const \[filterGoalEmployee, setFilterGoalEmployee\] = useState\('ALL'\)/);
    expect(page).toMatch(/const \[filterGoalSource, setFilterGoalSource\] = useState\('ALL'\)/);
    expect(page).toMatch(/const \[filterGoalStatus, setFilterGoalStatus\] = useState\('ALL'\)/);
    expect(page).toMatch(/const clearGoalFilters = \(\) => \{/);
  });
});

describe('prior anchors hold', () => {
  const page = readRepo('src/app/(shell)/hr/performance/page.tsx');
  const service = readRepo('src/lib/hr/goal-service.ts');
  const whatsNew = readRepo('src/lib/whats-new.ts');

  it('v2.88.0 — the calibration meter and the review filters stay intact', () => {
    expect(page).toMatch(/data-testid=\{`cycle-meter-\$\{c\.id\}`\}/);
    expect(page).toMatch(/data-testid=\{`review-filter-status-\$\{s\}`\}/);
    expect(page).toMatch(/data-testid="review-filter-count"/);
  });

  it('v2.87.0 — the review write half stays intact', () => {
    expect(page).toMatch(/data-testid="perf-save-draft"/);
    expect(page).toMatch(/data-testid="perf-review-edit"/);
  });

  it('v2.19.0 — the computed-not-typed rule survives untouched', () => {
    expect(service).toContain('POS_GOAL_READONLY');
    expect(service).toContain('computePosGoalValue');
  });

  it("What's-New leads with 2.89.0", () => {
    expect(whatsNew).toMatch(/version: '2\.89\.0'/);
    expect(whatsNew.indexOf("version: '2.89.0'")).toBeLessThan(whatsNew.indexOf("version: '2.88.0'"));
  });
});
