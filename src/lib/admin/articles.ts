import "server-only";

import { z } from "zod";
import { toBodyDrafts, type BodyBlockDraft } from "@/lib/admin/article-body";
import { articleStatuses, type ArticleStatus, type ArticleType } from "@/lib/admin/article-schema";
import { parseArticleBody } from "@/lib/articles";
import { getMediaPublicUrl, NEWS_MEDIA_BUCKET } from "@/lib/media";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** Yönetim listesinde bir sayfada gösterilen haber sayısı. */
export const ADMIN_ARTICLE_PAGE_SIZE = 20;

/** Seçicilere doldurulan medya kaydı sayısı; kütüphanenin tamamı değil. */
const MEDIA_OPTION_LIMIT = 60;

export type AdminArticleListItem = {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  articleType: ArticleType;
  isBreaking: boolean;
  publishedAt: string | null;
  scheduledAt: string | null;
  updatedAt: string;
  topicName: string | null;
  authorName: string | null;
};

export type AdminArticleList = {
  articles: AdminArticleListItem[];
  counts: Record<ArticleStatus, number>;
  total: number;
  pageCount: number;
  loadError: boolean;
};

const emptyCounts: Record<ArticleStatus, number> = {
  DRAFT: 0,
  IN_REVIEW: 0,
  SCHEDULED: 0,
  PUBLISHED: 0,
  ARCHIVED: 0,
};

const emptyList: AdminArticleList = {
  articles: [],
  counts: emptyCounts,
  total: 0,
  pageCount: 1,
  loadError: false,
};

const ADMIN_LIST_SELECTION =
  "id, title, slug, status, article_type, is_breaking, published_at, scheduled_at, updated_at, topic:topics(name), author:authors(name)";

// Tek bir dizgi olarak duruyor, birleştirme değil: `supabase-js` satır tipini bu
// dizginin sabit tipinden çıkarıyor ve `+` onu `string`'e genişletirdi.
const ADMIN_DETAIL_SELECTION =
  "id, title, slug, summary, body, status, article_type, author_id, topic_id, location_id, hero_media_id, social_media_id, seo_title, seo_description, is_breaking, breaking_expires_at, scheduled_at, published_at, archived_at, updated_at";

/**
 * PostgREST süzgeç değerinde anlam taşıyan karakterleri temizler. `%` ve `_`
 * `ilike` joker karakterleri, `,` `(` `)` ise süzgeç dizgisinin kendi
 * ayraçları: aranan başlık bunları içeriyorsa sorgu bambaşka bir şeye dönerdi.
 */
function toTitleFilter(query: string): string {
  return `%${query.replace(/[%_,()\\]/g, " ").trim()}%`;
}

/**
 * Personel tarafındaki haber listesi.
 *
 * `articles_staff_manage` EDITOR ve ADMIN'e tam erişim verdiği için okuma
 * çerez taşıyan normal istemciyle yapılıyor; secret key gerekmiyor. Panelin
 * geri kalanı gibi hiçbir zaman fırlatmaz, `loadError` döndürür.
 */
export async function getAdminArticles(options: {
  status?: ArticleStatus;
  query?: string;
  page?: number;
}): Promise<AdminArticleList> {
  if (!hasSupabasePublicConfig()) return { ...emptyList, loadError: true };

  const page = Math.max(1, options.page ?? 1);
  const from = (page - 1) * ADMIN_ARTICLE_PAGE_SIZE;
  const supabase = await createClient();

  let listQuery = supabase
    .from("articles")
    .select(ADMIN_LIST_SELECTION, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, from + ADMIN_ARTICLE_PAGE_SIZE - 1);

  if (options.status) listQuery = listQuery.eq("status", options.status);
  if (options.query?.trim()) listQuery = listQuery.ilike("title", toTitleFilter(options.query));

  // Sayaçlar `dashboard.ts`'teki gibi başlık sorgularıyla alınıyor: tüm
  // satırları çekip TypeScript'te saymak arşiv büyüdükçe pahalılaşırdı.
  const [listResult, ...countResults] = await Promise.all([
    listQuery,
    ...articleStatuses.map((status) =>
      supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", status),
    ),
  ]);

  if (listResult.error || countResults.some((result) => result.error)) {
    return { ...emptyList, loadError: true };
  }

  const counts = { ...emptyCounts };
  articleStatuses.forEach((status, index) => {
    counts[status] = countResults[index].count ?? 0;
  });

  const total = listResult.count ?? 0;

  return {
    articles: (listResult.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      status: row.status,
      articleType: row.article_type,
      isBreaking: row.is_breaking,
      publishedAt: row.published_at,
      scheduledAt: row.scheduled_at,
      updatedAt: row.updated_at,
      topicName: row.topic?.name ?? null,
      authorName: row.author?.name ?? null,
    })),
    counts,
    total,
    pageCount: Math.max(1, Math.ceil(total / ADMIN_ARTICLE_PAGE_SIZE)),
    loadError: false,
  };
}

