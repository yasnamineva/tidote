// Monospace glyphs are much wider than the old condensed display face, so the
// hero wordmark sizes are pulled down to keep "TIDOTE" from overflowing.
const SIZES = {
  sm: { tidote: "text-lg", atelier: "text-[10px]" },
  md: { tidote: "text-2xl md:text-3xl", atelier: "text-xs md:text-sm" },
  hero: {
    tidote: "text-[17vw] md:text-[11vw] lg:text-[9rem]",
    atelier: "text-xl md:text-3xl",
  },
} as const;

export function Wordmark({
  size = "md",
  stacked = false,
  className = "",
}: {
  size?: keyof typeof SIZES;
  stacked?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span
      className={`inline-flex ${
        stacked ? "flex-col items-start" : "items-baseline gap-2"
      } ${className}`}
    >
      {/* group-hover only bites inside a `.group` ancestor (the header link) */}
      <span
        className={`brand-anim font-gothic font-bold leading-[0.9] tracking-tight text-moss transition-[color,transform] duration-300 ease-out group-hover:text-moss-deep group-hover:-translate-y-0.5 ${s.tidote}`}
      >
        TIDOTE
      </span>
      <span
        className={`brand-anim font-round font-medium tracking-wide text-ink-soft transition-[color,letter-spacing] duration-300 ease-out group-hover:text-ink group-hover:tracking-[0.12em] ${s.atelier}`}
      >
        atelier
      </span>
    </span>
  );
}
