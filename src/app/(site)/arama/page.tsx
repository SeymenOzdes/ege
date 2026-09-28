import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { ArticleCard } from "@/components/site/article-card";
import { Pager } from "@/components/site/archive-list";
import { HighlightedText } from "@/components/site/highlighted-text";
import { SearchFilterRail } from "@/components/site/search-filter-rail";
import { getRecentArticles } from "@/lib/archives";
import type { SearchFacet } from "@/lib/facets";
import type { ArticlePreview } from "@/lib/homepage";
import { parsePageNumber } from "@/lib/pagination";
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

/** Enough to fill the first screen under "Son haberler" without becoming a feed. */
const RECENT_COUNT = 5;

type FilterGroupProps = {
  label: string;
  options: SearchFacet[];
  selectedSlug: string | null;
  /** Builds the URL for one option; `null` is the group's "Tümü" entry. */
  buildHref: (slug: string | null) => string;
};

function FilterGroup({ label, options, selectedSlug, buildHref }: FilterGroupProps) {
  const entries = [{ name: "Tümü", slug: null }, ...options];

  return (
    <section className={styles.filterGroup} aria-label={label}>
      <h2 className={`${styles.filterLabel} eyebrow`}>{label}</h2>
      <ul className={styles.filterList}>
        {entries.map((entry) => {
          const current = entry.slug === selectedSlug;
          return (
            <li key={entry.slug ?? ""}>
              <Link
                className={styles.filterLink}
                href={buildHref(entry.slug)}
                aria-current={current ? "true" : undefined}
                // "Tümü" is current by default; only a real choice is worth scrolling to.
                data-active={current && entry.slug !== null ? "" : undefined}
              >
                {entry.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * What the page offers when there is nothing to list: a line of common searches
 * and the newest stories, so an empty or dead-end search still leads somewhere.
 */
function Discover({ recent }: { recent: ArticlePreview[] }) {
  return (
    <div className={styles.discover}>
      <section className={styles.popular} aria-labelledby="arama-sik-aranan">
        <h2 id="arama-sik-aranan" className={`${styles.sectionLabel} eyebrow`}>
          Sık aranan
        </h2>
        <ul className={styles.popularList}>
          {suggestions.map((term) => (
            <li key={term}>
              <Link href={buildSearchHref({ query: term })}>{term}</Link>
            </li>
          ))}
        </ul>
      </section>

      {recent.length > 0 && (
        <section aria-labelledby="arama-son-haberler">
          <div className={styles.sectionHead}>
            <h2 id="arama-son-haberler" className={`${styles.sectionLabel} eyebrow`}>
              Son haberler
            </h2>
            <Link className={styles.sectionMore} href="/son-dakika">
              Tümü
            </Link>
          </div>
          <div className={styles.results}>
            {recent.map((article) => (
              <ArticleCard article={article} variant="result" key={article.id} />
            ))}
          </div>
        </section>
      )}
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

  const hasHits = results !== null && !results.loadError && results.hits.length > 0;
  // A query only shows the fallback once it has come back empty, so a normal
  // search never pays for the extra read.
  const recent = hasHits ? [] : await getRecentArticles(RECENT_COUNT);

  const heading = query.length > 0 ? `“${query}” için sonuçlar` : "Ege'de ne arıyorsunuz?";

  // Filters only mean something once there is a query to narrow. A zero-result
  // search keeps them, since widening a filter is the likeliest way out of it.
  const showFilters =
    results !== null &&
    !results.loadError &&
    (facets.topics.length > 0 || facets.locations.length > 0);

  return (
    <div className={styles.page}>
      <div className={`shell-container ${styles.layout}`}>
        {/* The search box leads visually; the heading stays for outline and screen readers. */}
        <h1 className="sr-only">{heading}</h1>

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
          {/* A new query keeps the active filters; they are cleared from the rail. */}
          {topicSlug && <input type="hidden" name="konu" value={topicSlug} />}
          {locationSlug && <input type="hidden" name="sehir" value={locationSlug} />}
        </form>

        {showFilters && (
          <SearchFilterRail className={styles.filters}>
            {facets.topics.length > 0 && (
              <FilterGroup
                label="Konu"
                options={facets.topics}
                selectedSlug={topicSlug}
                buildHref={(slug) => buildSearchHref({ query, topicSlug: slug, locationSlug })}
              />
            )}
            {facets.locations.length > 0 && (
              <FilterGroup
                label="Şehir"
                options={facets.locations}
                selectedSlug={locationSlug}
                buildHref={(slug) => buildSearchHref({ query, topicSlug, locationSlug: slug })}
              />
            )}
          </SearchFilterRail>
        )}

        <div className={styles.summary}>
          <p className={`${styles.count} font-editorial`} role="status">
            {state === "empty" && "Haber, şehir veya konu bazında Türkçe arama yapabilirsiniz."}
            {state === "too-short" && `En az ${SEARCH_QUERY_MIN_LENGTH} karakter girin.`}
            {state === "too-long" && `Arama en fazla ${SEARCH_QUERY_MAX_LENGTH} karakter olabilir.`}
            {results?.loadError && "Arama şu anda kullanılamıyor. Lütfen daha sonra deneyin."}
            {results &&
              !results.loadError &&
              results.total > 0 &&
              `“${query}” için ${results.total} sonuç`}
            {results &&
              !results.loadError &&
              results.total === 0 &&
              `“${query}” için sonuç yok`}
          </p>
          {(topicSlug || locationSlug) && (
            <Link className={styles.clearFilters} href={buildSearchHref({ query })}>
              Filtreleri temizle
            </Link>
          )}
        </div>

        <div className={styles.main}>
          {hasHits && results ? (
            <>
              <div className={styles.results}>
                {results.hits.map((hit) => (
                  <ArticleCard
                    article={hit}
                    variant="result"
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
            <Discover recent={recent} />
          )}
        </div>
      </div>
    </div>
  );
}
