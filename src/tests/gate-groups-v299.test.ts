// MBUMAH HARDWARE POS - the drill groups its actors (v2.299.0)
//
// BOTH NETS, per the runtime-pin law:
//   • the VALUE net pins the pure lens's truth: first-appearance order, the
//     anonymous bucket last, the distinct role words, the row indices.
//   • the BYTE net pins the wiring: the tab imports the lens (never copies
//     it), the ONE parse still has exactly one call site, the toggle is
//     honest about its state, the grouped section is a view only (the
//     filing and the aggregate are untouched by it).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { groupDrillRowsByActor, DRILL_UNKNOWN_ACTOR, type DrillActor } from '@/lib/security-feed';

const ROOT = process.cwd();
const TAB = 'src/app/(shell)/tabs/security-tab.tsx';
const FEED_LIB = 'src/lib/security-feed.ts';

function actor(email: string | null, role: string | null = null): DrillActor {
  return { email, role, permission: null };
}

describe('groupDrillRowsByActor — the value net', () => {
  it('an empty ledger groups into nothing', () => {
    expect(groupDrillRowsByActor([])).toEqual([]);
  });

  it('sections appear in FIRST-APPEARANCE order — the ledger decides who leads', () => {
    const groups = groupDrillRowsByActor([
      actor('b@x.co.ke'),
      actor('a@x.co.ke'),
      actor('b@x.co.ke'),
    ]);
    expect(groups.map((g) => g.key)).toEqual(['b@x.co.ke', 'a@x.co.ke']);
  });

  it('each section carries its rows in ledger order (never re-sorted)', () => {
    const groups = groupDrillRowsByActor([
      actor('a@x.co.ke'),
      actor('b@x.co.ke'),
      actor('a@x.co.ke'),
    ]);
    expect(groups[0].rows).toEqual([0, 2]);
    expect(groups[1].rows).toEqual([1]);
  });

  it('the anonymous bucket is ONE bucket and it walks LAST', () => {
    const groups = groupDrillRowsByActor([
      actor(null),
      actor('a@x.co.ke'),
      actor(null),
      actor('a@x.co.ke'),
    ]);
    expect(groups.map((g) => g.key)).toEqual(['a@x.co.ke', DRILL_UNKNOWN_ACTOR]);
    expect(groups[0].rows).toEqual([1, 3]);
    expect(groups[1].rows).toEqual([0, 2]);
    expect(groups[1].isUnknown).toBe(true);
  });

  it('an all-unknown ledger has its one bucket first — never an invented identity', () => {
    const groups = groupDrillRowsByActor([actor(null), actor(null)]);
    expect(groups).toHaveLength(1);
    expect(groups[0].key).toBe(DRILL_UNKNOWN_ACTOR);
    expect(groups[0].label).toBe(DRILL_UNKNOWN_ACTOR);
    expect(groups[0].isUnknown).toBe(true);
    expect(groups[0].rows).toEqual([0, 1]);
  });

  it('the label is the key, one home for both — named sections speak the email', () => {
    const groups = groupDrillRowsByActor([actor('a@x.co.ke')]);
    expect(groups[0].label).toBe(groups[0].key);
    expect(groups[0].isUnknown).toBe(false);
  });

  it('role words are DISTINCT and first-seen-first — a header never repeats a pill', () => {
    const groups = groupDrillRowsByActor([
      actor('a@x.co.ke', 'CASHIER'),
      actor('a@x.co.ke', 'MANAGER'),
      actor('a@x.co.ke', 'CASHIER'),
    ]);
    expect(groups[0].roles).toEqual(['CASHIER', 'MANAGER']);
  });

  it('the anonymous bucket collects its roles the same way', () => {
    const groups = groupDrillRowsByActor([actor(null, 'CASHIER'), actor(null, 'CASHIER'), actor(null, 'MANAGER')]);
    expect(groups[0].roles).toEqual(['CASHIER', 'MANAGER']);
  });

  it('rows without a role contribute none — the pill only names a real word', () => {
    const groups = groupDrillRowsByActor([actor('a@x.co.ke'), actor('a@x.co.ke', null)]);
    expect(groups[0].roles).toEqual([]);
  });

  it('a single account, single row — the trivial ledger', () => {
    const groups = groupDrillRowsByActor([actor('solo@x.co.ke', 'CASHIER')]);
    expect(groups).toHaveLength(1);
    expect(groups[0].rows).toEqual([0]);
    expect(groups[0].roles).toEqual(['CASHIER']);
  });
});

