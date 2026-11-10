// THE SORT'S WORD RIDES THE ADDRESS (v2.481.0): the dead-stock sort door
// answers the address bar — the deep-link family's thirteenth 300-storey
// byte — and the (hue, storey) registry grows PROPER.
//
//   • THE ORDER'S WORD — the helpers' bytes (read once on the shell,
//     write back on every hand-driven turn, the DEFAULT strips its key),
//     the lifted state, the one door.
//   • THE THIRTEENTH BYTE — emerald joins the 300 registry (the ledger's
//     own green); the loom's wardrobe line; the constitution's
//     thirty-fifth row; the once-only trio census.
//   • THE REGISTRY PROPER — the seventh weave: the one parametric formula
//     proven byte-for-byte against every literal line both storeys speak,
//     the storey line ENFORCED (a hue that never spoke at a storey
//     throws), the registry tying the two arrays.
//   • THE PRESSED COLUMN'S OWN LIGHT — the styling verse: the pressed
//     head's bg-muted/50 ground, the family's own, never a second
//     palette.
//   • THE SEATS — the elder bytes hold (the memo, the header voices, the
//     view/archive law, the census at ten).
//   • THE FEED — the round leads the feed; the honoured probe ("The
//     lens's word rides the address.") rides the title's chain.
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one voice.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { WHATS_NEW } from '@/lib/whats-new';
import {
  LANDING_CHIP_HUES,
  LANDING_CHIP_WARDROBES,
  LANDING_CHIP_HUES_200,
  LANDING_CHIP_WARDROBES_200,
  LANDING_CHIP_STOREYS,
  LANDING_CHIP_REGISTRY,
  landingChipSpeaksAt,
  landingChipWardrobe,
} from '@/components/landing-chip';
import { DEAD_STOCK_SORTS, sortDeadStockRows } from '@/lib/reports/dead-stock';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const LOOM = 'src/components/landing-chip.tsx';
const REGISTRY = 'src/tests/transfer-status-deep-link-v2357.test.ts';
const STRESS = 'src/tests/family-registry-stress-v2370.test.ts';
const HOME = 'src/lib/reports/dead-stock.ts';

const desk = readFileSync(DESK, 'utf8');
const loom = readFileSync(LOOM, 'utf8');
const registry = readFileSync(REGISTRY, 'utf8');
const stress = readFileSync(STRESS, 'utf8');
const home = readFileSync(HOME, 'utf8');

// the section's slice — the DeadStockSection component's own bytes
const section = desk.slice(desk.indexOf('function DeadStockSection'), desk.indexOf('// Main Reports Tab Component'));

// ---------------------------------------------------------------------------
// 1. THE ORDER'S WORD — read once, write back, the default strips its key
// ---------------------------------------------------------------------------

