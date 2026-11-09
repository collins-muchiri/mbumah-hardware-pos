// THE SHARE DOOR LEARNS THE STORE'S OWN NUMBER (v2.467.0): the wa.me door
// grows its honest second face, proven without a database.
//
//   • THE PRE-ADDRESS — a store with a phone on file answers its own
//     door: the composer's optional third word (the store phone) turns
//     `https://wa.me/?text=...` into `https://wa.me/<digits>?text=...`,
//     the SAME encoded note riding both — only the address grows, the
//     note can never drift. A store without a phone (null, empty, or a
//     word that normalizes to nothing) keeps the picker door byte-for-
//     byte — silence is the honest no-address.
//   • THE PURE NORMALIZER — waMeDigits speaks the same rules the api.ts
//     door speaks (spaces/dashes/parens stripped, the 0-prefix grown to
//     254, the + shaved) but lives in the ONE home, pure, so the lib
//     never imports a DOM door.
//   • THE DOOR'S STATE, SPOKEN — the ledger header wears the chip: the
//     pre-addressed face (emerald, the Phone icon) names the branch and
//     its number, the picker face says so. A status word, not a handle:
//     the chip carries a title and NO aria-label — the census's three
//     handles stay three.
//   • ONE DOOR EVERYWHERE — the desk's share handle and the CSV's share
//     column ride the SAME pre-addressed composer; the desk never
//     re-types the word (and never spells the door's host in its own
//     bytes — the v2463 census law).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { deadStockClearanceNote, deadStockShareUrl, waMeDigits, waMeDisplay, type DeadStockRow } from '@/lib/reports/dead-stock';
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
// 1. THE STORE'S OWN DIGITS — the pure normalizer
// ---------------------------------------------------------------------------

