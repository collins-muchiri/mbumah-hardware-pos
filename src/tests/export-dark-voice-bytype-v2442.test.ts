// THE TREND FINDS ITS DARK VOICE; THE BY-TYPE CENSUS LANDS (v2.442.0):
// two verses, one round, both from the tail's own map.
//   • THE TREND'S DARK VOICE (the tail's option 3): the v2.441.0 round
//     retired the rich-trend node with the census hand-over, and the
//     trend lines went back to plain muted-foreground — a voice with no
//     dark face. This round every trend line speaks its card's own
//     family through the trendClass field — light 600, dark 400 (the
//     badges' dark-pair grammar) — and the muted-foreground default
//     stays for any card with no family to borrow (the fallback law).
//     The mirror law rides: the plans and schedule dashboards' stat
//     cards wear the same field, the same grammar, and the trend lines
//     there gain the native title hover too (the v2.441.0 styling
//     detail, now tree-wide on the three stats dashes).
//   • THE BY-TYPE CENSUS (the carried verse): the stats wire's byType
//     aggregate was computed and typed but rendered NOWHERE, and each
//     type's count swallowed its withdrawn rows silently. The route
//     grows the cancelled field per type (count INCLUDES the withdrawn
//     — the honest inclusion), and the data-exports desk grows the By
//     Type breakdown table: runs, records, and the withdrawn split in
//     the zinc voice (the table's Cancelled badge family). The empty
//     state renders NO table (the empty-state probe law).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const CARDS = 'src/components/data-exports/exports-stats-cards.tsx';
const PLANS = 'src/components/debt-plans/plans-stats-cards.tsx';
const SCHEDULE = 'src/components/shift-scheduling/schedule-stats-cards.tsx';
const TAB = 'src/app/(shell)/tabs/data-exports-tab.tsx';
const API = 'src/lib/api.ts';
const STATS = 'src/app/api/data-exports/stats/route.ts';

const cards = readFileSync(CARDS, 'utf8');
const plans = readFileSync(PLANS, 'utf8');
const schedule = readFileSync(SCHEDULE, 'utf8');
const tab = readFileSync(TAB, 'utf8');
const api = readFileSync(API, 'utf8');
const stats = readFileSync(STATS, 'utf8');

describe('the trend finds its dark voice (v2.442.0)', () => {
  it('the field joins the config — the trend line has a voice slot', () => {
    expect(cards).toContain('  trend?: string;\n  /** v2.442.0 the trend line\'s own voice — light 600, dark 400. */\n  trendClass?: string;');
  });

  it('the five cards speak their own families — light 600, dark 400', () => {
    expect(cards).toContain("      trendClass: 'text-emerald-600 dark:text-emerald-400',");
    expect(cards).toContain("      trendClass: 'text-zinc-600 dark:text-zinc-400',");
    expect(cards).toContain("      trendClass: 'text-teal-600 dark:text-teal-400',");
    expect(cards).toContain("      trendClass: 'text-amber-600 dark:text-amber-400',");
    expect(cards).toContain("      trendClass: 'text-green-600 dark:text-green-400',");
  });

  it('the renderer speaks the voice with the fallback law', () => {
    expect(cards).toContain(
      'className={`text-[10px] ${card.trendClass ?? \'text-muted-foreground\'} truncate`}',
    );
    // the zinc trend wears the voice in BOTH states — the honest zero
    // speaks the same family as the withdrawn law
    const zincTrendAt = cards.indexOf("trendClass: 'text-zinc-600 dark:text-zinc-400',");
    const bothStatesAt = cards.indexOf('cancelled > 0');
    expect(zincTrendAt).toBeGreaterThan(-1);
    expect(bothStatesAt).toBeGreaterThan(zincTrendAt);
  });

  it('the mirror law — the plans dash speaks the same grammar', () => {
    expect(plans).toContain('  trendClass?: string;');
    expect(plans).toContain("      trendClass: 'text-emerald-600 dark:text-emerald-400',");
    expect(plans).toContain("      trendClass: 'text-amber-600 dark:text-amber-400',");
    expect(plans).toContain("      trendClass: 'text-teal-600 dark:text-teal-400',");
  });

  it('the mirror law — the schedule dash speaks the same grammar', () => {
    expect(schedule).toContain('  trendClass?: string;');
    expect(schedule).toContain("      trendClass: 'text-emerald-600 dark:text-emerald-400',");
    expect(schedule).toContain("      trendClass: 'text-teal-600 dark:text-teal-400',");
    expect(schedule).toContain("      trendClass: 'text-amber-600 dark:text-amber-400',");
    expect(schedule).toContain("      trendClass: 'text-violet-600 dark:text-violet-400',");
  });

  it('the v2.441.0 styling detail goes tree-wide — the title hover rides the siblings', () => {
    const hover = '    title={card.trend}';
    expect(plans).toContain(hover);
    expect(schedule).toContain(hover);
    // the exports dash kept its own hover (the five-across law)
    expect(cards).toContain('                    title={card.trend}');
  });
});

