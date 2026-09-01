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
  SEED_AVAILABILITY,
  SEED_BOOKINGS,
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
import { readJSON, writeJSON } from "@/lib/storage";

const AVAILABILITY_KEY = "tidote_availability";
const BOOKINGS_KEY = "tidote_bookings";
const HOURS_KEY = "tidote_hours";

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
  bookSlot: (input: BookSlotInput) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

function sortSlots(slots: TimeSlot[]) {
  return [...slots].sort((a, b) => a.time.localeCompare(b.time));
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] =
    useState<DayAvailability[]>(SEED_AVAILABILITY);
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>(
    DEFAULT_WEEKLY_HOURS
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOverrides(readJSON(AVAILABILITY_KEY, SEED_AVAILABILITY));
    setBookings(readJSON(BOOKINGS_KEY, SEED_BOOKINGS));
    setWeeklyHours(
      normalizeWeeklyHours(readJSON(HOURS_KEY, DEFAULT_WEEKLY_HOURS))
    );
    setReady(true);
  }, []);

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
    (date: string, edit: (day: DayAvailability) => DayAvailability) => {
      setOverrides((prev) => {
        const existing = prev.find((d) => d.date === date);
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
        const next = existing
          ? prev.map((d) => (d.date === date ? updated : d))
          : [...prev, updated];
        writeJSON(AVAILABILITY_KEY, next);
        return next;
      });
    },
    [bookedByDate, weeklyHours]
  );

  const toggleDayOpen = useCallback(
    (date: string) => {
      editDay(date, (day) => ({ ...day, open: !day.open }));
    },
    [editDay]
  );

  const addSlot = useCallback(
    (date: string, time: string) => {
      editDay(date, (day) =>
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
      editDay(date, (day) => ({
        ...day,
        slots: day.slots.filter((s) => s.id !== slotId),
      }));
    },
    [editDay]
  );

  const resetDay = useCallback((date: string) => {
    setOverrides((prev) => {
      const next = prev.filter((d) => d.date !== date);
      writeJSON(AVAILABILITY_KEY, next);
      return next;
    });
  }, []);

  const saveWeeklyHours = useCallback((next: WeeklyHours) => {
    setWeeklyHours(next);
    writeJSON(HOURS_KEY, next);
  }, []);

  /**
   * Booking only records the booking. The slot disappears because `resolveDay`
   * filters booked times out, which keeps working for days that follow the
   * weekly pattern instead of freezing them into overrides.
   */
  const bookSlot = useCallback((input: BookSlotInput) => {
    setBookings((prev) => {
      const taken = prev.some(
        (b) => b.date === input.date && b.time === input.time
      );
      if (taken) return prev;
      const next: Booking[] = [
        ...prev,
        {
          id: `bk-${Date.now()}`,
          date: input.date,
          time: input.time,
          clientId: input.clientId,
          clientName: input.clientName,
          orderId: input.orderId,
          createdAt: new Date().toISOString(),
        },
      ];
      writeJSON(BOOKINGS_KEY, next);
      return next;
    });
  }, []);

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
