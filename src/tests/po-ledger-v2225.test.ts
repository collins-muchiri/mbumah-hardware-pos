// v2.225.0 — the pipeline from above.
//
//   - THE PROCUREMENT LEDGER: the org console reads the whole PO
//     pipeline — every branch's purchase orders, newest first, with
//     the FULL status ladder as filter chips carrying REAL counts
//     (a groupBy over the same org-wide where), a branch picker that
//     narrows by refetch, a client-side finder with the honest N-of-M,
//     and the window DISCLOSED when the pipe runs deeper than the
//     take. READ-ONLY BY LAW — the branch workspace keeps the only
//     pens; the read runs inside runWithoutTenant on the RAW client
//     (the v2.57.0 leak class must never shrink an org read).
//   - THE PO DRILL: a roster row opens ONE document's lines org-side —
//     ordered vs received units per line with a received-progress
//     hairline, the raised→approved→received/cancelled timeline with
//     names, and every status drills (a DRAFT shows its ink, a
//     RECEIVED its fulfillment, a CANCELLED its grave).
//   - THE ORDER'S COPY: the sheet drill's v2.224.0 CSV law grown to
//     the pipeline — seven columns, the cost gate riding IN THE FILE
//     (absence stays absence), the BOM, CRLF, the boring quoting law
//     REUSED verbatim from the sheet drill's pure csvCell (never
//     re-invented), the file name carrying the document.
//   - THE COST LAW: shillings (totalAmount, unitCost, totalCost)
//     arrive null past inventory.view.cost — the faces render the
//     honest absence, never a hidden zero; units are units for every
//     org role.
//   - THE PROVENANCE ROLLUP: a supplier group is a DERIVED bucket —
//     when its rows cite 2+ distinct hint documents the divider wears
//     the mono chip "N POs spoke here" whose title names them.
//   - THE STYLING DETAILS: the chip ladder reads cold-to-warm-to-green
//     as the order travels (house families, 3:1, dark halves from
//     birth); PO numbers wear the mono + tabular-nums face; the
//     ledger's focus rings carry the sky hue (distinct from the
//     stocktake's amber and the hand's violet).
//
// Every pin reads the SOURCE OF RECORD (source bytes, not memory).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const listRoute = read('src/app/api/org/purchase-orders/route.ts');
const detailRoute = read('src/app/api/org/purchase-orders/[id]/route.ts');
const ledger = read('src/components/org/po-ledger.tsx');
const drill = read('src/components/org/po-drill.tsx');
const dialog = read('src/components/org/restock-dialog.tsx');
const consolePage = read('src/app/(shell)/console/page.tsx');
const sheetDrill = read('src/components/org/sheet-drill.tsx');
const pkg = JSON.parse(read('package.json'));
const changelog = read('CHANGELOG.md');
const feed = read('src/lib/whats-new.ts');
const version = String(pkg.version);

// ── THE RELEASE FACE ─────────────────────────────────────────────────────

describe('the round of record (v2.225.0)', () => {
  it('package.json leads 2.225.0 (all three slots)', () => {
    expect(version).toBe('2.258.0');
    expect(pkg.mbumah.releaseVersion).toBe('2.258.0');
    expect(pkg.mbumah.baseVersion).toBe('2.258.0');
  });

  it('the changelog anchors the section ABOVE its ancestor (the structural pin — headers, never bare strings)', () => {
    expect(changelog.indexOf('## [2.225.0]')).toBeGreaterThanOrEqual(0);
    expect(changelog.indexOf('## [2.225.0]')).toBeLessThan(changelog.indexOf('## [2.224.0]'));
  });

  it('whats-new speaks the pipeline at the head', () => {
    expect(feed.includes("version: '2.225.0',")).toBe(true);
    expect(feed.indexOf("version: '2.225.0',")).toBeLessThan(feed.indexOf("version: '2.224.0',"));
    expect(feed.includes("title: 'The pipeline from above',")).toBe(true);
  });

  it('the verify gate is wired into package.json', () => {
    expect(pkg.scripts['verify:v2-225-0']).toBe('node scripts/verify-v2-225-0.mjs');
  });
});

// ── THE ORG PO WIRE (THE ROSTER) ─────────────────────────────────────────

