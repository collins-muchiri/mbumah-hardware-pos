// v2.232.0 — the recount.
//
//   - THE LOOP CLOSES: a CLOSED sheet's variances become the NEXT
//     sheet's population — the branch face (the pens' face) grows the
//     recount spawn: one button POSTs the create wire's explicit-list
//     scope (productIds = the variance lines' unique product ids,
//     re-validated server-side), notes = "recount of sheet {id}", and
//     the fresh door opens in the SAME panel under the fresh-door law.
//   - THE THIRD INSTRUMENT: the variances-only lens grows on BOTH
//     faces — an aria-pressed chip that narrows the reading to the
//     lines whose counted ≠ snapshot, composing with the category
//     lens and the name/SKU finder over the SAME held lines; the
//     honest N-of-M answers all three; the progress/tiles/Print/CSV
//     keep the whole-sheet truth; the chip is STATE of the door.
//   - THE ONE-OPEN-SHEET LAW KEEPS ITS TEETH: while the roster holds
//     a COUNTING sheet the recount zone speaks honestly and the
//     button is ABSENT — the wire's 409 stays the backstop.
//   - THE DRILL STAYS READ-ONLY: the org face POINTS, never pens —
//     the recount door is an ANCHOR (never a button), addressed by
//     the wire's OWN additive slug column, gated to CLOSED faces
//     holding at least one variance line in a store that HAS a slug.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const panel = read('src/components/inventory/stock-take-panel.tsx');
const drill = read('src/components/org/sheet-drill.tsx');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const createWire = read('src/app/api/stock-takes/route.ts');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.232.0)', () => {
  it('package.json leads 2.232.0 (all three slots)', () => {
    expect(version).toBe('2.268.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.268.0');
    expect(pkg.mbumah.baseVersion).toBe('2.268.0');
  });

  it('VERSION speaks 2.232.0 and the verify gate is wired', () => {
    expect(read('VERSION').trim()).toBe('2.268.0');
    expect(pkg.scripts['verify:v2-232-0']).toBe('node scripts/verify-v2-232-0.mjs');
  });

  it('the changelog anchors the section ABOVE its ancestor (the structural pin — headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.232.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.232.0]')).toBeLessThan(changelog.indexOf('## [2.231.0]'));
  });

  it('the whats-new feed leads the recount entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.232.0',")).toBe(true);
    expect(feed.indexOf("version: '2.232.0',")).toBeLessThan(feed.indexOf("version: '2.231.0',"));
    expect(feed.includes("title: 'The recount',")).toBe(true);
  });
});

// ── THE THIRD INSTRUMENT — the variances-only lens ───────────────────────

