// THE LEDGER ANSWERS TO ITS OWN COLUMNS (v2.472.0): the dead-stock
// ledger learns its sort door, proven without a database.
//
//   • THE TWO HONEST ORDERS — sortDeadStockRows in the ONE home: the
//     capital order is the classifier's own standing word (the loudest
//     debt first, name tiebreak); the idle order is the shelf's
//     patience (longest idle first, the never-sold row standing at the
//     FRONT — its null is a voice, not a zero), ties breaking by the
//     louder debt then the name. Deterministic, NaN-free, and pure:
//     the input array is never mutated.
//   • THE DOOR'S OWN FACE — the desk's Capital tied and Days idle
//     headers carry the double voice (aria-label + title), aria-sort
//     speaking the pressed column, the family's ArrowDown pressed and
//     ChevronsUpDown resting; the body reads the pressed order.
//   • THE VIEW/ARCHIVE LAW — the file (the CSV's footer), the
//     clipboard's copy all chorus and the print door keep the
//     canonical rows: the sort is a lens, never a rewrite.
//   • THE STAT CARDS' WHISPERS — the coins, the empty shelf and the
//     percent join their labels at the family's small size, aria-hidden
//     (the words above are the voice).
//   • THE FEED — the head wears the round's own story and the union of
//     every living pin.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { sortDeadStockRows, type DeadStockRow } from '@/lib/reports/dead-stock';
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
// 1. THE TWO HONEST ORDERS — the ONE home composes, NaN-free
// ---------------------------------------------------------------------------

describe('sortDeadStockRows — the two honest orders', () => {
  const loudest = row({ productId: 'a', name: 'Cement', capitalTied: 96000, daysIdle: 200, lastSoldAt: '2025-03-01T00:00:00.000Z' });
  const middle = row({ productId: 'b', name: 'Hammer', capitalTied: 12000, daysIdle: 45, lastSoldAt: '2025-09-01T00:00:00.000Z' });
  const quiet = row({ productId: 'c', name: 'Brush', capitalTied: 3000, daysIdle: 310, lastSoldAt: '2024-12-01T00:00:00.000Z' });
  const never1 = row({ productId: 'd', name: 'Anvil', capitalTied: 5000, daysIdle: null, lastSoldAt: null });
  const never2 = row({ productId: 'e', name: 'Bellows', capitalTied: 700, daysIdle: null, lastSoldAt: null });

  it('the capital order is the classifier\u2019s own standing word — loudest first, name tiebreak', () => {
    const shuffled = [middle, quiet, loudest];
    const sorted = sortDeadStockRows(shuffled, 'capital');
    expect(sorted.map((r) => r.productId)).toEqual(['a', 'b', 'c']);
  });

  it('the idle order speaks the shelf\u2019s patience — longest idle first', () => {
    const sorted = sortDeadStockRows([middle, quiet, loudest], 'idle');
    expect(sorted.map((r) => r.productId)).toEqual(['c', 'a', 'b']);
  });

  it('the never-sold row stands at the FRONT of the idle order — null is a voice, not a zero', () => {
    const sorted = sortDeadStockRows([middle, never1, loudest], 'idle');
    expect(sorted.map((r) => r.productId)).toEqual(['d', 'a', 'b']);
  });

  it('two never-sold rows never NaN — the louder debt speaks first, then the name', () => {
    const sorted = sortDeadStockRows([never2, never1], 'idle');
    expect(sorted.map((r) => r.productId)).toEqual(['d', 'e']);
  });

  it('the idle tiebreak: equal idle wears the louder debt, equal debt wears the name (ASC)', () => {
    const tieHigh = row({ productId: 't1', name: 'Zebra Tie', capitalTied: 8000, daysIdle: 90, lastSoldAt: '2025-06-01T00:00:00.000Z' });
    const tieLow = row({ productId: 't2', name: 'Alpha Tie', capitalTied: 8000, daysIdle: 90, lastSoldAt: '2025-06-01T00:00:00.000Z' });
    const sorted = sortDeadStockRows([tieLow, tieHigh], 'idle');
    expect(sorted.map((r) => r.productId)).toEqual(['t2', 't1']);
  });

  it('the sort is pure — the input array keeps its own order', () => {
    const input = [middle, loudest, quiet];
    const snapshot = JSON.stringify(input);
    sortDeadStockRows(input, 'idle');
    sortDeadStockRows(input, 'capital');
    expect(JSON.stringify(input)).toBe(snapshot);
  });

  it('the sort is deterministic — the same rows draw the same order twice', () => {
    const input = [quiet, never1, middle, loudest, never2];
    const first = JSON.stringify(sortDeadStockRows(input, 'idle').map((r) => r.productId));
    const second = JSON.stringify(sortDeadStockRows(input, 'idle').map((r) => r.productId));
    expect(first).toBe(second);
  });

  it('an empty ledger answers empty, a single row answers itself', () => {
    expect(sortDeadStockRows([], 'idle')).toEqual([]);
    expect(sortDeadStockRows([], 'capital')).toEqual([]);
    expect(sortDeadStockRows([middle], 'idle')).toEqual([middle]);
  });
});

