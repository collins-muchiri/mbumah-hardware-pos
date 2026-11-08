/**
 * customer-tints-v2459.test.ts — v2.459.0 THE ELDER LOOM'S FIFTH WEAVE:
 * the customers desk's quick chips ride one home — the ledger's LAST
 * named tint dialect is taken.
 *
 * The fourth weave (v2.458.0) loomed the review chips; its ledger named
 * the customers desk's emerald dialect as the remainder ALONE. This
 * round the desk's four quick chips (All / Active / With Debt / Loyalty
 * Members) retire their hand-rolled button and ride the loom:
 *
 *   • THE GLASS IDLE: the desk's historic idle voice — a glassy white
 *     wash for chips sitting on gradient card faces, where the
 *     transparent tint idle would show the card through — joins the
 *     loom byte-exact as `CHIP_TINT_IDLE_GLASS`, through the `glass`
 *     prop. A desk's backdrop is its own voice (the slim-head
 *     precedent): it rides a prop, never a hand-rolled className.
 *   • THE NAMED UNIFICATION (the shadow-sm precedent, second verse):
 *     the desk's active face had drifted from the registry's emerald —
 *     text-700 where the family speaks -800, dark 900/30 and -400/-700
 *     where the family speaks 950/40 and -200/-900. The copies
 *     disagreed; the family's voice wins. After the weave the desk
 *     speaks NO bg-emerald-100 byte at all — the registry's emerald
 *     (the ACHIEVED goal chip's own face) is the only emerald lens
 *     face in src.
 *   • THE PRESSED VOICE AND THE RING ARRIVE: the desk's chips never
 *     spoke aria-pressed and never wore a keyboard ring — through the
 *     loom every chip speaks its pressed state and the family's zinc
 *     ring (the v2.456.0 completion and the v2.457.0 ring gain, now
 *     family-wide).
 *   • THE HEAD IS THE LOOM'S: the desk's hand-rolled head byte
 *     (`inline-flex items-center gap-1.5 px-3 py-1.5 … transition-all
 *     border`) retires; the pill head is CHIP_HEAD byte-exact and the
 *     desk's flex layout rides className extras (the loom's own
 *     contract: layout extras are the desk's voice).
 *   • THE BADGES STAY: the four per-color count badges
 *     (emerald/cyan/amber/purple, the -200/60 washes) stay the desk's
 *     own children — a badge voice, never a lens face.
 *
 * THE WALK-SAFETY LAW: every pin below is a SEALED byte of this round's
 * own edits or an elder seat — no living version literal anywhere in it.
 * THE WORD-FREE LAW: this file names no address-bar token.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const loom = readRepo('src/components/filter-chip.tsx');
const desk = readRepo('src/app/(shell)/tabs/customers-tab.tsx');

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

const allSrc = (): string[] => walkSrc('src', []);

describe('v2.459.0 — the loom learns the tints, fifth weave: the customers desk rides one home', () => {
  it('THE GLASS IDLE joins the loom — byte-exact as the desk kept it', () => {
    expect(loom).toContain(
      "export const CHIP_TINT_IDLE_GLASS =\n  'bg-white/60 text-muted-foreground border-border/50 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10';",
    );
  });

  it('the desk speaks NO glass idle byte — the wardrobe moved, byte-exact, once', () => {
    expect(desk).not.toContain('bg-white/60');
    expect(desk).not.toContain('border-border/50');
  });

  it('THE NAMED UNIFICATION — the drifted emerald retires, the registry byte is the only emerald lens face', () => {
    // the desk's hand-copy spoke text-700 / dark 900/30 / -400 / -700;
    // the family speaks -800 / 950/40 / -200 / -900 (the ACHIEVED goal
    // chip's own face). The copies disagreed; the family's voice wins.
    // (The desk's voucher type-BADGE keeps its own bg-emerald-100 wash —
    // a badge voice, never a lens face; the lens byte carried the
    // text-emerald-700 that the badge never spoke.)
    expect(desk).not.toContain('bg-emerald-100 text-emerald-700');
    expect(loom).toContain(
      "emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900',",
    );
  });

  it('the desk rides the loom — tint, emerald, glass, the flex extras on className', () => {
    expect(desk).toMatch(/<FilterChip\n\s+key=\{chip\.key\}\n\s+active=\{/);
    expect(desk).toContain('variant="tint"');
    expect(desk).toContain('tone="emerald"');
    expect(desk).toMatch(/\n\s+glass\n/);
    expect(desk).toContain('className="inline-flex items-center gap-1.5"');
    // and the desk's raw chip button is gone — no hand-rolled pill head
    expect(desk).not.toContain('inline-flex items-center gap-1.5 px-3 py-1.5');
  });

  it('the active seat keeps its exact arithmetic — the state machine never moved', () => {
    expect(desk).toContain(
      "(chip.key === 'all' && debtFilter === 'all') || (chip.key === 'debt' && debtFilter === 'outstanding')",
    );
  });

  it('the hand-driven voices keep their exact words — the four retirement paths byte-preserved', () => {
    expect(desk).toContain("if (chip.key === 'all') chooseDebtFilter('all');");
    expect(desk).toContain("else if (chip.key === 'debt') chooseDebtFilter('outstanding');");
    expect(desk).toContain("else if (chip.key === 'loyalty') chooseDebtFilter('all'); // loyalty filter not in current state");
  });

  it('THE PRESSED VOICE AND THE RING ARRIVE — the desk adds none of its own', () => {
    // the loom emits both; the desk's chip block carries no hand-rolled
    // aria byte and no ring byte of its own
    expect(loom).toMatch(/aria-pressed=\{active\}/);
    const block = desk.slice(desk.indexOf('<FilterChip\n            key={chip.key}'), desk.indexOf('</FilterChip>'));
    expect(block).not.toContain('aria-pressed');
    expect(block).not.toContain('ring-');
    expect(loom).toMatch(/focusRing === 'none' \? '' : CHIP_RING_ZINC/);
  });

  it('THE BADGES STAY — the per-color count tints remain the desk\'s own children', () => {
    expect(desk).toContain("chip.color === 'emerald' ? 'bg-emerald-200/60 text-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-300' :");
    expect(desk).toContain("chip.color === 'cyan' ? 'bg-cyan-200/60 text-cyan-800 dark:bg-cyan-800/40 dark:text-cyan-300' :");
    expect(desk).toContain("chip.color === 'amber' ? 'bg-amber-200/60 text-amber-800 dark:bg-amber-800/40 dark:text-amber-300' :");
    expect(desk).toContain("'bg-purple-200/60 text-purple-800 dark:bg-purple-800/40 dark:text-purple-300'");
    // the loom speaks none of them — badges are never lens faces
    expect(loom).not.toContain('bg-emerald-200/60');
    expect(loom).not.toContain('bg-cyan-200/60');
  });

  it('the glass branch sits between the active face and the transparent idle', () => {
    expect(loom).toMatch(
      /: glass\n\s+\? CHIP_TINT_IDLE_GLASS\n\s+: CHIP_TINT_IDLE/,
    );
    // and the prop defaults off — the family's transparent idle is the default
    expect(loom).toMatch(/glass = false,/);
  });

  it('the masquerade walk holds — no src file outside the loom speaks the badge-family lens shape', () => {
    const strays = allSrc().filter((p) => {
      if (p === 'src/components/filter-chip.tsx') return false;
      return /'bg-(amber|emerald|rose|slate|sky)-100 text-\1-800 border-\1-300 dark:bg-\1-950\/40/.test(readRepo(p));
    });
    expect(strays).toEqual([]);
  });

  it('the glass idle is ONE home — no src file outside the loom speaks it', () => {
    const carriers = allSrc().filter(
      (p) => p !== 'src/components/filter-chip.tsx' && readRepo(p).includes('bg-white/60 text-muted-foreground'),
    );
    expect(carriers).toEqual([]);
  });

  it('the ledger rows re-key honestly — the fifth weave is dated in the elder suites', () => {
    const loomSuite = readRepo('src/tests/chip-loom-v2455.test.ts');
    // the LEDGER no longer names the customers head byte — the row is taken
    expect(loomSuite).not.toContain("'src/app/(shell)/tabs/customers-tab.tsx', 'inline-flex items-center gap-1.5 px-3 py-1.5");
    expect(loomSuite).toContain('v2.459.0 RE-KEY');
    const goalSuite = readRepo('src/tests/goal-tints-v2457.test.ts');
    expect(goalSuite).toContain('v2.459.0 re-anchor');
    const reviewSuite = readRepo('src/tests/review-tints-v2458.test.ts');
    expect(reviewSuite).toContain('v2.459.0 re-anchor');
  });
});
