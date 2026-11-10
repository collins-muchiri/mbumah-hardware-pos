// THE CHORUS RIDES THE CHAT DOOR (v2.476.0): the collective word's own
// reach-out, proven without a database.
//
//   • THE CHORUS'S CHAT DOOR — deadStockChorusShareUrl composes the
//     collective word's own chat URL in the ONE home: the FULL
//     clearance chorus (the exact deadStockClearanceNotes bytes the
//     clipboard's Copy all handle carries) as the text word,
//     pre-addressed to the store's own digits when a phone rides in,
//     the picker door otherwise — the per-row share's own two faces,
//     grown collective. One voice, every door.
//   • THE SHARE ALL HANDLE — the ledger header's compact seat beside
//     the Copy all handle: the share family's emerald hover, the
//     double voice, the popup-blocked honesty, and the same empty law
//     (it only shows when rows exist).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { deadStockChorusShareUrl, deadStockClearanceNote, deadStockClearanceNotes, type DeadStockRow } from '@/lib/reports/dead-stock';
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
// 1. THE CHORUS'S CHAT DOOR — the collective composer, one voice
// ---------------------------------------------------------------------------

describe('deadStockChorusShareUrl — the collective word\u2019s own chat URL, composed in the ONE home', () => {
  it('the picker door speaks the host\u2019s own shape — the whole chorus as the text word', () => {
    const url = deadStockChorusShareUrl([row()], 30);
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    const text = decodeURIComponent(url.slice(url.indexOf('?text=') + 6));
    expect(text).toBe(deadStockClearanceNotes([row()], 30));
  });

  it('the pre-addressed door rides the store\u2019s own digits — the same normalization the share door speaks', () => {
    const url = deadStockChorusShareUrl([row()], 30, '0795 191-909');
    expect(url.startsWith('https://wa.me/254795191909?text=')).toBe(true);
    const text = decodeURIComponent(url.slice(url.indexOf('?text=') + 6));
    expect(text).toBe(deadStockClearanceNotes([row()], 30));
  });

  it('the plus is shaved — the leading + never rides the URL', () => {
    const url = deadStockChorusShareUrl([row()], 30, '+254795191909');
    expect(url.startsWith('https://wa.me/254795191909?text=')).toBe(true);
  });

  it('no phone, an empty word, or one that normalizes to nothing keeps the picker door byte-for-byte', () => {
    const rows = [row(), row({ productId: 'p2', name: 'Cement Bag', sku: 'CEM-02', capitalTied: 7200 })];
    const bare = deadStockChorusShareUrl(rows, 60);
    expect(deadStockChorusShareUrl(rows, 60, null)).toBe(bare);
    expect(deadStockChorusShareUrl(rows, 60, '')).toBe(bare);
    expect(deadStockChorusShareUrl(rows, 60, '()--  ')).toBe(bare);
  });

  it('every line under the header is the SAME per-row note — one voice, never a re-typed word', () => {
    const rows = [row(), row({ productId: 'p2', name: 'Cement Bag', sku: 'CEM-02', capitalTied: 7200, lastSoldAt: null, daysIdle: null })];
    const text = decodeURIComponent(deadStockChorusShareUrl(rows, 90).slice(deadStockChorusShareUrl(rows, 90).indexOf('?text=') + 6));
    const lines = text.split('\n');
    expect(lines.length).toBe(3);
    expect(lines[1]).toBe(deadStockClearanceNote(rows[0], 90));
    expect(lines[2]).toBe(deadStockClearanceNote(rows[1], 90));
  });

  it('the window rides the header\u2019s own word — the days the desk presses', () => {
    const text = decodeURIComponent(deadStockChorusShareUrl([row()], 60).slice(deadStockChorusShareUrl([row()], 60).indexOf('?text=') + 6));
    expect(text.split('\n')[0]).toContain('resting past the 60-day window');
  });

  it('an empty ledger still answers — the header alone, the honest zero', () => {
    const text = decodeURIComponent(deadStockChorusShareUrl([], 30).slice(deadStockChorusShareUrl([], 30).indexOf('?text=') + 6));
    expect(text).toBe(deadStockClearanceNotes([], 30));
    expect(text).toContain('0 products resting past the 30-day window');
  });

  it('pure — the input array is never mutated, a fresh word every call', () => {
    const rows = [row(), row({ productId: 'p2', name: 'Cement Bag', sku: 'CEM-02' })];
    const before = JSON.stringify(rows);
    deadStockChorusShareUrl(rows, 30);
    expect(JSON.stringify(rows)).toBe(before);
    expect(deadStockChorusShareUrl(rows, 30)).toBe(deadStockChorusShareUrl(rows, 30));
  });

  it('the composer lives in the ONE home — the same file the clipboard\u2019s chorus speaks', () => {
    expect(home).toContain('export function deadStockChorusShareUrl');
    expect(home).toContain('deadStockClearanceNotes(rows, days)');
  });
});

// ---------------------------------------------------------------------------
// 2. THE SHARE ALL HANDLE — the desk's compact sibling
// ---------------------------------------------------------------------------

