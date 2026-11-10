// THE INVENTORY'S CATEGORY RIDES THE ADDRESS (v2.495.0): the inventory
// desk's category lens answers the bar — the deep-link family's
// fifty-second word (the inventory's category, the desk's SECOND word,
// the SLUG-SHAPE LAW's third wearer — the store's own rows named by
// their derived slugs, the catalog's wire having led the law, the
// counter's followed) — born wearing the family's ONE reading (the
// guarded door, the hand's turn retires the word).
//
//   • THE STOCK ROWS' WORD — the helpers' bytes (read once on the
//     shell, the SLUG-SHAPE LAW's slug reader, write back on every
//     turned lens, THE DEFAULT WEARS NO WORD), the one door, the
//     guarded reading, the landing's resolve.
//   • THE FIVE FACES — the Select, the All chip, the tribe's chips,
//     the honest clear-all and the delete reset all ride the one door.
//   • THE CHIP + THE DRESS — the landed category wears the slate
//     landing chip (the family's shared voice, the loom's wardrobe,
//     no new hue); the chip's triple condition (resolved slugs only);
//     the lens trigger and the tribe's own chip row wear the slate
//     family's quiet ground while a non-default shelf rides.
//   • THE REGISTRY — the constitution's fifty-second row, read from
//     the constitution file itself (the registry is the input, never
//     a copy); the census holds (fifty-two words, thirty-three desks,
//     forty families — the family's shared slate serves eight words).
//     sorted place: hr- < inv-category < inv-status (the ledger's own
//     order).
//   • THE FEED — the round leads the feed (found in the living feed —
//     the find + the guard come together, the museum shape from birth;
//     this suite's own head pin rides 2.495.0 forever).
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one
//     voice.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';
import { categorySlug, parseInitialNamedSlug } from '@/lib/tab-url';

