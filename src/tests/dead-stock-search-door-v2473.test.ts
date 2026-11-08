// THE LEDGER ANSWERS TO ITS OWN NAME (v2.473.0): the dead-stock
// ledger learns its search door, proven without a database.
//
//   • THE HONEST LENS — filterDeadStockRows in the ONE home: the words a
//     row already carries (the name, the SKU, the category) answered
//     case-insensitively; the trimmed word is the honest word; an empty
//     (or whitespace-only) lens RESTS and the whole ledger comes back in
//     its arrival order; a null category never crashes and never lies.
//     Pure and deterministic: a NEW array every time, the input never
//     mutated.
//   • THE COMPOSITION — the lens and the sort door compose in ONE memo
//     on the desk (filter first, then sort — a narrower shelf wearing
//     the same honest order); the ONE home composes, the desk never
//     hand-filters.
//   • THE DOOR'S OWN FACE — the lens input above the table (the family's
//     search glass, the double voice, the placeholder as the hint), the
//     clear × that only speaks when a word is pressed, the empty lens's
//     own honest face (the words, the whole size, the clear handle).
//   • THE VIEW/ARCHIVE LAW — the file (the CSV's footer), the clipboard's
//     copy all chorus and the print door keep the canonical rows: the
//     lens is a viewer, never a rewrite.
//   • THE COUNT ANSWERS THE LENS — the badge speaks the honest fraction
//     ("2 of 6 products") while the lens is pressed, the whole size when
//     it rests.
//   • THE FEED — the head wears the round's own story and the union of
//     every living pin.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { filterDeadStockRows, sortDeadStockRows, type DeadStockRow } from '@/lib/reports/dead-stock';
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
// 1. THE HONEST LENS — the ONE home composes, NaN-free, crash-free
// ---------------------------------------------------------------------------

