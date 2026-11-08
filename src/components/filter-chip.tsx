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
 * THE WORD-FREE LAW: the loom speaks no address-bar token — no collision
 * ledger ever has to admit this file.
 * THE MASQUERADE LAW, LOOM FORM: a loomed desk speaks NO wardrobe byte —
 * the active and idle faces live in exactly ONE src file (this loom).
 */

import React from 'react';

const CHIP_HEAD = 'px-3 py-1.5 rounded-full text-xs font-medium border transition-all';
const CHIP_HEAD_COMPACT = 'px-3 py-1 rounded-full text-xs font-medium border transition-all';
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
  disabled?: boolean;
  /** The status lenses' color word — picks the face pair from the TONE
   * REGISTRY (the second weave). When set, the primary/muted faces yield. */
  tone?: string;
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
  disabled,
  tone,
}: FilterChipProps) {
  const face = tone
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
      className={`${compact ? CHIP_HEAD_COMPACT : CHIP_HEAD}${focusRing === 'none' ? '' : CHIP_RING_ZINC} ${face}${className ? ` ${className}` : ''}`}
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
