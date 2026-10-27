#!/usr/bin/env node
// contrast-math-experts-chips-v2215.mjs — v2.215.0 pre-pin measurement.
//
// THE EXPERTS-TABLE CHIP SWEEP (carried since v2.199.0 — the worklog's
// "a systematic audit of every remaining EXPERTS-table chip with the
// committed script as template may still hide 4.3–4.4:1 stragglers").
//
// THE DISCOVERY THIS SCRIPT RECORDS (numbers from the INSTALLED Tailwind
// theme, measured bottom-up over the real paint stacks):
//   1. HONEST CORRECTION (the v2.199 Store-Matrix lesson repeating): with
//      the INSTALLED oklch palette the pre-fix EXPERTS badges measure
//      ABOVE the bar on their real grounds — red-600 on white 4.76:1,
//      red-600 on slate-50 4.55:1, amber-700 on white 5.05:1, amber-700
//      on slate-50 4.82:1. The sweep is therefore a CONSISTENCY re-voice,
//      NOT a violation fix: the house lifted its hot REAL text to red-700
//      in v2.159 and armored its amber chip text wherever a tinted worst
//      case could reach it; the EXPERTS surface (severity, bucket,
//      OVERDUE, mpesa status, pctColor) was the last holdout. Recorded
//      honestly: pre-fix states pass here — but red-600 sits 0.05 above
//      the bar on slate-50 and DROWNED on the red-50 chip grounds of the
//      v2.198 pairing (the ghost that explains why the family fled
//      red-600); the armored voices buy 6.1–7.1:1 of headroom so no
//      future tinted ground can sink them.
//   2. the unchanged passers are RECORDED (the audit's other half, like
//      v2.199's mover family): the health checks' emerald-700/amber-700/
//      red-700 triad, the env badges' emerald-700/red-700, the INFO
//      slate-500 voice, the Tile tones — all on the section's white
//      ground.
// The recipe (docs/a11y/contrast-math.md): oklch → sRGB first, composite
// the real paint stack bottom-up, WCAG ratio vs 4.5:1 for text (the
// badges' 10px text is small text — bold does not buy the 3:1 bar).
// The borders (red-200/amber-200) follow the v2.198 law: DECORATION —
// the badge text carries the severity AND the same word appears in the
// row's message column, so the ring is exempt and deliberately NOT
// asserted here.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// ── source-of-record assertions (if these drift, the numbers below are
// measuring a ghost) ────────────────────────────────────────────────────
const expertsSrc = readFileSync(join(process.cwd(), 'src/components/org/experts.tsx'), 'utf8');

// The fixed severity badge line (v2.215.0).
if (!expertsSrc.includes("'border-red-200 text-red-700'")) throw new Error('the ERROR badge fix drifted — re-derive');
if (!expertsSrc.includes("'border-amber-200 text-amber-800'")) throw new Error('the WARN badge fix drifted — re-derive');
if (expertsSrc.includes('border-red-200 text-red-600')) throw new Error('the old red-600 ERROR badge still speaks — re-derive');
if (expertsSrc.includes('border-amber-200 text-amber-700')) throw new Error('the old amber-700 WARN badge still speaks — re-derive');
// The FULL sweep (the systematic audit the v2.199 backlog asked for): the
// credit-control bucket/status badges, the mpesa status badge, and the
// pctColor helper ALL join the armored family — the quoted class token
// 'text-red-600' is GONE from the whole EXPERTS surface (prose mentions
// in comments are not classes; the quoted form is the class's own name).
if (expertsSrc.includes("'text-red-600'")) throw new Error('a red-600 straggler still speaks in the EXPERTS surface — re-derive');
if (!expertsSrc.includes("c.bucket === 'DAYS_90_PLUS' ? 'border-red-200 text-red-700'")) throw new Error('the bucket badge fix drifted');
if (!expertsSrc.includes("c.status === 'OVERDUE' ? 'border-red-200 text-red-700'")) throw new Error('the OVERDUE badge fix drifted');
if (!expertsSrc.includes("? 'border-amber-200 text-amber-800' : 'border-red-200 text-red-700'")) throw new Error('the mpesa badge fix drifted');
if (!expertsSrc.includes("'text-emerald-700' : v >= 70 ? 'text-amber-700' : 'text-red-700'")) throw new Error('the pctColor fix drifted');
// The unchanged passers stay exactly where they were.
if (!expertsSrc.includes("'text-emerald-700' : checks[key]?.status === 'warning' ? 'text-amber-700' : 'text-red-700'")) throw new Error('the health triad drifted');
if (!expertsSrc.includes("value.status === 'ok' ? 'text-emerald-700' : 'text-red-700'")) throw new Error('the env badge voices drifted');

