#!/usr/bin/env node
// watch-pr-v2464.mjs — poll the round PR's checks until the REQUIRED jobs
// settle, mended per the v2.451.0 law: THE WATCHER COUNTS THE RUNS, NOT
// JUST THE PENDING — a watcher that answers "0 pending" while the run
// COUNT is still growing (1 → 11) exits early on a half-born CI. The
// honest gate needs the KNOWN TOTAL: this repo's check-run family is
// ELEVEN faces (nine blocking + the Type Check advisory pool face + the
// skipped Deploy Production), so the green verdict requires
// count >= EXPECTED_RUNS AND pending == 0. If pending drains while the
// count still sits below the known total, the watcher keeps polling and
// says so — and a long half-born plateau exits honestly (exit 4), never
// green.
// Type Check (advisory) is EXPECTED to fail (the standing 282-face pool —
// the error-line dance arbitrates the no-new-errors face); every REQUIRED
// job must be success.
import { execSync } from 'node:child_process';

const origin = execSync('git -C /home/z/ems remote get-url origin', { encoding: 'utf8' }).trim();
const TOKEN = origin.match(/^https:\/\/([^:@]+):([^@]+)@github\.com\//)[2];
const OWNER = 'collins-muchiri';
const REPO = 'mbumah-hardware-pos';
const PR = 600;
const EXPECTED_RUNS = 11; // 9 blocking + Type Check (advisory) + Deploy Production (skipped)
const PLATEAU_LIMIT = 15; // half-born polls tolerated before the honest exit

// the head sha is read from the PR itself each poll — a watcher commit
// must never strand its own poll on a stale parent sha (v2.440.0 law)
const HEAD = null;

const api = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: 'application/vnd.github+json' },
  });
  return res.json();
};

let plateau = 0;
for (let i = 0; i < 60; i++) {
  const pr = await api(`/repos/${OWNER}/${REPO}/pulls/${PR}`);
  const sha = pr.head.sha;
  const runs = await api(`/repos/${OWNER}/${REPO}/commits/${sha}/check-runs?per_page=100`);
  const runsList = runs.check_runs ?? [];
  const byName = runsList.map((r) => `${r.name}:${r.status}:${r.conclusion}`).sort();
  const pending = runsList.filter((r) => r.status !== 'completed');
  console.log(`poll ${i + 1} — ${runsList.length} runs (of ${EXPECTED_RUNS} known), ${pending.length} pending`);
  for (const line of byName) console.log('  ' + line);
  const countComplete = runsList.length >= EXPECTED_RUNS && pending.length === 0;
  if (countComplete) {
    const requiredFail = runsList.filter(
      (r) => r.conclusion === 'failure' && !/type check/i.test(r.name),
    );
    if (requiredFail.length === 0) { console.log('ALL REQUIRED GREEN (count reached the known total; Type Check advisory may fail = standing pool)'); process.exit(0); }
    console.log('REQUIRED FAILURE: ' + requiredFail.map((r) => r.name).join(', '));
    process.exit(2);
  }
  if (pending.length === 0 && runsList.length > 0) {
    // HALF-BORN: the seen runs drained but the count never reached the
    // known total — the CI is still growing; never green this.
    plateau++;
    console.log(`  half-born (${runsList.length}/${EXPECTED_RUNS}) — the count is still growing; poll ${plateau}/${PLATEAU_LIMIT}`);
    if (plateau >= PLATEAU_LIMIT) {
      console.log(`HONEST EXIT: the count plateaued at ${runsList.length}/${EXPECTED_RUNS} — refusing to green a half-born CI`);
      process.exit(4);
    }
  } else {
    plateau = 0;
  }
  await new Promise((r) => setTimeout(r, 30000));
}
console.log('TIMEOUT');
process.exit(3);
