// THE CONVERSATIONS DESK'S OWN WORD (v2.363.0): the thread list's type
// lens answers the address bar.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk, v2.330.0 the customers desk, v2.331.0 the
// suppliers desk, v2.332.0 that desk's PO section, v2.333.0 the
// transactions desk's payment-method lens, v2.354.0 its type lens,
// v2.355.0 the rentals desk, v2.356.0 the invoices desk, v2.357.0 the
// transfers desk, v2.358.0 the gift cards desk, v2.359.0 the delivery
// notes desk, v2.360.0 the vouchers desk, v2.361.0 the credits desk,
// v2.362.0 the payroll desk. THE PROMISE KEPT A SIXTEENTH TIME — the
// conversations desk's thread list speaks its desk-prefixed
// `?cv-type=all|INTERNAL|CUSTOMER_SUPPORT` and wears the landing chip in
// the lens's own slate (the SIXTEENTH family — indigo/amber/rose/emerald/
// cyan/violet/fuchsia/orange/teal/blue/lime/sky/pink/yellow/stone now
// gain the thread lens's slate, the hue every chat UI paints its bubbles
// with) beside the desk's own voices (the desk icon's blue, the unread
// accents' rose — a voice must not masquerade as a badge, and now
// neither borrows the other's clothes). The threads' kind is now an
// address. THE ALWAYS-VISIBLE FACE: the lens lives in the desk's
// top-level split view (no sub-tabs), and the list pane mounts visible —
// a landing that carries the word shows the chip immediately.
// THE NEUTRAL VOICE, LOWERCASE (the payment word's spelling): this
// desk's all-lens is spelled 'all', so an UPPERCASE `ALL` is an unknown
// word here — the exact inverse of the capitalized-neutral desks.
//
// Pins: the parser's truth table (pure, UPPERCASE vocabulary, the
// lowercase neutral's self-seed AND its capitalized inversion), the
// desk's seed bytes and its cast-free typing, the QUERY-RIDES-THE-LENS
// bytes (key + params), the chip's bytes and its two retirement voices,
// the one-home promise (the law's doc carries the sixteenth word), the
// collision ledger — and the constitution's sixteenth row from its own
// suite.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const LOOM = readFileSync('src/components/landing-chip.tsx', 'utf8');
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';

