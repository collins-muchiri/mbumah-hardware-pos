// THE RANGE'S WORD RIDES THE ADDRESS (v2.482.0): the reports desk's time
// lens answers the address bar — the deep-link family's fourteenth
// 300-storey byte — and the range's own face gets its dress.
//
//   • THE RANGE'S WORD — the helpers' bytes (read once on the shell,
//     write back on every hand-driven turn, the DEFAULT strips its key,
//     THE CUSTOM'S HONEST ABSENCE), the lifted state, the one door.
//   • THE FOURTEENTH BYTE — violet joins the 300 registry (the time
//     lens's tone); the loom's wardrobe line; the constitution's
//     thirty-sixth row; the once-only trio census.
//   • THE DRESS — the styling verse: the range whisper's glyph and the
//     tabular figures (the paper's Period line's screen sibling), the
//     custom inputs' From/To labels.
//   • THE SEATS — the elder bytes hold (the memo, the dead-stock stage's
//     three words, the census at ten).
//   • THE FEED — the round leads the feed; the honoured probe ("The
//     sort's word rides the address.") rides the title's chain.
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one voice.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { WHATS_NEW } from '@/lib/whats-new';
import { LANDING_CHIP_HUES, LANDING_CHIP_WARDROBES } from '@/components/landing-chip';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const LOOM = 'src/components/landing-chip.tsx';
const REGISTRY = 'src/tests/transfer-status-deep-link-v2357.test.ts';
const STRESS = 'src/tests/family-registry-stress-v2370.test.ts';

const desk = readFileSync(DESK, 'utf8');
const loom = readFileSync(LOOM, 'utf8');
const registry = readFileSync(REGISTRY, 'utf8');
const stress = readFileSync(STRESS, 'utf8');

// the section's slice — the DeadStockSection component's own bytes
const section = desk.slice(desk.indexOf('function DeadStockSection'), desk.indexOf('// Main Reports Tab Component'));

// ---------------------------------------------------------------------------
// 1. THE RANGE'S WORD — read once, write back, the default strips its key
// ---------------------------------------------------------------------------

