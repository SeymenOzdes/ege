import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import type { ArticleImage, ArticlePreview, MediaTone } from "@/lib/homepage";
import styles from "./homepage.module.css";

/**
 * `list` is the archive feed row: media on the left, text on the right. It needs
 * no branch of its own below — it is not `timeline`, so it keeps its picture, and
 * not `secondary`, so it keeps its summary.
 *
 * `feed` is the homepage "son gelişmeler" row: a dateline gutter, then a small
 * thumbnail, then the text. It is the one variant that leads with the date, so it
 * does need branches — the gutter has to be a grid child of the card itself, and
 * the footer must stop repeating a date the row already shows.
 */
export type ArticleCardVariant = "feature" | "feed" | "list" | "secondary" | "timeline" | "topic";

const toneClasses: Record<MediaTone, string> = {
  teal: styles.mediaTeal,
  ochre: styles.mediaOchre,
  ink: styles.mediaInk,
  sky: styles.mediaSky,
  sage: styles.mediaSage,
  coral: styles.mediaCoral,
};

/** What a card-sized image is worth downloading, unless the variant knows better. */
const DEFAULT_MEDIA_SIZES = "(max-width: 640px) calc(100vw - 2rem), (max-width: 1088px) 50vw, 480px";

/** The `feed` row's thumbnail is a fixed 8.5rem column, half that on a phone. */
const FEED_MEDIA_SIZES = "(max-width: 699px) 88px, 136px";

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
  sizes = DEFAULT_MEDIA_SIZES,
  className = "",
}: {
  tone: MediaTone;
  label: string;
  hero?: ArticleImage;
  /** Set on the largest above-the-fold card so its image is not lazy-loaded. */
  priority?: boolean;
  /** Override for variants whose media is far narrower than a full-width card. */
  sizes?: string;
  className?: string;
}) {
  if (hero) {
    return (
      <div className={`${styles.mediaSurface} ${styles.mediaImage} ${className}`}>
        <Image
          alt={hero.alt}
          fill
          priority={priority}
          sizes={sizes}
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
      {variant === "feed" && <time className={styles.cardDateline}>{article.publishedLabel}</time>}
      {variant !== "timeline" && (
        <MediaSurface
          tone={article.mediaTone}
          label={article.location}
          hero={article.hero}
          priority={priority}
          sizes={variant === "feed" ? FEED_MEDIA_SIZES : undefined}
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
            {variant !== "feed" && `${article.publishedLabel} · `}
            {article.readingTime} okuma
          </span>
          {variant !== "feed" && <ArrowUpRight aria-hidden="true" size={17} weight="bold" />}
        </div>
      </div>
    </article>
  );
}