const DESK = 'src/app/(shell)/tabs/inventory-tab.tsx';
const HOME = 'src/lib/tab-url.ts';
const LOOM = 'src/components/landing-chip.tsx';
const CONSTITUTION = 'src/tests/transfer-status-deep-link-v2357.test.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');
const loom = readFileSync(LOOM, 'utf8');
const constitution = readFileSync(CONSTITUTION, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE STOCK ROWS' WORD — read once, resolve on the rows, write back
// ---------------------------------------------------------------------------

describe('the inventory\u2019s category — the stock rows answer the bar by name', () => {
  it('the ONE home keeps the SLUG-SHAPE LAW (the slug is derived, never stored)', () => {
    expect(home.includes('THE SLUG-SHAPE LAW (v2.493.0)')).toBe(true);
    expect(home.includes('export function categorySlug(name: string): string {')).toBe(true);
    expect(home.includes('export function parseInitialNamedSlug(search: string, key: string): string | null {')).toBe(true);
    // the shape's THIRD wearer is named in the law's own home
    expect(home.includes("shape's THIRD wearer: `?inv-category=<slug>` (v2.495.0")).toBe(true);
    // the home's own note carries the round's stamp and the word's
    // backticked name (the ONE home names every speaker)
    expect(home.includes('v2.495.0')).toBe(true);
    expect(home.includes('`inv-category`')).toBe(true);
    expect(home.includes("THE FAMILY'S FIFTY-SECOND WORD")).toBe(true);
  });

  it('the slug law wears the ledger\u2019s own names (derived, stable, lowercase)', () => {
    expect(categorySlug('Nails & Screws')).toBe('nails-screws');
    expect(categorySlug('Iron Bars')).toBe('iron-bars');
    expect(categorySlug('Cement & Building')).toBe('cement-building');
    expect(categorySlug('Cement')).toBe('cement');
    expect(categorySlug('  Paints  ')).toBe('paints');
  });

  it('the word answers the bar through the honest slug reader (never case-gamed)', () => {
    // a real slug lands WHOLE
    expect(parseInitialNamedSlug('?inv-category=nails-screws', 'inv-category')).toBe('nails-screws');
    expect(parseInitialNamedSlug('?tab=inventory&inv-category=iron-bars', 'inv-category')).toBe('iron-bars');
    // an absent or empty value is silence
    expect(parseInitialNamedSlug('?tab=inventory', 'inv-category')).toBe(null);
    expect(parseInitialNamedSlug('?inv-category=', 'inv-category')).toBe(null);
    // a foreign desk's prefix is silence
    expect(parseInitialNamedSlug('?inv-stock=low', 'inv-category')).toBe(null);
  });

  it('THE DEFAULT WEARS NO WORD (the write half strips the resting key)', () => {
    expect(desk.includes(`if (!slug) params.delete('inv-category');`)).toBe(true);
    expect(desk.includes(`else params.set('inv-category', slug);`)).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
    // a blocked write is the stock rows' silence, never a thrown desk
    expect(desk.includes('// The address never lies louder than the stock rows')).toBe(true);
    // the landing reads once on the shell (the inventory desk's SECOND word)
    expect(desk.includes('function initialInvCategory(): string | null {')).toBe(true);
    expect(desk.includes('if (typeof window === \'undefined\') return null;')).toBe(true);
    expect(desk.includes("return parseInitialNamedSlug(window.location.search, 'inv-category');")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE ONE DOOR — born guarded (the family's ONE reading); five faces
// ---------------------------------------------------------------------------

describe('the stock rows\u2019 ONE door — every face rides together', () => {
  it('the guarded door from birth (no turn, no write; the hand retires the word)', () => {
    expect(desk.includes('const chooseInvCategory = (next: string) => {')).toBe(true);
    expect(desk.includes('if (next === selectedCategory) return;')).toBe(true);
    expect(desk.includes('setSelectedCategory(next);')).toBe(true);
    expect(desk.includes('if (next !== landedInvCategoryId) setInvCategoryLandingLive(false);')).toBe(true);
    expect(desk.includes('writeInvCategorySlug(hit ? categorySlug(hit.name) : null);')).toBe(true);
  });
  it('the FIVE faces ride the one door (the Select, the All chip, the tribe\u2019s chips, the clear-all, the delete reset)', () => {
    // the Select rides the door
    expect(desk.includes('onValueChange={chooseInvCategory}')).toBe(true);
    // the All chip rides the door
    expect(desk.includes("onClick={() => chooseInvCategory('all')}")).toBe(true);
    // the tribe's chips ride the door
    expect(desk.includes('onClick={() => chooseInvCategory(c.id === selectedCategory ? \'all\' : c.id)}')).toBe(true);
    // the honest clear-all rides the door
    expect(desk.includes("chooseInvCategory('all'); setLandingLive(false);")).toBe(true);
    // the delete reset rides the door (the deleted row's word strips)
    expect(desk.includes("chooseInvCategory('all');")).toBe(true);
    // the landing's resolve: the rows arrive and the slug finds its row
    // (the render-adjust shape — a guarded derivation seeding state
    // during render, no effect, no cascade)
    expect(desk.includes('if (landedInvCategory && !landedInvCategoryId && !categoriesLoading && categories.length > 0) {')).toBe(true);
    expect(desk.includes('const hit = categories.find((c) => categorySlug(c.name) === landedInvCategory);')).toBe(true);
    // the landing states (read once on the shell — a dismissed chip can
    // never resurrect)
    expect(desk.includes('const [landedInvCategory, setLandedInvCategory] = useState<string | null>(initialInvCategory);')).toBe(true);
    expect(desk.includes('const [invCategoryLandingLive, setInvCategoryLandingLive] = useState(true);')).toBe(true);
    expect(desk.includes('const [landedInvCategoryId, setLandedInvCategoryId] = useState<string | null>(null);')).toBe(true);
  });
  it('the chip\u2019s dismissal retires through the same door (resolved slugs only)', () => {
    expect(desk.includes('invCategoryLandingLive && landedInvCategory && landedInvCategoryId && (')).toBe(true);
    expect(desk.includes("setInvCategoryLandingLive(false); chooseInvCategory('all');")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE CHIP + THE DRESS — the family's shared voice, no new hue
// ---------------------------------------------------------------------------

describe('the landed category wears the slate landing chip and the lens wears its ground', () => {
  it('the chip speaks the family\u2019s shared slate through the loom', () => {
    expect(desk.includes('hue="slate"')).toBe(true);
    expect(desk.includes('label={`landed ?inv-category=${landedInvCategory}`}')).toBe(true);
    expect(desk.includes('data-testid="inv-category-landing-word"')).toBe(true);
    // the loom's slate line exists (no new wardrobe line — the census holds)
    expect(loom.includes(`slate: 'border-slate-300 bg-slate-100 text-slate-700`)).toBe(true);
  });
  it('THE DRESS — the lens trigger and the tribe\u2019s row wear the quiet ground while a non-default shelf rides', () => {
    // the Select trigger wears the slate family's quiet ground (the
    // catalog lens's own dress law), easing as it arrives
    expect(desk.includes(`selectedCategory !== 'all' ? 'bg-slate-100' : 'bg-background'`)).toBe(true);
    expect(desk.includes('w-full sm:w-48 transition-colors')).toBe(true);
    // the tribe's own chip row wears the same ground (the dress lives
    // where the row lives — the wrap row's rounded ground rolls with
    // the lens)
    expect(desk.includes(`flex flex-wrap gap-2 px-1 py-0.5 rounded-lg transition-colors ${'$'}{`)).toBe(true);
    expect(desk.includes(`'bg-slate-100' : 'bg-background'\n        }`)).toBe(true);
    // the honest grammar holds (the tribe's aria-pressed rides its own law)
    expect(desk.includes("aria-pressed={selectedCategory === c.id}")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE REGISTRY — the constitution's fifty-second row
// ---------------------------------------------------------------------------

describe('the constitution walks the fifty-second word', () => {
  it('the row is the registry\u2019s own (the self-reference, read from the constitution file)', () => {
    expect(constitution.includes("{ word: 'inv-category', desk: 'src/app/(shell)/tabs/inventory-tab.tsx', family: 'border-slate-300', suite: 'src/tests/inv-category-address-v2495.test.ts' }")).toBe(true);
    expect(constitution.includes('(fifty-three words, thirty-three desks)')).toBe(true);
    // the admission line carries the word it admits (the ledger's own order)
    expect(constitution.includes("the inventory's category word's own ledger — admitted")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself (the museum shape from birth)
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story — the honoured chain and the new word', () => {
    const head = WHATS_NEW.find((e) => e.version === '2.495.0');
    if (!head) throw new Error('the 2.495.0 entry is gone from the feed');
    expect(head.version).toBe('2.495.0');
    expect(head.title).toContain('the hand\u2019s turn retires the word');
    expect(head.title).toContain('the counter\u2019s category rides the address');
    expect(head.title).toContain('the inventory\u2019s category rides the address');
    expect(head.title).toContain('one breath');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?inv-category='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('SLUG-SHAPE LAW'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('SECOND word'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('guarded door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE DEFAULT WEARS NO WORD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('fifty-two words, thirty-three desks, forty families'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.498.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    expect(readFileSync('VERSION', 'utf8').trim()).toBe('2.498.0');
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.495.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.495.0]')).toBeLessThan(changelog.indexOf('[2.494.0]'));
  });
});
