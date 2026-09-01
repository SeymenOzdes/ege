import type { MetadataRoute } from "next";
import { CORPORATE_PAGES } from "@/lib/corporate-pages";
import { getSitemapContent } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

/**
 * Sitemap saatte bir yeniden üretiliyor.
 *
 * Ana sayfa dakikada bir tazeleniyor (`(site)/page.tsx`), ama sitemap arama
 * motorunun tarama planı; dakikalık tazelik oraya bir şey katmaz, her istekte
 * arşivin tamamını sorgulamak ise gereksiz yük olur.
 */
export const revalidate = 3600;

function absolute(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getSitemapContent();

  const feeds: MetadataRoute.Sitemap = [
    {
      url: absolute("/"),
      lastModified: content.latestChange,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: absolute("/son-dakika"),
      lastModified: content.latestChange,
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  // Arşivlerin kendi `lastModified` değeri yok: onu üretmek konu/şehir/yazar
  // başına birer "en son yayın" sorgusu demek olurdu. Alan zorunlu değil ve
  // uydurulmuş bir tarih vermektense hiç vermemek doğru.
  const archives: MetadataRoute.Sitemap = [
    ...content.topicSlugs.map((slug) => ({
      url: absolute(`/kategori/${slug}`),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...content.locationSlugs.map((slug) => ({
      url: absolute(`/kategori/${slug}`),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...content.authorSlugs.map((slug) => ({
      url: absolute(`/yazar/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];

  const articles: MetadataRoute.Sitemap = content.articles.map((article) => ({
    url: absolute(`/haber/${article.slug}`),
    lastModified: article.lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Kurumsal metinlerin içeriği dosyalarda sabit; değişimleri dağıtımla olur,
  // veritabanında izlenecek bir tarihleri yok. `lastModified` yazılmıyor.
  const corporate: MetadataRoute.Sitemap = CORPORATE_PAGES.map((page) => ({
    url: absolute(page.path),
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...feeds, ...archives, ...articles, ...corporate];
}
