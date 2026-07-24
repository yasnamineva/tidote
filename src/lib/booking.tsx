"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  SEED_AVAILABILITY,
  SEED_BOOKINGS,
  type Booking,
  type DayAvailability,
  type TimeSlot,
} from "@/lib/mock-data";
import { readJSON, writeJSON } from "@/lib/storage";

const AVAILABILITY_KEY = "tidote_availability";
const BOOKINGS_KEY = "tidote_bookings";

type BookSlotInput = {
  date: string;
  time: string;
  clientId: string;
  clientName: string;
  orderId: string;
};

type BookingContextValue = {
  availability: DayAvailability[];
  bookings: Booking[];
  ready: boolean;
  toggleDayOpen: (date: string) => void;
  addSlot: (date: string, time: string) => void;
  removeSlot: (date: string, slotId: string) => void;
  bookSlot: (input: BookSlotInput) => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

function sortSlots(slots: TimeSlot[]) {
  return [...slots].sort((a, b) => a.time.localeCompare(b.time));
}

function findOrCreateDay(
  list: DayAvailability[],
  date: string
): DayAvailability[] {
  if (list.some((d) => d.date === date)) return list;
  return [...list, { date, open: false, slots: [] }];
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [availability, setAvailability] =
    useState<DayAvailability[]>(SEED_AVAILABILITY);
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAvailability(readJSON(AVAILABILITY_KEY, SEED_AVAILABILITY));
    setBookings(readJSON(BOOKINGS_KEY, SEED_BOOKINGS));
    setReady(true);
  }, []);

  const toggleDayOpen = useCallback((date: string) => {
    setAvailability((prev) => {
      const next = findOrCreateDay(prev, date).map((d) =>
        d.date === date ? { ...d, open: !d.open } : d
      );
      writeJSON(AVAILABILITY_KEY, next);
      return next;
    });
  }, []);

  const addSlot = useCallback((date: string, time: string) => {
    setAvailability((prev) => {
      const next = findOrCreateDay(prev, date).map((d) =>
        d.date === date
          ? {
              ...d,
              open: true,
              slots: sortSlots([
                ...d.slots,
                { id: `${date}-${time}-${Date.now()}`, time },
              ]),
            }
          : d
      );
      writeJSON(AVAILABILITY_KEY, next);
      return next;
    });
  }, []);

  const removeSlot = useCallback((date: string, slotId: string) => {
    setAvailability((prev) => {
      const next = prev.map((d) =>
        d.date === date
          ? { ...d, slots: d.slots.filter((s) => s.id !== slotId) }
          : d
      );
      writeJSON(AVAILABILITY_KEY, next);
      return next;
    });
  }, []);

  const bookSlot = useCallback((input: BookSlotInput) => {
    setAvailability((prev) => {
      const next = prev.map((d) =>
        d.date === input.date
          ? { ...d, slots: d.slots.filter((s) => s.time !== input.time) }
          : d
      );
      writeJSON(AVAILABILITY_KEY, next);
      return next;
    });
    setBookings((prev) => {
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
        availability,
        bookings,
        ready,
        toggleDayOpen,
        addSlot,
        removeSlot,
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
