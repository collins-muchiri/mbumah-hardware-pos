// THE CENSUS BECOMES A DOOR (v2.443.0): the By Type table's rows press
// through to the history's own lens — the door the deep-link desks
// already know, now opened from the census side.
//   • THE DOOR: a row whose wire type owns a lens word (the kebab word
//     the history's chip row speaks) presses through the CONTROLLED
//     HAND — chooseExpType, never a direct state write — and the
//     history lands pre-filtered to that type. Press = land; press the
//     seat again = release (the door's second voice).
//   • THE TRANSLATION: the wire speaks UPPERCASE (`LOYALTY`,
//     `SALES_SUMMARY`), the lens speaks kebab (`loyalty`,
//     `sales-summary`); expTypeWordFor lives in the ONE home
//     (tab-url.ts, beside the word list it translates against) — a
//     wire type with no lens word answers null.
//   • THE HONESTY: the off-union rows the census counts (`PAYROLL`,
//     `ALL`) own NO lens word — their rows stay a census (cursor-help
//     and the honest title), never a door that cannot open.
//   • THE SEAT: the active row wears the desk's own emerald voice in
//     both states (light 50/70, dark 500/10); idle doors wear the
//     hover/focus seat; the ListFilter affordance rides the hover.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { EXP_TYPE_FILTERS, expTypeWordFor } from '@/lib/tab-url';

const TAB = 'src/app/(shell)/tabs/data-exports-tab.tsx';
const TAB_URL = 'src/lib/tab-url.ts';

const tab = readFileSync(TAB, 'utf8');
const tabUrl = readFileSync(TAB_URL, 'utf8');

describe('the census door’s translation (v2.443.0)', () => {
  it('the wire’s UPPERCASE speaks the lens’s kebab word', () => {
    expect(expTypeWordFor('LOYALTY')).toBe('loyalty');
    expect(expTypeWordFor('PRODUCTS')).toBe('products');
    expect(expTypeWordFor('TAX')).toBe('tax');
  });

  it('the kebab law — sales-summary’s kebab carries SALES_SUMMARY’s underscore', () => {
    expect(expTypeWordFor('SALES_SUMMARY')).toBe('sales-summary');
  });

  it('the off-union honesty — a wire type with no lens word answers null', () => {
    expect(expTypeWordFor('PAYROLL')).toBeNull();
    expect(expTypeWordFor('ALL')).toBeNull();
  });

  it('the neutral is NOT a word — ALL lowers to all, the resting state, never a door', () => {
    // a door that "filters to all" is a no-op masquerading as a door,
    // and the ALL row would wear the active seat at the resting state
    expect(expTypeWordFor('ALL')).toBeNull();
    expect(EXP_TYPE_FILTERS).toContain('all');
  });

  it('the word answers itself — the mapping is idempotent', () => {
    expect(expTypeWordFor('loyalty')).toBe('loyalty');
  });

  it('garbage answers null — never stranded, never guessed', () => {
    expect(expTypeWordFor('garbage')).toBeNull();
    expect(expTypeWordFor('')).toBeNull();
  });

  it('the round-trip law — every lens word round-trips from its wire form', () => {
    for (const member of EXP_TYPE_FILTERS) {
      if (member === 'all') continue;
      const wire = member.toUpperCase().replace(/-/g, '_');
      expect(expTypeWordFor(wire)).toBe(member);
    }
  });

  it('the translation lives in the ONE home — beside the word list itself', () => {
    expect(tabUrl).toContain(
      'export function expTypeWordFor(wire: string): ExpTypeFilter | null {',
    );
    expect(tabUrl).toContain(
      "  const word = wire.toLowerCase().replace(/_/g, '-') as ExpTypeFilter;",
    );
    expect(tabUrl).toContain(
      'return (EXP_TYPE_FILTERS as readonly string[]).includes(word) ? word : null;',
    );
    // the null law is a WRITTEN law, not an implication
    expect(tabUrl).toContain('its row stays a census, never a door');
  });
});

