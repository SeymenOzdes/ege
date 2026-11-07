/**
 * The Supabase browser client is ~250 KB of script, and most visitors are anonymous
 * and never need it. Keeping it behind a dynamic import (and behind a cookie check)
 * moves it out of the shared bundle every public page used to download.
 */

/** Same test the proxy applies: an `sb-…-auth-token` cookie means a session may exist. */
export function hasSupabaseAuthCookie(): boolean {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split(";")
    .some((part) => {
      const name = part.trim().split("=")[0] ?? "";
      return name.startsWith("sb-") && name.includes("-auth-token");
    });
}

/** Resolves the shared browser client, downloading it on first use only. */
export async function loadSupabaseClient() {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient();
}
