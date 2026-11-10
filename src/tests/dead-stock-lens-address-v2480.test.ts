// THE LENS'S WORD RIDES THE ADDRESS (v2.480.0): the dead-stock search
// lens answers the address bar — the deep-link family's twelfth
// 300-storey byte — and the patience draws its own bar under the figure.
//
//   • THE ADDRESS'S WORD — the helpers' bytes (read once on the shell,
//     write back on every hand-driven change, strip on empty), the
//     lifted state, the one door.
//   • THE TWELFTH BYTE — amber joins the 300 registry (the lens family's
//     own tone); the loom's wardrobe line; the constitution's
//     thirty-fourth row; the once-only trio census.
//   • THE PATIENCE'S OWN BAR — the idle cell's drawn word (the capital
//     bar's own dialect, the number's own tone split, the never-sold
//     quiet).
//   • THE SEATS — the elder bytes hold (the memo, the presses, the
//     badge, the view voice, the lens empty, the census at ten).
//   • THE FEED — the round leads the feed; the honoured probe ("The
//     paper speaks the window's word.") rides the title's chain.
//   • THE RELEASE SURFACES — VERSION, package.json, CHANGELOG, one voice.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { WHATS_NEW } from '@/lib/whats-new';

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
// 1. THE ADDRESS'S WORD — read once, write back, strip on empty
// ---------------------------------------------------------------------------

