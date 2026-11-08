/**
 * chip-tones-v2456.test.ts — v2.456.0 THE ELDER LOOM'S SECOND WEAVE: the
 * registry color dialects join the one wardrobe.
 *
 * The first weave (v2.455.0) loomed the muted/50 family; the ledger
 * named the remaining dialects. This round the TWO registry-driven
 * status lenses — the debt-plans desk's status filter and the exports
 * history's status filter — stop carrying hand-copied color Records and
 * ride the loom's ONE tone registry:
 *
 *   • src/components/filter-chip.tsx: CHIP_TONE_ACTIVE / CHIP_TONE_IDLE
 *     — the palette (emerald, green, rose, amber, zinc) in one home,
 *     the dark: variants riding the idle faces exactly as the desks
 *     kept them.
 *   • THE SHADOW UNIFICATION (the weave's one named, deliberate
 *     improvement): the debt-plans desk's active face carried
 *     `shadow-sm`, the exports desk's stood flat — the family's own
 *     primary active face already lifts, so the shadow rides every
 *     tone now (resolved FOR the lift, not against it).
 *   • THE PRESSED VOICE COMPLETES: the debt-plans desk already spoke
 *     aria-pressed; the exports history's status chips gain it through
 *     the loom — every lens chip in the app speaks its pressed state.
 *   • THE FAMILY'S RING: both status lenses gain the zinc keyboard ring
 *     through the loom (neither wore one hand-rolled).
 *   • THE COUNT BADGE'S ONE HOME: the two desks rendered byte-identical
 *     badges; the FilterChipCount companion owns that wardrobe now.
 *
 * THE MASQUERADE LAW, LOOM FORM: the tone faces live in exactly ONE src
 * file. THE TYPE ROW'S SLATE DIALECT STAYS HAND-ROLLED (the ledger's
 * remaining map — a later weave's material).
 *
 * THE WALK-SAFETY LAW: every pin below is a SEALED byte of this round's
 * own edits or an elder seat — no living version literal anywhere in it
 * (version prose lives in comments, not pins).
 * THE WORD-FREE LAW: this file names no address-bar token.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const loom = readRepo('src/components/filter-chip.tsx');
const debt = readRepo('src/app/(shell)/tabs/debt-plans-tab.tsx');
const exportsHistory = readRepo('src/components/data-exports/exports-history-table.tsx');

const walkSrc = (dir: string, acc: string[]): string[] => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      walkSrc(p, acc);
    } else if (/\.(tsx?|mjs)$/.test(e.name) && !/\.test\.ts$/.test(e.name)) {
      acc.push(p);
    }
  }
  return acc;
};

describe('v2.456.0 — the loom learns the tones: the registry rides one home', () => {
  it('the tone registry lives in the loom — both faces, exported, one file', () => {
    expect(loom).toContain('export const CHIP_TONE_ACTIVE: Record<string, string>');
    expect(loom).toContain('export const CHIP_TONE_IDLE: Record<string, string>');
  });

  it('the idle faces are byte-identical to the historic registries (dark: variants preserved)', () => {
    // The exports desk's idle rows (the superset — zinc included), the
    // exact bytes both desks carried before the weave.
    expect(loom).toContain(
      "emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900',"
    );
    expect(loom).toContain(
      "green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900',"
    );
    expect(loom).toContain(
      "rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900',"
    );
    expect(loom).toContain(
      "amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900',"
    );
    expect(loom).toContain(
      "zinc: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900/40 dark:text-zinc-300 dark:border-zinc-700',"
    );
  });

  it('the shadow unification: every active tone lifts (the named improvement)', () => {
    expect(loom).toContain(
      "emerald: 'bg-emerald-700 text-white border-emerald-700 shadow-sm',"
    );
    expect(loom).toContain(
      "green: 'bg-green-500 text-white border-green-600 shadow-sm',"
    );
    expect(loom).toContain(
      "rose: 'bg-rose-500 text-white border-rose-600 shadow-sm',"
    );
    expect(loom).toContain(
      "amber: 'bg-amber-500 text-white border-amber-600 shadow-sm',"
    );
    expect(loom).toContain(
      "zinc: 'bg-zinc-600 text-white border-zinc-600 shadow-sm',"
    );
  });

  it('the zinc tone rides the same registry (the cancelled chip\u2019s muted voice)', () => {
    // The withdrawn voice's color word, assembled from fragments (the
    // word-free law): the zinc rows are pinned above by their full
    // bytes; this pin is the registry's closed shape — five tones.
    const tones = [...loom.matchAll(/([\w]+): 'bg-/g)].map((m) => m[1]);
    const activeBlock = loom.slice(
      loom.indexOf('CHIP_TONE_ACTIVE'),
      loom.indexOf('CHIP_TONE_IDLE')
    );
    const idleBlock = loom.slice(
      loom.indexOf('CHIP_TONE_IDLE'),
      loom.indexOf('export interface')
    );
    expect([...activeBlock.matchAll(/([\w]+): 'bg-/g)].map((m) => m[1])).toEqual([
      'emerald',
      'green',
      'rose',
      'amber',
      'zinc',
    ]);
    expect([...idleBlock.matchAll(/([\w]+): 'bg-/g)].map((m) => m[1])).toEqual([
      'emerald',
      'green',
      'rose',
      'amber',
      'zinc',
    ]);
    expect(tones.length).toBeGreaterThanOrEqual(10);
  });

  it('the status lenses ride the loom — tone word in, wardrobe bytes out', () => {
    expect(debt).toContain('<FilterChip');
    expect(debt).toContain('tone={chip.color}');
    expect(debt).toContain('<FilterChipCount');
    expect(exportsHistory).toContain('<FilterChip');
    expect(exportsHistory).toContain('tone={chip.color}');
    expect(exportsHistory).toContain('<FilterChipCount');
    // The masquerade law, loom form: no desk speaks a wardrobe byte.
    expect(debt).not.toContain('CHIP_ACTIVE_CLASSES');
    expect(debt).not.toContain('CHIP_IDLE_CLASSES');
    expect(exportsHistory).not.toContain('CHIP_ACTIVE[');
    expect(exportsHistory).not.toContain('CHIP_IDLE[');
  });

  it('the pressed voice completes — the exports status chips speak it through the loom', () => {
    expect(loom).toContain('aria-pressed={active}');
    // The desk's hand-rolled byte retired; the voice rides the loom.
    expect(exportsHistory).not.toContain('aria-pressed={isActive}');
    expect(debt).not.toContain('aria-pressed={isActive}');
  });

  it('the family\u2019s ring rides the loom — the status lenses gain it without speaking it', () => {
    expect(loom).toContain(
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1'
    );
    // The debt desk speaks no ring byte of its own — its chips' ring is
    // the loom's now. The exports desk's own ring bytes belong to its
    // ROW actions (the elder sort handles and download buttons — not
    // chips), so the honest pin there is the chip head's retirement: no
    // hand-rolled status chip remains.
    expect(debt).not.toContain('focus-visible:ring');
    expect(exportsHistory).not.toContain(
      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all'
    );
  });

  it('the count badge\u2019s one home — the companion owns the face, the desks\u2019 status badges retire', () => {
    expect(loom).toContain('export function FilterChipCount');
    expect(loom).toContain("'bg-white/20 text-white'");
    // The status chips' hand-rolled badge spans retired: the debt desk
    // carries zero, the exports desk exactly one (its TYPE row's own
    // badge — the slate dialect's hand-rolled span, a later weave).
    expect(debt.split('bg-white/20').length - 1).toBe(0);
    expect(exportsHistory.split('bg-white/20').length - 1).toBe(1);
  });

  it('the masquerade law, loom form: the shadowed active face lives in exactly ONE src file', () => {
    const files = walkSrc('src', []);
    const carriers = files.filter((f) =>
      readFileSync(f, 'utf8').includes('bg-emerald-700 text-white border-emerald-700 shadow-sm')
    );
    expect(carriers).toEqual(['src/components/filter-chip.tsx']);
  });

  it('the unknown tone falls back to the family face (the closed registry\u2019s guard)', () => {
    expect(loom).toContain('CHIP_TONE_ACTIVE[tone] ?? CHIP_ACTIVE');
    expect(loom).toContain('CHIP_TONE_IDLE[tone] ?? CHIP_IDLE');
  });

  it('the hands still hold: the controlled hand and the desk\u2019s own chooser ride onClick', () => {
    // The debt desk's chooser keeps its seat.
    expect(debt).toContain('onClick={() => chooseDpStatus(chip.key)}');
    // The exports desk's controlled hand keeps its comment and its split.
    expect(exportsHistory).toContain('if (controlled) onFilterChange(chip.key);');
    expect(exportsHistory).toContain('else setFilter(chip.key);');
  });

  it('the TYPE row\u2019s slate dialect stays hand-rolled (the ledger\u2019s remaining map)', () => {
    expect(exportsHistory).toContain('const TYPE_CHIP_ACTIVE =');
    expect(exportsHistory).toContain('const TYPE_CHIP_IDLE =');
  });
});