// ── the installed palette ───────────────────────────────────────────────
const theme = readFileSync(join(process.cwd(), 'node_modules/tailwindcss/theme.css'), 'utf8');
const token = (name) => {
  const m = theme.match(new RegExp(`--color-${name}: oklch\\(([\\d.]+)% ([\\d.]+) ([\\d.]+)\\)`));
  if (m) return oklchToSrgb(parseFloat(m[1]) / 100, parseFloat(m[2]), parseFloat(m[3]));
  const hex = theme.match(new RegExp(`--color-${name}: (#(?:[0-9a-f]{3}|[0-9a-f]{6}))\\b`));
  if (hex) return hexToSrgb(hex[1]);
  throw new Error(`token --color-${name} not found in theme.css`);
};
const hexToSrgb = (h) => {
  const s = h.length === 4 ? h.slice(1).split('').map((c) => c + c).join('') : h.slice(1);
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255);
};

function oklchToSrgb(L, C, Hdeg) {
  const hr = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  const lin = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
  return [lin(lr), lin(lg), lin(lb)].map((v) => Math.min(1, Math.max(0, v)));
}
const lum = (rgb) => {
  const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
};
const ratio = (a, b) => {
  const [x, y] = lum(a) > lum(b) ? [a, b] : [b, a];
  return (lum(x) + 0.05) / (lum(y) + 0.05);
};

// ── the grounds ─────────────────────────────────────────────────────────
// The ExpertModules section paints bg-white (opaque); the outline badges
// are transparent → the text's real ground is the section's white. The
// slate-50 contexts (the TabsList strip, the dashed empty states) are
// recorded as the WORST-CASE tinted ground for the same voices.
const WHITE = [1, 1, 1];
const SLATE50 = token('slate-50');

let pass = 0, fail = 0;
const check = (label, fg, bg, need = 4.5) => {
  const r = ratio(fg, bg);
  const ok = r >= need;
  if (ok) pass++; else fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(58)} ${r.toFixed(2)}:1  (min ${need}:1)`);
};
const checkBug = (label, fg, bg, max = 4.5) => {
  const r = ratio(fg, bg);
  const ok = r < max;
  if (ok) pass++; else fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(58)} ${r.toFixed(2)}:1  (the pre-fix state, must stay under ${max}:1)`);
};

console.log('── the sweep: the Audit severity badges (family re-voice, honestly recorded) ──');
check('ERROR badge: red-700 on white (fixed)', token('red-700'), WHITE);
check('  worst case: red-700 on slate-50 (fixed)', token('red-700'), SLATE50);
check('  pre-fix: red-600 on white (RECORDED: above the bar — family re-voice)', token('red-600'), WHITE);
check('  pre-fix: red-600 on slate-50 (RECORDED: knife-edge, 0.05 above)', token('red-600'), SLATE50);
checkBug('  the ghost that fled: red-600 on red-50 (the v2.198 pairing, under)', token('red-600'), token('red-50'));
check('WARN badge: amber-800 on white (fixed)', token('amber-800'), WHITE);
check('  worst case: amber-800 on slate-50 (fixed)', token('amber-800'), SLATE50);
check('  pre-fix: amber-700 on slate-50 (RECORDED: above the bar — family re-voice)', token('amber-700'), SLATE50);

console.log('── the recorded passers (the audit\'s other half — unchanged) ──');
check('WARN badge on white (pre-fix state, honestly above the bar)', token('amber-700'), WHITE);
check('health ok: emerald-700 on white', token('emerald-700'), WHITE);
check('health warn: amber-700 on white', token('amber-700'), WHITE);
check('health fail: red-700 on white', token('red-700'), WHITE);
check('env ok: emerald-700 on white', token('emerald-700'), WHITE);
check('env fail: red-700 on white', token('red-700'), WHITE);
check('INFO badge: slate-500 on white', token('slate-500'), WHITE);
check('Tile hot: amber-700 on white (Tile tone)', token('amber-700'), WHITE);
check('Tile good: emerald-700 on white (Tile tone)', token('emerald-700'), WHITE);

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
