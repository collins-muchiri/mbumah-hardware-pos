// watch-pr-v2242.mjs — one-shot probe of PR #374's required check-runs.
// THE MERGE GATE LAW: check-runs only; the Vercel commit STATUS (preview)
// is informational and never blocks.
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();
const headSha = execSync('git rev-parse ems-dev', { cwd: '/home/z/ems' }).toString().trim();
console.log('head:', headSha.slice(0, 8));

const res = await fetch(`https://api.github.com/repos/collins-muchiri/mbumah-hardware-pos/commits/${headSha}/check-runs?per_page=100`, {
  headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' },
});
const j = await res.json();
const runs = j.check_runs ?? [];
const required = runs.filter((r) => r.appellation !== undefined || true);
const byState = {};
for (const r of runs) {
  const key = `${r.name}`;
  byState[key] = `${r.status}${r.conclusion ? '/' + r.conclusion : ''}`;
}
for (const [k, v] of Object.entries(byState)) console.log(`${k}: ${v}`);
const pending = Object.values(byState).filter((v) => v === 'in_progress' || v === 'queued' || v === 'pending').length;
const failed = Object.entries(byState).filter(([k, v]) => v.endsWith('/failure'));
console.log(`\nsummary: ${runs.length} check-runs, ${pending} pending, ${failed.length} failed`);
if (failed.length) console.log('FAILED:', JSON.stringify(failed));
