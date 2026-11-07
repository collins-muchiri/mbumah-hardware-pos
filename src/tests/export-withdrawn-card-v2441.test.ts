// THE WITHDRAWN COUNT TAKES ITS OWN CARD (v2.441.0): the census's
// hand-over suite. v2.440.0 grew the stats contract the fourth key
// (cancelledExports) and taught the Total Exports trend line to speak
// three segments — and the tail's own DRY concern stood: the count rode
// a trend line, a census without a home. This round the fifth glass
// card takes the census — one number, one home:
//   • the card: 'Cancelled Exports' joins the grid (the fifth glass
//     card, grid-cols-2 md:grid-cols-5) in the zinc voice — the table's
//     Cancelled badge family — with the Ban icon (the withdrawn face),
//     seated beside Total Exports (the census pair: the total, then the
//     count that bowed out of it),
//   • the hand-over: the Total Exports trend line reads
//     "N completed · M failed" again — the v2.440.0 rich-trend node
//     retires with the census it carried,
//   • the honest zero: the card's trend line speaks both states —
//     "Withdrawn before completion — never a file" when a withdrawn
//     row exists; "Nothing withdrawn — stuck exports retire here" when
//     the census holds zero,
//   • the fifth card lands on beat: the stagger-5 delay exists in the
//     stylesheet and the stagger ladder grows its fifth rung.
// (the v2.440.0 suite's face pins re-keyed honestly this round: the
// three-segment bytes moved to the card — export-stats-cancelled-
// v2440.test.ts now pins the two-segment trend and the retirement.)

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const CARDS = 'src/components/data-exports/exports-stats-cards.tsx';
const CSS = 'src/app/globals.css';
const API = 'src/lib/api.ts';
const STATS = 'src/app/api/data-exports/stats/route.ts';

const cards = readFileSync(CARDS, 'utf8');
const css = readFileSync(CSS, 'utf8');
const api = readFileSync(API, 'utf8');
const stats = readFileSync(STATS, 'utf8');

describe('the withdrawn card takes the census (v2.441.0)', () => {
  it('the fifth card sits beside Total Exports — the census pair', () => {
    const totalAt = cards.indexOf("label: 'Total Exports'");
    const cancelledAt = cards.indexOf("label: 'Cancelled Exports'");
    const recordsAt = cards.indexOf("label: 'Total Records'");
    expect(totalAt).toBeGreaterThan(-1);
    expect(cancelledAt).toBeGreaterThan(totalAt);
    expect(recordsAt).toBeGreaterThan(cancelledAt);
  });

  it('the card wears the zinc voice and the Ban icon — the withdrawn face', () => {
    expect(cards).toContain('import {\n  Ban,\n  CheckCircle2,');
    expect(cards).toContain('      icon: Ban,');
    expect(cards).toContain("      gradient: 'from-zinc-500 to-zinc-600',");
    expect(cards).toContain("      iconColor: 'text-zinc-500',");
    expect(cards).toContain('  const cancelled = stats?.cancelledExports ?? 0;');
    expect(cards).toContain('      value: String(cancelled),');
  });

  it('the trend line speaks both states — the honest zero law', () => {
    expect(cards).toContain('      trend:\n        cancelled > 0');
    expect(cards).toContain("          ? 'Withdrawn before completion — never a file'");
    expect(cards).toContain("          : 'Nothing withdrawn — stuck exports retire here',");
  });

  it('the grid wears five cards — skeleton too, the stagger ladder grows', () => {
    expect(cards).toContain('grid-cols-2 md:grid-cols-5');
    expect(cards).toContain('Array.from({ length: 5 })');
    expect(cards).toContain("['stagger-1', 'stagger-2', 'stagger-3', 'stagger-4', 'stagger-5']");
  });

  it('the stagger-5 delay exists in the stylesheet — the fifth card lands on beat', () => {
    expect(css).toContain('.stagger-5 { animation-delay: 500ms; }');
  });

  it('the full law rides the hover — every trend line carries its title', () => {
    // five-across cards truncate their trend lines; the native tooltip
    // keeps the whole sentence available (the styling detail this round)
    expect(cards).toContain('                    title={card.trend}');
  });
});

describe('the hand-over is total (v2.441.0)', () => {
  it('the Total Exports trend reads two segments again — the census moved', () => {
    expect(cards).toContain(
      '      trend: `${stats?.completedExports ?? 0} completed · ${stats?.failedExports ?? 0} failed`,',
    );
    expect(cards).not.toContain('· cancelled');
    expect(cards).not.toContain('trendNode');
    expect(cards).not.toContain('React.ReactNode');
  });

  it('the fourth key still rides the wire — the card\u2019s source of truth', () => {
    expect(api).toContain(
      '  failedExports: number;\n  cancelledExports: number;\n  totalRecordsExported: number;',
    );
    expect(stats).toContain(
      "  const cancelledExports = rows.filter((r) => r.status === 'CANCELLED').length;",
    );
  });
});
