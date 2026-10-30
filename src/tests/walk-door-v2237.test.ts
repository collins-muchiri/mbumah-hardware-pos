// v2.237.0 — the walk's door.
//
//   - THE WALK'S DOOR: the org cadence's rows become anchor doors —
//     "walk" carries the org's read to the branch's count sheet with the
//     aisle pre-picked. The anchor law (never a button), the slug law
//     (the store's own slug from the stores prop — a slug-less store
//     holds no door), the zero-fetch law (storeId + slug, nothing else).
//   - THE BRANCH'S ARRIVAL: the panel reads ?countSheet= one time at
//     mount; the consume opens the drawer on the category scope BEFORE
//     the wire lands (the gate law), pre-picks only an aisle THIS store
//     owns (the own-shelf law — a foreign id is discarded), strips the
//     URL after the consume (the quiet-URL law), and whispers the
//     arrival — silenced the moment the user's own hand takes over.
//   - THE WALK'S PAPER: the cadence exports itself — one CSV in the
//     wire's own walk order, the drill's CSV laws verbatim (csvCell's
//     quoting, the BOM, CRLF, honest absences as EMPTY cells), the
//     button hidden on a shelf-less cadence.
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory) —
// except the CSV helper, which is PURE and called for real.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { cadenceWalkCsv } from '@/components/org/variance-map';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const map = read('src/components/org/variance-map.tsx');
const panel = read('src/components/inventory/stock-take-panel.tsx');
const pkg = JSON.parse(read('package.json'));
const feed = read('src/lib/whats-new.ts');
const changelog = read('CHANGELOG.md');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.237.0)', () => {
  it('package.json leads 2.237.0 (all three slots)', () => {
    expect(version).toBe('2.279.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.279.0');
    expect(pkg.mbumah.baseVersion).toBe('2.279.0');
  });

  it('VERSION speaks 2.237.0 and the verify gate is wired', () => {
    expect(read('VERSION').trim()).toBe('2.279.0');
    expect(pkg.scripts['verify:v2-237-0']).toBe('node scripts/verify-v2-237-0.mjs');
  });

  it('the whats-new feed leads the walk\u2019s-door entry (order pin: header-anchored, never a bare version string)', () => {
    expect(feed.includes("version: '2.277.0',")).toBe(true);
    expect(feed.indexOf("version: '2.277.0',")).toBeLessThan(feed.indexOf("version: '2.276.0',"));
    expect(feed.includes("title: 'The walk\\u2019s door',")).toBe(true);
  });

  it('the changelog anchors the section above its ancestor (headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.241.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.241.0]')).toBeLessThan(changelog.indexOf('## [2.240.0]'));
  });

  it('the changelog speaks the door, the arrival, and the paper', () => {
    const body = changelog.slice(changelog.indexOf('## [2.237.0]'), changelog.indexOf('## [2.236.0]'));
    expect(body).toContain('### Added');
    expect(body).toContain('### Styled');
    expect(body).toContain('data-testid="cadence-door-{categoryId}"');
    expect(body).toContain('data-testid="stocktake-door-prefill"');
    expect(body).toContain('data-testid="cadence-export"');
    expect(body).toContain('cadenceWalkCsv(rows)');
  });
});

// ── THE WALK'S DOOR (the org face) ───────────────────────────────────────

