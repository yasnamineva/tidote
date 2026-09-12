const SIZES = {
  sm: { tidote: "text-lg", atelier: "text-[10px]" },
  md: { tidote: "text-2xl md:text-3xl", atelier: "text-xs md:text-sm" },
  // There was a `hero` size here for a name set across the top of the landing
  // page. The name is on the swing tag now, so nothing asks for it.
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
