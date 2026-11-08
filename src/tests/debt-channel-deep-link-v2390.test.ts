// THE DEBT LEDGER'S SECOND WORD (v2.390.0): the debt management desk's
// reminder-history channel lens answers the address bar — the family's
// TWENTY-NINTH wearing, the desk's SECOND word, and the desk joins the
// family's TWO-WORD NEGOTIATION club (the transactions and banking
// precedent) in its SAME-PANE form: both lenses live in the History
// pane, so a landing carrying EITHER word raises the pane, and the two
// chips sit side by side — each retiring by its own two voices, never
// touching its sibling's state.
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
// ledger's M-Pesa lens, v2.389.0 the debt ledger's status lens.
// THE PROMISE KEPT A TWENTY-NINTH TIME. The chip wears FUCHSIA at
// 300/100 — the shade-split's SEVENTH application, a hue NO badge on
// this desk speaks (the census answers amber, blue, emerald, green,
// orange, purple, rose and slate) AND one its cyan sibling never
// borrowed. The word's voice is UPPERCASE (the Select's OWN spellings,
// the channel word's voice) and the neutral is the lowercase `all` —
// exactly the Select's own.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  parseInitialNamedMember,
  DEBT_CHANNEL_FILTERS,
} from '@/lib/tab-url';
import { WHATS_NEW } from '@/lib/whats-new';

