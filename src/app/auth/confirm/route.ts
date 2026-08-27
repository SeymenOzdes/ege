import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { authRedirectCookie, getSafeRedirectPath } from "@/lib/auth/redirect";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

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
  return NextResponse.redirect(new URL(next, request.url));
}
