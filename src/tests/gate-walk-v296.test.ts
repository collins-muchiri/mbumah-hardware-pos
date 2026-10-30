// v2.296.0 — the drill learns to walk.
//
//   - THE WALK (feature ⑤): the gate drill panel's "+N earlier in this
//     window." static line was DEAD DATA — a number that never moved. The
//     events API already paginated (page/skip since v2.12.x); the panel now
//     WALKS: a "Show N earlier denials" button fetches the next page with
//     the SAME question the panel opened with (the drilled gate, the card's
//     lens), and the rows append under the DEDUPE LAW — the window slides,
//     a denial minted between two page fetches pushes a row the older page
//     already delivered, and the same record must never appear twice (nor
//     let a duplicate lie about how many remain).
//   - THE LIVE COUNT (feature ④): the remaining count is LIVE now — it
//     shrinks with every page the walk shows. The button names exactly what
//     the click WILL show (min(page size, remaining)) — the number on the
//     button is a promise the fetch can keep. When the ledger is complete
//     the button retires and the panel speaks the closing line; when a page
//     fetch fails the rows keep their places and the panel says so.
//   - THE ONE HOME: GateDrillEvent + GATE_DRILL_PAGE_SIZE + mergeDrillRows
//     live in the lib (pure, RUNTIME-pinned); the tab imports, never copies.
//
// THE TWO-NET LAW: the runtime net pins the walk's voices and the merge BY
// VALUE on the REAL functions; the byte net pins the wiring (the tab's walk
// state + callback + faces, the fetch's page param, the lib's exports).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  GATE_DRILL_PAGE_SIZE,
  mergeDrillRows,
  gateDrillEarlierVoice,
  gateDrillShowEarlierLabel,
  gateDrillExhaustedVoice,
  gateDrillErrorVoice,
  type GateDrillEvent,
} from '@/lib/security-feed';

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

const LIB = 'src/lib/security-feed.ts';
const TAB = 'src/app/(shell)/tabs/security-tab.tsx';

const row = (id: string): GateDrillEvent => ({
  id,
  eventType: 'PERMISSION_DENIED',
  severity: 'WARN',
  ipAddress: '::1',
  action: null,
  createdAt: '2026-10-30T10:00:00.000Z',
  blocked: false,
});

// ---- the walk's merge (runtime net) -----------------------------------------

describe('GATE_DRILL_PAGE_SIZE — the one page size (v2.296.0)', () => {
  it('is 8 — the fetch and the arithmetic ride the same constant', () => {
    expect(GATE_DRILL_PAGE_SIZE).toBe(8);
  });
});

