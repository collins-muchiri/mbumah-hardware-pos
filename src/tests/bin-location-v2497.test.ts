// THE SHELF LEARNS ITS OWN ADDRESS (v2.497.0): the inventory desk's rows
// name where each product sits — the BinLocation model's wire and desk
// arrive this round (the model existed from the start; the shelf kept its
// addresses in the dark). This is a PRODUCT verse, not a family word —
// the census HOLDS (fifty-three words, thirty-three desks, forty-one
// families), no constitution row, no stress roll, no loom roll, no new
// hue (the chip and the door live on the shared muted ground).
//
//   • THE ONE HOME — the composition (aisle → shelf → bin, ", "), the
//     explicit WHOLE address winning, the caps naming the field, the
//     whole-empty row rejected, the census line (the summary's own words).
//   • THE WIRES — the map answers the ROW (one grouped read, never a
//     fan-out), the door answers the PRODUCT (list/add), the row wire
//     edits and removes; the storeId DERIVED SERVER-SIDE from the
//     product's own row (the body's storeId never trusted); the writes
//     gate to the product PATCH's own posture; every word trimmed and
//     capped through the ONE home.
//   • THE DESK — the row chip (the muted ground, the tabular digits, the
//     honest aria-label, the per-row silence), the door (the summary, the
//     empty state's own words, the live preview, the add/edit/remove).
//   • THE CLIENT — the writes never carry a storeId (the wire derives it).
//   • THE FEED — the round leads the feed (the museum shape from birth:
//     the find + the guard; this suite's own head pin rides 2.497.0
//     forever).
//   • THE RELEASE SURFACES — package.json's three slots, VERSION,
//     CHANGELOG, one voice.
//   • THE CENSUS HOLDS — no family word: the constitution's fifty-three
//     rows stand, the desk count stands.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { WHATS_NEW } from '@/lib/whats-new';
import {
  composeBinLocationCode,
  resolveBinLocationCode,
  validateBinLocationInput,
  primaryBinCode,
  binShelfSummary,
  BIN_PART_LIMITS,
} from '@/lib/bin-location';

const HOME = 'src/lib/bin-location.ts';
const MAP_WIRE = 'src/app/api/bin-locations/route.ts';
const DOOR_WIRE = 'src/app/api/products/[id]/bins/route.ts';
const ROW_WIRE = 'src/app/api/products/[id]/bins/[binId]/route.ts';
const DESK = 'src/app/(shell)/tabs/inventory-tab.tsx';
const CLIENT = 'src/lib/api.ts';
const CONSTITUTION = 'src/tests/transfer-status-deep-link-v2357.test.ts';

const home = readFileSync(HOME, 'utf8');
const mapWire = readFileSync(MAP_WIRE, 'utf8');
const doorWire = readFileSync(DOOR_WIRE, 'utf8');
const rowWire = readFileSync(ROW_WIRE, 'utf8');
const desk = readFileSync(DESK, 'utf8');
const client = readFileSync(CLIENT, 'utf8');
const constitution = readFileSync(CONSTITUTION, 'utf8');

// ---------------------------------------------------------------------------
// 1. THE ONE HOME — the address words composed once, spoken everywhere
// ---------------------------------------------------------------------------

