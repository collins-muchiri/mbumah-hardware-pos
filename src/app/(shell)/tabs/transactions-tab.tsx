'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ShoppingBag, Search, Download, ChevronDown, ChevronUp,
  CalendarDays, TrendingUp, Hash, CreditCard, Smartphone, Banknote, Wallet, Link2,
  Filter, FileText, RotateCcw, Ban, Eye, Printer, AlertTriangle, Receipt, X, MessageCircle,
  Mail, Send, Loader2, MessageSquare, PackageOpen, ShieldAlert, CheckCircle2, Sparkles,
} from 'lucide-react';

import { transactionsApi, whatsappApi, formatKES, formatDateTime, type ApiResponse, type TransactionItem, type SaleItemDetail, type ReceiptDistributionResult, type RefundableLine, type RefundableLinesResult, type RefundResult, type RefundRowState } from '@/lib/api';
import { composeDailyRevenueVoice } from '@/lib/report-voices';
import { buildSearchWithoutParams, parseInitialNamedMember } from '@/lib/tab-url';
import { useAppStore, useAuthStore } from '@/lib/stores';
import { hasFeaturePermission } from '@/lib/permissions';
import { getStoreInfo, getLogoUrl, COMPANY } from '@/lib/store-info';
import { printReceiptElement, generateReceiptPdf, buildReceiptFileName, RECEIPT_CONTENT_ID } from '@/lib/receipt-pdf';
import { ReceiptDocument } from '@/components/receipt-print';
import { handleError } from '@/lib/error-handler';
import { formatQty, formatQtyWithUnit, unitLabel } from '@/lib/utils/financialMath';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISOString(d: Date): string {
  return d.toISOString();
}

type DatePreset = 'today' | 'week' | 'month' | 'custom';

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
];

function getDateRange(preset: DatePreset): { from: Date; to: Date } {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'week':
      return { from: startOfWeek(now), to: endOfDay(now) };
    case 'month':
      return { from: startOfMonth(now), to: endOfDay(now) };
    default:
      return { from: startOfDay(now), to: endOfDay(now) };
  }
}

type TransactionType = 'sale' | 'refund' | 'void';

// Framer-motion stagger variants - wrap the transactions tab wrapper.
const _staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

const _staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

// Reused gradient palette for customer-initials avatars (kept in sync with
// customers-tab.tsx so a customer shown here matches their colour on the
// Customers tab).
const AVATAR_GRADIENTS = [
  'from-rose-500 to-pink-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-teal-600',
  'from-emerald-500 to-green-600',
  'from-amber-500 to-orange-600',
  'from-red-500 to-rose-600',
  'from-teal-500 to-cyan-600',
  'from-orange-500 to-amber-600',
  'from-fuchsia-500 to-pink-600',
  'from-lime-500 to-green-600',
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getTransactionType(transaction: TransactionItem): TransactionType {
  // v2.371.0 THE ROW'S OWN KIND COMES FIRST: a REFUND transaction row
  // carries paymentStatus COMPLETED — the status-derived type called it
  // a 'sale' and the money-out rows masqueraded in the sales lens (the
  // refund lens only ever showed the refunded ORIGINALS, never the
  // refund events themselves). The row's own transactionType outranks
  // the derived status; the status checks stay as the ORIGINALS' voice
  // (a sale whose paymentStatus became REFUNDED or VOIDED still speaks
  // its state — the two sides of the refund story share the lens).
  if (transaction.transactionType === 'REFUND') return 'refund';
  if (transaction.transactionType === 'VOID') return 'void';
  if (transaction.paymentStatus === 'REFUNDED') return 'refund';
  if (transaction.paymentStatus === 'VOIDED' || transaction.paymentStatus === 'CANCELLED') return 'void';
  return 'sale';
}

function getTransactionTypeIcon(type: TransactionType) {
  switch (type) {
    case 'sale': return <ShoppingBag className="h-3.5 w-3.5" />;
    case 'refund': return <RotateCcw className="h-3.5 w-3.5" />;
    case 'void': return <Ban className="h-3.5 w-3.5" />;
  }
}

function getTransactionTypeColor(type: TransactionType): string {
  switch (type) {
    case 'sale': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
    case 'refund': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    case 'void': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
  }
}

function getTransactionTypeLabel(type: TransactionType): string {
  switch (type) {
    case 'sale': return 'Sale';
    case 'refund': return 'Refund';
    case 'void': return 'Void';
  }
}

// v2.353.0 — THE LEDGER SPEAKS ITS CENSUS: each type chip carries its
// lens's live tally and the active lens wears a count voice (the transfers
// desk's treatment, propagated to the busiest ledger). The tally rides the
// SAME array the desk renders via a PLAIN count function — the memo-lint
// law: a useMemo here would birth a fifth exhaustive-deps warning on the
// desk's pre-existing conditional-array debt, so the honest kill is the
// plain call, and the desk's own derivation helper is the runtime truth
// (REFUNDED/VOIDED/CANCELLED speak their kinds, everything else is a sale).
function countTransactionTypes(rows: TransactionItem[]): Record<'all' | TransactionType, number> {
  const census: Record<'all' | TransactionType, number> = { all: rows.length, sale: 0, refund: 0, void: 0 };
  for (const row of rows) census[getTransactionType(row)] += 1;
  return census;
}

function getPaymentMethodColor(method: string): string {
  switch (method) {
    case 'CASH': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
    case 'MPESA': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    case 'DEBT': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    default: return 'bg-muted text-muted-foreground';
  }
}

function getPaymentMethodIcon(method: string) {
  switch (method) {
    case 'CASH': return <Banknote className="h-3 w-3" />;
    case 'MPESA': return <Smartphone className="h-3 w-3" />;
    case 'DEBT': return <CreditCard className="h-3 w-3" />;
    default: return <Wallet className="h-3 w-3" />;
  }
}

function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'COMPLETED': return 'Completed';
    case 'PENDING': return 'Pending';
    case 'FAILED': return 'Failed';
    case 'REFUNDED': return 'Refunded';
    case 'PARTIAL': return 'Partial';
    case 'VOIDED': return 'Voided';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
}

function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
    case 'PENDING': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    case 'FAILED': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
    case 'REFUNDED': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
    case 'VOIDED': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
    default: return 'bg-muted text-muted-foreground';
  }
}

function exportTransactionsCSV(transactions: TransactionItem[]): void {
  if (transactions.length === 0) return;

  const headers = ['Receipt #', 'Date', 'Customer', 'Type', 'Items', 'Subtotal', 'Tax', 'Discount', 'Total', 'Payment Method', 'Status'];
  const rows = transactions.map((t) => [
    t.receiptNumber,
    formatDateTime(t.createdAt),
    t.customer?.name || 'Walk-in',
    getTransactionTypeLabel(getTransactionType(t)),
    String(t.items?.length || 0),
    String(t.subtotal),
    String(t.taxAmount),
    String(t.discountAmount),
    String(t.totalAmount),
    t.paymentMethod,
    t.paymentStatus,
  ]);

  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// MINI TREND CHART (SVG-based)

function MiniTrendChart({ data, height = 40, ariaLabel }: { data: { label: string; value: number }[]; height?: number; ariaLabel?: string }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 160;
  // A single day is a dot on the grounding line (the old (i/(len-1)) math
  // divided by zero at length 1); a line needs two points.
  const denom = Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => ({
    x: (i / denom) * w,
    y: height - (d.value / max) * (height - 6) - 3,
  }));
  const last = pts[pts.length - 1];

  return (
    <svg
      width={w} height={height} className="w-full"
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <defs>
        <linearGradient id="trendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* grounding baseline (non-essential, muted) */}
      <line x1="0" y1={height - 0.5} x2={w} y2={height - 0.5} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" className="text-muted-foreground/40" />
      {/* Area fill */}
      <path
        d={pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ` L${w},${height} L0,${height} Z`}
        fill="url(#trendGrad)"
        className="text-primary"
      />
      {/* Line */}
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
        className="text-primary"
      />
      {/* the latest day, marked */}
      <circle cx={last.x} cy={last.y} r="2.5" fill="currentColor" className="text-primary" />
    </svg>
  );
}