// ---------------------------------------------------------------------------
// 2. THE DOOR'S OWN FACE — the desk presses, the ONE home composes
// ---------------------------------------------------------------------------

describe('the sort door — the desk\u2019s own face', () => {
  it('the orders live in the ONE home — the desk imports, never hand-sorts', () => {
    // v2.473.0 re-key (dated): the desk's ONE-home import grew the search
    // door's own word (filterDeadStockRows rides the same line, between
    // the share URL and the sort door) — the composer still rides the
    // same import line, now with the lens aboard.
    expect(desk.includes('filterDeadStockRows, sortDeadStockRows, waMeDisplay')).toBe(true);
    expect(desk.includes('type DeadStockSortKey')).toBe(true);
    expect(home.includes('export function sortDeadStockRows(')).toBe(true);
    expect(home.includes("export type DeadStockSortKey = 'capital' | 'idle';")).toBe(true);
  });

  it('the resting face is capital — the desk opens exactly as it always has', () => {
    expect(desk.includes("useState<DeadStockSortKey>('capital')")).toBe(true);
    // v2.473.0 re-key (dated): the memo composes the two lenses now —
    // the search door's filter first, then the sort door's order (the
    // ONE home composes both; the desk never hand-filters either) — and
    // the memo rides [rows, deadStockSearch, deadStockSort] and nothing
    // else. The resting faces are unchanged: the lens rests empty and
    // the sort rests capital, so the desk opens byte-for-byte as it
    // always has.
    expect(desk.includes('sortDeadStockRows(filterDeadStockRows(rows, deadStockSearch), deadStockSort)')).toBe(true);
    expect(desk.includes('[rows, deadStockSearch, deadStockSort]')).toBe(true);
  });

  it('the two headers carry the double voice — aria-label and title', () => {
    expect(desk.includes('data-testid="dead-stock-sort-capital"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-sort-idle"')).toBe(true);
    expect(desk.includes('aria-label="Sort the ledger by capital tied, the loudest debt first"')).toBe(true);
    expect(desk.includes('title="Sort the ledger by capital tied, the loudest debt first"')).toBe(true);
    expect(desk.includes('aria-label="Sort the ledger by days idle, the never-sold first"')).toBe(true);
    expect(desk.includes('title="Sort the ledger by days idle, the never-sold first"')).toBe(true);
  });

  it('the pressed column speaks aria-sort — descending, and only while pressed', () => {
    expect(desk.includes("aria-sort={deadStockSort === 'capital' ? 'descending' : undefined}")).toBe(true);
    expect(desk.includes("aria-sort={deadStockSort === 'idle' ? 'descending' : undefined}")).toBe(true);
  });

  it('the family\u2019s arrows — ArrowDown pressed, ChevronsUpDown resting', () => {
    expect(desk.includes("deadStockSort === 'capital'\n                              ? <ArrowDown")).toBe(true);
    expect(desk.includes("deadStockSort === 'idle'\n                              ? <ArrowDown")).toBe(true);
    expect((desk.match(/<ChevronsUpDown className="h-3 w-3 opacity-60" aria-hidden="true" \/>/g) ?? []).length).toBe(2);
  });

  it('the pressed face wears the foreground weight, the resting one the muted tone', () => {
    expect(desk.includes("deadStockSort === 'capital' ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'")).toBe(true);
    expect(desk.includes("deadStockSort === 'idle' ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'")).toBe(true);
  });

  it('the body reads the pressed order', () => {
    expect(desk.includes('sortedRows.map((r, i) => {')).toBe(true);
    expect((desk.match(/sortedRows\.map/g) ?? []).length).toBe(1);
  });

  it('THE VIEW/ARCHIVE LAW — the file and the clipboard keep the canonical rows', () => {
    expect(desk.includes('deadStockClearanceNotes(rows, days)')).toBe(true);
    expect(desk.includes('deadStockChorusHeader(deadStockRows, deadStockSummary?.days ?? deadStockDays)')).toBe(true);
    expect((desk.match(/deadStockRows\.forEach\(\(r\) => \{/g) ?? []).length).toBe(1);
    expect((desk.match(/sortDeadStockRows\(deadStockRows/g) ?? []).length).toBe(0);
  });

  it('the stat cards wear their whispers — the small icons, aria-hidden', () => {
    expect(desk.includes('<Coins className="h-3 w-3" aria-hidden="true" /> Capital Tied')).toBe(true);
    expect(desk.includes('<PackageX className="h-3 w-3" aria-hidden="true" /> Dead Products')).toBe(true);
    expect(desk.includes('<Percent className="h-3 w-3" aria-hidden="true" /> Share of Stock Value')).toBe(true);
  });

  it('the elder faces keep their seats — the bars, the count badge, the copy all handle', () => {
    expect(desk.includes('data-testid="dead-stock-copy-all"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-ledger-count"')).toBe(true);
    expect(desk.includes('data-testid={`dead-stock-capital-bar-${i}`}')).toBe(true);
    expect(desk.includes("data-testid={`dead-stock-row-${i}`}")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE FEED — the head wears the round's own story
// ---------------------------------------------------------------------------

describe('whats-new — the sort door, pinned in the feed', () => {
  const head = WHATS_NEW.find((e) => e.version === '2.472.0');
  if (!head) throw new Error('the 2.472.0 entry is gone from the feed');

  it('the head wears the round\u2019s own story — the elder words and the new word', () => {
    expect(head.version).toBe('2.472.0');
    expect(head.title).toContain('resting ledger');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('the paper carries a scannable door');
    expect(head.title).toContain('the file sings the chorus whole');
    expect(head.title).toContain('the ledger answers to its own columns');
  });

  it('the bullets speak the sort door, the lens law and the family\u2019s standing set', () => {
    const text = head.bullets.join(' ');
    expect(text).toContain('sort door');
    expect(text).toContain('sortDeadStockRows');
    expect(text).toContain('never-sold');
    expect(text).toContain('aria-sort');
    expect(text).toContain('ONE home');
    expect(text).toContain('canonical order');
    expect(text).toContain('Clearance chorus');
    expect(text).toContain('footer');
    expect(text).toContain('copy all');
    expect(text).toContain('share link');
    expect(text).toContain('scannable');
    expect(text).toContain('bars');
    expect(text).toContain('loudest');
    expect(text).toContain('aria-hidden');
    expect(text).toContain('clearance note');
    expect(text).toContain('pre-addressed');
    expect(text).toContain('chat picker');
    expect(text).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
  });
});
