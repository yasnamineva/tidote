"use client";

import Image from "next/image";
import { useLang } from "@/lib/i18n";

/**
 * The atelier's own swing tag, hanging from a cord.
 *
 * It is the label in the studio's own photographs: an oatmeal card with
 * rounded corners, a dark eyelet, the blackletter T above the name, and the
 * tagline printed underneath. The colours are the brand's own — the card is
 * the paper stock, the ink is the ink.
 *
 * Three nested elements, one movement each, because a single element cannot
 * hold them without them fighting:
 *
 *   .tag-settle  the arrival swing, once, about the top of the cord
 *   .tag-nudge   the answer to a pointer, as a *transition* and not an
 *                animation — see below, this was a bug
 *   .tag-fall    the drop, which is translation only: rotating a falling
 *                object about a pendulum anchor sends it along an arc, which
 *                reads as a swat rather than a drop
 *
 * The hover used to swap `.tag-pendulum`'s animation for a second keyframe
 * set. Taking the pointer away removed that animation and the arrival
 * animation started again from its first frame — so the tag jumped to the
 * seven-and-a-half degrees it arrives at and hung there, tilted, which is
 * exactly what it looked like: stuck to one side. A transition has no frames
 * to restart. It goes to the hover value and comes back from it, and the
 * slight overshoot in the curve is the swing.
 */

/** The eyelet. A metal ring with the hole dark inside it. */
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
  /** The cord's length, as Tailwind classes: shorter on a phone. */
  cordClassName = "h-[68px] lg:h-[236px]",
  className = "",
}: {
  cordClassName?: string;
  className?: string;
}) {
  const { lang } = useLang();

  return (
    <div className={`group relative flex flex-col items-center ${className}`}>
      <div className="tag-settle flex flex-col items-center">
        <div className="tag-nudge flex flex-col items-center">
          {/* The cord and the card are both centred in this column, and the
              eyelet is centred in the card — so the thread meets the hole.
              It used to miss by half the width of a second label that hung
              beside the card and pulled the column's centre sideways. */}
          <span
            aria-hidden="true"
            /* A cream hairline either side of the thread, so it reads against
               a photograph instead of disappearing into one. */
            className={`tag-cord w-px bg-gradient-to-b from-ink-soft/45 via-ink-soft/65 to-ink-soft/80 shadow-[0_0_0_1px_rgba(247,244,239,0.5)] ${cordClassName}`}
          />

          <div className="tag-fall">
            <div className="relative w-[196px] rounded-[14px] border border-line-strong/70 bg-gradient-to-b from-paper via-cream to-line/60 px-5 pb-6 text-center shadow-[0_18px_34px_-20px_rgba(34,30,25,0.55)] sm:w-[216px] md:w-[248px] md:rounded-[18px] md:px-6 md:pb-7">
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

              {/* Printed on the tag itself, where the studio prints it. */}
              <p className="mt-3 text-[9px] uppercase leading-relaxed tracking-[0.2em] text-moss-deep md:mt-3.5 md:text-[10px]">
                {lang === "bg"
                  ? "Антидотът срещу посредствеността"
                  : "The anTIdote to mediocrity"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