describe('the by-type census lands (v2.442.0)', () => {
  it('the route grows the per-type cancelled split — count includes, cancelled names', () => {
    expect(stats).toContain(
      '  const byType: Record<string, { count: number; records: number; cancelled: number }> = {};',
    );
    expect(stats).toContain(
      "    if (!byType[r.exportType]) byType[r.exportType] = { count: 0, records: 0, cancelled: 0 };",
    );
    expect(stats).toContain(
      "    if (r.status === 'CANCELLED') byType[r.exportType].cancelled += 1;",
    );
    // the honest inclusion is a WRITTEN law, not an implication
    expect(stats).toContain('//     (count INCLUDES the withdrawn rows — the cancelled field splits them');
  });

  it('the client type wears the third field — beside count and records', () => {
    expect(api).toContain(
      '  byType: Record<string, { count: number; records: number; cancelled: number }>;',
    );
  });

  it('the By Type breakdown takes its seat — between the type cards and history', () => {
    // the SECTION seats (the header JSX bytes, not the doc comment's
    // early mentions — first-occurrence would lie about the layout)
    const sectionAt = tab.indexOf('<h2 className="text-lg font-semibold">By Type</h2>');
    const typesAt = tab.indexOf('<h2 className="text-lg font-semibold">Export Types</h2>');
    const historyAt = tab.indexOf('<h2 className="text-lg font-semibold">Export History</h2>');
    expect(sectionAt).toBeGreaterThan(-1);
    expect(sectionAt).toBeGreaterThan(typesAt);
    expect(sectionAt).toBeLessThan(historyAt);
  });

  it('the honest inclusion is named in the section header — never an implication', () => {
    expect(tab).toContain('run counts include withdrawn rows');
  });

  it('the withdrawn split wears the zinc voice — the Cancelled badge family', () => {
    expect(tab).toContain(
      '<Badge className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-300 hover:bg-zinc-100">',
    );
    expect(tab).toContain('{row.cancelled} withdrawn');
  });

  it('the empty state renders NO table — the probe law', () => {
    expect(tab).toContain(': typeRows.length === 0 ? (');
    expect(tab).toContain('No exports yet — the census waits for its first run');
    // the empty branch is the quiet card, not a skeleton of the table
    const emptyAt = tab.indexOf('No exports yet — the census waits for its first run');
    const tableAt = tab.indexOf('<table className="w-full text-sm">');
    expect(emptyAt).toBeGreaterThan(-1);
    expect(tableAt).toBeGreaterThan(emptyAt);
  });

  it('the rows sort loudest-first, then by their own name — deterministic', () => {
    expect(tab).toContain('.sort((a, b) => b.count - a.count || a.type.localeCompare(b.type))');
  });

  it('the loading state wears skeletons — three quiet bars before the census', () => {
    expect(tab).toContain('        {statsLoading ? (');
    expect(tab).toContain('<Skeleton className="h-10 w-full" />');
  });
});
