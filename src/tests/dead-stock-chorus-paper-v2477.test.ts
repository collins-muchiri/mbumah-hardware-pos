// THE CHORUS LEARNS THE PAPER'S SCANNABLE DOOR (v2.477.0): the print
// appendix's scan grid grows the LEAD card — one QR encoding the WHOLE
// chorus's chat URL — proven without a window.
//
//   • THE LEAD CARD'S WORD — the collective door encodes the ONE home's
//     deadStockChorusShareUrl (the exact bytes the Share all handle
//     opens), drawn by the qrcode house with the same honest args the
//     rows' own cards wear; the desk never spells the host's word.
//   • THE SEAT — the lead card stands FIRST in the scan grid, the rows'
//     own cards after it, the chorus's numbered asks still closing the
//     paper (the v2.466.0 law, byte-for-byte).
//   • THE GATE STAYS THREE — the lead card rides INSIDE the scan
//     appendix's standing gate; no door is added, none is moved.
//   • THE HONEST DEGRADATION, UNTOUCHED — the window opens first, a
//     failed draw prints the paper without the cards, the toast speaks.
//   • THE PAPER'S OWN DRESS — three new CSS faces (the teal card, the
//     note, the rose markers), the standing bytes untouched.
//   • THE CENSUS KEEPS ITS TEN — the lead card is a drawn image on the
//     paper, never a handle; the section speaks the same ten voices.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const HOME = 'src/lib/reports/dead-stock.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE LEAD CARD — the collective word drawn, the ONE home's composer
// ---------------------------------------------------------------------------

