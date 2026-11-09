// THE FILE SINGS THE CHORUS WHOLE (v2.471.0): the collective clearance
// word grows its fifth door and the ledger's rows learn their own bars,
// proven without a database.
//
//   • THE CHORUS'S OWN HEADER — deadStockChorusHeader is the collective
//     census in one sentence (the count, the window, the capital at
//     cost), extracted in the ONE home from the byte it already was;
//     deadStockClearanceNotes rides it, so the clipboard's chorus and
//     every other door can never drift apart.
//   • THE FILE'S FOOTER — the dead-stock CSV grows the Clearance chorus
//     row after the summary block: the SAME ONE-home word, quoted like
//     every word a CSV must survive, never a re-typed twin on the desk.
//   • THE ROWS' OWN BARS — each Capital tied cell wears the summary
//     bar's own dialect (the bg-muted track, the rose-500 fill): the
//     row's share of the loudest row, drawn under the figure, purely
//     visual, aria-hidden — the number above IS the voice.
//   • THE FAMILY'S SEATS — the note and share columns, the summary's
//     elder bar and the section's census keep their bytes.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { deadStockChorusHeader, deadStockClearanceNote, deadStockClearanceNotes, type DeadStockRow } from '@/lib/reports/dead-stock';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const HOME = 'src/lib/reports/dead-stock.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');

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
// 1. THE CHORUS'S OWN HEADER — the collective census, one sentence
// ---------------------------------------------------------------------------

