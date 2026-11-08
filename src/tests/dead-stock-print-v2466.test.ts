// THE CHORUS TAKES THE PRINT DOOR (v2.466.0): the clearance note's fifth
// door, proven without a database.
//
//   • THE PRINT'S CHORUS APPENDIX — on the dead-stock stage the printed
//     page closes with the clearance asks: the collective composer's OWN
//     word (the ONE home's header line over every row's note), escaped
//     for the print window, wearing the rose family in the print
//     window's own inline CSS. One voice, five doors.
//   • THE PRINT BUTTON SPEAKS ITS PAGE — the double voice on the
//     dead-stock stage, the plain face everywhere else.
//   • THE PRINT WINDOW'S HONESTY — a blocked print window speaks its
//     side; silence is retired (the share door's popup-blocked law).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { deadStockClearanceNotes, type DeadStockRow } from '@/lib/reports/dead-stock';
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
// 1. THE PRINT'S CHORUS APPENDIX — the collective word rides the paper
// ---------------------------------------------------------------------------

describe('the dead-stock print — the chorus appendix', () => {
  it('the appendix is composed from the ONE home — never re-typed in the desk', () => {
    expect(desk.includes('const word = deadStockClearanceNotes(deadStockRows, deadStockSummary?.days ?? deadStockDays);')).toBe(true);
    expect((desk.match(/function deadStockClearanceNotes/g) ?? []).length).toBe(0);
    expect(home.includes('export function deadStockClearanceNotes')).toBe(true);
  });

  it('the appendix rides only for the dead-stock stage with rows on it', () => {
    expect(desk.includes("const chorusAppendix = reportType === 'dead_stock' && deadStockRows.length > 0")).toBe(true);
  });

  it('the appendix speaks the chorus — heading, intro, ordered asks', () => {
    expect(desk.includes('<h3>Clearance asks — the ledger\u2019s chorus</h3>')).toBe(true);
    expect(desk.includes('<p class="chorus-intro">${escapePrintWord(intro)}</p>')).toBe(true);
    expect(desk.includes('${asks.map((ask) => `<li>${escapePrintWord(ask)}</li>`).join')).toBe(true);
  });

  it('every printed word is escaped — the honest escape for the print window', () => {
    expect(desk.includes(".replaceAll('&', '&amp;')")).toBe(true);
    expect(desk.includes(".replaceAll('<', '&lt;')")).toBe(true);
    expect(desk.includes(".replaceAll('>', '&gt;')")).toBe(true);
    expect(desk.includes(".replaceAll('\"', '&quot;')")).toBe(true);
  });

  it('the appendix wears the rose family — the print window\u2019s own inline CSS, never a second palette', () => {
    expect(desk.includes('.chorus { margin-top: 28px; border-top: 2px solid #fecdd3; padding-top: 16px; }')).toBe(true);
    expect(desk.includes('.chorus h3 { font-size: 14px; color: #be123c; margin: 0 0 4px; }')).toBe(true);
    expect(desk.includes('.chorus-intro { color: #64748b; font-size: 12px; margin: 0 0 10px; }')).toBe(true);
  });

  it('the appendix lands after the report body — the page closes with the chorus', () => {
    expect(desk.includes('${content.innerHTML}\n          ${scanAppendix}\n          ${chorusAppendix}')).toBe(true);
  });

  it('the composer\u2019s word is the printed word — header line, then every row\u2019s note', () => {
    const rows = [row(), row({ productId: 'p2', name: 'Cement Bag', sku: 'CEM-02', capitalTied: 7200, lastSoldAt: null, daysIdle: null })];
    const word = deadStockClearanceNotes(rows, 30);
    const [intro, ...asks] = word.split('\n');
    expect(intro).toContain('2 products resting past the 30-day window');
    expect(asks.length).toBe(2);
    expect(asks[0]).toContain('Clearance ask — 40 PIECE × Sleeping Bag');
  });
});

// ---------------------------------------------------------------------------
// 2. THE PRINT BUTTON SPEAKS ITS PAGE — the double voice, the plain face
// ---------------------------------------------------------------------------

describe('the print button — the page\u2019s weight, spoken when dead stock is on stage', () => {
  it('the dead-stock stage names the asks in the title', () => {
    expect(desk.includes("reportType === 'dead_stock' ? 'Prints the ledger rows with the clearance asks attached' : undefined")).toBe(true);
  });

  it('the accessible name speaks the asks only for the dead-stock report', () => {
    expect(desk.includes("aria-label={reportType === 'dead_stock' ? 'Print PDF with clearance asks' : undefined}")).toBe(true);
  });

  it('the CSV button\u2019s own double voice stands untouched beside it', () => {
    expect(desk.includes("aria-label={reportType === 'dead_stock' ? 'Export CSV with clearance notes' : undefined}")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE PRINT WINDOW'S HONESTY — silence is retired
// ---------------------------------------------------------------------------

describe('the blocked print window — the toast speaks its side', () => {
  it('a refused print window no longer answers silence', () => {
    expect(desk.includes("toast.error('The browser blocked the print window — export CSV instead.');")).toBe(true);
    expect(desk.includes('if (!printWindow) {\n      toast.error')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.470.0');
    expect(head.title).toContain('print door');
    expect(head.title).toContain('one breath');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('clearance asks'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clipboard'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('print button'))).toBe(true);
  });
});
