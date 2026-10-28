// watch-pr-v2248.mjs — poll PR #380's required checks.
import { execSync } from 'node:child_process';
const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();
const sha = execSync('git rev-parse HEAD', { cwd: '/home/z/ems' }).toString().trim();
const headers = { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' };
const res = await fetch('https://api.github.com/repos/bucky-ops/mbumah-hardware-pos/commits/' + sha + '/check-runs', { headers });
const j = await res.json();
for (const c of j.check_runs ?? []) {
  console.log(`${c.name.padEnd(34)} ${c.status === 'completed' ? c.conclusion : c.status}`);
}
const runs = j.check_runs ?? [];
const pending = runs.filter((c) => c.status !== 'completed');
console.log(`\n${runs.length - pending.length}/${runs.length} completed, ${pending.length} pending`);
