export const NEWS_MEDIA_BUCKET = "news-media";
export const MAX_MEDIA_BYTES = 10 * 1024 * 1024;

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
