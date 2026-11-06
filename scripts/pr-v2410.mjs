#!/usr/bin/env node
// pr-v2410.mjs — open the release PR via the GitHub REST API (no gh CLI).
// The PAT is read from ems' origin URL, NEVER echoed.
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
  title: 'feat: the wire answers on mount — BUG 1 closed (v2.410.0)',
  head: 'feat/wire-answers-v2410',
  base: 'main',
  body: [
    '## The wire answers on mount',
    '',
    'BUG 1 — carried since Task 125 and closed with four instrumented agent-browser bursts — is fixed: on /console and /org/dashboard the CurrencySwitcher\'s two queries (`enabled: opened`, the v2.212.0 laziness law) NEVER fetched. The browser evidence was unambiguous: the dropdown visibly opened while ZERO requests left the browser (resource-timing empty, dev log silent, the in-page fetch logger caught nothing), the rows rendered static fallbacks, no branch-default chip, no freshness line — a mid-boot open DID fetch (the chip rendered, explaining why earlier QA saw the chip "live"), and one run showed the whole switcher remount (trigger data-state open → gone → closed, `opened` reset before the fetch could fire). The open-gated laziness bought silence with honesty.',
    '',
    '### Fixed',
    '- **THE WIRE ANSWERS ON MOUNT** (`src/components/currency-switcher.tsx`): both queries are `enabled: true` from the first render — the same mount-fetch path every other panel on these desks uses (the seed already asked the branch-default wire on every page load, so the laziness "savings" were already spent). The `opened` state, `handleOpenChange`, and the DropdownMenu\'s `onOpenChange` are gone — the open is pure display, no query state behind it. No polling joined the change: `refetchInterval: false` stays on both legs.',
    '',
    '### Added',
    '- **THE RATE CENSUS STRIP** (same file): when the wire answered, the footer renders one mono strip — the rows counted by provenance (`N admin-set · N API · N built-in`) beside an age voice (fresh under 45 s emerald, aging under 5 min amber, stale red — fed by the cache\'s own recorded read time). Honest absence: before the wire answers the strip is not rendered. Both voices are PURE exports (`rateCensus`, `wireAgeVoice`) pinned behaviorally in `currency-wire-v2410.test.ts`.',
    '- **THE DROPDOWN\'S STYLING ROUND**: the rows\' rate figures align in mono tabular digits, the active row wears a soft accent tint with an emerald rail (the branch-default chip\'s family), and the trigger echoes the open with a soft accent lift (surfaces with their own open voice — the console\'s dark banner — still win the cn merge).',
    '',
    '### Changed',
    '- **THE MOUNT LAW CASCADE**: `currency-switcher-wire-v2212.test.ts`\'s lazy block re-anchored to the mount law (the no-polling half survives, byte-pinned), `branch-voice-v2408` + `phantom-model-sweep-v2210` re-anchored, `archive-door-v2404`\'s lead-story hand-over, the walk codemod (44 count anchors + 251 version pins), and the eight deep-link suites\' story hand-over.',
    '',
    '### Verification',
    '- verify:current 9/9 · full vitest **9035 passed / 4 skipped / 0 failed** · lint **0 errors / 382 warnings** (baseline held) · strict tsc **299** (baseline held, 0 new faces)',
    '- QA: the mount law LIVE-proven (the branch-default wire answered 3× during the page load on /console, server log confirmed); the rates visual wedge-limited (the dev server\'s compile-on-demand black-holed the route in three late runs — server-side curl truth: rates 200 with 4 STATIC rows, settings 200 with USD/isDefault:false — the exact bodies the switcher reads).',
  ].join('\n'),
};

const res = await api(`/repos/${OWNER}/${REPO}/pulls`, { method: 'POST', body: JSON.stringify(body) });
const j = await res.json();
if (!res.ok) { console.error('FAIL:', res.status, JSON.stringify(j).slice(0, 300)); process.exit(1); }
console.log(`PR #${j.number} opened: ${j.html_url}`);
console.log(`head=${j.head.sha.slice(0, 8)} state=${j.state}`);
