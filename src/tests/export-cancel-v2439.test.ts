// THE STUCK ROW LEARNS TO BOW OUT (v2.439.0): the cancel door's own
// suite. The POST /api/data-exports pipeline finishes its row
// synchronously, so a PENDING/PROCESSING row only exists when the
// invocation DIED (serverless timeout, dropped connection, crash) —
// and until this round the vocabulary had no word for what happened
// next: the spinner spun forever, the download answered 409 for
// eternity. The round gives the desk its honest exit:
//   • the wire's word: CANCELLED joins DataExportStatus (with FAILED —
//     both are "this file will never arrive" — and before EXPIRED, the
//     derived overlay keeps the last seat),
//   • the door: POST /api/data-exports/[id]/cancel — 404 / tenancy 403 /
//     the stuck-row gate 409 (only PENDING/PROCESSING pass; finished
//     history is never rewritten), the row STAYS wearing its note, the
//     audit speaks DATA_EXPORT_CANCELLED,
//   • the desk: a zinc Cancelled badge (the Ban icon — neither failure
//     nor success), a Cancelled chip (zinc, the withdrawn voice), the
//     cancel hand on exactly the waiting rows, the row dimmed to
//     opacity-60 (the withdrawn read, one step past the expired's 70),
//   • the download route: the cancelled face answers with its OWN 409
//     message, between the FAILED gate and the expiry gate (the 410
//     still sits BEFORE the COMPLETED gate — v2.438.0's order pin
//     untouched),
//   • the deep-link word: `exp-status=cancelled` joins
//     EXP_STATUS_FILTERS (the chip row's own spelling),
//   • the fixture world wears the face: one LOYALTY row cancelled by
//     the owner — fifteen rows, coherence kept (the note only; none of
//     the completion faces; never expires — no file to lose).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const API = 'src/lib/api.ts';
const CANCEL_ROUTE = 'src/app/api/data-exports/[id]/cancel/route.ts';
const DOWNLOAD = 'src/app/api/data-exports/[id]/download/route.ts';
const TABLE = 'src/components/data-exports/exports-history-table.tsx';
const TAB_URL = 'src/lib/tab-url.ts';
const DESK = 'src/app/(shell)/tabs/data-exports-tab.tsx';
const FIXTURE = 'scripts/seed-exports-fixtures.mjs';

const api = readFileSync(API, 'utf8');
const cancelRoute = readFileSync(CANCEL_ROUTE, 'utf8');
const download = readFileSync(DOWNLOAD, 'utf8');
const table = readFileSync(TABLE, 'utf8');
const tabUrl = readFileSync(TAB_URL, 'utf8');
const desk = readFileSync(DESK, 'utf8');
const fixture = readFileSync(FIXTURE, 'utf8');

describe('the wire speaks the stuck row (v2.439.0)', () => {
  it('CANCELLED joins DataExportStatus — with FAILED, before EXPIRED', () => {
    expect(api).toContain("  | 'CANCELLED'\n  | 'EXPIRED';");
    // the seat law, scoped to the DataExportStatus union's own region —
    // the file speaks an elder `| 'CANCELLED'` (the M-Pesa union) whose
    // seat is NOT this one's; the slice keeps the elder out of the law.
    const unionAt = api.indexOf('export type DataExportStatus');
    const region = api.slice(unionAt, unionAt + 800);
    const failedAt = region.indexOf("  | 'FAILED'");
    const cancelledAt = region.indexOf("  | 'CANCELLED'");
    const expiredAt = region.indexOf("  | 'EXPIRED'");
    expect(unionAt).toBeGreaterThan(-1);
    expect(failedAt).toBeGreaterThan(-1);
    expect(cancelledAt).toBeGreaterThan(failedAt);
    expect(expiredAt).toBeGreaterThan(cancelledAt);
  });

  it('the client speaks the door (the cancel method rides the item type)', () => {
    expect(api).toContain('cancel: async (id: string) => {');
    expect(api).toContain('`/data-exports/${id}/cancel`');
    expect(api).toContain("method: 'POST',");
  });
});

