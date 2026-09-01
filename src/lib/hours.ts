import type { DayAvailability } from "@/lib/mock-data";

/**
 * The atelier keeps a standing weekly pattern rather than opening each date by
 * hand. A date with no explicit override follows this pattern; the moment the
 * studio edits a specific date, that date becomes an override and stops
 * following the pattern until it is reset.
 */

/** Indexed the same way as `Date.getDay()` — 0 is Sunday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DayHours = {
  open: boolean;
  /** "HH:MM" — the first fitting of the day starts here. */
  from: string;
  /** "HH:MM" — the last fitting must *end* by here, so it is never a start time. */
  to: string;
};

export type WeeklyHours = {
  /** Always length 7, indexed by weekday. */
  days: DayHours[];
  /** How long one fitting is blocked out for. */
  slotMinutes: number;
};

const WORKING: DayHours = { open: true, from: "16:00", to: "18:00" };
const CLOSED: DayHours = { open: false, from: "16:00", to: "18:00" };

/**
 * Fittings run 16:00–18:00 every day except Wednesday and Friday. Closed days
 * keep their from/to so reopening one restores the usual window instead of an
 * empty range.
 */
export const DEFAULT_WEEKLY_HOURS: WeeklyHours = {
  days: [
    { ...WORKING }, // Sunday
    { ...WORKING }, // Monday
    { ...WORKING }, // Tuesday
    { ...CLOSED }, // Wednesday
    { ...WORKING }, // Thursday
    { ...CLOSED }, // Friday
    { ...WORKING }, // Saturday
  ],
  slotMinutes: 30,
};

/** Monday-first, for lists a person reads as a work week. */
export const WEEK_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

export const SLOT_LENGTHS = [15, 20, 30, 45, 60];

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}

export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Today as a "YYYY-MM-DD" key, in the studio's own timezone. */
export function todayKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Read the weekday straight off the key's parts. Passing the string to
 * `new Date()` would parse it as UTC midnight, which lands on the previous day
 * for anyone west of Greenwich.
 */
export function weekdayOf(dateKey: string): Weekday {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).getDay() as Weekday;
}

/** Start times that fit whole between `from` and `to`. */
export function buildSlotTimes(hours: DayHours, slotMinutes: number): string[] {
  const start = toMinutes(hours.from);
  const end = toMinutes(hours.to);
  const step = Math.max(5, slotMinutes);
  const times: string[] = [];
  // `+ step <= end` so an 18:00 close means 17:30 is the last 30-minute fitting.
  for (let t = start; t + step <= end; t += step) times.push(fromMinutes(t));
  return times;
}

/**
 * Storage may hold a shape written by an older build (or hand-edited), so every
 * field is checked before it reaches the UI.
 */
export function normalizeWeeklyHours(raw: unknown): WeeklyHours {
  const value = raw as Partial<WeeklyHours> | null;
  const days = Array.isArray(value?.days) ? value.days : [];
  return {
    days: DEFAULT_WEEKLY_HOURS.days.map((fallback, i) => {
      const day = days[i] as Partial<DayHours> | undefined;
      return {
        open: typeof day?.open === "boolean" ? day.open : fallback.open,
        from: typeof day?.from === "string" ? day.from : fallback.from,
        to: typeof day?.to === "string" ? day.to : fallback.to,
      };
    }),
    slotMinutes:
      typeof value?.slotMinutes === "number" && value.slotMinutes > 0
        ? value.slotMinutes
        : DEFAULT_WEEKLY_HOURS.slotMinutes,
  };
}

/** What the weekly pattern alone says about a date, before any override. */
export function derivedDay(dateKey: string, weekly: WeeklyHours): DayAvailability {
  const hours = weekly.days[weekdayOf(dateKey)] ?? CLOSED;
  return {
    date: dateKey,
    open: hours.open,
    // Slots are built even for a closed day: opening the day by hand should
    // hand back the usual window rather than an empty list to fill in.
    slots: buildSlotTimes(hours, weekly.slotMinutes).map((time) => ({
      id: `${dateKey}-${time}`,
      time,
    })),
  };
}

/**
 * The day as the studio and clients should see it: an explicit override if the
 * studio set one, otherwise the weekly pattern — minus anything already booked,
 * and never in the past.
 */
export function resolveDay(
  dateKey: string,
  overrides: DayAvailability[],
  weekly: WeeklyHours,
  bookedTimes: Set<string>,
  today = todayKey()
): DayAvailability {
  const override = overrides.find((d) => d.date === dateKey);
  const base =
    override ??
    (dateKey < today
      ? { date: dateKey, open: false, slots: [] }
      : derivedDay(dateKey, weekly));
  if (bookedTimes.size === 0) return base;
  return { ...base, slots: base.slots.filter((s) => !bookedTimes.has(s.time)) };
}
