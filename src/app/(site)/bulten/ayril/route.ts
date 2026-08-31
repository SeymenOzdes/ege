import { type NextRequest, NextResponse } from "next/server";
import { digestToken, isTokenShaped } from "@/lib/newsletter/tokens";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

/**
 * Ayrılma jetonu, onay jetonunun aksine kullanıldıktan sonra silinmez. Bağlantı
 * gönderilen her bültende taşınır; silinseydi aynı e-postadaki bağlantıya ikinci
 * kez tıklayan kişi "geçersiz bağlantı" görürdü. Bu yüzden işlem fikir-eşdeğerdir.
 */
async function unsubscribe(token: string | null): Promise<boolean> {
  if (!hasSupabasePublicConfig() || !isTokenShaped(token)) return false;

  const { data, error } = await createAdminClient()
    .from("newsletter_subscriptions")
    .update({
      status: "UNSUBSCRIBED",
      unsubscribed_at: new Date().toISOString(),
      confirmation_token_digest: null,
    })
    .eq("unsubscribe_token_digest", digestToken(token))
    .select("id")
    .maybeSingle();

  return !error && Boolean(data);
}

/** İnsanın e-postadaki bağlantıya tıklaması. */
export async function GET(request: NextRequest) {
  const ok = await unsubscribe(request.nextUrl.searchParams.get("token"));
  const durum = ok ? "ayrildi" : "gecersiz";

  return NextResponse.redirect(new URL(`/bulten?durum=${durum}`, request.url));
}

/**
 * RFC 8058 tek tıkla ayrılma. E-posta istemcisi `List-Unsubscribe-Post`
 * başlığını görünce buraya POST atar ve gövdesiz 200 bekler.
 */
export async function POST(request: NextRequest) {
  const ok = await unsubscribe(request.nextUrl.searchParams.get("token"));

  return new NextResponse(null, { status: ok ? 200 : 400 });
}
