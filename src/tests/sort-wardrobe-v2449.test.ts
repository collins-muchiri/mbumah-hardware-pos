/**
 * v2.449.0 THE FAMILY'S WARDROBE — the customers desk's three sort
 * handles learn the census's grammar: the hover affordance (ChevronsUpDown
 * waits at opacity-0 for the hover/focus), the active voice reading
 * semibold under a lit arrow (ChevronUp ascending, ChevronDown
 * descending), aria-sort naming the order to the machine (ascending or
 * descending on the speaking column, silence on the rest), both
 * aria-label voices and titles, the zinc focus-visible ring, and testids
 * for QA. The desk's own two-press law (press to sort, press again to
 * flip) rides untouched — ONE sortField state means only one voice can
 * speak at a time BY CONSTRUCTION (the exclusion is structural here, no
 * retirements needed), and the sort's ties break by the customer's own
 * name (the family's determinism law, ported).
 *
 * THE WORD-FREE LAW (the v2.394.0 loom's own lesson, honoured): this
 * suite speaks NO lens word — the debt lens's vocabulary census owns
 * that word's file list, and the elder faces (the credit-envelope
 * meter, the landing word) stay pinned by their OWN suites. This suite
 * pins only the wardrobe.
 *
 * Extraction: each block is its handle BY NAME (identity by testid, not
 * by button order — the v2.446.0 law).
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const DESK = 'src/app/(shell)/tabs/customers-tab.tsx';
const tab = readFileSync(DESK, 'utf8');

const theadAt = tab.indexOf('<TableHeader');
const tbodyAt = tab.indexOf('<TableBody');
const thead = tab.slice(theadAt, tbodyAt);

const handle = (testid: string) => {
  const at = thead.indexOf(`data-testid="${testid}"`);
  expect(at).toBeGreaterThan(-1);
  const block = thead.slice(thead.lastIndexOf('<button', at), thead.indexOf('</button>', at));
  const thInner = thead.indexOf('aria-sort={sortField ===', thead.lastIndexOf('<TableHead', at));
  const thBlock = thead.slice(thead.lastIndexOf('<TableHead', thInner), thead.indexOf('</TableHead>', thInner));
  return { block, thBlock };
};

const NAME = handle('customers-sort-name');
const DEBT = handle('customers-sort-debt');
const LOYALTY = handle('customers-sort-loyalty');

describe('the debt desk wears the family’s wardrobe (v2.449.0)', () => {
  it('three handles by name — real buttons with the walk’s testids', () => {
    for (const { block } of [NAME, DEBT, LOYALTY]) {
      expect(block).toContain('type="button"');
    }
  });

  it('the machine hears the order — aria-sort names ascending AND descending', () => {
    for (const { thBlock } of [NAME, DEBT, LOYALTY]) {
      expect(thBlock).toContain("? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined");
    }
  });

  it('the two aria voices — the landing and the flip', () => {
    expect(NAME.block).toContain("'Sort the customers by name'");
    expect(DEBT.block).toContain("'Sort the customers by debt balance'");
    expect(LOYALTY.block).toContain("'Sort the customers by loyalty points'");
    for (const { block } of [NAME, DEBT, LOYALTY]) {
      expect(block).toContain('press again to flip the direction');
    }
  });

  it('the two titles — the machine reads the same law', () => {
    expect(NAME.block).toContain("'Press to sort the customers by name'");
    expect(DEBT.block).toContain("'Press to sort the customers by debt balance'");
    expect(LOYALTY.block).toContain("'Press to sort the customers by loyalty points'");
    for (const { block } of [NAME, DEBT, LOYALTY]) {
      expect(block).toContain('press again to flip`');
    }
  });

  it('the affordance grammar — lit arrows by direction, the waiting ChevronsUpDown', () => {
    for (const { block } of [NAME, DEBT, LOYALTY]) {
      expect(block).toContain('<ChevronUp');
      expect(block).toContain('<ChevronDown');
      expect(block).toContain('<ChevronsUpDown');
      expect(block).toContain('opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100');
      expect((block.match(/aria-hidden="true"/g) ?? []).length).toBe(3);
    }
  });

  it('the active voice and the zinc ring — the wardrobe’s seats', () => {
    for (const { block } of [NAME, DEBT, LOYALTY]) {
      expect(block).toContain("? 'font-semibold text-foreground' : 'hover:text-foreground'");
      expect(block).toContain('focus-visible:ring-zinc-400');
    }
  });

  it('three group ths — the affordance’s stage', () => {
    expect(thead.match(/className="group"/g) ?? []).toHaveLength(3);
  });

  it('the desk’s own two-press law rides untouched — handleSort verbatim', () => {
    expect(tab).toContain("const handleSort = (field: SortField) => {");
    expect(tab).toContain("setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');");
    expect(tab).toContain("setSortField(field);\n      setSortDirection('asc');");
  });

  it('THE FAMILY’S DETERMINISM — a tie is the row’s own name', () => {
    expect(tab).toContain('return a.name.localeCompare(b.name);');
    expect(tab).not.toContain('return 0;');
  });

  it('the doors ride — the debt lens’s filters keep their exact seats', () => {
    expect(tab).toContain("if (debtFilter === 'no_debt') result = result.filter(c => c.currentDebtBalance <= 0);");
    expect(tab).toContain("else if (debtFilter === 'overdue') result = result.filter(c => c.debtLimit > 0 && c.currentDebtBalance / c.debtLimit > 0.5);");
  });

  it('the keyboard answers natively — no conjoin in any handle', () => {
    for (const { block } of [NAME, DEBT, LOYALTY]) {
      expect(block).not.toContain('onKeyDown');
      expect(block).not.toContain('e.stopPropagation()');
    }
    expect(theadAt).toBeGreaterThan(-1);
    expect(tbodyAt).toBeGreaterThan(theadAt);
  });

  it('exactly three sort handles on this desk', () => {
    expect((tab.match(/data-testid="customers-sort-/g) ?? []).length).toBe(3);
  });
});
