'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BarChart3, Package, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, FileText, Boxes,
  ShoppingCart, DollarSign, FileDown,
  Calendar, Clock, Eye, Play, Sparkles, PieChart,
  HeartPulse, RotateCcw, CreditCard, Banknote, Smartphone,
  AlertTriangle, Users, Timer, Printer, Wrench, Sparkle, Link2, ArrowRight,
  Receipt, UserCog, Hourglass, CheckCircle, MessageCircle, Share2, ClipboardList, Phone,
  ArrowDown, ChevronsUpDown, Coins, PackageX, Percent,
  Search, X, PackageSearch,
} from 'lucide-react';
import { LandingChip } from '@/components/landing-chip';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import { useAppStore } from '@/lib/stores';
import {
  reportsApi, dashboardApi,
  customersApi, rentalsApi, transactionsApi,
  formatKES,
  type FastMovingReportData,
  type DeadStockReportData,
} from '@/lib/api';
import { handleError } from '@/lib/error-handler';
import { parseInitialNamedMember, REP_TYPE_FILTERS } from '@/lib/tab-url';
import { DEAD_STOCK_WINDOWS, capitalTiedByCategory, deadStockChorusHeader, deadStockChorusShareUrl, deadStockClearanceNote, deadStockClearanceNotes, deadStockShareUrl, deadStockViewSummary, filterDeadStockRows, sortDeadStockRows, waMeDisplay, type DeadStockRow, type DeadStockSortKey } from '@/lib/reports/dead-stock';
import {
  composeSeriesVoice, composeHourlyVoice,
  composeStockHealthVoice, composeProductsVoice, composeForecastVoice,
  composeNamedTotalsVoice,
} from '@/lib/report-voices';
import { paymentMethodLabel } from '@/lib/analytics-utils';
import type { DashboardStats } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { FilterChip } from '@/components/filter-chip';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';

// Types & helpers for Trends & Predictions

type TrendsRange = '7d' | '30d' | '90d';

// THE REPORTS DESK'S OWN WORD (v2.384.0 — the family's TWENTY-FIFTH): the
// Report Type grid answers the address bar. The desk's daily question,
// "which report am I looking at?", speaks its desk-prefixed
// `?rep-type=sales|inventory|valuation|daily|top_products|customer_analysis|rental_performance|trends|dead_stock`
// v2.461.0: the ninth word — dead_stock, the Dead Stock report (the grid
// completes its three-by-three).
// — the grid's OWN spellings (REP_TYPE_FILTERS, the ONE home in
// tab-url.ts, lowercase, case-sensitive BY LAW: a capitalized word is an
// unknown word, not a clever match) — and wears the landing chip in the
// family's THIRD SHADE-SPLIT, LIME at 300/100 (the hue last spoke at the
// 200/50 storey — the gift-cards desk's word — and a hue may speak twice
// only through a DIFFERENT storey: a family byte the 200-storey can
// never equal). The desk's own badges speak primary, amber, green, blue
// and red, so the deeper lime borrows nothing from any badge. NO
// STAGE TO IMPLY: the reports desk has no sub-tabs — the report type IS
// the stage, and the landed shape is already visible in the grid's own
// Active badge. THE LANDING IS READ ONCE ON THE SHELL: a plain useState
// initializer — a dismissed chip can never resurrect.
type ReportType = (typeof REP_TYPE_FILTERS)[number];

function initialReportType(): ReportType {
  if (typeof window === 'undefined') return 'sales';
  return parseInitialNamedMember(window.location.search, 'rep-type', REP_TYPE_FILTERS, 'sales');
}

// THE DEAD WINDOW'S OWN WORD (v2.462.0 — the deep-link family's next
// wearing): the ninth report's idle window answers the address bar. The
// lens's daily question, "how far back does resting begin?", speaks its
// desk-prefixed `?dead-window=30|60|90` — the window tuple's OWN spellings
// (DEAD_STOCK_WINDOWS, the ONE home in the classifier, read as words) —
// and wears the landing chip in the family's ELEVENTH 300-storey byte:
// ROSE at 300/100, the hue that last spoke at the 200/50 storey (the
// customers desk's word) speaking again through a DIFFERENT storey — a
// family byte the 200-storey can never equal (the shade-split law's next
// form; the registry grew one line for it). THE TWO-STOREY CENSUS WAS
// FULL: every hue had spoken at both storeys, so the family grew rather
// than masquerade. NO STAGE TO IMPLY: the report type IS the stage — the
// window is the lens INSIDE the dead_stock stage, so the chip lives in
// the section's lens row (the banking desk's sub-tab law's shape: it
// hides with the pane and returns when the pane reopens — a hand-driven
// REPORT change is navigation, not a lens change, and never retires it).
// THE DEFAULT WEARS NO CHIP: a landing of ?dead-window=90 speaks the
// shape the bare landing already answers, so the chip names only a
// NON-default lens (the rep-type law's own reading). THE LANDING IS READ
// ONCE ON THE SHELL: a plain useState initializer — a dismissed chip can
// never resurrect. THE LENS WRITES BACK: a hand-driven window turn
// replaceState's the word into the address (the transactions desk's own
// write shape), so a turned lens is a shareable address, never a dead
// end; a blocked write is the lens's silence, never a thrown desk.
function initialDeadWindow(): 30 | 60 | 90 {
  if (typeof window === 'undefined') return 90;
  const word = parseInitialNamedMember(window.location.search, 'dead-window', DEAD_STOCK_WINDOWS.map(String), '90');
  return Number(word) as 30 | 60 | 90;
}

// The write half — the lens's own replaceState (preserve the other
// params: tab, rep-type and every other desk's word ride untouched).
function writeDeadWindowWord(days: 30 | 60 | 90): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    params.set('dead-window', String(days));
    const qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
  } catch {
    // The address never lies louder than the lens — a blocked write
    // leaves the lens on the desk, exactly where the human pressed it.
  }
}

interface GrowingProduct {
  productId: string;
  name: string;
  sku?: string;
  category?: string;
  currentQty: number;
  previousQty: number;
  /** null = NEW: no previous period — a growth % of nothing is never spoken. */
  growthPct: number | null;
  revenue?: number;
}

interface DecliningProduct {
  productId: string;
  name: string;
  sku?: string;
  category?: string;
  currentQty: number;
  previousQty: number;
  declinePct: number;
  /** Real on-hand stock off the trend wire (v2.206.0); null = unknown —
   *  the render drops the "units left" chip instead of inventing a zero. */
  remainingStock: number | null;
  reorderLevel?: number;
}

interface ForecastPoint {
  date: string;
  label: string;
  predicted: number;
  lower?: number;
  upper?: number;
}

interface CategoryTrendRow {
  category: string;
  current: number;
  previous: number;
  changePct: number;
  /** false = the wire returned null growth (no previous period to measure
   *  against) — the cell speaks "new" instead of a fabricated percentage. */
  changeKnown: boolean;
  /** Honest share of the range's category revenue; 0 when the total is 0
   *  (the old undefined-row share rendered NaN% — the live-E2E catch). */
  share: number;
}

interface TrendsAnalysis {
  growing: GrowingProduct[];
  declining: DecliningProduct[];
  forecast: ForecastPoint[];
  categoryTrends: CategoryTrendRow[];
  range: TrendsRange;
  generatedAt?: string;
  isDemo?: boolean;
}

interface RecoItem {
  productId: string;
  name: string;
  sku: string;
  pricePerUnit: number;
  quantityInStock: number;
  coOccurrenceCount: number;
  categoryName: string | null;
}

interface FrequentlyBoughtResult {
  /** Co-bought items for the seeded movers (the route is PRODUCT-scoped:
   *  it rejects a seed-less call with 400 — the imagined store-level "pairs"
   *  call this tab made for its whole life was a guaranteed 400). */
  items: RecoItem[];
  seeds: string[];
  isDemo?: boolean;
  skippedNoSeeds?: boolean;
}

/** Defensive number read for wire fields (module scope: the adapter runs
 *  outside the component; string-typed wire amounts can never poison a row). */
function trendNum(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : 0;
}

/** The trend wire's per-product row shape (GET /api/trends/analysis). */
interface WireTrendProduct {
  productId?: string;
  productName?: string;
  sku?: string;
  categoryName?: string | null;
  currentStock?: number | null;
  recentQty?: number | string;
  previousQty?: number | string;
  recentRevenue?: number | string;
  qtyGrowthPct?: number | null;
}

/** Map ONE wire trend row into the render contract (v2.206.0: the adapter
 *  used to pass the wire through UNMAPPED — the tab rendered
 *  `row.current`/`row.share`/`row.changePct` off a wire that carries
 *  `recentRevenue`/`growthPct`, so every cell was undefined and the table
 *  painted Ksh 0.00 / NaN% on live data, and `trends.growing` was ALWAYS
 *  empty because the wire names it `topGrowing`. The names below are the
 *  contract — checked against the route, pinned by the unit tests. */
function mapTrendProduct(p: WireTrendProduct): GrowingProduct {
  return {
    productId: String(p?.productId ?? ''),
    name: String(p?.productName ?? 'Unnamed product'),
    sku: p?.sku ?? undefined,
    category: p?.categoryName ?? undefined,
    currentQty: trendNum(p?.recentQty),
    previousQty: trendNum(p?.previousQty),
    growthPct: typeof p?.qtyGrowthPct === 'number' ? p.qtyGrowthPct : null,
    revenue: p?.recentRevenue != null ? trendNum(p.recentRevenue) : undefined,
  };
}

/** The SPA session rides localStorage (mbt_token) — the raw fetches below
 *  MUST carry the Authorization header like request() does, or the section
 *  401s on every cookie-less session (the live-E2E caught the whole Trends
 *  section silently dead on a token-only session). */
function sessionAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mbt_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Fetch trends analysis with graceful fallback - works whether or not BE-1
 *  has shipped /api/trends/analysis. Returns a safe empty shape on failure. */
async function fetchTrendsAnalysis(storeId: string, range: TrendsRange): Promise<TrendsAnalysis> {
  const params = new URLSearchParams({ storeId, range });
  const res = await fetch(`/api/trends/analysis?${params.toString()}`, { credentials: 'same-origin', headers: sessionAuthHeaders() });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `Trends API returned ${res.status}`);
  }
  const json = await res.json();
  const d = json?.data ?? json;
  // v2.206.0 THE WIRE'S ACTUAL NAMES: topGrowing / topDeclining /
  // categoryTrends (the old `growing` / `declining` reads mapped nothing —
  // both sections silently rendered their empty states forever).
  const growing = Array.isArray(d?.topGrowing) ? d.topGrowing.map(mapTrendProduct) : [];
  const declining = Array.isArray(d?.topDeclining)
    ? d.topDeclining.map((p: WireTrendProduct) => ({
        ...mapTrendProduct(p),
        declinePct: Math.abs(typeof p?.qtyGrowthPct === 'number' ? p.qtyGrowthPct : 0),
        remainingStock: typeof p?.currentStock === 'number' ? p.currentStock : null,
      }))
    : [];
  const categoryTrends = Array.isArray(d?.categoryTrends)
    ? (() => {
        const rows = d.categoryTrends.map((row: { categoryName?: string | null; recentRevenue?: number | string; previousRevenue?: number | string; growthPct?: number | null }) => ({
          category: String(row?.categoryName ?? 'Uncategorised'),
          current: trendNum(row?.recentRevenue),
          previous: trendNum(row?.previousRevenue),
          changePct: typeof row?.growthPct === 'number' ? row.growthPct : 0,
          changeKnown: typeof row?.growthPct === 'number',
        }));
        // Honest share: current / the range's real category total; a total
        // of nothing shares nothing (0), never NaN.
        const total = rows.reduce((s: number, r: { current: number }) => s + r.current, 0);
        return rows.map((r: (typeof rows)[number]) => ({ ...r, share: total > 0 ? r.current / total : 0 }));
      })()
    : [];
  return {
    growing,
    declining,
    forecast: Array.isArray(d?.forecast) ? d.forecast : [],
    categoryTrends,
    range: (d?.range as TrendsRange) || range,
    generatedAt: d?.generatedAt,
    isDemo: !!d?.isDemo,
  };
}

/** Fetch the co-bought recommendations FOR THE SEEDED MOVERS — the route
 *  is product-scoped and rejects a seed-less call (400). The seeds are the
 *  trends wire's top gainers (the same section already holds them): the
 *  pairing speaks "what moves WITH what moves", never a fabricated pair. */
async function fetchFrequentlyBought(storeId: string, range: TrendsRange | undefined, seedIds: string[]): Promise<FrequentlyBoughtResult> {
  if (seedIds.length === 0) {
    return { items: [], seeds: [], skippedNoSeeds: true };
  }
  const params = new URLSearchParams({ storeId, productIds: seedIds.slice(0, 5).join(',') });
  if (range) params.set('range', range);
  const res = await fetch(`/api/recommendations/frequently-bought?${params.toString()}`, { credentials: 'same-origin', headers: sessionAuthHeaders() });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `Recommendations API returned ${res.status}`);
  }
  const json = await res.json();
  const d = json?.data ?? json;
  const items = Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : [];
  return { items, seeds: seedIds.slice(0, 5) };
}

function ReportTypeCard({
  icon, title, description, isActive, onClick, colorClass, lastGenerated,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  colorClass: string;
  lastGenerated?: string;
  previewThumbnail?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md backdrop-blur-sm ${
        isActive
          ? `border-primary bg-primary/5 ${colorClass} shadow-sm`
          : 'border-transparent bg-muted/30 hover:bg-muted/50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10' : 'bg-muted/50'}`}>
            {icon}
          </div>
          <div>
            <span className="text-sm font-bold">{title}</span>
            {lastGenerated && (
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Last: {lastGenerated}</span>
              </div>
            )}
          </div>
        </div>
        {isActive && (
          <Badge className="text-[9px] bg-primary/10 text-primary border-0">
            <Eye className="mr-1 h-3 w-3" /> Active
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <div className="flex items-center justify-end">
        {/* v2.461.0 THE NESTED BUTTON RETIRES: the card IS the control
            (one click, one keyboard voice) — the Generate affordance was a
            <button> inside that <button>, an HTML law violation that
            hydrated as a console error on every desk visit (the live burst
            caught it). asChild demotes the pill to a span wearing the
            Button's own face: same look, same bubble-to-card behavior, no
            nested interactive control announcing the same action twice. */}
        <Button
          asChild
          size="sm"
          variant={isActive ? 'default' : 'outline'}
          className={`text-xs h-7 ${isActive ? 'bg-primary hover:bg-primary/90' : ''}`}
        >
          <span aria-hidden="true">
            <Play className="mr-1 h-3 w-3" /> Generate
          </span>
        </Button>
      </div>
    </button>
  );
}

// CSS Bar Component

function HorizontalBar({ value, maxValue, colorClass = 'bg-primary/70', height = 'h-4' }: {
  value: number; maxValue: number; colorClass?: string; height?: string;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className={`${height} bg-muted/30 rounded-full overflow-hidden`}>
      <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// Conic Gradient Pie Chart Component

// THE SHAPE'S OWN PRESSES (v2.474.0) — the charts learn to answer the
// ledger: an optional `onPress` turns each segment into a real handle
// (the double voice every handle wears) that rides the segment's own
// word to the caller — the dead-stock desk hands it to the search lens,
// so the shape and the lens share one vocabulary. OPTIONAL by law: the
// callers that pass no `onPress` get byte-for-byte the chart that has
// always rendered (the other desks' faces never move). `pressedLabel`
// dresses the segment whose word the lens already holds (aria-pressed,
// the muted ground, the foreground weight) — the shape's own mirror of
// the lens, never a second state.

function ConicPieChart({ segments, onPress, pressedLabel }: {
  segments: { name: string; value: number; color: string }[];
  onPress?: (label: string) => void;
  pressedLabel?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  const gradientStops = segments.reduce<string[]>((acc, seg, i) => {
    const prevEnd = i === 0 ? 0 : segments.slice(0, i).reduce((s, prev) => s + (prev.value / total) * 100, 0);
    const end = prevEnd + (seg.value / total) * 100;
    acc.push(`${seg.color} ${prevEnd}% ${end}%`);
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-4">
      {/* v2.204.0: the pie speaks its split — the legend beside it carries
          the figures, and the picture now says the same truth in one line
          (loudest first: the segments arrive in caller order, which the
          inventory page sorts by value). */}
      <div
        className="w-32 h-32 rounded-full shrink-0 shadow-inner"
        role="img"
        aria-label={`Category share of inventory value, loudest first: ${segments.map((seg) => `${seg.name} ${((seg.value / total) * 100).toFixed(0)}% (${formatKES(seg.value)})`).join('; ')} — ${formatKES(total)} total`}
        style={{ background: `conic-gradient(${gradientStops.join(', ')})` }}
      />
      <div className="space-y-1.5 min-w-0 flex-1">
        {segments.map((seg, i) => {
          const pressed = onPress != null && pressedLabel === seg.name;
          const face = (
            <>
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
              <span className={`truncate ${pressed ? 'font-semibold' : 'font-medium'}`}>{seg.name}</span>
              <span className="ml-auto text-muted-foreground whitespace-nowrap">
                {formatKES(seg.value)} ({((seg.value / total) * 100).toFixed(0)}%)
              </span>
            </>
          );
          if (!onPress) {
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                {face}
              </div>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPress(seg.name)}
              aria-pressed={pressed}
              aria-label={`Lens the ledger to ${seg.name}`}
              title={`Lens the ledger to ${seg.name} — the segment's own word rides the search lens`}
              className={`flex items-center gap-2 text-xs w-full text-left rounded-sm px-1 py-0.5 transition-colors hover:bg-muted/60 ${pressed ? 'bg-muted' : ''}`}
            >
              {face}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Mini Sparkline Component (CSS-based)

function _MiniSparkline({ data, color = 'text-primary', height = 24 }: {
  data: number[]; color?: string; height?: number;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;

  return (
    <svg width={w} height={height} className={color}>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={data.map((v, i) => {
          const x = (i / (data.length - 1)) * w;
          const y = height - ((v - min) / range) * (height - 4) - 2;
          return `${x},${y}`;
        }).join(' ')}
      />
    </svg>
  );
}

// Date Range Presets Component

type DatePreset = 'today' | 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'last_month' | 'custom';

function getDatePresetRange(preset: DatePreset): { from: string; to: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  switch (preset) {
    case 'today':
      return { from: fmt(now), to: fmt(now) };
    case 'this_week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(now);
      start.setDate(diff);
      return { from: fmt(start), to: fmt(now) };
    }
    case 'this_month':
      return { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: fmt(now) };
    case 'this_quarter': {
      const q = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), q * 3, 1);
      return { from: fmt(start), to: fmt(now) };
    }
    case 'this_year':
      return { from: fmt(new Date(now.getFullYear(), 0, 1)), to: fmt(now) };
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: fmt(start), to: fmt(end) };
    }
    default:
      return { from: fmt(new Date(Date.now() - 30 * 86400000)), to: fmt(now) };
  }
}

