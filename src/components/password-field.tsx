"use client";

import { useId, useState } from "react";
import { fieldCls, labelCls } from "@/components/auth-shell";
import { useLang } from "@/lib/i18n";
import { PASSWORD_RULES, passwordStrength } from "@/lib/password";

/**
 * A password field you can read back.
 *
 * Every one of these hides what it holds, which is right for a shoulder in a
 * café and wrong for a person typing a new password on a phone keyboard. The
 * eye turns it off; the rules underneath tick themselves off as they are met,
 * so what is wrong is visible while it is being fixed rather than announced
 * after the form is refused.
 *
 * `autoComplete` is not decoration: it is what tells a browser or a password
 * manager whether this is a password to remember (`new-password`) or one to
 * fill (`current-password`). Without it — which is how the sign-in page was —
 * a browser will often not offer to save anything at all.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  showRules = false,
  required = true,
  minLength,
  placeholder = "••••••••",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  autoComplete: "current-password" | "new-password";
  /** The tick list and the strength bar. For choosing a password, not typing a known one. */
  showRules?: boolean;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
}) {
  const { t } = useLang();
  const [visible, setVisible] = useState(false);
  const rulesId = useId();

  const strength = passwordStrength(value);
  const strengthLabel = ["", t("pw.weak"), t("pw.fair"), t("pw.strong")][strength];

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={showRules ? rulesId : undefined}
          className={`${fieldCls} w-full pr-12`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? t("pw.hide") : t("pw.show")}
          className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-ink-soft transition-colors hover:text-ink"
        >
          <Eye open={visible} />
        </button>
      </div>

      {showRules && (
        <div id={rulesId} className="flex flex-col gap-2">
          {/* The bar is four blunt steps rather than a score: a number invites
              reading "73" as a fact about a secret. */}
          <div className="flex items-center gap-2" aria-hidden="true">
            {[1, 2, 3].map((step) => (
              <span
                key={step}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  strength >= step
                    ? strength === 1
                      ? "bg-accent"
                      : strength === 2
                        ? "bg-moss"
                        : "bg-moss-deep"
                    : "bg-line"
                }`}
              />
            ))}
            {value && (
              <span className="w-16 shrink-0 text-right text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                {strengthLabel}
              </span>
            )}
          </div>

          <ul className="flex flex-col gap-1">
            {PASSWORD_RULES.map((rule) => {
              const met = rule.met(value);
              return (
                <li
                  key={rule.key}
                  className={`flex items-center gap-2 text-xs transition-colors ${
                    met ? "text-moss-deep" : "text-ink-soft"
                  }`}
                >
                  <span aria-hidden="true" className="w-3 shrink-0 text-center">
                    {met ? "✓" : "·"}
                  </span>
                  {t(rule.labelKey)}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Eye({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.8" />
      {!open && <path d="M4 20 20 4" />}
    </svg>
  );
}
