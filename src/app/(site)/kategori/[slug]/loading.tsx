import styles from "@/components/site/category-archive.module.css";

/**
 * `(site)/loading.tsx` serves `HomepageLoading` — a hero-carousel skeleton — to
 * every route beneath it, including this one, so a category page used to flash a
 * layout it never renders. This one matches what actually arrives: breadcrumbs,
 * masthead, feed rows, rail.
 *
 * Deliberately page-agnostic. A loading component takes no parameters (it cannot
 * read `sayfa`), so it cannot know whether the page it stands in for leads with a
 * feature card — only the first page does. Drawing one anyway put a 26rem block on
 * screen that `/kategori/gundem?sayfa=2` never renders, and the content then jumped
 * up by roughly that much on arrival. The shorter skeleton is wrong in the gentler
 * direction: the page only ever grows downwards from it.
 */
export default function Loading() {
  return (
    <div className={styles.block}>
      <div className="shell-container">
        <div className={styles.breadcrumbs} aria-hidden="true">
          <div className="skeleton" style={{ height: "0.7rem", width: "9rem" }} />
        </div>

        <div className={styles.mastheadCompact} aria-hidden="true">
          <div className="skeleton" style={{ height: "0.7rem", width: "7rem" }} />
          <div
            className="skeleton"
            style={{ height: "2.4rem", margin: "0.9rem 0 1rem", width: "min(100%, 22rem)" }}
          />
          <div className="skeleton" style={{ height: "1rem", width: "min(100%, 30rem)" }} />
        </div>

        <div className={styles.layout}>
          <div className={styles.content}>
            <div className={styles.feed}>
              {[0, 1, 2, 3].map((row) => (
                <div className="loading-card skeleton" key={row} style={{ height: "9.5rem" }} />
              ))}
            </div>
          </div>
          <div className={styles.rail}>
            {[0, 1].map((panel) => (
              <div className="skeleton" key={panel} style={{ height: "7rem" }} />
            ))}
          </div>
        </div>
      </div>
      {/* Kind-neutral: this route serves cities as well as topics, and announcing
          "Dosya yükleniyor" before a masthead reading "Şehir" contradicts itself. */}
      <span className="sr-only" role="status">
        Sayfa yükleniyor
      </span>
    </div>
  );
}