describe('the cancel door — POST /api/data-exports/[id]/cancel (v2.439.0)', () => {
  it('the route exists under the write roles, the family\u2019s own wrapper shape', () => {
    expect(cancelRoute).toContain(
      "const FINANCIAL_WRITE_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER', 'ACCOUNTANT'] as const;",
    );
    expect(cancelRoute).toContain(
      'withFinancialAuth(cancelExportHandler, FINANCIAL_WRITE_ROLES)',
    );
    expect(cancelRoute).toContain("'DATA_EXPORT_CANCEL',");
  });

  it('the three gates answer in order — 404, then tenancy 403, then the stuck-row gate', () => {
    expect(cancelRoute).toContain(
      "{ success: false, error: 'Export not found. It may have been deleted.' },",
    );
    expect(cancelRoute).toContain(
      "{ success: false, error: 'You do not have permission to cancel this export.' },",
    );
    expect(cancelRoute).toContain(
      'if (exportRow.status !== \'PENDING\' && exportRow.status !== \'PROCESSING\') {',
    );
    expect(cancelRoute).toContain(
      '`Only a stuck export can be cancelled (current state: ${exportRow.status}).`',
    );
    const notFoundAt = cancelRoute.indexOf("'Export not found. It may have been deleted.'");
    const tenancyAt = cancelRoute.indexOf("'You do not have permission to cancel this export.'");
    const gateAt = cancelRoute.indexOf("Only a stuck export can be cancelled");
    expect(notFoundAt).toBeGreaterThan(-1);
    expect(tenancyAt).toBeGreaterThan(notFoundAt);
    expect(gateAt).toBeGreaterThan(tenancyAt);
  });

  it('the retirement keeps the row and speaks the note — never a second deletion', () => {
    expect(cancelRoute).toContain("status: 'CANCELLED',");
    expect(cancelRoute).toContain(
      '`Cancelled by ${session?.email ?? \'an unknown user\'} before completion.`',
    );
    expect(cancelRoute).not.toContain('dataExport.delete');
    expect(cancelRoute).toContain('include: {\n      createdBy: { select: { id: true, name: true, email: true } },\n    },');
  });

  it('the audit speaks the retirement with the previous state', () => {
    expect(cancelRoute).toContain("action: 'DATA_EXPORT_CANCELLED',");
    expect(cancelRoute).toContain('previousStatus: exportRow.status');
    expect(cancelRoute).toContain(
      '`Stuck export "${exportRow.exportType}" (${exportRow.format}) cancelled while ${exportRow.status}.`',
    );
  });
});

describe('the download route speaks the cancelled face (v2.439.0)', () => {
  it('the cancelled gate answers its own 409 — not the waiting room\u2019s, not the generic state\u2019s', () => {
    expect(download).toContain("if (exportRow.status === 'CANCELLED') {");
    expect(download).toContain(
      "'This export was cancelled before it finished. Please generate a new export.'",
    );
  });

  it('the gate order: FAILED, then CANCELLED, then the expiry 410, then the COMPLETED gate (v2.438.0\u2019s pin untouched)', () => {
    const failedAt = download.indexOf("exportRow.status === 'FAILED'");
    const cancelledAt = download.indexOf("exportRow.status === 'CANCELLED'");
    const goneAt = download.indexOf('expiresAt.getTime() < Date.now()');
    const completedGateAt = download.indexOf("exportRow.status !== 'COMPLETED'");
    expect(failedAt).toBeGreaterThan(-1);
    expect(cancelledAt).toBeGreaterThan(failedAt);
    expect(goneAt).toBeGreaterThan(cancelledAt);
    expect(goneAt).toBeLessThan(completedGateAt);
  });
});

