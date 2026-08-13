"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { LANGS } from "@/lib/translations";
import { useLenis } from "@/lib/smooth-scroll";
import { useScrollSpy } from "@/lib/use-scroll-spy";
import { Wordmark } from "@/components/wordmark";
import { NotificationBell } from "@/components/notifications/notification-bell";

const NAV_LINKS = [
  { href: "/casual", id: "casual", key: "nav.casual", type: "page" as const, sectionId: "shop" },
  { href: "/sports", id: "sports", key: "nav.sports", type: "page" as const, sectionId: "shop" },
  { href: "/#how", id: "how", key: "nav.how", type: "anchor" as const, sectionId: "how" },
  { href: "/#about", id: "about", key: "nav.about", type: "anchor" as const, sectionId: "about" },
  {
    href: "/#gallery",
    id: "gallery",
    key: "nav.gallery",
    type: "anchor" as const,
    sectionId: "gallery",
  },
];

const SPY_SECTION_IDS = Array.from(
  new Set(NAV_LINKS.map((l) => l.sectionId))
);

function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div className={`flex items-center gap-1 text-xs uppercase tracking-[0.15em] ${className}`}>
      {LANGS.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-line">|</span>}
          <button
            type="button"
            onClick={() => setLang(l)}
            className={`transition-colors ${
              lang === l ? "text-accent" : "text-ink-soft hover:text-ink"
            }`}
          >
            {l === "bg" ? "БГ" : "EN"}
          </button>
        </span>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const { session, ready } = useAuth();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const lenis = useLenis();
  const { progress, activeId } = useScrollSpy(SPY_SECTION_IDS);

  function isActive(link: (typeof NAV_LINKS)[number]) {
    if (pathname === link.href) return true;
    return pathname === "/" && activeId === link.sectionId;
  }

  const accountHref =
    ready && session
      ? session.role === "admin"
        ? "/admin"
        : "/dashboard"
      : "/login";

  // Clicking a link to the page you're already on is a dead click — scroll to the
  // top instead. Used by both the logo and the account button.
  function handleSamePageClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    if (pathname !== href) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(0, { duration: 0.9 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (pathname !== "/" || !href.startsWith("/#")) return;
    const id = href.slice(2);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(el, { offset: -84, duration: 1.1 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-line">
      <div className="h-[3px] w-full bg-line/40">
        <div
          className="h-full bg-moss-deep transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="hidden md:flex items-center justify-between px-6 py-2 text-[11px] uppercase tracking-[0.2em] bg-ink text-cream">
        <span>{t("header.tagline")}</span>
        <a
          href="https://www.instagram.com/tidote.atelier/"
          target="_blank"
          rel="noreferrer"
          className="link-underline hover:text-moss transition-colors"
        >
          @tidote.atelier
        </a>
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          onClick={(e) => handleSamePageClick(e, "/")}
          className="flex items-center gap-3 group"
        >
          <Image
            src="/brand/logo.png"
            alt="Tidote Atelier monogram"
            width={80}
            height={80}
            className="brand-anim h-14 w-14 md:h-20 md:w-20 object-contain transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105"
            priority
          />
          <Wordmark size="md" />
        </Link>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm uppercase tracking-[0.15em]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`link-underline transition-colors whitespace-nowrap ${
                isActive(link) ? "text-accent" : "hover:text-accent"
              }`}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <LanguageToggle />
          {ready && session && <NotificationBell />}
          {ready && session ? (
            <Link
              href={accountHref}
              onClick={(e) => handleSamePageClick(e, accountHref)}
              className="btn-sweep btn-sweep-moss text-sm uppercase tracking-[0.15em] border border-ink px-4 py-2 transition-colors duration-300 hover:text-cream"
            >
              {session.role === "admin" ? t("header.studioAdmin") : t("header.account")}
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-sweep text-sm uppercase tracking-[0.15em] border border-ink px-4 py-2 transition-colors duration-300 hover:text-cream"
            >
              {t("header.login")}
            </Link>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-2">
          {ready && session && <NotificationBell />}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
          >
          <span
            className={`block h-0.5 w-6 bg-ink transition-transform duration-300 ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-ink transition-opacity duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-ink transition-transform duration-300 ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden border-t border-line transition-[max-height] duration-300 ease-in-out ${
          open ? "max-h-80" : "max-h-0 border-t-0"
        }`}
      >
        <div className="px-6 py-4 flex flex-col gap-4 text-sm uppercase tracking-[0.15em]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => {
                setOpen(false);
                handleNavClick(e, link.href);
              }}
              className={isActive(link) ? "text-accent" : ""}
            >
              {t(link.key)}
            </Link>
          ))}
          <Link
            href={accountHref}
            onClick={(e) => {
              setOpen(false);
              handleSamePageClick(e, accountHref);
            }}
            className="border border-ink px-4 py-2 text-center"
          >
            {ready && session
              ? session.role === "admin"
                ? t("header.studioAdmin")
                : t("header.account")
              : t("header.login")}
          </Link>
          <LanguageToggle className="pt-2" />
        </div>
      </div>
    </header>
  );
}
