'use client';

/**
 * v2.311.0 — the paper-trail viewer.
 *
 * The loyalty desk's clawback rows have carried the REFUND receipt number
 * since v2.310.0 (the desk's rose chip, the card's "refund receipt {n}"
 * sub-line) — but the number was DEAD TEXT: you read it, then went
 * hunting for the receipt by hand across tabs. This dialog closes that
 * walk: given a receipt number it fetches the transaction BEHIND the
 * number (transactionsApi.getByReceipt → the exact receiptNumber filter
 * added to GET /api/transactions this release) and renders the SAME
 * branded ReceiptDocument the transactions desk prints, with Print and
 * PDF riding the shared receipt utilities.
 *
 * Three faces, all honest:
 *  - loading: skeletons + an aria-live line (screen readers hear the wait)
 *  - not-found: a muted empty state that echoes the number — the paper
 *    trail may predate refunds or belong to another branch; NEVER a wrong
 *    receipt (exact match, store-scoped server-side)
 *  - found: the branded receipt + Print / Download PDF
 *
 * Mounted per surface (loyalty desk ledger, customer card) but only ever
 * ONE open at a time — the print/PDF DOM id is shared app-wide.
 */

import { useEffect, useState } from 'react';
import { FileDown, Loader2, Printer, ReceiptText, SearchX } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ReceiptDocument } from '@/components/receipt-print';
import {
  RECEIPT_CONTENT_ID,
  buildReceiptFileName,
  generateReceiptPdf,
  printReceiptElement,
} from '@/lib/receipt-pdf';
import { transactionsApi } from '@/lib/api';
import type { TransactionItem } from '@/lib/api';
import { useAppStore } from '@/lib/stores';

export interface ReceiptViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The REFUND receipt number a clawback row carries (its `reference`). */
  receiptNumber: string | null;
  /**
   * Why the paper is being pulled — the dialog's description speaks it so
   * the operator knows which thread they are holding ("opened from a
   * loyalty clawback row" vs the card's member history).
   */
  context?: 'clawback-desk' | 'clawback-card';
}

type LoadState =
  | { phase: 'loading' }
  | { phase: 'not-found' }
  | { phase: 'error' }
  | { phase: 'found'; transaction: TransactionItem };

/** A settled answer remembers WHICH receipt it answers — a re-keyed dialog
 * (closed, reopened on another row) must never show the old receipt. */
type ReceiptAnswer = (LoadState & { phase: 'not-found' | 'error' | 'found' }) & {
  forReceipt: string;
};

export function ReceiptViewDialog({
  open,
  onOpenChange,
  receiptNumber,
  context = 'clawback-desk',
}: ReceiptViewDialogProps) {
  const currentStoreId = useAppStore((s) => s.currentStoreId);
  const [answer, setAnswer] = useState<ReceiptAnswer | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  // Fetch on open (and on every re-open — the receipt may have been
  // issued after a previous not-found). The settled answer remembers the
  // receipt it answers; while the answer is for ANOTHER receipt (or
  // absent), the view DERIVES to loading during render — no synchronous
  // setState in the effect, so a slow fetch can never flash a stale
  // receipt behind a new number.
  useEffect(() => {
    if (!open || !receiptNumber) return;
    let cancelled = false;
    (async () => {
      try {
        const tx = await transactionsApi.getByReceipt(receiptNumber, currentStoreId);
        if (cancelled) return;
        setAnswer({
          forReceipt: receiptNumber,
          ...(tx ? { phase: 'found', transaction: tx } : { phase: 'not-found' }),
        });
      } catch (err) {
        console.error('[RECEIPT_VIEW_FETCH_ERROR]', err);
        if (cancelled) return;
        setAnswer({ forReceipt: receiptNumber, phase: 'error' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, receiptNumber, currentStoreId]);

  const settled: LoadState =
    answer && answer.forReceipt === receiptNumber
      ? answer
      : { phase: 'loading' };

  const handlePrint = () => {
    try {
      printReceiptElement(RECEIPT_CONTENT_ID);
    } catch (error) {
      console.error('[RECEIPT_PRINT_ERROR]', error);
      toast.error('Failed to open the print dialog. Please try again.');
    }
  };

  const handleDownloadPdf = async () => {
    if (settled.phase !== 'found') return;
    setPdfBusy(true);
    try {
      await generateReceiptPdf({
        elementId: RECEIPT_CONTENT_ID,
        fileName: buildReceiptFileName(settled.transaction.receiptNumber, settled.transaction.id),
      });
      toast.success('Receipt PDF downloaded.');
    } catch (error) {
      console.error('[RECEIPT_DOWNLOAD_ERROR]', error);
      toast.error('Failed to download receipt. Please try again or use Print to PDF.');
    } finally {
      setPdfBusy(false);
    }
  };

  const contextLine =
    context === 'clawback-card'
      ? 'Opened from this member\u2019s loyalty history \u2014 the refund that clawed the points back.'
      : 'Opened from the loyalty ledger \u2014 the refund receipt that clawed the points back.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-emerald-700 dark:text-emerald-400" aria-hidden />
            Refund receipt
          </DialogTitle>
          <DialogDescription>
            {receiptNumber ? (
              <>
                {contextLine} Receipt{' '}
                <span className="font-mono text-xs text-foreground">{receiptNumber}</span>
              </>
            ) : (
              contextLine
            )}
          </DialogDescription>
        </DialogHeader>

        {settled.phase === 'loading' && (
          <div className="space-y-3 py-2" aria-live="polite" aria-busy="true">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              {receiptNumber
                ? `Looking up receipt ${receiptNumber}\u2026`
                : 'Looking up the receipt\u2026'}
            </p>
            <div className="space-y-2 rounded-lg border p-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        )}

        {settled.phase === 'not-found' && (
          <div
            className="rounded-lg border border-dashed p-6 text-center"
            role="status"
            data-testid="receipt-view-not-found"
          >
            <SearchX className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" aria-hidden />
            <p className="text-sm font-medium text-foreground">
              No receipt{' '}
              <span className="font-mono text-xs">{receiptNumber}</span> on this store
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              The receipt may predate refunds, live on another branch, or the paper
              trail may point at a receipt number that was never issued. The clawback
              row itself is unaffected.
            </p>
          </div>
        )}

        {settled.phase === 'error' && (
          <div
            className="rounded-lg border border-amber-300/60 bg-amber-50/50 p-6 text-center dark:border-amber-800 dark:bg-amber-950/30"
            role="alert"
            data-testid="receipt-view-error"
          >
            <SearchX className="h-10 w-10 mx-auto text-amber-600/60 mb-3" aria-hidden />
            <p className="text-sm font-medium text-foreground">The lookup failed</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              The receipt search could not complete. Close and reopen the viewer to
              retry.
            </p>
          </div>
        )}

        {settled.phase === 'found' && (
          <div className="space-y-3" data-testid="receipt-view-found">
            {/* Branded, colored, QR-coded receipt — the SAME component the
                checkout modal and the transactions desk print; id=
                RECEIPT_CONTENT_ID drives print/PDF export. */}
            <ReceiptDocument transaction={settled.transaction} storeId={currentStoreId} />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:ring-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                onClick={handlePrint}
              >
                <Printer className="mr-1.5 h-4 w-4" aria-hidden /> Print
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleDownloadPdf}
                disabled={pdfBusy}
              >
                {pdfBusy ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <FileDown className="mr-1.5 h-4 w-4" aria-hidden />
                )}
                {pdfBusy ? 'Preparing\u2026' : 'Download PDF'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
