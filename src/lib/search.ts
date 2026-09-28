import "server-only";

import { emptyFacets, readFacets, type SearchFacets } from "@/lib/facets";
import type { ArticlePreview } from "@/lib/homepage";
import { SEARCH_PAGE_SIZE, normalizeSearchQuery } from "@/lib/search-query";
import { type MediaAssetRow, toArticlePreview } from "@/lib/article-preview";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";
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

type SearchRow = Database["public"]["Functions"]["search_published_articles"]["Returns"][number];

/**
 * The function returns the hero as flat `hero_*` columns from a left join, so an
 * article without one comes back with every column null. The generated types
 * mark function columns non-null regardless, hence the explicit check.
 */
function heroFromRow(row: SearchRow): MediaAssetRow | null {
  const objectPath: string | null = row.hero_object_path;
  if (!objectPath) return null;

  return {
    object_path: objectPath,
    alt_text: row.hero_alt_text ?? "",
    width: row.hero_width,
    height: row.hero_height,
    focal_point_x: row.hero_focal_point_x,
    focal_point_y: row.hero_focal_point_y,
  };
}

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
    hits: rows.map((row) => ({
      ...toArticlePreview({ ...row, hero: heroFromRow(row) }, now),
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
