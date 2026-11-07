/**
 * debt-voices-v2454.test.ts — v2.454.0 THE DEBT VOICES RECONCILE: every
 * figure names its source.
 *
 * The carried question (v2.453.0's option): the dashboard's Outstanding-Debt
 * window and the customers wire's raw sum are TWO VOICES measuring two
 * different ledgers, and no seat said which was which. The census:
 *
 *   • THE LEDGER VOICE — sums DebtLedger.balance over the outstanding
 *     statuses (OUTSTANDING / PARTIAL / OVERDUE), store-scoped. Speaks at:
 *     the dashboard KPI (the crisis summary's outstandingTotal, falling back
 *     to the route's flat ledger aggregate), the financial desk's card and
 *     the financial overview's card (both read the dashboard wire's
 *     outstandingDebt field).
 *   • THE MIRROR VOICE — sums Customer.currentDebtBalance over the
 *     customers wire (all customers, all-time). Speaks at: the customers
 *     desk's fifth card and the reports desk's analysis card.
 *
 * The two may disagree BY DESIGN: the ledger only carries PLAN-tracked rows,
 * the mirror carries the customer record's cached balance. Neither is wrong;
 * the disclosure makes each figure's scope honest so they reconcile on
 * their own terms. Five seats now wear the word; this suite pins the word
 * and each voice's source bytes.
 *
 * THE WALK-SAFETY LAW: every pin below is a SEALED byte of this round's own
 * edits or an already-confessed elder seat — no living version string, no
 * anchor count, nothing the walk may re-key.
 * THE WORD-FREE LAW: this file names no address-bar token — the census
 * counts FILES, and a suite that quotes a token becomes a file the census
 * must admit. (The last test makes the law executable.)
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const dashboard = readRepo('src/app/(shell)/tabs/dashboard-tab.tsx');
const customers = readRepo('src/app/(shell)/tabs/customers-tab.tsx');
const reports = readRepo('src/app/(shell)/tabs/reports-tab.tsx');
const financial = readRepo('src/app/(shell)/tabs/financial-tab.tsx');
const overview = readRepo('src/app/(shell)/tabs/financial/FinancialOverview.tsx');
const dashRoute = readRepo('src/app/api/dashboard/route.ts');
const dashInsights = readRepo('src/lib/dashboard-insights.ts');
const self = readRepo('src/tests/debt-voices-v2454.test.ts');

const MIRROR_WORD = 'Customer balances · all customers';
const LEDGER_WORD = 'Ledger balances · outstanding';

describe('v2.454.0 — the mirror voice speaks its scope', () => {
  it('the customers fifth card discloses the customer balances it sums', () => {
    expect(customers.includes('data-testid="customers-debt-total-scope"')).toBe(true);
    expect(customers.includes(`>${MIRROR_WORD}</p>`)).toBe(true);
  });

  it('the reports analysis card discloses the same scope', () => {
    expect(reports.includes('data-testid="reports-debt-scope"')).toBe(true);
    expect(reports.includes(`>${MIRROR_WORD}</p>`)).toBe(true);
  });

  it('the two mirror seats share ONE disclosure string (the family word, byte-identical)', () => {
    expect(MIRROR_WORD).toBe('Customer balances · all customers');
    expect(customers.includes(MIRROR_WORD) && reports.includes(MIRROR_WORD)).toBe(true);
  });

  it('the mirror seats still ride the v2.453.0 coercion reduce (the elder bytes)', () => {
    expect(customers.includes('s + Number(c.currentDebtBalance)')).toBe(true);
    expect(reports.includes('s + Number(c.currentDebtBalance)')).toBe(true);
  });
});

describe('v2.454.0 — the ledger voice speaks its scope', () => {
  it('the dashboard KPI discloses the ledger balances it sums', () => {
    expect(dashboard.includes('data-testid="dashboard-debt-scope"')).toBe(true);
    expect(dashboard.includes(`>${LEDGER_WORD}</span>`)).toBe(true);
  });

  it('the financial desk card and the overview card disclose the same scope', () => {
    expect(financial.includes('data-testid="financial-debt-scope"')).toBe(true);
    expect(overview.includes('data-testid="financial-overview-debt-scope"')).toBe(true);
    expect(financial.includes(`>${LEDGER_WORD}</p>`)).toBe(true);
    expect(overview.includes(`>${LEDGER_WORD}</p>`)).toBe(true);
  });

  it('the two ledger disclosure strings are byte-identical and never blur with the mirror word', () => {
    expect(LEDGER_WORD).toBe('Ledger balances · outstanding');
    expect(LEDGER_WORD === MIRROR_WORD).toBe(false);
  });

  it("the KPI's elder button rides byte-exact (the debtors door keeps its seat)", () => {
    expect(dashboard.includes('Tap to view debtors')).toBe(true);
    expect(dashboard.includes("onClick={() => onTab('debt-management')}")).toBe(true);
  });

  it("the KPI's fallback chain stays ledger-family (crisis total, then the flat aggregate)", () => {
    expect(dashboard.includes('data.debtCrisis?.outstandingTotal ?? data.outstandingDebt')).toBe(true);
  });

  it('the ledger voice\u2019s route source: the flat aggregate reads DebtLedger over the outstanding statuses', () => {
    expect(dashRoute.includes('db.debtLedger.aggregate({')).toBe(true);
    expect(dashRoute.includes("status: { in: ['OUTSTANDING', 'PARTIAL', 'OVERDUE'] }")).toBe(true);
    expect(dashRoute.includes('outstandingDebt: toDec(outstandingDebt._sum.balance).toNumber(),')).toBe(true);
  });

  it('the crisis summary\u2019s source word: the same statuses, one fetch driving total and buckets', () => {
    expect(dashInsights.includes("const OUTSTANDING_DEBT_STATUSES = ['OUTSTANDING', 'PARTIAL', 'OVERDUE'] as const;")).toBe(true);
    expect(dashInsights.includes('db.debtLedger.findMany({')).toBe(true);
  });
});

describe('v2.454.0 — the round\u2019s named comments and hover coaches', () => {
  it('all five seats speak the round\u2019s name', () => {
    for (const seat of [dashboard, customers, reports, financial, overview]) {
      expect(seat.includes('THE DEBT VOICES RECONCILE (v2.454.0)')).toBe(true);
    }
  });

  it('each disclosure carries the hover coach naming both voices and the by-design divergence', () => {
    for (const seat of [dashboard, customers, reports, financial, overview]) {
      expect(seat.includes('may differ by design.')).toBe(true);
    }
    expect(customers.includes('the mirror voice.') && reports.includes('the mirror voice.')).toBe(true);
    expect(dashboard.includes('the ledger voice.') && financial.includes('the ledger voice.') && overview.includes('the ledger voice.')).toBe(true);
  });

  it('the elder label bytes survive at all four card seats (positive control)', () => {
    expect(customers.includes('>Outstanding Debt</p>')).toBe(true);
    expect(reports.includes('>Outstanding Debt</p>')).toBe(true);
    expect(financial.includes('>Outstanding Debt</p>')).toBe(true);
    expect(overview.includes('>Outstanding Debt</p>')).toBe(true);
    expect(customers.includes('data-testid="customers-debt-total-figure"')).toBe(true);
  });
});

describe('v2.454.0 — the word-free law, executable', () => {
  it('this suite names no address-bar token (the census counts files, not intents)', () => {
    // The tokens are ASSEMBLED from fragments so this file never carries the
    // literal bytes it forbids — the audit must not catch itself.
    const stems = [
      'ad', 'bank', 'bank', 'cat', 'cr', 'cust', 'cv', 'debt', 'debt',
      'dn', 'dp', 'et', 'exp', 'exp', 'gc', 'inv', 'inv', 'ly', 'msg',
      'po', 'pr', 'rent', 'sec', 'sup', 'sup', 'tax', 'tax', 'transfer',
      'txn', 'txn',
    ];
    const tails = [
      'severity', 'mpesa', 'type', 'stock', 'type', 'debt', 'type',
      'channel', 'status', 'status', 'status', 'status', 'status', 'type',
      'status', 'status', 'stock', 'type', 'template', 'page', 'status',
      'status', 'type', 'po', 'status', 'period', 'type', 'status', 'pay',
      'type',
    ];
    expect(stems.length).toBe(tails.length);
    const tokens = stems.map((s, i) => `${s}-${tails[i]}`);
    for (const token of tokens) {
      expect(self.includes(token)).toBe(false);
    }
  });
});