describe('the range\u2019s word — the time lens answers the bar', () => {
  it('the read half speaks the desk-prefixed word through the desk\u2019s own tuple', () => {
    expect(desk.includes('function initialRepRange(): DatePreset {')).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'this_month';")).toBe(true);
    expect(desk.includes("parseInitialNamedMember(window.location.search, 'rep-range', [...REP_RANGE_WORDS], 'this_month') as DatePreset")).toBe(true);
    // the words are the SIX NAMED presets' OWN — custom is NOT one of them
    expect(desk.includes("const REP_RANGE_WORDS: readonly DatePreset[] = ['today', 'this_week', 'this_month', 'this_quarter', 'this_year', 'last_month'];")).toBe(true);
  });

  it('THE CUSTOM\u2019S HONEST ABSENCE — a custom landing without its dates would speak an unknown range', () => {
    // the custom face is no word at all: the address never carries it,
    // the made-up-word law's honest reading
    expect(desk.includes("'today', 'this_week', 'this_month', 'this_quarter', 'this_year', 'last_month'")).toBe(true);
    expect(desk.includes("'today', 'this_week', 'this_month', 'this_quarter', 'this_year', 'last_month', 'custom'")).toBe(false);
  });

  it('THE LANDING IS READ ONCE ON THE SHELL — a dismissed chip can never resurrect', () => {
    expect(desk.includes('const [landedRepRange] = useState<DatePreset>(initialRepRange);')).toBe(true);
    expect(desk.includes('const [repRangeLandingLive, setRepRangeLandingLive] = useState(true);')).toBe(true);
  });

  it('THE DEFAULT STRIPS ITS KEY — the address never carries the resting face', () => {
    expect(desk.includes("if (preset === 'this_month') params.delete('rep-range');")).toBe(true);
    expect(desk.includes("else params.set('rep-range', preset);")).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
    expect(desk.includes('function writeRepRangeWord(preset: DatePreset): void {')).toBe(true);
  });

  it('THE ONE DOOR — the set, the retire and the write ride together (a fact ride, never a gate)', () => {
    expect(desk.includes('const chooseRepRange = useCallback((value: DatePreset) => {')).toBe(true);
    expect(desk.includes('    setDatePresetState(value);\n    setRepRangeLandingLive(false);\n    writeRepRangeWord(value);')).toBe(true);
  });

  it('THE AGREEMENT IS NO NEWS — a hand change retires the landing chip (the window\u2019s own law)', () => {
    expect(desk.includes('if (datePreset === value) {')).toBe(true);
  });

  it('THE LIFT PROOF — the old setter byte is GONE, the chips press through the door', () => {
    expect(desk.includes("useState<DatePreset>('this_month')")).toBe(false);
    expect(desk.includes('onClick={() => chooseRepRange(preset.id)}')).toBe(true);
    expect((desk.match(/setDatePreset\(/g) ?? []).length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 2. THE FOURTEENTH BYTE — violet joins the 300 registry
// ---------------------------------------------------------------------------

describe('the fourteenth byte — violet, the time lens\u2019s tone', () => {
  it('the loom\u2019s registry grew the hue and the wardrobe line', () => {
    expect(loom.includes("  'violet',")).toBe(true);
    expect(loom.includes("  violet: 'border-violet-300 bg-violet-100 text-violet-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20',")).toBe(true);
  });

  it('the chip rides the desk\u2019s own preset row', () => {
    expect(desk.includes('hue="violet"')).toBe(true);
    expect(desk.includes('label={`landed ?rep-range=${landedRepRange}`}')).toBe(true);
    expect(desk.includes('data-testid="rep-range-landing-word"')).toBe(true);
    expect(desk.includes('press to clear it')).toBe(true);
  });

  it('THE DEFAULT WEARS NO CHIP — the chip names a non-default range', () => {
    expect(desk.includes("repRangeLandingLive && landedRepRange !== 'this_month'")).toBe(true);
  });

  it('the constitution grew its thirty-sixth row and its own count', () => {
    expect(registry.includes("{ word: 'rep-range', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-violet-300', suite: 'src/tests/rep-range-address-v2482.test.ts' }")).toBe(true);
    expect(registry.includes('(forty-five words, thirty desks)')).toBe(true);
  });

  it('the stress walks the roll and the derived counts (35 \u2192 36)', () => {
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
    expect(stress.includes('toBe(45)')).toBe(true);
    expect(stress.includes("      'rep-range',")).toBe(true);
  });

  it('THE ONCE-ONLY CENSUS — the violet 300-trio lives in exactly one src file (the loom)', () => {
    const trio = 'border-violet-300 bg-violet-100 text-violet-700';
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

  it('the formula keeps proving the registry — the fourteenth line speaks', () => {
    // v2.482.0 (dated): fourteen hues — violet joined with the range's
    // own word; the seventh weave's formula composes every line.
    // v2.484.0 (dated): the living registry pin rolls (the museum's own
    // ENTRY pins stay 2.482.0 forever — the v2470 law).
    // v2.485.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to sixteen (the period's green).
    // v2.486.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to seventeen (the queue's red).
    // v2.487.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to eighteen (the shift's slate).
    expect(LANDING_CHIP_HUES.length).toBe(18);
    for (const hue of LANDING_CHIP_HUES) {
      expect(loom.includes(`  ${hue}: 'border-${hue}-300`), hue).toBe(true);
    }
    expect(LANDING_CHIP_WARDROBES.violet).toContain('hover:bg-violet-200');
  });
});

// ---------------------------------------------------------------------------
// 3. THE DRESS — the styling verse
// ---------------------------------------------------------------------------

describe('the range\u2019s own dress — the whisper and the inputs', () => {
  it('the whisper wears the family\u2019s glyph and the tabular figures', () => {
    expect(desk.includes('<CardDescription className="text-xs mt-1 flex items-center gap-1">')).toBe(true);
    expect(desk.includes('<Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />')).toBe(true);
    expect(desk.includes('<span className="tabular-nums">{dateRangeDisplay}</span>')).toBe(true);
  });

  it('the custom inputs wear the From/To labels and the tabular figures', () => {
    expect(desk.includes('<span className="text-[10px] text-muted-foreground">From</span>')).toBe(true);
    expect(desk.includes('<span className="text-[10px] text-muted-foreground">To</span>')).toBe(true);
    // v2.483.0 (dated): the dark picker's dress joined the className —
    // the round's own ground verse (the pair's honest share) rolled the
    // byte.
    expect((desk.match(/className="h-8 text-xs w-36 tabular-nums dark:\[color-scheme:dark\]"/g) ?? []).length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 4. THE SEATS — the elder bytes keep their places
// ---------------------------------------------------------------------------

describe('the seats — the round moves the range, the elder bytes hold', () => {
  it('the preset memo and the sync effect keep their bytes', () => {
    expect(desk.includes('const presetRange = useMemo(() => getDatePresetRange(datePreset), [datePreset]);')).toBe(true);
    expect(desk.includes('if (datePreset !== \'custom\') {')).toBe(true);
    expect(desk.includes('}, [datePreset]);')).toBe(true);
  });

  it('the dead-stock stage\u2019s three words keep their bytes (the sort\u2019s lift, the lens\u2019s door)', () => {
    expect(desk.includes('const [deadStockSort, setDeadStockSortState] = useState<DeadStockSortKey>(initialDeadSort);')).toBe(true);
    expect(desk.includes('setDeadStockSort={chooseDeadSort}')).toBe(true);
    expect(desk.includes('setDeadStockSearch={chooseDeadQuery}')).toBe(true);
  });

  it('the shape\u2019s presses keep both their seats (the lens\u2019s own door)', () => {
    expect((desk.match(/onPress=\{\(label\) => setDeadStockSearch\(label\)\}/g) ?? []).length).toBe(2);
  });

  it('the census keeps its ten voices — a chip and a bar never carry a handle', () => {
    expect(section.split('aria-label=').length - 1).toBe(10);
  });

  it('the section\u2019s chip row keeps its three faces (the window, the lens, the order)', () => {
    expect(section.includes('hue="rose"')).toBe(true);
    expect(section.includes('hue="amber"')).toBe(true);
    expect(section.includes('hue="emerald"')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round, pinned in the feed', () => {
  it('the head wears the round\u2019s own story — the honoured probe and the new word', () => {
    // v2.483.0 THE MUSEUM RE-KEY (the v2470 treatment): the round's own
    // entry is FOUND, not assumed to lead — the feed rides the living
    // head, the museum keeps the round's own word; the guard comes with
    // the find.
    const head = WHATS_NEW.find((e) => e.version === '2.482.0');
    if (!head) throw new Error('the 2.482.0 entry is gone from the feed');
    expect(head.version).toBe('2.482.0');
    expect(head.title).toContain('the sort\u2019s word rides the address');
    expect(head.title).toContain('the range\u2019s word rides the address');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.title).toContain('the paper speaks the window\u2019s word');
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?rep-range='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('violet joins the 300 registry'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('(hue, storey)'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE CUSTOM\u2019S HONEST ABSENCE'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('tabular-nums'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('ONE home'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.488.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.482.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.482.0]')).toBeLessThan(changelog.indexOf('[2.481.0]'));
  });
});
