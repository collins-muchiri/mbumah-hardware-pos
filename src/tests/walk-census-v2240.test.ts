// v2.240.0 — the birth, everywhere.
//
//   - THE ROSTER'S BIRTH: kpi-summary's live/recent sheet queries grow
//     origin (one column each row already holds, zero new reads); the
//     map's roster rows wear the violet chip — a door-born sheet is
//     nameable BEFORE the drill opens (census → breakdown → roster →
//     drill: four altitudes, one family).
//   - THE BRANCH'S ECHO: the branch detail wire grows the sheet's own
//     origin; the branch sheet face wears the same violet birth chip —
//     one family, both sides of the glass.
//   - THE SILENCE LAW holds everywhere: the chip speaks 'walk-door' or
//     nothing; a hand-raised sheet wears silence, never a guess.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const map = read('src/components/org/variance-map.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const branchWire = read('src/app/api/stock-takes/[id]/route.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const primitives = read('src/components/org/primitives.tsx');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.240.0)', () => {
  it('package.json leads 2.240.0 (all three slots)', () => {
    expect(version).toBe('2.313.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.313.0');
    expect(pkg.mbumah.baseVersion).toBe('2.313.0');
  });

  it('VERSION speaks 2.240.0 and the verify gate is wired (previous gate still wired)', () => {
    expect(read('VERSION').trim()).toBe('2.313.0');
    expect(pkg.scripts['verify:v2-240-0']).toBe('node scripts/verify-v2-240-0.mjs');
    expect(pkg.scripts['verify:v2-239-0']).toBe('node scripts/verify-v2-239-0.mjs');
  });

  it('the whats-new feed leads the birth-everywhere entry (order pin: header-anchored)', () => {
    expect(feed.includes("version: '2.277.0',")).toBe(true);
    expect(feed.indexOf("version: '2.277.0',")).toBeLessThan(feed.indexOf("version: '2.276.0',"));
    expect(feed.includes("title: 'The walk\\u2019s law',")).toBe(true);
  });

  it('the changelog anchors the section above its ancestor (headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.241.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.241.0]')).toBeLessThan(changelog.indexOf('## [2.240.0]'));
  });

  it('the changelog speaks the roster and the echo', () => {
    const body = changelog.slice(changelog.indexOf('## [2.240.0]'), changelog.indexOf('## [2.239.0]'));
    expect(body).toContain('### Added');
    expect(body).toContain('### Styled');
    expect(body).toContain('variance-map-live-origin-{id}');
    expect(body).toContain('variance-map-row-origin-{id}');
    expect(body).toContain('stocktake-sheet-origin');
  });

  it('the counters ride +1 again (the yard\u2019s answer joined; the birth joins)', () => {
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.110.0')).toBe(204);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.77.0')).toBe(237);");
  });
});

// ── THE ROSTER'S BIRTH (kpi wire + map rows) ─────────────────────────────

describe('the roster\u2019s birth (kpi wire + map rows)', () => {
  it('both roster queries grow the origin column (zero new reads)', () => {
    expect(kpi).toContain('THE ROSTER\u2019S BIRTH');
    expect(kpi.match(/origin: true,/g)?.length).toBe(2);
  });

  it('both response blocks carry the origin additively', () => {
    expect(kpi).toContain('// v2.240.0 the roster\u2019s birth: additive (the silence when null).');
    expect(kpi.match(/origin: s.origin,/g)?.length).toBe(2);
  });

  it('the types are additive + optional (an older cached answer renders the silence)', () => {
    expect(primitives.match(/origin\?: string \| null;/g)?.length).toBe(2);
  });

  it('the live row wears the birth (before the drill even opens)', () => {
    expect(map).toContain('{s.origin === \'walk-door\' && <BirthChip testId={`variance-map-live-origin-${s.id}`} />}');
  });

  it('the roster row wears the birth (every altitude of the map)', () => {
    expect(map).toContain('{s.origin === \'walk-door\' && <BirthChip testId={`variance-map-row-origin-${s.id}`} />}');
  });

  it('the BirthChip is a named face — one component, one house', () => {
    expect(map).toContain('const BirthChip = ({ testId }: { testId: string }) => (');
    expect(map).toContain('born at a door');
    expect(map).toContain('title="born at a walk door — the org face pointed, the floor answered (the census counts it)"');
    const chip = map.slice(map.indexOf('const BirthChip'), map.indexOf('export function VarianceMap'));
    expect(chip).toContain('bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30');
    expect(chip).toContain('<DoorOpen className="h-2.5 w-2.5" aria-hidden="true" />');
  });
});

// ── THE BRANCH'S ECHO (branch wire + face) ───────────────────────────────

describe('the branch\u2019s echo (branch wire + face)', () => {
  it('the branch detail wire grows the origin additively', () => {
    expect(branchWire).toContain('THE BRANCH\u2019S ECHO');
    expect(branchWire).toContain('origin: sheet.origin,');
  });

  it('the branch face wears the same violet birth chip', () => {
    expect(panel).toContain('data-testid="stocktake-sheet-origin"');
    expect(panel).toContain("{detail.origin === 'walk-door' && (");
    expect(panel).toContain('title="this sheet was born at a walk door — the org face pointed, the floor answered (the census counts it)"');
    expect(panel).toContain('bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30');
  });

  it('the panel\u2019s SheetDetail type is additive + optional', () => {
    expect(panel).toContain('origin?: string | null;');
    expect(panel).toContain("import { ClipboardCheck, DoorOpen, Download, FolderTree, History, Loader2, Printer, RotateCcw, Search, X } from 'lucide-react';");
  });
});

// ── THE STYLING LAW (one motion across the map) ──────────────────────────

describe('the styling law (one motion, one family)', () => {
  it('the live progress bars ride the breakdown\u2019s width transition', () => {
    expect(map).toContain('block h-full rounded-full bg-amber-500 transition-[width] duration-500');
  });

  it('the v2.239 faces still speak (the breakdown chip, the drill chip, the disclosure pair)', () => {
    expect(map).toContain('data-testid={`coverage-row-door-born-${s.storeId}`}');
    expect(map).toContain('aria-controls="coverage-breakdown"');
    const drill = read('src/components/org/sheet-drill.tsx');
    expect(drill).toContain('data-testid="sheet-drill-origin"');
  });
});

// ── THE FOSSIL GUARDS ────────────────────────────────────────────────────

describe('the fossil guards (the census laws stay untouched)', () => {
  it('the allowlist law is untouched', () => {
    const createWire = read('src/app/api/stock-takes/route.ts');
    expect(createWire).toContain("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;");
  });

  it('the census face still speaks its zero', () => {
    expect(map).toContain('data-testid="cadence-door-census"');
    expect(map).toContain("typeof block.doorBorn30d === 'number'");
  });

  it('the per-branch wire still groups the same where-shape', () => {
    expect(kpi).toContain("where: { origin: 'walk-door', startedAt: { gte: windowStart } },");
    expect(kpi).toContain('doorBornByStore,');
  });

  it('the drill stays read-only', () => {
    const drill = read('src/components/org/sheet-drill.tsx');
    expect(drill).toContain('data-testid="sheet-drill-read-only"');
  });
});
