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
  /** Path under /public, or a stock-photos storage ref. Portrait crops best. */
  photo: string;
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
};

/**
 * Empty until there is someone to put here, and deliberately so — a wall of
 * famous names with two names on it says something worse than an empty wall.
 * The page knows how to be empty.
 */
export const WORN_BY: Person[] = [];
