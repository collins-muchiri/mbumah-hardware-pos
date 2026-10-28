// merge-pr-v2245.mjs — squash-merge PR #377 (the walk's findings).
// THE MERGE GATE LAW: the caller verifies required check-runs are green
// FIRST (one-shot probes, three consecutive stable polls); this script
// only fires the squash with the hand-written title (the Task 216 law).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();

const res = await fetch('https://api.github.com/repos/collins-muchiri/mbumah-hardware-pos/pulls/377/merge', {
  method: 'PUT',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    merge_method: 'squash',
    commit_title: "feat: the walk's findings (v2.245.0) (#377)",
    commit_body: "THE WALK'S FINDINGS — the pick face says what the last walk FOUND. The categories cadence map grows lastWalkUnits per category: the LATEST window walk that actually SPOKE for the shelf (a line with variance non-null — a line the floor never counted stays silent), and the units its lines in THIS category landed (line-level attribution — the shelf's own truth). THE ZERO-NEW-QUERIES LAW: the variance column rides the existing windowLines read, nothing else. THE UNITS LAW: units are units; a perfect count speaks 0 — the shelf held; null when no window walk spoke — the honest absence. THE FINDINGS FACE: the pick strip wears the verdict line (stocktake-pick-cadence-verdict) in the census's own three families (exact slate / surplus emerald / shrinkage red), tabular-nums, the block's aria carrying the findings; one law, three faces now (the map's aisle rows, the drill's line chips, the pick strip). THE BUG FIX: the picker's beyond voice read a hardcoded '30 days' — a constant the v2.241.0 law retired; it reads the WIRE'S OWN window now (not heard in {windowDays} days); the teeth-v2236 pins rode the truth change (the documented hand-pass). verify:v2-245-0 = 28 checks; vitest 5480/5480 (246 files, +16); lint 0 errors / 532 warnings (exact baseline); build exit 0 (OOM house law); E2E green on :3200 @2.245.0 (the pick strip speaks FRESH · counted today · −3 units found in the red family, aria carries it, legend names the stored law 5/45, zero console errors). Treadmill: 255 ancestor pins evolved (66 files) + 2 hand-passed pins.",
  }),
});
const j = await res.json();
console.log(res.status, JSON.stringify(j).slice(0, 300));
