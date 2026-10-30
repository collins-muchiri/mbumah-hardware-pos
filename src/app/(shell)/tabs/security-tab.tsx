'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import {
  Shield, ShieldOff, AlertTriangle, Users,
  Activity, Eye, Ban, RefreshCw, Filter, X, ScrollText,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { composeScoreVoice } from '@/lib/report-voices';
// v2.12.8 (PR C): Audit Trail - second view inside the Security tab.
import { AuditTrailSection } from '@/components/admin/audit-trail-section';
// v2.293.0: the ONE vocabulary — the dashboard imports the lib's words,
// tone law, severity-badge faces and the denied-gates report. The local
// EVENT_TYPE_LABELS / SEVERITY_BG copies are dead (they drifted from the
// feed's words the day the lib landed; the same move as v2.292.0).
import {
  EVENT_TYPE_LABELS,
  SECURITY_TONE_CLASSES,
  SECURITY_SEVERITY_BADGE_CLASSES,
  securityRowTone,
  gateDrillVoice,
  gateDrillEmptyVoice,
  type deniedGateReport,
  type DeniedGate,
} from '@/lib/security-feed';

// Types

interface SecurityDashboardData {
  securityScore: number;
  totalEvents24h: number;
  blockedAttempts: number;
  criticalEvents: number;
  activeSessions: number;
  eventsByType: { type: string; count: number }[];
  eventsBySeverity: { severity: string; count: number }[];
  topIPs: { ipAddress: string; eventCount: number }[];
  recentCritical: {
    id: string;
    eventType: string;
    severity: string;
    ipAddress: string | null;
    resource: string | null;
    action: string | null;
    details: string | null;
    createdAt: string;
    blocked: boolean;
  }[];
  timeline: { hour: string; count: number }[];
  // v2.293.0: the gate-heat aggregate — the lib's own report shape.
  // v2.294.0: the report names the window it answered for.
  deniedGates: ReturnType<typeof deniedGateReport> & { window: string };
}

// v2.294.0: the denied-gates card's time lens. One type, three values —
// the route owns the whitelist; this face only ever sends a named range.
type GateRange = '24h' | '7d' | '30d';
const GATE_RANGES: { value: GateRange; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
];

// v2.295.0: the gate drill windows itself to the SAME lens the card speaks
// (the report counts over 24h/7d/30d; the drill fetches the matching rows).
const GATE_WINDOW_MS: Record<GateRange, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

// Color mappings

// v2.204.0: the chart fill voices re-voice to the -600/-700 family on the
// white card ground — orange-500 2.80 / yellow-500 1.92 / gray-400 2.54 sat
// below the 3:1 graphics bar; red-500 3.76, blue-500 3.68 stay.
const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  ERROR: '#ea580c',
  WARN: '#a16207',
  INFO: '#3b82f6',
  DEBUG: '#6b7280',
};

// v2.293.0: the local EVENT_TYPE_LABELS (12 entries) copy is DEAD — the
// lib's one vocabulary carries the words now (see the import above). The
// chart fill maps below stay: they are the v2.204.0 contrast-tuned recharts
// palette, a different surface from the row/badge faces.

const EVENT_TYPE_COLORS: Record<string, string> = {
  RATE_LIMITED: '#ea580c',
  BRUTE_FORCE: '#ef4444',
  CSRF_FAILED: '#a16207',
  INVALID_INPUT: '#6b7280',
  SUSPICIOUS_ACTIVITY: '#8b5cf6',
  ACCOUNT_LOCKED: '#dc2626',
  SESSION_HIJACK_ATTEMPT: '#b91c1c',
  UNAUTHORIZED_ACCESS: '#c2410c',
};

// API helpers

