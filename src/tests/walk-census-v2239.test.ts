// v2.239.0 — the yard's answer.
//
//   - THE YARD'S-ANSWER WIRE: kpi-summary's stockTakes block grows
//     doorBornByStore — one grouped read over the SAME window births
//     the headline census already speaks (the same where-shape, zero
//     new sheet queries), one row per store the census heard. Additive
//     + optional in the type; a store ABSENT from the array answered
//     nothing (the silence is the honest zero).
//   - THE YARD'S-ANSWER CHIP: the coverage breakdown's answering rows
//     wear the violet door chip ("N born at a door"). THE SILENCE LAW:
//     the chip speaks only when the payload carries the census AND the
//     count is > 0 — the org census already spoke the org's zero.
//   - THE DRILL'S BIRTH CHIP: the org drill's wire grows the sheet's
//     own origin (one column the row already holds, zero new reads) and
//     a door-born sheet wears its birth beside the status chip. A
//     hand-raised sheet wears nothing.
//   - THE VIOLET DOOR FAMILY: both chips share one house; the census
//     line wears the same DoorOpen glass; the disclosure pair
//     (aria-controls + id) completes the toggle.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const map = read('src/components/org/variance-map.tsx');
const drill = read('src/components/org/sheet-drill.tsx');
const drillWire = read('src/app/api/org/stock-takes/[id]/route.ts');
const kpi = read('src/app/api/org/kpi-summary/route.ts');
const primitives = read('src/components/org/primitives.tsx');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const changelogTest = read('src/tests/console-changelog.test.ts');
const metaPin = read('src/tests/branch-walk-v2229.test.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.239.0)', () => {
  it('package.json leads 2.239.0 (all three slots)', () => {
    expect(version).toBe('2.264.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.264.0');
    expect(pkg.mbumah.baseVersion).toBe('2.264.0');
  });

  it('VERSION speaks 2.239.0 and the verify gate is wired (previous gate still wired)', () => {
    expect(read('VERSION').trim()).toBe('2.264.0');
    expect(pkg.scripts['verify:v2-239-0']).toBe('node scripts/verify-v2-239-0.mjs');
    expect(pkg.scripts['verify:v2-238-0']).toBe('node scripts/verify-v2-238-0.mjs');
  });

  it('the whats-new feed leads the yard\u2019s-answer entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.264.0',")).toBe(true);
    expect(feed.indexOf("version: '2.264.0',")).toBeLessThan(feed.indexOf("version: '2.263.0',"));
    expect(feed.includes("title: 'The yard\\u2019s answer',")).toBe(true);
  });

  it('the changelog anchors the section above its ancestor (headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.241.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.241.0]')).toBeLessThan(changelog.indexOf('## [2.240.0]'));
  });

  it('the changelog speaks the wire, the chip, and the drill\u2019s birth', () => {
    const body = changelog.slice(changelog.indexOf('## [2.240.0]'), changelog.indexOf('## [2.238.0]'));
    expect(body).toContain('### Added');
    expect(body).toContain('### Styled');
    expect(body).toContain('doorBornByStore');
    expect(body).toContain('data-testid="coverage-row-door-born-{storeId}"');
    expect(body).toContain('data-testid="sheet-drill-origin"');
  });

  it('the counters ride +1 (the door\u2019s-census entry joined; the yard\u2019s answer joins)', () => {
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.110.0')).toBe(156);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.109.0')).toBe(157);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.108.0')).toBe(158);");
    expect(changelogTest).toContain("expect(whatsNewUnreadCount('2.77.0')).toBe(189);");
  });

  it('the meta-pin family rides +1 with the counter source', () => {
    expect(metaPin).toContain("expect(counter).toContain(\"expect(whatsNewUnreadCount('2.110.0')).toBe(156);\");");
  });
});

// ── THE YARD'S-ANSWER WIRE (kpi-summary) ─────────────────────────────────

describe('the yard\u2019s-answer wire (kpi-summary)', () => {
  it('one grouped read over the SAME window births (the same where-shape)', () => {
    expect(kpi).toContain('const doorBornByStoreGroups = await rawDb.stockTake.groupBy({');
    expect(kpi).toContain("where: { origin: 'walk-door', startedAt: { gte: windowStart } },");
    expect(kpi).toContain('_count: { _all: true },');
  });

  it('the block carries the per-branch census additively', () => {
    expect(kpi).toContain('doorBornByStore,');
    expect(kpi).toContain('doorBorn: g._count._all,');
  });

  it('the type is additive + optional (a store absent answered nothing)', () => {
    expect(primitives).toContain('doorBornByStore?: Array<{ storeId: string; doorBorn: number }>;');
  });
});

// ── THE YARD'S-ANSWER CHIP (variance-map) ────────────────────────────────