describe('waMeDigits — the pre-address normalizer, pure', () => {
  it('grows the Kenyan 0-prefix to the 254 country code', () => {
    expect(waMeDigits('0795191909')).toBe('254795191909');
  });

  it('shaves the + and keeps the international digits', () => {
    expect(waMeDigits('+254795191909')).toBe('254795191909');
  });

  it('strips spaces, dashes and parentheses — the human-formatting noise', () => {
    expect(waMeDigits('+254 795-191-909')).toBe('254795191909');
    expect(waMeDigits('(0795) 191-909')).toBe('254795191909');
  });

  it('a plain international word rides unchanged', () => {
    expect(waMeDigits('254795191909')).toBe('254795191909');
  });

  it('an empty word answers empty — no digits, no address', () => {
    expect(waMeDigits('')).toBe('');
  });

  it('the display word wears the + — the chip reads it, the URL never carries it', () => {
    expect(waMeDisplay('0795191909')).toBe('+254795191909');
    expect(waMeDisplay('')).toBe('');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DOOR'S TWO FACES — pre-addressed and picker, one note always
// ---------------------------------------------------------------------------

describe('deadStockShareUrl — the pre-addressed door', () => {
  it('no phone keeps the picker door byte-for-byte — the v2.463 word', () => {
    expect(deadStockShareUrl(row(), 90)).toBe(
      'https://wa.me/?text=' + encodeURIComponent(deadStockClearanceNote(row(), 90))
    );
  });

  it('a store phone pre-addresses — wa.me/<digits> with the SAME text', () => {
    const picker = deadStockShareUrl(row(), 90);
    const addressed = deadStockShareUrl(row(), 90, '0795191909');
    expect(addressed.startsWith('https://wa.me/254795191909?text=')).toBe(true);
    expect(addressed.split('text=')[1]).toBe(picker.split('text=')[1]);
  });

  it('a dirty phone answers the same URL as a clean one — the normalize is the door\'s own', () => {
    expect(deadStockShareUrl(row(), 90, '+254 795-191-909')).toBe(deadStockShareUrl(row(), 90, '0795191909'));
  });

  it('null, undefined and empty keep the picker door — silence is the honest no-address', () => {
    const picker = deadStockShareUrl(row(), 90);
    expect(deadStockShareUrl(row(), 90, null)).toBe(picker);
    expect(deadStockShareUrl(row(), 90, undefined)).toBe(picker);
    expect(deadStockShareUrl(row(), 90, '')).toBe(picker);
  });

  it('the pre-addressed chat decodes back to the note — one voice, one door', () => {
    const url = deadStockShareUrl(row(), 90, '0795191909');
    expect(decodeURIComponent(url.split('text=')[1])).toBe(deadStockClearanceNote(row(), 90));
  });

  it('deterministic — the same row, window and phone compose the same door, twice, always', () => {
    expect(deadStockShareUrl(row(), 60, '0795191909')).toBe(deadStockShareUrl(row(), 60, '0795191909'));
  });
});

// ---------------------------------------------------------------------------
// 3. THE DESK'S BYTES — the wire, the chip, one door everywhere
// ---------------------------------------------------------------------------

describe('the dead-stock desk — the pre-address pinned from the desk bytes', () => {
  it('the store-contact wire rides the desk — session headers, its own query key, dead-stock only', () => {
    expect(desk.includes("queryKey: ['dead-stock-store-contact', currentStoreId],")).toBe(true);
    expect(desk.includes("fetch('/api/stores', { credentials: 'same-origin', headers: sessionAuthHeaders() })")).toBe(true);
    expect(desk.includes('enabled: reportType === \'dead_stock\',')).toBe(true);
    expect(desk.includes("return store?.phone ? { name: store.name, phone: store.phone } : null;")).toBe(true);
  });

  it('the share handle passes the store phone — the composer\'s third word, never a re-typed door', () => {
    expect(desk.includes('window.open(deadStockShareUrl(row, days, storeContact?.phone), \'_blank\', \'noopener,noreferrer\')')).toBe(true);
  });

  it('the CSV share column rides the SAME pre-addressed door', () => {
    expect(desk.includes('const share = deadStockShareUrl(r, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone);')).toBe(true);
  });

  it('the section wears the contact prop — handed down, never re-fetched', () => {
    expect(desk.includes('storeContact: { name: string; phone: string } | null;')).toBe(true);
    expect(desk.includes('storeContact={deadStockStoreContact ?? null}')).toBe(true);
  });

  it('the pre-addressed chip wears the emerald face and the double address', () => {
    expect(desk.includes('data-testid="dead-stock-share-addressed"')).toBe(true);
    expect(desk.includes('border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300')).toBe(true);
    expect(desk.includes('title={`Share opens WhatsApp pre-addressed to ${storeContact.name} (${waMeDisplay(storeContact.phone)})`}')).toBe(true);
    expect(desk.includes('<Phone className="h-2.5 w-2.5" /> Shares pre-addressed to {storeContact.name} · {waMeDisplay(storeContact.phone)}')).toBe(true);
  });

  it('the picker chip is the honest face — and now it grew its press (the edit door)', () => {
    // v2.468.0 re-key (dated): the picker face learned its press — the
    // quiet status chip is a real button (the double voice: aria-label
    // names the action, title carries the promise, the text speaks the
    // state), the dashed border the pressable hint; the census grows to
    // four (the edit door's own handle).
    expect(desk.includes('data-testid="dead-stock-share-unaddressed"')).toBe(true);
    expect(desk.includes('Shares open with the chat picker')).toBe(true);
    expect(desk.includes('aria-label="Add the store\'s share phone"')).toBe(true);
    expect(desk.includes('title="Add the store\'s phone to pre-address the share door — press to add it"')).toBe(true);
    expect(desk.includes('onClick={() => { setPhoneDraft(\'\'); setPhoneDialogOpen(true); }}')).toBe(true);
    // the chip speaks by its text and its one action label — the census's
    // four handles (Ask, Share, Copy all, the edit door) stay four.
    // v2.472.0 re-key (dated): the section grows its FIFTH and SIXTH
    // voices — the sort door's two headers (the Capital tied and Days
    // idle handles, the double voice every handle wears); the census
    // speaks the section's six handles now, and the chip's own face is
    // untouched.
    // v2.473.0 re-key (dated): the section grows its SEVENTH, EIGHTH and
    // NINTH voices — the search door's three handles (the lens input,
    // the clear × and the empty lens's own clear handle, the double
    // voice every handle wears); the census speaks the section's nine
    // handles now, and the chip's own face is untouched.
    const section = desk.slice(desk.indexOf('function DeadStockSection'), desk.indexOf('// Main Reports Tab Component'));
    // v2.476.0 re-key (dated): the section grows its TENTH voice — the
    // chat door's Share all handle (the chorus's own reach-out, the
    // double voice every handle wears); the census speaks the section's
    // ten handles now, and the loom's pressed-voice law stands untouched.
    expect(section.split('aria-label=').length - 1).toBe(10);
  });

  it('the display word is imported from the ONE home — the desk never re-formats the number', () => {
    expect(desk.includes('waMeDisplay')).toBe(true);
    expect((desk.match(/function waMeDisplay/g) ?? []).length).toBe(0);
    expect(home.includes('export function waMeDisplay')).toBe(true);
  });

  it('the desk never spells the door\'s host — the v2463 census law holds byte-for-byte', () => {
    expect((desk.match(/wa\.me/g) ?? []).length).toBe(0);
  });

  it('the ONE home stays pure — the normalizer lives beside the composer, no DOM imports', () => {
    expect(home.includes('export function waMeDigits')).toBe(true);
    expect(home.includes('export function deadStockShareUrl(row: DeadStockRow, days: number, storePhone?: string | null): string')).toBe(true);
    expect((home.match(/window\.open/g) ?? []).length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 4. THE FEED — the head wears the round's own story
// ---------------------------------------------------------------------------

describe('whats-new — the pre-address leads the feed', () => {
  const head = WHATS_NEW[0];

  it('the head wears the round\'s own story', () => {
    expect(head.version).toBe('2.483.0');
    expect(head.title).toContain('resting ledger');
    expect(head.title).toContain('reach out');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('print door');
    expect(head.title).toContain('share door');
    expect(head.title).toContain('own number');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('pre-addressed'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('chat picker'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('share door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('wa.me'))).toBe(true);
  });
});