async function fetchDashboard(gateRange: GateRange = '24h'): Promise<SecurityDashboardData> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mbt_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`/api/security/dashboard?range=${gateRange}`, { headers, credentials: 'same-origin' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch dashboard (${res.status})`);
  }
  const json = await res.json();
  const data = json.data;

  // Map nested API response to flat structure expected by the component
  return {
    securityScore: data?.overview?.securityScore ?? 0,
    totalEvents24h: data?.overview?.eventsLast24h ?? 0,
    blockedAttempts: data?.overview?.blockedAttempts24h ?? 0,
    criticalEvents: data?.overview?.criticalEvents24h ?? 0,
    activeSessions: data?.overview?.activeSessions ?? 0,
    eventsByType: Array.isArray(data?.breakdown?.byType) ? data.breakdown.byType : [],
    eventsBySeverity: Array.isArray(data?.breakdown?.bySeverity) ? data.breakdown.bySeverity : [],
    topIPs: Array.isArray(data?.topTargets?.ips) ? data.topTargets.ips : [],
    recentCritical: Array.isArray(data?.recentCritical) ? data.recentCritical : [],
    timeline: Array.isArray(data?.timeline) ? data.timeline : [],
    // v2.293.0: the gate-heat aggregate (already voiced by the lib).
    // v2.294.0: the wire names its window; the face reads it back.
    deniedGates: data?.deniedGates ?? { top: [], namedDenials: 0, unnamedDenials: 0, voice: '', maxCount: 0, window: gateRange },
  };
}

async function fetchEvents(params: Record<string, string>): Promise<unknown> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mbt_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/security/events?${qs}`, { headers, credentials: 'same-origin' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch events (${res.status})`);
  }
  return res.json();
}

// v2.295.0: the gate drill's fetch — exactly the PERMISSION_DENIED rows
// that named this resource, windowed to the card's lens, newest 8 with the
// honest total so the panel can speak "+N earlier in this window".
interface GateDrillEvent {
  id: string;
  eventType: string;
  severity: string;
  ipAddress: string | null;
  action: string | null;
  createdAt: string;
  blocked: boolean;
}

async function fetchGateDrill(
  resource: string,
  range: GateRange
): Promise<{ events: GateDrillEvent[]; total: number }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mbt_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const dateFrom = new Date(Date.now() - GATE_WINDOW_MS[range]).toISOString();
  const qs = new URLSearchParams({
    resource,
    eventType: 'PERMISSION_DENIED',
    dateFrom,
    limit: '8',
  }).toString();
  const res = await fetch(`/api/security/events?${qs}`, { headers, credentials: 'same-origin' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch gate drill (${res.status})`);
  }
  const json = await res.json();
  return {
    events: Array.isArray(json?.data) ? json.data : [],
    total: typeof json?.pagination?.total === 'number' ? json.pagination.total : 0,
  };
}

// Security Score Gauge

function SecurityScoreGauge({ score }: { score: number }) {
  const radius = 70;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // v2.204.0: the arc rides the -600 family (green-500 2.28 / yellow-500 1.92
  // sat below the 3:1 graphics bar) while the score TEXT below the arc rides
  // the -700 classes (green-500 text was 2.28:1 against the 4.5:1 text bar).
  const color = score >= 80 ? '#16a34a' : score >= 50 ? '#a16207' : '#ef4444';
  const colorClass = score >= 80 ? 'text-green-700' : score >= 50 ? 'text-yellow-700' : 'text-red-700';
  const label = score >= 80 ? 'Good' : score >= 50 ? 'Fair' : 'Poor';

  // v2.207.0: the ring speaks — the fill IS the score, so the aria names the
  // score, its ceiling and the verdict (composeScoreVoice, report-voices).
  const gaugeVoice = composeScoreVoice('Security score', score, 100, label);

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
        role="img"
        aria-label={gaugeVoice}
      >
        {/* Background circle */}
        <circle
          stroke="currentColor"
          className="text-muted-foreground/20"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          stroke={color}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${colorClass}`}>{score}</span>
        <span className={`text-xs font-medium ${colorClass}`}>{label}</span>
      </div>
    </div>
  );
}

// Overview Card

function OverviewCard({
  icon: Icon,
  label,
  value,
  colorClass,
  bgColorClass,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  colorClass: string;
  bgColorClass: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${bgColorClass}`}>
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Severity Badge — the face imports from the lib's closed set (v2.293.0).

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge variant="outline" className={`text-xs font-medium ${SECURITY_SEVERITY_BADGE_CLASSES[severity] || 'bg-gray-100 text-gray-500'}`}>
      {severity}
    </Badge>
  );
}

// Main Security Tab

