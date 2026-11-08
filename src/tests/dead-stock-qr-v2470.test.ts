// THE PRINTED LEDGER LEARNS THE SCANNABLE DOOR (v2.470.0): the dead-stock
// print page carries each row's own QR, proven without a window.
//
//   • THE ONE HOME'S URL, DRAWN — each printed card encodes the exact
//     share URL the Share button, the sheet and the chat already speak
//     (deadStockShareUrl with the store's address riding its third
//     word); the qrcode house draws it as a data URL, never a
//     re-composition on the desk.
//   • THE WINDOW OPENS FIRST — the popup-blocked law keeps the print
//     window inside the gesture's tick; the doors are drawn after the
//     open, and a failed draw prints the paper without them, the toast
//     speaking the honest word.
//   • THE CHORUS KEEPS THE CLOSING WORD — the scan-doors appendix sits
//     between the ledger and the chorus; the clearance asks still close
//     the printed page (the v2.466.0 law, byte-for-byte).
//   • THE DESK NEVER SPELLS THE HOST — the census law holds: the URL
//     word lives in the ONE home alone.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const HOME = 'src/lib/reports/dead-stock.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE DRAW — the qrcode house, the ONE home's URL, the honest args
// ---------------------------------------------------------------------------

describe('the scannable door — the draw rides the ONE home', () => {
  it('the handler is async — the doors are drawn before the write', () => {
    expect(desk.includes('const handlePDFExport = async () => {')).toBe(true);
  });

  it('the window opens FIRST — the popup-blocked law keeps the gesture tick', () => {
    const openAt = desk.indexOf("const printWindow = window.open('', '_blank', 'width=800,height=600');");
    const drawAt = desk.indexOf("await import('qrcode')");
    expect(openAt).toBeGreaterThan(-1);
    expect(drawAt).toBeGreaterThan(openAt);
  });

  it('the doors are drawn by the qrcode house — a dynamic import, a data URL', () => {
    expect(desk.includes("const { default: drawQr } = await import('qrcode');")).toBe(true);
    expect(desk.includes('drawQr.toDataURL(url, { margin: 1, width: 96 })')).toBe(true);
  });

  it('the encoded word is the ONE home\u2019s — the same URL the Share button speaks', () => {
    expect(desk.includes(
      'deadStockShareUrl(row, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone)',
    )).toBe(true);
    expect(home.includes('export function deadStockShareUrl')).toBe(true);
    expect((desk.match(/function deadStockShareUrl/g) ?? []).length).toBe(0);
  });

  it('the draw fails honest — the paper prints without the doors, the toast speaks', () => {
    expect(desk.includes("toast.error('The scannable doors could not be drawn — the ledger prints without them.')")).toBe(true);
    expect(desk.includes("return '';\n          }\n        })()")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE APPENDIX — the scan-doors section, its seat, its cards
// ---------------------------------------------------------------------------

describe('the scan-doors appendix — between the ledger and the chorus', () => {
  it('the seat: the ledger, then the scannable doors, then the chorus', () => {
    expect(desk.includes('${content.innerHTML}\n          ${scanAppendix}\n          ${chorusAppendix}')).toBe(true);
  });

  it('the gate is the dead-stock stage with rows — three doors share it', () => {
    expect((desk.match(/reportType === 'dead_stock' && deadStockRows\.length > 0/g) ?? []).length).toBe(3);
  });

  it('the section speaks its heading and its intro', () => {
    expect(desk.includes('<h3>Scan to share — the ledger\u2019s scannable doors</h3>')).toBe(true);
    expect(desk.includes('Each card opens the row\u2019s chat door — the same word the ledger\u2019s Share button speaks.')).toBe(true);
  });

  it('each card carries the QR, the name and the sku — escaped for the window', () => {
    expect(desk.includes('<figure class="scan-card">')).toBe(true);
    expect(desk.includes('alt="Share ${escapePrintWord(row.name)} by chat" width="96" height="96"')).toBe(true);
    expect(desk.includes('<figcaption>${escapePrintWord(row.name)}</figcaption>')).toBe(true);
    expect(desk.includes('<span class="scan-sku">${escapePrintWord(row.sku)}</span>')).toBe(true);
  });

  it('the print CSS dresses the cards — wrapped, bordered, page-break safe', () => {
    expect(desk.includes('.scan-doors { margin-top: 24px; border-top: 2px solid #e2e8f0; padding-top: 16px; page-break-inside: avoid; }')).toBe(true);
    expect(desk.includes('.scan-grid { display: flex; flex-wrap: wrap; gap: 12px; }')).toBe(true);
    expect(desk.includes('.scan-card { width: 120px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 8px; text-align: center; margin: 0; page-break-inside: avoid; }')).toBe(true);
    expect(desk.includes('.scan-card img { width: 96px; height: 96px; }')).toBe(true);
  });

  it('the chorus keeps its closing word — the v2.466.0 bytes untouched', () => {
    expect(desk.includes('<h3>Clearance asks — the ledger\u2019s chorus</h3>')).toBe(true);
    expect(desk.includes('.chorus { margin-top: 28px; border-top: 2px solid #fecdd3; padding-top: 16px; }')).toBe(true);
  });

  it('the desk never spells the host — the census law holds', () => {
    expect(desk.includes('wa.me')).toBe(false);
  });

  it('the section\u2019s own voices stay four — the print window adds no handle', () => {
    // the v2461 census lives in dead-stock-phone-door-v2468; this assert
    // guards the neighbourhood: the QR rides the print window's string,
    // never the live section's DOM.
    expect(desk.includes('data-testid="dead-stock-copy-all"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-share-addressed"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-share-unaddressed"')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE PRINT BUTTON'S VOICE — the double voice, unchanged
// ---------------------------------------------------------------------------

describe('the print button — the double voice stands', () => {
  it('the title and the aria keep their promise', () => {
    expect(desk.includes("reportType === 'dead_stock' ? 'Prints the ledger rows with the clearance asks attached' : undefined")).toBe(true);
    expect(desk.includes("aria-label={reportType === 'dead_stock' ? 'Print PDF with clearance asks' : undefined}")).toBe(true);
  });

  it('the popup-blocked toast keeps its honest word', () => {
    expect(desk.includes("toast.error('The browser blocked the print window — export CSV instead.')")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. WHATS-NEW — the scannable door leads the feed
// ---------------------------------------------------------------------------

describe('whats-new — the scannable door leads the feed', () => {
  const head = WHATS_NEW[0];

  it('the head wears the round\u2019s own story — the elder words and the new word', () => {
    expect(head.version).toBe('2.470.0');
    expect(head.title).toContain('resting ledger');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('print door');
    expect(head.title).toContain('the settings desk learns the branch');
    expect(head.title).toContain('scannable door');
  });

  it('the bullets speak the draw, the seat and the family\u2019s standing set', () => {
    const text = head.bullets.join(' ');
    expect(text).toContain('scannable');
    expect(text).toContain('scan to share');
    expect(text).toContain('QR');
    expect(text).toContain('clearance note');
    expect(text).toContain('pre-addressed');
    expect(text).toContain('edit door');
    expect(text).toContain('chat picker');
    expect(text).toContain('copy all');
    expect(text).toContain('print button');
    expect(text).toContain('clearance asks');
    expect(text).toContain('clipboard');
    expect(text).toContain('share link');
    expect(text).toContain('wa.me');
    expect(text).toContain('category');
    expect(text).toContain('file');
    expect(text).toContain('share door');
  });
});
