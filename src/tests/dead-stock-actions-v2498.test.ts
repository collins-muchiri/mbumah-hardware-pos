// THE RESTING LEDGER LEARNS TO ACT (v2.498.0): the dead-stock ledger's
// action arc, proven without a database.
//
//   • THE ONE HOME'S WORDS — deadStockClearanceSuggestion (the cost
//     floor), deadStockMarginVoice (below/at/over, the no-cost voice,
//     the empty-until-a-number law) and deadStockWriteOffReason (the
//     wire's mandatory ≥3-char record, deterministic from the row's own
//     facts) compose HERE, pure and deterministic; the desk only presses
//     them.
//   • THE WIRE'S OWN VOCABULARY — DEAD_STOCK_WRITE_OFF_CATEGORIES is
//     exactly the stock-movements wire's three words (the desk's chips
//     speak the wire's vocabulary, never a desk-made twin).
//   • THE DESK'S OWN FACE — the Act column's two handles (the double
//     voice every handle wears), the two dialogs' words, the saves
//     riding the EXISTING wires (the product PUT's posture, the
//     stock-movements POST's governance shape), the honest refusals,
//     the invalidation of the desk's own wire.
//   • THE CENSUS — the section's voices grow ten → fifteen (dated).
//   • THE FEED — the head wears the round's own story and the union of
//     every living pin.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  DEAD_STOCK_WRITE_OFF_CATEGORIES,
  deadStockClearanceSuggestion,
  deadStockMarginVoice,
  deadStockWriteOffReason,
  type DeadStockRow,
} from '@/lib/reports/dead-stock';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const HOME = 'src/lib/reports/dead-stock.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');

