-- v2.238.0: the door's census. The org's walk doors (v2.237.0) can now
-- be COUNTED honestly: a sheet born at a door carries origin='walk-door'
-- (the create wire allowlists it — the only value it ever stores), a
-- hand-raised sheet carries no origin at all, and the kpi wire counts
-- the window's door-born sheets. Additive + nullable: every existing
-- sheet reads as hand-raised, which is exactly the truth.

ALTER TABLE "stock_takes" ADD COLUMN "origin" TEXT;