describe('the yard\u2019s-answer chip (variance-map.tsx)', () => {
  it('the door-born counts ride the SAME derivation (zero new reads, never an effect)', () => {
    expect(map).toContain('const bornByStore = new Map(');
    expect(map).toContain('(block?.doorBornByStore ?? []).map((d) => [d.storeId, d.doorBorn]),');
    expect(map).toContain('doorBorn: block?.doorBornByStore ? bornByStore.get(c.storeId) ?? 0 : null,');
  });

  it('the chip speaks only when the yard ANSWERED (the silence law, never a drawn zero)', () => {
    expect(map).toContain('s.doorBorn != null && s.doorBorn > 0 && (');
    expect(map).toContain('data-testid={`coverage-row-door-born-${s.storeId}`}');
    expect(map).toContain('{s.doorBorn} born at a door');
  });

  it('the chip wears the violet door family with tabular figures', () => {
    expect(map).toContain('bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30');
  });

  it('the chip carries its own law on the title (the row aria stays the coverage voice)', () => {
    expect(map).toContain('title="sheets whose origin the create wire allowlisted as walk-door — the org face pointed, this yard answered"');
    expect(map).toContain('aria-label={`${s.name}: ${s.heard} of ${s.total} shelves heard in the ${lawWindowDays}-day window.`}');
  });

  it('the disclosure pair is complete (aria-controls + the flyout\u2019s id)', () => {
    expect(map).toContain('aria-controls="coverage-breakdown"');
    expect(map).toContain('<div id="coverage-breakdown" data-testid="coverage-breakdown"');
  });

  it('the rows grow the hover surface; the bars grow the inner track', () => {
    expect(map).toContain('className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"');
    expect(map).toContain('h-1 flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner dark:bg-slate-700');
    expect(map).toContain('block h-full rounded-full bg-emerald-500 shadow-sm transition-[width] duration-500');
  });

  it('the census line wears the door\u2019s own glass (decorative, the family named)', () => {
    expect(map).toContain('<DoorOpen className="h-2.5 w-2.5 shrink-0 text-violet-500 dark:text-violet-400" aria-hidden="true" />');
    expect(map).toContain("import { ClipboardCheck, ChevronDown, ChevronRight, DoorOpen, Download, History, Scale, X } from 'lucide-react';");
  });
});

// ── THE DRILL'S BIRTH CHIP (org drill wire + face) ───────────────────────

describe('the drill\u2019s birth chip (org drill)', () => {
  it('the wire grows the origin additively (one column the row already holds)', () => {
    expect(drillWire).toContain('origin: sheet.origin,');
    expect(drillWire).toContain('THE DRILL\u2019S BIRTH CHIP');
  });

  it('the face speaks the birth only when the allowlisted origin rode the wire', () => {
    expect(drill).toContain("data?.origin === 'walk-door' && (");
    expect(drill).toContain('data-testid="sheet-drill-origin"');
    expect(drill).toContain('born at a walk door');
    expect(drill).toContain('title="this sheet was born at a walk door — the org face pointed, the floor answered (the census counts it)"');
  });

  it('the type is additive + optional (an older cached wire renders the silence)', () => {
    expect(drill).toContain('origin?: string | null;');
  });

  it('the birth chip wears the same violet family and the DoorOpen glass', () => {
    expect(drill).toContain("import { ArrowRight, ClipboardCheck, DoorOpen, Download, Printer, Search, X } from 'lucide-react';");
    expect(drill).toContain('inline-flex items-center gap-1 rounded bg-violet-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30');
    expect(drill).toContain('<DoorOpen className="h-2.5 w-2.5" aria-hidden="true" />');
  });
});

// ── THE FOSSIL GUARDS (the census laws stay untouched) ───────────────────

describe('the fossil guards (v2.238\u2019s laws still speak)', () => {
  it('the origin column + allowlist law is untouched', () => {
    const createWire = read('src/app/api/stock-takes/route.ts');
    expect(createWire).toContain("const SHEET_ORIGIN_ALLOWLIST = ['walk-door'] as const;");
  });

  it('the census face still speaks its zero', () => {
    expect(map).toContain('data-testid="cadence-door-census"');
    expect(map).toContain("typeof block.doorBorn30d === 'number'");
    expect(map).toContain('text-[10px] tabular-nums text-slate-500 dark:text-slate-400');
  });

  it('the coverage breakdown still derives + sorts by the silent-shelves law', () => {
    expect(map).toContain('const coverageByStore = useMemo(() => {');
    expect(map).toContain("if (c.band === 'fresh' || c.band === 'stale') e.heard += 1;");
    expect(map).toContain('.sort((a, b) => (a.heard / a.total) - (b.heard / b.total) || b.total - a.total)');
  });

  it('the drill stays read-only (no pens crossed)', () => {
    expect(drill).toContain('data-testid="sheet-drill-read-only"');
  });
});
