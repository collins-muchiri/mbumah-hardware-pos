// THE ORDER FILE SUITE (v2.415.0) — the restock order leaves as a NAMED
// text file, the support-file family's pattern (env-download-v2401).
//
//   - restockOrderFileName: the pure twin of formatRestockOrder's copy
//     face — the branch's slug, the date and the minute ride in the name,
//     zero-padded, so two branches' orders on the same day never argue
//     about which file is which.
//   - the Download button: the copy face's sibling on the low-stock banner
//     — Download → a two-second Saved hand-back → Download again; the icon
//     swaps with the label, the resting face rides the banner's amber
//     family and the Saved beat wears the emerald success family (the same
//     emerald the Copied beat speaks), a refused save answers with an
//     honest toast, and the Blob's object URL revokes itself.
//   - the pair's co-mount law: the Copy and Download faces mount together
//     or not at all — both gated on the same honest absence (no rows, no
//     buttons).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) — the
// house rule since the verify scripts were born.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

import { restockOrderFileName } from '@/lib/stock-order';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const TAB = 'src/app/(shell)/tabs/inventory-tab.tsx';
const tabSrc = read(TAB);

describe('restockOrderFileName (v2.415.0) — the file speaks the branch, the date, the minute', () => {
  it('names the file mbumah-restock-<slug>-<YYYYMMDD>-<HHmm>.txt', () => {
    expect(restockOrderFileName('juja-main', new Date(2026, 10, 6, 14, 7))).toBe(
      'mbumah-restock-juja-main-20261106-1407.txt',
    );
  });

  it('zero-pads the month, the day and the minute', () => {
    expect(restockOrderFileName('thika', new Date(2026, 0, 9, 3, 7))).toBe(
      'mbumah-restock-thika-20260109-0307.txt',
    );
  });

  it('the slug rides verbatim (two branches never argue about which file is which)', () => {
    expect(restockOrderFileName('nairobi-cbd', new Date(2026, 11, 31, 23, 59))).toBe(
      'mbumah-restock-nairobi-cbd-20261231-2359.txt',
    );
  });
});

describe('the Download button (v2.415.0) — the order file leaves the desk', () => {
  it('the button exists, testid-ed, beside the Copy face in the banner', () => {
    expect(tabSrc).toContain('data-testid="inv-order-download"');
    expect(tabSrc).toContain('<DownloadOrderButton storeName={orderStoreName} storeSlug={orderStoreSlug} rows={orderRows} dateLabel={orderDateLabel} />');
  });

  it('the co-mount law: the faces gated on the same honest absence (the pair became the trio when v2.416.0\u2019s Send face joined the same gate)', () => {
    const mounts = tabSrc.split('{orderRows.length > 0 && (').length - 1;
    expect(mounts).toBe(3);
  });

  it('the two-beat face: Download → Saved → Download, the icons swap with the label', () => {
    expect(tabSrc).toContain("{saved ? 'Saved' : 'Download'}");
    expect(tabSrc).toContain('? <Check className="h-3 w-3" aria-hidden="true" />\n        : <Download className="h-3 w-3" aria-hidden="true" />}');
  });

  it('the resting face rides the banner\u2019s amber family; the Saved beat wears the emerald success family', () => {
    expect(tabSrc).toContain("'border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40'");
    expect(tabSrc).toContain("'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-900/40'");
  });

  it('the aria-label speaks both states with the honest count', () => {
    expect(tabSrc).toContain("? 'Restock order file saved.'");
    expect(tabSrc).toContain("Download the restock order (${rows.length} item${rows.length === 1 ? '' : 's'}) as a text file");
  });

  it('a refused save answers with an honest toast; the object URL revokes itself', () => {
    expect(tabSrc).toContain('Could not save the order file — the browser refused.');
    expect(tabSrc).toContain('URL.revokeObjectURL(url)');
  });

  it('the file carries the SAME bytes the copy face speaks (one formatter, two transports)', () => {
    expect(tabSrc).toContain('const order = formatRestockOrder({ storeName, dateLabel, rows });');
    expect(tabSrc).toContain("new Blob([order], { type: 'text/plain;charset=utf-8' })");
    expect(tabSrc).toContain('restockOrderFileName(storeSlug, new Date())');
  });
});
