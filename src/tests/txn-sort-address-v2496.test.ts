// THE LEDGER'S ORDER RIDES THE ADDRESS (v2.496.0): the transactions
// desk's sort answers the bar — the deep-link family's fifty-third word
// (the ledger's order, the desk's THIRD word after the payment lens's
// v2.333 word and the type lens's v2.354 word) — born wearing the
// family's ONE reading (the guarded door, the hand's turn retires the
// word). THE MUSEUM SHAPE FROM BIRTH: every pin in this suite rides
// 2.496.0 forever (the find-based head, the dated release surfaces) —
// the walk-exclusion nuance honours it from the round it was born.
//
//   • THE ORDER'S WORD — the helpers' bytes (the ONE home's own orders,
//     read once on the shell, write back on every turned head, THE
//     DEFAULT WEARS NO WORD), the parser's truth table (live, through
//     the generic membership law).
//   • THE THREE FACES — the Date head, the Total head and the chip's
//     own dismissal all ride the one door (born guarded).
//   • THE CHIP + THE DRESS — the landed order wears the zinc landing
//     chip (the family's twenty-third 300-storey byte: the debt desk's
//     200-storey hue one storey deeper); the active head lights its
//     column and the honest aria-sort names the reading.
//   • THE REGISTRY — the constitution's fifty-third row, read from the
//     constitution file itself (the registry is the input, never a
//     copy); the census holds (fifty-three words, thirty-three desks,
//     forty-one families — zinc LEFT the stranger list).
//     sorted place: txn-pay < txn-sort < txn-type (the ledger's own
//     order).
//   • THE FEED — the round leads the feed (found in the living feed —
//     the find + the guard come together, the museum shape from birth;
//     this suite's own head pin rides 2.496.0 forever).
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one
//     voice.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';
import { parseInitialNamedMember } from '@/lib/tab-url';

const DESK = 'src/app/(shell)/tabs/transactions-tab.tsx';
const HOME = 'src/lib/tab-url.ts';
const LOOM = 'src/components/landing-chip.tsx';
const CONSTITUTION = 'src/tests/transfer-status-deep-link-v2357.test.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');
const loom = readFileSync(LOOM, 'utf8');
const constitution = readFileSync(CONSTITUTION, 'utf8');

// the desk's OWN orders, mirrored from the desk file (the suite's own
// voice — the tuple pin in section 1 proves the mirror honest)
const TXN_SORTS = ['newest', 'oldest', 'total-desc', 'total-asc'] as const;

// ---------------------------------------------------------------------------
// 1. THE ORDER'S WORD — read once, write back, THE DEFAULT WEARS NO WORD
// ---------------------------------------------------------------------------

