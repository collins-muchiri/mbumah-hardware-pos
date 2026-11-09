'use client';

// THE LANDING CHIP LOOM (v2.394.0; the elder storey joined v2.397.0) —
// the landing chips wear ONE component. Every deep-link round since
// v2.382.0 hand-rolled the same button: the same head (`group inline-flex
// … rounded-full border `), the same light face, the same hover, the same
// focus ring, the same dark face, the same Link2 + tabular-nums + X
// anatomy, the same group-hover dismiss detail — byte-identical but for
// the hue. Ten copies at v2.393.0 became this loom; by v2.396.0 the
// census counted 42 elder chips in 18 more desks wearing the SAME
// anatomy at the 200/50 storey (compact/standard/quiet heads), and
// v2.397.0 looms them too. 59 faces, ONE component, TWO storeys,
// THREE heads.
//
// THE WORD-FREE LAW: this file speaks NO lens word. The desks carry their
// own testids, labels, tooltips and dismissal writes via props — the loom
// never learns which desk is speaking, so no collision ledger ever has to
// admit this file.
//
// THE WARDROBE REGISTRIES: one greppable string per hue per storey — the
// EXACT historic className tail (everything after the shared head),
// composed below into the byte-identical string each desk wore before the
// loom. The 300 registry is the shade-split's 300 storey, ten families
// strong; the 200 registry is the elder storey (the grammar's own first
// hundred-storey), twenty-two families strong — THE EXCLUDED ONE:
// ly-window's amber-600/30 + amber-950 face is an off-union row and stays
// hand-rolled in its desk (the exports PAYROLL exclusion's sibling).
// THE SINGLE-LINE LAW: every entry is ONE line, so a grep for
// `{hue}: 'border-{hue}-{storey}` always finds the whole wardrobe.
import type { ButtonHTMLAttributes } from 'react';
import { Link2, X } from 'lucide-react';

// v2.462.0: rose joins the 300 storey — the dead-stock window's word. The
// shade-split law's next form: rose already spoke at the 200/50 storey
// (the customers desk's word), and a hue may speak twice only through a
// DIFFERENT storey — a family byte the 200-storey can never equal.
// v2.480.0: amber joins the 300 storey — the search lens's word (the
// ledger's own name lens). The lens family's OWN tone (the window chips'
// tint word, the view voice's ground) speaking through a hue that never
// spoke at this storey — the family grew one line rather than masquerade
// (the exact 300-trio census was kept: no src file wore the amber trio).
// v2.481.0: emerald joins the 300 storey — the sort door's word (the
// ledger's own order). The ledger's own green (the suppliers' hue at the
// 200/50 storey, the branch ledger's copy family) speaking through a
// storey it never spoke — the shade-split law's next form, the family
// grew one line rather than masquerade (the exact emerald 300-trio
// census was machine-kept: no src file wore the trio before this line).
// v2.482.0: violet joins the 300 storey — the range's own word (the
// reports desk's time lens). The transactions payment lens's hue at the
// 200/50 storey speaking through a storey it never spoke — the
// shade-split law's next form, the family grew one line rather than
// masquerade (the exact violet 300-trio census was machine-kept: no src
// file wore the trio before this line).
// v2.484.0: blue joins the 300 storey — the people window's word (the
// HR desk's period). The transfers ledger's chip hue at the 200/50
// storey speaking through a storey it never spoke — the shade-split
// law's next form; blue LEFT the stranger list (the family grew, the
// guard stays honest).
// v2.485.0: green joins the 300 storey — the ledger's period word (the
// financial desk's window). The loyalty desk's chip hue at the 200/50
// storey speaking through a storey it never spoke — the shade-split
// law's next form; green LEFT the stranger list (the family grew, the
// guard stays honest; the exact green 300-trio census was machine-kept:
// no src file wore the trio before this line).
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
  'rose',
  'amber',
  'emerald',
  'violet',
  // v2.484.0: blue's promotion — the people window's word (the HR
  // desk's period); the transfers desk's 200-storey hue one storey
  // deeper (the shade-split law's next form).
  'blue',
  // v2.485.0: green's promotion — the ledger's period word (the
  // financial desk's window); the loyalty desk's 200-storey hue one
  // storey deeper (the shade-split law's next form).
  'green',
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
  rose: 'border-rose-300 bg-rose-100 text-rose-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20',
  // v2.480.0: amber's line — the search lens's word (the SINGLE-LINE law:
  // one entry, one line, the grep finds the whole wardrobe).
  amber: 'border-amber-300 bg-amber-100 text-amber-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20',
  // v2.481.0: emerald's line — the sort door's word (the SINGLE-LINE law:
  // one entry, one line, the grep finds the whole wardrobe).
  emerald: 'border-emerald-300 bg-emerald-100 text-emerald-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20',
  // v2.482.0: violet's line — the range's own word (the SINGLE-LINE law:
  // one entry, one line, the grep finds the whole wardrobe).
  violet: 'border-violet-300 bg-violet-100 text-violet-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20',
  // v2.484.0: blue's line — the people window's word (the SINGLE-LINE
  // law: one entry, one line, the grep finds the whole wardrobe).
  blue: 'border-blue-300 bg-blue-100 text-blue-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20',
  // v2.485.0: green's line — the ledger's period word (the SINGLE-LINE
  // law: one entry, one line, the grep finds the whole wardrobe).
  green: 'border-green-300 bg-green-100 text-green-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-green-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20',
};

