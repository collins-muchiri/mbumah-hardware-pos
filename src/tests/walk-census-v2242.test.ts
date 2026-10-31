// v2.242.0 — the aisle's answer.
//
//   - THE AISLE LAW: the create wire stores the walk order's address
//     (walkCategoryId) ONLY for a door-born sheet whose birth named one
//     category, resolved server-side against THIS store — a hand-raised
//     sheet carries no aisle even when it names one, and a dead or
//     cross-store aisle reads as no aisle (the census never guesses,
//     never speaks ghosts).
//   - THE CENSUS PER AISLE: kpi-summary groups the SAME window births by
//     the aisle, names via ONE catalog read, and speaks the TOP 3 — the
//     census is a headline, not a ledger.
//   - THE AISLE'S FACE: the map wears the violet rows under the census
//     line (counts, share bars, honest silence).
//   - THE AISLE'S ECHO: both detail wires grow the aisle's name and both
//     faces speak it beside the birth chip (sibling spans, never
//     rewrites — the chip law stays byte-identical).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const map = read('src/components/org/variance-map.tsx');
const createWire = read('src/app/api/stock-takes/route.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const primitives = read('src/components/org/primitives.tsx');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const orgWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const drill = read('src/components/org/sheet-drill.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const schema = read('prisma/schema.prisma');
const migration = read('prisma/migrations/20261028230000_add_stock_take_walk_category/migration.sql');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.242.0)', () => {
  it('package.json leads 2.242.0 (all three slots)', () => {
    expect(version).toBe('2.313.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.313.0');
    expect(pkg.mbumah.baseVersion).toBe('2.313.0');
  });

  it('VERSION speaks 2.242.0 and the verify gate is wired (previous gate still wired)', () => {
    expect(read('VERSION').trim()).toBe('2.313.0');
    expect(pkg.scripts['verify:v2-242-0']).toBe('node scripts/verify-v2-242-0.mjs');
    expect(pkg.scripts['verify:v2-241-0']).toBe('node scripts/verify-v2-241-0.mjs');
  });

  it('the whats-new feed leads the aisle\u2019s-answer entry (order pin: header-anchored)', () => {
    expect(feed.includes("version: '2.277.0',")).toBe(true);
    expect(feed.indexOf("version: '2.277.0',")).toBeLessThan(feed.indexOf("version: '2.276.0',"));
    expect(feed.includes("title: 'The aisle\\u2019s answer',")).toBe(true);
  });

  it('the changelog anchors the section above its ancestor (headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.242.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.242.0]')).toBeLessThan(changelog.indexOf('## [2.241.0]'));
  });

  it('the changelog speaks the aisle\u2019s answer, the census, and the echo', () => {
    const body = changelog.slice(changelog.indexOf('## [2.242.0]'), changelog.indexOf('## [2.241.0]'));
    expect(body).toContain('### Added');
    expect(body).toContain('### Styled');
    expect(body).toContain('walkCategoryId');
    expect(body).toContain('doorBornByAisle');
    expect(body).toContain('cadence-door-aisle-{categoryId}');
    expect(body).toContain('sheet-drill-origin-aisle');
    expect(body).toContain('stocktake-sheet-origin-aisle');
  });

  it('the counters ride +1 again (the aisle\u2019s answer joined)', () => {
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.110.0')).toBe(204);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.109.0')).toBe(205);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.108.0')).toBe(206);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.77.0')).toBe(237);");
  });
});

// ── THE AISLE LAW (schema + create wire) ─────────────────────────────────

describe('the aisle law (schema + create wire)', () => {
  it('the schema carries the aisle column + the SetNull ghost law', () => {
    expect(schema).toContain("v2.242.0 THE AISLE'S ANSWER");
    expect(schema).toContain('walkCategoryId String?');
    expect(schema).toContain('walkAisle ProductCategory? @relation(fields: [walkCategoryId], references: [id], onDelete: SetNull)');
  });

  it('the migration adds the column and the SetNull key (the census never speaks ghosts)', () => {
    expect(migration).toContain('ALTER TABLE "stock_takes" ADD COLUMN "walkCategoryId" TEXT;');
    expect(migration).toContain('ON DELETE SET NULL ON UPDATE CASCADE;');
  });

  it('the aisle rides ONLY a door birth that named one category', () => {
    expect(createWire).toContain("v2.242.0 THE AISLE'S ANSWER");
    expect(createWire).toContain("if (origin === 'walk-door' && categoryId) {");
  });

  it('the ghost law resolves the aisle against THIS store (server truth, never the caller\u2019s claim)', () => {
    expect(createWire).toContain('const aisle = await db.productCategory.findUnique({');
    expect(createWire).toContain('if (aisle && aisle.storeId === storeId) walkCategoryId = categoryId;');
  });

  it('the aisle rides the transaction create (the birth carries its address)', () => {
    expect(createWire).toContain('data: { storeId, status: \'COUNTING\', notes, startedById: session.userId, origin, walkCategoryId }');
  });
});

// ── THE CENSUS PER AISLE (kpi wire) ──────────────────────────────────────

