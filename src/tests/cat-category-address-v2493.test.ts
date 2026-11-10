// THE CATALOG'S CATEGORY RIDES THE ADDRESS (v2.493.0): the catalog
// desk's category lens answers the bar — the deep-link family's
// fiftieth word (the catalog's category, the desk's THIRD word, the
// SLUG-SHAPE LAW's first dynamic wearer — the store's own rows named
// by their derived slugs) — born wearing the family's ONE reading (the
// guarded door, the hand's turn retires the word).
//
//   • THE SHELVES' WORD — the helpers' bytes (read once on the shell,
//     the SLUG-SHAPE LAW's slug reader, write back on every turned
//     shelf, THE DEFAULT WEARS NO WORD), the one door, the guarded
//     reading, the landing's resolve.
//   • THE CHIP — the landed category wears the slate landing chip (the
//     family's shared voice, the loom's wardrobe, no new hue); the
//     chip's triple condition (resolved slugs only).
//   • THE DRESS — the lens wears the slate family's quiet ground while
//     a non-default shelf rides (the pressed face and its chip speak
//     one voice); the three handles ride the one door.
//   • THE REGISTRY — the constitution's fiftieth row, read from
//     the constitution file itself (the registry is the input, never a
//     copy); the census holds (fifty words, thirty-three desks,
//     forty families — the family's shared slate serves six words).
//     sorted place: bank-type < cat-category < cat-stock (the ledger's
//     own order).
//   • THE FEED — the round leads the feed (found in the living feed —
//     the find + the guard come together, the museum shape from birth).
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one
//     voice.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';
import { categorySlug, parseInitialNamedSlug } from '@/lib/tab-url';

