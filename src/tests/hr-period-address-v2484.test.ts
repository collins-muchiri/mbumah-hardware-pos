// THE PEOPLE'S WINDOW RIDES THE ADDRESS (v2.484.0): the HR reports
// desk's period answers the bar — the deep-link family's thirty-ninth
// word (the window) — and the window gets its ground.
//
//   • THE WINDOW'S WORD — the helpers' bytes (read once on the shell,
//     each side INDEPENDENTLY proved, write back on every scratched
//     side, THE DEFAULT WEARS NO WORD), the one door.
//   • THE FIFTEENTH BYTE — blue joins the 300 registry (the transfers
//     desk's hue one storey deeper); the loom's wardrobe line; the
//     constitution's thirty-ninth + fortieth rows; the once-only trio
//     census; blue leaving the stranger list.
//   • THE GROUND — the styling verse: the window's joined card, the
//     dark picker's dress, the tabular figures, the Apply seat.
//   • THE SEATS — the desk's own elder words hold (tab, storeId,
//     schedule: the reads, the writes, the chip).
//   • THE FEED — the round leads the feed; the honoured probe ("The
//     range's dates ride the address.") rides the title's chain.
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one voice.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { WHATS_NEW } from '@/lib/whats-new';
import { LANDING_CHIP_HUES, LANDING_CHIP_WARDROBES, landingChipSpeaksAt } from '@/components/landing-chip';
import { parseInitialNamedDateRange } from '@/lib/tab-url';

const DESK = 'src/app/(shell)/hr/reports/page.tsx';
const LOOM = 'src/components/landing-chip.tsx';
const HOME = 'src/lib/tab-url.ts';
const REGISTRY = 'src/tests/transfer-status-deep-link-v2357.test.ts';
const STRESS = 'src/tests/family-registry-stress-v2370.test.ts';

