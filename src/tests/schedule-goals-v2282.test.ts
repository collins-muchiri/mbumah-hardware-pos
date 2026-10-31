// v2.282.0 — the digest learns the goals.
//
//   - THE PARITY GAP: the performance module had no digest face — the
//     scheduler covered seven HR reports and none of them goals. This round
//     the goal pool's aggregate joins the governed digest seam: scheduleable,
//     previewable, emailable, CSV-able — the ONE seam every surface mirrors.
//   - THE AGGREGATE: counts and sums ONLY, the same governed scope listGoals
//     obeys (employeeScopeWhere), the same Number()-per-row door the leave
//     report opens. No names ride a digest (the tab's own standing contract).
//   - THE HONEST PERCENTAGE: attainment over a zero target sum is a guess →
//     null, and the digest speaks '—'. A NEGATIVE target is data corruption,
//     not a denominator (the strict `> 0` keeps both honest).
//   - NO FALLTHROUGH RENAMING: a status word the vocabulary does not know is
//     bucketed AS ITSELF — the rows speak the four known statuses, so a
//     stray word shows up honestly as tracked > the rows' sum. The document
//     exposes what it cannot name, never renames it.
//   - THE CLOCK'S OWN COUNT: `overdue` counts goals the ledger still holds
//     OPEN whose dueDate has passed — the pool saying "these look missed,
//     and nobody has re-run me yet" (the recompute law moves them when it
//     re-speaks the pool). The boundary is STRICT: due this instant is not
//     overdue.
//   - THE RUNTIME-PIN LAW (the fourth net): the percentage's truth table is
//     exactly the math a byte-pin alone cannot catch — both nets, every
//     round.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { goalAttainmentPct, GOAL_STATUSES } from '@/lib/hr/goal-service';
import { HR_SCHEDULE_REPORTS, REPORT_LABELS } from '@/lib/hr/report-schedule-service';
// v2.287.0 re-anchor: the tab landings moved to the client-safe seam
// (report-desk-links.ts — the ONE vocabulary, re-exported by the service),
// so the slug pin reads the map at its new home.
import { REPORT_KEY_TO_TAB } from '@/lib/hr/report-desk-links';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const goalSrc = read('src/lib/hr/goal-service.ts');
const svcSrc = read('src/lib/hr/report-schedule-service.ts');
const tabSrc = read('src/components/hr/report-schedules-tab.tsx');

// ── the percentage's truth table (RUNTIME pins — the fourth net) ──

describe('goalAttainmentPct — the ONE percentage', () => {
  it('a percentage over a zero target is a guess — null, never zero', () => {
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
    expect(goalAttainmentPct(7, 1)).toBe(14.3);
  });

  it('over-achievement speaks its own truth (over 100 is honest)', () => {
    expect(goalAttainmentPct(100, 130)).toBe(130);
  });
});

// ── the vocabulary order (RUNTIME pins) ──

describe('the goal vocabulary — the rows\u2019 own order', () => {
  it('the four statuses in the model\u2019s own order', () => {
    expect(GOAL_STATUSES).toEqual(['OPEN', 'ACHIEVED', 'MISSED', 'CLOSED']);
  });

  it('the report\u2019s rows march the vocabulary (the map, byte-pinned)', () => {
    expect(goalSrc).toContain('const rows: GoalAttainmentRow[] = GOAL_STATUSES.map((status) => {');
  });
});

// ── the aggregate (byte pins — the scope, the laws) ──

describe('goalAttainmentReport — the governed aggregate', () => {
  it('the scope rides employeeScopeWhere — the same governed scope listGoals obeys', () => {
    expect(goalSrc).toContain('where: { deletedAt: null, employee: employeeScopeWhere(session) }');
  });

  it('no names ride the aggregate (the digest contract)', () => {
    const fn = goalSrc.slice(goalSrc.indexOf('export async function goalAttainmentReport'));
    expect(fn).not.toMatch(/firstName|lastName|employeeCode|title/);
    expect(fn).toContain('select: { status: true, metricSource: true, targetValue: true, currentValue: true, dueDate: true }');
  });

  it('no fallthrough renaming — the stray word buckets AS ITSELF', () => {
    const fn = goalSrc.slice(goalSrc.indexOf('export async function goalAttainmentReport'));
    expect(fn).toContain('const bucket = buckets.get(g.status) ?? { goals: 0, target: 0, current: 0 };');
    expect(fn).not.toContain("? g.status : 'OPEN'");
  });

  it('the clock\u2019s own count: OPEN + dueDate < now, STRICT boundary', () => {
    expect(goalSrc).toContain("if (g.status === 'OPEN' && g.dueDate != null && g.dueDate.getTime() < now.getTime()) overdue += 1;");
  });

  it('the Number()-per-row door (the leave report\u2019s precedent)', () => {
    expect(goalSrc).toContain('Number(g.targetValue ?? 0)');
    expect(goalSrc).toContain('Number(g.currentValue ?? 0)');
  });

  it('an empty pool digests as honest zeros — the fn never returns null', () => {
    expect(goalSrc).toContain('tracked: goals.length,');
    expect(goalSrc).not.toMatch(/goalAttainmentReport[\s\S]*return null;/);
  });
});

