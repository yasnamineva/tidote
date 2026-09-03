"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type Booking,
  type DayAvailability,
  type TimeSlot,
} from "@/lib/mock-data";
import {
  DEFAULT_WEEKLY_HOURS,
  derivedDay,
  normalizeWeeklyHours,
  resolveDay as resolveDayFrom,
  todayKey,
  type WeeklyHours,
} from "@/lib/hours";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { toBooking, type BookingRow } from "@/lib/supabase/rows";

type BookSlotInput = {
  date: string;
  time: string;
  clientId: string;
  clientName: string;
  orderId: string;
};

type BookingContextValue = {
  /** Per-date exceptions. Days absent from this list follow `weeklyHours`. */
  overrides: DayAvailability[];
  bookings: Booking[];
  weeklyHours: WeeklyHours;
  ready: boolean;
  /** The day as it should be shown: override or weekly pattern, minus bookings. */
  resolveDay: (date: string) => DayAvailability;
  /** True when the studio has edited this date away from the weekly pattern. */
  isCustomDay: (date: string) => boolean;
  toggleDayOpen: (date: string) => void;
  addSlot: (date: string, time: string) => void;
  removeSlot: (date: string, slotId: string) => void;
  /** Drops the override so the date follows the weekly pattern again. */
  resetDay: (date: string) => void;
  saveWeeklyHours: (next: WeeklyHours) => void;
  bookSlot: (input: BookSlotInput) => Promise<void>;
};

const BookingContext = createContext<BookingContextValue | null>(null);

function sortSlots(slots: TimeSlot[]) {
  return [...slots].sort((a, b) => a.time.localeCompare(b.time));
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<DayAvailability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>(
    DEFAULT_WEEKLY_HOURS
  );
  const [ready, setReady] = useState(false);

  /**
   * The calendar is shared: the studio's opening hours and everyone's bookings
   * are the same rows for every viewer. A client can read which times are taken
   * but not who took them — the name is only joined in on the studio's own
   * query, so `clientName` arrives empty in the client-side portal.
   */
  const reload = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }
    const supabase = getSupabase();
    const [days, booked, settings] = await Promise.all([
      supabase.from("availability").select("date,open,slots"),
      supabase.from("bookings").select("id,date,time,profile_id,order_id,created_at,profiles(name)"),
      supabase.from("studio_settings").select("weekly_hours").maybeSingle(),
    ]);
    if (days.data) {
      setOverrides(
        days.data.map((d) => ({
          date: d.date as string,
          open: d.open as boolean,
          slots: (d.slots ?? []) as TimeSlot[],
        }))
      );
    }
    if (booked.data) {
      setBookings((booked.data as unknown as BookingRow[]).map(toBooking));
    }
    const hours = settings.data?.weekly_hours as WeeklyHours | undefined;
    setWeeklyHours(
      normalizeWeeklyHours(
        hours && Object.keys(hours).length > 0 ? hours : DEFAULT_WEEKLY_HOURS
      )
    );
    setReady(true);
  }, []);

  useEffect(() => {
    reload().catch(() => setReady(true));
  }, [reload]);

  const bookedByDate = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const b of bookings) {
      const set = map.get(b.date) ?? new Set<string>();
      set.add(b.time);
      map.set(b.date, set);
    }
    return map;
  }, [bookings]);

  const resolveDay = useCallback(
    (date: string) =>
      resolveDayFrom(
        date,
        overrides,
        weeklyHours,
        bookedByDate.get(date) ?? new Set(),
        todayKey()
      ),
    [overrides, weeklyHours, bookedByDate]
  );

  const isCustomDay = useCallback(
    (date: string) => overrides.some((d) => d.date === date),
    [overrides]
  );

  /**
   * Editing a date that is still following the weekly pattern turns it into an
   * override first, so the edit has something concrete to apply to. `edit`
   * receives the day the studio currently sees, bookings included — dropping a
   * booked slot back in here would double-book it.
   */
  const editDay = useCallback(
    async (date: string, edit: (day: DayAvailability) => DayAvailability) => {
      const existing = overrides.find((d) => d.date === date);
      const booked = bookedByDate.get(date) ?? new Set<string>();
      const base =
        existing ??
        (date < todayKey()
          ? { date, open: false, slots: [] }
          : derivedDay(date, weeklyHours));
      const visible = {
        ...base,
        slots: base.slots.filter((s) => !booked.has(s.time)),
      };
      const updated = edit(visible);
      setOverrides((prev) =>
        existing
          ? prev.map((d) => (d.date === date ? updated : d))
          : [...prev, updated]
      );
      const { error } = await getSupabase()
        .from("availability")
        .upsert({ date, open: updated.open, slots: updated.slots });
      if (error) await reload();
    },
    [overrides, bookedByDate, weeklyHours, reload]
  );

  const toggleDayOpen = useCallback(
    (date: string) => {
      void editDay(date, (day) => ({ ...day, open: !day.open }));
    },
    [editDay]
  );

  const addSlot = useCallback(
    (date: string, time: string) => {
      void editDay(date, (day) =>
        day.slots.some((s) => s.time === time)
          ? { ...day, open: true }
          : {
              ...day,
              open: true,
              slots: sortSlots([
                ...day.slots,
                { id: `${date}-${time}-${Date.now()}`, time },
              ]),
            }
      );
    },
    [editDay]
  );

  const removeSlot = useCallback(
    (date: string, slotId: string) => {
      void editDay(date, (day) => ({
        ...day,
        slots: day.slots.filter((s) => s.id !== slotId),
      }));
    },
    [editDay]
  );

  const resetDay = useCallback((date: string) => {
    setOverrides((prev) => prev.filter((d) => d.date !== date));
    void getSupabase().from("availability").delete().eq("date", date);
  }, []);

  const saveWeeklyHours = useCallback((next: WeeklyHours) => {
    setWeeklyHours(next);
    void getSupabase()
      .from("studio_settings")
      .update({ weekly_hours: next })
      .eq("id", true);
  }, []);

  /**
   * Booking only records the booking. The slot disappears because `resolveDay`
   * filters booked times out, which keeps working for days that follow the
   * weekly pattern instead of freezing them into overrides.
   */
  const bookSlot = useCallback(
    async (input: BookSlotInput) => {
      // A unique index on (date, time) is what actually stops a double booking:
      // two people can hit the same free slot in the same second, and only the
      // database sees both. A rejection here means someone else got there.
      const { error } = await getSupabase().from("bookings").insert({
        date: input.date,
        time: input.time,
        profile_id: input.clientId,
        order_id: input.orderId || null,
      });
      await reload();
      if (error) throw error;
    },
    [reload]
  );

  return (
    <BookingContext.Provider
      value={{
        overrides,
        bookings,
        weeklyHours,
        ready,
        resolveDay,
        isCustomDay,
        toggleDayOpen,
        addSlot,
        removeSlot,
        resetDay,
        saveWeeklyHours,
        bookSlot,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
