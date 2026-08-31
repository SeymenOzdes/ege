"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  authCookieOptions,
  authRedirectCookie,
  getSafeRedirectPath,
  pendingBookmarkCookie,
} from "@/lib/auth/redirect";
import { env } from "@/lib/env";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.email();

/**
 * The magic-link confirm redirect must land on whatever host the browser is
 * actually on (localhost vs 127.0.0.1 are separate cookie jars) — otherwise
 * the auth cookie set at /auth/confirm never reaches the host the reader
 * keeps browsing on, and the header keeps showing "Giriş" post-login.
 */
async function requestOrigin() {
  const headerList = await headers();
  const host = headerList.get("host");
  if (!host) return env.NEXT_PUBLIC_APP_URL;

  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = headerList.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function sendMagicLink(formData: FormData) {
  const emailValue = formData.get("email");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  if (!emailSchema.safeParse(email).success) {
    redirect("/giris?error=invalid_email");
  }

  if (!hasSupabasePublicConfig()) {
    redirect("/giris?error=not_configured");
  }

  const nextValue = formData.get("next");
  const nextPath = getSafeRedirectPath(nextValue, "/");
  const cookieStore = await cookies();
  cookieStore.set(authRedirectCookie, nextPath, authCookieOptions);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${await requestOrigin()}/auth/confirm`,
    },
  });

  if (error) {
    redirect("/giris?error=send_failed");
  }

  redirect("/giris?sent=1");
}

export async function signOut() {
  if (hasSupabasePublicConfig()) {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  }

  const cookieStore = await cookies();
  cookieStore.delete(authRedirectCookie);
  cookieStore.delete(pendingBookmarkCookie);
  redirect("/");
}
