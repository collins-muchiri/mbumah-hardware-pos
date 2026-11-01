// v2.231.0 — the branch lens.
//
//   - THE LINE NAMES ITS SHELF, AT BRANCH LEVEL: the branch detail
//     wire's per-line product select grows the SAME additive category
//     join the org drill's wire grew in v2.230.0 — one query, zero new
//     fetches; the client type optional, the drill's own law.
//   - THE WALK'S INSTRUMENTS: the branch sheet face (the face the
//     floor actually walks) grows a category lens AND the name/SKU
//     finder the branch never had — buckets derived from the HELD
//     lines, "uncategorized" a real bucket sorted last, the lens
//     mounts only past one bucket, and the whole instruments row
//     stays off the paper (controls never lie on a walk-list).
//   - THE COMPOSED READING: one filter answers to lens AND needle;
//     the count stays an honest N of M; the progress bar, the Print
//     aria and the CSV keep the whole-sheet truth; the empty face
//     grows the drill's honest variants.
//   - THE FRESH-DOOR LAW: the instruments are STATE of the door, not
//     of the sheet — every door-opening (roster View/Resume, a fresh
//     create, the back door) resets both by construction, never by
//     effect.
//   - THE SHELF WHISPER ON THE WALK: while the sheet spans buckets,
//     every line wears its category — and the whisper PRINTS (no
//     print-off mark): a printed walk reads its shelves.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const panel = read('src/components/inventory/stock-take-panel.tsx');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.231.0)', () => {
  it('package.json leads 2.231.0 (all three slots)', () => {
    expect(version).toBe('2.337.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.337.0');
    expect(pkg.mbumah.baseVersion).toBe('2.337.0');
  });

  it('VERSION speaks 2.231.0 and the verify gate is wired', () => {
    expect(read('VERSION').trim()).toBe('2.337.0');
    expect(pkg.scripts['verify:v2-231-0']).toBe('node scripts/verify-v2-231-0.mjs');
  });

  it('the changelog anchors the section ABOVE its ancestor (the structural pin — headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.231.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.231.0]')).toBeLessThan(changelog.indexOf('## [2.230.0]'));
  });

  it('the whats-new feed leads the branch-lens entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.231.0',")).toBe(true);
    expect(feed.indexOf("version: '2.231.0',")).toBeLessThan(feed.indexOf("version: '2.230.0',"));
    expect(feed.includes("title: 'The branch lens',")).toBe(true);
  });
});

// ── THE BRANCH WIRE — the line names its shelf ───────────────────────────

describe('the branch wire grows the category join (additive, one query)', () => {
  it('the product select joins the category name', () => {
    expect(branchWire.includes('category: { select: { name: true } }')).toBe(true);
  });

  it('the line mapping speaks the shelf — null stays null, never a hidden grouping', () => {
    expect(branchWire.includes('category: l.product.category?.name ?? null,')).toBe(true);
  });

  it('the join rides the EXISTING query (the include block never grew a second find)', () => {
    expect((branchWire.match(/db\.stockTake\.findUnique/g) ?? []).length).toBe(1);
  });
});

// ── THE WALK'S INSTRUMENTS ───────────────────────────────────────────────

describe('the branch sheet face grows the drill\u2019s instruments', () => {
  it('the lens and needle are door-state, mounted once', () => {
    expect(panel.includes("const [needle, setNeedle] = useState('');")).toBe(true);
    expect(panel.includes("const [categoryNeedle, setCategoryNeedle] = useState('all');")).toBe(true);
  });

  it('the SheetLine type grows the OPTIONAL shelf (the drill\u2019s own law)', () => {
    expect(panel.includes('category?: string | null;')).toBe(true);
  });

  it('the buckets derive from the HELD lines, uncategorized real and last', () => {
    expect(panel.includes("Array.from(new Set(detail.lines.map((l) => l.category ?? 'uncategorized')))")).toBe(true);
    expect(panel.includes("(a === 'uncategorized' ? 1 : 0) - (b === 'uncategorized' ? 1 : 0) || a.localeCompare(b)")).toBe(true);
  });

  it('the lens mounts only past one bucket (an absent control never lies)', () => {
    expect(panel.includes('const lensActive = categoryBuckets.length > 1;')).toBe(true);
    expect(panel.includes('{lensActive && (\n                  <select')).toBe(true);
  });

  it('the lens speaks the branch testid + aria', () => {
    expect(panel.includes('data-testid="stocktake-lens"')).toBe(true);
    expect(panel.includes('aria-label="Filter the lines by category"')).toBe(true);
    expect(panel.includes('<option value="all">all categories</option>')).toBe(true);
  });

  it('the finder the branch never had, with its clear door', () => {
    expect(panel.includes('data-testid="stocktake-finder"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-finder-clear"')).toBe(true);
    expect(panel.includes('aria-label="Find a line by name or SKU"')).toBe(true);
  });

  it('the honest count and the amber shelf name ride the row', () => {
    expect(panel.includes('data-testid="stocktake-finder-count"')).toBe(true);
    expect(panel.includes('data-testid="stocktake-lens-count"')).toBe(true);
  });

  it('the instruments row stays off the paper', () => {
    expect(panel.includes('<div className="flex flex-wrap items-center gap-1.5" data-sheet-print-off="">')).toBe(true);
  });

  it('the row mounts only when the sheet froze lines', () => {
    expect(panel.includes('{detail.lines.length > 0 && (\n              <div className="flex flex-wrap items-center gap-1.5" data-sheet-print-off="">')).toBe(true);
  });
});

