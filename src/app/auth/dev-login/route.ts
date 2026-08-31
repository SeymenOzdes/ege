import { type NextRequest, NextResponse } from "next/server";
import { devAdminCredentials, isDevAdminAutoLoginEnabled } from "@/lib/auth/dev-access";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * Yalnızca yerel geliştirme: `requireStaffRoute`, oturumu olmayan geliştiriciyi
 * buraya yönlendirir; seed admin'i ile parola girişi yapıp gerçek oturum
 * çerezlerini kurar. Sahte bir sunucu tarafı rolü yerine gerçek bir Supabase
 * oturumu kullanılır; böylece dashboard sorgularındaki RLS kontrolleri
 * (auth.jwt() app_metadata.role) gerçek rolle çalışmaya devam eder.
 * Bayrak kapalıyken veya üretimde rota giriş sayfasına yönlenir.
 */
export async function GET(request: NextRequest) {
  if (!isDevAdminAutoLoginEnabled() || !hasSupabasePublicConfig()) {
    return NextResponse.redirect(new URL("/giris?error=link_invalid", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(devAdminCredentials());
  if (error) {
    return NextResponse.redirect(new URL("/giris?error=dev_login_failed", request.url));
  }

  const next = getSafeRedirectPath(request.nextUrl.searchParams.get("next"), "/yonetim");
  return NextResponse.redirect(new URL(next, request.url));
}
