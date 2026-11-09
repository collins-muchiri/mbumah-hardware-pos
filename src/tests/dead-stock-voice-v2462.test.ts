// THE RESTING LEDGER LEARNS TO DRAW AND TO ASK (v2.462.0): the dead-stock
// desk's two new faces, both proven without a database.
//
//   • THE CAPITAL'S SHAPE — the ninth report's chart: capital tied,
//     summed per category from the rows already on the desk (zero new
//     fetches), rendered through the toggle's two honest voices (bar and
//     pie — line and area are time-series words, and categorical capital
//     cannot wear them). The grouping lives in the classifier's ONE home
//     (capitalTiedByCategory), the pie wears the -600 family ground, and
//     a resting shelf with nothing dead draws nothing.
//
//   • THE MAKER'S WORD — every ledger row learns to ask: the Ask button
//     carries a deterministic, WhatsApp-ready clearance note to the
//     clipboard, composed in the ONE home (deadStockClearanceNote) from
//     the row's own numbers and the window that caught it — the base
//     unit named (the UoM law), the capital at cost, the ISO day (a
//     clipboard word reads the same on every machine), the never-sold
//     row's honest absence. Zero new wires, zero new homes; the
//     clipboard is the door.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { capitalTiedByCategory, deadStockClearanceNote, DEAD_STOCK_WINDOWS, type DeadStockRow } from '@/lib/reports/dead-stock';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const HOME = 'src/lib/reports/dead-stock.ts';

