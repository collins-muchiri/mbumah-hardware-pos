// v2.353.0 — THE DOOR-SHAPE REGISTRY: a LIVING test that walks every route
// file under src/app/api and pins the body-door census as computed state,
// not memory. The bare-class tombstone (v2.344.0) and the loose-Record
// tombstone (v2.339.0) were byte pins on individual calls; this file is
// their successor — the WHOLE tree is the tombstone, re-derived on every
// run:
//
//   1. THE REGISTRY CENSUS — every readJsonBody / readOptionalJsonBody call
//      in every route carries an explicit generic naming the fields its
//      handler consumes. Zero bare calls, zero loose widening generics.
//      The counts are the registry: a door added or removed must move them
//      HERE, honestly.
//   2. THE RAW-SWALLOW REGISTRY — the documented honest-swallow class (the
//      v2.327 exemplars whose catch feeds an explicit 400) is counted, and
//      EVERY raw-reading file must answer 400 (either the Response spelling
//      or the APIError spelling) — with ONE pinned exemption, the Daraja
//      queue-timeout webhook whose leniency is the integration contract.
//   3. THE OPTIONAL FAMILY — the v2.353.0 graduates: four doors whose
//      empty-body call is legitimate now ride readOptionalJsonBody instead
//      of swallowing a malformed body into silence and proceeding (the
//      silent-proceed class the swallow census named and this round ends).
//   4. THE LEDGER'S CENSUS — the transactions desk's type chips carry
//      their live tallies and the active lens wears a count voice; the
//      chip map is the census keyset itself, so the two parameter
//      annotations the map used to need are gone.
//
// Every number in this file was DERIVED from the tree at round start (the
// derivation-assert law): the derive script printed it before any pin was
// written.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const walkRoutes = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walkRoutes(full));
    else if (entry === 'route.ts') out.push(full);
  }
  return out;
};

const routeFiles = walkRoutes(join(process.cwd(), 'src/app/api')).sort();
const srcs = new Map<string, string>(routeFiles.map((f) => [f, readFileSync(f, 'utf8')]));

const allSrc = () => [...srcs.values()].join('\n');
const count = (re: RegExp, src: string) => (src.match(re) ?? []).length;

// THE ONE documented exemption: the Daraja B2C queue-timeout webhook keeps
// its leniency — the integration contract owns that story (the swallow
// census pinned it; the registry keeps it).
const RAW_LENIENT_EXEMPT = ['src/app/api/payments/mpesa/b2c/queue-timeout/route.ts'];

// THE v2.353.0 GRADUATES — the silent-proceed doors that now ride the
// optional door (an empty body legitimate, an unreadable body a 400).
const GRADUATES: Array<{ file: string; shape: string; field: string }> = [
  {
    file: 'src/app/api/leave/requests/[id]/approve/route.ts',
    shape: 'readOptionalJsonBody<{ delegateApproverUserId?: unknown }>',
    field: 'door.body.delegateApproverUserId',
  },
  {
    file: 'src/app/api/leave/requests/[id]/reject/route.ts',
    shape: 'readOptionalJsonBody<{ rejectionReason?: unknown }>',
    field: 'door.body.rejectionReason',
  },
  {
    file: 'src/app/api/recruitment/applicants/[id]/withdraw/route.ts',
    shape: 'readOptionalJsonBody<{ note?: unknown }>',
    field: 'door.body.note',
  },
  {
    file: 'src/app/api/stock-takes/[id]/cancel/route.ts',
    shape: 'readOptionalJsonBody<{ reason?: unknown }>',
    field: 'door.body.reason',
  },
];

// ---------------------------------------------------------------------------
// 1. THE REGISTRY CENSUS — the whole tree is the tombstone
// ---------------------------------------------------------------------------

