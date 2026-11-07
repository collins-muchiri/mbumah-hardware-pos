/**
 * reduce-sweep-v2453.test.ts — v2.453.0 THE REDUCE SWEEP: the customers
 * wire learns its numbers.
 *
 * The v2.452.0 confession named the pattern (a numeric seed + a
 * Decimal-as-string field = CONCATENATION, not addition) and promised the
 * grep. This round the grep ran across every desk's summing seat and found
 * the customers wire feeding its sums raw Prisma Decimals: the reports
 * desk's customer-analysis card read the lie LIVE (three real debts of
 * 3500, 1200 and 0 glued into "035001200" — Ksh 35,001,200.00 for Ksh
 * 4,700.00), and the customers desk carried the same shape LATENT (a sum
 * the underscore kept silent). The fix is three seats deep:
 *
 *   1. THE WIRE'S HONEST BOUNDARY — /api/customers coerces the two money
 *      fields after the spread (the contract declared `number`; the wire
 *      delivered strings — the v2.450.0 comparator fix told the truth at
 *      its seat while the wire kept lying underneath).
 *   2. THE LIVE SEAT — the reports desk's reduce coerces at its own line
 *      (defense in depth, the invoices-stats law) and the card's figure
 *      wears tabular digits.
 *   3. THE LATENT SEAT, LIT — the customers desk's sum coerces the same
 *      way and finally renders: the fifth stat card.
 *
 * The safe seats are pinned here too: the aging buckets subtract (a
 * coercion by arithmetic), the single-value renders ride toDec, and the
 * family's earlier confessions stay confessed (the invoices stats, the
 * transactions boundary, the debt comparator).
 *
 * THE WALK-SAFETY LAW: every pin below is a SEALED byte of this round's
 * own edits or an already-confessed elder seat — no living version
 * literal appears in any expect().
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(p, 'utf8');

const ROUTE = 'src/app/api/customers/route.ts';
const REPORTS = 'src/app/(shell)/tabs/reports-tab.tsx';
const CUSTOMERS = 'src/app/(shell)/tabs/customers-tab.tsx';
const INVOICES = 'src/app/(shell)/tabs/invoices-tab.tsx';
const TXNS = 'src/app/api/transactions/route.ts';
const CONTRACT = 'src/lib/api.ts';

describe('v2.453.0 — the wire\'s honest boundary (/api/customers)', () => {
  const route = read(ROUTE);

  it('the two money fields coerce right after the spread', () => {
    const spread = route.indexOf('...customerData,');
    const debt = route.indexOf('currentDebtBalance: Number(customerData.currentDebtBalance),');
    const limit = route.indexOf('debtLimit: Number(customerData.debtLimit),');
    expect(spread).toBeGreaterThan(-1);
    expect(debt).toBeGreaterThan(spread);
    expect(limit).toBeGreaterThan(debt);
  });

  it('the raw Decimal never reaches the response untouched (no bare pass-through)', () => {
    expect(route.includes('currentDebtBalance: customerData.currentDebtBalance')).toBe(false);
    expect(route.includes('currentDebtBalance: Number(')).toBe(true);
    expect(route.includes('debtLimit: Number(')).toBe(true);
  });

  it('the boundary carries its own confession (the law, named at the seat)', () => {
    expect(route.includes('THE REDUCE SWEEP')).toBe(true);
    expect(route.includes('v2.453.0')).toBe(true);
    expect(route.includes('every future consumer is born honest')).toBe(true);
  });

  it('the contract the wire now honors (CustomerItem declared number long ago)', () => {
    const contract = read(CONTRACT);
    expect(contract.includes('currentDebtBalance: number;')).toBe(true);
    expect(contract.includes('debtLimit: number;')).toBe(true);
  });
});

describe('v2.453.0 — the live seat (the reports desk\'s debt card)', () => {
  const reports = read(REPORTS);

  it('the debtTotal reduce coerces at the seat', () => {
    expect(reports.includes('customers.reduce((s, c) => s + Number(c.currentDebtBalance), 0)')).toBe(true);
  });

  it('the bare concat shape is gone from the file', () => {
    expect(reports.includes('s + c.currentDebtBalance')).toBe(false);
  });

  it('the card\'s figure wears tabular digits', () => {
    expect(reports.includes('text-2xl font-bold whitespace-nowrap tabular-nums">{formatKES(customerAnalysis.debtTotal)}</p>')).toBe(true);
  });

  it('the seat keeps its own confession (the invoices-stats law, named)', () => {
    expect(reports.includes('THE REDUCE SWEEP')).toBe(true);
    expect(reports.includes('defense in depth')).toBe(true);
  });

  it('the other reports sums stay honest (positive control: they coerce upstream)', () => {
    // totalSpent rides the transactions wire (boundary-coerced since v2.5.0);
    // the chart sums derive from num()/Number() mappings — the seats this
    // sweep audited and found clean keep their shapes untouched.
    expect(reports.includes('const totalSpent = topCustomers.reduce((s, c) => s + c.totalSpent, 0);')).toBe(true);
    expect(reports.includes('revenue: num(p.totalRevenue)')).toBe(true);
    expect(reports.includes('predicted: Math.round(Number(f.predicted ?? 0))')).toBe(true);
  });
});

describe('v2.453.0 — the latent seat, lit (the customers desk\'s fifth card)', () => {
  const customers = read(CUSTOMERS);

  it('the sum coerces at the seat and the underscore is gone', () => {
    expect(customers.includes('const totalDebt = rawCustomers.reduce((s, c) => s + Number(c.currentDebtBalance), 0);')).toBe(true);
    expect(customers.includes('_totalDebt')).toBe(false);
    expect(customers.includes('s + c.currentDebtBalance')).toBe(false);
  });

  it('the fifth stat card exists with its own testids', () => {
    expect(customers.includes('data-testid="customers-debt-total-card"')).toBe(true);
    expect(customers.includes('data-testid="customers-debt-total-figure"')).toBe(true);
  });

  it('the card speaks the shillings voice: the label, the Wallet face, the risk gradient', () => {
    expect(customers.includes('>Outstanding Debt</p>')).toBe(true);
    expect(customers.includes('<Wallet className="h-5 w-5" />')).toBe(true);
    expect(customers.includes('from-rose-500 to-red-600')).toBe(true);
    expect(customers.includes('import { Users, Search, Plus, CircleDollarSign, AlertTriangle, Eye, Loader2, HandCoins, Banknote, Smartphone, ShoppingBag, Phone, Mail, MapPin, CreditCard, Clock, ArrowUpDown, ChevronDown, ChevronUp, ChevronsUpDown, Filter, UserPlus, TrendingUp, FileText, Bell, History, Send, Tag, Gift, Truck, FileCheck, Receipt, Minus, Printer, MessageSquare, Wallet } from \'lucide-react\';')).toBe(true);
  });

  it('the figure renders through the canonical formatter with tabular digits', () => {
    expect(customers.includes('tabular-nums whitespace-nowrap">{formatKES(totalDebt)}</p>')).toBe(true);
  });

  it('the row steps to five so no card wraps alone', () => {
    expect(customers.includes('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3')).toBe(true);
    expect(customers.includes('stagger-5')).toBe(true);
    expect(customers.includes('md:grid-cols-4 gap-3')).toBe(false);
  });

  it('the aging buckets stay honest by arithmetic (subtraction coerces — pinned as the safe shape)', () => {
    expect(customers.includes('const balance = d.amountOwed - d.amountPaid;')).toBe(true);
    expect(customers.includes('buckets.current += balance;')).toBe(true);
  });
});

describe('v2.453.0 — the family\'s earlier confessions stay confessed (positive controls)', () => {
  it('the invoices stats coerce (the v2.452.0 seats)', () => {
    const invoices = read(INVOICES);
    expect(invoices.includes('paidInvoices.reduce((s, i) => s + Number(i.totalAmount), 0)')).toBe(true);
    expect(invoices.includes('outstanding.reduce((s, i) => s + Number(i.totalAmount), 0)')).toBe(true);
  });

  it('the transactions wire\'s boundary coerces (the v2.5.0 precedent this round extends)', () => {
    const txns = read(TXNS);
    expect(txns.includes('totalAmount: Number(t.totalAmount),')).toBe(true);
    expect(txns.includes('subtotal: Number(t.subtotal),')).toBe(true);
  });

  it('the debt comparator coerces (the v2.450.0 seat one line from this round\'s)', () => {
    const customers = read(CUSTOMERS);
    expect(customers.includes("case 'debt': aVal = Number(a.currentDebtBalance); bVal = Number(b.currentDebtBalance); break;")).toBe(true);
  });

  it('three confessions, one name: the law is spoken at every seat it fixed', () => {
    expect(read(ROUTE).includes('THE REDUCE SWEEP')).toBe(true);
    expect(read(REPORTS).includes('THE REDUCE SWEEP')).toBe(true);
    expect(read(CUSTOMERS).includes('THE REDUCE SWEEP')).toBe(true);
  });
});
