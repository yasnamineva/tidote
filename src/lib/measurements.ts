import type { Measurements } from "@/lib/mock-data";

export type MeasurementKey = keyof Omit<Measurements, "notes" | "updatedAt">;

/**
 * `num` matches the number printed next to that measurement on the guide
 * illustrations in /public/measure — keep the two in sync.
 */
export type MeasurementField = {
  key: MeasurementKey;
  num: number;
  labelKey: string;
  helpKey: string;
};

export const MEASUREMENT_FIELDS: MeasurementField[] = [
  "height",
  "shoulders",
  "chest",
  "waistNatural",
  "lowerWaist",
  "inseam",
  "ankle",
  "upperArm",
  "biceps",
  "wrist",
  "thigh",
].map((key, i) => ({
  key: key as MeasurementKey,
  num: i + 1,
  labelKey: `measure.${key}`,
  helpKey: `measure.help.${key}`,
}));

const BY_KEY = new Map(MEASUREMENT_FIELDS.map((f) => [f.key, f]));

export function measurementField(key: MeasurementKey): MeasurementField {
  const field = BY_KEY.get(key);
  if (!field) throw new Error(`Unknown measurement key: ${key}`);
  return field;
}
