import styles from "@/components/site/category-archive.module.css";

/**
 * `(site)/loading.tsx` serves `HomepageLoading` — a hero-carousel skeleton — to
 * every route beneath it, including this one, so a category page used to flash a
 * layout it never renders. This one matches what actually arrives: masthead,
 * lead story, feed rows, rail.
 */
export default function Loading() {
  return (
    <div className={styles.block}>
      <div className="shell-container">
        <div className={styles.masthead} aria-hidden="true">
          <div className="skeleton" style={{ height: "0.7rem", width: "7rem" }} />
          <div className="skeleton" style={{ height: "3.4rem", margin: "0.9rem 0 1rem", width: "min(100%, 22rem)" }} />
          <div className="skeleton" style={{ height: "1rem", width: "min(100%, 30rem)" }} />
        </div>

        <div className={styles.layout}>
          <div className={styles.content}>
            <div className="loading-card skeleton" style={{ height: "26rem" }} />
            <div className={styles.feed}>
              {[0, 1, 2].map((row) => (
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
      <span className="sr-only" role="status">
        Dosya yükleniyor
      </span>
    </div>
  );
}
