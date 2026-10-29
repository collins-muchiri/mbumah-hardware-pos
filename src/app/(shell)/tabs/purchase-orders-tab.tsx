'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ClipboardList, Search, Plus, Eye, Loader2, X,
  Package, CalendarDays, Filter, ArrowUpDown,
  FileText, Clock, CheckCircle2, Circle, AlertTriangle,
  Truck, ChevronLeft, Trash2, Send, Ban,
  MoreHorizontal,
  PackageCheck, PackageX, ShieldCheck, Stamp,
  Receipt, ShoppingBag, DollarSign,
  ArrowUpRight,
} from 'lucide-react';

import { useAppStore } from '@/lib/stores';
import { useAuthStore } from '@/lib/stores';
import { useVatRate } from '@/hooks/use-vat-rate';
import {
  purchaseOrdersApi, suppliersApi, productsApi, authorizedFetchJson,
  formatKES, formatDate,
  type PurchaseOrderListItem,
  type SupplierItem,
  type ProductListItem,
} from '@/lib/api';
import { handleError } from '@/lib/error-handler';
// v2.251.0 THE WALK'S WHEN — the detail strip's cadence chip wears the
// census's own four houses (one home, byte-identical classes to the
// org drill's chip).
import { bandHouse, chipLabel, daysVoice, type CadenceBand } from '@/lib/cadence-band';
// v2.256.0 THE LENS'S EAR — Escape stands the lens down (the one home;
// the dialog guard lives in the hook, never a copy).
import { useLensEscape } from '@/lib/use-lens-escape';
// v2.259.0 THE BRANCH'S INSTRUMENTS — the metrics' one home: the branch
// roster's rail reads the SAME predicates the supplier detail's card and
// roster speak (a tile's % and its drill count cannot disagree — one rule,
// one home). The door imports the org's own drill (the sheet drill wears
// its Escape rung already — v2.257.0, one home).
import {
  poMetricPredicate,
  poMetricVoice,
  poMetricEmptyVoice,
  poMetricFamily,
  type PoMetricLens,
} from '@/lib/po-metrics';
import { SheetDrill, type SheetDrillTarget } from '@/components/org/sheet-drill';

// v2.254.0 THE BRANCH'S LENS — the row's own band, read from above: the
// family the wire's spoke wore, or the silent absence (a hand-raised
// order, a failed read). The cast stays behind a membership check — a
// string that is not one of the four houses IS the silence, never a
// guessed family. Module-level: the memos read it clean (no deps).
const poRowBand = (po: PurchaseOrderListItem): CadenceBand | null => {
  const b = po.originStockTake?.walkAisle?.band;
  return b === 'fresh' || b === 'stale' || b === 'beyond' || b === 'never' ? b : null;
};
import { formatQty, formatQtyWithUnit } from '@/lib/utils/financialMath';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';

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
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Constants

const PO_STATUSES = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'SENT',
  'CONFIRMED',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED',
] as const;

// v2.8.0: VAT rate is admin-controlled (no longer hardcoded). The preview in
// CreatePODialog reads the live rate via useVatRate(); the server applies the
// same authoritative rate when the PO is created.

const STATUS_FLOW: string[] = [
  'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED',
];

// Helper: status badge styling

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300';
    case 'PENDING_APPROVAL':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    case 'SENT':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300';
    case 'CONFIRMED':
      return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300';
    case 'PARTIALLY_RECEIVED':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
    case 'RECEIVED':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'DRAFT': return <FileText className="h-3 w-3" />;
    case 'PENDING_APPROVAL': return <Clock className="h-3 w-3" />;
    case 'APPROVED': return <ShieldCheck className="h-3 w-3" />;
    case 'SENT': return <Send className="h-3 w-3" />;
    case 'CONFIRMED': return <Stamp className="h-3 w-3" />;
    case 'PARTIALLY_RECEIVED': return <PackageCheck className="h-3 w-3" />;
    case 'RECEIVED': return <CheckCircle2 className="h-3 w-3" />;
    case 'CANCELLED': return <Ban className="h-3 w-3" />;
    default: return <Circle className="h-3 w-3" />;
  }
}

function formatStatusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

// Sub-components

