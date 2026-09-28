import styles from "./feed-notice.module.css";

/**
 * What a reader sees when the news feed cannot be read.
 *
 * Written as a printed paper's notice to its readers rather than as an app error:
 * one plain heading and one sentence between rules. The front page rarely reaches
 * it — a failed revalidation keeps serving the last good render — so this is the
 * cold-cache and archive case.
 */
export function FeedNotice({
  headingLevel: Heading = "h2",
  standalone = false,
}: {
  headingLevel?: "h1" | "h2";
  standalone?: boolean;
}) {
  return (
    <section
      className={standalone ? `${styles.notice} ${styles.standalone}` : styles.notice}
      role="alert"
    >
      <Heading className={`font-editorial ${styles.heading}`}>
        Haber akışı şu anda güncellenemiyor.
      </Heading>
      <p className={styles.body}>
        Bağlantıda geçici bir sorun var. Birkaç dakika içinde yeniden deneyebilirsiniz.
      </p>
    </section>
  );
}
