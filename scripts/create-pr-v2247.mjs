// create-pr-v2247.mjs — open the v2.247.0 release PR (ems-dev -> main).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();
if (!token) { console.error('no token'); process.exit(1); }
const [owner, repo] = 'bucky-ops/mbumah-hardware-pos'.split('/');

const body = `## The walk's mirror (v2.247.0)

An older door-born sheet could wear its aisle's latest verdict without saying so — the v2.246.0 line spoke the AISLE's truth under THIS sheet's header, and a reader could mistake it for the sheet's own finding. This round the sheet's own walk speaks first: when this paper's walk found something DIFFERENT from what the aisle's latest window walk found, both truths ride the drill and the branch face. When they agree, the single honest line stays — a duplicate would say nothing new.

### Added
- **The mirror's read** (\`GET /api/stock-takes/[id]\` + \`GET /api/org/stock-takes/[id]\`): both detail wires grow \`walkAisleSheetUnits\` (additive + optional) — the sheet's OWN spoken units in its aisle, the lib's own testament law mirrored back at the sheet itself: ONE bounded aggregate, indexed by the sheet's id, the same product-category join + variance-not-null shape \`readCategoryBand\` speaks. THE UNITS LAW: units are units (the cost gate is NOT involved); a perfect count speaks 0 — the shelf held this walk; nothing spoke (no counted lines on the aisle) → null, the honest absence, never a hidden zero.
- **The mirror's faces** (\`sheet-drill.tsx\` + \`stock-take-panel.tsx\`): when both truths are present AND differ, the faces speak this walk's own verdict FIRST (\`sheet-drill-origin-aisle-self\` / \`stocktake-sheet-origin-aisle-self\`, the lib's \`findingsVoice\` — the same three families and colours as the census — \`tabular-nums\`, the paper's own truth on the title), with the aisle's latest beneath it. SIBLING LINES, NEVER REWRITES: the v2.246.0 verdict line stays byte-identical. Absent when either truth is absent, or when the two agree — the silence is the honest state.

### Styled
- The self lines ride the census's exact families and voices through the one home (\`findingsVoice\`) — no second voice was written, no new paint; \`tabular-nums\` on every figure, dark halves from birth. The honest absences hold: an aisle-less birth, a silent window, a fallen-back read or an agreeing latest all wear the single line (or none) — the silence is the honest state.

## Gates
- \`verify:v2-247-0\` = **35/35**
- vitest **5522/5522** (248 files, +17)
- eslint **0 errors / 532 warnings** (exact baseline)
- \`next build\` exit 0 (OOM house law — both daemons stopped)
- E2E green on :3200 @2.247.0: the older Tools sheet's drill speaks **this walk: −3 units found** (red, tabular-nums) above **the count held — 0 units** (the aisle's latest, slate) once a newer zero-variance walk closed on the same aisle; BOTH wires speak \`{walkAisleSheetUnits: -3, walkAisleUnits: 0}\`; the newer sheet keeps its single honest line; zero console errors. Treadmill: 265 ancestor pins evolved (67 files), zero hand-passes (pure insertions — no source byte moved).`;

const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    title: "feat: the walk's mirror (v2.247.0)",
    head: 'ems-dev',
    base: 'main',
    body,
  }),
});
const j = await res.json();
if (!res.ok) { console.error('PR failed:', res.status, JSON.stringify(j).slice(0, 300)); process.exit(1); }
console.log('PR #' + j.number + ' -> ' + j.html_url);
