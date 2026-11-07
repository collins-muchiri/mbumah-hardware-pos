'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Wallet, Landmark, ArrowUpRight, ArrowDownRight, Search,
  Plus, Loader2, Building2, CheckCircle2, Clock,
  AlertCircle, ChevronLeft, ChevronRight, Phone,
  FileText, Banknote, RefreshCw, Eye, Minus, Flag, RotateCcw,
} from 'lucide-react';
import { LandingChip } from '@/components/landing-chip';

import { useAppStore } from '@/lib/stores';
import {
  bankingApi,
  formatKES, formatDate, formatDateTime,
  type BankReconciliationItem,
  type BankTransactionItem,
} from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BANK_MPESA_FILTERS, BANK_TYPE_FILTERS, parseInitialNamedMember } from '@/lib/tab-url';

// THE BANKING DESK'S OWN WORD (v2.387.0): the bank ledger's
// transaction-type lens answers the address bar. `?bank-type=DEPOSIT`
// lands the desk on its Transactions sub-tab, pre-filtered to the type
// the treasurer asked for — the ledger's daily question ("what moved
// through the accounts?") becomes a bookmark. The lens's words are the
// Select's OWN spellings since the desk first shipped (UPPERCASE: the
// payment word's voice), so an UPPERCASE word names a member and a
// lowercase `deposit` or a capitalized `Deposit` is an unknown word —
// never a clever match; the neutral is the lowercase `all`, exactly the
// Select's own. Anything missing or unknown answers 'all' (never
// stranded). The word is desk-prefixed per the Task 44 collision law: a
// desk-prefixed word can never leak across client-side tab switches —
// collision-checked at round start (grep-free tree-wide; `bank-type`
// appeared NOWHERE in the tree before this word, and the chip wears the
// family's FOURTH shade-split — sky one storey deeper at 300/100, the
// hue the delivery-notes desk spoke at the 200/50 storey; the desk's
// own badges speak blue, emerald, green, amber, red, orange, violet and
// slate, so the deeper sky borrows nothing from any badge).
// Read-on-mount ONLY (the one-writer law): the landing word is the
// LANDING lens, never rewritten; the Select and the chip's own
// dismissal own the state after.
// THE SUB-TAB AMENDMENT (the always-visible-face law's next case, after
// the collapsible-face amendment): the lens lives inside the desk's
// Transactions sub-tab — a top-level pane, but one the desk's inner
// navigation can hide. A landing that carries the word RAISES THE
// SUB-TAB IT LANDS INTO (the sub-tab's seed reads the same landed
// word), so the chip is visible on landing. Switching sub-tabs
// afterwards is the human's own navigation, not a lens change: the chip
// hides with the pane and returns when it reopens, the same honest
// remount semantics every desk already speaks across tab switches.
function initialBankType(): (typeof BANK_TYPE_FILTERS)[number] {
  if (typeof window === 'undefined') return 'all';
  return parseInitialNamedMember(window.location.search, 'bank-type', BANK_TYPE_FILTERS, 'all');
}
type BankTypeWordValue = (typeof BANK_TYPE_FILTERS)[number];

// THE M-PESA LEDGER'S OWN WORD (v2.388.0): the M-Pesa pane's status
// lens answers the address bar — the desk's SECOND word (the suppliers
// and transactions precedent). `?bank-mpesa=PENDING` lands the desk on
// its M-Pesa pane, pre-filtered to the statuses still waiting — the
// float's daily question becomes a bookmark. The lens's words are the
// Select's OWN spellings (UPPERCASE: PENDING | MATCHED | UNMATCHED |
// DISPUTED, the payment word's voice; a lowercase `pending` or a
// capitalized `Pending` is an unknown word — never a clever match; the
// neutral is the lowercase `all`, exactly the Select's own). Anything
// missing or unknown answers 'all' (never stranded). The word is
// desk-prefixed per the Task 44 collision law: `bank-mpesa` can never
// leak across client-side tab switches — collision-checked at round
// start (grep-free tree-wide; the byte appeared NOWHERE before this
// word, and the chip wears the family's FIFTH shade-split — purple one
// storey deeper at 300/100, the hue the catalog desk spoke at the
// 200/50 storey; the desk's badges speak blue, emerald, green, amber,
// red, orange, violet and slate, so the deeper purple borrows nothing).
// Read-on-mount ONLY (the one-writer law): the landing word is the
// LANDING lens, never rewritten; the Select and the chip's own
// dismissal own the state after.
// THE SUB-TAB AMENDMENT'S SECOND APPLICATION: the lens lives inside
// the desk's M-Pesa pane — a landing that carries the word RAISES THE
// PANE IT LANDS INTO (the pane's seed reads the same landed word), so
// the chip is visible on landing. THE TWO-WORD NEGOTIATION: when both
// of the desk's words land together, the M-PESA word wins the pane
// seed (the deeper pane raises); each chip waits honestly inside its
// own pane — hidden only until the human navigates to it, returning on
// the switch (the honest remount semantics every desk already speaks).
// Switching panes afterwards is the human's own navigation, not a
// lens change.
function initialMpesaStatus(): (typeof BANK_MPESA_FILTERS)[number] {
  if (typeof window === 'undefined') return 'all';
  return parseInitialNamedMember(window.location.search, 'bank-mpesa', BANK_MPESA_FILTERS, 'all');
}
type BankMpesaWordValue = (typeof BANK_MPESA_FILTERS)[number];

// Helpers