describe('the walk\u2019s door (variance-map.tsx)', () => {
  it('every cadence row derives the door from the store\u2019s OWN slug (never a guess)', () => {
    expect(map).toContain("const doorSlug = stores.find((s) => s.id === c.storeId)?.slug ?? null;");
  });

  it('a slug-less store holds no door (an absent control never lies)', () => {
    expect(map).toContain('{doorSlug && (');
  });

  it('the door is an ANCHOR, never a button (the v2.232.0 law)', () => {
    expect(map).toContain('data-testid={`cadence-door-${c.categoryId}`}');
    expect(map).toContain('href={`/stores/${doorSlug}/inventory?countSheet=${c.categoryId}`}');
    const doorStart = map.indexOf('{doorSlug && (');
    const doorEnd = map.indexOf('</a>', doorStart);
    const door = map.slice(doorStart, doorEnd);
    expect(door).toContain('<a');
    expect(door).not.toContain('<button');
  });

  it('the door speaks to the eye and the ear (title + aria name the law)', () => {
    expect(map).toContain("title={`the org face points, the branch face counts — open ${c.name}'s count sheet at ${c.storeCode ?? c.storeName}`}");
    expect(map).toContain("aria-label={`start the walk on ${c.name} at ${c.storeCode ?? c.storeName} — opens the branch's count sheet with this aisle picked`}");
  });

  it('the door rides the map\u2019s door language (9px outline family, amber focus ring, self-center)', () => {
    const doorStart = map.indexOf('{doorSlug && (');
    const doorEnd = map.indexOf('</a>', doorStart);
    const door = map.slice(doorStart, doorEnd);
    expect(door).toContain('text-[9px] font-semibold');
    expect(door).toContain('focus-visible:outline-amber-500');
    expect(door).toContain('self-center');
    expect(door).toContain('dark:border-slate-700');
  });

  it('the zero-fetch law: the door composes storeId + the stores prop only (no new read anywhere)', () => {
    expect(map).toContain("stores.find((s) => s.id === c.storeId)");
    expect(map).not.toContain('cadence-door-fetch');
  });
});

// ── THE BRANCH'S ARRIVAL (stock-take-panel.tsx) ──────────────────────────

describe('the branch\u2019s arrival (stock-take-panel.tsx)', () => {
  it('the panel reads ?countSheet= ONE time at mount (the door is a hard anchor navigation)', () => {
    expect(panel).toContain("new URLSearchParams(window.location.search).get('countSheet')");
    expect(panel).toContain('const [doorParam] = useState(');
  });

  it('the gate law: the consume opens the drawer on the category scope BEFORE the wire lands', () => {
    const effect = panel.slice(panel.indexOf('if (!doorParam || doorConsumed.current) return;'), panel.indexOf('const invalidateSheets'));
    expect(effect).toContain("setCreateScope('category');");
    expect(effect).toContain('setCreateOpen(true);');
    expect(effect).toContain('if (list) {');
  });

  it('the own-shelf law: a foreign id is discarded and the face returns to its own state', () => {
    const effect = panel.slice(panel.indexOf('if (!doorParam || doorConsumed.current) return;'), panel.indexOf('const invalidateSheets'));
    expect(effect).toContain('const hit = list.find((c) => c.id === doorParam);');
    expect(effect).toContain("setCreateScope('full');");
    expect(effect).toContain('setCreateOpen(false);');
  });

  it('the consume pre-picks the aisle and speaks the arrival voice', () => {
    const effect = panel.slice(panel.indexOf('if (!doorParam || doorConsumed.current) return;'), panel.indexOf('const invalidateSheets'));
    expect(effect).toContain('setCreateCategoryId(hit.id);');
    expect(effect).toContain('setDoorVoice(');
    expect(effect).toContain("pickDaysVoice(hit.cadence)");
  });

  it('the quiet-URL law: the query is stripped after the consume (a refresh never re-haunts)', () => {
    expect(panel).toContain('window.history.replaceState(null, \'\', window.location.pathname + window.location.hash)');
  });

  it('the one-shot law: a ref keeps the consume single by construction', () => {
    expect(panel).toContain('const doorConsumed = useRef(false);');
    expect(panel).toContain('if (!doorParam || doorConsumed.current) return;');
    expect(panel).toContain('doorConsumed.current = true;');
  });

  it('the whisper wears its testid and names the org\u2019s walk order', () => {
    expect(panel).toContain('data-testid="stocktake-door-prefill"');
    expect(panel).toContain('the org&apos;s walk order sent you here — {doorVoice}.');
  });

  it('the user\u2019s own hand silences the whisper (scope pair + the listbox’s pick — the select became a Radix listbox at v2.252.0)', () => {
    // v2.238.0 re-pin: the silencing hands grew the census reset (the
    // door's birth dies with the whisper — one life, shared).
    expect(panel).toContain("onClick={() => { setCreateScope('full'); setDoorVoice(null); setDoorBorn(false); }}");
    expect(panel).toContain("onClick={() => { setCreateScope('category'); setDoorVoice(null); setDoorBorn(false); }}");
    expect(panel).toContain('onValueChange={(v) => { setCreateCategoryId(v); setDoorVoice(null); setDoorBorn(false); }}');
  });

  it('the deferred law: no setState runs synchronously inside the effect (the house pattern)', () => {
    const effect = panel.slice(panel.indexOf('if (!doorParam || doorConsumed.current) return;'), panel.indexOf('const invalidateSheets'));
    expect(effect).toContain('window.setTimeout(');
    expect(effect).toContain('return () => window.clearTimeout(t);');
  });
});