describe('THE DOOR-SHAPE REGISTRY — the census is derived, not remembered', () => {
  it('the walk covers the whole API surface (the registry scope is honest)', () => {
    // 380 route files at v2.353.0; 381 at v2.373.0 — the stranded-gap heal
    // route (src/app/api/transactions/[id]/refund-heal/route.ts) joined.
    // A route added or deleted must move this number HERE — that is the
    // registry working.
    expect(routeFiles.length).toBe(381);
  });

  it('every hard-door call carries its explicit generic (the v2.344 tombstone, tree-wide)', () => {
    const src = allSrc();
    expect(count(/\breadJsonBody\s*</g, src)).toBe(116);
    // THE TOMBSTONE, LIVE: a bare call — the generic-less form — matches ZERO files.
    expect(count(/\breadJsonBody\s*\(/g, src)).toBe(0);
  });

  it('every optional-door call carries its explicit generic (the v2.353 family included)', () => {
    const src = allSrc();
    expect(count(/\breadOptionalJsonBody\s*</g, src)).toBe(8);
    expect(count(/\breadOptionalJsonBody\s*\(/g, src)).toBe(0);
  });

  it('the loose widening generics stay dead (the v2.339 tombstone, tree-wide)', () => {
    const src = allSrc();
    expect(count(/\breadJsonBody\s*<(any|never|Record<string,\s*unknown|Record<string,\s*any)>/g, src)).toBe(0);
    expect(count(/\breadOptionalJsonBody\s*<(any|never)>/g, src)).toBe(0);
  });

  it('every door file imports the door from its ONE home', () => {
    const withoutHome = routeFiles.filter((f) => {
      const src = srcs.get(f) ?? '';
      return /readJsonBody|readOptionalJsonBody/.test(src) && !src.includes('@/lib/request-body');
    });
    expect(withoutHome).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. THE RAW-SWALLOW REGISTRY — the exemplar class is counted and honest
// ---------------------------------------------------------------------------

describe('THE RAW-SWALLOW REGISTRY — every remaining read answers 400 or is the webhook', () => {
  const rawFiles = routeFiles.filter((f) => /request\.json\(\)/.test(srcs.get(f) ?? ''));

  it('the raw call-site census is pinned (growth must be honest)', () => {
    const total = rawFiles.reduce((sum, f) => sum + count(/request\.json\(\)/g, srcs.get(f) ?? ''), 0);
    // 58 at v2.353.0; 59 at v2.373.0 — the heal route reads raw like the
    // refund route it mirrors (an empty body is legal: the settle needs no
    // allocation), and answers 400 on a malformed one (the honest-swallow
    // law below holds).
    expect(total).toBe(59);
  });

  it('every raw-reading file answers 400 (either spelling) — the honest-swallow law', () => {
    const liars = rawFiles.filter((f) => {
      if (RAW_LENIENT_EXEMPT.includes(f.replace(process.cwd() + '/', ''))) return false;
      const src = srcs.get(f) ?? '';
      return !/status: 400|APIError\(400/.test(src);
    });
    expect(liars).toEqual([]);
  });

  it('the ONE lenient webhook is pinned by name (the Daraja integration contract)', () => {
    const timeout = srcs.get(join(process.cwd(), RAW_LENIENT_EXEMPT[0])) ?? '';
    expect(timeout.includes('request.json().catch')).toBe(true);
    expect(timeout.includes('a timeout is NOT a')).toBe(true);
    // and the exemption list stays exactly one file long
    expect(RAW_LENIENT_EXEMPT.length).toBe(1);
  });

  it('the batch door answers its 400 through the APIError spelling (the registry knows both voices)', () => {
    const batch = srcs.get(join(process.cwd(), 'src/app/api/batch/route.ts')) ?? '';
    expect(batch.includes('APIError(400')).toBe(true);
    expect(batch.includes("'Invalid JSON body.'")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. THE OPTIONAL FAMILY — the silent-proceed class ends here
// ---------------------------------------------------------------------------

describe('THE OPTIONAL FAMILY — the v2.353.0 graduates ride the optional door', () => {
  for (const graduate of GRADUATES) {
    it(`${graduate.file} reads through readOptionalJsonBody (no chained swallow remains)`, () => {
      const src = srcs.get(join(process.cwd(), graduate.file)) ?? '';
      expect(src.includes(graduate.shape)).toBe(true);
      expect(src.includes('bodyDoorRejected()')).toBe(true);
      expect(src.includes(graduate.field)).toBe(true);
      expect(src.includes('THE OPTIONAL SWALLOW DOOR (v2.353.0)')).toBe(true);
      // the old swallow is gone — no raw chained read remains in the file
      expect(/await request\.json\(\)/.test(src)).toBe(false);
      expect(src.includes('from \'@/lib/request-body\'')).toBe(true);
    });
  }

  it('the graduates keep their OPTIONAL semantics (empty body still legitimate, defaults intact)', () => {
    // approve: delegation stays optional; reject: the honest default reason stays
    const reject = srcs.get(join(process.cwd(), 'src/app/api/leave/requests/[id]/reject/route.ts')) ?? '';
    expect(reject.includes("'Rejected by approver.'")).toBe(true);
    // withdraw: the note still trims and caps
    const withdraw = srcs.get(join(process.cwd(), 'src/app/api/recruitment/applicants/[id]/withdraw/route.ts')) ?? '';
    expect(withdraw.includes('.trim().slice(0, 500)')).toBe(true);
    // cancel: the reason still trims and caps at 300
    const cancel = srcs.get(join(process.cwd(), 'src/app/api/stock-takes/[id]/cancel/route.ts')) ?? '';
    expect(cancel.includes('.slice(0, 300)')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. THE LEDGER'S CENSUS — the transactions desk speaks its tallies
// ---------------------------------------------------------------------------

describe("THE LEDGER'S CENSUS — the type chips count, the lens speaks", () => {
  const desk = readFileSync(join(process.cwd(), 'src/app/(shell)/tabs/transactions-tab.tsx'), 'utf8');

  it('the census helper exists and rides the same array the desk renders (the plain-call law)', () => {
    expect(desk.includes('function countTransactionTypes(rows: TransactionItem[]):')).toBe(true);
    expect(desk.includes('census[getTransactionType(row)] += 1;')).toBe(true);
    expect(desk.includes('const typeCensus = countTransactionTypes(transactions);')).toBe(true);
  });

  it('the chip map IS the census keyset (as const) — and the two parameter annotations are gone', () => {
    // v2.378.0: the chip map grew the settlement value — the keyset IS
    // still the census's own Record keyset (the union's truth)
    expect(desk.includes("(['all', 'sale', 'refund', 'settlement', 'void'] as const).map((type) => (")).toBe(true);
    expect(desk.includes('getTransactionTypeIcon(type as')).toBe(false);
    expect(desk.includes('getTransactionTypeLabel(type as')).toBe(false);
    // the state rides its honest union — the lens voice reads the census without a cast
    // (v2.354.0: the seed grew a landing word — the initializer is now
    // `initialTxnType`, the SAME honest union through the generic parser)
    expect(desk.includes("useState<'all' | TransactionType>(initialTxnType)")).toBe(true);
  });

  it('each chip carries its live tally; the census row carries its handle', () => {
    expect(desk.includes('data-testid="txn-type-census"')).toBe(true);
    expect(desk.includes('<span className="tabular-nums opacity-70">· {typeCensus[type]}</span>')).toBe(true);
  });

  it('the active lens wears the sky count voice (never the refund amber, never the payment violet)', () => {
    expect(desk.includes('data-testid="txn-type-lens-voice"')).toBe(true);
    expect(desk.includes('{typeCensus[typeFilter]} in this lens')).toBe(true);
    expect(desk.includes('border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700')).toBe(true);
    expect(desk.includes('dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300')).toBe(true);
    // the voice renders ONLY when a lens is chosen — no news, no voice
    expect(desk.includes("{typeFilter !== 'all' && (")).toBe(true);
  });
});