const DESK = 'src/app/(shell)/tabs/catalog-tab.tsx';
const HOME = 'src/lib/tab-url.ts';
const LOOM = 'src/components/landing-chip.tsx';
const CONSTITUTION = 'src/tests/transfer-status-deep-link-v2357.test.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');
const loom = readFileSync(LOOM, 'utf8');
const constitution = readFileSync(CONSTITUTION, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE SHELVES' WORD — read once, resolve on the rows, write back
// ---------------------------------------------------------------------------

describe('the catalog\u2019s category — the shelves answer the bar by name', () => {
  it('the ONE home keeps the SLUG-SHAPE LAW (the slug is derived, never stored)', () => {
    expect(home.includes('THE SLUG-SHAPE LAW (v2.493.0)')).toBe(true);
    expect(home.includes('export function categorySlug(name: string): string {')).toBe(true);
    expect(home.includes('export function parseInitialNamedSlug(search: string, key: string): string | null {')).toBe(true);
    // the home's own note carries the round's stamp and the word's
    // backticked name (the ONE home names every speaker)
    expect(home.includes('v2.493.0')).toBe(true);
    expect(home.includes('`cat-category`')).toBe(true);
  });

  it('the slug law wears the ledger\u2019s own names (derived, stable, lowercase)', () => {
    expect(categorySlug('Nails & Screws')).toBe('nails-screws');
    expect(categorySlug('Iron Bars')).toBe('iron-bars');
    expect(categorySlug('Timber & Wood')).toBe('timber-wood');
    expect(categorySlug('Cement')).toBe('cement');
    expect(categorySlug('  Paints  ')).toBe('paints');
  });

  it('the word answers the bar through the honest slug reader (never case-gamed)', () => {
    // a real slug lands WHOLE
    expect(parseInitialNamedSlug('?cat-category=nails-screws', 'cat-category')).toBe('nails-screws');
    expect(parseInitialNamedSlug('?tab=catalog&cat-category=iron-bars', 'cat-category')).toBe('iron-bars');
    // an absent or empty value is silence
    expect(parseInitialNamedSlug('?tab=catalog', 'cat-category')).toBe(null);
    expect(parseInitialNamedSlug('?cat-category=', 'cat-category')).toBe(null);
    // a foreign desk's prefix is silence
    expect(parseInitialNamedSlug('?cat-view=list', 'cat-category')).toBe(null);
  });

  it('THE DEFAULT WEARS NO WORD (the write half strips the resting key)', () => {
    expect(desk.includes(`if (!slug) params.delete('cat-category');`)).toBe(true);
    expect(desk.includes(`else params.set('cat-category', slug);`)).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
    // a blocked write is the shelves' silence, never a thrown desk
    expect(desk.includes('// The address never lies louder than the shelves')).toBe(true);
    // the landing reads once on the shell (the desk's THIRD word)
    expect(desk.includes('function initialCatCategory(): string | null {')).toBe(true);
    expect(desk.includes('if (typeof window === \'undefined\') return null;')).toBe(true);
    expect(desk.includes("return parseInitialNamedSlug(window.location.search, 'cat-category');")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE ONE DOOR — born guarded (the family's ONE reading)
// ---------------------------------------------------------------------------

describe('the shelves\u2019 ONE door — the turn and the retire ride together', () => {
  it('the guarded door from birth (no turn, no write; the hand retires the word)', () => {
    expect(desk.includes('const chooseCategory = (next: string) => {')).toBe(true);
    expect(desk.includes('if (next === selectedCategory) return;')).toBe(true);
    expect(desk.includes('setSelectedCategory(next);')).toBe(true);
    expect(desk.includes('if (next !== landedCatCategoryId) setCatCategoryLandingLive(false);')).toBe(true);
    expect(desk.includes('writeCatCategorySlug(hit ? categorySlug(hit.name) : null);')).toBe(true);
  });
  it('ALL THREE faces ride the one door (the Select, the All button, the category chips)', () => {
    expect(desk.includes('onValueChange={chooseCategory}')).toBe(true);
    expect(desk.includes("onClick={() => chooseCategory('all')}")).toBe(true);
    expect(desk.includes('onClick={() => chooseCategory(c.id)}')).toBe(true);
    // the landing's resolve: the rows arrive and the slug finds its row
    // (the render-adjust shape — a guarded derivation seeding state
    // during render, no effect, no cascade)
    expect(desk.includes('if (landedCatCategory && !landedCatCategoryId && !categoriesLoading && safeCategories.length > 0) {')).toBe(true);
    expect(desk.includes('const hit = safeCategories.find((c) => categorySlug(c.name) === landedCatCategory);')).toBe(true);
    // the stable guard: the shelf rows wear their own useMemo
    expect(desk.includes('const safeCategories = useMemo(')).toBe(true);
    expect(desk.includes('const [landedCatCategory, setLandedCatCategory] = useState<string | null>(initialCatCategory);')).toBe(true);
    expect(desk.includes('const [catCategoryLandingLive, setCatCategoryLandingLive] = useState(true);')).toBe(true);
    expect(desk.includes('const [landedCatCategoryId, setLandedCatCategoryId] = useState<string | null>(null);')).toBe(true);
  });
  it('the chip\u2019s dismissal retires through the same door (resolved slugs only)', () => {
    expect(desk.includes('catCategoryLandingLive && landedCatCategory && landedCatCategoryId && (')).toBe(true);
    expect(desk.includes("setCatCategoryLandingLive(false); chooseCategory('all');")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE CHIP + THE DRESS — the family's shared voice, no new hue
// ---------------------------------------------------------------------------

describe('the landed category wears the slate landing chip and the lens wears its ground', () => {
  it('the chip speaks the family\u2019s shared slate through the loom', () => {
    expect(desk.includes('hue="slate"')).toBe(true);
    expect(desk.includes('label={`landed ?cat-category=${landedCatCategory}`}')).toBe(true);
    expect(desk.includes('data-testid="cat-category-landing-word"')).toBe(true);
    // the loom's slate line exists (no new wardrobe line — the census holds)
    expect(loom.includes(`slate: 'border-slate-300 bg-slate-100 text-slate-700`)).toBe(true);
  });
  it('THE DRESS — the pressed face and its chip speak one voice (the desk\u2019s own byte order)', () => {
    // the lens wears the slate family's quiet ground while a
    // non-default shelf rides, easing as it arrives
    expect(desk.includes(`'h-9 transition-colors',`)).toBe(true);
    expect(desk.includes(`selectedCategory !== 'all' ? 'bg-slate-100' : 'bg-background',`)).toBe(true);
    // the axe shape: the desk never presses a muted aria-pressed
    expect(desk.includes('aria-pressed')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. THE REGISTRY — the constitution's fiftieth row
// ---------------------------------------------------------------------------

describe('the constitution walks the fiftieth word', () => {
  it('the row is the registry\u2019s own (the self-reference, read from the constitution file)', () => {
    expect(constitution.includes("{ word: 'cat-category', desk: 'src/app/(shell)/tabs/catalog-tab.tsx', family: 'border-slate-300', suite: 'src/tests/cat-category-address-v2493.test.ts' }")).toBe(true);
    expect(constitution.includes('(fifty-three words, thirty-three desks)')).toBe(true);
    // the admission line carries the word it admits (the ledger's own order)
    expect(constitution.includes("the catalog's newest ledger — admitted")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself (the museum shape from birth)
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story — the honoured chain and the new word', () => {
    const head = WHATS_NEW.find((e) => e.version === '2.493.0');
    if (!head) throw new Error('the 2.493.0 entry is gone from the feed');
    expect(head.version).toBe('2.493.0');
    expect(head.title).toContain('the hand\u2019s turn retires the word');
    expect(head.title).toContain('the analytics\u2019 period rides the address');
    expect(head.title).toContain('the catalog\u2019s view rides the address');
    expect(head.title).toContain('the catalog\u2019s category rides the address');
    expect(head.title).toContain('one breath');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?cat-category='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('SLUG-SHAPE LAW'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THIRD word'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('guarded door'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE DEFAULT WEARS NO WORD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('fifty words, thirty-three desks, forty families'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.497.1');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    expect(readFileSync('VERSION', 'utf8').trim()).toBe('2.497.1');
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.493.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.493.0]')).toBeLessThan(changelog.indexOf('[2.492.0]'));
  });
});
