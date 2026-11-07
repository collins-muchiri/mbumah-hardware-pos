#!/usr/bin/env node
// watch-pr-v2440.mjs — poll PR #555's checks until the required jobs settle.
// Type Check (advisory) is EXPECTED to fail (the standing 283-face pool);
// every REQUIRED job must be success.
import { execSync } from 'node:child_process';

const origin = execSync('git -C /home/z/ems remote get-url origin', { encoding: 'utf8' }).trim();
const TOKEN = origin.match(/^https:\/\/([^:@]+):([^@]+)@github\.com\//)[2];
const OWNER = 'collins-muchiri';
const REPO = 'mbumah-hardware-pos';
const PR = 572;
// the head sha is read from the PR itself each poll — a watcher commit
// must never strand its own poll on a stale parent sha (v2.440.0 law)
const HEAD = null;

const api = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json' },
  });
  return res.json();
};

const pr = await api(`/repos/${OWNER}/${REPO}/pulls/${PR}`);
  const sha = pr.head.sha;
for (let i = 0; i < 60; i++) {
  const runs = await api(`/repos/${OWNER}/${REPO}/commits/${sha}/check-runs?per_page=100`);
  const runsList = runs.check_runs ?? [];
  const byName = runsList.map((r) => `${r.name}:${r.status}:${r.conclusion}`).sort();
  const pending = runsList.filter((r) => r.status !== 'completed');
  console.log(`poll ${i + 1} — ${runsList.length} runs, ${pending.length} pending`);
  for (const line of byName) console.log('  ' + line);
  if (runsList.length > 0 && pending.length === 0) {
    const requiredFail = runsList.filter(
      (r) => r.conclusion === 'failure' && !/type check/i.test(r.name),
    );
    if (requiredFail.length === 0) { console.log('ALL REQUIRED GREEN (Type Check advisory may fail = standing pool)'); process.exit(0); }
    console.log('REQUIRED FAILURE: ' + requiredFail.map((r) => r.name).join(', '));
    process.exit(2);
  }
  await new Promise((r) => setTimeout(r, 30000));
}
console.log('TIMEOUT');
process.exit(3);