// SVG Bar Chart Component

function SVGBarChart({ data, height = 200, ariaLabel, onPress, pressedLabel }: { data: { label: string; value: number; color?: string }[]; height?: number; ariaLabel?: string; onPress?: (label: string) => void; pressedLabel?: string }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 320;
  const barWidth = Math.max(Math.min((w - 20) / data.length - 8, 40), 12);
  const gap = (w - data.length * barWidth) / (data.length + 1);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${height + 30}`}
      className="text-xs"
      role="img"
      aria-label={ariaLabel || `Bar chart, ${data.length} bars`}
    >
      {/* The grounding baseline (a graphics mark: muted at 30% stays a
          non-essential rule, the bars carry the data) */}
      <line x1={gap / 2} y1={height - 20} x2={w - gap / 2} y2={height - 20} className="stroke-muted/40" strokeWidth={1} />
      {data.map((d, i) => {
        const x = gap + i * (barWidth + gap);
        const barH = (d.value / max) * (height - 20);
        const y = height - 20 - barH;
        // THE BAR'S OWN PRESS (v2.474.0) — when the caller hands the
        // chart a door, each bar becomes a real handle (role="button",
        // the double voice, keyboard-reachable): the press rides the
        // bar's own label to the caller; the pressed bar wears the
        // brighter face, the resting ones keep the hover lift. Without
        // the door the bars stay byte-for-byte the graphics they were.
        const pressProps = onPress
          ? {
              role: 'button' as const,
              tabIndex: 0,
              onClick: () => onPress(d.label),
              onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onPress(d.label); },
              'aria-label': `Lens the ledger to ${d.label}`,
              'aria-pressed': pressedLabel === d.label,
              className: 'cursor-pointer',
            }
          : {};
        return (
          <g key={i} {...pressProps}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={3}
              fill={d.color || 'currentColor'}
              className={`transition-[filter] ${pressedLabel === d.label ? 'brightness-125' : 'hover:brightness-110'}`}
            >
              <title>{d.label}: {formatKES(d.value)}</title>
            </rect>
            {/* Data label (tabular-nums: the figures align in the column) */}
            <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" className="fill-muted-foreground text-[9px] tabular-nums">
              {formatKES(d.value)}
            </text>
            {/* X-axis label */}
            <text x={x + barWidth / 2} y={height - 4} textAnchor="middle" className="fill-muted-foreground text-[9px]">
              {d.label.length > 8 ? d.label.slice(0, 8) + '…' : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// SVG Line Chart Component

function SVGLineChart({ data, height = 200, ariaLabel }: { data: { label: string; value: number }[]; height?: number; ariaLabel?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const w = 320;
  const padding = { top: 10, right: 10, bottom: 20, left: 10 };

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * (w - padding.left - padding.right);
    const y = padding.top + (1 - d.value / max) * (height - padding.top - padding.bottom);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = linePath + ` L${points[points.length - 1].x},${height - padding.bottom} L${points[0].x},${height - padding.bottom} Z`;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${height}`}
      className="text-xs"
      role="img"
      aria-label={ariaLabel || `Line chart, ${data.length} points`}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" className="text-primary" />
      <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="text-primary" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" className="fill-primary">
            {/* Hover parity with the bars: the point's own tooltip */}
            <title>{p.label}: {formatKES(p.value)}</title>
          </circle>
          <text x={p.x} y={p.y - 8} textAnchor="middle" className="fill-muted-foreground text-[9px] tabular-nums">
            {formatKES(p.value)}
          </text>
        </g>
      ))}
    </svg>
  );
}

// Trends & Predictions Section

const TRENDS_RANGE_OPTIONS: { value: TrendsRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

// v2.204.0: the legend dots ride the -600 family on the white card ground —
// the old -500 marks measured below the 3:1 graphics bar (emerald 2.54,
// amber 2.15, cyan 2.43); red-500 3.76, violet-500 4.23 and pink-500 3.52
// already cleared it and stay.
const TREND_COLORS = ['#059669', '#d97706', '#ef4444', '#0891b2', '#8b5cf6', '#ec4899'];

// v2.462.0 THE DEAD-STOCK PIE'S VOICES — the -600 family ground (the same
// palette the valuation pie's voices speak; a desk never invents a second
// palette). The bar face needs no palette — the bars wear their own voice.
const DEAD_STOCK_CHART_COLORS = ['#3b82f6', '#16a34a', '#ea580c', '#a855f7', '#0d9488', '#ec4899', '#a16207', '#0891b2', '#65a30d', '#f43f5e'];

function TrendsTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border bg-background p-2 shadow-md text-xs space-y-1">
      <div className="font-medium">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{formatKES(Number(p.value ?? 0))}</span>
        </div>
      ))}
    </div>
  );
}