describe('the address\u2019s word — the lens answers the bar', () => {
  it('the read half speaks the desk-prefixed word, trimmed and capped', () => {
    expect(desk.includes(".get('dead-q') ?? '')")).toBe(true);
    expect(desk.includes('.trim().slice(0, 80)')).toBe(true);
    expect(desk.includes("function initialDeadQuery(): string {")).toBe(true);
  });

  it('THE LANDING IS READ ONCE ON THE SHELL — a dismissed chip can never resurrect', () => {
    expect(desk.includes('const [landedDeadQuery] = useState<string>(initialDeadQuery);')).toBe(true);
    expect(desk.includes('const [deadQueryLandingLive, setDeadQueryLandingLive] = useState(true);')).toBe(true);
  });

  it('the write half sets the word, deletes the silence, and rides replaceState', () => {
    expect(desk.includes("params.set('dead-q', trimmed);")).toBe(true);
    expect(desk.includes("params.delete('dead-q');")).toBe(true);
    expect(desk.includes('window.history.replaceState(null, \'\', window.location.pathname + (qs ? `?${qs}` : \'\'));')).toBe(true);
    expect(desk.includes('function writeDeadQueryWord(word: string): void {')).toBe(true);
  });

  it('THE EMPTY STRIPS ITS KEY — the address never carries a silence', () => {
    expect(desk.includes('if (trimmed) params.set')).toBe(true);
    expect(desk.includes('else params.delete')).toBe(true);
  });

  it('THE ONE DOOR — the set, the retire and the write ride together (a fact ride, never a gate)', () => {
    expect(desk.includes('const chooseDeadQuery = useCallback((value: string) => {')).toBe(true);
    expect(desk.includes('    setDeadStockSearch(value);\n    setDeadQueryLandingLive(false);\n    writeDeadQueryWord(value);')).toBe(true);
  });

  it('THE AGREEMENT IS NO NEWS — a hand change retires the landing chip (the window\u2019s own law)', () => {
    expect(desk.includes('if (deadStockSearch === value) {')).toBe(true);
    expect(desk.includes('    // THE AGREEMENT IS NO NEWS (the window\'s own law): a hand-driven')).toBe(true);
  });

  it('THE WORD SURVIVES THE PANE — the state is lifted beside the window\u2019s own', () => {
    expect(desk.includes('const [deadStockSearch, setDeadStockSearch] = useState<string>(initialDeadQuery);')).toBe(true);
    expect(desk.includes("const [deadStockSearch, setDeadStockSearch] = useState('');")).toBe(false);
  });

  it('the setter-shaped prop keeps every elder byte (the section speaks the same words)', () => {
    expect(desk.includes('setDeadStockSearch={chooseDeadQuery}')).toBe(true);
    expect(section.includes('value={deadStockSearch}')).toBe(true);
    expect(section.includes('onChange={(e) => setDeadStockSearch(e.target.value)}')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE TWELFTH BYTE — amber joins the 300 registry
// ---------------------------------------------------------------------------

describe('the twelfth byte — amber, the lens family\u2019s own tone', () => {
  it('the loom\u2019s registry grew the hue and the wardrobe line', () => {
    expect(loom.includes("  'amber',")).toBe(true);
    expect(loom.includes("  amber: 'border-amber-300 bg-amber-100 text-amber-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20',")).toBe(true);
  });

  it('the chip rides the section\u2019s lens row beside the window\u2019s own', () => {
    expect(section.includes('hue="amber"')).toBe(true);
    expect(section.includes('label={`landed ?dead-q=${landedDeadQuery}`}')).toBe(true);
    expect(section.includes('data-testid="dead-q-landing-word"')).toBe(true);
    expect(section.includes('press to clear it')).toBe(true);
  });

  it('THE EMPTY WEARS NO CHIP — the chip names a word, never a silence', () => {
    expect(section.includes("deadQueryLandingLive && landedDeadQuery !== ''")).toBe(true);
  });

  it('the constitution grew its thirty-eighth row and its own count', () => {
    // v2.483.0 (dated): the pair — the custom's dates ride beside the
    // custom's word; the count rolls with the constitution.
    // v2.482.0 (dated): the thirty-sixth word — the range's own word
    // rides the address; the count rolls with the constitution.
    // v2.481.0 (dated): the thirty-fifth word — the sort door's own word
    // rides the address; the count rolls with the constitution.
    expect(registry.includes("{ word: 'dead-q', desk: 'src/app/(shell)/tabs/reports-tab.tsx', family: 'border-amber-300', suite: 'src/tests/dead-stock-lens-address-v2480.test.ts' }")).toBe(true);
    expect(registry.includes('(fifty-three words, thirty-three desks)')).toBe(true);
  });

  it('the stress walks the roll and the derived counts (36 \u2192 38)', () => {
    // v2.483.0 (dated): the pair — the roll and the counts grew again.
    // v2.482.0 (dated): the roll and the counts grew again.
    // v2.481.0 (dated): the roll and the counts grew with the registry.
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
    expect(stress.includes("      'dead-q',")).toBe(true);
  });

  it('THE ONCE-ONLY CENSUS — the amber 300-trio lives in exactly one src file (the loom)', () => {
    const trio = 'border-amber-300 bg-amber-100 text-amber-700';
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
// 3. THE PATIENCE'S OWN BAR — the idle cell's drawn word
// ---------------------------------------------------------------------------

describe('the patience\u2019s own bar — the idle cell draws', () => {
  it('the bar rides the capital bar\u2019s own dialect (the muted track, aria-hidden)', () => {
    expect(section.includes('data-testid={`dead-stock-idle-bar-${i}`}')).toBe(true);
    expect(section.includes("aria-hidden=\"true\" className=\"mt-1 h-1 rounded-full bg-muted overflow-hidden\"")).toBe(true);
  });

  it('the fill wears the number\u2019s own word — amber below half a year, rose past it', () => {
    expect(section.includes("r.daysIdle >= 180 ? 'bg-rose-500' : 'bg-amber-500'")).toBe(true);
  });

  it('the width is the row\u2019s share of the shelf\u2019s longest wait, clamped', () => {
    // the window can never be the yardstick — a dead row's idle is
    // always past it (every bar would read full, a lie); the longest
    // wait's own mirror speaks instead (the capital bar's own mirror)
    expect(section.includes('maxDaysIdle > 0 ? (r.daysIdle / maxDaysIdle) * 100 : 0')).toBe(true);
    expect(section.includes('r.daysIdle != null && r.daysIdle > m ? r.daysIdle : m')).toBe(true);
  });

  it('THE NEVER-SOLD QUIET — a bar under a dash would be a stutter', () => {
    expect(section.includes('{r.daysIdle != null && (')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE SEATS — the elder bytes keep their places
// ---------------------------------------------------------------------------

describe('the seats — the round moves the word, the elder bytes hold', () => {
  it('the memo composes in the ONE home and rides its own deps', () => {
    expect(desk.includes('sortDeadStockRows(filterDeadStockRows(rows, deadStockSearch), deadStockSort)')).toBe(true);
    expect(desk.includes('[rows, deadStockSearch, deadStockSort]')).toBe(true);
  });

  it('the shape\u2019s presses keep both their seats', () => {
    expect((desk.match(/onPress=\{\(label\) => setDeadStockSearch\(label\)\}/g) ?? []).length).toBe(2);
    expect((desk.match(/pressedLabel=\{deadStockSearch\.trim\(\)\}/g) ?? []).length).toBe(2);
  });

  it('the badge and the lensPressed flag keep their bytes', () => {
    expect(desk.includes('{deadStockSearch.trim() ? `${sortedRows.length} of ${rows.length} products` : `${rows.length} products`}')).toBe(true);
    expect(desk.includes("const lensPressed = deadStockSearch.trim() !== '';")).toBe(true);
  });

  it('the lens empty keeps its honest face and the clear handle its seat', () => {
    expect(section.includes('No product answers to \u201c{deadStockSearch.trim()}\u201d')).toBe(true);
    expect(section.includes('data-testid="dead-stock-search-clear"')).toBe(true);
  });

  it('the census keeps its ten voices — a chip and a bar never carry a handle', () => {
    expect(section.split('aria-label=').length - 1).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself
// ---------------------------------------------------------------------------

describe('whats-new — the round, pinned in the feed', () => {
  it('the head wears the round\u2019s own story — the honoured probe and the new word', () => {
    // v2.481.0 THE MUSEUM RE-KEY (the v2470 treatment): the round's own
    // entry is FOUND, not assumed to lead — the feed rides the living
    // head, the museum keeps the round's own word; the guard comes with
    // the find.
    const head = WHATS_NEW.find((e) => e.version === '2.480.0');
    if (!head) throw new Error('the 2.480.0 entry is gone from the feed');
    expect(head.version).toBe('2.480.0');
    expect(head.title).toContain('the paper speaks the window\u2019s word');
    expect(head.title).toContain('the lens\u2019s word rides the address');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('carry');
    expect(head.title).toContain('the view speaks its own word');
    expect(head.title).toContain('edit door');
    expect(head.title).toContain('scannable door');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('?dead-q='))).toBe(true);
    expect(head.bullets.some((b) => b.includes('amber joins the 300 registry'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('(hue, storey)'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('Idle window'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('patience'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('ONE home'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('CHIP_HEAD'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('copy all'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('wa.me'))).toBe(true);
  });

  it('the release surfaces speak with one voice', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(pkg.version).toBe('2.497.1');
    expect(WHATS_NEW[0].version).toBe(pkg.version);
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.480.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.480.0]')).toBeLessThan(changelog.indexOf('[2.479.0]'));
  });
});
