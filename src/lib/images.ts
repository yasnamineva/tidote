/**
 * Photos are held as base64 data URLs inside localStorage, which the browser
 * caps at roughly 5 MB for the whole origin — and base64 inflates a file by
 * about a third on top of its real size. A single untouched phone photo could
 * therefore eat the entire budget for every client, order and note combined.
 *
 * So nothing is stored at its original size: every image is re-drawn to at most
 * MAX_EDGE on its long side and re-encoded as JPEG, which turns a 3 MB camera
 * photo into a couple of hundred kilobytes with no visible loss at the sizes the
 * portal displays. This is a mitigation, not a cure — the real fix is storing
 * photos outside the browser.
 */

/** Long edge, in pixels. Comfortably above the largest size the UI renders. */
const MAX_EDGE = 1600;
const QUALITY = 0.82;

/**
 * Ceiling on what we will even try to decode. Generous on purpose: the old
 * 1.5 MB limit rejected most photos taken on a modern phone, which is why it
 * was worth raising once the encoded size stopped depending on the input size.
 */
export const MAX_INPUT_BYTES = 20 * 1024 * 1024;

export type SkipReason = "too-large" | "unreadable";

export type PhotoImport = {
  /** Downscaled data URLs, in the order the files were chosen. */
  photos: string[];
  skipped: { name: string; reason: SkipReason }[];
  /** True when more files were chosen than there was room for. */
  overflow: boolean;
};

type Loaded = {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
};

/**
 * `createImageBitmap` is the direct route and honours EXIF orientation, so a
 * photo taken sideways is not stored sideways. It cannot decode every format on
 * every browser (HEIC on desktop Chrome, most notably), hence the <img> fallback
 * — which goes through the browser's own image pipeline and handles whatever the
 * platform natively supports.
 */
async function loadImage(file: File): Promise<Loaded> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // Fall through to the <img> path rather than rejecting the file outright.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("decode failed"));
      img.src = url;
    });
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      // Held until after drawing; revoking early can blank the canvas.
      release: () => URL.revokeObjectURL(url),
    };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

async function downscale(file: File): Promise<string> {
  const loaded = await loadImage(file);
  try {
    if (!loaded.width || !loaded.height) throw new Error("empty image");
    const scale = Math.min(1, MAX_EDGE / Math.max(loaded.width, loaded.height));
    const width = Math.max(1, Math.round(loaded.width * scale));
    const height = Math.max(1, Math.round(loaded.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");

    // JPEG carries no alpha channel, so a transparent PNG would composite onto
    // black. Paint the ground white first.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(loaded.source, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", QUALITY);
  } finally {
    loaded.release();
  }
}

/**
 * Turns chosen files into storable photos, never taking more than `room`.
 * Failures are reported per file rather than thrown, so one unreadable image
 * cannot lose the others in the same selection.
 */
export async function importPhotos(
  files: File[],
  room: number
): Promise<PhotoImport> {
  const result: PhotoImport = {
    photos: [],
    skipped: [],
    overflow: files.length > room,
  };
  if (room <= 0 || typeof document === "undefined") return result;

  for (const file of files.slice(0, room)) {
    if (file.size > MAX_INPUT_BYTES) {
      result.skipped.push({ name: file.name, reason: "too-large" });
      continue;
    }
    try {
      result.photos.push(await downscale(file));
    } catch {
      result.skipped.push({ name: file.name, reason: "unreadable" });
    }
  }
  return result;
}

type Translate = (key: string, params?: Record<string, string | number>) => string;

/**
 * The single most useful thing to say about a selection, or null when every
 * file went in. Choosing too many files is the more actionable complaint, so it
 * wins over an individual file being unusable.
 */
export function photoWarning(
  t: Translate,
  result: PhotoImport,
  max: number,
  room: number
): string | null {
  if (result.overflow) return t("neworder.warnMax", { max, room });
  const skipped = result.skipped[0];
  if (!skipped) return null;
  return skipped.reason === "too-large"
    ? t("neworder.warnLarge", { name: skipped.name })
    : t("neworder.warnUnreadable", { name: skipped.name });
}