const CV_TYPE_FILTERS = ['all', 'INTERNAL', 'CUSTOMER_SUPPORT'] as const;

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, UPPERCASE voice,
//    the LOWERCASE neutral)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — the thread lens speaks the one home', () => {
  it('a lens the desk offers seeds the filter', () => {
    expect(parseInitialNamedMember('?cv-type=INTERNAL', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('INTERNAL');
    expect(parseInitialNamedMember('?cv-type=CUSTOMER_SUPPORT', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('CUSTOMER_SUPPORT');
  });

  it('a lens the desk does not offer answers the fallback (never stranded)', () => {
    expect(parseInitialNamedMember('?cv-type=SUPPORT', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cv-type=', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('case-sensitive: a lowercase word is an unknown word, not a clever match', () => {
    // the lens's own words are UPPERCASE — `internal` names nothing
    // (the payment word's voice; the INVERSE of the lowercase type word)
    expect(parseInitialNamedMember('?cv-type=internal', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cv-type=Internal', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cv-type=customer_support', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('the NEUTRAL IS LOWERCASE here — UPPERCASE ALL names nothing (the inversion)', () => {
    // the desk's all-lens is spelled 'all' (the payment word's spelling):
    // a capitalized spelling is an unknown word, the exact inverse of the
    // capitalized-neutral desks — and the lowercase neutral seeds itself
    // (the fallback IS the member)
    expect(parseInitialNamedMember('?cv-type=ALL', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cv-type=all', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=conversations', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('cv-type=INTERNAL', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('INTERNAL');
    expect(parseInitialNamedMember('?????', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?cv-type=INTERNAL&page=2', 'cv-type', CV_TYPE_FILTERS, 'all')).toBe('INTERNAL');
  });

  it('the word rides alongside the vocabulary\u2019s other words without collision', () => {
    // a landing can carry the desk AND its lens AND the neighbors' words
    // — one bar, one word per lens, every lens its own
    expect(
      parseInitialNamedMember('?tab=conversations&cv-type=INTERNAL&txn-type=refund', 'cv-type', CV_TYPE_FILTERS, 'all')
    ).toBe('INTERNAL');
    expect(
      parseInitialNamedMember('?tab=conversations&cv-type=CUSTOMER_SUPPORT&rent-status=OVERDUE', 'cv-type', CV_TYPE_FILTERS, 'all')
    ).toBe('CUSTOMER_SUPPORT');
    expect(
      parseInitialNamedMember('?tab=conversations&cv-type=INTERNAL&po-status=PENDING_APPROVAL&inv-stock=low', 'cv-type', CV_TYPE_FILTERS, 'all')
    ).toBe('INTERNAL');
    expect(
      parseInitialNamedMember('?tab=conversations&cv-type=CUSTOMER_SUPPORT&pr-status=ACTIVE&cust-debt=overdue&sup-po=SENT', 'cv-type', CV_TYPE_FILTERS, 'all')
    ).toBe('CUSTOMER_SUPPORT');
    expect(
      parseInitialNamedMember('?tab=conversations&cv-type=INTERNAL&inv-status=PAID&gc-status=REDEEMED&dn-status=DELIVERED&vc-status=PAUSED&cr-type=DEBIT&transfer-status=IN_TRANSIT&txn-pay=CASH', 'cv-type', CV_TYPE_FILTERS, 'all')
    ).toBe('INTERNAL');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — read-on-mount, one home, never a copy, never a cast
// ---------------------------------------------------------------------------

describe('the conversations desk — ?cv-type= lands as visible state', () => {
  const desk = readFileSync('src/app/(shell)/tabs/conversations-tab.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(desk.includes("import { parseInitialNamedMember } from '@/lib/tab-url';")).toBe(true);
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'cv-type', CV_TYPE_FILTERS, 'all')")
    ).toBe(true);
    // the home owns the law and carries the sixteenth-word note
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.363.0 — THE PROMISE KEPT, THE SIXTEENTH WORD')).toBe(true);
  });

  it('the seed is the lazy initializer of the type filter (read-on-mount law)', () => {
    expect(
      desk.includes('const [typeFilter, setTypeFilter] = useState<(typeof CV_TYPE_FILTERS)[number]>(initialCvType);')
    ).toBe(true);
    // the SSR guard answers the neutral before any window exists
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
    // the desk offers exactly the lenses it names
    expect(
      desk.includes("export const CV_TYPE_FILTERS = ['all', 'INTERNAL', 'CUSTOMER_SUPPORT'] as const;")
    ).toBe(true);
  });

  it('the seed is CAST-FREE — the generic parser IS the union', () => {
    expect(desk.includes('function initialCvType(): (typeof CV_TYPE_FILTERS)[number]')).toBe(true);
    expect(desk.includes('useState<(typeof CV_TYPE_FILTERS)[number]>(initialCvType)')).toBe(true);
    // and no laundering snuck in around the new word
    expect(desk.includes('initialCvType() as')).toBe(false);
    expect(desk.includes('initialCvType as unknown')).toBe(false);
  });

  it('the word is desk-prefixed (the Task 44 collision law) and annotated', () => {
    expect(desk.includes("THE CONVERSATIONS DESK'S OWN WORD")).toBe(true);
    expect(desk.includes('?cv-type=INTERNAL')).toBe(true);
    // the collision note lives with the word
    expect(desk.includes('Collision-checked at round start')).toBe(true);
  });

  it('THE ALWAYS-VISIBLE FACE — the lens rides the top-level split view (no sub-tabs)', () => {
    // this desk has no TabsContent at all — the list pane is top-level
    expect(desk.includes('<TabsContent')).toBe(false);
    // the pane mounts visible: no conversation is selected at landing
    expect(desk.includes("const [selectedId, setSelectedId] = useState<string | null>(null);")).toBe(true);
    // the face is DOCUMENTED at the word, not just practiced
    expect(desk.includes('THE ALWAYS-VISIBLE FACE')).toBe(true);
  });

  it('the QUERY RIDES THE LENS (key + params, the list filters, not just the face)', () => {
    expect(desk.includes("queryKey: ['conversations', storeId, typeFilter, scope],")).toBe(true);
    expect(desk.includes("typeFilter !== 'all' ? typeFilter : undefined,")).toBe(true);
  });

  it('the word binds to the LIST lens only (the form\u2019s own Select untouched)', () => {
    // the new-conversation form's type Select is a DIFFERENT control with
    // its own state — exactly one list Select carries the word's chooser
    expect(desk.match(/onValueChange=\{chooseCvType\}/g)?.length).toBe(1);
    expect(desk.includes("onValueChange={(v: 'INTERNAL' | 'CUSTOMER_SUPPORT') => setType(v)}")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE LANDING CHIP — the face names the word it answered, in slate
// ---------------------------------------------------------------------------

describe('the landing chip — the face names the word it answered', () => {
  const desk = readFileSync('src/app/(shell)/tabs/conversations-tab.tsx', 'utf8');

  it('the chip renders only while the landing is live AND untouched', () => {
    expect(
      desk.includes("cvLandingLive && landedCvType !== 'all' && typeFilter === landedCvType")
    ).toBe(true);
    expect(desk.includes('data-testid="cv-type-landing-word"')).toBe(true);
  });

  it('the chip names the exact word it answered', () => {
    expect(desk.includes('landed ?cv-type=${landedCvType}')).toBe(true);
  });

  it('the chip sits BEFORE the type Select in the pane toolbar (the position law)', () => {
    const chipAt = desk.indexOf('data-testid="cv-type-landing-word"');
    const selectAt = desk.indexOf('<Select value={typeFilter} onValueChange={chooseCvType}>');
    expect(chipAt).toBeGreaterThan(-1);
    expect(selectAt).toBeGreaterThan(chipAt);
  });

  it('voice 1 — the dismissal clears the lens the word seeded and retires', () => {
    const at = desk.indexOf('data-testid="cv-type-landing-word"');
    const block = desk.slice(at, at + 1200);
    expect(block).toContain("setTypeFilter('all')");
    expect(block).toContain('setCvLandingLive(false)');
  });

  it('voice 2 — a hand-driven Select change retires the chip', () => {
    expect(desk.includes('<Select value={typeFilter} onValueChange={chooseCvType}>')).toBe(true);
    expect(desk.includes('a hand-driven change retires the landing word')).toBe(true);
  });

  it('the voices are honest — the desk claims exactly the two it has', () => {
    expect(desk.includes("hand-driven Select change or the chip's own dismissal")).toBe(true);
    expect(desk.includes('THE TWO VOICES:')).toBe(true);
  });

  it('the chip wears the lens\u2019s slate family in BOTH modes', () => {
    // v2.397.0 THE LOOM: the elder wardrobe moved into the loom's 200
    // registry — the desk proves its family by hue, the registry carries
    // the bytes.
    expect(desk.includes('hue="slate"')).toBe(true);
    expect(LOOM.includes('border-slate-200 bg-slate-50 text-slate-700')).toBe(true);
    expect(LOOM.includes('dark:border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-300')).toBe(true);
  });

  it('the dismiss hint sharpens on hover (the group-hover detail)', () => {
    expect(LOOM.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the chip explains itself (the tooltip law)', () => {
    expect(desk.includes('title="The desk landed with this filter from the address bar — press to clear it"')).toBe(true);
    expect(LOOM.includes('aria-hidden="true"')).toBe(true); // v2.397.0 THE LOOM: the icons live in the one hand
  });

  it('the desk\u2019s own voices keep their families beside the chip (no masquerade)', () => {
    // the desk icon's blue and the rose accents are the desk's own — the
    // chip's slate borrows nothing from them
    expect(desk.includes('MessageSquare className="h-6 w-6 text-blue-600"')).toBe(true);
    expect(LOOM.includes('border-slate-200 bg-slate-50')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the sixteenth row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the sixteenth row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks SIXTEEN words over FOURTEEN desks', () => {
    expect(constitution.includes('(forty-four words, twenty-nine desks)')).toBe(true);
    expect(constitution.includes("{ word: 'cv-type', desk: 'src/app/(shell)/tabs/conversations-tab.tsx', family: 'border-slate-200', suite: 'src/tests/cv-type-deep-link-v2363.test.ts' }")).toBe(true);
    expect(constitution.includes("'SIXTEENTH'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE COLLISION LEDGER — which files may speak the word at all
// ---------------------------------------------------------------------------

function walkSrc(dir: string, collected: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walkSrc(p, collected);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      if (readFileSync(p, 'utf8').includes('cv-type')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`cv-type` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/conversations-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the fifteen neighbor ledgers admitted this test file — and an
      // admission line carries the word it admits (the LEDGER-CITATION
      // RIPPLE: a ledger is an honest speaker of every word it lists)
      'src/tests/ad-severity-deep-link-v2366.test.ts',
      'src/tests/cat-stock-deep-link-v2364.test.ts',
      'src/tests/cr-type-deep-link-v2361.test.ts',
      'src/tests/cust-debt-deep-link-v2330.test.ts',
      'src/tests/cv-type-deep-link-v2363.test.ts',
      'src/tests/dn-status-deep-link-v2359.test.ts',
      'src/tests/dp-status-deep-link-v2365.test.ts',
      'src/tests/et-status-deep-link-v2381.test.ts',
      'src/tests/family-registry-stress-v2370.test.ts',
      'src/tests/gc-status-deep-link-v2358.test.ts',
      'src/tests/inv-status-deep-link-v2356.test.ts',
      'src/tests/inv-stock-deep-link-v2329.test.ts',
      // the loom's own suite — admitted (v2.397.0: the elder loom pins
      // this desk's chip bytes, so the walk lists it)
      'src/tests/landing-chip-loom-v2394.test.ts',
      'src/tests/ly-type-deep-link-v2368.test.ts',
      'src/tests/pr-status-deep-link-v2362.test.ts',
      // the po-status word's ledger lives beside the proxy-gate suite
      // (one release, two suites — the ledger is the honest speaker here)
      'src/tests/proxy-gate-layering-v2328.test.ts',
      'src/tests/rent-status-deep-link-v2355.test.ts',
      'src/tests/sec-type-deep-link-v2367.test.ts',
      'src/tests/sup-po-deep-link-v2332.test.ts',
      'src/tests/sup-status-deep-link-v2331.test.ts',
      'src/tests/tax-period-deep-link-v2383.test.ts',
      'src/tests/tax-type-deep-link-v2382.test.ts',
      'src/tests/transfer-status-deep-link-v2357.test.ts',
      'src/tests/txn-pay-deep-link-v2333.test.ts',
      'src/tests/txn-type-deep-link-v2354.test.ts',
      'src/tests/vc-status-deep-link-v2360.test.ts',
    ]);
  });

  it('the home\u2019s older words stay untouched (the shape law, the gait law)', () => {
    const home = readFileSync('src/lib/tab-url.ts', 'utf8');
    expect(home.includes('export function parseInitialNamedPage')).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
  });
});