describe('filterDeadStockRows — the honest lens', () => {
  const cement = row({ productId: 'a', name: 'Cement 32N', sku: 'CEM-01', categoryName: 'Building' });
  const hammer = row({ productId: 'b', name: 'Claw Hammer', sku: 'HMR-04', categoryName: 'Tools' });
  const bag = row({ productId: 'c', name: 'Sleeping Bag', sku: 'SLP-01', categoryName: 'Camping' });
  const orphan = row({ productId: 'd', name: 'Anvil', sku: 'ANV-9', categoryName: null });

  it('the name answers — the lens speaks the words a row already carries', () => {
    expect(filterDeadStockRows([cement, hammer, bag], 'cement').map((r) => r.productId)).toEqual(['a']);
  });

  it('the SKU answers — the maker\u2019s own label is a question', () => {
    expect(filterDeadStockRows([cement, hammer, bag], 'HMR').map((r) => r.productId)).toEqual(['b']);
  });

  it('the category answers — the shelf\u2019s own family is a question', () => {
    expect(filterDeadStockRows([cement, hammer, bag], 'camping').map((r) => r.productId)).toEqual(['c']);
  });

  it('the case never matters — the shelf\u2019s casing is the shelf\u2019s business', () => {
    expect(filterDeadStockRows([cement, hammer], 'CEM').map((r) => r.productId)).toEqual(['a']);
    expect(filterDeadStockRows([cement, hammer], 'cEm-01').map((r) => r.productId)).toEqual(['a']);
  });

  it('the trimmed word is the honest word — padding never narrows the answer', () => {
    expect(filterDeadStockRows([cement, hammer], '  cement  ').map((r) => r.productId)).toEqual(['a']);
  });

  it('a partial word answers — the lens answers as the maker types', () => {
    expect(filterDeadStockRows([cement, hammer], 'cem').map((r) => r.productId)).toEqual(['a']);
  });

  it('an empty lens RESTS — the whole ledger comes back in its arrival order', () => {
    const arrival = [hammer, cement, bag];
    expect(filterDeadStockRows(arrival, '').map((r) => r.productId)).toEqual(['b', 'a', 'c']);
    expect(filterDeadStockRows(arrival, '   ').map((r) => r.productId)).toEqual(['b', 'a', 'c']);
  });

  it('a word no row carries answers empty — honestly', () => {
    expect(filterDeadStockRows([cement, hammer], 'paint')).toEqual([]);
  });

  it('a null category never crashes and never lies — the row answers on its name and SKU', () => {
    expect(filterDeadStockRows([orphan], 'anvil').map((r) => r.productId)).toEqual(['d']);
    expect(filterDeadStockRows([orphan], 'ANV-9').map((r) => r.productId)).toEqual(['d']);
    // v2.474.0 re-key (dated): the shape's word joined the lens — the
    // ledger's own "Uncategorised" word (the word the capital-shape
    // chart already calls the unnamed shelf) now ANSWERS, so a chart
    // press that rides it can never draw an empty answer. The row still
    // answers on its name and SKU besides.
    expect(filterDeadStockRows([orphan], 'uncategorised').map((r) => r.productId)).toEqual(['d']);
    expect(filterDeadStockRows([orphan], 'uncat').map((r) => r.productId)).toEqual(['d']);
  });

  it('the lens is pure — the input array keeps its own order, a NEW array every time', () => {
    const input = [hammer, cement, bag];
    const snapshot = JSON.stringify(input);
    const rested = filterDeadStockRows(input, '');
    const asked = filterDeadStockRows(input, 'cement');
    expect(JSON.stringify(input)).toBe(snapshot);
    expect(rested).not.toBe(input);
    expect(asked).not.toBe(input);
    expect(rested).toEqual(input);
  });

  it('the lens is deterministic — the same rows and word draw the same answer twice', () => {
    const input = [hammer, cement, bag, orphan];
    const first = JSON.stringify(filterDeadStockRows(input, 'cem').map((r) => r.productId));
    const second = JSON.stringify(filterDeadStockRows(input, 'cem').map((r) => r.productId));
    expect(first).toBe(second);
  });

  it('an empty ledger answers empty at every lens', () => {
    expect(filterDeadStockRows([], 'cement')).toEqual([]);
    expect(filterDeadStockRows([], '')).toEqual([]);
  });

  it('the composition — filter first, then the sort door leads the narrower shelf', () => {
    const loud = row({ productId: 'l', name: 'Cement 42N', sku: 'CEM-42', capitalTied: 90000, daysIdle: 40, lastSoldAt: '2025-10-01T00:00:00.000Z' });
    const old = row({ productId: 'o', name: 'Cement 32N', sku: 'CEM-32', capitalTied: 5000, daysIdle: 300, lastSoldAt: '2025-01-01T00:00:00.000Z' });
    const never = row({ productId: 'n', name: 'Cement Dust', sku: 'CD-1', capitalTied: 500, daysIdle: null, lastSoldAt: null });
    const other = row({ productId: 'x', name: 'Hammer', sku: 'HMR-4', capitalTied: 80000, daysIdle: 350, lastSoldAt: '2025-01-05T00:00:00.000Z' });
    const answer = sortDeadStockRows(filterDeadStockRows([loud, old, never, other], 'cem'), 'idle');
    expect(answer.map((r) => r.productId)).toEqual(['n', 'o', 'l']);
  });
});

// ---------------------------------------------------------------------------
// 2. THE DOOR'S OWN FACE — the desk presses, the ONE home composes
// ---------------------------------------------------------------------------

