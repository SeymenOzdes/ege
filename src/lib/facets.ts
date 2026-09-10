import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type SearchFacet = { name: string; slug: string };
export type SearchFacets = { topics: SearchFacet[]; locations: SearchFacet[] };

export const emptyFacets: SearchFacets = { topics: [], locations: [] };

/**
 * The topic and city lists behind both facet surfaces: /arama's filter selects and
 * the category archive's wayfinding rail.
 *
 * The client is a parameter rather than built here because the two callers need
 * different ones — /arama runs on the cookie-bound server client, the archive rail on
 * the cacheable anonymous one — and that was the only thing separating two otherwise
 * identical copies of this query. Keeping the module free of both client factories
 * also keeps `next/headers` out of the import graph of the cacheable path.
 */
export async function readFacets(supabase: SupabaseClient<Database>): Promise<SearchFacets> {
  const [topics, locations] = await Promise.all([
    supabase.from("topics").select("name, slug").order("sort_order", { ascending: true }),
    supabase.from("locations").select("name, slug").order("name", { ascending: true }),
  ]);

  // A missing rail is a smaller failure than a missing page, so a broken facet
  // query degrades to no chips rather than taking the surface down with it.
  if (topics.error || locations.error) return emptyFacets;
  return { topics: topics.data ?? [], locations: locations.data ?? [] };
}
