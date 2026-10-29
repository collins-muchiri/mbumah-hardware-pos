// v2.264.0 — the door downstairs.
//
//   - THE CARRIED CANDIDATE, ANSWERED AT LAST: the org ledger's
//     drill-to-branch affordance (carried since Tasks 236–238) — the
//     honest shape found. The ledger is READ-ONLY BY LAW ("the branch
//     workspace keeps the only pens"), so the answer to a narrowed
//     question is not a pen up here — it is a DOOR to where the pens
//     live: the named branch's own workspace Purchase Orders page.
//   - THE CARRY LAW (lens-memory's own, grown): the pressed lenses ride
//     the URL, never the session memory — a door is a hard navigation,
//     often a NEW tab, and a new tab holds no sessionStorage. The URL is
//     the only voice that survives the jump.
//   - THE MEMBERSHIP LAW, AT THE FAR END: a foreign word in a carried
//     param is refused (null), never guessed into a lens. The defaults
//     ('ALL'/'all') are nothing to carry — the door speaks only pressed
//     questions, and an unpressed lens rides as NO param at all.
//   - THE PRECEDENCE: an explicit question beats a remembered stance —
//     the door's carried lens wins over the memory's same-instrument
//     lens, instrument by instrument. The params are consumed ONCE and
//     stripped (the restock door's own one-time law).
//   - THE CHIP'S VOICE STAYS THE MEMORY'S: a door arrival is the door's
//     own — the remembered chip speaks only for a memory restoration.
//
// Byte pins read the SOURCE OF RECORD; the one home's carry parser and
// the door's builder get RUNTIME pins (pure functions — the runtime-pin
// law: byte pins cannot catch an arithmetic lie).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { lensCarryFromParams } from '@/lib/lens-memory';
import { buildBranchPurchaseOrdersHref } from '@/lib/workspace/links';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const memLib = read('src/lib/lens-memory.ts');
const links = read('src/lib/workspace/links.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const branch = read('src/app/(shell)/tabs/purchase-orders-tab.tsx');

describe('the carry law — the one home speaks the door\u2019s membership (v2.264.0)', () => {
  it('the carry\u2019s own bytes — the shape, the families, the refusal', () => {
    expect(memLib).toContain('export interface LensCarry {');
    expect(memLib).toContain(
      'export function lensCarryFromParams(band: string | null, metric: string | null): LensCarry {',
    );
    expect(memLib).toContain(
      "const CARRY_BANDS: ReadonlyArray<string> = ['fresh', 'stale', 'beyond', 'never', 'silent'];",
    );
    expect(memLib).toContain("const CARRY_METRICS: ReadonlyArray<string> = ['onTime', 'late', 'open'];");
    expect(memLib).toContain("THE LENS'S CARRY");
    // the memory's own law untouched beneath the growth (the envelope,
    // the guards, the swallow)
    expect(memLib).toContain('export function readLensMemory(key: string): LensMemory | null {');
    expect(memLib).toContain('export function writeLensMemory(key: string, memory: LensMemory): void {');
  });

  it('RUNTIME — a pressed question carried, a foreign word refused, silence carried as silence', () => {
    // the pressed pair rides
    expect(lensCarryFromParams('fresh', 'late')).toEqual({ band: 'fresh', metric: 'late' });
    // each side stands alone — a valid metric beside a foreign band
    // carries the metric and refuses the band
    expect(lensCarryFromParams(null, 'open')).toEqual({ band: null, metric: 'open' });
    expect(lensCarryFromParams('beyond', null)).toEqual({ band: 'beyond', metric: null });
    expect(lensCarryFromParams('medieval', 'late')).toEqual({ band: null, metric: 'late' });
    expect(lensCarryFromParams('fresh', 'torn')).toEqual({ band: 'fresh', metric: null });
    // the defaults are nothing to carry ('ALL'/'all' refused)
    expect(lensCarryFromParams('ALL', 'all')).toEqual({ band: null, metric: null });
    // absence answers absence
    expect(lensCarryFromParams(null, null)).toEqual({ band: null, metric: null });
    // case is the family's own — 'Late' is a stranger
    expect(lensCarryFromParams(null, 'Late')).toEqual({ band: null, metric: null });
  });
});

describe('the door\u2019s address — the builder (v2.264.0)', () => {
  it('the builder\u2019s bytes — one home, path-forced, the lenses as params', () => {
    expect(links).toContain('export function buildBranchPurchaseOrdersHref(');
    expect(links).toContain("buildStoreWorkspaceUrl(store, { page: '/purchase-orders', forcePath: true })");
    expect(links).toContain("if (lens?.band && lens.band !== 'ALL') params.set('band', lens.band);");
    expect(links).toContain("if (lens?.metric && lens.metric !== 'all') params.set('metric', lens.metric);");
    expect(links).toContain('THE DOOR DOWNSTAIRS');
  });

  it('RUNTIME — the address carries what is pressed and nothing else', () => {
    const store = { id: 'store_juja_main', slug: 'juja-main', subdomain: null };
    // both lenses pressed: both ride (band first — the insertion order)
    expect(buildBranchPurchaseOrdersHref(store, { band: 'fresh', metric: 'late' })).toBe(
      '/stores/juja-main/purchase-orders?band=fresh&metric=late',
    );
    // metric alone
    expect(buildBranchPurchaseOrdersHref(store, { band: 'ALL', metric: 'late' })).toBe(
      '/stores/juja-main/purchase-orders?metric=late',
    );
    // band alone
    expect(buildBranchPurchaseOrdersHref(store, { band: 'stale', metric: 'all' })).toBe(
      '/stores/juja-main/purchase-orders?band=stale',
    );
    // nothing pressed: the honest absence — no param at all
    expect(buildBranchPurchaseOrdersHref(store, { band: 'ALL', metric: 'all' })).toBe(
      '/stores/juja-main/purchase-orders',
    );
    expect(buildBranchPurchaseOrdersHref(store)).toBe('/stores/juja-main/purchase-orders');
    // the id is the fallback slug (a store with no slug still has a room)
    expect(buildBranchPurchaseOrdersHref({ id: 'store_x', slug: null, subdomain: null }, { metric: 'open' })).toBe(
      '/stores/store_x/purchase-orders?metric=open',
    );
  });
});

describe('the door itself — the org ledger\u2019s affordance (v2.264.0)', () => {
  it('the door\u2019s bytes — testid, the named-branch gate, the new-tab law, the carry', () => {
    expect(ledger).toContain('data-testid="po-ledger-branch-door"');
    expect(ledger).toContain("import { buildBranchPurchaseOrdersHref } from '@/lib/workspace/links';");
    expect(ledger).toContain('window.open(');
    expect(ledger).toContain("'_blank',");
    expect(ledger).toContain("'noopener',");
    expect(ledger).toContain('{ id: branch.id, slug: branch.slug, subdomain: branch.subdomain },');
    expect(ledger).toContain('{ band: bandLens, metric: metricLens },');
    // the gate: a door needs a named room
    expect(ledger).toContain("branchId !== 'ALL' &&");
    // the honest words: the pens live downstairs; the lenses ride along
    expect(ledger).toContain('the branch keeps the only pens');
    expect(ledger).toContain('the pressed lenses ride along');
    // the loaded door's own colour — the metric family's rail dot,
    // else the band house's rail
    expect(ledger).toContain('metricFam ? metricFam.rail :');
    expect(ledger).toContain('bandHouse(bandLens as CadenceBand).rail');
  });

  it('the ancestors untouched — the memory, the picker, the rails, the chip', () => {
    expect(ledger).toContain("readLensMemory('org-po-ledger')");
    expect(ledger).toContain("writeLensMemory('org-po-ledger', { band: bandLens, metric: metricLens });");
    expect(ledger).toContain('data-testid="po-ledger-branch-select"');
    expect(ledger).toContain('data-testid="po-ledger-metric-row"');
    expect(ledger).toContain('data-testid="po-ledger-lens-remembered"');
    expect((ledger.match(/useLensEscape\(/g) || []).length).toBe(1);
  });
});

describe('the door\u2019s landing — the branch face answers (v2.264.0)', () => {
  it('the landing\u2019s bytes — the carry law read at the one home, the one-time strip', () => {
    expect(branch).toContain("import { lensCarryFromParams } from '@/lib/lens-memory';");
    expect(branch).toContain("const carry = lensCarryFromParams(sp.get('band'), sp.get('metric'));");
    expect(branch).toContain("if (sp.has('band') || sp.has('metric')) {");
    expect(branch).toContain("window.history.replaceState(null, '', window.location.pathname + window.location.hash);");
    // the precedence: the door wins, instrument by instrument
    expect(branch).toContain('if (carry.band) setBandLens(carry.band);');
    expect(branch).toContain('if (carry.metric) setMetricLens(carry.metric);');
    // the chip speaks for the memory, never for the door
    expect(branch).toContain('if (mem && !carry.band && !carry.metric');
  });

  it('the landing rides the memory\u2019s own arrival — one mount effect, the write side intact', () => {
    // the door's landing lives INSIDE the memory's read effect (one
    // mount effect — a second set-state face is a warning the lint
    // baseline cannot afford); the door's words sit ABOVE the memory's
    // read, and the write side stands below, byte for byte.
    const carryIdx = branch.indexOf('const carry = lensCarryFromParams(');
    const readIdx = branch.indexOf("const mem = readLensMemory('branch-po-roster');");
    const writeIdx = branch.indexOf("writeLensMemory('branch-po-roster'");
    expect(carryIdx).toBeGreaterThan(-1);
    expect(readIdx).toBeGreaterThan(-1);
    expect(writeIdx).toBeGreaterThan(-1);
    expect(carryIdx).toBeLessThan(readIdx);
    expect(writeIdx).toBeGreaterThan(readIdx);
    // the skip-first-write law intact
    expect(branch).toContain('const firstWriteRef = useRef(true);');
    expect(branch).toContain('if (firstWriteRef.current) {');
  });

  it('the ancestors untouched — the detail\u2019s answer, the rails, the ear', () => {
    expect(branch).toContain("import { readLensMemory, writeLensMemory } from '@/lib/lens-memory';");
    expect(branch).toContain('data-testid="po-detail-metric-why"');
    expect(branch).toContain("metric={metricLens === 'all' ? undefined : metricLens}");
    expect(branch).toContain('data-testid="branch-po-metric-rail"');
    expect((branch.match(/useLensEscape\(/g) || []).length).toBe(1);
    expect(branch).not.toContain('useDrillEscape');
  });
});
