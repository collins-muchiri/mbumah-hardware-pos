// THE EXPORT LEDGER'S SECOND WORD (v2.392.0): the data-exports desk's
// history lens answers BY THE TYPE — the family's THIRTY-FIRST
// wearing. `?exp-type=products` lands the Export History section
// pre-filtered to the rows that answer one card — the export center's
// other daily question ("where is the file I generated for the
// accountant?") becomes a bookmark.
//
// v2.328.0 gave the purchase-orders roster its STATUS word (`?po-status=`),
// v2.329.0 the inventory desk, v2.330.0 the customers desk, v2.331.0 the
// suppliers desk, v2.332.0 that desk's PO section, v2.333.0 the
// transactions desk's payment-method lens, v2.354.0 its type lens,
// v2.355.0 the rentals desk, v2.356.0 the invoices desk, v2.357.0 the
// transfers desk, v2.358.0 the gift cards desk, v2.359.0 the delivery
// notes desk, v2.360.0 the vouchers desk, v2.361.0 the credits desk,
// v2.362.0 the payroll desk, v2.363.0 the conversations desk, v2.364.0
// the catalog desk, v2.365.0 the debt-plans desk, v2.366.0 the admin
// desk, v2.367.0 the security desk, v2.368.0 the loyalty ledger,
// v2.381.0 the e-TIMS invoices ledger, v2.382.0 the tax desk's type
// lens, v2.383.0 that ledger's month shape, v2.384.0 the reports desk's
// shape grid, v2.387.0 the bank ledger's type lens, v2.388.0 the bank
// ledger's M-Pesa lens, v2.389.0 the debt ledger's status lens,
// v2.390.0 that ledger's channel lens, v2.391.0 the export desk's
// status lens.
// THE PROMISE KEPT A THIRTY-FIRST TIME. The chip wears PINK at 300/100 —
// the shade-split's NINTH application, the hue the vouchers desk spoke
// at the 200 storey (a family byte the 200-storey can never equal), a
// hue NO badge on this desk speaks (the census answers amber, emerald,
// rose, green, red, teal, violet, purple, orange, cyan, blue and slate)
// and one its indigo sibling never borrowed. The word's voice is
// LOWERCASE (the type chip row's OWN spellings — the ten card keys:
// products | customers | transactions | debt | inventory | employees |
// suppliers | loyalty | tax | sales-summary) and the neutral is the
// lowercase `all`; the wire's UPPERCASE types are NOT lens words (a
// capitalized word names nothing — never a clever match). The desk
// joins the family's TWO-WORD NEGOTIATION club (the debt desk's
// same-pane precedent): either word lands, the two chips sit side by
// side, each retiring by its own two voices, and the two lenses
// CONJOIN in the table — the history table runs in its CONTROLLED form
// for BOTH lenses (the v2.391.0 hand's second application): the type
// state is lifted to the desk, the type chip row stays visible, and a
// hand-driven type press is the lens's second retirement voice.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';
import { EXP_STATUS_FILTERS, EXP_TYPE_FILTERS } from '@/lib/tab-url';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/data-exports-tab.tsx';
const TABLE = 'src/components/data-exports/exports-history-table.tsx';
const CONSTITUTION = 'src/tests/transfer-status-deep-link-v2357.test.ts';

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, lowercase voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — ?exp-type= speaks the type chip row\u2019s own vocabulary', () => {
  it('every member of the union answers itself (lowercase, case-sensitive)', () => {
    for (const member of EXP_TYPE_FILTERS) {
      expect(parseInitialNamedMember(`?tab=data-exports&exp-type=${member}`, 'exp-type', EXP_TYPE_FILTERS, 'all')).toBe(member);
    }
  });

  it('the wire\u2019s UPPERCASE types are NOT lens words — never a clever match', () => {
    // the lens's words are the CARD KEYS (lowercase) — `PRODUCTS`,
    // `SALES_SUMMARY` and a capitalized `Products` name nothing (the
    // inverse-case voice the status word speaks)
    expect(parseInitialNamedMember('?tab=data-exports&exp-type=PRODUCTS', 'exp-type', EXP_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=data-exports&exp-type=Products', 'exp-type', EXP_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=data-exports&exp-type=SALES_SUMMARY', 'exp-type', EXP_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=data-exports&exp-type=sales_summary', 'exp-type', EXP_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=data-exports&exp-type=garbage', 'exp-type', EXP_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'exp-type', EXP_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=data-exports', 'exp-type', EXP_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=data-exports&exp-type=', 'exp-type', EXP_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('exp-type=debt', 'exp-type', EXP_TYPE_FILTERS, 'all')).toBe('debt');
    expect(parseInitialNamedMember('?????', 'exp-type', EXP_TYPE_FILTERS, 'all')).toBe('all');
  });

  it('the word rides BESIDE the other thirty without stealing any of them', () => {
    expect(
      parseInitialNamedMember('?tab=data-exports&exp-type=products&po-status=OPEN&txn-pay=CASH', 'exp-type', EXP_TYPE_FILTERS, 'all')
    ).toBe('products');
    expect(
      parseInitialNamedMember('?tab=data-exports&exp-type=sales-summary&rent-status=OVERDUE&debt-channel=SMS', 'exp-type', EXP_TYPE_FILTERS, 'all')
    ).toBe('sales-summary');
    expect(
      parseInitialNamedMember('?tab=data-exports&exp-type=loyalty&bank-mpesa=MATCHED&tax-type=VAT&txn-pay=MPESA', 'exp-type', EXP_TYPE_FILTERS, 'all')
    ).toBe('loyalty');
  });

  it('THE TWO-WORD NEGOTIATION, ONE ADDRESS BAR — the desk\u2019s own sibling answers beside it', () => {
    // the same-pane form on ONE address bar: each parser reads ONLY
    // its own word, and the sibling's word is a stranger to it
    expect(
      parseInitialNamedMember('?tab=data-exports&exp-status=completed&exp-type=products', 'exp-status', EXP_STATUS_FILTERS, 'all')
    ).toBe('completed');
    expect(
      parseInitialNamedMember('?tab=data-exports&exp-status=completed&exp-type=products', 'exp-type', EXP_TYPE_FILTERS, 'all')
    ).toBe('products');
    // either word alone lands its own lens (never stranded by the
    // sibling's absence)
    expect(
      parseInitialNamedMember('?tab=data-exports&exp-type=debt', 'exp-status', EXP_STATUS_FILTERS, 'all')
    ).toBe('all');
    expect(
      parseInitialNamedMember('?tab=data-exports&exp-status=failed', 'exp-type', EXP_TYPE_FILTERS, 'all')
    ).toBe('all');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — the controlled hand's second application, cast-free
// ---------------------------------------------------------------------------

describe('the data-exports desk — ?exp-type= lands as visible state', () => {
  const desk = readFileSync(DESK, 'utf8');
  const loom = readFileSync('src/components/landing-chip.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'exp-type', EXP_TYPE_FILTERS, 'all')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.392.0 — THE PROMISE KEPT, THE THIRTY-FIRST WORD')).toBe(true);
    // the home names the word in backticks (the stress's registry walk)
    expect(home.includes('`exp-type`')).toBe(true);
  });

  it('the seed is the write-once initializer of the landing (the read-once law)', () => {
    expect(desk.includes('const [landedExpType] = useState<ExpTypeWordValue>(initialExpType);')).toBe(true);
    expect(desk.includes('const [expTypeFilter, setExpTypeFilter] = useState<ExpTypeWordValue>(initialExpType);')).toBe(true);
    expect(desk.includes("const [expTypeLandingLive, setExpTypeLandingLive] = useState(() => initialExpType() !== 'all');")).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
  });

  it('the seed is CAST-FREE — the member parser answers the union it is', () => {
    expect(desk.includes('function initialExpType(): (typeof EXP_TYPE_FILTERS)[number] {')).toBe(true);
    expect(desk.includes('initialExpType() as')).toBe(false);
    expect(desk.includes('initialExpType as unknown')).toBe(false);
  });

  it('the vocabulary is the chip row\u2019s OWN spelling (eleven members, lowercase)', () => {
    expect(EXP_TYPE_FILTERS).toEqual([
      'all',
      'products',
      'customers',
      'transactions',
      'debt',
      'inventory',
      'employees',
      'suppliers',
      'loyalty',
      'tax',
      'sales-summary',
    ]);
    expect(home.includes('export const EXP_TYPE_FILTERS')).toBe(true);
  });

  it('the history table runs in its CONTROLLED form for BOTH lenses (the hand\u2019s second application)', () => {
    const table = readFileSync(TABLE, 'utf8');
    // the desk lifts BOTH states and hands both the values and the doors:
    expect(desk.includes('externalFilter={expStatusFilter}')).toBe(true);
    expect(desk.includes('onFilterChange={chooseExpStatus}')).toBe(true);
    expect(desk.includes('externalTypeFilter={expTypeFilter}')).toBe(true);
    expect(desk.includes('onTypeChange={chooseExpType}')).toBe(true);
    // the table's contract grew the second controlled prop pair:
    expect(table.includes('externalTypeFilter?: ExpTypeFilter;')).toBe(true);
    expect(table.includes('onTypeChange?: (type: ExpTypeFilter) => void;')).toBe(true);
    // the type chip row STAYS VISIBLE in the controlled form (the
    // hand-driven voice must exist — a hidden lens has no second
    // retirement voice):
    expect(table.includes('(!externalTypeFilter || typeControlled) && (')).toBe(true);
    // every type press routes through the door; the uncontrolled form
    // is unchanged for every other caller:
    expect(table.includes('if (typeControlled) onTypeChange(t.key);')).toBe(true);
    expect(table.includes('else setTypeFilter(t.key);')).toBe(true);
  });

  it('EVERY hand-driven type press rides the retirement door', () => {
    expect(desk.includes('const chooseExpType = (v: ExpTypeWordValue) => {')).toBe(true);
    // the ONLY direct setExpTypeFilter calls left are the declaration,
    // the door's own write, and the chip's one-press dismissal:
    const direct = desk.split('\n').filter((l) => l.includes('setExpTypeFilter(') && !l.includes('const [expTypeFilter, setExpTypeFilter]'));
    expect(direct.length).toBe(2);
    expect(direct.some((l) => l.includes('setExpTypeFilter(v);'))).toBe(true);
    expect(direct.some((l) => l.includes("setExpTypeFilter('all');"))).toBe(true);
  });

  it('the chip sits BESIDE its indigo sibling, both BEFORE the table (the position law)', () => {
    const typeChip = desk.indexOf('data-testid="exp-type-landing-word"');
    const statusChip = desk.indexOf('data-testid="exp-status-landing-word"');
    const table = desk.indexOf('<ExportsHistoryTable');
    const section = desk.indexOf('{/* Export History */}');
    expect(typeChip).toBeGreaterThan(-1);
    expect(statusChip).toBeGreaterThan(-1);
    expect(table).toBeGreaterThan(-1);
    expect(section).toBeGreaterThan(-1);
    // the same-pane two-word negotiation: the two chips share the
    // section, side by side, both before the table they land into
    expect(statusChip).toBeGreaterThan(section);
    expect(typeChip).toBeGreaterThan(statusChip);
    expect(typeChip).toBeLessThan(table);
  });

  it('the chip wears PINK at the 300/100 storey (the ninth shade-split)', () => {
    // v2.394.0 THE LOOM: the wardrobe moved into the loom’s registry —
    // the desk proves its family by hue, the registry carries the bytes.
    expect(desk.includes('hue="pink"')).toBe(true);
    expect(loom.includes('border-pink-300 bg-pink-100 text-pink-700')).toBe(true);
    expect(loom.includes('dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-300')).toBe(true);
    expect(loom.includes('focus-visible:ring-pink-400')).toBe(true);
    // the hue speaks NOWHERE else on the desk — the chip is its only
    // voice (the masquerade law: exactly ONE pink wardrobe — the
    // light and dark border faces of that one wardrobe):
    // v2.394.0 THE LOOM: the census follows the wardrobe — the desk
    // answers ZERO (the masquerade), the loom speaks the ONE wardrobe
    // (its two border faces, its one bg-100 face):
    expect(desk.split('border-pink-').length - 1).toBe(0);
    expect(desk.split('bg-pink-100').length - 1).toBe(0);
    // v2.397.0 THE ELDER LOOM: the vouchers chip's pink joins the loom
    // at the 200 storey — the census counts both storeys (4)
    expect(loom.split('border-pink-').length - 1).toBe(4);
    // the 200 storey's hover:bg-pink-100 doubles the face (the elder
    // entry's hover form) — 1 -> 2
    expect(loom.split('bg-pink-100').length - 1).toBe(2);
    // the desk's badge census — the hues the badges DO speak (the chip
    // never borrows one of theirs), and the indigo sibling's wardrobe
    // stays the status word's alone:
    expect(desk.includes('from-emerald-500 to-emerald-600')).toBe(true); // the header's brand face
    expect(desk.includes('text-emerald-500')).toBe(true);
    expect(desk.includes('hue="indigo"')).toBe(true); // the status sibling, through the loom
  });

  it('the chip is dismissible and annotated (the collision law\u2019s annotation)', () => {
    expect(desk.includes('setExpTypeLandingLive(false);')).toBe(true);
    expect(desk.includes("THE EXPORT LEDGER'S SECOND WORD")).toBe(true);
    expect(desk.includes('?exp-type=products')).toBe(true);
    expect(desk.includes('data-testid="exp-type-landing-word"')).toBe(true);
    // the family's shared anatomy — the group-hover dismiss detail:
    // v2.394.0 THE LOOM: the X face’s bytes live in the one loom now
    expect(loom.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('the two lenses CONJOIN in the table (a landed pair narrows on both dimensions)', () => {
    const table = readFileSync(TABLE, 'utf8');
    // the status switch feeds a byStatus stage, the type wire narrows
    // it — one memo, two dimensions, never stealing each other's state
    expect(table.includes('const byStatus = (() => {')).toBe(true);
    expect(table.includes('if (!effectiveTypeWire) return byStatus;')).toBe(true);
    expect(table.includes('return byStatus.filter((e) => e.exportType === effectiveTypeWire);')).toBe(true);
    // the type chip row pairs each lens word with the wire type it
    // names (the kebab carries the underscore):
    expect(table.includes("['sales-summary', 'SALES_SUMMARY']")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE COLLISION LEDGER — which files may speak the word at all
// ---------------------------------------------------------------------------

function walkSrc(dir: string, collected: string[]): void {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walkSrc(p, collected);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      if (readFileSync(p, 'utf8').includes('exp-type')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`exp-type` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/data-exports-tab.tsx',
      // the lens face — the type chip row and the conjoined filter
      // (the word's testids live here too)
      'src/components/data-exports/exports-history-table.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the twenty-seventh word's own ledger — admitted (its feed-head
      // hand-over speaks this word's story — the hand-over makes every
      // re-pointed elder an honest speaker of the new lead)
      'src/tests/bank-mpesa-deep-link-v2388.test.ts',
      // the twenty-sixth word's own ledger — admitted (its feed-head
      // hand-over speaks this word's story)
      'src/tests/bank-type-deep-link-v2387.test.ts',
      // the twenty-ninth word's own ledger — admitted (its feed-head
      // hand-over speaks this word's story)
      'src/tests/debt-channel-deep-link-v2390.test.ts',
      // the twenty-eighth word's own ledger — admitted (its feed-head
      // hand-over speaks this word's story)
      'src/tests/debt-status-deep-link-v2389.test.ts',
      // the thirtieth word's own ledger — admitted (its feed-head
      // hand-over speaks this word's story, and this suite's
      // negotiation truth rides beside its word)
      'src/tests/exp-status-deep-link-v2391.test.ts',
      // this suite (the word's own ledger — an honest speaker)
      'src/tests/exp-type-deep-link-v2392.test.ts',
      // the registry stress parses the constitution's rows — the
      // thirty-first row rides through its parse (an honest speaker)
      'src/tests/family-registry-stress-v2370.test.ts',
      // the fixture world's own ledger — admitted (v2.436.0: the
      // fixture-fidelity suite speaks this word in its both-lenses
      // truth — the world that makes the lens speak is an honest
      // speaker of the word)
      'src/tests/fixture-fidelity-v2436.test.ts',
      // the po-status word's ledger — admitted (its OWN ledger now
      // LISTS this suite's path — the admission line carries the word
      // it admits; the third-order ripple)
      // the thirty-second word's own ledger — admitted (its own ledger
      // LISTS this file's path — the third-order ripple: a ledger line
      // carries every word its paths speak)
      // the loom’s own suite — admitted (v2.394.0: the LandingChip
      // loom suite pins this desk’s chip bytes, so the walk lists it)
      'src/tests/landing-chip-loom-v2394.test.ts',
      'src/tests/msg-template-deep-link-v2393.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      // the eighth word's own ledger — admitted (its own ledger now
      // LISTS this suite's path — the third-order ripple)
      'src/tests/rent-status-deep-link-v2355.test.ts',
      // the twenty-third word's own ledger — admitted (its own ledger
      // now LISTS this suite's path — the third-order ripple)
      'src/tests/tax-type-deep-link-v2382.test.ts',
      // the constitution (the vocabulary's registry — the thirty-first
      // row)
      'src/tests/transfer-status-deep-link-v2357.test.ts',
      // the sixth word's payment lens — admitted (its own ledger now
      // LISTS this suite's path — the third-order ripple)
      'src/tests/txn-pay-deep-link-v2333.test.ts',
    ]);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the thirty-first row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the thirty-first row (cross-suite pins)', () => {
  const constitution = readFileSync(CONSTITUTION, 'utf8');

  it('the constitution walks THIRTY-ONE words over TWENTY-FIVE desks (the export desk speaks twice)', () => {
    expect(constitution.includes('(thirty-three words, twenty-six desks)')).toBe(true);
    expect(constitution.includes("{ word: 'exp-type', desk: 'src/app/(shell)/tabs/data-exports-tab.tsx', family: 'border-pink-300', suite: 'src/tests/exp-type-deep-link-v2392.test.ts' }")).toBe(true);
    expect(constitution.includes("'THIRTY-FIRST'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE WHAT'S NEW FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — v2.465.0 leads the feed', () => {
  it('the entry exists, first, with the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.465.0');
    // the lead's story hand-over (v2.465.0, the Task 111 law's
    // seventy-first application): the head story is the hand-over's
    // voice — the carrying round: THE LEDGER SPEAKS IN ONE BREATH —
    // the clearance note's FOURTH door: the dead-stock CSV grows a
    // Share link column beside the Clearance note column, each row's
    // wa.me word composed in the SAME ONE home the clipboard and the
    // share door already speak (never re-typed in the desk), the cell
    // quoted like every word — one voice, four doors, and the four
    // can never drift apart; THE LEDGER'S CHORUS — the collective
    // composer deadStockClearanceNotes builds the whole word in the
    // ONE home (a header line speaking the ledger's own summary over
    // the SAME per-row notes the Ask copies), and the ledger's header
    // grows the Copy all handle that carries it to the clipboard at
    // once — the compact seat, the emerald hover the family speaks,
    // the double voice, and the honest exit: it only shows when rows
    // exist (a button that copies nothing would be a lie).
    // The link rides the file; the chorus rides the clipboard.
    expect(head.title).toContain('one breath');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('share link'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clipboard'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('copy all'))).toBe(true);
  });
});
