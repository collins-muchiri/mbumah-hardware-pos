-- v2.420.0 THE ARC'S FIRST WORD: the product remembers its supplier.
--
-- products.supplierId carries the product's own supplier link (nullable
-- by design: a product born before the arc — or a hand-raised row —
-- keeps the honest absence, the grouping lens answers "No supplier yet"
-- instead of a guessed name, and no backfill is required and no row
-- lies). Same-store correctness is enforced at the WIRE (POST/PATCH
-- validate supplier.storeId === product.storeId); the schema's FK is
-- cross-store by shape alone. The index carries the desk's new lens
-- (group/filter by supplier without a table scan).

-- AlterTable
ALTER TABLE "products" ADD COLUMN "supplierId" TEXT;

-- CreateIndex
CREATE INDEX "products_supplierId_idx" ON "products"("supplierId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_supplierId_fkey') THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey"
            FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
