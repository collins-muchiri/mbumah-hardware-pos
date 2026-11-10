// THE CUSTOM'S DATES RIDE THE ADDRESS (v2.483.0): the reports desk's
// custom face speaks its whole word — the deep-link family's
// thirty-seventh word (the pair) — and the custom scratch gets its
// ground.
//
//   • THE PAIR'S WORD — the helpers' bytes (read once on the shell,
//     write back on every scratched day, THE CUSTOM'S HONEST SHARE:
//     custom lands only with both its days riding), the one door.
//   • THE COLLISION LESSON — the bare from/to were taken (the loyalty
//     ledger's legacy window); the pair wears the desk's own prefix.
//   • THE GROUND — the styling verse: the scratch's joined card, the
//     day inputs' own handles, the dark picker's dress, one label per
//     end (the stray separator retired).
//   • THE SEATS — the elder bytes hold (the range's word, the census
//     at ten, the section's three chip faces).
//   • THE FEED — the round leads the feed; the honoured probe ("The
//     range's word rides the address.") rides the title's chain.
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one voice.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';
import { parseInitialCustomRange } from '@/lib/tab-url';

const DESK = 'src/app/(shell)/tabs/reports-tab.tsx';
const HOME = 'src/lib/tab-url.ts';
const REGISTRY = 'src/tests/transfer-status-deep-link-v2357.test.ts';
const STRESS = 'src/tests/family-registry-stress-v2370.test.ts';

const desk = readFileSync(DESK, 'utf8');
const home = readFileSync(HOME, 'utf8');
const registry = readFileSync(REGISTRY, 'utf8');
const stress = readFileSync(STRESS, 'utf8');

// the section's slice — the DeadStockSection component's own bytes
const section = desk.slice(desk.indexOf('function DeadStockSection'), desk.indexOf('// Main Reports Tab Component'));

// ---------------------------------------------------------------------------
// 1. THE PAIR'S WORD — read once, write back, the honest share speaks WHOLE
// ---------------------------------------------------------------------------

