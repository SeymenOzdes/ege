import "server-only";

import type { ArticlePreview } from "@/lib/homepage";
import { SEARCH_PAGE_SIZE, normalizeSearchQuery } from "@/lib/search-query";
import { toArticlePreview } from "@/lib/article-preview";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type SearchHit = ArticlePreview & {
  /**
   * Excerpt with matches delimited by the STX/ETX control characters the
   * search function emits. Render it through `<HighlightedText />`, never as
   * HTML.
   */
  headline: string;
};

export type SearchParameters = {
  query: string;
  topicSlug?: string | null;
  locationSlug?: string | null;
  page?: number;
  pageSize?: number;
};

export type SearchResult = {
  hits: SearchHit[];
  total: number;
  currentPage: number;
  totalPages: number;
  loadError: boolean;
};

const emptyResult: SearchResult = {
  hits: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  loadError: false,
};

/**
 * Turkish full-text search over published articles.
 *
 * Ranking, filtering, highlighting and the total count all happen inside
 * `public.search_published_articles`, so one round trip serves a page. Like
 * the admin dashboard adapter this never throws: a failed query surfaces as
 * `loadError` so the page can say so instead of blanking out.
 */
export async function searchArticles({
  query,
  topicSlug,
  locationSlug,
  page = 1,
  pageSize = SEARCH_PAGE_SIZE,
}: SearchParameters): Promise<SearchResult> {
  const currentPage = Number.isInteger(page) && page >= 1 ? page : 1;
  if (normalizeSearchQuery(query).state !== "ok") return { ...emptyResult, currentPage };
  if (!hasSupabasePublicConfig()) return { ...emptyResult, currentPage, loadError: true };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_published_articles", {
    p_query: query,
    p_topic: topicSlug ?? undefined,
    p_location: locationSlug ?? undefined,
    p_limit: pageSize,
    p_offset: (currentPage - 1) * pageSize,
  });

  if (error) return { ...emptyResult, currentPage, loadError: true };

  const rows = data ?? [];
  const total = rows[0]?.total_count ?? 0;
  const now = new Date();

  return {
    hits: rows.map((row) => ({ ...toArticlePreview(row, now), headline: row.headline })),
    total,
    currentPage,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    loadError: false,
  };
}

export type SearchFacet = { name: string; slug: string };
export type SearchFacets = { topics: SearchFacet[]; locations: SearchFacet[] };

const emptyFacets: SearchFacets = { topics: [], locations: [] };

/** Topic and location options for the filter selects. */
export async function getSearchFacets(): Promise<SearchFacets> {
  if (!hasSupabasePublicConfig()) return emptyFacets;

  const supabase = await createClient();
  const [topics, locations] = await Promise.all([
    supabase.from("topics").select("name, slug").order("sort_order", { ascending: true }),
    supabase.from("locations").select("name, slug").order("name", { ascending: true }),
  ]);

  if (topics.error || locations.error) return emptyFacets;
  return { topics: topics.data ?? [], locations: locations.data ?? [] };
}
