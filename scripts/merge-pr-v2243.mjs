// merge-pr-v2243.mjs — squash-merge PR #375 (the aisle's verdict).
// THE MERGE GATE LAW: the caller verifies required check-runs are green
// FIRST (one-shot probes, three consecutive stable polls); this script
// only fires the squash with the hand-written title (the Task 216 law).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();

const res = await fetch('https://api.github.com/repos/collins-muchiri/mbumah-hardware-pos/pulls/375/merge', {
  method: 'PUT',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    merge_method: 'squash',
    commit_title: "feat: the aisle's verdict (v2.243.0) (#375)",
    commit_body: "The census named the aisles the doors opened onto (v2.242.0) — this round the aisle's row speaks the walk's own VERDICT: what the walk found, and whether the walk moved the needle. The arc completes its sentence: the door points, the floor answers, the aisle is heard — and now the aisle testifies. THE VERDICT WIRE: kpi-summary's doorBornByAisle rows grow varianceUnits (the closed door-born sheets' variance UNITS, attributed to the aisle the DOOR named via the sheet's own walkCategoryId — no product join, no guess; two bounded reads), band + daysSince (joined from the cadence the same wire already computes — two Maps, zero new queries). THE UNITS LAW: units are units — the shillings gate is NOT involved; a counting sheet has not spoken; a perfect count speaks 0 — the shelf held. THE VERDICT'S FACE: the verdict line under the share bar (cadence-aisle-verdict-{categoryId}, the drill's own three families — exact slate / surplus emerald / shrinkage red), the band chip on the name line (cadence-aisle-band-{categoryId}, the walk order's four houses), the aria carrying the whole testimony; existing families only, dark halves from birth. verify:v2-243-0 = 31 checks; vitest 5450/5450 (244 files, +24); lint 0 errors / 532 warnings (exact baseline); build exit 0 (OOM house law — both daemons stopped); E2E green on :3200 @2.243.0 (the E2E sheet closed through the branch face: 5 of 5 counted, Pickaxe −3 → census 'Tools: 1 sheet born here — counted today — −3 units found this window.' with the FRESH band chip + red verdict line → coverage 0 → 1 of 42 → zero console errors). Treadmill: 245 ancestor pins evolved (64 files).",
  }),
});
const j = await res.json();
console.log(res.status, JSON.stringify(j).slice(0, 300));