describe('the chorus\u2019s scannable door — the draw rides the ONE home', () => {
  it('the lead card encodes the collective composer — the Share all handle\u2019s own word', () => {
    expect(desk.includes(
      'drawQr.toDataURL(deadStockChorusShareUrl(deadStockRows, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone), { margin: 1, width: 96 })',
    )).toBe(true);
    expect(home.includes('export function deadStockChorusShareUrl')).toBe(true);
    expect((desk.match(/function deadStockChorusShareUrl/g) ?? []).length).toBe(0);
  });

  it('the lead card wears its own face — the teal figure, the caption, the honest count', () => {
    expect(desk.includes('<figure class="scan-card scan-chorus"><img src="${chorusData}"')).toBe(true);
    expect(desk.includes('alt="Share the ledger\u2019s whole chorus by chat" width="96" height="96"')).toBe(true);
    expect(desk.includes('<figcaption>The ledger\u2019s chorus</figcaption>')).toBe(true);
    expect(desk.includes('<span class="scan-chorus-note">All ${deadStockRows.length} asks in one chat</span>')).toBe(true);
  });

  it('the lead card stands FIRST — the rows\u2019 own cards after it', () => {
    const lead = desk.indexOf('scan-card scan-chorus');
    const rows = desk.indexOf('${cards.join');
    expect(lead).toBeGreaterThan(-1);
    expect(rows).toBeGreaterThan(-1);
    expect(lead).toBeLessThan(rows);
  });

  it('the desk never spells the host\u2019s word — the census law holds (zero bytes)', () => {
    expect(desk.split('wa.me').length - 1).toBe(0);
  });

  it('the desk imports the composer from the ONE home — never a re-typed word', () => {
    expect(desk.includes('deadStockChorusShareUrl')).toBe(true);
    expect(desk.match(/import \{[^}]*deadStockChorusShareUrl[^}]*\} from '@\/lib\/reports\/dead-stock';/)).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. THE GATE AND THE HONEST DEGRADATION — standing laws, untouched
// ---------------------------------------------------------------------------

describe('the gate and the honesty — the round is additive', () => {
  it('the gate is the dead-stock stage with rows — three doors share it, none added', () => {
    expect((desk.match(/reportType === 'dead_stock' && deadStockRows\.length > 0/g) ?? []).length).toBe(3);
  });

  it('the window opens first — the popup-blocked law keeps the gesture\u2019s tick', () => {
    const open = desk.indexOf("window.open('', '_blank'");
    const draw = desk.indexOf("await import('qrcode')");
    expect(open).toBeGreaterThan(-1);
    expect(draw).toBeGreaterThan(open);
  });

  it('the draw fails honest — the paper prints without the doors, the toast speaks', () => {
    expect(desk.includes("toast.error('The scannable doors could not be drawn — the ledger prints without them.')")).toBe(true);
    expect(desk.includes("return '';\n          }\n        })()")).toBe(true);
  });

  it('the per-row cards keep their bytes — the door the chorus grew beside', () => {
    expect(desk.includes('<figure class="scan-card">')).toBe(true);
    expect(desk.includes('alt="Share ${escapePrintWord(row.name)} by chat" width="96" height="96"')).toBe(true);
    expect(desk.includes('<figcaption>${escapePrintWord(row.name)}</figcaption>')).toBe(true);
    expect(desk.includes('<span class="scan-sku">${escapePrintWord(row.sku)}</span>')).toBe(true);
    expect(desk.includes('deadStockShareUrl(row, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone)')).toBe(true);
  });

  it('the seat holds — the ledger, then the scannable doors, then the chorus', () => {
    expect(desk.includes('${content.innerHTML}\n          ${scanAppendix}\n          ${chorusAppendix}')).toBe(true);
  });

  it('the chorus keeps its closing word — the v2.466.0 bytes untouched', () => {
    expect(desk.includes('<h3>Clearance asks — the ledger\u2019s chorus</h3>')).toBe(true);
    expect(desk.includes('deadStockClearanceNotes(deadStockRows, deadStockSummary?.days ?? deadStockDays)')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE PAPER'S OWN DRESS — new faces, standing bytes untouched
// ---------------------------------------------------------------------------

describe('the paper\u2019s own dress — the styling verse', () => {
  it('the standing CSS lines keep their bytes — the v2.470.0 faces untouched', () => {
    expect(desk.includes('.scan-doors { margin-top: 24px; border-top: 2px solid #e2e8f0; padding-top: 16px; page-break-inside: avoid; }')).toBe(true);
    expect(desk.includes('.scan-grid { display: flex; flex-wrap: wrap; gap: 12px; }')).toBe(true);
    expect(desk.includes('.scan-card { width: 120px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 8px; text-align: center; margin: 0; page-break-inside: avoid; }')).toBe(true);
    expect(desk.includes('.scan-card img { width: 96px; height: 96px; }')).toBe(true);
  });

  it('the lead card\u2019s teal face — the collective door\u2019s own dress', () => {
    expect(desk.includes('.scan-card.scan-chorus { width: 132px; border: 2px solid #0f766e; background: #f0fdfa; }')).toBe(true);
    expect(desk.includes('.scan-chorus-note { display: block; font-size: 10px; color: #0f766e; margin-top: 4px; }')).toBe(true);
  });

  it('the chorus\u2019s numbered asks wear the rose markers', () => {
    expect(desk.includes('.chorus li::marker { color: #be123c; font-weight: 600; }')).toBe(true);
  });

  it('the heading and the intro keep their bytes — the section speaks as it has', () => {
    expect(desk.includes('<h3>Scan to share — the ledger\u2019s scannable doors</h3>')).toBe(true);
    expect(desk.includes('Each card opens the row\u2019s chat door — the same word the ledger\u2019s Share button speaks.')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CENSUS KEEPS ITS TEN — the lead card is never a handle
// ---------------------------------------------------------------------------

describe('the census — the paper\u2019s card is a drawn image, not a voice', () => {
  it('the section speaks ten handles now — the lead card adds none', () => {
    const section = desk.slice(desk.indexOf('function DeadStockSection'), desk.indexOf('// Main Reports Tab Component'));
    expect(section.split('aria-label=').length - 1).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round, pinned in the feed', () => {
  it('the head wears the round\u2019s own story — the honoured probe and the new word', () => {
    const head = WHATS_NEW.find((e) => e.version === '2.477.0');
  if (!head) throw new Error('the 2.477.0 entry is gone from the feed');
    expect(head.version).toBe('2.477.0');
    expect(head.title).toContain('the chorus rides the chat door');
    expect(head.title).toContain('the chorus learns the paper\u2019s scannable door');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.title).toContain('the view speaks its own word');
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('scannable door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('LEAD card'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('QR'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('deadStockChorusShareUrl'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('teal'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('rose markers'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('pre-addressed'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('chat picker'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('share door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('wa.me'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clipboard'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('category'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('copy all'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.490.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.477.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.477.0]')).toBeLessThan(changelog.indexOf('[2.476.0]'));
  });
});