function POStatusTimeline({ status }: { status: string }) {
  const isCancelled = status === 'CANCELLED';

  const getStepStatus = (step: string): 'completed' | 'current' | 'upcoming' => {
    if (isCancelled) return 'upcoming';
    const stepIdx = STATUS_FLOW.indexOf(step);
    const currentIdx = STATUS_FLOW.indexOf(status);
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  const displaySteps = STATUS_FLOW.filter(
    (s) => s !== 'PARTIALLY_RECEIVED' || status === 'PARTIALLY_RECEIVED'
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-0">
        {displaySteps.map((step, i) => {
          const stepStatus = getStepStatus(step);
          return (
            <React.Fragment key={step}>
              {i > 0 && (
                <div className="flex-1 h-0.5 mx-0.5">
                  <div
                    className={`h-full rounded-full transition-colors ${
                      stepStatus === 'completed' ? 'bg-green-400' : 'bg-muted-foreground/20'
                    }`}
                  />
                </div>
              )}
              <div className="flex flex-col items-center shrink-0" title={formatStatusLabel(step)}>
                {stepStatus === 'current' ? (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                ) : stepStatus === 'completed' ? (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/25 flex items-center justify-center">
                    <Circle className="w-3 h-3 text-muted-foreground/30" />
                  </div>
                )}
                <span
                  className={`text-[9px] mt-1 whitespace-nowrap ${
                    stepStatus === 'current'
                      ? 'text-primary font-bold'
                      : stepStatus === 'completed'
                        ? 'text-green-700 font-medium'
                        : 'text-muted-foreground/40'
                  }`}
                >
                  {formatStatusLabel(step)}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {isCancelled && (
        <div className="flex items-center justify-center mt-3">
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 gap-1">
            <Ban className="h-3 w-3" /> CANCELLED
          </Badge>
        </div>
      )}
    </div>
  );
}

// Create PO Dialog

// v2.248.0 THE RESTOCK'S BIRTH SHEET — the shape the pre-pick reads off
// the sheet detail wire (GET /api/stock-takes/[id]): the status voice, the
// aisle's name when the sheet wore one, and the lines (productId + the
// variance + the line's own BOOK COST — the wire's gated cost voice; a
// viewer without inventory.view.cost reads null and fills the shillings
// by hand — the units are the truth, the cost follows the gate). Numbers
// may ride as strings (Decimal.read on sqlite) — the pre-pick Number()s
// everything it sums.
interface RestockBirthSheet {
  id?: string;
  status?: string;
  walkAisle?: { name?: string | null } | null;
  lines?: Array<{
    productId?: string;
    variance?: number | string | null;
    bookCost?: number | string | null;
  }> | null;
}

function CreatePODialog({
  open,
  onOpenChange,
  storeId,
  restockSheetId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  // v2.248.0 THE RESTOCK'S BIRTH — the sheet id the drill's restock door
  // named (?restockFrom=, read one time by the tab). When present and the
  // dialog opens, the sheet's shrinkage lines PRE-PICK themselves (qty =
  // the units the shelf lost, cost = the product's own cost price) and the
  // created PO carries originStockTakeId — the violet birth, for life.
  restockSheetId?: string | null;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  // v2.8.0: admin-controlled VAT rate for the live preview.
  const { vatRate } = useVatRate();

  const [supplierId, setSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [poItems, setPoItems] = useState<
    { productId: string; name: string; sku: string; quantity: string; unitCost: string; currentStock: number }[]
  >([]);
  const [productSearch, setProductSearch] = useState('');
  const [lowStockLoading, setLowStockLoading] = useState(false);
  // v2.248.0: the birth's reading — the sheet's own truth for the provenance
  // strip (its aisle when it wore one, the units it found gone), plus the
  // pre-pick's loading/error faces. THE SILENCE LAW: a sheet that refused
  // to open (a dead id, a cross-store guess) sets restockError — the strip
  // speaks the refusal, never a fake birth.
  const [restockVoice, setRestockVoice] = useState<{ aisle: string | null; units: number; lines: number } | null>(null);
  const [restockLoading, setRestockLoading] = useState(false);
  const [restockError, setRestockError] = useState<string | null>(null);

  // Fetch active suppliers
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-list', storeId],
    queryFn: () => suppliersApi.list({ storeId, isActive: 'true', limit: 200 }),
    enabled: open,
  });
  const suppliers: SupplierItem[] = Array.isArray(suppliersData?.data) ? suppliersData.data : [];

  // Product search
  const { data: productSearchData, isLoading: productSearchLoading } = useQuery({
    queryKey: ['po-product-search', storeId, productSearch],
    queryFn: () => productsApi.search(productSearch, storeId),
    enabled: open && productSearch.length >= 2,
  });
  const searchResults: ProductListItem[] = Array.isArray(productSearchData?.data)
    ? productSearchData.data
    : [];

  const addProductFromSearch = (product: ProductListItem) => {
    if (poItems.find((i) => i.productId === product.id)) {
      toast.error('Product already added');
      return;
    }
    setPoItems([
      ...poItems,
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        quantity: '1',
        // v2.250.0: the products wire's own gate rides here — a
        // cost-blind pen starts EMPTY (the user's own typed truth),
        // never the string "null".
        unitCost: product.costPrice != null ? String(product.costPrice) : '',
        currentStock: product.quantityInStock,
      },
    ]);
    setProductSearch('');
  };

  const addLowStockItems = async () => {
    setLowStockLoading(true);
    try {
      const res = await productsApi.list({ storeId, limit: 200 });
      const allProducts: ProductListItem[] = Array.isArray(res?.data) ? res.data : [];
      const lowStockProducts = allProducts.filter(
        (p) => p.isActive && p.quantityInStock <= p.reorderLevel && !poItems.find((i) => i.productId === p.id)
      );
      if (lowStockProducts.length === 0) {
        toast.info('No low-stock products found');
        return;
      }
      const newItems = lowStockProducts.map((p) => ({
        productId: p.id,
        name: p.name,
        sku: p.sku,
        quantity: String(Math.max(Math.ceil(p.reorderLevel * 2 - p.quantityInStock), 1)),
        // v2.250.0: the empty pen past the gate (never the "null" string).
        unitCost: p.costPrice != null ? String(p.costPrice) : '',
        currentStock: p.quantityInStock,
      }));
      setPoItems([...poItems, ...newItems]);
      toast.success(`Added ${newItems.length} low-stock item${newItems.length > 1 ? 's' : ''}`);
    } catch (_err) {
      toast.error('Failed to load low-stock products');
    } finally {
      setLowStockLoading(false);
    }
  };

  const removeItem = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  // v2.248.0 THE RESTOCK'S PRE-PICK — one fetch of the sheet the door
  // named (the SAME wire the branch stock-take face reads), then the
  // shrinkage lines pre-pick themselves: qty = the units the shelf lost
  // (|variance|), cost = the line's own gated BOOK COST (the wire's voice —
  // null past the cost gate, the pen fills it by hand).
  // THE SHAPE LAWS: only NEGATIVE lines (a surplus needs no restock —
  // the shelf held more than the books said); a line the floor never
  // counted stays silent (variance null); the products the sheet's
  // wire no longer joins (a since-deleted product) are skipped, never
  // guessed. A sheet that refuses to open or is not CLOSED sets the
  // strip's refusal — the user can still build the PO by hand; the
  // birth is NOT stored unless the sheet was real (the wire re-checks).
  useEffect(() => {
    if (!open || !restockSheetId) return;
    let cancelled = false;
    setRestockLoading(true);
    setRestockError(null);
    setRestockVoice(null);
    (async () => {
      try {
        const res = await authorizedFetchJson(`/api/stock-takes/${encodeURIComponent(restockSheetId)}`);
        if (cancelled) return;
        if (!res.ok || !res.json?.success) {
          setRestockError('the sheet refused to open — build the restock by hand; the birth stays off the record.');
          return;
        }
        const sheet = res.json.data as RestockBirthSheet | null;
        if (!sheet) {
          setRestockError('the sheet refused to open — build the restock by hand; the birth stays off the record.');
          return;
        }
        if (sheet.status !== 'CLOSED') {
          setRestockError('this sheet is not CLOSED yet — the books have not heard it; the birth stays off the record.');
          return;
        }
        const lines = Array.isArray(sheet.lines) ? sheet.lines : [];
        const picks: { productId: string; name: string; sku: string; quantity: string; unitCost: string; currentStock: number }[] = [];
        let units = 0;
        for (const l of lines) {
          const variance = l?.variance == null ? null : Number(l.variance);
          if (variance == null || !Number.isFinite(variance) || variance >= 0) continue;
          if (!l?.productId) continue;
          const lost = Math.abs(variance);
          units += lost;
          picks.push({
            productId: l.productId,
            name: l.name || 'Unknown product',
            sku: l.sku || '',
            quantity: String(Math.round(lost)),
            // v2.248.0 THE COST GATE: the wire's bookCost is the line's own
            // gated voice — null past inventory.view.cost, and the input
            // stays empty for the pen (the units are the truth; the
            // shillings follow the gate, never a guessed zero).
            unitCost: l.bookCost != null ? String(l.bookCost) : '0',
            currentStock: 0,
          });
        }
        if (picks.length > 0) setPoItems(picks);
        setRestockVoice({ aisle: sheet.walkAisle?.name ?? null, units: Math.round(units), lines: picks.length });
      } catch {
        if (!cancelled) setRestockError('the sheet refused to open — build the restock by hand; the birth stays off the record.');
      } finally {
        if (!cancelled) setRestockLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, restockSheetId]);

  const updateItem = (index: number, field: 'quantity' | 'unitCost', value: string) => {
    const updated = [...poItems];
    updated[index] = { ...updated[index], [field]: value };
    setPoItems(updated);
  };

  const subTotal = poItems.reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0),
    0
  );
  const taxAmount = subTotal * (vatRate / 100);
  const totalAmount = subTotal + taxAmount;

  const createMutation = useMutation({
    mutationFn: () =>
      purchaseOrdersApi.create({
        storeId,
        supplierId,
        expectedDate: expectedDate || undefined,
        notes: notes || undefined,
        createdById: user?.id || undefined,
        // v2.248.0: the birth rides the named sheet (the wire re-validates:
        // same store + CLOSED — the only births it ever stores).
        originStockTakeId: restockSheetId || undefined,
        items: poItems
          .filter((item) => item.productId && parseFloat(item.quantity) > 0)
          .map((item) => ({
            productId: item.productId,
            quantity: parseFloat(item.quantity),
            unitCost: parseFloat(item.unitCost),
          })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase order created successfully');
      onOpenChange(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const msg = handleError(err, 'Create purchase order');
      toast.error(msg);
    },
  });

  const resetForm = () => {
    setSupplierId('');
    setExpectedDate('');
    setNotes('');
    setPoItems([]);
    setProductSearch('');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Create Purchase Order"
      description="Create a new purchase order for a supplier"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!supplierId || poItems.length === 0 || createMutation.isPending}
          >
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create PO
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* v2.248.0 THE BIRTH STRIP — the violet door family's reading: the
            dialog says WHICH sheet this restock answers, what its walk
            found gone, and (when the sheet wore one) the aisle's address.
            The loading and refusal faces live here too — a sheet that
            refuses to open speaks its refusal; the birth stays off the
            record (the wire re-checks everything this strip claims). */}
        {restockSheetId && (
          <div
            data-testid="po-restock-provenance"
            aria-label={restockError
              ? 'the birth sheet refused to open — the restock builds by hand'
              : restockVoice
                ? `born at count sheet ${restockSheetId}${restockVoice.aisle ? `, the walk order named ${restockVoice.aisle}` : ''} — ${restockVoice.units} units the shelf lost, ${restockVoice.lines} ${restockVoice.lines === 1 ? 'line' : 'lines'} pre-picked.`
                : 'reading the birth sheet'}
            className="rounded-lg border border-violet-200 bg-violet-50/60 px-2.5 py-2 text-[11px] text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200"
          >
            {restockLoading ? (
              <p className="flex items-center gap-1.5 font-medium">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                reading the birth sheet…
              </p>
            ) : restockError ? (
              <p data-testid="po-restock-provenance-error" className="font-medium text-red-700 dark:text-red-300">
                {restockError}
              </p>
            ) : restockVoice ? (
              <>
                <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                  <PackageCheck className="h-3 w-3" aria-hidden="true" />
                  born at a count sheet
                </p>
                <p className="mt-0.5 font-medium">
                  restocking what the walk found gone{restockVoice.aisle ? ` — the walk order named ${restockVoice.aisle}` : ''}: {restockVoice.units} unit{restockVoice.units === 1 ? '' : 's'} on {restockVoice.lines} line{restockVoice.lines === 1 ? '' : 's'}, pre-picked below.
                </p>
              </>
            ) : null}
          </div>
        )}

        {/* Supplier & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Supplier *</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers
                  .filter((s) => s.isActive)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Expected Delivery Date</Label>
            <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
          </div>
        </div>

        <Separator />

        {/* Product Search */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Add Products</Label>
            <Button type="button" variant="outline" size="sm" onClick={addLowStockItems} disabled={lowStockLoading}>
              {lowStockLoading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-700" />
              )}
              Add Low Stock Items
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-9"
              placeholder="Search products by name or SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>
          {productSearch.length >= 2 && (
            <div className="border rounded-md max-h-48 overflow-y-auto bg-background shadow-sm">
              {productSearchLoading ? (
                <div className="p-3 text-center">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-center text-xs text-muted-foreground">No products found</div>
              ) : (
                searchResults
                  .filter((p) => !poItems.find((i) => i.productId === p.id))
                  .slice(0, 10)
                  .map((product) => (
                    <button
                      key={product.id}
                      className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors flex items-center justify-between"
                      onClick={() => addProductFromSearch(product)}
                    >
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {/* v2.250.0: the picker's stock line — the book cost speaks
                        only when the products wire carried it; a cost-blind
                        viewer reads the units alone, never "KES null". */}
                        Stock: {product.quantityInStock}
                        {product.costPrice != null && <> &middot; {formatKES(product.costPrice)}</>}
                      </div>
                    </button>
                  ))
              )}
            </div>
          )}
        </div>

        {/* Items List */}
        {poItems.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Order Items ({poItems.length}) &middot; Total Qty:{' '}
              {poItems.reduce((s, i) => s + (parseFloat(i.quantity) || 0), 0)}
            </p>
            <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
              {poItems.map((item, index) => (
                <div key={item.productId || index} className="flex items-center gap-3 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {item.sku}
                      {item.currentStock !== undefined && (
                        <span className="ml-2 text-amber-700">
                          <Package className="h-3 w-3 inline mr-0.5" />
                          {item.currentStock} in stock
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16">
                      <Label className="text-[10px] text-muted-foreground">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="h-7 text-xs text-center"
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-[10px] text-muted-foreground">Unit Cost</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitCost}
                        onChange={(e) => updateItem(index, 'unitCost', e.target.value)}
                        className="h-7 text-xs text-center"
                      />
                    </div>
                    <div className="text-right w-20">
                      <Label className="text-[10px] text-muted-foreground">Total</Label>
                      <p className="text-xs font-medium">
                        {formatKES((parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0))}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                      onClick={() => removeItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          productSearch.length < 2 && (
            <div className="text-center py-6 text-muted-foreground border rounded-md border-dashed">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Search for products above or add low-stock items</p>
            </div>
          )
        )}

        {/* Totals */}
        {poItems.length > 0 && (
          <div className="space-y-1.5 p-3 bg-muted/30 rounded-lg border text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatKES(subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT ({vatRate}%)</span>
              <span className="font-medium">{formatKES(taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{formatKES(totalAmount)}</span>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Order notes..."
            rows={2}
          />
        </div>
      </div>
    </ResponsiveDialog>
  );
}

// Receive Items Dialog

function ReceiveItemsDialog({
  open,
  onOpenChange,
  purchaseOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrderListItem | null;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [receivedQtys, setReceivedQtys] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (purchaseOrder?.items && open) {
      const initial: Record<string, string> = {};
      purchaseOrder.items.forEach((item) => {
        const remaining = item.quantity - item.receivedQty;
        initial[item.id] = remaining > 0 ? String(remaining) : '0';
      });
      setReceivedQtys(initial);
      setError(null);
    }
  }, [purchaseOrder, open]);

  const receiveMutation = useMutation({
    mutationFn: () => {
      if (!purchaseOrder) throw new Error('No PO selected');
      const receivedItems = Object.entries(receivedQtys)
        .filter(([, qty]) => parseFloat(qty) > 0)
        .map(([itemId, qty]) => ({ itemId, receivedQty: parseFloat(qty) }));
      if (receivedItems.length === 0) throw new Error('No items to receive');
      return purchaseOrdersApi.receiveItems(
        purchaseOrder.id,
        receivedItems,
        user?.id || undefined
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-detail'] });
      toast.success('Items received and stock updated');
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const msg = handleError(err, 'Receive PO items');
      toast.error(msg);
    },
  });

  const validateAndSubmit = () => {
    if (!purchaseOrder?.items) return;
    setError(null);

    for (const item of purchaseOrder.items) {
      const qty = parseFloat(receivedQtys[item.id] || '0');
      const remaining = item.quantity - item.receivedQty;
      if (qty > remaining) {
        setError(`Cannot receive more than remaining quantity for ${item.productName || 'item'}`);
        return;
      }
      if (qty < 0) {
        setError(`Quantity cannot be negative for ${item.productName || 'item'}`);
        return;
      }
    }

    receiveMutation.mutate();
  };

  if (!purchaseOrder?.items) return null;

  const totalBeingReceived = Object.values(receivedQtys).reduce(
    (sum, qty) => sum + (parseFloat(qty) || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-emerald-700" />
            Receive Items - {purchaseOrder.poNumber}
          </DialogTitle>
          <DialogDescription>
            Enter quantities received for each item. Stock will be updated automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {purchaseOrder.items.map((item) => {
            const remaining = item.quantity - item.receivedQty;
            const product = item.product;
            const currentVal = parseFloat(receivedQtys[item.id] || '0');
            const isOver = currentVal > remaining;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 border rounded-lg p-3 transition-colors ${
                  isOver ? 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product?.name || item.productName || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">
                    <span>Ordered: {formatQtyWithUnit(item.quantity, product?.unitType)}</span>
                    <span className="mx-1">&middot;</span>
                    <span>Received: {formatQtyWithUnit(item.receivedQty, product?.unitType)}</span>
                    <span className="mx-1">&middot;</span>
                    <span className={remaining > 0 ? 'text-amber-700 font-medium' : 'text-green-700'}>
                      Remaining: {formatQtyWithUnit(remaining, product?.unitType)}
                    </span>
                  </p>
                </div>
                <div className="w-28 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Receiving Now</Label>
                  <Input
                    type="number"
                    min="0"
                    max={remaining}
                    value={receivedQtys[item.id] || '0'}
                    onChange={(e) =>
                      setReceivedQtys({ ...receivedQtys, [item.id]: e.target.value })
                    }
                    className={`h-9 text-sm ${isOver ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    disabled={remaining <= 0}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <span className="text-muted-foreground">Total items being received</span>
          <span className="font-bold text-lg">{totalBeingReceived}</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={validateAndSubmit} disabled={receiveMutation.isPending || totalBeingReceived === 0}>
            {receiveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Receive Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// PO Detail View

function PODetailView({
  po,
  open,
  onOpenChange,
  onOpenSheet,
}: {
  po: PurchaseOrderListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // v2.259.0 THE BRANCH'S DOOR — the org drill's own law ported: when the
  // parent hands the detail an `onOpenSheet`, the birth strip grows the
  // door (data-testid=po-detail-birth-door) that hands the parent
  // {id, storeName, status} — the SheetDrill's own contract. A face
  // without the callback keeps the plain strip (additive, never assumed).
  onOpenSheet?: (t: { id: string; storeName: string; status: string }) => void;
}) {
  const queryClient = useQueryClient();
  // v2.8.0: admin-controlled VAT rate for the stored-amount label.
  const { vatRate } = useVatRate();
  const { user } = useAuthStore();
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    action: string;
    label: string;
    description: string;
  } | null>(null);

  // Fetch fresh detail
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['purchase-order-detail', po?.id],
    queryFn: () => purchaseOrdersApi.get(po!.id),
    enabled: open && !!po?.id,
  });
  const detail: PurchaseOrderListItem | null = detailData?.data ?? po;
  // v2.259.0 THE BRANCH'S DOOR — the sheet's address: the birth speaks
  // the store's name only when the FRESH detail carries it (the sheet and
  // the order share the store — the birth's own law). A stale cached row
  // (the list shape carries no store) keeps the honest absence — no name,
  // no door, never a guessed address.
  const birthTarget =
    detail?.originStockTake && detail.store?.name
      ? { id: detail.originStockTake.id, storeName: detail.store.name, status: detail.originStockTake.status }
      : null;

  const statusMutation = useMutation({
    mutationFn: ({ status, extra }: { status: string; extra?: Record<string, string> }) =>
      purchaseOrdersApi.updateStatus(po!.id, status, extra),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order-detail', po?.id] });
      toast.success(`PO status updated to ${formatStatusLabel(variables.status)}`);
      setConfirmAction(null);
    },
    onError: (err: unknown) => {
      const msg = handleError(err, 'Update PO status');
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => purchaseOrdersApi.delete(po!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Purchase order deleted');
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const msg = handleError(err, 'Delete purchase order');
      toast.error(msg);
    },
  });

  const handleStatusAction = (newStatus: string) => {
    const extra: Record<string, string> = {};
    if (newStatus === 'APPROVED') extra.approvedById = user?.id || '';
    if (newStatus === 'CANCELLED') extra.cancelledById = user?.id || '';
    statusMutation.mutate({ status: newStatus, extra });
  };

  const getAvailableActions = useCallback((): {
    key: string;
    label: string;
    icon: React.ReactNode;
    variant: 'default' | 'outline' | 'destructive';
    action: string;
    confirmDescription: string;
  }[] => {
    if (!detail) return [];
    const s = detail.status;
    switch (s) {
      case 'DRAFT':
        return [
          {
            key: 'submit',
            label: 'Submit for Approval',
            icon: <Send className="h-4 w-4" />,
            variant: 'default',
            action: 'PENDING_APPROVAL',
            confirmDescription: 'Submit this PO for approval? It will no longer be editable.',
          },
          {
            key: 'cancel',
            label: 'Cancel',
            icon: <Ban className="h-4 w-4" />,
            variant: 'destructive',
            action: 'CANCELLED',
            confirmDescription: 'Are you sure you want to cancel this purchase order?',
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <Trash2 className="h-4 w-4" />,
            variant: 'destructive',
            action: 'DELETE',
            confirmDescription: 'Permanently delete this purchase order? This cannot be undone.',
          },
        ];
      case 'PENDING_APPROVAL':
        return [
          {
            key: 'approve',
            label: 'Approve',
            icon: <ShieldCheck className="h-4 w-4" />,
            variant: 'default',
            action: 'APPROVED',
            confirmDescription: 'Approve this purchase order?',
          },
          {
            key: 'sendback',
            label: 'Send Back to Draft',
            icon: <ChevronLeft className="h-4 w-4" />,
            variant: 'outline',
            action: 'DRAFT',
            confirmDescription: 'Send this PO back to draft for editing?',
          },
          {
            key: 'cancel',
            label: 'Cancel',
            icon: <Ban className="h-4 w-4" />,
            variant: 'destructive',
            action: 'CANCELLED',
            confirmDescription: 'Are you sure you want to cancel this purchase order?',
          },
        ];
      case 'APPROVED':
        return [
          {
            key: 'send',
            label: 'Send to Supplier',
            icon: <Send className="h-4 w-4" />,
            variant: 'default',
            action: 'SENT',
            confirmDescription: 'Mark this PO as sent to the supplier?',
          },
          {
            key: 'cancel',
            label: 'Cancel',
            icon: <Ban className="h-4 w-4" />,
            variant: 'destructive',
            action: 'CANCELLED',
            confirmDescription: 'Are you sure you want to cancel this purchase order?',
          },
        ];
      case 'SENT':
        return [
          {
            key: 'confirm',
            label: 'Mark Confirmed',
            icon: <Stamp className="h-4 w-4" />,
            variant: 'default',
            action: 'CONFIRMED',
            confirmDescription: 'Mark this PO as confirmed by the supplier?',
          },
          {
            key: 'cancel',
            label: 'Cancel',
            icon: <Ban className="h-4 w-4" />,
            variant: 'destructive',
            action: 'CANCELLED',
            confirmDescription: 'Are you sure you want to cancel this purchase order?',
          },
        ];
      case 'CONFIRMED':
        return [
          {
            key: 'receive',
            label: 'Receive Items',
            icon: <PackageCheck className="h-4 w-4" />,
            variant: 'default',
            action: 'RECEIVE',
            confirmDescription: '',
          },
          {
            key: 'cancel',
            label: 'Cancel',
            icon: <Ban className="h-4 w-4" />,
            variant: 'destructive',
            action: 'CANCELLED',
            confirmDescription: 'Are you sure you want to cancel this purchase order?',
          },
        ];
      case 'PARTIALLY_RECEIVED':
        return [
          {
            key: 'receive',
            label: 'Receive Items',
            icon: <PackageCheck className="h-4 w-4" />,
            variant: 'default',
            action: 'RECEIVE',
            confirmDescription: '',
          },
          {
            key: 'complete',
            label: 'Mark Complete',
            icon: <CheckCircle2 className="h-4 w-4" />,
            variant: 'outline',
            action: 'RECEIVED',
            confirmDescription: 'Mark this PO as fully received?',
          },
        ];
      default:
        return [];
    }
  }, [detail]);

  if (!detail) return null;

  const actions = getAvailableActions();
  const isCancelled = detail.status === 'CANCELLED';
  const isReceived = detail.status === 'RECEIVED';

  // Calculate receiving progress
  const totalOrdered = detail.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const totalReceived = detail.items?.reduce((s, i) => s + i.receivedQty, 0) ?? 0;
  const receivePct = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title={
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            {detail.poNumber}
          </div>
        }
        description={
          <div className="flex items-center gap-2 mt-1">
            <Badge className={`text-xs gap-1 ${getStatusBadgeClasses(detail.status)}`}>
              {getStatusIcon(detail.status)}
              {formatStatusLabel(detail.status)}
            </Badge>
            <span className="text-muted-foreground">&middot;</span>
            <span className="text-muted-foreground">{detail.supplier?.name || 'Unknown Supplier'}</span>
          </div>
        }
        size="xl"
      >
        {detailLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* v2.248.0 THE BIRTH STRIP — the detail face names the sheet
                this PO was born from (the violet door family): the sheet's
                id, its aisle when it wore one, the honest status voice.
                An older cached wire or a hand-raised PO renders the silent
                absence (the type check, never an assumption). */}
            {detail.originStockTake && (
              <div
                data-testid="po-detail-birth-strip"
                title={`born at count sheet ${detail.originStockTake.id}${detail.originStockTake.walkAisle?.name ? ` — the walk order named ${detail.originStockTake.walkAisle.name}` : ''}`}
                className="rounded-lg border border-violet-200 bg-violet-50/60 px-3 py-2 text-[11px] text-violet-800 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200"
              >
                <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                  <ClipboardList className="h-3 w-3" aria-hidden="true" />
                  born at a count sheet
                </p>
                <p className="mt-0.5 font-medium">
                  this PO answers count sheet <span className="tabular-nums">{detail.originStockTake.id}</span>
                  {detail.originStockTake.walkAisle?.name ? <> — the walk order named {detail.originStockTake.walkAisle.name}</> : null}
                  {detail.originStockTake.status === 'CLOSED' ? ' (the books heard it).' : ` (${detail.originStockTake.status.toLowerCase()}).`}
                  {/* v2.251.0 THE WALK'S WHEN — the walk order's own cadence
                      chip: the variance map's four houses (fresh/stale/
                      beyond/never) read the census's way; the chip's title
                      speaks the days voice, the word the chipLabel names.
                      A band the read could not answer stays absent — never
                      a guessed house. */}
                  {detail.originStockTake.walkAisle?.band ? (
                    <span
                      data-testid="po-detail-aisle-band"
                      className={`ml-1.5 inline-flex translate-y-[-0.5px] items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1 ring-inset ${bandHouse(detail.originStockTake.walkAisle.band).chip}`}
                      title={daysVoice({ band: detail.originStockTake.walkAisle.band as 'fresh' | 'stale' | 'beyond' | 'never', daysSince: detail.originStockTake.walkAisle.daysSince })}
                    >
                      {chipLabel(detail.originStockTake.walkAisle.band)}
                    </span>
                  ) : null}
                </p>
                {/* v2.259.0 THE BRANCH'S DOOR — the org drill's own door
                    bytes (the violet family, the same words' shape): the
                    strip names the sheet, the door OPENS it. Focus rings
                    speak only to keyboards (focus-visible — a mouse press
                    leaves no ring), the family law the lens chips wear. */}
                {onOpenSheet && birthTarget && (
                  <button
                    type="button"
                    data-testid="po-detail-birth-door"
                    onClick={() => onOpenSheet(birthTarget)}
                    title={`open count sheet ${birthTarget.id} — the detail's reading moves to the sheet that birthed this order (this detail closes; the roster's door reopens it)`}
                    className="mt-1.5 inline-flex h-6 items-center gap-1 rounded-full bg-violet-100 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800 ring-1 ring-inset ring-violet-300 transition-[filter] hover:brightness-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 dark:bg-violet-500/20 dark:text-violet-100 dark:ring-violet-500/40"
                  >
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    open the sheet
                  </button>
                )}
              </div>
            )}

            {/* Status Timeline */}
            <div className="p-4 bg-muted/30 rounded-lg border">
              <POStatusTimeline status={detail.status} />
            </div>

            {/* Receiving Progress (if applicable) */}
            {['CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED'].includes(detail.status) && detail.items && detail.items.length > 0 && (
              <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Receiving Progress</span>
                  <span className="font-medium">
                    {totalReceived} / {totalOrdered} items
                  </span>
                </div>
                <Progress value={receivePct} className="h-2" />
              </div>
            )}

            {/* PO Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoItem icon={<FileText className="h-4 w-4" />} label="PO Number" value={detail.poNumber} />
              <InfoItem icon={<ShoppingBag className="h-4 w-4" />} label="Supplier" value={detail.supplier?.name || '-'} />
              <InfoItem icon={<CalendarDays className="h-4 w-4" />} label="Order Date" value={formatDate(detail.orderDate)} />
              <InfoItem
                icon={<Truck className="h-4 w-4" />}
                label="Expected Date"
                value={detail.expectedDate ? formatDate(detail.expectedDate) : 'Not set'}
              />
              <InfoItem
                icon={<Receipt className="h-4 w-4" />}
                label="Total Amount"
                // v2.250.0: the document's money face — the mask voice past
                // the gate (the field's own absence is the truth the wire
                // spoke; never a formatted null).
                value={
                  detail.totalAmount != null ? (
                    formatKES(detail.totalAmount)
                  ) : (
                    <span className="text-muted-foreground/60" title="the shillings stay with the cost-holders">—</span>
                  )
                }
              />
              <InfoItem icon={<Package className="h-4 w-4" />} label="Items" value={`${detail.items?.length ?? detail.itemCount ?? 0} line items`} />
            </div>

            {/* Financial Summary */}
            {detail.totalAmount == null ? (
              // v2.250.0 THE BRANCH'S GATE — the financial block speaks the
              // mask when the wire gated the shillings: one honest line in
              // the dashed absence card, never three formatted nulls.
              <div
                className="p-3 bg-muted/20 rounded-lg border border-dashed text-sm text-muted-foreground"
                title="the shillings stay with the cost-holders"
              >
                the books hold this order&apos;s shillings — a cost-holder reads the total here.
              </div>
            ) : (
              <div className="p-3 bg-muted/30 rounded-lg border text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatKES(detail.subTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({vatRate}% VAT)</span>
                  <span>{formatKES(detail.taxAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatKES(detail.totalAmount)}</span>
                </div>
              </div>
            )}

            {/* Audit Info */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {detail.createdBy && (
                <div className="p-2 rounded-md bg-muted/20">
                  <span className="text-muted-foreground">Created by:</span>{' '}
                  <span className="font-medium">{detail.createdBy.name}</span>
                </div>
              )}
              {detail.approvedBy && (
                <div className="p-2 rounded-md bg-muted/20">
                  <span className="text-muted-foreground">Approved by:</span>{' '}
                  <span className="font-medium">{detail.approvedBy.name}</span>
                  {detail.approvedAt && (
                    <span className="text-muted-foreground ml-1">on {formatDate(detail.approvedAt)}</span>
                  )}
                </div>
              )}
              {detail.receivedBy && (
                <div className="p-2 rounded-md bg-muted/20">
                  <span className="text-muted-foreground">Received by:</span>{' '}
                  <span className="font-medium">{detail.receivedBy.name}</span>
                  {detail.receivedAt && (
                    <span className="text-muted-foreground ml-1">on {formatDate(detail.receivedAt)}</span>
                  )}
                </div>
              )}
              {detail.cancelledBy && (
                <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/20">
                  <span className="text-red-600">Cancelled by:</span>{' '}
                  <span className="font-medium text-red-600">{detail.cancelledBy.name}</span>
                  {detail.cancelledAt && (
                    <span className="text-red-500 ml-1">on {formatDate(detail.cancelledAt)}</span>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            {detail.notes && (
              <div className="p-3 bg-muted/30 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{detail.notes}</p>
              </div>
            )}

            {/* Line Items Table */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Line Items</h4>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Product</TableHead>
                      <TableHead className="text-xs text-center">Qty Ordered</TableHead>
                      <TableHead className="text-xs text-right">Unit Cost</TableHead>
                      <TableHead className="text-xs text-right">Total</TableHead>
                      <TableHead className="text-xs text-center">Qty Received</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.items?.map((item) => {
                      const itemReceivedPct =
                        item.quantity > 0 ? (item.receivedQty / item.quantity) * 100 : 0;
                      const itemStatus =
                        item.receivedQty >= item.quantity
                          ? 'Received'
                          : item.receivedQty > 0
                            ? 'Partial'
                            : 'Pending';
                      const itemStatusColor =
                        itemStatus === 'Received'
                          ? 'text-emerald-700'
                          : itemStatus === 'Partial'
                            ? 'text-amber-700'
                            : 'text-muted-foreground';

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">
                                {item.product?.name || item.productName || 'Unknown'}
                              </p>
                              {item.product?.sku && (
                                <p className="text-xs text-muted-foreground font-mono">{item.product.sku}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm">{formatQtyWithUnit(item.quantity, item.product?.unitType)}</TableCell>
                          <TableCell className="text-right text-sm">
                            {/* v2.250.0: the line's money cells — the mask voice
                            past the gate, never a formatted null. */}
                            {item.unitCost != null ? (
                              formatKES(item.unitCost)
                            ) : (
                              <span className="text-muted-foreground/60" title="the shillings stay with the cost-holders">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {item.totalCost != null ? (
                              formatKES(item.totalCost)
                            ) : (
                              <span className="text-muted-foreground/60" title="the shillings stay with the cost-holders">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-sm">
                                {formatQty(item.receivedQty)}/{formatQtyWithUnit(item.quantity, item.product?.unitType)}
                              </span>
                              <Progress value={itemReceivedPct} className="h-1 w-12" />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`text-xs font-medium ${itemStatusColor}`}>{itemStatus}</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Action Buttons */}
            {!isCancelled && !isReceived && actions.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                {actions.map((act) => {
                  if (act.action === 'RECEIVE') {
                    return (
                      <Button
                        key={act.key}
                        variant={act.variant}
                        onClick={() => setReceiveOpen(true)}
                      >
                        {act.icon}
                        <span className="ml-2">{act.label}</span>
                      </Button>
                    );
                  }
                  return (
                    <Button
                      key={act.key}
                      variant={act.variant === 'destructive' ? 'destructive' : act.variant}
                      onClick={() =>
                        setConfirmAction({
                          action: act.action,
                          label: act.label,
                          description: act.confirmDescription,
                        })
                      }
                      disabled={statusMutation.isPending || deleteMutation.isPending}
                    >
                      {act.icon}
                      <span className="ml-2">{act.label}</span>
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Cancelled notice */}
            {isCancelled && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <PackageX className="h-8 w-8 text-red-500 shrink-0" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">Purchase Order Cancelled</p>
                  {detail.cancelledBy && (
                    <p className="text-sm text-red-600 dark:text-red-300">
                      By {detail.cancelledBy.name}
                      {detail.cancelledAt && ` on ${formatDate(detail.cancelledAt)}`}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </ResponsiveDialog>

      {/* Receive Items Dialog */}
      <ReceiveItemsDialog
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        purchaseOrder={detail}
      />

      {/* Confirm Action Dialog */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={(v) => !v && setConfirmAction(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>{confirmAction?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={
                confirmAction?.action === 'CANCELLED' || confirmAction?.action === 'DELETE'
                  ? 'destructive'
                  : 'default'
              }
              disabled={statusMutation.isPending || deleteMutation.isPending}
              onClick={() => {
                if (!confirmAction) return;
                if (confirmAction.action === 'DELETE') {
                  deleteMutation.mutate();
                } else {
                  handleStatusAction(confirmAction.action);
                }
              }}
            >
              {statusMutation.isPending || deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {confirmAction?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Info Item Helper

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-muted/20 rounded-lg">
      <div className="text-muted-foreground shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

// Summary Card

function SummaryCard({
  icon,
  label,
  value,
  subValue,
  iconBg,
  iconColor,
  borderLeftColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  iconBg: string;
  iconColor: string;
  borderLeftColor: string;
}) {
  return (
    <Card className={`border-l-4 ${borderLeftColor} backdrop-blur-sm bg-card/80`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold truncate">{value}</p>
            {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component

export default function PurchaseOrdersTab() {
  const { currentStoreId } = useAppStore();
  const queryClient = useQueryClient();

  // State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [supplierFilter, setSupplierFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<'orderDate' | 'totalAmount' | 'status'>('orderDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  // v2.248.0 THE RESTOCK DOOR'S LANDING — the tab reads ?restockFrom= ONE
  // time at mount (the drill's restock door is a HARD anchor navigation;
  // the same one-time law the count sheet door speaks), auto-opens the
  // create dialog with the sheet attached, then cleans the address so a
  // manual "New PO" never inherits the birth by accident.
  const [restockFrom] = useState(() =>
    typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('restockFrom') ?? ''
  );
  useEffect(() => {
    if (!restockFrom) return;
    setCreateOpen(true);
    if (typeof window !== 'undefined') window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    // ONE time: the door is a hard navigation, the tab remounts for it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderListItem | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  // v2.254.0 THE BRANCH'S LENS — the band rung (the org ledger's own law,
  // ported): 'ALL' stands for the whole page; a house (or the silence)
  // narrows the VIEW. State of the surface, never of the fetch — the
  // wire's rungs (status/supplier/date/page) stay the wire's.
  const [bandLens, setBandLens] = useState<'ALL' | CadenceBand | 'silent'>('ALL');
  // v2.259.0 THE BRANCH'S INSTRUMENTS — the metric rung (the supplier
  // roster's own law, ported home): the three metrics narrow the view
  // composed with the band (AND, never OR) and the needle. The state
  // declares BEFORE the ear that reads it (the TDZ law — a const read
  // above its own declaration is the crash the error boundary wears).
  const [metricLens, setMetricLens] = useState<PoMetricLens>('all');
  // v2.256.0 THE LENS'S EAR — the keyboard's lift. v2.259.0: THE
  // COMBINED-EAR LAW — the surface now wears TWO narrowing instruments,
  // so it wears ONE ear with the COMBINED press and the COMBINED lift
  // (two independent window listeners race — a discrete event's
  // synchronous flush retires the other ear before its turn; the live
  // walk caught it twice on the supplier's face). One Escape lifts BOTH
  // instruments — the top of the ladder speaks for the whole surface.
  useLensEscape(bandLens !== 'ALL' || metricLens !== 'all', () => {
    setBandLens('ALL');
    setMetricLens('all');
  });
  // v2.259.0 THE BRANCH'S DOOR — the org ledger's own law: the sheet
  // drill is the tab's own dialog (the drill wears its Escape rung —
  // v2.257.0, one home); the door closes the detail and opens the sheet
  // (one dialog at a time, the ladder's own shape).
  const [sheetDrill, setSheetDrill] = useState<SheetDrillTarget>(null);

  const limit = 20;
  const currentTime = useMemo(() => new Date().getTime(), []);

  // Fetch POs
  const { data: poData, isLoading: poLoading, isError: poError } = useQuery({
    queryKey: [
      'purchase-orders',
      currentStoreId,
      statusFilter,
      supplierFilter,
      dateFrom,
      dateTo,
      page,
    ],
    queryFn: () =>
      purchaseOrdersApi.list({
        storeId: currentStoreId,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        supplierId: supplierFilter !== 'ALL' ? supplierFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        limit,
      }),
    enabled: !!currentStoreId,
  });

  const purchaseOrders: PurchaseOrderListItem[] = useMemo(
    () => (Array.isArray(poData?.data) ? poData.data : []),
    [poData]
  );
  // v2.254.0: the lens's own counts — REAL numbers over the page's rows
  // (every row lands in exactly one family; the sums read the page). A
  // pressed house keeps its number — the counts read the rows, never
  // the view.
  const bandCounts = useMemo(() => {
    const c = { fresh: 0, stale: 0, beyond: 0, never: 0, silent: 0 };
    for (const po of purchaseOrders) {
      const b = poRowBand(po);
      if (b) c[b] += 1;
      else c.silent += 1;
    }
    return c;
  }, [purchaseOrders]);
  // v2.259.0 THE BRANCH'S INSTRUMENTS — the metrics' own counts: REAL
  // numbers over the page's rows (the band counts' own law). A pressed
  // metric keeps its number — the counts read the rows, never the view.
  const metricCounts = useMemo(
    () => ({
      onTime: purchaseOrders.filter((po) => poMetricPredicate('onTime', po)).length,
      late: purchaseOrders.filter((po) => poMetricPredicate('late', po)).length,
      open: purchaseOrders.filter((po) => poMetricPredicate('open', po)).length,
    }),
    [purchaseOrders]
  );
  const pagination = poData?.pagination;
  // v2.250.0 THE BRANCH'S GATE — the truth the wire speaks (never a
  // role name guessed client-side): the roster's shillings and the
  // detail's financial faces render the honest absence when the gate
  // is down.
  const costGated = poData?.costGated === true;
  // the shillings' shared mask voice — the roster cell, the detail's
  // money cells and the KPI all wear the same words (one law).
  const COST_MASK = 'the shillings stay with the cost-holders';

  // Fetch suppliers for filter dropdown
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-list-po', currentStoreId],
    queryFn: () => suppliersApi.list({ storeId: currentStoreId, limit: 200 }),
    enabled: !!currentStoreId,
  });
  const suppliers: SupplierItem[] = Array.isArray(suppliersData?.data) ? suppliersData.data : [];

  // Derived summary stats
  const stats = useMemo(() => {
    const all = purchaseOrders;
    const totalPOs = all.length;
    const pendingApproval = all.filter((po) => po.status === 'PENDING_APPROVAL').length;
    const inTransit = all.filter((po) => po.status === 'SENT' || po.status === 'CONFIRMED').length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const receivedThisMonth = all.filter(
      (po) =>
        po.status === 'RECEIVED' &&
        po.receivedAt &&
        new Date(po.receivedAt).getTime() >= new Date(startOfMonth).getTime()
    ).length;

    const totalValue = all
      .filter((po) => po.status !== 'CANCELLED')
      .reduce((s, po) => s + (po.totalAmount ?? 0), 0);

    return { totalPOs, pendingApproval, inTransit, receivedThisMonth, totalValue };
  }, [purchaseOrders]);

  // Sort
  // v2.259.0: the memos compose the supplier roster's own way — the
  // band's narrowing first (bandOrders), then the metric's (the COMPOSED
  // memo keeps the name lensedOrders), then the needle, then the sort.
  // The reading narrows; the fetch never moves.
  const bandOrders = useMemo(
    () =>
      bandLens === 'ALL'
        ? purchaseOrders
        : purchaseOrders.filter((po) =>
            bandLens === 'silent' ? poRowBand(po) == null : poRowBand(po) === bandLens
          ),
    [purchaseOrders, bandLens]
  );
  const lensedOrders = useMemo(
    () =>
      metricLens === 'all'
        ? bandOrders
        : bandOrders.filter((po) => poMetricPredicate(metricLens, po)),
    [bandOrders, metricLens]
  );
  const sortedPOs = useMemo(() => {
    const filtered = search.trim()
      ? lensedOrders.filter(
          (po) =>
            po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
            po.supplier?.name?.toLowerCase().includes(search.toLowerCase())
        )
      : lensedOrders;

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'orderDate') {
        cmp = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      } else if (sortField === 'totalAmount') {
        // v2.250.0: the gate's mask never sorts — a null row is an
        // absence, and absences have no order (the toggle below never
        // lands here when the gate is down).
        cmp = (a.totalAmount ?? 0) - (b.totalAmount ?? 0);
      } else if (sortField === 'status') {
        cmp = a.status.localeCompare(b.status);
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [lensedOrders, search, sortField, sortDir]);

  const toggleSort = (field: 'orderDate' | 'totalAmount' | 'status') => {
    // v2.250.0: the money rung stops answering when the gate is down —
    // the header's affordance is gone and this guard is the backstop.
    if (field === 'totalAmount' && costGated) return;
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const openDetail = (po: PurchaseOrderListItem) => {
    setSelectedPO(po);
    setDetailOpen(true);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setSupplierFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    // v2.254.0: the lens is one of the face's own filters now — the
    // clear-all lifts it too (the honest clear, never a partial one).
    // v2.259.0: BOTH instruments (the combined lift — one hand, one
    // surface, nothing left pressed).
    setBandLens('ALL');
    setMetricLens('all');
  };

  const hasActiveFilters =
    search || statusFilter !== 'ALL' || supplierFilter !== 'ALL' || dateFrom || dateTo || bandLens !== 'ALL' || metricLens !== 'all';

  // Render

  return (
    <div className="space-y-4">
      {/* ── Overview Dashboard ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <SummaryCard
          icon={<ClipboardList className="h-5 w-5" />}
          label="Total POs"
          value={stats.totalPOs}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          borderLeftColor="border-l-blue-500"
        />
        <SummaryCard
          icon={<Clock className="h-5 w-5" />}
          label="Pending Approval"
          value={stats.pendingApproval}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-700 dark:text-amber-400"
          borderLeftColor="border-l-amber-500"
        />
        <SummaryCard
          icon={<Truck className="h-5 w-5" />}
          label="In Transit"
          value={stats.inTransit}
          subValue="SENT + CONFIRMED"
          iconBg="bg-cyan-100 dark:bg-cyan-900/30"
          iconColor="text-cyan-600 dark:text-cyan-400"
          borderLeftColor="border-l-cyan-500"
        />
        <SummaryCard
          icon={<PackageCheck className="h-5 w-5" />}
          label="Received (Month)"
          value={stats.receivedThisMonth}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-700 dark:text-emerald-400"
          borderLeftColor="border-l-emerald-500"
        />
        <SummaryCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Total Value"
          // v2.250.0: the gate's mask — an absence never sums.
          value={costGated ? '—' : formatKES(stats.totalValue)}
          subValue={costGated ? COST_MASK : 'Excl. cancelled'}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
          borderLeftColor="border-l-purple-500"
        />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by PO number or supplier..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersVisible(!filtersVisible)}
            className={filtersVisible ? 'bg-muted' : ''}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-1.5 h-5 w-5 p-0 text-[10px] flex items-center justify-center bg-primary text-primary-foreground">
                !
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}

          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New PO
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      {filtersVisible && (
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    {PO_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        <span className="flex items-center gap-2">
                          <span className={getStatusBadgeClasses(s).split(' ')[0]}>
                            {getStatusIcon(s)}
                          </span>
                          {formatStatusLabel(s)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Supplier</Label>
                <Select
                  value={supplierFilter}
                  onValueChange={(v) => {
                    setSupplierFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Suppliers</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Order Date From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Order Date To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* v2.254.0 THE BRANCH'S LENS — the band rail, the org ledger's own
          lens ported to the branch's page: the four houses the aisles
          speak + the silent absence, each chip answering with its REAL
          count over the rows the page ALREADY holds. A press narrows the
          view (composed with the search and the sort — the reading
          narrows, the fetch never moves); the wire's rungs stay the
          wire's; the face's own clear-all lifts the lens too. */}
      {!poLoading && !poError && purchaseOrders.length > 0 && (
        <div
          data-testid="po-roster-band-row"
          className="flex flex-wrap items-center gap-1.5"
          title="the page's own lens — the filters above stay the wire's; a press narrows the view (the fetch stays); Escape stands the lens down"
        >
          {(['fresh', 'stale', 'beyond', 'never'] as const).map((b) => {
            const house = bandHouse(b);
            const pressed = bandLens === b;
            const n = bandCounts[b];
            return (
              <button
                key={b}
                type="button"
                data-testid={`po-roster-band-${b}`}
                aria-pressed={pressed}
                onClick={() => setBandLens(pressed ? 'ALL' : b)}
                title={`${chipLabel(b)} — ${n === 0 ? 'no order' : `${n} ${n === 1 ? 'order' : 'orders'}`} on this page wears the house; a press narrows the view (the fetch stays)`}
                className={`inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-wide tabular-nums ring-1 transition-[filter] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 ${pressed ? house.pressed : house.chip} ${pressed ? '' : 'hover:brightness-[0.97] dark:hover:brightness-110'}`}
              >
                <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${pressed ? 'bg-white/80 dark:bg-slate-950/50' : house.rail}`} />
                {chipLabel(b)} <span className="opacity-70">{n}</span>
              </button>
            );
          })}
          <button
            type="button"
            data-testid="po-roster-band-silent"
            aria-pressed={bandLens === 'silent'}
            onClick={() => setBandLens(bandLens === 'silent' ? 'ALL' : 'silent')}
            title={`no band — ${bandCounts.silent === 0 ? 'no order' : `${bandCounts.silent} ${bandCounts.silent === 1 ? 'order' : 'orders'}`} on this page keeps the silence (a hand-raised birth, or a read that fell honest)`}
            className={`inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-wide tabular-nums ring-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 ${bandLens === 'silent' ? 'bg-slate-800 text-white ring-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:ring-slate-100' : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-800'}`}
          >
            no band <span className="opacity-70">{bandCounts.silent}</span>
          </button>
        </div>
      )}

      {/* v2.259.0 THE BRANCH'S INSTRUMENTS — the metric rail (the supplier
          roster's own law, ported home): the three metrics the Performance
          card speaks, each answering with its REAL count over the rows the
          page ALREADY holds. A press narrows the view COMPOSED with the
          band (AND, never OR) and the needle; the fetch never moves; the
          face's own clear-all lifts it too (hasActiveFilters reads it).
          The chips wear the metrics' own families (green/rose/blue — the
          tiles' colours, never a new palette); the rail's focus rings stay
          the branch's own sky (focus-visible — a mouse press leaves no
          ring). */}
      {!poLoading && !poError && purchaseOrders.length > 0 && (
        <div
          data-testid="branch-po-metric-rail"
          className="flex flex-wrap items-center gap-1.5"
          title="the metrics' own rail — the numbers' real counts over the page's rows; a press narrows the view composed with the band (AND, never OR)"
        >
          {(['onTime', 'late', 'open'] as const).map((k) => {
            const pressed = metricLens === k;
            const n = metricCounts[k];
            const family = poMetricFamily(k);
            return (
              <button
                key={k}
                type="button"
                data-testid={`branch-po-metric-${k}`}
                aria-pressed={pressed}
                onClick={() => setMetricLens(pressed ? 'all' : k)}
                title={`${poMetricVoice(k)} — ${n === 0 ? 'no order' : `${n} ${n === 1 ? 'order' : 'orders'}`} on this page answers the rule; a press narrows the view (the fetch stays)`}
                className={`inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-wide tabular-nums ring-1 transition-[filter] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 ${pressed ? family.pressed : family.chip} ${pressed ? '' : 'hover:brightness-[0.97] dark:hover:brightness-110'}`}
              >
                {poMetricVoice(k)} <span className="opacity-70">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Table ── */}
      <Card className="backdrop-blur-sm bg-card/80 border-border/50">
        <CardContent className="p-0">
          {poLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : poError ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-red-400" />
              <p className="font-medium text-red-600">Failed to load purchase orders</p>
              <p className="text-sm mt-1">Please try refreshing the page</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
                }
              >
                Retry
              </Button>
            </div>
          ) : sortedPOs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No purchase orders found</p>
              <p className="text-sm mt-1">
                {metricLens !== 'all'
                  ? `No order on this page ${poMetricEmptyVoice(metricLens)}`
                  : hasActiveFilters
                    ? 'Try adjusting your filters or search terms'
                    : 'Create your first purchase order to get started'}
              </p>
              {metricLens !== 'all' && (
                <Button
                  size="sm"
                  variant="outline"
                  data-testid="branch-po-metric-clear"
                  onClick={() => setMetricLens('all')}
                  className="mt-3"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  stand the metric down
                </Button>
              )}
              {!hasActiveFilters && (
                <Button size="sm" className="mt-3" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Purchase Order
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs cursor-pointer select-none" onClick={() => toggleSort('orderDate')}>
                        <span className="flex items-center">
                          PO Number
                          <ArrowUpDown className={`h-3.5 w-3.5 ml-1 inline ${sortField === 'orderDate' ? 'text-primary' : 'text-muted-foreground/40'}`} />
                        </span>
                      </TableHead>
                      <TableHead className="text-xs">Supplier</TableHead>
                      <TableHead className="text-xs cursor-pointer select-none" onClick={() => toggleSort('status')}>
                        <span className="flex items-center">
                          Status
                          <ArrowUpDown className={`h-3.5 w-3.5 ml-1 inline ${sortField === 'status' ? 'text-primary' : 'text-muted-foreground/40'}`} />
                        </span>
                      </TableHead>
                      <TableHead className="text-xs">Order Date</TableHead>
                      <TableHead className="text-xs">Expected Date</TableHead>
                      <TableHead
                        className="text-xs text-right select-none"
                        // v2.250.0: the money sort's affordance speaks only past
                        // the gate — a gated header keeps its label and loses
                        // the arrow, the mask in the title.
                        onClick={costGated ? undefined : () => toggleSort('totalAmount')}
                        title={costGated ? COST_MASK : undefined}
                      >
                        <span className="flex items-center justify-end">
                          Total Amount
                          {!costGated && (
                            <ArrowUpDown className={`h-3.5 w-3.5 ml-1 inline ${sortField === 'totalAmount' ? 'text-primary' : 'text-muted-foreground/40'}`} />
                          )}
                        </span>
                      </TableHead>
                      <TableHead className="text-xs text-center">Items</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPOs.map((po) => {
                      const isOverdue =
                        po.expectedDate &&
                        po.status !== 'RECEIVED' &&
                        po.status !== 'CANCELLED' &&
                        new Date(po.expectedDate).getTime() < currentTime;

                      return (
                        <TableRow
                          key={po.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => openDetail(po)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-sm text-primary">
                                {po.poNumber}
                              </span>
                              {/* v2.248.0 THE BIRTH CHIP — the violet door
                                  family, on the roster: a PO born at a
                                  count sheet wears its birth beside the
                                  number (the aisle's name rides the title
                                  when the sheet wore one). A hand-raised
                                  PO renders the silent absence. */}
                              {po.originStockTake && (
                                <Badge
                                  data-testid="po-row-birth-chip"
                                  // v2.252.0 THE ROSTER'S WHEN — the chip's
                                  // title grows the aisle's days voice (the
                                  // org ledger's own law, the same one home):
                                  // "born at count sheet X — the walk order
                                  // named Tools — last heard counted today."
                                  // A row whose read fell silent keeps its
                                  // v2.248 voice — the honest absence.
                                  title={`born at count sheet ${po.originStockTake.id}${po.originStockTake.walkAisle?.name ? ` — the walk order named ${po.originStockTake.walkAisle.name}` : ''}${po.originStockTake.walkAisle?.band ? ` — last heard ${daysVoice({ band: po.originStockTake.walkAisle.band as 'fresh' | 'stale' | 'beyond' | 'never', daysSince: po.originStockTake.walkAisle.daysSince })}` : ''}`}
                                  className="text-[9px] bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 gap-0.5"
                                >
                                  {/* v2.254.0: the chip wears its aisle's band
                                      — the house's own rail colour as a dot
                                      (the ONE home; the org roster's own law
                                      from v2.253, now on the branch's face
                                      too). A silent read keeps the plain
                                      violet — never a guessed colour. */}
                                  {po.originStockTake.walkAisle?.band && (
                                    <span
                                      data-testid="po-row-band-dot"
                                      aria-hidden="true"
                                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${bandHouse(po.originStockTake.walkAisle.band as CadenceBand).rail}`}
                                    />
                                  )}
                                  <ClipboardList className="h-3 w-3" />
                                  BORN AT A COUNT SHEET
                                </Badge>
                              )}
                              {isOverdue && (
                                <Badge className="text-[9px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 gap-0.5">
                                  <AlertTriangle className="h-3 w-3" /> Overdue
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{po.supplier?.name || '-'}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] gap-1 ${getStatusBadgeClasses(po.status)}`}>
                              {getStatusIcon(po.status)}
                              {formatStatusLabel(po.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(po.orderDate)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {po.expectedDate ? formatDate(po.expectedDate) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-sm">
                            {/* v2.250.0: the roster's money cell — the mask voice
                            past the gate, never a formatted null. */}
                            {po.totalAmount != null ? (
                              formatKES(po.totalAmount)
                            ) : (
                              <span className="text-muted-foreground/60" title={COST_MASK}>—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {po.items?.length ?? po.itemCount ?? 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => openDetail(po)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {po.status === 'CONFIRMED' || po.status === 'PARTIALLY_RECEIVED' ? (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPO(po);
                                      setDetailOpen(true);
                                      // We'll trigger receive from the detail view
                                    }}
                                  >
                                    <PackageCheck className="h-4 w-4 mr-2" />
                                    Receive Items
                                  </DropdownMenuItem>
                                ) : null}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Showing {(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total)} of{' '}
                    {pagination.total} orders
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">
                      {page} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Create PO Dialog ── */}
      <CreatePODialog open={createOpen} onOpenChange={setCreateOpen} storeId={currentStoreId} restockSheetId={restockFrom || null} />

      {/* ── PO Detail Dialog ── */}
      <PODetailView
        po={selectedPO}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onOpenSheet={(t) => {
          // v2.259.0 THE BRANCH'S DOOR — the org ledger's own hand: the
          // detail closes BEFORE the sheet opens (one dialog at a time —
          // the ladder's own shape; the drill's Escape rung rides the
          // SheetDrill from v2.257.0, one home).
          setDetailOpen(false);
          setSheetDrill(t);
        }}
      />
      {sheetDrill && <SheetDrill target={sheetDrill} onClose={() => setSheetDrill(null)} />}
    </div>
  );
}