describe('the byte net — the wiring', () => {
  it('the tab imports the lens from the lib, never copies it', () => {
    const src = readFileSync(join(ROOT, TAB), 'utf8');
    expect(src).toContain('groupDrillRowsByActor,');
    expect(src).not.toContain('function groupDrillRowsByActor');
  });

  it('the ONE parse still has exactly ONE call site — the consumers grow, the parse count does not', () => {
    const src = readFileSync(join(ROOT, TAB), 'utf8');
    expect((src.match(/drillActorFromDetails\(/g) || []).length).toBe(1);
    expect(src).toContain('const drillGroups = groupDrillRowsByActor(drillActors);');
  });

  it('the row face lives in ONE helper consumed by BOTH lenses', () => {
    const src = readFileSync(join(ROOT, TAB), 'utf8');
    expect(src).toContain('const renderDrillRow = (ev: GateDrillEvent, i: number, showActor: boolean) => {');
    expect(src).toContain('{drillRows.map((ev, i) => renderDrillRow(ev, i, true))}');
    expect(src).toContain('{g.rows.map((idx) => renderDrillRow(drillRows[idx], idx, false))}');
  });

  it('the toggle exists, is pressed-state honest, and hides when there is nothing to group', () => {
    const src = readFileSync(join(ROOT, TAB), 'utf8');
    expect(src).toContain('data-testid="gate-drill-group-toggle"');
    expect(src).toContain('aria-pressed={drillGrouped}');
    expect(src).toContain('{drillRows.length > 0 ? (');
    expect(src).toContain("aria-label={\n                            drillGrouped\n                              ? 'Show the denials as one ledger'\n                              : 'Group the shown denials by account'\n                          }");
  });

  it('the grouped section wears its spine and its amber count chip', () => {
    const src = readFileSync(join(ROOT, TAB), 'utf8');
    expect(src).toContain('data-testid="gate-drill-groups"');
    expect(src).toContain('data-testid="gate-drill-group"');
    expect(src).toContain('data-testid="gate-drill-group-label"');
    expect(src).toContain('border-l-2 border-amber-500/20');
    expect(src).toContain('bg-amber-500/10 text-amber-700 border-amber-500/20');
  });

  it('the anonymous section header speaks in the muted voice — never an identity claim', () => {
    const src = readFileSync(join(ROOT, TAB), 'utf8');
    expect(src).toContain("g.isUnknown ? 'text-muted-foreground' : 'text-foreground/80'");
  });

  it('the lens is view-only: the filing still consumes the LEDGER, not the groups', () => {
    const src = readFileSync(join(ROOT, TAB), 'utf8');
    expect(src).toContain('const rows = mergeDrillRows(gateDrillQuery.data.events, drillExtra);');
    expect(src).toContain('const csv = gateDrillToCsv(rows, {');
    expect(src).not.toContain('gateDrillToCsv(drillGroups');
    expect(src).not.toContain('renderDrillRow(drillGroups');
    expect((src.match(/gateDrillToCsv\(/g) || []).length).toBe(1);
  });

  it('the lens state is the operator\u2019s choice and persists across opens', () => {
    const src = readFileSync(join(ROOT, TAB), 'utf8');
    expect(src).toContain('const [drillGrouped, setDrillGrouped] = useState(false);');
  });

  it('security-feed.ts stays import-free (the client-bundle law survives the lens)', () => {
    const src = readFileSync(join(ROOT, FEED_LIB), 'utf8');
    expect(/^import /m.test(src)).toBe(false);
    expect(src).toContain('export function groupDrillRowsByActor(');
    expect(src).toContain('export interface GateDrillActorGroup {');
  });
});
