import "server-only";

import { ARCHIVE_PAGE_SIZE } from "@/lib/pagination";
import {
  ARTICLE_PREVIEW_SELECTION,
  articleRowToPreview,
  type ArticleJoinRow,
} from "@/lib/article-preview";
import type { ArticlePreview } from "@/lib/homepage";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type BookmarkListResult = {
  entries: ArticlePreview[];
  total: number;
  currentPage: number;
  totalPages: number;
  loadError: boolean;
};

/**
 * Kaydedilen haberler, okurun kendi oturumuyla okunur; secret key kullanılmaz.
 * `bookmarks_select_own` satırları okura daraltır, gömülü `articles!inner`
 * tarafında ise `articles_public_select` çalışır: arşivlenen veya yayından
 * kaldırılan bir haber listeden sessizce düşer, kayıt satırı ise durur.
 */
const selection = `created_at, article:articles!inner(${ARTICLE_PREVIEW_SELECTION})`;

type BookmarkRow = {
  created_at: string;
  article: ArticleJoinRow | null;
};

function toPreview(row: BookmarkRow): ArticlePreview | undefined {
  return row.article ? articleRowToPreview(row.article) : undefined;
}

const emptyResult: BookmarkListResult = {
  entries: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  loadError: false,
};

/** Arama ve yönetim adaptörleri gibi hiçbir zaman fırlatmaz. */
export async function getBookmarkedArticles(page = 1): Promise<BookmarkListResult> {
  const currentPage = Number.isInteger(page) && page >= 1 ? page : 1;
  if (!hasSupabasePublicConfig()) return { ...emptyResult, currentPage, loadError: true };

  const from = (currentPage - 1) * ARCHIVE_PAGE_SIZE;
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("bookmarks")
    .select(selection, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + ARCHIVE_PAGE_SIZE - 1);

  if (error) return { ...emptyResult, currentPage, loadError: true };

  const total = count ?? 0;
  return {
    entries: ((data ?? []) as unknown as BookmarkRow[])
      .map(toPreview)
      .filter((entry): entry is ArticlePreview => entry !== undefined),
    total,
    currentPage,
    totalPages: Math.max(1, Math.ceil(total / ARCHIVE_PAGE_SIZE)),
    loadError: false,
  };
}

/**
 * Haber sayfasındaki kaydet düğmesinin başlangıç durumu.
 *
 * Sorgu `articles` üzerinden kurulur, `bookmarks` üzerinden değil: süzgeç böylece
 * gömülü kaynağın takma adına değil üst tablonun kendi sütununa uygulanır.
 * `bookmarks` gömülüsü RLS ile zaten okurun kendi satırlarına daralır.
 */
export async function isArticleBookmarked(slug: string): Promise<boolean> {
  if (!hasSupabasePublicConfig()) return false;

  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("id, bookmarks(article_id)")
    .eq("slug", slug)
    .maybeSingle();

  return (data?.bookmarks?.length ?? 0) > 0;
}
