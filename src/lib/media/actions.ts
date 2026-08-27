"use server";

import { z } from "zod";
import { getUserRole, isStaffRole } from "@/lib/auth/roles";
import { MAX_MEDIA_BYTES, NEWS_MEDIA_BUCKET, isSupportedImageMimeType } from "@/lib/media";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const objectPathPattern =
  /^\d{4}\/(?:0[1-9]|1[0-2])\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp|avif)$/i;

const mediaRegistrationSchema = z.object({
  objectPath: z.string().regex(objectPathPattern),
  mimeType: z.string().refine(isSupportedImageMimeType),
  byteSize: z.coerce.number().int().positive().max(MAX_MEDIA_BYTES),
  altText: z.string().trim().min(4).max(300),
  caption: z.string().trim().max(500),
  credit: z.string().trim().max(300),
  width: z.coerce.number().int().positive().max(100_000),
  height: z.coerce.number().int().positive().max(100_000),
  focalPointX: z.coerce.number().min(0).max(1),
  focalPointY: z.coerce.number().min(0).max(1),
});

export type MediaActionState = { error?: string; success?: string };

export async function registerMediaAsset(formData: FormData): Promise<MediaActionState> {
  if (!hasSupabasePublicConfig()) {
    return { error: "Supabase bağlantısı yapılandırılmadı." };
  }

  const parsed = mediaRegistrationSchema.safeParse({
    objectPath: formData.get("objectPath"),
    mimeType: formData.get("mimeType"),
    byteSize: formData.get("byteSize"),
    altText: formData.get("altText"),
    caption: formData.get("caption") ?? "",
    credit: formData.get("credit") ?? "",
    width: formData.get("width"),
    height: formData.get("height"),
    focalPointX: formData.get("focalPointX"),
    focalPointY: formData.get("focalPointY"),
  });

  if (!parsed.success) {
    return { error: "Görsel bilgilerini kontrol edip tekrar deneyin." };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const role = claimsError ? undefined : getUserRole(claimsData?.claims);
  const userId = claimsData?.claims?.sub;

  if (!isStaffRole(role) || typeof userId !== "string") {
    return { error: "Bu işlem için editoryal yetki gerekiyor." };
  }

  const { error } = await supabase.from("media_assets").insert({
    alt_text: parsed.data.altText,
    bucket_id: NEWS_MEDIA_BUCKET,
    byte_size: parsed.data.byteSize,
    caption: parsed.data.caption || null,
    credit: parsed.data.credit || null,
    focal_point_x: parsed.data.focalPointX,
    focal_point_y: parsed.data.focalPointY,
    height: parsed.data.height,
    mime_type: parsed.data.mimeType,
    object_path: parsed.data.objectPath,
    uploaded_by: userId,
    width: parsed.data.width,
  });

  if (error) {
    return { error: "Görsel kaydı oluşturulamadı. Aynı dosya yolu yeniden kullanılamaz." };
  }

  return { success: "Görsel medya kütüphanesine eklendi." };
}