function TrendsPredictionsSection({ storeId }: { storeId: string }) {
  const [range, setRange] = useState<TrendsRange>('7d');
  const [drilldown, setDrilldown] = useState<{ title: string; rows: React.ReactNode } | null>(null);

  // Trends analysis query - uses direct fetch with graceful fallback
  const { data: trends, isLoading: trendsLoading, error: trendsError } = useQuery<TrendsAnalysis>({
    queryKey: ['trends-analysis', storeId, range],
    queryFn: () => fetchTrendsAnalysis(storeId, range),
    retry: false,
    staleTime: 60_000,
  });

  // Frequently bought together — v2.206.0 THE SEEDED CALL: the route is
  // product-scoped (a seed-less call is a guaranteed 400 — the old store-level
  // fetch failed silently forever, so "Pairs Found" always read 0). The seeds
  // are the trends wire's own top gainers; the query waits for them.
  const seedProductIds = useMemo(
    () => (trends?.growing ?? []).slice(0, 5).map((p) => p.productId).filter(Boolean),
    [trends],
  );
  const { data: reco, isLoading: recoLoading } = useQuery<FrequentlyBoughtResult>({
    queryKey: ['frequently-bought', storeId, range, seedProductIds.join(',')],
    queryFn: () => fetchFrequentlyBought(storeId, range, seedProductIds),
    enabled: seedProductIds.length > 0,
    retry: false,
    staleTime: 60_000,
  });

  // Surface trends fetch errors once
  React.useEffect(() => {
    if (trendsError) {
      const msg = handleError(trendsError, 'Trends analysis');
      // Non-blocking: the section still renders an empty-state card
      console.warn('[Trends] analysis fetch failed:', msg);
    }
  }, [trendsError]);

  // Chart data transforms
  // v2.206.0: the GROWTH BAR only plots MEASURABLE growth — a new product
  // (no previous period) has no percentage to plot, so it stays out of the
  // bars and speaks as "new" in the voice + drill-down instead (a zero
  // bar for a new gainer would be a lie too).
  const growingChart = useMemo(() => {
    return (trends?.growing ?? []).slice(0, 8).filter((p) => p.growthPct != null).map((p) => ({
      label: p.name.length > 16 ? p.name.slice(0, 16) + '…' : p.name,
      fullName: p.name,
      growth: Math.round(p.growthPct ?? 0),
      revenue: p.revenue ?? 0,
    }));
  }, [trends]);

  const growingNewCount = useMemo(
    () => (trends?.growing ?? []).filter((p) => p.growthPct == null).length,
    [trends],
  );

  const decliningChart = useMemo(() => {
    return (trends?.declining ?? []).slice(0, 8).map((p) => ({
      label: p.name.length > 16 ? p.name.slice(0, 16) + '…' : p.name,
      fullName: p.name,
      decline: Math.round(p.declinePct || 0),
      remaining: p.remainingStock,
    }));
  }, [trends]);

  const forecastChart = useMemo(() => {
    return (trends?.forecast ?? []).map((f) => ({
      label: f.label,
      date: f.date,
      predicted: Math.round(Number(f.predicted ?? 0)),
      lower: f.lower != null ? Math.round(Number(f.lower)) : undefined,
      upper: f.upper != null ? Math.round(Number(f.upper)) : undefined,
    }));
  }, [trends]);

  const categoryTrendRows = trends?.categoryTrends ?? [];
  // v2.206.0: the co-bought items + the honest seed names (the wire's own
  // movers — the card names WHAT the pairings are relative to).
  const recoItems = reco?.items ?? [];
  const recoSeeds = useMemo(
    () => (trends?.growing ?? []).slice(0, 5).filter((p) => seedProductIds.includes(p.productId)).map((p) => p.name),
    [trends, seedProductIds],
  );
  const recoSeedsSpoken = recoSeeds.length > 0
    ? recoSeeds.slice(0, 3).join(', ') + (recoSeeds.length > 3 ? ` +${recoSeeds.length - 3} more` : '')
    : null;

  const forecastTotal = forecastChart.reduce((s, f) => s + f.predicted, 0);
  const forecastPeak = forecastChart.reduce((m, f) => Math.max(m, f.predicted), 0);

  // ======================================================================
  // v2.205.0 THE ARIA SWEEP (trends section): the three recharts surfaces
  // here ride generic wrappers no longer — each speaks a composed aria from
  // the rows this section already fetched. One-writer rule: the strings
  // come from src/lib/report-voices.ts.
  // ======================================================================
  const growingVoice = useMemo(() => composeProductsVoice(
    'Growing products, growth percent',
    (trends?.growing ?? []).map(p => ({
      name: p.name,
      growthPct: p.growthPct,
      revenueFigure: p.revenue != null && p.revenue > 0 ? formatKES(p.revenue) : undefined,
    })),
  ), [trends?.growing]);

  const decliningVoice = useMemo(() => composeProductsVoice(
    'Declining products, decline percent',
    (trends?.declining ?? []).map(p => ({
      name: p.name,
      growthPct: Math.abs(p.declinePct || 0),
      revenueFigure: p.remainingStock != null ? `${p.remainingStock} units left` : 'on-hand stock unknown',
    })),
  ), [trends?.declining]);

  // The forecast voice: the wire carries predicted points and bounds only —
  // no method field exists, so none is spoken (the honest-figure law: the
  // voice stays silent where the wire is silent).
  const forecastVoice = useMemo(() => composeForecastVoice(
    'Revenue forecast',
    forecastChart.map(p => ({ label: p.label, predictedFigure: formatKES(p.predicted ?? 0) })),
    { hasBounds: forecastChart[0]?.upper != null },
  ), [forecastChart]);

  return (
    <div className="space-y-4">
      {/* Header bar with range selector */}
      <Card className="backdrop-blur-sm bg-card/80 border-border/50">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                <Sparkles className="h-4 w-4 text-primary" />
                Trends &amp; Predictions
                {trends?.isDemo && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30">
                    Demo Data
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Growing / declining products, 7-day revenue forecast, category trends &amp; frequently-bought-together insights.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-muted-foreground">Range:</Label>
              <Select value={range} onValueChange={(v) => setRange(v as TrendsRange)}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRENDS_RANGE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Top KPI row: forecast total + growing/declining counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-green-500 backdrop-blur-sm bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">7-Day Forecast</p>
            </div>
            <p className="text-2xl font-bold">{formatKES(forecastTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">Projected revenue</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 backdrop-blur-sm bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              <p className="text-sm text-muted-foreground">Growing</p>
            </div>
            {/* v2.206.0: the count speaks the WIRE's full gainer list (new
                products included); the bars plot measurable growth only. */}
            <p className="text-2xl font-bold">{(trends?.growing ?? []).length}</p>
            <p className="text-xs text-muted-foreground mt-1">Top gainers{growingNewCount > 0 ? ` · ${growingNewCount} new` : ''}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 backdrop-blur-sm bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              <p className="text-sm text-muted-foreground">Declining</p>
            </div>
            <p className="text-2xl font-bold">{decliningChart.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Need reorder</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary backdrop-blur-sm bg-card/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkle className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">Pairs Found</p>
            </div>
            <p className="text-2xl font-bold">{recoItems.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{recoSeeds.length > 0 ? `Co-bought with ${recoSeeds.length} mover${recoSeeds.length !== 1 ? 's' : ''}` : 'Awaiting movers to seed'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts grid: growing + declining side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Growing Products */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-green-700" />
                Top Growing Products
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                disabled={growingChart.length === 0}
                onClick={() => setDrilldown({
                  title: 'Top Growing Products - Detail',
                  rows: (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Current Qty</TableHead>
                          <TableHead className="text-right">Prev Qty</TableHead>
                          <TableHead className="text-right">Growth %</TableHead>
                          <TableHead className="text-right">Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(trends?.growing ?? []).map((p) => (
                          <TableRow key={p.productId}>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell className="text-muted-foreground">{p.category || '-'}</TableCell>
                            <TableCell className="text-right">{p.currentQty}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{p.previousQty}</TableCell>
                            <TableCell className="text-right">
                              {p.growthPct != null ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                                  +{Math.round(p.growthPct || 0)}%
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">new</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">{p.revenue != null ? formatKES(p.revenue) : '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ),
                })}
              >
                Details <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {trendsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : growingChart.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <TrendingUp className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {growingNewCount > 0
                    ? `No measurable growth yet — ${growingNewCount} product${growingNewCount !== 1 ? 's' : ''} sold with no previous-period baseline.`
                    : 'No growing products in this range.'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Try a wider range or check back after more sales are recorded.</p>
              </div>
            ) : (
              <div className="h-64" role="img" aria-label={growingVoice}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growingChart} layout="vertical" margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" tickFormatter={(v: number) => `${v}%`} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" width={120} />
                    <Tooltip
                      cursor={{ fill: 'rgba(16,185,129,0.08)' }}
                      content={({ active, payload }) => {
                        if (!active || !payload || payload.length === 0) return null;
                        const p = payload[0].payload as { fullName: string; growth: number; revenue: number };
                        return (
                          <div className="rounded-md border bg-background p-2 shadow-md text-xs space-y-1">
                            <div className="font-medium">{p.fullName}</div>
                            <div className="text-muted-foreground">Growth: <span className="font-medium text-green-700">+{p.growth}%</span></div>
                            {p.revenue > 0 && <div className="text-muted-foreground">Revenue: <span className="font-medium">{formatKES(p.revenue)}</span></div>}
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="growth" name="Growth %" fill="#059669" radius={[0, 4, 4, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Declining Products */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
                Top Declining Products
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                disabled={decliningChart.length === 0}
                onClick={() => setDrilldown({
                  title: 'Top Declining Products - Reorder Warnings',
                  rows: (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Current Qty</TableHead>
                          <TableHead className="text-right">Prev Qty</TableHead>
                          <TableHead className="text-right">Decline %</TableHead>
                          <TableHead className="text-right">Remaining Stock</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(trends?.declining ?? []).map((p) => (
                          <TableRow key={p.productId}>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell className="text-muted-foreground">{p.category || '-'}</TableCell>
                            <TableCell className="text-right">{p.currentQty}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{p.previousQty}</TableCell>
                            <TableCell className="text-right">
                              <Badge className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                                -{Math.round(p.declinePct || 0)}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={p.remainingStock <= (p.reorderLevel ?? 0) ? 'text-red-600 font-medium' : ''}>
                                {p.remainingStock}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ),
                })}
              >
                Details <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {trendsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : decliningChart.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <TrendingDown className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No declining products in this range.</p>
                <p className="text-xs text-muted-foreground mt-1">All products are moving well - no reorders needed.</p>
              </div>
            ) : (
              <>
                <div className="h-56" role="img" aria-label={decliningVoice}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={decliningChart} layout="vertical" margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} className="text-muted-foreground" tickFormatter={(v: number) => `${v}%`} />
                      <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" width={120} />
                      <Tooltip
                        cursor={{ fill: 'rgba(239,68,68,0.08)' }}
                        content={({ active, payload }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const p = payload[0].payload as { fullName: string; decline: number; remaining: number | null };
                          return (
                            <div className="rounded-md border bg-background p-2 shadow-md text-xs space-y-1">
                              <div className="font-medium">{p.fullName}</div>
                              <div className="text-muted-foreground">Decline: <span className="font-medium text-red-600">-{p.decline}%</span></div>
                              <div className="text-muted-foreground">Remaining: <span className="font-medium">{p.remaining != null ? `${p.remaining} units` : 'unknown'}</span></div>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="decline" name="Decline %" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Reorder warning strip */}
                <div className="mt-3 rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-2 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    {decliningChart.length} product{decliningChart.length !== 1 ? 's' : ''} showing declining sales - review reorder levels and consider promotions or restocking.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Sales Forecast (line chart) */}
      <Card className="backdrop-blur-sm bg-card/80 border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                7-Day Sales Forecast
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Linear projection of next-7-days revenue · Total: <strong>{formatKES(forecastTotal)}</strong> · Peak day: <strong>{formatKES(forecastPeak)}</strong>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {trendsLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : forecastChart.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center">
              <Sparkle className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No forecast data available.</p>
              <p className="text-xs text-muted-foreground mt-1">Forecasts generate once enough sales history is available.</p>
            </div>
          ) : (
            <div className="h-72" role="img" aria-label={forecastVoice}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastChart} margin={{ top: 5, right: 16, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                    width={50}
                  />
                  <Tooltip content={<TrendsTooltipContent />} />
                  {forecastChart[0]?.upper != null && (
                    <Area
                      type="monotone"
                      dataKey="upper"
                      name="Upper bound"
                      stroke="#16a34a"
                      strokeDasharray="4 4"
                      fill="none"
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    name="Predicted revenue"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fill="url(#forecastGrad)"
                  />
                  {forecastChart[0]?.lower != null && (
                    <Area
                      type="monotone"
                      dataKey="lower"
                      name="Lower bound"
                      stroke="#d97706"
                      strokeDasharray="4 4"
                      fill="none"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Trends + Frequently Bought Together */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Trends */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-amber-700" />
              Category Trends
            </CardTitle>
            <CardDescription className="text-xs">Revenue share &amp; growth by category</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            {trendsLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : categoryTrendRows.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-center">
                <PieChart className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No category trends data.</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">Previous</TableHead>
                      <TableHead className="text-right">Share</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryTrendRows.map((row, i) => (
                      <TableRow key={`${row.category}-${i}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: TREND_COLORS[i % TREND_COLORS.length] }}
                            />
                            <span className="font-medium">{row.category}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatKES(row.current)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{formatKES(row.previous)}</TableCell>
                        <TableCell className="text-right">{(row.share * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-right">
                          {/* v2.206.0: no previous period → the cell speaks
                              "new"; a fabricated % of nothing is never rendered
                              (the NaN% table the live E2E caught is dead). */}
                          {!row.changeKnown ? (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" variant="outline">new</Badge>
                          ) : (
                            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                              row.changePct >= 0 ? 'text-green-700' : 'text-red-600'
                            }`}>
                              {row.changePct >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {Math.abs(Math.round(row.changePct))}%
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Frequently Bought Together */}
        <Card className="backdrop-blur-sm bg-card/80 border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  Frequently Bought Together
                </CardTitle>
                <CardDescription className="text-xs">
                  {recoSeedsSpoken
                    ? `Co-bought with the tracked movers: ${recoSeedsSpoken}`
                    : 'Cross-sell opportunities for the sales team'}
                </CardDescription>
              </div>
              {reco?.isDemo && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-400 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30">
                  Demo
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            {recoLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : recoItems.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center">
                <Link2 className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {reco?.skippedNoSeeds
                    ? 'No tracked movers yet to seed the pairing.'
                    : 'No co-bought patterns in the recorded transactions yet.'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Patterns emerge once multi-item transactions are recorded.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {recoItems.slice(0, 10).map((item, i) => (
                  <div
                    key={`${item.productId}-${i}`}
                    className="rounded-lg border bg-muted/20 p-2.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                        co-bought {item.coOccurrenceCount}×
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-muted-foreground">
                        {item.categoryName ?? 'Uncategorised'}
                        {' · '}{formatKES(item.pricePerUnit)}
                        {' · '}<span className="tabular-nums">{item.quantityInStock} in stock</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.sku ? `SKU: ${item.sku}` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drilldown dialog */}
      <ResponsiveDialog
        open={!!drilldown}
        onOpenChange={(open) => { if (!open) setDrilldown(null); }}
        title={drilldown?.title}
        size="xl"
        footer={<Button variant="outline" onClick={() => setDrilldown(null)}>Close</Button>}
      >
        <div className="overflow-x-auto">{drilldown?.rows}</div>
      </ResponsiveDialog>
    </div>
  );
}

// ======================================================================
// Dead Stock (v2.461.0) — the ninth report's face
// ======================================================================

/** THE DEAD STOCK SECTION — capital at rest, spoken honestly. The wire
 *  and the window state live in the desk (the query re-answers when the
 *  window turns); this component renders the faces:
 *
 *   • THE WINDOW LENS — 30/60/90-day chips riding the filter-chip loom
 *     (the tint dialect's amber word, so the resting capital's colour is
 *     the amber family's own): aria-pressed and the zinc keyboard ring
 *     come with the loom, never hand-rolled.
 *   • THE SUMMARY — three accent cards (the desk's border-l-4 face):
 *     capital tied (rose — the money's own alarm), dead products (amber),
 *     and the dead share of total stock value (primary). tabular-nums on
 *     every figure.
 *   • THE LEDGER — sorted by capital tied (the loudest first), each row
 *     speaking its last sale date or the honest "never" badge (a null is
 *     a voice, not a zero), and the idle days coloured by age: rose past
 *     180, amber below, "—" for the never-sold (the badge already said
 *     it — two voices for one fact would be a stutter).
 *   • THE EMPTY TRUTH — a resting shelf with nothing dead is GOOD news:
 *     the empty state says so, plainly.
 */
interface DeadStockSectionProps {
  rows: DeadStockReportData['rows'];
  summary: DeadStockReportData['summary'] | null;
  isLoading: boolean;
  days: 30 | 60 | 90;
  onDaysChange: (days: 30 | 60 | 90) => void;
  // v2.462.0: the chart's voice — the desk's own toggle state rides down,
  // so the section draws the face the human picked (bar or pie; the
  // time-series voices cannot be picked for this report).
  chartType: 'bar' | 'line' | 'area' | 'pie';
  // v2.462.0: the landing chip's faces — the landed word and its
  // liveness live at the DESK (they survive the pane's unmount/remount,
  // the banking desk's law), the section only wears them.
  deadWindowLandingLive: boolean;
  landedDeadWindow: 30 | 60 | 90;
  onDismissDeadWindowLanding: () => void;
  // v2.467.0: the share door's pre-address — the store's own contact
  // (name + phone on file), fetched once at the desk and handed down.
  // null keeps the picker door: a store without a phone speaks no
  // address, and the chip says so (silence is the honest no-address).
  // v2.468.0: the picker chip's promise grew a door — the section also
  // rides the store id, so its edit dialog can WRITE the number (the
  // owner-only PATCH) and invalidate this very wire: the chip flips
  // live, no other tab, no re-load.
  storeContact: { name: string; phone: string } | null;
  // v2.468.0: the desk's own store — the edit dialog's write address.
  storeId: string;
}

function DeadStockSection({ rows, summary, isLoading, days, onDaysChange, chartType, deadWindowLandingLive, landedDeadWindow, onDismissDeadWindowLanding, storeContact, storeId }: DeadStockSectionProps) {
  // THE EDIT DOOR'S STATE (v2.468.0) — the dialog's own words: open,
  // draft, saving. The draft starts empty every open — a dialog that
  // shows a stale number would be a lie when the wire refetches.
  const queryClient = useQueryClient();
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);
  // THE SORT DOOR (v2.472.0) — the ledger answers to its own columns:
  // the resting face is 'capital' (the classifier's own standing order,
  // so the desk opens exactly as it always has), and one press on the
  // Days idle header speaks the shelf's patience. The orders live in
  // the ONE home (sortDeadStockRows) — the desk never hand-sorts.
  // THE SEARCH DOOR (v2.473.0) — the ledger answers to its own name:
  // the lens above the table answers to the words a row already carries
  // (the name, the SKU, the category), composed in the ONE home
  // (filterDeadStockRows) — the desk never hand-filters either. The two
  // lenses compose in ONE memo (filter first, then sort — a narrower
  // shelf wearing the same honest order); the memo rides
  // [rows, deadStockSearch, deadStockSort] and nothing else, and the
  // view/archive law holds — the file, the clipboard and the print door
  // keep the canonical rows (the lens is a viewer, never a rewrite).
  const [deadStockSort, setDeadStockSort] = useState<DeadStockSortKey>('capital');
  const [deadStockSearch, setDeadStockSearch] = useState('');
  const sortedRows = useMemo(
    () => sortDeadStockRows(filterDeadStockRows(rows, deadStockSearch), deadStockSort),
    [rows, deadStockSearch, deadStockSort],
  );
  // THE VIEW'S OWN WORD (v2.475.0) — the pressed lens's own mirror: the
  // view's count, the view's own capital at cost, and the view's slice
  // of the ledger's rest, composed in the ONE home (deadStockViewSummary)
  // — the desk never hand-sums, the same law the sort and the lens
  // speak. The lensPressed flag is the footer's own gate: a resting lens
  // keeps the summary cards as the only voice (a footer that repeated
  // them would be a stutter), and a lens that answers nothing already
  // wears its own empty face. The view/archive law holds — the file, the
  // clipboard's copy all chorus and the print door keep the canonical
  // rows; this word is the VIEW's own, spoken about what the desk is
  // looking at.
  const lensPressed = deadStockSearch.trim() !== '';
  const viewVoice = useMemo(
    () => deadStockViewSummary(sortedRows, rows),
    [sortedRows, rows],
  );
  // THE CAPITAL'S SHAPE — the chart's own grouping, read from the ONE
  // home (the classifier's pure voice). The rows are already on the
  // desk; zero new fetches, the lens re-answers and the shape follows.
  const capitalByCategory = useMemo(() => capitalTiedByCategory(rows), [rows]);
  // THE ROWS' OWN BARS (v2.471.0) — the loudest debt's own yardstick:
  // the largest single row's capital, from the rows already on the
  // desk (never a second wire). The bar under each capital figure
  // speaks the row's share OF THE LOUDEST row — the same deterministic
  // order the table already wears (capital DESC), drawn.
  const maxCapitalTied = useMemo(
    () => (rows.length > 0 ? Math.max(...rows.map((r) => r.capitalTied)) : 0),
    [rows],
  );
  // THE PIE'S VOICES — the -600 family ground (the same palette the
  // valuation pie speaks; a desk never invents a second palette).
  const categorySegments = useMemo(
    () => capitalByCategory.map((c, i) => ({
      name: c.label,
      value: c.value,
      color: DEAD_STOCK_CHART_COLORS[i % DEAD_STOCK_CHART_COLORS.length],
    })),
    [capitalByCategory],
  );
  // THE ASK — the clipboard's own door (the inventory desk's copy-order
  // shape): the note rides out, the toast answers; a refused clipboard
  // speaks its side and the row stays whole.
  const copyClearanceNote = useCallback(async (row: DeadStockRow) => {
    try {
      await navigator.clipboard.writeText(deadStockClearanceNote(row, days));
      toast.success(`Clearance note copied — ${row.name}`);
    } catch {
      toast.error('Could not copy the clearance note — the clipboard refused.');
    }
  }, [days]);
  // THE SHARE'S OWN DOOR (v2.463.0) — the note's second door: the SAME
  // deterministic word (one voice, two doors — the composer is never
  // re-typed here) rides out to the maker's own WhatsApp chat. The
  // row names no supplier, so the URL carries no phone — WhatsApp opens
  // with the text pre-filled and the maker picks the chat. A browser
  // that blocks the window speaks its side: the toast answers, the row
  // stays whole (the vouchers desk's popup-blocked honesty law).
  // v2.467.0: the door learns the store's own number — the store
  // contact's phone rides the SAME composer's third word, so the door
  // pre-addresses to the store's own chat when the branch keeps a
  // phone on file; without one the composer keeps the picker door (the
  // ONE home's own guard — the desk never re-implements it).
  const shareClearanceNote = useCallback((row: DeadStockRow) => {
    const win = window.open(deadStockShareUrl(row, days, storeContact?.phone), '_blank', 'noopener,noreferrer');
    if (!win) toast.error('The browser blocked the share window — copy the note instead.');
  }, [days, storeContact]);
  // THE LEDGER'S CHORUS (v2.465.0) — the collective door: one press
  // carries EVERY row's clearance note to the clipboard, composed in the
  // ONE home (the header line speaks the ledger's own summary, the lines
  // under it are the SAME per-row note the Ask copies — never a re-typed
  // word). A refused clipboard speaks its side; the ledger stays whole
  // (the Ask handle's own honesty law).
  const copyAllClearanceNotes = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(deadStockClearanceNotes(rows, days));
      toast.success(`All ${rows.length} clearance notes copied`);
    } catch {
      toast.error('Could not copy the clearance notes — the clipboard refused.');
    }
  }, [rows, days]);
  // THE CHORUS'S CHAT DOOR (v2.476.0) — the collective word's own
  // reach-out: one press opens WhatsApp with the WHOLE clearance chorus
  // pre-filled — the SAME collective composer the Copy all handle carries
  // to the clipboard (one voice, never a re-typed word), pre-addressed to
  // the store's own chat when the branch keeps a phone on file (the
  // contact's phone rides the composer's third word — the ONE home's own
  // guard, the desk never re-implements it), the chat picker answering
  // for the branch with none. A browser that blocks the window speaks
  // its side: the toast answers, the ledger stays whole (the share
  // door's popup-blocked honesty law, the row share's own word grown
  // plural). The handle sings the CANONICAL rows — the archive's word,
  // the same rows the Copy all handle carries (the view/archive law).
  const shareAllClearanceNotes = useCallback(() => {
    const win = window.open(deadStockChorusShareUrl(rows, days, storeContact?.phone), '_blank', 'noopener,noreferrer');
    if (!win) toast.error('The browser blocked the share window — copy the notes instead.');
  }, [rows, days, storeContact]);
  // THE EDIT DOOR'S SAVE (v2.468.0) — the picker chip's promise kept:
  // the owner-only PATCH writes the number org-scoped (a foreign store
  // is a calm 404), the toast answers with the display word, and the
  // desk's OWN wire invalidates — the chip flips live, no other tab, no
  // re-load. A short draft refuses locally before the wire ever moves.
  const saveStorePhone = useCallback(async () => {
    const trimmed = phoneDraft.trim();
    if (trimmed.length < 7) {
      toast.error('The phone needs at least 7 digits — the door cannot address a shorter word.');
      return;
    }
    setPhoneSaving(true);
    try {
      const res = await fetch('/api/stores/phone', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { ...sessionAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, phone: trimmed }),
      });
      if (!res.ok) {
        toast.error('Could not save the store phone — the write was refused.');
        return;
      }
      toast.success(`Store phone saved — shares open pre-addressed (${waMeDisplay(trimmed)})`);
      setPhoneDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['dead-stock-store-contact', storeId] });
    } catch {
      toast.error('Could not save the store phone — the wire refused.');
    } finally {
      setPhoneSaving(false);
    }
  }, [phoneDraft, storeId, queryClient]);
  return (
    <div className="space-y-3" data-testid="dead-stock-section">
      {/* The window lens — the loom's tint dialect, the amber word.
          v2.462.0: the lens answers the address bar, so the row also
          wears the landing chip when the lens LANDED from a shared word
          (the rose family byte — the shade-split law's next form). The
          chip lives HERE because the window is a lens INSIDE the
          dead_stock stage: it hides with the pane and returns when the
          pane reopens, and only a hand-driven WINDOW turn retires it. */}
      <div className="flex items-center gap-2 flex-wrap">
        <Label className="text-xs font-medium">Idle window:</Label>
        {DEAD_STOCK_WINDOWS.map((d) => (
          <FilterChip
            key={d}
            active={days === d}
            onClick={() => onDaysChange(d)}
            testId={`dead-stock-window-${d}`}
            ariaLabel={`Show products with no sales in the last ${d} days`}
            tone="amber"
            variant="tint"
          >
            {d} days
          </FilterChip>
        ))}
        {deadWindowLandingLive && landedDeadWindow !== 90 && (
          <LandingChip
            hue="rose"
            label={`landed ?dead-window=${landedDeadWindow}`}
            onDismiss={onDismissDeadWindowLanding}
            title="The idle window landed with this word from the address bar — press to clear it"
            data-testid="dead-window-landing-word"
          />
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Card className="border-l-4 border-l-rose-500 backdrop-blur-sm bg-card/80 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Coins className="h-3 w-3" aria-hidden="true" /> Capital Tied</p>
                <p className="text-2xl font-bold text-rose-700 dark:text-rose-400 tabular-nums" data-testid="dead-stock-capital">{formatKES(summary.totalCapitalTied)}</p>
                <p className="text-[10px] text-muted-foreground mt-1">qty × cost price, idle {summary.days}+ days</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500 backdrop-blur-sm bg-card/80 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><PackageX className="h-3 w-3" aria-hidden="true" /> Dead Products</p>
                <p className="text-2xl font-bold tabular-nums" data-testid="dead-stock-count">{summary.deadCount}</p>
                <p className="text-[10px] text-muted-foreground mt-1">holding stock, no sale in the window</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary backdrop-blur-sm bg-card/80 transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Percent className="h-3 w-3" aria-hidden="true" /> Share of Stock Value</p>
                <p className="text-2xl font-bold tabular-nums" data-testid="dead-stock-share">{summary.deadSharePct}%</p>
                {/* v2.464.0: the share DRAWN — a thin rose bar under the
                    number, the resting share at a glance (the family's
                    own word, never a second palette). Purely visual:
                    the number above IS the voice — a second label would
                    be a stutter, so the bar stays aria-hidden. */}
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden" aria-hidden="true" data-testid="dead-stock-share-bar">
                  <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, summary.deadSharePct))}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">of total inventory value (qty × cost)</p>
              </CardContent>
            </Card>
          </div>

          {/* v2.462.0 THE CAPITAL'S SHAPE — the ninth report's chart face,
              rendered from the rows already on the desk. The toggle's
              reachable voices for this report are bar and pie (the
              time-series words cannot be picked here); whatever the
              state carries, the categorical capital draws one of the two
              honest faces — a line/area state inherited from another
              report reads as the bar, never as a time-series lie. A
              resting shelf with nothing dead draws nothing: the empty
              state above already spoke the good news. */}
          {rows.length > 0 && (
            <Card className="backdrop-blur-sm bg-card/80" data-testid="dead-stock-chart">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Capital by category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartType === 'pie' ? (
                  <div data-testid="dead-stock-chart-pie">
                    {/* THE SHAPE'S PRESSES (v2.474.0) — the pie's legend
                        rows are real handles: one press rides the
                        segment's own word (the Uncategorised shelf's
                        word included) into the search lens, and the
                        segment whose word the lens already holds wears
                        the pressed face. The shape keeps
                        the WHOLE ledger's capital — the chart reads the
                        canonical rows, never the lensed view; a press
                        re-words the lens, never the picture. */}
                    <ConicPieChart
                      segments={categorySegments}
                      onPress={(label) => setDeadStockSearch(label)}
                      pressedLabel={deadStockSearch.trim()}
                    />
                  </div>
                ) : (
                  <div data-testid="dead-stock-chart-bar">
                    <SVGBarChart
                      data={capitalByCategory}
                      height={200}
                      onPress={(label) => setDeadStockSearch(label)}
                      pressedLabel={deadStockSearch.trim()}
                      ariaLabel={`Capital tied by category — ${capitalByCategory.length} categories, ${formatKES(summary?.totalCapitalTied ?? 0)} resting`}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="backdrop-blur-sm bg-card/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Hourglass className="h-4 w-4" /> Dead Stock Ledger
                  </CardTitle>
                  {/* THE DOOR'S STATE, SPOKEN (v2.467.0) — the share door's
                      address is a fact of the branch, so the ledger header
                      says which door answers: a store with a phone on file
                      wears the pre-addressed face (the emerald chip, the
                      Phone icon the store's own word — the family's green,
                      never a second palette), and a store without one wears
                      the quiet picker face. A status word, not a handle:
                      the chip carries a title (the hover voice) and NO
                      aria-label — its text IS the voice, and the census's
                      three handles stay three. */}
                  {storeContact ? (
                    <span
                      className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                      title={`Share opens WhatsApp pre-addressed to ${storeContact.name} (${waMeDisplay(storeContact.phone)})`}
                      data-testid="dead-stock-share-addressed"
                    >
                      <Phone className="h-2.5 w-2.5" /> Shares pre-addressed to {storeContact.name} · {waMeDisplay(storeContact.phone)}
                    </span>
                  ) : (
                    /* THE EDIT DOOR (v2.468.0) — the picker face grew its
                       press: the quiet status chip is now a real button,
                       the double voice every handle wears (aria-label
                       names the ACTION, title carries the promise, the
                       text speaks the state), the dashed border the
                       pressable hint. One press opens the dialog; a
                       save flips this very face live. The census grows
                       its fourth voice — the dated re-key holds it. */
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 -ml-2 px-2 text-[10px] text-muted-foreground hover:text-foreground border border-dashed border-border/60"
                      aria-label="Add the store's share phone"
                      title="Add the store's phone to pre-address the share door — press to add it"
                      onClick={() => { setPhoneDraft(''); setPhoneDialogOpen(true); }}
                      data-testid="dead-stock-share-unaddressed"
                    >
                      <Share2 className="h-2.5 w-2.5" /> Shares open with the chat picker
                    </Button>
                  )}
                </div>
                {/* THE CHORUS'S SEAT (v2.465.0) — the count badge and the
                    Copy all handle read as one instrument: the ledger's
                    size beside the ledger's collective voice. The handle
                    wears the compact face (h-7, the row actions' smaller
                    sibling), the emerald hover the share handle speaks
                    (the copy toast's own green — a success promised in
                    the family's word), and the double voice every row
                    action wears. It only shows when rows exist — a
                    button that copies nothing would be a lie. */}
                {/* THE COUNT ANSWERS THE LENS (v2.473.0) — a resting
                    lens speaks the ledger's whole size, a pressed lens
                    speaks the honest fraction ("2 of 6 products"): the
                    badge is the lens's own mirror, never a second
                    count. The Copy all handle keeps the WHOLE chorus —
                    the archive's word, the lens's law. */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]" data-testid="dead-stock-ledger-count">{deadStockSearch.trim() ? `${sortedRows.length} of ${rows.length} products` : `${rows.length} products`}</Badge>
                  {rows.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid="dead-stock-copy-all"
                      aria-label={`Copy all ${rows.length} clearance notes`}
                      title={`Copy all ${rows.length} clearance notes`}
                      onClick={copyAllClearanceNotes}
                      className="h-7 px-2.5 text-xs hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300 dark:hover:border-emerald-800"
                    >
                      <ClipboardList className="h-3 w-3 mr-1" /> Copy all
                    </Button>
                  )}
                  {/* THE CHORUS'S CHAT DOOR (v2.476.0) — the Copy all
                      handle's sibling: the same compact face (h-7, the
                      row actions' smaller sibling), the share family's
                      emerald hover (the share handle's own word — the
                      green the copy toast speaks, never a second
                      palette), the double voice every handle wears, and
                      the same honesty — it only shows when rows exist
                      (a button that shares nothing would be a lie). The
                      census grows its tenth voice — the dated re-key
                      holds it. */}
                  {rows.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid="dead-stock-share-all"
                      aria-label={`Share all ${rows.length} clearance notes on WhatsApp`}
                      title={`Share all ${rows.length} clearance notes on WhatsApp`}
                      onClick={shareAllClearanceNotes}
                      className="h-7 px-2.5 text-xs hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300 dark:hover:border-emerald-800"
                    >
                      <Share2 className="h-3 w-3 mr-1" /> Share all
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3" data-testid="dead-stock-empty">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium">Nothing rests — every product with stock sold within {summary.days} days</p>
                  <p className="text-xs text-muted-foreground">Widen the window to look further back</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* THE SEARCH DOOR (v2.473.0) — the ledger answers to
                      its own name. The lens sits above the table and
                      answers as the maker types to the words a row
                      already carries (the name, the SKU, the category —
                      composed in the ONE home filterDeadStockRows, the
                      desk never hand-filters). Its own face: the family's
                      search glass at the input's left, the clear × that
                      only speaks when a word is pressed (a clear button
                      on an empty lens would clear nothing — a lie), the
                      focus ring the family already wears, and the double
                      voice every handle wears (aria-label + the testid;
                      the placeholder is the hint, not the voice). The
                      input is the census's seventh voice, the × its
                      eighth. */}
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    <input
                      type="text"
                      value={deadStockSearch}
                      onChange={(e) => setDeadStockSearch(e.target.value)}
                      placeholder="Search name, SKU or category"
                      aria-label="Search the ledger by name, SKU or category"
                      data-testid="dead-stock-search"
                      className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-8 text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring"
                    />
                    {deadStockSearch.trim() !== '' && (
                      <button
                        type="button"
                        aria-label="Clear the ledger search"
                        title="Clear the ledger search"
                        onClick={() => setDeadStockSearch('')}
                        data-testid="dead-stock-search-clear"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto custom-scrollbar" data-testid="dead-stock-table">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Qty on hand</TableHead>
                        <TableHead className="text-right">Unit cost</TableHead>
                        {/* THE SORT DOOR'S HEADERS (v2.472.0) — Capital
                            tied and Days idle answer to their own column:
                            one press speaks that column's honest order
                            (the ONE home's sortDeadStockRows composes,
                            the desk only presses). The pressed column
                            wears aria-sort + the family's ArrowDown;
                            the resting one wears ChevronsUpDown and the
                            muted tone — the door's own face, the family's
                            dialect, never a second palette. */}
                        <TableHead className="text-right" aria-sort={deadStockSort === 'capital' ? 'descending' : undefined}>
                          <button
                            type="button"
                            data-testid="dead-stock-sort-capital"
                            aria-label="Sort the ledger by capital tied, the loudest debt first"
                            title="Sort the ledger by capital tied, the loudest debt first"
                            onClick={() => setDeadStockSort('capital')}
                            className={`inline-flex items-center gap-1 transition-colors ${deadStockSort === 'capital' ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            Capital tied
                            {deadStockSort === 'capital'
                              ? <ArrowDown className="h-3 w-3" aria-hidden="true" />
                              : <ChevronsUpDown className="h-3 w-3 opacity-60" aria-hidden="true" />}
                          </button>
                        </TableHead>
                        <TableHead>Last sold</TableHead>
                        <TableHead className="text-right" aria-sort={deadStockSort === 'idle' ? 'descending' : undefined}>
                          <button
                            type="button"
                            data-testid="dead-stock-sort-idle"
                            aria-label="Sort the ledger by days idle, the never-sold first"
                            title="Sort the ledger by days idle, the never-sold first"
                            onClick={() => setDeadStockSort('idle')}
                            className={`inline-flex items-center gap-1 transition-colors ${deadStockSort === 'idle' ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            Days idle
                            {deadStockSort === 'idle'
                              ? <ArrowDown className="h-3 w-3" aria-hidden="true" />
                              : <ChevronsUpDown className="h-3 w-3 opacity-60" aria-hidden="true" />}
                          </button>
                        </TableHead>
                        <TableHead className="text-right">Ask</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* THE SORT DOOR'S BODY (v2.472.0) — the table reads
                          the pressed order (sortedRows); the file, the
                          clipboard and the print door keep the canonical
                          rows (the view/archive law — the sort is a
                          lens, never a rewrite). */}
                      {/* THE LENS'S OWN EMPTY (v2.473.0) — a pressed lens
                          that answers nothing speaks honestly: the words
                          the maker asked for, the ledger's whole size
                          (nothing was deleted — the lens is a viewer,
                          the archive keeps every row), and the clear
                          handle that rests the lens. The census's ninth
                          voice. The table row spans the ledger's eight
                          columns — one honest face where the rows would
                          stand. */}
                      {sortedRows.length === 0 ? (
                        <TableRow data-testid="dead-stock-lens-empty">
                          <TableCell colSpan={8} className="py-10">
                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                              <PackageSearch className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                              <p className="text-sm font-medium">No product answers to “{deadStockSearch.trim()}”</p>
                              <p className="text-xs text-muted-foreground">The lens rests empty — the ledger keeps all {rows.length} resting products</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 px-2.5 text-xs"
                                aria-label="Clear the ledger search and see every resting product"
                                title="Clear the ledger search and see every resting product"
                                onClick={() => setDeadStockSearch('')}
                                data-testid="dead-stock-lens-clear"
                              >
                                Clear the search
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedRows.map((r, i) => {
                        // The idle voice: rose past half a year, amber
                        // below; the never-sold row already wears its
                        // badge, so its days cell keeps quiet.
                        const idleTone = r.daysIdle == null
                          ? ''
                          : r.daysIdle >= 180
                            ? 'text-rose-700 dark:text-rose-400 font-semibold'
                            : 'text-amber-700 dark:text-amber-400';
                        return (
                          <TableRow key={r.productId} data-testid={`dead-stock-row-${i}`}>
                            <TableCell>
                              <p className="text-sm font-medium">{r.name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{r.sku}</p>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{r.categoryName ?? 'Uncategorised'}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.quantityInStock}</TableCell>
                            <TableCell className="text-right tabular-nums">{formatKES(r.costPrice)}</TableCell>
                            <TableCell className="text-right tabular-nums font-semibold">
                              {formatKES(r.capitalTied)}
                              {/* THE ROWS' OWN BARS (v2.471.0) — the capital
                                  cell wears the summary bar's own dialect
                                  (the bg-muted track, the rose-500 fill —
                                  the family's word, never a second palette):
                                  the row's share of the loudest row, drawn
                                  under the figure. Purely visual — the
                                  number above IS the voice — so the bar
                                  stays aria-hidden. */}
                              <div aria-hidden="true" className="mt-1 h-1 rounded-full bg-muted overflow-hidden" data-testid={`dead-stock-capital-bar-${i}`}>
                                <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, maxCapitalTied > 0 ? (r.capitalTied / maxCapitalTied) * 100 : 0))}%` }} />
                              </div>
                            </TableCell>
                            <TableCell>
                              {r.lastSoldAt ? (
                                <span className="text-xs tabular-nums">{new Date(r.lastSoldAt).toLocaleDateString()}</span>
                              ) : (
                                <Badge variant="outline" className="text-[9px] bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900" data-testid={i === 0 ? 'dead-stock-never-badge' : undefined}>never sold</Badge>
                              )}
                            </TableCell>
                            <TableCell className={`text-right tabular-nums text-xs ${idleTone}`}>
                              {r.daysIdle ?? '—'}
                            </TableCell>
                            {/* THE ASK (v2.462.0) — the row's own voice to
                                the maker: one press carries the clearance
                                note to the clipboard. The handle wears the
                                double voice (aria-label + title), the
                                outline face every desk's row actions
                                wear, and the composer lives in the ONE
                                home — the button only presses it. */}
                            {/* THE PAIR (v2.463.0) — the row action's two
                                doors side by side: the Ask (the clipboard)
                                and the Share (the chat), a tight group so
                                the pair reads as one instrument with two
                                mouths. The share handle wears the emerald
                                hover — the green the family already speaks
                                (the empty state's good-news word) — and the
                                same double voice every row action wears. */}
                            <TableCell className="text-right">
                              <div className="inline-flex items-center justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  data-testid={`dead-stock-note-${i}`}
                                  aria-label={`Copy clearance note for ${r.name}`}
                                  title={`Copy clearance note for ${r.name}`}
                                  onClick={() => copyClearanceNote(r)}
                                >
                                  <MessageCircle className="h-3.5 w-3.5 mr-1" /> Ask
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  data-testid={`dead-stock-share-${i}`}
                                  aria-label={`Share clearance note for ${r.name} on WhatsApp`}
                                  title={`Share clearance note for ${r.name} on WhatsApp`}
                                  onClick={() => shareClearanceNote(r)}
                                  className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300 dark:hover:border-emerald-800"
                                >
                                  <Share2 className="h-3.5 w-3.5" /> Share
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                      )}
                    </TableBody>
                  </Table>
                </div>
                  {/* THE VIEW'S OWN WORD (v2.475.0) — the pressed lens's
                      own mirror under the table: the honest fraction (the
                      badge's own shape), the view's own capital at cost
                      (the family's rose word), and the view's slice of
                      the ledger's rest drawn in the share-bar's own
                      dialect (the bg-muted track, the rose-500 fill).
                      The window lens's amber ground dresses the strip —
                      the lens family's own tone, never a second palette.
                      A spoken word, never a handle: no new voice joins
                      the census. aria-live speaks the answer as the lens
                      changes; the slice bar stays aria-hidden — the
                      numbers above ARE the voice. */}
                  {lensPressed && sortedRows.length > 0 && (
                    <div
                      className="rounded-md border border-amber-200/70 bg-amber-50/60 px-3 py-2 dark:border-amber-900/60 dark:bg-amber-950/20"
                      data-testid="dead-stock-view-voice"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-xs text-amber-800 dark:text-amber-300" aria-live="polite">
                          <span className="font-semibold tabular-nums">{viewVoice.count} of {rows.length}</span> products in view ·{' '}
                          <span className="font-semibold text-rose-700 dark:text-rose-400 tabular-nums">{formatKES(viewVoice.capital)}</span> tied in view
                        </p>
                        <p className="text-[10px] text-muted-foreground tabular-nums">{viewVoice.sharePct}% of the ledger’s rest</p>
                      </div>
                      <div aria-hidden="true" className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden" data-testid="dead-stock-view-slice">
                        <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, viewVoice.sharePct))}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* THE EDIT DOOR'S DIALOG (v2.468.0) — the picker chip's promise
              kept on the desk where the promise lives: one Input for the
              number, the door's own normalize spoken as the helper word
              (never the host's name in the desk's bytes — the v2463 census
              law), Enter saves, the save invalidates the desk's own wire
              and the chip flips in place. The write is the owner-only
              PATCH — the dialog only ever opens the conversation. */}
          <ResponsiveDialog
            open={phoneDialogOpen}
            onOpenChange={setPhoneDialogOpen}
            title="The store's share phone"
            description="The number the share door pre-addresses — WhatsApp opens the store's own chat."
            size="sm"
            footer={
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setPhoneDialogOpen(false)} disabled={phoneSaving}>Cancel</Button>
                <Button
                  size="sm"
                  onClick={saveStorePhone}
                  disabled={phoneSaving}
                  data-testid="dead-stock-phone-save"
                  title="Save the store's share phone"
                >
                  {phoneSaving ? 'Saving…' : 'Save phone'}
                </Button>
              </div>
            }
          >
            <div className="space-y-2 py-1">
              <Label htmlFor="store-share-phone" className="text-xs font-medium">Phone number</Label>
              <Input
                id="store-share-phone"
                value={phoneDraft}
                onChange={(e) => setPhoneDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !phoneSaving) saveStorePhone(); }}
                placeholder="07… or +254…"
                autoComplete="tel"
                inputMode="tel"
                disabled={phoneSaving}
                data-testid="dead-stock-phone-input"
              />
              <p className="text-[10px] text-muted-foreground">Spaces and dashes ride out; a leading 0 grows to 254 — the same normalize the URL itself speaks.</p>
            </div>
          </ResponsiveDialog>
        </>
      ) : null}
    </div>
  );
}

// Main Reports Tab Component

export default function ReportsTab() {
  const currentStoreId = useAppStore((s) => s.currentStoreId);
  // THE TWENTY-FIFTH WORD's seed: read ONCE at desk mount through the ONE
  // home — a dismissed chip can never resurrect (the initializer only
  // runs when the desk itself mounts). The landed capture rides the same
  // write-once useState door the tax desk's two words speak.
  const [landedRepType] = useState<ReportType>(initialReportType);
  const [reportType, setReportType] = useState<ReportType>(initialReportType);
  const [repLandingLive, setRepLandingLive] = useState(true);
  // THE DEAD WINDOW'S LANDING (v2.462.0): read ONCE at desk mount through
  // the same write-once door — the capture rides the initializer, the
  // liveness rides the door the rep-type chip speaks. A hand-driven
  // WINDOW turn retires the chip (the lens changed — the address's word
  // no longer names it); a hand-driven REPORT change never does (the
  // banking desk's law — the chip hides with the pane and returns when
  // the pane reopens, because navigation is not a lens change).
  const [landedDeadWindow] = useState<30 | 60 | 90>(initialDeadWindow);
  const [deadWindowLandingLive, setDeadWindowLandingLive] = useState(true);
  // THE DEAD STOCK WIRE'S LENS STATE (v2.461.0; the address answer joined
  // v2.462.0) — declared beside the door that turns it, so the callback's
  // closure reads a binding the desk has already met.
  const [deadStockDays, setDeadStockDays] = useState<30 | 60 | 90>(initialDeadWindow);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'pie'>('bar');
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');

  // a hand-driven shape change retires the landing word — the chip
  // speaks the ADDRESS BAR's landing, never the human's next choice.
  // EVERY path that changes the shape rides this one door.
  const chooseReportType = useCallback((value: ReportType) => {
    setReportType((prev) => {
      if (prev !== value) setRepLandingLive(false);
      return value;
    });
  }, []);

  // THE DEAD WINDOW'S DOOR (v2.462.0): EVERY path that turns the lens
  // rides this one callback — the chip retires when the lens actually
  // moved (agreement is no news), and the address writes the lens's word
  // back so the turned lens is a shareable address. THE UPDATER STAYS
  // PURE (React's own law — StrictMode double-invokes it): the retire
  // and the write live OUTSIDE the setState, read from the closure's own
  // lens. The write is a FACT ride (the lens's truth), never a gate: the
  // desk works identically when the history API refuses.
  const chooseDeadWindow = useCallback((value: 30 | 60 | 90) => {
    if (deadStockDays === value) {
      setDeadStockDays(value);
      return;
    }
    setDeadStockDays(value);
    setDeadWindowLandingLive(false);
    writeDeadWindowWord(value);
  }, [deadStockDays]);

  // Initialize from preset
  const presetRange = useMemo(() => getDatePresetRange(datePreset), [datePreset]);
  const [dateFrom, setDateFrom] = useState(presetRange.from);
  const [dateTo, setDateTo] = useState(presetRange.to);

  // Sync dates when preset changes
  React.useEffect(() => {
    if (datePreset !== 'custom') {
      const range = getDatePresetRange(datePreset);
      setDateFrom(range.from);
      setDateTo(range.to);
    }
  }, [datePreset]);

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-report', currentStoreId, dateFrom, dateTo],
    queryFn: () => reportsApi.getSalesReport({ storeId: currentStoreId, dateFrom, dateTo }),
    enabled: reportType === 'sales' || reportType === 'daily' || reportType === 'top_products' || reportType === 'customer_analysis',
  });

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventory-report', currentStoreId],
    queryFn: () => reportsApi.getInventoryReport(currentStoreId),
    enabled: reportType === 'inventory' || reportType === 'valuation',
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard', currentStoreId],
    queryFn: () => dashboardApi.getStats(currentStoreId),
  });

  // Fast-moving aggregation — v2.206.0 THE REAL SOURCE: the step-aside is
  // GONE. The reports tab now fetches GET /api/reports/fast-moving (the
  // purpose-built sold-quantity aggregation: SaleItems → per-product
  // quantity/revenue/saleCount over the picked range) and the Top Products
  // section speaks REAL figures — chart, ranks, CSV export all ride the
  // same array. Only fetched when the tab actually shows top products.
  const { data: fastMovingData, isLoading: fastMovingLoading } = useQuery({
    queryKey: ['fast-moving-report', currentStoreId, dateFrom, dateTo],
    queryFn: () => reportsApi.getFastMovingReport({ storeId: currentStoreId, dateFrom, dateTo, limit: 20 }),
    enabled: reportType === 'top_products',
  });

  // v2.461.0 THE DEAD STOCK WIRE — the ninth report's source. The window
  // is STATE (the lens's three words — declared beside its door above),
  // so the wire re-answers when the window turns; enabled only when the
  // desk shows the report.
  // v2.462.0: the lens ANSWERS THE ADDRESS BAR — the initializer reads
  // ?dead-window through the ONE home (the window tuple's own words), so
  // a shared lens lands already turned.
  const { data: deadStockData, isLoading: deadStockLoading } = useQuery({
    queryKey: ['dead-stock-report', currentStoreId, deadStockDays],
    queryFn: () => reportsApi.getDeadStockReport({ storeId: currentStoreId, days: deadStockDays }),
    enabled: reportType === 'dead_stock',
  });
  // NAMING AS CONTRACT, the client side: the wire's array rides `rows` —
  // outside the request() normalizer's unwrap list — so the summary
  // survives beside it. The array rides its own useMemo so the CSV
  // callback's dependency list stays stable across unrelated renders
  // (the lint's own law — a conditional init would churn the deps).
  const deadStockWire = deadStockData?.data as DeadStockReportData | undefined;
  const deadStockRows = useMemo(
    () => (Array.isArray(deadStockWire?.rows) ? deadStockWire.rows : []),
    [deadStockWire],
  );
  const deadStockSummary = deadStockWire?.summary ?? null;

  // v2.467.0 THE SHARE DOOR'S PRE-ADDRESS — the store's own contact.
  // The /api/stores wire is session-validated and already exposes the
  // Store model's phone column; the desk picks ITS OWN store's row and
  // hands the contact down (the DeadStockSection wears the chip, the
  // share door and the CSV column all ride the SAME word). A store
  // without a phone answers null — the picker door, honestly kept.
  // enabled only on the dead-stock stage: the ninth report's wire, the
  // desk adds no fetches for the eight reports that never read it.
  const { data: deadStockStoreContact } = useQuery({
    queryKey: ['dead-stock-store-contact', currentStoreId],
    queryFn: async (): Promise<{ name: string; phone: string } | null> => {
      const res = await fetch('/api/stores', { credentials: 'same-origin', headers: sessionAuthHeaders() });
      if (!res.ok) return null;
      const json = await res.json() as { data?: Array<{ id: string; name: string; phone: string | null }> };
      const store = (json.data ?? []).find((s) => s.id === currentStoreId);
      return store?.phone ? { name: store.name, phone: store.phone } : null;
    },
    enabled: reportType === 'dead_stock',
    staleTime: 5 * 60_000,
  });

  // Customer data for customer analysis report
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['customers-report', currentStoreId],
    queryFn: () => customersApi.list({ storeId: currentStoreId, limit: 100 }),
    enabled: reportType === 'customer_analysis',
  });

  // Transactions data for customer analysis
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions-report', currentStoreId, dateFrom, dateTo],
    queryFn: () => transactionsApi.list({ storeId: currentStoreId, dateFrom, dateTo, limit: 200 }),
    enabled: reportType === 'customer_analysis',
  });

  // Rentals data for rental performance report
  const { data: rentalsData, isLoading: rentalsLoading } = useQuery({
    queryKey: ['rentals-report', currentStoreId],
    queryFn: () => rentalsApi.list({ storeId: currentStoreId, limit: 100 }),
    enabled: reportType === 'rental_performance',
  });

  const salesReport = salesData?.data;
  // v2.205.0 THE WIRE-SHAPE FIX (live-E2E found): GET /api/reports/inventory
  // returns { data: products[], summary: {...} } — the client's data slot is
  // the PRODUCTS ARRAY, and the stats the tab always meant to read live in
  // `summary` (totalProducts / lowStockCount / outOfStockCount /
  // totalStockValue / healthyStockCount). Reading them off the array gave
  // undefined → the gauge's NaN%, a Ksh 0.00 value card and empty charts on
  // EVERY store. The summary is read where it actually rides; the products
  // array (the same response, no new query) feeds the category breakdown.
  const inventoryProducts = Array.isArray(inventoryData?.data) ? inventoryData?.data ?? [] : [];
  const inventorySummary = inventoryData?.summary ?? null;
  const dashboardStats = dashboardData?.data;

  // v2.205.0 THE HONESTY PASS: the quick stats keep ONLY what the dashboard
  // wire carries. The four hardcoded change chips (12.5 / 8.3 / -5.0 / 3.2)
  // were fabricated in code and rendered as recorded data — deleted. Every
  // sub-line below is computed from a REAL wire figure or stays silent.
  const quickStats = useMemo(() => ({
    todayRevenue: dashboardStats?.todayRevenue || 0,
    todayTransactions: dashboardStats?.todayTransactions || 0,
    lowStockProducts: dashboardStats?.lowStockProducts || 0,
    outstandingDebt: dashboardStats?.outstandingDebt || 0,
  }), [dashboardStats]);

  // Real quick-stat companions from the same wire (all optional — a figure
  // the wire doesn't carry leaves a silent card, never an invented one).
  const quickStatCompanions = useMemo(() => {
    const wire = dashboardStats as (DashboardStats & {
      paymentMethodBreakdown?: { method: string; count: number; amount: number }[];
      lowStockCount?: number;
      outOfStockCount?: number;
    }) | undefined;
    const methods = Array.isArray(wire?.paymentMethodBreakdown)
      ? wire?.paymentMethodBreakdown ?? []
      : [];
    const loudest = methods.reduce<(typeof methods)[number] | null>(
      (best, m) => (m.amount > (best?.amount ?? -1) ? m : best), null);
    const outOfStock = wire?.outOfStockCount;
    return {
      loudestMethod: loudest ? paymentMethodLabel(loudest.method) : null,
      loudestMethodAmount: loudest ? formatKES(loudest.amount) : null,
      avgTicket: quickStats.todayTransactions > 0
        ? formatKES(quickStats.todayRevenue / quickStats.todayTransactions)
        : null,
      outOfStock: typeof outOfStock === 'number' ? outOfStock : null,
    };
  }, [dashboardStats, quickStats.todayRevenue, quickStats.todayTransactions]);

  // The category breakdown is COMPUTED from the products the same wire
  // already carries (group by category, value = stockValue — the cost-basis
  // figure the summary's totalStockValue sums). Zero new queries.
  const categoryBreakdown = useMemo(() => {
    const byCat = new Map<string, { name: string; productCount: number; totalValue: number }>();
    inventoryProducts.forEach((p: { category?: { name?: string } | null; stockValue?: number }) => {
      const name = p?.category?.name || 'Uncategorized';
      const row = byCat.get(name) ?? { name, productCount: 0, totalValue: 0 };
      row.productCount += 1;
      row.totalValue += typeof p?.stockValue === 'number' ? p.stockValue : 0;
      byCat.set(name, row);
    });
    return [...byCat.values()].sort((a, b) => b.totalValue - a.totalValue);
  }, [inventoryProducts]);

  // v2.205.0 THE HONESTY PASS (helper hoisted v2.206.0 above its first
  // caller — the fast-moving useMemo reads it during render, a const arrow
  // below that point would be a temporal-dead-zone throw):
  /** Defensive number read (the dashboard-tab's num(), mirrored here so the
   *  hourly wire's string amounts can never poison the chart). */
  const num = (v: unknown): number => {
    const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
    return Number.isFinite(n) ? n : 0;
  };

  // v2.206.0 THE REAL SOURCE: topProducts now rides the fast-moving wire —
  // the per-product sold-quantity aggregation the tab never had. The old
  // step-aside ("the wire carries no sold-quantity figure") is history; the
  // chart, the rank list, the voice and the CSV export all speak the same
  // real array. Quantity comes off the wire as a number (the route emits
  // .toNumber()); the defensive read keeps a hostile payload at zero.
  const topProducts: { productId: string; productName: string; quantitySold: number; revenue: number }[] =
    useMemo(() => {
      const wire = fastMovingData?.data as FastMovingReportData | undefined;
      const rows = Array.isArray(wire?.fastMovers) ? wire.fastMovers : [];
      return rows
        .map((p) => ({
          productId: p.productId,
          productName: p.productName,
          quantitySold: num(p.totalQuantitySold),
          revenue: num(p.totalRevenue),
        }))
        .filter((p) => p.quantitySold > 0 || p.revenue > 0);
    }, [fastMovingData]);

  // The wire's own summary — the honest totals above the list (units moved,
  // products moved, revenue collected) instead of a fabricated chip.
  const fastMovingSummary = useMemo(() => {
    const wire = fastMovingData?.data as FastMovingReportData | undefined;
    if (!wire?.summary) return null;
    return {
      totalUnitsSold: num(wire.summary.totalUnitsSold),
      totalProductsSold: num(wire.summary.totalProductsSold),
      totalRevenue: num(wire.summary.totalRevenue),
    };
  }, [fastMovingData]);

  const maxCategoryValue = Math.max(...categoryBreakdown.map((c) => c.totalValue), 1);

  const pieSegments = useMemo(() => {
    // v2.204.0: the category pie's voices re-voice to the -600 family (the
    // same ground as the TREND_COLORS legend dots above).
    const colors = [
      '#3b82f6', '#16a34a', '#ea580c', '#a855f7',
      '#0d9488', '#ec4899', '#a16207', '#0891b2', '#65a30d', '#f43f5e',
    ];
    return categoryBreakdown.map((cat, i) => ({
      name: cat.name,
      value: cat.totalValue,
      color: colors[i % colors.length],
    }));
  }, [categoryBreakdown]);

  const stockHealth = useMemo(() => {
    if (!inventorySummary) return 0;
    // The wire's own healthyStockCount when it rides; else the computed
    // difference, floored at zero. Number() so string-typed wire fields can
    // never produce NaN again (the live-E2E lesson this round).
    const total = Number(inventorySummary.totalProducts ?? 0);
    const healthy = Number(inventorySummary.healthyStockCount ?? Math.max(total - Number(inventorySummary.lowStockCount ?? 0) - Number(inventorySummary.outOfStockCount ?? 0), 0));
    if (!total) return 0;
    return Math.round((healthy / total) * 100);
  }, [inventorySummary]);

  const inventoryTurnover = useMemo(() => {
    if (!inventorySummary || !salesReport) return 0;
    const value = Number(inventorySummary.totalStockValue ?? 0);
    if (value === 0) return 0;
    return (salesReport.totalRevenue / value).toFixed(2);
  }, [inventorySummary, salesReport]);

  const _salesSparkline = [35, 48, 42, 55, 50, 62, 58, 72, 65, 78, 70, 85];

  const paymentMethodIcons: Record<string, React.ReactNode> = {
    CASH: <Banknote className="h-4 w-4" />,
    MPESA: <Smartphone className="h-4 w-4" />,
    DEBT: <CreditCard className="h-4 w-4" />,
  };

  // v2.205.0 THE HONESTY PASS: the "daily/hourly" chart now speaks the REAL
  // recorded hours the tab's ALREADY-FETCHED dashboard wire carries
  // (hourlySalesBreakdown on GET /api/dashboard — live-verified: 10AM 7,500 /
  // 11AM 43,000 / 12PM 0 on the seeded day). The Math.random per-render
  // fabrication is gone. Same real series also feeds the chart's aria.

  /** Defensive number read (the dashboard-tab's num(), mirrored here so the
   *  hourly wire's string amounts can never poison the chart). */

  const dailyHourlyData = useMemo(() => {
    // The envelope vs the data slot (the live-E2E caught this): the query
    // result is ApiResponse<DashboardStats> — the hourly series rides at
    // .data.hourlySalesBreakdown, not on the envelope itself.
    const wire = dashboardData?.data as { hourlySalesBreakdown?: { hour: string; amount: number; transactionCount: number }[] } | null | undefined;
    const breakdown = Array.isArray(wire?.hourlySalesBreakdown) ? wire?.hourlySalesBreakdown ?? [] : [];
    const byHour = new Map<number, number>();
    breakdown.forEach((h) => {
      const k = parseInt(String(h?.hour ?? ''), 10);
      if (Number.isNaN(k)) return;
      byHour.set(k, (byHour.get(k) ?? 0) + num(h?.amount));
    });
    // Business hours 8 AM - 6 PM, matching the chart's previous window; a
    // quiet hour stays on the axis saying 0 (never dropped).
    return Array.from({ length: 11 }, (_, i) => {
      const hour = i + 8;
      const hourLabel = `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'PM' : 'AM'}`;
      return { label: hourLabel, value: byHour.get(hour) ?? 0 };
    });
  }, [dashboardData]);

  // Inventory Valuation data
  const valuationData = useMemo(() => {
    if (categoryBreakdown.length === 0) return [];
    return categoryBreakdown.map(cat => ({
      label: cat.name,
      value: cat.totalValue,
      // v2.204.0: same -600 re-voice as the pie (bars on the white card).
      color: ['#3b82f6', '#16a34a', '#ea580c', '#a855f7', '#0d9488', '#ec4899'][categoryBreakdown.indexOf(cat) % 6],
    }));
  }, [categoryBreakdown]);

  // Top Products bar chart data
  const topProductsChartData = useMemo(() => {
    return topProducts.slice(0, 8).map(p => ({
      label: p.productName,
      value: p.revenue,
      // v2.204.0: the -600 re-voice (bars on the white card ground).
      color: ['#16a34a', '#3b82f6', '#ea580c', '#a855f7', '#0d9488', '#ec4899', '#a16207', '#0891b2'][topProducts.indexOf(p) % 8],
    }));
  }, [topProducts]);

  // Hoisted (v2.206.0): the rank list's share denominator — was recomputed
  // per row inside the map (an O(n²) re-spread every row).
  const maxTopProductsRevenue = Math.max(...topProducts.map(p => p.revenue), 1);

  // Customer Analysis data
  const customerAnalysis = useMemo(() => {
    const customers = Array.isArray(customersData?.data) ? customersData.data : [];
    const transactions = Array.isArray(transactionsData?.data) ? transactionsData.data : [];
    if (customers.length === 0) return { topCustomers: [], paymentMethods: [], customerCount: 0, totalSpent: 0, avgSpend: 0, debtTotal: 0 };

    // Aggregate spending per customer
    const customerSpending = new Map<string, { name: string; totalSpent: number; transactionCount: number; phone: string | null; debtBalance: number }>();
    for (const c of customers) {
      customerSpending.set(c.id, { name: c.name, totalSpent: 0, transactionCount: 0, phone: c.phone, debtBalance: c.currentDebtBalance });
    }
    for (const t of transactions) {
      if (t.customerId) {
        const existing = customerSpending.get(t.customerId);
        if (existing) {
          existing.totalSpent += t.totalAmount;
          existing.transactionCount += 1;
        }
      }
    }

    const topCustomers = Array.from(customerSpending.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    // Payment method breakdown from transactions
    const pmMap = new Map<string, { count: number; amount: number }>();
    for (const t of transactions) {
      const existing = pmMap.get(t.paymentMethod) || { count: 0, amount: 0 };
      existing.count += 1;
      existing.amount += t.totalAmount;
      pmMap.set(t.paymentMethod, existing);
    }
    const paymentMethods = Array.from(pmMap.entries()).map(([method, data]) => ({ method, ...data }));

    const totalSpent = topCustomers.reduce((s, c) => s + c.totalSpent, 0);
    // v2.453.0 THE REDUCE SWEEP — the live confession: this reduce summed
    // the customers wire's raw Decimal-as-string and the digits GLUED
    // ("0" + "3500" + "1200" = "035001200" — the Outstanding Debt card
    // read Ksh 35,001,200.00 for Ksh 4,700.00 of real debt). The wire
    // coerces at its own boundary now; the seat keeps its own Number()
    // anyway — defense in depth, the invoices-stats law (v2.452.0).
    const debtTotal = customers.reduce((s, c) => s + Number(c.currentDebtBalance), 0);

    return {
      topCustomers,
      paymentMethods,
      customerCount: customers.length,
      totalSpent,
      avgSpend: customers.length > 0 ? totalSpent / customers.length : 0,
      debtTotal,
    };
  }, [customersData, transactionsData]);

  // Customer chart data for Recharts
  const customerChartData = useMemo(() => {
    return customerAnalysis.topCustomers.slice(0, 8).map(c => ({
      name: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name,
      revenue: c.totalSpent,
      transactions: c.transactionCount,
    }));
  }, [customerAnalysis]);

  // Rental Performance data
  const rentalPerformance = useMemo(() => {
    const rentals = Array.isArray(rentalsData?.data) ? rentalsData.data : [];
    if (rentals.length === 0) return { activeRentals: 0, returnedRentals: 0, totalRevenue: 0, avgRentalValue: 0, utilization: 0, statusBreakdown: [], topRented: [], revenueByStatus: [] };

    const activeRentals = rentals.filter(r => r.status === 'ACTIVE').length;
    const returnedRentals = rentals.filter(r => r.status === 'RETURNED').length;
    const totalRevenue = rentals.reduce((s, r) => s + (r.totalRentalCharge || 0), 0);
    const avgRentalValue = rentals.length > 0 ? totalRevenue / rentals.length : 0;
    const utilization = rentals.length > 0 ? Math.round((activeRentals / rentals.length) * 100) : 0;

    // Status breakdown
    const statusMap = new Map<string, number>();
    for (const r of rentals) {
      statusMap.set(r.status, (statusMap.get(r.status) || 0) + 1);
    }
    const statusBreakdown = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    // Revenue by status
    const revStatusMap = new Map<string, number>();
    for (const r of rentals) {
      revStatusMap.set(r.status, (revStatusMap.get(r.status) || 0) + (r.totalRentalCharge || 0));
    }
    const revenueByStatus = Array.from(revStatusMap.entries()).map(([status, revenue]) => ({ status, revenue }));

    return { activeRentals, returnedRentals, totalRevenue, avgRentalValue, utilization, statusBreakdown, topRented: rentals.slice(0, 8), revenueByStatus };
  }, [rentalsData]);

  // Rental chart data for Recharts
  const rentalChartData = useMemo(() => {
    return rentalPerformance.revenueByStatus.map(r => ({
      name: r.status,
      revenue: r.revenue,
    }));
  }, [rentalPerformance]);

  // ======================================================================
  // v2.205.0 THE ARIA SWEEP — the composed voices. Each memo reads ONLY
  // the data its chart already holds (zero new queries); the strings are
  // composed by src/lib/report-voices.ts (the one-writer rule). The tab's
  // formatKES voice ("Ksh") is the only currency voice here (v2.201.1).
  // ======================================================================
  const valuationVoice = useMemo(() => composeSeriesVoice(
    'Inventory valuation by category',
    valuationData.map(d => ({ label: d.label, value: d.value, figure: formatKES(d.value) })),
    formatKES(valuationData.reduce((s, d) => s + d.value, 0)),
  ), [valuationData]);

  const hourlyVoice = useMemo(() => composeHourlyVoice(
    dailyHourlyData.map(d => ({ label: d.label, value: d.value, figure: formatKES(d.value) })),
  ), [dailyHourlyData]);

  // v2.206.0: the voice now carries the REAL quantity beside each figure —
  // "Cement (12 sold) Ksh 50,200.00 (40%)" — composed from the same
  // fast-moving array the chart and the rank list speak. Ksh voice kept
  // (the v2.205 guard test bans a literal KES here).
  const topProductsVoice = useMemo(() => composeSeriesVoice(
    'Top products by revenue',
    topProducts.slice(0, 8).map(p => ({
      label: `${p.productName} (${p.quantitySold} sold)`,
      value: p.revenue,
      figure: formatKES(p.revenue),
    })),
    formatKES(topProducts.slice(0, 8).reduce((s, p) => s + p.revenue, 0)),
  ), [topProducts]);

  const customerChartVoice = useMemo(() => composeNamedTotalsVoice(
    'Top customers by spending',
    customerChartData.map(d => ({ label: d.name, value: d.revenue, figure: formatKES(d.revenue) })),
    formatKES(customerChartData.reduce((s, d) => s + d.revenue, 0)),
  ), [customerChartData]);

  const rentalChartVoice = useMemo(() => composeNamedTotalsVoice(
    'Revenue by rental status',
    rentalChartData.map(d => ({ label: d.name, value: d.revenue, figure: formatKES(d.revenue) })),
    formatKES(rentalChartData.reduce((s, d) => s + d.revenue, 0)),
  ), [rentalChartData]);

  const stockHealthVoice = useMemo(() => composeStockHealthVoice({
    healthy: Math.max(Number(inventorySummary?.healthyStockCount ?? Math.max(Number(inventorySummary?.totalProducts ?? 0) - Number(inventorySummary?.lowStockCount ?? 0) - Number(inventorySummary?.outOfStockCount ?? 0), 0)), 0),
    low: Number(inventorySummary?.lowStockCount ?? 0),
    outOfStock: Number(inventorySummary?.outOfStockCount ?? 0),
    total: Number(inventorySummary?.totalProducts ?? 0),
  }), [inventorySummary]);

  // (growing/declining/forecast voices live inside TrendsPredictionsSection —
  // that sub-component owns the trends wire; ReportsTab only composes voices
  // for the surfaces it renders itself.)

  // CSV Export function
  const handleCSVExport = useCallback(() => {
    let csvContent = '';
    const filename = `mbumah_${reportType}_report_${dateFrom}_${dateTo}.csv`;

    if (reportType === 'sales' && salesReport) {
      csvContent = 'Metric,Value\n';
      csvContent += `Total Revenue,${salesReport.totalRevenue}\n`;
      csvContent += `Transaction Count,${salesReport.transactionCount}\n`;
      csvContent += `Average Transaction,${salesReport.avgTransactionValue}\n`;
      csvContent += `Total Tax,${salesReport.totalTax}\n`;
      csvContent += `Total Discount,${salesReport.totalDiscount}\n`;
      csvContent += '\nPayment Method,Count,Amount\n';
      for (const pm of (Array.isArray(salesReport.byPaymentMethod) ? salesReport.byPaymentMethod : [])) {
        csvContent += `${pm.method},${pm.count},${pm.amount}\n`;
      }
    } else if ((reportType === 'inventory' || reportType === 'valuation') && inventorySummary) {
      csvContent = 'Category,Product Count,Total Value\n';
      for (const cat of categoryBreakdown) {
        csvContent += `${cat.name},${cat.productCount},${cat.totalValue}\n`;
      }
      csvContent += `\nTotal Products,${inventorySummary.totalProducts}\n`;
      csvContent += `Low Stock,${inventorySummary.lowStockCount}\n`;
      csvContent += `Out of Stock,${inventorySummary.outOfStockCount}\n`;
      csvContent += `Total Inventory Value,${inventorySummary.totalStockValue}\n`;
    } else if (reportType === 'top_products' && topProducts.length > 0) {
      csvContent = 'Rank,Product Name,Quantity Sold,Revenue\n';
      topProducts.forEach((p, i) => {
        csvContent += `${i + 1},"${p.productName}",${p.quantitySold},${p.revenue}\n`;
      });
    } else if (reportType === 'customer_analysis' && customerAnalysis.topCustomers.length > 0) {
      csvContent = 'Rank,Customer Name,Total Spent,Transactions,Debt Balance\n';
      customerAnalysis.topCustomers.forEach((c, i) => {
        csvContent += `${i + 1},"${c.name}",${c.totalSpent},${c.transactionCount},${c.debtBalance}\n`;
      });
    } else if (reportType === 'rental_performance' && rentalPerformance.topRented.length > 0) {
      csvContent = 'Rental ID,Status,Total Charge,Security Deposit,Late Fees\n';
      for (const r of rentalPerformance.topRented) {
        csvContent += `${r.id},${r.status},${r.totalRentalCharge},${r.securityDeposit},${r.lateFeeAccumulated}\n`;
      }
    } else if (reportType === 'dead_stock' && deadStockRows.length > 0) {
      // v2.461.0: the dead stock file carries the same rows the section
      // shows — the ledger's own words, plus the summary's four numbers.
      // "never" is spoken as the word, never as a fabricated zero.
      // v2.464.0: the file carries the share door's word — a Clearance
      // note column speaking the SAME deterministic note the Ask copies
      // and the share door sends, composed in the ONE home (never
      // re-typed here), CSV-escaped, with the window that caught each
      // row riding inside the word.
      // v2.465.0: the file learns the share link — a Share link column
      // beside the note, each row's share link composed in the SAME ONE
      // home (never re-typed here), so the sheet starts the supplier
      // conversation too: one voice, four doors, and the four can never
      // drift apart.
      // v2.467.0: the file's share column rides the SAME pre-addressed
      // door the chat rides — the store contact's phone as the composer's
      // third word — so the sheet's link and the desk's chat can never
      // name two different doors.
      csvContent = 'Product,SKU,Category,Qty on hand,Unit cost,Capital tied,Last sold,Days idle,Clearance note,Share link\n';
      deadStockRows.forEach((r) => {
        const note = deadStockClearanceNote(r, deadStockSummary?.days ?? deadStockDays).replaceAll('"', '""');
        const share = deadStockShareUrl(r, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone);
        csvContent += `"${r.name}",${r.sku},"${r.categoryName ?? 'Uncategorised'}",${r.quantityInStock},${r.costPrice},${r.capitalTied},${r.lastSoldAt ?? 'never'},${r.daysIdle ?? 'never'},"${note}","${share}"\n`;
      });
      csvContent += `\nDays window,${deadStockSummary?.days ?? deadStockDays}\n`;
      csvContent += `Dead products,${deadStockSummary?.deadCount ?? deadStockRows.length}\n`;
      csvContent += `Total capital tied,${deadStockSummary?.totalCapitalTied ?? 0}\n`;
      csvContent += `Total inventory value,${deadStockSummary?.totalStockValue ?? 0}\n`;
      csvContent += `Dead share of stock value,${deadStockSummary?.deadSharePct ?? 0}%\n`;
      // v2.471.0: the file's footer speaks the collective word — the
      // chorus's own header line, read from the ONE home (never a
      // re-typed twin), so the sheet, the clipboard, the chat and the
      // paper all sing the same census. Quoted like the note cells:
      // a CSV word must survive whatever reads it.
      csvContent += `Clearance chorus,"${deadStockChorusHeader(deadStockRows, deadStockSummary?.days ?? deadStockDays)}"\n`;
      // THE FILE'S OWN CHORUS DOOR (v2.478.0) — the sheet hands the maker
      // the whole ledger's ask in one open: the ONE home's collective
      // composer (the exact word the Share all handle opens and the
      // paper's lead card encodes) as the footer's own link, quoted like
      // every word a CSV must survive. The canonical rows only — the
      // view/archive law holds (the file is the archive's word).
      csvContent += `Chorus share link,"${deadStockChorusShareUrl(deadStockRows, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone)}"\n`;
    } else {
      csvContent = 'No data available for export\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  }, [reportType, salesReport, inventorySummary, categoryBreakdown, topProducts, customerAnalysis, rentalPerformance, dateFrom, dateTo, deadStockRows, deadStockSummary, deadStockDays, deadStockStoreContact?.phone]);

  const handleExport = async () => {
    // v2.461.0: dead stock exports CLIENT-SIDE — the server export door
    // speaks only 'sales' | 'inventory', and borrowing another report's
    // door would download the WRONG report under this one's name. The
    // section's own rows are the file.
    if (reportType === 'dead_stock') {
      handleCSVExport();
      return;
    }
    // Try server-side export first, fall back to client-side CSV
    try {
      const res = await reportsApi.exportCSV({ storeId: currentStoreId, type: reportType === 'valuation' ? 'inventory' : reportType === 'daily' || reportType === 'top_products' || reportType === 'customer_analysis' || reportType === 'rental_performance' ? 'sales' : reportType, dateFrom, dateTo });
      if (res.data?.url) {
        window.open(res.data.url, '_blank');
        toast.success('Report exported');
        return;
      }
    } catch {
      // Fallback to client-side CSV
    }
    handleCSVExport();
  };

  const handlePDFExport = async () => {
    const content = document.getElementById('report-print-area');
    if (!content) return;
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    // THE PRINT WINDOW'S HONESTY (v2.466.0): a browser that blocks the
    // print window no longer answers silence — the toast speaks its side
    // (the share door's popup-blocked law, now the print door's own).
    if (!printWindow) {
      toast.error('The browser blocked the print window — export CSV instead.');
      return;
    }
    // THE CHORUS TAKES THE PRINT DOOR (v2.466.0): on the dead-stock stage
    // the printed page closes with the clearance asks — the collective
    // composer's OWN word (the ONE home's header line over every row's
    // note), escaped for the print window, never re-typed here. The
    // paper carries the same word the clipboard, the chat, and the
    // sheet already speak — one voice, five doors.
    const escapePrintWord = (word: string) => word
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
    const chorusAppendix = reportType === 'dead_stock' && deadStockRows.length > 0
      ? (() => {
          const word = deadStockClearanceNotes(deadStockRows, deadStockSummary?.days ?? deadStockDays);
          const [intro, ...asks] = word.split('\n');
          return `\n          <div class="chorus">\n            <h3>Clearance asks — the ledger’s chorus</h3>\n            <p class="chorus-intro">${escapePrintWord(intro)}</p>\n            <ol>\n              ${asks.map((ask) => `<li>${escapePrintWord(ask)}</li>`).join('\n              ')}\n            </ol>\n          </div>`;
        })()
      : '';
    // THE SCANNABLE DOOR (v2.470.0): on the dead-stock stage the printed
    // page carries each row's own QR — the ONE home's share URL (the
    // same word the Share button, the sheet and the chat speak, the
    // store's own address riding its third word), drawn as a data URL
    // by the qrcode house, never a re-composition here. The window is
    // opened FIRST (the popup-blocked law keeps the gesture's tick),
    // the doors are drawn after; if the drawing fails the paper prints
    // without them and the toast speaks the honest word.
    const scanAppendix = reportType === 'dead_stock' && deadStockRows.length > 0
      ? await (async () => {
          try {
            const { default: drawQr } = await import('qrcode');
            // THE CHORUS'S SCANNABLE DOOR (v2.477.0): the grid's LEAD card
            // encodes the WHOLE chorus's chat URL — the ONE home's
            // collective composer, the exact word the Share all handle
            // opens — so one scan on the paper carries every ask at once,
            // pre-addressed when the store keeps its number on file.
            const chorusData = await drawQr.toDataURL(deadStockChorusShareUrl(deadStockRows, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone), { margin: 1, width: 96 });
            const cards = await Promise.all(deadStockRows.map(async (row) => {
              const url = deadStockShareUrl(row, deadStockSummary?.days ?? deadStockDays, deadStockStoreContact?.phone);
              const data = await drawQr.toDataURL(url, { margin: 1, width: 96 });
              return `<figure class="scan-card"><img src="${data}" alt="Share ${escapePrintWord(row.name)} by chat" width="96" height="96" /><figcaption>${escapePrintWord(row.name)}</figcaption><span class="scan-sku">${escapePrintWord(row.sku)}</span></figure>`;
            }));
            return `\n          <div class="scan-doors">\n            <h3>Scan to share — the ledger’s scannable doors</h3>\n            <p class="scan-intro">Each card opens the row’s chat door — the same word the ledger’s Share button speaks.</p>\n            <div class="scan-grid">\n              <figure class="scan-card scan-chorus"><img src="${chorusData}" alt="Share the ledger’s whole chorus by chat" width="96" height="96" /><figcaption>The ledger’s chorus</figcaption><span class="scan-chorus-note">All ${deadStockRows.length} asks in one chat</span></figure>\n              ${cards.join('\n              ')}\n            </div>\n          </div>`;
          } catch {
            toast.error('The scannable doors could not be drawn — the ledger prints without them.');
            return '';
          }
        })()
      : '';
    printWindow.document.write(`
      <html>
        <head>
          <title>MBUMAH HARDWARE - ${reportType} Report</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            h2 { font-size: 16px; color: #64748b; margin-top: 0; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
            th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
            td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
            .right { text-align: right; }
            .bold { font-weight: 700; }
            .chorus { margin-top: 28px; border-top: 2px solid #fecdd3; padding-top: 16px; }
            .chorus h3 { font-size: 14px; color: #be123c; margin: 0 0 4px; }
            .chorus-intro { color: #64748b; font-size: 12px; margin: 0 0 10px; }
            .chorus ol { margin: 0; padding-left: 20px; }
            .chorus li { margin-bottom: 6px; line-height: 1.5; font-size: 12px; }
            .scan-doors { margin-top: 24px; border-top: 2px solid #e2e8f0; padding-top: 16px; page-break-inside: avoid; }
            .scan-doors h3 { font-size: 14px; color: #0f766e; margin: 0 0 4px; }
            .scan-intro { color: #64748b; font-size: 12px; margin: 0 0 12px; }
            .scan-grid { display: flex; flex-wrap: wrap; gap: 12px; }
            .scan-card { width: 120px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 8px; text-align: center; margin: 0; page-break-inside: avoid; }
            .scan-card img { width: 96px; height: 96px; }
            .scan-card figcaption { font-size: 11px; font-weight: 600; margin-top: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .scan-sku { color: #94a3b8; font-size: 10px; }
            .scan-card.scan-chorus { width: 132px; border: 2px solid #0f766e; background: #f0fdfa; }
            .scan-chorus-note { display: block; font-size: 10px; color: #0f766e; margin-top: 4px; }
            .chorus li::marker { color: #be123c; font-weight: 600; }
            .chorus h3::after { content: ''; display: block; width: 32px; border-bottom: 2px solid #fecdd3; margin-top: 6px; }
            .scan-intro { font-style: italic; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MBUMAH HARDWARE</h1>
            <h2>${reportType === 'sales' ? 'Sales' : reportType === 'inventory' ? 'Inventory' : reportType === 'valuation' ? 'Inventory Valuation' : reportType === 'daily' ? 'Daily Sales Summary' : reportType === 'top_products' ? 'Top Products' : reportType === 'customer_analysis' ? 'Customer Analysis' : reportType === 'dead_stock' ? 'Dead Stock' : 'Rental Performance'} Report</h2>
            <!-- v2.479.0 THE PAPER SPEAKS THE WINDOW'S WORD: the dead-stock stage's lens is the idle window (30/60/90 changes the ledger's meaning), so the header speaks it beside the dates — the ONE home's days expression, the same word the CSV's Days window row carries. The other stages keep the bare Period line. -->
            <p style="color:#94a3b8;font-size:12px">Period: ${dateFrom} to ${dateTo}${reportType === 'dead_stock' ? ` · Idle window: ${deadStockSummary?.days ?? deadStockDays} days` : ''}</p>
          </div>
          ${content.innerHTML}
          ${scanAppendix}
          ${chorusAppendix}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
    toast.success('PDF export ready');
  };

  // v2.205.0: changeIndicator/changeColor deleted with the fabricated
  // comparison data they served. No other caller existed — grep before the
  // next round adds one: a change chip without a real previous period is a
  // fabrication, and this tab no longer fabricates.

  const dateRangeDisplay = useMemo(() => {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const days = Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1;
    return `${from.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })} - ${to.toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })} (${days} days)`;
  }, [dateFrom, dateTo]);

  return (
    <div className="space-y-4">
      {/* ================================================================== */}
      {/* Report Types Grid - Glass-morphism with stagger animations         */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { key: 'sales', label: 'Sales Report', iconName: 'TrendingUp', color: 'from-emerald-500 to-emerald-600', desc: 'Revenue, transactions, and payment method breakdown', stagger: 'stagger-1' },
          { key: 'inventory', label: 'Inventory Report', iconName: 'Package', color: 'from-blue-500 to-blue-600', desc: 'Stock levels, categories, and inventory valuation', stagger: 'stagger-2' },
          { key: 'financial', label: 'Financial Report', iconName: 'DollarSign', color: 'from-purple-500 to-purple-600', desc: 'Profit & loss, expenses, and cash flow analysis', stagger: 'stagger-3' },
          { key: 'tax', label: 'Tax Report', iconName: 'Receipt', color: 'from-amber-500 to-amber-600', desc: 'KRA compliance, tax collections, and filings', stagger: 'stagger-4' },
          { key: 'customer_analysis', label: 'Customer Report', iconName: 'Users', color: 'from-rose-500 to-rose-600', desc: 'Customer spending, debt, and loyalty analysis', stagger: 'stagger-5' },
          { key: 'rental_performance', label: 'Employee Report', iconName: 'UserCog', color: 'from-cyan-500 to-cyan-600', desc: 'Staff performance, shifts, and payroll overview', stagger: 'stagger-6' },
        ].map((type) => {
          const iconMap: Record<string, React.ReactNode> = {
            TrendingUp: <TrendingUp className="h-5 w-5" />,
            Package: <Package className="h-5 w-5" />,
            DollarSign: <DollarSign className="h-5 w-5" />,
            Receipt: <Receipt className="h-5 w-5" />,
            Users: <Users className="h-5 w-5" />,
            UserCog: <UserCog className="h-5 w-5" />,
          };
          return (
            <Card
              key={type.key}
              className={`glass-card ${type.stagger} hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group`}
              onClick={() => {
                if (type.key === 'financial') chooseReportType('sales');
                else if (type.key === 'tax') chooseReportType('sales');
                else if (type.key === 'rental_performance') chooseReportType('rental_performance');
                else chooseReportType(type.key as ReportType);
              }}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${type.color} text-white shadow-sm shrink-0`}>
                    {iconMap[type.iconName]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm group-hover:text-emerald-700 transition-colors">{type.label}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{type.desc}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className={`w-full bg-gradient-to-r ${type.color} hover:opacity-90 text-white text-xs h-8`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (type.key === 'financial') chooseReportType('sales');
                    else if (type.key === 'tax') chooseReportType('sales');
                    else if (type.key === 'rental_performance') chooseReportType('rental_performance');
                    else chooseReportType(type.key as ReportType);
                  }}
                >
                  Generate
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ================================================================== */}
      {/* Quick Stats Cards - Glass-morphism                         */}
      {/* ================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-default">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Today Revenue</p>
                <p className="text-lg font-bold whitespace-nowrap">{formatKES(quickStats.todayRevenue)}</p>
                {quickStatCompanions.loudestMethod && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    Led by {quickStatCompanions.loudestMethod} · {quickStatCompanions.loudestMethodAmount}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-default">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-sm">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Today Sales</p>
                <p className="text-lg font-bold whitespace-nowrap">{quickStats.todayTransactions}</p>
                {quickStatCompanions.avgTicket && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">
                    {quickStatCompanions.avgTicket} per sale
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-default">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-sm">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Low Stock</p>
                <p className="text-lg font-bold whitespace-nowrap">{quickStats.lowStockProducts}</p>
                {typeof quickStatCompanions.outOfStock === 'number' && quickStatCompanions.outOfStock > 0 && (
                  <p className="text-[10px] text-red-700 mt-0.5 whitespace-nowrap">
                    {quickStatCompanions.outOfStock} out of stock
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-default">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Outstanding Debt</p>
                <p className="text-lg font-bold whitespace-nowrap">{formatKES(quickStats.outstandingDebt)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Across all customers today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================================================================== */}
      {/* Report Generation Dashboard - Glass-morphism                */}
      {/* ================================================================== */}
      <Card className="backdrop-blur-sm bg-card/80 border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Report Generation Dashboard
              </CardTitle>
              <CardDescription className="text-xs mt-1">{dateRangeDisplay}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePDFExport} className="h-8"
                title={reportType === 'dead_stock' ? 'Prints the ledger rows with the clearance asks attached' : undefined}
                aria-label={reportType === 'dead_stock' ? 'Print PDF with clearance asks' : undefined}
              >
                <Printer className="h-3.5 w-3.5 mr-1.5" /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport} className="h-8"
                title={reportType === 'dead_stock' ? 'Exports the ledger rows with each product\u2019s clearance note' : undefined}
                aria-label={reportType === 'dead_stock' ? 'Export CSV with clearance notes' : undefined}
              >
                <FileDown className="h-3.5 w-3.5 mr-1.5" /> CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Range Presets */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Date Range</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              {([
                { id: 'today', label: 'Today' },
                { id: 'this_week', label: 'This Week' },
                { id: 'this_month', label: 'This Month' },
                { id: 'this_quarter', label: 'This Quarter' },
                { id: 'this_year', label: 'This Year' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'custom', label: 'Custom' },
              ] as { id: DatePreset; label: string }[]).map((preset) => (
                // THE ELDER LOOM'S FIRST WEAVE (v2.455.0): the wardrobe lives
                // in one component now — the desk keeps its words; the loom
                // adds the family's pressed voice and the zinc keyboard ring.
                <FilterChip
                  key={preset.id}
                  active={datePreset === preset.id}
                  onClick={() => setDatePreset(preset.id)}
                >
                  {preset.label}
                </FilterChip>
              ))}
            </div>
            {datePreset === 'custom' && (
              <div className="flex items-center gap-2 ml-6">
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-xs w-36" />
                <span className="text-xs text-muted-foreground">to</span>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 text-xs w-36" />
              </div>
            )}
          </div>

          <Separator />

          {/* Report Type Selection - Grid */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Report Type</Label>
            {/* THE TWENTY-FIFTH WEARING: the chip wears LIME, one storey
                deeper at 300/100 — the shade-split's third application
                (the hue last spoke at the 200/50 storey, the gift-cards
                desk's word; a family byte the 200-storey can never
                equal). The desk's badges speak primary, amber, green,
                blue and red, so the deeper lime borrows nothing from any
                badge — light+dark, the shared tooltip, the group-hover
                dismiss detail. THE POSITION LAW: the chip sits
                immediately BEFORE the lens it landed into (the Report
                Type grid), and the grid's own Active badge shows the
                landed shape. v2.394.0: the chip renders through the one
                LandingChip loom (the wardrobe lives in the loom's
                registry). */}
            {repLandingLive && landedRepType !== 'sales' && reportType === landedRepType && (
              <div>
                <LandingChip
                  hue="lime"
                  label={`landed ?rep-type=${landedRepType}`}
                  onDismiss={() => setRepLandingLive(false)}
                  title="The reports desk landed with this report type from the address bar — press to clear it"
                  data-testid="rep-type-landing-word"
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <ReportTypeCard
                icon={<ShoppingCart className="h-5 w-5" />}
                title="Sales Report"
                description="Comprehensive sales analysis with payment method breakdown and trends"
                isActive={reportType === 'sales'}
                onClick={() => chooseReportType('sales')}
                colorClass="text-primary"
              />
              <ReportTypeCard
                icon={<Package className="h-5 w-5" />}
                title="Inventory Report"
                description="Stock health, valuation by category, and inventory turnover analysis"
                isActive={reportType === 'inventory'}
                onClick={() => chooseReportType('inventory')}
                colorClass="text-primary"
              />
              <ReportTypeCard
                icon={<DollarSign className="h-5 w-5" />}
                title="Inventory Valuation"
                description="Current stock valuation (qty × cost price) with category breakdown"
                isActive={reportType === 'valuation'}
                onClick={() => chooseReportType('valuation')}
                colorClass="text-primary"
              />
              <ReportTypeCard
                icon={<Timer className="h-5 w-5" />}
                title="Daily Sales Summary"
                description="Hourly breakdown of today's sales with peak hour analysis"
                isActive={reportType === 'daily'}
                onClick={() => chooseReportType('daily')}
                colorClass="text-primary"
              />
              <ReportTypeCard
                icon={<TrendingUp className="h-5 w-5" />}
                title="Top Products"
                description="Best-selling products ranked by revenue and quantity sold"
                isActive={reportType === 'top_products'}
                onClick={() => chooseReportType('top_products')}
                colorClass="text-primary"
              />
              <ReportTypeCard
                icon={<Users className="h-5 w-5" />}
                title="Customer Analysis"
                description="Top customers by spending, payment methods used, and debt analysis"
                isActive={reportType === 'customer_analysis'}
                onClick={() => chooseReportType('customer_analysis')}
                colorClass="text-primary"
              />
              <ReportTypeCard
                icon={<Wrench className="h-5 w-5" />}
                title="Rental Performance"
                description="Equipment utilization, revenue per rental, and status breakdown"
                isActive={reportType === 'rental_performance'}
                onClick={() => chooseReportType('rental_performance')}
                colorClass="text-primary"
              />
              <ReportTypeCard
                icon={<Sparkles className="h-5 w-5" />}
                title="Trends & Predictions"
                description="Growing/declining products, 7-day revenue forecast, category trends, and frequently-bought-together recommendations"
                isActive={reportType === 'trends'}
                onClick={() => chooseReportType('trends')}
                colorClass="text-primary"
              />
              {/* v2.461.0 THE NINTH CARD: Dead Stock — capital at rest. The
                  grid spoke eight cards in a three-wide column (two rows of
                  three, then a widow); the ninth completes the 3×3. */}
              <ReportTypeCard
                icon={<Hourglass className="h-5 w-5" />}
                title="Dead Stock"
                description="Capital tied in products with no sales in the chosen window — money at rest on the shelf"
                isActive={reportType === 'dead_stock'}
                onClick={() => chooseReportType('dead_stock')}
                colorClass="text-primary"
              />
            </div>
          </div>

          {/* Chart Type Toggle — v2.462.0: the ninth report joins the row
              with its OWN honest faces (bar and pie; line and area are
              time-series words, and categorical capital cannot wear
              them — the filter below is the toggle's own truth for this
              report, never a hidden chip). */}
          {(reportType === 'valuation' || reportType === 'top_products' || reportType === 'daily' || reportType === 'customer_analysis' || reportType === 'rental_performance' || reportType === 'dead_stock') && (
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium">Chart Type:</Label>
              <div className="flex items-center gap-1">
                {(['bar', 'line', 'area', 'pie'] as const)
                  // the dead-stock report speaks only its two honest
                  // faces — a categorical capital has no time series
                  .filter((ct) => reportType !== 'dead_stock' || ct === 'bar' || ct === 'pie')
                  .map(ct => (
                  // the chart-type face rides the loom's COMPACT wardrobe
                  // (py-1, the face's historic size) — the pressed voice and
                  // the zinc ring join the family's first weave.
                  <FilterChip
                    key={ct}
                    compact
                    active={chartType === ct}
                    onClick={() => setChartType(ct)}
                  >
                    {ct === 'bar' ? <BarChart3 className="h-3 w-3 inline mr-1" /> : ct === 'line' ? <TrendingUp className="h-3 w-3 inline mr-1" /> : ct === 'area' ? <TrendingDown className="h-3 w-3 inline mr-1" /> : <PieChart className="h-3 w-3 inline mr-1" />}
                    {ct.charAt(0).toUpperCase() + ct.slice(1)}
                  </FilterChip>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Content Area */}
      <div id="report-print-area">
        {/* ================================================================== */}
        {/* Sales Report                                                        */}
        {/* ================================================================== */}
        {reportType === 'sales' && (
          <>
            {salesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : salesReport ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="border-l-4 border-l-green-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                      </div>
                      <p className="text-2xl font-bold">{formatKES(salesReport.totalRevenue)}</p>
                      {/* v2.205.0: the fabricated comparison chip died — this card
                          speaks a REAL wire figure: the average per sale. */}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatKES(salesReport.avgTransactionValue)} per sale
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-primary backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Transactions</p>
                      </div>
                      <p className="text-2xl font-bold">{salesReport.transactionCount}</p>
                      {/* v2.205.0: the fabricated comparison chip died — this card
                          speaks a REAL wire figure: the tax collected in-range. */}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatKES(salesReport.totalTax)} tax in range
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-amber-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-amber-500" />
                        <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                      </div>
                      <p className="text-2xl font-bold">{formatKES(salesReport.avgTransactionValue)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-red-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <RotateCcw className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-muted-foreground">Total Discount</p>
                      </div>
                      <p className="text-2xl font-bold">{formatKES(salesReport.totalDiscount)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sales by Payment Method */}
                {(Array.isArray(salesReport.byPaymentMethod) ? salesReport.byPaymentMethod : []).length > 0 && (
                  <Card className="backdrop-blur-sm bg-card/80 border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Sales by Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const byPM = Array.isArray(salesReport.byPaymentMethod) ? salesReport.byPaymentMethod : [];
                        const totalAmount = byPM.reduce((s, p) => s + p.amount, 0) || 1;
                        const pmColors: Record<string, string> = {
                          CASH: 'bg-green-500', MPESA: 'bg-primary', DEBT: 'bg-orange-500', SPLIT: 'bg-purple-500',
                        };
                        return (
                          <>
                            <div className="h-6 bg-muted/30 rounded-full overflow-hidden flex mb-4">
                              {byPM.map((pm, i) => {
                                const pct = (pm.amount / totalAmount) * 100;
                                return (
                                  <div
                                    key={i}
                                    className={`h-full transition-all duration-500 ${pmColors[pm.method] || 'bg-gray-400'}`}
                                    style={{ width: `${pct}%` }}
                                    title={`${pm.method}: ${formatKES(pm.amount)} (${pct.toFixed(1)}%)`}
                                  />
                                );
                              })}
                            </div>
                            <div className="space-y-4">
                              {byPM.map((pm, i) => {
                                const maxAmount = Math.max(...byPM.map(p => p.amount), 1);
                                const pct = (pm.amount / maxAmount) * 100;
                                const colorClass = pmColors[pm.method] || 'bg-gray-500';
                                return (
                                  <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${colorClass} text-white`}>
                                          {paymentMethodIcons[pm.method] || <CreditCard className="h-3.5 w-3.5" />}
                                        </div>
                                        <span className="font-medium">{pm.method}</span>
                                        <Badge variant="outline" className="text-[9px]">{pm.count} txns</Badge>
                                      </div>
                                      <div className="text-right">
                                        <span className="font-medium">{formatKES(pm.amount)}</span>
                                        <span className="text-xs text-muted-foreground ml-2">
                                          {((pm.amount / totalAmount) * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* Top 5 Products by Revenue */}
                {topProducts.length > 0 && (
                  <Card className="backdrop-blur-sm bg-card/80 border-border/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Top 5 Products by Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                        {topProducts.slice(0, 5).map((product, i) => {
                          const maxRevenue = Math.max(...topProducts.map(p => p.revenue), 1);
                          const pct = (product.revenue / maxRevenue) * 100;
                          const rankColors = ['bg-yellow-700 text-white', 'bg-slate-600 text-white', 'bg-orange-700 text-white'];
                          return (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? rankColors[i] : 'bg-muted text-muted-foreground'}`}>
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium truncate">{product.productName}</span>
                                  <span className="text-sm font-bold ml-2">{formatKES(product.revenue)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-primary transition-all duration-500"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                  <span className="text-[11px] text-muted-foreground whitespace-nowrap tabular-nums">{product.quantitySold} sold</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="backdrop-blur-sm bg-card/80">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No sales data available for the selected period</p>
                  <p className="text-xs mt-1">Try adjusting the date range</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ================================================================== */}
        {/* Inventory Report                                                    */}
        {/* ================================================================== */}
        {reportType === 'inventory' && (
          <>
            {inventoryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : inventorySummary ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="border-l-4 border-l-primary backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Total Products</p>
                      </div>
                      <p className="text-2xl font-bold">{inventorySummary.totalProducts}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-amber-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <p className="text-sm text-muted-foreground">Low Stock</p>
                      </div>
                      <p className="text-2xl font-bold text-amber-700">{inventorySummary.lowStockCount}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-red-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-muted-foreground">Out of Stock</p>
                      </div>
                      <p className="text-2xl font-bold text-red-600">{inventorySummary.outOfStockCount}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-muted-foreground">Inventory Value</p>
                      </div>
                      <p className="text-2xl font-bold whitespace-nowrap">{formatKES(inventorySummary.totalStockValue)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Stock Health & Turnover */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card className="backdrop-blur-sm bg-card/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <HeartPulse className="h-4 w-4 text-green-700" /> Stock Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20" role="img" aria-label={stockHealthVoice}>
                          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
                            <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="6" />
                            {/* v2.204.0: the stock-health gauge re-voices to the -600
                                family (green-500 2.28 / yellow-500 1.92 sat below the
                                3:1 graphics bar; red-500 3.76 stays). */}
                            <circle
                              cx="40" cy="40" r="35" fill="none"
                              stroke={stockHealth >= 70 ? '#16a34a' : stockHealth >= 40 ? '#a16207' : '#ef4444'}
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={`${(stockHealth / 100) * 220} 220`}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold">{stockHealth}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {stockHealth >= 70 ? 'Healthy' : stockHealth >= 40 ? 'Needs Attention' : 'Critical'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {inventorySummary.totalProducts - inventorySummary.lowStockCount - inventorySummary.outOfStockCount} of {inventorySummary.totalProducts} products in good stock
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-[9px] bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                              Good: {inventorySummary.totalProducts - inventorySummary.lowStockCount - inventorySummary.outOfStockCount}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                              Low: {inventorySummary.lowStockCount}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                              Out: {inventorySummary.outOfStockCount}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="backdrop-blur-sm bg-card/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-primary" /> Inventory Turnover
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-primary/10">
                            <span className="text-2xl font-bold text-primary">{inventoryTurnover || '-'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Turnover Ratio</p>
                            <p className="text-xs text-muted-foreground">
                              {Number(inventoryTurnover) >= 2 ? 'Excellent - inventory moves quickly' : Number(inventoryTurnover) >= 1 ? 'Good - healthy stock rotation' : 'Low - consider reducing stock levels'}
                            </p>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded-lg bg-muted/30">
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-medium">{salesReport ? formatKES(salesReport.totalRevenue) : '-'}</p>
                          </div>
                          <div className="p-2 rounded-lg bg-muted/30">
                            <p className="text-muted-foreground">Inventory Value</p>
                            <p className="font-medium">{formatKES(inventorySummary.totalStockValue)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Category breakdown */}
                {categoryBreakdown.length > 0 && (
                  <Card className="backdrop-blur-sm bg-card/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <PieChart className="h-4 w-4" /> Inventory Valuation by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ConicPieChart segments={pieSegments} />
                      <Separator className="my-4" />
                      <div className="space-y-3">
                        {categoryBreakdown.map((cat, i) => {
                          const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-teal-500', 'bg-pink-500', 'bg-amber-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500'];
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-sm ${colors[i % colors.length]}`} />
                                  <span className="font-medium">{cat.name}</span>
                                  <Badge variant="outline" className="text-[9px]">{cat.productCount} items</Badge>
                                </div>
                                <span className="font-medium">{formatKES(cat.totalValue)}</span>
                              </div>
                              <HorizontalBar value={cat.totalValue} maxValue={maxCategoryValue} colorClass={colors[i % colors.length]} height="h-2" />
                            </div>
                          );
                        })}
                        <Separator />
                        <div className="flex items-center justify-between text-sm font-bold">
                          <span>Total Inventory Value</span>
                          <span>{formatKES(inventorySummary.totalStockValue)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="backdrop-blur-sm bg-card/80">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Boxes className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No inventory data available</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ================================================================== */}
        {/* Inventory Valuation Report                                          */}
        {/* ================================================================== */}
        {reportType === 'valuation' && (
          <>
            {inventoryLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : inventorySummary ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Card className="border-l-4 border-l-green-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Total Stock Value</p>
                      <p className="text-2xl font-bold text-green-700">{formatKES(inventorySummary.totalStockValue)}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">qty × cost price</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-primary backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Total SKUs</p>
                      <p className="text-2xl font-bold">{inventorySummary.totalProducts}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">product count</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-amber-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Avg. Value/SKU</p>
                      <p className="text-2xl font-bold">{formatKES(inventorySummary.totalProducts > 0 ? inventorySummary.totalStockValue / inventorySummary.totalProducts : 0)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Valuation Chart */}
                <Card className="backdrop-blur-sm bg-card/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" /> Valuation by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {valuationData.length > 0 ? (
                      <>
                        {chartType === 'bar' && <SVGBarChart data={valuationData} height={200} ariaLabel={valuationVoice} />}
                        {chartType === 'line' && <SVGLineChart data={valuationData} height={200} ariaLabel={valuationVoice} />}
                        {chartType === 'pie' && <ConicPieChart segments={pieSegments} />}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No valuation data available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Valuation Detail Table */}
                {categoryBreakdown.length > 0 && (
                  <Card className="backdrop-blur-sm bg-card/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Valuation Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categoryBreakdown.map((cat, i) => {
                          const avgValue = cat.productCount > 0 ? cat.totalValue / cat.productCount : 0;
                          return (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                  {cat.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{cat.name}</p>
                                  <p className="text-xs text-muted-foreground">{cat.productCount} items</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold">{formatKES(cat.totalValue)}</p>
                                <p className="text-[10px] text-muted-foreground">Avg: {formatKES(avgValue)}/item</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="backdrop-blur-sm bg-card/80">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No inventory valuation data available</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ================================================================== */}
        {/* Daily Sales Summary                                                 */}
        {/* ================================================================== */}
        {reportType === 'daily' && (
          <>
            {salesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-64" />
              </div>
            ) : salesReport ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="border-l-4 border-l-green-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Today&apos;s Revenue</p>
                      <p className="text-2xl font-bold text-green-700">{formatKES(salesReport.totalRevenue)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-primary backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Transactions</p>
                      <p className="text-2xl font-bold">{salesReport.transactionCount}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-amber-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Avg. Transaction</p>
                      <p className="text-2xl font-bold">{formatKES(salesReport.avgTransactionValue)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-red-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Total VAT</p>
                      <p className="text-2xl font-bold">{formatKES(salesReport.totalTax)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Hourly Breakdown Chart */}
                <Card className="backdrop-blur-sm bg-card/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Timer className="h-4 w-4" /> Hourly Sales Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartType === 'bar' && <SVGBarChart data={dailyHourlyData} height={200} ariaLabel={hourlyVoice} />}
                    {chartType === 'line' && <SVGLineChart data={dailyHourlyData} height={200} ariaLabel={hourlyVoice} />}
                    {chartType === 'pie' && (
                      <ConicPieChart segments={dailyHourlyData.map((d, i) => ({
                        name: d.label,
                        value: d.value,
                        // v2.204.0: the -600 re-voice (same ground as the
                        // category pie above).
                        color: ['#3b82f6', '#16a34a', '#ea580c', '#a855f7', '#0d9488', '#ec4899', '#a16207', '#0891b2', '#65a30d', '#f43f5e', '#8b5cf6'][i % 11],
                      }))} />
                    )}
                  </CardContent>
                </Card>

                {/* Peak Hour Analysis */}
                <Card className="backdrop-blur-sm bg-card/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Peak Hour Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const peak = dailyHourlyData.reduce((max, d) => d.value > max.value ? d : max, dailyHourlyData[0]);
                      const totalHourly = dailyHourlyData.reduce((s, d) => s + d.value, 0);
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <p className="text-xs text-muted-foreground">Peak Hour</p>
                            <p className="text-xl font-bold text-green-700">{peak?.label || 'N/A'}</p>
                            <p className="text-sm">{formatKES(peak?.value || 0)}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <p className="text-xs text-muted-foreground">Hourly Average</p>
                            <p className="text-xl font-bold text-blue-600">{formatKES(Math.round(totalHourly / dailyHourlyData.length))}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                            <p className="text-xs text-muted-foreground">Peak Share</p>
                            <p className="text-xl font-bold text-amber-700">{peak ? ((peak.value / totalHourly) * 100).toFixed(1) : 0}%</p>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="backdrop-blur-sm bg-card/80">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Timer className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No daily sales data available</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ================================================================== */}
        {/* Top Products Report                                                 */}
        {/* ================================================================== */}
        {reportType === 'top_products' && (
          <>
            {(fastMovingLoading) ? (
              <div className="space-y-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-64" />
              </div>
            ) : topProducts.length > 0 ? (
              <>
                {/* v2.206.0 THE WIRE'S OWN SUMMARY — the honest totals strip.
                    Real units moved / products moved / revenue collected over
                    the picked range, straight off the fast-moving summary —
                    NOT a fabricated chip. Chip labels 10px muted (the tab's
                    sub-line voice), figures 16px bold tabular-nums. */}
                {fastMovingSummary && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Units moved</p>
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{fastMovingSummary.totalUnitsSold}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Products sold</p>
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-400 tabular-nums">{fastMovingSummary.totalProductsSold}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Revenue in range</p>
                      <p className="text-lg font-bold text-amber-700 dark:text-amber-400 tabular-nums">{formatKES(fastMovingSummary.totalRevenue)}</p>
                    </div>
                  </div>
                )}
                <Card className="backdrop-blur-sm bg-card/80">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Top Products by Revenue
                      </CardTitle>
                      <Badge variant="outline" className="text-[9px]">{topProducts.length} products</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {chartType === 'bar' && <SVGBarChart data={topProductsChartData} height={220} ariaLabel={topProductsVoice} />}
                    {chartType === 'line' && <SVGLineChart data={topProductsChartData} height={220} ariaLabel={topProductsVoice} />}
                    {chartType === 'pie' && (
                      <ConicPieChart segments={topProductsChartData.map(d => ({
                        name: d.label,
                        value: d.value,
                        color: d.color || '#3b82f6',
                      }))} />
                    )}
                  </CardContent>
                </Card>

                {/* Detailed Product List */}
                <Card className="backdrop-blur-sm bg-card/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Product Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                      {topProducts.map((product, i) => {
                        const pct = (product.revenue / maxTopProductsRevenue) * 100;
                        // v2.206.0 THE RANK CHIPS LEARN THE 4.5:1 LAW: the old
                        // trio (yellow-500 2.14 / gray-400 2.54 / amber-600 3.07
                        // with white text) all FAILED the text bar — the rank
                        // NUMBER is text riding a fill, not a graphic. Re-voiced
                        // gold/silver/bronze: yellow-700 4.93 / slate-600 7.60 /
                        // orange-700 5.18 (pinned by the probe, reverse-checked).
                        const rankColors = ['bg-yellow-700 text-white', 'bg-slate-600 text-white', 'bg-orange-700 text-white'];
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/30">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? rankColors[i] : 'bg-muted text-muted-foreground'}`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium truncate">{product.productName}</span>
                                <span className="text-sm font-bold ml-2 tabular-nums">{formatKES(product.revenue)}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden" role="presentation">
                                    {/* v2.206.0: the /60 gradient ghost DIED (the
                                        v2.204 law — a dimmed mark is a ghost).
                                        Solid primary; the bar carries the real
                                        share of the top product's revenue. */}
                                    <div
                                      className="h-full rounded-full bg-primary transition-all duration-500"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-[11px] text-muted-foreground whitespace-nowrap min-w-[64px] text-right tabular-nums">{product.quantitySold} sold</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="backdrop-blur-sm bg-card/80">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No product sales data available</p>
                  <p className="text-xs mt-1">Complete some sales to see top products</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ================================================================== */}
        {/* Customer Analysis Report                                            */}
        {/* ================================================================== */}
        {reportType === 'customer_analysis' && (
          <>
            {(customersLoading || transactionsLoading) ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
                <Skeleton className="h-64" />
              </div>
            ) : customerAnalysis.customerCount > 0 ? (
              <>
                {/* Customer Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="border-l-4 border-l-primary backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Total Customers</p>
                      </div>
                      <p className="text-2xl font-bold">{customerAnalysis.customerCount}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                      </div>
                      <p className="text-2xl font-bold whitespace-nowrap">{formatKES(customerAnalysis.totalSpent)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-amber-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <ShoppingCart className="h-4 w-4 text-amber-500" />
                        <p className="text-sm text-muted-foreground">Avg. Spend</p>
                      </div>
                      <p className="text-2xl font-bold">{formatKES(customerAnalysis.avgSpend)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-red-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="h-4 w-4 text-red-500" />
                        <p className="text-sm text-muted-foreground">Outstanding Debt</p>
                      </div>
                      <p className="text-2xl font-bold whitespace-nowrap tabular-nums">{formatKES(customerAnalysis.debtTotal)}</p>
                      {/* THE DEBT VOICES RECONCILE (v2.454.0): the MIRROR voice —
                          this card sums Customer.currentDebtBalance over the
                          customers wire (the same reduce as the customers desk's
                          fifth card), while the dashboard's KPI is the LEDGER
                          voice (DebtLedger.balance over the outstanding
                          statuses). The disclosure names the scope so the two
                          figures reconcile on their own terms. */}
                      <p data-testid="reports-debt-scope" title="Sum of every customer's currentDebtBalance over the customers wire - the mirror voice. The dashboard's ledger voice (DebtLedger balances) may differ by design." className="text-[11px] text-muted-foreground/80 mt-0.5">Customer balances · all customers</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Customers Chart */}
                {customerChartData.length > 0 && (
                  <Card className="backdrop-blur-sm bg-card/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" /> Top Customers by Spending
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72" role="img" aria-label={customerChartVoice}>
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === 'bar' ? (
                            <BarChart data={customerChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `KES ${(v / 1000).toFixed(0)}k`} />
                              <Tooltip formatter={(value: number) => formatKES(value)} />
                              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                            </BarChart>
                          ) : chartType === 'line' ? (
                            <LineChart data={customerChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `KES ${(v / 1000).toFixed(0)}k`} />
                              <Tooltip formatter={(value: number) => formatKES(value)} />
                              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Revenue" />
                            </LineChart>
                          ) : chartType === 'area' ? (
                            <AreaChart data={customerChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `KES ${(v / 1000).toFixed(0)}k`} />
                              <Tooltip formatter={(value: number) => formatKES(value)} />
                              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Revenue" />
                            </AreaChart>
                          ) : (
                            <BarChart data={customerChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `KES ${(v / 1000).toFixed(0)}k`} />
                              <Tooltip formatter={(value: number) => formatKES(value)} />
                              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Method Breakdown */}
                {customerAnalysis.paymentMethods.length > 0 && (
                  <Card className="backdrop-blur-sm bg-card/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Payment Methods Used
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {customerAnalysis.paymentMethods.map((pm, i) => {
                          const totalAmount = customerAnalysis.paymentMethods.reduce((s, p) => s + p.amount, 0) || 1;
                          const pct = (pm.amount / totalAmount) * 100;
                          const pmColors: Record<string, string> = { CASH: 'bg-green-500', MPESA: 'bg-primary', DEBT: 'bg-orange-500', SPLIT: 'bg-purple-500' };
                          return (
                            <div key={i} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${pmColors[pm.method] || 'bg-gray-400'} text-white`}>
                                    {paymentMethodIcons[pm.method] || <CreditCard className="h-3.5 w-3.5" />}
                                  </div>
                                  <span className="font-medium">{pm.method}</span>
                                  <Badge variant="outline" className="text-[9px]">{pm.count} txns</Badge>
                                </div>
                                <div className="text-right">
                                  <span className="font-medium">{formatKES(pm.amount)}</span>
                                  <span className="text-xs text-muted-foreground ml-2">{pct.toFixed(0)}%</span>
                                </div>
                              </div>
                              <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${pmColors[pm.method] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Customer Detail List */}
                <Card className="backdrop-blur-sm bg-card/80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Customer Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                      {customerAnalysis.topCustomers.map((customer, i) => {
                        const maxSpent = Math.max(...customerAnalysis.topCustomers.map(c => c.totalSpent), 1);
                        const pct = (customer.totalSpent / maxSpent) * 100;
                        const rankColors = ['bg-yellow-700 text-white', 'bg-slate-600 text-white', 'bg-orange-700 text-white'];
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/30">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? rankColors[i] : 'bg-muted text-muted-foreground'}`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium truncate">{customer.name}</span>
                                <span className="text-sm font-bold ml-2">{formatKES(customer.totalSpent)}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                                <span className="text-[11px] text-muted-foreground whitespace-nowrap min-w-[60px] text-right tabular-nums">{customer.transactionCount} txns</span>
                              </div>
                              {customer.debtBalance > 0 && (
                                <div className="mt-1">
                                  <Badge variant="outline" className="text-[9px] bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                                    Debt: {formatKES(customer.debtBalance)}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="backdrop-blur-sm bg-card/80">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Customer Data</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Customer analysis will appear once you have customers and transactions recorded. 
                    Start by adding customers and completing sales.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => chooseReportType('sales')}>
                    <ShoppingCart className="h-4 w-4 mr-2" /> View Sales Report Instead
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ================================================================== */}
        {/* Rental Performance Report                                           */}
        {/* ================================================================== */}
        {reportType === 'rental_performance' && (
          <>
            {rentalsLoading ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
                <Skeleton className="h-64" />
              </div>
            ) : rentalPerformance.totalRevenue > 0 || rentalPerformance.activeRentals > 0 ? (
              <>
                {/* Rental Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="border-l-4 border-l-primary backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Wrench className="h-4 w-4 text-primary" />
                        <p className="text-sm text-muted-foreground">Active Rentals</p>
                      </div>
                      <p className="text-2xl font-bold">{rentalPerformance.activeRentals}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                      </div>
                      <p className="text-2xl font-bold whitespace-nowrap">{formatKES(rentalPerformance.totalRevenue)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-amber-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-amber-500" />
                        <p className="text-sm text-muted-foreground">Avg. Rental Value</p>
                      </div>
                      <p className="text-2xl font-bold">{formatKES(rentalPerformance.avgRentalValue)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-teal-500 backdrop-blur-sm bg-card/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-teal-500" />
                        <p className="text-sm text-muted-foreground">Utilization Rate</p>
                      </div>
                      <p className="text-2xl font-bold">{rentalPerformance.utilization}%</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue by Status Chart */}
                {rentalChartData.length > 0 && (
                  <Card className="backdrop-blur-sm bg-card/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Revenue by Rental Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72" role="img" aria-label={rentalChartVoice}>
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === 'bar' ? (
                            <BarChart data={rentalChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `KES ${(v / 1000).toFixed(0)}k`} />
                              <Tooltip formatter={(value: number) => formatKES(value)} />
                              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                            </BarChart>
                          ) : chartType === 'line' ? (
                            <LineChart data={rentalChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `KES ${(v / 1000).toFixed(0)}k`} />
                              <Tooltip formatter={(value: number) => formatKES(value)} />
                              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Revenue" />
                            </LineChart>
                          ) : chartType === 'area' ? (
                            <AreaChart data={rentalChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `KES ${(v / 1000).toFixed(0)}k`} />
                              <Tooltip formatter={(value: number) => formatKES(value)} />
                              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" name="Revenue" />
                            </AreaChart>
                          ) : (
                            <BarChart data={rentalChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `KES ${(v / 1000).toFixed(0)}k`} />
                              <Tooltip formatter={(value: number) => formatKES(value)} />
                              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Status Breakdown */}
                {rentalPerformance.statusBreakdown.length > 0 && (
                  <Card className="backdrop-blur-sm bg-card/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Rental Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {rentalPerformance.statusBreakdown.map((sb, i) => {
                          const totalRentals = rentalPerformance.statusBreakdown.reduce((s, r) => s + r.count, 0) || 1;
                          const pct = (sb.count / totalRentals) * 100;
                          const statusColors: Record<string, string> = {
                            ACTIVE: 'bg-green-500',
                            RETURNED: 'bg-primary',
                            OVERDUE: 'bg-red-500',
                            PENDING: 'bg-amber-500',
                            DAMAGED: 'bg-orange-500',
                          };
                          return (
                            <div key={i} className="space-y-1.5">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-sm ${statusColors[sb.status] || 'bg-gray-400'}`} />
                                  <span className="font-medium">{sb.status}</span>
                                  <Badge variant="outline" className="text-[9px]">{sb.count} rentals</Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                              </div>
                              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${statusColors[sb.status] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Rental Detail List */}
                {rentalPerformance.topRented.length > 0 && (
                  <Card className="backdrop-blur-sm bg-card/80">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Recent Rentals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                        {rentalPerformance.topRented.map((rental) => {
                          const statusColors: Record<string, string> = {
                            ACTIVE: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
                            RETURNED: 'bg-primary/10 text-primary border-primary/20',
                            OVERDUE: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
                            PENDING: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
                          };
                          return (
                            <div key={rental.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/30">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Wrench className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium truncate">{rental.id.slice(-8)}</span>
                                  <span className="text-sm font-bold ml-2">{formatKES(rental.totalRentalCharge)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={`text-[9px] ${statusColors[rental.status] || ''}`}>
                                    {rental.status}
                                  </Badge>
                                  {rental.lateFeeAccumulated > 0 && (
                                    <Badge variant="outline" className="text-[9px] bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                                      Late: {formatKES(rental.lateFeeAccumulated)}
                                    </Badge>
                                  )}
                                  <span className="text-[10px] text-muted-foreground">
                                    Deposit: {formatKES(rental.securityDeposit)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="backdrop-blur-sm bg-card/80">
                <CardContent className="p-12 text-center">
                  <div className="mx-auto w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <Wrench className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Rental Data</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Rental performance analysis will appear once you have equipment rentals recorded.
                    Start by creating rental orders for your equipment.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={() => chooseReportType('sales')}>
                    <ShoppingCart className="h-4 w-4 mr-2" /> View Sales Report Instead
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* ================================================================== */}
        {/* Trends & Predictions                                                */}
        {/* ================================================================== */}
        {reportType === 'trends' && (
          <TrendsPredictionsSection storeId={currentStoreId} />
        )}

        {/* v2.461.0 THE DEAD STOCK SECTION — the ninth report's face. The
            window is the desk's state (the query re-answers); the section
            renders the summary, the ledger and the empty truth. */}
        {reportType === 'dead_stock' && (
          <DeadStockSection
            rows={deadStockRows}
            summary={deadStockSummary}
            isLoading={deadStockLoading}
            days={deadStockDays}
            onDaysChange={chooseDeadWindow}
            chartType={chartType}
            deadWindowLandingLive={deadWindowLandingLive}
            landedDeadWindow={landedDeadWindow}
            onDismissDeadWindowLanding={() => setDeadWindowLandingLive(false)}
            storeContact={deadStockStoreContact ?? null}
            storeId={currentStoreId}
          />
        )}
      </div>
    </div>
  );
}
