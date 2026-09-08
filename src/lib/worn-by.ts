import type { Lang } from "@/lib/translations";

/**
 * The people who wear what the atelier makes.
 *
 * This is a list in a file rather than a table in the database on purpose. It
 * will hold a handful of names, they change perhaps twice a year, and every one
 * of them needs a decision made off the website before it appears — so an
 * admin form that makes it a two-second job is the wrong shape. Add an entry
 * here and it is on the page.
 *
 * If it ever grows past a dozen and the studio wants to manage it alone, it
 * moves to a table and a panel like the rail has.
 */

export type Person = {
  /** Stable key. Not shown; used for React and for photo naming. */
  slug: string;
  /** As they want to be named. Not translated — a name is a name. */
  name: string;
  /** What they are known for. One short line. */
  knownFor: Record<Lang, string>;
  /** The Tidote piece in the photograph, if it is worth naming. */
  piece?: Record<Lang, string>;
  /** Their words, if they gave any. */
  quote?: Record<Lang, string>;
  /** Two or three. Portrait crops best. Paths under /public, or storage refs. */
  photos: string[];
  /** Instagram handle, without the @. */
  instagram?: string;

  /**
   * The date they agreed, in writing, that their name and photograph could be
   * used to promote the atelier.
   *
   * This is not paperwork. Using a recognisable person's image to advertise a
   * business without their permission is actionable in Bulgaria, and the more
   * recognisable the person the more actionable it is. The field is required
   * so that adding someone without having asked them is not something you can
   * do by accident: there is nowhere to put the entry that does not also ask
   * when they said yes.
   */
  consentOn: string;

  /**
   * Marks a made-up entry, shown with an "example" badge on the card.
   *
   * A page like this is a set of claims about real people, so a placeholder
   * that looks exactly like a real endorsement is the one thing it must never
   * quietly contain. The flag is what keeps the difference visible on the page
   * and not only in this file.
   */
  demo?: boolean;
};

/**
 * One invented entry, so the studio can see the shape of a filled page before
 * anyone real is on it. Delete it when the first actual name arrives — or
 * sooner, if the page goes live before then.
 *
 * The page also knows how to be empty, which is the state it returns to when
 * this is removed.
 */
export const WORN_BY: Person[] = [
  {
    slug: "example",
    name: "Мартин Стоев",
    knownFor: { bg: "Музикант", en: "Musician" },
    piece: { bg: "Карго комплект по мярка", en: "Made-to-measure cargo set" },
    quote: {
      bg: "Носех го три месеца преди някой да ме попита откъде е. Тогава разбрах, че е добро.",
      en: "I wore it three months before anyone asked me where it was from. That is when I knew it was good.",
    },
    photos: [
      "/photos/gallery-2.jpg",
      "/photos/men-2.jpg",
      "/photos/casual-3.jpg",
    ],
    instagram: "tidote.atelier",
    consentOn: "2026-09-08",
    demo: true,
  },
];
