"use client";

import { useState } from "react";
import { Photo } from "@/components/photo";
import { useLang } from "@/lib/i18n";
import { photoWarning } from "@/lib/images";
import { importAndUpload } from "@/lib/photos";
import type { Order, Role } from "@/lib/mock-data";

const MAX_PHOTOS = 6;

/**
 * The client's own photos of a finished piece, and the one permission that
 * governs them.
 *
 * Two rules run through this component. The photos belong to the client, so
 * only they can add or delete one. And the atelier may only show them publicly
 * if the client has said so — which is off unless they turn it on, dated when
 * they do, and withdrawn the moment they turn it off or delete the last photo.
 * The studio's side is deliberately read-only: it states which of the two
 * answers it has, and offers no way to change it.
 */
export function OrderPhotos({
  order,
  ownerId,
  role,
  onAdd,
  onRemove,
  onConsent,
  onOpen,
}: {
  order: Order;
  /** Whose folder the uploads belong in — also what the storage policy checks. */
  ownerId: string;
  role: Role;
  onAdd?: (photos: string[]) => void;
  onRemove?: (index: number) => void;
  onConsent?: (consent: boolean) => void;
  onOpen?: (src: string) => void;
}) {
  const { t } = useLang();
  const [warning, setWarning] = useState<string | null>(null);

  const isAdmin = role === "admin";
  const photos = order.wearPhotos ?? [];
  const consented = Boolean(order.photoConsent) && photos.length > 0;
  // Only a piece they actually have can be photographed being worn.
  const canUpload =
    !isAdmin && order.status === "delivered" && !order.returnedOn;

  // Nothing to say to the studio until the client has sent something.
  if (isAdmin && photos.length === 0) return null;
  if (!canUpload && photos.length === 0) return null;

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    setWarning(null);
    const room = MAX_PHOTOS - photos.length;
    let result;
    try {
      result = await importAndUpload(Array.from(fileList), room, ownerId);
    } catch {
      setWarning(t("photo.uploadFailed"));
      return;
    }
    setWarning(photoWarning(t, result, MAX_PHOTOS, room));
    if (result.photos.length > 0) onAdd?.(result.photos.slice(0, room));
  }

  return (
    <div>
      <h2 className="font-display text-xl mb-1">
        {isAdmin ? t("photos.adminTitle") : t("photos.title")}
      </h2>
      <p className="text-sm text-ink-soft mb-4">
        {isAdmin ? t("photos.adminSub") : t("photos.sub")}
      </p>

      {isAdmin && (
        <div
          className={`border px-4 py-3 mb-4 text-sm ${
            consented
              ? "border-moss-deep/40 bg-moss-soft text-moss-deep"
              : "border-accent/30 bg-accent/5 text-accent"
          }`}
        >
          {consented
            ? t("photos.mayUse", { date: order.photoConsentOn || "—" })
            : t("photos.mayNotUse")}
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map((src, i) => (
            <div key={i} className="relative aspect-square">
              <button
                type="button"
                onClick={() => onOpen?.(src)}
                className="block h-full w-full overflow-hidden border border-line"
                aria-label={t("photos.view", { n: i + 1 })}
              >
                                <Photo
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </button>
              {canUpload && (
                <button
                  type="button"
                  onClick={() => onRemove?.(i)}
                  aria-label={t("photos.remove")}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-ink text-cream text-sm leading-none flex items-center justify-center hover:bg-accent transition-colors before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canUpload && (
        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
              disabled={photos.length >= MAX_PHOTOS}
              aria-label={t("photos.upload")}
              className="text-sm file:mr-4 file:border file:border-line file:bg-cream file:px-3 file:py-1.5 file:text-xs file:uppercase file:tracking-[0.1em] file:cursor-pointer disabled:opacity-50"
            />
            {warning && <p className="text-xs text-accent">{warning}</p>}
          </div>

          <div className="border border-line bg-paper px-5 py-4">
            <button
              type="button"
              role="switch"
              aria-checked={consented}
              disabled={photos.length === 0}
              onClick={() => onConsent?.(!consented)}
              className="flex items-start gap-3 text-left w-full disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                  consented ? "bg-moss" : "bg-line-strong"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream shadow-sm transition-transform duration-200 ${
                    consented ? "translate-x-[22px]" : "translate-x-0.5"
                  }`}
                />
              </span>
              <span className="min-w-0">
                <span className="block text-sm">{t("photos.consent")}</span>
                <span className="block text-xs text-ink-soft mt-1">
                  {consented
                    ? t("photos.consentOn", { date: order.photoConsentOn || "—" })
                    : t("photos.consentOff")}
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
