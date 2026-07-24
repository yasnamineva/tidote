import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PlaceholderImage } from "@/components/placeholder-image";
import { Reveal } from "@/components/reveal";
import { Marquee } from "@/components/marquee";
import { TypingText } from "@/components/typing-text";
import { FramedMedia } from "@/components/framed-media";
import { SplitReveal } from "@/components/split-reveal";
import { ImageReveal } from "@/components/image-reveal";
import { FloatingShapes } from "@/components/floating-shapes";
import { JourneyStepper } from "@/components/journey-stepper";

const SHOP_CATEGORIES = [
  {
    title: "Casual",
    copy: "Relaxed hoodies, denim, and layered everyday basics.",
    href: "/casual",
    image: "/photos/casual-hero.jpg",
  },
  {
    title: "Sports",
    copy: "Track jackets, windbreakers, technical athletic fits.",
    href: "/sports",
    image: "/photos/sports-hero.jpg",
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Design",
    copy: "Every silhouette starts as a sketch pulled from street reference and rebuilt for movement.",
  },
  {
    step: "02",
    title: "Handcraft",
    copy: "Cut, sewn, and finished in-house — no mass factory lines, no shortcuts.",
  },
  {
    step: "03",
    title: "Fit",
    copy: "Made-to-measure clients get pieces built around their own tracked measurements.",
  },
  {
    step: "04",
    title: "Deliver",
    copy: "Small batches, tracked from the atelier floor to your door.",
  },
];

const GALLERY_PHOTOS = [
  "/photos/gallery-1.jpg",
  "/photos/gallery-2.jpg",
  "/photos/gallery-3.jpg",
  "/photos/gallery-4.jpg",
  "/photos/gallery-5.jpg",
  "/photos/gallery-6.jpg",
  "/photos/gallery-7.jpg",
  "/photos/gallery-8.jpg",
];

