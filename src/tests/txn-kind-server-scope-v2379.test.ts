// THE SERVER SPEAKS THE DESK’S VOCABULARY (v2.379.0): the kind scope
// crosses the API boundary and the settled gap stops counting nothing.
//
// Two stories, one round:
//
// 1. THE SERVER-SIDE KIND SCOPE — GET /api/transactions grew `kind`, the
//    transactions desk's own census keyset (sale | refund | settlement |
//    void). The settlement's server face is the ZERO-ITEM law itself —
//    the same isSettlementEvent derivation the desk has spoken since
//    v2.375.0 — now expressed in the query: `items: { none: {} }` IS the
//    zero-item world, `some: {}` the itemized one. A recognized kind
//    outranks a coincident `transactionType`; an unrecognized kind is
//    ignored (the API never 400s on vocabulary it does not know). The
//    count rides the SAME where, so pagination stays honest under the
//    scope.
// 2. THE SETTLEMENT'S ITEMS CELL — the zero-item row's items cell said
//    "0 items": a dead voice counting nothing, on the one row whose
//    whole truth is that no line world exists. It now wears the emerald
//    settle voice — "settled gap" — naming what the row actually is;
//    every other kind keeps the mono count badge (the sale's "3 items"
//    is still the receipt's truth).
//
// Pins: the param's read and its contract comment, the four refinements'
// bytes, the outranks ORDER (the kind chain stands after the flat
// transactionType filter), the unknown-kind never-scopes shape, the
// settled-gap badge and its emerald inks, the mono badge's survival, and
// the count query's shared where. THE OD LAW: bytes, not memory.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const ROUTE_PATH = 'src/app/api/transactions/route.ts';
const route = readFileSync(ROUTE_PATH, 'utf8');
const DESK_PATH = 'src/app/(shell)/tabs/transactions-tab.tsx';
const desk = readFileSync(DESK_PATH, 'utf8');

function between(source: string, startMarker: string, endMarker: string): string {
  const a = source.indexOf(startMarker);
  const b = source.indexOf(endMarker, a);
  expect(a, startMarker).toBeGreaterThanOrEqual(0);
  expect(b, endMarker).toBeGreaterThan(a);
  return source.slice(a, b);
}

// ---------------------------------------------------------------------------
// 1. THE SERVER-SIDE KIND SCOPE — the param, the refinements, the order law
// ---------------------------------------------------------------------------

describe('the server-side kind scope (v2.379.0)', () => {
  it('the route reads the kind param and speaks its contract', () => {
    expect(route).toContain("const kind = searchParams.get('kind') || '';");
    expect(route).toContain('THE SERVER-SIDE KIND SCOPE');
    // the contract: recognized outranks, unrecognized never 400s
    expect(route).toContain('A RECOGNIZED kind OUTRANKS a coincident `transactionType`');
    expect(route).toContain('an UNRECOGNIZED kind is IGNORED');
  });

  it('the sale word scopes the SALE flat type', () => {
    expect(route).toContain("if (kind === 'sale') {\n    where.transactionType = 'SALE';");
  });

  it('the void word scopes the VOID flat type', () => {
    expect(route).toContain("} else if (kind === 'void') {\n    where.transactionType = 'VOID';");
  });

  it('the settlement word refines REFUND through the zero-item law', () => {
    expect(route).toContain("} else if (kind === 'settlement') {\n    where.transactionType = 'REFUND';\n    where.items = { none: {} };");
  });

  it('the refund word keeps the itemized world through the some law', () => {
    expect(route).toContain("} else if (kind === 'refund') {\n    where.transactionType = 'REFUND';\n    where.items = { some: {} };");
  });

  it('the recognized kind outranks the coincident transactionType (the ORDER law)', () => {
    const flat = route.indexOf('if (transactionType) {');
    const chain = route.indexOf("if (kind === 'sale') {");
    expect(flat, 'the flat transactionType filter exists').toBeGreaterThanOrEqual(0);
    expect(chain, 'the kind chain exists').toBeGreaterThanOrEqual(0);
    expect(chain).toBeGreaterThan(flat);
  });

  it('the unknown kind never scopes (the chain has no catch-all else)', () => {
    const chain = between(
      route,
      "// v2.379.0 THE KIND'S SERVER FACE",
      'if (cashierId) {'
    );
    expect(chain).toContain("} else if (kind === 'refund') {");
    expect(chain).not.toMatch(/else\s*\{\s*\}\s*$/);
    // the chain closes and hands control back — nothing scopes an unknown word
    expect(chain.endsWith('  }\n\n  ')).toBe(true);
  });

  it('the count query rides the SAME where (pagination honest under the scope)', () => {
    expect(route).toContain('db.salesTransaction.count({ where })');
  });
});

// ---------------------------------------------------------------------------
// 2. THE SETTLEMENT'S ITEMS CELL — the settled gap speaks, the count rides
// ---------------------------------------------------------------------------

describe("the settlement's items cell (v2.379.0)", () => {
  it('the zero-item row wears the settled gap voice, not a dead count', () => {
    expect(desk).toContain('THE SETTLEMENT\'S ITEMS CELL');
    expect(desk).toContain("txType === 'settlement' ? (");
    expect(desk).toContain('settled gap');
  });

  it('the settled gap badge wears the emerald settle inks (the kind\u2019s own family)', () => {
    expect(desk).toContain(
      'className="text-[10px] px-1.5 py-0 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"'
    );
  });

  it('every other kind keeps the mono count badge (the receipt\u2019s own truth)', () => {
    const cell = between(
      desk,
      '<TableCell className="text-xs text-center">',
      '<TableCell className="text-xs font-bold text-right">'
    );
    expect(cell).toContain("txType === 'settlement' ? (");
    expect(cell).toContain('{items.length} {items.length === 1 ? \'item\' : \'items\'}');
    expect(cell).toContain('className="text-[10px] px-1.5 py-0 font-mono"');
  });

  it('the amount cell\u2019s v2.378 settle ink rides untouched beside the new voice', () => {
    expect(desk).toContain("txType === 'settlement' ? 'text-emerald-700'");
    expect(desk).toContain("{txType === 'refund' || txType === 'settlement' ? '-' : ''}");
  });
});