const DEBT_TAB = 'src/app/(shell)/tabs/debt-management-tab.tsx';

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the same ONE home, one word over)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — ?debt-channel= speaks the ledger\u2019s own vocabulary', () => {
  it('every member of the union answers itself (UPPERCASE, case-sensitive)', () => {
    for (const member of DEBT_CHANNEL_FILTERS) {
      expect(parseInitialNamedMember(`?tab=debt-management&debt-channel=${member}`, 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')).toBe(member);
    }
  });

  it('a lowercase or capitalized word is an unknown word — never a clever match', () => {
    expect(parseInitialNamedMember('?tab=debt-management&debt-channel=sms', 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=debt-management&debt-channel=Email', 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=debt-management&debt-channel=WHATSAPPS', 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=debt-management&debt-channel=garbage', 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=debt-management', 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=debt-management&debt-channel=', 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('debt-channel=IN_APP', 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')).toBe('IN_APP');
    expect(parseInitialNamedMember('?????', 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')).toBe('all');
  });

  it('the word rides BESIDE the other twenty-eight without stealing any of them', () => {
    expect(
      parseInitialNamedMember('?tab=debt-management&debt-channel=WHATSAPP&debt-status=PENDING&bank-mpesa=MATCHED', 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')
    ).toBe('WHATSAPP');
    expect(
      parseInitialNamedMember('?tab=debt-management&debt-channel=EMAIL&tax-type=VAT&po-status=OPEN', 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')
    ).toBe('EMAIL');
    expect(
      parseInitialNamedMember('?tab=debt-management&debt-channel=SMS&et-status=PENDING&txn-pay=CASH&rep-type=trends', 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')
    ).toBe('SMS');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — the same-pane two-word negotiation, cast-free
// ---------------------------------------------------------------------------

describe('the debt management desk — ?debt-channel= lands as visible state', () => {
  const desk = readFileSync(DEBT_TAB, 'utf8');
  const loom = readFileSync('src/components/landing-chip.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'debt-channel', DEBT_CHANNEL_FILTERS, 'all')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.390.0 — THE PROMISE KEPT, THE TWENTY-NINTH WORD')).toBe(true);
  });

  it('the seed is the write-once initializer of the landing (the read-once law)', () => {
    expect(desk.includes('const [landedDebtChannel] = useState<DebtChannelWordValue>(initialDebtChannel);')).toBe(true);
    expect(desk.includes('const [typeFilter, setTypeFilter] = useState<string>(initialDebtChannel);')).toBe(true);
    expect(desk.includes("const [debtChannelLandingLive, setDebtChannelLandingLive] = useState(() => initialDebtChannel() !== 'all');")).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
  });

  it('the seed is CAST-FREE — the member parser answers the union it is', () => {
    expect(desk.includes('function initialDebtChannel(): (typeof DEBT_CHANNEL_FILTERS)[number] {')).toBe(true);
    expect(desk.includes('initialDebtChannel() as')).toBe(false);
    expect(desk.includes('initialDebtChannel as unknown')).toBe(false);
  });

  it('the vocabulary is the Select\u2019s OWN spelling (five members, UPPERCASE neutral lowercase)', () => {
    expect(DEBT_CHANNEL_FILTERS).toEqual([
      'all',
      'SMS',
      'WHATSAPP',
      'EMAIL',
      'IN_APP',
    ]);
    expect(home.includes('export const DEBT_CHANNEL_FILTERS')).toBe(true);
    // the Select's items speak the SAME words (the state keeps the
    // Select's string voice; its four SelectItems ARE the union):
    expect(desk.includes('<SelectItem value="SMS">SMS</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="WHATSAPP">WhatsApp</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="EMAIL">Email</SelectItem>')).toBe(true);
    expect(desk.includes('<SelectItem value="IN_APP">In-App</SelectItem>')).toBe(true);
  });

  it('EVERY hand-driven channel change rides the retirement door', () => {
    expect(desk.includes('const chooseDebtChannel = (v: string) => {')).toBe(true);
    expect(desk.includes('<Select value={typeFilter} onValueChange={chooseDebtChannel}>')).toBe(true);
    // the ONLY direct setTypeFilter calls left are the declaration,
    // the door's own write, and the chip's one-press dismissal:
    const direct = desk.split('\n').filter((l) => l.includes('setTypeFilter(') && !l.includes('const [typeFilter, setTypeFilter]'));
    expect(direct.length).toBe(2);
    expect(direct.some((l) => l.includes('setTypeFilter(v);'))).toBe(true);
    expect(direct.some((l) => l.includes("setTypeFilter('all');"))).toBe(true);
  });

  it('the chip sits BEFORE its lens, BESIDE its cyan sibling (the same-pane position laws)', () => {
    const chip = desk.indexOf('data-testid="debt-channel-landing-word"');
    const lens = desk.indexOf('<Select value={typeFilter} onValueChange={chooseDebtChannel}>');
    const sibling = desk.indexOf('data-testid="debt-status-landing-word"');
    const section = desk.indexOf('function HistorySection');
    expect(chip).toBeGreaterThan(-1);
    expect(lens).toBeGreaterThan(-1);
    expect(sibling).toBeGreaterThan(-1);
    expect(section).toBeGreaterThan(-1);
    expect(chip).toBeLessThan(lens);
    expect(chip).toBeGreaterThan(section);
    expect(sibling).toBeLessThan(chip); // the status chip speaks first (its lens sits first)
  });

  it('EITHER word raises the pane they share (the same-pane negotiation)', () => {
    expect(
      desk.includes("const [activeTab, setActiveTab] = useState(() => (initialDebtStatus() !== 'all' || initialDebtChannel() !== 'all' ? 'history' : 'board'));")
    ).toBe(true);
    // and the pane renders the section both chips live in:
    expect(desk.includes('<TabsContent value="history"')).toBe(true);
    expect(desk.includes('<HistorySection storeId={currentStoreId} />')).toBe(true);
  });

  it('the chip wears FUCHSIA at the 300/100 storey (the seventh shade-split)', () => {
    // v2.394.0 THE LOOM: the wardrobe moved into the loom’s registry —
    // the desk proves its family by hue, the registry carries the bytes.
    expect(desk.includes('hue="fuchsia"')).toBe(true);
    expect(loom.includes('border-fuchsia-300 bg-fuchsia-100 text-fuchsia-700')).toBe(true);
    expect(loom.includes('dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300')).toBe(true);
    expect(loom.includes('focus-visible:ring-fuchsia-400')).toBe(true);
    // a chip hue the desk's badges never speak — the badge census:
    expect(desk.includes('bg-blue-100 text-blue-700')).toBe(true);
    expect(desk.includes('bg-emerald-100 text-emerald-700')).toBe(true);
    expect(desk.includes('bg-rose-100 text-rose-700')).toBe(true);
    // and the sibling chips coexist without colliding:
    expect(desk.includes('hue="cyan"')).toBe(true); // the desk's FIRST word (v2.389.0, through the loom)
    expect(desk.includes('border-purple-300 bg-purple-100')).toBe(false);
    expect(desk.includes('border-sky-300 bg-sky-100')).toBe(false);
    expect(desk.includes('border-orange-300 bg-orange-100')).toBe(false);
    expect(desk.includes('border-teal-300 bg-teal-100')).toBe(false);
    expect(desk.includes('border-lime-300 bg-lime-100')).toBe(false);
    expect(desk.includes('border-fuchsia-200')).toBe(false); // the 200 storey is another desk's voice
  });

  it('the chip is dismissible and annotated (the collision law\u2019s annotation)', () => {
    expect(desk.includes('setDebtChannelLandingLive(false);')).toBe(true);
    expect(desk.includes("THE DEBT LEDGER'S SECOND WORD")).toBe(true);
    expect(desk.includes('?debt-channel=WHATSAPP')).toBe(true);
    expect(desk.includes('data-testid="debt-channel-landing-word"')).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('debt-channel')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`debt-channel` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/debt-management-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      'src/tests/bank-mpesa-deep-link-v2388.test.ts',
      'src/tests/bank-type-deep-link-v2387.test.ts',
      // the desk's FIRST word's ledger — this suite names it (the
      // same-pane negotiation pins its sibling chip)
      'src/tests/debt-channel-deep-link-v2390.test.ts',
      'src/tests/debt-status-deep-link-v2389.test.ts',
      'src/tests/et-status-deep-link-v2381.test.ts',
      // the thirtieth word's own ledger — admitted (its rides-beside
      // truth speaks this word) — an admission line carries the word
      // it admits
      'src/tests/exp-status-deep-link-v2391.test.ts',
      // the thirty-first word's own ledger — admitted (its rides-beside
      // truth speaks this word) — an admission line carries the word
      // it admits
      'src/tests/exp-type-deep-link-v2392.test.ts',
      'src/tests/family-registry-stress-v2370.test.ts',
      // the thirty-second word's own ledger — admitted (its own ledger
      // LISTS this file's path — the third-order ripple: a ledger line
      // carries every word its paths speak)
      // the loom’s own suite — admitted (v2.394.0: the LandingChip
      // loom suite pins this desk’s chip bytes, so the walk lists it)
      'src/tests/landing-chip-loom-v2394.test.ts',
      'src/tests/msg-template-deep-link-v2393.test.ts',
      'src/tests/proxy-gate-layering-v2328.test.ts',
      // rep-type's suite EXITS this ledger at v2.391.0: its feed-head
      // hand-over re-pointed its story pins from this word's lead to
      // the export lead — the hand-over moves speakers honestly (the
      // derivation-assert law: the walk re-derived the list, the exit
      // is as pinned as any admission)
      'src/tests/tax-type-deep-link-v2382.test.ts',
      'src/tests/transfer-status-deep-link-v2357.test.ts',
      'src/tests/txn-pay-deep-link-v2333.test.ts',
    ]);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the twenty-ninth row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the twenty-ninth row (cross-suite pins)', () => {
  const constitution = readFileSync('src/tests/transfer-status-deep-link-v2357.test.ts', 'utf8');

  it('the constitution walks TWENTY-NINE words over TWENTY-FOUR desks (the desk joins the two-word club)', () => {
    expect(constitution.includes('(thirty-three words, twenty-six desks)')).toBe(true);
    expect(constitution.includes("{ word: 'debt-channel', desk: 'src/app/(shell)/tabs/debt-management-tab.tsx', family: 'border-fuchsia-300', suite: 'src/tests/debt-channel-deep-link-v2390.test.ts' }")).toBe(true);
    expect(constitution.includes("'TWENTY-NINTH'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE WHAT'S NEW FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — v2.475.0 leads the feed', () => {
  it('the entry exists, first, with the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.476.0');
    // the lead's story hand-over (v2.476.0, the Task 111 law's
    // eighty-second application): the head story is the hand-over's
    // voice — the carrying round: THE CHORUS RIDES THE CHAT
    // DOOR — the dead-stock ledger's collective word learns its
    // own reach-out: the ledger header grows the Share all handle
    // beside the Copy all handle, one press opening WhatsApp with
    // the WHOLE clearance chorus pre-filled — the SAME
    // deadStockClearanceNotes bytes the clipboard carries, never a
    // re-typed word — pre-addressed to the store's own chat when
    // the branch keeps a phone on file (the contact's phone rides
    // the composer's third word, the ONE home's own guard), the
    // chat picker answering for the branch with none; the composer
    // deadStockChorusShareUrl lives in the ONE home (the desk
    // never spells the host's word), the handle wears the compact
    // face and the share family's emerald hover, the double voice
    // every handle wears, the honesty law holds — it only shows
    // when rows exist, a blocked window speaks its side — the
    // census grows its tenth voice (the dated re-key holds it),
    // and the view/archive law stands: the file, the clipboard's
    // copy all chorus and the print door keep the canonical rows.
    // The chorus rides the chat door.
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('pre-addressed'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('chat picker'))).toBe(true);
  });
});