describe('deadStockChorusHeader — the collective word, one sentence', () => {
  it('the header speaks the census — count, window, capital at cost', () => {
    expect(deadStockChorusHeader([row()], 30)).toBe('Clearance asks — 1 product resting past the 30-day window (Ksh 48000.00 tied at cost):');
  });

  it('the count speaks its plural honestly', () => {
    expect(deadStockChorusHeader([row(), row({ productId: 'p2', capitalTied: 7200 })], 60)).toBe('Clearance asks — 2 products resting past the 60-day window (Ksh 55200.00 tied at cost):');
  });

  it('the capital wears the round2 convention — the summary card agrees', () => {
    expect(deadStockChorusHeader([row({ capitalTied: 100.005 }), row({ productId: 'p2', capitalTied: 100.004 })], 90)).toContain('Ksh 200.01 tied at cost');
  });

  it('the never-sold row and the empty ledger keep the composer honest', () => {
    expect(deadStockChorusHeader([], 30)).toBe('Clearance asks — 0 products resting past the 30-day window (Ksh 0.00 tied at cost):');
  });

  it('the clipboard\u2019s chorus rides the SAME word — never a re-typed twin', () => {
    const rows = [row(), row({ productId: 'p2', name: 'Cement Bag', sku: 'CEM-02', capitalTied: 7200 })];
    expect(deadStockClearanceNotes(rows, 45).split('\n')[0]).toBe(deadStockChorusHeader(rows, 45));
  });

  it('the extraction kept the chorus\u2019s bytes — header, then the rows\u2019 own notes', () => {
    const rows = [row()];
    expect(deadStockClearanceNotes(rows, 30)).toBe(
      deadStockChorusHeader(rows, 30) + '\n' + deadStockClearanceNote(rows[0], 30),
    );
  });

  it('the composer lives in the ONE home — the desk never spells the census sentence', () => {
    expect(home.includes('export function deadStockChorusHeader(rows: ReadonlyArray<DeadStockRow>, days: number): string {')).toBe(true);
    expect(desk.includes('resting past the ${days}-day window (Ksh ${capital.toFixed(2)} tied at cost):')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. THE FILE'S FOOTER — the CSV speaks the collective word
// ---------------------------------------------------------------------------

describe('the dead-stock CSV — the footer speaks the chorus whole', () => {
  it('the desk reads the word from the ONE home — the import rides the composer', () => {
    // v2.472.0 re-key (dated): the desk's ONE-home import grew the sort
    // door's own words (sortDeadStockRows + the DeadStockSortKey type) —
    // the composer still rides the same import line, now with the two
    // new riders aboard.
    // v2.473.0 re-key (dated): the import grew the search door's own
    // word (filterDeadStockRows rides the same line, between the share
    // URL and the sort door) — the composer still rides the same import
    // line, now with the lens aboard.
    // v2.475.0 re-key (dated): the import grew the view's own word
    // (deadStockViewSummary rides the same line, after the share URL) —
    // the composer still rides the same import line, now with the view's
    // mirror aboard.
    // v2.481.0 re-key (dated): the import grew the sort door's address
    // word (DEAD_STOCK_SORTS rides the line's head, before the window
    // tuple) — the composer still rides the same import line, now with
    // the ledger's own orders aboard.
    // v2.476.0 re-key (dated): the import grew the chorus's chat door
    // (deadStockChorusShareUrl rides the same line, after the chorus
    // header) — the composer still rides the same import line, now with
    // the collective reach-out aboard.
    expect(desk.includes("import { DEAD_STOCK_SORTS, DEAD_STOCK_WINDOWS, capitalTiedByCategory, deadStockChorusHeader, deadStockChorusShareUrl, deadStockClearanceNote, deadStockClearanceNotes, deadStockShareUrl, deadStockViewSummary, filterDeadStockRows, sortDeadStockRows, waMeDisplay, type DeadStockRow, type DeadStockSortKey } from '@/lib/reports/dead-stock';")).toBe(true);
  });

  it('the footer grows the Clearance chorus row — quoted, ONE-home word', () => {
    expect(desk.includes('csvContent += `Clearance chorus,"${deadStockChorusHeader(deadStockRows, deadStockSummary?.days ?? deadStockDays)}"\\n`;')).toBe(true);
  });

  it('the chorus row sits after the summary block — the census closes the file', () => {
    const shareLine = desk.indexOf('csvContent += `Dead share of stock value,${deadStockSummary?.deadSharePct ?? 0}%\\n`;');
    const chorusLine = desk.indexOf('csvContent += `Clearance chorus,"${deadStockChorusHeader(deadStockRows');
    expect(shareLine).toBeGreaterThan(-1);
    expect(chorusLine).toBeGreaterThan(shareLine);
  });

  it('the chorus row stays inside the dead-stock branch — the other reports untouched', () => {
    const chorusLine = desk.indexOf('csvContent += `Clearance chorus,"${deadStockChorusHeader(deadStockRows');
    const noData = desk.indexOf("csvContent = 'No data available for export\\n';");
    expect(chorusLine).toBeGreaterThan(-1);
    expect(chorusLine).toBeLessThan(noData);
  });

  it('the file\u2019s note and share columns keep their bytes — the elder word stands', () => {
    expect(desk.includes("'Product,SKU,Category,Qty on hand,Unit cost,Capital tied,Last sold,Days idle,Clearance note,Share link\\n'")).toBe(true);
    expect(desk.includes('deadStockShareUrl(r, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone)')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE ROWS' OWN BARS — the capital cell wears the family dialect
// ---------------------------------------------------------------------------

describe('the ledger\u2019s rows — the loudest debt, drawn', () => {
  it('the yardstick is the rows\u2019 own maximum — memoized, never a second wire', () => {
    expect(desk.includes('() => (rows.length > 0 ? Math.max(...rows.map((r) => r.capitalTied)) : 0),')).toBe(true);
    expect(desk.includes('[rows],')).toBe(true);
  });

  it('the track wears the summary bar\u2019s own dialect — muted, slim, named', () => {
    expect(desk.includes('<div aria-hidden="true" className="mt-1 h-1 rounded-full bg-muted overflow-hidden" data-testid={`dead-stock-capital-bar-${i}`}>')).toBe(true);
  });

  it('the fill wears the family word — rose-500, the clamped share', () => {
    expect(desk.includes('<div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, maxCapitalTied > 0 ? (r.capitalTied / maxCapitalTied) * 100 : 0))}%` }} />')).toBe(true);
  });

  it('the number keeps its voice — the figure above the bar in the same cell', () => {
    const cell = desk.indexOf('{formatKES(r.capitalTied)}');
    const bar = desk.indexOf('data-testid={`dead-stock-capital-bar-${i}`}');
    expect(cell).toBeGreaterThan(-1);
    expect(bar).toBeGreaterThan(cell);
  });

  it('the summary\u2019s elder bar keeps its bytes — the family\u2019s first word untouched', () => {
    expect(desk.includes('<div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden" aria-hidden="true" data-testid="dead-stock-share-bar">')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. WHATS-NEW — the file's chorus leads the feed
// ---------------------------------------------------------------------------

describe('whats-new — the file sings the chorus whole, pinned in the feed', () => {
  const head = WHATS_NEW.find((e) => e.version === '2.471.0');
  if (!head) throw new Error('the 2.471.0 entry is gone from the feed');

  it('the head wears the round\u2019s own story — the elder words and the new word', () => {
    expect(head.version).toBe('2.471.0');
    expect(head.title).toContain('resting ledger');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('the paper carries a scannable door');
    expect(head.title).toContain('the file sings the chorus whole');
  });

  it('the bullets speak the footer, the bars and the family\u2019s standing set', () => {
    const text = head.bullets.join(' ');
    expect(text).toContain('Clearance chorus');
    expect(text).toContain('footer');
    expect(text).toContain('ONE home');
    expect(text).toContain('bars');
    expect(text).toContain('loudest');
    expect(text).toContain('aria-hidden');
    expect(text).toContain('clearance note');
    expect(text).toContain('copy all');
    expect(text).toContain('share link');
    expect(text).toContain('scannable');
  });
});
