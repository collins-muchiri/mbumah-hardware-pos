// watch-pr-v2247.mjs — poll PR #379's check-runs until stable-green or fail.
// THE MERGE GATE LAW: three consecutive stable green probes before the squash.
import { execSync } from 'node:child_process';

const token = execSync("git remote get-url origin | sed 's/.*x-access-token://;s/@github.com.*//'", { cwd: '/home/z/ems' }).toString().trim();
const pr = process.argv[2] || '379';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe() {
  const res = await fetch(`https://api.github.com/repos/collins-muchiri/mbumah-hardware-pos/pulls/${pr}`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' },
  });
  const j = await res.json();
  const sha = j.head.sha;
  const runs = await fetch(`https://api.github.com/repos/collins-muchiri/mbumah-hardware-pos/commits/${sha}/check-runs?per_page=100`, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' },
  }).then((r) => r.json());
  const list = (runs.check_runs || []).map((c) => `${c.name}=${c.status === 'completed' ? c.conclusion : c.status}`);
  const pending = list.filter((l) => !l.includes('success') && !l.includes('skipped') && !l.includes('neutral') && !l.includes('failure')).length;
  const failures = list.filter((l) => l.includes('failure')).length;
  console.log(`sha=${sha.slice(0, 7)} pending=${pending} failures=${failures} :: ${list.join(' ')}`);
  return { pending, failures, state: j.state, mergeable: j.mergeable };
}

let stable = 0;
for (let i = 0; i < 40; i++) {
  const { pending, failures } = await probe();
  if (pending === 0 && failures === 0) { stable++; if (stable >= 3) { console.log('STABLE GREEN x3 — safe to squash'); process.exit(0); } }
  else stable = 0;
  if (failures > 0 && pending === 0) { console.log('CHECKS FAILED (non-advisory may block)'); process.exit(1); }
  await sleep(30000);
}
console.log('timeout');
process.exit(2);
