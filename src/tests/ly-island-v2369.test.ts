// THE BARE-WORD ISLAND COMES HOME (v2.369.0): the loyalty desk's five
// remaining pre-constitution address-bar params — the bare `view`,
// `from`, `to`, `page`, `limit` — move to their desk-prefixed canonical
// words `ly-view` / `ly-from` / `ly-to` / `ly-page` / `ly-limit`, the
// oldest structural debt of the address-bar vocabulary after the type
// word's own migration (v2.368.0, THE LEGACY-WORD SUNSET LAW's first
// written form). Each shape of the vocabulary gained an alias parser
// (the stage parser, the date range, the pager, the gait), each ONE
// home in tab-url, and in every one the law is the same two sentences:
// the CANONICAL WINS when both are present, and a canonical PRESENCE
// (any value, even garbage) SILENCES the alias — one address bar can
// never tell the desk two different words. The bare words keep
// answering for the bookmarks already in the wild; the in-repo
// speakers moved this round (the sweep line's counts door speaks
// `ly-from`/`ly-to` now, the login desk-ask speaks `ly-view`).
// THE LANDED WINDOW'S CHIP: a landing that carried a window announces
// itself in the window's own amber, speaks the CANONICAL spellings
// even when the landing rode the aliases, and retires the moment the
// window is dismissed or hand-owned — the honest-face law the type
// word's chip wears. The STAGE, PAGE and GAIT wear NO chip BY DESIGN:
// the sub-tab strip IS the stage's face, and the pager's own status
// bar already speaks the page and gait — chips there would be noise
// saying what the desk already says.
// THE FRESH-RECYCLE PLAYBOOK, AS A SCRIPT: scripts/fresh-recycle.mjs
// codifies the recycle laws (the .env, the both-dbs world, the seed
// law, the credential probe) — the structural debt itself, paid.
//
// Pins: the four alias parsers' truth tables (canonical, alias,
// precedence, silencing, the inversions, the ride-alongs), the desk's
// migrated seeds and their cast-free typing, the four-name scrub, the
// landed-window chip's bytes and honest-face condition, the no-chip
// note for the stage/page/gait, the door's canonical window words, the
// desk-ask's canonical stage word, the playbook script's bytes, and
// the constitution's boundary (the siblings are NOT family rows — the
// registry stays twenty-one).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  parseInitialDateRangeWithAlias,
  parseInitialLimitWithAlias,
  parseInitialPageWithAlias,
  parseInitialStageWithAlias,
} from '@/lib/tab-url';

const LY_SUB_TABS = ['tiers', 'members', 'transactions', 'campaigns'] as const;

// ---------------------------------------------------------------------------
// 1. THE STAGE'S ALIAS PARSER (ly-view / view — the two-address law's island form)
// ---------------------------------------------------------------------------

