import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig, getSupabaseSecretKey } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Secret-key Supabase client. It bypasses RLS, so it exists only for tables that
 * deliberately have no anon/authenticated grant:
 *
 * - `search_queries` — sonuçsuz arama telemetrisi (Modül 12)
 * - `newsletter_subscriptions` — abonelik, onay, ayrılma ve yönetim listesi (Modül 14)
 * - `account_deletion_requests` — okur hesap silme talepleri (Modül 13)
 *
 * Never import this from a Client Component and never widen its use without a
 * matching security note in `docs/`. The newsletter and deletion surfaces are
 * documented in `docs/modules/13-*.md` and `docs/modules/14-*.md`.
 */
export function createAdminClient() {
  const { url } = getSupabasePublicConfig();

  return createSupabaseClient<Database>(url, getSupabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
