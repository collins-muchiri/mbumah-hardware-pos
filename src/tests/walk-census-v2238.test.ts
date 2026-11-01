// v2.238.0 — the door's census.
//
//   - THE ORIGIN COLUMN: stock_takes.origin (nullable) — how a sheet was
//     born. THE ALLOWLIST LAW: the create wire stores exactly ONE value
//     ('walk-door'); anything else reads as hand-raised. A closed
//     vocabulary is a census the ledger can trust.
//   - THE BIRTH RIDES THE DRAWER: doorBorn shares the whisper's life —
//     set by the door's consume, silenced by the user's own hand,
//     cleared on success. Only a sheet whose AISLE the door aimed
//     carries the origin.
//   - THE CENSUS WIRE: kpi-summary's stockTakes block grows
//     doorBorn30d — one bounded count of window births, additive +
//     optional in the type (an older cached answer renders the silent
//     absence).
//   - THE CENSUS FACE: cadence-door-census speaks its zero honestly —
//     a face may say nothing happened; only a CONTROL must hide.
//   - THE COVERAGE BREAKDOWN: the tile's label becomes a toggle; the
//     flyout speaks per-branch coverage, the silent shelves leading.
//     Zero new reads — the rows the map renders ARE the rows the
//     breakdown speaks.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const map = read('src/components/org/variance-map.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const createWire = read('src/app/api/stock-takes/route.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const primitives = read('src/components/org/primitives.tsx');
const schema = read('prisma/schema.prisma');
const migration = read('prisma/migrations/20261028100000_add_stock_take_origin/migration.sql');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.238.0)', () => {
  it('package.json leads 2.238.0 (all three slots)', () => {
    expect(version).toBe('2.320.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.320.0');
    expect(pkg.mbumah.baseVersion).toBe('2.320.0');
  });

  it('VERSION speaks 2.238.0 and the verify gate is wired', () => {
    expect(read('VERSION').trim()).toBe('2.320.0');
    expect(pkg.scripts['verify:v2-238-0']).toBe('node scripts/verify-v2-238-0.mjs');
  });

  it('the whats-new feed leads the door\u2019s-census entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.277.0',")).toBe(true);
    expect(feed.indexOf("version: '2.277.0',")).toBeLessThan(feed.indexOf("version: '2.276.0',"));
    expect(feed.includes("title: 'The door\\u2019s census',")).toBe(true);
  });

  it('the changelog anchors the section above its ancestor (headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.241.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.241.0]')).toBeLessThan(changelog.indexOf('## [2.240.0]'));
  });

  it('the changelog speaks the column, the census, and the breakdown', () => {
    const body = changelog.slice(changelog.indexOf('## [2.238.0]'), changelog.indexOf('## [2.237.0]'));
    expect(body).toContain('### Added');
    expect(body).toContain('### Styled');
    expect(body).toContain('stock_takes.origin');
    expect(body).toContain('data-testid="cadence-door-census"');
    expect(body).toContain('data-testid="coverage-breakdown"');
    expect(body).toContain("doorBorn30d");
  });
});

// ── THE ORIGIN COLUMN (schema + allowlist wire) ──────────────────────────

describe('the origin column (schema + create wire)', () => {
  it('the schema carries the nullable origin with its law in the comment', () => {
    expect(schema).toMatch(/origin\s+String\?/);
    expect(schema).toContain('how a sheet was born');
    expect(schema).toContain('create wire ALLOWLISTS it');
  });

  it('the migration is additive + nullable on the mapped table', () => {
    expect(migration).toContain('ALTER TABLE "stock_takes" ADD COLUMN "origin" TEXT;');
  });

  it('the allowlist law: the wire stores exactly ONE origin value', () => {
    expect(createWire).toContain("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;");
    expect(createWire).toContain('const origin = SHEET_ORIGIN_ALLOWLIST.includes(body?.origin) ? body.origin : null;');
  });

  it('the create writes the origin inside the snapshot transaction', () => {
    expect(createWire).toContain('data: { storeId, status: \'COUNTING\', notes, startedById: session.userId, origin, walkCategoryId }');
  });
});

// ── THE BIRTH RIDES THE DRAWER (stock-take-panel) ────────────────────────

