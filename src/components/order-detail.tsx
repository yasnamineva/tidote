"use client";

import { useState } from "react";
import {
  ORDER_STATUS_SEQUENCE,
  type Booking,
  type Order,
  type Role,
} from "@/lib/mock-data";
import {
  acceptOrder,
  denyOrder,
  updateOrderDeadline,
  updateOrderStatus,
} from "@/lib/admin-data";
import { useLang } from "@/lib/i18n";
import {
  categoryLabel,
  orderNoteText,
  pieceLabel,
  statusLabel,
} from "@/lib/translations";

const MAX_PHOTOS = 4;
const MAX_FILE_BYTES = 1.5 * 1024 * 1024;

const STATUS_PILL: Record<string, string> = {
  received: "bg-line/50 text-ink-soft",
  in_production: "bg-accent-soft/40 text-accent",
  ready: "bg-accent-soft/40 text-accent",
  shipped: "bg-moss-soft text-moss-deep",
  delivered: "bg-moss-soft text-moss-deep",
};

export function OrderDetail({
  order,
  clientId,
  clientName,
  role,
  booking,
  onAddNote,
  onChange,
}: {
  order: Order;
  clientId: string;
  clientName: string;
  role: Role;
  booking?: Booking;
  onAddNote: (text: string, photos: string[]) => void;
  onChange: () => void;
}) {
  const { lang, t } = useLang();
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const formatTimestamp = (iso: string) =>
    new Date(iso).toLocaleString(lang === "bg" ? "bg-BG" : "en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  const displayEta = (v: string) => (v === "To be confirmed" ? t("val.tbc") : v);
  const displayTotal = (v: string) =>
    v === "Quote pending" ? t("val.quotePending") : v;

  // add-note form state
  const [noteText, setNoteText] = useState("");
  const [notePhotos, setNotePhotos] = useState<string[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  // admin control state
  const [price, setPrice] = useState("");
  const [showDeny, setShowDeny] = useState(false);
  const [reason, setReason] = useState("");
  const [eta, setEta] = useState("");

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setWarning(null);
    const room = MAX_PHOTOS - notePhotos.length;
    if (fileList.length > room) {
      setWarning(t("neworder.warnMax", { max: MAX_PHOTOS, room }));
    }
    Array.from(fileList)
      .slice(0, room)
      .forEach((file) => {
        if (file.size > MAX_FILE_BYTES) {
          setWarning(t("neworder.warnLarge", { name: file.name }));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setNotePhotos((prev) =>
              prev.length >= MAX_PHOTOS ? prev : [...prev, reader.result as string]
            );
          }
        };
        reader.readAsDataURL(file);
      });
  }

  function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim() && notePhotos.length === 0) return;
    onAddNote(noteText.trim(), notePhotos);
    setNoteText("");
    setNotePhotos([]);
    setWarning(null);
  }

  const isAdmin = role === "admin";
  const pill = STATUS_PILL[order.status] ?? "bg-line/50 text-ink-soft";
  // Guard against legacy localStorage orders saved before these fields existed
  const photos = order.photos ?? [];
  const updates = order.updates ?? [];
  const note = orderNoteText(lang, order.id, order.notes);
  return (
    <div className="flex flex-col gap-10">
      {/* The reference image leads; identity, money and dates sit beside it */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-3">
          {photos.length === 0 ? (
            <div className="aspect-[4/5] border border-line bg-paper flex items-center justify-center">
              <p className="text-sm text-ink-soft">{t("od.noPhotos")}</p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setLightbox(photos[activePhoto])}
                aria-label={t("od.refPhotos")}
                className="group block w-full overflow-hidden border border-line bg-paper"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- data: URL uploads */}
                <img
                  src={photos[activePhoto]}
                  alt={pieceLabel(lang, order.piece)}
                  className="w-full aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </button>
              {photos.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {photos.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePhoto(i)}
                      aria-label={`${i + 1}`}
                      className={`h-16 w-16 shrink-0 overflow-hidden border transition-colors ${
                        i === activePhoto
                          ? "border-moss-deep"
                          : "border-line hover:border-line-strong"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- data: URL uploads */}
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="min-w-0 flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-ink-soft">
              {order.id} &middot; {clientName}
            </p>
            <h1 className="font-display text-3xl md:text-4xl mt-1">
              {pieceLabel(lang, order.piece)}
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-3">
              <span className="text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-line/50 text-ink-soft">
                {categoryLabel(lang, order.category)}
              </span>
              {order.reviewStatus === "accepted" && (
                <span
                  className={`text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full ${pill}`}
                >
                  {statusLabel(lang, order.status)}
                </span>
              )}
              {order.reviewStatus === "pending" && (
                <span className="text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full bg-accent-soft/40 text-accent">
                  {t("od.pendingReview")}
                </span>
              )}
              {order.reviewStatus === "denied" && (
                <span className="text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full bg-line/50 text-ink-soft">
                  {t("order.declined")}
                </span>
              )}
            </div>
          </div>

          <p className="font-display text-3xl text-accent">
            {displayTotal(order.total)}
          </p>

          <div className="grid sm:grid-cols-3 gap-4 text-sm border-t border-line pt-5">
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-1">
                {t("od.placed")}
              </p>
              <p>{order.placedOn}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-1">
                {t("od.targetDate")}
              </p>
              <p>{displayEta(order.eta)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-1">
                {t("od.fitting")}
              </p>
              <p>
                {booking ? `${booking.date} · ${booking.time}` : t("od.notBooked")}
              </p>
            </div>
          </div>

          {note && (
            <p className="text-sm text-ink-soft italic border-t border-line pt-5">
              {note}
            </p>
          )}

          {!isAdmin && order.reviewStatus === "pending" && (
            <div className="border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-accent">
              {t("order.pendingNotice")}
            </div>
          )}

          {/* Admin controls */}
          {isAdmin && (
            <div className="border border-line bg-paper px-6 py-6">
              <h2 className="font-display text-xl mb-4">{t("od.manageOrder")}</h2>

              {order.reviewStatus === "pending" ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder={t("od.pricePlaceholder")}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="border border-line-strong bg-cream px-3 py-2 text-sm w-36"
                    />
                    <input
                      type="date"
                      value={eta}
                      onChange={(e) => setEta(e.target.value)}
                      className="border border-line-strong bg-cream px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      disabled={!price.trim()}
                      onClick={() => {
                        acceptOrder(clientId, order.id, price, eta);
                        onChange();
                      }}
                      className="bg-moss text-cream px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-moss-deep disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t("od.accept")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeny((v) => !v)}
                      className="border border-accent text-accent px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent hover:text-cream"
                    >
                      {t("od.deny")}
                    </button>
                  </div>
                  {showDeny && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        placeholder={t("od.reasonPlaceholder")}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="border border-line-strong bg-cream px-3 py-2 text-sm flex-1 min-w-[180px]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          denyOrder(clientId, order.id, reason || undefined);
                          onChange();
                        }}
                        className="bg-accent text-cream px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent/80"
                      >
                        {t("od.confirmDeny")}
                      </button>
                    </div>
                  )}
                </div>
              ) : order.reviewStatus === "accepted" ? (
                <div className="flex flex-col gap-6">
                  {/* Stage picker: shows where the piece is and moves it in one click */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-xs uppercase tracking-[0.1em] text-ink-soft">
                      {t("od.statusLabel")}
                    </p>
                    <div className="flex flex-col border border-line divide-y divide-line">
                      {ORDER_STATUS_SEQUENCE.map((s, i) => {
                        const current = ORDER_STATUS_SEQUENCE.indexOf(order.status);
                        const isCurrent = i === current;
                        const isDone = i < current;
                        return (
                          <button
                            key={s}
                            type="button"
                            aria-current={isCurrent ? "step" : undefined}
                            onClick={() => {
                              if (isCurrent) return;
                              updateOrderStatus(clientId, order.id, s);
                              onChange();
                            }}
                            className={`flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                              isCurrent
                                ? "bg-moss-soft text-moss-deep"
                                : "hover:bg-ink/[0.04]"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full shrink-0 ${
                                isCurrent
                                  ? "bg-moss-deep"
                                  : isDone
                                    ? "bg-moss"
                                    : "bg-line-strong"
                              }`}
                            />
                            <span
                              className={
                                isDone ? "text-ink-soft" : isCurrent ? "" : "text-ink-soft"
                              }
                            >
                              {statusLabel(lang, s)}
                            </span>
                            {isCurrent && (
                              <span className="ml-auto text-[10px] uppercase tracking-[0.15em]">
                                {t("od.currentStage")}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="deadline"
                      className="text-xs uppercase tracking-[0.1em] text-ink-soft"
                    >
                      {t("od.targetDate")}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="deadline"
                        type="date"
                        value={eta}
                        onChange={(e) => setEta(e.target.value)}
                        className="border border-line-strong bg-cream px-3 py-2 text-sm flex-1"
                      />
                      <button
                        type="button"
                        disabled={!eta}
                        onClick={() => {
                          updateOrderDeadline(clientId, order.id, eta);
                          onChange();
                        }}
                        className="bg-moss text-cream px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-moss-deep disabled:opacity-40"
                      >
                        {t("od.setDate")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-soft">{t("od.deniedNoActions")}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Activity thread */}
      <div>
        <h2 className="font-display text-xl mb-4">{t("od.activity")}</h2>
        <div className="flex flex-col gap-3">
          {updates.length === 0 && (
            <p className="text-sm text-ink-soft">{t("od.noNotes")}</p>
          )}
          {updates.map((note) => {
            const mine =
              (isAdmin && note.author === "studio") ||
              (!isAdmin && note.author === "client");
            return (
              <div
                key={note.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm ${
                    mine
                      ? "bg-moss text-cream"
                      : "bg-paper border border-line text-ink"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-[0.1em] mb-1 opacity-70">
                    {note.author === "studio" ? t("od.studio") : clientName}
                  </p>
                  {note.text && <p>{note.text}</p>}
                  {note.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                      {note.photos.map((src, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setLightbox(src)}
                          className="aspect-square overflow-hidden border border-cream/20"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- data: URL uploads */}
                          <img
                            src={src}
                            alt="Attachment"
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  <p
                    className={`text-[10px] mt-1.5 uppercase tracking-[0.1em] ${
                      mine ? "text-cream/60" : "text-ink-soft"
                    }`}
                  >
                    {formatTimestamp(note.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add note */}
        <form
          onSubmit={submitNote}
          className="border border-line bg-paper px-5 py-5 mt-5 flex flex-col gap-3"
        >
          <p className="text-xs uppercase tracking-[0.1em] text-ink-soft">
            {isAdmin ? t("od.addStudioNote") : t("od.addInfo")}
          </p>
          <textarea
            rows={2}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={
              isAdmin
                ? t("od.notePlaceholderStudio")
                : t("od.notePlaceholderClient")
            }
            className="border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep resize-none"
          />
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            disabled={notePhotos.length >= MAX_PHOTOS}
            className="text-sm file:mr-4 file:border file:border-line file:bg-cream file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-[0.1em] file:cursor-pointer disabled:opacity-50"
          />
          {warning && <p className="text-xs text-accent">{warning}</p>}
          {notePhotos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {notePhotos.map((src, i) => (
                <div key={i} className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element -- data: URL preview */}
                  <img
                    src={src}
                    alt={`Attachment ${i + 1}`}
                    className="h-full w-full object-cover border border-line"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNotePhotos((prev) => prev.filter((_, j) => j !== i))
                    }
                    aria-label="Remove photo"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-ink text-cream text-xs leading-none flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="submit"
            className="btn-sweep w-fit bg-ink text-cream px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-transform duration-300 hover:-translate-y-0.5"
          >
            {isAdmin ? t("od.postNote") : t("od.addInfoBtn")}
          </button>
        </form>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <button
          type="button"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[60] bg-ink/80 flex items-center justify-center p-6"
          aria-label="Close image"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- data: URL uploads */}
          <img
            src={lightbox}
            alt="Reference"
            className="max-h-full max-w-full object-contain"
          />
        </button>
      )}
    </div>
  );
}
