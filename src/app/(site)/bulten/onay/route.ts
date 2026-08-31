import { type NextRequest, NextResponse } from "next/server";
import { digestToken, isTokenShaped } from "@/lib/newsletter/tokens";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

/**
 * Çift onaylı aboneliğin ikinci adımı. Onay jetonu tek kullanımlıktır: başarılı
 * onaydan sonra özet `null` yapılır, böylece aynı bağlantı tekrar çalışmaz.
 */
export async function GET(request: NextRequest) {
  const invalid = NextResponse.redirect(new URL("/bulten?durum=gecersiz", request.url));
  if (!hasSupabasePublicConfig()) return invalid;

  const token = request.nextUrl.searchParams.get("token");
  if (!isTokenShaped(token)) return invalid;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("newsletter_subscriptions")
    .update({
      status: "CONFIRMED",
      confirmed_at: new Date().toISOString(),
      unsubscribed_at: null,
      confirmation_token_digest: null,
    })
    .eq("confirmation_token_digest", digestToken(token))
    .select("id")
    .maybeSingle();

  if (error || !data) return invalid;

  return NextResponse.redirect(new URL("/bulten?durum=onaylandi", request.url));
}