const INSTAGRAM_URL = "https://www.instagram.com/tidote.atelier/";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* About Us */}
        <section id="about" className="relative border-b border-line overflow-hidden scroll-mt-20">
          <FloatingShapes variant="light" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-4">
                About Us
              </p>
              <TypingText
                className="font-round font-semibold text-4xl md:text-6xl leading-[0.95] text-ink mb-6 inline-block"
                speed={55}
                segments={[
                  { text: "The an" },
                  { text: "TIDOTE", className: "font-gothic text-moss-deep" },
                  { text: " to mediocrity" },
                ]}
              />
              <p className="text-ink-soft text-base md:text-lg max-w-md">
                Tidote Atelier is a Sofia-based streetwear house building
                unique, unrepeatable pieces for people who refuse to blend
                in. Unique streetstyle to match your main character energy.
              </p>
            </Reveal>
            <div className="aspect-square">
              <FramedMedia className="h-full w-full">
                <ImageReveal className="h-full w-full">
                  <PlaceholderImage
                    label="Tidote streetwear look"
                    src="/photos/about-hero.jpg"
                    className="h-full w-full"
                    priority
                  />
                </ImageReveal>
              </FramedMedia>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="relative bg-paper border-b border-line overflow-hidden">
          <FloatingShapes variant="light" />
          <Reveal className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:py-20 text-center">
            <h2 className="font-display text-2xl md:text-3xl mb-6">
              <SplitReveal text="Our Story" />
            </h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              Tidote started as a rejection of the ordinary — pieces that
              looked the same on every rack, in every shop, on every feed.
              The atelier was built to be the opposite: garments cut in small
              runs, finished by hand, and made to be worn like a statement,
              not a uniform.
            </p>
            <p className="text-ink-soft leading-relaxed">
              Every collection pulls from street culture and reworks it
              through a made-to-order lens — meaning what you wear was
              actually made for you, whether that's a limited drop piece or a
              fully custom, measured-to-fit commission.
            </p>
          </Reveal>
        </section>

        <Marquee />

        {/* New Vibes */}
        <section id="new-vibes" className="relative border-b border-line overflow-hidden scroll-mt-20">
          <FloatingShapes variant="warm" />
          <div className="relative z-10 mx-auto max-w-7xl grid md:grid-cols-2">
            <div className="aspect-square md:aspect-auto">
              <FramedMedia className="h-full w-full">
                <ImageReveal className="h-full w-full">
                  <PlaceholderImage
                    label="Tidote streetwear look"
                    src="/photos/new-vibes.jpg"
                    className="h-full w-full"
                  />
                </ImageReveal>
              </FramedMedia>
            </div>
            <Reveal
              delay={150}
              className="flex flex-col justify-center gap-6 px-8 py-16 md:px-16"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep">
                Main Character Energy
              </p>
              <h2 className="font-display text-4xl md:text-5xl leading-[0.95]">
                <SplitReveal text="NEW VIBES" />
              </h2>
              <p className="text-ink-soft max-w-sm">
                Every drop is designed to be worn like a statement. Follow
                along as new pieces land straight from the atelier.
              </p>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-sweep w-fit bg-ink text-cream px-6 py-3 text-sm uppercase tracking-[0.15em] transition-transform duration-300 hover:-translate-y-0.5"
              >
                Shop the Drop
              </a>
            </Reveal>
          </div>
        </section>

        {/* Shop categories */}
        <section id="shop" className="bg-moss md:h-[calc(100vh-140px)]">
          <div className="grid md:grid-cols-2 md:h-full">
            {SHOP_CATEGORIES.map((c, i) => (
              <Reveal key={c.title} delay={i * 100} className="md:h-full">
                <Link
                  href={c.href}
                  className="group relative block h-[70vh] md:h-full overflow-hidden"
                >
                  <PlaceholderImage
                    label={`${c.title}'s pieces`}
                    src={c.image}
                    className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-10 text-cream">
                    <h3 className="font-display text-4xl md:text-5xl tracking-wide transition-transform duration-300 group-hover:-translate-y-1">
                      {c.title}
                    </h3>
                    <p className="text-sm text-cream/80 mt-2 max-w-xs">
                      {c.copy}
                    </p>
                    <span className="inline-block text-xs uppercase tracking-[0.2em] mt-4 border-b border-cream/60 pb-1 group-hover:border-cream transition-colors">
                      Shop {c.title} &rarr;
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Client Journey */}
        <section className="relative border-b border-line overflow-hidden bg-paper">
          <FloatingShapes variant="light" />
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 md:py-20">
            <Reveal className="text-center mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
                From First Fitting to Final Piece
              </p>
              <h2 className="font-display text-2xl md:text-3xl">
                <SplitReveal text="Your Made-to-Measure Journey" />
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <JourneyStepper />
            </Reveal>
            <Reveal delay={200} className="text-center mt-12">
              <Link
                href="/login"
                className="btn-sweep bg-ink text-cream px-6 py-3 text-sm uppercase tracking-[0.15em] transition-transform duration-300 hover:-translate-y-0.5 inline-block"
              >
                Start Your Order
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Process */}
        <section className="relative border-b border-line overflow-hidden">
          <FloatingShapes variant="light" />
          <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:py-20">
            <Reveal className="text-center mb-10">
              <h2 className="font-display text-2xl md:text-3xl">
                <SplitReveal text="How a Piece Comes Together" />
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-4">
              {PROCESS.map((p, i) => (
                <Reveal key={p.step} delay={i * 100}>
                  <div
                    className={`group px-6 py-8 border-line h-full transition-colors duration-300 hover:bg-moss-soft ${
                      i > 0 ? "border-t md:border-t-0 md:border-l" : ""
                    }`}
                  >
                    <span
                      className={`font-display text-4xl transition-colors duration-300 ${
                        i % 2 === 0 ? "text-accent" : "text-moss-deep"
                      }`}
                    >
                      {p.step}
                    </span>
                    <h3 className="font-display text-xl mt-4 mb-2">
                      {p.title}
                    </h3>
                    <p className="text-sm text-ink-soft">{p.copy}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery pulled from Instagram */}
        <section
          id="gallery"
          className="relative mx-auto max-w-7xl px-6 py-16 md:py-20 scroll-mt-20 overflow-hidden"
        >
          <FloatingShapes variant="light" />
          <Reveal className="relative z-10 flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-moss-deep mb-2">
                Straight From Instagram
              </p>
              <h2 className="font-display text-3xl md:text-4xl">
                <SplitReveal text="@tidote.atelier" />
              </h2>
            </div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="link-underline text-sm uppercase tracking-[0.15em] hover:text-moss-deep transition-colors whitespace-nowrap"
            >
              Follow &rarr;
            </a>
          </Reveal>
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            {GALLERY_PHOTOS.map((src, i) => (
              <Reveal key={src} delay={(i % 4) * 80}>
                <PlaceholderImage
                  label="Tidote streetwear look"
                  src={src}
                  index={i}
                  className="aspect-square transition-transform duration-500 hover:-translate-y-1"
                />
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
