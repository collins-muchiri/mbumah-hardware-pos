// THE SETTLEMENT LENS (v2.378.0): the zero-item settlement stops
// masquerading and the release tells the truth.
//
// Two stories, one round:
//
// 1. THE SETTLEMENT KIND — v2.375.0 gave the zero-item REFUND event its
//    own row badge (the emerald settle ink, the HandCoins icon); the TYPE
//    still called it 'refund', so the refund lens mixed two money-out
//    shapes and the census undercounted the desk's daily question. This
//    round the kind union grows 'settlement': the derivation refines
//    through isSettlementEvent (the exported law), the chip/row/amount
//    cell speak the emerald ink, the census counts it, and the seventh
//    deep-link word's vocabulary grows ONE value — `?txn-type=settlement`
//    lands the ledger on the settlements' own lens (the membership home
//    rides untouched; the desk's own list is the truth).
// 2. THE RELEASE-SCOPED GATE — the Release workflow's publish step rode
//    the TAG's existence, so when the publish died on GitHub's transient
//    HTTP 500 after the tag was cut (v2.377.0), every rerun answered
//    "tag exists → skip" and reported success WITHOUT publishing. The
//    publish now gates on the RELEASE's own existence — the workflow's
//    idempotence is release-scoped, where the failure actually lives.
// 3. THE REPAIR'S OWN NOTE — the REPAIRED mode issues no receipt (no
//    money moved, no paper), so its only traveling voice is a WhatsApp
//    note that says exactly what happened: the ask rides the v2.376
//    dialog family, pre-fills the original's customer phone, and the
//    send is best-effort (skip = nothing sends; the repair stays home).
//
// Pins: the union's bytes, the derivation's refinement, the wearing
// trio (icon/ink/label), the census keyset, the vocabulary literal, the
// row tint and the amount cell, the live parser membership, the repair
// note's ask bytes and the best-effort guard, and the workflow's
// release-scoped gate. THE OD LAW: bytes, not memory.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseInitialNamedMember } from '@/lib/tab-url';

const DESK_PATH = 'src/app/(shell)/tabs/transactions-tab.tsx';
const desk = readFileSync(DESK_PATH, 'utf8');
const workflow = readFileSync('.github/workflows/release.yml', 'utf8');
const version = readFileSync('VERSION', 'utf8').trim();

const TXN_TYPE_FILTERS = ['all', 'sale', 'refund', 'settlement', 'void'] as const;

function between(startMarker: string, endMarker: string): string {
  const a = desk.indexOf(startMarker);
  const b = desk.indexOf(endMarker, a);
  expect(a, startMarker).toBeGreaterThanOrEqual(0);
  expect(b, endMarker).toBeGreaterThan(a);
  return desk.slice(a, b);
}

// ---------------------------------------------------------------------------
// 1. THE KIND'S OWN DERIVATION — the union, the refinement, the order law
// ---------------------------------------------------------------------------

describe('the settlement kind joins the union (v2.378.0)', () => {
  it('the union speaks four kinds', () => {
    expect(desk).toContain("type TransactionType = 'sale' | 'refund' | 'settlement' | 'void';");
  });

  it('the REFUND branch refines through isSettlementEvent (the zero-item event IS the settlement)', () => {
    const kind = between(
      'function getTransactionType(transaction: TransactionItem): TransactionType {',
      'function getTransactionTypeIcon(',
    );
    expect(kind).toContain('return isSettlementEvent(transaction) ? \'settlement\' : \'refund\';');
    // the refinement names its law at source
    expect(kind).toContain('THE KIND\'S OWN DERIVATION');
  });

  it('the wearing trio: HandCoins icon, emerald ink, the Settlement label', () => {
    expect(desk).toContain("case 'settlement': return <HandCoins className=\"h-3.5 w-3.5\" />;");
    expect(desk).toContain("case 'settlement': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';");
    expect(desk).toContain("case 'settlement': return 'Settlement';");
    // the kind never wears two faces — the icon note pins the law
    expect(desk).toContain('the kind never wears two faces');
  });

  it('the census keyset IS the union (the settlement counts beside its siblings)', () => {
    expect(desk).toContain('{ all: rows.length, sale: 0, refund: 0, settlement: 0, void: 0 }');
  });

  it('the row and the amount cell speak the settle ink', () => {
    expect(desk).toContain("txType === 'settlement' ? 'bg-emerald-50/50 dark:bg-emerald-950/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'");
    expect(desk).toContain("txType === 'settlement' ? 'text-emerald-700'");
    expect(desk).toContain("{txType === 'refund' || txType === 'settlement' ? '-' : ''}");
  });
});

