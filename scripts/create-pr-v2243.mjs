// create-pr-v2243.mjs — open the v2.243.0 release PR (ems-dev -> main).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();
if (!token) { console.error('no token'); process.exit(1); }
const [owner, repo] = 'bucky-ops/mbumah-hardware-pos'.split('/');

const body = `## The aisle's verdict (v2.243.0)

The census named the aisles the doors opened onto (v2.242.0) — this round the aisle's row speaks the walk's own VERDICT: what the walk found, and whether the walk moved the needle. The arc completes its sentence: the door points, the floor answers, the aisle is heard — and now the aisle testifies.

### Added
- **The verdict wire** (\`GET /api/org/kpi-summary\`): the \`doorBornByAisle\` rows grow three additive fields — \`varianceUnits\` (the closed door-born sheets' variance UNITS, attributed to the aisle the DOOR named via the sheet's own \`walkCategoryId\` — no product join, no guess; two bounded reads), \`band\` + \`daysSince\` (the aisle's own cadence band, joined from the cadence the same wire already computes — two Maps, zero new queries). THE UNITS LAW: units are units — the shillings gate is NOT involved. A counting sheet has not spoken; a perfect count speaks 0 — the shelf held.
- **The verdict's face** (\`variance-map.tsx\`): each aisle row speaks its verdict under the share bar (\`cadence-aisle-verdict-{categoryId}\`, the drill's own three families — exact slate / surplus emerald / shrinkage red) and wears its band chip (\`cadence-aisle-band-{categoryId}\`, the walk order's four houses, the days voice on the title). The row's aria carries the whole testimony.

### Styled
- Existing families only, never a new paint: the band chips are the \`bandHouse\` classes the cadence rail already speaks, the verdict line mirrors the drill's \`varianceChip\` law, every figure stays \`tabular-nums\`, dark halves from birth. Honest absences: a walk still out wears band but no verdict line; an aisle the cadence never knew wears no chip.

## Gates
- \`verify:v2-243-0\` = **31/31**
- vitest **5450/5450** (244 files, +24)
- eslint **0 errors / 532 warnings** (exact baseline)
- \`next build\` exit 0 (OOM house law — both daemons stopped)
- E2E green on :3200 @2.243.0: the E2E sheet closed through the branch face (5 of 5 counted, Pickaxe −3) → census speaks "Tools: 1 sheet born here — counted today — −3 units found this window." with the FRESH band chip + the red verdict line → coverage moved 0 → 1 of 42 → zero console errors. Treadmill: 245 ancestor pins evolved (64 files).`;

const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    title: "feat: the aisle's verdict (v2.243.0)",
    head: 'ems-dev',
    base: 'main',
    body,
  }),
});
const j = await res.json();
if (!res.ok) { console.error('PR failed:', res.status, JSON.stringify(j).slice(0, 300)); process.exit(1); }
console.log('PR #' + j.number + ' -> ' + j.html_url);
