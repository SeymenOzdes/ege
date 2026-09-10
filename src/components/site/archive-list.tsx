import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ArticleCard } from "@/components/site/article-card";
import type { ArticlePreview } from "@/lib/homepage";
import shared from "./archive-shared.module.css";
import styles from "./archive-list.module.css";

export type ArchiveListProps = {
  eyebrow: string;
  title: string;
  description?: string | null;
  entries: ArticlePreview[];
  basePath: string;
  currentPage: number;
  totalPages: number;
  total: number;
  /** The archive query failed; say so rather than implying an empty archive. */
  loadError?: boolean;
};

function pagerHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?sayfa=${page}`;
}

/** Page links kept on either side of the current page before the list is elided. */
const PAGER_WINDOW = 2;

/** A page number to link, or an elided run of them. */
export type PagerItem = number | "gap";

/**
 * The page numbers a pager should render: the first page, the last page and a
 * window around the current one, with the runs between them elided.
 *
 * Without this the pager emitted one link per page, so a growing archive turned
 * every /son-dakika, /kategori/*, /yazar/* and /arama page into a hundred-link
 * list. The output is capped at nine items regardless of `totalPages`.
 *
 * A run of exactly one skipped page is rendered rather than elided — the "…"
 * standing in for it would take the same room and cost the reader a click.
 */
export function buildPagerItems(currentPage: number, totalPages: number): PagerItem[] {
  if (totalPages < 1) return [];

  const anchored = new Set<number>([1, totalPages]);
  for (let page = currentPage - PAGER_WINDOW; page <= currentPage + PAGER_WINDOW; page += 1) {
    if (page >= 1 && page <= totalPages) anchored.add(page);
  }

  const items: PagerItem[] = [];
  let previous: number | undefined;

  for (const page of [...anchored].sort((first, second) => first - second)) {
    if (previous !== undefined && page - previous > 1) {
      items.push(page - previous === 2 ? previous + 1 : "gap");
    }
    items.push(page);
    previous = page;
  }

  return items;
}

export type PagerProps = {
  currentPage: number;
  totalPages: number;
  /** Archive routes page on `basePath` alone. */
  basePath?: string;
  /**
   * Routes with extra state in the query string — /arama carries `q`, `konu`
   * and `sehir` — pass a builder instead so paging preserves it.
   */
  buildHref?: (page: number) => string;
};

export function Pager({ basePath = "", currentPage, totalPages, buildHref }: PagerProps) {
  if (totalPages <= 1) return null;

  const href = buildHref ?? ((page: number) => pagerHref(basePath, page));
  const items = buildPagerItems(currentPage, totalPages);

  return (
    <nav className={styles.pager} aria-label="Sayfalama">
      {currentPage > 1 ? (
        <Link className={styles.pagerArrow} href={href(currentPage - 1)} rel="prev">
          <ArrowLeft aria-hidden="true" size={16} weight="bold" />
          Önceki sayfa
        </Link>
      ) : null}

      {items.map((item, index) => {
        if (item === "gap") {
          return (
            <span aria-hidden="true" className={styles.pagerGap} key={`gap-${index}`}>
              …
            </span>
          );
        }

        return item === currentPage ? (
          <span
            aria-current="page"
            className={`${styles.pageLink} ${styles.pageLinkCurrent}`}
            key={item}
          >
            {item}
          </span>
        ) : (
          <Link className={styles.pageLink} href={href(item)} key={item}>
            {item}
          </Link>
        );
      })}

      {currentPage < totalPages ? (
        <Link className={styles.pagerArrow} href={href(currentPage + 1)} rel="next">
          Sonraki sayfa
          <ArrowRight aria-hidden="true" size={16} weight="bold" />
        </Link>
      ) : null}
    </nav>
  );
}

/**
 * What every archive shows when its query fails.
 *
 * Extracted because /son-dakika, /yazar/[slug] and /kategori/[slug] all reach this
 * state, and separate copies of one copy-deck drift the moment the wording or the
 * call to action changes — a "connection failed" panel is exactly the sort of text
 * that gets rewritten once and then found stale on the other two pages.
 */
export function ArchiveErrorPanel() {
  return (
    <section className="statePanel" role="alert">
      <p className="eyebrow">Bağlantı kurulamadı</p>
      <h2 className={`font-editorial ${shared.stateHeading}`}>
        Haber akışına şu anda ulaşamıyoruz.
      </h2>
      <p>Sayfayı kısa bir süre sonra yeniden deneyebilirsiniz.</p>
      <Link className="button button-primary" href="/">
        Ana sayfaya dön
      </Link>
    </section>
  );
}

/**
 * Shared server-rendered archive layout: editorial header, timeline entries
 * and a plain-link pager. Used by /son-dakika, /kategori/[slug] and /yazar/[slug].
 */
export function ArchiveList({
  eyebrow,
  title,
  description,
  entries,
  basePath,
  currentPage,
  totalPages,
  total,
  loadError = false,
}: ArchiveListProps) {
  return (
    <div className={styles.block}>
      <div className="shell-container">
        <header className={styles.header}>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className={`font-editorial ${styles.title}`}>{title}</h1>
          {description ? <p className={styles.lede}>{description}</p> : null}
          {!loadError && (
            <p className={styles.count} role="status">
              {total > 0 ? `${total} haber listeleniyor.` : "Henüz yayınlanmış haber yok."}
            </p>
          )}
        </header>

        {loadError ? (
          <ArchiveErrorPanel />
        ) : entries.length > 0 ? (
          <>
            <div className={styles.entries}>
              {entries.map((entry) => (
                <ArticleCard article={entry} variant="timeline" key={`${entry.id}-${entry.slug}`} />
              ))}
            </div>
            <Pager basePath={basePath} currentPage={currentPage} totalPages={totalPages} />
          </>
        ) : (
          <section className="statePanel" role="status">
            <p className="eyebrow">Boş arşiv</p>
            <h2 className={`font-editorial ${styles.emptyHeading}`}>
              Bu sayfada henüz bir haber yok.
            </h2>
            <p>Yeni içerikler yayımlandığında burada listelenir.</p>
            <Link className="button button-primary" href="/">
              Ana sayfaya dön
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
