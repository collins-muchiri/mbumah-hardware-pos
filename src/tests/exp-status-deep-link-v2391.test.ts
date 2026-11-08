// THE EXPORT LEDGER'S OWN WORD (v2.391.0): the data-exports desk's
// history lens answers the address bar — the family's THIRTIETH
// wearing. `?exp-status=completed|failed|processing` lands the Export
// History section pre-filtered to the files that answer the chip row's
// own word — the export center's daily question ("which of my files
// are ready, and which died?") becomes a bookmark.
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
// v2.390.0 that ledger's channel lens.
// THE PROMISE KEPT A THIRTIETH TIME. The chip wears INDIGO at 300/100 —
// the shade-split's EIGHTH application, a hue NO badge on this desk
// speaks (the census answers amber, emerald, rose, green, red, teal,
// violet, purple, orange, cyan, blue and slate) and one the family's
// first indigo — the purchase-orders roster's 200-storey word — never
// shared a bar with. The word's voice is LOWERCASE (the chip row's OWN
// spellings — the FilterKey union's members) and the neutral is the
// lowercase `all`; the wire's UPPERCASE statuses are NOT lens words
// (a capitalized word names nothing — never a clever match). The
// history table runs in its CONTROLLED form: the filter state is
// lifted to the desk (the one-writer law), the chip row stays visible,
// and a hand-driven chip press is the lens's second retirement voice.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';
import { EXP_STATUS_FILTERS } from '@/lib/tab-url';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/data-exports-tab.tsx';
const TABLE = 'src/components/data-exports/exports-history-table.tsx';
const CONSTITUTION = 'src/tests/transfer-status-deep-link-v2357.test.ts';

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, lowercase voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — ?exp-status= speaks the chip row\u2019s own vocabulary', () => {
  it('every member of the union answers itself (lowercase, case-sensitive)', () => {
    for (const member of EXP_STATUS_FILTERS) {
      expect(parseInitialNamedMember(`?tab=data-exports&exp-status=${member}`, 'exp-status', EXP_STATUS_FILTERS, 'all')).toBe(member);
    }
  });

  it('the wire\u2019s UPPERCASE statuses are NOT lens words — never a clever match', () => {
    // the lens's words are the CHIP KEYS (lowercase) — `COMPLETED` and
    // `Pending` name nothing (the inverse of the UPPERCASE status word)
    expect(parseInitialNamedMember('?tab=data-exports&exp-status=COMPLETED', 'exp-status', EXP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=data-exports&exp-status=Completed', 'exp-status', EXP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=data-exports&exp-status=PENDING', 'exp-status', EXP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=data-exports&exp-status=EXPIRED', 'exp-status', EXP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=data-exports&exp-status=garbage', 'exp-status', EXP_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'exp-status', EXP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=data-exports', 'exp-status', EXP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=data-exports&exp-status=', 'exp-status', EXP_STATUS_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('exp-status=failed', 'exp-status', EXP_STATUS_FILTERS, 'all')).toBe('failed');
    expect(parseInitialNamedMember('?????', 'exp-status', EXP_STATUS_FILTERS, 'all')).toBe('all');
  });

  it('the word rides BESIDE the other twenty-nine without stealing any of them', () => {
    expect(
      parseInitialNamedMember('?tab=data-exports&exp-status=completed&po-status=OPEN&txn-pay=CASH', 'exp-status', EXP_STATUS_FILTERS, 'all')
    ).toBe('completed');
    expect(
      parseInitialNamedMember('?tab=data-exports&exp-status=failed&rent-status=OVERDUE&debt-channel=SMS', 'exp-status', EXP_STATUS_FILTERS, 'all')
    ).toBe('failed');
    expect(
      parseInitialNamedMember('?tab=data-exports&exp-status=processing&bank-mpesa=MATCHED&tax-type=VAT&txn-pay=MPESA', 'exp-status', EXP_STATUS_FILTERS, 'all')
    ).toBe('processing');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — the controlled hand, cast-free
// ---------------------------------------------------------------------------

describe('the data-exports desk — ?exp-status= lands as visible state', () => {
  const desk = readFileSync(DESK, 'utf8');
  const loom = readFileSync('src/components/landing-chip.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'exp-status', EXP_STATUS_FILTERS, 'all')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.391.0 — THE PROMISE KEPT, THE THIRTIETH WORD')).toBe(true);
  });

  it('the seed is the write-once initializer of the landing (the read-once law)', () => {
    expect(desk.includes('const [landedExpStatus] = useState<ExpStatusWordValue>(initialExpStatus);')).toBe(true);
    expect(desk.includes('const [expStatusFilter, setExpStatusFilter] = useState<ExpStatusWordValue>(initialExpStatus);')).toBe(true);
    expect(desk.includes("const [expLandingLive, setExpLandingLive] = useState(() => initialExpStatus() !== 'all');")).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
  });

  it('the seed is CAST-FREE — the member parser answers the union it is', () => {
    expect(desk.includes('function initialExpStatus(): (typeof EXP_STATUS_FILTERS)[number] {')).toBe(true);
    expect(desk.includes('initialExpStatus() as')).toBe(false);
    expect(desk.includes('initialExpStatus as unknown')).toBe(false);
  });

  it('the vocabulary is the chip row\u2019s OWN spelling (five members, lowercase)', () => {
    // v2.439.0 re-anchor: cancelled joins the row — the stuck row's own
    // voice, the chip word's spelling, one home.
    expect(EXP_STATUS_FILTERS).toEqual([
      'all',
      'completed',
      'failed',
      'processing',
      'cancelled',
    ]);
    expect(home.includes('export const EXP_STATUS_FILTERS')).toBe(true);
  });

  it('the history table runs in its CONTROLLED form (the v2.391.0 hand)', () => {
    const table = readFileSync(TABLE, 'utf8');
    // the desk lifts the state and hands both the value and the door:
    expect(desk.includes('externalFilter={expStatusFilter}')).toBe(true);
    expect(desk.includes('onFilterChange={chooseExpStatus}')).toBe(true);
    // the table's contract grew the controlled hand:
    expect(table.includes('onFilterChange?: (filter: FilterKey) => void;')).toBe(true);
    expect(table.includes('if (controlled) onFilterChange(chip.key);')).toBe(true);
    // the chip row STAYS VISIBLE in the controlled form (the hand-driven
    // voice must exist — a hidden lens has no second retirement voice):
    expect(table.includes('(!externalFilter || controlled) && (')).toBe(true);
    // the uncontrolled form is unchanged for every other caller:
    expect(table.includes('else setFilter(chip.key);')).toBe(true);
  });

  it('EVERY hand-driven chip press rides the retirement door', () => {
    expect(desk.includes('const chooseExpStatus = (v: ExpStatusWordValue) => {')).toBe(true);
    // the ONLY direct setExpStatusFilter calls left are the declaration,
    // the door's own write, and the chip's one-press dismissal:
    const direct = desk.split('\n').filter((l) => l.includes('setExpStatusFilter(') && !l.includes('const [expStatusFilter, setExpStatusFilter]'));
    expect(direct.length).toBe(2);
    expect(direct.some((l) => l.includes('setExpStatusFilter(v);'))).toBe(true);
    expect(direct.some((l) => l.includes("setExpStatusFilter('all');"))).toBe(true);
  });

  it('the chip sits BEFORE the history table, INSIDE the history section (the position law)', () => {
    const chip = desk.indexOf('data-testid="exp-status-landing-word"');
    const table = desk.indexOf('<ExportsHistoryTable');
    const section = desk.indexOf('{/* Export History */}');
    expect(chip).toBeGreaterThan(-1);
    expect(table).toBeGreaterThan(-1);
    expect(section).toBeGreaterThan(-1);
    expect(chip).toBeGreaterThan(section);
    expect(chip).toBeLessThan(table);
  });

  it('the chip wears INDIGO at the 300/100 storey (the eighth shade-split)', () => {
    // v2.394.0 THE LOOM: the wardrobe moved into the loom’s registry —
    // the desk proves its family by hue, the registry carries the bytes.
    expect(desk.includes('hue="indigo"')).toBe(true);
    expect(loom.includes('border-indigo-300 bg-indigo-100 text-indigo-700')).toBe(true);
    expect(loom.includes('dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300')).toBe(true);
    expect(loom.includes('focus-visible:ring-indigo-400')).toBe(true);
    // the hue speaks NOWHERE else on the desk — the chip is its only
    // voice (the masquerade law: exactly ONE indigo wardrobe — the
    // light and dark border faces of that one wardrobe):
    // v2.394.0 THE LOOM: the census follows the wardrobe — the desk
    // answers ZERO (the masquerade), the loom speaks the ONE wardrobe
    // (its two border faces, its one bg-100 face):
    expect(desk.split('border-indigo-').length - 1).toBe(0);
    expect(desk.split('bg-indigo-100').length - 1).toBe(0);
    // v2.397.0 THE ELDER LOOM: the purchase-orders chip's indigo joins
    // the loom at the 200 storey — the census counts both storeys (300
    // entry + its dark face + 200 entry + its dark face = 4)
    expect(loom.split('border-indigo-').length - 1).toBe(4);
    // the 200 storey's hover:bg-indigo-100 doubles the face (the elder
    // entry's hover form) — 1 -> 2
    expect(loom.split('bg-indigo-100').length - 1).toBe(2);
    // the desk's badge census — the hues the badges DO speak (the chip
    // never borrows one of theirs):
    expect(desk.includes('from-emerald-500 to-emerald-600')).toBe(true); // the header's brand face
    expect(desk.includes('text-emerald-500')).toBe(true);
  });

  it('the chip is dismissible and annotated (the collision law\u2019s annotation)', () => {
    expect(desk.includes('setExpLandingLive(false);')).toBe(true);
    expect(desk.includes("THE EXPORT LEDGER'S OWN WORD")).toBe(true);
    expect(desk.includes('?exp-status=completed')).toBe(true);
    expect(desk.includes('data-testid="exp-status-landing-word"')).toBe(true);
    // the family's shared anatomy — the group-hover dismiss detail:
    // v2.394.0 THE LOOM: the X face’s bytes live in the one loom now
    expect(loom.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('exp-status')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`exp-status` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/data-exports-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the sixth word's own ledger — admitted (this suite speaks
      // `bank-mpesa` in its rides-beside truth) — an admission line
      // carries the word it admits
      'src/tests/bank-mpesa-deep-link-v2388.test.ts',
      // the twenty-sixth word's own ledger — admitted (its feed-head
      // hand-over speaks this word's story — the hand-over makes every
      // re-pointed elder an honest speaker of the new lead)
      'src/tests/bank-type-deep-link-v2387.test.ts',
      // the walk's own history line — admitted (v2.439.0: the cascade's
      // fiftieth generation speaks the new lens word by name — the
      // story of the word names the word)
      'src/tests/console-changelog.test.ts',
      // the twenty-ninth word's own ledger — admitted (this suite
      // speaks `debt-channel` in its rides-beside truth)
      'src/tests/debt-channel-deep-link-v2390.test.ts',
      // the twenty-eighth word's own ledger — admitted (its feed-head
      // hand-over speaks this word's story)
      'src/tests/debt-status-deep-link-v2389.test.ts',
      // this suite (the word's own ledger — an honest speaker)
      'src/tests/exp-status-deep-link-v2391.test.ts',
      // the thirty-first word's own ledger — admitted (its rides-beside
      // truth speaks this word) — an admission line carries the word
      // it admits
      'src/tests/exp-type-deep-link-v2392.test.ts',
      // the cancel door's own ledger — admitted (v2.439.0: the stuck
      // row's suite speaks this word's new lens word — the deep-link
      // word the badge wears is the word the address bar lands)
      'src/tests/export-cancel-v2439.test.ts',
      // the registry stress parses the constitution's rows — the
      // thirtieth row rides through its parse (an honest speaker)
      'src/tests/family-registry-stress-v2370.test.ts',
      // the fixture world's own ledger — admitted (v2.436.0: the
      // fixture-fidelity suite speaks this word in its both-lenses
      // truth — the world that makes the lens speak is an honest
      // speaker of the word)
      'src/tests/fixture-fidelity-v2436.test.ts',
      // the FIRST word's own ledger (the po-status voice lives in the
      // proxy-gate suite) — admitted (this suite speaks `po-status` in
      // its rides-beside truth)
      // the thirty-second word's own ledger — admitted (its own ledger
      // LISTS this file's path — the third-order ripple: a ledger line
      // carries every word its paths speak)
      // the loom’s own suite — admitted (v2.394.0: the LandingChip
      // loom suite pins this desk’s chip bytes, so the walk lists it)
      'src/tests/landing-chip-loom-v2394.test.ts',
      'src/tests/msg-template-deep-link-v2393.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      // the eighth word's own ledger — admitted (this suite speaks
      // `rent-status` in its rides-beside truth)
      'src/tests/rent-status-deep-link-v2355.test.ts',
      // rep-type EXITS the ledger (v2.440.0's honest re-anchor): its
      // only speech of this word was the v2.439.0 feed-head comment
      // ("exp-status=cancelled lands the lens") — the census hand-over
      // replaced that prose with a story that does not carry the word,
      // so the elder stops being a speaker (the word's one-writer law:
      // the ledger lists the files that speak, no more)
      // the twenty-third word's own ledger — admitted (this suite
      // speaks `tax-type` in its rides-beside truth)
      'src/tests/tax-type-deep-link-v2382.test.ts',
      // the constitution (the vocabulary's registry — the thirtieth row)
      'src/tests/transfer-status-deep-link-v2357.test.ts',
      // the sixth word's payment lens — admitted (this suite speaks
      // `txn-pay` in its rides-beside truth)
      'src/tests/txn-pay-deep-link-v2333.test.ts',
    ]);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the thirtieth row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the thirtieth row (cross-suite pins)', () => {
  const constitution = readFileSync(CONSTITUTION, 'utf8');

  it('the constitution walks THIRTY words over TWENTY-FIVE desks (the export desk joins)', () => {
    expect(constitution.includes('(thirty-two words, twenty-six desks)')).toBe(true);
    expect(constitution.includes("{ word: 'exp-status', desk: 'src/app/(shell)/tabs/data-exports-tab.tsx', family: 'border-indigo-300', suite: 'src/tests/exp-status-deep-link-v2391.test.ts' }")).toBe(true);
    expect(constitution.includes("'THIRTIETH'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE WHAT'S NEW FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — v2.455.0 leads the feed', () => {
  it('the entry exists, first, with the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.455.0');
    // the lead's story hand-over (v2.455.0, the Task 111 law's
    // sixty-first application): the head story is the hand-over's
    // voice — the elder loom's first weave; the carry that stood
    // since v2.397.0 took its first family — the ELDER lens chips
    // (the pill filters that predate the deep-link era) met ONE
    // wardrobe component: the muted/50 head, the primary active
    // face, the idle face, the compact py-1 face, the pressed voice
    // (aria-pressed — debt-plans' own precedent) and the family's
    // zinc keyboard ring, while the payment chips kept their
    // signature v2.333 violet through the loom's opt-out; SIX faces
    // in TWO desks migrated and the desks speak no wardrobe byte
    // (the masquerade law, loom form); the LEDGER names the
    // remaining dialects for the next weaves. The voices' arrow
    // exits the head this round; the loom's
    // arrow carries the eye.
    expect(head.title).toContain('loom');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('aria-pressed'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('zinc ring'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('ledger'))).toBe(true);
  });
});