export type AdminArticleRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  status: ArticleStatus;
  articleType: ArticleType;
  authorId: string | null;
  topicId: string | null;
  locationId: string | null;
  heroMediaId: string | null;
  socialMediaId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isBreaking: boolean;
  breakingExpiresAt: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  archivedAt: string | null;
  updatedAt: string;
  blocks: BodyBlockDraft[];
};

/**
 * Düzenleme formunun okuduğu tek kayıt. Kimlik UUID değilse sorgu bile
 * açılmıyor: PostgREST bozuk bir UUID'ye 400 döner ve sayfa `notFound()`
 * yerine hata sınırına düşerdi.
 */
export async function getAdminArticle(id: string): Promise<AdminArticleRecord | undefined> {
  if (!hasSupabasePublicConfig()) return undefined;
  if (!z.uuid().safeParse(id).success) return undefined;

  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select(ADMIN_DETAIL_SELECTION)
    .eq("id", id)
    .maybeSingle();

  if (!data) return undefined;

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    status: data.status,
    articleType: data.article_type,
    authorId: data.author_id,
    topicId: data.topic_id,
    locationId: data.location_id,
    heroMediaId: data.hero_media_id,
    socialMediaId: data.social_media_id,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    isBreaking: data.is_breaking,
    breakingExpiresAt: data.breaking_expires_at,
    scheduledAt: data.scheduled_at,
    publishedAt: data.published_at,
    archivedAt: data.archived_at,
    updatedAt: data.updated_at,
    blocks: toBodyDrafts(parseArticleBody(data.body)),
  };
}

export type ArticleRelationOption = { id: string; name: string };
export type ArticleMediaOption = { id: string; altText: string; publicUrl?: string };

export type ArticleFormOptions = {
  topics: ArticleRelationOption[];
  locations: ArticleRelationOption[];
  authors: ArticleRelationOption[];
  media: ArticleMediaOption[];
  loadError: boolean;
};

const emptyOptions: ArticleFormOptions = {
  topics: [],
  locations: [],
  authors: [],
  media: [],
  loadError: false,
};

/** Formdaki konu, şehir, yazar ve görsel seçicilerinin listeleri. */
export async function getArticleFormOptions(): Promise<ArticleFormOptions> {
  if (!hasSupabasePublicConfig()) return { ...emptyOptions, loadError: true };

  const supabase = await createClient();
  const [topics, locations, authors, media] = await Promise.all([
    supabase.from("topics").select("id, name").order("sort_order"),
    supabase.from("locations").select("id, name").order("name"),
    supabase.from("authors").select("id, name").order("name"),
    supabase
      .from("media_assets")
      .select("id, alt_text, object_path")
      .eq("bucket_id", NEWS_MEDIA_BUCKET)
      .order("created_at", { ascending: false })
      .limit(MEDIA_OPTION_LIMIT),
  ]);

  if ([topics, locations, authors, media].some((result) => result.error)) {
    return { ...emptyOptions, loadError: true };
  }

  return {
    topics: topics.data ?? [],
    locations: locations.data ?? [],
    authors: authors.data ?? [],
    media: (media.data ?? []).map((asset) => ({
      id: asset.id,
      altText: asset.alt_text,
      publicUrl: getMediaPublicUrl(asset.object_path),
    })),
    loadError: false,
  };
}
