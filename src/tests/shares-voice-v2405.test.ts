import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { formatBranchShares, ORG_DESK_METRICS, type OrgDeskLedgerRow } from '@/components/org/desk-doors';

/**
 * v2.405.0 contracts — the shares speak.
 *
 * Gap: the org desk's BranchSliceModal rendered the branch ledger as
 * pixels only — a manager prepping a standup note re-typed the shares by
 * hand. And the wire's honest nulls (the summary array may carry null
 * gaps) leaked into every metric's slice signature, nine strict-mode
 * faces the desk had carried since v2.202.0.
 *
 * Covered here:
 *  1. formatBranchShares — the branch ledger as clipboard text, one pure
 *     home (the env-doctor precedent): the headline with the org total,
 *     the named branches loudest-first with their shares and count lines,
 *     the quiet zeroes never dropped, the honesty window note as the tail.
 *  2. The money/count voice law: formatValue rides the metric's own unit —
 *     money reads formatKES, counts read plain.
 *  3. The honest zero: a zero org total births no "0% of nothing" share.
 *  4. The row type: OrgDeskStoreRow — the element type with the wire's
 *     null peeled off — now backs slice AND countLine; the eight faces
 *     stand down without a single non-null assertion.
 *  5. The copy face on the modal: Copy → a two-second Copied hand-back →
 *     Copy (icon swaps, emerald family, honest refusal toast), rendered
 *     only when a ledger exists — an absent control never lies.
 *  6. The styling: the payload ledger's zebra ground on the named-branch
 *     rows, the share chip in the mono badge family.
 *  7. The negative guards: the wire's null filter stays byte-exact, and
 *     no non-null assertion entered the file.
 */

const readRepo = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');
const DOORS = readRepo('src/components/org/desk-doors.tsx');

const revenue = ORG_DESK_METRICS.revenue;
const transactions = ORG_DESK_METRICS.transactions;

const LEDGER: OrgDeskLedgerRow[] = [
  { storeId: 's1', name: 'Juja Main', value: 17400, countText: '5 transactions today' },
  { storeId: 's2', name: 'Nakuru Town', value: 11600, countText: null },
  { storeId: 's3', name: 'Thika West', value: 0, countText: null },
];

// ── 1. The ledger's voice ───────────────────────────────────────────────────

describe('formatBranchShares - the branch ledger as clipboard text', () => {
  it('the headline speaks the metric title, the org total and the branch count', () => {
    const text = formatBranchShares(revenue, LEDGER, 29000);
    const lines = text.split('\n');
    expect(lines[0]).toBe("The org's revenue by branch — Ksh 29,000.00 across 3 branches");
  });

  it('the named branches ride loudest-first with their shares and count lines', () => {
    const text = formatBranchShares(revenue, LEDGER, 29000);
    const lines = text.split('\n');
    expect(lines[1]).toContain('1. Juja Main — Ksh 17,400.00 · 60% of the org · 5 transactions today');
    expect(lines[2]).toContain('2. Nakuru Town — Ksh 11,600.00 · 40% of the org');
    // the count line is optional — a null countText leaves no dangling dot
    expect(lines[2]).not.toContain('undefined');
  });

  it('the quiet zeroes never drop — the At zero tail names them', () => {
    const text = formatBranchShares(revenue, LEDGER, 29000);
    expect(text).toContain('At zero: Thika West.');
  });

  it('the honesty window note rides as the tail', () => {
    const text = formatBranchShares(revenue, LEDGER, 29000);
    const tail = text.split('\n').at(-1);
    expect(tail).toContain('The slice reads the 3 branches named on this summary');
    expect(tail).toContain("the tile's figure stays the truth");
  });

  it('the count voice reads plain numbers — a count converted to shillings is nonsense', () => {
    const countLedger: OrgDeskLedgerRow[] = [
      { storeId: 's1', name: 'Juja Main', value: 5, countText: null },
    ];
    const text = formatBranchShares(transactions, countLedger, 5);
    expect(text.split('\n')[0]).toBe("The org's transactions by branch — 5 across 1 branch");
    expect(text.split('\n')[1]).toContain('1. Juja Main — 5 · 100% of the org');
  });

  it('the singular branch reads "1 branch" — never "1 branches"', () => {
    const one: OrgDeskLedgerRow[] = [{ storeId: 's1', name: 'Juja Main', value: 100, countText: null }];
    const text = formatBranchShares(revenue, one, 100);
    expect(text).toContain('across 1 branch\n');
    expect(text).toContain('The slice reads the 1 branch named on this summary');
  });

  it('the honest zero: a zero org total births no share — never "0% of nothing"', () => {
    const text = formatBranchShares(revenue, LEDGER, 0);
    expect(text).not.toContain('% of the org');
    expect(text).toContain('1. Juja Main — Ksh 17,400.00');
  });

  it('an empty ledger speaks the headline and the note — never an empty paste', () => {
    const text = formatBranchShares(revenue, [], 0);
    expect(text.split('\n')).toHaveLength(2);
    expect(text.split('\n')[0]).toContain('across 0 branches');
  });
});

