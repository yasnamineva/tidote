"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";
import { LANGS } from "@/lib/translations";
import { useLenis } from "@/lib/smooth-scroll";
import { useScrollSpy } from "@/lib/use-scroll-spy";
import { Wordmark } from "@/components/wordmark";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { hasPublicWall } from "@/lib/worn-by";

type NavChild = {
  href: string;
  key: string;
  /**
   * Shown to visitors only once there is something behind it. The wall of
   * people is empty until someone real agrees to be on it, and a link that
   * leads to "nobody yet" costs more trust than it earns.
   */
  needsContent?: boolean;
};

type NavLink = {
  href: string;
  id: string;
  key: string;
  /** Homepage section this link tracks, for the scroll spy. Pages have none. */
  sectionId?: string;
  children?: NavChild[];
};

/**
 * The two ways to buy sit at the top level and stay there: a commission
 * (Custom Pieces, which opens onto the casual and sports lookbooks) and
 * whatever is finished and on the rail today (In Stock).
 */
const NAV_LINKS: NavLink[] = [
  {
    href: "/#shop",
    id: "custom",
    key: "nav.custom",
    sectionId: "shop",
    children: [
      { href: "/casual", key: "nav.casual" },
      { href: "/sports", key: "nav.sports" },
    ],
  },
  // Its own page, and also a band at the foot of the homepage's shop
  // section — so it lights up when you scroll past that band too.
  { href: "/in-stock", id: "instock", key: "nav.inStock", sectionId: "ready" },
  { href: "/#how", id: "how", key: "nav.how", sectionId: "how" },
  // About opens onto the wall of people who wear the clothes, the same way
  // Custom Pieces opens onto the lookbooks.
  {
    href: "/#about",
    id: "about",
    key: "nav.about",
    sectionId: "about",
    children: [{ href: "/worn-by", key: "nav.wornBy", needsContent: true }],
  },
  { href: "/#gallery", id: "gallery", key: "nav.gallery", sectionId: "gallery" },
];

const SPY_SECTION_IDS = Array.from(
  new Set(NAV_LINKS.map((l) => l.sectionId).filter((id) => id !== undefined))
);

/**
 * The menu minus anything with nothing behind it yet. A parent left with no
 * children loses its dropdown rather than opening onto an empty panel.
 */
