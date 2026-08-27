import "server-only";

import { normalizeTurkish } from "@/lib/turkish";
import { SEARCH_QUERY_MAX_LENGTH } from "@/lib/search-query";
import { createAdminClient } from "@/lib/supabase/admin";

export type NoResultQuery = {
  query: string;
  topicSlug?: string | null;
  locationSlug?: string | null;
};

/**
 * Records a search that returned nothing, so the newsroom can see what readers
 * expected to find. Only zero-result queries are stored.
 *
 * `search_queries` has no anon grant, so this needs the secret key. It is
 * telemetry: it must never fail a page render, so every error is swallowed and
 * a missing secret key simply skips the write.
 */
export async function recordNoResultQuery({
  query,
  topicSlug,
  locationSlug,
}: NoResultQuery): Promise<void> {
  const trimmed = query.trim().slice(0, SEARCH_QUERY_MAX_LENGTH);
  if (trimmed.length === 0) return;
  if (!process.env.SUPABASE_SECRET_KEY) return;

  try {
    await createAdminClient()
      .from("search_queries")
      .insert({
        query: trimmed,
        query_normalized: normalizeTurkish(trimmed),
        topic_slug: topicSlug ?? null,
        location_slug: locationSlug ?? null,
        result_count: 0,
      });
  } catch {
    // Telemetry is best-effort; a search must still render if it cannot be logged.
  }
}
