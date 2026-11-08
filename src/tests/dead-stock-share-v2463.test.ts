// THE RESTING LEDGER LEARNS TO REACH OUT (v2.463.0): the clearance note's
// second door, proven without a database.
//
//   • THE SHARE'S OWN DOOR — the share handle opens the maker's own
//     WhatsApp with the SAME deterministic clearance note already
//     composed: the URL is the wa.me word for the note (the composer
//     rides unchanged in the ONE home — one voice, two doors, zero
//     retyping), addressed to no one because the row names no supplier,
//     and a browser that blocks the window speaks its side — the toast
//     answers, the row stays whole.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { deadStockClearanceNote, deadStockShareUrl, type DeadStockRow } from '@/lib/reports/dead-stock';
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
// 1. THE SHARE'S OWN DOOR — the URL composer, one voice, two doors
// ---------------------------------------------------------------------------

describe('deadStockShareUrl — the wa.me word for the note', () => {
  it('speaks the wa.me door with the note as its text — the exact URL', () => {
    expect(deadStockShareUrl(row(), 90)).toBe(
      'https://wa.me/?text=' + encodeURIComponent(deadStockClearanceNote(row(), 90))
    );
  });

  it('the chat reads what the clipboard holds — the text decodes back to the note', () => {
    const url = deadStockShareUrl(row(), 90);
    const text = decodeURIComponent(url.split('text=')[1]);
    expect(text).toBe(deadStockClearanceNote(row(), 90));
  });

  it('the note is encoded, never mangled — spaces and dashes ride as percent-escapes', () => {
    const url = deadStockShareUrl(row(), 90);
    expect(url).toContain('wa.me/?text=Clearance%20ask%20%E2%80%94%2040%20PIECE');
    expect(url).not.toContain(' ');
  });

  it('the never-sold row shares its honest absence too', () => {
    const url = deadStockShareUrl(row({ lastSoldAt: null, daysIdle: null }), 60);
    expect(decodeURIComponent(url.split('text=')[1])).toBe(
      deadStockClearanceNote(row({ lastSoldAt: null, daysIdle: null }), 60)
    );
    expect(url).toContain('never%20sold');
  });

  it('the window that caught the row rides the URL — the lens is shared, not lost', () => {
    expect(deadStockShareUrl(row(), 30)).toContain(encodeURIComponent('caught by the 30-day window'));
    expect(deadStockShareUrl(row(), 90)).toContain(encodeURIComponent('caught by the 90-day window'));
  });

  it('deterministic — the same row and window compose the same door, twice, always', () => {
    expect(deadStockShareUrl(row(), 90)).toBe(deadStockShareUrl(row(), 90));
  });

  it('no phone in the door — the row names no supplier, the maker picks the chat', () => {
    // wa.me/<digits> would be the recipient-addressed instrument (api.ts's
    // own openWhatsApp); the share door opens with the text only.
    expect(deadStockShareUrl(row(), 90)).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(deadStockShareUrl(row(), 90)).not.toMatch(/^https:\/\/wa\.me\/\d/);
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S FACES — the share handle, the pair, the honesty
// ---------------------------------------------------------------------------

describe('the dead-stock desk — the share handle pinned from the desk\u2019s bytes', () => {
  const desk = readFileSync(DESK, 'utf8');

  it('the share handle rides the pair group with its own double voice', () => {
    expect(desk.includes('data-testid={`dead-stock-share-${i}`}')).toBe(true);
    expect(desk.includes('aria-label={`Share clearance note for ${r.name} on WhatsApp`}')).toBe(true);
    expect(desk.includes('title={`Share clearance note for ${r.name} on WhatsApp`}')).toBe(true);
    expect(desk.includes('<Share2 className="h-3.5 w-3.5" /> Share')).toBe(true);
  });

  it('the door opens safe — noopener, noreferrer, and the blocked window speaks', () => {
    // v2.467.0 re-key (dated): the door learns the store's own number —
    // the store contact's phone rides the composer's third word; the
    // noopener/noreferrer pair and the blocked-window toast ride
    // unchanged.
    expect(desk.includes("window.open(deadStockShareUrl(row, days, storeContact?.phone), '_blank', 'noopener,noreferrer')")).toBe(true);
    expect(desk.includes("if (!win) toast.error('The browser blocked the share window — copy the note instead.');")).toBe(true);
  });

  it('the pair reads as one instrument — the tight group, the emerald hover', () => {
    expect(desk.includes('<div className="inline-flex items-center justify-end gap-1">')).toBe(true);
    expect(desk.includes('hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300 dark:hover:border-emerald-800')).toBe(true);
  });

  it('the composer is imported from the ONE home, never re-typed', () => {
    expect(desk.includes('deadStockShareUrl')).toBe(true);
    expect((desk.match(/function deadStockShareUrl/g) ?? []).length).toBe(0);
    expect((desk.match(/wa\.me/g) ?? []).length).toBe(0);
  });

  it('the Ask handle stands unchanged — the clipboard keeps its door', () => {
    expect(desk.includes('<MessageCircle className="h-3.5 w-3.5 mr-1" /> Ask')).toBe(true);
    expect(desk.includes('onClick={() => copyClearanceNote(r)}')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE ONE HOME — the share composer beside the note
// ---------------------------------------------------------------------------

describe('the classifier\u2019s home — the share rides beside the note', () => {
  const home = readFileSync(HOME, 'utf8');

  it('the share composer lives beside the note composer (the ONE home)', () => {
    expect(home.includes('export function deadStockShareUrl')).toBe(true);
    expect(home.includes('export function deadStockClearanceNote')).toBe(true);
    expect(home.includes('v2.463.0 THE RESTING LEDGER LEARNS TO REACH OUT')).toBe(true);
  });

  it('one voice, two doors — the share composes THROUGH the note, never around it', () => {
    expect(home.includes('encodeURIComponent(deadStockClearanceNote(row, days))')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.476.0');
    expect(head.title).toContain('reach out');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('share door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('wa.me'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clipboard'))).toBe(true);
  });
});