describe('the org purchase-orders wire', () => {
  it('is ORG_ROLES only (the kpi-summary contract)', () => {
    expect(listRoute).toContain("const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];");
    expect(listRoute).toContain('requireAuth(orgPurchaseOrdersHandler, { roles: ORG_ROLES })');
  });

  it('runs WITHOUT tenant on the RAW client (an org read is org-wide by definition)', () => {
    expect(listRoute).toContain('runWithoutTenant(async () => {');
    expect(listRoute).toContain('rawDb.purchaseOrder.findMany(');
  });

  it('answers the FULL ladder (eight rungs, every one — even at zero)', () => {
    for (const status of ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED']) {
      expect(listRoute).toContain(`'${status}',`);
    }
    expect(listRoute).toContain('PO_STATUSES.map((s) => ({ status: s, count: countByStatus.get(s) ?? 0 }))');
  });

  it('REFUSES an out-of-ladder status filter (400) — an unknown status never silently means all', () => {
    expect(listRoute).toContain("return Response.json({ success: false, error: 'unknown purchase-order status.' }, { status: 400 });");
    expect(listRoute).toContain('if (statusParam !== \'\' && !status) {');
  });

  it('carries the counts from a groupBy over the SAME where (real numbers, never a fabricated ladder)', () => {
    expect(listRoute).toContain("rawDb.purchaseOrder.groupBy({ by: ['status'], where, _count: { _all: true } })");
  });

  it('clamps and discloses the take (1..100, default 30)', () => {
    expect(listRoute).toContain('Math.min(100, Math.max(1, Math.trunc(takeParam)))');
  });

  it('orders newest first (orderDate, then createdAt)', () => {
    expect(listRoute).toContain("orderBy: [{ orderDate: 'desc' }, { createdAt: 'desc' }],");
  });

  it('rides the cost law — totalAmount speaks only past the gate', () => {
    expect(listRoute).toContain("hasFeaturePermission(session.role, 'inventory.view.cost')");
    expect(listRoute).toContain('canViewCost ? Number(po.totalAmount) : null');
  });
});

// ── THE ORG PO WIRE (THE DRILL) ──────────────────────────────────────────

describe('the org purchase-order detail wire', () => {
  it('is ORG_ROLES only and reads WITHOUT tenant', () => {
    expect(detailRoute).toContain("const ORG_ROLES = ['SUPER_ADMIN', 'STORE_OWNER', 'BRANCH_MANAGER'];");
    expect(detailRoute).toContain('runWithoutTenant(() =>');
    expect(detailRoute).toContain('rawDb.purchaseOrder.findUnique(');
  });

  it('answers 404 on a missing document', () => {
    expect(detailRoute).toContain("error: 'purchase order not found.'");
  });

  it('gates ALL the shillings (totalAmount, unitCost, totalCost) — null past the gate', () => {
    expect(detailRoute).toContain('canViewCost ? Number(po.totalAmount) : null');
    expect(detailRoute).toContain('canViewCost ? Number(l.unitCost) : null');
    expect(detailRoute).toContain('canViewCost ? Number(l.totalCost) : null');
  });

  it('carries the timeline with names (raised, approved, received, cancelled)', () => {
    for (const field of ['createdByName', 'approvedByName', 'receivedByName', 'cancelledByName']) {
      expect(detailRoute).toContain(field);
    }
  });

  it('speaks units as units, rounded honest (ordered + received)', () => {
    expect(detailRoute).toContain('Math.round(orderedUnits * 100) / 100');
    expect(detailRoute).toContain('Math.round(receivedUnits * 100) / 100');
  });
});

// ── THE PROCUREMENT LEDGER (THE FACE) ────────────────────────────────────

describe('the procurement ledger', () => {
  it('is mounted beside the variance map (after it, on the console shelf)', () => {
    expect(consolePage).toContain('<ProcurementLedger stores={stores} />');
    expect(consolePage.indexOf('<ProcurementLedger stores={stores} />'))
      .toBeGreaterThan(consolePage.indexOf('<VarianceMap data={kpi} stores={stores} />'));
  });

  it('carries the filters in the query key (a filter change IS a refetch; the birth rung rode the key at v2.249.0)', () => {
    expect(ledger).toContain("queryKey: ['org-po-ledger', statusFilter, branchId, originFilter],");
  });

  it('renders the status rungs with aria-pressed and REAL counts', () => {
    expect(ledger).toContain('aria-pressed={statusFilter === \'ALL\'}');
    expect(ledger).toContain('aria-pressed={statusFilter === c.status}');
    expect(ledger).toContain('{num(c.count)}');
  });

  it('narrows by branch via a named picker', () => {
    expect(ledger).toContain('data-testid="po-ledger-branch-select"');
    expect(ledger).toContain('aria-label="Filter purchase orders by branch"');
  });

  it('grows the finder (client-side needle, honest N of M, a clear way back)', () => {
    expect(ledger).toContain('data-testid="po-ledger-finder"');
    expect(ledger).toContain('data-testid="po-ledger-finder-clear"');
    expect(ledger).toContain('{num(shownRows.length)} of {num(data.rows.length)}');
    expect(ledger).toContain('r.poNumber.toLowerCase().includes(cleanNeedle)');
    expect(ledger).toContain('r.supplierName.toLowerCase().includes(cleanNeedle)');
    expect(ledger).toContain('r.store.name.toLowerCase().includes(cleanNeedle)');
  });

  it('answers honest empties (the filter\u2019s nothing and the pipe\u2019s nothing are different truths)', () => {
    expect(ledger).toContain('no purchase order answers this filter');
    expect(ledger).toContain('the filter narrowed the pipe to nothing');
  });

  it('discloses the window when the pipe runs deeper than the take', () => {
    expect(ledger).toContain('data-testid="po-ledger-cap-note"');
    expect(ledger).toContain('showing the latest {num(data.take)}');
  });

  it('speaks the cost gate\u2019s absence and the read-only law', () => {
    expect(ledger).toContain('data-testid="po-ledger-cost-note"');
    expect(ledger).toContain('the shillings stay behind the cost gate');
    expect(ledger).toContain('read-only — the branch workspace keeps the pens');
  });

  it('keys the drill per document (a fresh door is an empty needle by construction; v2.256.0: the mount grew the birth\u2019s door \u2014 onOpenSheet closes this drill as the sheet opens)', () => {
    expect(ledger).toContain('<PoDrill');
    expect(ledger).toContain('key={drill.id}');
    expect(ledger).toContain('target={drill}');
    expect(ledger).toContain('onClose={() => setDrill(null)}');
    expect(ledger).toContain('onOpenSheet={(t) => {');
  });
});