function gatedNav(showGated: boolean): NavLink[] {
  if (showGated) return NAV_LINKS;
  return NAV_LINKS.map((link) => {
    if (!link.children) return link;
    const children = link.children.filter((c) => !c.needsContent);
    return { ...link, children: children.length > 0 ? children : undefined };
  });
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className="h-2.5 w-2.5 shrink-0 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}

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
            className={`px-1.5 py-2 -my-1 transition-colors ${
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

  // The studio needs the link even while the wall is empty — that is how she
  // gets to the page to see what it will look like.
  const showGated = hasPublicWall() || (ready && session?.role === "admin");
  const navLinks = useMemo(() => gatedNav(showGated), [showGated]);

  function isActive(link: NavLink) {
    if (pathname === link.href) return true;
    // A parent stays lit while you are inside one of its lookbooks.
    if (link.children?.some((c) => c.href === pathname)) return true;
    return pathname === "/" && !!link.sectionId && activeId === link.sectionId;
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
          className="flex shrink-0 items-center gap-3 group"
        >
          <Image
            src="/brand/logo.png"
            alt="Tidote Atelier monogram"
            width={80}
            height={80}
            className="brand-anim h-10 w-10 sm:h-14 sm:w-14 md:h-20 md:w-20 object-contain transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105"
            priority
          />
          {/* A 320px bar holding a bell and a burger has 272px to spend, and
              the brand alone wanted 219 of it. The sub-word goes first, then
              comes back at `sm` — the monogram still says whose site it is. */}
          <Wordmark
            size="md"
            className="[&_span:last-child]:hidden sm:[&_span:last-child]:inline"
          />
        </Link>

        <nav className="hidden xl:flex items-center gap-4 2xl:gap-7 text-sm uppercase tracking-[0.15em]">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`link-underline flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    isActive(link) ? "text-accent" : "hover:text-accent"
                  }`}
                >
                  {t(link.key)}
                  <Chevron />
                </Link>
                {/* The padding is the bridge: without it the pointer crosses a
                    dead gap on its way down and the panel closes underneath it. */}
                <div className="absolute left-0 top-full pt-4 opacity-0 invisible translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0">
                  <div className="min-w-44 border border-line bg-cream shadow-[0_18px_40px_-24px_rgba(34,30,25,0.6)] py-1.5">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-4 py-2.5 text-xs tracking-[0.15em] transition-colors hover:bg-moss-soft ${
                          pathname === child.href
                            ? "text-accent"
                            : "text-ink-soft hover:text-ink"
                        }`}
                      >
                        {t(child.key)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
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
            )
          )}
        </nav>

        <div className="hidden shrink-0 xl:flex items-center gap-3 2xl:gap-4">
          <LanguageToggle />
          {ready && session && <NotificationBell />}
          {ready && session ? (
            <Link
              href={accountHref}
              onClick={(e) => handleSamePageClick(e, accountHref)}
              className="btn-sweep btn-sweep-moss whitespace-nowrap text-sm uppercase tracking-[0.15em] border border-ink px-4 py-2 transition-colors duration-300 hover:text-cream"
            >
              {session.role === "admin" ? t("header.studioAdmin") : t("header.account")}
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-sweep whitespace-nowrap text-sm uppercase tracking-[0.15em] border border-ink px-4 py-2 transition-colors duration-300 hover:text-cream"
            >
              {t("header.login")}
            </Link>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4 xl:hidden">
          <LanguageToggle className="hidden md:flex" />
          {ready && session && <NotificationBell />}
          {/* From `md` up there is room for the one thing people come back for,
              and a tablet-width bar of logo-then-nothing-then-burger is a lot of
              empty. Below `md` it stays in the panel, where the label fits. */}
          <Link
            href={accountHref}
            onClick={(e) => handleSamePageClick(e, accountHref)}
            className="btn-sweep hidden whitespace-nowrap border border-ink px-4 py-2 text-sm uppercase tracking-[0.15em] transition-colors duration-300 hover:text-cream md:inline-block"
          >
            {ready && session
              ? session.role === "admin"
                ? t("header.studioAdmin")
                : t("header.account")
              : t("header.login")}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex flex-col items-center justify-center gap-1.5 -my-2 p-2 min-h-11 min-w-11"
            /* Vertical only: -mx-2 pushed the button 7px past the right
               edge of a 320px screen and scrolled the whole page. */
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
        className={`xl:hidden overflow-hidden border-t border-line transition-[max-height] duration-300 ease-in-out ${
          open ? "max-h-[40rem]" : "max-h-0 border-t-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-col gap-4 text-sm uppercase tracking-[0.15em]">
          {/* One column on a phone. Above that the panel is as wide as the
              screen, and a single left-hugging list leaves most of it empty. */}
          <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {navLinks.map((link) => (
            <div key={link.href} className="flex flex-col">
              <Link
                href={link.href}
                onClick={(e) => {
                  setOpen(false);
                  handleNavClick(e, link.href);
                }}
                className={`block py-2.5 ${isActive(link) ? "text-accent" : ""}`}
              >
                {t(link.key)}
              </Link>
              {/* Sub-items sit open rather than behind another tap — there are
                  two of them, and a menu you have to hunt through is no menu. */}
              {link.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={() => setOpen(false)}
                  className={`block py-2.5 pl-4 text-xs border-l border-line ml-0.5 ${
                    pathname === child.href ? "text-accent" : "text-ink-soft"
                  }`}
                >
                  {t(child.key)}
                </Link>
              ))}
            </div>
          ))}
          </div>
          <Link
            href={accountHref}
            onClick={(e) => {
              setOpen(false);
              handleSamePageClick(e, accountHref);
            }}
            className="border border-ink px-4 py-2 text-center md:hidden"
          >
            {ready && session
              ? session.role === "admin"
                ? t("header.studioAdmin")
                : t("header.account")
              : t("header.login")}
          </Link>
          <LanguageToggle className="pt-2 md:hidden" />
        </div>
      </div>
    </header>
  );
}
