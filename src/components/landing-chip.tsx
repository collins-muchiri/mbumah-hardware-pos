'use client';

// THE LANDING CHIP LOOM (v2.394.0) — the ten full-wardrobe landing chips
// wear ONE component. Every deep-link round since v2.382.0 hand-rolled the
// same button: the same head (`group inline-flex … rounded-full border `),
// the same 300/100/700 light face, the same hover, the same focus ring, the
// same 500/10 dark face, the same Link2 + tabular-nums + X anatomy, the
// same group-hover dismiss detail — byte-identical but for the hue. Ten
// copies is ten places to drift; this loom is the ONE place.
//
// THE WORD-FREE LAW: this file speaks NO lens word. The desks carry their
// own testids, labels, tooltips and dismissal writes as props — the loom
// never learns which desk is speaking, so no collision ledger ever has to
// admit this file.
//
// THE WARDROBE REGISTRY: one greppable string per hue — the EXACT historic
// className tail (everything after the shared head), composed below into
// the byte-identical string each desk wore before the loom. The registry
// is the shade-split's 300 storey, ten families strong (the storey the
// grammar exhausted at v2.393.0 — the loom is how the family stays
// distinct WITHOUT a new storey: one hue, one string, ONE component).
// THE SINGLE-LINE LAW: every entry is ONE line, so a grep for
// `{hue}: 'border-{hue}-300` always finds the whole wardrobe.
import type { ButtonHTMLAttributes } from 'react';
import { Link2, X } from 'lucide-react';

export const LANDING_CHIP_HUES = [
  'sky',
  'purple',
  'cyan',
  'fuchsia',
  'indigo',
  'pink',
  'orange',
  'teal',
  'lime',
  'yellow',
] as const;

export type LandingChipHue = (typeof LANDING_CHIP_HUES)[number];

export const LANDING_CHIP_WARDROBES: Record<LandingChipHue, string> = {
  sky: 'border-sky-300 bg-sky-100 text-sky-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20',
  purple: 'border-purple-300 bg-purple-100 text-purple-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-purple-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20',
  cyan: 'border-cyan-300 bg-cyan-100 text-cyan-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20',
  fuchsia: 'border-fuchsia-300 bg-fuchsia-100 text-fuchsia-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-fuchsia-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:hover:bg-fuchsia-500/20',
  indigo: 'border-indigo-300 bg-indigo-100 text-indigo-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-indigo-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20',
  pink: 'border-pink-300 bg-pink-100 text-pink-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-pink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300 dark:hover:bg-pink-500/20',
  orange: 'border-orange-300 bg-orange-100 text-orange-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20',
  teal: 'border-teal-300 bg-teal-100 text-teal-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-teal-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300 dark:hover:bg-teal-500/20',
  lime: 'border-lime-300 bg-lime-100 text-lime-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-lime-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-300 dark:hover:bg-lime-500/20',
  yellow: 'border-yellow-300 bg-yellow-100 text-yellow-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300 dark:hover:bg-yellow-500/20',
};

// the shared head — every historic chip opened with exactly these bytes
// (the full string is HEAD + WARDROBE, byte for byte)
const CHIP_HEAD = 'group inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border ';

interface LandingChipProps {
  /** the shade-split family this chip wears (the registry key) */
  hue: LandingChipHue;
  /** the rendered word, the desk's own spelling — `landed ?<word>=<value>` */
  label: string;
  /** the desk's dismissal writes — the loom calls it, the desk owns them */
  onDismiss: () => void;
  /** the desk's own tooltip wording */
  title: string;
}

// THE LOOM'S HAND: the button bytes every desk wore, once. `data-testid`
// rides the rest spread (the desks keep their exact handles), so the QA
// walks and the position laws never noticed the move.
export function LandingChip({
  hue,
  label,
  onDismiss,
  title,
  ...rest
}: LandingChipProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onDismiss}
      className={CHIP_HEAD + LANDING_CHIP_WARDROBES[hue]}
      title={title}
      {...rest}
    >
      <Link2 className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="tabular-nums">{label}</span>
      <X
        className="h-3 w-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      />
    </button>
  );
}
