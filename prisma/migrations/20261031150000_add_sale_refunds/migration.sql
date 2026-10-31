-- v2.308.0 SALE REFUNDS: the refund chain.
--
-- A REFUND SalesTransaction points at the SALE it refunds
-- (sales_transactions.refundedTransactionId), and each refund line points
-- at the ORIGINAL sale line it partially refunds
-- (sale_items.refundedSaleItemId). Together they make "already refunded"
-- an exact per-line aggregate over the refund chain - no greedy productId
-- matching, no ambiguity when one sale holds the same product on two
-- lines, and concurrent refunds against the same sale are serialized by
-- the interactive transaction that writes these rows.
--
-- Both columns are nullable: legacy rows and every normal SALE keep NULL.
-- Attribution FKs use ON DELETE SET NULL (deleting a historical sale must
-- not cascade-delete its refund history's attribution, mirroring
-- notification_logs.user_id).

-- AlterTable
ALTER TABLE "sales_transactions" ADD COLUMN "refundedTransactionId" TEXT;
ALTER TABLE "sale_items" ADD COLUMN "refundedSaleItemId" TEXT;

-- CreateIndex
CREATE INDEX "sales_transactions_refundedTransactionId_idx" ON "sales_transactions"("refundedTransactionId");
CREATE INDEX "sale_items_refundedSaleItemId_idx" ON "sale_items"("refundedSaleItemId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sales_transactions_refundedTransactionId_fkey') THEN
        ALTER TABLE "sales_transactions" ADD CONSTRAINT "sales_transactions_refundedTransactionId_fkey"
            FOREIGN KEY ("refundedTransactionId") REFERENCES "sales_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sale_items_refundedSaleItemId_fkey') THEN
        ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_refundedSaleItemId_fkey"
            FOREIGN KEY ("refundedSaleItemId") REFERENCES "sale_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
