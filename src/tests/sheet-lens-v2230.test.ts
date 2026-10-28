// v2.230.0 — the sheet's lens.
//
//   - THE LINE NAMES ITS SHELF: the drill wire's per-line product
//     select grows an additive category join (the product's own
//     ProductCategory name; null when the product never joined one —
//     "uncategorized" is the face's honest bucket). One query, zero
//     new fetches; the client type is OPTIONAL so the branch panel's
//     own SheetLine (the other caller of sheetLinesCsv) stays
//     assignable untouched.
//   - THE SHEET'S LENS: the drill grows a category select beside the
//     finder — the finder's twin. Its options are the sheet's OWN
//     buckets, derived client-side from the lines the drill ALREADY
//     holds; "uncategorized" is a real bucket and sorts LAST. The law
//     of the lens is the law of the finder: it narrows the READING,
//     never the sheet — the tiles keep the whole-sheet arithmetic, the
//     CSV keeps the whole file (seven columns, unchanged), and the
//     count line stays an honest N of M. The lens mounts only when
//     the sheet spans MORE THAN ONE bucket (an absent control never
//     lies); like the needle it is STATE of the drill, not of the
//     sheet (the map keys the drill per sheet — a fresh door reads
//     "all").
//   - THE COMBINED READING: lens and needle compose over the SAME
//     held lines; a lensed shelf names itself in an amber span beside
//     the count; the empty face grows honest variants.
//   - THE SHELF WHISPER: while the sheet spans buckets, every line
//     wears its category beside its arithmetic — and the whisper
//     PRINTS (no print-off mark): a printed walk reads its shelves.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const drill = read('src/components/org/sheet-drill.tsx');
const wire = read('src/app/api/org/stock-takes/[id]/route.ts');
const map = read('src/components/org/variance-map.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.230.0)', () => {
  it('package.json leads 2.230.0 (all three slots)', () => {
    expect(version).toBe('2.230.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.230.0');
    expect(pkg.mbumah.baseVersion).toBe('2.230.0');
  });

  it('VERSION speaks 2.230.0 and the verify gate is wired', () => {
    expect(read('VERSION').trim()).toBe('2.230.0');
    expect(pkg.scripts['verify:v2-230-0']).toBe('node scripts/verify-v2-230-0.mjs');
  });

  it('the changelog anchors the section ABOVE its ancestor (the structural pin — headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.230.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.230.0]')).toBeLessThan(changelog.indexOf('## [2.229.0]'));
  });

  it('the whats-new feed leads the lens entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.230.0',")).toBe(true);
    expect(feed.indexOf("version: '2.230.0',")).toBeLessThan(feed.indexOf("version: '2.229.0',"));
    expect(feed.includes("title: \"The sheet's lens\",")).toBe(true);
  });
});

// ── THE WIRE — the line names its shelf ──────────────────────────────────

describe('the drill wire grows the category join (additive, one query)', () => {
  it('the product select joins the category name', () => {
    expect(wire.includes('category: { select: { name: true } },')).toBe(true);
  });

  it('the line mapping speaks the shelf — null stays null, never a hidden grouping', () => {
    expect(wire.includes('category: l.product.category?.name ?? null,')).toBe(true);
  });

  it('the growth rides the EXISTING fetch (no new query — the same findUnique include)', () => {
    expect(wire.includes('db.stockTake.findUnique')).toBe(true);
    expect(wire.match(/findUnique/g)?.length).toBe(1);
  });

  it('the cost law stands untouched (the gate still speaks the honest absence)', () => {
    expect(wire.includes("canViewCost ? Math.round(varianceValueEstimate * 100) / 100 : null")).toBe(true);
  });

  it('the org gate stands untouched (ORG_ROLES + runWithoutTenant face unchanged)', () => {
    expect(wire.includes("const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];")).toBe(true);
  });

  it('the client type is OPTIONAL — the branch panel stays assignable (sheetLinesCsv shares the type)', () => {
    expect(drill.includes('category?: string | null;')).toBe(true);
    expect(panel.includes("import { sheetLinesCsv } from '@/components/org/sheet-drill';")).toBe(true);
    expect(panel.includes('bookCost: number | null;')).toBe(true);
  });
});

// ── THE LENS — the category needle ───────────────────────────────────────

describe("the sheet's lens (the finder's twin)", () => {
  it('the lens is a select with its own testid and an honest aria', () => {
    expect(drill.includes('data-testid="sheet-drill-lens"')).toBe(true);
    expect(drill.includes('aria-label="Filter the lines by category"')).toBe(true);
  });

  it('the lens is a CONTROL — it stays off the paper (data-sheet-print-off)', () => {
    expect(drill.includes('data-testid="sheet-drill-lens"')).toBe(true);
    expect(drill.indexOf('data-testid="sheet-drill-lens"')).toBeLessThan(drill.indexOf('data-sheet-print-off', drill.indexOf('data-testid="sheet-drill-lens"')));
  });

  it('the all-categories option exists and buckets derive from the HELD lines (zero new fetch)', () => {
    expect(drill.includes("<option value=\"all\">all categories</option>")).toBe(true);
    expect(drill.includes("data.lines.map((l) => l.category ?? 'uncategorized')")).toBe(true);
  });

  it('"uncategorized" is a real bucket and sorts LAST (named shelves first)', () => {
    expect(drill.includes("(a === 'uncategorized' ? 1 : 0) - (b === 'uncategorized' ? 1 : 0)")).toBe(true);
  });

  it('the lens mounts only when the sheet spans MORE THAN ONE bucket (an absent control never lies)', () => {
    expect(drill.includes('const lensActive = categoryBuckets.length > 1;')).toBe(true);
    expect(drill.includes('{lensActive && (')).toBe(true);
  });

  it('the lens is STATE of the drill, not of the sheet (a fresh door reads "all" — the map keys per sheet)', () => {
    expect(drill.includes("const [categoryNeedle, setCategoryNeedle] = useState('all');")).toBe(true);
    expect(map.includes('<SheetDrill key={drill.id}')).toBe(true);
  });
});

