import "server-only";

import { cache } from "react";
import {
  ARTICLE_PREVIEW_SELECTION,
  articleRowToPreview,
  type ArticleJoinRow,
} from "@/lib/article-preview";
import type { ArticlePreview } from "@/lib/homepage";
import { ARCHIVE_PAGE_SIZE, normalizeArchiveSlug, pageRange } from "@/lib/pagination";
import { createAnonClient } from "@/lib/supabase/anon";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export type ArchiveAuthor = {
  name: string;
  slug: string;
  role: string;
  bio: string;
};

export type ArchivePage = {
  entries: ArticlePreview[];
  currentPage: number;
  totalPages: number;
  total: number;
  loadError: boolean;
};

export type CategoryArchive = {
  slug: string;
  kind: "topic" | "location";
  name: string;
  description: string | null;
  page: ArchivePage;
};

function errorPage(currentPage: number): ArchivePage {
  return { entries: [], currentPage, totalPages: 1, total: 0, loadError: true };
}

type SupabaseClient = ReturnType<typeof createAnonClient>;

type CountedRows = { data: unknown; count: number | null; error: { code?: string } | null };

/**
 * PostgREST answers an offset past the last row with 416 `PGRST103` rather than an
 * empty page. That is a page number out of range, not a broken query, so it has to
 * reach the not-found boundary instead of the "connection failed" panel.
 */
const RANGE_NOT_SATISFIABLE = "PGRST103";

/**
 * Shared newest-first, counted page over `articles`.
 *
 * Paging happens in the database rather than by slicing an array in memory, so an
 * archive costs one bounded query no matter how large the catalogue grows. Returns
 * `undefined` for an out-of-range page so routes can render the not-found boundary,
 * and never throws — a failed query comes back as `loadError`.
 */
async function readArchivePage(
  pageNumber: number,
  run: (supabase: SupabaseClient) => PromiseLike<CountedRows>,
): Promise<ArchivePage | undefined> {
  const currentPage = Number.isInteger(pageNumber) && pageNumber >= 1 ? pageNumber : 1;
  if (!hasSupabasePublicConfig()) return errorPage(currentPage);

  const supabase = createAnonClient();
  const { data, count, error } = await run(supabase);

  if (error) {
    if (error.code === RANGE_NOT_SATISFIABLE) return undefined;
    return errorPage(currentPage);
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ARCHIVE_PAGE_SIZE));
  // An empty archive still has a valid first page; anything beyond is a 404.
  if (currentPage > totalPages) return undefined;

  const now = new Date();
  return {
    entries: ((data ?? []) as ArticleJoinRow[]).map((row) => articleRowToPreview(row, now)),
    currentPage,
    totalPages,
    total,
    loadError: false,
  };
}

/** Newest-first feed across every published article. */
export const getLatestArticles = cache(
  async (page: number): Promise<ArchivePage | undefined> =>
    readArchivePage(page, (supabase) =>
      supabase
        .from("articles")
        .select(ARTICLE_PREVIEW_SELECTION, { count: "exact" })
        .order("published_at", { ascending: false })
        .range(...pageRange(page)),
    ),
);

export const getAuthorBySlug = cache(async (slug: string): Promise<ArchiveAuthor | undefined> => {
  if (!hasSupabasePublicConfig()) return undefined;

  const supabase = createAnonClient();
  const { data } = await supabase
    .from("authors")
    .select("name, slug, role_label, bio")
    .eq("slug", normalizeArchiveSlug(slug))
    .maybeSingle();

  if (!data) return undefined;

  return {
    name: data.name,
    slug: data.slug,
    role: data.role_label ?? "Muhabir",
    bio: data.bio ?? "",
  };
});

export const getAuthorArticles = cache(
  async (slug: string, page: number): Promise<ArchivePage | undefined> =>
    readArchivePage(page, (supabase) =>
      supabase
        .from("articles")
        // Filtering an embedded resource needs `!inner`, otherwise the join is a
        // left join and unrelated articles survive the filter as null authors.
        .select(`${ARTICLE_PREVIEW_SELECTION}, author:authors!inner(slug)`, { count: "exact" })
        .eq("author.slug", normalizeArchiveSlug(slug))
        .order("published_at", { ascending: false })
        .range(...pageRange(page)),
    ),
);

/**
 * Resolves `/kategori/[slug]` archives. Topics take precedence; otherwise the slug
 * is treated as a province so the header city navigation works.
 */
export const getCategoryArchive = cache(
  async (slug: string, page: number): Promise<CategoryArchive | undefined> => {
    if (!hasSupabasePublicConfig()) return undefined;

    const normalized = normalizeArchiveSlug(slug);
    const supabase = createAnonClient();

    const { data: topic } = await supabase
      .from("topics")
      .select("id, name, slug, description")
      .eq("slug", normalized)
      .maybeSingle();

    if (topic) {
      const archivePage = await readArchivePage(page, (db) =>
        db
          .from("articles")
          .select(ARTICLE_PREVIEW_SELECTION, { count: "exact" })
          .eq("topic_id", topic.id)
          .order("published_at", { ascending: false })
          .range(...pageRange(page)),
      );

      if (!archivePage) return undefined;

      return {
        slug: topic.slug,
        kind: "topic",
        name: topic.name,
        description: topic.description,
        page: archivePage,
      };
    }

    const { data: location } = await supabase
      .from("locations")
      .select("id, name, slug")
      .eq("slug", normalized)
      .maybeSingle();

    if (!location) return undefined;

    const archivePage = await readArchivePage(page, (db) =>
      db
        .from("articles")
        .select(ARTICLE_PREVIEW_SELECTION, { count: "exact" })
        .eq("location_id", location.id)
        .order("published_at", { ascending: false })
        .range(...pageRange(page)),
    );

    if (!archivePage) return undefined;

    return {
      slug: location.slug,
      kind: "location",
      name: location.name,
      description: null,
      page: archivePage,
    };
  },
);

/**
 * Related stories for the article detail page: same topic first, newest-first,
 * excluding the current article. Falls back to the general feed when the topic is
 * too thin (or absent) so the section is never left half-filled.
 */
export async function getRelatedArticles(
  articleId: string,
  topicId: string | null,
  limit = 2,
): Promise<ArticlePreview[]> {
  if (!hasSupabasePublicConfig()) return [];

  const supabase = createAnonClient();
  const now = new Date();
  const collected = new Map<string, ArticlePreview>();

  const absorb = (rows: unknown) => {
    for (const row of (rows ?? []) as ArticleJoinRow[]) {
      if (collected.size >= limit) return;
      if (row.id === articleId || collected.has(row.id)) continue;
      collected.set(row.id, articleRowToPreview(row, now));
    }
  };

  if (topicId) {
    const { data } = await supabase
      .from("articles")
      .select(ARTICLE_PREVIEW_SELECTION)
      .eq("topic_id", topicId)
      .neq("id", articleId)
      .order("published_at", { ascending: false })
      .limit(limit);
    absorb(data);
  }

  if (collected.size < limit) {
    const { data } = await supabase
      .from("articles")
      .select(ARTICLE_PREVIEW_SELECTION)
      .neq("id", articleId)
      .order("published_at", { ascending: false })
      // Over-fetch so same-topic rows already collected can be skipped.
      .limit(limit * 2);
    absorb(data);
  }

  return [...collected.values()];
}
