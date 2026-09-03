"use client";

import { getSupabase } from "@/lib/supabase/client";

/**
 * Photos moved out of the browser.
 *
 * They used to be base64 data URLs inside localStorage, which is why they had
 * to be crushed to fit a 5 MB budget shared with every other record. They now
 * live in object storage and the database holds a reference like
 * `client-photos/<owner-uuid>/<file>.jpg` — bucket first, then the path within
 * it, so a single string says both where a photo is and who it belongs to.
 *
 * The downscaling in `images.ts` is still worth doing. It is no longer about
 * fitting in a quota, but a 200 KB upload beats a 4 MB one on a phone in a
 * fitting room, and it keeps the free tier's 5 GB of monthly egress going a
 * long way.
 */

export const CLIENT_BUCKET = "client-photos";
export const STOCK_BUCKET = "stock-photos";

/** Anything that is already displayable: a seed asset, or a legacy data URL. */
function isDirectUrl(ref: string) {
  return ref.startsWith("/") || ref.startsWith("data:") || ref.startsWith("http");
}

/**
 * Whether this photo may be served from a shared cache.
 *
 * True for assets shipped with the site and for the rail, which is on a public
 * page anyone can open. False for everything belonging to a client — those are
 * private, reached through URLs that expire, and must not be copied onto a CDN
 * that serves them to whoever asks.
 */
export function isPubliclyCacheable(ref: string | undefined): boolean {
  if (!ref) return false;
  if (ref.startsWith("data:")) return false;
  return ref.startsWith("/") || ref.startsWith(`${STOCK_BUCKET}/`);
}

function split(ref: string): { bucket: string; path: string } | null {
  const slash = ref.indexOf("/");
  if (slash < 1) return null;
  return { bucket: ref.slice(0, slash), path: ref.slice(slash + 1) };
}

function extensionFor(dataUrl: string) {
  const match = /^data:image\/(png|webp|jpeg|jpg)/.exec(dataUrl);
  const kind = match?.[1] ?? "jpeg";
  return kind === "jpeg" ? "jpg" : kind;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  const type = /:(.*?);/.exec(meta)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

/**
 * Uploads the downscaled data URLs `importPhotos` produced and returns the
 * references to store. `folder` is the owner's uuid for client photos, which is
 * also what the storage policy checks — so a client physically cannot write
 * into anyone else's folder.
 */
export async function uploadPhotos(
  dataUrls: string[],
  folder: string,
  bucket: string = CLIENT_BUCKET
): Promise<string[]> {
  const supabase = getSupabase();
  const refs: string[] = [];
  for (const dataUrl of dataUrls) {
    if (isDirectUrl(dataUrl)) {
      refs.push(dataUrl);
      continue;
    }
    const name = `${folder}/${crypto.randomUUID()}.${extensionFor(dataUrl)}`;
    const blob = dataUrlToBlob(dataUrl);
    const { error } = await supabase.storage
      .from(bucket)
      .upload(name, blob, { contentType: blob.type, upsert: false });
    if (error) throw error;
    refs.push(`${bucket}/${name}`);
  }
  return refs;
}

export async function deletePhotos(refs: string[]): Promise<void> {
  const supabase = getSupabase();
  const byBucket = new Map<string, string[]>();
  for (const ref of refs) {
    if (isDirectUrl(ref)) continue;
    const parts = split(ref);
    if (!parts) continue;
    byBucket.set(parts.bucket, [...(byBucket.get(parts.bucket) ?? []), parts.path]);
  }
  for (const [bucket, paths] of byBucket) {
    await supabase.storage.from(bucket).remove(paths);
  }
}

/**
 * Turns stored references into URLs a browser can render. The stock bucket is
 * public, so its URLs are permanent; client photos are private and get a signed
 * URL that expires, which is the whole point — a link leaking out of an inbox
 * should stop working.
 */
export async function resolvePhotoUrls(refs: string[]): Promise<string[]> {
  // Only reach for a client if something here actually needs one. A site asset
  // or a legacy data URL is already a URL, and asking for the database to
  // resolve it would make every seed photo depend on the database being
  // configured — which they do not.
  if (refs.every(isDirectUrl)) return refs;

  const supabase = getSupabase();
  return Promise.all(
    refs.map(async (ref) => {
      if (isDirectUrl(ref)) return ref;
      const parts = split(ref);
      if (!parts) return ref;
      if (parts.bucket === STOCK_BUCKET) {
        return supabase.storage.from(parts.bucket).getPublicUrl(parts.path).data
          .publicUrl;
      }
      const { data } = await supabase.storage
        .from(parts.bucket)
        .createSignedUrl(parts.path, 60 * 60);
      return data?.signedUrl ?? "";
    })
  );
}

/**
 * Downscale, then upload, then hand back the references to store.
 *
 * Every photo picker in the app goes through this rather than through
 * `importPhotos` directly, so a data URL never reaches the database. Postgres
 * would take one happily — and 500 MB of free-tier database would be gone in a
 * few dozen photos.
 */
export async function importAndUpload(
  files: File[],
  room: number,
  folder: string,
  bucket: string = CLIENT_BUCKET
) {
  const { importPhotos } = await import("@/lib/images");
  const result = await importPhotos(files, room);
  const refs = await uploadPhotos(result.photos, folder, bucket);
  return { ...result, photos: refs };
}