// ---------------------------------------------------------------------------
// 2. THE ADDRESS BAR — the seventh word's vocabulary grows ONE value
// ---------------------------------------------------------------------------

describe('the settlement value answers the bar (the membership home, untouched)', () => {
  it('?txn-type=settlement seeds the lens; the case law holds', () => {
    expect(parseInitialNamedMember('?txn-type=settlement', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('settlement');
    expect(parseInitialNamedMember('?txn-type=SETTLEMENT', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?txn-type=refunds', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('all');
    expect(parseInitialNamedMember('?txn-type=settlement&txn-pay=CASH', 'txn-type', TXN_TYPE_FILTERS, 'all')).toBe('settlement');
  });

  it('the desk\u2019s vocabulary literal carries the new value (the parser home rides untouched)', () => {
    expect(desk).toContain("export const TXN_TYPE_FILTERS = ['all', 'sale', 'refund', 'settlement', 'void'] as const;");
    // the seed still reads the word through the ONE home
    expect(desk).toContain("parseInitialNamedMember(window.location.search, 'txn-type', TXN_TYPE_FILTERS, 'all')");
    // the census chip map speaks the same keyset (the door-shape law)
    expect(desk).toContain("(['all', 'sale', 'refund', 'settlement', 'void'] as const).map((type) => (");
  });
});

// ---------------------------------------------------------------------------
// 3. THE REPAIR'S OWN NOTE — the paper-substitute voice
// ---------------------------------------------------------------------------

describe('the REPAIRED branch shares its note (the paper law, second voice)', () => {
  it('the share ask rides the app\u2019s own dialog family', () => {
    expect(desk).toContain('title: `Share the repair note for ${settled.originalReceiptNumber}?`,');
    expect(desk).toContain('confirmLabel: \'Share note\',');
    expect(desk).toContain("prefill: tx.customer?.phone || '',");
    expect(desk).toContain('THE REPAIR\'S OWN NOTE');
  });

  it('the note says exactly what happened (the toast\u2019s own truth)', () => {
    expect(desk).toContain('`Status repaired — receipt ${settled.originalReceiptNumber} is fully refunded. ` +');
    expect(desk).toContain("'The refund chain already covered this sale; the badge caught up. No money moved.',");
  });

  it('the send is best-effort — the committed repair must never fail it', () => {
    expect(desk).toContain('const payload = res.data;');
    expect(desk).toContain("toast.success('Repair note sent via WhatsApp');");
    expect(desk).toContain('/* the note is best-effort; the repair is already home */');
  });

  it('the deps own the ask and the store (the exhaustive-deps law)', () => {
    expect(desk).toContain('}, [queryClient, askRecipient, currentStoreId]);');
  });
});

// ---------------------------------------------------------------------------
// 4. THE RELEASE-SCOPED GATE — the workflow\u2019s idempotence moves home
// ---------------------------------------------------------------------------

describe('the Release workflow gates the publish on the RELEASE (v2.378.0)', () => {
  it('the publish step no longer rides the tag\u2019s existence', () => {
    expect(workflow).toContain('id: release');
    expect(workflow).toContain("if: steps.release.outputs.exists == 'false'");
    // the OLD gate is gone from the publish step (the tag-scoped skip
    // was the v2.377.0 incident's root)
    expect(workflow.includes("steps.tag.outputs.exists == 'false'\n        env:")).toBe(false);
  });

  it('the tag cut keeps its own tag-scoped gate (the two gates are distinct)', () => {
    expect(workflow).toContain('if: steps.tag.outputs.exists == \'false\'');
  });

  it('the release check asks GitHub for the release itself (release-scoped, not derived)', () => {
    expect(workflow).toContain('gh release view "v${{ steps.ver.outputs.version }}" --repo "$GITHUB_REPOSITORY" --json id');
    expect(workflow).toContain('THE RELEASE-SCOPED GATE');
  });
});

// ---------------------------------------------------------------------------
// 5. THE RELEASE SLOTS — the version speaks the round
// ---------------------------------------------------------------------------

describe('the release slots', () => {
  it('VERSION speaks v2.378.0', () => {
    expect(version).toBe('2.451.0');
  });

  it('the desk carries the round\u2019s name', () => {
    expect(desk).toContain('v2.378.0');
  });
});
