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
}: FilterChipProps) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-label={ariaLabel}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`${compact ? CHIP_HEAD_COMPACT : CHIP_HEAD}${focusRing === 'none' ? '' : CHIP_RING_ZINC} ${active ? CHIP_ACTIVE : CHIP_IDLE}${className ? ` ${className}` : ''}`}
    >
      {children}
    </button>
  );
}
