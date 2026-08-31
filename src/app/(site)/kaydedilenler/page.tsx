import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArticleCard } from "@/components/site/article-card";
import { Pager } from "@/components/site/archive-list";
import { AccountDeletionForm } from "@/components/site/account-deletion-form";
import { parsePageNumber } from "@/lib/archives";
import { getCurrentUser } from "@/lib/auth/server";
import { bookmarkNotice } from "@/lib/bookmarks/messages";
import { getBookmarkedArticles } from "@/lib/bookmarks/queries";

export const metadata: Metadata = {
  title: "Kaydedilenler",
  description: "Sonra okumak üzere kaydettiğiniz haberler.",
  // Okura özel bir sayfa dizine girmemeli.
  robots: { index: false, follow: false },
};

type SavedPageProps = {
  searchParams: Promise<{ sayfa?: string | string[]; bilgi?: string | string[] }>;
};

export default async function SavedArticlesPage({ searchParams }: SavedPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?next=%2Fkaydedilenler");

  const query = await searchParams;
  const page = parsePageNumber(typeof query.sayfa === "string" ? query.sayfa : undefined);
  const notice = bookmarkNotice(typeof query.bilgi === "string" ? query.bilgi : undefined);
  const { entries, total, currentPage, totalPages, loadError } = await getBookmarkedArticles(page);

  return (
    <div className="shell-container py-12 sm:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-[var(--color-teal)]">Hesabım</p>
        <h1 className="font-editorial mt-3 text-4xl sm:text-5xl">Kaydedilenler</h1>
        <p className="mt-4 leading-7 text-[var(--color-ink-muted)]">
          Sonra okumak üzere işaretlediğiniz haberler. Kayıtlarınız hesabınıza bağlıdır; giriş
          yaptığınız her cihazda aynı listeyi görürsünüz.
        </p>
      </header>

      {notice ? (
        <p
          className={`mt-6 rounded-[18px] px-4 py-3 text-sm ${
            notice.tone === "success"
              ? "bg-[color-mix(in_srgb,var(--color-teal)_12%,white)] text-[var(--color-teal)]"
              : "bg-red-50 text-red-700"
          }`}
          role={notice.tone === "error" ? "alert" : "status"}
        >
          {notice.text}
        </p>
      ) : null}

      {loadError ? (
        <p className="mt-8 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          Kaydedilen haberler yüklenemedi. Lütfen sayfayı yenileyin.
        </p>
      ) : null}

      {!loadError && entries.length > 0 ? (
        <>
          <p className="mt-8 text-sm text-[var(--color-ink-muted)]" role="status">
            {total} haber kaydettiniz.
          </p>
          <div className="mt-5 grid gap-5">
            {entries.map((entry) => (
              <ArticleCard article={entry} variant="timeline" key={entry.id} />
            ))}
          </div>
          <Pager basePath="/kaydedilenler" currentPage={currentPage} totalPages={totalPages} />
        </>
      ) : null}

      {!loadError && entries.length === 0 ? (
        <section className="statePanel mt-8" role="status">
          <p className="eyebrow">Boş liste</p>
          <h2 className="font-editorial text-3xl">Henüz haber kaydetmediniz.</h2>
          <p>
            Bir haberi okurken <strong>Kaydet</strong> düğmesine basın; burada birikmeye başlasın.
          </p>
          <Link className="button button-primary" href="/son-dakika">
            Son dakika haberlerine göz at
          </Link>
        </section>
      ) : null}

      <AccountDeletionForm email={user.email} />
    </div>
  );
}
