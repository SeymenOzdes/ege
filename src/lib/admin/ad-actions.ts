"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adPlacementKeys } from "@/lib/ads";
import { getUserRole, isStaffRole } from "@/lib/auth/roles";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AdActionState = { error?: string; success?: string };

const adSchema = z
  .object({
    sponsor: z.string().trim().min(2).max(120),
    destinationUrl: z
      .string()
      .trim()
      .max(2000)
      .regex(/^https?:\/\/\S+$/i),
    placementKey: z.enum(adPlacementKeys),
    desktopMediaId: z.string().uuid().optional(),
    mobileMediaId: z.string().uuid().optional(),
    startsAt: z.string().datetime().optional(),
    endsAt: z.string().datetime().optional(),
  })
  .refine((value) => value.desktopMediaId || value.mobileMediaId, { path: ["desktopMediaId"] })
  .refine((value) => !value.endsAt || !value.startsAt || value.endsAt > value.startsAt, {
    path: ["endsAt"],
  });

/** Her eylem yetkisini kendisi doğrular: `/yonetim` düzeni bir güvenlik sınırı değildir. */
async function getStaffClient() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const role = error ? undefined : getUserRole(data?.claims);
  return isStaffRole(role) ? supabase : undefined;
}

/**
 * Reklam sayfaları ISR'da önbellekte; yeni kampanya bir sonraki aralığı beklemeden
 * görünsün diye yayın yüzeyleri tazelenir.
 */
function revalidateAdSurfaces() {
  revalidatePath("/");
  revalidatePath("/haber/[slug]", "page");
  revalidatePath("/yonetim/reklamlar");
}

function optionalIso(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string" || value === "") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "invalid" : date.toISOString();
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

export async function createAdPlacement(formData: FormData): Promise<AdActionState> {
  if (!hasSupabasePublicConfig()) return { error: "Supabase bağlantısı yapılandırılmadı." };

  const parsed = adSchema.safeParse({
    sponsor: formData.get("sponsor"),
    destinationUrl: formData.get("destinationUrl"),
    placementKey: formData.get("placementKey"),
    desktopMediaId: optionalString(formData.get("desktopMediaId")),
    mobileMediaId: optionalString(formData.get("mobileMediaId")),
    startsAt: optionalIso(formData.get("startsAt")),
    endsAt: optionalIso(formData.get("endsAt")),
  });

  if (!parsed.success) {
    return {
      error:
        "Reklam bilgilerini kontrol edin: ad, https:// ile başlayan bağlantı, en az bir görsel ve geçerli tarihler gerekli.",
    };
  }

  const supabase = await getStaffClient();
  if (!supabase) return { error: "Bu işlem için editoryal yetki gerekiyor." };

  const { error } = await supabase.from("ad_placements").insert({
    sponsor: parsed.data.sponsor,
    destination_url: parsed.data.destinationUrl,
    placement_key: parsed.data.placementKey,
    desktop_media_id: parsed.data.desktopMediaId ?? null,
    mobile_media_id: parsed.data.mobileMediaId ?? null,
    starts_at: parsed.data.startsAt,
    ends_at: parsed.data.endsAt ?? null,
  });

  if (error) return { error: "Reklam kaydedilemedi. Lütfen tekrar deneyin." };

  revalidateAdSurfaces();
  return { success: "Reklam kaydedildi." };
}

const idSchema = z.string().uuid();

export async function setAdPlacementActive(formData: FormData): Promise<void> {
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success || !hasSupabasePublicConfig()) return;

  const supabase = await getStaffClient();
  if (!supabase) return;

  await supabase
    .from("ad_placements")
    .update({ is_active: formData.get("active") === "true" })
    .eq("id", id.data);

  revalidateAdSurfaces();
}

export async function deleteAdPlacement(formData: FormData): Promise<void> {
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success || !hasSupabasePublicConfig()) return;

  const supabase = await getStaffClient();
  if (!supabase) return;

  await supabase.from("ad_placements").delete().eq("id", id.data);

  revalidateAdSurfaces();
}
