"use client";

import { useEffect, useState } from "react";
import { Panel, StatTile } from "@/components/admin/panels";
import { Reveal } from "@/components/reveal";
import { useLang } from "@/lib/i18n";
import {
  DOC_GROUPS,
  DOC_STATUSES,
  deleteComplianceItem,
  docDescription,
  docGroupLabel,
  docRecurrenceLabel,
  docStatusLabel,
  docTitle,
  getComplianceItems,
  newComplianceItem,
  saveComplianceItem,
  setComplianceNotes,
  setComplianceStatus,
  summarizeCompliance,
  type ComplianceItem,
  type DocGroup,
  type DocStatus,
} from "@/lib/compliance";

const STATUS_DOT: Record<DocStatus, string> = {
  todo: "bg-line-strong",
  in_progress: "bg-accent",
  done: "bg-moss",
  na: "bg-line",
};

/**
 * `caps` is off for statute references and dates: uppercasing "чл. 92 ЗКПО"
 * mangles a citation someone may need to quote verbatim to their accountant.
 */
function Badge({
  children,
  caps = false,
}: {
  children: React.ReactNode;
  caps?: boolean;
}) {
  return (
    <span
      className={`border border-line-strong px-1.5 py-0.5 text-[10px] tracking-[0.1em] text-ink-soft whitespace-nowrap ${
        caps ? "uppercase" : ""
      }`}
    >
      {children}
    </span>
  );
}

function DocRow({
  item,
  onChanged,
}: {
  item: ComplianceItem;
  onChanged: () => void;
}) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(item.notes);
  const [confirming, setConfirming] = useState(false);

  return (
    <li className="border-t border-line/60 py-3.5 first:border-t-0">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${STATUS_DOT[item.status]}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <p
              className={`text-sm leading-snug ${
                item.status === "done" || item.status === "na"
                  ? "text-ink-soft"
                  : ""
              }`}
            >
              {docTitle(lang, item)}
            </p>
            <select
              aria-label={`${docTitle(lang, item)} — ${t("doc.status")}`}
              value={item.status}
              onChange={(e) => {
                setComplianceStatus(item.id, e.target.value as DocStatus);
                onChanged();
              }}
              className="border border-line-strong bg-cream px-2 py-1 text-xs transition-colors focus:outline-none focus:border-moss-deep"
            >
              {DOC_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {docStatusLabel(lang, s)}
                </option>
              ))}
            </select>
          </div>

          {docDescription(lang, item) && (
            <p className="text-xs text-ink-soft mt-1 leading-relaxed">
              {docDescription(lang, item)}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge caps>{docRecurrenceLabel(lang, item.recurrence)}</Badge>
            {item.reference && <Badge>{item.reference}</Badge>}
            {item.dueOn && <Badge>{item.dueOn}</Badge>}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="text-[10px] uppercase tracking-[0.1em] text-ink-soft hover:text-ink transition-colors"
            >
              {open ? "− " : "+ "}
              {t("doc.details")}
            </button>
          </div>

          {open && (
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={`notes-${item.id}`}
                  className="text-[10px] uppercase tracking-[0.1em] text-ink-soft"
                >
                  {t("doc.notes")}
                </label>
                <textarea
                  id={`notes-${item.id}`}
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  // Saved on blur rather than per keystroke: every write here
                  // re-reads and rewrites the whole list in localStorage.
                  onBlur={() => {
                    if (notes !== item.notes) {
                      setComplianceNotes(item.id, notes);
                      onChanged();
                    }
                  }}
                  placeholder={t("doc.notesPlaceholder")}
                  className="border border-line-strong bg-cream px-3 py-2 text-sm resize-none transition-colors focus:outline-none focus:border-moss-deep"
                />
              </div>

              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`due-${item.id}`}
                    className="text-[10px] uppercase tracking-[0.1em] text-ink-soft"
                  >
                    {t("doc.dueOn")}
                  </label>
                  <input
                    id={`due-${item.id}`}
                    type="date"
                    value={item.dueOn}
                    onChange={(e) => {
                      saveComplianceItem({ ...item, dueOn: e.target.value });
                      onChanged();
                    }}
                    className="border border-line-strong bg-cream px-3 py-1.5 text-sm tabular-nums transition-colors focus:outline-none focus:border-moss-deep"
                  />
                </div>

                {confirming ? (
                  <span className="flex gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        deleteComplianceItem(item.id);
                        onChanged();
                      }}
                      className="text-accent hover:underline"
                    >
                      {t("ready.delete")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="text-ink-soft hover:text-ink"
                    >
                      {t("newclient.cancel")}
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="text-xs uppercase tracking-[0.1em] text-ink-soft hover:text-accent transition-colors"
                  >
                    {t("doc.remove")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function DocumentsPanel() {
  const { t, lang } = useLang();
  const [items, setItems] = useState<ComplianceItem[] | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newGroup, setNewGroup] = useState<DocGroup>("setup");

  function refresh() {
    setItems(getComplianceItems());
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!items) {
    return (
      <p className="text-ink-soft text-sm uppercase tracking-[0.15em] animate-pulse">
        {t("common.loading")}
      </p>
    );
  }

  const summary = summarizeCompliance(items);

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    saveComplianceItem({
      ...newComplianceItem(newGroup),
      title: newTitle.trim(),
    });
    setNewTitle("");
    refresh();
  }

  return (
    <div className="max-w-4xl flex flex-col gap-8">
      <Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatTile
            label={t("doc.stat.done")}
            value={`${summary.done}/${summary.total}`}
          />
          <StatTile
            label={t("doc.stat.outstanding")}
            value={String(summary.outstanding)}
            tone={summary.outstanding > 0 ? "warn" : "normal"}
          />
          <StatTile
            label={t("doc.stat.notApplicable")}
            value={String(items.length - summary.total)}
          />
        </div>
      </Reveal>

      <Reveal>
        <div className="border border-line bg-paper px-6 py-4">
          <p className="text-sm leading-relaxed">{t("doc.disclaimer")}</p>
        </div>
      </Reveal>

      {DOC_GROUPS.map((group) => {
        const rows = items.filter((i) => i.group === group);
        if (rows.length === 0) return null;
        return (
          <Reveal key={group}>
            <Panel
              title={docGroupLabel(lang, group)}
              sub={t(`doc.group.${group}.sub`)}
            >
              <ul className="flex flex-col">
                {rows.map((item) => (
                  <DocRow key={item.id} item={item} onChanged={refresh} />
                ))}
              </ul>
            </Panel>
          </Reveal>
        );
      })}

      <Reveal>
        <Panel title={t("doc.addTitle")} sub={t("doc.addSub")}>
          <form onSubmit={addItem} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[12rem]">
              <label
                htmlFor="doc-new-title"
                className="text-[10px] uppercase tracking-[0.1em] text-ink-soft"
              >
                {t("doc.newTitleLabel")}
              </label>
              <input
                id="doc-new-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t("doc.newTitlePlaceholder")}
                className="border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="doc-new-group"
                className="text-[10px] uppercase tracking-[0.1em] text-ink-soft"
              >
                {t("doc.section")}
              </label>
              <select
                id="doc-new-group"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value as DocGroup)}
                className="border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep"
              >
                {DOC_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {docGroupLabel(lang, g)}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-accent text-cream px-4 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent/85"
            >
              {t("doc.add")}
            </button>
          </form>
        </Panel>
      </Reveal>
    </div>
  );
}
