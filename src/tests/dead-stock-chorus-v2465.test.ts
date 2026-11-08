// THE LEDGER SPEAKS IN ONE BREATH (v2.465.0): the clearance note's
// collective voice and the file's share link, proven without a database.
//
//   • THE LEDGER'S CHORUS — deadStockClearanceNotes composes the
//     collective word in the ONE home: a header line speaking the
//     ledger's own summary (the count, the window, the capital at cost —
//     the round2 convention the summary card wears), and every line
//     under it the SAME deadStockClearanceNote the Ask copies and the
//     share door sends. One voice, four doors, zero retyping.
//   • THE FILE'S SHARE LINK — the CSV grows a Share link column beside
//     the Clearance note column: each row's wa.me word composed in the
//     SAME ONE home, the cell quoted like every word.
//   • THE COPY ALL HANDLE — the ledger header's compact seat, the
//     emerald hover the family speaks, the double voice, and the honest
//     exit: it only shows when rows exist.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { deadStockClearanceNote, deadStockClearanceNotes, deadStockShareUrl, type DeadStockRow } from '@/lib/reports/dead-stock';
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
// 1. THE LEDGER'S CHORUS — the collective composer, one voice
// ---------------------------------------------------------------------------

describe('deadStockClearanceNotes — the collective word, composed in the ONE home', () => {
  it('the header speaks the ledger\u2019s own summary — count, window, capital', () => {
    const word = deadStockClearanceNotes([row()], 30);
    const header = word.split('\n')[0];
    expect(header).toBe('Clearance asks — 1 product resting past the 30-day window (Ksh 48000.00 tied at cost):');
  });

  it('the count speaks its plural honestly', () => {
    const word = deadStockClearanceNotes([row(), row({ productId: 'p2', name: 'Cement Bag', sku: 'CEM-02', capitalTied: 7200 })], 60);
    expect(word.split('\n')[0]).toContain('2 products resting past the 60-day window');
  });

  it('every line under the header is the SAME per-row note — never a re-typed word', () => {
    const rows = [row(), row({ productId: 'p2', name: 'Cement Bag', sku: 'CEM-02', capitalTied: 7200, lastSoldAt: null, daysIdle: null })];
    const word = deadStockClearanceNotes(rows, 90);
    const lines = word.split('\n');
    expect(lines.length).toBe(3);
    expect(lines[1]).toBe(deadStockClearanceNote(rows[0], 90));
    expect(lines[2]).toBe(deadStockClearanceNote(rows[1], 90));
  });

  it('the header\u2019s capital is the round2 of the rows\u2019 own sum — the summary card\u2019s convention', () => {
    const rows = [row({ capitalTied: 100.111 }), row({ productId: 'p2', capitalTied: 200.222 })];
    const word = deadStockClearanceNotes(rows, 30);
    expect(word.split('\n')[0]).toContain('Ksh 300.33 tied at cost');
  });

  it('an empty ledger composes the honest zero — the header alone, no lines under it', () => {
    const word = deadStockClearanceNotes([], 30);
    expect(word.split('\n').length).toBe(1);
    expect(word).toContain('0 products');
  });

  it('the composer is home-owned — the desk never re-types it', () => {
    expect(home.includes('export function deadStockClearanceNotes')).toBe(true);
    expect((desk.match(/function deadStockClearanceNotes/g) ?? []).length).toBe(0);
    expect(desk.includes('deadStockClearanceNotes(rows, days)')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE FILE'S SHARE LINK — the CSV's fourth door
// ---------------------------------------------------------------------------

describe('the dead-stock CSV — the share link rides beside the note', () => {
  it('the header row grows the Share link column', () => {
    expect(desk.includes("'Product,SKU,Category,Qty on hand,Unit cost,Capital tied,Last sold,Days idle,Clearance note,Share link\\n'")).toBe(true);
  });

  it('the share cell is composed in the ONE home — never re-typed in the desk', () => {
    // v2.467.0 re-key (dated): the file's share column rides the SAME
    // pre-addressed door the chat rides — the store contact's phone as
    // the composer's third word; the ONE home still owns the composer.
    expect(desk.includes('const share = deadStockShareUrl(r, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone);')).toBe(true);
    expect((desk.match(/function deadStockShareUrl/g) ?? []).length).toBe(0);
    expect(home.includes('export function deadStockShareUrl')).toBe(true);
  });

  it('the share cell rides quoted, beside the quoted note', () => {
    expect(desk.includes(',"${note}","${share}"\\n`')).toBe(true);
  });

  it('the note cell\u2019s own law stands — the escape and the summary block ride unchanged', () => {
    expect(desk.includes(".replaceAll('\"', '\"\"')")).toBe(true);
    expect(desk.includes('csvContent += `\\nDays window,${deadStockSummary?.days ?? deadStockDays}\\n`;')).toBe(true);
    expect(desk.includes('Dead share of stock value,${deadStockSummary?.deadSharePct ?? 0}%\\n`;')).toBe(true);
  });

  it('the sheet\u2019s word decodes back to the note — the four doors agree', () => {
    const url = deadStockShareUrl(row(), 90);
    expect(decodeURIComponent(url.split('text=')[1])).toBe(deadStockClearanceNote(row(), 90));
  });
});

// ---------------------------------------------------------------------------
// 3. THE COPY ALL HANDLE — the chorus's seat in the ledger header
// ---------------------------------------------------------------------------

describe('the Copy all handle — the ledger header\u2019s collective voice', () => {
  it('the handle rides the ledger header with its own testid', () => {
    expect(desk.includes('data-testid="dead-stock-copy-all"')).toBe(true);
  });

  it('the handle wears the double voice every row action wears', () => {
    expect(desk.includes('aria-label={`Copy all ${rows.length} clearance notes`}')).toBe(true);
    expect(desk.includes('title={`Copy all ${rows.length} clearance notes`}')).toBe(true);
  });

  it('the handle wears the compact face — the row actions\u2019 smaller sibling', () => {
    expect(desk.includes('className="h-7 px-2.5 text-xs hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300 dark:hover:border-emerald-800"')).toBe(true);
  });

  it('the hover is the family\u2019s emerald — the copy toast\u2019s own green, never a second palette', () => {
    expect(desk.includes('hover:bg-emerald-50')).toBe(true);
    expect(desk.includes('dark:hover:bg-emerald-950/30')).toBe(true);
  });

  it('the handle only shows when rows exist — a button that copies nothing would be a lie', () => {
    expect(desk.includes('{rows.length > 0 && (\n                    <Button\n                      type="button"\n                      variant="outline"\n                      size="sm"\n                      data-testid="dead-stock-copy-all"')).toBe(true);
  });

  it('the press carries the collective word — the composer\u2019s own voice, the toast answers with the count', () => {
    expect(desk.includes('await navigator.clipboard.writeText(deadStockClearanceNotes(rows, days));')).toBe(true);
    expect(desk.includes('toast.success(`All ${rows.length} clearance notes copied`)')).toBe(true);
    expect(desk.includes("toast.error('Could not copy the clearance notes — the clipboard refused.')")).toBe(true);
  });

  it('the chorus sits beside the count badge — one instrument, one seat', () => {
    expect(desk.includes('<div className="flex items-center gap-2">\n                  <Badge variant="outline" className="text-[9px]" data-testid="dead-stock-ledger-count">')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.470.0');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('share link'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clipboard'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('copy all'))).toBe(true);
  });
});
