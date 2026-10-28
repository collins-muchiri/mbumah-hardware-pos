// create-pr-v2242.mjs — open the v2.242.0 release PR (ems-dev -> main).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();
if (!token) { console.error('no token'); process.exit(1); }
const [owner, repo] = 'bucky-ops/mbumah-hardware-pos'.split('/');

const body = `## The aisle's answer (v2.242.0)

The door census learns WHERE the doors opened. The walk order pointed at an aisle; now the census names the aisles the doors actually opened onto — the door arc's final altitude: the point, the floor, the yard, the aisle.

### Added
- **The aisle law** (\`POST /api/stock-takes\` + schema + migration \`20261028230000_add_stock_take_walk_category\`): \`StockTake.walkCategoryId\` (nullable, additive, SetNull on aisle deletion) rides ONLY when the sheet was born at a walk door AND the birth named one category, resolved server-side against THIS store — a hand-raised sheet carries no aisle even when it names one; a dead or cross-store aisle reads as no aisle; a deleted aisle nulls its sheets' column — the census never guesses, never speaks ghosts.
- **The census per aisle** (\`GET /api/org/kpi-summary\`): one grouped read over the SAME window births (aisle-named only), names via ONE catalog read, the face speaks the TOP 3 — the census is a headline, not a ledger. \`doorBornByAisle\` rides additively (an older cached answer renders the silent absence).
- **The aisle's echo** (\`GET /api/stock-takes/[id]\` + \`GET /api/org/stock-takes/[id]\`): both detail wires grow \`walkAisle\` (the aisle's own name); the drill and the branch sheet speak "the walk order named Tools" beside the birth chip — sibling spans, never rewrites (the chip law stays byte-identical).

### Styled
- **The aisle rows** (\`variance-map.tsx\`, \`cadence-door-aisles\`): the aisles the doors opened onto wear the door's violet under the census line — one row per aisle (\`cadence-door-aisle-{categoryId}\`, aria speaking the aisle + its births), the name in violet, the count in \`tabular-nums\`, a slim share bar (\`role="img"\`, the percent of the window's door births) riding the map's width transition. Dark halves from birth on every element.

## Gates
- \`verify:v2-242-0\` = **38/38**
- vitest **5426/5426** (243 files, +29)
- eslint **0 errors / 532 warnings** (exact baseline)
- \`next build\` exit 0 (OOM house law)
- E2E green on :3200: door walk Tools@JUJ through the face → DB row \`origin='walk-door'\` \`walkCategoryId='cat_tools'\` → census "1 sheet" + aisle row "Tools · 1 sheet born here · 100%" → drill + branch echo chips "THE WALK ORDER NAMED TOOLS" → zero browser console errors. Treadmill: 237 ancestor pins evolved (63 files).`;

const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    title: "feat: the aisle's answer (v2.242.0)",
    head: 'ems-dev',
    base: 'main',
    body,
  }),
});
const j = await res.json();
if (!res.ok) { console.error('PR failed:', res.status, JSON.stringify(j).slice(0, 300)); process.exit(1); }
console.log('PR #' + j.number + ' -> ' + j.html_url);
