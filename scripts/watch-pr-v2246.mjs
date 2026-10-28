// watch-pr-v2246.mjs — poll PR #378's check runs until stable + green.
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();
const sha = '23fff264'; // the release commit (API accepts short sha)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const probe = async () => {
  const res = await fetch(`https://api.github.com/repos/collins-muchiri/mbumah-hardware-pos/commits/${sha}/check-runs`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' },
  });
  const j = await res.json();
  return (j.check_runs || []).map((c) => `${c.name}:${c.status}:${c.conclusion ?? '-'}`);
};

let last = '';
for (let i = 0; i < 40; i++) {
  const runs = await probe();
  const line = runs.sort().join(' | ');
  const pending = runs.some((r) => r.includes(':in_progress:') || r.includes(':queued:') || r.includes(':pending:'));
  const stamped = new Date().toISOString().slice(11, 19);
  if (line !== last) { console.log(`[${stamped}] ${line || '(no runs yet)'}`); last = line; }
  if (!pending && runs.length > 0) { console.log(`[${stamped}] ALL SETTLED`); break; }
  await sleep(20000);
}