// ── THE COMBINED READING — the honest arithmetic ─────────────────────────

describe('the combined reading (lens AND needle, one honest count)', () => {
  it('one filter answers to BOTH instruments (category AND name/SKU over the same held lines)', () => {
    expect(drill.includes("(categoryNeedle === 'all' || (l.category ?? 'uncategorized') === categoryNeedle) &&")).toBe(true);
    expect(drill.includes('l.name.toLowerCase().includes(cleanNeedle) ||')).toBe(true);
  });

  it('the count stays an honest N of M (the tiles keep the whole-sheet truth)', () => {
    expect(drill.includes('{num(shownLines.length)} of {num(data.lines.length)}')).toBe(true);
    expect(drill.includes('data-testid="sheet-drill-finder-count"')).toBe(true);
  });

  it('a lensed shelf names itself beside the count (the amber lens-count span)', () => {
    expect(drill.includes('data-testid="sheet-drill-lens-count"')).toBe(true);
    expect(drill.includes("in {categoryNeedle}")).toBe(true);
  });

  it('the empty face grows honest variants (needle only / shelf + needle / shelf alone)', () => {
    expect(drill.includes("cleanNeedle !== '' || categoryNeedle !== 'all'")).toBe(true);
    expect(drill.includes('no line in \u201c${categoryNeedle}\u201d answers')).toBe(true);
    expect(drill.includes('the lens came back empty')).toBe(true);
  });
});

// ── THE SHELF WHISPER — context on screen AND paper ──────────────────────

describe('the shelf whisper (the line names its category)', () => {
  it('every line wears its category while the sheet spans buckets', () => {
    expect(drill.includes('data-testid="sheet-drill-line-category"')).toBe(true);
    expect(drill.includes("{l.category ?? 'uncategorized'}")).toBe(true);
  });

  it('the whisper rides the SAME lensActive gate (a one-shelf sheet whispers nothing)', () => {
    const gate = drill.indexOf('const lensActive = categoryBuckets.length > 1;');
    const whisper = drill.indexOf('data-testid="sheet-drill-line-category"');
    expect(gate).toBeGreaterThan(-1);
    expect(whisper).toBeGreaterThan(gate);
    expect(drill.includes('{lensActive && (\n                          <span data-testid="sheet-drill-line-category"')).toBe(true);
  });

  it('the whisper PRINTS — no print-off mark on it (a printed walk reads its shelves)', () => {
    const whisperIdx = drill.indexOf('data-testid="sheet-drill-line-category"');
    const tagStart = drill.lastIndexOf('<span', whisperIdx);
    const tagEnd = drill.indexOf('>', whisperIdx);
    const tag = drill.slice(tagStart, tagEnd + 1);
    expect(tag).toContain('data-testid="sheet-drill-line-category"');
    expect(tag).not.toContain('data-sheet-print-off');
  });
});

// ── THE LAWS THAT STAND — the reading never rewrites the sheet ───────────

describe('the laws that stand (the lens narrows the reading, never the sheet)', () => {
  it('the CSV keeps the WHOLE sheet — seven columns, the lens never touches the file', () => {
    expect(drill.includes("const header = 'product,sku,unit,snapshot,counted,variance,variance_cost_kes';")).toBe(true);
    expect(drill.includes('it speaks the WHOLE sheet')).toBe(true);
    expect(drill.includes('the finder narrows the reading, never the export')).toBe(true);
  });

  it('the cost law rides unchanged on the face (the honest absence renders)', () => {
    expect(drill.includes("'the shillings stay behind the cost gate'")).toBe(true);
  });

  it('the finder keeps its own door (the needle input, the clear, the count)', () => {
    expect(drill.includes('data-testid="sheet-drill-finder"')).toBe(true);
    expect(drill.includes('data-testid="sheet-drill-finder-clear"')).toBe(true);
  });

  it('the drill stays READ-ONLY BY LAW (no count inputs, no close, no cancel from the console)', () => {
    expect(drill.includes('read-only — the branch sheet keeps the pens')).toBe(true);
    expect(drill.includes("type=\"text\"\n                      data-testid=\"sheet-drill-finder\"")).toBe(true);
  });

  it('the print vocabulary stands (the sheet still lays itself on the page)', () => {
    expect(drill.includes("document.body.classList.add('sheet-printing')")).toBe(true);
    expect(drill.includes('data-sheet-print-overlay')).toBe(true);
    expect(drill.includes('data-sheet-print=""')).toBe(true);
  });

  it('the map still keys the drill per sheet (the fresh-door law for BOTH needles)', () => {
    expect(map.includes('<SheetDrill key={drill.id}')).toBe(true);
    expect(map.includes('onClose={() => setDrill(null)}')).toBe(true);
  });
});