// ── 2. The row type + the nine faces' stand-down ───────────────────────────

describe('desk-doors - the wire\u2019s nulls stay at the door', () => {
  it('OrgDeskStoreRow is the named element type, exported once', () => {
    expect(DOORS).toContain(
      "export type OrgDeskStoreRow = NonNullable<NonNullable<OrgDeskWire['stores']>[number]>;",
    );
  });

  it('slice AND countLine speak the row — the eight faces stand down', () => {
    expect(DOORS).toContain('slice: (s: OrgDeskStoreRow) => number;');
    expect(DOORS).toContain('countLine?: (s: OrgDeskStoreRow) => string | null;');
    // the old leaky signatures are gone for good
    expect(DOORS).not.toContain("slice: (s: NonNullable<OrgDeskWire['stores']>[number])");
    expect(DOORS).not.toContain("countLine?: (s: NonNullable<OrgDeskWire['stores']>[number])");
  });

  it('the indicative chain rides the optional currency lookup', () => {
    expect(DOORS).toContain('indicativeQuery.data?.data?.currencies?.find(');
    expect(DOORS).not.toContain('.currencies.find(');
  });

  it('no non-null assertion entered the file (the desk-doors law holds)', () => {
    expect(DOORS).not.toContain('!.');
  });

  it('the wire\u2019s null filter stays byte-exact (the v2.202.0 guard)', () => {
    expect(DOORS).toContain('.filter((s): s is NonNullable<typeof s> => !!s && s.id != null)');
  });
});

// ── 3. The copy face on the modal ───────────────────────────────────────────

describe('BranchSliceModal - the ledger hands itself over', () => {
  it('the Copy button rides its testid and the pure formatter (one home)', () => {
    expect(DOORS).toContain('data-testid="branch-shares-copy"');
    expect(DOORS).toContain('navigator.clipboard.writeText(formatBranchShares(metric, rows, total))');
  });

  it('the copy face law: a two-second Copied hand-back, then Copy again', () => {
    expect(DOORS).toContain('setCopied(false), 2000');
    expect(DOORS).toContain("{copied ? 'Copied' : 'Copy'}");
    // the icon swaps with the label
    expect(DOORS).toContain('? <Check className="h-3 w-3" aria-hidden="true" />');
    expect(DOORS).toContain(': <ClipboardCopy className="h-3 w-3" aria-hidden="true" />');
  });

  it('the success state wears the emerald family; a refusal toasts honestly', () => {
    expect(DOORS).toContain('border-emerald-200 bg-emerald-50 text-emerald-700');
    expect(DOORS).toContain("toast.error('Could not copy the branch ledger — the clipboard refused.')");
  });

  it('rendered only when a ledger exists — an absent control never lies', () => {
    expect(DOORS).toContain('{rows.length > 0 ? <CopySharesButton metric={metric} rows={rows} total={total} /> : null}');
  });
});

// ── 4. The styling ──────────────────────────────────────────────────────────

describe('BranchSliceModal - the zebra and the mono badge', () => {
  it('the named-branch rows ride the payload ledger\u2019s zebra (light + dark)', () => {
    expect(DOORS).toContain('[&>li:nth-child(odd)]:bg-slate-100/70 dark:[&>li:nth-child(odd)]:bg-slate-800/40');
  });

  it('the share chip wears the mono badge family', () => {
    expect(DOORS).toMatch(/data-testid=\{`org-desk-share-\$\{metric\.id\}`\}/);
    expect(DOORS).toContain('font-mono text-[10px] font-semibold');
  });
});

// ── 5. The negative guards ──────────────────────────────────────────────────

describe('the ancestors untouched', () => {
  it('the wire interface and the metric map keep their exported names', () => {
    expect(DOORS).toContain('export interface OrgDeskWire');
    expect(DOORS).toContain('export const ORG_DESK_METRICS: Record<OrgDeskMetricId, OrgDeskMetric>');
    expect(DOORS).toContain('export function deskDoorVoice');
  });

  it('the desk never fetches (the v2.199 zero-fetch law holds three surfaces wide)', () => {
    expect(DOORS).not.toContain('fetch(');
    expect(DOORS).not.toContain("from '@/lib/db'");
    expect(DOORS).not.toContain('prisma');
  });
});