describe('the Share all handle — the ledger header\u2019s second collective voice', () => {
  it('the handle exists with its own name', () => {
    expect(desk.includes('data-testid="dead-stock-share-all"')).toBe(true);
  });

  it('the double voice every handle wears — the count spoken in both ears', () => {
    expect(desk.includes('aria-label={`Share all ${rows.length} clearance notes on WhatsApp`}')).toBe(true);
    expect(desk.includes('title={`Share all ${rows.length} clearance notes on WhatsApp`}')).toBe(true);
  });

  it('the compact face and the share family\u2019s emerald hover — the Copy all handle\u2019s own byte', () => {
    const shareAll = desk.slice(desk.indexOf('data-testid="dead-stock-share-all"'), desk.indexOf('data-testid="dead-stock-share-all"') + 600);
    expect(shareAll).toContain('h-7 px-2.5 text-xs hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300');
    expect(shareAll).toContain('dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300 dark:hover:border-emerald-800');
    expect(shareAll).toContain('<Share2 className="h-3 w-3 mr-1" /> Share all');
  });

  it('the honest exit — it only shows when rows exist', () => {
    const seat = desk.slice(desk.indexOf("{/* THE CHORUS'S CHAT DOOR (v2.476.0)"), desk.indexOf('data-testid="dead-stock-share-all"'));
    expect(seat).toContain('{rows.length > 0 && (');
  });

  it('the seat — the Share all handle stands after the Copy all handle, inside one group', () => {
    const copyAll = desk.indexOf('data-testid="dead-stock-copy-all"');
    const shareAll = desk.indexOf('data-testid="dead-stock-share-all"');
    expect(copyAll).toBeGreaterThan(-1);
    expect(shareAll).toBeGreaterThan(copyAll);
    const group = desk.slice(desk.indexOf('<div className="flex items-center gap-2">\n                  <Badge variant="outline" className="text-[9px]" data-testid="dead-stock-ledger-count">'), shareAll);
    expect(group.length).toBeGreaterThan(0);
    expect(group).toContain('dead-stock-copy-all');
  });

  it('the press speaks the ONE home\u2019s own composer — the store contact rides the third word', () => {
    expect(desk.includes("window.open(deadStockChorusShareUrl(rows, days, storeContact?.phone), '_blank', 'noopener,noreferrer')")).toBe(true);
  });

  it('the popup-blocked honesty — a refused window speaks its side', () => {
    expect(desk.includes("toast.error('The browser blocked the share window — copy the notes instead.')")).toBe(true);
  });

  it('the callback\u2019s dependencies ride the same three words the press speaks', () => {
    expect(desk.includes('const shareAllClearanceNotes = useCallback(() => {')).toBe(true);
    expect(desk.includes('}, [rows, days, storeContact]);')).toBe(true);
  });

  it('the view/archive law — the handle sings the CANONICAL rows, never the pressed lens\u2019s view', () => {
    expect(desk.includes('deadStockChorusShareUrl(rows, days')).toBe(true);
    expect(desk.includes('deadStockChorusShareUrl(sortedRows')).toBe(false);
    expect(desk.includes('deadStockChorusShareUrl(viewRows')).toBe(false);
  });

  it('the desk never spells the host\u2019s word — the census law holds (zero bytes)', () => {
    expect(desk.split('wa.me').length - 1).toBe(0);
  });

  it('the desk imports the composer from the ONE home — never a re-typed word', () => {
    expect(desk.includes('deadStockChorusShareUrl')).toBe(true);
    expect(desk.match(/import \{[^}]*deadStockChorusShareUrl[^}]*\} from '@\/lib\/reports\/dead-stock';/)).not.toBeNull();
  });

  it('the census grows its tenth voice — the section speaks ten handles now', () => {
    const section = desk.slice(desk.indexOf('function DeadStockSection'), desk.indexOf('// Main Reports Tab Component'));
        // v2.498.0 re-key (dated): the section grows its ELEVENTH and
    // TWELFTH voices — the action arc's two row doors (the Clear handle
    // and the Write off handle, the double voice every handle wears);
    // the census speaks the section's twelve handles now, and the
    // elder bytes this suite pins stand untouched.
    expect(section.split('aria-label=').length - 1).toBe(12);
  });
});

// ---------------------------------------------------------------------------
// 3. THE FAMILY KEEPS ITS SEATS — the doors the chorus already rides
// ---------------------------------------------------------------------------

describe('the family keeps its seats — the round is additive', () => {
  it('the Copy all handle keeps its bytes — the clipboard\u2019s own word', () => {
    expect(desk.includes('data-testid="dead-stock-copy-all"')).toBe(true);
    expect(desk.includes('await navigator.clipboard.writeText(deadStockClearanceNotes(rows, days))')).toBe(true);
  });

  it('the print door keeps its chorus appendix — the paper still closes with the clearance asks', () => {
    expect(desk.includes('deadStockClearanceNotes(deadStockRows, deadStockSummary?.days ?? deadStockDays)')).toBe(true);
  });

  it('the file keeps its chorus footer and share link column — the sheet\u2019s own words', () => {
    expect(desk.includes('Share link\\n')).toBe(true);
    expect(desk.includes('Clearance chorus,"')).toBe(true);
    expect(desk.includes('deadStockShareUrl(r, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone)')).toBe(true);
  });

  it('the per-row share keeps its two faces — the door the chorus grew from', () => {
    expect(desk.includes("window.open(deadStockShareUrl(row, days, storeContact?.phone), '_blank', 'noopener,noreferrer')")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round, pinned in the feed', () => {
  it('the head wears the round\u2019s own story', () => {
    const head = WHATS_NEW.find((e) => e.version === '2.476.0');
    if (!head) throw new Error('the 2.476.0 entry is gone from the feed');
    expect(head.version).toBe('2.476.0');
    expect(head.title).toContain('the chorus rides the chat door');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.title).toContain('the view speaks its own word');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('Share all'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clipboard'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('copy all'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('chat picker'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('pre-addressed'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('category'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('share link'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('wa.me'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe(WHATS_NEW[0].version);
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.476.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.476.0]')).toBeLessThan(changelog.indexOf('[2.475.0]'));
  });
});
