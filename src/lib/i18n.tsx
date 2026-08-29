"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getStoredLang,
  setStoredLang,
  translate,
  type Lang,
} from "@/lib/translations";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Starts on the prerendered default so hydration matches the server markup,
  // then resolves to the visitor's language on mount. The copy therefore
  // settles a beat after <html lang>, which LANG_BOOTSTRAP in the root layout
  // has already corrected before the first paint.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const resolved = getStoredLang();
    setLangState(resolved);
    // Written here rather than in an effect keyed on `lang`, which would pass
    // through the initial "en" and briefly undo the bootstrap.
    document.documentElement.lang = resolved;
  }, []);

  const setLang = useCallback((next: Lang) => {
    setStoredLang(next);
    setLangState(next);
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(lang, key, params),
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