describe('the door takes its seat (v2.443.0)', () => {
  it('the census rows carry the translation — word rides the map', () => {
    expect(tab).toContain(
      ".map(([type, agg]) => ({ type, ...agg, word: expTypeWordFor(type) }))",
    );
  });

  it('the press routes through the controlled hand — never a direct state write', () => {
    expect(tab).toContain(": () => chooseExpType(active ? 'all' : word);");
    // the census tbody writes NO state directly — the hand is the ONE
    // voice (the landing chip's own dismissal predates the door and
    // stays the chip's own business)
    const tbody = tab.slice(tab.indexOf('<tbody>'), tab.indexOf('</tbody>'));
    expect(tbody).toContain('chooseExpType(');
    expect(tbody).not.toContain('setExpTypeFilter(');
  });

  it('the door’s second voice — pressing the seat again releases the lens', () => {
    expect(tab).toContain("const active = word !== null && expTypeFilter === word;");
    expect(tab).toContain("chooseExpType(active ? 'all' : word)");
  });

  it('the seat — the active row wears the desk’s emerald voice in both states', () => {
    expect(tab).toContain(
      "'group cursor-pointer bg-emerald-50/70 dark:bg-emerald-500/10'",
    );
  });

  it('the idle door — hover and focus-visible seats, never silent', () => {
    expect(tab).toContain(
      "'group cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none'",
    );
  });

  it('the off-union honesty — no word, no door, the honest title', () => {
    expect(tab).toContain(": 'cursor-help';");
    expect(tab).toContain(
      'This type has no history lens word — the census counts it, the lens cannot speak it',
    );
  });

  it('the door answers the keyboard — Enter and Space, the scroll swallowed', () => {
    expect(tab).toContain("if (e.key === 'Enter' || e.key === ' ') {");
    expect(tab).toContain('e.preventDefault();');
  });

  it('the row speaks to the reader — tabIndex, aria-current, both aria voices', () => {
    expect(tab).toContain('tabIndex={word !== null ? 0 : undefined}');
    expect(tab).toContain("aria-current={active ? 'true' : undefined}");
    expect(tab).toContain(
      '`Show ${row.type} runs in the history`',
    );
    expect(tab).toContain(
      '`${row.type} lens is on — press again to release the history filter`',
    );
  });

  it('the affordance rides the hover — ListFilter, emerald pair, aria-hidden', () => {
    expect(tab).toContain('text-emerald-600 dark:text-emerald-400 transition-opacity');
    expect(tab).toContain('opacity-0 group-hover:opacity-70 group-focus-visible:opacity-70');
    expect(tab).toContain('aria-hidden="true"');
    // the seat's icon is always lit; the idle door's waits for the hand
    expect(tab.indexOf("active\n                                    ? 'opacity-100'")).toBeGreaterThan(-1);
  });

  it('the door is named where the census lives — the header note carries the hint', () => {
    // v2.444.0 RE-ANCHOR, HONEST: the note names BOTH doors now (the
    // type row and the withdrawn badge)
    expect(tab).toContain(
      'run counts include withdrawn rows · press a row to lens the type · a withdrawn badge lenses the cancelled',
    );
  });

  it('the elders’ laws held — the sort, the zinc split, the empty state', () => {
    expect(tab).toContain('.sort((a, b) => b.count - a.count || a.type.localeCompare(b.type))');
    // v2.444.0 RE-ANCHOR, HONEST: the zinc split became the status door
    // (a real button) — the idle wardrobe carries the zinc palette
    expect(tab).toContain(
      "'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-300 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-900'",
    );
    expect(tab).toContain('No exports yet — the census waits for its first run');
  });

  it('the seat order is honest — the active branch precedes the idle branch', () => {
    const activeAt = tab.indexOf("'group cursor-pointer bg-emerald-50/70 dark:bg-emerald-500/10'");
    const idleAt = tab.indexOf(
      "'group cursor-pointer hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none'",
    );
    // the door's OWN bytes, not the file's first cursor-help (the
    // first-occurrence seat law)
    const censusAt = tab.indexOf(": 'cursor-help';");
    expect(activeAt).toBeGreaterThan(-1);
    expect(idleAt).toBeGreaterThan(activeAt);
    expect(censusAt).toBeGreaterThan(idleAt);
  });
});
