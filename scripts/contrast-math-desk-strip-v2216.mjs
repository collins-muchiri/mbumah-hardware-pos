#!/usr/bin/env node
// contrast-math-desk-strip-v2216.mjs — v2.216.0 pre-pin measurement.
//
// The org desk's indicative strip (the THIRD consumer) on its REAL
// grounds, both modes. The desk slice modal's PANEL_CLS grounds differ
// from the kpi-row panels': light = white/70 composited over the modal's
// own WHITE body; dark = slate-800/60 composited over the panel's
// slate-900 (the seven-panel dark-half law). Text under 4.5:1 fails —
// the strip is 10px text.

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
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(56)} ${r.toFixed(2)}:1  (min ${min}:1)`);
};

const WHITE = [255, 255, 255];
const SLATE900 = hex('#0F172A');
const lightGround = over([255, 255, 255], 0.7, WHITE); // white/70 over the modal's white body
const darkGround = over(hex('#1E293B'), 0.6, SLATE900); // slate-800/60 over slate-900

console.log('— light strip (white/70 over the desk modal WHITE body) —');
check('figure slate-600 on strip ground', hex('#475569'), lightGround);
check('muted slate-500 on strip ground', hex('#64748B'), lightGround);
check('rate/provenance slate-500 on strip ground', hex('#64748B'), lightGround);
console.log('— dark strip (slate-800/60 over slate-900) —');
check('figure slate-300 on strip ground', hex('#CBD5E1'), darkGround);
check('muted slate-400 on strip ground', hex('#94A3B8'), darkGround);
check('rate/provenance slate-400 on strip ground', hex('#94A3B8'), darkGround);

console.log(`\n${pass} pass, ${failures} fail`);
process.exit(failures > 0 ? 1 : 0);
