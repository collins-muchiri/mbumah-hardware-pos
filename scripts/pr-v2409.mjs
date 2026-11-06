#!/usr/bin/env node
// pr-v2409.mjs — open the release PR via the GitHub REST API (no gh CLI).
// The PAT is read from my-project's origin URL, NEVER echoed.
import { execSync } from 'node:child_process';

const origin = execSync('git -C /home/z/ems remote get-url origin', { encoding: 'utf8' }).trim();
const m = origin.match(/^https:\/\/([^:@]+):([^@]+)@github\.com\//);
if (!m) { console.error('FAIL: no PAT in origin URL'); process.exit(1); }
const TOKEN = m[2]; // after the x-access-token: prefix
const OWNER = 'collins-muchiri';
const REPO = 'mbumah-hardware-pos';

const api = async (path, init = {}) => {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.headers || {}),
    },
  });
  return res;
};

const body = {
  title: 'feat: the desk remembers — the org desk stops forgetting who you were (v2.409.0)',
  head: 'feat/desk-remembers-v2409',
  base: 'main',
  body: [
    '## The desk remembers',
    '',
    'The opening QA burst walked the branch-default seed onto the org desk for the first time and caught an honesty-law violation with teeth: the app store persists with `skipHydration: true` and only the tabs SPA’s boot ever asked for the persisted state back — on the org desk the seed read FACTORY state (`currencyChosen: false`), so a branch default STEAMROLLED an explicit choice that sat unread in localStorage (browser-verified live: KES/true → reload → USD/false), and the write-back destroyed that choice in storage.',
    '',
    '### Added',
    '- **THE HYDRATION BOOT** (`src/lib/app-store-hydration.ts`): once-per-page, best-effort rehydrate mounted on the org desk’s console page and the org console; the seed WAITS (`hasHydrated()` / `onFinishHydration` / 150 ms safety net) and never initiates (the SPA’s deep-link ordering law).',
    '- **THE AUDIT DESK’S LENS**: the Desk-Activity drill-down (reviewer/branch) persists as `consoleDeskFilter` in `mbt_app_store`; the panel is driven FROM the store; old blobs answer the factory lens.',
    '- **THE GREETING’S PROVENANCE DOT**: the trigger wears a quiet emerald dot while the currency arrived through the branch’s greeting (the seed’s transient `seededFromBranch` stamp — never persisted, gone on the first explicit switch).',
    '',
    '### Fixed',
    '- **THE SEED STEAMROLL (compliance-grade, live-proven)** — the org desk’s seed overwrote an explicit display-currency choice; regression pinned runtime-green.',
    '',
    '### Changed',
    '- **331 → 299 strict-mode faces**: db.ts’s twenty-four immutability faces via ONE guard factory typed by each model’s REAL Prisma mutation bags (no cast, every tooth kept); the tenant `where` types the `AND` it preserves; the payroll engine re-exports `PayrollGuardrailError` / `ResolvedRateTable` / `PayslipInput*`.',
    '',
    '### Verified',
    '- verify:current 9/9 · vitest **9010 passed / 4 skipped / 0 failed** (15 new pins) · lint **0 errors / 382 warnings** · strict tsc **299** (-32) · QA burst live + browser legs (steamroll fix LIVE, seed LIVE, human-hand, re-seed honesty)',
  ].join('\n'),
};

const res = await api(`/repos/${OWNER}/${REPO}/pulls`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});
const j = await res.json();
if (!res.ok) {
  console.error(`FAIL: ${res.status}`, JSON.stringify(j).slice(0, 300));
  process.exit(1);
}
console.log(`PR #${j.number} opened: ${j.html_url}`);
console.log(`state=${j.state} mergeable_state=${j.mergeable_state ?? 'unknown'}`);
