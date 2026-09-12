"use client";

import Image from "next/image";
import { useLang } from "@/lib/i18n";

/**
 * The atelier's own swing tag, hanging from a cord.
 *
 * This is not a generic label: it is the one in the studio's photographs — an
 * oatmeal card with rounded corners and a dark eyelet, the blackletter T above
 * the name, a line of small caps under it — with the narrow moss strip that
 * hangs beside it carrying the tagline. Both come straight out of the brand
 * palette, so the tag is the same colour as the paper stock and the strip the
 * same green as the printed one.
 *
 * The cord and the tag are separate elements on purpose. The cord draws itself
 * down, the tag falls, and the pair swings about the anchor at the top — three
 * movements that read as one object arriving. See `.tag-*` in globals.css.
 */

/** The eyelet. A metal ring with the hole showing dark through it. */
function Eyelet() {
  return (
    <span
      aria-hidden="true"
      className="relative mx-auto mt-2.5 block h-4 w-4 rounded-full bg-gradient-to-b from-ink-soft to-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.35)] md:mt-3 md:h-[18px] md:w-[18px]"
    >
      <span className="absolute inset-[4px] rounded-full bg-ink/85 md:inset-[5px]" />
    </span>
  );
}

export function HangTag({
  /**
   * The cord's height, as Tailwind classes — the length differs between a
   * phone and a wide screen, and one element with two heights beats two
   * elements with one each: rendering the tag twice and hiding one meant two
   * copies of the monogram, and a hidden copy whose animation never ran.
   */
  cordClassName = "h-[68px] lg:h-[236px]",
  className = "",
}: {
  cordClassName?: string;
  className?: string;
}) {
  const { t, lang } = useLang();

  return (
    <div className={`group relative flex flex-col items-center ${className}`}>
      {/* Everything below this point swings together, about the top of the
          cord — which is where a hanging thing actually pivots. */}
      <div className="tag-pendulum flex flex-col items-center">
        {/* The cord. Slightly off-white and very thin, like thread. */}
        <span
          aria-hidden="true"
          className={`tag-cord w-px bg-gradient-to-b from-ink-soft/35 via-ink-soft/55 to-ink-soft/75 ${cordClassName}`}
        />

        <div className="tag-drop flex items-stretch gap-2.5 md:gap-3">
          {/* The card. */}
          <div className="relative w-[190px] shrink-0 rounded-[14px] border border-line-strong/70 bg-gradient-to-b from-paper via-cream to-line/60 px-5 pb-6 text-center shadow-[0_18px_34px_-20px_rgba(34,30,25,0.55)] sm:w-[214px] md:w-[248px] md:rounded-[18px] md:px-6 md:pb-7">
            <Eyelet />

            <Image
              src="/brand/logo.png"
              alt=""
              aria-hidden="true"
              width={248}
              height={248}
              priority
              className="mx-auto mt-3 h-[84px] w-[84px] object-contain md:mt-4 md:h-[108px] md:w-[108px]"
            />

            <p className="font-gothic text-2xl font-bold leading-none tracking-tight text-ink md:text-3xl">
              Tidote
            </p>

            <span
              aria-hidden="true"
              className="mx-auto mt-3 block h-px w-10 bg-line-strong md:mt-4 md:w-12"
            />

            <p className="mt-3 text-[9px] uppercase leading-relaxed tracking-[0.24em] text-ink-soft md:mt-4 md:text-[10px]">
              {t("header.tagline")}
            </p>
          </div>

          {/* The strip that hangs with it, printed the other way up. Hidden on
              the narrowest screens, where the pair would be wider than the
              card is tall. */}
          <div className="hidden w-7 flex-col items-center justify-start rounded-[8px] bg-moss px-1 py-2.5 shadow-[0_14px_26px_-18px_rgba(34,30,25,0.6)] sm:flex md:w-8 md:rounded-[10px]">
            <span
              aria-hidden="true"
              className="h-[7px] w-[7px] shrink-0 rounded-full bg-cream/45"
            />
            {/* Small and tightly tracked so the whole line fits the card's
                height — the pair should read as two labels on one cord, not as
                a strip that outgrew the tag it hangs with. */}
            <p
              className="mt-2 whitespace-nowrap text-[7px] uppercase tracking-[0.1em] text-cream/90 md:text-[8px]"
              style={{ writingMode: "vertical-rl", rotate: "180deg" }}
            >
              {lang === "bg" ? "Антидотът срещу посредствеността" : "The anTIdote to mediocrity"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
