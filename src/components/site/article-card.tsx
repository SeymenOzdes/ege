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
  // A 6.5rem gutter and an 8.5rem thumbnail, folding to 5.5rem on a phone.
  feed: "(max-width: 699px) 88px, 136px",
  // A `minmax(9rem, 15rem)` column, which goes full width once the row stacks.
  list: "(max-width: 699px) calc(100vw - 2rem), 240px",
  // Stacked in the hero rail on desktop; a picture column beside the text below it.
  secondary: "(max-width: 699px) 40vw, (max-width: 1023px) 45vw, 400px",
  // Never rendered — `timeline` drops its media entirely — but the map is total.
  timeline: DEFAULT_MEDIA_SIZES,
  // Two side stories per row from 700px, then a 0.85fr picture column at 1024px.
  topic: "(max-width: 699px) calc(100vw - 2rem), (max-width: 1023px) 50vw, 200px",
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

/**
 * The `feed` row's gutter date.
 *
 * `<time>` only when the preview carries an ISO timestamp: `publishedLabel` is a
 * reader's label — "14:32", "27 Ağustos" — which is not a valid datetime string, so
 * a `<time>` around it with no `dateTime` attribute is invalid HTML. The element is
 * rendered either way, empty label included, because the row is a three-column grid
 * and dropping the gutter cell would shift the picture into it.
 */
function CardDateline({ article }: { article: ArticlePreview }) {
  if (!article.publishedAt) {
    return <span className={styles.cardDateline}>{article.publishedLabel}</span>;
  }

  return (
    <time className={styles.cardDateline} dateTime={article.publishedAt}>
      {article.publishedLabel}
    </time>
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
      {variant === "feed" && <CardDateline article={article} />}
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
          <span>{article.location}</span>
        </div>
        <h3 className="font-editorial">
          <Link href={`/haber/${article.slug}`}>{article.title}</Link>
        </h3>
        {variant !== "secondary" &&
          (excerpt ?? (article.summary ? <p>{article.summary}</p> : null))}
        <div className={styles.articleFooter}>
          <span>
            {/* The `feed` row already carries the date in its gutter, and an
                article with no `published_at` has no date at all; neither should
                leave the separator behind. */}
            {variant !== "feed" && article.publishedLabel ? `${article.publishedLabel} · ` : null}
            {article.readingTime} okuma
          </span>
          {variant !== "feed" && <ArrowUpRight aria-hidden="true" size={17} weight="bold" />}
        </div>
      </div>
    </article>
  );
}
