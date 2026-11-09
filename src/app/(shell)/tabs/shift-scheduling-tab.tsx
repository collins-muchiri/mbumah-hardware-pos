'use client';

/**
 * Shift Scheduling Tab - main UI for the planned shift roster feature.
 *
 * Layout:
 *   1. Header with title + week navigation (prev/next/today) + "Add Shift"
 *   2. Stats cards row (ScheduleStatsCards)
 *   3. Two-column layout on desktop:
 *        - Left (2/3): WeeklyCalendar
 *        - Right (1/3): UserHoursBreakdown + color legend
 *   4. Mobile: stacked
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
} from 'lucide-react';

import { useAppStore } from '@/lib/stores';
import {
  shiftSchedulesApi,
  type ShiftScheduleItem,
} from '@/lib/api';
import { parseInitialNamedDay } from '@/lib/tab-url';
import { handleError } from '@/lib/error-handler';
import {
  COLOR_PALETTE,
  getWeekStart,
  formatWeekRange,
  dateToDateInputValue,
} from '@/lib/shift-schedule-utils';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LandingChip } from '@/components/landing-chip';

import { WeeklyCalendar } from '@/components/shift-scheduling/weekly-calendar';
import { ScheduleStatsCards } from '@/components/shift-scheduling/schedule-stats-cards';
import { UserHoursBreakdown } from '@/components/shift-scheduling/user-hours-breakdown';
import { CreateScheduleDialog } from '@/components/shift-scheduling/create-schedule-dialog';
import { EditScheduleDialog } from '@/components/shift-scheduling/edit-schedule-dialog';

function todayWeekStart(): string {
  return dateToDateInputValue(getWeekStart(new Date()));
}

// THE SHIFT'S WEEK RIDES THE ADDRESS (v2.487.0 — the deep-link family's
// forty-fifth word, the FOURTH shell-tab desk): the scheduling desk's
// FIRST daily question, "which week am I planning?", answers the bar.
// The desk's week speaks its desk-prefixed `?shift-week=<YYYY-MM-DD>` —
// a SHAPE word (the wire's own day-key class, the date input's own
// bytes, read through the ONE home's honest-day validator: the day must
// be REAL, proven by round-trip — a made-up date is an unknown word,
// not a clever match; the collision check ran at round start: the byte
// appeared NOWHERE before this word). THE DEFAULT WEARS NO WORD: the
// resting week is THIS week — the address's silence, the key strips
// when the desk rests, and a landed word that names the resting week
// wears no chip (the rep-type law's own reading — a landing of the
// default speaks the shape the bare landing already answers). THE
// LANDING IS READ ONCE ON THE SHELL: a plain useState initializer — a
// dismissed chip can never resurrect (the shell tolerates the
// default-first render — the v2.484 lesson's own exception: a shell
// tab reads on the shell). THE WEEK WRITES BACK: every hand-driven
// week turn replaceState's its word (the window's own write shape; the
// resting week stripping its key), so a turned week is a shareable
// address, never a dead end; a blocked write is the week's silence,
// never a thrown desk. The landed word wears the SLATE landing chip —
// the family's eighteenth 300-storey byte (the conversations desk's
// hue one storey deeper; the shade-split law's next form; slate LEFT
// the stranger list). The chip lives in the desk's own week-nav strip,
// beside the range label it names.

// The landed word, read once on the shell: the address's word is the
// desk's week, or silence (an unknown word is never a clever match).
function landedShiftWeekWord(): string {
  if (typeof window === 'undefined') return '';
  return parseInitialNamedDay(window.location.search, 'shift-week');
}

// The write half — the week's own replaceState (preserve the other
// params: the shell's tab word and every other desk's word ride
// untouched); the RESTING week strips its key — the address never
// carries the resting face's word.
function writeShiftWeekWord(iso: string): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (iso === todayWeekStart()) params.delete('shift-week');
    else params.set('shift-week', iso);
    const qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
  } catch {
    // The address never lies louder than the week — a blocked write
    // leaves the week on the desk, exactly where the human pressed it.
  }
}

export function ShiftSchedulingTab() {
  const { currentStoreId } = useAppStore();
  // THE WEEK'S OWN LANDING (v2.487.0) — the word reads once on the
  // shell (the landing law's shape): the address's word lands into the
  // week navigation, a dismissed chip can never resurrect.
  const [landedShiftWeek] = useState<string>(landedShiftWeekWord);
  const [shiftWeekLandingLive, setShiftWeekLandingLive] = useState(true);
  const [weekStartStr, setWeekStartStr] = useState<string>(() => landedShiftWeekWord() || todayWeekStart());
  const [createOpen, setCreateOpen] = useState(false);
  const [presetDate, setPresetDate] = useState<string | null>(null);
  const [editSchedule, setEditSchedule] = useState<ShiftScheduleItem | null>(null);

  // THE ONE DOOR — the turn and the write ride together (the family's
  // own shape: every week turn speaks this one door, the address's
  // word and the desk's week never drift apart).
  const chooseShiftWeek = (iso: string) => {
    // THE FAMILY'S ONE READING (v2.488.0 — the guarded door): no turn,
    // no write — a re-press of the standing week is not a turn. And the
    // hand's turn retires the landing word: the chip speaks the ADDRESS
    // BAR's landing, never the human's next choice (the family's ONE
    // reading — the window's persist shape retires with it).
    if (iso === weekStartStr) return;
    setWeekStartStr(iso);
    if (iso !== landedShiftWeek) setShiftWeekLandingLive(false);
    writeShiftWeekWord(iso);
  };

  // Week navigation
  const handlePrevWeek = () => {
    const d = new Date(weekStartStr);
    d.setDate(d.getDate() - 7);
    chooseShiftWeek(dateToDateInputValue(d));
  };

  const handleNextWeek = () => {
    const d = new Date(weekStartStr);
    d.setDate(d.getDate() + 7);
    chooseShiftWeek(dateToDateInputValue(d));
  };

  const handleToday = () => {
    chooseShiftWeek(todayWeekStart());
  };

  const weekRangeLabel = useMemo(() => {
    return formatWeekRange(new Date(weekStartStr));
  }, [weekStartStr]);

  // Data: weekly schedules
  const weeklyQueryKey = useMemo(
    () => ['shift-schedules-weekly', currentStoreId, weekStartStr] as const,
    [currentStoreId, weekStartStr],
  );

  const {
    data: weekDays,
    isLoading: weeklyLoading,
    error: weeklyError,
    refetch: refetchWeekly,
    isFetching,
  } = useQuery({
    queryKey: weeklyQueryKey,
    queryFn: async () => {
      const res = await shiftSchedulesApi.weekly(currentStoreId, weekStartStr);
      return res.data ?? [];
    },
    enabled: Boolean(currentStoreId),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (weeklyError) {
      const msg = handleError(weeklyError, 'Load weekly shift schedules');
      toast.error('Failed to load weekly schedules', { description: msg });
    }
  }, [weeklyError]);

  // Data: stats
  const statsQueryKey = useMemo(
    () => ['shift-schedules-stats', currentStoreId, weekStartStr] as const,
    [currentStoreId, weekStartStr],
  );

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: statsQueryKey,
    queryFn: async () => {
      const res = await shiftSchedulesApi.stats(currentStoreId, weekStartStr);
      return res.data;
    },
    enabled: Boolean(currentStoreId),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (statsError) {
      const msg = handleError(statsError, 'Load shift schedule stats');
      toast.error('Failed to load stats', { description: msg });
    }
  }, [statsError]);

  // Handlers
  const handleRefresh = () => {
    refetchWeekly();
    refetchStats();
  };

  const handleSlotClick = (dateISO: string) => {
    setPresetDate(dateISO);
    setCreateOpen(true);
  };

  const handleAddShift = () => {
    setPresetDate(null);
    setCreateOpen(true);
  };

  const handleCreateOpenChange = (next: boolean) => {
    setCreateOpen(next);
    if (!next) setPresetDate(null);
  };

  const handleEditOpenChange = (next: boolean) => {
    if (!next) setEditSchedule(null);
  };

  const totalShifts = useMemo(() => {
    if (!Array.isArray(weekDays)) return 0;
    return weekDays.reduce((sum, d) => sum + d.schedules.length, 0);
  }, [weekDays]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-emerald-500" />
            Shift Scheduling
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plan recurring and one-off shift schedules for your staff.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleAddShift}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Shift
          </Button>
        </div>
      </div>

      {/* Stats */}
      <ScheduleStatsCards stats={stats} isLoading={statsLoading} />

      {/* Week navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card/50 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7 transition-colors" onClick={handlePrevWeek} aria-label="Previous week">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-7 transition-colors"
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 transition-colors" onClick={handleNextWeek} aria-label="Next week">
            <ChevronRight className="h-4 w-4" />
          </Button>
          {/* THE WEEK'S OWN STRIP (v2.487.0 — the styling verse): the
              range label wears the slate family's quiet ground and
              tabular figures while a NON-default week rides (the
              word's own tint, the pressed week and its landing chip
              speaking one voice — the desk's own byte order, never the
              loom's wardrobe copy), the resting week's label plain. */}
          <span
            data-testid="shift-week-range-label"
            className={weekStartStr !== todayWeekStart()
              ? 'text-sm font-semibold ml-2 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-700 tabular-nums dark:bg-slate-500/10 dark:border-slate-500/30 dark:text-slate-300'
              : 'text-sm font-semibold ml-2 tabular-nums'}
          >
            {weekRangeLabel}
          </span>
          {/* THE WEEK'S LANDING CHIP (v2.487.0) — the word's own chip
              in the strip the week nav wears: the EIGHTEENTH 300-storey
              byte, slate — the scheduling desk's roster hue. It only
              speaks when the shell LANDED with a NON-default week (the
              default wears no chip — the chip names a word, never a
              silence), and a press retires the name, never the week
              (the window's own dismissal shape — the dismissal returns
              the desk to the resting week through the one door). */}
          {shiftWeekLandingLive && landedShiftWeek && landedShiftWeek !== todayWeekStart() && (
            <LandingChip
              hue="slate"
              label={`landed ?shift-week=${landedShiftWeek}`}
              onDismiss={() => { setShiftWeekLandingLive(false); chooseShiftWeek(todayWeekStart()); }}
              title="The week landed with this word from the address bar — press to return to this week"
              data-testid="shift-week-landing-word"
            />
          )}
        </div>
        {/* THE COUNT'S OWN STRIP (v2.487.0 — the styling verse): the
            scheduled counter wears a quiet ground and tabular figures,
            so the week's answer reads as one steady word. */}
        <div
          data-testid="shift-week-scheduled-count"
          className="text-xs text-muted-foreground px-2 py-0.5 rounded-md bg-muted/30 tabular-nums"
        >
          {totalShifts} shift{totalShifts === 1 ? '' : 's'} scheduled
        </div>
      </div>

      {/* Main content: two columns on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar - 2/3 width */}
        <div className="lg:col-span-2">
          <WeeklyCalendar
            weekDays={weekDays}
            isLoading={weeklyLoading}
            onSlotClick={handleSlotClick}
            onShiftClick={setEditSchedule}
          />
        </div>

        {/* Right column - hours breakdown + legend */}
        <div className="space-y-4">
          <UserHoursBreakdown stats={stats} isLoading={statsLoading} />

          {/* Color legend */}
          <div className="rounded-lg border bg-card/50 p-3">
            <p className="text-xs font-semibold mb-2">Color Legend</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {COLOR_PALETTE.map((c) => (
                <div key={c.value} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                  <span className="text-[11px] text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loading skeleton */}
          {weeklyLoading && (
            <Skeleton className="h-32" />
          )}

          {/* Empty state for the week */}
          {!weeklyLoading && totalShifts === 0 && (
            <div className="rounded-lg border-2 border-dashed p-4 text-center">
              <CalendarDays className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-xs font-semibold">No shifts this week</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Click an empty slot or use &ldquo;Add Shift&rdquo; to schedule staff.
              </p>
              <Button
                size="sm"
                onClick={handleAddShift}
                className="mt-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Shift
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Floating loading indicator */}
      {isFetching && !weeklyLoading && (
        <div className="fixed bottom-4 right-4 bg-background/90 backdrop-blur-sm border rounded-full px-3 py-1.5 text-xs text-muted-foreground shadow-md flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" />
          Syncing…
        </div>
      )}

      {/* Dialogs */}
      <CreateScheduleDialog
        open={createOpen}
        onOpenChange={handleCreateOpenChange}
        storeId={currentStoreId}
        presetDate={presetDate}
      />

      <EditScheduleDialog
        open={Boolean(editSchedule)}
        onOpenChange={handleEditOpenChange}
        schedule={editSchedule}
      />
    </div>
  );
}

export default ShiftSchedulingTab;
