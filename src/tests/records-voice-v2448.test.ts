/**
 * v2.448.0 THE HISTORY'S RECORDS VOICE — the export history's Records
 * header becomes a FIRST sort voice on a wire that never ordered by
 * records: one press sorts loudest-by-records (desc-first, the census's
 * records-lens grammar ported across the tab line), press again and the
 * wire's newest-first law returns. The voice RIDES ABOVE THE LENSES (a
 * NEW pass over the already-filtered rows — the chips' conjoin keeps
 * its exact seat) and beside the Created mirror (v2.447.0) under the
 * v2.446.0 law: THE EXCLUSION LIVES AT THE PRESS — each handle's own
 * press retires its sibling; NO reconcile effect (the lint zero held).
 *
 * The wardrobe borrows the FAMILY and speaks this table's own light:
 * the semibold active voice (the v2.447.0 law — weight speaks where
 * the census's color spoke), the lit ChevronDown naming the descending
 * order, aria-sort="descending", the zinc focus ring.
 *
 * Extraction: the block is the RECORDS handle BY NAME (identity by
 * name, not by first-button order — the v2.446.0 law; the Records th
 * sits LEFT of the Created th in this thead).
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const HISTORY = 'src/components/data-exports/exports-history-table.tsx';
const tab = readFileSync(HISTORY, 'utf8');

const theadAt = tab.indexOf('<TableHeader');
const tbodyAt = tab.indexOf('<TableBody');
const thead = tab.slice(theadAt, tbodyAt);
const recordsAt = thead.indexOf('data-testid="history-sort-records"');
const buttonAt = thead.lastIndexOf('<button', recordsAt);
const buttonBlock = thead.slice(buttonAt, thead.indexOf('</button>', recordsAt));
const thAt = thead.indexOf('aria-sort={byRecords');
const thBlock = thead.slice(
  thead.lastIndexOf('<TableHead', thAt),
  thead.indexOf('</TableHead>', thAt),
);

describe('the history’s records voice takes its seat (v2.448.0)', () => {
  it('the Records header is the handle — a real button with the walk’s testid', () => {
    expect(buttonBlock).toContain('type="button"');
    expect(buttonBlock).toContain('data-testid="history-sort-records"');
    expect(buttonBlock).toContain('Records');
  });

  it('a FIRST voice on the unordered wire — the census’s lens grammar, ported', () => {
    expect(tab).toContain('v2.448.0 THE HISTORY\'S RECORDS VOICE');
  });

  it('the voice is a NEW pass — loudest-by-records, desc-first, the id as tiebreak', () => {
    expect(tab).toContain('b.recordCount - a.recordCount ||');
    expect(tab).toContain('a.id.localeCompare(b.id),');
  });

  it('the mirror’s bytes keep their exact seats — the v2447 pins untouched', () => {
    expect(tab).toContain('const sortedRows = byOldest');
    expect(tab).toContain('a.createdAt.localeCompare(b.createdAt) ||');
  });

  it('the wire’s law keeps its seat — the ternary falls through to filtered', () => {
    expect(tab).toContain(': filtered;');
  });

  it('the voice’s own state — press again and the law returns', () => {
    expect(tab).toContain('const [byRecords, setByRecords] = useState(false);');
    expect(buttonBlock).toContain('setByRecords(!byRecords)');
  });

  it('THE EXCLUSION LIVES AT THE PRESS — both directions, no effect', () => {
    // the records press retires the mirror
    expect(buttonBlock).toContain('setByOldest(false);');
    // the mirror's press retires the voice (named at the seat)
    const createdAt = thead.indexOf('data-testid="history-sort-created"');
    const createdBlock = thead.slice(
      thead.lastIndexOf('<button', createdAt),
      thead.indexOf('</button>', createdAt),
    );
    expect(createdBlock).toContain('setByRecords(false);');
    expect(createdBlock).toContain('setByOldest(!byOldest)');
    // no reconcile effect — the v2.446.0 law held the lint zero
    expect(tab).not.toContain('useEffect(');
  });

  it('the law speaks to the machine — aria-sort names the descending order', () => {
    expect(thBlock).toContain("aria-sort={byRecords ? 'descending' : undefined}");
  });

  it('the two aria voices — the landing and the return', () => {
    expect(buttonBlock).toContain(
      "'Sorted by records, loudest first — press again to return to newest-first'",
    );
    expect(buttonBlock).toContain(
      "'Sort the history by records, loudest first'",
    );
  });

  it('the two titles — the machine reads the same law', () => {
    expect(buttonBlock).toContain(
      "'The history reads loudest-by-records — press again for the newest-first law'",
    );
    expect(buttonBlock).toContain(
      "'Press to sort the history by records, loudest first'",
    );
  });

  it('the affordance pair — the lit ChevronDown (desc-first), the waiting ChevronsUpDown', () => {
    expect(buttonBlock).toContain('<ChevronDown');
    expect(buttonBlock).toContain('<ChevronsUpDown');
    expect((buttonBlock.match(/aria-hidden="true"/g) ?? []).length).toBe(2);
  });

  it('the semibold voice and the zinc ring — the wardrobe rides this table’s own light', () => {
    expect(buttonBlock).toContain(
      "byRecords ? 'font-semibold text-foreground' : 'hover:text-foreground'",
    );
    expect(buttonBlock).toContain('focus-visible:ring-zinc-400');
    expect(thBlock).toContain('className="group text-right w-[90px]"');
  });

  it('the keyboard answers natively — no conjoin in the voice’s block', () => {
    expect(buttonBlock).not.toContain('onKeyDown');
    expect(buttonBlock).not.toContain('e.stopPropagation()');
    // structural sanity: the handle lives in the thead, the doors in the
    // tbody — no nested handler can hear this press
    expect(theadAt).toBeGreaterThan(-1);
    expect(tbodyAt).toBeGreaterThan(theadAt);
  });

  it('TWO handles in this thead — the mirror and the voice, one each', () => {
    expect((thead.match(/data-testid="history-sort-created"/g) ?? []).length).toBe(1);
    expect((thead.match(/data-testid="history-sort-records"/g) ?? []).length).toBe(1);
  });

  it('the doors ride — the tbody still iterates the sorted rows', () => {
    expect(tab).toContain('{sortedRows.map((item) => (');
  });
});