describe('parseInitialStageWithAlias — the stage answers in its own name', () => {
  it('the CANONICAL stage word seeds the sub-tab', () => {
    expect(parseInitialStageWithAlias('?tab=loyalty&ly-view=transactions', 'ly-view', 'view', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('transactions');
    expect(parseInitialStageWithAlias('?tab=loyalty&ly-view=members', 'ly-view', 'view', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('members');
    expect(parseInitialStageWithAlias('?tab=loyalty&ly-view=tiers', 'ly-view', 'view', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('tiers');
    expect(parseInitialStageWithAlias('?tab=loyalty&ly-view=campaigns', 'ly-view', 'view', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('campaigns');
  });

  it('the LEGACY ALIAS keeps answering (the bookmarks already in the wild)', () => {
    expect(parseInitialStageWithAlias('?tab=loyalty&view=transactions', 'ly-view', 'view', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('transactions');
    expect(parseInitialStageWithAlias('?tab=loyalty&view=members', 'ly-view', 'view', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('members');
  });

  it('THE CANONICAL WINS when both are present (one address bar, one truth)', () => {
    expect(parseInitialStageWithAlias('?tab=loyalty&ly-view=members&view=transactions', 'ly-view', 'view', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('members');
    expect(parseInitialStageWithAlias('?tab=loyalty&view=transactions&ly-view=members', 'ly-view', 'view', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('members');
  });

  it('a canonical PRESENCE (even garbage) SILENCES the alias — the landed implication answers', () => {
    expect(parseInitialStageWithAlias('?tab=loyalty&ly-view=bogus&view=members&ly-type=EXPIRE', 'ly-view', 'view', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('transactions');
    expect(parseInitialStageWithAlias('?tab=loyalty&ly-view=&view=members', 'ly-view', 'view', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('transactions');
    // and with no landed word, the silenced stage falls to the default
    expect(parseInitialStageWithAlias('?tab=loyalty&ly-view=bogus&view=members', 'ly-view', 'view', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('tiers');
  });

  it('a LANDED word still implies the stage it lives on when no view word speaks', () => {
    expect(parseInitialStageWithAlias('?tab=loyalty&ly-type=EXPIRE', 'ly-view', 'view', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('transactions');
    expect(parseInitialStageWithAlias('?tab=loyalty&type=EXPIRE', 'ly-view', 'view', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('transactions');
  });

  it('a NEUTRAL landing (or none) answers the desk default', () => {
    expect(parseInitialStageWithAlias('?tab=loyalty', 'ly-view', 'view', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('tiers');
    expect(parseInitialStageWithAlias('', 'ly-view', 'view', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('tiers');
    // a malformed bar is SILENCE — the landed implication still fills it
    // (the same law the v2.368 stage parser speaks for an invalid word)
    expect(parseInitialStageWithAlias('?????', 'ly-view', 'view', LY_SUB_TABS, 'transactions', true, 'tiers')).toBe('transactions');
    expect(parseInitialStageWithAlias('?????', 'ly-view', 'view', LY_SUB_TABS, 'transactions', false, 'tiers')).toBe('tiers');
  });
});

// ---------------------------------------------------------------------------
// 2. THE WINDOW'S ALIAS PARSER (ly-from / ly-to — independence preserved per side)
// ---------------------------------------------------------------------------

describe('parseInitialDateRangeWithAlias — the window answers in its own name', () => {
  it('the CANONICAL window words seed the inputs', () => {
    expect(parseInitialDateRangeWithAlias('?tab=loyalty&ly-from=2026-11-01&ly-to=2026-11-03', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '2026-11-01', to: '2026-11-03' });
    expect(parseInitialDateRangeWithAlias('?ly-from=2026-11-01', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '2026-11-01', to: '' });
    expect(parseInitialDateRangeWithAlias('?ly-to=2026-11-03', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '', to: '2026-11-03' });
  });

  it('the LEGACY ALIASES keep answering (the sweep line\u2019s old doors in the wild)', () => {
    expect(parseInitialDateRangeWithAlias('?from=2026-11-01&to=2026-11-03', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '2026-11-01', to: '2026-11-03' });
    expect(parseInitialDateRangeWithAlias('?from=2026-11-01', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '2026-11-01', to: '' });
  });

  it('THE CANONICAL WINS per side when both dialects are present', () => {
    expect(parseInitialDateRangeWithAlias('?ly-from=2026-11-01&from=2026-10-31', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '2026-11-01', to: '' });
    expect(parseInitialDateRangeWithAlias('?ly-to=2026-11-03&to=2026-11-01', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '', to: '2026-11-03' });
  });

  it('a canonical PRESENCE (even garbage) silences the alias PER SIDE — the other side still answers', () => {
    expect(parseInitialDateRangeWithAlias('?ly-from=garbage&from=2026-11-01&to=2026-11-03', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '', to: '2026-11-03' });
    expect(parseInitialDateRangeWithAlias('?ly-to=&to=2026-11-03&from=2026-11-01', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '2026-11-01', to: '' });
  });

  it('the honest-day law is intact: impossible days answer empty, never strand', () => {
    expect(parseInitialDateRangeWithAlias('?ly-from=2026-02-30', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '', to: '' });
    expect(parseInitialDateRangeWithAlias('?ly-to=2026-13-01', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '', to: '' });
    expect(parseInitialDateRangeWithAlias('?ly-from=31/10/2026', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '', to: '' });
    expect(parseInitialDateRangeWithAlias('', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '', to: '' });
    expect(parseInitialDateRangeWithAlias('?????', 'ly-from', 'ly-to', 'from', 'to')).toEqual({ from: '', to: '' });
  });
});

// ---------------------------------------------------------------------------
// 3. THE PAGER'S ALIAS PARSER (ly-page / page — shape, not existence)
// ---------------------------------------------------------------------------

describe('parseInitialPageWithAlias — the pager answers in its own name', () => {
  it('the CANONICAL page word seeds the pager', () => {
    expect(parseInitialPageWithAlias('?tab=loyalty&ly-page=2', 'ly-page', 'page', 1)).toBe(2);
    expect(parseInitialPageWithAlias('?tab=loyalty&ly-page=3', 'ly-page', 'page', 1)).toBe(3);
  });

  it('the LEGACY ALIAS keeps answering (the bookmarks already in the wild)', () => {
    expect(parseInitialPageWithAlias('?tab=loyalty&page=2', 'ly-page', 'page', 1)).toBe(2);
    expect(parseInitialPageWithAlias('?page=7', 'ly-page', 'page', 1)).toBe(7);
  });

  it('THE CANONICAL WINS when both are present', () => {
    expect(parseInitialPageWithAlias('?ly-page=2&page=5', 'ly-page', 'page', 1)).toBe(2);
    expect(parseInitialPageWithAlias('?page=5&ly-page=2', 'ly-page', 'page', 1)).toBe(2);
  });

  it('a canonical PRESENCE (even garbage) silences the alias', () => {
    expect(parseInitialPageWithAlias('?ly-page=abc&page=5', 'ly-page', 'page', 1)).toBe(1);
    expect(parseInitialPageWithAlias('?ly-page=&page=5', 'ly-page', 'page', 1)).toBe(1);
  });

  it('the shape law is intact: zero, negative, decimal, whitespace answer the fallback', () => {
    expect(parseInitialPageWithAlias('?ly-page=0', 'ly-page', 'page', 1)).toBe(1);
    expect(parseInitialPageWithAlias('?ly-page=-3', 'ly-page', 'page', 1)).toBe(1);
    expect(parseInitialPageWithAlias('?ly-page=2.5', 'ly-page', 'page', 1)).toBe(1);
    expect(parseInitialPageWithAlias('?page=0', 'ly-page', 'page', 1)).toBe(1);
    expect(parseInitialPageWithAlias('?page=02', 'ly-page', 'page', 1)).toBe(2);
    expect(parseInitialPageWithAlias('', 'ly-page', 'page', 1)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 4. THE GAIT'S ALIAS PARSER (ly-limit / limit — membership, not shape)
// ---------------------------------------------------------------------------

describe('parseInitialLimitWithAlias — the gait answers in its own name', () => {
  it('the CANONICAL gait word seeds the Select', () => {
    expect(parseInitialLimitWithAlias('?tab=loyalty&ly-limit=50', 'ly-limit', 'limit', 100)).toBe(50);
    expect(parseInitialLimitWithAlias('?tab=loyalty&ly-limit=200', 'ly-limit', 'limit', 100)).toBe(200);
  });

  it('the LEGACY ALIAS keeps answering (the bookmarks already in the wild)', () => {
    expect(parseInitialLimitWithAlias('?tab=loyalty&limit=50', 'ly-limit', 'limit', 100)).toBe(50);
    expect(parseInitialLimitWithAlias('?limit=200', 'ly-limit', 'limit', 100)).toBe(200);
  });

  it('THE CANONICAL WINS when both are present', () => {
    expect(parseInitialLimitWithAlias('?ly-limit=50&limit=200', 'ly-limit', 'limit', 100)).toBe(50);
    expect(parseInitialLimitWithAlias('?limit=200&ly-limit=50', 'ly-limit', 'limit', 100)).toBe(50);
  });

  it('a canonical PRESENCE (even garbage) silences the alias', () => {
    expect(parseInitialLimitWithAlias('?ly-limit=500&limit=50', 'ly-limit', 'limit', 100)).toBe(100);
    expect(parseInitialLimitWithAlias('?ly-limit=&limit=50', 'ly-limit', 'limit', 100)).toBe(100);
  });

  it('the membership law is intact: between-the-gaits and malformed answer the fallback', () => {
    expect(parseInitialLimitWithAlias('?ly-limit=150', 'ly-limit', 'limit', 100)).toBe(100);
    expect(parseInitialLimitWithAlias('?ly-limit=abc', 'ly-limit', 'limit', 100)).toBe(100);
    expect(parseInitialLimitWithAlias('?limit=050', 'ly-limit', 'limit', 100)).toBe(50);
    expect(parseInitialLimitWithAlias('', 'ly-limit', 'limit', 100)).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// 5. THE DESK — five seeds through five homes, the four-name scrub, cast-free
// ---------------------------------------------------------------------------

describe('the loyalty desk — the island speaks its own names', () => {
  const desk = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the desk imports the FIVE alias parsers through the ONE home (and only them)', () => {
    expect(
      desk.includes("import { buildSearchWithoutParams, parseInitialDateRangeWithAlias, parseInitialLimitWithAlias, parseInitialNamedMemberWithAlias, parseInitialPageWithAlias, parseInitialStageWithAlias } from '@/lib/tab-url';")
    ).toBe(true);
    // the bare forms are GONE from the desk's import (the migration is whole)
    expect(desk.includes('parseInitialDateRange,')).toBe(false);
    expect(desk.includes('parseInitialLimit,')).toBe(false);
    expect(desk.includes('parseInitialPage,')).toBe(false);
    expect(desk.includes('parseInitialStage,')).toBe(false);
  });

  it('the home carries the island law (the module header speaks the migration)', () => {
    expect(home.includes('THE BARE-WORD ISLAND COMES HOME')).toBe(true);
    expect(home.includes('export function parseInitialStageWithAlias')).toBe(true);
    expect(home.includes('export function parseInitialDateRangeWithAlias')).toBe(true);
    expect(home.includes('export function parseInitialPageWithAlias')).toBe(true);
    expect(home.includes('export function parseInitialLimitWithAlias')).toBe(true);
    expect(home.includes('export function parseInitialNamedLimit')).toBe(true);
  });

  it('the stage seed reads the canonical pair through the stage\u2019s alias home', () => {
    expect(
      desk.includes("parseInitialStageWithAlias(window.location.search, 'ly-view', 'view', LOYALTY_SUB_TABS, 'transactions', landedLyType !== 'all', 'tiers')")
    ).toBe(true);
  });

  it('the window, pager and gait seeds read their canonical pairs', () => {
    expect(
      desk.includes("parseInitialDateRangeWithAlias(window.location.search, 'ly-from', 'ly-to', 'from', 'to')")
    ).toBe(true);
    expect(
      desk.includes("parseInitialPageWithAlias(window.location.search, 'ly-page', 'page', 1)")
    ).toBe(true);
    expect(
      desk.includes("parseInitialLimitWithAlias(window.location.search, 'ly-limit', 'limit', 100)")
    ).toBe(true);
  });

  it('the seeds stay SSR-guarded lazy initializers (read-on-mount law)', () => {
    expect(desk.includes('function initialDateFrom(): string {')).toBe(true);
    expect(desk.includes('function initialDateTo(): string {')).toBe(true);
    expect(desk.includes('function initialTxPage(): number {')).toBe(true);
    expect(desk.includes('function initialTxLimit(): number {')).toBe(true);
    expect(desk.split("if (typeof window === 'undefined') return '';").length - 1).toBe(2);
    expect(desk.includes("if (typeof window === 'undefined') return 1;")).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 100;")).toBe(true);
  });

  it('the dismiss scrubs BOTH dialects (the island scrub — a stale word of either is a lie)', () => {
    expect(
      desk.includes("buildSearchWithoutParams(window.location.search, ['ly-from', 'ly-to', 'from', 'to'])")
    ).toBe(true);
    const oldScrub = "buildSearchWithoutParams(window.location.search, ['fr" + "om', 'to'])";
    expect(desk.includes(oldScrub)).toBe(false);
  });

  it('the seeds are CAST-FREE (the parsers\u2019 generics name the state)', () => {
    expect(desk.includes('useState<string>(initialDateFrom)')).toBe(true);
    expect(desk.includes('useState<number>(initialTxPage)')).toBe(true);
    expect(desk.includes('useState<number>(initialTxLimit)')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. THE LANDED WINDOW'S CHIP — the address bar's echo, in the window's own amber
// ---------------------------------------------------------------------------

describe('the landed-window chip — the face names the window it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/loyalty-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND the inputs hold what landed', () => {
    expect(
      desk.includes('windowLandingLive && (landedWindowFrom || landedWindowTo) && txDateFrom === landedWindowFrom && txDateTo === landedWindowTo')
    ).toBe(true);
    expect(desk.includes('data-testid="ly-window-landing-word"')).toBe(true);
  });

  it('the chip speaks the CANONICAL spellings even when the landing rode the aliases (the URL-honest text)', () => {
    // v2.370.0: the second word drops its own ask-voice when the first
    // spoke — the chip renders the exact bytes a URL would carry.
    expect(desk.includes('?ly-from=${landedWindowFrom}')).toBe(true);
    expect(desk.includes('ly-to=${landedWindowTo}')).toBe(true);
    expect(desk.includes("landedWindowFrom ? '&' : '?'")).toBe(true);
  });

  it('the chip sits BEFORE the date inputs it landed into (the position law)', () => {
    const chipAt = desk.indexOf('data-testid="ly-window-landing-word"');
    const fromInputAt = desk.indexOf('value={txDateFrom}', chipAt);
    expect(chipAt).toBeGreaterThan(-1);
    expect(fromInputAt).toBeGreaterThan(chipAt);
  });

  it('the chip wears the window\u2019s OWN amber (the stamp\u2019s bytes, not a foreign voice)', () => {
    expect(desk.includes('border-amber-600/30 bg-amber-50 text-amber-800')).toBe(true);
    expect(desk.includes('dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-300')).toBe(true);
    expect(desk.includes("THE LANDED WINDOW'S WEARING")).toBe(true);
  });

  it('the press retires the landing AND clears the window (one door, both truths)', () => {
    const at = desk.indexOf('data-testid="ly-window-landing-word"');
    const block = desk.slice(Math.max(0, at - 700), at + 600);
    expect(block).toContain('onClick={clearDateWindow}');
  });

  it('the hand change owns the window — both inputs retire the chip', () => {
    const fromAt = desk.indexOf('setTxDateFrom(e.target.value)');
    const toAt = desk.indexOf('setTxDateTo(e.target.value)');
    expect(fromAt).toBeGreaterThan(-1);
    expect(toAt).toBeGreaterThan(-1);
    expect(desk.slice(fromAt, fromAt + 220)).toContain('setWindowLandingLive(false)');
    expect(desk.slice(toAt, toAt + 160)).toContain('setWindowLandingLive(false)');
  });

  it('the clear button retires the landing too (the one deliberate write stays whole)', () => {
    const clearAt = desk.indexOf('const clearDateWindow = () => {');
    const body = desk.slice(clearAt, clearAt + 500);
    expect(body).toContain('setWindowLandingLive(false);');
  });

  it('the STAGE, PAGE and GAIT wear NO chip by design (the noise law, written)', () => {
    expect(desk.includes('The STAGE, PAGE and GAIT wear NO chip BY')).toBe(true);
    expect(desk.includes('data-testid="ly-view-landing-word"')).toBe(false);
    expect(desk.includes('data-testid="ly-page-landing-word"')).toBe(false);
    expect(desk.includes('data-testid="ly-limit-landing-word"')).toBe(false);
  });

  it('the type word\u2019s chip keeps its green and its own honest-face law (no masquerade)', () => {
    expect(desk.includes('data-testid="ly-type-landing-word"')).toBe(true);
    expect(desk.includes('border-green-200 bg-green-50 text-green-700')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. THE IN-REPO SPEAKERS — the sweep line and the desk-ask moved this round
// ---------------------------------------------------------------------------

describe('the in-repo speakers — migrated to the canonical words', () => {
  it('the sweep line\u2019s counts door names the window in the desk\u2019s own words', () => {
    const card = readFileSync('src/components/workspace/org-console.tsx', 'utf8');
    expect(card.includes('`${EXPIRY_LEDGER_HREF}&ly-from=${sweepDay}&ly-to=${sweepDay}`')).toBe(true);
    const oldDoor = '`${EXPIRY_LEDGER_HREF}&fr' + 'om=${sweepDay}&to=${sweepDay}`';
    expect(card.includes(oldDoor)).toBe(false);
    expect(card.includes("const EXPIRY_LEDGER_HREF = '/?tab=loyalty&ly-type=EXPIRE';")).toBe(true);
  });

  it('the desk-ask speaks the canonical stage word (the tab-less ask survives sign-in)', () => {
    const login = readFileSync('src/components/login-screen.tsx', 'utf8');
    expect(login.includes('/[?&](tab|view|ly-view)=/.test(search)')).toBe(true);
    const oldAsk = '/[?&](tab|view' + ')=/.test(search)';
    expect(login.includes(oldAsk)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 8. THE FRESH-RECYCLE PLAYBOOK, AS A SCRIPT (the structural debt, paid)
// ---------------------------------------------------------------------------

describe('scripts/fresh-recycle.mjs — the playbook, codified', () => {
  const script = readFileSync('scripts/fresh-recycle.mjs', 'utf8');

  it('the script exists and carries the laws in its header', () => {
    expect(script.includes('THE FRESH-RECYCLE PLAYBOOK, AS A SCRIPT')).toBe(true);
    expect(script.includes('BOTH-DBS')).toBe(true);
    expect(script.includes('.env-swap')).toBe(true);
  });

  it('the core steps are all present, in the laws\u2019 order', () => {
    expect(script.includes("mkdirSync(join(target, 'db'), { recursive: true })")).toBe(true);
    expect(script.includes('env -u DATABASE_URL npm install')).toBe(true);
    expect(script.includes('setup-prisma-provider.mjs')).toBe(true);
    expect(script.includes('provider\\s*=\\s*"sqlite"')).toBe(true);
    expect(script.includes('NODE_ENV=development npm run db:seed')).toBe(true);
    expect(script.includes("'prisma', 'prisma', 'dev.db'")).toBe(true);
    expect(script.includes("role:'SUPER_ADMIN'")).toBe(true);
  });

  it('credentials stay OUT of the script (the caller passes the URL)', () => {
    expect(script.includes('x-access-token')).toBe(false);
    expect(script.includes('ghp_')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 9. THE CONSTITUTION'S BOUNDARY — the siblings are not family rows
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the boundary holds (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the registry stays TWENTY-ONE words (the island words are siblings, not rows)', () => {
    expect(constitution.includes('(twenty-seven words, twenty-three desks)')).toBe(true);
    expect(constitution.includes("{ word: 'ly-type', desk: 'src/app/(shell)/tabs/loyalty-tab.tsx', family: 'border-green-200', suite: 'src/tests/ly-type-deep-link-v2368.test.ts' }")).toBe(true);
    expect(constitution.includes('ly-view')).toBe(false);
    expect(constitution.includes('ly-page')).toBe(false);
  });

  it('the home\u2019s bare parsers stay exported (the wild bookmarks\u2019 law, kept for the record)', () => {
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes('export function parseInitialView')).toBe(true);
    expect(home.includes('export function parseInitialType')).toBe(true);
    expect(home.includes('export function parseInitialDateRange')).toBe(true);
    expect(home.includes('export function parseInitialPage')).toBe(true);
    expect(home.includes('export function parseInitialLimit')).toBe(true);
    expect(home.includes('export function parseInitialStage')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 10. THE COLLISION LEDGERS — which files may speak the new words at all
// ---------------------------------------------------------------------------

function walkSrc(dir: string, collected: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walkSrc(p, collected);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      const bytes = readFileSync(p, 'utf8');
      if (bytes.includes('ly-view') || bytes.includes('ly-from') || bytes.includes('ly-to') || bytes.includes('ly-page') || bytes.includes('ly-limit')) collected.push(p);
    }
  }
}

describe('the island words stay one-writer-per-word', () => {
  it('the five canonical words speak in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    // The six elder trail suites joined this ledger HONESTLY: the walk's
    // own re-anchors carried the canonical words into their pin bytes
    // (the LEDGER-CITATION RIPPLE — a ledger is an honest speaker of
    // every word it lists), and the ly-type suite carries the words in
    // its evolved stage-seed pin.
    expect(collected).toEqual([
      'src/app/(shell)/tabs/loyalty-tab.tsx',
      'src/components/login-screen.tsx',
      'src/components/workspace/org-console.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      'src/tests/expiry-day-window-v2317.test.ts',
      'src/tests/expiry-window-dismiss-v2318.test.ts',
      'src/tests/ledger-page-size-v2321.test.ts',
      'src/tests/ledger-pager-v2320.test.ts',
      'src/tests/ly-island-v2369.test.ts',
      'src/tests/ly-type-deep-link-v2368.test.ts',
      'src/tests/po-deep-link-v2324.test.ts',
      'src/tests/receipt-trail-v2311.test.ts',
    ]);
  });
});
