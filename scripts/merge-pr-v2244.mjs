// merge-pr-v2244.mjs — squash-merge PR #376 (the aisle's echo).
// THE MERGE GATE LAW: the caller verifies required check-runs are green
// FIRST (one-shot probes, three consecutive stable polls); this script
// only fires the squash with the hand-written title (the Task 216 law).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();

const res = await fetch('https://api.github.com/repos/collins-muchiri/mbumah-hardware-pos/pulls/376/merge', {
  method: 'PUT',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    merge_method: 'squash',
    commit_title: "feat: the aisle's echo (v2.244.0) (#376)",
    commit_body: "The aisle's row on the map has testified since v2.243.0 — this round the sheet itself carries the echo home: open a door-born count sheet (org drill or branch face) and its origin-aisle line learns the aisle's own cadence band. WHERE the door opened (v2.242.0) now says WHEN its aisle was last heard. THE BAND'S ONE HOME: the four houses + their voices move from the variance map's local closures to @/lib/cadence-band — byte-identical classes, the map's call sites unchanged, the anti-duplication law applied to the band itself; the lib grows readCategoryBand (the ONE latest CLOSED line touching a product currently on the aisle; no line → never; in-window → fresh/stale by THE LAW'S OWN boundary; older → beyond; the fallback law: a failed read is null, never a guessed house). THE ECHO WIRE: both detail wires grow walkAisleBand + walkAisleDaysSince (additive + optional, two bounded reads, only for an aisle-born sheet); the walkAisle name line stays byte-identical. THE ECHO'S FACE: a sibling band chip after the name chip on both faces (sheet-drill-origin-aisle-band / stocktake-sheet-origin-aisle-band — the house's classes, the days voice on the title, tabular-nums); SIBLING SPANS, NEVER REWRITES — the name chips + the birth chip stay byte-identical. verify:v2-244-0 = 33 checks; vitest 5464/5464 (245 files, +14); lint 0 errors / 532 warnings (exact baseline); build exit 0 (OOM house law — both daemons stopped); E2E green on :3200 @2.244.0 (the drill heading wears CLOSED · BORN AT A WALK DOOR · THE WALK ORDER NAMED TOOLS · FRESH with 'the aisle's own cadence — counted today'; the branch face wears the same chip; both wires speak {walkAisle: 'Tools', walkAisleBand: 'fresh', walkAisleDaysSince: 0}; zero console errors). Treadmill: 253 ancestor pins evolved (65 files) + 2 hand-passed pins re-pointed at the one home (cadence-v2235).",
  }),
});
const j = await res.json();
console.log(res.status, JSON.stringify(j).slice(0, 300));