const ACCOUNT_TYPE_BADGE: Record<string, { label: string; color: string }> = {
  CHECKING: { label: 'Checking', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  SAVINGS: { label: 'Savings', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  MPESA: { label: 'M-Pesa', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  PETTY_CASH: { label: 'Petty Cash', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

const TX_TYPE_BADGE: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  DEPOSIT: { label: 'Deposit', icon: ArrowDownRight, color: 'text-emerald-700' },
  WITHDRAWAL: { label: 'Withdrawal', icon: ArrowUpRight, color: 'text-red-600' },
  TRANSFER: { label: 'Transfer', icon: RefreshCw, color: 'text-blue-600' },
  FEE: { label: 'Fee', icon: Minus, color: 'text-orange-600' },
  INTEREST: { label: 'Interest', icon: ArrowDownRight, color: 'text-violet-600' },
};

const RECON_STATUS_BADGE: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

const MPESA_STATUS_BADGE: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  MATCHED: { label: 'Matched', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  UNMATCHED: { label: 'Unmatched', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  DISPUTED: { label: 'Disputed', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
};

// v2.396.0 THE STATUSES FIND THEIR FEET: the row's EFFECTIVE status —
// the ledger's STORED vocabulary when it speaks one, the isReconciled
// derivation when it doesn't (legacy rows keep NULL; no row lies, and
// every word the lens offers, some row can now wear).
const effectiveMpesaStatus = (
  tx: Pick<BankTransactionItem, 'reconciliationStatus' | 'isReconciled'>,
): string => tx.reconciliationStatus ?? (tx.isReconciled ? 'MATCHED' : 'PENDING');

// Main Component

export default function BankingTab() {
  const storeId = useAppStore((s) => s.currentStoreId);
  const queryClient = useQueryClient();
  // v2.387.0 THE SUB-TAB AMENDMENT / v2.388.0 ITS SECOND APPLICATION: a
  // landing that carries either word RAISES the pane it lands into (the
  // pane's seed reads the same landed word); a landing with both words
  // raises the M-PESA pane (the deeper pane wins the seed); a landing
  // without either word opens the desk's default face (Accounts).
  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (initialMpesaStatus() !== 'all') return 'mpesa';
    return initialBankType() !== 'all' ? 'transactions' : 'accounts';
  });

  // Queries

  const accountsQuery = useQuery({
    queryKey: ['banking-accounts', storeId],
    queryFn: () => bankingApi.accounts.list({ storeId: storeId ?? undefined, limit: 100 }),
    enabled: !!storeId,
  });

  const transactionsQuery = useQuery({
    queryKey: ['banking-transactions', storeId],
    // v2.337.0 THE WAKING FIX: the ledger GET requires bankAccountId or
    // storeId (a 400 without one), and the desk sent NEITHER — the
    // Transactions sub-tab had been stuck on its empty state since it
    // shipped. The desk now speaks its store.
    queryFn: () => bankingApi.transactions.list({ storeId: storeId ?? undefined, limit: 100 }),
    enabled: !!storeId,
  });

  const reconciliationsQuery = useQuery({
    queryKey: ['banking-reconciliations', storeId],
    // v2.337.0 THE WAKING FIX (same lie, second room): the reconciliation
    // GET requires bankAccountId or storeId; the desk sent NEITHER — the
    // Reconciliations sub-tab never rendered a single card. Fixed the
    // same way, so the recon meter finally has bodies to speak for.
    queryFn: () => bankingApi.reconciliations.list({ storeId: storeId ?? undefined, limit: 100 }),
    enabled: !!storeId,
  });

  // M-Pesa reconciliations - we use transactions filtered by MPESA accounts;
  // v2.396.0 the lens's statuses gained a real write path (PATCH
  // /api/banking/transactions), so every word the Select offers is a
  // status a row can actually wear.
  const mpesaAccounts = useMemo(() => {
    const accounts = Array.isArray(accountsQuery.data?.data) ? accountsQuery.data.data : [];
    return accounts.filter((a) => a.accountType === 'MPESA');
  }, [accountsQuery.data]);

  // Computed Stats

  const accounts = Array.isArray(accountsQuery.data?.data) ? accountsQuery.data.data : [];
  const transactions = Array.isArray(transactionsQuery.data?.data) ? transactionsQuery.data.data : [];
  const reconciliations = Array.isArray(reconciliationsQuery.data?.data) ? reconciliationsQuery.data.data : [];

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.currentBalance, 0),
    [accounts],
  );

  const pendingRecons = useMemo(
    () => reconciliations.filter((r) => r.status === 'DRAFT' || r.status === 'IN_PROGRESS').length,
    [reconciliations],
  );

  const mpesaPending = useMemo(() => {
    // Count unreconciled M-Pesa transactions
    const mpesaAccIds = new Set(mpesaAccounts.map((a) => a.id));
    return transactions.filter(
      (t) => mpesaAccIds.has(t.bankAccountId) && !t.isReconciled,
    ).length;
  }, [transactions, mpesaAccounts]);

  // Balance Summary by Type

  const balanceByType = useMemo(() => {
    const map: Record<string, { count: number; balance: number }> = {};
    for (const a of accounts) {
      if (!map[a.accountType]) map[a.accountType] = { count: 0, balance: 0 };
      map[a.accountType].count += 1;
      map[a.accountType].balance += a.currentBalance;
    }
    return map;
  }, [accounts]);

  // Dialog States

  // Create Account Dialog
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branch: '',
    swiftCode: '',
    currency: 'KES',
    openingBalance: 0,
    accountType: 'CHECKING' as string,
  });

  // Create Transaction Dialog
  const [showCreateTx, setShowCreateTx] = useState(false);
  const [newTx, setNewTx] = useState({
    bankAccountId: '',
    transactionType: 'DEPOSIT' as string,
    amount: 0,
    reference: '',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  // Create Reconciliation Dialog
  const [showCreateRecon, setShowCreateRecon] = useState(false);
  const [newRecon, setNewRecon] = useState({
    bankAccountId: '',
    statementDate: new Date().toISOString().split('T')[0],
    statementBalance: 0,
    bookBalance: 0,
    notes: '',
  });

  // Approve Reconciliation Dialog
  const [showApproveRecon, setShowApproveRecon] = useState(false);
  const [reconToApprove, setReconToApprove] = useState<BankReconciliationItem | null>(null);

  // View Reconciliation Dialog
  const [showViewRecon, setShowViewRecon] = useState(false);
  const [reconToView, setReconToView] = useState<BankReconciliationItem | null>(null);

  // Transaction Filters

  const [txFilterAccount, setTxFilterAccount] = useState<string>('all');
  // v2.387.0 THE LANDING WORD — the type lens's seed reads `?bank-type=`
  // through the ONE home, cast-free: the generic parser answers the
  // vocabulary union, and the lens's state carries the SAME words the
  // Select speaks (its five SelectItems ARE the union — the state keeps
  // the Select's string voice, the parser guarantees the member).
  const [txFilterType, setTxFilterType] = useState<string>(initialBankType);
  // v2.387.0 — the address-bar word the desk answered at mount ('all'
  // when the landing carried no lens). The chip speaks it ONCE:
  // dismissed, hand-changed, or cleared, the landing is over and the
  // chip retires — an honest face never claims a landing that is done
  // (the inventory desk's three-voice law, worn in the lens's sky).
  const [landedBankType] = useState<BankTypeWordValue>(initialBankType);
  const [bankLandingLive, setBankLandingLive] = useState(true);

  // v2.387.0: a hand-driven change retires the landing word — the chip
  // speaks the ADDRESS BAR's landing, never the human's next choice
  // (and the ledger's page resets, the Select's own standing behavior).
  const chooseBankType = (value: string) => {
    setTxFilterType(value);
    setBankLandingLive(false);
    setTxPage(1);
  };
  const [txFilterReconciled, setTxFilterReconciled] = useState<string>('all');
  const [txFilterDateFrom, setTxFilterDateFrom] = useState('');
  const [txFilterDateTo, setTxFilterDateTo] = useState('');
  const [txSearch, setTxSearch] = useState('');

  // M-Pesa filters
  // v2.388.0 THE LANDING WORD — the status lens's seed reads
  // `?bank-mpesa=` through the ONE home, cast-free: the generic parser
  // answers the vocabulary union, and the lens's state carries the SAME
  // words the Select speaks (its four SelectItems ARE the union).
  const [mpesaFilterStatus, setMpesaFilterStatus] = useState<string>(initialMpesaStatus);
  // v2.388.0 — the address-bar word the desk answered at mount ('all'
  // when the landing carried no lens). The chip speaks it ONCE:
  // dismissed, hand-changed, or cleared, the landing is over and the
  // chip retires — an honest face never claims a landing that is done
  // (the inventory desk's three-voice law, worn in the lens's purple).
  const [landedMpesaStatus] = useState<BankMpesaWordValue>(initialMpesaStatus);
  const [mpesaLandingLive, setMpesaLandingLive] = useState(true);

  // v2.388.0: a hand-driven change retires the landing word — the chip
  // speaks the ADDRESS BAR's landing, never the human's next choice.
  const chooseMpesaStatus = (value: string) => {
    setMpesaFilterStatus(value);
    setMpesaLandingLive(false);
  };

  // Pagination
  const [txPage, setTxPage] = useState(1);
  const TX_PAGE_SIZE = 15;

  // Filtered Transactions

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];
    if (txFilterAccount !== 'all') list = list.filter((t) => t.bankAccountId === txFilterAccount);
    if (txFilterType !== 'all') list = list.filter((t) => t.transactionType === txFilterType);
    if (txFilterReconciled !== 'all') {
      const isRecon = txFilterReconciled === 'true';
      list = list.filter((t) => t.isReconciled === isRecon);
    }
    if (txFilterDateFrom) list = list.filter((t) => t.transactionDate >= txFilterDateFrom);
    if (txFilterDateTo) list = list.filter((t) => t.transactionDate <= txFilterDateTo);
    if (txSearch) {
      const s = txSearch.toLowerCase();
      list = list.filter(
        (t) =>
          t.reference?.toLowerCase().includes(s) ||
          t.description?.toLowerCase().includes(s) ||
          t.transactionType.toLowerCase().includes(s),
      );
    }
    list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    return list;
  }, [transactions, txFilterAccount, txFilterType, txFilterReconciled, txFilterDateFrom, txFilterDateTo, txSearch]);

  const txTotalPages = Math.max(1, Math.ceil(filteredTransactions.length / TX_PAGE_SIZE));
  const pagedTransactions = filteredTransactions.slice((txPage - 1) * TX_PAGE_SIZE, txPage * TX_PAGE_SIZE);

  // M-Pesa Data — the pane derives from the transactions on the store's
  // MPESA accounts (v2.436.0: the old "simulated" aside is retired — the
  // ledger stores its own vocabulary since v2.396.0, the derivation only
  // speaks for the legacy face).

  const mpesaTransactions = useMemo(() => {
    const mpesaAccIds = new Set(mpesaAccounts.map((a) => a.id));
    return transactions.filter((t) => mpesaAccIds.has(t.bankAccountId));
  }, [transactions, mpesaAccounts]);

  // v2.436.0 THE CENSUS STRIP — the five faces' counts derived from the
  // SAME stored vocabulary the rows speak, plus the legacy derived face
  // as its own bucket (a NULL status is a fact the four words must not
  // swallow). The four status chips press through the ONE door
  // (chooseMpesaStatus — the landing's retirement rides every
  // hand-driven change) with the active chip's second press answering
  // 'all'; the legacy face is a COUNT, never a lens word —
  // BANK_MPESA_FILTERS keeps its five members.
  const mpesaCensus = useMemo(() => {
    const counts = { MATCHED: 0, PENDING: 0, UNMATCHED: 0, DISPUTED: 0, LEGACY: 0 };
    for (const t of mpesaTransactions) {
      const bucket = t.reconciliationStatus && t.reconciliationStatus in counts
        ? t.reconciliationStatus
        : 'LEGACY';
      counts[bucket as keyof typeof counts] += 1;
    }
    return counts;
  }, [mpesaTransactions]);

  const filteredMpesa = useMemo(() => {
    let list = [...mpesaTransactions];
    // v2.396.0: the lens filters on the EFFECTIVE status — the ledger's
    // stored vocabulary when it speaks one, the isReconciled derivation
    // when it doesn't. No word answers an empty pile by construction.
    if (mpesaFilterStatus !== 'all') {
      list = list.filter((t) => effectiveMpesaStatus(t) === mpesaFilterStatus);
    }
    list.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    return list;
  }, [mpesaTransactions, mpesaFilterStatus]);

  // Running Balance Calculation for Transaction Dialog

  const selectedAccountForTx = useMemo(
    () => accounts.find((a) => a.id === newTx.bankAccountId),
    [accounts, newTx.bankAccountId],
  );

  const projectedBalance = useMemo(() => {
    if (!selectedAccountForTx) return 0;
    const amt = newTx.amount || 0;
    const isCredit = newTx.transactionType === 'DEPOSIT' || newTx.transactionType === 'INTEREST';
    return isCredit
      ? selectedAccountForTx.currentBalance + amt
      : selectedAccountForTx.currentBalance - amt;
  }, [selectedAccountForTx, newTx.amount, newTx.transactionType]);

  // Mutations

  const createAccountMut = useMutation({
    mutationFn: (data: Parameters<typeof bankingApi.accounts.create>[0]) =>
      bankingApi.accounts.create(data),
    onSuccess: () => {
      toast.success('Bank account created successfully');
      queryClient.invalidateQueries({ queryKey: ['banking-accounts'] });
      setShowCreateAccount(false);
      setNewAccount({
        bankName: '', accountName: '', accountNumber: '', branch: '',
        swiftCode: '', currency: 'KES', openingBalance: 0, accountType: 'CHECKING',
      });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create account'),
  });

  const createTxMut = useMutation({
    mutationFn: (data: Parameters<typeof bankingApi.transactions.create>[0]) =>
      bankingApi.transactions.create(data),
    onSuccess: () => {
      toast.success('Transaction recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['banking-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['banking-accounts'] });
      setShowCreateTx(false);
      setNewTx({
        bankAccountId: '', transactionType: 'DEPOSIT', amount: 0,
        reference: '', description: '', transactionDate: new Date().toISOString().split('T')[0],
      });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create transaction'),
  });

  const createReconMut = useMutation({
    mutationFn: (data: Parameters<typeof bankingApi.reconciliations.create>[0]) =>
      bankingApi.reconciliations.create(data),
    onSuccess: () => {
      toast.success('Reconciliation created successfully');
      queryClient.invalidateQueries({ queryKey: ['banking-reconciliations'] });
      setShowCreateRecon(false);
      setNewRecon({
        bankAccountId: '', statementDate: new Date().toISOString().split('T')[0],
        statementBalance: 0, bookBalance: 0, notes: '',
      });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create reconciliation'),
  });

  const approveReconMut = useMutation({
    mutationFn: async (recon: BankReconciliationItem) => {
      return bankingApi.reconciliations.create({
        bankAccountId: recon.bankAccountId,
        statementDate: recon.statementDate,
        statementBalance: recon.statementBalance,
        bookBalance: recon.bookBalance,
        notes: recon.notes ?? undefined,
      });
    },
    onSuccess: () => {
      toast.success('Reconciliation approved');
      queryClient.invalidateQueries({ queryKey: ['banking-reconciliations'] });
      setShowApproveRecon(false);
      setReconToApprove(null);
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to approve reconciliation'),
  });

  // v2.396.0: the reconciliation status write — the M-Pesa rows' own
  // actions (Dispute / Mark matched / Reopen). The route keeps
  // isReconciled coherent; the desk only invalidates and toasts.
  const mpesaStatusMut = useMutation({
    mutationFn: (vars: { transactionId: string; reconciliationStatus: string | null }) =>
      bankingApi.transactions.setStatus(vars),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['banking-transactions', storeId] });
      toast.success(
        vars.reconciliationStatus === 'DISPUTED'
          ? 'Transaction flagged for dispute.'
          : vars.reconciliationStatus === 'MATCHED'
            ? 'Transaction matched.'
            : vars.reconciliationStatus === 'UNMATCHED'
              ? 'Transaction set to unmatched.'
              : 'Transaction reopened — status re-derived.',
      );
    },
    onError: (err: Error) => toast.error(err.message || 'Could not set the reconciliation status'),
  });

  // Helper: get account name

  const getAccountName = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    return acc ? `${acc.bankName} - ${acc.accountName}` : accId;
  };

  // Render

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Banking</h2>
          <p className="text-sm text-muted-foreground">
            Bank accounts, transactions, reconciliations &amp; M-Pesa
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            title: 'Total Bank Balance',
            value: formatKES(totalBalance),
            icon: Wallet,
            color: 'text-emerald-700',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          },
          {
            title: 'Total Accounts',
            value: String(accounts.length),
            icon: Landmark,
            color: 'text-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-950/30',
          },
          {
            title: 'Pending Reconciliations',
            value: String(pendingRecons),
            icon: Clock,
            color: 'text-amber-700',
            bg: 'bg-amber-50 dark:bg-amber-950/30',
          },
          {
            title: 'M-Pesa Pending',
            value: String(mpesaPending),
            icon: Phone,
            color: 'text-green-700',
            bg: 'bg-green-50 dark:bg-green-950/30',
          },
        ].map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <p className="text-lg font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`rounded-full p-2.5 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Balance Summary by Type */}
      {Object.keys(balanceByType).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(balanceByType).map(([type, info]) => {
            const badge = ACCOUNT_TYPE_BADGE[type] ?? { label: type, color: 'bg-slate-100 text-slate-700' };
            return (
              <Card key={type}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${badge.color}`}>
                      {badge.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{info.count} account{info.count !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-sm font-semibold">{formatKES(info.balance)}</p>
                  <Progress
                    value={totalBalance > 0 ? (info.balance / totalBalance) * 100 : 0}
                    className="mt-1.5 h-1.5"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Inner Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="h-9">
          <TabsTrigger value="accounts" className="text-xs px-3">
            <Landmark className="mr-1.5 h-3.5 w-3.5" /> Accounts
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs px-3">
            <Banknote className="mr-1.5 h-3.5 w-3.5" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="reconciliations" className="text-xs px-3">
            <FileText className="mr-1.5 h-3.5 w-3.5" /> Reconciliations
          </TabsTrigger>
          <TabsTrigger value="mpesa" className="text-xs px-3">
            <Phone className="mr-1.5 h-3.5 w-3.5" /> M-Pesa
          </TabsTrigger>
        </TabsList>

        {/* ─── BANK ACCOUNTS TAB ──────────────────────────── */}
        <TabsContent value="accounts" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search accounts..." className="pl-9 h-9" readOnly />
              </div>
            </div>
            <Button size="sm" className="h-8" onClick={() => setShowCreateAccount(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> New Account
            </Button>
          </div>

          {accountsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Landmark className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No bank accounts yet</p>
                <Button size="sm" variant="outline" className="mt-3 h-8" onClick={() => setShowCreateAccount(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Create Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bank / Account</TableHead>
                    <TableHead>Account #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((acc) => {
                    const badge = ACCOUNT_TYPE_BADGE[acc.accountType] ?? { label: acc.accountType, color: 'bg-slate-100 text-slate-700' };
                    return (
                      <TableRow key={acc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="rounded-full p-1.5 bg-muted">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{acc.bankName}</p>
                              <p className="text-xs text-muted-foreground">{acc.accountName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-mono">{acc.accountNumber}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${badge.color}`}>
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{acc.currency}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatKES(acc.currentBalance)}
                        </TableCell>
                        <TableCell>
                          {acc.isActive ? (
                            <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* ─── TRANSACTIONS TAB ───────────────────────────── */}
        <TabsContent value="transactions" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reference, description..."
                className="pl-9 h-9"
                value={txSearch}
                onChange={(e) => { setTxSearch(e.target.value); setTxPage(1); }}
              />
            </div>
            <Select value={txFilterAccount} onValueChange={(v) => { setTxFilterAccount(v); setTxPage(1); }}>
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.bankName} - {a.accountName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* v2.387.0 THE LANDING CHIP — the address bar's word, spoken
                while the lens still shows the landing (the two retirement
                voices: the chip's own dismissal and a hand-driven Select
                change). `data-testid="bank-type-landing-word"` — the QA
                walk's handle. v2.394.0: the chip renders through the one
                LandingChip loom (the wardrobe lives in the loom's registry). */}
            {bankLandingLive && landedBankType !== 'all' && txFilterType === landedBankType && (
              <LandingChip
                hue="sky"
                label={`landed ?bank-type=${landedBankType}`}
                onDismiss={() => {
                  setTxFilterType('all');
                  setBankLandingLive(false);
                }}
                title="The desk landed with this filter from the address bar — press to clear it"
                data-testid="bank-type-landing-word"
              />
            )}
            <Select value={txFilterType} onValueChange={chooseBankType}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="DEPOSIT">Deposit</SelectItem>
                <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
                <SelectItem value="FEE">Fee</SelectItem>
                <SelectItem value="INTEREST">Interest</SelectItem>
              </SelectContent>
            </Select>
            <Select value={txFilterReconciled} onValueChange={(v) => { setTxFilterReconciled(v); setTxPage(1); }}>
              <SelectTrigger className="h-9 w-[130px] text-xs">
                <SelectValue placeholder="Reconciled" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Reconciled</SelectItem>
                <SelectItem value="false">Unreconciled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="h-9 w-[130px] text-xs"
              value={txFilterDateFrom}
              onChange={(e) => { setTxFilterDateFrom(e.target.value); setTxPage(1); }}
              placeholder="From"
            />
            <Input
              type="date"
              className="h-9 w-[130px] text-xs"
              value={txFilterDateTo}
              onChange={(e) => { setTxFilterDateTo(e.target.value); setTxPage(1); }}
              placeholder="To"
            />
            <Button size="sm" className="h-8" onClick={() => setShowCreateTx(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> New Transaction
            </Button>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {pagedTransactions.length} of {filteredTransactions.length} transactions
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="icon" className="h-7 w-7"
                disabled={txPage <= 1}
                onClick={() => setTxPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-1">
                {txPage}/{txTotalPages}
              </span>
              <Button
                variant="outline" size="icon" className="h-7 w-7"
                disabled={txPage >= txTotalPages}
                onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {transactionsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pagedTransactions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Banknote className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No transactions found</p>
                <Button size="sm" variant="outline" className="mt-3 h-8" onClick={() => setShowCreateTx(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Record Transaction
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                    <TableHead>Reconciled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedTransactions.map((tx) => {
                    const info = TX_TYPE_BADGE[tx.transactionType] ?? {
                      label: tx.transactionType, icon: Banknote, color: 'text-slate-600',
                    };
                    const IconComp = info.icon;
                    const isCredit = tx.transactionType === 'DEPOSIT' || tx.transactionType === 'INTEREST';
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">{formatDate(tx.transactionDate)}</TableCell>
                        <TableCell className="text-sm">{getAccountName(tx.bankAccountId)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <IconComp className={`h-3.5 w-3.5 ${info.color}`} />
                            <span className="text-xs">{info.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${isCredit ? 'text-emerald-700' : 'text-red-600'}`}>
                          {isCredit ? '+' : '-'}{formatKES(tx.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {tx.reference || '-'}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatKES(tx.balanceAfter)}
                        </TableCell>
                        <TableCell>
                          {tx.isReconciled ? (
                            <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Yes
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              <Clock className="mr-1 h-3 w-3" /> No
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* ─── RECONCILIATIONS TAB ────────────────────────── */}
        <TabsContent value="reconciliations" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {reconciliations.length} reconciliation{reconciliations.length !== 1 ? 's' : ''}
            </p>
            <Button size="sm" className="h-8" onClick={() => setShowCreateRecon(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> New Reconciliation
            </Button>
          </div>

          {reconciliationsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : reconciliations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No reconciliations yet</p>
                <Button size="sm" variant="outline" className="mt-3 h-8" onClick={() => setShowCreateRecon(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Create Reconciliation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {reconciliations.map((recon) => {
                const statusBadge = RECON_STATUS_BADGE[recon.status] ?? {
                  label: recon.status, color: 'bg-slate-100 text-slate-700',
                };
                const diff = recon.difference;
                const isZeroDiff = Math.abs(diff) < 0.01;
                // THE RECON METER (v2.337.0): divergence share against the
                // larger of the two balances; agreement is its complement —
                // a balanced sheet fills the bar fully emerald, a widening
                // gap turns it red and shrinks the fill.
                const denom = Math.max(Math.abs(recon.statementBalance), Math.abs(recon.bookBalance));
                const pctOfLarger = denom > 0 ? Math.min(100, (Math.abs(diff) / denom) * 100) : 0;
                const agreementPct = 100 - pctOfLarger;
                return (
                  <Card key={recon.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{getAccountName(recon.bankAccountId)}</p>
                            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${statusBadge.color}`}>
                              {statusBadge.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Statement Date: {formatDate(recon.statementDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => { setReconToView(recon); setShowViewRecon(true); }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {(recon.status === 'DRAFT' || recon.status === 'IN_PROGRESS' || recon.status === 'COMPLETED') && (
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 text-emerald-700"
                              onClick={() => { setReconToApprove(recon); setShowApproveRecon(true); }}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Statement</p>
                          <p className="text-sm font-semibold">{formatKES(recon.statementBalance)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Book</p>
                          <p className="text-sm font-semibold">{formatKES(recon.bookBalance)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Difference</p>
                          <p className={`text-sm font-semibold ${isZeroDiff ? 'text-emerald-700' : 'text-red-600'}`}>
                            {isZeroDiff ? '✓ Balanced' : formatKES(diff)}
                          </p>
                        </div>
                      </div>
                      {/* THE RECON METER (v2.337.0): the gap the desk already
                          computes, given a body — the bar fills by how far the
                          book sits from the statement, as a share of the larger
                          balance; a balanced sheet stays fully emerald. */}
                      <div className="mt-2.5">
                        <div
                          className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
                          role="progressbar"
                          aria-label="Reconciliation agreement"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(agreementPct)}
                          title={`Reconciliation gap: ${isZeroDiff ? 'none — the sheet is balanced' : `${formatKES(Math.abs(diff))} against the larger balance (${pctOfLarger.toFixed(1)}%)`}`}
                          data-testid="recon-diff-meter"
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isZeroDiff ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-red-600 dark:bg-red-500'}`}
                            style={{ width: `${agreementPct}%` }}
                          />
                        </div>
                        <p className={`mt-1 text-right text-[10px] tabular-nums ${isZeroDiff ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {agreementPct.toFixed(1)}% in step
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── M-PESA TAB ─────────────────────────────────── */}
        <TabsContent value="mpesa" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-1.5" data-testid="mpesa-census" role="group" aria-label="M-Pesa status census">
            {([
              ['MATCHED', mpesaCensus.MATCHED, 'bg-emerald-100 text-emerald-700', 'bg-emerald-600 text-white', 'Matched'],
              ['PENDING', mpesaCensus.PENDING, 'bg-amber-100 text-amber-700', 'bg-amber-600 text-white', 'Pending'],
              ['UNMATCHED', mpesaCensus.UNMATCHED, 'bg-red-100 text-red-700', 'bg-red-600 text-white', 'Unmatched'],
              ['DISPUTED', mpesaCensus.DISPUTED, 'bg-orange-100 text-orange-700', 'bg-orange-600 text-white', 'Disputed'],
            ] as const).map(([word, count, idleCls, activeCls, label]) => (
              <button
                key={word}
                type="button"
                data-testid={`mpesa-census-${word.toLowerCase()}`}
                aria-pressed={mpesaFilterStatus === word}
                title={`${label}: ${count} — press to wear the word, press again to return to all`}
                className={`rounded-full border border-transparent px-2 py-0.5 text-[10px] font-medium tabular-nums transition-colors ${
                  mpesaFilterStatus === word ? activeCls : `${idleCls} hover:opacity-80`
                }`}
                onClick={() => chooseMpesaStatus(mpesaFilterStatus === word ? 'all' : word)}
              >
                {label} · {count}
              </button>
            ))}
            <span
              data-testid="mpesa-census-legacy"
              title="Legacy rows — no stored status, the isReconciled derivation speaks for them; a count, never a lens word"
              className="rounded-full border border-transparent bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-medium tabular-nums dark:bg-slate-900/40 dark:text-slate-300"
            >
              Legacy · {mpesaCensus.LEGACY}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* v2.388.0 THE LANDING CHIP — the address bar's word, spoken
                while the lens still shows the landing (the two retirement
                voices: the chip's own dismissal and a hand-driven Select
                change). `data-testid="bank-mpesa-landing-word"` — the QA
                walk's handle. v2.394.0: the purple chip rides the same loom
                beside its sky sibling — one registry, ten hues, zero drift. */}
            {mpesaLandingLive && landedMpesaStatus !== 'all' && mpesaFilterStatus === landedMpesaStatus && (
              <LandingChip
                hue="purple"
                label={`landed ?bank-mpesa=${landedMpesaStatus}`}
                onDismiss={() => {
                  setMpesaFilterStatus('all');
                  setMpesaLandingLive(false);
                }}
                title="The desk landed with this filter from the address bar — press to clear it"
                data-testid="bank-mpesa-landing-word"
              />
            )}
            <Select value={mpesaFilterStatus} onValueChange={chooseMpesaStatus}>
              <SelectTrigger className="h-9 w-[150px] text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="MATCHED">Matched</SelectItem>
                <SelectItem value="UNMATCHED">Unmatched</SelectItem>
                <SelectItem value="DISPUTED">Disputed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {filteredMpesa.length} M-Pesa transaction{filteredMpesa.length !== 1 ? 's' : ''}
            </p>
          </div>

          {mpesaAccounts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Phone className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No M-Pesa accounts configured</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a bank account with type &ldquo;M-Pesa&rdquo; to start tracking
                </p>
                <Button size="sm" variant="outline" className="mt-3 h-8" onClick={() => { setActiveSubTab('accounts'); setShowCreateAccount(true); }}>
                  <Plus className="mr-1.5 h-4 w-4" /> Create M-Pesa Account
                </Button>
              </CardContent>
            </Card>
          ) : filteredMpesa.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Phone className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No M-Pesa transactions found</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance After</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMpesa.map((tx) => {
                    // v2.396.0: the row speaks its EFFECTIVE status — the
                    // stored vocabulary when the ledger has one, the
                    // isReconciled derivation when it doesn't.
                    const status = effectiveMpesaStatus(tx);
                    const badge = MPESA_STATUS_BADGE[status] ?? {
                      label: status, color: 'bg-slate-100 text-slate-700',
                    };
                    const isCredit = tx.transactionType === 'DEPOSIT' || tx.transactionType === 'INTEREST';
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm">{formatDate(tx.transactionDate)}</TableCell>
                        <TableCell className="text-sm">{getAccountName(tx.bankAccountId)}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {tx.reference || '-'}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${isCredit ? 'text-emerald-700' : 'text-red-600'}`}>
                          {isCredit ? '+' : '-'}{formatKES(tx.amount)}
                        </TableCell>
                        <TableCell className="text-right text-sm">{formatKES(tx.balanceAfter)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${badge.color}`}>
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {/* the statuses' own actions — quiet, row-scoped */}
                          {status === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-orange-700 dark:hover:text-orange-400"
                                data-testid="mpesa-row-dispute"
                                aria-label={`Dispute transaction ${tx.reference || tx.id}`}
                                title="Raise a dispute — the statement never matched this row"
                                disabled={mpesaStatusMut.isPending}
                                onClick={() => mpesaStatusMut.mutate({ transactionId: tx.id, reconciliationStatus: 'DISPUTED' })}
                              >
                                <Flag className="mr-1 h-3 w-3" />
                                Dispute
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
                                data-testid="mpesa-row-match"
                                aria-label={`Match transaction ${tx.reference || tx.id}`}
                                title="Mark matched — the statement line found its row"
                                disabled={mpesaStatusMut.isPending}
                                onClick={() => mpesaStatusMut.mutate({ transactionId: tx.id, reconciliationStatus: 'MATCHED' })}
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Match
                              </Button>
                            </>
                          )}
                          {(status === 'UNMATCHED' || status === 'DISPUTED') && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-amber-700 dark:hover:text-amber-400"
                                data-testid="mpesa-row-reopen"
                                aria-label={`Reopen transaction ${tx.reference || tx.id}`}
                                title="Reopen — return the row to the pending pile"
                                disabled={mpesaStatusMut.isPending}
                                onClick={() => mpesaStatusMut.mutate({ transactionId: tx.id, reconciliationStatus: null })}
                              >
                                <RotateCcw className="mr-1 h-3 w-3" />
                                Reopen
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400"
                                data-testid="mpesa-row-match"
                                aria-label={`Match transaction ${tx.reference || tx.id}`}
                                title="Mark matched — the statement line found its row"
                                disabled={mpesaStatusMut.isPending}
                                onClick={() => mpesaStatusMut.mutate({ transactionId: tx.id, reconciliationStatus: 'MATCHED' })}
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Match
                              </Button>
                            </>
                          )}
                          {status === 'MATCHED' && (
                            <span className="text-[10px] text-muted-foreground" data-testid="mpesa-row-settled">settled</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── CREATE ACCOUNT DIALOG ─────────────────────────── */}
      <Dialog open={showCreateAccount} onOpenChange={setShowCreateAccount}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Bank Account</DialogTitle>
            <DialogDescription>Add a new bank or M-Pesa account</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Bank Name *</Label>
                <Input
                  className="h-9"
                  placeholder="e.g. KCB Bank"
                  value={newAccount.bankName}
                  onChange={(e) => setNewAccount((p) => ({ ...p, bankName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Account Name *</Label>
                <Input
                  className="h-9"
                  placeholder="e.g. Main Operating"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount((p) => ({ ...p, accountName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Account Number *</Label>
                <Input
                  className="h-9"
                  placeholder="e.g. 1234567890"
                  value={newAccount.accountNumber}
                  onChange={(e) => setNewAccount((p) => ({ ...p, accountNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Account Type *</Label>
                <Select
                  value={newAccount.accountType}
                  onValueChange={(v) => setNewAccount((p) => ({ ...p, accountType: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHECKING">Checking</SelectItem>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                    <SelectItem value="MPESA">M-Pesa</SelectItem>
                    <SelectItem value="PETTY_CASH">Petty Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Branch</Label>
                <Input
                  className="h-9"
                  placeholder="e.g. Nairobi CBD"
                  value={newAccount.branch}
                  onChange={(e) => setNewAccount((p) => ({ ...p, branch: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">SWIFT Code</Label>
                <Input
                  className="h-9"
                  placeholder="e.g. KCABOROB"
                  value={newAccount.swiftCode}
                  onChange={(e) => setNewAccount((p) => ({ ...p, swiftCode: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Currency</Label>
                <Select
                  value={newAccount.currency}
                  onValueChange={(v) => setNewAccount((p) => ({ ...p, currency: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Opening Balance</Label>
              <Input
                type="number"
                className="h-9"
                value={newAccount.openingBalance || ''}
                onChange={(e) => setNewAccount((p) => ({ ...p, openingBalance: Number(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-9" onClick={() => setShowCreateAccount(false)}>Cancel</Button>
            <Button
              className="h-9"
              disabled={createAccountMut.isPending || !newAccount.bankName || !newAccount.accountName || !newAccount.accountNumber}
              onClick={() => {
                if (!storeId) return;
                createAccountMut.mutate({
                  storeId,
                  bankName: newAccount.bankName,
                  accountName: newAccount.accountName,
                  accountNumber: newAccount.accountNumber,
                  branch: newAccount.branch || undefined,
                  swiftCode: newAccount.swiftCode || undefined,
                  currency: newAccount.currency,
                  openingBalance: newAccount.openingBalance,
                  accountType: newAccount.accountType,
                });
              }}
            >
              {createAccountMut.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── CREATE TRANSACTION DIALOG ─────────────────────── */}
      <Dialog open={showCreateTx} onOpenChange={setShowCreateTx}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record Transaction</DialogTitle>
            <DialogDescription>Add a deposit, withdrawal, transfer, fee, or interest entry</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Account *</Label>
                <Select
                  value={newTx.bankAccountId}
                  onValueChange={(v) => setNewTx((p) => ({ ...p, bankAccountId: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter((a) => a.isActive).map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.bankName} - {a.accountName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Type *</Label>
                <Select
                  value={newTx.transactionType}
                  onValueChange={(v) => setNewTx((p) => ({ ...p, transactionType: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEPOSIT">Deposit</SelectItem>
                    <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                    <SelectItem value="FEE">Fee</SelectItem>
                    <SelectItem value="INTEREST">Interest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Amount *</Label>
                <Input
                  type="number"
                  className="h-9"
                  value={newTx.amount || ''}
                  onChange={(e) => setNewTx((p) => ({ ...p, amount: Number(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Date *</Label>
                <Input
                  type="date"
                  className="h-9"
                  value={newTx.transactionDate}
                  onChange={(e) => setNewTx((p) => ({ ...p, transactionDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Reference</Label>
              <Input
                className="h-9"
                placeholder="e.g. CHQ-001, MPESA-ABC123"
                value={newTx.reference}
                onChange={(e) => setNewTx((p) => ({ ...p, reference: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                className="min-h-[60px] text-sm"
                placeholder="Transaction details..."
                value={newTx.description}
                onChange={(e) => setNewTx((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            {/* Running Balance Preview */}
            {selectedAccountForTx && newTx.amount > 0 && (
              <div className="rounded-lg border p-3 bg-muted/30">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Running Balance Preview</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {formatKES(selectedAccountForTx.currentBalance)}
                  </span>
                  <span className="text-sm">
                    {(newTx.transactionType === 'DEPOSIT' || newTx.transactionType === 'INTEREST') ? (
                      <span className="text-emerald-700">+{formatKES(newTx.amount)}</span>
                    ) : (
                      <span className="text-red-600">-{formatKES(newTx.amount)}</span>
                    )}
                  </span>
                  <span className="text-sm font-semibold">= {formatKES(projectedBalance)}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-9" onClick={() => setShowCreateTx(false)}>Cancel</Button>
            <Button
              className="h-9"
              disabled={createTxMut.isPending || !newTx.bankAccountId || !newTx.amount}
              onClick={() => {
                createTxMut.mutate({
                  bankAccountId: newTx.bankAccountId,
                  transactionType: newTx.transactionType,
                  amount: newTx.amount,
                  reference: newTx.reference || undefined,
                  description: newTx.description || undefined,
                  transactionDate: newTx.transactionDate,
                });
              }}
            >
              {createTxMut.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Record Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── CREATE RECONCILIATION DIALOG ──────────────────── */}
      <Dialog open={showCreateRecon} onOpenChange={setShowCreateRecon}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Reconciliation</DialogTitle>
            <DialogDescription>Start a new bank reconciliation</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">Account *</Label>
              <Select
                value={newRecon.bankAccountId}
                onValueChange={(v) => {
                  const acc = accounts.find((a) => a.id === v);
                  setNewRecon((p) => ({
                    ...p,
                    bankAccountId: v,
                    bookBalance: acc?.currentBalance ?? 0,
                  }));
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.filter((a) => a.isActive).map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.bankName} - {a.accountName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Statement Date *</Label>
                <Input
                  type="date"
                  className="h-9"
                  value={newRecon.statementDate}
                  onChange={(e) => setNewRecon((p) => ({ ...p, statementDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Statement Balance *</Label>
                <Input
                  type="number"
                  className="h-9"
                  value={newRecon.statementBalance || ''}
                  onChange={(e) => setNewRecon((p) => ({ ...p, statementBalance: Number(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Book Balance</Label>
              <Input
                type="number"
                className="h-9"
                value={newRecon.bookBalance || ''}
                onChange={(e) => setNewRecon((p) => ({ ...p, bookBalance: Number(e.target.value) || 0 }))}
              />
            </div>
            {/* Difference Preview */}
            {newRecon.statementBalance > 0 && (
              <div className="rounded-lg border p-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Difference</span>
                  <span className={`text-sm font-semibold ${Math.abs(newRecon.statementBalance - newRecon.bookBalance) < 0.01 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {formatKES(newRecon.statementBalance - newRecon.bookBalance)}
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs">Notes</Label>
              <Textarea
                className="min-h-[60px] text-sm"
                placeholder="Reconciliation notes..."
                value={newRecon.notes}
                onChange={(e) => setNewRecon((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-9" onClick={() => setShowCreateRecon(false)}>Cancel</Button>
            <Button
              className="h-9"
              disabled={createReconMut.isPending || !newRecon.bankAccountId || !newRecon.statementDate}
              onClick={() => {
                createReconMut.mutate({
                  bankAccountId: newRecon.bankAccountId,
                  statementDate: newRecon.statementDate,
                  statementBalance: newRecon.statementBalance,
                  bookBalance: newRecon.bookBalance,
                  notes: newRecon.notes || undefined,
                });
              }}
            >
              {createReconMut.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Create Reconciliation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── APPROVE RECONCILIATION DIALOG ─────────────────── */}
      <Dialog open={showApproveRecon} onOpenChange={setShowApproveRecon}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Approve Reconciliation</DialogTitle>
            <DialogDescription>Confirm approval of this reconciliation</DialogDescription>
          </DialogHeader>
          {reconToApprove && (
            <div className="space-y-3 py-4">
              <div className="rounded-lg border p-3 bg-muted/30 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-medium">{getAccountName(reconToApprove.bankAccountId)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Statement Date</span>
                  <span>{formatDate(reconToApprove.statementDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Statement Balance</span>
                  <span className="font-semibold">{formatKES(reconToApprove.statementBalance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Book Balance</span>
                  <span className="font-semibold">{formatKES(reconToApprove.bookBalance)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Difference</span>
                  <span className={`font-semibold ${Math.abs(reconToApprove.difference) < 0.01 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {formatKES(reconToApprove.difference)}
                  </span>
                </div>
              </div>
              {Math.abs(reconToApprove.difference) >= 0.01 && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    This reconciliation has a difference of {formatKES(reconToApprove.difference)}. Approving may indicate unresolved items.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="h-9" onClick={() => setShowApproveRecon(false)}>Cancel</Button>
            <Button
              className="h-9 bg-emerald-700 hover:bg-emerald-800"
              disabled={approveReconMut.isPending}
              onClick={() => {
                if (reconToApprove) approveReconMut.mutate(reconToApprove);
              }}
            >
              {approveReconMut.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── VIEW RECONCILIATION DIALOG ────────────────────── */}
      <Dialog open={showViewRecon} onOpenChange={setShowViewRecon}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Reconciliation Details</DialogTitle>
            <DialogDescription>View reconciliation information</DialogDescription>
          </DialogHeader>
          {reconToView && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Account</p>
                  <p className="text-sm font-medium mt-0.5">{getAccountName(reconToView.bankAccountId)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Statement Date</p>
                  <p className="text-sm font-medium mt-0.5">{formatDate(reconToView.statementDate)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 mt-0.5 ${RECON_STATUS_BADGE[reconToView.status]?.color ?? ''}`}
                  >
                    {RECON_STATUS_BADGE[reconToView.status]?.label ?? reconToView.status}
                  </Badge>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Created</p>
                  <p className="text-sm mt-0.5">{formatDateTime(reconToView.createdAt)}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Statement</p>
                  <p className="text-sm font-semibold mt-1">{formatKES(reconToView.statementBalance)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Book</p>
                  <p className="text-sm font-semibold mt-1">{formatKES(reconToView.bookBalance)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Difference</p>
                  <p className={`text-sm font-semibold mt-1 ${Math.abs(reconToView.difference) < 0.01 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {Math.abs(reconToView.difference) < 0.01 ? '✓ Balanced' : formatKES(reconToView.difference)}
                  </p>
                </div>
              </div>
              {reconToView.notes && (
                <>
                  <Separator />
                  <div className="rounded-lg border p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                    <p className="text-sm">{reconToView.notes}</p>
                  </div>
                </>
              )}
              {/* v2.412.0: the old approver line is gone — it read a field
                  the wire never carried (the BankReconciliation model has
                  no approver column), so the branch was unreachable dead
                  UI the compiler finally caught. The recon's status badge
                  above is the honest approval voice. */}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="h-9" onClick={() => setShowViewRecon(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