describe('the order\u2019s word — the sort door answers the bar', () => {
  it('the read half speaks the desk-prefixed word through the ONE home\u2019s own tuple', () => {
    expect(desk.includes('function initialDeadSort(): DeadStockSortKey {')).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'capital';")).toBe(true);
    expect(desk.includes("parseInitialNamedMember(window.location.search, 'dead-sort', [...DEAD_STOCK_SORTS], 'capital') as DeadStockSortKey")).toBe(true);
    // the words are the ONE home's OWN — the desk never re-types them
    expect(home.includes("export const DEAD_STOCK_SORTS: readonly DeadStockSortKey[] = ['capital', 'idle'];")).toBe(true);
    expect(desk.includes('DEAD_STOCK_SORTS, DEAD_STOCK_WINDOWS')).toBe(true);
  });

  it('THE LANDING IS READ ONCE ON THE SHELL — a dismissed chip can never resurrect', () => {
    expect(desk.includes('const [landedDeadSort] = useState<DeadStockSortKey>(initialDeadSort);')).toBe(true);
    expect(desk.includes('const [deadSortLandingLive, setDeadSortLandingLive] = useState(true);')).toBe(true);
  });

  it('THE DEFAULT STRIPS ITS KEY — the address never carries the resting face', () => {
    expect(desk.includes("if (key === 'capital') params.delete('dead-sort');")).toBe(true);
    expect(desk.includes("else params.set('dead-sort', key);")).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
    expect(desk.includes('function writeDeadSortWord(key: DeadStockSortKey): void {')).toBe(true);
  });

  it('THE ONE DOOR — the set, the retire and the write ride together (a fact ride, never a gate)', () => {
    expect(desk.includes('const chooseDeadSort = useCallback((value: DeadStockSortKey) => {')).toBe(true);
    expect(desk.includes('    setDeadStockSortState(value);\n    setDeadSortLandingLive(false);\n    writeDeadSortWord(value);')).toBe(true);
  });

  it('THE AGREEMENT IS NO NEWS — a hand change retires the landing chip (the window\u2019s own law)', () => {
    expect(desk.includes('if (deadStockSort === value) {')).toBe(true);
    expect(desk.includes('    // THE AGREEMENT IS NO NEWS (the window\'s own law): a hand-driven')).toBe(true);
  });

  it('THE ORDER SURVIVES THE PANE — the state is lifted beside the window\u2019s and the lens\u2019s own', () => {
    expect(desk.includes('const [deadStockSort, setDeadStockSortState] = useState<DeadStockSortKey>(initialDeadSort);')).toBe(true);
    // THE LIFT PROOF: the section's own state line is GONE — the section
    // wears the desk's word (a pane switch can never reset what the
    // address named)
    expect(desk.includes("useState<DeadStockSortKey>('capital')")).toBe(false);
  });

  it('the setter-shaped prop keeps every elder byte (the section speaks the same words)', () => {
    expect(desk.includes('setDeadStockSort={chooseDeadSort}')).toBe(true);
    expect(desk.includes('deadStockSort={deadStockSort}')).toBe(true);
    expect(desk.includes('onDismissDeadSortLanding={() => setDeadSortLandingLive(false)}')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE THIRTEENTH BYTE — emerald joins the 300 registry
// ---------------------------------------------------------------------------

describe('the thirteenth byte — emerald, the ledger\u2019s own green', () => {
  it('the loom\u2019s registry grew the hue and the wardrobe line', () => {
    expect(loom.includes("  'emerald',")).toBe(true);
    expect(loom.includes("  emerald: 'border-emerald-300 bg-emerald-100 text-emerald-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20',")).toBe(true);
  });

  it('the chip rides the section\u2019s lens row beside the window\u2019s and the lens\u2019s own', () => {
    expect(section.includes('hue="emerald"')).toBe(true);
    expect(section.includes('label={`landed ?dead-sort=${landedDeadSort}`}')).toBe(true);
    expect(section.includes('data-testid="dead-sort-landing-word"')).toBe(true);
    expect(section.includes('press to clear it')).toBe(true);
  });

  it('THE DEFAULT WEARS NO CHIP — the chip names a non-default order', () => {
    expect(section.includes("deadSortLandingLive && landedDeadSort !== 'capital'")).toBe(true);
  });

  it('the constitution grew its thirty-eighth row and its own count', () => {
    // v2.483.0 (dated): the pair — the custom's dates ride beside the
    // custom's word; the count rolls with the constitution.
    // v2.482.0 (dated): the thirty-sixth word — the range's own word
    // rides the address; the count rolls with the constitution.
    expect(registry.includes("{ word: 'dead-sort', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-emerald-300', suite: 'src/tests/dead-stock-sort-address-v2481.test.ts' }")).toBe(true);
    expect(registry.includes('(fifty-three words, thirty-three desks)')).toBe(true);
  });

  it('the stress walks the roll and the derived counts (36 \u2192 38)', () => {
    // v2.483.0 (dated): the pair — the roll and the counts grew again.
    // v2.482.0 (dated): the roll and the counts grew with the registry.
    // v2.484.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty (the window's round); the contains-pin
    // rides the bytes that ARE.
    // v2.485.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-three (the period's round); the
    // contains-pin rides the bytes that ARE.
    // v2.486.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-four (the queue's round); the
    // contains-pin rides the bytes that ARE.
    // v2.487.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-five (the shift's round); the
    // contains-pin rides the bytes that ARE.
    // v2.489.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-six (the dashboard's round); the
    // contains-pin rides the bytes that ARE.
    // v2.490.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-seven (the counter's round); the
    // contains-pin rides the bytes that ARE.
    // v2.491.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-eight (the catalog's round); the
    // contains-pin rides the bytes that ARE.
    // v2.492.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to forty-nine (the analytics' round); the
    // contains-pin rides the bytes that ARE.
    // v2.493.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to fifty (the catalog's category round); the
    // contains-pin rides the bytes that ARE.
    // v2.494.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to fifty-one (the counter's category round); the
    // contains-pin rides the bytes that ARE.
    // v2.495.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to fifty-two (the inventory's category round); the
    // contains-pin rides the bytes that ARE.
    // v2.496.0 (dated): the living stress-pin rolls — the stress's
    // row count grew to fifty-three (the ledger's order round); the
    // contains-pin rides the bytes that ARE.
    expect(stress.includes('toBe(53)')).toBe(true);
    expect(stress.includes("      'dead-sort',")).toBe(true);
  });

  it('THE ONCE-ONLY CENSUS — the emerald 300-trio lives in exactly one src file (the loom)', () => {
    const trio = 'border-emerald-300 bg-emerald-100 text-emerald-700';
    const walk = (dir: string, acc: string[]): string[] => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) {
          if (e.name === 'node_modules' || e.name === '.next' || e.name === '.roundtrip-baseline') continue;
          walk(p, acc);
        } else if (/\.tsx$/.test(e.name) && acc.length < 4000) {
          acc.push(p);
        }
      }
      return acc;
    };
    const files = walk('src', []).filter((p) => readFileSync(p, 'utf8').includes(trio));
    expect(files.map((p) => p.replace(/\\/g, '/'))).toEqual([LOOM]);
  });
});

// ---------------------------------------------------------------------------
// 3. THE REGISTRY PROPER — the seventh weave: one formula, two storeys
// ---------------------------------------------------------------------------

describe('the registry proper — the (hue, storey) weave', () => {
  it('the loom names the registry, the storeys and the formula', () => {
    expect(loom.includes('export const LANDING_CHIP_STOREYS')).toBe(true);
    expect(loom.includes('export const LANDING_CHIP_REGISTRY')).toBe(true);
    expect(loom.includes('export function landingChipWardrobe')).toBe(true);
    expect(loom.includes('export function landingChipSpeaksAt')).toBe(true);
  });

  it('THE REGISTRY TIES THE TWO ARRAYS — one source of truth', () => {
    expect([...LANDING_CHIP_STOREYS]).toEqual([300, 200]);
    expect(LANDING_CHIP_REGISTRY[300]).toEqual(LANDING_CHIP_HUES);
    expect(LANDING_CHIP_REGISTRY[200]).toEqual(LANDING_CHIP_HUES_200);
  });

  it('THE FORMULA IS THE 300 WARDROBE — all fifteen lines, byte for byte', () => {
    // v2.484.0 (dated): fifteen hues — blue joined with the people
    // window's word; the formula reproduces every literal line.
    // v2.482.0 (dated): fourteen hues — violet joined with the range's
    // own word; the formula reproduces every literal line.
    // v2.481.0 (dated): thirteen hues — emerald joined with the sort
    // door's word; the formula reproduces every literal line.
    // v2.484.0 (dated): the living registry pin rolls (the museum's own
    // ENTRY pins stay 2.481.0 forever — the v2470 law).
    // v2.485.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to sixteen (the period's green); the pin rides
    // the bytes that ARE.
    // v2.486.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to seventeen (the queue's red); the pin rides
    // the bytes that ARE.
    // v2.487.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to eighteen (the shift's slate); the pin rides
    // the bytes that ARE.
    // v2.496.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to nineteen (the ledger's zinc).
    expect(LANDING_CHIP_HUES.length).toBe(19);
    for (const hue of LANDING_CHIP_HUES) {
      expect(landingChipWardrobe(hue, 300), hue).toBe(LANDING_CHIP_WARDROBES[hue]);
    }
  });

  it('THE FORMULA IS THE 200 WARDROBE — all twenty-two lines, byte for byte', () => {
    expect(LANDING_CHIP_HUES_200.length).toBe(22);
    for (const hue of LANDING_CHIP_HUES_200) {
      expect(landingChipWardrobe(hue, 200), hue).toBe(LANDING_CHIP_WARDROBES_200[hue]);
    }
  });

  it('THE STOREY LINE IS ENFORCED — a hue that never spoke at a storey throws', () => {
    // the 200-only hues answer false at the 300 storey — the wardrobe
    // throws honestly instead of dressing a stranger (no undefined
    // wardrobe, no masquerade)
    // v2.484.0 (dated): blue LEFT the stranger list — the people
    // window's word brought it to the 300 storey; the family grew, the
    // guard stays honest.
    // v2.482.0 (dated): violet LEFT the stranger list — the range's own
    // word brought it to the 300 storey; the family grew, the guard
    // stays honest.
    // v2.485.0 (dated): green LEFT the stranger list — the ledger's
    // period brought it to the 300 storey; the family grew, the guard
    // stays honest.
    // v2.486.0 (dated): red LEFT the stranger list — the queue's
    // own word brought it to the 300 storey; the family grew, the
    // guard stays honest.
    // v2.487.0 (dated): slate LEFT the stranger list — the shift's
    // own word brought it to the 300 storey; the family grew, the
    // guard stays honest.
    // v2.496.0 (dated): zinc LEFT the stranger list — the ledger's
    // order word (the transactions desk's sort) promoted the debt
    // desk's 200-storey hue one storey deeper; the guard stays honest.
    for (const hue of ['neutral', 'gray', 'stone'] as const) {
      expect(landingChipSpeaksAt(hue, 300), hue).toBe(false);
      expect(() => landingChipWardrobe(hue, 300)).toThrow(`the ${hue} hue never spoke at the 300 storey`);
      expect(landingChipSpeaksAt(hue, 200), hue).toBe(true);
    }
  });

  it('THE TWO-STOREY HUES ANSWER TRUE AT BOTH — the shade-split\u2019s own voices', () => {
    // every hue that ever grew a line speaks at both its storeys; sky
    // predates the split and speaks both
    for (const hue of LANDING_CHIP_HUES) {
      expect(landingChipSpeaksAt(hue, 300), hue).toBe(true);
      expect(landingChipSpeaksAt(hue, 200), hue).toBe(true);
    }
  });

  it('the ONE home\u2019s orders compose — the tuple the parser reads', () => {
    expect([...DEAD_STOCK_SORTS]).toEqual(['capital', 'idle']);
    // the orders still compose: the resting face and the patience, pure
    const rows = [
      { capitalTied: 100, daysIdle: 10 as number | null, name: 'a' },
      { capitalTied: 900, daysIdle: null, name: 'b' },
      { capitalTied: 300, daysIdle: 50 as number | null, name: 'c' },
    ];
    expect(sortDeadStockRows(rows as never, 'capital').map((r) => r.name)).toEqual(['b', 'c', 'a']);
    expect(sortDeadStockRows(rows as never, 'idle').map((r) => r.name)).toEqual(['b', 'c', 'a']);
  });
});

// ---------------------------------------------------------------------------
// 4. THE PRESSED COLUMN'S OWN LIGHT — the styling verse
// ---------------------------------------------------------------------------

describe('the pressed column\u2019s own light — the head wears a ground', () => {
  it('the pressed head wears the bg-muted/50 ground, the resting one none', () => {
    expect(section.includes("className={`text-right transition-colors ${deadStockSort === 'capital' ? 'bg-muted/50' : ''}`}")).toBe(true);
    expect(section.includes("className={`text-right transition-colors ${deadStockSort === 'idle' ? 'bg-muted/50' : ''}`}")).toBe(true);
  });

  it('the light is the family\u2019s own — muted, never a second palette', () => {
    // no new hue words ride the header row: the ground is the shared
    // muted token, the move rides transition-colors
    expect((section.match(/bg-muted\/50/g) ?? []).length).toBe(2);
    expect(section.includes('transition-colors ${deadStockSort')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE SEATS — the elder bytes keep their places
// ---------------------------------------------------------------------------

describe('the seats — the round moves the order, the elder bytes hold', () => {
  it('the memo composes in the ONE home and rides its own deps', () => {
    expect(desk.includes('sortDeadStockRows(filterDeadStockRows(rows, deadStockSearch), deadStockSort)')).toBe(true);
    expect(desk.includes('[rows, deadStockSearch, deadStockSort]')).toBe(true);
  });

  it('the two headers keep their double voice — aria-label and title', () => {
    expect(desk.includes('data-testid="dead-stock-sort-capital"')).toBe(true);
    expect(desk.includes('data-testid="dead-stock-sort-idle"')).toBe(true);
    expect(desk.includes('aria-label="Sort the ledger by capital tied, the loudest debt first"')).toBe(true);
    expect(desk.includes('aria-label="Sort the ledger by days idle, the never-sold first"')).toBe(true);
  });

  it('the pressed column speaks aria-sort — descending, and only while pressed', () => {
    expect(desk.includes("aria-sort={deadStockSort === 'capital' ? 'descending' : undefined}")).toBe(true);
    expect(desk.includes("aria-sort={deadStockSort === 'idle' ? 'descending' : undefined}")).toBe(true);
  });

  it('the family\u2019s arrows keep their seats — ArrowDown pressed, ChevronsUpDown resting', () => {
    expect((desk.match(/<ChevronsUpDown className="h-3 w-3 opacity-60" aria-hidden="true" \/>/g) ?? []).length).toBe(2);
    expect((desk.match(/<ArrowDown className="h-3 w-3" aria-hidden="true" \/>/g) ?? []).length).toBe(2);
  });

  it('THE VIEW/ARCHIVE LAW — the file and the clipboard keep the canonical rows', () => {
    expect(desk.includes('deadStockClearanceNotes(rows, days)')).toBe(true);
    expect((desk.match(/sortDeadStockRows\(deadStockRows/g) ?? []).length).toBe(0);
  });

  it('the shape\u2019s presses keep both their seats (the lens\u2019s own door)', () => {
    expect((desk.match(/onPress=\{\(label\) => setDeadStockSearch\(label\)\}/g) ?? []).length).toBe(2);
    expect((desk.match(/pressedLabel=\{deadStockSearch\.trim\(\)\}/g) ?? []).length).toBe(2);
  });

  it('the census keeps its ten voices — a chip and a bar never carry a handle', () => {
        // v2.498.0 re-key (dated): the section grows its ELEVENTH and
    // TWELFTH voices — the action arc's two row doors (the Clear handle
    // and the Write off handle, the double voice every handle wears);
    // the census speaks the section's twelve handles now, and the
    // elder bytes this suite pins stand untouched.
    expect(section.split('aria-label=').length - 1).toBe(12);
  });
});

// ---------------------------------------------------------------------------
// 6. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round, pinned in the feed', () => {
  it('the head wears the round\u2019s own story — the honoured probe and the new word', () => {
    // v2.482.0 THE MUSEUM RE-KEY (the v2470 treatment): the round's own
    // entry is FOUND, not assumed to lead — the feed rides the living
    // head, the museum keeps the round's own word; the guard comes with
    // the find.
    const head = WHATS_NEW.find((e) => e.version === '2.481.0');
    if (!head) throw new Error('the 2.481.0 entry is gone from the feed');
    expect(head.version).toBe('2.481.0');
    expect(head.title).toContain('the lens\u2019s word rides the address');
    expect(head.title).toContain('the sort\u2019s word rides the address');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.title).toContain('the paper speaks the window\u2019s word');
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?dead-sort='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('emerald joins the 300 registry'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('(hue, storey)'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('seventh weave'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('DEAD_STOCK_SORTS'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('bg-muted/50'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('ONE home'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.498.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.481.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.481.0]')).toBeLessThan(changelog.indexOf('[2.480.0]'));
  });
});
