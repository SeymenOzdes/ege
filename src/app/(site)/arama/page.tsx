import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { ArticleCard } from "@/components/site/article-card";
import { Pager } from "@/components/site/archive-list";
import { HighlightedText } from "@/components/site/highlighted-text";
import { parsePageNumber } from "@/lib/archives";
import { getSearchFacets, searchArticles } from "@/lib/search";
import {
  SEARCH_QUERY_MAX_LENGTH,
  SEARCH_QUERY_MIN_LENGTH,
  buildSearchHref,
  normalizeSearchQuery,
} from "@/lib/search-query";
import { recordNoResultQuery } from "@/lib/search-analytics";
import styles from "./arama.module.css";

type AramaSearchParams = {
  q?: string;
  konu?: string;
  sehir?: string;
  sayfa?: string;
};

export const metadata: Metadata = {
  title: "Arama",
  description: "Ege'nin Nabzı haberlerinde Türkçe arama yapın.",
  alternates: { canonical: "/arama" },
  // Result pages are reader tools, not content: keep them out of the index.
  robots: { index: false, follow: true },
};

const suggestions = ["İzmir", "zeytin", "ulaşım", "kültür", "pazar"] as const;

function Suggestions() {
  return (
    <div className={styles.suggestions}>
      <MagnifyingGlass aria-hidden="true" size={26} weight="duotone" />
      <p>Şunları deneyebilirsiniz:</p>
      <div className={styles.chips}>
        {suggestions.map((term) => (
          <Link key={term} href={buildSearchHref({ query: term })}>
            {term}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function AramaPage({
  searchParams,
}: {
  searchParams: Promise<AramaSearchParams>;
}) {
  const { q, konu, sehir, sayfa } = await searchParams;
  const { query, state } = normalizeSearchQuery(q);
  const topicSlug = konu?.trim() || null;
  const locationSlug = sehir?.trim() || null;
  const page = parsePageNumber(sayfa);

  const [facets, results] = await Promise.all([
    getSearchFacets(),
    state === "ok"
      ? searchArticles({ query, topicSlug, locationSlug, page })
      : Promise.resolve(null),
  ]);

  // `total_count` rides on the returned rows, so a page past the end comes back
  // empty and indistinguishable from "no matches". Treat it as out of range and
  // use the permanent not-found boundary, like the archives do.
  if (results && !results.loadError && results.hits.length === 0 && page > 1) notFound();

  // Only the first page says anything about the query itself.
  if (results && !results.loadError && page === 1 && results.total === 0) {
    // Telemetry must not delay the response.
    after(() => recordNoResultQuery({ query, topicSlug, locationSlug }));
  }

  const heading = query.length > 0 ? `“${query}” için sonuçlar` : "Ege'de ne arıyorsunuz?";

  return (
    <div className={styles.page}>
      <div className="shell-container">
        <header className={styles.header}>
          <span className="eyebrow">Haber arşivi</span>
          <h1 className="font-editorial">{heading}</h1>

          {/* A plain GET form keeps results linkable, shareable and usable without JS. */}
          <form className={styles.searchBar} action="/arama" method="get">
            <div className="search-form">
              <MagnifyingGlass aria-hidden="true" />
              <input
                name="q"
                type="search"
                defaultValue={query}
                maxLength={SEARCH_QUERY_MAX_LENGTH}
                placeholder="Haber, şehir veya konu"
                aria-label="Haberlerde ara"
              />
              <button type="submit">Ara</button>
            </div>

            <div className={styles.filters}>
              <label>
                <span className="sr-only">Konuya göre süz</span>
                <select name="konu" defaultValue={topicSlug ?? ""}>
                  <option value="">Tüm konular</option>
                  {facets.topics.map((topic) => (
                    <option key={topic.slug} value={topic.slug}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Şehre göre süz</span>
                <select name="sehir" defaultValue={locationSlug ?? ""}>
                  <option value="">Tüm şehirler</option>
                  {facets.locations.map((location) => (
                    <option key={location.slug} value={location.slug}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </label>
              {(topicSlug || locationSlug) && (
                <Link className={styles.clearFilters} href={buildSearchHref({ query })}>
                  Filtreleri temizle
                </Link>
              )}
            </div>
          </form>

          <p className={styles.count} role="status">
            {state === "empty" && "Haber, şehir veya konu bazında Türkçe arama yapabilirsiniz."}
            {state === "too-short" && `En az ${SEARCH_QUERY_MIN_LENGTH} karakter girin.`}
            {state === "too-long" && `Arama en fazla ${SEARCH_QUERY_MAX_LENGTH} karakter olabilir.`}
            {results?.loadError && "Arama şu anda kullanılamıyor. Lütfen daha sonra deneyin."}
            {results &&
              !results.loadError &&
              results.total > 0 &&
              `${results.total} haber bulundu.`}
            {results &&
              !results.loadError &&
              results.total === 0 &&
              "Sonuç bulunamadı. Farklı bir ifade deneyin."}
          </p>
        </header>

        {results && !results.loadError && results.hits.length > 0 ? (
          <>
            <div className={styles.results}>
              {results.hits.map((hit) => (
                <ArticleCard
                  article={hit}
                  variant="timeline"
                  key={`${hit.id}-${hit.slug}`}
                  excerpt={
                    <p className={styles.excerpt}>
                      <HighlightedText text={hit.headline} />
                    </p>
                  }
                />
              ))}
            </div>
            <Pager
              currentPage={results.currentPage}
              totalPages={results.totalPages}
              buildHref={(nextPage) =>
                buildSearchHref({ query, topicSlug, locationSlug, page: nextPage })
              }
            />
          </>
        ) : (
          <Suggestions />
        )}
      </div>
    </div>
  );
}
