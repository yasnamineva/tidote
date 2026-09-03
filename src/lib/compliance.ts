import { generateId } from "@/lib/mock-data";
import { getSupabase } from "@/lib/supabase/client";
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

type ComplianceRow = {
  id: string; seed_key: string; title: string; description: string;
  group: DocGroup; recurrence: DocRecurrence; status: DocStatus;
  reference: string; due_on: string | null; notes: string;
};

function toItem(r: ComplianceRow): ComplianceItem {
  return {
    id: r.id,
    seedKey: r.seed_key,
    title: r.title,
    description: r.description,
    group: r.group,
    recurrence: r.recurrence,
    status: r.status,
    reference: r.reference,
    dueOn: r.due_on ?? "",
    notes: r.notes,
  };
}

const COLUMNS =
  'id,seed_key,title,description,"group",recurrence,status,reference,due_on,notes';

/**
 * The built-in checklist lives in code so a corrected citation reaches everyone,
 * while her statuses and notes live in the database. On first read, any seed the
 * database has never seen is inserted; one she deleted stays deleted, because
 * deleting it left a row behind marked "na" rather than removing it.
 */
export async function getComplianceItems(): Promise<ComplianceItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("compliance_items").select(COLUMNS);
  if (error) throw error;
  const stored = (data as unknown as ComplianceRow[]).map(toItem);

  const known = new Set(stored.map((i) => i.seedKey).filter(Boolean));
  const missing = SEEDS.filter((s) => !known.has(s.seedKey));
  if (missing.length > 0) {
    const { error: insertError } = await supabase.from("compliance_items").insert(
      missing.map((s) => ({
        seed_key: s.seedKey,
        group: s.group,
        recurrence: s.recurrence,
        reference: s.reference,
      }))
    );
    // A duplicate here just means another tab inserted the same seed first.
    if (insertError && insertError.code !== "23505") throw insertError;
    return getComplianceItems();
  }

  // The seed's group, recurrence and citation are refreshed from code on read.
  const index = new Map(SEEDS.map((s) => [s.seedKey, s]));
  const merged = stored.map((item) => {
    const seed = item.seedKey ? index.get(item.seedKey) : undefined;
    return seed
      ? { ...item, group: seed.group, recurrence: seed.recurrence, reference: seed.reference }
      : item;
  });
  const order = new Map(DOC_GROUPS.map((g, i) => [g, i]));
  return merged.sort((a, b) => (order.get(a.group) ?? 0) - (order.get(b.group) ?? 0));
}

export async function saveComplianceItem(
  item: ComplianceItem
): Promise<ComplianceItem[]> {
  const row = {
    seed_key: item.seedKey,
    title: item.title,
    description: item.description,
    group: item.group,
    recurrence: item.recurrence,
    status: item.status,
    reference: item.reference,
    due_on: item.dueOn || null,
    notes: item.notes,
  };
  const supabase = getSupabase();
  // Items she adds herself are minted in the browser with a "doc-" id that the
  // database has never seen, so a missing row means insert.
  const { data: existing } = await supabase
    .from("compliance_items")
    .select("id")
    .eq("id", item.id)
    .maybeSingle();
  const { error } = existing
    ? await supabase.from("compliance_items").update(row).eq("id", item.id)
    : await supabase.from("compliance_items").insert(row);
  if (error) throw error;
  return getComplianceItems();
}

export async function setComplianceStatus(
  id: string,
  status: DocStatus
): Promise<ComplianceItem[]> {
  const { error } = await getSupabase()
    .from("compliance_items")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
  return getComplianceItems();
}

export async function setComplianceNotes(
  id: string,
  notes: string
): Promise<ComplianceItem[]> {
  const { error } = await getSupabase()
    .from("compliance_items")
    .update({ notes })
    .eq("id", id);
  if (error) throw error;
  return getComplianceItems();
}

/**
 * A seed row deleted outright would simply be re-inserted on the next read, so
 * it is emptied of its key instead — which both removes it from the checklist
 * and stops the seed coming back.
 */
export async function deleteComplianceItem(id: string): Promise<ComplianceItem[]> {
  const { error } = await getSupabase()
    .from("compliance_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return getComplianceItems();
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
