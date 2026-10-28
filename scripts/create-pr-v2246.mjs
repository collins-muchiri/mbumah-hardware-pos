// create-pr-v2246.mjs — open the v2.246.0 release PR (ems-dev -> main).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();
if (!token) { console.error('no token'); process.exit(1); }
const [owner, repo] = 'bucky-ops/mbumah-hardware-pos'.split('/');

const body = `## The aisle's testament (v2.246.0)

The sheet's aisle has said WHEN it was last heard since v2.244.0 — this round it says what its latest window walk FOUND there: the aisle's testament rides the detail wires, and the drill and branch faces wear the verdict line. The verdict's words and colours move into their one home — the anti-duplication law applied to the findings voice itself.

### Added
- **The testament's read** (\`src/lib/cadence-band.ts\`): \`readCategoryBand\` grows \`lastWalkUnits\` — the categories wire's own law mirrored for one aisle. The latest SPEAKING line in the window (a line with variance non-null; a line the floor never counted stays silent), then that sheet's spoken units in THIS category (one aggregate, the same product-category join — line-level attribution, the shelf's own truth). THE UNITS LAW: units are units. A perfect count speaks 0 — the shelf held. Null when no window walk spoke (beyond / never / a silent window) — the honest absence, never a hidden zero. THE READ CLASS: the band's one line read stays first; the testament adds two bounded reads, in the window only. THE FALLBACK LAW per read: a band that fails is no band (null, as before); a testament that fails under a living band is silence (units null, the band keeps its truth).
- **The testament's wire** (\`GET /api/stock-takes/[id]\` + \`GET /api/org/stock-takes/[id]\`): both detail wires grow \`walkAisleUnits\` (additive + optional), read only for an aisle-born sheet. The band + days lines stay byte-identical (the v2.244.0 pins keep speaking).
- **The testament's faces** (\`sheet-drill.tsx\` + \`stock-take-panel.tsx\`): a verdict line under the sheet's when-line on both faces — \`sheet-drill-origin-aisle-verdict\` / \`stocktake-sheet-origin-aisle-verdict\`, the census's own three families via the lib, \`tabular-nums\` on the figure, the shelf's own truth on the title. SIBLING LINES, NEVER REWRITES: the chip row stays byte-identical. Absent when the wire carried no units — the silence is the honest state.

### Changed
- **The findings voice's one home** (\`findingsVoice\` in \`src/lib/cadence-band.ts\`): the census's three families (exact = muted slate "the count held — 0 units", surplus = emerald "+N units found", shrinkage = red "−N units found") had lived as two copies — the map's inline verdict and the pick strip's local voice. One home now: the map's verdict rows, the pick strip's verdict line and the detail faces' testament lines all speak through the lib. The v2.243/v2.245 pins rode the move (the documented hand-pass — their TRUTH moved, their intent preserved).

### Styled
- The verdict lines ride the census's exact families and voices — one law, four faces (the map's aisle rows, the pick strip, now the drill and the branch face), \`tabular-nums\` on every figure, dark halves from birth, no new paint. The honest absences hold: a beyond/never aisle wears band but no verdict; an aisle-less birth wears neither.

## Gates
- \`verify:v2-246-0\` = **35/35**
- vitest **5505/5505** (247 files, +25)
- eslint **0 errors / 532 warnings** (exact baseline)
- \`next build\` exit 0 (OOM house law — both daemons stopped)
- E2E green on :3200 @2.246.0: the drill wears **CLOSED · BORN AT A WALK DOOR · THE WALK ORDER NAMED TOOLS · FRESH · −3 units found** (red family, tabular-nums, the shelf's own truth on the title); the branch face wears the same verdict line; BOTH wires speak \`{walkAisle: "Tools", walkAisleBand: "fresh", walkAisleDaysSince: 0, walkAisleUnits: -3}\`; zero console errors. Treadmill: 259 ancestor pins evolved (66 files) + hand-passes (v2243's voice pins, v2245's voice pins, v2244's read-shape pins + map import).`;

const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    title: "feat: the aisle's testament (v2.246.0)",
    head: 'ems-dev',
    base: 'main',
    body,
  }),
});
const j = await res.json();
if (!res.ok) { console.error('PR failed:', res.status, JSON.stringify(j).slice(0, 300)); process.exit(1); }
console.log('PR #' + j.number + ' -> ' + j.html_url);