// ── THE PO DRILL (THE DOOR) ──────────────────────────────────────────────

describe('the PO drill', () => {
  it('wears the full ladder chip (cold-to-warm-to-green, eight rungs)', () => {
    for (const frag of [
      "if (s === 'DRAFT') return 'bg-slate-100",
      "if (s === 'PENDING_APPROVAL') return 'bg-amber-50",
      "if (s === 'APPROVED') return 'bg-sky-50",
      "if (s === 'SENT') return 'bg-indigo-50",
      "if (s === 'CONFIRMED') return 'bg-cyan-50",
      "if (s === 'PARTIALLY_RECEIVED') return 'bg-amber-50",
      "if (s === 'RECEIVED') return 'bg-emerald-50",
    ]) {
      expect(drill).toContain(frag);
    }
  });

  it('renders the timeline with the receipts the wire carried', () => {
    expect(drill).toContain('data-testid="po-drill-timeline"');
    expect(drill).toContain('no approval on the record');
  });

  it('rides per-line received progress (emerald when landed, sky on the road)', () => {
    expect(drill).toContain("done ? 'bg-emerald-500' : 'bg-sky-500'");
    expect(drill).toContain(`aria-label={\`\${l.name}: received \${l.receivedQty} of \${l.qty} ordered\`}`);
  });

  it('grows the finder (the sheet drill\u2019s law: the reading narrows, the fetch never does)', () => {
    expect(drill).toContain('data-testid="po-drill-finder"');
    expect(drill).toContain('data-testid="po-drill-finder-clear"');
    expect(drill).toContain('{num(shownLines.length)} of {num(data.lines.length)}');
    expect(drill).toContain('no line answers “{needle.trim()}”');
  });

  it('hides the export on a line-less order (an absent control never lies)', () => {
    expect(drill).toContain('{data && data.lines.length > 0 && (');
    expect(drill).toContain('aria-label={`Download all ${data.lines.length} lines as CSV`}');
  });
});

// ── THE ORDER'S COPY (THE FILE) ──────────────────────────────────────────

describe('the order\u2019s copy', () => {
  it('is a pure, exported builder (the pins read it)', () => {
    expect(drill).toContain("export function poLinesCsv(lines: PoDrillWire['data']['lines'], opts: { costGated: boolean }): string {");
  });

  it('speaks the seven columns', () => {
    expect(drill).toContain("'product,sku,unit,ordered,received,unit_cost_kes,line_total_kes'");
  });

  it('rides the cost gate IN THE FILE (both cost cells export EMPTY past the gate)', () => {
    expect(drill).toContain("!opts.costGated && l.unitCost != null ? l.unitCost : ''");
    expect(drill).toContain("!opts.costGated && l.totalCost != null ? l.totalCost : ''");
  });

  it('reuses the boring quoting law verbatim (csvCell from the sheet drill — never re-invented)', () => {
    expect(drill).toContain("import { csvCell } from './sheet-drill';");
    expect(sheetDrill).toContain('export function csvCell(v: string | number | null | undefined): string {');
  });

  it('ships the BOM and CRLF joins', () => {
    expect(drill).toContain('`\\ufeff${[header, ...rows].join(\'\\r\\n\')}`');
  });

  it('stamps the document in the file name', () => {
    expect(drill).toContain('`po-${data.poNumber}-${data.status.toLowerCase()}.csv`');
  });
});

// ── THE PROVENANCE ROLLUP (THE RIDER) ────────────────────────────────────

describe('the provenance rollup', () => {
  it('counts DISTINCT hint documents in the group memo (pure, no effect)', () => {
    expect(dialog).toContain('const hintPos = Array.from(new Set(rows.map((r) => r.lastSupplierPoNumber).filter((p): p is string => Boolean(p))));');
  });

  it('wears the chip only past ONE document (the honest form of a derived bucket)', () => {
    expect(dialog).toContain('{group.hintPos.length > 1 && (');
    expect(dialog).toContain('{group.hintPos.length} POs spoke here');
  });

  it('names the documents in the chip\u2019s title', () => {
    expect(dialog).toContain("the ledger's hints named ${group.hintPos.length}: ${group.hintPos.join(', ')}.");
  });

  it('is mono — document numbers, not words (the hint chip\u2019s voice, grown to the group)', () => {
    expect(dialog).toContain('data-testid={`restock-group-provenance-${group.supplierId}`}');
    expect(dialog).toContain('font-mono');
  });
});