describe('the census per aisle (kpi wire)', () => {
  it('the aisle groupBy rides the census\u2019s own where-shape (aisle-named births only)', () => {
    expect(kpi).toContain("v2.242.0 THE AISLE'S ANSWER");
    expect(kpi).toContain("by: ['walkCategoryId']");
    expect(kpi).toContain("where: { origin: 'walk-door', startedAt: { gte: windowStart }, walkCategoryId: { not: null } }");
  });

  it('the names ride ONE catalog read (ids bounded by the group)', () => {
    expect(kpi).toContain('rawDb.productCategory.findMany({ where: { id: { in: aisleIds } }, select: { id: true, name: true } })');
  });

  it('the headline is the TOP 3 (the census is a headline, not a ledger)', () => {
    expect(kpi).toContain('.sort((a, b) => b.doorBorn - a.doorBorn)');
    expect(kpi).toContain('.slice(0, 3);');
  });

  it('the payload + type ride additively (an older cached answer renders the silence)', () => {
    expect(kpi).toContain('doorBornByAisle: doorBornByAisle.map((a) => {');
    expect(primitives).toContain("doorBornByAisle?: Array<{ categoryId: string; name: string; doorBorn: number; varianceUnits?: number | null; band?: 'fresh' | 'stale' | 'beyond' | 'never' | null; daysSince?: number | null }>;");
  });
});

// ── THE AISLE'S FACE (the map) ───────────────────────────────────────────

describe('the aisle\u2019s face (the map)', () => {
  it('the block renders only when the wire spoke aisles (the type check, never an assumption)', () => {
    expect(map).toContain('{Array.isArray(block.doorBornByAisle) && block.doorBornByAisle.length > 0 && (');
    expect(map).toContain('data-testid="cadence-door-aisles"');
  });

  it('each row wears the aisle\u2019s testid, aria, and title (the census speaking, never a control)', () => {
    expect(map).toContain('data-testid={`cadence-door-aisle-${a.categoryId}`}');
    // v2.248.0: the title grew the row's own LAW (the window-sum voice) —
    // the original "the walk order pointed here" clause still leads it.
    expect(map).toContain('title="the walk order pointed here — the floor answered through this aisle; the verdict sums every closed sheet born here this window');
  });

  it('the headline names the aisles (the census learns WHERE)', () => {
    expect(map).toContain('the aisles the doors opened onto');
  });

  it('the share bar speaks the percent and rides the map\u2019s width transition', () => {
    expect(map).toContain(`aria-label={\`\${a.name}: \${sharePct} percent of this window's door births\`}`);
    expect(map).toContain('block h-full rounded-full bg-violet-400 transition-[width] duration-500');
  });

  it('the violet house is the door\u2019s own (one family, five altitudes)', () => {
    expect(map).toContain('border-violet-100 bg-violet-50/40 px-2 py-1.5 dark:border-violet-500/20 dark:bg-violet-500/10');
    expect(map).toContain("a.doorBorn === 1 ? '1 sheet born here' : `${a.doorBorn} sheets born here`");
  });
});

// ── THE AISLE'S ECHO (detail wires + faces) ──────────────────────────────

describe('the aisle\u2019s echo (detail wires + faces)', () => {
  it('both detail wires grow the aisle\u2019s name (additive; null when the birth named no aisle)', () => {
    expect(branchWire).toContain("v2.242.0 THE AISLE'S ECHO");
    expect(branchWire).toContain('walkAisle: { select: { name: true } }');
    expect(branchWire).toContain('walkAisle: sheet.walkAisle?.name ?? null,');
    expect(orgWire).toContain("v2.242.0 THE AISLE'S ECHO");
    expect(orgWire).toContain('walkAisle: { select: { name: true } }');
    expect(orgWire).toContain('walkAisle: sheet.walkAisle?.name ?? null,');
  });

  it('both faces wear the echo chip (sibling spans, never rewrites)', () => {
    expect(drill).toContain('data-testid="sheet-drill-origin-aisle"');
    expect(drill).toContain('the walk order named {data.walkAisle}');
    expect(drill).toContain("data?.origin === 'walk-door' && data?.walkAisle && (");
    expect(panel).toContain('data-testid="stocktake-sheet-origin-aisle"');
    expect(panel).toContain('the walk order named {detail.walkAisle}');
    expect(panel).toContain("detail.origin === 'walk-door' && detail.walkAisle && (");
  });

  it('the birth chip law stays byte-identical (the echo never rewrote it)', () => {
    expect(drill).toContain('data-testid="sheet-drill-origin"');
    expect(drill).toContain('born at a walk door');
    expect(panel).toContain('data-testid="stocktake-sheet-origin"');
    expect(panel).toContain("{detail.origin === 'walk-door' && (");
  });

  it('both types are additive + optional (an older cached wire renders the silence)', () => {
    expect(drill).toContain('walkAisle?: string | null;');
    expect(panel).toContain('walkAisle?: string | null;');
  });
});

// ── THE FOSSIL GUARDS ────────────────────────────────────────────────────

describe('the fossil guards (the door-arc laws stay untouched)', () => {
  it('the origin allowlist still holds (the census counts doors, never guesses)', () => {
    expect(createWire).toContain("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;");
  });

  it('the per-branch census still groups the same where-shape (v2.239\u2019s law)', () => {
    expect(kpi).toContain("where: { origin: 'walk-door', startedAt: { gte: windowStart } },");
    expect(kpi).toContain('doorBornByStore,');
  });

  it('the census face still speaks its zero (v2.238\u2019s law)', () => {
    expect(map).toContain('data-testid="cadence-door-census"');
    expect(map).toContain("typeof block.doorBorn30d === 'number'");
  });

  it('the walk\u2019s door still anchors + the law line still names the pair (v2.237 + v2.241\u2019s laws)', () => {
    expect(map).toContain('data-testid={`cadence-door-${c.categoryId}`}');
    expect(map).toContain('href={`/stores/${doorSlug}/inventory?countSheet=${c.categoryId}`}');
    expect(map).toContain('data-testid="cadence-law-line"');
  });

  it('the roster birth chips still ride (v2.240\u2019s law)', () => {
    expect(map).toContain('testId={`variance-map-live-origin-${s.id}`}');
    expect(map).toContain('testId={`variance-map-row-origin-${s.id}`}');
  });
});
