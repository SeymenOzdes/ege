import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig, getSupabaseSecretKey } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Secret-key Supabase client. It bypasses RLS, so it exists only for tables
 * that deliberately have no anon/authenticated grant — currently the
 * `search_queries` telemetry table. Never import this from a Client Component
 * and never widen its use without a matching security note in `docs/`.
 */
export function createAdminClient() {
  const { url } = getSupabasePublicConfig();

  return createSupabaseClient<Database>(url, getSupabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
