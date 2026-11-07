// THE MESSAGING DESK'S FIRST WORD (v2.393.0): the Templates pane answers
// BY THE TEMPLATE — the family's THIRTY-SECOND wearing and its FIRST
// CARD-GRID lens. `?msg-template=debt-reminder` lands the desk with the
// Templates pane RAISED (the sub-tab amendment's fourth application) and
// the nine-card grid narrowed to the one card the word names — "which
// template do I send the debtors?" becomes a bookmark.
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
// status lens, v2.392.0 that ledger's type lens.
// THE PROMISE KEPT A THIRTY-SECOND TIME. The chip wears YELLOW at
// 300/100 — the shade-split's TENTH application, the hue the credits
// desk spoke at the 200 storey (a family byte the 200-storey can never
// equal), a hue NO badge on this desk speaks (the census answers green,
// amber, red, emerald and blue). The word's voice is LOWERCASE (the
// templates grid's OWN spellings — the nine kebab-case ids: christmas |
// new-year | easter | valentine | general-promotion | debt-reminder |
// thank-you | payment-confirmation | balance-update) and the neutral is
// the lowercase `all`. THE FAMILY'S FIRST CARD-GRID LENS: no table, no
// chip row — the grid itself narrows to the landed card while the lens
// lives, and the SUB-TAB AMENDMENT'S FOURTH APPLICATION raises the
// Templates pane the word lands into. The lens's second retirement
// voice is the pane's own hand: pressing Use Template retires the
// landing — acting on the template IS the reader's hand (the family's
// first card-grid voice).

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parseInitialNamedMember } from '@/lib/tab-url';
import { MSG_TEMPLATE_FILTERS, EXP_TYPE_FILTERS } from '@/lib/tab-url';
import { WHATS_NEW } from '@/lib/whats-new';

const DESK = 'src/app/(shell)/tabs/messaging-tab.tsx';
const CONSTITUTION = 'src/tests/transfer-status-deep-link-v2357.test.ts';

// ---------------------------------------------------------------------------
// 1. THE PARSER'S TRUTH TABLE (the membership law, one home, lowercase voice)
// ---------------------------------------------------------------------------

