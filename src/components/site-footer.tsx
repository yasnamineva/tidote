import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/brand/logo.png"
              alt="Tidote Atelier monogram"
              width={64}
              height={64}
              className="h-14 w-14 object-contain invert"
            />
            <Wordmark size="md" className="[&_span:last-child]:text-cream/60" />
          </div>
          <p className="text-cream/70 max-w-sm text-sm leading-relaxed">
            The anTIDOTE to mediocrity. Unique streetstyle to match your main
            character energy.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-cream/50 mb-4">
            Explore
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/#about"
                className="link-underline hover:text-moss transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/#new-vibes"
                className="link-underline hover:text-moss transition-colors"
              >
                New Vibes
              </Link>
            </li>
            <li>
              <Link
                href="/#gallery"
                className="link-underline hover:text-moss transition-colors"
              >
                Gallery
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="link-underline hover:text-moss transition-colors"
              >
                Login / Track Order
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-cream/50 mb-4">
            Shop
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/casual"
                className="link-underline hover:text-moss transition-colors"
              >
                Casual
              </Link>
            </li>
            <li>
              <Link
                href="/sports"
                className="link-underline hover:text-moss transition-colors"
              >
                Sports
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-cream/50 mb-4">
            Connect
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="https://www.instagram.com/tidote.atelier/"
                target="_blank"
                rel="noreferrer"
                className="link-underline hover:text-moss transition-colors"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@tidote.atelier"
                className="link-underline hover:text-moss transition-colors"
              >
                hello@tidote.atelier
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 px-6 py-6 text-center text-xs uppercase tracking-[0.2em] text-cream/40">
        &copy; {new Date().getFullYear()} Tidote Atelier. All rights reserved.
      </div>
    </footer>
  );
}
