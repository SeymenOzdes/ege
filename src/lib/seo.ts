import "server-only";

import { createAnonClient } from "@/lib/supabase/anon";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

/**
 * `sitemap.ts` ve `feed.xml` için okumalar.
 *
 * İkisi de çerezsiz `createAnonClient()` kullanıyor. Zorunlu: sitemap ve besleme
 * önbelleğe alınıyor, yani oturum taşıyan bir istemci hem rotayı istek zamanlı
 * yapar hem de personelin gördüğü taslakları herkese açık bir XML'e sızdırır.
 * `articles_public_select` süzmeyi zaten yapıyor.
 */

/**
 * Sitemap'e girecek en fazla haber sayısı.
 *
 * Sitemap protokolünün dosya başına sınırı 50.000 adres; buradaki sınır ondan
 * çok daha düşük tutuldu. Arşiv bu sayıya yaklaştığında yapılacak iş
 * `generateSitemaps` ile dosyayı bölmek (bkz. Next.js `generateSitemaps`
 * API'si); bugün için gereksiz karmaşıklık.
 */
const SITEMAP_ARTICLE_LIMIT = 5000;

/**
 * Tek PostgREST isteğinde istenecek satır sayısı.
 *
 * Sunucunun `max_rows` ayarı (barındırılan Supabase'de 1000) bir yanıtın
 * döndürebileceği satırı sınırlar ve fazlasını sessizce keser. Sayfa boyutu bu
 * eşiğin altında tutulup `range()` ile ilerleniyor; yoksa `SITEMAP_ARTICLE_LIMIT`
 * ne yazılırsa yazılsın sitemap en yeni 1000 haberde biterdi.
 */
const SITEMAP_PAGE_SIZE = 500;

export type SitemapArticle = {
  slug: string;
  /** En son değişim anı: güncelleme varsa o, yoksa yayın tarihi. */
  lastModified: string;
};

export type SitemapContent = {
  articles: SitemapArticle[];
  /** Yayımlanmış haberi olan konu slug'ları. */
  topicSlugs: string[];
  locationSlugs: string[];
  authorSlugs: string[];
  /** Tüm arşivdeki en son değişim anı; ana sayfanın `lastModified`'ı. */
  latestChange?: string;
};

const EMPTY_CONTENT: SitemapContent = {
  articles: [],
  topicSlugs: [],
  locationSlugs: [],
  authorSlugs: [],
};

const SITEMAP_SELECTION =
  "slug, published_at, updated_at, topic:topics(slug), location:locations(slug), author:authors(slug)";

type SitemapRow = {
  slug: string;
  published_at: string | null;
  updated_at: string | null;
  topic: { slug: string } | null;
  location: { slug: string } | null;
  author: { slug: string } | null;
};

/**
 * Sitemap'in ihtiyacı olan her şey tek sorgu dizisiyle.
 *
 * Konu, şehir ve yazar listeleri ayrı ayrı sorgulanmıyor, haber satırlarından
 * türetiliyor. İki faydası var: konu/şehir/yazar için ek sorgu gerekmiyor ve
 * arşiv listesine yalnızca **gerçekten yayımlanmış haberi olan** slug'lar
 * giriyor. Boş bir arşiv sayfasını arama motoruna göndermenin kimseye faydası
 * yok. Bunun karşılığı, haberlerin eksiksiz çekilmesi gerektiği: eksik bir
 * sayfa yalnızca haberleri değil, o haberlerden türeyen arşiv adreslerini de
 * sitemap'ten düşürür. Bu yüzden satırlar `SITEMAP_ARTICLE_LIMIT`'e ya da arşiv
 * bitene kadar sayfa sayfa geziliyor.
 *
 * Hiçbir koşulda hata fırlatmıyor — sitemap'i bozuk döndürmektense eksik
 * döndürmek yeğdir; `build` de bir sorgu yüzünden düşmemeli.
 */
export async function getSitemapContent(): Promise<SitemapContent> {
  if (!hasSupabasePublicConfig()) return EMPTY_CONTENT;

  const supabase = createAnonClient();
  const rows: SitemapRow[] = [];

  while (rows.length < SITEMAP_ARTICLE_LIMIT) {
    const pageSize = Math.min(SITEMAP_PAGE_SIZE, SITEMAP_ARTICLE_LIMIT - rows.length);
    const { data, error } = await supabase
      .from("articles")
      .select(SITEMAP_SELECTION)
      // Aynı `published_at`'e sahip iki haberin sayfalar arasında yer
      // değiştirmemesi için ikincil ve benzersiz bir sıra anahtarı gerekiyor.
      .order("published_at", { ascending: false })
      .order("slug", { ascending: true })
      .range(rows.length, rows.length + pageSize - 1);

    if (error || !data) return EMPTY_CONTENT;

    rows.push(...(data as unknown as SitemapRow[]));
    if (data.length < pageSize) break;
  }

  const topicSlugs = new Set<string>();
  const locationSlugs = new Set<string>();
  const authorSlugs = new Set<string>();
  const articles: SitemapArticle[] = [];
  let latestChange: string | undefined;

  for (const row of rows) {
    const lastModified = row.updated_at ?? row.published_at;
    if (!lastModified) continue;

    articles.push({ slug: row.slug, lastModified });
    if (!latestChange || lastModified > latestChange) latestChange = lastModified;

    if (row.topic) topicSlugs.add(row.topic.slug);
    if (row.location) locationSlugs.add(row.location.slug);
    if (row.author) authorSlugs.add(row.author.slug);
  }

  return {
    articles,
    topicSlugs: [...topicSlugs],
    locationSlugs: [...locationSlugs],
    authorSlugs: [...authorSlugs],
    latestChange,
  };
}

/** Beslemede kaç haber yer alacağı. */
export const FEED_ARTICLE_COUNT = 30;

export type FeedArticle = {
  slug: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  topic?: string;
  author?: string;
};

const FEED_SELECTION =
  "slug, title, summary, published_at, topic:topics(name), author:authors(name)";

type FeedRow = {
  slug: string;
  title: string;
  summary: string | null;
  published_at: string | null;
  topic: { name: string } | null;
  author: { name: string } | null;
};

/**
 * Beslemeye girecek en yeni haberler. Gövde metni çekilmiyor: RSS'te tam metin
 * yayımlanmıyor, özet ve bağlantı veriliyor.
 */
export async function getFeedArticles(limit = FEED_ARTICLE_COUNT): Promise<FeedArticle[]> {
  if (!hasSupabasePublicConfig()) return [];

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("articles")
    .select(FEED_SELECTION)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as unknown as FeedRow[]).map((row) => ({
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? undefined,
    publishedAt: row.published_at ?? undefined,
    topic: row.topic?.name,
    author: row.author?.name,
  }));
}
