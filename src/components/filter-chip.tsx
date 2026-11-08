'use client';

/**
 * THE FILTER CHIP — the elder lens chips' shared wardrobe (v2.455.0, the
 * elder loom's first weave).
 *
 * The elder lens chips predate the landing chips (v2.394.0's LandingChip
 * loomed the deep-link chips; the lens-filter chips stayed hand-rolled).
 * Since the earliest desks the same button has been re-typed by hand —
 * byte-identical but for its words: the muted/50 idle face, the primary
 * active face, the pill head. This loom owns that wardrobe:
 *
 *   • ONE head (the pill: `px-3 py-1.5 rounded-full text-xs font-medium
 *     border transition-all`)
 *   • ONE active face (`bg-primary text-primary-foreground border-primary
 *     shadow-sm`) and ONE idle face (`bg-muted/50 text-muted-foreground
 *     border-border hover:bg-muted hover:text-foreground`)
 *   • ONE pressed voice (`aria-pressed`) — the debt-plans desk already
 *     spoke it; every chip speaks it now
 *   • ONE keyboard ring (the family's zinc: `focus-visible:outline-none
 *     focus-visible:ring-2 focus-visible:ring-zinc-400
 *     focus-visible:ring-offset-1`) — the faces that never wore a ring
 *     gain it here; a desk whose face carries its OWN named ring voice
 *     (the payment violet) passes `focusRing="none"` so the loom emits
 *     no competing ring and the desk's voice rides `className` alone
 *     (two ring colours in one class list would resolve in the
 *     stylesheet's order, not the attribute's — the loom refuses that
 *     coin flip)
 *
 * The desks keep their own words, icons, counts, handlers and testids —
 * they ride props and children. The loom never learns which desk is
 * speaking.
 *
 * THE TONE REGISTRY (v2.456.0, the elder loom's second weave): the
 * registry-driven desks — the debt-plans status lens and the exports
 * history's status lens — carried the same color palette in TWO
 * hand-copied Record constants (active and idle per color, the dark:
 * variants riding the idle faces). The palette lives here now, ONE
 * home: pass `tone` and the loom picks the face pair for that color.
 * The registry's ACTIVE face speaks the shadowed voice family-wide —
 * the debt-plans desk's historic face carried `shadow-sm`, the exports
 * desk's did not, and the family's own primary active face already
 * lifts, so the shadow rides every tone (a named, deliberate
 * improvement — the one byte the two registries disagreed on, resolved
 * FOR the lift, not against it). The zinc tone (the cancelled chip's
 * voice) rides the same registry.
 * THE COUNT BADGE (v2.456.0): the two desks rendered byte-identical
 * count badges — the companion `FilterChipCount` owns that wardrobe
 * too, so the badge's face lives once beside the chip's.
 *
 * THE TINT REGISTRY (v2.457.0, the elder loom's third weave): the goal
 * chips — the HR performance desk's filter row, its edit switch, and
 * the self-service portal's My-goals row — speak a SECOND color
 * dialect: the badge-family tints (light wash active, transparent
 * idle) rather than the solid lens faces. Three desks hand-copied
 * that palette in THREE Record constants, and the copies had already
 * drifted — the portal's OPEN chip still wore the old sky pressed-state
 * the console's one-colour law (v2.306.0) retired from the console
 * desk: the same word wore a second colour one bundle away. The tint
 * palette lives here now, ONE home: pass `variant="tint"` and a tone
 * word, and the loom picks the face pair. The tint idle face is
 * tone-independent (the transparent voice all three desks already
 * shared). The desks keep only their WORDS — which status wears which
 * family — never the wardrobe bytes.
 * THE SLIM HEAD (v2.457.0): the goal chips' historic size (`px-2.5
 * py-0.5`, `transition-colors`) joins the loom's head family beside
 * the regular and compact faces — a desk's size is its own voice, so
 * it rides a prop, not a hand-rolled className.
 *
 * THE GLASS IDLE (v2.459.0, the elder loom's fifth weave): the
 * customers desk's quick chips — the ledger's LAST named tint dialect
 * — ride the registry now. Their active face unifies to the registry's
 * emerald byte (the desk's hand-copy had drifted: text-700 where the
 * family speaks -800, dark 900/30 and -400/-700 where the family
 * speaks 950/40 and -200/-900 — the same one-byte disagreement the
 * second weave resolved FOR the family with the shadow-sm lift), and
 * their idle keeps the desk's own backdrop voice: a GLASSY white wash
 * for chips that sit on gradient card faces, where the transparent
 * tint idle would show the card through. A desk's backdrop is its own
 * voice, so it rides a prop (`glass`) beside the slim head — the
 * badge-family tints that hang inside the chips (emerald/cyan/amber/
 * purple count badges) stay the desk's own children, a badge voice,
 * never a lens face.
 *
 * THE WORD-FREE LAW: the loom speaks no address-bar token — no collision
 * ledger ever has to admit this file.
 * THE MASQUERADE LAW, LOOM FORM: a loomed desk speaks NO wardrobe byte —
 * the active and idle faces live in exactly ONE src file (this loom).
 */

import React from 'react';

const CHIP_HEAD = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-all';
const CHIP_HEAD_COMPACT = 'px-3 py-1 rounded-full text-xs font-medium border transition-all';
const CHIP_HEAD_SLIM = 'px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors';
const CHIP_RING_ZINC =
  ' focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-1';
