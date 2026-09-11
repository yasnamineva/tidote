/**
 * What the atelier sells, on what terms.
 *
 * Everything here is unset, and that is the point. The site could not answer
 * "what does it cost" or "how long does it take" because nothing anywhere
 * knew — and the fix for that is not for me to guess. Every value is
 * `null` until the studio fills it in, and every place that shows one is
 * written to say nothing rather than something invented.
 *
 * Fill a value and it appears — on the homepage choices, on the lookbook
 * pages, wherever it is relevant. Leave it null and the site simply does not
 * make that claim.
 *
 * One file, so a price lives in one place and cannot drift between pages.
 */

export type Lead = { minDays: number; maxDays: number };

export const OFFER = {
  /** ISO code. Prices from the database are already in this. */
  currency: "EUR" as string,

  /**
   * The lowest the atelier will quote for a commission, per lookbook.
   * Shown as "from €X". Null hides the line entirely rather than showing
   * "from €0", which would be a lie about the price.
   */
  startingFrom: {
    casual: null,
    sports: null,
  } as Record<"casual" | "sports", number | null>,

  /**
   * Working days from an accepted quote to a finished garment. A range,
   * because it is one — quoting a single number invites a complaint on the
   * day after it.
   */
  lead: null as Lead | null,

  /** How many fittings a commission includes. */
  fittingsIncluded: null as number | null,

  /**
   * How long after delivery adjustments are still made at no charge. This is
   * the third question every made-to-measure customer asks and the site
   * currently cannot answer it.
   */
  adjustmentDays: null as number | null,
};

/** `€310`, or null when there is no figure to show. */
export function money(amount: number | null, currency = OFFER.currency): string | null {
  if (amount === null) return null;
  const symbol = currency === "EUR" ? "€" : currency === "BGN" ? "лв." : currency + " ";
  return currency === "BGN" ? `${amount} ${symbol}` : `${symbol}${amount}`;
}

export function startingFrom(key: "casual" | "sports"): string | null {
  return money(OFFER.startingFrom[key]);
}

/** Whether there is anything at all to say about terms yet. */
export function hasTerms(): boolean {
  return OFFER.lead !== null || OFFER.fittingsIncluded !== null;
}
