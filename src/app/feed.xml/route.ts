import { getFeedArticles } from "@/lib/seo";
import { buildRssFeed, type RssItem } from "@/lib/rss";
import { siteConfig } from "@/lib/site";

/**
 * RSS beslemesi: en yeni haberler, tam metin değil özet.
 *
 * On beş dakika, okuyucu uygulamalarının tipik yoklama aralığından kısa; daha
 * sık üretmenin karşılığı yok. Ana sayfanın bir dakikalık penceresiyle aynı
 * olması da gerekmiyor: besleme bir bildirim kanalı, manşet değil.
 */
export const revalidate = 900;

function absolute(path: string): string {
  return new URL(path, siteConfig.url).toString();
}

export async function GET() {
  const articles = await getFeedArticles();

  const items: RssItem[] = articles.map((article) => ({
    title: article.title,
    link: absolute(`/haber/${article.slug}`),
    description: article.summary,
    publishedAt: article.publishedAt,
    category: article.topic,
    author: article.author,
  }));

  const body = buildRssFeed({
    title: siteConfig.name,
    link: siteConfig.url,
    description: siteConfig.description,
    selfLink: absolute("/feed.xml"),
    language: "tr-TR",
    items,
  });

  return new Response(body, {
    headers: {
      // `charset` açıkça yazılıyor: Türkçe karakterler beslemede en sık burada
      // bozuluyor ve bazı okuyucular XML bildirimindeki kodlamayı okumuyor.
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
