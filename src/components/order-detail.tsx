"use client";

import { useState } from "react";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_SEQUENCE,
  type Booking,
  type Order,
  type OrderStatus,
  type Role,
} from "@/lib/mock-data";
import {
  acceptOrder,
  denyOrder,
  updateOrderDeadline,
  updateOrderStatus,
} from "@/lib/admin-data";

const MAX_PHOTOS = 4;
const MAX_FILE_BYTES = 1.5 * 1024 * 1024;

const STATUS_PILL: Record<string, string> = {
  received: "bg-line/50 text-ink-soft",
  in_production: "bg-accent-soft/40 text-accent",
  ready: "bg-accent-soft/40 text-accent",
  shipped: "bg-moss-soft text-moss-deep",
  delivered: "bg-moss-soft text-moss-deep",
};

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
  const [lightbox, setLightbox] = useState<string | null>(null);

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
      setWarning(`Up to ${MAX_PHOTOS} photos per note — only the first ${room} were added.`);
    }
    Array.from(fileList)
      .slice(0, room)
      .forEach((file) => {
        if (file.size > MAX_FILE_BYTES) {
          setWarning(`"${file.name}" is too large (max 1.5MB) — skipped.`);
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

  return (
    <div className="flex flex-col gap-10">
      {/* Meta header */}
      <div className="border border-line bg-paper px-6 py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-ink-soft">
              {order.id} &middot; {clientName}
            </p>
            <h1 className="font-display text-3xl md:text-4xl mt-1">{order.piece}</h1>
            <span className="inline-block text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-line/50 text-ink-soft mt-3">
              {order.category}
            </span>
          </div>
          <p className="font-display text-2xl text-accent whitespace-nowrap">
            {order.total}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-1">
              Placed
            </p>
            <p>{order.placedOn}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-1">
              Target date
            </p>
            <p>{order.eta}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-ink-soft mb-1">
              Fitting
            </p>
            <p>{booking ? `${booking.date} · ${booking.time}` : "Not booked"}</p>
          </div>
        </div>

        {order.reviewStatus === "accepted" && (
          <span
            className={`inline-block w-fit text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full mt-5 ${pill}`}
          >
            {ORDER_STATUS_LABEL[order.status]}
          </span>
        )}
        {order.reviewStatus === "pending" && (
          <span className="inline-block w-fit text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full mt-5 bg-accent-soft/40 text-accent">
            Pending Review
          </span>
        )}
        {order.reviewStatus === "denied" && (
          <span className="inline-block w-fit text-xs uppercase tracking-[0.15em] px-3 py-1 rounded-full mt-5 bg-line/50 text-ink-soft">
            Declined
          </span>
        )}

        {order.notes && (
          <p className="text-sm text-ink-soft italic mt-4">{order.notes}</p>
        )}

        {!isAdmin && order.reviewStatus === "pending" && (
          <div className="border border-accent/30 bg-accent/5 px-4 py-3 mt-5 text-sm text-accent">
            We&rsquo;re reviewing your request and will confirm pricing shortly.
          </div>
        )}
      </div>

      {/* Admin controls */}
      {isAdmin && (
        <div className="border border-line bg-paper px-6 py-6">
          <h2 className="font-display text-xl mb-4">Manage Order</h2>

          {order.reviewStatus === "pending" ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Price (e.g. 250)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border border-line bg-cream px-3 py-2 text-sm w-36"
                />
                <input
                  type="date"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  className="border border-line bg-cream px-3 py-2 text-sm"
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
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeny((v) => !v)}
                  className="border border-accent text-accent px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent hover:text-cream"
                >
                  Deny
                </button>
              </div>
              {showDeny && (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Reason (optional)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="border border-line bg-cream px-3 py-2 text-sm flex-1 min-w-[180px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      denyOrder(clientId, order.id, reason || undefined);
                      onChange();
                    }}
                    className="bg-accent text-cream px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent/80"
                  >
                    Confirm Deny
                  </button>
                </div>
              )}
            </div>
          ) : order.reviewStatus === "accepted" ? (
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="status"
                  className="text-xs uppercase tracking-[0.1em] text-ink-soft"
                >
                  Status (move forward or back)
                </label>
                <select
                  id="status"
                  value={order.status}
                  onChange={(e) => {
                    updateOrderStatus(
                      clientId,
                      order.id,
                      e.target.value as OrderStatus
                    );
                    onChange();
                  }}
                  className="border border-line bg-cream px-3 py-2 text-sm focus:outline-none focus:border-moss-deep"
                >
                  {ORDER_STATUS_SEQUENCE.map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="deadline"
                  className="text-xs uppercase tracking-[0.1em] text-ink-soft"
                >
                  Target date
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="deadline"
                    type="date"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    className="border border-line bg-cream px-3 py-2 text-sm flex-1"
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
                    Set
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-soft">
              This order was declined — no further actions.
            </p>
          )}
        </div>
      )}

      {/* Photo gallery */}
      <div>
        <h2 className="font-display text-xl mb-4">Reference Photos</h2>
        {order.photos.length === 0 ? (
          <p className="text-sm text-ink-soft">No photos attached.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {order.photos.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(src)}
                className="aspect-square overflow-hidden border border-line group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- data: URL uploads */}
                <img
                  src={src}
                  alt={`Reference ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Activity thread */}
      <div>
        <h2 className="font-display text-xl mb-4">Order Activity</h2>
        <div className="flex flex-col gap-3">
          {order.updates.length === 0 && (
            <p className="text-sm text-ink-soft">
              No notes yet. Add information or reference photos below.
            </p>
          )}
          {order.updates.map((note) => {
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
                    {note.author === "studio" ? "Studio" : clientName}
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
            {isAdmin ? "Add a studio note" : "Add information to this order"}
          </p>
          <textarea
            rows={2}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={
              isAdmin
                ? "Note for the client…"
                : "Add fabric, fit, or reference details…"
            }
            className="border border-line bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep resize-none"
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
            {isAdmin ? "Post Note" : "Add Info"}
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
