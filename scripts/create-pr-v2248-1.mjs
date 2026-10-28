// create-pr-v2248-1.mjs — open the v2.248.0 release PR (ems-dev -> main).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();
if (!token) { console.error('no token'); process.exit(1); }
const [owner, repo] = 'bucky-ops/mbumah-hardware-pos'.split('/');

const body = `## The door's answer (v2.248.0)

Two doors, one law: a door must land where it points, and a finding must be answerable. This round fixes the first with the workspace's tab landing (a real bug: every branch-workspace door anchored to whatever tab localStorage had persisted), and builds the second — the restock's birth, the walk lifecycle's missing closure.

### Fixed
- **The doors' landing**: the workspace page forwards its catch-all segments; the gateway maps the first through \`tabFromWorkspacePath\` (src/lib/workspace/links.ts) and sets the tab once at ready. \`/stores/{slug}/inventory\` OPENS inventory — the walk doors, the recount door and the restock door are deterministic for every browser. An unknown or absent segment leaves the persisted tab standing (the old behavior, byte for byte).

### Added
- **The restock's birth (schema)**: \`PurchaseOrder.originStockTakeId\` (nullable, indexed, \`SetNull\`) + the \`StockTake.restockOrders\` read-side relation. A deleted sheet nulls the column — the PO never speaks ghosts.
- **The restock's wire** (\`POST /api/purchase-orders\`): the BIRTH ALLOWLIST — stored ONLY when the sheet exists, belongs to the SAME store, and is CLOSED; a bad address is a 400 rejection, never a silent null. The list + detail wires grow \`originStockTake\` (additive + optional).
- **The restock door** (\`sheet-drill.tsx\`): a CLOSED sheet that found shrinkage wears a violet anchor beside the recount door — "raise the restock for the N shrinkage lines" — into \`/stores/{slug}/purchase-orders?restockFrom={sheetId}\`. Absent when no shrinkage, not CLOSED, or no slug — an absent control never lies.
- **The landing + pre-pick** (\`purchase-orders-tab.tsx\`): the tab reads \`?restockFrom=\` ONE time, auto-opens the create dialog, pre-picks exactly the shrinkage lines (qty = the units the shelf lost, cost = the product's own cost price). The violet BIRTH STRIP speaks while building; a refusing sheet speaks its refusal — the birth stays off the record.
- **The birth's faces**: the roster wears the violet birth chip beside the number; the PO's own record wears the birth strip — for life.
- **The laws named (ride-along)**: the census row's title speaks the window-sum law; the walk picker's title speaks the latest walk's own truth.

### Styled
- The violet door family extends from the drill's birth chip to the restock door, the birth strip, the roster chip and the record strip — one house, tabular-nums on every figure, dark halves from birth. The honest absences hold everywhere: a hand-raised PO renders no chip, no strip; the silence is the honest state.

## Gates
- \`verify:v2-248-0\` = **48/48**
- vitest **5548/5548** (249 files, +26)
- eslint **0 errors / 534 warnings** (0-error canonical gate)
- \`next build\` exit 0 (OOM house law: both daemons stopped + chrome killed)
- Treadmill: 271 ancestor pins evolved (69 files) + ONE hand-pass (the v2.242 census-row title pin re-pointed at the law-naming truth — the full run caught it).`;

const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    title: "fix: the restock's honest shillings (v2.248.1)",
    head: 'ems-dev',
    base: 'main',
    body,
  }),
});
const j = await res.json();
if (!res.ok) { console.error('PR failed:', res.status, JSON.stringify(j).slice(0, 300)); process.exit(1); }
console.log('PR #' + j.number + ' -> ' + j.html_url);
