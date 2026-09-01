import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import type { ArticleImage, ArticlePreview, MediaTone } from "@/lib/homepage";
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

/**
 * A card's picture. With a hero asset attached this is the real image; without one it
 * stays the coloured surface the design has always used, so a listing never shows a
 * hole where an article simply has no photograph yet.
 */
export function MediaSurface({
  tone,
  label,
  hero,
  priority = false,
  className = "",
}: {
  tone: MediaTone;
  label: string;
  hero?: ArticleImage;
  /** Set on the largest above-the-fold card so its image is not lazy-loaded. */
  priority?: boolean;
  className?: string;
}) {
  if (hero) {
    return (
      <div className={`${styles.mediaSurface} ${styles.mediaImage} ${className}`}>
        <Image
          alt={hero.alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1088px) 50vw, 480px"
          src={hero.src}
          style={{ objectFit: "cover", objectPosition: hero.objectPosition }}
        />
      </div>
    );
  }

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
  priority = false,
}: {
  article: ArticlePreview;
  variant?: ArticleCardVariant;
  /** Replaces the summary line. /arama passes the highlighted search excerpt. */
  excerpt?: ReactNode;
  priority?: boolean;
}) {
  return (
    <article className={`${styles.articleCard} ${styles[`articleCard${variant}`]}`}>
      {variant !== "timeline" && (
        <MediaSurface
          tone={article.mediaTone}
          label={article.location}
          hero={article.hero}
          priority={priority}
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
