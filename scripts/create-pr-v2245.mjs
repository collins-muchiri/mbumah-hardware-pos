// create-pr-v2245.mjs — open the v2.245.0 release PR (ems-dev -> main).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();
if (!token) { console.error('no token'); process.exit(1); }
const [owner, repo] = 'bucky-ops/mbumah-hardware-pos'.split('/');

const body = `## The walk's findings (v2.245.0)

The pick face has said WHEN a shelf was last heard since v2.236.0 — this round it says what the last walk FOUND there: the units the latest window walk's lines in that category landed, in the census's own three families. Plus one real bug fix: the picker's beyond voice had kept a hardcoded "30 days" — a constant the v2.241.0 law retired.

### Added
- **The findings wire** (\`GET /api/categories?includeCadence=true\`): the cadence map grows \`lastWalkUnits\` per category — the LATEST window walk that actually SPOKE for the shelf (a line with variance non-null; a line the floor never counted stays silent), and the units its lines in THIS category landed (line-level attribution — the shelf's own truth, not the whole sheet's). THE ZERO-NEW-QUERIES LAW: the attribution rides the pairs the cadence already reads — the \`variance\` column added to the existing \`windowLines\` read, nothing else. THE UNITS LAW: units are units. A perfect count speaks 0 — the shelf held. Null when no window walk spoke — the honest absence, never a hidden zero.
- **The findings face** (\`stock-take-panel.tsx\`, the pick strip): a verdict line under the band chip + days voice — \`stocktake-pick-cadence-verdict\`, the drill's own three families (exact = muted slate "the count held — 0 units", surplus = emerald "+N units found", shrinkage = red "−N units found"), \`tabular-nums\`, the block's aria carrying the findings. Absent when the wire carried none.

### Fixed
- **The beyond voice reads the stored law** (\`pickDaysVoice\`): "not heard in 30 days" hardcoded a window the v2.241.0 law made governable — the line now says \`not heard in {windowDays} days\` from the wire's own number. The teeth-v2236 pin rode the truth change (the documented hand-pass), plus the strip's aria pin.

### Styled
- The verdict line reuses the census's exact voice strings and families — one law, three faces (the map's aisle rows, the drill's line chips, now the pick strip), tabular-nums throughout, dark halves from birth, no new paint.

## Gates
- \`verify:v2-245-0\` = **28/28**
- vitest **5480/5480** (246 files, +16)
- eslint **0 errors / 532 warnings** (exact baseline)
- \`next build\` exit 0 (OOM house law — both daemons stopped)
- E2E green on :3200 @2.245.0: the pick strip speaks FRESH · counted today · **−3 units found** (red family) with the aria carrying it; the legend names the stored law (fresh ≤ 5 · stale within 45); zero console errors. Treadmill: 255 ancestor pins evolved (66 files) + 2 hand-passed pins (teeth-v2236's beyond voice + aria).`;

const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    title: "feat: the walk's findings (v2.245.0)",
    head: 'ems-dev',
    base: 'main',
    body,
  }),
});
const j = await res.json();
if (!res.ok) { console.error('PR failed:', res.status, JSON.stringify(j).slice(0, 300)); process.exit(1); }
console.log('PR #' + j.number + ' -> ' + j.html_url);
