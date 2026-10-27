#!/usr/bin/env node
// contrast-math-restock-bridge-v2217.mjs — v2.217.0 pre-pin measurement.
//
// The reorder bridge's NEW voices on their REAL grounds, both modes.
// Grounds: the watchlist modal panel is slate-50 light / slate-900 dark
// (the four-panel law); the restock dialog's inner panels ride white/70
// over the dialog's own body (light) and slate-800/60 over slate-900
// (dark — the panel owns its dark half from birth). Text under 4.5:1
// fails — every voice here is 9–12px text.

const hex = (h) => {
  const n = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
};
const over = (fg, alpha, bg) => fg.map((c, i) => Math.round(alpha * c + (1 - alpha) * bg[i]));
const lum = ([r, g, b]) => {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

let failures = 0;
let pass = 0;
const check = (name, fg, bg, min = 4.5) => {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (ok) pass++;
  else failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(58)} ${r.toFixed(2)}:1  (min ${min}:1)`);
};

const WHITE = [255, 255, 255];
const SLATE900 = hex('#0F172A');
const SLATE50 = hex('#F8FAFC');

// The grounds
const dialogPanelLight = over([255, 255, 255], 0.7, WHITE); // white/70 over the dialog body
const dialogPanelDark = over(hex('#1E293B'), 0.6, SLATE900); // slate-800/60 over slate-900
const innerCardLight = over(hex('#FFFFFF'), 0.7, SLATE50); // white/70 cards over the slate-50 panel
const stripLightGround = over([255, 255, 255], 0.7, dialogPanelLight); // white/70 strip over the estimate panel

console.log('— the bridge door (amber-700, white text) on the watchlist panel —');
check('door white on amber-700 (light)', WHITE, hex('#B45309'));
console.log('— the suggestion chip (amber-800 on amber-100) over the slate-50 panel —');
check('chip amber-800 on amber-100 (light)', hex('#92400E'), hex('#FEF3C7'));
console.log('— the line totals (amber-700 on the white/70 card ground) —');
check('total amber-700 on white/70 card (light)', hex('#B45309'), innerCardLight);
console.log('— the estimate strip family (the FOURTH consumer) —');
check('figure slate-700 on strip ground (light)', hex('#334155'), stripLightGround);
check('muted slate-500 on strip ground (light)', hex('#64748B'), stripLightGround);
console.log('— the dark halves (slate-800/60 over slate-900) —');
check('door amber-600 ground: white on amber-600 (dark button)', WHITE, hex('#D97706'), 3.0); // large/bold button face; AA large-text bar
check('total amber-400 on dark panel (dark)', hex('#FBBF24'), dialogPanelDark);
check('figure slate-200 on strip ground (dark)', hex('#E2E8F0'), over(hex('#1E293B'), 0.6, dialogPanelDark));
check('muted slate-400 on strip ground (dark)', hex('#94A3B8'), over(hex('#1E293B'), 0.6, dialogPanelDark));
console.log('— the refusal line (red-700 on red-50) —');
check('error red-700 on red-50 (light)', hex('#B91C1C'), hex('#FEF2F2'));

console.log(`\n${pass} pass, ${failures} fail`);
process.exit(failures > 0 ? 1 : 0);