export default function SecurityTab() {
  // v2.12.8 (PR C): local view toggle
  // The Security tab now hosts TWO views: the existing Security Dashboard
  // (default) and the new Audit Trail. Local state - the sidebar/tab config
  // stays untouched.
  const [view, setView] = useState<'dashboard' | 'audit'>('dashboard');

  // Filter state
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterEventType, setFilterEventType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  // v2.294.0: the Most denied gates card's time lens (24h / 7d / 30d).
  const [gateRange, setGateRange] = useState<GateRange>('24h');
  // v2.295.0: the gate drill — the card's rows are handles; the drilled
  // resource lives here (null = closed, exactly one drill at a time).
  const [gateDrill, setGateDrill] = useState<string | null>(null);

  // v2.295.0: the drill closes on Escape. The card is NOT inside a Radix
  // DismissableLayer (no topmost-law to lean on), so the drill owns its own
  // window listener — mounted ONLY while a drill is open.
  useEffect(() => {
    if (!gateDrill) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGateDrill(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gateDrill]);

  // Dashboard data
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
    isRefetching: dashboardRefetching,
  } = useQuery({
    queryKey: ['security-dashboard', gateRange],
    queryFn: () => fetchDashboard(gateRange),
    refetchInterval: 30000,
  });

  // Events data
  const eventsParams = useMemo(() => {
    const params: Record<string, string> = { limit: '50' };
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (filterEventType && filterEventType !== 'all') params.eventType = filterEventType;
    if (filterSeverity && filterSeverity !== 'all') params.severity = filterSeverity;
    return params;
  }, [dateFrom, dateTo, filterEventType, filterSeverity]);

  const {
    data: _eventsResponse,
    isLoading: _eventsLoading,
  } = useQuery({
    queryKey: ['security-events', eventsParams],
    queryFn: () => fetchEvents(eventsParams),
    refetchInterval: 30000,
  });

  // v2.295.0: the gate drill's rows — one query, keyed by the drilled gate
  // AND the lens (a window change refetches the drill over its own window);
  // disabled entirely while no drill is open.
  const gateDrillQuery = useQuery({
    queryKey: ['security-gate-drill', gateDrill, gateRange],
    queryFn: () => fetchGateDrill(gateDrill || '', gateRange),
    enabled: !!gateDrill,
  });

  const handleRefresh = () => {
    refetchDashboard();
    toast.success('Security data refreshed');
  };

  const handleBlockIP = async (ip: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('mbt_token') : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      // Get CSRF token from cookie
      const csrfMatch = document.cookie.match(/csrf_token=([^;]+)/);
      if (csrfMatch) headers['X-CSRF-Token'] = csrfMatch[1];

      const res = await fetch('/api/security/block-ip', {
        method: 'POST',
        headers,
        credentials: 'same-origin',
        body: JSON.stringify({ ipAddress: ip, duration: 60, reason: 'Blocked from security dashboard' }),
      });
      if (res.ok) {
        toast.success(`IP ${ip} has been blocked`, {
          description: 'The IP address has been blocked for 1 hour.',
        });
        refetchDashboard();
      } else {
        toast.error('Failed to block IP');
      }
    } catch {
      toast.error('Failed to block IP');
    }
  };

  // Timeline data formatted for chart
  const timelineData = useMemo(() => {
    if (!dashboard?.timeline) return [];
    return dashboard.timeline.map(t => ({
      ...t,
      hourLabel: t.hour.split(' ')[1]?.slice(0, 5) || t.hour,
    }));
  }, [dashboard]);

  // Events by type for chart
  const eventsByTypeData = useMemo(() => {
    if (!dashboard?.eventsByType) return [];
    return dashboard.eventsByType.map(e => ({
      name: EVENT_TYPE_LABELS[e.type] || e.type,
      count: e.count,
      fill: EVENT_TYPE_COLORS[e.type] || '#6b7280',
    }));
  }, [dashboard]);

  // Events by severity for donut
  const eventsBySeverityData = useMemo(() => {
    if (!dashboard?.eventsBySeverity) return [];
    return dashboard.eventsBySeverity.map(e => ({
      name: e.severity,
      value: e.count,
      fill: SEVERITY_COLORS[e.severity] || '#6b7280',
    }));
  }, [dashboard]);

  // View toggle (v2.12.8): Security Dashboard | Audit Trail - rendered in the
  // header of BOTH views so the user can always switch back.
  const viewToggle = (
    <div
      className="flex items-center gap-1 p-1 rounded-lg bg-muted"
      role="tablist"
      aria-label="Security views"
    >
      <button
        type="button"
        role="tab"
        aria-selected={view === 'dashboard'}
        onClick={() => setView('dashboard')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          view === 'dashboard'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Shield className="h-3.5 w-3.5" />
        Security Dashboard
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === 'audit'}
        onClick={() => setView('audit')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
          view === 'audit'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <ScrollText className="h-3.5 w-3.5" />
        Audit Trail
      </button>
    </div>
  );

  // Audit Trail view (v2.12.8)
  if (view === 'audit') {
    return (
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
              <ScrollText className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Audit Trail</h1>
              <p className="text-xs text-muted-foreground">
                Permission denials, manager overrides and authorizations - every denial, exactly once
              </p>
            </div>
          </div>
          {viewToggle}
        </div>
        <AuditTrailSection />
      </div>
    );
  }

  // Loading skeleton
  if (dashboardLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
            <Shield className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Security Dashboard</h1>
            <p className="text-xs text-muted-foreground">Monitor security events and threats</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* v2.12.8 (PR C): view switcher - Dashboard | Audit Trail. */}
          {viewToggle}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-primary/5 border-primary/30' : ''}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={dashboardRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${dashboardRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Date From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Date To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Event Type</Label>
                <Select value={filterEventType} onValueChange={setFilterEventType}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="RATE_LIMITED">Rate Limited</SelectItem>
                    <SelectItem value="BRUTE_FORCE">Brute Force</SelectItem>
                    <SelectItem value="CSRF_FAILED">CSRF Failed</SelectItem>
                    <SelectItem value="INVALID_INPUT">Invalid Input</SelectItem>
                    <SelectItem value="SUSPICIOUS_ACTIVITY">Suspicious Activity</SelectItem>
                    <SelectItem value="ACCOUNT_LOCKED">Account Locked</SelectItem>
                    <SelectItem value="SESSION_HIJACK_ATTEMPT">Session Hijack</SelectItem>
                    <SelectItem value="UNAUTHORIZED_ACCESS">Unauthorized Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Severity</Label>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="All Severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                    <SelectItem value="WARN">Warning</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="DEBUG">Debug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(dateFrom || dateTo || filterEventType !== 'all' || filterSeverity !== 'all') && (
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setFilterEventType('all');
                    setFilterSeverity('all');
                  }}
                  className="text-xs h-7"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Score + Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Security Score Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Security Score</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-4 relative">
            <SecurityScoreGauge score={dashboard?.securityScore ?? 0} />
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <OverviewCard
            icon={Shield}
            label="Events (24h)"
            value={dashboard?.totalEvents24h ?? 0}
            colorClass="text-blue-500"
            bgColorClass="bg-blue-500/10"
          />
          <OverviewCard
            icon={ShieldOff}
            label="Blocked Attempts"
            value={dashboard?.blockedAttempts ?? 0}
            colorClass="text-orange-500"
            bgColorClass="bg-orange-500/10"
          />
          <OverviewCard
            icon={AlertTriangle}
            label="Critical Events"
            value={dashboard?.criticalEvents ?? 0}
            colorClass={dashboard?.criticalEvents ? 'text-red-500' : 'text-green-500'}
            bgColorClass={dashboard?.criticalEvents ? 'bg-red-500/10' : 'bg-green-500/10'}
          />
          <OverviewCard
            icon={Users}
            label="Active Sessions"
            value={dashboard?.activeSessions ?? 0}
            colorClass="text-emerald-500"
            bgColorClass="bg-emerald-500/10"
          />
        </div>
      </div>

      {/* Charts Row: Events by Type + Events by Severity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Events by Type - Horizontal Bar Chart */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium">Events by Type</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {eventsByTypeData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                <div className="flex flex-col items-center gap-2">
                  <Shield className="h-8 w-8 opacity-30" />
                  <span>No events recorded</span>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(200, eventsByTypeData.length * 40)}>
                <BarChart data={eventsByTypeData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                    {eventsByTypeData.map((entry, index) => (
                      <Cell key={`type-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Events by Severity - Donut Chart */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium">Events by Severity</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            {eventsBySeverityData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                <div className="flex flex-col items-center gap-2">
                  <Activity className="h-8 w-8 opacity-30" />
                  <span>No severity data</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie
                      data={eventsBySeverityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {eventsBySeverityData.map((entry, index) => (
                        <Cell key={`sev-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {eventsBySeverityData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                      <span className="text-xs font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Events Timeline */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium">Events Timeline (Last 24h)</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          {timelineData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              <div className="flex flex-col items-center gap-2">
                <Activity className="h-8 w-8 opacity-30" />
                <span>No timeline data</span>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={timelineData} margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="hourLabel"
                  tick={{ fontSize: 10 }}
                  interval={2}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorEvents)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom row: Top Targeted IPs + Recent Critical Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Targeted IPs */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              Top Targeted IPs
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {!Array.isArray(dashboard?.topIPs) || !dashboard.topIPs.length ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                No suspicious IPs detected
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs h-9">IP Address</TableHead>
                      <TableHead className="text-xs h-9 text-right">Events</TableHead>
                      <TableHead className="text-xs h-9 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.topIPs.map((ip) => (
                      <TableRow key={ip.ipAddress}>
                        <TableCell className="text-xs font-mono py-2">{ip.ipAddress}</TableCell>
                        <TableCell className="text-xs text-right py-2">
                          <Badge variant="secondary" className="text-xs">
                            {ip.eventCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-right py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => handleBlockIP(ip.ipAddress)}
                          >
                            <Ban className="h-3 w-3 mr-1" />
                            Block
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Critical Events */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Recent Critical Events
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {!Array.isArray(dashboard?.recentCritical) || !dashboard.recentCritical.length ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                <div className="flex flex-col items-center gap-2">
                  <Shield className="h-6 w-6 text-green-500 opacity-50" />
                  <span>No critical events in the last 24h</span>
                </div>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs h-9">Time</TableHead>
                      <TableHead className="text-xs h-9">Type</TableHead>
                      <TableHead className="text-xs h-9">Severity</TableHead>
                      <TableHead className="text-xs h-9">IP</TableHead>
                      <TableHead className="text-xs h-9">Resource</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.recentCritical.map((event) => (
                      <TableRow
                        key={event.id}
                        className={
                          // v2.293.0: the row wears its record — the same
                          // tone law the feed's Security pane speaks. A
                          // CRITICAL/ERROR event is red on the dashboard
                          // too; the type fills the gaps; unknown stays
                          // quiet. One function, two surfaces.
                          SECURITY_TONE_CLASSES[securityRowTone(event.eventType, event.severity)].row
                        }
                      >
                        <TableCell className="text-xs py-2 whitespace-nowrap">
                          {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell className="text-xs py-2">
                          {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                        </TableCell>
                        <TableCell className="py-2">
                          <SeverityBadge severity={event.severity} />
                        </TableCell>
                        <TableCell className="text-xs font-mono py-2">
                          {event.ipAddress || '-'}
                        </TableCell>
                        <TableCell className="text-xs py-2 max-w-[120px] truncate">
                          {event.resource || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* v2.293.0: Most Denied Gates — the gate-heat report. The denial
          ledger (v2.292.0) made every refusal land on the record; this card
          reads the ledger back: which gates said no most. The bars ride
          amber-600 (the denial tone's graphics-safe family on the white
          card, per the v2.204.0 3:1 law) and the subtitle is the lib's own
          voice line — it always adds up, named and unnamed.
          v2.294.0: the card breathes over time — a pressed-chip lens
          (24h / 7d / 30d) refetches the same report over a wider window;
          the pressed face is the denial tone's own amber family, quiet
          until asked. */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ban className="h-4 w-4 text-amber-600" />
              Most denied gates
            </CardTitle>
            {/* the time lens — segmented chips, one pressed at a time */}
            <div
              className="flex items-center gap-1"
              role="group"
              aria-label="Denied gates time window"
            >
              {GATE_RANGES.map((r) => {
                const pressed = gateRange === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => setGateRange(r.value)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                      pressed
                        ? 'bg-amber-500/10 text-amber-700 border-amber-500/30 font-medium'
                        : 'bg-transparent text-muted-foreground border-border hover:bg-muted/60'
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
          {dashboard?.deniedGates?.voice ? (
            <p className="text-xs text-muted-foreground pt-1">{dashboard.deniedGates.voice}</p>
          ) : null}
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {!dashboard?.deniedGates?.top?.length ? (
            <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-5 w-5 text-green-500 opacity-50" />
                <span>No denials in the last {gateRange} — every gate said yes.</span>
              </div>
            </div>
          ) : (
            <>
            <ul className="space-y-2">
              {dashboard.deniedGates.top.map((gate: DeniedGate) => {
                const width = dashboard.deniedGates.maxCount > 0
                  ? Math.round((gate.count / dashboard.deniedGates.maxCount) * 100)
                  : 0;
                const drilled = gateDrill === gate.resource;
                return (
                  <li key={gate.resource}>
                    {/* v2.295.0: the row is a HANDLE — a real button (keyboard
                        arrives free) that opens the gate's drill panel. The
                        pressed face is the same amber family the lens speaks;
                        hover + focus-visible invite the hand. */}
                    <button
                      type="button"
                      onClick={() => setGateDrill(drilled ? null : gate.resource)}
                      aria-expanded={drilled}
                      aria-controls={drilled ? 'gate-drill-panel' : undefined}
                      className={`w-full flex items-center gap-3 rounded-md px-2 py-1.5 -mx-2 text-left transition-colors cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 ${
                        drilled ? 'bg-amber-500/[0.06]' : ''
                      }`}
                    >
                      <span className="text-xs font-mono truncate max-w-[45%]" title={gate.resource}>
                        {gate.resource}
                      </span>
                      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-600 transition-all duration-500"
                          style={{ width: `${Math.max(width, 6)}%` }}
                          aria-hidden="true"
                        />
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs font-medium bg-amber-500/10 text-amber-700 border-amber-500/20 shrink-0"
                      >
                        {gate.count} {gate.count === 1 ? 'denial' : 'denials'}
                      </Badge>
                    </button>
                  </li>
                );
              })}
            </ul>
            {gateDrill ? (() => {
              // v2.295.0: the gate drill panel — the ledger behind the count.
              const drilledCount = dashboard.deniedGates.top.find(
                (g: DeniedGate) => g.resource === gateDrill
              )?.count ?? 0;
              const drillRows = gateDrillQuery.data?.events ?? [];
              return (
                <div
                  id="gate-drill-panel"
                  role="region"
                  aria-label={`Gate drill: ${gateDrill}`}
                  className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-xs text-amber-700 flex items-center gap-1.5 min-w-0">
                      <Filter className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="font-mono font-medium truncate max-w-[240px]" title={gateDrill}>
                        {gateDrill}
                      </span>
                      <span className="text-amber-600/90 shrink-0">
                        {gateDrillVoice(gateDrill, drilledCount, gateRange)}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setGateDrill(null)}
                      aria-label="Close gate drill"
                      className="rounded p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 shrink-0"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  {gateDrillQuery.isLoading ? (
                    <div className="mt-2 space-y-1.5">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                  ) : drillRows.length === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {gateDrillEmptyVoice(gateDrill)}
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {drillRows.map((ev) => (
                        <li key={ev.id} className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 font-medium shrink-0 ${
                              SECURITY_SEVERITY_BADGE_CLASSES[ev.severity] || 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {ev.severity}
                          </Badge>
                          <span className="font-medium text-foreground/80 shrink-0">
                            {EVENT_TYPE_LABELS[ev.eventType] || ev.eventType}
                          </span>
                          {ev.ipAddress ? (
                            <span className="font-mono truncate" title={ev.ipAddress}>
                              {ev.ipAddress}
                            </span>
                          ) : null}
                          <span className="ml-auto shrink-0 tabular-nums">
                            {new Date(ev.createdAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {gateDrillQuery.data && gateDrillQuery.data.total > drillRows.length ? (
                    <p className="mt-2 text-[11px] text-muted-foreground/80">
                      +{gateDrillQuery.data.total - drillRows.length} earlier in this window.
                    </p>
                  ) : null}
                </div>
              );
            })() : null}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
