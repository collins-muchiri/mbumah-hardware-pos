// THE RECORDS LENS (v2.445.0): the sort law's second voice — the By
// Type census's Records header becomes a real button, and its press
// re-sorts the census loudest-by-records; press again and the run-count
// law returns.
//   • THE SECOND VOICE RIDES ABOVE THE LAW: the default sort keeps its
//     exact seat (`.sort((a, b) => b.count - a.count || …)` untouched —
//     the elders' pin survives verbatim); the records voice is a NEW
//     sort over the sorted rows, never a rewrite of the law.
//   • THE HEADER IS THE HANDLE: a real button (native keyboard, no
//     manual handler — and thead sits OUTSIDE the door rows, so no
//     conjoin is even possible); the affordance waits for the hover
//     (ChevronsUpDown), the active voice reads foreground under a lit
//     ChevronDown, and aria-sort names the order.
//   • THE TIEBREAKER IS THE NAME: both voices sort deterministic —
//     loudest first, then the type's own name.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const TAB = 'src/app/(shell)/tabs/data-exports-tab.tsx';

const tab = readFileSync(TAB, 'utf8');

const theadAt = tab.indexOf('<thead>');
const tbodyAt = tab.indexOf('<tbody>');
const thead = tab.slice(theadAt, tbodyAt);
// v2.446.0 THE RUNS MIRROR: a SECOND handle (census-sort-runs) joined
// the thead ahead of this one — this suite's block is the RECORDS
// handle BY NAME, not by first-button order. The extraction names its
// handle; every pin below keeps its exact bytes and intent.
const recordsAt = thead.indexOf('data-testid="census-sort-records"');
const buttonAt = thead.lastIndexOf('<button', recordsAt);
const buttonBlock = thead.slice(buttonAt, thead.indexOf('</button>', recordsAt));

describe('the records lens takes its seat (v2.445.0)', () => {
  it('the header is the handle — a real button with the walk’s testid', () => {
    expect(buttonBlock).toContain('type="button"');
    expect(buttonBlock).toContain('data-testid="census-sort-records"');
    expect(buttonBlock).toContain('Records');
  });

  it('the second voice rides ABOVE the law — the default sort keeps its exact seat', () => {
    // the elders' pin, verbatim — the law was never rewritten
    expect(tab).toContain(
      '.sort((a, b) => b.count - a.count || a.type.localeCompare(b.type))',
    );
    // the new voice is a NEW sort over the sorted rows
    expect(tab).toContain(
      '(a, b) => b.records - a.records || a.type.localeCompare(b.type)',
    );
  });

  it('the door’s second voice — press again and the law returns', () => {
    expect(tab).toContain('const [byRecords, setByRecords] = useState(false);');
    // v2.446.0: the voices are exclusive — the lens's press now retires
    // the mirror first (setByRunsAsc(false)); the toggle bytes keep
    // their seat inside the press. ONE pin re-anchor, named.
    expect(buttonBlock).toContain('setByRunsAsc(false);');
    expect(buttonBlock).toContain('setByRecords(!byRecords)');
    expect(tab).toContain('const sortedRows = byRecords');
  });

  it('the law speaks to the machine — aria-sort names the order', () => {
    expect(tab).toContain("aria-sort={byRecords ? 'descending' : undefined}");
  });

  it('the two aria voices — the landing and the return', () => {
    expect(buttonBlock).toContain(
      "'Sorted by records — press again to return to run counts'",
    );
    expect(buttonBlock).toContain("'Sort the census by records'");
  });

  it('the two title voices — the census order, named where it lives', () => {
    expect(buttonBlock).toContain(
      "'The census reads loudest-by-records — press again for the run-count law'",
    );
    expect(buttonBlock).toContain("'Press to sort the census by records'");
  });

  it('the affordance pair — the hover waits, the active voice is lit', () => {
    expect(buttonBlock).toContain('<ChevronsUpDown');
    expect(buttonBlock).toContain(
      'opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100',
    );
    expect(buttonBlock).toContain('<ChevronDown');
    // both icons speak to the machine, never the reader
    expect((buttonBlock.match(/aria-hidden="true"/g) ?? []).length).toBe(2);
  });

  it('the seat — the active voice reads foreground, the idle hovers to it', () => {
    expect(buttonBlock).toContain("byRecords ? 'text-foreground' : 'hover:text-foreground'");
  });

  it('the styling details — the zinc focus ring and the group seat on the th', () => {
    expect(buttonBlock).toContain('focus-visible:ring-zinc-400');
    expect(tab).toContain('className="group px-4 py-2.5 text-right font-medium"');
  });

  it('the tbody iterates the SORTED rows — and the doors still ride', () => {
    expect(tab).toContain('{sortedRows.map((row) => {');
    expect(tab).toContain("chooseExpType(active ? 'all' : word)");
    expect(tab).toContain('data-testid={`census-withdrawn-${row.type}`}');
  });

  it('the keyboard answers natively AND conjoins nothing — thead sits outside the doors', () => {
    expect(buttonBlock).not.toContain('onKeyDown');
    expect(buttonBlock).not.toContain('e.stopPropagation()');
    // structural sanity: the handle lives in the thead, the doors in the
    // tbody — no nested handler can hear this press
    expect(theadAt).toBeGreaterThan(-1);
    expect(tbodyAt).toBeGreaterThan(theadAt);
  });

  it('the header note is untouched — the note names the doors, the sort speaks its own voice', () => {
    expect(tab).toContain(
      'run counts include withdrawn rows · press a row to lens the type · a withdrawn badge lenses the cancelled',
    );
  });

  it('the tiebreaker is the name — both voices sort deterministic', () => {
    const lawAt = tab.indexOf(
      '.sort((a, b) => b.count - a.count || a.type.localeCompare(b.type))',
    );
    const lensAt = tab.indexOf(
      '(a, b) => b.records - a.records || a.type.localeCompare(b.type)',
    );
    expect(lawAt).toBeGreaterThan(-1);
    expect(lensAt).toBeGreaterThan(-1);
    expect(lensAt).toBeGreaterThan(lawAt);
  });
});