function row(overrides: Partial<DeadStockRow> = {}): DeadStockRow {
  return {
    productId: 'p1',
    name: 'Sleeping Bag',
    sku: 'SLP-01',
    categoryName: 'Camping',
    quantityInStock: 40,
    costPrice: 1200,
    pricePerUnit: 1800,
    reorderLevel: 10,
    unitType: 'PIECE',
    capitalTied: 48000,
    lastSoldAt: '2025-07-12T09:30:00.000Z',
    daysIdle: 120,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. THE CAPITAL'S SHAPE — the grouping, one home
// ---------------------------------------------------------------------------

describe('capitalTiedByCategory — the chart\u2019s own grouping, the ONE home', () => {
  it('sums the rows\u2019 capital per category', () => {
    const grouped = capitalTiedByCategory([
      row({ productId: 'p1', categoryName: 'Camping', capitalTied: 48000 }),
      row({ productId: 'p2', name: 'Cement', sku: 'CEM-01', categoryName: 'Building', capitalTied: 31000 }),
      row({ productId: 'p3', name: 'Trowel', sku: 'TRW-01', categoryName: 'Camping', capitalTied: 2500 }),
    ]);
    expect(grouped).toEqual([
      { label: 'Camping', value: 50500 },
      { label: 'Building', value: 31000 },
    ]);
  });

  it('a row whose shelf never named a category speaks Uncategorised — the chart never drops resting capital', () => {
    const grouped = capitalTiedByCategory([
      row({ productId: 'p1', categoryName: null, capitalTied: 100 }),
      row({ productId: 'p2', categoryName: 'Building', capitalTied: 50 }),
    ]);
    // capital DESC: the unnamed shelf's 100 out-rests Building's 50
    expect(grouped.map((g) => g.label)).toEqual(['Uncategorised', 'Building']);
    expect(grouped[0].value).toBe(100);
  });

  it('sorts capital DESC with the name tiebreak — the same rows always draw the same shape', () => {
    const grouped = capitalTiedByCategory([
      row({ productId: 'p1', categoryName: 'B', capitalTied: 100 }),
      row({ productId: 'p2', categoryName: 'A', capitalTied: 100 }),
      row({ productId: 'p3', categoryName: 'C', capitalTied: 900 }),
    ]);
    expect(grouped.map((g) => g.label)).toEqual(['C', 'A', 'B']);
  });

  it('rounds the summed capital to the classifier\u2019s own two decimals', () => {
    const grouped = capitalTiedByCategory([
      row({ productId: 'p1', categoryName: 'Camping', capitalTied: 10.005 }),
      row({ productId: 'p2', categoryName: 'Camping', capitalTied: 20.004 }),
    ]);
    expect(grouped[0].value).toBe(30.01);
  });

  it('no rows draw nothing — the empty shelf owns the good news, not the chart', () => {
    expect(capitalTiedByCategory([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. THE MAKER'S WORD — the clearance note, deterministic by law
// ---------------------------------------------------------------------------

describe('deadStockClearanceNote — the Ask button\u2019s word', () => {
  it('speaks the row\u2019s own numbers: units, base unit, capital at cost, idle days, the ISO day', () => {
    const note = deadStockClearanceNote(row(), 90);
    expect(note).toBe(
      'Clearance ask — 40 PIECE × Sleeping Bag (SLP-01): Ksh 48000.00 tied at cost, idle 120 days (last sold 2025-07-12, caught by the 90-day window). Can we talk an exchange?'
    );
  });

  it('the never-sold row speaks its honest absence — never a fabricated age', () => {
    const note = deadStockClearanceNote(row({ lastSoldAt: null, daysIdle: null }), 60);
    expect(note).toBe(
      'Clearance ask — 40 PIECE × Sleeping Bag (SLP-01): Ksh 48000.00 tied at cost, never sold (no sale on this shelf\'s record, caught by the 60-day window). Can we talk an exchange?'
    );
  });

  it('the window that caught the row is the lens\u2019s own word — the note follows the lens', () => {
    expect(deadStockClearanceNote(row(), 30)).toContain('caught by the 30-day window');
    expect(deadStockClearanceNote(row(), 90)).toContain('caught by the 90-day window');
  });

  it('the base unit is named — the UoM law rides the clipboard', () => {
    const note = deadStockClearanceNote(row({ unitType: 'METER', quantityInStock: 12.5, name: 'PVC Pipe', sku: 'PVC-02' }), 90);
    expect(note).toContain('12.5 METER × PVC Pipe (PVC-02)');
  });

  it('deterministic — the same row and window compose the same word, twice, always', () => {
    expect(deadStockClearanceNote(row(), 90)).toBe(deadStockClearanceNote(row(), 90));
    // the date is the ISO day's own first ten characters, locale-free
    expect(deadStockClearanceNote(row({ lastSoldAt: '2025-01-03T23:59:59.999Z' }), 90)).toContain('last sold 2025-01-03');
  });
});

// ---------------------------------------------------------------------------
// 3. THE DESK'S FACES — the chart card, the toggle, the Ask column
// ---------------------------------------------------------------------------

describe('the dead-stock section — the chart and the ask, pinned from the desk\u2019s bytes', () => {
  const desk = readFileSync(DESK, 'utf8');

  it('the chart card rides the section, rendered only when rows rest', () => {
    expect(desk.includes('data-testid="dead-stock-chart"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-chart-bar"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-chart-pie"')).toBe(true);
    // the chart of nothing is a lie — the empty state owns the good news
    expect(desk.includes('{rows.length > 0 && (')).toBe(true);
    expect(desk.indexOf('{rows.length > 0 && (')).toBeLessThan(desk.indexOf('Capital by category'));
  });

  it('the grouping reads the ONE home — no duplicate arithmetic in the desk', () => {
    expect(desk.includes('const capitalByCategory = useMemo(() => capitalTiedByCategory(rows), [rows]);')).toBe(true);
    expect(desk.includes('capitalTiedByCategory')).toBe(true);
    expect((desk.match(/function capitalTiedByCategory/g) ?? []).length).toBe(0);
  });

  it('the pie wears the -600 family ground, never a second palette', () => {
    expect(desk.includes('const DEAD_STOCK_CHART_COLORS')).toBe(true);
    const colors = desk.match(/const DEAD_STOCK_CHART_COLORS = \[([^\]]+)\]/)?.[1] ?? '';
    for (const c of colors.split(',').map((s) => s.trim().replace(/'/g, ''))) {
      expect(c, c).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect(colors).toContain('#3b82f6');
  });

  it('the bar face speaks its aria voice — the shape names its numbers', () => {
    expect(desk.includes('ariaLabel={`Capital tied by category — ${capitalByCategory.length} categories, ${formatKES(summary?.totalCapitalTied ?? 0)} resting`}')).toBe(true);
  });

  it('the toggle row covers the ninth report with its OWN honest faces', () => {
    // the row's condition grew the ninth report
    expect(desk.includes("reportType === 'rental_performance' || reportType === 'dead_stock'")).toBe(true);
    // line and area are time-series words — categorical capital cannot
    // wear them, and the filter is the toggle's own truth, never a
    // hidden chip
    expect(desk.includes(".filter((ct) => reportType !== 'dead_stock' || ct === 'bar' || ct === 'pie')")).toBe(true);
  });

  it('the section draws the face the state carries — a line/area state inherited from another report reads as the bar', () => {
    expect(desk.includes("{chartType === 'pie' ? (")).toBe(true);
    // v2.474.0 re-key (dated): the shape learned its presses — the pie
    // call grew the lens door (onPress + pressedLabel, the segment's own
    // word riding the search lens); the call still reads the section's
    // own segments, and the bar still reads capitalByCategory.
    expect(desk.includes('<ConicPieChart\n                      segments={categorySegments}')).toBe(true);
    expect(desk.includes('onPress={(label) => setDeadStockSearch(label)}')).toBe(true);
    expect(desk.includes('data={capitalByCategory}')).toBe(true);
  });

  it('THE ASK COLUMN — the head word, the per-row handle, the double voice', () => {
    expect(desk.includes('<TableHead className="text-right">Ask</TableHead>')).toBe(true);
    expect(desk.includes('data-testid={`dead-stock-note-${i}`}')).toBe(true);
    expect(desk.includes('aria-label={`Copy clearance note for ${r.name}`}')).toBe(true);
    expect(desk.includes('title={`Copy clearance note for ${r.name}`}')).toBe(true);
    expect(desk.includes('<MessageCircle className="h-3.5 w-3.5 mr-1" /> Ask')).toBe(true);
    expect(desk.includes('onClick={() => copyClearanceNote(r)}')).toBe(true);
  });

  it('the clipboard door wears the inventory desk\u2019s own shape — the note rides out, the toast answers', () => {
    expect(desk.includes('await navigator.clipboard.writeText(deadStockClearanceNote(row, days));')).toBe(true);
    expect(desk.includes('toast.success(`Clearance note copied — ${row.name}`);')).toBe(true);
    expect(desk.includes("toast.error('Could not copy the clearance note — the clipboard refused.');")).toBe(true);
    // the composer is imported from the ONE home, never re-typed
    expect((desk.match(/function deadStockClearanceNote/g) ?? []).length).toBe(0);
    expect(desk.includes('deadStockClearanceNote')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE ONE HOME — the classifier carries both voices beside the tuple
// ---------------------------------------------------------------------------

describe('the classifier\u2019s home — one file, every voice', () => {
  const home = readFileSync(HOME, 'utf8');

  it('the two voices live beside the windows (the ONE home)', () => {
    expect(home.includes('export function capitalTiedByCategory')).toBe(true);
    expect(home.includes('export function deadStockClearanceNote')).toBe(true);
    expect(home.includes('export const DEAD_STOCK_WINDOWS')).toBe(true);
    expect(home.includes('v2.462.0 THE RESTING LEDGER LEARNS TO SHARE AND TO ASK')).toBe(true);
  });

  it('the windows are untouched — the lens\u2019s tuple still speaks its three words', () => {
    expect(DEAD_STOCK_WINDOWS).toEqual([30, 60, 90]);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.487.0');
    expect(head.title).toContain('resting ledger');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('category'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clipboard'))).toBe(true);
  });
});