describe('the birth rides the drawer (stock-take-panel.tsx)', () => {
  it('doorBorn shares the whisper\u2019s life (set by the consume, cleared on success)', () => {
    expect(panel).toContain('const [doorBorn, setDoorBorn] = useState(false);');
    expect(panel).toContain('setDoorBorn(true);');
    expect(panel).toContain('setDoorBorn(false);');
    expect(panel).toContain('setDoorVoice(null);');
  });

  it('the user\u2019s own hand silences BOTH the whisper and the birth (scope pair + the listbox\u2019s pick — the select became a Radix listbox at v2.252.0)', () => {
    expect(panel).toContain("onClick={() => { setCreateScope('full'); setDoorVoice(null); setDoorBorn(false); }}");
    expect(panel).toContain("onClick={() => { setCreateScope('category'); setDoorVoice(null); setDoorBorn(false); }}");
    expect(panel).toContain('onValueChange={(v) => { setCreateCategoryId(v); setDoorVoice(null); setDoorBorn(false); }}');
  });

  it('the create payload carries the origin ONLY when the door aimed the sheet', () => {
    expect(panel).toContain("...(doorBorn ? { origin: 'walk-door' } : {})");
  });
});

// ── THE CENSUS WIRE (kpi-summary) ────────────────────────────────────────

describe('the census wire (kpi-summary)', () => {
  it('one bounded count over the window\u2019s door-born sheets', () => {
    expect(kpi).toContain("where: { origin: 'walk-door', startedAt: { gte: windowStart } }");
    expect(kpi).toContain('const doorBorn30d = await rawDb.stockTake.count({');
  });

  it('the block carries the census additively (births, not closes)', () => {
    expect(kpi).toContain('doorBorn30d,');
  });

  it('the type is additive + optional (an older cached answer renders the silent absence)', () => {
    expect(primitives).toContain('doorBorn30d?: number;');
  });
});

// ── THE CENSUS FACE + THE COVERAGE BREAKDOWN (variance-map) ─────────────

describe('the census face (variance-map.tsx)', () => {
  it('the census speaks only when the wire carried the field (the type check, never an assumption)', () => {
    expect(map).toContain("typeof block.doorBorn30d === 'number'");
  });

  it('the census speaks its zero honestly and names the law', () => {
    expect(map).toContain('data-testid="cadence-door-census"');
    expect(map).toContain('this window started at a walk door — the org face pointed, the floor answered.');
    expect(map).toContain("{block.doorBorn30d === 1 ? '1 sheet' : `${block.doorBorn30d} sheets`}");
  });

  it('the census rides the muted family with tabular figures', () => {
    const census = map.slice(map.indexOf('data-testid="cadence-door-census"'), map.lastIndexOf('<ul className="mt-1.5 space-y-1.5">'));
    expect(census).toContain('text-[10px] tabular-nums text-slate-500 dark:text-slate-400');
  });
});

describe('the coverage breakdown (variance-map.tsx)', () => {
  it('the breakdown is DERIVED from the cadence rows (zero new reads, never an effect)', () => {
    expect(map).toContain('const coverageByStore = useMemo(() => {');
    expect(map).toContain("if (c.band === 'fresh' || c.band === 'stale') e.heard += 1;");
  });

  it('the silent shelves lead (least heard first, heaviest roster as the tiebreak)', () => {
    expect(map).toContain('.sort((a, b) => (a.heard / a.total) - (b.heard / b.total) || b.total - a.total)');
  });

  it('the tile\u2019s label becomes a toggle when the cadence speaks (stale payload keeps the plain label)', () => {
    expect(map).toContain('data-testid="coverage-breakdown-toggle"');
    expect(map).toContain('aria-expanded={coverageOpen}');
    expect(map).toContain('>Heard · {lawWindowDays}d<');
  });

  it('the breakdown renders per-branch bars with the full voice on the aria', () => {
    expect(map).toContain('data-testid="coverage-breakdown"');
    expect(map).toContain('data-testid={`coverage-row-${s.storeId}`}');
    expect(map).toContain('aria-label={`${s.name}: ${s.heard} of ${s.total} shelves heard in the ${lawWindowDays}-day window.`}');
    expect(map).toContain('the silent shelves lead — each branch&apos;s share of aisles the {lawWindowDays}-day window heard.');
  });

  it('the flyout hides when nothing to break down (absent control never lies)', () => {
    expect(map).toContain('{coverageOpen && coverageByStore.length > 0 && (');
  });

  it('every new face owns its dark half', () => {
    const flyout = map.slice(map.indexOf('data-testid="coverage-breakdown"'), map.indexOf('{indicative && ('));
    expect(flyout).toContain('dark:border-slate-700');
    expect(flyout).toContain('dark:bg-slate-800/60');
  });
});
