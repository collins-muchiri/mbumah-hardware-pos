// merge-pr-v2242.mjs — squash-merge PR #374 (the aisle's answer).
// THE MERGE GATE LAW: the caller verifies required check-runs are green
// FIRST (one-shot probes, three consecutive stable polls); this script
// only fires the squash with the hand-written title (the Task 216 law).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();

const res = await fetch('https://api.github.com/repos/collins-muchiri/mbumah-hardware-pos/pulls/374/merge', {
  method: 'PUT',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    merge_method: 'squash',
    commit_title: "feat: the aisle's answer (v2.242.0) (#374)",
    commit_body: "The door census learns WHERE the doors opened: the walk order pointed at an aisle, and now the census names the aisles the doors actually opened onto — the door arc's final altitude (the point, the floor, the yard, the aisle). THE AISLE LAW: StockTake.walkCategoryId (nullable, additive, SetNull on aisle deletion; migration 20261028230000) rides ONLY when the sheet was born at a walk door AND the birth named one category, resolved server-side against THIS store — a hand-raised sheet carries no aisle even when it names one, a dead or cross-store aisle reads as no aisle, a deleted aisle nulls its sheets' column; the census never guesses, never speaks ghosts. THE CENSUS PER AISLE: kpi-summary groups the SAME window births by the aisle (one grouped read), names via ONE catalog read, and the face speaks the TOP 3 — the census is a headline, not a ledger; doorBornByAisle rides additively. THE AISLE'S FACE: the violet rows under the census line (cadence-door-aisle-{categoryId}, aria speaking the aisle + its births, tabular-nums counts, a slim share bar role=img riding the map's width transition, dark halves from birth). THE AISLE'S ECHO: both detail wires grow walkAisle and both faces speak 'the walk order named Tools' beside the birth chip — sibling spans, never rewrites (the chip law stays byte-identical). verify:v2-242-0 = 38 checks; vitest 5426/5426 (243 files, +29); lint 0 errors / 532 warnings (exact baseline); build exit 0 (OOM house law); E2E green on :3200 (door walk Tools@JUJ through the face -> DB row origin='walk-door' walkCategoryId='cat_tools' -> census '1 sheet' + aisle row 'Tools · 1 sheet born here · 100%' -> drill + branch echo chips -> zero console errors). Treadmill: 237 ancestor pins evolved (63 files).",
  }),
});
const j = await res.json();
console.log(res.status, JSON.stringify(j).slice(0, 300));
