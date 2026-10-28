-- v2.242.0: the aisle's answer. The door's census (v2.238.0) counts HOW
-- many sheets were born at a walk door; this round the census learns
-- WHERE those doors opened: a door-born sheet whose birth named one
-- aisle carries walkCategoryId (the walk order's address, resolved
-- server-side against this store). Additive + nullable: every existing
-- sheet reads as aisle-less, which is exactly the truth. The column is
-- SetNull on the aisle's deletion (an optional relation) — a deleted
-- aisle never strands a sheet, and the census never speaks ghosts.
-- No index: the census read is window-bounded over a small sheet table
-- (the same shape the origin column rides — parity, not cargo).

ALTER TABLE "stock_takes" ADD COLUMN "walkCategoryId" TEXT;

-- Foreign key to product_categories with ON DELETE SET NULL (the
-- optional relation's referential action — the census's ghost law).
ALTER TABLE "stock_takes" ADD CONSTRAINT "stock_takes_walkCategoryId_fkey"
FOREIGN KEY ("walkCategoryId") REFERENCES "product_categories"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
