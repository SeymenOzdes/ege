import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ArticleForm } from "@/components/admin/article-form";
import { articleStatusLabels } from "@/lib/admin/article-schema";
import { getAdminArticle, getArticleFormOptions } from "@/lib/admin/articles";

export const dynamic = "force-dynamic";

type EditArticlePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bilgi?: string | string[] }>;
};

export default async function EditArticlePage({ params, searchParams }: EditArticlePageProps) {
  const { id } = await params;
  const [article, options, query] = await Promise.all([
    getAdminArticle(id),
    getArticleFormOptions(),
    searchParams,
  ]);

  if (!article) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
      <div className="grid gap-10">
        <AdminPageHeader
          actions={
            article.status === "PUBLISHED" ? (
              <Link
                className="rounded-full border border-[var(--color-line)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"
                href={`/haber/${article.slug}`}
                rel="noreferrer"
                target="_blank"
              >
                Yayındaki hâlini aç
              </Link>
            ) : undefined
          }
          description={`Durum: ${articleStatusLabels[article.status]}. Sağdaki önizleme, haber sayfasındaki tipografiyi birebir kullanır.`}
          eyebrow="Haberler"
          title={article.title}
        />

        {options.loadError ? (
          <p className="rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Konu, şehir, yazar ve medya listeleri yüklenemedi. Seçimler boş görünebilir.
          </p>
        ) : null}

        <ArticleForm
          article={article}
          notice={query.bilgi === "olusturuldu" ? "Taslak oluşturuldu." : undefined}
          options={options}
        />
      </div>
    </main>
  );
}
