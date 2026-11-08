// THE VIEW SPEAKS ITS OWN WORD (v2.475.0): the pressed lens learns its
// own mirror, proven without a database.
//
//   • THE ONE HOME'S WORD — deadStockViewSummary composes the view's
//     count, the view's own capital at cost and the view's slice of the
//     ledger's rest, pure and deterministic, the honest-share law worn
//     (a zero ledger shares ZERO, never NaN).
//   • THE DESK'S OWN FACE — a footer under the table speaks the honest
//     fraction, the view's capital (the rose word) and the slice drawn
//     in the share-bar's own dialect, the window lens's amber ground
//     dressing the strip; the word only sounds while the lens is pressed
//     AND rows answer. A spoken voice, never a handle — the census keeps
//     its nine.
//   • THE VIEW/ARCHIVE LAW, UNTOUCHED — the file, the clipboard's copy
//     all chorus and the print door keep the canonical rows; the word is
//     the VIEW's own.
//   • THE FEED — the head wears the round's own story and the union of
//     every living pin.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { deadStockViewSummary, type DeadStockRow } from '@/lib/reports/dead-stock';
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
// 1. THE ONE HOME'S WORD — deadStockViewSummary
// ---------------------------------------------------------------------------

describe('deadStockViewSummary — the view\u2019s own arithmetic', () => {
  const ledger = [
    row({ productId: 'a', name: 'Cement 32N', capitalTied: 48000 }),
    row({ productId: 'b', name: 'Claw Hammer', capitalTied: 12000.555 }),
    row({ productId: 'c', name: 'Wheelbarrow', capitalTied: 9000 }),
  ];

  it('the view\u2019s count, capital and slice compose from the rows\u2019 own numbers', () => {
    const view = [ledger[0], ledger[2]];
    const word = deadStockViewSummary(view, ledger);
    expect(word.count).toBe(2);
    expect(word.capital).toBe(57000);
    expect(word.sharePct).toBe(82.6); // 57000 / 69000.56 — one decimal, the honest word
  });

  it('the capital wears the round2 convention the summary card speaks', () => {
    const word = deadStockViewSummary([ledger[1]], ledger);
    expect(word.capital).toBe(12000.56); // 12000.555 → round2
  });

  it('the whole view speaks one hundred — the ledger\u2019s own slice', () => {
    const word = deadStockViewSummary(ledger, ledger);
    expect(word.count).toBe(3);
    expect(word.sharePct).toBe(100);
  });

  it('a zero ledger shares ZERO — never NaN (the honest-share law)', () => {
    const word = deadStockViewSummary([ledger[0]], []);
    expect(word.count).toBe(1);
    expect(word.capital).toBe(48000);
    expect(word.sharePct).toBe(0);
    expect(Number.isNaN(word.sharePct)).toBe(false);
  });

  it('an empty view speaks zero three times over', () => {
    const word = deadStockViewSummary([], ledger);
    expect(word.count).toBe(0);
    expect(word.capital).toBe(0);
    expect(word.sharePct).toBe(0);
  });

  it('the word is pure — neither array is ever mutated, a fresh object every call', () => {
    const view = [ledger[0]];
    const ledgerSnapshot = JSON.stringify(ledger);
    const viewSnapshot = JSON.stringify(view);
    const first = deadStockViewSummary(view, ledger);
    const second = deadStockViewSummary(view, ledger);
    expect(JSON.stringify(ledger)).toBe(ledgerSnapshot);
    expect(JSON.stringify(view)).toBe(viewSnapshot);
    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });

  it('the word is deterministic — the same rows always draw the same answer', () => {
    const view = [ledger[1], ledger[2]];
    expect(JSON.stringify(deadStockViewSummary(view, ledger)))
      .toBe(JSON.stringify(deadStockViewSummary(view, ledger)));
  });

  it('the ONE home wears the view\u2019s word in its own bytes', () => {
    expect(home.includes('export function deadStockViewSummary(')).toBe(true);
    expect(home.includes('export interface DeadStockViewSummary {')).toBe(true);
    expect(home.includes('v2.475.0 THE VIEW SPEAKS ITS OWN WORD')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S OWN FACE — the footer under the table
// ---------------------------------------------------------------------------

describe('the view\u2019s own word — the desk\u2019s own face', () => {
  it('the footer stands under the table with its own face', () => {
    expect(desk.includes('data-testid="dead-stock-view-voice"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-view-slice"')).toBe(true);
    expect(desk.includes('rounded-md border border-amber-200/70 bg-amber-50/60')).toBe(true);
    expect(desk.includes('dark:border-amber-900/60 dark:bg-amber-950/20')).toBe(true);
  });

  it('the footer speaks the honest fraction, the rose capital and the slice', () => {
    expect(desk.includes('products in view')).toBe(true);
    expect(desk.includes('tied in view')).toBe(true);
    expect(desk.includes('% of the ledger\u2019s rest')).toBe(true);
    expect(desk.includes('text-rose-700 dark:text-rose-400 tabular-nums')).toBe(true);
    expect(desk.includes('aria-live="polite"')).toBe(true);
  });

  it('the slice bar wears the share-bar\u2019s own dialect — aria-hidden, the rose fill', () => {
    expect(desk.includes('mt-1.5 h-1 rounded-full bg-muted overflow-hidden')).toBe(true);
    expect(desk.includes('h-full rounded-full bg-rose-500 transition-all')).toBe(true);
    expect(desk.includes('Math.min(100, Math.max(0, viewVoice.sharePct))')).toBe(true);
  });

  it('the word only sounds while the lens is pressed AND rows answer — the gate', () => {
    expect(desk.includes('const lensPressed = deadStockSearch.trim() !== \'\';')).toBe(true);
    expect(desk.includes('{lensPressed && sortedRows.length > 0 && (')).toBe(true);
  });

  it('the ONE home composes — the desk imports, never hand-sums', () => {
    expect(desk.includes('deadStockViewSummary, filterDeadStockRows')).toBe(true);
    expect(desk.includes('() => deadStockViewSummary(sortedRows, rows),')).toBe(true);
    expect(desk.includes('[sortedRows, rows],')).toBe(true);
    expect((desk.match(/reduce\(\(s, r\) => s \+ r\.capitalTied/g) ?? []).length).toBe(0);
  });

  it('THE VIEW/ARCHIVE LAW, UNTOUCHED — the archive keeps the canonical rows', () => {
    expect(desk.includes('deadStockClearanceNotes(rows, days)')).toBe(true);
    expect(desk.includes('const capitalByCategory = useMemo(() => capitalTiedByCategory(rows), [rows]);')).toBe(true);
    expect((desk.match(/deadStockClearanceNotes\(sortedRows/g) ?? []).length).toBe(0);
    expect((desk.match(/capitalTiedByCategory\(sortedRows\)/g) ?? []).length).toBe(0);
  });

  it('a spoken word, never a handle — the census keeps its nine', () => {
    const section = desk.slice(desk.indexOf('function DeadStockSection'), desk.indexOf('// Main Reports Tab Component'));
    expect(section.split('aria-label=').length - 1).toBe(9);
    expect(section).not.toContain('aria-pressed');
    expect(section.includes('data-testid="dead-stock-view-voice"')).toBe(true);
  });

  it('the elder faces keep their seats — the lens, the doors, the badge, the charts', () => {
    expect(desk.includes('data-testid="dead-stock-search"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-search-clear"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-lens-empty"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-lens-clear"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-sort-capital"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-sort-idle"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-copy-all"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-chart-pie"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-chart-bar"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-ledger-count"')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE FEED — the head wears the round's own story
// ---------------------------------------------------------------------------

describe('whats-new — the view leads the feed', () => {
  const head = WHATS_NEW[0];

  it('the head wears the round\u2019s own story — the elder words and the new word', () => {
    expect(head.version).toBe('2.475.0');
    expect(head.title).toContain('resting ledger');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('the paper carries a scannable door');
    expect(head.title).toContain('the file sings the chorus whole');
    expect(head.title).toContain('the ledger answers to its own columns');
    expect(head.title).toContain('the ledger answers to its own name');
    expect(head.title).toContain('the shape answers to the ledger');
    expect(head.title).toContain('the view speaks its own word');
  });

  it('the bullets speak the view\u2019s word, the ONE home and the family\u2019s standing set', () => {
    const text = head.bullets.join(' ');
    expect(text).toContain('in view');
    expect(text).toContain('tied in view');
    expect(text).toContain('ledger\u2019s rest');
    expect(text).toContain('share-bar');
    expect(text).toContain('amber');
    expect(text).toContain('aria-live');
    expect(text).toContain('ONE home');
    expect(text).toContain('deadStockViewSummary');
    expect(text).toContain('round2');
    expect(text).toContain('NaN');
    expect(text).toContain('canonical rows');
    expect(text).toContain('nine');
    expect(text).toContain('search lens');
    expect(text).toContain('sort door');
    expect(text).toContain('edit door');
    expect(text).toContain('pre-addressed');
    expect(text).toContain('clearance note');
    expect(text).toContain('chat picker');
    expect(text).toContain('wa.me');
    expect(text).toContain('copy all');
    expect(text).toContain('print button');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
  });
});
