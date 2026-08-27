import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import type { ArticlePreview, MediaTone } from "@/lib/homepage";
import styles from "./homepage.module.css";

export type ArticleCardVariant = "feature" | "secondary" | "timeline" | "topic";

const toneClasses: Record<MediaTone, string> = {
  teal: styles.mediaTeal,
  ochre: styles.mediaOchre,
  ink: styles.mediaInk,
  sky: styles.mediaSky,
  sage: styles.mediaSage,
  coral: styles.mediaCoral,
};

export function MediaSurface({
  tone,
  label,
  className = "",
}: {
  tone: MediaTone;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`${styles.mediaSurface} ${toneClasses[tone]} ${className}`}
      role="img"
      aria-label={`${label} için görsel alanı`}
    >
      <span>{label}</span>
    </div>
  );
}

export function ArticleCard({
  article,
  variant = "topic",
  excerpt,
}: {
  article: ArticlePreview;
  variant?: ArticleCardVariant;
  /** Replaces the summary line. /arama passes the highlighted search excerpt. */
  excerpt?: ReactNode;
}) {
  return (
    <article className={`${styles.articleCard} ${styles[`articleCard${variant}`]}`}>
      {variant !== "timeline" && (
        <MediaSurface
          tone={article.mediaTone}
          label={article.location}
          className={styles.cardMedia}
        />
      )}
      <div className={styles.articleCardContent}>
        <div className={styles.articleMetaTop}>
          <span>{article.topic}</span>
          <span>{article.location}</span>
        </div>
        <h3 className="font-editorial">
          <Link href={`/haber/${article.slug}`}>{article.title}</Link>
        </h3>
        {variant !== "secondary" &&
          (excerpt ?? (article.summary ? <p>{article.summary}</p> : null))}
        <div className={styles.articleFooter}>
          <span>
            {article.publishedLabel} · {article.readingTime} okuma
          </span>
          <ArrowUpRight aria-hidden="true" size={17} weight="bold" />
        </div>
      </div>
    </article>
  );
}
