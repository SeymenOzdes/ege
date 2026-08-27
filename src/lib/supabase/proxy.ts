import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { hasSupabasePublicConfig, getSupabasePublicConfig } from "@/lib/supabase/config";

export async function updateSession(request: NextRequest) {
  if (!hasSupabasePublicConfig()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const hasAuthSession = request.cookies
    .getAll()
    .some(({ name }) => name.startsWith("sb-") && name.includes("-auth-token"));

  // An anonymous visit has no Supabase session to refresh. Avoid an unnecessary
  // Auth request so the public site still renders when Auth is temporarily slow.
  if (!hasAuthSession) return response;

  const { url, publishableKey } = getSupabasePublicConfig();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set({ name, value, ...options }),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set({ name, value, ...options }),
        );
      },
    },
  });

  // Validates claims and refreshes expired sessions without trusting getSession user data.
  await supabase.auth.getClaims();
  return response;
}