// ── THE COMPOSED READING ─────────────────────────────────────────────────

describe('the reading composes; the sheet never narrows', () => {
  it('one filter answers to lens AND needle over the SAME held lines', () => {
    expect(panel.includes("(categoryNeedle === 'all' || (l.category ?? 'uncategorized') === categoryNeedle) &&")).toBe(true);
    expect(panel.includes('l.name.toLowerCase().includes(cleanNeedle) ||')).toBe(true);
    expect(panel.includes('l.sku.toLowerCase().includes(cleanNeedle)')).toBe(true);
  });

  it('the list renders the narrowed reading', () => {
    expect(panel.includes('{shownLines.map((line) => {')).toBe(true);
  });

  it('the empty face grows the drill\u2019s honest variants', () => {
    expect(panel.includes('data-testid="stocktake-finder-empty"')).toBe(true);
    expect(panel.includes('the lens came back empty')).toBe(true);
    expect(panel.includes('the sheet holds ${num(detail.lines.length)}')).toBe(true);
  });

  it('the progress bar keeps the whole-sheet truth', () => {
    expect(panel.includes('aria-label={`Counted ${detail.summary.countedLines} of ${detail.summary.totalLines} lines`}')).toBe(true);
  });

  it('the CSV keeps the whole sheet (seven columns, unchanged)', () => {
    expect(panel.includes('sheetLinesCsv(detail.lines, { costGated: sheetCostGated })')).toBe(true);
    expect(drill.includes("const header = 'product,sku,unit,snapshot,counted,variance,variance_cost_kes';")).toBe(true);
  });

  it('the Print aria names the whole count', () => {
    expect(panel.includes("`Print the floor's clipboard — ${detail.lines.length} lines with empty count boxes`")).toBe(true);
  });
});

// ── THE FRESH-DOOR LAW ───────────────────────────────────────────────────

describe('every door-opening resets the instruments (by construction)', () => {
  // v2.232.0: the variances-only lens joins the reset — the law grew
  // from two instruments to three. Re-pinned to the GROWN law (the
  // move is named; the fresh-door intent survives unchanged).
  it('the roster door resets all three instruments', () => {
    expect(panel.includes("setNeedle('');\n                      setCategoryNeedle('all');\n                      setVariancesOnly(false);\n                      setOpenSheetId(sheet.id);")).toBe(true);
  });

  it('the create door resets all three instruments', () => {
    expect(panel.includes("setNeedle('');\n      setCategoryNeedle('all');\n      setVariancesOnly(false);\n      setOpenSheetId(data.id);")).toBe(true);
  });

  it('the back door resets both', () => {
    expect(panel.includes("setOpenSheetId(null);\n                      setNeedle('');\n                      setCategoryNeedle('all');")).toBe(true);
  });
});

// ── THE SHELF WHISPER ON THE WALK ────────────────────────────────────────

describe('the walk reads its shelves', () => {
  it('the line wears its shelf while the sheet spans buckets', () => {
    expect(panel.includes('data-testid="stocktake-line-shelf"')).toBe(true);
    expect(panel.includes("{line.category ?? 'uncategorized'}")).toBe(true);
  });

  it('the whisper PRINTS (no print-off mark on it)', () => {
    expect(/stocktake-line-shelf"[^>]*data-sheet-print-off/.test(panel)).toBe(false);
  });

  it('the drill\u2019s own lens stands untouched', () => {
    expect(drill.includes('data-testid="sheet-drill-lens"')).toBe(true);
    expect(drill.includes('const lensActive = categoryBuckets.length > 1;')).toBe(true);
  });
});
