import "server-only";

import { emptyFacets, readFacets, type SearchFacets } from "@/lib/facets";
import type { ArticlePreview } from "@/lib/homepage";
import { SEARCH_PAGE_SIZE, normalizeSearchQuery } from "@/lib/search-query";
import { type MediaAssetRow, toArticlePreview } from "@/lib/article-preview";
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
  /**
   * Attach each hit's hero image. Off by default: the typeahead never draws a
   * picture, so it should not pay for the extra round trip.
   */
  withHeroes?: boolean;
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
  withHeroes = false,
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

  // The RPC returns flat columns with no hero, so the page's slice is looked up
  // by id in a second query rather than widening the function's return type.
  const heroes = new Map<string, MediaAssetRow>();
  if (withHeroes && rows.length > 0) {
    const { data: heroRows } = await supabase
      .from("articles")
      .select(
        "id, hero:media_assets!articles_hero_media_id_fkey(object_path, alt_text, width, height, focal_point_x, focal_point_y)",
      )
      .in(
        "id",
        rows.map((row) => row.id),
      );

    // A failed lookup costs the pictures, not the results: rows fall back to
    // their colour surface.
    for (const row of heroRows ?? []) {
      if (row.hero) heroes.set(row.id, row.hero);
    }
  }

  return {
    hits: rows.map((row) => ({
      ...toArticlePreview({ ...row, hero: heroes.get(row.id) }, now),
      headline: row.headline,
    })),
    total,
    currentPage,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    loadError: false,
  };
}

/** Topic and location options for the filter selects. */
export async function getSearchFacets(): Promise<SearchFacets> {
  if (!hasSupabasePublicConfig()) return emptyFacets;

  return readFacets(await createClient());
}
