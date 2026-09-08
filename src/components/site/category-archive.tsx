import Link from "next/link";
import { ArticleCard } from "@/components/site/article-card";
import { Pager } from "@/components/site/archive-list";
import { NewsletterForm } from "@/components/site/newsletter-form";
import type { ArticlePreview, MediaTone } from "@/lib/homepage";
import type { SearchFacet, SearchFacets } from "@/lib/search";
import styles from "./category-archive.module.css";

export type CategoryArchiveViewProps = {
  eyebrow: string;
  title: string;
  description?: string | null;
  /** Topics and cities share one URL namespace; the rail marks the right chip. */
  kind: "topic" | "location";
  slug: string;
  tone: MediaTone;
  entries: ArticlePreview[];
  facets: SearchFacets;
  basePath: string;
  currentPage: number;
  totalPages: number;
  total: number;
  /** The archive query failed; say so rather than implying an empty archive. */
  loadError?: boolean;
};

const toneAccents: Record<MediaTone, string> = {
  teal: styles.accentTeal,
  ochre: styles.accentOchre,
  ink: styles.accentInk,
  sky: styles.accentSky,
  sage: styles.accentSage,
  coral: styles.accentCoral,
};

/**
 * Sentence-case and quiet, where the old archive header shouted
 * "2 HABER LİSTELENİYOR." in uppercase teal and read as debug output.
 */
function describeCount(total: number, totalPages: number): string {
  if (total === 0) return "Henüz yayınlanmış haber yok";
  return totalPages > 1 ? `${total} haber · ${totalPages} sayfa` : `${total} haber`;
}

function ChipGroup({
  heading,
  facets,
  activeSlug,
}: {
  heading: string;
  facets: SearchFacet[];
  activeSlug: string | null;
}) {
  if (facets.length === 0) return null;

  return (
    <section className={styles.railPanel}>
      <p className="eyebrow">{heading}</p>
      <div className={styles.chips}>
        {facets.map((facet) => {
          const isActive = facet.slug === activeSlug;
          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={isActive ? styles.chipCurrent : undefined}
              href={`/kategori/${facet.slug}`}
              key={facet.slug}
            >
              {facet.name}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/**
 * The `/kategori/[slug]` section front: a masthead, one lead story, a feed of
 * picture rows and a wayfinding rail.
 *
 * Deliberately not `ArchiveList`. That component still serves `/son-dakika` and
 * `/yazar/[slug]`, where a lead story and a rail of sibling categories would be
 * meaningless — a chronological feed of everything has no lead, and an author
 * page's siblings are authors, not topics.
 */
export function CategoryArchiveView({
  eyebrow,
  title,
  description,
  kind,
  slug,
  tone,
  entries,
  facets,
  basePath,
  currentPage,
  totalPages,
  total,
  loadError = false,
}: CategoryArchiveViewProps) {
  // A hero on page 4 of an archive is noise, not hierarchy: only the first page
  // leads with a story, and deeper pages compress the masthead to match.
  const isFirstPage = currentPage === 1;
  const [lead, ...rest] = entries;
  const feed = isFirstPage ? rest : entries;

  /*
   * No "Dosya hakkında" panel here. `describeArchive` always supplies a
   * description — a real one for topics, a generated sentence for cities — so a
   * rail panel repeating it printed the same sentence twice on one screen.
   */
  const rail = (
    <aside className={styles.rail} aria-label="Dosya ve şehir bağlantıları">
      <ChipGroup
        activeSlug={kind === "topic" ? slug : null}
        facets={facets.topics}
        heading="Diğer dosyalar"
      />
      <ChipGroup
        activeSlug={kind === "location" ? slug : null}
        facets={facets.locations}
        heading="Şehirler"
      />
      <section className={styles.railPanel}>
        <p className="eyebrow">Takipte kal</p>
        <p className={styles.railNote}>
          {title} dosyasındaki gelişmeleri haftalık bültenle alın.
        </p>
        <NewsletterForm idPrefix={`kategori-${slug}`} variant="compact" />
      </section>
    </aside>
  );

  return (
    <div className={styles.block}>
      <div className="shell-container">
        <nav className={styles.breadcrumbs} aria-label="İçerik yolu">
          <Link href="/">Ana sayfa</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>

        <header className={isFirstPage ? styles.masthead : styles.mastheadCompact}>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className={`font-editorial ${styles.title}`}>{title}</h1>
          {isFirstPage && description ? <p className={styles.lede}>{description}</p> : null}
          {!loadError && (
            <p className={styles.meta} role="status">
              {isFirstPage
                ? describeCount(total, totalPages)
                : `Sayfa ${currentPage} / ${totalPages} · ${total} haber`}
            </p>
          )}
          <span aria-hidden="true" className={`${styles.accent} ${toneAccents[tone]}`} />
        </header>

        {loadError ? (
          <div className={styles.layout}>
            <section className="statePanel" role="alert">
              <p className="eyebrow">Bağlantı kurulamadı</p>
              <h2 className={`font-editorial ${styles.stateHeading}`}>
                Haber akışına şu anda ulaşamıyoruz.
              </h2>
              <p>Sayfayı kısa bir süre sonra yeniden deneyebilirsiniz.</p>
              <Link className="button button-primary" href="/">
                Ana sayfaya dön
              </Link>
            </section>
            {rail}
          </div>
        ) : entries.length > 0 ? (
          <div className={styles.layout}>
            <div className={styles.content}>
              {isFirstPage && lead ? (
                <ArticleCard article={lead} priority variant="feature" key={lead.id} />
              ) : null}
              {feed.length > 0 ? (
                <div className={styles.feed}>
                  {feed.map((entry) => (
                    <ArticleCard article={entry} variant="list" key={`${entry.id}-${entry.slug}`} />
                  ))}
                </div>
              ) : null}
              <Pager basePath={basePath} currentPage={currentPage} totalPages={totalPages} />
            </div>
            {rail}
          </div>
        ) : (
          <div className={styles.layout}>
            {/* No `role="status"` here: the masthead's count is already the live
                region, and two of them announce over one another. */}
            <section className="statePanel">
              <p className="eyebrow">Boş arşiv</p>
              <h2 className={`font-editorial ${styles.stateHeading}`}>
                Bu dosyada henüz bir haber yok.
              </h2>
              <p>Yeni içerikler yayımlandığında burada listelenir. Bu arada diğer dosyalara
                göz atabilirsiniz.</p>
              <Link className="button button-primary" href="/">
                Ana sayfaya dön
              </Link>
            </section>
            {rail}
          </div>
        )}
      </div>
    </div>
  );
}