// THE ELDER STOREY (v2.397.0): the 200/50 registry — the census's 22
// loomable elder faces, one hue each. The heads differ (compact/standard/
// quiet — see the head map below); the tail is the ONE parametric formula
// (border-{hue}-200 / bg-{hue}-50 / text-{hue}-700, hover:bg-{hue}-100,
// ring-{hue}-400, dark 500/30 + 500/10 + 300 + 500/20) every elder desk
// already spoke.
export const LANDING_CHIP_HUES_200 = [
  'neutral',
  'purple',
  'slate',
  'zinc',
  'gray',
  'yellow',
  'sky',
  'red',
  'lime',
  'teal',
  'green',
  'stone',
  'orange',
  'blue',
  'rose',
  'amber',
  'indigo',
  'emerald',
  'cyan',
  'violet',
  'fuchsia',
  'pink',
] as const;

export type LandingChipHue200 = (typeof LANDING_CHIP_HUES_200)[number];

export const LANDING_CHIP_WARDROBES_200: Record<LandingChipHue200, string> = {
  neutral: 'border-neutral-200 bg-neutral-50 text-neutral-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:border-neutral-500/30 dark:bg-neutral-500/10 dark:text-neutral-300 dark:hover:bg-neutral-500/20',
  purple: 'border-purple-200 bg-purple-50 text-purple-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-purple-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300 dark:hover:bg-purple-500/20',
  slate: 'border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300 dark:hover:bg-slate-500/20',
  zinc: 'border-zinc-200 bg-zinc-50 text-zinc-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-500/30 dark:bg-zinc-500/10 dark:text-zinc-300 dark:hover:bg-zinc-500/20',
  gray: 'border-gray-200 bg-gray-50 text-gray-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:border-gray-500/30 dark:bg-gray-500/10 dark:text-gray-300 dark:hover:bg-gray-500/20',
  yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-yellow-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300 dark:hover:bg-yellow-500/20',
  sky: 'border-sky-200 bg-sky-50 text-sky-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20',
  red: 'border-red-200 bg-red-50 text-red-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20',
  lime: 'border-lime-200 bg-lime-50 text-lime-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-lime-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 dark:border-lime-500/30 dark:bg-lime-500/10 dark:text-lime-300 dark:hover:bg-lime-500/20',
  teal: 'border-teal-200 bg-teal-50 text-teal-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300 dark:hover:bg-teal-500/20',
  green: 'border-green-200 bg-green-50 text-green-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20',
  stone: 'border-stone-200 bg-stone-50 text-stone-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:border-stone-500/30 dark:bg-stone-500/10 dark:text-stone-300 dark:hover:bg-stone-500/20',
  orange: 'border-orange-200 bg-orange-50 text-orange-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/20',
  blue: 'border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20',
  rose: 'border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20',
  amber: 'border-amber-200 bg-amber-50 text-amber-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20',
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300 dark:hover:bg-cyan-500/20',
  violet: 'border-violet-200 bg-violet-50 text-violet-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20',
  fuchsia: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-fuchsia-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:hover:bg-fuchsia-500/20',
  pink: 'border-pink-200 bg-pink-50 text-pink-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-pink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300 dark:hover:bg-pink-500/20',
};

// THE (HUE, STOREY) REGISTRY, PROPER (v2.481.0 — the seventh weave): the
// two wardrobes were always ONE parametric formula — the 300 storey
// speaks border-300/bg-100/hover-200, the 200 storey speaks
// border-200/bg-50/hover-100, and both share the text-700, the ring-400
// and the dark 500/30 + 500/10 + 300 + 500/20 tail. The weave names the
// formula, ties the two hue arrays into ONE registry, and ENFORCES the
// storey line: a hue that never spoke at a storey throws honestly (the
// amber lesson — the family grows a line rather than masquerade — now a
// guard, not just a greppable habit). The literal single-line registries
// above stay the constitution (the loom suite's byte-fidelity pins read
// them); the formula is PROVEN against every line they speak, byte for
// byte, in the round's own suite.
export const LANDING_CHIP_STOREYS = [300, 200] as const;

export type LandingChipStorey = (typeof LANDING_CHIP_STOREYS)[number];

