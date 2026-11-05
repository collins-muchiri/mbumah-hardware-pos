-- v2.396.0 THE MPESA STATUSES FIND THEIR FEET: the ledger's STORED
-- reconciliation status.
--
-- bank_transactions.reconciliationStatus carries the M-Pesa lens's own
-- vocabulary (PENDING | MATCHED | UNMATCHED | DISPUTED). Nullable by
-- design: legacy rows keep NULL and answer through the isReconciled
-- derivation (the desk's honest fallback face — isReconciled true reads
-- MATCHED, false reads PENDING), so no backfill is required and no row
-- lies. New writes (the desk's Dispute / Mark matched / Reopen actions)
-- speak the vocabulary directly and keep isReconciled coherent
-- (MATCHED sets it true with reconciledAt; every other status clears it).

ALTER TABLE "bank_transactions" ADD COLUMN "reconciliationStatus" TEXT;
