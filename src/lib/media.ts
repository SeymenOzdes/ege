import { env } from "@/lib/env";

export const NEWS_MEDIA_BUCKET = "news-media";
export const MAX_MEDIA_BYTES = 10 * 1024 * 1024;

/**
 * Public address of a `news-media` object.
 *
 * The bucket is public (`20260825100430_secure_media_storage.sql`), so the URL follows
 * from the object path alone. Built by hand rather than through
 * `supabase.storage.getPublicUrl()`: that needs a client instance, and this helper is
 * reached from the card tree, which the `"use client"` carousel also imports.
 *
 * Returns undefined when Supabase is unconfigured, so a card falls back to its colour
 * surface instead of rendering a broken image.
 */
export function getMediaPublicUrl(objectPath: string): string | undefined {
  const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return undefined;

  return `${baseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${NEWS_MEDIA_BUCKET}/${objectPath}`;
}

/**
 * `object-position` for a cropped hero. `media_assets` stores the focal point as two
 * 0–1 numerics; either being null means the editor never moved it off centre.
 */
export function getObjectPosition(x: number | null, y: number | null): string {
  const percent = (value: number | null) => {
    const ratio = value === null || !Number.isFinite(value) ? 0.5 : value;
    return `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%`;
  };

  return `${percent(x)} ${percent(y)}`;
}

export const supportedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type SupportedImageMimeType = (typeof supportedImageMimeTypes)[number];

const extensionByMimeType: Record<SupportedImageMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export function isSupportedImageMimeType(value: string): value is SupportedImageMimeType {
  return supportedImageMimeTypes.includes(value as SupportedImageMimeType);
}

export function getMediaUploadError(file: Pick<File, "size" | "type">) {
  if (!isSupportedImageMimeType(file.type)) {
    return "Yalnızca JPEG, PNG, WebP veya AVIF görseller yüklenebilir.";
  }

  if (file.size <= 0) return "Boş dosyalar yüklenemez.";
  if (file.size > MAX_MEDIA_BYTES) return "Görsel en fazla 10 MB olabilir.";

  return undefined;
}

export function createMediaObjectPath(
  mimeType: SupportedImageMimeType,
  id: string,
  date = new Date(),
) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}/${month}/${id}.${extensionByMimeType[mimeType]}`;
}