describe('the desk wears the withdrawn face (v2.439.0)', () => {
  it('the chip row grows the zinc voice — Cancelled rides last, the withdrawn wardrobe', () => {
    expect(table).toContain("{ key: 'cancelled', label: 'Cancelled', color: 'zinc' },");
    // v2.456.0 RE-KEY (dated): the chip colour registries moved to the
    // loom's ONE tone registry (CHIP_TONE_ACTIVE / CHIP_TONE_IDLE —
    // chip-tones-v2456.test.ts pins the weave); the desk rides
    // `tone={chip.color}` and speaks no wardrobe byte. The active zinc
    // row gained the family's shadow in the unification; the idle zinc
    // row kept its exact historic bytes — in the loom now.
    expect(table).toContain('tone={chip.color}');
    const loomWardrobe = readFileSync('src/components/filter-chip.tsx', 'utf8');
    expect(loomWardrobe).toContain("zinc: 'bg-zinc-600 text-white border-zinc-600 shadow-sm',");
    expect(loomWardrobe).toContain(
      "zinc: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900/40 dark:text-zinc-300 dark:border-zinc-700',",
    );
    // the lens word is a member of the table's own FilterKey union
    expect(table).toContain(
      "type FilterKey = 'all' | 'completed' | 'failed' | 'processing' | 'cancelled';",
    );
  });

  it('the lens answers the cancelled word from the STORED statuses', () => {
    expect(table).toContain("case 'cancelled':\n          return exports.filter((e) => e.status === 'CANCELLED');");
    expect(table).toContain("cancelled: exports.filter((e) => e.status === 'CANCELLED').length,");
  });

  it('the badge: zinc, the Ban icon — neither failure nor success', () => {
    expect(table).toContain("case 'CANCELLED':");
    expect(table).toContain(
      '<Badge className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-300 hover:bg-zinc-100">',
    );
    expect(table).toContain('<Ban className="h-3 w-3 mr-1" />');
    expect(table).toContain('Cancelled\n        </Badge>');
  });

  it('the cancel hand exists ONLY on a waiting row — the gate law mirrored in the UI', () => {
    expect(table).toContain(
      "{(item.status === 'PENDING' ||\n                        item.status === 'PROCESSING') && (",
    );
    expect(table).toContain('data-testid="export-cancel-btn"');
    expect(table).toContain('title="Cancel stuck export"');
    expect(table).toContain('onClick={() => cancelMutation.mutate(item.id)}');
    expect(table).toContain(
      'className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900/40"',
    );
  });

  it('the withdrawn read — the cancelled row dims to opacity-60, its own testid', () => {
    expect(table).toContain("? 'opacity-60' // v2.439.0 the withdrawn read");
    expect(table).toContain("? 'export-row-cancelled'");
  });

  it('the finished rows never wear the hand (the processing word\u2019s own rows do)', () => {
    // the hand\u2019s condition is the waiting union ONLY — a COMPLETED,
    // FAILED, EXPIRED or CANCELLED row never re-enters it.
    const handAt = table.indexOf("data-testid=\"export-cancel-btn\"");
    const conditionAt = table.indexOf("(item.status === 'PENDING' ||");
    expect(handAt).toBeGreaterThan(conditionAt);
    expect(table).toContain("item.status === 'PROCESSING') && (");
  });
});

describe('the deep-link word joins the lens (v2.439.0)', () => {
  it('EXP_STATUS_FILTERS grows cancelled — the chip row\u2019s own spelling, one home', () => {
    expect(tabUrl).toContain("export const EXP_STATUS_FILTERS = [\n  'all',\n  'completed',\n  'failed',\n  'processing',\n  'cancelled',\n] as const;");
  });

  it('the desk\u2019s own doc carries the new word (the comment and the array speak together)', () => {
    expect(desk).toContain('completed | failed | processing | cancelled, the chip word\'s voice');
  });
});

describe('the fixture world wears the face (v2.439.0)', () => {
  it('the fifteenth row is the cancelled one — loyalty, cancelled by the owner', () => {
    expect(fixture).toContain("['loyalty-cancelled', 'LOYALTY', 'CSV', 'CANCELLED', 0, 1, null],");
    expect(fixture).toContain('fifteen DataExport history rows');
    expect(fixture).not.toContain('fourteen DataExport history rows');
  });

  it('the coherence law: the note only — none of the completion faces, never expires', () => {
    expect(fixture).toContain('const cancelled = status === \'CANCELLED\';');
    expect(fixture).toContain(
      "'Cancelled by the owner while it was stuck — the generation never finished.'",
    );
    // the completion faces stay conditioned on COMPLETED alone
    expect(fixture).toContain('expiresAt: completed ? daysFromNow(expiresInDays ?? 7) : null,');
    expect(fixture).toContain('completedAt: completed ? daysAgo(ago) : null,');
    expect(fixture).toContain('filePath: completed ?');
  });

  it('the census speaks the cancelled count (the code\u2019s own arithmetic)', () => {
    expect(fixture).toContain(
      "const cancelled = ROWS.filter(([, , , s]) => s === 'CANCELLED').length;",
    );
    expect(fixture).toContain(
      '(8 completed + ${expired} expired, 2 failed, 1 processing, ${pending} pending, ${cancelled} cancelled, ${offUnion} off-union: PAYROLL + ALL)',
    );
  });
});
