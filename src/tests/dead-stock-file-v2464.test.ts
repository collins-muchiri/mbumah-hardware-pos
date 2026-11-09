// THE WORD RIDES THE FILE (v2.464.0): the clearance note's third door,
// proven without a database.
//
//   • THE FILE'S WORD — the dead-stock CSV carries a Clearance note
//     column: the SAME deterministic note the Ask copies and the share
//     door sends, composed in the ONE home (never re-typed in the
//     desk), CSV-escaped, with the window that caught each row riding
//     inside the word. One voice, three doors — the clipboard, the
//     chat, and the sheet can never drift apart.
//   • THE SHARE DRAWN — the Share of Stock Value card grows a thin rose
//     bar under the number (the resting share at a glance, the family's
//     own word, never a second palette; aria-hidden — the number above
//     IS the voice, a second label would be a stutter).
//   • THE DOOR'S HINT — the export button says what the dead-stock file
//     carries, only when the dead-stock report is the one on stage.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const HOME = 'src/lib/reports/dead-stock.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE FILE'S WORD — the CSV column, one voice, three doors
// ---------------------------------------------------------------------------

describe('the dead-stock CSV — the clearance note rides the file', () => {
  it('the header row gains the Clearance note column', () => {
    // v2.465.0 re-key (dated): the file's header grew a Share link column
    // beside the note — the pin rides the grown row; the column's own
    // bytes live in the v2465 chorus suite.
    expect(desk.includes("'Product,SKU,Category,Qty on hand,Unit cost,Capital tied,Last sold,Days idle,Clearance note,Share link\\n'")).toBe(true);
  });

  it('the note is composed in the ONE home — never re-typed in the desk', () => {
    expect(desk.includes('deadStockClearanceNote(r, deadStockSummary?.days ?? deadStockDays)')).toBe(true);
    expect((desk.match(/function deadStockClearanceNote/g) ?? []).length).toBe(0);
    // the composer itself stays home — the ONE home still owns it
    expect(home.includes('export function deadStockClearanceNote')).toBe(true);
  });

  it('the note rides CSV-escaped — inner quotes doubled, the cell quoted', () => {
    expect(desk.includes(".replaceAll('\"', '\"\"')")).toBe(true);
    // v2.465.0 re-key (dated): the row grew the share cell after the
    // note — the quoted-note pin rides the grown row tail.
    expect(desk.includes(',"${note}","${share}"\\n`')).toBe(true);
  });

  it('the days that compose the note are the summary\u2019s own — the file matches the lens', () => {
    // the same days voice the summary rows below the table speak
    expect(desk.includes('deadStockSummary?.days ?? deadStockDays')).toBe(true);
  });

  it('the summary block stands — the file still closes with its four numbers', () => {
    expect(desk.includes('csvContent += `\\nDays window,${deadStockSummary?.days ?? deadStockDays}\\n`;')).toBe(true);
    expect(desk.includes('Dead share of stock value,${deadStockSummary?.deadSharePct ?? 0}%\\n`;')).toBe(true);
  });

  it('the client-side door stands — the dead-stock file never borrows the server door', () => {
    expect(desk.includes("if (reportType === 'dead_stock') {\n      handleCSVExport();")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE SHARE DRAWN — the rose bar under the number
// ---------------------------------------------------------------------------

describe('the share of stock value — the resting share at a glance', () => {
  it('the bar rides the share card, wearing the family\u2019s rose', () => {
    expect(desk.includes('data-testid="dead-stock-share-bar"')).toBe(true);
    expect(desk.includes('bg-rose-500')).toBe(true);
    expect(desk.includes('bg-muted overflow-hidden')).toBe(true);
  });

  it('the bar is drawn from the share itself, capped and floored', () => {
    expect(desk.includes('Math.min(100, Math.max(0, summary.deadSharePct))')).toBe(true);
  });

  it('the bar stays aria-hidden — the number above IS the voice, a second label is a stutter', () => {
    expect(desk.includes('"mt-2 h-1.5 rounded-full bg-muted overflow-hidden" aria-hidden="true" data-testid="dead-stock-share-bar"')).toBe(true);
  });

  it('the number\u2019s own handle stands untouched — the v2461 probe\u2019s word', () => {
    expect(desk.includes('data-testid="dead-stock-share"')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE DOOR'S HINT — the export button speaks its file
// ---------------------------------------------------------------------------

describe('the export button — the file\u2019s weight, spoken when dead stock is on stage', () => {
  it('the dead-stock file names its note column in the title', () => {
    expect(desk.includes("reportType === 'dead_stock' ? 'Exports the ledger rows with each product\\u2019s clearance note' : undefined")).toBe(true);
  });

  it('the accessible name speaks the notes only for the dead-stock report', () => {
    expect(desk.includes("aria-label={reportType === 'dead_stock' ? 'Export CSV with clearance notes' : undefined}")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.488.0');
    expect(head.title).toContain('reach out');
    expect(head.title).toContain('carry');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('file'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clipboard'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('share door'))).toBe(true);
  });
});
