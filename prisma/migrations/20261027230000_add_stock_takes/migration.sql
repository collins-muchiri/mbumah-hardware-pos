-- v2.219.0: the stocktake (cycle count). The biggest confirmed feature
-- gap (no model, no API, no UI since the worklog first named it): a
-- sheet freezes the branch's system stock at open (snapshotQty per
-- line), the floor counts against the snapshot (countedQty), and the
-- close speaks the variance into the ledger (ADJUSTMENT movements for
-- every line that moved; varianceCost = variance × cost price, the
-- ledger's own KES voice). Statuses are free-text uppercase strings —
-- the PO convention (Prisma enums are unsupported on SQLite and the
-- provider flip is house law). ONE OPEN SHEET PER STORE is enforced in
-- the route (a partial unique index would be the SQL answer; the route
-- is the portable one).

CREATE TABLE "stock_takes" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COUNTING',
    "notes" TEXT,
    "startedById" TEXT,
    "closedById" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_takes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stock_take_lines" (
    "id" TEXT NOT NULL,
    "stockTakeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "snapshotQty" DECIMAL NOT NULL,
    "countedQty" DECIMAL,
    "variance" DECIMAL,
    "varianceCost" DECIMAL,

    CONSTRAINT "stock_take_lines_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "stock_take_lines_stockTakeId_productId_key" ON "stock_take_lines"("stockTakeId", "productId");
CREATE INDEX "stock_takes_storeId_idx" ON "stock_takes"("storeId");
CREATE INDEX "stock_takes_storeId_status_idx" ON "stock_takes"("storeId", "status");
CREATE INDEX "stock_takes_status_idx" ON "stock_takes"("status");
CREATE INDEX "stock_take_lines_stockTakeId_idx" ON "stock_take_lines"("stockTakeId");
CREATE INDEX "stock_take_lines_productId_idx" ON "stock_take_lines"("productId");

ALTER TABLE "stock_takes" ADD CONSTRAINT "stock_takes_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_takes" ADD CONSTRAINT "stock_takes_startedById_fkey" FOREIGN KEY ("startedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "stock_takes" ADD CONSTRAINT "stock_takes_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "stock_take_lines" ADD CONSTRAINT "stock_take_lines_stockTakeId_fkey" FOREIGN KEY ("stockTakeId") REFERENCES "stock_takes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "stock_take_lines" ADD CONSTRAINT "stock_take_lines_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
