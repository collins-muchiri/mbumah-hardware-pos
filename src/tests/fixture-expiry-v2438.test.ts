// THE WORLD LEARNS TO EXPIRE (v2.438.0): the export history's expiry
// story was fully written in code and never spoken on a fresh world —
// the derived Expired badge (a COMPLETED row whose expiresAt has passed),
// the disabled download with its honest tooltip, the endpoint's 410 Gone
// BEFORE the COMPLETED gate, and the retention chip's silence ("the
// Expired badge owns the past") all waited for a row with a PAST
// expiresAt that no fixture carried. This round the fixture world wears
// the face (one COMPLETED row, retention ended 2 days ago) and the desk
// grows the retired read:
//   • the fixture row keeps its REAL content — a COMPLETED row's own
//     truth is complete; the endpoint's 410 answers BEFORE content
//     matters (expiry is time's own work, never a status change),
//   • the expired row wears opacity-70 — the desk reads the retired row
//     at a glance, non-expired rows byte-identical,
//   • the lens speaks the STORED truth: the completed word matches the
//     expired row too (the count paragraph's same filter) — expiry is
//     the overlay, never a second status.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const EXPORTS_FIXTURE = 'scripts/seed-exports-fixtures.mjs';
const TABLE = 'src/components/data-exports/exports-history-table.tsx';
const DOWNLOAD = 'src/app/api/data-exports/[id]/download/route.ts';

const fixture = readFileSync(EXPORTS_FIXTURE, 'utf8');
const table = readFileSync(TABLE, 'utf8');
const download = readFileSync(DOWNLOAD, 'utf8');

describe('the fixture world learns to expire (v2.438.0)', () => {
  it('the EXPIRED row wears COMPLETED with a NEGATIVE retention window (time\u2019s own work, never a status change)', () => {
    expect(fixture).toContain("['products-expired', 'PRODUCTS', 'CSV', 'COMPLETED', 80, 9, -2],");
    expect(fixture).toContain('expiresAt: completed ? daysFromNow(expiresInDays ?? 7) : null,');
  });

  it('the retention window is per-row and defaults to the endpoint\u2019s own 7-day law', () => {
    expect(fixture).toMatch(/, 7\],/);
    expect(fixture).toContain('a NEGATIVE window is already past, and the derived Expired face speaks');
    expect(fixture).not.toContain('daysFromNow(7) : null');
  });

  it('the expired COMPLETED row keeps its REAL content (the endpoint\u2019s 410 answers before content matters)', () => {
    expect(fixture).toContain('a COMPLETED row keeps its real content');
    // the content expression conditions on COMPLETED only — never on expiry
    expect(fixture).toContain('const content = completed\n      ? format === \'JSON\'');
    expect(fixture).not.toContain('content = completed && !expired');
  });

  it('the fifteen-row world\u2019s summary census speaks the expired face', () => {
    // v2.439.0 re-anchor: fourteen grew to fifteen (the cancelled face
    // joined) — the prose pin and the not-pins move together.
    expect(fixture).toContain('fifteen DataExport history rows');
    expect(fixture).not.toContain('fourteen DataExport history rows');
    expect(fixture).toContain("const expired = ROWS.filter(([, , , , , , d]) => d !== null && d < 0).length;");
    expect(fixture).toContain('(8 completed + ${expired} expired, 2 failed, 1 processing, ${pending} pending, ${cancelled} cancelled, ${offUnion} off-union: PAYROLL + ALL)');
  });
});

describe('the desk wears the expiry truth (v2.438.0)', () => {
  it('the derivation reads expiresAt only — a row without the window never expires', () => {
    expect(table).toContain('function isExportExpired(item: DataExportItem): boolean {');
    expect(table).toContain('if (!item.expiresAt) return false;');
    expect(table).toContain('return Number.isFinite(t) && t < Date.now();');
  });

  it('the derived badge speaks BESIDE the stored one — the pair, never a replacement', () => {
    expect(table).toContain('<StatusBadge status={item.status} />');
    expect(table).toContain('data-testid="export-expired-badge"');
    expect(table).toContain("className=\"gap-1 border-amber-300 bg-amber-50 px-1.5 py-0 text-[10px] font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400\"");
  });

  it('the retired read — the expired row dims (the cancelled row joins one step past, v2.439.0)', () => {
    // v2.439.0 re-anchor: the row lens grew the cancelled ternary — the
    // expired face's own bytes keep their seat, first in the chain.
    expect(table).toContain("isExportExpired(item)\n                      ? 'opacity-70'");
    expect(table).toContain("? 'export-row-expired'");
  });

  it('the download refuses the expired row before the click — disabled with the honest tooltip', () => {
    expect(table).toContain("isExportExpired(item)\n                            ? 'Expired - files are kept for 7 days. Generate a new export.'\n                            : 'Download'");
    expect(table).toMatch(/disabled=\{\n                          item\.status !== 'COMPLETED' \|\|\n                          isExportExpired\(item\) \|\|/);
  });

  it('the retention chip stays silent on the past — the badge owns it', () => {
    expect(table).toContain('if (ms <= 0) return null; // the Expired badge owns the past');
    expect(table).toContain('data-testid="export-retention"');
  });

  it('the lens speaks the STORED truth — the completed word matches the expired row too (expiry is the overlay)', () => {
    expect(table).toContain("return exports.filter((e) => e.status === 'COMPLETED');");
    expect(table).toContain("completed: exports.filter((e) => e.status === 'COMPLETED').length,");
  });
});

describe('the endpoint answers 410 Gone before content matters (v2.438.0)', () => {
  it('the 410 rides the past expiresAt with the actionable message', () => {
    expect(download).toContain('if (exportRow.expiresAt && exportRow.expiresAt.getTime() < Date.now()) {');
    expect(download).toContain("'This export has expired (files are kept for 7 days). Please generate a new export.'");
    expect(download).toContain('{ status: 410 },');
  });

  it('the 410 gate sits BEFORE the COMPLETED gate (a completed-but-past row reads Gone, never served)', () => {
    const goneAt = download.indexOf('expiresAt.getTime() < Date.now()');
    const completedGateAt = download.indexOf("exportRow.status !== 'COMPLETED'");
    expect(goneAt).toBeGreaterThan(-1);
    expect(completedGateAt).toBeGreaterThan(-1);
    expect(goneAt).toBeLessThan(completedGateAt);
  });
});
