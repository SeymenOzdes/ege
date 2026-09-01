import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Cookie-free, publishable-key Supabase client.
 *
 * `@/lib/supabase/server` reads cookies to carry the reader's session, which makes it
 * unusable anywhere Next.js runs without a request — `generateStaticParams`, and later
 * the sitemap and feed. This client carries no session at all, so those reads see
 * exactly what an anonymous visitor sees: `articles_public_select` still does the
 * gating, and no secret key is involved.
 */
export function createAnonClient() {
  const { url, publishableKey } = getSupabasePublicConfig();

  return createSupabaseClient<Database>(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