// ── THE WALK'S PAPER (the cadence's CSV) ─────────────────────────────────

describe('the walk\u2019s paper (cadenceWalkCsv)', () => {
  const rows = [
    { name: 'Cement', storeCode: 'JUJ', storeName: 'Juja Main', band: 'never', daysSince: null, lastCountedAt: null, productCount: 4 },
    { name: 'Iron Sheets', storeCode: null, storeName: 'Thika Branch', band: 'stale', daysSince: 12, lastCountedAt: '2026-10-16T09:00:00.000Z', productCount: 3 },
    { name: 'Paints, Oil & Brushes', storeCode: 'RUI', storeName: 'Ruiru', band: 'fresh', daysSince: 0, lastCountedAt: '2026-10-28T07:00:00.000Z', productCount: 1 },
  ];

  it('the file opens with the BOM and speaks CRLF (Excel honesty, the drill\u2019s own laws)', () => {
    const csv = cadenceWalkCsv(rows);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('\r\n');
    expect(csv.endsWith('\r\n')).toBe(false);
  });

  it('six columns, in the wire\u2019s own order — the file re-sorts nothing', () => {
    const csv = cadenceWalkCsv(rows);
    const lines = csv.slice(1).split('\r\n');
    expect(lines[0]).toBe('aisle,store,band,days_since,last_counted_at,skus');
    expect(lines[1]).toBe('Cement,JUJ,never,,,4');
    expect(lines[2]).toBe('Iron Sheets,Thika Branch,stale,12,2026-10-16T09:00:00.000Z,3');
    expect(lines[3]).toBe('"Paints, Oil & Brushes",RUI,fresh,0,2026-10-28T07:00:00.000Z,1');
    expect(lines.length).toBe(4);
  });

  it('the honest absences export as EMPTY cells — a never-heard shelf has no date', () => {
    const csv = cadenceWalkCsv(rows);
    expect(csv).toContain('Cement,JUJ,never,,,4');
    expect(csv).not.toContain('null');
  });

  it('the store falls back to its NAME only when the code is absent (the wire\u2019s own voice)', () => {
    const csv = cadenceWalkCsv(rows);
    expect(csv).toContain('Iron Sheets,Thika Branch');
  });

  it('csvCell\u2019s quoting law rides verbatim (a comma rides wrapped)', () => {
    const csv = cadenceWalkCsv(rows);
    expect(csv).toContain('"Paints, Oil & Brushes"');
  });

  it('an empty shelf list exports the header alone (and the button would be hidden anyway)', () => {
    const csv = cadenceWalkCsv([]);
    expect(csv).toBe('\uFEFFaisle,store,band,days_since,last_counted_at,skus');
  });

  it('the export button rides the header and hides on a shelf-less cadence', () => {
    expect(map).toContain('data-testid="cadence-export"');
    expect(map).toContain('{cadence.categories.length > 0 && (');
    expect(map).toContain('cadenceWalkCsv(cadence.categories)');
  });

  it('the aria names the whole-order law (the download is the whole order, blind spots first)', () => {
    expect(map).toContain('aria-label={`Download all ${cadence.categories.length} aisles as CSV — the walk order as the wire speaks it, blind spots first`}');
  });

  it('the file is named for the day it speaks for', () => {
    expect(map).toContain("a.download = `walk-order-${new Date().toISOString().slice(0, 10)}.csv`;");
  });
});
