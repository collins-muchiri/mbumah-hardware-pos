#!/usr/bin/env node
// contrast-math-security-posture-v2213.mjs — v2.213.0 pre-pin measurement.
//
// Measures EVERY new voice the security posture card speaks, on its REAL
// grounds, in BOTH modes, BEFORE the literals are pinned by the test suite:
//
//   light ground  = the card's white (bg-card over background, #FFFFFF)
//   dark ground   = slate-900 #0F172A (the six-panel dark-half law)
//
// Text under 4.5:1 fails. The chips are 10-11px text — they meet the SAME
// 4.5 bar as every other small voice in the product.
//
//   light chips:  emerald-700 / red-700 / amber-700 / slate-600 on their
//                 -100 fills; header slate-900; body slate-500; footer slate-500
//   dark chips:   emerald-400 / red-400 / amber-400 / slate-300 on the
//                 -950/60 composites over slate-900; header slate-100;
//                 body slate-400; footer slate-400

const WHITE = [255, 255, 255];
const SLATE900 = [15, 23, 42];

const hex = (h) => {
  const n = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
};

/** Composite `fg` at alpha over `bg`, channel-wise. */
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

console.log('— light card (white ground) —');
check('header slate-900 on white', hex('#0F172A'), WHITE);
check('body/meta slate-500 on white', hex('#64748B'), WHITE);
check('detail slate-500 on white', hex('#64748B'), WHITE);
check('chip emerald-700 on emerald-100', hex('#047857'), hex('#D1FAE5'));
check('chip red-700 on red-100', hex('#B91C1C'), hex('#FEE2E2'));
check('chip amber-700 on amber-100', hex('#B45309'), hex('#FEF3C7'));
check('chip slate-600 on slate-100 (dev-open)', hex('#475569'), hex('#F1F5F9'));

console.log('— dark card (slate-900 ground, the six-panel law) —');
check('header slate-100 on slate-900', hex('#F1F5F9'), SLATE900);
check('body/meta slate-400 on slate-900', hex('#94A3B8'), SLATE900);
check('chip emerald-400 on emerald-950/60→slate-900', hex('#34D399'), over(hex('#022C22'), 0.6, SLATE900));
check('chip red-400 on red-950/60→slate-900', hex('#F87171'), over(hex('#450A0A'), 0.6, SLATE900));
check('chip amber-400 on amber-950/60→slate-900', hex('#FBBF24'), over(hex('#451A03'), 0.6, SLATE900));
check('chip slate-300 on slate-800 (dev-open)', hex('#CBD5E1'), hex('#1E293B'));

console.log(`\n${pass} pass, ${failures} fail`);
process.exit(failures > 0 ? 1 : 0);
