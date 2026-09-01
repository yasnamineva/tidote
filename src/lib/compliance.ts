import { generateId } from "@/lib/mock-data";
import { readJSON, writeJSON } from "@/lib/storage";
import { translate, type Lang } from "@/lib/translations";

/**
 * The paperwork side of running the atelier: what has to exist, who wants it,
 * and how often. Built for a small workshop registered in Bulgaria — the
 * references are the articles to quote when asking an accountant, not a
 * substitute for asking one.
 */

export type DocStatus = "todo" | "in_progress" | "done" | "na";
export type DocRecurrence = "once" | "monthly" | "annual";
export type DocGroup =
  | "setup"
  | "tax"
  | "social"
  | "consumer"
  | "product"
  | "data";

export const DOC_STATUSES: DocStatus[] = ["todo", "in_progress", "done", "na"];

export const DOC_GROUPS: DocGroup[] = [
  "setup",
  "tax",
  "social",
  "consumer",
  "product",
  "data",
];

export type ComplianceItem = {
  id: string;
  /**
   * Set on the built-in checklist; its title and description come from the
   * dictionary so both languages stay in step. Empty for items she adds.
   */
  seedKey: string;
  title: string;
  description: string;
  group: DocGroup;
  recurrence: DocRecurrence;
  status: DocStatus;
  /** The law or authority to cite. Left untranslated — it is a citation. */
  reference: string;
  /** "YYYY-MM-DD", or empty when there is no fixed date. */
  dueOn: string;
  notes: string;
};

const COMPLIANCE_KEY = "tidote_compliance";
/** Seed items she deleted; without this they would come back on every load. */
const HIDDEN_KEY = "tidote_compliance_hidden";

type Seed = Pick<
  ComplianceItem,
  "seedKey" | "group" | "recurrence" | "reference"
>;

const SEEDS: Seed[] = [
  // Getting the business itself on the books.
  { seedKey: "company", group: "setup", recurrence: "once", reference: "Търговски регистър / БУЛСТАТ" },
  { seedKey: "bank", group: "setup", recurrence: "once", reference: "" },
  { seedKey: "accountant", group: "setup", recurrence: "once", reference: "Декларации обр. 1 и 6" },
  { seedKey: "lease", group: "setup", recurrence: "once", reference: "" },
  { seedKey: "insurance", group: "setup", recurrence: "once", reference: "" },

  // Contributions for a self-insured person.
  { seedKey: "okd5", group: "social", recurrence: "once", reference: "ОКД-5 (НАП)" },
  { seedKey: "contributions", group: "social", recurrence: "monthly", reference: "КСО" },

  // Tax, VAT and the annual filings.
  { seedKey: "invoices", group: "tax", recurrence: "monthly", reference: "чл. 114 ЗДДС" },
  { seedKey: "vatThreshold", group: "tax", recurrence: "monthly", reference: "чл. 96 ЗДДС" },
  { seedKey: "fiscal", group: "tax", recurrence: "once", reference: "Наредба Н-18" },
  { seedKey: "annualReturn", group: "tax", recurrence: "annual", reference: "чл. 92 ЗКПО / чл. 50 ЗДДФЛ" },
  { seedKey: "gfo", group: "tax", recurrence: "annual", reference: "чл. 38 ЗСч" },

  // Selling to consumers, online and in person.
  { seedKey: "eshop", group: "consumer", recurrence: "once", reference: "Наредба Н-18, Приложение 33" },
  { seedKey: "terms", group: "consumer", recurrence: "once", reference: "ЗЗП, чл. 50 и чл. 57" },

  // The garments themselves.
  { seedKey: "labelling", group: "product", recurrence: "once", reference: "Регламент (ЕС) 1007/2011" },
  { seedKey: "trademark", group: "product", recurrence: "once", reference: "Патентно ведомство / EUIPO" },

  // Client measurements and contact details are personal data.
  { seedKey: "privacy", group: "data", recurrence: "once", reference: "GDPR, чл. 13" },
  { seedKey: "processingRegister", group: "data", recurrence: "annual", reference: "GDPR, чл. 30" },
];

function seedToItem(seed: Seed): ComplianceItem {
  return {
    id: `doc-${seed.seedKey}`,
    seedKey: seed.seedKey,
    title: "",
    description: "",
    group: seed.group,
    recurrence: seed.recurrence,
    status: "todo",
    reference: seed.reference,
    dueOn: "",
    notes: "",
  };
}