function ReceiptModal({
  open,
  onOpenChange,
  transaction,
  onDistribute,
  distributing,
  autoPrint = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionItem | null;
  onDistribute: (channel: 'EMAIL' | 'WHATSAPP' | 'SMS', recipient: string) => void;
  distributing: 'EMAIL' | 'WHATSAPP' | 'SMS' | null;
  /** v2.310.0: when armed, the print dialog opens by itself once, after the
   * branded ReceiptDocument has mounted — the refund success desk's direct
   * print rides this in (money moved → paper follows, one tap less). */
  autoPrint?: boolean;
}) {
  const currentStoreId = useAppStore((s) => s.currentStoreId);

  // Recipient input state (email or phone) - prefilled from the customer record
  // when the user picks a channel. State is reset via `onOpenChange` when the
  // modal closes (see the wrapped handler below).
  const [distChannel, setDistChannel] = useState<'EMAIL' | 'WHATSAPP' | 'SMS' | null>(null);
  const [recipient, setRecipient] = useState('');
  const [pdfBusy, setPdfBusy] = useState(false);
  // v2.310.0: the auto-print tripwire — fires ONCE per open, after the
  // ReceiptDocument (id=RECEIPT_CONTENT_ID) is on screen; re-arms on close.
  const autoPrintFiredRef = React.useRef(false);

  React.useEffect(() => {
    if (!open) {
      autoPrintFiredRef.current = false;
      return;
    }
    if (!autoPrint || !transaction || autoPrintFiredRef.current) return;
    autoPrintFiredRef.current = true;
    const timer = window.setTimeout(() => {
      try {
        printReceiptElement(RECEIPT_CONTENT_ID);
      } catch (error) {
        console.error('[RECEIPT_PRINT_ERROR]', error);
        toast.error('Failed to open the print dialog. Please try again.');
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [open, autoPrint, transaction]);

  // Reset distribution state when the modal closes.
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setDistChannel(null);
      setRecipient('');
    }
    onOpenChange(open);
  };

  if (!transaction) return null;

  const handleStartEmail = () => {
    setDistChannel('EMAIL');
    setRecipient(transaction.customer?.email || '');
  };

  const handleStartWhatsApp = () => {
    setDistChannel('WHATSAPP');
    setRecipient(transaction.customer?.phone || '');
  };

  const handleStartSms = () => {
    setDistChannel('SMS');
    setRecipient(transaction.customer?.phone || '');
  };

  const distChannelLabel = distChannel === 'EMAIL' ? 'Email' : distChannel === 'SMS' ? 'SMS' : 'WhatsApp';

  const handleConfirmDistribute = () => {
    if (!recipient.trim()) {
      toast.error(distChannel === 'EMAIL' ? 'Email address is required.' : 'Phone number is required.');
      return;
    }
    onDistribute(distChannel!, recipient.trim());
  };

  // Print + PDF go through the shared receipt utilities: print uses the
  // #print-root isolation (the old popup-window writer printed an unbranded,
  // unstyled clone), PDF export captures the branded ReceiptDocument via
  // html2canvas-pro → jsPDF with full error containment.
  const handlePrint = () => {
    try {
      printReceiptElement(RECEIPT_CONTENT_ID);
    } catch (error) {
      console.error('[RECEIPT_PRINT_ERROR]', error);
      toast.error('Failed to open the print dialog. Please try again.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!transaction) return;
    setPdfBusy(true);
    try {
      await generateReceiptPdf({
        elementId: RECEIPT_CONTENT_ID,
        fileName: buildReceiptFileName(transaction.receiptNumber, transaction.id),
      });
      toast.success('Receipt PDF downloaded.');
    } catch (error) {
      console.error('[RECEIPT_DOWNLOAD_ERROR]', error);
      toast.error('Failed to download receipt. Please try again or use Print to PDF.');
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" /> View Receipt
          </DialogTitle>
          <DialogDescription>Receipt #{transaction.receiptNumber}</DialogDescription>
        </DialogHeader>
        {/* Branded, colored, QR-coded receipt - same component as the
            checkout modal; id=RECEIPT_CONTENT_ID drives print/PDF export. */}
        <ReceiptDocument transaction={transaction} storeId={currentStoreId} />

        {/* Distribution controls (Phase 4 - Email via Resend + WhatsApp via Twilio) */}
        {distChannel ? (
          <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-medium flex items-center gap-1.5">
              {distChannel === 'EMAIL' ? <Mail className="h-3.5 w-3.5" /> : distChannel === 'SMS' ? <MessageSquare className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
              Send receipt via {distChannelLabel}
            </p>
            <Input
              type={distChannel === 'EMAIL' ? 'email' : 'tel'}
              placeholder={distChannel === 'EMAIL' ? 'customer@example.com' : '+254712345678'}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="h-8 text-xs"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" className="h-7 text-xs flex-1" onClick={handleConfirmDistribute} disabled={distributing !== null}>
                {distributing === distChannel ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                Send {distChannelLabel}
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDistChannel(null)} disabled={distributing !== null}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="receipt-actions">
            {/* v2.14.0: plain div so the .receipt-actions grid (not the
                DialogFooter flex) controls the action-bar layout. */}
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={pdfBusy} aria-label="Download receipt as PDF">
              {pdfBusy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
              {pdfBusy ? 'Preparing…' : 'Download PDF'}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} aria-label="Print receipt">
              <Printer className="h-4 w-4 mr-1.5" /> Print
            </Button>
            <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30" onClick={handleStartEmail} disabled={distributing !== null}>
              <Mail className="h-4 w-4 mr-1.5" /> Email
            </Button>
            <Button variant="outline" size="sm" className="text-green-700 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-950/30" onClick={handleStartWhatsApp} disabled={distributing !== null}>
              <MessageCircle className="h-4 w-4 mr-1.5" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="text-emerald-700 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={handleStartSms} disabled={distributing !== null} title="Send receipt via SMS" aria-label="Send receipt via SMS">
              <MessageSquare className="h-4 w-4 mr-1.5" /> SMS
            </Button>
            <Button size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isPending,
  variant = 'destructive',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isPending: boolean;
  variant?: 'destructive' | 'default';
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${variant === 'destructive' ? 'text-red-600' : 'text-amber-700'}`} />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant={variant} onClick={onConfirm} disabled={isPending}>
            {isPending && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// TRANSACTION ROW (expandable with actions)

// ── v2.308.0 SALE REFUNDS ────────────────────────────────────────────────
// The refund dialog. The Refund button in the transaction rows had been a
// placeholder since the tab shipped ("Refund placeholder - would call
// API"); this dialog is the counter it was waiting for. It fetches the
// server's refundable-line views (the refund chain's exact per-line SUMs
// - never a client-side guess), allocates per line with quantities,
// restocks by default, speaks the manager-tier gate up front, and mirrors
// the tab's design language: bordered line cards, tabular money, the
// refund amber (RotateCcw family), disabled rows that say WHY they are
// disabled.

const REFUND_REASON_LABELS: Record<string, string> = {
  DEFECTIVE: 'Defective goods',
  WRONG_ITEM: 'Wrong item sold',
  CUSTOMER_CHANGED_MIND: 'Customer changed their mind',
  DAMAGED_IN_TRANSIT: 'Damaged in transit',
  WARRANTY_CLAIM: 'Warranty claim',
  OTHER: 'Other',
};

/**
 * v2.371.0 — the refund row's reason voice. The refund service writes
 * `Refund reason: {KEY}` as the notes' FIRST segment when the clerk
 * picked a reason (the custom note rides after the ` · ` separator, and
 * a custom-note-only refund has no prefix at all); the chip reads the
 * KNOWN vocabulary only and stays silent otherwise — an honest chip
 * never invents a reason the notes did not speak. Exported for the
 * kind suite's live truth table (the TXN_TYPE_FILTERS precedent).
 */
export function refundReasonOf(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const m = notes.match(/^Refund reason: ([A-Z_]+)(?=$| ·)/);
  if (!m || !(m[1] in REFUND_REASON_LABELS)) return null;
  return REFUND_REASON_LABELS[m[1]];
}

// v2.372.0 THE DIALOG'S ENVELOPE FIX: request() speaks the {success,data}
// envelope (api.ts's ApiResponse), but this dialog's seam reads the bare
// RESULT — on the live wire the GET left the form empty (a header-only
// dialog) and the POST's success face unreadable, while the suite's
// doubles spoke the inner shape and passed. Unwrap what the wire wrapped;
// pass through what already speaks the result (the doubles keep their
// seam — an inner shape carries no `success` key).
function unwrapDialogResult<T>(res: ApiResponse<T> | T): T | null {
  if (res && typeof res === 'object' && 'success' in res) {
    const envelope = res as ApiResponse<T>;
    return envelope.data ?? null;
  }
  return (res as T) ?? null;
}

function RefundDialog({
  open,
  onOpenChange,
  transaction,
  onRefunded,
  onPrintReceipt,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionItem | null;
  /** Called on exit after a commit; carries the REFUND transaction's full
   * detail (fetched by the success face) so the parent can open the
   * receipt viewer straight onto the refund's paper trail. */
  onRefunded: (receiptTx?: TransactionItem) => void;
  /** v2.310.0: print WITHOUT the viewer hop — the success desk hands the
   * REFUND detail to the parent, which opens the receipt viewer with
   * auto-print armed (drawer-records flow: money moved, paper follows). */
  onPrintReceipt: (receiptTx: TransactionItem) => void;
}) {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [restock, setRestock] = useState(true);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  // v2.309.0: the committed refund - when set, the dialog speaks the
  // receipt face instead of the form (the money has already moved).
  const [result, setResult] = useState<RefundResult | null>(null);
  const [receiptBusy, setReceiptBusy] = useState(false);
  const queryClient = useQueryClient();

  // Reset the allocation state each time the dialog opens for a sale.
  useEffect(() => {
    if (open) {
      setSelected({});
      setRestock(true);
      setReason('');
      setNotes('');
      setBusy(false);
      setResult(null);
      setReceiptBusy(false);
    }
  }, [open, transaction?.id]);

  // The server's refundable-line views - the same SUMs the POST re-derives
  // inside its transaction. A 409 (NOT_REFUNDABLE) lands here as an error
  // and the dialog says so instead of rendering a dead form.
  const { data, isLoading, error } = useQuery({
    queryKey: ['refundable-lines', transaction?.id],
    queryFn: async () => {
      if (!transaction) throw new Error('No sale selected for the refund dialog.');
      return unwrapDialogResult(await transactionsApi.refundableLines(transaction.id));
    },
    enabled: open && !!transaction,
    retry: false,
  });

  const lines: RefundableLine[] = useMemo(
    () => (data && 'lines' in data && Array.isArray((data as RefundableLinesResult).lines)
      ? (data as RefundableLinesResult).lines
      : []),
    [data],
  );
  const refundableTotal = data && 'refundableTotal' in data
    ? (data as RefundableLinesResult).refundableTotal
    : 0;

  const requestedLines = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, qty]) => qty > 0)
        .map(([saleItemId, qty]) => ({ saleItemId, quantity: qty })),
    [selected],
  );

  // The live estimate: the dialog allocates the same way the service does -
  // an exhausting tranche charges the line's remaining value; an interior
  // tranche charges the proportional share.
  const estimatedTotal = useMemo(() => {
    const byId = new Map(lines.map((l) => [l.saleItemId, l]));
    const consumed = new Map<string, number>();
    let total = 0;
    for (const req of requestedLines) {
      const line = byId.get(req.saleItemId);
      if (!line) continue;
      const qty = req.quantity;
      const exhausts = qty + line.alreadyRefundedQuantity >= line.soldQuantity;
      const before = line.refundableValue - (consumed.get(req.saleItemId) ?? 0);
      const gross = exhausts
        ? before
        : Math.round(((line.lineTotal * qty) / line.soldQuantity + Number.EPSILON) * 100) / 100;
      consumed.set(req.saleItemId, (consumed.get(req.saleItemId) ?? 0) + gross);
      total += gross;
    }
    return Math.round((total + Number.EPSILON) * 100) / 100;
  }, [requestedLines, lines]);

  // v2.372.0 THE DIALOG MIRRORS THE SERVICE'S GAP CLOSURE: a tranche that
  // exhausts the LAST refundable line settles the header's remaining
  // consideration exactly (the original's total minus the chain so far -
  // the stranded tax/discount gap rides the final tranche), the same law
  // the POST re-derives inside its transaction, so the estimate and the
  // committed money can never disagree. An interior tranche keeps the
  // line world's estimate.
  const settlesInFull = useMemo(
    () =>
      lines.length > 0 &&
      lines.every(
        (l) => (selected[l.saleItemId] ?? 0) + l.alreadyRefundedQuantity >= l.soldQuantity - 1e-9,
      ),
    [lines, selected],
  );
  const headerRemaining = useMemo(() => {
    const total = data && 'totalAmount' in data ? Number(data.totalAmount) : 0;
    const priorGross = lines.reduce((s, l) => s + (l.lineTotal - l.refundableValue), 0);
    return Math.round((total - priorGross + Number.EPSILON) * 100) / 100;
  }, [data, lines]);
  const quotedTotal = settlesInFull ? headerRemaining : estimatedTotal;
  const settleGap = Math.round((headerRemaining - estimatedTotal + Number.EPSILON) * 100) / 100;

  const restockCount = useMemo(
    () =>
      requestedLines.reduce((sum, req) => {
        const line = lines.find((l) => l.saleItemId === req.saleItemId);
        return sum + (line && !line.isRentalItem ? 1 : 0);
      }, 0),
    [requestedLines, lines],
  );

  const handleToggleLine = (line: RefundableLine, checked: boolean) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (checked) {
        next[line.saleItemId] = line.refundableQuantity;
      } else {
        delete next[line.saleItemId];
      }
      return next;
    });
  };

  const handleQtyChange = (line: RefundableLine, raw: string) => {
    const parsed = parseFloat(raw);
    const qty = Number.isFinite(parsed)
      ? Math.max(0, Math.min(line.refundableQuantity, parsed))
      : 0;
    setSelected((prev) => ({ ...prev, [line.saleItemId]: qty }));
  };

  const handleConfirm = async () => {
    if (!transaction || requestedLines.length === 0) return;
    setBusy(true);
    try {
      const committed = unwrapDialogResult(
        await transactionsApi.refund(transaction.id, {
          lines: requestedLines,
          restock,
          ...(reason ? { reason } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        }),
      );
      if (!committed) {
        throw new Error('The refund wire returned no result to record.');
      }
      const restockedNote = committed.restocked.length
        ? ` · ${committed.restocked.length} line${committed.restocked.length > 1 ? 's' : ''} back on the shelf`
        : '';
      toast.success(
        `Refund ${committed.refund.receiptNumber} recorded — ${formatKES(committed.refundTotal)}${restockedNote}`,
      );
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['refundable-lines', transaction.id] });
      // v2.309.0: stay on the dialog - the success face offers the refund's
      // own receipt (print/PDF) instead of snapping shut on the money.
      setResult(committed);
    } catch (err) {
      handleError(err, 'Failed to record the refund. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!transaction) return null;

  // v2.309.0: the receipt face - the refund is committed; the dialog now
  // closes the paper trail instead of offering a form over spent money.
  if (result) {
    const restockedNote = result.restocked.length
      ? `${result.restocked.length} line${result.restocked.length > 1 ? 's' : ''} returned to stock`
      : null;
    const loyaltyNote = result.loyalty
      ? `${result.loyalty.clawedBack} loyalty point${result.loyalty.clawedBack === 1 ? '' : 's'} returned with the refund — wallet now ${result.loyalty.balanceAfter}`
      : 'No loyalty points to return';
    const handleViewRefundReceipt = async () => {
      setReceiptBusy(true);
      try {
        const receiptTx = await transactionsApi.get(result.refund.id);
        onOpenChange(false);
        onRefunded(receiptTx);
      } catch (err) {
        handleError(err, 'Failed to load the refund receipt. Please try again.');
      } finally {
        setReceiptBusy(false);
      }
    };
    // v2.310.0: the direct print — same fetch, but the parent arms
    // auto-print so the paper dialog opens over the viewer (one tap less
    // on the drawer-records path).
    const handlePrintRefundReceipt = async () => {
      setReceiptBusy(true);
      try {
        const receiptTx = await transactionsApi.get(result.refund.id);
        onOpenChange(false);
        onPrintReceipt(receiptTx);
      } catch (err) {
        handleError(err, 'Failed to load the refund receipt. Please try again.');
      } finally {
        setReceiptBusy(false);
      }
    };
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg" aria-describedby="refund-success-desc">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
              Refund recorded
            </DialogTitle>
            <DialogDescription id="refund-success-desc">
              Receipt #{result.refund.receiptNumber} · refund of receipt #{result.originalReceiptNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div
              className="rounded-lg border border-emerald-300/60 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30"
              role="status"
            >
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-emerald-800/70 dark:text-emerald-300/70">
                    Money returned
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {formatKES(result.refundTotal)}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  {result.originalPaymentStatus === 'REFUNDED' ? 'Sale fully refunded' : 'Sale marked partially refunded'}
                </span>
              </div>
              <ul className="mt-3 space-y-1 border-t border-emerald-200/70 pt-2 text-xs text-emerald-900/80 dark:border-emerald-900 dark:text-emerald-200/80">
                <li className="flex items-start gap-1.5">
                  <PackageOpen className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                  {restockedNote ?? 'Nothing returned to stock'}
                </li>
                <li className="flex items-start gap-1.5">
                  <Sparkles className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                  {loyaltyNote}
                </li>
                <li className="flex items-start gap-1.5">
                  <Receipt className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                  {result.remainingRefundable > 0.004
                    ? `${formatKES(result.remainingRefundable)} remains refundable on the original sale`
                    : 'The original sale is fully settled — nothing remains refundable'}
                </li>
              </ul>
            </div>
            <p className="text-center text-[11px] text-muted-foreground">
              The refund carries its own receipt — print it for the drawer records or hand it to the customer.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onRefunded();
              }}
            >
              Done
            </Button>
            <Button
              variant="outline"
              onClick={handlePrintRefundReceipt}
              disabled={receiptBusy}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:ring-emerald-600 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
              {receiptBusy ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden />
              ) : (
                <Printer className="h-4 w-4 mr-1.5" aria-hidden />
              )}
              {receiptBusy ? 'Loading receipt…' : 'Print receipt'}
            </Button>
            <Button
              onClick={handleViewRefundReceipt}
              disabled={receiptBusy}
              className="bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
              {receiptBusy ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden />
              ) : (
                <Receipt className="h-4 w-4 mr-1.5" aria-hidden />
              )}
              {receiptBusy ? 'Loading receipt…' : 'View refund receipt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const notRefundable =
    error &&
    typeof error === 'object' &&
    'body' in error &&
    (error as { body?: { code?: string } }).body?.code === 'NOT_REFUNDABLE';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="refund-dialog-desc">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-amber-600" aria-hidden />
            Refund Sale
          </DialogTitle>
          <DialogDescription id="refund-dialog-desc">
            Receipt #{data?.receiptNumber ?? transaction.receiptNumber} · sold for {formatKES(data?.totalAmount ?? transaction.totalAmount)}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground" role="status">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading refundable lines…
          </div>
        )}

        {notRefundable && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300" role="alert">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            <span>This sale can no longer be refunded — it may already be fully refunded or voided.</span>
          </div>
        )}

        {data && lines.length > 0 && (
          <>
            {/* The refundable lines */}
            <div className="space-y-2" role="group" aria-label="Refundable items">
              {lines.map((line) => {
                const qty = selected[line.saleItemId] ?? 0;
                const exhausted = line.refundableQuantity <= 0;
                const checked = qty > 0;
                const est = checked
                  ? qty + line.alreadyRefundedQuantity >= line.soldQuantity
                    ? line.refundableValue
                    : Math.round(((line.lineTotal * qty) / line.soldQuantity + Number.EPSILON) * 100) / 100
                  : 0;
                return (
                  <div
                    key={line.saleItemId}
                    className={`rounded-lg border p-2.5 transition-colors ${
                      exhausted
                        ? 'border-border/50 bg-muted/40 opacity-70'
                        : checked
                          ? 'border-amber-400/70 bg-amber-50/60 dark:border-amber-700/60 dark:bg-amber-950/20'
                          : 'border-border bg-card hover:border-amber-300/60 dark:hover:border-amber-800/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-amber-600"
                        checked={checked}
                        disabled={exhausted || busy}
                        onChange={(e) => handleToggleLine(line, e.target.checked)}
                        aria-label={`Refund ${line.productName}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-medium">{line.productName}</p>
                          <p className="shrink-0 text-sm font-semibold tabular-nums">
                            {formatKES(line.unitRefundValue)}
                            <span className="text-[10px] font-normal text-muted-foreground">/{line.unitType.toLowerCase()}</span>
                          </p>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">
                          Sold {line.soldQuantity} {line.unitType.toLowerCase()}
                          {line.alreadyRefundedQuantity > 0 && ` · refunded ${line.alreadyRefundedQuantity}`}
                          {line.isRentalItem && ' · rental (no restock)'}
                        </p>
                        {exhausted ? (
                          <span className="mt-1.5 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                            Fully refunded
                          </span>
                        ) : (
                          <div className="mt-1.5 flex items-center gap-2">
                            <Input
                              type="number"
                              inputMode="decimal"
                              min={0}
                              max={line.refundableQuantity}
                              step="any"
                              value={qty === 0 ? '' : qty}
                              placeholder="0"
                              disabled={busy}
                              onChange={(e) => handleQtyChange(line, e.target.value)}
                              onFocus={(e) => e.target.select()}
                              className="h-7 w-24 text-xs tabular-nums"
                              aria-label={`Quantity to refund for ${line.productName} (max ${line.refundableQuantity})`}
                            />
                            <span className="text-[11px] text-muted-foreground">
                              of {line.refundableQuantity} {line.unitType.toLowerCase()} refundable
                            </span>
                            {checked && (
                              <span className="ml-auto text-xs font-semibold tabular-nums text-amber-700 dark:text-amber-400">
                                {formatKES(est)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reason + notes */}
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Reason</span>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={busy}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Refund reason"
                >
                  <option value="">Select a reason…</option>
                  {Object.entries(REFUND_REASON_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Note (optional)</span>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={busy}
                  maxLength={300}
                  placeholder="Anything the till record should say"
                  className="h-8 text-xs"
                  aria-label="Refund note"
                />
              </label>
            </div>

            {/* Restock + summary */}
            <div className="rounded-lg border bg-muted/30 p-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-emerald-600"
                  checked={restock}
                  disabled={busy || restockCount === 0}
                  onChange={(e) => setRestock(e.target.checked)}
                  aria-label="Return items to stock"
                />
                <PackageOpen className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" aria-hidden />
                <span className="text-xs font-medium">
                  Return items to stock
                  {restockCount > 0 && (
                    <span className="ml-1 text-muted-foreground">({restockCount} line{restockCount > 1 ? 's' : ''})</span>
                  )}
                </span>
              </label>
              <div className="mt-2 flex items-end justify-between border-t pt-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Refund total</p>
                  <p className="text-lg font-bold tabular-nums text-amber-700 dark:text-amber-400">
                    {formatKES(quotedTotal)}
                  </p>
                </div>
                <p className="text-right text-[11px] text-muted-foreground tabular-nums">
                  {formatKES(refundableTotal)} refundable<br />
                  of {formatKES(data.totalAmount)} sold
                </p>
              </div>
              {settlesInFull && (
                <p
                  data-testid="refund-settles-hint"
                  className="mt-1.5 border-t pt-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400"
                >
                  Settles this sale in full — the original flips to REFUNDED
                  {Math.abs(settleGap) >= 0.005 && (
                    <>
                      {' '}· includes {formatKES(Math.abs(settleGap))}{' '}
                      {settleGap > 0 ? 'above' : 'below'} the line totals
                    </>
                  )}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirm}
                disabled={busy || requestedLines.length === 0}
                className="bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-600 dark:bg-amber-700 dark:hover:bg-amber-600"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-1.5" aria-hidden />
                )}
                {busy ? 'Recording refund…' : `Refund ${formatKES(quotedTotal)}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * v2.373.0 THE ROW-LEVEL SETTLE AFFORDANCE — the desk's settle truth on
 * the ROW, before the dialog opens. The chip speaks the server-derived
 * `refundState` (deriveRefundRowState's voice — the same SUMs the dialog
 * and the POST re-derive), one ink per kind:
 *   • SETTLES_FULL .......... emerald — a full refund settles this sale.
 *   • SETTLES_FULL_WITH_GAP . amber (the dialog hint's own family) — the
 *                             same settle, and the gap it rides above
 *                             the line totals is NAMED.
 *   • STRANDED .............. rose — the legacy remainder no live refund
 *                             can reach; the heal's affordance points at
 *                             it.
 *   • SETTLED ............... muted — nothing left, nothing owed.
 * The tabular amounts keep the desk's money voice; the tooltips carry
 * the when-why so the chip teaches even before it is pressed.
 */
function RefundStateChip({ state, receiptNumber }: { state: RefundRowState; receiptNumber: string }) {
  if (state.kind === 'SETTLES_FULL') {
    return (
      <Badge
        variant="secondary"
        data-testid="refund-row-state"
        data-kind="SETTLES_FULL"
        className="text-[10px] px-1.5 py-0 gap-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        title={`A full refund returns ${formatKES(state.fullRefundAmount)} and settles sale ${receiptNumber} completely`}
      >
        <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="font-mono">Settles in full · {formatKES(state.fullRefundAmount)}</span>
      </Badge>
    );
  }
  if (state.kind === 'SETTLES_FULL_WITH_GAP') {
    return (
      <Badge
        variant="secondary"
        data-testid="refund-row-state"
        data-kind="SETTLES_FULL_WITH_GAP"
        className="text-[10px] px-1.5 py-0 gap-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
        title={`A full refund returns ${formatKES(state.fullRefundAmount)} — includes ${formatKES(state.settleGap)} above the line totals (VAT added on top of the lines)`}
      >
        <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="font-mono">Settles in full · {formatKES(state.fullRefundAmount)} (+{formatKES(state.settleGap)} gap)</span>
      </Badge>
    );
  }
  if (state.kind === 'STRANDED') {
    return (
      <Badge
        variant="secondary"
        data-testid="refund-row-state"
        data-kind="STRANDED"
        className="text-[10px] px-1.5 py-0 gap-0.5 bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
        title={`Every line on sale ${receiptNumber} is already refunded, but ${formatKES(state.strandedAmount)} of the total was never reachable — settle the gap to close this sale`}
      >
        <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="font-mono">{formatKES(state.strandedAmount)} stranded</span>
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      data-testid="refund-row-state"
      data-kind="SETTLED"
      className="text-[10px] px-1.5 py-0 gap-0.5 text-muted-foreground"
      title={`Nothing is left to refund on sale ${receiptNumber} — the lines and the header are both settled`}
    >
      <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
      Nothing left to refund
    </Badge>
  );
}

function TransactionRow({
  transaction,
  isExpanded,
  onToggle,
  onViewReceipt,
  onRefund,
  onHeal,
  onVoid,
  onSendWhatsApp,
  onPrint,
}: {
  transaction: TransactionItem;
  isExpanded: boolean;
  onToggle: () => void;
  onViewReceipt: () => void;
  onRefund: () => void;
  onHeal: () => void;
  onVoid: () => void;
  onSendWhatsApp: () => void;
  onPrint: () => void;
}) {
  const items = Array.isArray(transaction.items) ? transaction.items : [];
  const txType = getTransactionType(transaction);
  const customerName = transaction.customer?.name || 'Walk-in';
  // v2.308.0: the Refund button is feature-gated (manager tier) - hiding it
  // from cashiers is UX; the server's hasFeaturePermission('pos.refund')
  // gate is the actual enforcement.
  const user = useAuthStore((s) => s.user);
  const canRefund = hasFeaturePermission(user?.role, 'pos.refund');
  const avatarGradient = getAvatarGradient(customerName);
  const customerInitials = getInitials(customerName);

  return (
    <>
      <TableRow
        className={`cursor-pointer transition-colors ${
          txType === 'void' ? 'opacity-50 bg-red-50/50 dark:bg-red-950/10' :
          txType === 'refund' ? 'bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20' :
          'hover:bg-muted/50'
        }`}
        onClick={onToggle}
      >
        <TableCell className="font-mono text-xs">
          <div className="flex items-center gap-1.5">
            {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
            <span className="truncate max-w-[120px]" title={transaction.receiptNumber}>{transaction.receiptNumber}</span>
          </div>
        </TableCell>
        <TableCell className="text-xs">
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 gap-0.5 ${getTransactionTypeColor(txType)}`}>
            {getTransactionTypeIcon(txType)}
            {getTransactionTypeLabel(txType)}
          </Badge>
        </TableCell>
        <TableCell className="text-xs">{formatDateTime(transaction.createdAt)}</TableCell>
        <TableCell className="text-xs">
          <div className="flex items-center gap-2">
            {/* Customer avatar - initials in gradient circle */}
            <div
              className={`shrink-0 h-7 w-7 rounded-full bg-gradient-to-br ${avatarGradient} text-white text-[10px] font-bold flex items-center justify-center shadow-sm`}
              title={customerName}
            >
              {customerInitials}
            </div>
            <span className="truncate max-w-[120px]">{customerName}</span>
          </div>
        </TableCell>
        <TableCell className="text-xs text-center">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Badge>
        </TableCell>
        <TableCell className="text-xs font-bold text-right">
          <span className={`text-sm ${txType === 'refund' ? 'text-amber-700' : txType === 'void' ? 'text-red-600 line-through' : 'text-foreground'}`}>
            {txType === 'refund' ? '-' : ''}{formatKES(transaction.totalAmount)}
          </span>
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 gap-0.5 ${getPaymentMethodColor(transaction.paymentMethod)}`}>
            {getPaymentMethodIcon(transaction.paymentMethod)}
            {transaction.paymentMethod}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex flex-col items-start gap-1">
            {transaction.transactionType === 'REFUND' && (
              /* v2.371.0 THE REFUND EVENT'S WEARING: the row speaks its
                 kind — amber, this desk's own refund ink (the amount cell
                 has worn the amber minus since the refund lens shipped),
                 the RotateCcw kind icon, and the reason label only when
                 the notes carry the service's `Refund reason:` prefix.
                 The refunded ORIGINAL keeps its blue Refunded status
                 badge — the event and the state are two voices, and the
                 desk now speaks both. */
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                <RotateCcw className="h-3 w-3 shrink-0" aria-hidden="true" />
                Refund{refundReasonOf(transaction.notes) ? ` · ${refundReasonOf(transaction.notes)}` : ''}
              </Badge>
            )}
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${getPaymentStatusColor(transaction.paymentStatus)}`}>
              {getPaymentStatusLabel(transaction.paymentStatus)}
            </Badge>
            {txType === 'sale' && transaction.refundState && (
              /* v2.373.0 THE ROW-LEVEL SETTLE AFFORDANCE: the settle truth
                 on the row — emerald settles, amber gap, rose stranded,
                 muted settled. The server derived it from the SAME chain
                 SUMs the dialog re-derives; the row never guesses. */
              <RefundStateChip state={transaction.refundState} receiptNumber={transaction.receiptNumber} />
            )}
          </div>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className={`bg-muted/20 ${txType === 'void' ? 'opacity-50' : ''}`}>
          <TableCell colSpan={8} className="p-3">
            <div className="space-y-3">
              {/* Line Items */}
              {items.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Line Items</p>
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left p-2 font-medium">Product</th>
                          <th className="text-center p-2 font-medium">Qty</th>
                          <th className="text-center p-2 font-medium">Unit</th>
                          <th className="text-right p-2 font-medium">Price</th>
                          <th className="text-right p-2 font-medium">Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item: SaleItemDetail) => (
                          <tr key={item.id} className="border-t border-border/50">
                            <td className="p-2">{item.productName}</td>
                            <td className="p-2 text-center">{formatQty(item.quantity)}</td>
                            <td className="p-2 text-center">{unitLabel(item.unitType)}</td>
                            <td className="p-2 text-right">{formatKES(item.pricePerUnit)}</td>
                            <td className="p-2 text-right font-medium">{formatKES(item.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              {/* Totals Row */}
              <div className="flex flex-wrap justify-end gap-4 text-xs">
                <div className="flex gap-2"><span className="text-muted-foreground">Subtotal:</span><span className="font-medium">{formatKES(transaction.subtotal)}</span></div>
                <div className="flex gap-2"><span className="text-muted-foreground">VAT:</span><span className="font-medium">{formatKES(transaction.taxAmount)}</span></div>
                {transaction.discountAmount > 0 && (
                  <div className="flex gap-2"><span className="text-muted-foreground">Discount:</span><span className="font-medium text-green-700">-{formatKES(transaction.discountAmount)}</span></div>
                )}
                <div className="flex gap-2"><span className="text-muted-foreground font-semibold">Total:</span><span className="font-bold">{formatKES(transaction.totalAmount)}</span></div>
              </div>
              {transaction.cashier && (
                <p className="text-[10px] text-muted-foreground">Cashier: {transaction.cashier.name}</p>
              )}
              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); onViewReceipt(); }}>
                  <Eye className="h-3 w-3 mr-1" /> View Receipt
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); onPrint(); }}>
                  <Printer className="h-3 w-3 mr-1" /> Print
                </Button>
                {/* v2.373.0: the Refund button yields the row when the row
                    itself knows better — a STRANDED sale has no refundable
                    line left (the dialog would open dead) and a SETTLED one
                    has nothing to refund at all; the stranded voice gets
                    its own affordance below. */}
                {txType === 'sale' && ['COMPLETED', 'PARTIAL'].includes(transaction.paymentStatus) && canRefund
                  && transaction.refundState?.kind !== 'STRANDED' && transaction.refundState?.kind !== 'SETTLED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    onClick={(e) => { e.stopPropagation(); onRefund(); }}
                    aria-label={`Refund sale ${transaction.receiptNumber}`}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" /> Refund
                  </Button>
                )}
                {txType === 'sale' && transaction.refundState?.kind === 'STRANDED' && canRefund && (
                  /* v2.373.0 THE STRANDED-GAP HEAL affordance: the legacy
                     remainder the live refund can never reach gets its own
                     rose settle button — one confirm, the zero-item refund
                     event pays the header remainder, the sale closes. */
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    onClick={(e) => { e.stopPropagation(); onHeal(); }}
                    aria-label={`Settle stranded gap on sale ${transaction.receiptNumber}`}
                  >
                    <Sparkles className="h-3 w-3 mr-1" /> Settle stranded gap
                  </Button>
                )}
                {txType === 'sale' && transaction.paymentStatus === 'COMPLETED' && (
                  <Button variant="outline" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={(e) => { e.stopPropagation(); onVoid(); }}>
                    <Ban className="h-3 w-3 mr-1" /> Void
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs text-green-700 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-950/30" onClick={(e) => { e.stopPropagation(); onSendWhatsApp(); }}>
                  <MessageCircle className="h-3 w-3 mr-1" /> WhatsApp
                </Button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// v2.333.0 THE LEDGER'S OWN WORD — the transactions desk's payment-method
// lens answers the address bar too: `?txn-pay=CASH` lands the ledger with
// the cash lens already chosen (the sixth word of the vocabulary, and the
// desk with the QUICK-CHIPS face inherits the membership law instead of a
// copy). The law is MEMBERSHIP, ONE home (`parseInitialNamedMember`): the
// value must name a lens the desk actually offers — case-sensitive (the
// lens's own words are UPPERCASE, so `cash` is an unknown word, not a
// clever match) — and anything missing or unknown answers 'all' (never
// stranded). The word is desk-prefixed per the Task 44 collision law: a
// desk-prefixed word can never leak across client-side tab switches.
// Collision-checked at round start: no reader of `txn-pay` exists anywhere in src/.
// Read-on-mount ONLY (the one-writer law): the landing word is the
// LANDING lens, never rewritten; the quick chips own the state after.
export const TXN_PAY_FILTERS = ['all', 'CASH', 'MPESA', 'DEBT'] as const;

function initialTxnPay(): string {
  if (typeof window === 'undefined') return 'all';
  return parseInitialNamedMember(window.location.search, 'txn-pay', TXN_PAY_FILTERS, 'all');
}

// v2.354.0 THE TYPE LENS'S OWN WORD — the transactions desk's type lens
// answers the address bar too: `?txn-type=refund` lands the ledger with
// the refund lens already chosen (the seventh word of the vocabulary,
// and the SECOND word on this desk after v2.333.0's payment lens). The
// law is MEMBERSHIP, ONE home (`parseInitialNamedMember`): the value
// must name a lens the desk actually offers — case-sensitive (the
// lens's own words are lowercase, so `REFUND` is an unknown word, not a
// clever match — the inverse voice of the UPPERCASE payment word) — and
// anything missing or unknown answers 'all' (never stranded). The word
// is desk-prefixed per the Task 44 collision law: a desk-prefixed word
// can never leak across client-side tab switches. Collision-checked at
// round start: the only `txn-type` bytes in src/ were this desk's own
// census testids (a different string — `txn-type-census`,
// `txn-type-lens-voice`), never a reader of the word.
// Read-on-mount ONLY (the one-writer law): the landing word is the
// LANDING lens, never rewritten; the census chips own the state after.
export const TXN_TYPE_FILTERS = ['all', 'sale', 'refund', 'void'] as const;

function initialTxnType(): (typeof TXN_TYPE_FILTERS)[number] {
  if (typeof window === 'undefined') return 'all';
  return parseInitialNamedMember(window.location.search, 'txn-type', TXN_TYPE_FILTERS, 'all');
}

export default function TransactionsTab() {
  const currentStoreId = useAppStore((s) => s.currentStoreId);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  // v2.333.0: the payment lens's seed reads `?txn-pay=` (membership law,
  // one home); a hand-driven quick chip afterwards is the human's truth.
  const [paymentFilter, setPaymentFilter] = useState<string>(initialTxnPay);
  // v2.333.0 THE LANDING WORD — the address-bar word the desk answered at
  // mount ('all' when the landing carried no lens). The chip speaks it
  // ONCE: dismissed or hand-changed, the landing is over and the chip
  // retires — an honest face never claims a landing that is done.
  const [landedTxnPay] = useState<string>(initialTxnPay);
  const [txnLandingLive, setTxnLandingLive] = useState(true);

  // v2.333.0: a hand-driven change retires the landing word — the chip
  // speaks the ADDRESS BAR's landing, never the human's next choice.
  const chooseTxnPay = (value: string) => {
    setPaymentFilter(value);
    setTxnLandingLive(false);
  };
  // v2.354.0: the type lens's seed reads `?txn-type=` (membership law,
  // one home); a hand-driven census chip afterwards is the human's truth.
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>(initialTxnType);
  // v2.354.0 THE LANDING WORD — the address-bar word the desk answered at
  // mount ('all' when the landing carried no lens). The chip speaks it
  // ONCE: dismissed or hand-changed, the landing is over and the chip
  // retires — an honest face never claims a landing that is done.
  const [landedTxnType] = useState<(typeof TXN_TYPE_FILTERS)[number]>(initialTxnType);
  const [txnTypeLandingLive, setTxnTypeLandingLive] = useState(true);

  // v2.354.0: a hand-driven change retires the landing word — the chip
  // speaks the ADDRESS BAR's landing, never the human's next choice.
  const chooseTxnType = (value: 'all' | TransactionType) => {
    setTypeFilter(value);
    setTxnTypeLandingLive(false);
  };
  const [amountFilterMin, setAmountFilterMin] = useState('');
  const [amountFilterMax, setAmountFilterMax] = useState('');
  const [showAmountFilter, setShowAmountFilter] = useState(false);

  // Debounce search (300ms) - search is client-side, but this prevents the
  // filter+sort from running on every keystroke for large transaction lists.
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  // Receipt modal state
  const [receiptTransaction, setReceiptTransaction] = useState<TransactionItem | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  // v2.310.0: arms the receipt viewer's one-shot auto-print (the refund
  // success desk's direct print); disarmed whenever the viewer closes.
  const [receiptAutoPrint, setReceiptAutoPrint] = useState(false);
  // Receipt distribution state (Phase 4 - Email/WhatsApp)
  const [distributing, setDistributing] = useState<'EMAIL' | 'WHATSAPP' | 'SMS' | null>(null);

  // Refund/Void dialog state
  const [refundTransaction, setRefundTransaction] = useState<TransactionItem | null>(null);
  const [voidTransaction, setVoidTransaction] = useState<TransactionItem | null>(null);

  // v2.373.0 THE STRANDED-GAP HEAL state: the row affordance opens ONE
  // confirm; the confirm settles the legacy remainder through
  // POST /transactions/[id]/refund-heal (healStrandedOriginal's atomic
  // transaction), toasts the settled truth, and retires the list.
  const [healTransaction, setHealTransaction] = useState<TransactionItem | null>(null);
  const [healBusy, setHealBusy] = useState(false);
  const queryClient = useQueryClient();

  const handleHealConfirm = useCallback(async () => {
    if (!healTransaction) return;
    setHealBusy(true);
    try {
      const settled = unwrapDialogResult(
        await transactionsApi.healStranded(healTransaction.id),
      );
      if (!settled) {
        throw new Error('The heal wire returned no result to record.');
      }
      toast.success(
        `Stranded gap settled — ${formatKES(settled.refundTotal)} returned${settled.loyalty ? ` · ${settled.loyalty.clawedBack} loyalty points home` : ''}`,
        { description: `${settled.originalReceiptNumber} is fully settled — nothing remains refundable` },
      );
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setHealTransaction(null);
    } catch (err) {
      handleError(err, 'Failed to settle the stranded gap. Please try again.');
    } finally {
      setHealBusy(false);
    }
  }, [healTransaction, queryClient]);

  // Compute date range
  const dateRange = useMemo(() => {
    if (datePreset === 'custom' && customDateFrom && customDateTo) {
      return {
        from: startOfDay(new Date(customDateFrom)),
        to: endOfDay(new Date(customDateTo)),
      };
    }
    return getDateRange(datePreset);
  }, [datePreset, customDateFrom, customDateTo]);

  // Fetch transactions
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', currentStoreId, dateRange, paymentFilter],
    queryFn: async () => {
      const params: Record<string, string | undefined> = {
        storeId: currentStoreId,
        limit: '200',
        dateFrom: toISOString(dateRange.from),
        dateTo: toISOString(dateRange.to),
      };
      if (paymentFilter !== 'all') {
        params.paymentMethod = paymentFilter;
      }
      const res = await transactionsApi.list(params);
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // v2.207.0: wrapped in its own useMemo — a conditional that re-created the
  // array identity every render made EVERY downstream memo's deps unstable
  // (the exhaustive-deps warning class fired for each one; the wrapper ends
  // the class instead of growing it).
  const transactions = useMemo(
    () => (Array.isArray(transactionsData) ? transactionsData : []),
    [transactionsData],
  );

  // v2.353.0 the census: a PLAIN call on the same array the desk renders —
  // the chips' tallies and the lens voice both read it (the memo-lint law).
  const typeCensus = countTransactionTypes(transactions);

  // Filter by search query, type, and amount
  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.receiptNumber.toLowerCase().includes(q) ||
          (t.customer?.name || '').toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter((t) => getTransactionType(t) === typeFilter);
    }
    if (amountFilterMin) {
      result = result.filter((t) => t.totalAmount >= Number(amountFilterMin));
    }
    if (amountFilterMax) {
      result = result.filter((t) => t.totalAmount <= Number(amountFilterMax));
    }
    return result;
  }, [transactions, debouncedSearch, typeFilter, amountFilterMin, amountFilterMax]);

  // Summary stats
  const summaryStats = useMemo(() => {
    const totalSales = filteredTransactions
      .filter(t => getTransactionType(t) === 'sale')
      .reduce((sum, t) => sum + t.totalAmount, 0);
    const totalRefunds = filteredTransactions
      .filter(t => getTransactionType(t) === 'refund')
      .reduce((sum, t) => sum + t.totalAmount, 0);
    const netRevenue = totalSales - totalRefunds;
    const totalCount = filteredTransactions.length;
    const avgValue = totalCount > 0 ? totalSales / filteredTransactions.filter(t => getTransactionType(t) === 'sale').length || 0 : 0;

    return { totalSales, totalRefunds, netRevenue, totalCount, avgValue };
  }, [filteredTransactions]);

  // Mini trend chart data - daily totals (REAL: summed off the transactions
  // wire; the voice pre-formats each figure so the chart keeps the Ksh sound)
  const trendData = useMemo(() => {
    const dailyMap: Record<string, number> = {};
    transactions.forEach(t => {
      const day = new Date(t.createdAt).toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + t.totalAmount;
    });
    return Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ label: date.slice(5), value }));
  }, [transactions]);

  // v2.207.0: the one-writer aria — every day in calendar order, quiet days
  // honest, the loudest day named (composeDailyRevenueVoice, report-voices).
  const trendVoice = useMemo(
    () => composeDailyRevenueVoice('Daily revenue', trendData.map((d) => ({ label: d.label, value: d.value, figure: formatKES(d.value) }))),
    [trendData],
  );

  const handleToggleRow = useCallback((id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  const handleViewReceipt = useCallback((transaction: TransactionItem) => {
    setReceiptTransaction(transaction);
    setReceiptOpen(true);
  }, []);

  const handleRefund = useCallback((transaction: TransactionItem) => {
    setRefundTransaction(transaction);
  }, []);

  const handleVoid = useCallback((transaction: TransactionItem) => {
    setVoidTransaction(transaction);
  }, []);

  const handleSendReceiptWhatsApp = useCallback(async (transaction: TransactionItem) => {
    try {
      const phone = prompt('Enter WhatsApp phone number:', transaction.customer?.phone || '') || '';
      if (!phone) return;
      const res = await whatsappApi.sendDocument({
        type: 'receipt',
        documentId: transaction.id,
        storeId: currentStoreId,
        phone,
      });
      // v2.32.0: envelope fix - the flat res.waLink read was always undefined.
      const payload = res.data;
      if (payload?.waLink) {
        window.open(payload.waLink, '_blank');
        toast.success(`${payload.documentTitle} sent via WhatsApp`);
      }
    } catch (err) {
      const msg = handleError(err, 'Send receipt via WhatsApp');
      toast.error(msg);
    }
  }, [currentStoreId]);

  /**
   * Distribute the currently-open receipt via Email (Resend), WhatsApp
   * (Twilio) or SMS (Twilio Programmable SMS).
   * Calls POST /api/reports/export with the transaction ID and channel. The
   * backend gracefully simulates the send when provider API keys are absent,
   * returning `simulated: true` so we can inform the user.
   */
  const handleDistributeReceipt = useCallback(async (channel: 'EMAIL' | 'WHATSAPP' | 'SMS', recipient: string) => {
    if (!receiptTransaction) return;
    setDistributing(channel);
    try {
      const res = await transactionsApi.distributeReceipt({
        transactionId: receiptTransaction.id,
        channel,
        email: channel === 'EMAIL' ? recipient : undefined,
        phone: channel !== 'EMAIL' ? recipient : undefined,
        storeId: currentStoreId || undefined,
      });
      const result: ReceiptDistributionResult = (res as unknown as { data: ReceiptDistributionResult }).data ?? (res as unknown as ReceiptDistributionResult);
      if (result.simulated) {
        toast.info(result.message);
      } else {
        toast.success(result.message);
      }
    } catch (err) {
      const msg = handleError(err, `Send receipt via ${channel === 'EMAIL' ? 'email' : channel === 'SMS' ? 'SMS' : 'WhatsApp'}`);
      toast.error(msg);
    } finally {
      setDistributing(null);
    }
  }, [receiptTransaction, currentStoreId]);

  const handlePrintReceipt = useCallback((transaction: TransactionItem) => {
    const items = Array.isArray(transaction.items) ? transaction.items : [];
    const store = getStoreInfo(currentStoreId);
    const logoUrl = getLogoUrl();
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to print.');
      return;
    }
    const rows = items.map((item: SaleItemDetail) => `
      <tr>
        <td>${item.productName}</td>
        <td style="text-align:center">${formatQtyWithUnit(item.quantity, item.unitType)}</td>
        <td style="text-align:right">${formatKES(item.pricePerUnit)}</td>
        <td style="text-align:right">${formatKES(item.lineTotal)}</td>
      </tr>
    `).join('');
    printWindow.document.write(`
      <!doctype html><html><head><title>Receipt ${transaction.receiptNumber}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 16px; font-size: 12px; max-width: 320px; margin: 0 auto; color: #111; }
        .center { text-align: center; }
        .bold { font-weight: 700; }
        hr { border: none; border-top: 1px dashed #999; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 3px 0; font-size: 11px; }
        th { border-bottom: 1px solid #999; text-align: left; }
        .right { text-align: right; }
        .muted { color: #555; }
        .logo { max-width: 150px; max-height: 70px; margin: 0 auto 6px; display: block; }
      </style></head>
      <body>
        <div class="center">
          <img src="${logoUrl}" alt="${COMPANY.legalName}" class="logo" />
          <h2 class="bold" style="margin:0">${COMPANY.legalName}</h2>
          <p class="muted" style="margin:2px 0">${store.name}</p>
          <p class="muted" style="margin:2px 0">${store.location}</p>
          <p class="muted" style="margin:2px 0">Tel: ${store.phone}${store.email ? ' | ' + store.email : ''}</p>
          ${store.taxPin ? `<p class="muted" style="margin:2px 0">PIN: ${store.taxPin}</p>` : ''}
        </div>
        <hr>
        <p class="bold">Receipt #: ${transaction.receiptNumber}</p>
        <p>Date: ${formatDateTime(transaction.createdAt)}</p>
        <p>Customer: ${transaction.customer?.name || 'Walk-in'}</p>
        <p>Cashier: ${transaction.cashier?.name || '-'}</p>
        <hr>
        <table>
          <thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Price</th><th class="right">Total</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <hr>
        <div class="right">
          <p>Subtotal: ${formatKES(transaction.subtotal)}</p>
          <p>VAT: ${formatKES(transaction.taxAmount)}</p>
          ${transaction.discountAmount > 0 ? `<p>Discount: -${formatKES(transaction.discountAmount)}</p>` : ''}
          <p class="bold" style="font-size:14px">TOTAL: ${formatKES(transaction.totalAmount)}</p>
        </div>
        <hr>
        <div class="center">
          <p>Paid via ${transaction.paymentMethod}</p>
          <p>Status: ${transaction.paymentStatus}</p>
          <p class="bold">Thank you for your business!</p>
          <p class="muted">${COMPANY.website} | ${COMPANY.email}</p>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }, [currentStoreId]);

  return (
    <div className="space-y-6">
      {/* Summary Cards - Glass-morphism */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-green-500 backdrop-blur-sm bg-card/80">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="shrink-0 p-2 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20">
              <TrendingUp className="h-4 w-4 text-green-700 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total Sales</p>
              <p className="text-sm sm:text-base font-bold text-green-700 dark:text-green-400 whitespace-nowrap">{formatKES(summaryStats.totalSales)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 backdrop-blur-sm bg-card/80">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="shrink-0 p-2 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20">
              <RotateCcw className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Total Refunds</p>
              <p className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">{formatKES(summaryStats.totalRefunds)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 backdrop-blur-sm bg-card/80">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="shrink-0 p-2 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/20">
              <Hash className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Net Revenue</p>
              <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{formatKES(summaryStats.netRevenue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 backdrop-blur-sm bg-card/80">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="shrink-0 p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/20">
                <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Transactions</p>
                <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">{summaryStats.totalCount}</p>
              </div>
            </div>
            {/* Mini Trend Chart */}
            {trendData.length > 1 && (
              <div className="mt-2 pt-2 border-t border-border/30">
                <MiniTrendChart data={trendData} height={28} ariaLabel={trendVoice} />
                <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                  {trendData.length} day{trendData.length === 1 ? '' : 's'} on the chart · figures in Ksh
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search - Glass Card */}
      <Card className="backdrop-blur-sm bg-card/80 border-border/50">
        <CardContent className="p-4 space-y-3">
          {/* Date presets */}
          <div className="flex flex-wrap items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setDatePreset(preset.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  datePreset === preset.id
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                }`}
              >
                {preset.label}
              </button>
            ))}
            {datePreset === 'custom' && (
              <div className="flex items-center gap-2 ml-2">
                <Input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  className="h-8 text-xs w-36"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  className="h-8 text-xs w-36"
                />
              </div>
            )}
          </div>

          {/* Payment method filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            {/* v2.333.0 THE LANDING WORD CHIP, SIXTH WEARING — a link
                that landed the ledger pre-filtered wears a chip naming
                the word it answered (?txn-pay=…), styled in the lens's
                own VIOLET family (the sixth family of the vocabulary —
                indigo/amber/rose/emerald/cyan now gain the ledger's
                violet) with dark-mode variants, the Link2 icon, a
                `title` tooltip, and a one-press dismissal that clears
                the lens the word seeded. The chip retires the moment
                the human owns the filter — a hand-driven quick chip or
                the chip's own dismissal.
                `data-testid="txn-landing-word"` — the QA walk's
                handle. */}
            {txnLandingLive && landedTxnPay !== 'all' && paymentFilter === landedTxnPay && (
              <button
                type="button"
                onClick={() => {
                  setPaymentFilter('all');
                  setTxnLandingLive(false);
                  // v2.372.0 THE CHIP SCRUBS ITS WORD (the loyalty desk's
                  // contract, unified): a stale ?txn-pay= that outlives
                  // the lens it named is a lie the next refresh would
                  // resurrect — the dismissal removes it from the address
                  // bar, SSR-guarded like every window touch.
                  if (typeof window !== 'undefined') {
                    const next = buildSearchWithoutParams(window.location.search, ['txn-pay']);
                    window.history.replaceState(null, '', next ? next : window.location.pathname);
                  }
                }}
                className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-violet-200 bg-violet-50 text-violet-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
                data-testid="txn-landing-word"
                title="The desk landed with this filter from the address bar — press to clear it"
              >
                <Link2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">landed ?txn-pay={landedTxnPay}</span>
                <X className="h-3 w-3 shrink-0 opacity-60" aria-hidden="true" />
              </button>
            )}
            {/* v2.333.0: the hand-driven quick chips are voice 2 — a
                hand-driven change retires the landing word. */}
            {['all', 'CASH', 'MPESA', 'DEBT'].map((method) => (
              <button
                key={method}
                onClick={() => chooseTxnPay(method)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1 ${
                  paymentFilter === method
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                }`}
              >
                {method !== 'all' && getPaymentMethodIcon(method)}
                {method === 'all' ? 'All Methods' : method}
              </button>
            ))}
          </div>

          {/* Transaction type filter — v2.353.0 THE LEDGER SPEAKS ITS
              CENSUS: the chip map is the census keyset itself (as const),
              so each chip names its lens's live tally and the two
              parameter annotations the map used to need are gone — the
              keyset IS the union. The active lens wears a count voice in
              the desk's sky family (never the refund amber, never the
              payment violet — a voice must not masquerade as a badge). */}
          <div className="flex flex-wrap items-center gap-2" data-testid="txn-type-census">
            <ShoppingBag className="h-4 w-4 text-muted-foreground shrink-0" />
            {(['all', 'sale', 'refund', 'void'] as const).map((type) => (
              <button
                key={type}
                onClick={() => chooseTxnType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${
                  typeFilter === type
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                }`}
              >
                {type !== 'all' && getTransactionTypeIcon(type)}
                {type === 'all' ? 'All Types' : getTransactionTypeLabel(type)}
                <span className="tabular-nums opacity-70">· {typeCensus[type]}</span>
              </button>
            ))}
            {/* v2.354.0 THE LANDING WORD CHIP, SEVENTH WEARING — a link
                that landed the ledger pre-filtered wears a chip naming
                the word it answered (?txn-type=…), styled in the lens's
                own SEVENTH family, fuchsia (indigo/amber/rose/emerald/
                cyan/violet now gain the type lens's fuchsia; the census
                voice keeps its sky — a voice must not masquerade as a
                badge) with dark-mode variants, the Link2 icon, a `title`
                tooltip, and a one-press dismissal that clears the lens
                the word seeded. The dismiss hint sharpens on hover (the
                X fades up from 60% — the group-hover detail). The chip
                retires the moment the human owns the filter — a
                hand-driven census chip or the chip's own dismissal.
                `data-testid="txn-type-landing-word"` — the QA walk's
                handle. */}
            {txnTypeLandingLive && landedTxnType !== 'all' && typeFilter === landedTxnType && (
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('all');
                  setTxnTypeLandingLive(false);
                  // v2.372.0 THE CHIP SCRUBS ITS WORD (the loyalty desk's
                  // contract, unified): a stale ?txn-type= that outlives
                  // the lens it named is a lie the next refresh would
                  // resurrect — the dismissal removes it from the address
                  // bar, SSR-guarded like every window touch.
                  if (typeof window !== 'undefined') {
                    const next = buildSearchWithoutParams(window.location.search, ['txn-type']);
                    window.history.replaceState(null, '', next ? next : window.location.pathname);
                  }
                }}
                className="group inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 text-xs font-medium whitespace-nowrap transition-colors hover:bg-fuchsia-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 dark:hover:bg-fuchsia-500/20"
                data-testid="txn-type-landing-word"
                title="The desk landed with this filter from the address bar — press to clear it"
              >
                <Link2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">landed ?txn-type={landedTxnType}</span>
                <X className="h-3 w-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </button>
            )}
            {typeFilter !== 'all' && (
              // the lens voice: the active type filter names how many
              // transactions it holds (sky with dark variants; gone when
              // the whole ledger is shown — no news, no voice).
              <span
                data-testid="txn-type-lens-voice"
                className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
              >
                <ShoppingBag className="h-3 w-3" />
                <span className="tabular-nums">{typeCensus[typeFilter]} in this lens</span>
              </span>
            )}
            <button
              onClick={() => setShowAmountFilter(!showAmountFilter)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                showAmountFilter || amountFilterMin || amountFilterMax
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              }`}
            >
              Amount Range
            </button>
          </div>

          {/* Amount range filter */}
          {showAmountFilter && (
            <div className="flex items-center gap-2 pl-6">
              <span className="text-xs text-muted-foreground">KES</span>
              <Input
                type="number"
                placeholder="Min"
                value={amountFilterMin}
                onChange={(e) => setAmountFilterMin(e.target.value)}
                className="h-8 text-xs w-28"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={amountFilterMax}
                onChange={(e) => setAmountFilterMax(e.target.value)}
                className="h-8 text-xs w-28"
              />
              {(amountFilterMin || amountFilterMax) && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setAmountFilterMin(''); setAmountFilterMax(''); }}>
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}
            </div>
          )}

          {/* Search and Export */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by receipt # or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportTransactionsCSV(filteredTransactions)}
              disabled={filteredTransactions.length === 0}
              className="shrink-0"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card className="backdrop-blur-sm bg-card/80 border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Transactions
              <Badge variant="secondary" className="text-xs">{filteredTransactions.length}</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative mx-auto w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-2xl border border-border/30" />
                <ShoppingBag className="absolute inset-0 m-auto h-10 w-10 text-muted-foreground/30" />
              </div>
              <p className="text-base font-medium text-muted-foreground">No transactions found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your date range or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[calc(100vh-32rem)] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Receipt #</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs text-center">Items</TableHead>
                    <TableHead className="text-xs text-right">Total</TableHead>
                    <TableHead className="text-xs">Payment</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      isExpanded={expandedRow === transaction.id}
                      onToggle={() => handleToggleRow(transaction.id)}
                      onViewReceipt={() => handleViewReceipt(transaction)}
                      onRefund={() => handleRefund(transaction)}
                      onHeal={() => setHealTransaction(transaction)}
                      onVoid={() => handleVoid(transaction)}
                      onSendWhatsApp={() => handleSendReceiptWhatsApp(transaction)}
                      onPrint={() => handlePrintReceipt(transaction)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      <ReceiptModal
        open={receiptOpen}
        onOpenChange={(nextOpen) => {
          setReceiptOpen(nextOpen);
          if (!nextOpen) setReceiptAutoPrint(false);
        }}
        transaction={receiptTransaction}
        onDistribute={handleDistributeReceipt}
        distributing={distributing}
        autoPrint={receiptAutoPrint}
      />

      {/* v2.308.0: the refund dialog - the placeholder confirm ("would call
          API") is retired; this one talks to POST /transactions/[id]/refund. */}
      <RefundDialog
        open={!!refundTransaction}
        onOpenChange={(open) => { if (!open) setRefundTransaction(null); }}
        transaction={refundTransaction}
        onRefunded={(receiptTx) => {
          setRefundTransaction(null);
          // v2.309.0: the success face hands over the REFUND transaction's
          // full detail - the receipt viewer opens straight onto it.
          if (receiptTx) {
            setReceiptTransaction(receiptTx);
            setReceiptOpen(true);
          }
        }}
        onPrintReceipt={(receiptTx) => {
          // v2.310.0: the direct print — the viewer opens with auto-print
          // armed, so the paper dialog is already on its way up.
          setReceiptTransaction(receiptTx);
          setReceiptAutoPrint(true);
          setReceiptOpen(true);
        }}
      />

      {/* v2.373.0 THE STRANDED-GAP HEAL confirm: the rose affordance's
          one gate — the description speaks the exact remainder, what the
          settlement records (the zero-item refund event, ledger balanced),
          and the sale's closure; the confirm hands over to the atomic
          healStrandedOriginal transaction. */}
      <ConfirmActionDialog
        open={!!healTransaction}
        onOpenChange={(open) => { if (!open) setHealTransaction(null); }}
        title="Settle stranded gap"
        description={
          healTransaction
            ? `Every item on ${healTransaction.receiptNumber} is already refunded, but ${formatKES(healTransaction.refundState?.strandedAmount ?? 0)} of the sale's total was never reachable by any refund. Settling records one refund event for exactly that remainder — money out, the ledger, drawer and journal balanced — and closes the sale as REFUNDED. This cannot be undone.`
            : ''
        }
        onConfirm={handleHealConfirm}
        isPending={healBusy}
        variant="default"
      />

      {/* Void Confirmation */}
      <ConfirmActionDialog
        open={!!voidTransaction}
        onOpenChange={(open) => { if (!open) setVoidTransaction(null); }}
        title="Confirm Void"
        description={`Are you sure you want to void transaction ${voidTransaction?.receiptNumber}? This action cannot be undone.`}
        onConfirm={() => {
          // Void placeholder - would call API
          setVoidTransaction(null);
        }}
        isPending={false}
        variant="destructive"
      />
    </div>
  );
}
