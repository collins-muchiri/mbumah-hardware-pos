-- v2.276.0: the filing ledger — the compliance evidence surface. The
-- calendar (v2.274.0) speaks the CLOCK and v2.275.0 put the clock beside
-- the money, but "whether a window was filed" had no ledger face: the
-- card's own footer law deferred to a ledger that did not exist. This
-- table IS that ledger — one row per (organization, obligation kind,
-- payroll month), written from the Statutory desk when the return or
-- payment goes in. The receipt is an assertion the filer makes, never a
-- guess the system makes: no surface derives a filing from money moved
-- (the journal carries the charge; the ledger carries the receipt — the
-- two never borrow each other's words). Additive + nullable where a
-- fact is optional (reference, note, filer): an old receipt survives a
-- deleted user (SET NULL) the same way the stocktake's startedBy does.
-- The compound unique (organization, kind, periodMonth) is the ledger's
-- own law: one receipt per obligation per month — a re-record AMENDS
-- the row (updatedAt speaks), it never forks a second truth.

CREATE TABLE "statutory_filings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "periodMonth" TEXT NOT NULL,
    "filedAt" TIMESTAMP(3) NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "filedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "statutory_filings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "statutory_filings_organizationId_kind_periodMonth_key" ON "statutory_filings"("organizationId", "kind", "periodMonth");
CREATE INDEX "statutory_filings_organizationId_periodMonth_idx" ON "statutory_filings"("organizationId", "periodMonth");

ALTER TABLE "statutory_filings" ADD CONSTRAINT "statutory_filings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "statutory_filings" ADD CONSTRAINT "statutory_filings_filedByUserId_fkey" FOREIGN KEY ("filedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
