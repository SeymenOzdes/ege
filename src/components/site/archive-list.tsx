import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ArticleCard } from "@/components/site/article-card";
import type { ArticlePreview } from "@/lib/homepage";
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
};

function pagerHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?sayfa=${page}`;
}

function Pager({
  basePath,
  currentPage,
  totalPages,
}: Pick<ArchiveListProps, "basePath" | "currentPage" | "totalPages">) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className={styles.pager} aria-label="Sayfalama">
      {currentPage > 1 ? (
        <Link className={styles.pagerArrow} href={pagerHref(basePath, currentPage - 1)} rel="prev">
          <ArrowLeft aria-hidden="true" size={16} weight="bold" />
          Önceki sayfa
        </Link>
      ) : null}

      {pages.map((page) =>
        page === currentPage ? (
          <span
            aria-current="page"
            className={`${styles.pageLink} ${styles.pageLinkCurrent}`}
            key={page}
          >
            {page}
          </span>
        ) : (
          <Link className={styles.pageLink} href={pagerHref(basePath, page)} key={page}>
            {page}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link className={styles.pagerArrow} href={pagerHref(basePath, currentPage + 1)} rel="next">
          Sonraki sayfa
          <ArrowRight aria-hidden="true" size={16} weight="bold" />
        </Link>
      ) : null}
    </nav>
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
}: ArchiveListProps) {
  return (
    <div className={styles.block}>
      <div className="shell-container">
        <header className={styles.header}>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className={`font-editorial ${styles.title}`}>{title}</h1>
          {description ? <p className={styles.lede}>{description}</p> : null}
          <p className={styles.count} role="status">
            {total > 0 ? `${total} haber listeleniyor.` : "Henüz yayınlanmış haber yok."}
          </p>
        </header>

        {entries.length > 0 ? (
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
            <h2 className={`font-editorial ${styles.emptyHeading}`}>Bu sayfada henüz bir haber yok.</h2>
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
