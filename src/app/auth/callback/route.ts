import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  authRedirectCookie,
  getSafeRedirectPath,
  pendingBookmarkCookie,
} from "@/lib/auth/redirect";
import { savePendingBookmark } from "@/lib/auth/pending-bookmark";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Google, kullanıcıyı onay verdikten sonra `code` (ve hata durumunda `error`)
 * parametreleriyle bu adrese geri döner. Kod, Supabase'in PKCE oturum
 * çerezleriyle takas edilir; akış `/auth/confirm` rotasını birebir izler.
 */
export async function GET(request: NextRequest) {
  if (!hasSupabasePublicConfig()) {
    return NextResponse.redirect(new URL("/giris?error=not_configured", request.url));
  }

  const oauthError = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  if (oauthError || !code) {
    return NextResponse.redirect(new URL("/giris?error=google_failed", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/giris?error=google_failed", request.url));
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
