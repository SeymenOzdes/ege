import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Girişten önce kaydedilmek istenen haberi oluşturur. Oturum çerezleri bu
 * istekte yazıldığı için istemci artık yetkilidir. Hiçbir hata girişi
 * engellemez: kaydetme başarısızsa okur haber sayfasında düğmeye yeniden
 * basabilir.
 */
export async function savePendingBookmark(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<boolean> {
  try {
    const { data: claimsData } = await supabase.auth.getClaims();
    const profileId = claimsData?.claims?.sub;
    if (typeof profileId !== "string") return false;

    const { data: article } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!article) return false;

    const { error } = await supabase
      .from("bookmarks")
      .insert({ profile_id: profileId, article_id: article.id });

    return !error || error.code === "23505";
  } catch {
    return false;
  }
}