const desk = readFileSync(DESK, 'utf8');
const loom = readFileSync(LOOM, 'utf8');
const home = readFileSync(HOME, 'utf8');
const registry = readFileSync(REGISTRY, 'utf8');
const stress = readFileSync(STRESS, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE WINDOW'S WORD — read once, write back, the honest sides
// ---------------------------------------------------------------------------

describe('the window\u2019s word — the people desk\u2019s period answers the bar', () => {
  it('the ONE home keeps the window\u2019s parser (the never-strand law\u2019s own reading)', () => {
    expect(home.includes('export function parseInitialNamedDateRange(search: string, fromKey: string, toKey: string)')).toBe(true);
    expect(home.includes('return { from: honestDayKey(params.get(fromKey)), to: honestDayKey(params.get(toKey)) };')).toBe(true);
    // the window's own law is told where the family reads it
    expect(home.includes("THE FAMILY'S THIRTY-NINTH WORD (the window)")).toBe(true);
    expect(home.includes('a real from with a garbage to keeps the')).toBe(true);
  });

  it('each side validates INDEPENDENTLY — a real from with a garbage to keeps the from', () => {
    // the whole window speaks
    expect(parseInitialNamedDateRange('?hr-from=2026-01-01&hr-to=2026-03-31', 'hr-from', 'hr-to')).toEqual({ from: '2026-01-01', to: '2026-03-31' });
    // a real from with a garbage to keeps the from, drops only the to
    expect(parseInitialNamedDateRange('?hr-from=2026-01-01&hr-to=not-a-day', 'hr-from', 'hr-to')).toEqual({ from: '2026-01-01', to: '' });
    // a garbage from with a real to keeps only the to
    expect(parseInitialNamedDateRange('?hr-from=2026-02-30&hr-to=2026-03-31', 'hr-from', 'hr-to')).toEqual({ from: '', to: '2026-03-31' });
    // impossible dates are unknown words (honestDayKey's round-trip proof)
    expect(parseInitialNamedDateRange('?hr-from=2026-13-01&hr-to=2026-03-31', 'hr-from', 'hr-to')).toEqual({ from: '', to: '2026-03-31' });
    // the address's silence answers silence — never a stranded filter
    expect(parseInitialNamedDateRange('?tab=cost', 'hr-from', 'hr-to')).toEqual({ from: '', to: '' });
    // a foreign desk's prefix never answers (the desk-prefix law)
    expect(parseInitialNamedDateRange('?rep-from=2026-01-01&rep-to=2026-03-31', 'hr-from', 'hr-to')).toEqual({ from: '', to: '' });
  });

  it('THE LANDING IS READ ONCE ON THE MOUNT — a dismissed chip can never resurrect', () => {
    // the page's own v2.21.0 convention (client-only): a useState
    // initializer would read window during SSR and tear the tree (the
    // hydration lesson the faces burst caught — the mount effect is the
    // desk's OWN law)
    expect(desk.includes("const [landedHrWindow, setLandedHrWindow] = useState<{ from: string; to: string }>({ from: '', to: '' });")).toBe(true);
    expect(desk.includes("const landed = parseInitialNamedDateRange(window.location.search, 'hr-from', 'hr-to');")).toBe(true);
    expect(desk.includes('if (landed.from || landed.to) {')).toBe(true);
    expect(desk.includes('const [hrWindowLandingLive, setHrWindowLandingLive] = useState(true);')).toBe(true);
    // the desk's own defaults seed the scratch when the address is silent
    expect(desk.includes('const [from, setFrom] = useState(() => new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1)).toISOString().slice(0, 10));')).toBe(true);
    expect(desk.includes('const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));')).toBe(true);
  });

  it('THE WINDOW WRITES BACK — every scratched side rides its byte', () => {
    expect(desk.includes("const writeHrWindowWord = (side: 'from' | 'to', value: string) => {")).toBe(true);
    expect(desk.includes("url.searchParams.set(side === 'from' ? 'hr-from' : 'hr-to', value);")).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', url.toString());')).toBe(true);
  });

  it('THE ONE DOOR — the set, the retire and the write ride together (a fact ride, never a gate)', () => {
    expect(desk.includes("const chooseHrDate = (side: 'from' | 'to', value: string) => {")).toBe(true);
    expect(desk.includes('if (value === current) return; // THE AGREEMENT IS NO NEWS')).toBe(true);
    expect(desk.includes("onChange={(e) => chooseHrDate('from', e.target.value)}")).toBe(true);
    expect(desk.includes("onChange={(e) => chooseHrDate('to', e.target.value)}")).toBe(true);
    expect(desk.includes('setHrWindowLandingLive(false);')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE FIFTEENTH BYTE — blue joins the 300 registry
// ---------------------------------------------------------------------------

describe('the fifteenth byte — blue, the people window\u2019s tone', () => {
  it('the loom\u2019s registry grew the hue and the wardrobe line', () => {
    expect(loom.includes("  'blue',")).toBe(true);
    expect(loom.includes("  blue: 'border-blue-300 bg-blue-100 text-blue-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20',")).toBe(true);
  });

  it('the storey line is ENFORCED — blue speaks at both its storeys now', () => {
    expect(landingChipSpeaksAt('blue', 300)).toBe(true);
    expect(landingChipSpeaksAt('blue', 200)).toBe(true);
    // v2.485.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to sixteen (the period's green).
    // v2.486.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to seventeen (the queue's red).
    // v2.487.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to eighteen (the shift's slate).
    // v2.496.0 (dated): the living registry pin rolls — the loom's
    // hue count grew to nineteen (the ledger's zinc).
    expect(LANDING_CHIP_HUES.length).toBe(19);
    expect(LANDING_CHIP_WARDROBES.blue).toContain('hover:bg-blue-200');
  });

  it('the chip rides the desk\u2019s own toolbar row (the desk\u2019s first loom face)', () => {
    expect(desk.includes("hue=\"blue\"")).toBe(true);
    expect(desk.includes('label="landed ?hr-from&hr-to"')).toBe(true);
    expect(desk.includes('data-testid="hr-window-landing-word"')).toBe(true);
    expect(desk.includes('press to clear it')).toBe(true);
  });

  it('THE ONCE-ONLY CENSUS — the blue 300-trio lives in exactly one src file (the loom)', () => {
    const trio = 'border-blue-300 bg-blue-100 text-blue-700';
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

  it('the collision check ran at round start — the bytes are the desk\u2019s own', () => {
    // the desk-prefix pair rides NOWHERE else; the page's DOM ids
    // (`rep-from`/`rep-to`) are another namespace, another route, never
    // the address bar
    expect(desk.includes("'hr-from'")).toBe(true);
    expect(desk.includes("'hr-to'")).toBe(true);
    expect((home.match(/hr-from/g) ?? []).length).toBeGreaterThanOrEqual(1);
    // the bare bytes stay untouched by this desk's writes
    expect(desk.includes("searchParams.set('from'")).toBe(false);
    expect(desk.includes("searchParams.set('to'")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. THE GROUND — the styling verse
// ---------------------------------------------------------------------------

describe('the people window\u2019s own ground — the styling verse', () => {
  it('the window\u2019s two day-inputs wear the family\u2019s joined card', () => {
    expect(desk.includes('className="flex flex-wrap items-end gap-2 rounded-lg border bg-muted/30 px-3 py-2"')).toBe(true);
  });

  it('the dark picker\u2019s dress and the tabular figures', () => {
    expect((desk.match(/className="h-8 w-40 tabular-nums dark:\[color-scheme:dark\]"/g) ?? []).length).toBe(2);
  });

  it('each input speaks its own handle (the probes\u2019 affordance)', () => {
    expect(desk.includes('data-testid="hr-from-input"')).toBe(true);
    expect(desk.includes('data-testid="hr-to-input"')).toBe(true);
  });

  it('the Apply period button keeps its seat inside the card', () => {
    expect(desk.includes('Apply period')).toBe(true);
    expect(desk.indexOf('Apply period')).toBeGreaterThan(desk.indexOf('bg-muted/30 px-3 py-2'));
  });
});

// ---------------------------------------------------------------------------
// 4. THE SEATS — the desk's own elder words keep their places
// ---------------------------------------------------------------------------

describe('the seats — the round moves the window, the desk\u2019s elder words hold', () => {
  it('the tab word keeps its read and its write (the v2.21.0 law)', () => {
    expect(desk.includes("const requested = new URLSearchParams(window.location.search).get('tab');")).toBe(true);
    expect(desk.includes("url.searchParams.set('tab', next);")).toBe(true);
  });

  it('the storeId word keeps its read, its write and its chip (the v2.23.0 law)', () => {
    expect(desk.includes("const requested = new URLSearchParams(window.location.search).get('storeId');")).toBe(true);
    expect(desk.includes("url.searchParams.set('storeId', next);")).toBe(true);
    expect(desk.includes("url.searchParams.delete('storeId');")).toBe(true);
  });

  it('the schedule word keeps its read (the v2.27.0 law)', () => {
    expect(desk.includes("const requested = new URLSearchParams(window.location.search).get('schedule');")).toBe(true);
  });

  it('the period\u2019s wire keeps its face (the load uses the desk\u2019s own dates)', () => {
    expect(desk.includes('const qs = `from=${new Date(from).toISOString()}&to=${new Date(`${to}T23:59:59.999Z`).toISOString()}')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE CONSTITUTION — the window joins the vocabulary
// ---------------------------------------------------------------------------

describe('the constitution — forty words, twenty-seven desks, the second shared family', () => {
  it('the window\u2019s rows joined (the people\u2019s blue serves both)', () => {
    expect(registry.includes("{ word: 'hr-from', desk: 'src/app/(shell)/hr/reports/page.tsx', family: 'border-blue-300', suite: 'src/tests/hr-period-address-v2484.test.ts' }")).toBe(true);
    expect(registry.includes("{ word: 'hr-to', desk: 'src/app/(shell)/hr/reports/page.tsx', family: 'border-blue-300', suite: 'src/tests/hr-period-address-v2484.test.ts' }")).toBe(true);
    expect(registry.includes('(fifty-three words, thirty-three desks)')).toBe(true);
  });

  it('the stress walks the roll and the derived counts (38 \u2192 40, families 36 \u2192 37 — the SECOND shared family)', () => {
    expect(stress.includes("'hr-from',")).toBe(true);
    expect(stress.includes("'hr-to',")).toBe(true);
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
    // the families grew ONE (blue-300 is new) while the words grew two:
    // the window rides its own blue — two words, one chip, again
    // v2.485.0 (dated): the living family-pin rolls — the families
    // grew to thirty-eight (green-300 joined); the contains-pin rides
    // the bytes that ARE.
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

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story — the honoured probe and the new word', () => {
    // v2.485.0 THE MUSEUM RE-KEY (the v2470 treatment): the round's own
    // entry is FOUND, not assumed to lead — the feed rides the living
    // head, the museum keeps the round's own word; the guard comes with
    // the find.
    const head = WHATS_NEW.find((e) => e.version === '2.484.0');
    if (!head) throw new Error('the 2.484.0 entry is gone from the feed');
    expect(head.version).toBe('2.484.0');
    expect(head.title).toContain('the range\u2019s dates ride the address');
    expect(head.title).toContain('the people\u2019s window rides the address');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.title).toContain('the paper speaks the window\u2019s word');
    expect(head.title).toContain('edit door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?hr-from='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('thirty-ninth word'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('THE DEFAULT WEARS NO WORD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('Blue joins the 300 registry'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('shade-split law'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('stranger list'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('SECOND shared family'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('bg-muted/30'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('ONE home'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('clearance note'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('edit door'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.497.1');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.484.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.484.0]')).toBeLessThan(changelog.indexOf('[2.483.0]'));
  });
});
