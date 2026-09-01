import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  articleStatusLabels,
  articleStatuses,
  articleTypeLabels,
  parseArticleStatus,
} from "@/lib/admin/article-schema";
import { getAdminArticles } from "@/lib/admin/articles";
import { parsePageNumber } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "—";
}

function firstValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

/** Süzgeç ve sayfalama bağlantıları aynı sorguyu koruyarak kuruluyor. */
function buildHref(params: { durum?: string; q?: string; sayfa?: number }) {
  const search = new URLSearchParams();
  if (params.durum) search.set("durum", params.durum);
  if (params.q) search.set("q", params.q);
  if (params.sayfa && params.sayfa > 1) search.set("sayfa", String(params.sayfa));

  const query = search.toString();
  return query ? `/yonetim/haberler?${query}` : "/yonetim/haberler";
}

const chipClassName = "rounded-full px-3 py-1.5 text-sm font-semibold transition";

type ArticlesPageProps = {
  searchParams: Promise<{
    durum?: string | string[];
    q?: string | string[];
    sayfa?: string | string[];
  }>;
};

export default async function AdminArticlesPage({ searchParams }: ArticlesPageProps) {
  const query = await searchParams;
  const activeStatus = parseArticleStatus(firstValue(query.durum));
  const searchTerm = firstValue(query.q)?.trim() ?? "";
  const page = parsePageNumber(firstValue(query.sayfa));

  const { articles, counts, total, pageCount, loadError } = await getAdminArticles({
    status: activeStatus,
    query: searchTerm,
    page,
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
      <div className="grid gap-10">
        <AdminPageHeader
          actions={
            <Link
              className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-teal)]"
              href="/yonetim/haberler/yeni"
            >
              Yeni haber
            </Link>
          }
          description="Taslaktan yayına kadar bütün haberler. Bir habere tıklayarak metnini, görsellerini ve durumunu düzenleyebilirsiniz."
          eyebrow="Haberler"
          title="Haber akışı"
        />

        <section className="rounded-[24px] border border-[var(--color-line)] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <nav aria-label="Duruma göre süz" className="flex flex-wrap gap-2">
              <Link
                aria-current={activeStatus ? undefined : "page"}
                className={`${chipClassName} ${
                  activeStatus
                    ? "text-[var(--color-ink-muted)] hover:text-[var(--color-teal)]"
                    : "bg-[var(--color-ink)] text-white"
                }`}
                href={buildHref({ q: searchTerm })}
              >
                Tümü
              </Link>
              {articleStatuses.map((status) => (
                <Link
                  aria-current={activeStatus === status ? "page" : undefined}
                  className={`${chipClassName} ${
                    activeStatus === status
                      ? "bg-[var(--color-ink)] text-white"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-teal)]"
                  }`}
                  href={buildHref({ durum: status, q: searchTerm })}
                  key={status}
                >
                  {articleStatusLabels[status]} ({counts[status]})
                </Link>
              ))}
            </nav>

            <form className="flex gap-2" method="get">
              {activeStatus ? <input name="durum" type="hidden" value={activeStatus} /> : null}
              <label className="sr-only" htmlFor="article-search">
                Başlıkta ara
              </label>
              <input
                className="rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-2 text-sm"
                defaultValue={searchTerm}
                id="article-search"
                name="q"
                placeholder="Başlıkta ara"
                type="search"
              />
              <button
                className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"
                type="submit"
              >
                Ara
              </button>
            </form>
          </div>

          {loadError ? (
            <p
              className="mt-5 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              Haber listesi yüklenemedi.
            </p>
          ) : null}

          {!loadError && articles.length === 0 ? (
            <p className="mt-6 text-[var(--color-ink-muted)]">
              {searchTerm
                ? "Bu aramaya uyan haber yok."
                : "Bu durumda henüz haber yok. Yeni bir taslak açabilirsiniz."}
            </p>
          ) : null}

          {articles.length > 0 ? (
            <ul className="mt-5 divide-y divide-[var(--color-line)]">
              {articles.map((article) => (
                <li className="py-4 first:pt-0" key={article.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Link
                        className="font-semibold hover:text-[var(--color-teal)]"
                        href={`/yonetim/haberler/${article.id}`}
                      >
                        {article.title}
                      </Link>
                      <p className="mt-1 truncate text-sm text-[var(--color-ink-muted)]">
                        /haber/{article.slug} · {articleTypeLabels[article.articleType]}
                        {article.topicName ? ` · ${article.topicName}` : ""}
                        {article.authorName ? ` · ${article.authorName}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                      {article.isBreaking ? (
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--color-ochre)_18%,white)] px-2.5 py-1 text-xs font-bold text-[var(--color-ink)]">
                          Son dakika
                        </span>
                      ) : null}
                      <span className="rounded-full bg-[var(--color-paper)] px-2.5 py-1 text-xs font-bold">
                        {articleStatusLabels[article.status]}
                      </span>
                      <span>
                        {article.status === "SCHEDULED"
                          ? `Planlanan: ${formatDate(article.scheduledAt)}`
                          : formatDate(article.publishedAt ?? article.updatedAt)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          {pageCount > 1 ? (
            <nav
              aria-label="Sayfalar"
              className="mt-6 flex items-center justify-between gap-4 text-sm"
            >
              {page > 1 ? (
                <Link
                  className="font-semibold hover:text-[var(--color-teal)]"
                  href={buildHref({ durum: activeStatus, q: searchTerm, sayfa: page - 1 })}
                >
                  ← Önceki
                </Link>
              ) : (
                <span />
              )}
              <span className="text-[var(--color-ink-muted)]">
                Sayfa {page} / {pageCount} · {total} haber
              </span>
              {page < pageCount ? (
                <Link
                  className="font-semibold hover:text-[var(--color-teal)]"
                  href={buildHref({ durum: activeStatus, q: searchTerm, sayfa: page + 1 })}
                >
                  Sonraki →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  );
}
