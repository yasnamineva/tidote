"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import { addStoredClient, emailExists } from "@/lib/clients";

export function NewClientModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;
    if (emailExists(email)) {
      setError(t("newclient.dupEmail"));
      return;
    }
    addStoredClient({ name, email, phone, password });
    onCreated();
    onClose();
  }

  const fieldCls =
    "border border-line-strong bg-cream px-3 py-2 text-sm transition-colors focus:outline-none focus:border-moss-deep";
  const labelCls = "text-xs uppercase tracking-[0.1em] text-ink-soft";

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink/50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-cream border border-line shadow-[0_20px_50px_-20px_rgba(34,30,25,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-line">
          <h2 className="font-display text-xl">{t("newclient.title")}</h2>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nc-name" className={labelCls}>
              {t("newclient.name")}
            </label>
            <input
              id="nc-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nc-email" className={labelCls}>
              {t("newclient.email")}
            </label>
            <input
              id="nc-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              className={fieldCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nc-phone" className={labelCls}>
              {t("newclient.phone")}
            </label>
            <input
              id="nc-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={fieldCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nc-password" className={labelCls}>
              {t("newclient.password")}
            </label>
            <input
              id="nc-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldCls}
            />
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase tracking-[0.15em] text-ink-soft hover:text-ink transition-colors px-3 py-2"
            >
              {t("newclient.cancel")}
            </button>
            <button
              type="submit"
              className="bg-accent text-cream px-5 py-2.5 text-xs uppercase tracking-[0.15em] transition-colors hover:bg-accent/85"
            >
              {t("newclient.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
