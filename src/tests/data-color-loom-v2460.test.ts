/**
 * data-color-loom-v2460.test.ts — v2.460.0 THE DATA-COLORED TRIBES LEARN
 * THE FAMILY'S GRAMMAR (the sixth weave): the ledger's last two rows are
 * taken — and the loom could rest.
 *
 * The two remaining hand-rolled chip tribes could not ride <FilterChip>
 * as-is: their ACTIVE faces are PER-ROW data colors (the category's
 * own), not named tints — forcing them into the registry would have
 * been a lie per row. The honest weave gives them the family's GRAMMAR
 * while their color stays their own:
 *
 *   • THE PRESSED VOICE: every chip speaks aria-pressed (the POS All +
 *     per-category chips and the inventory All + per-category tags —
 *     the manage-mode edit chips are divs with edit/delete buttons,
 *     not toggles, and stay silent by design).
 *   • THE RING LEAVES HOME: CHIP_RING_ZINC is exported from the loom
 *     and imported by both tribes — one ring, many hands. CHIP_ACTIVE
 *     and CHIP_IDLE leave home the same way (the POS idle face was
 *     byte-exact CHIP_IDLE already; now it is the registry's CONSTANT,
 *     not a copy).
 *   • THE MASQUERADE RETIRES: `.chip-active` — the masquerade law's one
 *     named rider, a plain-CSS dialect invisible to the byte walks —
 *     inlines its own face (scale-105 + the 0 4px 12px oklch wash)
 *     and the block leaves globals.css. `.chip-hover-lift` stays: a
 *     motion voice, never a vocabulary masquerade.
 *   • THE SCALE DIALECT RETIRES: the inventory tags' head rode the
 *     family head (border, transition-all, no grow); the idle faces
 *     gain the border-border + hover:text-foreground bytes they always
 *     lacked; the active data-color chip's border speaks its own color
 *     (the POS tribe's borderColor precedent).
 *   • THE HONEST GLYPHS: the POS strip's scroll arrows wear
 *     ChevronLeft / ChevronRight instead of a rotated ChevronDown.
 *   • THE BADGES AND DOTS STAY: the per-chip count badges and the
 *     category color dots are the tribes' own children — a badge voice,
 *     never a lens face.
 *
 * THE WALK-SAFETY LAW: every pin below is a SEALED byte of this round's
 * own edits or an elder seat — no living version literal anywhere in it.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readRepo = (p: string) => readFileSync(p, 'utf8');

const POS = 'src/components/pos/category-chips.tsx';
const INV = 'src/app/(shell)/tabs/inventory-tab.tsx';
const LOOM = 'src/components/filter-chip.tsx';
const CSS = 'src/app/globals.css';

const pos = readRepo(POS);
const inv = readRepo(INV);
const loom = readRepo(LOOM);
const css = readRepo(CSS);

describe('v2.460.0 — the data-colored tribes ride the family grammar', () => {
  it('the loom exports the family constants (the ring and the faces leave home, bytes intact)', () => {
    expect(loom).toContain("export const CHIP_RING_ZINC =\n  ' focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1';");
    expect(loom).toContain("export const CHIP_ACTIVE = 'bg-primary text-primary-foreground border-primary shadow-sm';");
    expect(loom).toContain("export const CHIP_IDLE =\n  'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground';");
  });

  it('the POS chips speak the pressed voice (All and per-category both)', () => {
    expect(pos).toContain('aria-pressed={selected === \'all\'}');
    expect(pos).toContain('aria-pressed={isActive}');
    expect([...pos.matchAll(/aria-pressed=/g)].length).toBe(2);
  });

  it('the POS chips wear the family\u2019s zinc ring through the IMPORT (one home, many hands)', () => {
    expect(pos).toContain("import { CHIP_IDLE, CHIP_RING_ZINC } from '@/components/filter-chip';");
    expect([...pos.matchAll(/chip-hover-lift\$\{CHIP_RING_ZINC\}/g)].length).toBe(2);
  });

  it('the POS idle face rides the CONSTANT — the byte copy is gone', () => {
    expect(pos).not.toContain("'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'");
    expect([...pos.matchAll(/: CHIP_IDLE\n/g)].length).toBe(2);
  });

  it('THE MASQUERADE RETIRES — the active faces inline the retired CSS dialect\u2019s own bytes', () => {
    expect([...pos.matchAll(/scale-105 shadow-\[0_4px_12px_oklch\(0_0_0_\/_0\.12\)\]/g)].length).toBe(2);
    expect(pos).not.toContain('shadow-sm chip-active');
    expect(css).not.toContain('.chip-active {');
  });

  it('the motion utility stays (a motion voice, never a vocabulary masquerade)', () => {
    expect(css).toContain('.chip-hover-lift {');
    expect(css).toContain('transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;');
  });

  it('the scroll arrows wear honest glyphs (no rotated ChevronDown in the strip)', () => {
    expect(pos).toContain('<ChevronLeft className="h-3 w-3" />');
    expect(pos).toContain('<ChevronRight className="h-3 w-3" />');
    expect(pos).not.toContain('<ChevronDown');
    expect(pos).toContain('aria-label="Scroll categories left"');
    expect(pos).toContain('aria-label="Scroll categories right"');
  });

  it('the POS desk\u2019s own voices stay: the gradient All-face, the data-color gradient, the badges', () => {
    expect(pos).toContain("'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-transparent scale-105 shadow-[0_4px_12px_oklch(0_0_0_/_0.12)]'");
    expect(pos).toContain('backgroundColor: catColor');
    expect(pos).toContain('backgroundImage: `linear-gradient(135deg, ${catColor}, ${catColor}cc)`');
    expect([...pos.matchAll(/text-\[9px\] px-1\.5 py-0 rounded-full font-bold/g)].length).toBe(2);
  });

  it('the inventory tags speak the pressed voice and wear the family head (border, no grow)', () => {
    expect(inv).toContain('aria-pressed={selectedCategory === \'all\'}');
    expect(inv).toContain('aria-pressed={selectedCategory === c.id}');
    const classLines = inv.split('\n').filter((l) => l.includes('className='));
    expect(classLines.some((l) => l.includes('hover:scale-105'))).toBe(false);
    expect([...inv.matchAll(/inline-flex items-center gap-1\.5 px-3 py-1\.5 rounded-full text-xs font-medium border transition-all\$\{CHIP_RING_ZINC\}/g)].length).toBe(2);
  });

  it('the inventory faces ride the registry CONSTANTS (the idle face gains the bytes it always lacked)', () => {
    expect(inv).toContain("import { CHIP_ACTIVE, CHIP_IDLE, CHIP_RING_ZINC } from '@/components/filter-chip';");
    expect(inv).toContain('? CHIP_ACTIVE\n                : CHIP_IDLE');
    expect(inv).toContain("style={selectedCategory === c.id ? { backgroundColor: color, borderColor: color } : {}}");
    expect(inv).not.toContain("'bg-muted/50 text-muted-foreground hover:bg-muted'");
  });

  it('the inventory desk\u2019s own voices stay: the color dot and the count badge; the manage-mode divs stay silent', () => {
    expect(inv).toContain('<span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />');
    expect(inv).toContain("selectedCategory === c.id ? 'bg-white/20' : 'bg-muted'");
    // the manage-mode edit chips are NOT toggles — no pressed voice on a div
    expect(inv).toContain('aria-label={`Edit category ${c.name}`}');
    expect(inv).toContain('aria-label={`Delete category ${c.name}`}');
  });

  it('the loom\u2019s own face is untouched (the FilterChip render still speaks the pressed voice)', () => {
    expect(loom).toContain('aria-pressed={active}');
    expect(loom).toContain("focusRing === 'none' ? '' : CHIP_RING_ZINC");
    expect(loom).toContain('const CHIP_HEAD = \'px-3 py-1.5 rounded-full text-xs font-medium border transition-all\';');
  });
});