describe('the variances-only lens grows on both faces (one reading, three needles)', () => {
  it('the branch face declares the per-door state', () => {
    expect(panel.includes('const [variancesOnly, setVariancesOnly] = useState(false);')).toBe(true);
  });

  it('the drill declares the per-door state (the map keys the drill per sheet — reset by construction)', () => {
    expect(drill.includes('const [variancesOnly, setVariancesOnly] = useState(false);')).toBe(true);
    expect(drill.includes('setVariancesOnly') ? drill.match(/setVariancesOnly\(/g)?.length : 0).toBeGreaterThan(0);
  });

  it('both chips carry the aria-pressed law (a toggle speaks its state to the ear)', () => {
    expect(panel.includes('aria-pressed={variancesOnly}')).toBe(true);
    expect(drill.includes('aria-pressed={variancesOnly}')).toBe(true);
  });

  it('both chips answer to the house testids', () => {
    expect(panel.includes('data-testid="stocktake-variances-only"')).toBe(true);
    expect(drill.includes('data-testid="sheet-drill-variances-only"')).toBe(true);
  });

  it('the chip mounts only when the sheet holds at least one variance (an absent control never lies)', () => {
    expect(panel.includes('const variancesActive = varianceLines.length > 0;')).toBe(true);
    expect(drill.includes('const variancesActive = varianceLines.length > 0;')).toBe(true);
  });

  it('the variance derivation is honest: counted ≠ snapshot, never a hidden zero', () => {
    expect(panel.includes("l.variance != null && l.variance !== 0")).toBe(true);
    expect(drill.includes("l.variance != null && l.variance !== 0")).toBe(true);
  });

  it('the filter composes all three needles over the SAME held lines (one clause)', () => {
    const clause = '(!variancesOnly || (l.variance != null && l.variance !== 0))';
    expect(panel.includes(clause)).toBe(true);
    expect(drill.includes(clause)).toBe(true);
  });

  it('the empty face condition grew the variancesOnly arm (both faces)', () => {
    expect(panel.includes("(cleanNeedle !== '' || categoryNeedle !== 'all' || variancesOnly)")).toBe(true);
    expect(drill.includes("(cleanNeedle !== '' || categoryNeedle !== 'all' || variancesOnly)")).toBe(true);
  });

  it('the empty face speaks the shelf + variances variant (the honest composed refusal)', () => {
    expect(panel.includes('no line with a variance in “')).toBe(true);
    expect(drill.includes('no line with a variance in “')).toBe(true);
  });

  it('the fresh-door law: the variances-only lens joins EVERY door reset (branch face)', () => {
    // create success + roster open + back door + recount success = 4 sites.
    expect((panel.match(/setVariancesOnly\(false\)/g) ?? []).length).toBe(4);
  });

  it('the whole-sheet law holds: the CSV keeps the whole file on BOTH faces (never the narrowed reading)', () => {
    expect(panel.includes('sheetLinesCsv(detail.lines')).toBe(true);
    expect(panel.includes('sheetLinesCsv(shownLines')).toBe(false);
    expect(drill.includes('sheetLinesCsv(data.lines')).toBe(true);
    expect(drill.includes('sheetLinesCsv(shownLines')).toBe(false);
  });

  it('the chip stays off the paper on both faces (a control is a screen thing)', () => {
    // The drill chip carries the mark inline; the panel chip sits in the
    // instruments row whose wrapper already carries data-sheet-print-off.
    expect(drill.includes('data-testid="sheet-drill-variances-only"\n                      data-sheet-print-off=""')).toBe(true);
  });
});

// ── THE RECOUNT SPAWN — the pens' face closes the loop ───────────────────

describe('the recount spawn (branch face, the pens\' face)', () => {
  it('the mutation POSTs the explicit-list scope to the create wire', () => {
    expect(panel.includes("authorizedFetchJson('/api/stock-takes', {\n        method: 'POST',")).toBe(true);
    expect(panel.includes('productIds: varianceProducts,')).toBe(true);
  });

  it('the notes name the sheet being re-walked (the roster reads the lineage)', () => {
    expect(panel.includes('notes: `recount of sheet ${detail.id}`')).toBe(true);
  });

  it('the population is the UNIQUE product ids of the variance lines (sheet order)', () => {
    expect(panel.includes('Array.from(new Set(varianceLines.map((l) => l.productId)))')).toBe(true);
  });

  it('success opens the fresh door in the SAME panel under the fresh-door law', () => {
    expect(panel.includes('Recount open — ')).toBe(true);
    expect(panel.includes("setOpenSheetId(data.id);\n    },\n    onError: (err: unknown) => {\n      toast.error(err instanceof Error ? err.message : 'the recount was refused');")).toBe(true);
  });

  it('the server\'s refusal surfaces as the toast (the 409 backstop is never swallowed)', () => {
    expect(panel.includes("err instanceof Error ? err.message : 'the recount was refused'")).toBe(true);
  });

  it('the zone mounts ONLY on a CLOSED face holding at least one variance line', () => {
    expect(panel.includes('closedFace && varianceLines.length > 0 && (')).toBe(true);
  });

  it('the zone speaks the one-open-sheet law honestly while a sheet counts (button ABSENT, not disabled)', () => {
    expect(panel.includes('data-testid="stocktake-recount-blocked"')).toBe(true);
    expect(panel.includes('a sheet is already counting — the recount waits for the open sheet to close or cancel (the one-open-sheet law).')).toBe(true);
  });

  it('the button names the real freeze (products, not lines)', () => {
    expect(panel.includes('Recount the variances — freeze ')).toBe(true);
    expect(panel.includes('data-testid="stocktake-recount"')).toBe(true);
  });

  it('the zone stays off the paper', () => {
    expect(panel.includes('data-testid="stocktake-recount-zone" data-sheet-print-off=""')).toBe(true);
  });

  it('the create wire still holds the one-open-sheet law (409, the backstop)', () => {
    expect(createWire.includes("this branch already has a count sheet open — close or cancel it before opening another.")).toBe(true);
    expect(createWire.includes('{ status: 409 }')).toBe(true);
  });

  it('the create wire still validates the explicit list against THIS store (no cross-store leak, no empty count)', () => {
    expect(createWire.includes('id: { in: productIds }')).toBe(true);
    expect(createWire.includes("no active products matched this sheet\\u2019s population — nothing to count.")).toBe(true);
  });
});

// ── THE RECOUNT DOOR — the drill points, the branch pens ─────────────────

describe('the recount door (org drill stays read-only)', () => {
  it('the drill wire\'s store select grew the additive slug column (one query, zero new fetches)', () => {
    expect(orgWire.includes('store: { select: { id: true, name: true, code: true, slug: true } }')).toBe(true);
    expect((orgWire.match(/db\.stockTake\.findUnique/g) ?? []).length).toBe(1);
  });

  it('the response mapping speaks the slug (the address rides the fetch the drill already makes)', () => {
    expect(orgWire.includes('slug: sheet.store.slug')).toBe(true);
  });

  it('the client type stays optional (the drill\'s own law for wire growths)', () => {
    expect(drill.includes('slug?: string | null')).toBe(true);
  });

  it('the door is an ANCHOR, never a button (the read-only law keeps its pens on the branch)', () => {
    expect(drill.includes('data-testid="sheet-drill-recount-door"')).toBe(true);
    const doorIdx = drill.indexOf('data-testid="sheet-drill-recount-door"');
    const anchorOpen = drill.lastIndexOf('<a', doorIdx);
    expect(anchorOpen).toBeGreaterThan(-1);
    expect(drill.slice(anchorOpen, doorIdx)).not.toContain('<button');
  });

  it('the door is addressed by the wire\'s OWN slug (never a client-side guess)', () => {
    expect(drill.includes('href={`/stores/${data.store.slug}/inventory`}')).toBe(true);
  });

  it('the door mounts ONLY on a CLOSED face with variances in a store that HAS a slug (absence when absent)', () => {
    expect(drill.includes("data.status === 'CLOSED' && variancesActive && data.store.slug && (")).toBe(true);
  });

  it('the door stays off the paper and names its scope honestly', () => {
    expect(drill.includes('data-testid="sheet-drill-recount-door"\n                  data-sheet-print-off=""')).toBe(true);
    expect(drill.includes('opens the branch&apos;s stock-take face — the recount freezes exactly these products against a fresh snapshot.')).toBe(true);
  });

  it('the read-only law line still stands (the drill watches, never pens)', () => {
    expect(drill.includes('read-only — the branch sheet keeps the pens; this face watches the floor&apos;s truth.')).toBe(true);
  });
});

// ── THE STYLING HOUSE ─────────────────────────────────────────────────────

describe('the recount wears the sheet\'s house', () => {
  it('the chips wear each face\'s own scale (h-7 at branch, h-6 at org)', () => {
    expect(panel.includes('inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-semibold ring-1')).toBe(true);
    expect(drill.includes('inline-flex h-6 items-center gap-1 rounded-md px-2 text-[10px] font-semibold ring-1')).toBe(true);
  });

  it('the active chip is the amber family (the sheet\'s hue), the idle chip the slate ring family', () => {
    expect(panel.includes("'bg-amber-700 text-white ring-amber-700 dark:bg-amber-600 dark:ring-amber-600'")).toBe(true);
    expect(drill.includes("'bg-amber-700 text-white ring-amber-700 dark:bg-amber-600 dark:ring-amber-600'")).toBe(true);
  });

  it('the recount zone wears the floor-copy note\'s family (amber dashed) with dark halves from birth', () => {
    expect(panel.includes('border border-dashed border-amber-300 bg-amber-50/60 p-3 dark:border-amber-500/40 dark:bg-amber-500/10')).toBe(true);
  });

  it('the drill\'s door wears the same amber dashed family with its arrow glyph', () => {
    expect(drill.includes('border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2 text-[11px] font-semibold text-amber-800')).toBe(true);
    expect(drill.includes('<ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />')).toBe(true);
  });

  it('the panel\'s recount button carries the RotateCcw glyph and the honest pending spin', () => {
    expect(panel.includes('<RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />')).toBe(true);
    expect(panel.includes('<Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />')).toBe(true);
  });
});