// ── the digest case (byte pins — the seam) ──

describe('the goal-attainment digest case — the ONE seam', () => {
  it('the key joins the schedule reports and wears its label', () => {
    expect(HR_SCHEDULE_REPORTS).toContain('goal-attainment');
    expect(REPORT_LABELS['goal-attainment']).toBe('Goal attainment');
    expect(svcSrc).toContain("'goal-attainment': 'Goal attainment',");
  });

  it('the tab map carries the goals slug (v2.287.0 re-anchor: read at the seam\u2019s new home)', () => {
    expect(REPORT_KEY_TO_TAB['goal-attainment']).toBe('goals');
  });

  it('the case aggregates through the goals\u2019 own report fn with the fire instant', () => {
    expect(svcSrc).toContain('const r = await goalAttainmentReport(session, now);');
    // v2.286.0 re-anchor: the import gains GOAL_STATUSES (the deep-link
    // vocabulary map reads the lib's own words, never a copy).
    expect(svcSrc).toContain("import { GOAL_STATUSES, goalAttainmentReport } from './goal-service';");
  });

  it('the honest — face for a percentage over nothing', () => {
    // v2.306.0 re-anchor: the pct face moved into the pool voice — ONE
    // voice for both digest cases and the desk's bands (the em dash and
    // the r1 rounding live there now, byte-identical).
    expect(svcSrc).toContain("import { poolPctVoice } from './pool-voice';");
    expect(read('src/lib/hr/pool-voice.ts')).toContain("return v == null ? '—' : `${Math.round(v * 10) / 10}%`;");
  });

  it('the headline speaks counts + attainment + the clock, in order', () => {
    expect(svcSrc).toContain("{ label: 'Tracked goals', value: String(r.tracked) },");
    expect(svcSrc).toContain("{ label: 'Attainment', value: poolPctVoice(r.attainmentPct) },");
    expect(svcSrc).toContain("{ label: 'Achieved', value: String(r.achieved) },");
    expect(svcSrc).toContain("{ label: 'Missed', value: String(r.missed) },");
    expect(svcSrc).toContain("{ label: 'Overdue', value: String(r.overdue) },");
  });

  it('the table speaks the pool by status, aggregates only', () => {
    expect(svcSrc).toContain("caption: 'Goal pool by status',");
    expect(svcSrc).toContain("columns: ['Status', 'Goals', 'Target', 'Current', 'Attainment %'],");
    expect(svcSrc).toContain('periodLabel: \'All cycles — the standing pool\',');
  });
});

// ── the card (byte pins — the icon map, mandatory ④) ──

describe('the schedules card — the report\u2019s own glyph', () => {
  it('the select offers the goal digest with its honest hint', () => {
    expect(tabSrc).toContain("{ value: 'goal-attainment', label: 'Goal attainment (all cycles)' },");
  });

  it('the icon map covers every report; Mail stays the fallback', () => {
    expect(tabSrc).toContain("const REPORT_ICONS: Record<string, LucideIcon> = {");
    expect(tabSrc).toContain("'goal-attainment': Target,");
    expect(tabSrc).toContain('const Icon = REPORT_ICONS[reportKey] ?? Mail;');
  });

  it('the card header rides the map — the glyph varies, never the colour', () => {
    expect(tabSrc).toContain('<ReportIcon reportKey={s.reportKey} />');
    expect(tabSrc).toContain("className ?? 'h-4 w-4 shrink-0 text-sky-500'");
  });

  it("the dialog's \"Would email\" row keeps its Mail (it is about the email)", () => {
    expect(tabSrc).toContain('Would email');
    expect((tabSrc.match(/<Mail /g) ?? []).length).toBe(1);
  });
});