function normalize(raw: Partial<ComplianceItem>): ComplianceItem {
  const status = DOC_STATUSES.includes(raw.status as DocStatus)
    ? (raw.status as DocStatus)
    : "todo";
  const group = DOC_GROUPS.includes(raw.group as DocGroup)
    ? (raw.group as DocGroup)
    : "setup";
  return {
    id: raw.id ?? generateId("doc"),
    seedKey: raw.seedKey ?? "",
    title: raw.title ?? "",
    description: raw.description ?? "",
    group,
    recurrence: (raw.recurrence as DocRecurrence) ?? "once",
    status,
    reference: raw.reference ?? "",
    dueOn: raw.dueOn ?? "",
    notes: raw.notes ?? "",
  };
}

/**
 * Stored items win — they carry her statuses and notes. Seeds that were never
 * stored get appended, so a checklist entry added in a later release shows up
 * for someone who has already been using the panel, while one she deleted stays
 * deleted. The seed's group/recurrence/reference are refreshed from code so a
 * corrected citation reaches everyone.
 */
export function getComplianceItems(): ComplianceItem[] {
  const stored = readJSON<Partial<ComplianceItem>[]>(COMPLIANCE_KEY, []).map(
    normalize
  );
  const hidden = new Set(readJSON<string[]>(HIDDEN_KEY, []));
  const seedIndex = new Map(SEEDS.map((s) => [s.seedKey, s]));

  const merged = stored.map((item) => {
    const seed = item.seedKey ? seedIndex.get(item.seedKey) : undefined;
    return seed
      ? {
          ...item,
          group: seed.group,
          recurrence: seed.recurrence,
          reference: seed.reference,
        }
      : item;
  });

  const present = new Set(merged.map((i) => i.seedKey).filter(Boolean));
  const missing = SEEDS.filter(
    (s) => !present.has(s.seedKey) && !hidden.has(`doc-${s.seedKey}`)
  ).map(seedToItem);

  const all = [...merged, ...missing];
  const order = new Map(DOC_GROUPS.map((g, i) => [g, i]));
  return all.sort(
    (a, b) => (order.get(a.group) ?? 0) - (order.get(b.group) ?? 0)
  );
}

function persist(items: ComplianceItem[]): ComplianceItem[] {
  writeJSON(COMPLIANCE_KEY, items);
  return items;
}

export function saveComplianceItem(item: ComplianceItem): ComplianceItem[] {
  const current = getComplianceItems();
  const exists = current.some((i) => i.id === item.id);
  return persist(
    exists ? current.map((i) => (i.id === item.id ? item : i)) : [...current, item]
  );
}

export function setComplianceStatus(
  id: string,
  status: DocStatus
): ComplianceItem[] {
  return persist(
    getComplianceItems().map((i) => (i.id === id ? { ...i, status } : i))
  );
}

export function setComplianceNotes(id: string, notes: string): ComplianceItem[] {
  return persist(
    getComplianceItems().map((i) => (i.id === id ? { ...i, notes } : i))
  );
}

export function deleteComplianceItem(id: string): ComplianceItem[] {
  const next = getComplianceItems().filter((i) => i.id !== id);
  if (id.startsWith("doc-")) {
    const hidden = readJSON<string[]>(HIDDEN_KEY, []);
    if (!hidden.includes(id)) writeJSON(HIDDEN_KEY, [...hidden, id]);
  }
  return persist(next);
}

export function newComplianceItem(group: DocGroup): ComplianceItem {
  return {
    id: generateId("doc"),
    seedKey: "",
    title: "",
    description: "",
    group,
    recurrence: "once",
    status: "todo",
    reference: "",
    dueOn: "",
    notes: "",
  };
}

// Seeded copy lives in the dictionary; her own items carry their own text.
export function docTitle(lang: Lang, item: ComplianceItem): string {
  return item.seedKey ? translate(lang, `doc.${item.seedKey}.title`) : item.title;
}

export function docDescription(lang: Lang, item: ComplianceItem): string {
  return item.seedKey
    ? translate(lang, `doc.${item.seedKey}.desc`)
    : item.description;
}

export function docStatusLabel(lang: Lang, status: string): string {
  return translate(lang, `doc.status.${status}`);
}

export function docGroupLabel(lang: Lang, group: string): string {
  return translate(lang, `doc.group.${group}`);
}

export function docRecurrenceLabel(lang: Lang, recurrence: string): string {
  return translate(lang, `doc.every.${recurrence}`);
}

export type ComplianceSummary = {
  done: number;
  /** Anything not done and not marked "doesn't apply". */
  outstanding: number;
  total: number;
};

export function summarizeCompliance(
  items: ComplianceItem[]
): ComplianceSummary {
  const counted = items.filter((i) => i.status !== "na");
  return {
    done: counted.filter((i) => i.status === "done").length,
    outstanding: counted.filter((i) => i.status !== "done").length,
    total: counted.length,
  };
}
