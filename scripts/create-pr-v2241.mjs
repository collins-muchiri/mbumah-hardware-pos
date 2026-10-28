// create-pr-v2241.mjs — open the v2.241.0 release PR (ems-dev -> main).
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();
if (!token) { console.error('no token'); process.exit(1); }
const [owner, repo] = 'bucky-ops/mbumah-hardware-pos'.split('/');

const body = `## The walk's law (v2.241.0)

The cadence's thresholds stop being constants and become the org's own.

### Added
- **The law library** (\`src/lib/cadence-law.ts\`): one home for the pair the two wires used to duplicate. \`readCadenceLaw\` reads \`cadence.freshDays\`/\`cadence.windowDays\` from SystemConfig as one bounded read, validates each key against its band (fresh 1–14, window 14–90), coherence-checks the pair, and falls back to the defaults 7/30 on ANY absence, malformation, or incoherence — the reader never throws into a request.
- **The law wire** (\`GET/PUT /api/org/cadence\`): manager-plus reads; the owner writes. THE PAIR LAW: half a law is rejected whole (400, the bands named). THE AUDIT LAW: every write lands in the tamper-evident trail (CONFIG_CHANGE, old pair and new pair hashed).
- **The wires obey**: \`/api/org/kpi-summary\` + \`/api/categories?includeCadence=true\` read the same stored pair; the duplicated constants are GONE; the law's window governs the whole 30d-shaped family. The payload rides \`window30d.windowDays\` additively (optional in the type — an older cached answer keeps yesterday's silence).
- **The law's face** (\`variance-map.tsx\`): the cadence block names the pair for EVERY reader (\`cadence-law-line\`, the Scale glass, tabular-nums); the pen rides only for SUPER_ADMIN/STORE_OWNER (\`cadence-law-pen\`); the editor mirrors the bands before the round trip (\`cadence-law-editor\`, two labelled inputs); the wire's 400 speaks into the error line verbatim (\`cadence-law-error\`, role=alert); a written law toasts the pair and asks the page's own loader for the refetch.

### Styled
- The law face rides the map's tile house (amber focus ring, emerald verdict save, muted cancel, red error line, dark halves from birth). THE WINDOW SPEAKS ITS NUMBER: every hardcoded "30d"/"30-day" label on the map (window-row tiles, coverage aria + note, roster cap note, cadence bar caps + aria, cadence cap note) says the law's own number now.

## Gates
- \`verify:v2-241-0\` = **45/45**
- vitest **5397/5397** (242 files)
- eslint **0 errors**
- \`next build\` exit 0
- E2E green on :3200: law written 7/30 → 5/45 through the face, audit row verified (old/new pairs hashed), kpi payload re-walked (cadence 5/45, window30d 45), branch teeth legend re-walked ("fresh ≤ 5 days · stale within 45"), wire 400 named the bands, zero browser console errors.`;

const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
  method: 'POST',
  headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/vnd.github+json' },
  body: JSON.stringify({
    title: "feat: the walk's law (v2.241.0)",
    head: 'ems-dev',
    base: 'main',
    body,
  }),
});
const j = await res.json();
if (!res.ok) { console.error('PR failed:', res.status, JSON.stringify(j).slice(0, 300)); process.exit(1); }
console.log('PR #' + j.number + ' -> ' + j.html_url);
