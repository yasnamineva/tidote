"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import type { DeliveryInfo } from "@/lib/mock-data";

const FIELDS: { key: keyof Omit<DeliveryInfo, "notes" | "updatedAt">; label: string }[] = [
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "postalCode", label: "Postal Code" },
  { key: "phone", label: "Phone" },
];

export function DeliveryForm() {
  const { delivery, updateDeliveryInfo } = useAuth();
  const [form, setForm] = useState<DeliveryInfo>(delivery);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(delivery);
  }, [delivery]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateDeliveryInfo({
      ...form,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-line bg-paper px-6 py-6 flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div
            key={field.key}
            className={`flex flex-col gap-1.5 ${field.key === "address" ? "col-span-2" : ""}`}
          >
            <label
              htmlFor={`delivery-${field.key}`}
              className="text-xs uppercase tracking-[0.1em] text-ink-soft"
            >
              {field.label}
            </label>
            <input
              id={`delivery-${field.key}`}
              type="text"
              value={form[field.key]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [field.key]: e.target.value }))
              }
              className="border border-line bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="delivery-notes"
          className="text-xs uppercase tracking-[0.1em] text-ink-soft"
        >
          Delivery Notes
        </label>
        <textarea
          id="delivery-notes"
          rows={2}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="border border-line bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep resize-none"
        />
      </div>

      <button
        type="submit"
        className="mt-2 bg-moss text-cream px-6 py-3 text-sm uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-0.5 hover:bg-moss-deep"
      >
        Save Delivery Info
      </button>
      {saved && (
        <p className="text-sm text-moss-deep animate-[fade-up_0.3s_ease-out_both]">
          Delivery info updated &mdash; thank you!
        </p>
      )}
    </form>
  );
}
