import type { Lang } from "@/lib/translations";

/**
 * Photographs of the work itself — the studio, the cloth, a seam, a fitting,
 * a finished garment in someone's hands.
 *
 * The site says "made to measure" in a dozen places and shows not one picture
 * of anything being made. That is the gap this fills, and it can only be
 * filled with real photographs: a stock picture of somebody else's sewing
 * machine is exactly the fake content we are removing elsewhere. So the list
 * starts empty and the section renders nothing until it is not.
 *
 * To fill it: put the files in `public/photos/atelier/`, add an entry each
 * with a caption that says what you are looking at, and it appears. Six is
 * plenty; four is enough.
 *
 * Worth photographing, roughly in order of how much they prove:
 *
 *   1. The cutting table with a pattern and cloth on it.
 *   2. Hands at the machine, close, mid-seam.
 *   3. A garment on the stand half-finished, with pins or tailor's chalk in it.
 *   4. A fitting in progress — a sleeve being marked on an actual person.
 *   5. The inside of a finished piece: the seams, the finishing, the label.
 *   6. The studio itself, wide enough to see it is a room where work happens.
 *
 * Phone photographs in daylight are fine. Evidence beats production value.
 */
export type AtelierShot = {
  src: string;
  /** What the picture shows. Not decoration — it is the claim being made. */
  caption: Record<Lang, string>;
};

export const ATELIER_SHOTS: AtelierShot[] = [];

export function hasAtelierShots(): boolean {
  return ATELIER_SHOTS.length > 0;
}
