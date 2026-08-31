"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authCookieOptions, authRedirectCookie, pendingBookmarkCookie } from "@/lib/auth/redirect";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Şema tarafındaki `articles_slug_format` kontrolüyle aynı kalıp. */
const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(200);

export type BookmarkActionState = { saved?: boolean; error?: string };

export async function toggleBookmark(
  slug: string,
  shouldSave: boolean,
): Promise<BookmarkActionState> {
  if (!hasSupabasePublicConfig()) return { error: "hata" };

  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) return { error: "bulunamadi" };

  const supabase = await createClient();

  // Sahip kimliği her zaman doğrulanmış talepten okunur, istemciden değil.
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const profileId = claimsError ? undefined : claimsData?.claims?.sub;
  if (typeof profileId !== "string") return { error: "giris_gerekli" };

  // Çözümleme okurun kendi istemcisiyle yapılır: `articles_public_select`
  // yalnızca yayımlanmış haberleri döndürdüğü için taslak bir haber
  // kaydedilemez ve varlığı sızmaz.
  const { data: article } = await supabase
    .from("articles")
    .select("id")
    .eq("slug", parsedSlug.data)
    .maybeSingle();

  if (!article) return { error: "bulunamadi" };

  if (shouldSave) {
    const { error } = await supabase
      .from("bookmarks")
      .insert({ profile_id: profileId, article_id: article.id });

    // `bookmarks` tablosunda update grant'i yok, bu yüzden upsert yerine
    // yinelenen anahtar hatasını başarı sayıyoruz: kayıt zaten duruyor.
    if (error && error.code !== "23505") return { error: "hata" };
  } else {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("profile_id", profileId)
      .eq("article_id", article.id);

    if (error) return { error: "hata" };
  }

  revalidatePath("/kaydedilenler");
  return { saved: shouldSave };
}

/**
 * Giriş yapmamış okur kaydet düğmesine bastığında çalışır. Hedef haberi çerezde
 * saklar; `/auth/confirm` oturumu kurduktan sonra kaydı kendisi oluşturur.
 */
export async function startBookmarkLogin(slug: string) {
  const parsedSlug = slugSchema.safeParse(slug);
  const target = parsedSlug.success ? `/haber/${parsedSlug.data}` : "/";

  const cookieStore = await cookies();
  cookieStore.set(authRedirectCookie, target, authCookieOptions);
  if (parsedSlug.success) {
    cookieStore.set(pendingBookmarkCookie, parsedSlug.data, authCookieOptions);
  }

  redirect(`/giris?next=${encodeURIComponent(target)}`);
}

/**
 * Hesap silme talebi. Silme burada uygulanmaz: talep kaydedilir, personel
 * doğrulayıp elle yürütür. Tablo politikasız olduğu için yazma secret key ile yapılır.
 */
export async function requestAccountDeletion(formData: FormData) {
  if (!hasSupabasePublicConfig()) redirect("/kaydedilenler?bilgi=hata");

  const confirmation = formData.get("onay");
  if (
    typeof confirmation !== "string" ||
    confirmation.trim().toLocaleUpperCase("tr-TR") !== "SİL"
  ) {
    redirect("/kaydedilenler?bilgi=hata");
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const profileId = claimsError ? undefined : claimsData?.claims?.sub;
  if (typeof profileId !== "string") redirect("/giris?next=%2Fkaydedilenler");

  const email = claimsData?.claims?.email;
  const { error } = await createAdminClient()
    .from("account_deletion_requests")
    .insert({
      profile_id: profileId,
      email: typeof email === "string" ? email : null,
    });

  // Açık talep tekil indeksi ihlal edildiyse zaten bir talep var; ikinci
  // gönderimi hata olarak göstermeyiz.
  if (error && error.code !== "23505") {
    redirect("/kaydedilenler?bilgi=hata");
  }

  // Talep alındıktan sonra oturum kapatılır. `signOut()` kendi hedefine
  // yönlendirdiği için buradaki bildirimi koruyabilmek adına aynı adımlar
  // tekrarlanır.
  await supabase.auth.signOut({ scope: "local" });
  const cookieStore = await cookies();
  cookieStore.delete(authRedirectCookie);
  cookieStore.delete(pendingBookmarkCookie);

  redirect("/?bilgi=silme_talebi");
}