describe('parseInitialNamedMember — ?msg-template= speaks the templates grid\u2019s own vocabulary', () => {
  it('every member of the union answers itself (lowercase, case-sensitive)', () => {
    for (const member of MSG_TEMPLATE_FILTERS) {
      expect(parseInitialNamedMember(`?tab=messaging&msg-template=${member}`, 'msg-template', MSG_TEMPLATE_FILTERS, 'all')).toBe(member);
    }
  });

  it('a capitalized word names nothing — never a clever match', () => {
    // the lens's words are the TEMPLATE IDS (lowercase) — `Christmas`,
    // `Debt-Reminder` and the label's display case name nothing
    expect(parseInitialNamedMember('?tab=messaging&msg-template=Christmas', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=messaging&msg-template=CHRISTMAS', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=messaging&msg-template=Debt-Reminder', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=messaging&msg-template=DEBT_REMINDER', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=messaging&msg-template=garbage', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')).toBe('all');
  });

  it('missing, bare, and malformed searches answer the fallback — never throw', () => {
    expect(parseInitialNamedMember('', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=messaging', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?tab=messaging&msg-template=', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('msg-template=thank-you', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')).toBe('thank-you');
    expect(parseInitialNamedMember('?????', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')).toBe('all');
  });

  it('the word rides BESIDE the other thirty-one without stealing any of them', () => {
    expect(
      parseInitialNamedMember('?tab=messaging&msg-template=debt-reminder&po-status=OPEN&txn-pay=CASH', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')
    ).toBe('debt-reminder');
    expect(
      parseInitialNamedMember('?tab=messaging&msg-template=payment-confirmation&exp-type=debt&debt-channel=SMS', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')
    ).toBe('payment-confirmation');
    expect(
      parseInitialNamedMember('?tab=messaging&msg-template=balance-update&bank-mpesa=MATCHED&tax-type=VAT', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')
    ).toBe('balance-update');
  });

  it('the foreign words stay strangers to this parser (and it to theirs)', () => {
    // the export desk's type word answers its own lens, never this one
    expect(
      parseInitialNamedMember('?tab=messaging&msg-template=christmas&exp-type=products', 'exp-type', EXP_TYPE_FILTERS, 'all')
    ).toBe('products');
    expect(
      parseInitialNamedMember('?tab=messaging&msg-template=christmas&exp-type=products', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')
    ).toBe('christmas');
    // the word alone on the bar lands its own lens (never stranded)
    expect(
      parseInitialNamedMember('?tab=messaging&msg-template=valentine', 'msg-template', MSG_TEMPLATE_FILTERS, 'all')
    ).toBe('valentine');
  });
});

// ---------------------------------------------------------------------------
// 2. THE DESK'S SEED — the card-grid lens, the stage amendment, cast-free
// ---------------------------------------------------------------------------

describe('the messaging desk — ?msg-template= lands as visible state', () => {
  const desk = readFileSync(DESK, 'utf8');
  const loom = readFileSync('src/components/landing-chip.tsx', 'utf8');
  const home = readFileSync('src/lib/tab-url.ts', 'utf8');

  it('the seed reads the word through the ONE home (never a local parser)', () => {
    expect(
      desk.includes("parseInitialNamedMember(window.location.search, 'msg-template', MSG_TEMPLATE_FILTERS, 'all')")
    ).toBe(true);
    expect(home.includes('export function parseInitialNamedMember')).toBe(true);
    expect(home.includes('v2.393.0 — THE PROMISE KEPT, THE THIRTY-SECOND WORD')).toBe(true);
    // the home names the word in backticks (the stress's registry walk)
    expect(home.includes('`msg-template`')).toBe(true);
  });

  it('the seed is the write-once trio of the landing (the read-once law)', () => {
    expect(desk.includes('const [landedMsgTemplate] = useState<MsgTemplateWordValue>(initialMsgTemplate);')).toBe(true);
    expect(desk.includes('const [msgTemplateFilter, setMsgTemplateFilter] = useState<MsgTemplateWordValue>(initialMsgTemplate);')).toBe(true);
    expect(desk.includes("const [msgTemplateLandingLive, setMsgTemplateLandingLive] = useState(() => initialMsgTemplate() !== 'all');")).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'all';")).toBe(true);
  });

  it('the seed is CAST-FREE — the member parser answers the union it is', () => {
    expect(desk.includes('function initialMsgTemplate(): (typeof MSG_TEMPLATE_FILTERS)[number] {')).toBe(true);
    expect(desk.includes('initialMsgTemplate() as')).toBe(false);
    expect(desk.includes('initialMsgTemplate as unknown')).toBe(false);
  });

  it('THE SUB-TAB AMENDMENT\u2019S FOURTH APPLICATION — the stage seed reads the word', () => {
    // a landed template word raises the Templates pane it lands into
    // (a bookmark that pre-narrows a grid the reader cannot see is a
    // stranded bookmark); no view word speaks on this desk, so the
    // template word owns the stage's silence
    expect(desk.includes("initialMsgTemplate() !== 'all' ? 'templates' : 'dashboard'")).toBe(true);
  });

  it('the vocabulary is the grid\u2019s OWN spelling (ten members, lowercase)', () => {
    expect(MSG_TEMPLATE_FILTERS).toEqual([
      'all',
      'christmas',
      'new-year',
      'easter',
      'valentine',
      'general-promotion',
      'debt-reminder',
      'thank-you',
      'payment-confirmation',
      'balance-update',
    ]);
    expect(home.includes('export const MSG_TEMPLATE_FILTERS')).toBe(true);
  });

  it('THE FAMILY\u2019S FIRST CARD-GRID LENS — the grid itself narrows to the landed card', () => {
    // the lens face is the grid: while the landing lives, the
    // nine-card grid narrows to the one card the word names; dismissal
    // widens back to all nine
    expect(desk.includes('const visibleTemplates = useMemo(() => {')).toBe(true);
    expect(desk.includes('return MESSAGE_TEMPLATES.filter((t) => t.id === msgTemplateFilter);')).toBe(true);
    expect(desk.includes('return MESSAGE_TEMPLATES;')).toBe(true);
    // the grid renders the NARROWED list, never the raw one
    expect(desk.includes('{visibleTemplates.map((template) => {')).toBe(true);
    // the count line speaks the narrowing honestly
    expect(desk.includes('Showing {visibleTemplates.length} of {MESSAGE_TEMPLATES.length} templates')).toBe(true);
  });

  it('the chip wears YELLOW at the 300/100 storey (the tenth shade-split)', () => {
    // v2.394.0 THE LOOM: the wardrobe moved into the loom’s registry —
    // the desk proves its family by hue, the registry carries the bytes.
    expect(desk.includes('hue="yellow"')).toBe(true);
    expect(loom.includes('border-yellow-300 bg-yellow-100 text-yellow-700')).toBe(true);
    expect(loom.includes('dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300')).toBe(true);
    expect(loom.includes('focus-visible:ring-yellow-400')).toBe(true);
    // the hue speaks NOWHERE else on the desk — the chip is its only
    // voice (the masquerade law: exactly ONE yellow wardrobe — the
    // light and dark border faces of that one wardrobe):
    // v2.394.0 THE LOOM: the census follows the wardrobe — the desk
    // answers ZERO (the masquerade), the loom speaks the ONE wardrobe
    // (its two border faces, its one bg-100 face):
    expect(desk.split('border-yellow-').length - 1).toBe(0);
    expect(desk.split('bg-yellow-100').length - 1).toBe(0);
    // v2.397.0 THE ELDER LOOM: the credits chip's yellow joins the loom
    // at the 200 storey — the census counts both storeys (4)
    expect(loom.split('border-yellow-').length - 1).toBe(4);
    // the 200 storey's hover:bg-yellow-100 doubles the face (the elder
    // entry's hover form) — 1 -> 2
    expect(loom.split('bg-yellow-100').length - 1).toBe(2);
  });

  it('the chip sits BEFORE the grid it lands into (the position law)', () => {
    const chip = desk.indexOf('data-testid="msg-template-landing-word"');
    const grid = desk.indexOf('{visibleTemplates.map((template) => {');
    const pane = desk.indexOf('<TabsContent value="templates"');
    expect(chip).toBeGreaterThan(-1);
    expect(grid).toBeGreaterThan(-1);
    expect(pane).toBeGreaterThan(-1);
    expect(chip).toBeGreaterThan(pane);
    expect(chip).toBeLessThan(grid);
  });

  it('the chip is dismissible and annotated (the collision law\u2019s annotation)', () => {
    expect(desk.includes('setMsgTemplateLandingLive(false);')).toBe(true);
    expect(desk.includes("THE MESSAGING DESK'S FIRST WORD")).toBe(true);
    expect(desk.includes('?msg-template=debt-reminder')).toBe(true);
    expect(desk.includes('data-testid="msg-template-landing-word"')).toBe(true);
    // the family's shared anatomy — the group-hover dismiss detail:
    // v2.394.0 THE LOOM: the X face’s bytes live in the one loom now
    expect(loom.includes('opacity-60 transition-opacity group-hover:opacity-100')).toBe(true);
  });

  it('THE CARD-GRID LENS\u2019S SECOND VOICE — a Use-Template press rides the retirement door', () => {
    expect(desk.includes('const chooseMsgTemplateFromLens = () => {')).toBe(true);
    // the ONLY direct setMsgTemplateFilter calls left are the
    // declaration, the door's own write, and the chip's one-press
    // dismissal:
    const direct = desk.split('\n').filter((l) => l.includes('setMsgTemplateFilter(') && !l.includes('const [msgTemplateFilter, setMsgTemplateFilter]'));
    expect(direct.length).toBe(2);
    expect(direct.some((l) => l.includes("setMsgTemplateFilter('all');"))).toBe(true);
    // the pane's Use-Template hand routes through the door:
    expect(desk.includes('chooseMsgTemplateFromLens();')).toBe(true);
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
      if (readFileSync(p, 'utf8').includes('msg-template')) collected.push(p);
    }
  }
}

describe('the address-bar vocabulary stays one-writer-per-word', () => {
  it('`msg-template` speaks in exactly the expected files under src/', () => {
    const collected: string[] = [];
    walkSrc('src', collected);
    collected.sort();
    expect(collected).toEqual([
      'src/app/(shell)/tabs/messaging-tab.tsx',
      'src/lib/tab-url.ts',
      'src/lib/whats-new.ts',
      // the twenty-seventh word's own ledger — admitted (its ledger
      // LISTS this suite's path — the third-order ripple: a ledger line
      // carries every word its paths speak)
      'src/tests/bank-mpesa-deep-link-v2388.test.ts',
      // the twenty-sixth word's own ledger — admitted (the same ripple)
      'src/tests/bank-type-deep-link-v2387.test.ts',
      // the twenty-ninth word's own ledger — admitted (the same ripple)
      'src/tests/debt-channel-deep-link-v2390.test.ts',
      // the twenty-eighth word's own ledger — admitted (the same ripple)
      'src/tests/debt-status-deep-link-v2389.test.ts',
      // the thirtieth word's own ledger — admitted (the same ripple)
      'src/tests/exp-status-deep-link-v2391.test.ts',
      // the thirty-first word's own ledger — admitted (the same ripple)
      'src/tests/exp-type-deep-link-v2392.test.ts',
      // the registry stress parses the constitution's rows — the
      // thirty-second row rides through its parse (an honest speaker)
      'src/tests/family-registry-stress-v2370.test.ts',
      // this suite (the word's own ledger — an honest speaker)
      // the loom’s own suite — admitted (v2.394.0: the LandingChip
      // loom suite pins this desk’s chip bytes, so the walk lists it)
      'src/tests/landing-chip-loom-v2394.test.ts',
      'src/tests/msg-template-deep-link-v2393.test.ts',
      // the first word's ledger (the proxy-gate layering suite) —
      // admitted (its ledger LISTS this suite's path — the same ripple)
      'src/tests/proxy-gate-layering-v2328.test.ts',
      // the twenty-third word's own ledger — admitted (the same ripple)
      'src/tests/tax-type-deep-link-v2382.test.ts',
      // the constitution (the vocabulary's registry — the thirty-second
      // row)
      'src/tests/transfer-status-deep-link-v2357.test.ts',
      // the sixth word's payment lens — admitted (its ledger LISTS this
      // suite's path — the same ripple)
      'src/tests/txn-pay-deep-link-v2333.test.ts',
    ]);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CONSTITUTION — the thirty-second row is visible from here
// ---------------------------------------------------------------------------

describe('the address-bar vocabulary — the thirty-second row (cross-suite pins)', () => {
  const constitution = readFileSync(CONSTITUTION, 'utf8');

  it('the constitution walks THIRTY-TWO words over TWENTY-SIX desks (the messaging desk joins)', () => {
    expect(constitution.includes('(thirty-two words, twenty-six desks)')).toBe(true);
    expect(constitution.includes("{ word: 'msg-template', desk: 'src/app/(shell)/tabs/messaging-tab.tsx', family: 'border-yellow-300', suite: 'src/tests/msg-template-deep-link-v2393.test.ts' }")).toBe(true);
    expect(constitution.includes("'THIRTY-SECOND'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE WHAT'S NEW FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — v2.430.0 leads the feed', () => {
  it('the entry exists, first, with the round\u2019s own story', () => {
    const head = WHATS_NEW[0];
    expect(head.version).toBe('2.430.0');
    // the lead's story hand-over (v2.430.0, the Task 111 law's
    // thirty-sixth application): the head story is the hand-over's
    // voice — the census opens: the inventory banner's census chip
    // became the door (orderSupplierBlocks — the census's own
    // grouping, pure: rows by trimmed maker, sorted by name, units
    // summed over the gaps; an unnamed row never invents a block,
    // and a block whose whole ask is zero is refused — the
    // nothing-to-order law, per block), the trigger wears the
    // v2.421 census bytes with the chevron the door's one new word
    // (one item per maker carrying the block's own line-and-unit
    // census — the chip's number and the menu's items share the
    // same rows, the two can never disagree), each press folds ONLY
    // that maker's rows into the same pocket the whole order uses
    // (buildOrderHandoff over block.rows, the one-way write, the
    // walk, the receipt naming the maker), and the whole-order Send
    // keeps its own face beside the door.
    // The echo's story exits the head this round; the
    // census's own door carries the eye.
    expect(head.title).toContain('census');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('one block per supplier'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('never invents a block'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('the receipt names the maker'))).toBe(true);
  });
});