describe('the ledger\u2019s order — the rows answer the bar in order', () => {
  it('the ONE home names the fifty-third word (the verse and the law\u2019s own bytes)', () => {
    expect(home.includes("THE FAMILY'S FIFTY-THIRD WORD")).toBe(true);
    expect(home.includes('v2.496.0')).toBe(true);
    expect(home.includes('`txn-sort`')).toBe(true);
    // the desk-prefixed byte checked nowhere before this word (the verse
    // carries the collision-check's own record)
    expect(home.includes('collision-checked at round start')).toBe(true);
    // the older words stay untouched (the membership law's home, live)
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
  });

  it('the desk keeps and exports the orders (the tuple the desk and the suite speak)', () => {
    expect(desk.includes("export const TXN_SORTS = ['newest', 'oldest', 'total-desc', 'total-asc'] as const;")).toBe(true);
    expect(desk.includes('export type TxnSort = (typeof TXN_SORTS)[number];')).toBe(true);
    // the parser home reads the desk's OWN tuple through the generic law
    expect(desk.includes("return parseInitialNamedMember(window.location.search, 'txn-sort', TXN_SORTS, 'newest');")).toBe(true);
    // the landing reads once on the shell (the desk's THIRD word)
    expect(desk.includes('function initialTxnSort(): TxnSort {')).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'newest';")).toBe(true);
  });

  it('the parser\u2019s truth table (live — a made-up order is an unknown word)', () => {
    // a real order lands WHOLE
    expect(parseInitialNamedMember('?txn-sort=oldest', 'txn-sort', TXN_SORTS, 'newest')).toBe('oldest');
    expect(parseInitialNamedMember('?txn-sort=total-desc', 'txn-sort', TXN_SORTS, 'newest')).toBe('total-desc');
    expect(parseInitialNamedMember('?txn-sort=total-asc', 'txn-sort', TXN_SORTS, 'newest')).toBe('total-asc');
    expect(parseInitialNamedMember('?tab=transactions&txn-sort=total-asc', 'txn-sort', TXN_SORTS, 'newest')).toBe('total-asc');
    // an absent or empty value is silence (the default wears no word)
    expect(parseInitialNamedMember('?tab=transactions', 'txn-sort', TXN_SORTS, 'newest')).toBe('newest');
    expect(parseInitialNamedMember('?txn-sort=', 'txn-sort', TXN_SORTS, 'newest')).toBe('newest');
    // a made-up order is an unknown word, not a clever match
    expect(parseInitialNamedMember('?txn-sort=asc', 'txn-sort', TXN_SORTS, 'newest')).toBe('newest');
    expect(parseInitialNamedMember('?txn-sort=amount-desc', 'txn-sort', TXN_SORTS, 'newest')).toBe('newest');
    // the case law holds (the words are lowercase like the type lens's own)
    expect(parseInitialNamedMember('?txn-sort=OLDEST', 'txn-sort', TXN_SORTS, 'newest')).toBe('newest');
    // a foreign desk's prefix is silence
    expect(parseInitialNamedMember('?txn-type=refund', 'txn-sort', TXN_SORTS, 'newest')).toBe('newest');
    expect(parseInitialNamedMember('?dead-sort=idle', 'txn-sort', TXN_SORTS, 'newest')).toBe('newest');
  });

  it('THE DEFAULT WEARS NO WORD (the write half strips the resting key)', () => {
    expect(desk.includes(`if (value === 'newest') params.delete('txn-sort');`)).toBe(true);
    expect(desk.includes(`else params.set('txn-sort', value);`)).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
    // a blocked write is the order's silence, never a thrown desk
    expect(desk.includes('// The address never lies louder than the rows')).toBe(true);
    // the SSR guard rides the write half too
    expect(desk.includes('function writeTxnSortWord(value: TxnSort): void {')).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return;")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE ONE DOOR — born guarded (the family's ONE reading); three faces
// ---------------------------------------------------------------------------

describe('the ledger\u2019s ONE door — every face rides together', () => {
  it('the guarded door from birth (no turn, no write; the hand retires the word)', () => {
    expect(desk.includes('const chooseTxnSort = (next: TxnSort) => {')).toBe(true);
    expect(desk.includes('if (next === txnSort) return;')).toBe(true);
    expect(desk.includes('setTxnSort(next);')).toBe(true);
    expect(desk.includes('if (next !== landedTxnSort) setTxnSortLandingLive(false);')).toBe(true);
    expect(desk.includes('writeTxnSortWord(next);')).toBe(true);
    // the landing states (read once on the shell — a dismissed chip can
    // never resurrect)
    expect(desk.includes('const [txnSort, setTxnSort] = useState<TxnSort>(initialTxnSort);')).toBe(true);
    expect(desk.includes('const [landedTxnSort] = useState<TxnSort>(initialTxnSort);')).toBe(true);
    expect(desk.includes('const [txnSortLandingLive, setTxnSortLandingLive] = useState(true);')).toBe(true);
  });
  it('the THREE faces ride the one door (the Date head, the Total head, the dismissal)', () => {
    // the Date head rides the door (its own cycle: newest↔oldest)
    expect(desk.includes("onClick={() => chooseTxnSort(txnSort === 'newest' ? 'oldest' : 'newest')}")).toBe(true);
    // the Total head rides the door (its own cycle: total-desc↔total-asc)
    expect(desk.includes("onClick={() => chooseTxnSort(txnSort === 'total-desc' ? 'total-asc' : 'total-desc')}")).toBe(true);
    // the chip's dismissal retires through the same door (resting the
    // order — the write strips the key)
    expect(desk.includes("setTxnSortLandingLive(false);\n                  chooseTxnSort('newest');")).toBe(true);
  });
  it('the sort\u2019s wires sort the lensed rows honestly (the memo\u2019s own bytes)', () => {
    // the default wears no word AND does no work
    expect(desk.includes("if (txnSort !== 'newest') {")).toBe(true);
    expect(desk.includes('rows.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());')).toBe(true);
    expect(desk.includes('rows.sort((a, b) => b.totalAmount - a.totalAmount);')).toBe(true);
    expect(desk.includes('rows.sort((a, b) => a.totalAmount - b.totalAmount);')).toBe(true);
    // the memo knows its dependency (the order rides the lensed rows)
    expect(desk.includes('[lensedRows, transactions, debouncedSearch, typeFilter, amountFilterMin, amountFilterMax, txnSort]')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE CHIP + THE DRESS — zinc speaks the 300 storey (the census kept)
// ---------------------------------------------------------------------------

describe('the landed order wears the zinc landing chip and the heads wear the light', () => {
  it('the chip speaks the family\u2019s twenty-third 300-storey byte through the loom', () => {
    expect(desk.includes('hue="zinc"')).toBe(true);
    expect(desk.includes('label={`landed ?txn-sort=${landedTxnSort}`}')).toBe(true);
    expect(desk.includes('data-testid="txn-sort-landing-word"')).toBe(true);
    // the loom's zinc line exists (the registry grew one line — the
    // SINGLE-LINE law: one entry, one line, the grep finds the wardrobe)
    expect(loom.includes(`zinc: 'border-zinc-300 bg-zinc-100 text-zinc-700`)).toBe(true);
    // the promotion's array line carries its dated verse
    expect(loom.includes("v2.496.0: zinc's promotion")).toBe(true);
    // the storey line holds (the registry's honest door)
    expect(loom.includes('export const LANDING_CHIP_STOREYS = [300, 200] as const;')).toBe(true);
  });
  it('THE DRESS — the active head lights its column and the honest aria-sort names the reading', () => {
    // the shared muted ground (never a second palette), the move riding
    // transition-colors
    expect(desk.includes('transition-colors ${txnSort === \'newest\' || txnSort === \'oldest\' ? \'bg-muted/50\' : \'\'}')).toBe(true);
    expect(desk.includes('transition-colors ${txnSort === \'total-desc\' || txnSort === \'total-asc\' ? \'bg-muted/50\' : \'\'}')).toBe(true);
    // the honest grammar: aria-sort names the reading on both heads
    expect(desk.includes("aria-sort={txnSort === 'newest' ? 'descending' : txnSort === 'oldest' ? 'ascending' : undefined}")).toBe(true);
    expect(desk.includes("aria-sort={txnSort === 'total-desc' ? 'descending' : txnSort === 'total-asc' ? 'ascending' : undefined}")).toBe(true);
    // the two heads carry the walk's handles
    expect(desk.includes('data-testid="txn-sort-date"')).toBe(true);
    expect(desk.includes('data-testid="txn-sort-total"')).toBe(true);
    // the arrow voices: the active order speaks its direction, the
    // resting head wears the quiet chevrons
    expect(desk.includes('<ArrowDown className="h-3 w-3" aria-hidden="true" />')).toBe(true);
    expect(desk.includes('<ArrowUp className="h-3 w-3" aria-hidden="true" />')).toBe(true);
    expect(desk.includes('<ChevronsUpDown className="h-3 w-3 opacity-60" aria-hidden="true" />')).toBe(true);
  });
  it('the zinc 300-trio census was machine-kept (no src file wore the trio before the line)', () => {
    // the trio's only src speakers are the loom's own line and the
    // formula that composes it — the desk never spells the bytes bare
    const trio = 'border-zinc-300 bg-zinc-100 text-zinc-700';
    const bare = readFileSync('src/app/(shell)/tabs/transactions-tab.tsx', 'utf8');
    expect(bare.includes(trio)).toBe(false);
    // the loom composes the tail parametrically (the formula's own bytes)
    expect(loom.includes('border-${hue}-${steps.border} bg-${hue}-${steps.bg}')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE REGISTRY — the constitution's fifty-third row
// ---------------------------------------------------------------------------

describe('the constitution walks the fifty-third word', () => {
  it('the row is the registry\u2019s own (the self-reference, read from the constitution file)', () => {
    expect(constitution.includes("{ word: 'txn-sort', desk: 'src/app/(shell)/tabs/transactions-tab.tsx', family: 'border-zinc-300', suite: 'src/tests/txn-sort-address-v2496.test.ts' }")).toBe(true);
    expect(constitution.includes('(fifty-three words, thirty-three desks)')).toBe(true);
    // the admission line carries the word it admits (the ledger's own order)
    expect(constitution.includes("the ledger's order word's own ledger — admitted")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself (the museum shape from birth)
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story — the honoured chain and the new word', () => {
    const head = WHATS_NEW.find((e) => e.version === '2.496.0');
    if (!head) throw new Error('the 2.496.0 entry is gone from the feed');
    expect(head.version).toBe('2.496.0');
    expect(head.title).toContain('the hand\u2019s turn retires the word');
    expect(head.title).toContain('the inventory\u2019s category rides the address');
    expect(head.title).toContain('the ledger\u2019s order rides the address');
    expect(head.title).toContain('one breath');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?txn-sort='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THIRD word'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('guarded door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE DEFAULT WEARS NO WORD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('fifty-three words, thirty-three desks, forty-one families'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.497.1');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    expect(readFileSync('VERSION', 'utf8').trim()).toBe('2.497.1');
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.496.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.496.0]')).toBeLessThan(changelog.indexOf('[2.495.0]'));
  });
});
