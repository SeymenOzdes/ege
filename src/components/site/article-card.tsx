import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatMonthYear } from "@/lib/article-preview";
import type { ArticleImage, ArticlePreview, MediaTone } from "@/lib/homepage";
import styles from "./homepage.module.css";

/**
 * `list` is the archive feed row: media on the left, text on the right. It needs
 * no branch of its own below — it is not `timeline`, so it keeps its picture, and
 * not `secondary`, so it keeps its summary.
 *
 * `feed` is the homepage "son gelişmeler" row: a small thumbnail, then the text.
 * It drops the city from its kicker and the summary, and its footer shows month
 * and year instead of the reading time.
 *
 * `result` is the /arama row: text on the left, a small 4:3 thumbnail on the
 * right. Topic, city and date share one kicker line, so it has no footer — the
 * reading time says nothing when a reader is picking between matches.
 */
export type ArticleCardVariant =
  "feature" | "feed" | "list" | "result" | "secondary" | "timeline" | "topic";

const toneClasses: Record<MediaTone, string> = {
  teal: styles.mediaTeal,
  ochre: styles.mediaOchre,
  ink: styles.mediaInk,
  sky: styles.mediaSky,
  sage: styles.mediaSage,
  coral: styles.mediaCoral,
  plum: styles.mediaPlum,
};

/** What a card-sized image is worth downloading, unless the caller knows better. */
const DEFAULT_MEDIA_SIZES =
  "(max-width: 640px) calc(100vw - 2rem), (max-width: 1088px) 50vw, 480px";

/**
 * What each variant's picture actually measures, so `next/image` fetches that and
 * not a card-shaped guess. Kept as one map rather than a ternary at the call site:
 * the sizes are as much a part of a variant's definition as its stylesheet block is,
 * and a variant added without an entry here is a type error rather than a silent
 * fall-through to the default.
 *
 * Widths come from the grid columns in `homepage.module.css`; the shell caps at
 * 76rem, so the desktop figures are absolute pixels rather than viewport fractions.
 */
const MEDIA_SIZES: Record<ArticleCardVariant, string> = {
  // Full width of the feature column: the topic layout's 1.4fr, or the archive's
  // content column beside a 20rem rail.
  feature: "(max-width: 699px) calc(100vw - 2rem), (max-width: 1023px) calc(100vw - 4rem), 860px",
  // An 11rem thumbnail, folding to 5.5rem on a phone.
  feed: "(max-width: 699px) 88px, 176px",
  // A `minmax(9rem, 15rem)` column, which goes full width once the row stacks.
  list: "(max-width: 699px) calc(100vw - 2rem), 240px",
  // A 10rem thumbnail, folding to 6rem on a phone.
  result: "(max-width: 699px) 96px, 160px",
  // Stacked in the hero rail on desktop; a picture column beside the text below it.
  secondary: "(max-width: 699px) 40vw, (max-width: 1023px) 45vw, 400px",
  // Never rendered — `timeline` drops its media entirely — but the map is total.
  timeline: DEFAULT_MEDIA_SIZES,
  // Two side stories per row from 700px, then stacked full width in a ~22rem rail.
  topic: "(max-width: 699px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 400px",
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
      {variant !== "timeline" && (
        <MediaSurface
          tone={article.mediaTone}
          label={article.location}
          hero={article.hero}
          priority={priority}
          sizes={MEDIA_SIZES[variant]}
          className={styles.cardMedia}
        />
      )}
      <div className={styles.articleCardContent}>
        <div className={styles.articleMetaTop}>
          <span>{article.topic}</span>
          {variant !== "feed" && <span>{article.location}</span>}
          {variant === "result" && article.publishedLabel ? (
            <time dateTime={article.publishedAt}>{article.publishedLabel}</time>
          ) : null}
        </div>
        <h3 className="font-editorial">
          <Link href={`/haber/${article.slug}`}>{article.title}</Link>
        </h3>
        {variant !== "secondary" &&
          variant !== "feed" &&
          (excerpt ?? (article.summary ? <p>{article.summary}</p> : null))}
        {variant !== "result" && (
          <div className={styles.articleFooter}>
            {variant === "feed" ? (
              // The feed row trades the reading time for a plain month and year.
              article.publishedAt ? (
                <time className={styles.cardMonthYear} dateTime={article.publishedAt}>
                  {formatMonthYear(article.publishedAt)}
                </time>
              ) : null
            ) : (
              <span>
                {/* An article with no `published_at` has no date at all; it should
                    not leave the separator behind. */}
                {article.publishedLabel ? `${article.publishedLabel} · ` : null}
                {article.readingTime} okuma
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