function row(overrides: Partial<DeadStockRow> = {}): DeadStockRow {
  return {
    productId: 'p1',
    name: 'Cement 32N',
    sku: 'CEM-01',
    categoryName: 'Building',
    quantityInStock: 12,
    costPrice: 700,
    pricePerUnit: 950,
    reorderLevel: 10,
    unitType: 'BAG',
    capitalTied: 8400,
    lastSoldAt: '2026-03-01T09:30:00.000Z',
    daysIdle: 250,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1. THE ONE HOME'S WORDS — the suggestion, the margin, the reason
// ---------------------------------------------------------------------------

describe('deadStockClearanceSuggestion — the cost floor', () => {
  it('the suggestion IS the cost, rounded to the money\u2019s own two decimals', () => {
    expect(deadStockClearanceSuggestion(row())).toBe(700);
    expect(deadStockClearanceSuggestion(row({ costPrice: 700.005 }))).toBe(700.01);
    expect(deadStockClearanceSuggestion(row({ costPrice: 499.994 }))).toBe(499.99);
  });

  it('a cost that never stood suggests nothing — zero is the honest no-suggestion', () => {
    expect(deadStockClearanceSuggestion(row({ costPrice: NaN }))).toBe(0);
    expect(deadStockClearanceSuggestion(row({ costPrice: Infinity }))).toBe(0);
  });

  it('the input row is never mutated', () => {
    const r = row();
    deadStockClearanceSuggestion(r);
    expect(r.costPrice).toBe(700);
  });
});

describe('deadStockMarginVoice — the clearance price\u2019s honest mirror', () => {
  it('below cost names the loss per unit', () => {
    expect(deadStockMarginVoice(600, row())).toBe('Ksh 100.00 below cost (Ksh 100.00 loss per unit).');
  });

  it('at cost speaks the floor\u2019s own word', () => {
    expect(deadStockMarginVoice(700, row())).toBe('At cost — the capital back, the margin forgiven.');
  });

  it('over cost names the margin and its percent (one decimal)', () => {
    expect(deadStockMarginVoice(805, row())).toBe('Ksh 105.00 over cost (15% margin).');
    expect(deadStockMarginVoice(812.35, row())).toBe('Ksh 112.35 over cost (16.1% margin).');
  });

  it('a draft that is not a standing number answers empty', () => {
    expect(deadStockMarginVoice(NaN, row())).toBe('');
    expect(deadStockMarginVoice(0, row())).toBe('');
    expect(deadStockMarginVoice(-5, row())).toBe('');
  });

  it('a cost that never stood says so — never a fabricated percent', () => {
    expect(deadStockMarginVoice(500, row({ costPrice: 0 }))).toBe('No cost on file — the margin\u2019s word rests.');
    expect(deadStockMarginVoice(500, row({ costPrice: NaN }))).toBe('No cost on file — the margin\u2019s word rests.');
  });
});

describe('deadStockWriteOffReason — the wire\u2019s mandatory record', () => {
  it('the reason composes from the row\u2019s own facts, deterministic', () => {
    expect(deadStockWriteOffReason(row(), 'DAMAGED', 12, 90)).toBe(
      'Dead-stock write-off (DAMAGED): 12 BAG × Cement 32N (CEM-01), idle 250 days, caught by the 90-day window — Ksh 8400.00 at cost written off.',
    );
    // the same inputs always draw the same bytes
    expect(deadStockWriteOffReason(row(), 'DAMAGED', 12, 90)).toBe(deadStockWriteOffReason(row(), 'DAMAGED', 12, 90));
  });

  it('the never-sold row speaks its honest absence — no invented age', () => {
    const never = row({ lastSoldAt: null, daysIdle: null });
    expect(deadStockWriteOffReason(never, 'EXPIRED', 3, 30)).toContain('never sold');
    expect(deadStockWriteOffReason(never, 'EXPIRED', 3, 30)).not.toContain('idle');
  });

  it('the classification\u2019s word rides the record; the capital rides qty × cost', () => {
    const word = deadStockWriteOffReason(row({ costPrice: 123.456 }), 'STOLEN', 4, 60);
    expect(word).toContain('(STOLEN)');
    expect(word).toContain('Ksh 493.82 at cost written off.');
  });

  it('the record is always ≥ 3 chars — the wire\u2019s own floor', () => {
    for (const c of DEAD_STOCK_WRITE_OFF_CATEGORIES) {
      expect(deadStockWriteOffReason(row(), c, 1, 30).length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('DEAD_STOCK_WRITE_OFF_CATEGORIES — the wire\u2019s own vocabulary', () => {
  it('exactly the stock-movements wire\u2019s three words, in the wire\u2019s order', () => {
    expect([...DEAD_STOCK_WRITE_OFF_CATEGORIES]).toEqual(['DAMAGED', 'STOLEN', 'EXPIRED']);
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S OWN FACE — the action arc's handles and saves
// ---------------------------------------------------------------------------

describe('the desk — the ledger learns to act (v2.498.0)', () => {
  const section = desk.slice(desk.indexOf('function DeadStockSection'), desk.indexOf('// Main Reports Tab Component'));

  it('the Act column stands beside the Ask column', () => {
    expect(section).toContain('<TableHead className="text-right">Act</TableHead>');
    expect(section).toContain('<TableCell colSpan={9} className="py-10">');
  });

  it('the two row handles wear the double voice (aria-label + title) and their testids', () => {
    expect(section).toContain('data-testid={`dead-stock-clear-${i}`}');
    expect(section).toContain('aria-label={`Set a clearance price for ${r.name}`}');
    expect(section).toContain('data-testid={`dead-stock-writeoff-${i}`}');
    expect(section).toContain('aria-label={`Write off the resting stock of ${r.name}`}');
  });

  it('the hover words are the family\u2019s own — the amber markdown, the rose loss', () => {
    expect(section).toContain('hover:bg-amber-50 hover:text-amber-700');
    expect(section).toContain('hover:bg-rose-50 hover:text-rose-700');
  });

  it('the clearance save rides the product PUT\u2019s own posture, price only', () => {
    expect(section).toContain("fetch(`/api/products/${clearRow.productId}`, {");
    expect(section).toContain("method: 'PUT',");
    expect(section).toContain('body: JSON.stringify({ pricePerUnit: parsed }),');
  });

  it('the clearance draft refuses locally before the wire ever moves', () => {
    expect(section).toContain('if (!Number.isFinite(parsed) || parsed <= 0) {');
    expect(section).toContain('The clearance price needs a number above zero');
  });

  it('the write-off save rides the stock-movements wire\u2019s governance shape', () => {
    expect(section).toContain("fetch('/api/stock-movements', {");
    expect(section).toContain("type: 'ADJUSTMENT',");
    expect(section).toContain('quantity: -qty,');
    expect(section).toContain('reason: deadStockWriteOffReason(writeOffRow, writeOffCategory, qty, days),');
    expect(section).toContain('category: writeOffCategory,');
  });

  it('the write-off quantity is capped at the row\u2019s own rest, locally', () => {
    expect(section).toContain('if (qty > writeOffRow.quantityInStock) {');
    expect(section).toContain('cannot take more than rests');
  });

  it('the refusals speak their side — 403, 409, and the wire\u2019s own no', () => {
    expect(section).toContain('The price write was refused');
    expect(section).toContain('a manager\u2019s word is needed for stock writes');
    expect(section).toContain('The shelf moved under this door');
    expect(section).toContain('Could not write the stock off — the wire refused.');
  });

  it('both saves invalidate the desk\u2019s OWN wire — the ledger re-answers live', () => {
    const invalidations = section.split("invalidateQueries({ queryKey: ['dead-stock-report', storeId] })").length - 1;
    expect(invalidations).toBeGreaterThanOrEqual(3); // clearance save, 409 door, write-off save
  });

  it('the dialogs speak their words — the margin live, the reason live, the chips the wire\u2019s', () => {
    expect(section).toContain('data-testid="dead-stock-clear-input"');
    expect(section).toContain('data-testid="dead-stock-clear-margin"');
    expect(section).toContain('data-testid="dead-stock-clear-save"');
    expect(section).toContain('data-testid="dead-stock-writeoff-qty"');
    expect(section).toContain('data-testid="dead-stock-writeoff-reason"');
    expect(section).toContain('data-testid="dead-stock-writeoff-save"');
    expect(section).toContain('testId={`dead-stock-writeoff-cat-${c}`}');
    expect(section).toContain('aria-live="polite"');
  });

  it('the ONE home\u2019s composers are pressed, never re-typed on the desk', () => {
    expect(section).toContain('setClearDraft(String(deadStockClearanceSuggestion(row)));');
    expect(section).toContain('deadStockMarginVoice(Number(clearDraft), clearRow)');
    expect(desk.match(/Dead-stock write-off \(/g) ?? []).toHaveLength(0); // the desk never hand-composes the reason
  });

  it('the census speaks twelve handles — the dated re-key (v2.498.0)', () => {
    // v2.498.0 re-key (dated): the section grows its ELEVENTH and
    // TWELFTH voices — the action arc's two row doors (the Clear handle
    // and the Write off handle, the double voice every handle wears).
    // The write-off door's three classification chips wear their voices
    // through the loom's own prop (the filter-chip loom renders the
    // aria-label — a voice the section's bytes don't spell, the same
    // reading the window chips have always worn). The dialogs' inputs
    // speak through their Labels (the edit door's own shape — no extra
    // aria-label), the saves through their titles. The census speaks the
    // section's twelve handles now, and the Ask pair's elder bytes stand
    // untouched.
    expect(section.split('aria-label=').length - 1).toBe(12);
  });
});

// ---------------------------------------------------------------------------
// 3. THE ONE HOME — the dated verse stands
// ---------------------------------------------------------------------------

describe('the ONE home — the action arc\u2019s verse', () => {
  it('the home wears the round\u2019s own comment', () => {
    expect(home).toContain('v2.498.0 THE RESTING LEDGER LEARNS TO ACT');
  });

  it('the words stay PURE — no DOM import in the report lib', () => {
    expect(home.includes("from 'react'")).toBe(false);
    expect(home.includes('document.')).toBe(false);
    expect(home.includes('window.')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. THE FEED — the head wears the round's own story
// ---------------------------------------------------------------------------

describe('whats-new — the action arc leads the feed', () => {
  const head = WHATS_NEW[0];

  it('the head wears the round\u2019s own story', () => {
    expect(head.version).toBe('2.498.0');
    expect(head.title).toContain('resting ledger');
    expect(head.title).toContain('learns to act');
    expect(head.title).toContain('resting ledger learns to reach out');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('clearance price'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('write-off'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('cost floor'))).toBe(true);
  });
});
