// merge-pr-v2248-1.mjs — squash-merge the v2.248.0 release PR.
// THE MERGE GATE LAW: the caller verifies required check-runs are green
// FIRST (one-shot probes, three consecutive stable polls); this script
// only fires the squash with the hand-written title (the Task 216 law).
// Pass the PR number as argv[2].
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();
const pr = process.argv[2];
if (!pr) { console.error('usage: node scripts/merge-pr-v2248-1.mjs <pr-number>'); process.exit(1); }

const res = await fetch(`https://api.github.com/repos/collins-muchiri/mbumah-hardware-pos/pulls/${pr}/merge`, {
  method: 'PUT',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    merge_method: 'squash',
    commit_title: "fix: the restock's honest shillings (v2.248.1) (#" + pr + ")",
    commit_body: "THE WALK'S MIRROR — an older door-born sheet could wear its aisle's latest verdict without saying so; this round the sheet's own walk speaks first. THE MIRROR'S READ: both detail wires grow walkAisleSheetUnits (additive + optional) — the sheet's OWN spoken units in its aisle, the lib's own testament law mirrored back at the sheet itself: ONE bounded aggregate, indexed by the sheet's id, the same product-category join + variance-not-null shape readCategoryBand speaks; THE UNITS LAW: units are units (the cost gate NOT involved), a perfect count speaks 0 — the shelf held this walk, nothing spoke → null (the honest absence). THE MIRROR'S FACES: when both truths are present AND differ, the drill and branch faces speak this walk's own verdict FIRST (sheet-drill-origin-aisle-self / stocktake-sheet-origin-aisle-self, the lib's findingsVoice — the same three families and colours as the census — tabular-nums, the paper's own truth on the title), with the aisle's latest beneath it; SIBLING LINES, NEVER REWRITES — the v2.247.0 verdict line stays byte-identical; absent when either truth is absent or the two agree (a duplicate would say nothing new). THE READ CLASS: pure insertions — no lib return shape grew, no existing source byte moved, zero ancestor-pin hand-passes (the treadmill's 271 evolved pins stand). verify:v2-247-0 = 48 checks; vitest 5548/5548 (249 files, +26); lint 0 errors / 534 warnings (exact baseline); build exit 0 (OOM house law — both daemons AND the QA browser stopped: the law's third edge, agent-browser chrome is a build killer too); E2E green on :3200 @2.248.0 (old sheet's drill + branch face: this walk: −3 units found in red above the count held — 0 units in slate; both wires speak {walkAisleSheetUnits: -3, walkAisleUnits: 0}; the newer zero-variance walk keeps its single honest line; zero console errors).",
  }),
});
const j = await res.json();
console.log(res.status, JSON.stringify(j).slice(0, 300));
