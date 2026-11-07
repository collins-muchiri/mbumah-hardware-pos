/**
 * v2.447.0 THE HISTORY'S MIRROR — the export history's Created header
 * becomes the wire law's mirror handle: a real <button> whose press
 * inverts the newest-first law (oldest-first, the row's own id as the
 * deterministic tiebreak), press again and the law returns. The mirror
 * RIDES ABOVE THE LENSES (a NEW pass over the already-filtered rows —
 * the two lens chips' conjoin keeps its exact seat, and the API route's
 * `orderBy: { createdAt: 'desc' }` was never rewritten), the keyboard
 * answers natively, and aria-sort names the ascending order.
 *
 * Extraction: the block is the CREATED handle BY NAME (identity by
 * name, not by first-button order — the v2.446.0 law).
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const HISTORY = 'src/components/data-exports/exports-history-table.tsx';
const tab = readFileSync(HISTORY, 'utf8');

const theadAt = tab.indexOf('<TableHeader');
const tbodyAt = tab.indexOf('<TableBody');
const thead = tab.slice(theadAt, tbodyAt);
const createdAt = thead.indexOf('data-testid="history-sort-created"');
const buttonAt = thead.lastIndexOf('<button', createdAt);
const buttonBlock = thead.slice(buttonAt, thead.indexOf('</button>', createdAt));
const thAt = thead.indexOf('aria-sort={byOldest');
const thBlock = thead.slice(
  thead.lastIndexOf('<TableHead', thAt),
  thead.indexOf('</TableHead>', thAt),
);

describe('the history’s mirror takes its seat (v2.447.0)', () => {
  it('the Created header is the handle — a real button with the walk’s testid', () => {
    expect(buttonBlock).toContain('type="button"');
    expect(buttonBlock).toContain('data-testid="history-sort-created"');
    expect(buttonBlock).toContain('Created');
  });

  it('the mirror rides ABOVE the lenses — the conjoin memo keeps its exact seat', () => {
    // the elders' pins, verbatim — the two lenses were never rewritten
    expect(tab).toContain('v2.392.0: the two lenses CONJOIN');
    expect(tab).toContain(
      'return byStatus.filter((e) => e.exportType === effectiveTypeWire);',
    );
  });

  it('the mirror is a NEW pass — the law inverted, the id as tiebreak', () => {
    expect(tab).toContain(
      'a.createdAt.localeCompare(b.createdAt) ||',
    );
    expect(tab).toContain('a.id.localeCompare(b.id),');
  });

  it('the wire’s law keeps its seat — the ternary falls through to filtered', () => {
    expect(tab).toContain('const sortedRows = byOldest');
    expect(tab).toContain(': filtered;');
  });

  it('the mirror’s own state — press again and the law returns', () => {
    expect(tab).toContain('const [byOldest, setByOldest] = useState(false);');
    expect(buttonBlock).toContain('setByOldest(!byOldest)');
  });

  it('the doors ride — the tbody iterates the sorted rows, the door bytes unchanged', () => {
    expect(tab).toContain('{sortedRows.map((item) => (');
    expect(tab).toContain("'export-row-expired'");
    expect(tab).toContain("'export-row-cancelled'");
  });

  it('the law speaks to the machine — aria-sort names the order', () => {
    expect(thBlock).toContain("aria-sort={byOldest ? 'ascending' : undefined}");
  });

  it('the two aria voices — the landing and the return', () => {
    expect(buttonBlock).toContain(
      "'Sorted oldest-first — press again to return to newest-first'",
    );
    expect(buttonBlock).toContain("'Sort the history oldest-first'");
  });

  it('the two titles — the machine reads the same law', () => {
    expect(buttonBlock).toContain(
      "'The history reads oldest-first — press again for the newest-first law'",
    );
    expect(buttonBlock).toContain(
      "'Press to sort the history oldest-first'",
    );
  });

  it('the affordance pair — the lit ChevronUp up, the waiting ChevronsUpDown', () => {
    expect(buttonBlock).toContain('<ChevronUp');
    expect(buttonBlock).toContain('<ChevronsUpDown');
    expect((buttonBlock.match(/aria-hidden="true"/g) ?? []).length).toBe(2);
  });

  it('the semibold voice and the zinc ring — the wardrobe rides this table’s own light', () => {
    expect(buttonBlock).toContain(
      "byOldest ? 'font-semibold text-foreground' : 'hover:text-foreground'",
    );
    expect(buttonBlock).toContain('focus-visible:ring-zinc-400');
    expect(thBlock).toContain('className="group w-[160px]"');
  });

  it('the keyboard answers natively — no conjoin in the mirror’s block', () => {
    expect(buttonBlock).not.toContain('onKeyDown');
    expect(buttonBlock).not.toContain('e.stopPropagation()');
    // structural sanity: the handle lives in the thead, the doors in the
    // tbody — no nested handler can hear this press
    expect(theadAt).toBeGreaterThan(-1);
    expect(tbodyAt).toBeGreaterThan(theadAt);
  });

  it('TWO handles in this thead — the census’s two live across the tab line', () => {
    // v2.448.0 RE-ANCHOR, NAMED: the records voice joined the thead —
    // the created handle's own count is unchanged (still exactly one);
    // the second handle's count is pinned by the v2448 suite.
    expect((thead.match(/data-testid="history-sort-created"/g) ?? []).length).toBe(1);
  });

  it('the retention countdown rides the row — the mirror moves nothing else', () => {
    expect(tab).toContain("data-testid=\"export-retention\"");
  });
});
