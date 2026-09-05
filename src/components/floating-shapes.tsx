type Shape = {
  className: string;
  animation: string;
  /**
   * A phone has no spare room. A 56px ring drifting across a 40px headline is
   * not decoration there, it is a smudge — so the big ones stay on wider
   * screens, where they have margin to live in.
   */
  hideOnMobile?: boolean;
};

const VARIANTS: Record<string, Shape[]> = {
  light: [
    {
      className: "top-14 left-[6%] h-16 w-16 rounded-full border border-moss-deep/15",
      animation: "drift",
      hideOnMobile: true,
    },
    {
      className: "bottom-20 right-[10%] h-10 w-10 rounded-full border border-accent/20",
      animation: "float",
      hideOnMobile: true,
    },
    {
      className: "top-1/2 right-[20%] h-2 w-2 rounded-full bg-moss-deep/35",
      animation: "drift-alt",
      hideOnMobile: true,
    },
  ],
  dark: [
    {
      className: "top-10 right-[12%] h-16 w-16 rounded-full border border-cream/15",
      animation: "float",
      hideOnMobile: true,
    },
    {
      className: "bottom-14 left-[10%] h-9 w-9 rounded-full border border-cream/12",
      animation: "drift-alt",
      hideOnMobile: true,
    },
    {
      className: "top-1/2 left-[45%] h-2 w-2 rounded-full bg-cream/30",
      animation: "drift",
      hideOnMobile: true,
    },
  ],
  warm: [
    {
      // Was left-[18%], which put it through the middle of every page title.
      className: "top-8 left-[2%] h-14 w-14 rounded-full border border-accent/15",
      animation: "drift",
      hideOnMobile: true,
    },
    {
      className: "bottom-12 right-[4%] h-10 w-10 rounded-full border border-moss-deep/15",
      animation: "float",
      hideOnMobile: true,
    },
    {
      className: "top-1/2 right-[32%] h-2 w-2 rounded-full bg-accent/30",
      animation: "drift-alt",
      hideOnMobile: true,
    },
  ],
};

export function FloatingShapes({
  variant = "light",
}: {
  variant?: keyof typeof VARIANTS;
}) {
  const shapes = VARIANTS[variant];
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {shapes.map((s, i) => (
        <div
          key={i}
          className={`absolute ${s.className} ${s.animation} ${
            s.hideOnMobile ? "hidden md:block" : ""
          }`}
        />
      ))}
    </div>
  );
}
