"use client";

import { registerMediaAsset } from "@/lib/media/actions";
import {
  NEWS_MEDIA_BUCKET,
  createMediaObjectPath,
  getMediaPublicUrl,
  getMediaUploadError,
  isSupportedImageMimeType,
} from "@/lib/media";
import { createClient } from "@/lib/supabase/client";

type ImageDimensions = { width: number; height: number };

function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image_dimensions_failed"));
    };
    image.src = url;
  });
}

export type ImageUploadMeta = {
  altText: string;
  caption?: string;
  credit?: string;
  focalPointX?: number;
  focalPointY?: number;
};

export type ImageUploadResult =
  | { ok: true; id: string; publicUrl?: string; message: string }
  | { ok: false; message: string };

/**
 * Görseli `news-media` kovasına yükleyip `media_assets` kaydını açar.
 * Medya sayfası ve haber formundaki hızlı yükleme aynı yolu kullanıyor.
 */
export async function uploadImage(file: File, meta: ImageUploadMeta): Promise<ImageUploadResult> {
  const validationError = getMediaUploadError(file);
  if (validationError || !isSupportedImageMimeType(file.type)) {
    return { ok: false, message: validationError ?? "Dosya türü desteklenmiyor." };
  }

  let dimensions: ImageDimensions;
  try {
    dimensions = await getImageDimensions(file);
  } catch {
    return { ok: false, message: "Görsel boyutları okunamadı. Başka bir görsel deneyin." };
  }

  const objectPath = createMediaObjectPath(file.type, crypto.randomUUID());
  const { error: uploadError } = await createClient()
    .storage.from(NEWS_MEDIA_BUCKET)
    .upload(objectPath, file, { cacheControl: "31536000", contentType: file.type, upsert: false });

  if (uploadError) {
    return { ok: false, message: "Görsel yüklenemedi. Yetkinizi ve dosyayı kontrol edin." };
  }

  const formData = new FormData();
  formData.set("objectPath", objectPath);
  formData.set("mimeType", file.type);
  formData.set("byteSize", String(file.size));
  formData.set("width", String(dimensions.width));
  formData.set("height", String(dimensions.height));
  formData.set("altText", meta.altText);
  formData.set("caption", meta.caption ?? "");
  formData.set("credit", meta.credit ?? "");
  formData.set("focalPointX", String(meta.focalPointX ?? 0.5));
  formData.set("focalPointY", String(meta.focalPointY ?? 0.5));

  const result = await registerMediaAsset(formData);
  if (!result.id) {
    return { ok: false, message: result.error ?? "Görsel kaydı tamamlanamadı." };
  }

  return {
    ok: true,
    id: result.id,
    publicUrl: getMediaPublicUrl(objectPath),
    message: result.success ?? "Görsel yüklendi.",
  };
}
