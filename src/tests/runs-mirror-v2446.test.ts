/**
 * v2.446.0 THE RUNS MIRROR — the census's Runs header becomes the law's
 * mirror handle: a real <button> whose press inverts the run-count law
 * (quietest-first, the same name tiebreak), press again and the law
 * returns. The mirror RIDES ABOVE the law (a NEW sort pass — the law's
 * bytes keep their exact seats), the voices are EXCLUSIVE (the most
 * recent press names the order — the reconcile effect retires the
 * records lens when the mirror lands), the keyboard answers natively,
 * and aria-sort names the ascending order.
 *
 * Extraction: the block is the RUNS handle BY NAME (the records lens
 * joined the thead in v2.445.0; first-button order is not identity).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const TAB = join(
  process.cwd(),
  'src/app/(shell)/tabs/data-exports-tab.tsx',
);
const tab = readFileSync(TAB, 'utf8');

const theadAt = tab.indexOf('<thead>');
const tbodyAt = tab.indexOf('<tbody>');
const thead = tab.slice(theadAt, tbodyAt);
const runsAt = thead.indexOf('data-testid="census-sort-runs"');
const buttonAt = thead.lastIndexOf('<button', runsAt);
const buttonBlock = thead.slice(buttonAt, thead.indexOf('</button>', runsAt));
const runsThAt = thead.indexOf('aria-sort={byRunsAsc');
const runsThBlock = thead.slice(
  thead.lastIndexOf('<th', runsThAt),
  thead.indexOf('</th>', runsThAt),
);

describe('the runs mirror takes its seat (v2.446.0)', () => {
  it('the law header is the handle — a real button with the walk’s testid', () => {
    expect(buttonBlock).toContain('type="button"');
    expect(buttonBlock).toContain('data-testid="census-sort-runs"');
    expect(buttonBlock).toContain('Runs');
  });

  it('the mirror rides ABOVE the law — every law byte keeps its exact seat', () => {
    // the elders' pins, verbatim — the law and the lens were never rewritten
    expect(tab).toContain(
      '.sort((a, b) => b.count - a.count || a.type.localeCompare(b.type))',
    );
    expect(tab).toContain(
      '(a, b) => b.records - a.records || a.type.localeCompare(b.type)',
    );
    expect(tab).toContain('const sortedRows = byRecords');
  });

  it('the mirror is a NEW pass — the law inverted, the same name tiebreak', () => {
    expect(tab).toContain(
      '(a, b) => a.count - b.count || a.type.localeCompare(b.type)',
    );
  });

  it('the mirror’s own state — press again and the law returns', () => {
    expect(tab).toContain('const [byRunsAsc, setByRunsAsc] = useState(false);');
    expect(buttonBlock).toContain('setByRunsAsc(!byRunsAsc)');
  });

  it('the lens’s press retires the mirror — the exclusion lives at the press', () => {
    const recordsAt = thead.indexOf('data-testid="census-sort-records"');
    const recordsButtonAt = thead.lastIndexOf('<button', recordsAt);
    const recordsBlock = thead.slice(
      recordsButtonAt,
      thead.indexOf('</button>', recordsAt),
    );
    // the elders' pin, re-anchored by one line in v2445's own suite: the
    // toggle bytes keep their seat INSIDE the press, and the retirement
    // rides ahead of them (no reconcile effect — the lint zero holds).
    expect(recordsBlock).toContain('setByRunsAsc(false);');
    expect(recordsBlock).toContain('setByRecords(!byRecords)');
  });

  it('no reconcile effect — the voices retire each other at the press', () => {
    expect(buttonBlock).toContain('setByRecords(false);');
  });

  it('the mirror speaks ascending — aria-sort names the order', () => {
    expect(runsThBlock).toContain("aria-sort={byRunsAsc ? 'ascending' : undefined}");
  });

  it('the two aria voices — the landing and the return', () => {
    expect(buttonBlock).toContain(
      "'Sorted by runs, ascending — press again to return to run counts'",
    );
    expect(buttonBlock).toContain("'Sort the census by runs, ascending'");
  });

  it('the two titles — the machine reads the same law', () => {
    expect(buttonBlock).toContain(
      "'The census reads quietest-first — press again for the run-count law'",
    );
    expect(buttonBlock).toContain(
      "'Press to sort the census by runs, ascending'",
    );
  });

  it('the affordance pair — the lit ChevronUp up, the waiting ChevronsUpDown', () => {
    expect(buttonBlock).toContain('<ChevronUp');
    expect(buttonBlock).toContain('<ChevronsUpDown');
    expect((buttonBlock.match(/aria-hidden="true"/g) ?? []).length).toBe(2);
  });

  it('the foreground voice and the zinc ring — the mirror matches the lens’s wardrobe', () => {
    expect(buttonBlock).toContain(
      "byRunsAsc ? 'text-foreground' : 'hover:text-foreground'",
    );
    expect(buttonBlock).toContain('focus-visible:ring-zinc-400');
    expect(runsThBlock).toContain('className="group px-4 py-2.5 text-right font-medium"');
  });

  it('the keyboard answers natively — no conjoin in the mirror’s block', () => {
    expect(buttonBlock).not.toContain('onKeyDown');
    expect(buttonBlock).not.toContain('e.stopPropagation()');
    // structural sanity: the mirror lives in the thead, the doors in the
    // tbody — no nested handler can hear this press
    expect(theadAt).toBeGreaterThan(-1);
    expect(tbodyAt).toBeGreaterThan(theadAt);
  });

  it('two handles, one header — both sort ths wear the group wardrobe', () => {
    expect((tab.match(/className="group px-4 py-2.5 text-right font-medium"/g) ?? []).length).toBe(2);
  });

  it('the header note is untouched — the sorts speak their own voices', () => {
    expect(tab).toContain(
      'run counts include withdrawn rows · press a row to lens the type · a withdrawn badge lenses the cancelled',
    );
  });
});
