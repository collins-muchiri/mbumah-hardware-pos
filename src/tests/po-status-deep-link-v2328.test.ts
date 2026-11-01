// THE ROSTER'S SECOND WORD (v2.328.0): the purchase-orders desk answers
// the address bar's status filter.
//
// v2.324.0 gave the roster its own PAGE word (`?po-page=` — the Task 44
// collision law's desk-prefixed safe path). This round the STATUS filter
// speaks too: `?po-status=PENDING_APPROVAL` lands the desk with the
// approval queue already chosen — the loyalty ledger's `?type=` law
// (membership, never-strand, read-on-mount), now param-named in ONE home
// (`parseInitialNamedMember`). The landing is also HONEST: a chip names
// the word the desk answered and retires the moment the human owns the
// filter (hand-change, dismiss, clear-all).
//
// Pins: the parser's truth table (pure), the desk's seed bytes, the
// landing chip's bytes and its three retirement voices, and the
// collision ledger (which files may speak the word at all — the
// proxy-gate file carries the src/ walk).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseInitialNamedMember } from '@/lib/tab-url';

const PO_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the membership law, param-named', () => {
  it('a word the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?po-status=PENDING_APPROVAL', 'po-status', PO_STATUSES, 'ALL')).toBe(
      'PENDING_APPROVAL'
    );
    expect(parseInitialNamedMember('?po-status=DRAFT', 'po-status', PO_STATUSES, 'ALL')).toBe('DRAFT');
    expect(parseInitialNamedMember('?po-status=CANCELLED', 'po-status', PO_STATUSES, 'ALL')).toBe('CANCELLED');
  });

  it('a word the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?po-status=ARCHIVED', 'po-status', PO_STATUSES, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?po-status=', 'po-status', PO_STATUSES, 'ALL')).toBe('ALL');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    expect(parseInitialNamedMember('?po-status=pending_approval', 'po-status', PO_STATUSES, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?po-status=Pending_Approval', 'po-status', PO_STATUSES, 'ALL')).toBe('ALL');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'po-status', PO_STATUSES, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?tab=purchase-orders', 'po-status', PO_STATUSES, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('po-status=DRAFT', 'po-status', PO_STATUSES, 'ALL')).toBe('DRAFT');
    expect(parseInitialNamedMember('?????', 'po-status', PO_STATUSES, 'ALL')).toBe('ALL');
    expect(parseInitialNamedMember('?po-status=DRAFT&po-page=2', 'po-status', PO_STATUSES, 'ALL')).toBe('DRAFT');
  });

  it('the law is generic: any param, any vocabulary, one home', () => {
    const VOWELS = ['a', 'e', 'i', 'o', 'u'] as const;
    expect(parseInitialNamedMember('?vowel=o', 'vowel', VOWELS, 'a')).toBe('o');
    expect(parseInitialNamedMember('?vowel=x', 'vowel', VOWELS, 'a')).toBe('a');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy
// ---------------------------------------------------------------------------

describe('the purchase-orders desk — ?po-status= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/purchase-orders-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember, parseInitialNamedPage } from '@/lib/tab-url';")).toBe(
      true
    );
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'po-status', PO_STATUSES, 'ALL')")
    ).toBe(true);
    // and the home owns the law
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes("v2.328.0 — THE ROSTER'S SECOND WORD")).toBe(true);
  });

  it('the seed is the lazy initializer of the status filter (read-on-mount law)', () => {
    expect(desk.includes('const [statusFilter, setStatusFilter] = useState<string>(initialPoStatus);')).toBe(true);
    // the SSR guard answers 'ALL' before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'ALL';")).toBe(true);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE ROSTER'S SECOND WORD")).toBe(true);
    expect(desk.includes('?po-status=PENDING_APPROVAL')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the desk answers OUT LOUD, and retires honestly
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/purchase-orders-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(desk.includes('landingLive && landedStatus !== \'ALL\' && statusFilter === landedStatus')).toBe(true);
    expect(desk.includes('data-testid="po-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?po-status={landedStatus}')).toBe(true);
  });

  it('voice 1 — the dismissal clears the filter the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="po-landing-word"');
    const block = desk.slice(at, at + 400);
    expect(block).toContain("setStatusFilter('ALL')");
    expect(block).toContain('setPage(1)');
    expect(block).toContain('setLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    const at = desk.indexOf("onValueChange={(v) => {\n                    setStatusFilter(v);");
    expect(at).toBeGreaterThan(-1);
    const block = desk.slice(at, at + 500);
    expect(block).toContain('setLandingLive(false)');
    expect(block).toContain('a hand-driven change retires the landing');
  });

  it('voice 3 — the honest clear-all retires the chip too', () => {
    const at = desk.indexOf('const clearFilters = () => {');
    const block = desk.slice(at, at + 500);
    expect(block).toContain('setLandingLive(false)');
    expect(block).toContain('the honest clear retires the landing chip');
  });

  it('the chip wears the roster\u2019s indigo family in BOTH modes', () => {
    expect(desk.includes('border-indigo-200 bg-indigo-50 text-indigo-700')).toBe(true);
    expect(desk.includes('dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE NEIGHBOUR'S LAW — the ledger's own words stay untouched
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the shape law and the membership law are separate homes with separate laws', () => {
    expect(home.includes('export function parseInitialNamedPage')).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    // parseInitialLimit keeps its digits-first gait law (it must NOT
    // delegate: `?limit=050` seeds 50 under the digits law and would
    // answer the fallback under a pure membership law)
    expect(home.includes('export function parseInitialLimit')).toBe(true);
  });
});