describe('the pair\u2019s word — the custom face answers the bar', () => {
  it('the ONE home keeps the pair\u2019s parser (the validator\u2019s own law)', () => {
    expect(home.includes('export function parseInitialCustomRange(')).toBe(true);
    expect(home.includes('const from = honestDayKey(params.get(fromKey));')).toBe(true);
    expect(home.includes('const to = honestDayKey(params.get(toKey));')).toBe(true);
    // the pair speaks WHOLE or not at all — the never-strand law's own
    // reading grown to two bytes
    expect(home.includes('if (!from || !to) return null;')).toBe(true);
    // the range word must BE custom — no other word carries the pair
    expect(home.includes('if (params.get(rangeKey) !== rangeValue) return null;')).toBe(true);
  });

  it('the parser proves real calendar days only — a made-up date is an unknown word', () => {
    expect(parseInitialCustomRange('?rep-range=custom&rep-from=2026-02-30&rep-to=2026-01-31', 'rep-range', 'custom', 'rep-from', 'rep-to')).toBeNull();
    expect(parseInitialCustomRange('?rep-range=custom&rep-from=2026-01-01&rep-to=2026-13-01', 'rep-range', 'custom', 'rep-from', 'rep-to')).toBeNull();
    expect(parseInitialCustomRange('?rep-range=custom&rep-from=not-a-day&rep-to=2026-01-31', 'rep-range', 'custom', 'rep-from', 'rep-to')).toBeNull();
    expect(parseInitialCustomRange('?rep-range=custom&rep-from=2026-01-01', 'rep-range', 'custom', 'rep-from', 'rep-to')).toBeNull();
    // the whole word speaks
    expect(parseInitialCustomRange('?rep-range=custom&rep-from=2026-01-01&rep-to=2026-01-31', 'rep-range', 'custom', 'rep-from', 'rep-to')).toEqual({ from: '2026-01-01', to: '2026-01-31' });
    // no other range's word carries the pair
    expect(parseInitialCustomRange('?rep-range=this_week&rep-from=2026-01-01&rep-to=2026-01-31', 'rep-range', 'custom', 'rep-from', 'rep-to')).toBeNull();
    // a different desk's prefix never answers (the desk-prefix law)
    expect(parseInitialCustomRange('?ly-from=2026-01-01&ly-to=2026-01-31', 'rep-range', 'custom', 'rep-from', 'rep-to')).toBeNull();
  });

  it('THE CUSTOM\u2019S HONEST SHARE — custom lands only with both its days riding', () => {
    expect(desk.includes("if (parseInitialCustomRange(window.location.search, 'rep-range', 'custom', 'rep-from', 'rep-to')) return 'custom';")).toBe(true);
    // the named words' parser keeps its own line (the made-up range is
    // an unknown word — the v2.482 law intact)
    expect(desk.includes("parseInitialNamedMember(window.location.search, 'rep-range', [...REP_RANGE_WORDS], 'this_month') as DatePreset")).toBe(true);
  });

  it('THE LANDING IS READ ONCE ON THE SHELL — the pair lands into the inputs', () => {
    expect(desk.includes('function initialCustomRange(): { from: string; to: string } | null {')).toBe(true);
    expect(desk.includes('const [landedCustomRange] = useState<{ from: string; to: string } | null>(initialCustomRange);')).toBe(true);
    expect(desk.includes('const [dateFrom, setDateFrom] = useState(landedCustomRange?.from ?? presetRange.from);')).toBe(true);
    expect(desk.includes('const [dateTo, setDateTo] = useState(landedCustomRange?.to ?? presetRange.to);')).toBe(true);
  });

  it('THE DATES WRITE BACK — the pair\u2019s own write rides every scratch', () => {
    expect(desk.includes('function writeCustomRangeWord(from: string, to: string): void {')).toBe(true);
    expect(desk.includes("    params.set('rep-range', 'custom');")).toBe(true);
    expect(desk.includes("    params.set('rep-from', from);")).toBe(true);
    expect(desk.includes("    params.set('rep-to', to);")).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
  });

  it('THE DATES RETIRE WITH THE CUSTOM\u2019S WORD — a named preset strips the pair', () => {
    expect(desk.includes("    // THE DATES RETIRE WITH THE CUSTOM'S WORD (v2.483.0): a named")).toBe(true);
    expect(desk.includes('    if (preset !== \'custom\') {')).toBe(true);
    expect(desk.includes("      params.delete('rep-from');")).toBe(true);
    expect(desk.includes("      params.delete('rep-to');")).toBe(true);
  });

  it('THE DATES\u2019 OWN DOOR — the set, the retire and the write ride together', () => {
    expect(desk.includes("const chooseCustomDate = useCallback((which: 'from' | 'to', value: string) => {")).toBe(true);
    expect(desk.includes('    if (value === current) return; // THE AGREEMENT IS NO NEWS')).toBe(true);
    expect(desk.includes("onChange={(e) => chooseCustomDate('from', e.target.value)}")).toBe(true);
    expect(desk.includes("onChange={(e) => chooseCustomDate('to', e.target.value)}")).toBe(true);
    // the custom choice writes the dates the desk already holds
    expect(desk.includes('if (value === \'custom\') writeCustomRangeWord(dateFrom, dateTo);')).toBe(true);
  });

  it('THE LANDED PAIR WEARS THE RANGE\u2019S OWN VIOLET CHIP — the first shared family', () => {
    // the same chip names the custom landing (the range's word carries
    // its dates) — no new hue, the registry stays fourteen
    expect(desk.includes('hue="violet"')).toBe(true);
    expect(desk.includes('label={`landed ?rep-range=${landedRepRange}`}')).toBe(true);
    expect(desk.includes("repRangeLandingLive && landedRepRange !== 'this_month'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE COLLISION LESSON — the pair wears the desk's own prefix
// ---------------------------------------------------------------------------

describe('the collision lesson — the desk-prefix law\u2019s oldest reading', () => {
  it('the byte appeared NOWHERE before this word — the desk-prefixed pair', () => {
    expect((desk.match(/'rep-from'/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect((desk.match(/'rep-to'/g) ?? []).length).toBeGreaterThanOrEqual(3);
    // the bare bytes ride NOWHERE in this desk (the loyalty ledger's
    // legacy window keeps its own aliases — no cross-desk bleed)
    expect(desk.includes("params.set('from'")).toBe(false);
    expect(desk.includes("params.set('to'")).toBe(false);
    expect(desk.includes("params.delete('from')")).toBe(false);
    expect(desk.includes("params.delete('to')")).toBe(false);
  });

  it('the ONE home\u2019s doc-note tells the lesson', () => {
    expect(home.includes("THE FAMILY'S THIRTY-SEVENTH WORD (the pair)")).toBe(true);
    expect(home.includes("the loyalty ledger's legacy window aliases")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE GROUND — the styling verse
// ---------------------------------------------------------------------------

describe('the custom scratch\u2019s own ground — the styling verse', () => {
  it('the pair\u2019s day-inputs wear a joined card', () => {
    expect(desk.includes('className="flex flex-wrap items-center gap-2 ml-6 rounded-lg border bg-muted/30 px-3 py-1.5"')).toBe(true);
  });

  it('each input speaks its own handle (the probes\u2019 affordance)', () => {
    expect(desk.includes('data-testid="rep-from-input"')).toBe(true);
    expect(desk.includes('data-testid="rep-to-input"')).toBe(true);
  });

  it('the dark picker\u2019s dress — the native icon answers the dark wardrobe', () => {
    expect((desk.match(/className="h-8 text-xs w-36 tabular-nums dark:\[color-scheme:dark\]"/g) ?? []).length).toBe(2);
  });

  it('ONE LABEL PER END — the stray separator retired', () => {
    expect(desk.includes('<span className="text-[10px] text-muted-foreground">From</span>')).toBe(true);
    expect(desk.includes('<span className="text-[10px] text-muted-foreground">To</span>')).toBe(true);
    // the v2.482 dress's double separator is gone — the lowercase `to`
    // span never renders again
    expect(desk.includes('<span className="text-xs text-muted-foreground">to</span>')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. THE SEATS — the elder bytes keep their places
// ---------------------------------------------------------------------------

describe('the seats — the round moves the custom face, the elder bytes hold', () => {
  it('the range\u2019s word keeps its whole shape (the v2.482 verse intact)', () => {
    expect(desk.includes('function initialRepRange(): DatePreset {')).toBe(true);
    expect(desk.includes("const REP_RANGE_WORDS: readonly DatePreset[] = ['today', 'this_week', 'this_month', 'this_quarter', 'this_year', 'last_month'];")).toBe(true);
    expect(desk.includes("if (typeof window === 'undefined') return 'this_month';")).toBe(true);
    expect(desk.includes("if (preset === 'this_month') params.delete('rep-range');")).toBe(true);
    expect(desk.includes('else params.set(\'rep-range\', preset);')).toBe(true);
  });

  it('the preset memo and the sync effect keep their bytes', () => {
    expect(desk.includes('const presetRange = useMemo(() => getDatePresetRange(datePreset), [datePreset]);')).toBe(true);
    expect(desk.includes('if (datePreset !== \'custom\') {')).toBe(true);
  });

  it('the dead-stock stage\u2019s three words keep their bytes (the sort\u2019s lift, the lens\u2019s door)', () => {
    expect(desk.includes('const [deadStockSort, setDeadStockSortState] = useState<DeadStockSortKey>(initialDeadSort);')).toBe(true);
    expect(desk.includes('setDeadStockSort={chooseDeadSort}')).toBe(true);
    expect(desk.includes('setDeadStockSearch={chooseDeadQuery}')).toBe(true);
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
// 5. THE CONSTITUTION — the pair joins the vocabulary
// ---------------------------------------------------------------------------

describe('the constitution — thirty-eight words, the first shared family', () => {
  it('the pair\u2019s rows joined (the range\u2019s own violet serves both)', () => {
    expect(registry.includes("{ word: 'rep-from', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-violet-300', suite: 'src/tests/custom-range-address-v2483.test.ts' }")).toBe(true);
    expect(registry.includes("{ word: 'rep-to', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-violet-300', suite: 'src/tests/custom-range-address-v2483.test.ts' }")).toBe(true);
    expect(registry.includes('(fifty-three words, thirty-three desks)')).toBe(true);
  });

  it('the stress walks the roll and the derived counts (36 \u2192 38, the living pins roll)', () => {
    // v2.484.0 (dated): the window's round rolled the living pins — the
    // stress's counts grew (40 rows, 37 families) and this suite's
    // contains-pins ride the bytes that ARE (the museum's own-entry
    // story stays; the registry's living counts roll).
    expect(stress.includes("'rep-from',")).toBe(true);
    expect(stress.includes("'rep-to',")).toBe(true);
    // v2.485.0 (dated): the living stress-pins roll — the stress's
    // row count grew to forty-three and the families to thirty-eight
    // (the period's round); the contains-pins ride the bytes that ARE.
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
    // v2.486.0 (dated): the living family-pin rolls — the families
    // grew to thirty-nine (red-300 joined); the contains-pin rides
    // the bytes that ARE.
    // v2.487.0 (dated): the living family-pin rolls — the families
    // grew to forty (slate-300 joined); the contains-pin rides
    // the bytes that ARE.
    // v2.496.0 (dated): the living family-pin rolls — the families
    // grew to forty-one (zinc-300 joined); the contains-pin rides
    // the bytes that ARE.
    expect(stress.includes('expect(new Set(rows.map((r) => r.family)).size).toBe(41);')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round, pinned in the feed', () => {
  it('the head wears the round\u2019s own story — the honoured probe and the new word', () => {
    // v2.484.0 THE MUSEUM RE-KEY (the v2470 treatment): the round's own
    // entry is FOUND, not assumed to lead — the feed rides the living
    // head, the museum keeps the round's own word; the guard comes with
    // the find.
    const head = WHATS_NEW.find((e) => e.version === '2.483.0');
    if (!head) throw new Error('the 2.483.0 entry is gone from the feed');
    expect(head.version).toBe('2.483.0');
    expect(head.title).toContain('the range\u2019s word rides the address');
    expect(head.title).toContain('the range\u2019s dates ride the address');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.title).toContain('the paper speaks the window\u2019s word');
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?rep-from='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE CUSTOM\u2019S HONEST SHARE'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('thirty-seventh word'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('legacy window aliases'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('FIRST shared family'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('real calendar days only'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('bg-muted/30'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('color-scheme'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('ONE home'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.497.0');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.483.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.483.0]')).toBeLessThan(changelog.indexOf('[2.482.0]'));
  });
});
