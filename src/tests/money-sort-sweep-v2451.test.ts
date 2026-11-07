/**
 * v2.451.0 THE MONEY-SORT SWEEP — the grep-driven audit of every desk's
 * money comparator, the sequel to the customers desk's confession
 * (v2.450.0): the sweep greps every generic `aVal < bVal` comparator for
 * raw money reads and finds TWO more desks lying — the invoice
 * register's total-amount read and the inventory desk's price, cost and
 * stock reads (quantityInStock is a DECIMAL column, not an Int — the
 * schema's own word — so the wire delivers Decimal-as-string for all
 * three). All four seats now coerce to numbers at the comparator.
 *
 * The SAFE patterns are pinned as the sweep's positive controls:
 * the profit margin's arithmetic (subtraction and division coerce —
 * JS's own law), the supplier leaderboard's computed metrics (reduce
 * with arithmetic → numbers before they ever reach a comparator), and
 * the identifier sorts (invoice number, SKU, name) which stay lexical
 * BY DESIGN.
 *
 * THE WORD-FREE LAW holds: this suite speaks no lens word.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const INVOICES = 'src/app/(shell)/tabs/invoices-tab.tsx';
const INVENTORY = 'src/app/(shell)/tabs/inventory-tab.tsx';
const CUSTOMERS = 'src/app/(shell)/tabs/customers-tab.tsx';
const LEADERBOARD = 'src/components/suppliers/supplier-leaderboard.tsx';

const invoices = readFileSync(INVOICES, 'utf8');
const inventory = readFileSync(INVENTORY, 'utf8');
const customers = readFileSync(CUSTOMERS, 'utf8');
const leaderboard = readFileSync(LEADERBOARD, 'utf8');

describe('the money-sort sweep — every comparator tells the truth (v2.451.0)', () => {
  it('the invoice register’s total-amount seat coerces', () => {
    expect(invoices).toContain(
      "case 'totalAmount': aVal = Number(a.totalAmount); bVal = Number(b.totalAmount); break;",
    );
    expect(invoices).not.toContain('aVal = a.totalAmount;');
  });

  it('the shelves’ three numeric seats coerce (price, cost, stock)', () => {
    expect(inventory).toContain(
      "case 'pricePerUnit': aVal = Number(a.pricePerUnit); bVal = Number(b.pricePerUnit); break;",
    );
    expect(inventory).toContain(
      "case 'costPrice': aVal = Number(a.costPrice ?? 0); bVal = Number(b.costPrice ?? 0); break;",
    );
    expect(inventory).toContain(
      "case 'quantityInStock': aVal = Number(a.quantityInStock); bVal = Number(b.quantityInStock); break;",
    );
    expect(inventory).not.toContain('aVal = a.pricePerUnit;');
    expect(inventory).not.toContain('aVal = a.costPrice ?? 0;');
    expect(inventory).not.toContain('aVal = a.quantityInStock;');
  });

  it('the cost-hidden coalesce keeps its seat INSIDE the coercion', () => {
    expect(inventory).toContain('costPrice is null on the wire for cost-hidden roles');
  });

  it('the first confession still rides — the customers desk’s seats', () => {
    expect(customers).toContain(
      "case 'debt': aVal = Number(a.currentDebtBalance); bVal = Number(b.currentDebtBalance); break;",
    );
  });

  it('the margin’s arithmetic is a SAFE pattern — pinned as the positive control', () => {
    expect(inventory).toContain(
      'aVal = a.pricePerUnit > 0 ? (a.pricePerUnit - (a.costPrice ?? 0)) / a.pricePerUnit : 0;',
    );
  });

  it('the leaderboard’s metrics are COMPUTED (reduce) — numbers before the comparator', () => {
    expect(leaderboard).toContain('aVal = a.metrics.performanceScore;');
    expect(leaderboard).toContain('aVal = a.metrics.totalSpend;');
  });

  it('the identifiers stay lexical BY DESIGN — the sweep does not over-reach', () => {
    expect(invoices).toContain("case 'invoiceNumber': aVal = a.invoiceNumber; bVal = b.invoiceNumber; break;");
    expect(inventory).toContain("case 'sku': aVal = a.sku.toLowerCase(); bVal = b.sku.toLowerCase(); break;");
  });

  it('the round is named at every fixed seat', () => {
    expect(invoices).toContain('v2.451.0 THE MONEY-SORT SWEEP');
    expect(inventory).toContain('v2.451.0 THE MONEY-SORT SWEEP');
  });

  it('the desks’ own two-press laws ride untouched', () => {
    expect(invoices).toContain("if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;");
    expect(inventory).toContain("if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;");
    expect(customers).toContain("setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');");
  });
});