describe('the search door — the desk\u2019s own face', () => {
  it('the lens lives in the ONE home — the desk imports, never hand-filters', () => {
    expect(desk.includes('filterDeadStockRows, sortDeadStockRows, waMeDisplay')).toBe(true);
    expect(home.includes('export function filterDeadStockRows(')).toBe(true);
    expect(home.includes('const needle = query.trim().toLowerCase();')).toBe(true);
  });

  it('the two lenses compose in ONE memo — filter first, then sort, nothing else', () => {
    expect(desk.includes('sortDeadStockRows(filterDeadStockRows(rows, deadStockSearch), deadStockSort)')).toBe(true);
    expect(desk.includes('[rows, deadStockSearch, deadStockSort]')).toBe(true);
    expect((desk.match(/filterDeadStockRows\(rows,/g) ?? []).length).toBe(1);
    expect(desk.includes("useState('')")).toBe(true);
  });

  it('the lens input wears its own face — the glass, the double voice, the hint', () => {
    expect(desk.includes('data-testid="dead-stock-search"')).toBe(true);
    expect(desk.includes('aria-label="Search the ledger by name, SKU or category"')).toBe(true);
    expect(desk.includes('placeholder="Search name, SKU or category"')).toBe(true);
    expect(desk.includes('<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />')).toBe(true);
    expect(desk.includes('focus-visible:ring-2 focus-visible:ring-ring')).toBe(true);
  });

  it('the clear \u00d7 only speaks when a word is pressed — a clear button on an empty lens would be a lie', () => {
    expect(desk.includes('data-testid="dead-stock-search-clear"')).toBe(true);
    expect(desk.includes('aria-label="Clear the ledger search"')).toBe(true);
    expect(desk.includes('title="Clear the ledger search"')).toBe(true);
    expect(desk.includes("{deadStockSearch.trim() !== '' && (")).toBe(true);
  });

  it('the empty lens answers honestly — the words, the whole size, the clear handle', () => {
    expect(desk.includes('data-testid="dead-stock-lens-empty"')).toBe(true);
    expect(desk.includes('No product answers to “{deadStockSearch.trim()}”')).toBe(true);
    expect(desk.includes('The lens rests empty — the ledger keeps all {rows.length} resting products')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-lens-clear"')).toBe(true);
    expect(desk.includes('aria-label="Clear the ledger search and see every resting product"')).toBe(true);
    expect(desk.includes('<PackageSearch className="h-5 w-5 text-muted-foreground" aria-hidden="true" />')).toBe(true);
    expect(desk.includes('<TableCell colSpan={8} className="py-10">')).toBe(true);
  });

  it('THE COUNT ANSWERS THE LENS — the honest fraction, the whole size at rest', () => {
    expect(desk.includes('{deadStockSearch.trim() ? `${sortedRows.length} of ${rows.length} products` : `${rows.length} products`}')).toBe(true);
  });

  it('THE VIEW/ARCHIVE LAW — the file and the clipboard keep the canonical rows', () => {
    expect(desk.includes('deadStockClearanceNotes(rows, days)')).toBe(true);
    expect(desk.includes('deadStockChorusHeader(deadStockRows, deadStockSummary?.days ?? deadStockDays)')).toBe(true);
    expect((desk.match(/deadStockRows\.forEach\(\(r\) => \{/g) ?? []).length).toBe(1);
    expect((desk.match(/filterDeadStockRows\(deadStockRows/g) ?? []).length).toBe(0);
    expect((desk.match(/sortedRows\.map/g) ?? []).length).toBe(1);
  });

  it('the elder faces keep their seats — the sort door, the chip, the bars, the copy all', () => {
    expect(desk.includes('data-testid="dead-stock-sort-capital"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-sort-idle"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-share-addressed"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-copy-all"')).toBe(true);
    expect(desk.includes('data-testid={`dead-stock-capital-bar-${i}`}')).toBe(true);
    expect(desk.includes("data-testid={`dead-stock-row-${i}`}")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE FEED — the head wears the round's own story
// ---------------------------------------------------------------------------

describe('whats-new — the search door, pinned in the feed', () => {
  const head = WHATS_NEW.find((e) => e.version === '2.473.0');
  if (!head) throw new Error('the 2.473.0 entry is gone from the feed');

  it('the head wears the round\u2019s own story — the elder words and the new word', () => {
    expect(head.version).toBe('2.473.0');
    expect(head.title).toContain('resting ledger');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('the paper carries a scannable door');
    expect(head.title).toContain('the file sings the chorus whole');
    expect(head.title).toContain('the ledger answers to its own columns');
    expect(head.title).toContain('the ledger answers to its own name');
  });

  it('the bullets speak the search door, the lens law and the family\u2019s standing set', () => {
    const text = head.bullets.join(' ');
    expect(text).toContain('search door');
    expect(text).toContain('filterDeadStockRows');
    expect(text).toContain('name, the SKU, the category');
    expect(text).toContain('ONE home');
    expect(text).toContain('canonical rows');
    expect(text).toContain('Clearance chorus');
    expect(text).toContain('share link');
    expect(text).toContain('copy all');
    expect(text).toContain('clipboard');
    expect(text).toContain('file');
    expect(text).toContain('share door');
    expect(text).toContain('wa.me');
    expect(text).toContain('pre-addressed');
    expect(text).toContain('chat picker');
    expect(text).toContain('edit door');
    expect(text).toContain('clearance note');
    expect(text).toContain('clearance asks');
    expect(text).toContain('print button');
    expect(text).toContain('category');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
  });
});
