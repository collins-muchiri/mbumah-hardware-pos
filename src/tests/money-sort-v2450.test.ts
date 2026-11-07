/**
 * v2.450.0 THE MONEY SORT — the customers desk's debt comparator lied:
 * the contract says `currentDebtBalance: number`, the wire delivers
 * Decimal-as-string (the Kenya Plumbing Co. law — contract types don't
 * enforce runtime), and string vs string compares LEXICOGRAPHICALLY, so
 * the ascending walk read 0, 0, 120000, 15000, 250000 and the
 * loudest-debtor read put 5000 above 45000. The live QA burst caught it
 * (the wardrobe round's honest probe proved the flip while the order
 * refused to be numeric). The fix coerces at the comparator — the ONE
 * seat the desk owns: the debt filters compare against number literals
 * (JS coerces), the meter divides (JS coerces), only this sort's
 * string/string pair lied. Loyalty is coerced with it (same incident
 * class, future-proof). The wardrobe's bytes keep their exact seats.
 *
 * THE WORD-FREE LAW holds: this suite speaks no lens word.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const DESK = 'src/app/(shell)/tabs/customers-tab.tsx';
const tab = readFileSync(DESK, 'utf8');

describe('the money sort tells the truth (v2.450.0)', () => {
  it('the debt comparator coerces at the seat — the wire’s lie cannot pass', () => {
    expect(tab).toContain(
      "case 'debt': aVal = Number(a.currentDebtBalance); bVal = Number(b.currentDebtBalance); break;",
    );
  });

  it('the loyalty comparator coerces with it — the same incident class', () => {
    expect(tab).toContain(
      "case 'loyalty': aVal = Number(a.loyaltyPoints); bVal = Number(b.loyaltyPoints); break;",
    );
  });

  it('the bare string compare is gone — the lie has no seat', () => {
    expect(tab).not.toContain('aVal = a.currentDebtBalance;');
    expect(tab).not.toContain('aVal = a.loyaltyPoints;');
  });

  it('the round is named at the seat — the law and its reason ride together', () => {
    expect(tab).toContain('v2.450.0 THE MONEY SORT');
    expect(tab).toContain('LEXICOGRAPHICALLY');
  });

  it('the name case keeps its seat — the desk’s own shape unchanged', () => {
    expect(tab).toContain("case 'name': aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); break;");
    expect(tab).toContain("default: aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase();");
  });

  it('the wardrobe’s bytes keep their exact seats — v2.449.0 untouched', () => {
    expect(tab).toContain('v2.449.0 THE FAMILY\'S DETERMINISM');
    expect(tab).toContain('return a.name.localeCompare(b.name);');
    expect(tab).toContain('data-testid="customers-sort-debt"');
  });

  it('the two-press law rides verbatim', () => {
    expect(tab).toContain("setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');");
    expect(tab).toContain("setSortField(field);\n      setSortDirection('asc');");
  });
});