describe('the shelf\u2019s own address — the ONE home composes the words', () => {
  it('the parts join aisle → shelf → bin with ", " — the model\u2019s own example', () => {
    expect(composeBinLocationCode({ aisle: 'Aisle A', shelf: 'Shelf 3', bin: 'Bin 12' })).toBe('Aisle A, Shelf 3, Bin 12');
    expect(composeBinLocationCode({ aisle: 'Aisle A', shelf: '', bin: 'Bin 12' })).toBe('Aisle A, Bin 12');
    expect(composeBinLocationCode({ aisle: 'Aisle A' })).toBe('Aisle A');
    expect(composeBinLocationCode({ aisle: '  Aisle A  ' })).toBe('Aisle A');
  });

  it('the silence answers null — every empty part is silence, not a clever match', () => {
    expect(composeBinLocationCode({})).toBeNull();
    expect(composeBinLocationCode({ aisle: '   ', shelf: null, bin: undefined })).toBeNull();
  });

  it('an address typed WHOLE wins over the parts — the maker\u2019s words are never re-composed', () => {
    expect(resolveBinLocationCode({ aisle: 'Aisle A', shelf: 'Shelf 3', bin: 'Bin 12', locationCode: 'Rack 9, behind the counter' })).toBe('Rack 9, behind the counter');
    expect(resolveBinLocationCode({ aisle: 'Aisle A', locationCode: '   ' })).toBe('Aisle A');
    expect(resolveBinLocationCode({})).toBeNull();
  });

  it('the caps name the field and the limit — the error carries the word\u2019s own number', () => {
    const long = 'x'.repeat(BIN_PART_LIMITS.aisle + 1);
    const rejected = validateBinLocationInput({ aisle: long });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.error).toContain('40');
    const longCode = 'x'.repeat(BIN_PART_LIMITS.locationCode + 1);
    const rejectedCode = validateBinLocationInput({ locationCode: longCode });
    expect(rejectedCode.ok).toBe(false);
    if (!rejectedCode.ok) expect(rejectedCode.error).toContain('80');
  });

  it('the whole-empty row is rejected — a bin with no address is not a bin', () => {
    const rejected = validateBinLocationInput({ aisle: '', shelf: '', bin: '' });
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) expect(rejected.error).toContain('address');
  });

  it('the valid input comes back trimmed and resolved', () => {
    const ok = validateBinLocationInput({ aisle: ' Aisle B ', shelf: ' Shelf 1 ', bin: ' Bin 2 ', quantityNote: '' } as never);
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.value.locationCode).toBe('Aisle B, Shelf 1, Bin 2');
  });

  it('the chip reads the FIRST row — the standing address; the empty shelf speaks null', () => {
    expect(primaryBinCode([{ locationCode: 'Aisle A, Shelf 3, Bin 12' }, { locationCode: 'Rack 9' }])).toBe('Aisle A, Shelf 3, Bin 12');
    expect(primaryBinCode([])).toBeNull();
  });

  it('the census line names the shelf\u2019s truth — bins, units, never NaN', () => {
    expect(binShelfSummary([])).toBe('No bin on file');
    expect(binShelfSummary([{ locationCode: 'A' }])).toBe('1 bin on the shelf');
    expect(binShelfSummary([{ locationCode: 'A' }, { locationCode: 'B', quantity: 12 }])).toBe('2 bins · 12 units shelved');
    expect(binShelfSummary([{ locationCode: 'A', quantity: 10.125 }])).toBe('1 bin · 10.13 units shelved');
    expect(binShelfSummary([{ locationCode: 'A', quantity: 'not-a-number' as never }])).toBe('1 bin on the shelf');
  });

  it('the home wears the round\u2019s own dated verse', () => {
    expect(home.includes("THE SHELF'S OWN ADDRESS")).toBe(true);
    expect(home.includes('v2.497.0')).toBe(true);
    expect(home.includes('Aisle A, Shelf 3, Bin 12')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. THE WIRES — the map answers the row, the door answers the product
// ---------------------------------------------------------------------------

describe('the shelf\u2019s wires — one truth, guarded doors', () => {
  it('the map wire reads the store\u2019s active bins lean, sorted for the standing address', () => {
    expect(mapWire.includes('isActive: true')).toBe(true);
    expect(mapWire.includes("orderBy: [{ productId: 'asc' }, { createdAt: 'asc' }]")).toBe(true);
    expect(mapWire.includes('select:')).toBe(true);
    expect(mapWire.includes('storeId is required.')).toBe(true);
    expect(mapWire.includes('requireStoreAccess')).toBe(true);
  });

  it('the map wire stays a READ door — the writes live on the product\u2019s own wire', () => {
    expect(mapWire.includes('export const GET')).toBe(true);
    expect(mapWire.includes('export const POST')).toBe(false);
    expect(mapWire.includes('export const PATCH')).toBe(false);
    expect(mapWire.includes('export const DELETE')).toBe(false);
  });

  it('the door wire derives the storeId SERVER-SIDE — the body\u2019s storeId is never trusted', () => {
    expect(doorWire.includes('select: { id: true, storeId: true, name: true }')).toBe(true);
    expect(doorWire.includes('storeId: product.storeId')).toBe(true);
    expect(doorWire.includes('body.storeId')).toBe(false);
  });

  it('the door wire validates through the ONE home — never a re-typed rule', () => {
    expect(doorWire.includes("from '@/lib/bin-location'")).toBe(true);
    expect(doorWire.includes('validateBinLocationInput')).toBe(true);
    expect(doorWire.includes('validation.ok')).toBe(true);
    expect(doorWire.includes('Product not found.')).toBe(true);
  });

  it('the writes gate to the product PATCH\u2019s own posture — INVENTORY_MANAGER and manager-plus', () => {
    expect(doorWire.includes("MANAGER_PLUS_ROLES")).toBe(true);
    expect(doorWire.includes("'INVENTORY_MANAGER'")).toBe(true);
    expect(doorWire.includes('BIN_EDIT_ROLES')).toBe(true);
    expect(rowWire.includes('BIN_EDIT_ROLES')).toBe(true);
  });

  it('the row wire edits and removes through the ONE home\u2019s same door', () => {
    expect(rowWire.includes("from '@/lib/bin-location'")).toBe(true);
    expect(rowWire.includes('validateBinLocationInput')).toBe(true);
    expect(rowWire.includes('Bin location not found.')).toBe(true);
    expect(rowWire.includes('export const PATCH')).toBe(true);
    expect(rowWire.includes('export const DELETE')).toBe(true);
    expect(rowWire.includes('readJsonBody')).toBe(true);
    expect(rowWire.includes('bodyDoorRejected')).toBe(true);
  });

  it('the quantity door is a number zero or more — the negative and the NaN both refused', () => {
    expect(doorWire.includes("error: 'The bin quantity is a number — zero or more.'")).toBe(true);
    expect(rowWire.includes("error: 'The bin quantity is a number — zero or more.'")).toBe(true);
    expect(doorWire.includes('!Number.isFinite(parsed) || parsed < 0')).toBe(true);
    expect(rowWire.includes('!Number.isFinite(parsed) || parsed < 0')).toBe(true);
  });

  it('the doors read the standing arg shape (v2.497.1: the rest seam\u2019s own order)', () => {
    // requireStoreAccess hands (request, session, ...rest) — a dynamic
    // route's context is the THIRD word, never the second (the args[1]
    // guess broke every door press into a 500 — Cannot destructure 'id'
    // of undefined; the correction names the shape where the wrapper
    // actually hands it)
    expect(doorWire.includes('(request: NextRequest, _session: AuthSession, context: RouteContext)')).toBe(true);
    expect(doorWire.includes('_request: NextRequest, _session: AuthSession, context: RouteContext')).toBe(true);
    expect(rowWire.includes('(request: NextRequest, _session: AuthSession, context: RouteContext)')).toBe(true);
    expect(rowWire.includes('_request: NextRequest, _session: AuthSession, context: RouteContext')).toBe(true);
    expect(doorWire.includes('args[1]')).toBe(false);
    expect(rowWire.includes('args[1]')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 3. THE DESK — the row chip and the door wear the shared muted ground
// ---------------------------------------------------------------------------

describe('the shelf on the desk — the chip and the door', () => {
  it('the row chip wears the muted ground, the tabular digits and the honest label', () => {
    expect(desk.includes('data-testid="inv-row-bin"')).toBe(true);
    expect(desk.includes('bg-muted/40')).toBe(true);
    expect(desk.includes('tabular-nums')).toBe(true);
    expect(desk.includes('transition-colors hover:bg-muted')).toBe(true);
    expect(desk.includes('Bin location for ${product.name}')).toBe(true);
    expect(desk.includes('open the shelf address door')).toBe(true);
  });

  it('the per-row silence is the strip\u2019s law — a row with no bin speaks nothing', () => {
    expect(desk.includes('binByProduct.get(product.id) && (')).toBe(true);
    expect(desk.includes('A row with no bin speaks nothing')).toBe(true);
    expect(desk.includes('per-row silence is')).toBe(true);
  });

  it('the map rides ONE query — never a per-row fan-out', () => {
    expect(desk.includes("queryKey: ['bin-locations', currentStoreId]")).toBe(true);
    expect(desk.includes('binLocationsApi.list(currentStoreId)')).toBe(true);
  });

  it('the door lists through its own query and stands closed by default', () => {
    expect(desk.includes("queryKey: ['product-bins', binDoorId]")).toBe(true);
    expect(desk.includes('enabled: !!binDoorId')).toBe(true);
    // the captured id — the mutations never name a product through a
    // non-null guess (the lint baseline's own law)
    expect(desk.includes('const binDoorId = binDoorProduct?.id ?? null;')).toBe(true);
  });

  it('the door\u2019s census line, empty state, preview and handles carry their own names', () => {
    expect(desk.includes('data-testid="bin-door-summary"')).toBe(true);
    expect(desk.includes('binShelfSummary(doorBins)')).toBe(true);
    expect(desk.includes('data-testid="bin-door-empty"')).toBe(true);
    expect(desk.includes('No bin on file — the shelf keeps its address here.')).toBe(true);
    expect(desk.includes('data-testid="bin-address-preview"')).toBe(true);
    expect(desk.includes('data-testid="bin-add-submit"')).toBe(true);
    expect(desk.includes('composeBinLocationCode')).toBe(true);
    expect(desk.includes('validateBinLocationInput')).toBe(true);
    expect(desk.includes('aria-live="polite"')).toBe(true);
  });

  it('the add and edit forms speak the same part words — one door, no side windows', () => {
    expect(desk.includes("aria-label=\"Aisle\"")).toBe(true);
    expect(desk.includes("aria-label=\"Shelf\"")).toBe(true);
    expect(desk.includes("aria-label=\"Bin\"")).toBe(true);
    expect(desk.includes("aria-label=\"Whole address\"")).toBe(true);
    expect(desk.includes('wins over the parts')).toBe(true);
  });

  it('every write invalidates the map AND the door\u2019s list — one truth after each press', () => {
    expect(desk.includes("queryClient.invalidateQueries({ queryKey: ['bin-locations'] })")).toBe(true);
    expect(desk.includes("queryClient.invalidateQueries({ queryKey: ['product-bins', binDoorProduct?.id] })")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE CLIENT — the writes never carry a storeId
// ---------------------------------------------------------------------------

describe('the shelf\u2019s client — the store rides the wire\u2019s own derivation', () => {
  it('add, update and remove name no storeId in the body', () => {
    expect(client.includes('export const binLocationsApi')).toBe(true);
    expect(client.includes('BinLocationMapRow')).toBe(true);
    expect(client.includes('BinLocationItem')).toBe(true);
    const addBody = client.slice(client.indexOf('add: async (productId'), client.indexOf('update: async (productId'));
    expect(addBody.includes('storeId')).toBe(false);
    const updateBody = client.slice(client.indexOf('update: async (productId'), client.indexOf('remove: async (productId'));
    expect(updateBody.includes('storeId')).toBe(false);
  });

  it('the map client encodes the storeId — the read names its store', () => {
    expect(client.includes('/bin-locations?storeId=${encodeURIComponent(storeId)}')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. THE FEED — the round announces itself (the museum shape from birth)
// ---------------------------------------------------------------------------

describe('whats-new — the round leads the feed', () => {
  it('the head wears the round\u2019s own story — the honoured chain and the shelf\u2019s tail', () => {
    const head = WHATS_NEW.find((e) => e.version === '2.497.0');
    if (!head) throw new Error('the 2.497.0 entry is gone from the feed');
    expect(head.version).toBe('2.497.0');
    expect(head.title).toContain('one breath');
    expect(head.title).toContain('the hand\u2019s turn retires the word');
    expect(head.title).toContain('the ledger\u2019s order rides the address');
    expect(head.title).toContain('and the shelf learns its own address');
    expect(head.bullets.length).toBeGreaterThanOrEqual(3);
    expect(head.bullets.some((b) => b.includes('THE SHELF'))).toBe(false); // the feed speaks lowercase prose, the caps live in the code
    expect(head.bullets.some((b) => b.includes('BinLocation'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('never re-typed'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('no address is not a bin'))).toBe(true);
    expect(head.bullets.some((b) => b.includes('fifty-three words, thirty-three desks, forty-one families'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. THE RELEASE SURFACES — package.json's three slots, VERSION, CHANGELOG
// ---------------------------------------------------------------------------

describe('the release surfaces speak with one voice', () => {
  it('package.json leads 2.497.0 (all three slots)', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      version: string;
      mbumah: { releaseVersion: string; baseVersion: string };
    };
    expect(pkg.version).toBe('2.497.1');
    expect(pkg.mbumah.releaseVersion).toBe('2.497.1');
    expect(pkg.mbumah.baseVersion).toBe('2.497.1');
  });

  it('VERSION + the feed\u2019s lead ride the same round', () => {
    expect(readFileSync('VERSION', 'utf8').trim()).toBe('2.497.1');
    expect(WHATS_NEW[0].version).toBe('2.497.1');
  });

  it('changelog anchors the section above its ancestor', () => {
    const changelog = readFileSync('CHANGELOG.md', 'utf8');
    expect(changelog.indexOf('[2.497.0]')).toBeGreaterThan(-1);
    expect(changelog.indexOf('[2.497.0]')).toBeLessThan(changelog.indexOf('[2.496.0]'));
    expect(changelog.includes('and the shelf learns its own address')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. THE CENSUS HOLDS — a product verse, not a family word
// ---------------------------------------------------------------------------

describe('the census holds — no new word, no new hue', () => {
  it('the constitution\u2019s fifty-three rows stand and the shelf names no word', () => {
    expect(constitution.includes('(fifty-three words, thirty-three desks)')).toBe(true);
    // no family word named 'bin': the precise row shape, never a substring
    // guess ('bin' rides honest words like bin-location — the product's
    // own bytes, not a registry word)
    expect(constitution.includes("{ word: 'bin'")).toBe(false);
  });

  it('no new landing hue joined the registry — the chip wears the shared muted ground', () => {
    expect(desk.includes('bg-muted/40')).toBe(true);
    expect(desk.includes('border-slate-300')).toBe(false); // the slate serves its eight words, not this chip
  });
});
