import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  authRedirectCookie,
  getSafeRedirectPath,
  pendingBookmarkCookie,
} from "@/lib/auth/redirect";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Girişten önce kaydedilmek istenen haberi oluşturur. Oturum çerezleri bu
 * istekte `verifyOtp` tarafından yazıldığı için istemci artık yetkilidir.
 * Hiçbir hata girişi engellemez: kaydetme başarısızsa okur haber sayfasında
 * düğmeye yeniden basabilir.
 */
async function savePendingBookmark(
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

export async function GET(request: NextRequest) {
  if (!hasSupabasePublicConfig()) {
    return NextResponse.redirect(new URL("/giris?error=not_configured", request.url));
  }

  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (!tokenHash || type !== "email") {
    return NextResponse.redirect(new URL("/giris?error=link_invalid", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
  if (error) {
    return NextResponse.redirect(new URL("/giris?error=link_invalid", request.url));
  }

  const cookieStore = await cookies();
  const next = getSafeRedirectPath(cookieStore.get(authRedirectCookie)?.value);
  cookieStore.delete(authRedirectCookie);

  const pendingSlug = cookieStore.get(pendingBookmarkCookie)?.value;
  cookieStore.delete(pendingBookmarkCookie);

  const destination = new URL(next, request.url);
  if (pendingSlug && (await savePendingBookmark(supabase, pendingSlug))) {
    destination.searchParams.set("bilgi", "kaydedildi");
  }

  return NextResponse.redirect(destination);
}
