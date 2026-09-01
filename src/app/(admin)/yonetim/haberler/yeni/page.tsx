import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ArticleForm } from "@/components/admin/article-form";
import { getArticleFormOptions } from "@/lib/admin/articles";

export const dynamic = "force-dynamic";

type NewArticlePageProps = { searchParams: Promise<{ breaking?: string | string[] }> };

export default async function NewArticlePage({ searchParams }: NewArticlePageProps) {
  const query = await searchParams;
  const isBreaking = query.breaking === "1";
  const options = await getArticleFormOptions();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
      <div className="grid gap-10">
        <AdminPageHeader
          description={
            isBreaking
              ? "Son dakika taslağı açılıyor. Kaydettikten sonra yayına çıkmadan önce editoryal inceleme gerekiyor."
              : "Haber taslağı olarak kaydedilir; yayına geçiş inceleme adımından sonra yapılır."
          }
          eyebrow={isBreaking ? "Son dakika" : "Yeni haber"}
          title={isBreaking ? "Son dakika taslağı" : "Yeni haber"}
        />

        {options.loadError ? (
          <p className="rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            Konu, şehir, yazar ve medya listeleri yüklenemedi. Seçimler boş görünebilir.
          </p>
        ) : null}

        <ArticleForm defaultBreaking={isBreaking} options={options} />
      </div>
    </main>
  );
}
