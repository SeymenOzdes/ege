import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { ArticleDetail } from "@/components/site/article-detail";
import { BookmarkNotice } from "@/components/site/bookmark-notice";
import { getArticleBySlug, getArticleMetadata, getPublishedArticleSlugs } from "@/lib/articles";
import { getRedirectTarget } from "@/lib/redirects";

/**
 * Yayımlanan bir haber nadiren değişir, ama düzeltme aynı adreste yayımlanır; beş
 * dakika, düzeltmenin görünmesi ile CDN'in işini yapması arasında makul bir denge.
 *
 * `dynamicParams` varsayılanında bırakıldı: `generateStaticParams` yalnızca son
 * haberleri önden üretir, arşivdeki her slug ilk istekte üretilip önbelleğe girer.
 * Bir slug listesi değil, yalnızca ısıtma listesi.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPublishedArticleSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return {};

  return getArticleMetadata(article);
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    // Adresi değişmiş bir haber olabilir. Sorgu yalnızca bu yolda çalışıyor;
    // bulunan her habere bir gidiş-dönüş daha eklemenin anlamı yok.
    const target = await getRedirectTarget(`/haber/${slug}`);
    if (target) {
      if (target.statusCode === 301 || target.statusCode === 308) {
        permanentRedirect(target.toPath);
      }
      redirect(target.toPath);
    }

    notFound();
  }

  return (
    <>
      {/* `?bilgi=` istemcide okunuyor; Suspense sınırı `useSearchParams` için gerekli
          ve sayfanın geri kalanının önceden render edilmesini sağlıyor. */}
      <Suspense fallback={null}>
        <BookmarkNotice />
      </Suspense>
      <ArticleDetail article={article} />
    </>
  );
}