describe('mergeDrillRows — the dedupe law (v2.296.0)', () => {
  it('appends the incoming page after the existing rows', () => {
    const merged = mergeDrillRows([row('a'), row('b')], [row('c'), row('d')]);
    expect(merged.map((e) => e.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('a record the older page already delivered never shows twice', () => {
    // the window slid: page 2 re-delivers 'b' and 'c' alongside the fresh 'e'
    const merged = mergeDrillRows([row('a'), row('b'), row('c')], [row('b'), row('c'), row('e')]);
    expect(merged.map((e) => e.id)).toEqual(['a', 'b', 'c', 'e']);
  });

  it('a page of pure repeats appends nothing — the walk just continues', () => {
    const existing = [row('a'), row('b')];
    const merged = mergeDrillRows(existing, [row('a'), row('b')]);
    expect(merged.map((e) => e.id)).toEqual(['a', 'b']);
  });

  it('an empty page changes nothing; the inputs are never mutated', () => {
    const existing = [row('a')];
    const merged = mergeDrillRows(existing, []);
    expect(merged.map((e) => e.id)).toEqual(['a']);
    expect(existing).toHaveLength(1);
  });
});

// ---- the walk's voices (runtime net) ----------------------------------------

describe('gateDrillEarlierVoice — the LIVE remaining count (v2.296.0)', () => {
  it('speaks the remaining denials in the window', () => {
    expect(gateDrillEarlierVoice(22)).toBe('22 earlier denials in this window.');
  });

  it('the singular remaining speaks singular', () => {
    expect(gateDrillEarlierVoice(1)).toBe('1 earlier denial in this window.');
  });

  it('zero is spoken verbatim — never guessed away', () => {
    expect(gateDrillEarlierVoice(0)).toBe('0 earlier denials in this window.');
  });
});

describe('gateDrillShowEarlierLabel — the button names its promise (v2.296.0)', () => {
  it('a full page promises eight', () => {
    expect(gateDrillShowEarlierLabel(8)).toBe('Show 8 earlier denials');
  });

  it('the last page promises only what remains', () => {
    expect(gateDrillShowEarlierLabel(6)).toBe('Show 6 earlier denials');
  });

  it('the singular promise speaks singular', () => {
    expect(gateDrillShowEarlierLabel(1)).toBe('Show 1 earlier denial');
  });
});

describe('gateDrillExhaustedVoice — the closing line (v2.296.0)', () => {
  it('the complete ledger says it is complete', () => {
    expect(gateDrillExhaustedVoice(14)).toBe('All 14 denials in this window are shown.');
  });

  it('the singular total speaks singular grammar', () => {
    expect(gateDrillExhaustedVoice(1)).toBe('All 1 denial in this window is shown.');
  });
});

describe('gateDrillErrorVoice — the honest failure (v2.296.0)', () => {
  it('a failed page fetch keeps the rows and admits the miss', () => {
    expect(gateDrillErrorVoice()).toBe('The earlier denials did not load — try again.');
  });
});

// ---- the byte net -----------------------------------------------------------

describe('the walk wiring (byte net, v2.296.0)', () => {
  it('the lib is the one home — the tab imports the walk\u2019s pieces, never copies them', () => {
    const lib = readRepo(LIB);
    expect(lib).toContain('export const GATE_DRILL_PAGE_SIZE = 8;');
    expect(lib).toContain('export interface GateDrillEvent {');
    expect(lib).toContain('export function mergeDrillRows(');
    expect(lib).toContain('export function gateDrillEarlierVoice(');
    expect(lib).toContain('export function gateDrillShowEarlierLabel(');
    expect(lib).toContain('export function gateDrillExhaustedVoice(');
    expect(lib).toContain('export function gateDrillErrorVoice(');
    const tab = readRepo(TAB);
    expect(tab).toMatch(
      /import \{[^}]*mergeDrillRows[^}]*GATE_DRILL_PAGE_SIZE[^}]*type GateDrillEvent[^}]*\} from '@\/lib\/security-feed';/
    );
    expect(tab).not.toContain('interface GateDrillEvent {');
  });

  it('the fetch walks — an additive page param, one limit constant, the page echoed back', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain('  page = 1\n');
    expect(tab).toContain('page: String(page),');
    expect(tab).toContain(
      'page: typeof json?.pagination?.page === \'number\' ? json.pagination.page : page,'
    );
  });

  it('the walk\u2019s ledger and its reset ride the drill\u2019s question', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain('const [drillExtra, setDrillExtra] = useState<GateDrillEvent[]>([]);');
    expect(tab).toContain('const [drillPage, setDrillPage] = useState(1);');
    expect(tab).toContain('const [drillLoading, setDrillLoading] = useState(false);');
    expect(tab).toContain('const [drillError, setDrillError] = useState(false);');
    // v2.296.0 re-anchor: the reset is the React RENDER-RESET (no effect —
    // the set-state-in-effect lint law): the walk's question change clears
    // the ledger before the render paints.
    expect(tab).toContain('const [walkGate, setWalkGate] = useState(gateDrill);');
    expect(tab).toContain('const [walkRange, setWalkRange] = useState(gateRange);');
    expect(tab).toContain('if (walkGate !== gateDrill || walkRange !== gateRange) {');
    expect(tab).toContain('setDrillExtra([]);');
    expect(tab).toContain('setDrillPage(1);');
  });

  it('the callback fetches the NEXT page with the same question and merges under the dedupe law', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain('const showEarlierGateRows = useCallback(async () => {');
    expect(tab).toContain('if (!gateDrill || drillLoading) return;');
    expect(tab).toContain('const next = await fetchGateDrill(gateDrill, gateRange, drillPage + 1);');
    expect(tab).toContain('setDrillExtra((prev) => mergeDrillRows(prev, next.events));');
    expect(tab).toContain('setDrillPage(drillPage + 1);');
    expect(tab).toContain('} catch {\n      setDrillError(true);');
    expect(tab).toContain('}, [gateDrill, gateRange, drillPage, drillLoading]);');
  });

  it('the panel\u2019s rows are page 1 PLUS the walk, deduped', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain('? mergeDrillRows(gateDrillQuery.data.events, drillExtra)');
    expect(tab).toContain('const pageOneCount = gateDrillQuery.data?.events.length ?? 0;');
  });

  it('the button names what it will show and wears the drill\u2019s amber family', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain('onClick={showEarlierGateRows}');
    expect(tab).toContain('disabled={drillLoading}');
    expect(tab).toContain('aria-busy={drillLoading || undefined}');
    expect(tab).toContain('border-amber-500/30 bg-amber-500/10');
    expect(tab).toContain('hover:bg-amber-500/20');
    expect(tab).toContain('disabled:opacity-60 disabled:cursor-not-allowed');
    expect(tab).toContain("Loader2 className=\"h-3 w-3 animate-spin\"");
    expect(tab).toContain("{drillLoading ? 'Loading\u2026' : gateDrillShowEarlierLabel(walkToShow)}");
  });

  it('the remaining count is LIVE; the closing and failure faces are the lib\u2019s words', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain('{gateDrillEarlierVoice(walkRemaining)}');
    expect(tab).toContain('{gateDrillExhaustedVoice(drillData.total)}');
    expect(tab).toContain('{gateDrillErrorVoice()}');
    expect(tab).toContain('const walkRemaining = drillData');
    expect(tab).toContain('const walkToShow = Math.min(GATE_DRILL_PAGE_SIZE, walkRemaining);');
    expect(tab).toContain(
      '!!drillData && walkRemaining === 0 && drillData.total > GATE_DRILL_PAGE_SIZE;'
    );
    expect(tab).toContain('text-red-600" role="status"');
  });

  it('the walked-in rows announce themselves quietly', () => {
    const tab = readRepo(TAB);
    expect(tab).toContain('i >= pageOneCount');
    expect(tab).toContain("animate-in fade-in slide-in-from-bottom-1 duration-500");
  });
});
