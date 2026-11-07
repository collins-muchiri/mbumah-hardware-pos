// THE CENSUS LEARNS THE WITHDRAWN WORD (v2.440.0): the stats contract's
// own suite. v2.439.0 taught the desk to retire a stuck export — but the
// stats contract never heard the news: /api/data-exports/stats counted
// totalExports / completedExports / failedExports only, so the
// Total Exports card's trend line ("N completed · M failed") let the
// cancelled row VANISH from the census — 15 rows read "10 completed ·
// 2 failed" and the withdrawn word had no face. The round grows the
// contract honestly:
//   • the wire: cancelledExports joins the stats route's aggregate and
//     response (withdrawn before completion — the v2.439.0 door's own
//     census),
//   • the honest denominator: successRate = completed / (completed +
//     failed) — cancelled rows are excluded TOO, and now the comment
//     says why: a withdrawn run never had a file, so it can be neither
//     a success nor a failure,
//   • the face: the Total Exports card's trend line speaks three
//     segments — completed · failed · cancelled — and the cancelled
//     segment wears the zinc voice (the table's Cancelled badge
//     family) whenever a withdrawn row exists,
//   • the clarifier: the Success Rate card's trend line names its own
//     denominator — "Completed vs. failed runs (cancelled excluded)".

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const STATS = 'src/app/api/data-exports/stats/route.ts';
const API = 'src/lib/api.ts';
const CARDS = 'src/components/data-exports/exports-stats-cards.tsx';

const stats = readFileSync(STATS, 'utf8');
const api = readFileSync(API, 'utf8');
const cards = readFileSync(CARDS, 'utf8');

describe('the wire speaks the withdrawn word (v2.440.0)', () => {
  it('cancelledExports joins the route\u2019s aggregate — counted beside its siblings', () => {
    expect(stats).toContain(
      "  const cancelledExports = rows.filter((r) => r.status === 'CANCELLED').length;",
    );
    // the seat law: cancelled sits WITH failed — both are "this file
    // will never arrive" — after completed, before the record roll-up.
    const completedAt = stats.indexOf("const completedExports = rows.filter");
    const failedAt = stats.indexOf("const failedExports = rows.filter");
    const cancelledAt = stats.indexOf("const cancelledExports = rows.filter");
    const rollupAt = stats.indexOf('const totalRecordsExported = rows.reduce');
    expect(completedAt).toBeGreaterThan(-1);
    expect(failedAt).toBeGreaterThan(completedAt);
    expect(cancelledAt).toBeGreaterThan(failedAt);
    expect(rollupAt).toBeGreaterThan(cancelledAt);
  });

  it('the response contract carries the fourth census key', () => {
    expect(stats).toContain('      failedExports,\n      cancelledExports,\n      totalRecordsExported,');
    // the header contract names it — with its lineage (the door's own census)
    expect(stats).toContain(
      "//   - cancelledExports (withdrawn before completion \u2014 the v2.439.0 door's own census)",
    );
  });

  it('the client type wears the fourth key — beside failedExports', () => {
    expect(api).toContain('  failedExports: number;\n  cancelledExports: number;\n  totalRecordsExported: number;');
  });
});

describe('the honest denominator (v2.440.0)', () => {
  it('the comment says why cancelled never counts — a withdrawn run never had a file', () => {
    expect(stats).toContain(
      '  // cancelled rows are excluded too \u2014 a withdrawn run never had a file, so it',
    );
    expect(stats).toContain('  // can be neither a success nor a failure.');
    // the rate\u2019s own shape is untouched: completed / (completed + failed)
    expect(stats).toContain('  const denom = completedExports + failedExports;');
    expect(stats).toContain('  const successRate = denom > 0 ? completedExports / denom : 1;');
  });

  it('the arithmetic holds on the fixture world\u2019s own census', () => {
    // the burst\u2019s live answer: 15 rows — 10 completed (incl. 1 expired
    // + 2 off-union), 2 failed, 1 cancelled, 1 processing, 1 pending.
    const rows = [
      ...Array.from({ length: 10 }, () => ({ status: 'COMPLETED' })),
      ...Array.from({ length: 2 }, () => ({ status: 'FAILED' })),
      { status: 'CANCELLED' },
      { status: 'PROCESSING' },
      { status: 'PENDING' },
    ] as Array<{ status: string }>;
    const totalExports = rows.length;
    const completedExports = rows.filter((r) => r.status === 'COMPLETED').length;
    const failedExports = rows.filter((r) => r.status === 'FAILED').length;
    const cancelledExports = rows.filter((r) => r.status === 'CANCELLED').length;
    expect(totalExports).toBe(15);
    expect(completedExports).toBe(10);
    expect(failedExports).toBe(2);
    expect(cancelledExports).toBe(1);
    // the five statuses close the ledger: nothing is unnamed
    const waiting = rows.filter(
      (r) => r.status === 'PROCESSING' || r.status === 'PENDING',
    ).length;
    expect(completedExports + failedExports + cancelledExports + waiting).toBe(totalExports);
    // the rate: 10 / (10 + 2) — the cancelled row out of the denominator
    const denom = completedExports + failedExports;
    expect(denom > 0 ? completedExports / denom : 1).toBeCloseTo(0.8333, 3);
  });
});

describe('the face speaks three segments (v2.440.0)', () => {
  it('the Total Exports trend is a rich node — the cancelled segment in zinc', () => {
    expect(cards).toContain('  const cancelled = stats?.cancelledExports ?? 0;');
    expect(cards).toContain('      trendNode: (');
    // the zinc voice rides ONLY when a withdrawn row exists — the
    // table\u2019s Cancelled badge family (font-medium text-zinc-500)
    expect(cards).toContain(
      "          <span className={cancelled > 0 ? 'font-medium text-zinc-500' : undefined}>",
    );
    expect(cards).toContain('            {cancelled} cancelled\n          </span>');
  });

  it('the renderer prefers the rich node and falls back to the plain trend', () => {
    expect(cards).toContain('                {(card.trendNode || card.trend) && (');
    expect(cards).toContain('                    {card.trendNode ?? card.trend}');
  });

  it('the Success Rate card names its own denominator — the clarifier', () => {
    expect(cards).toContain("      trend: 'Completed vs. failed runs (cancelled excluded)',");
  });
});