const CHIP_ACTIVE = 'bg-primary text-primary-foreground border-primary shadow-sm';
const CHIP_IDLE =
  'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground';

// The TONE REGISTRY — one home for the status lenses' color palette
// (v2.456.0, the second weave). Statically declared so Tailwind can
// find every class. The active face speaks the shadowed voice
// family-wide (the debt-plans desk's historic voice, adopted).
export const CHIP_TONE_ACTIVE: Record<string, string> = {
  emerald: 'bg-emerald-700 text-white border-emerald-700 shadow-sm',
  green: 'bg-green-500 text-white border-green-600 shadow-sm',
  rose: 'bg-rose-500 text-white border-rose-600 shadow-sm',
  amber: 'bg-amber-500 text-white border-amber-600 shadow-sm',
  zinc: 'bg-zinc-600 text-white border-zinc-600 shadow-sm',
};

export const CHIP_TONE_IDLE: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900',
  green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900',
  rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900',
  zinc: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900/40 dark:text-zinc-300 dark:border-zinc-700',
};

// THE TINT REGISTRY (v2.457.0, the third weave) — one home for the goal
// chips' badge-family palette. Statically declared so Tailwind can find
// every class. The tint idle face is ONE voice (the transparent idle all
// three goal desks already shared) — tone-independent by design.
// v2.458.0 (the fourth weave): SKY joins the closed registry — the
// review chips' ACKNOWLEDGED word wears it (the review table pill's own
// law already aligned: acknowledged wears sky family-wide), and the
// performance desk's filter row rides the registry with the rest.
export const CHIP_TINT_ACTIVE: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900',
  rose: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900',
  slate: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600',
  sky: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-900',
};

export const CHIP_TINT_IDLE =
  'border-border bg-transparent text-muted-foreground hover:bg-muted/60';

// THE GLASS IDLE (v2.459.0, the fifth weave) — the customers desk's
// historic idle voice, byte-exact as the desk kept it: a glassy wash
// for chips sitting on gradient card faces. Rides only with
// variant="tint", through the `glass` prop.
export const CHIP_TINT_IDLE_GLASS =
  'bg-white/60 text-muted-foreground border-border/50 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10';

export interface FilterChipProps {
  /** Whether this chip is the lens's live choice (drives the face and aria-pressed). */
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** The desk's own handle, when one carries a deep-link word. */
  testId?: string;
  /** The desk's own aria-label, when the label needs a longer voice. */
  ariaLabel?: string;
  /** The desk's own class extras (layout, its named ring voice). */
  className?: string;
  /** `"none"` when the desk's className carries its own ring voice. */
  focusRing?: 'zinc' | 'none';
  /** The compact face (`py-1`) — the chart-type chips' historic size. */
  compact?: boolean;
  /** The slim face (`px-2.5 py-0.5`) — the goal chips' historic size
   * (v2.457.0). Wins over `compact` when both ride. */
  slim?: boolean;
  disabled?: boolean;
  /** The status lenses' color word — picks the face pair from the TONE
   * REGISTRY (the second weave). When set, the primary/muted faces yield. */
  tone?: string;
  /** The color dialect: `"solid"` (default) reads the TONE REGISTRY's
   * solid lens faces; `"tint"` (v2.457.0) reads the TINT REGISTRY's
   * badge-family faces with the transparent idle. */
  variant?: 'solid' | 'tint';
  /** The glassy tint idle (v2.459.0) — the customers desk's backdrop
   * voice, for chips on gradient card faces. Only rides with
   * `variant="tint"`; the transparent idle stays the family default. */
  glass?: boolean;
}

export function FilterChip({
  active,
  onClick,
  children,
  testId,
  ariaLabel,
  className,
  focusRing = 'zinc',
  compact = false,
  slim = false,
  disabled,
  tone,
  variant = 'solid',
  glass = false,
}: FilterChipProps) {
  const face =
    variant === 'tint'
      ? active
        ? (CHIP_TINT_ACTIVE[tone ?? ''] ?? CHIP_ACTIVE)
        : glass
          ? CHIP_TINT_IDLE_GLASS
          : CHIP_TINT_IDLE
      : tone
        ? active
          ? (CHIP_TONE_ACTIVE[tone] ?? CHIP_ACTIVE)
          : (CHIP_TONE_IDLE[tone] ?? CHIP_IDLE)
        : active
          ? CHIP_ACTIVE
          : CHIP_IDLE;
  return (
    <button
      type="button"
      data-testid={testId}
      aria-label={ariaLabel}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`${slim ? CHIP_HEAD_SLIM : compact ? CHIP_HEAD_COMPACT : CHIP_HEAD}${focusRing === 'none' ? '' : CHIP_RING_ZINC} ${face}${className ? ` ${className}` : ''}`}
    >
      {children}
    </button>
  );
}

/**
 * THE COUNT BADGE — the lens chips' count companion (v2.456.0). The
 * debt-plans and exports desks rendered byte-identical badges beside
 * their labels; the wardrobe lives here now, once.
 */
export function FilterChipCount({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-semibold ${
        active ? 'bg-white/20 text-white' : 'bg-background text-muted-foreground'
      }`}
    >
      {children}
    </span>
  );
}
