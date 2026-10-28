// merge-pr-v2246.mjs — squash-merge PR #378 (the aisle's testament).
// THE MERGE GATE LAW: the caller verifies required check-runs are green
// FIRST (one-shot probes, three consecutive stable polls); this script
// only fires the squash with the hand-written title (the Task 216 law).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();

const res = await fetch('https://api.github.com/repos/collins-muchiri/mbumah-hardware-pos/pulls/378/merge', {
  method: 'PUT',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    merge_method: 'squash',
    commit_title: "feat: the aisle's testament (v2.246.0) (#378)",
    commit_body: "THE AISLE'S TESTAMENT — the sheet's aisle says what its latest window walk FOUND there. THE TESTAMENT'S READ: readCategoryBand grows lastWalkUnits (the categories wire's own law mirrored for one aisle: the latest SPEAKING line in the window — a line with variance non-null, a line the floor never counted stays silent — then that sheet's spoken units in THIS category via one aggregate, line-level attribution, the shelf's own truth; two bounded reads, in the window only; beyond/never never ask; THE UNITS LAW: units are units, a perfect count speaks 0 — the shelf held; null when no window walk spoke — the honest absence). THE TESTAMENT'S WIRE: both detail wires grow walkAisleUnits (additive + optional); the v2.244 band + days lines stay byte-identical. THE TESTAMENT'S FACES: the drill and branch faces wear the verdict line (sheet-drill-origin-aisle-verdict / stocktake-sheet-origin-aisle-verdict) in the census's own three families, tabular-nums, the shelf's own truth on the title — sibling lines, never rewrites; absent when the wire carried no units. THE VOICE'S ONE HOME: the census's three families move to findingsVoice in the lib — the map's verdict rows, the pick strip's verdict line and the detail faces' testament lines all speak through it (one law, four faces); the v2.243/v2.244/v2.245 pins rode the moves (the documented hand-passes). The walk lifecycle's faces now all speak the same truth: pick (band + findings), walk (the sheet), after (the census + the drill's echo + testament). verify:v2-246-0 = 35 checks; vitest 5505/5505 (247 files, +25); lint 0 errors / 532 warnings (exact baseline); build exit 0 (OOM house law); E2E green on :3200 @2.246.0 (drill: CLOSED · BORN AT A WALK DOOR · THE WALK ORDER NAMED TOOLS · FRESH · −3 units found; branch face verdict the same; both wires speak walkAisleUnits: -3; zero console errors). Treadmill: 259 ancestor pins evolved (66 files) + hand-passes (v2243's voice pins, v2245's voice pins, v2244's read-shape pins + map import).",
  }),
});
const j = await res.json();
console.log(res.status, JSON.stringify(j).slice(0, 300));