// THE REGISTRY — one table, two storeys: every (hue, storey) voice the
// loom can wear, read from the two arrays above (one source of truth;
// the arrays stay the spelling, the record stays the door).
export const LANDING_CHIP_REGISTRY: Record<
  LandingChipStorey,
  readonly string[]
> = {
  300: LANDING_CHIP_HUES,
  200: LANDING_CHIP_HUES_200,
};

// THE STOREY'S OWN STEPS — the shade arithmetic each storey speaks (the
// formula's only free variables; everything else is the shared tail).
const LANDING_CHIP_STEPS: Record<
  LandingChipStorey,
  { border: number; bg: number; hover: number }
> = {
  300: { border: 300, bg: 100, hover: 200 },
  200: { border: 200, bg: 50, hover: 100 },
};

// THE STOREY LINE'S PREDICATE — does this hue speak at this storey? The
// registry's honest door: the 200-only hues answer false at the 300
// storey, and every hue that ever grew a line answers true at both of
// its own.
export function landingChipSpeaksAt(
  hue: string,
  storey: LandingChipStorey,
): boolean {
  return LANDING_CHIP_REGISTRY[storey].includes(hue);
}

// THE FORMULA — the tail both wardrobes speak, composed from the steps.
// Byte-fidelity is the suite's law: this function must reproduce every
// literal line above, byte for byte, for every hue that speaks at the
// storey — and THROW for a hue that never spoke there (the registry's
// own guard: no undefined wardrobe, no masquerade).
export function landingChipWardrobe(
  hue: LandingChipHue | LandingChipHue200,
  storey: LandingChipStorey,
): string {
  if (!landingChipSpeaksAt(hue, storey)) {
    throw new Error(`the ${hue} hue never spoke at the ${storey} storey`);
  }
  const steps = LANDING_CHIP_STEPS[storey];
  return `border-${hue}-${steps.border} bg-${hue}-${steps.bg} text-${hue}-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-${hue}-${steps.hover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-${hue}-400 dark:border-${hue}-500/30 dark:bg-${hue}-500/10 dark:text-${hue}-300 dark:hover:bg-${hue}-500/20`;
}

// THE THREE HEADS — every historic chip opened with exactly these bytes
// (the full string is HEAD + WARDROBE, byte for byte):
//   standard — the ten full-wardrobe chips and the elder eleven
//   compact  — the elder five (one gap smaller, one height step down)
//   quiet    — the elder six (no group class, so the group-hover dismiss
//              detail never fires — the census's honest face: those desks
//              wore their chips exactly that way)
const CHIP_HEAD = 'group inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border ';
const CHIP_HEAD_COMPACT = 'group inline-flex items-center gap-1 h-6 px-2 rounded-full border ';
const CHIP_HEAD_QUIET = 'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border ';

export type LandingChipVariant = 'standard' | 'compact' | 'quiet';

interface LandingChipBase {
  /** the rendered word, the desk's own spelling — `landed ?<word>=<value>` */
  label: string;
  /** the desk's dismissal writes — the loom calls it, the desk owns them */
  onDismiss: () => void;
  /** the desk's own tooltip wording */
  title: string;
  /** the head (and the dismiss detail) — default standard */
  variant?: LandingChipVariant;
}

// THE DISCRIMINATED STOREY: no storey prop = the 300 storey (the ten
// full-wardrobe hues); `storey={200}` = the elder storey (the 22 elder
// hues). The narrowing is total — no cast anywhere in this file.
export type LandingChipProps = LandingChipBase &
  (
    | { storey?: undefined; hue: LandingChipHue }
    | { storey: 200; hue: LandingChipHue200 }
  );

// THE LOOM'S HAND: the button bytes every desk wore, once. `data-testid`
// rides the rest spread (the desks keep their exact handles), so the QA
// walks and the position laws never noticed the move.
export function LandingChip(props: LandingChipProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { label, onDismiss, title } = props;
  const variant = props.variant ?? 'standard';
  const head =
    variant === 'compact'
      ? CHIP_HEAD_COMPACT
      : variant === 'quiet'
        ? CHIP_HEAD_QUIET
        : CHIP_HEAD;
  // the discriminated narrowing: storey === 200 narrows hue with it —
  // no cast anywhere in this file
  const tail =
    props.storey === 200
      ? LANDING_CHIP_WARDROBES_200[props.hue]
      : LANDING_CHIP_WARDROBES[props.hue];
  const {
    variant: _variant,
    storey: _storey,
    hue: _hue,
    label: _label,
    onDismiss: _onDismiss,
    title: _title,
    ...rest
  } = props;
  return (
    <button
      type="button"
      onClick={onDismiss}
      className={head + tail}
      title={title}
      {...rest}
    >
      <Link2 className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="tabular-nums">{label}</span>
      <X
        className={
          variant === 'quiet'
            ? 'h-3 w-3 shrink-0 opacity-60'
            : 'h-3 w-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100'
        }
        aria-hidden="true"
      />
    </button>
  );
}
