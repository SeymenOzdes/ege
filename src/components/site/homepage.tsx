import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { BellRinging } from "@phosphor-icons/react/dist/ssr/BellRinging";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { formatFullDate } from "@/lib/article-preview";
import type { ArticlePreview, HomepageContent } from "@/lib/homepage";
import { ArticleCard, MediaSurface } from "@/components/site/article-card";
import { FeaturedCarousel } from "@/components/site/featured-carousel";
import { FeedNotice } from "@/components/site/feed-notice";
import styles from "./homepage.module.css";

function SectionHeading({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        <span>{eyebrow}</span>
        <h2 className="font-editorial">{title}</h2>
      </div>
      {href && (
        <Link href={href}>
          Tümünü gör <ArrowRight aria-hidden="true" size={17} weight="bold" />
        </Link>
      )}
    </div>
  );
}

function BreakingRibbon({ article }: { article: ArticlePreview }) {
  return (
    <aside className={styles.breakingRibbon} aria-label="Son dakika">
      <span className={styles.breakingLabel}>
        <BellRinging aria-hidden="true" size={18} weight="fill" />
        Son dakika
      </span>
      <Link href={`/haber/${article.slug}`}>{article.title}</Link>
      <span className={styles.breakingTime}>{article.publishedLabel}</span>
    </aside>
  );
}

function AdSlot({ placement, compact = false }: { placement: string; compact?: boolean }) {
  return (
    <aside className={`${styles.adSlot} ${compact ? styles.adSlotCompact : ""}`}>
      <span>Reklam</span>
      <p>
        {placement === "HOME_LEADER"
          ? "Ege'nin yerel markaları için seçkin alan"
          : "Sponsorlu içerik alanı"}
      </p>
      <small>{placement}</small>
    </aside>
  );
}

/**
 * The newsletter panel's picture: the newest story that has a photograph. A
 * coloured placeholder would read as a hole on the dark panel, so with no
 * photographed story at all the panel drops the card and the form takes the row.
 */
function newsletterSpotlight(content: HomepageContent): ArticlePreview | undefined {
  return [...content.latest, ...content.featured, ...content.secondary].find(
    (article) => article.hero,
  );
}

function NewsletterPanel({ spotlight }: { spotlight?: ArticlePreview }) {
  return (
    <section className={styles.newsletter} aria-labelledby="anasayfa-bulten-baslik">
      <div className={styles.newsletterBody}>
        <h2 className="font-editorial" id="anasayfa-bulten-baslik">
          Ege&apos;nin hikâyeleri gelen kutunuzda
        </h2>
        <p>Haftada bir kez; seçilmiş haberler, kültür rotaları ve yerel yaşam notları.</p>
        <NewsletterForm idPrefix="anasayfa-bulten" variant="inline" />
      </div>

      {spotlight && (
        <Link className={styles.newsletterSpotlight} href={`/haber/${spotlight.slug}`}>
          <MediaSurface
            tone={spotlight.mediaTone}
            label={spotlight.location}
            hero={spotlight.hero}
            sizes="(max-width: 1023px) calc(100vw - 4rem), 500px"
            className={styles.newsletterSpotlightMedia}
          />
          <span className={styles.newsletterSpotlightText}>
            <strong className="font-editorial">{spotlight.title}</strong>
            {spotlight.publishedAt && (
              <time dateTime={spotlight.publishedAt}>
                {formatFullDate(spotlight.publishedAt)}
              </time>
            )}
          </span>
        </Link>
      )}
    </section>
  );
}

export function HomepageState({ state }: { state: "empty" | "error" }) {
  // The error case is the site-wide feed notice; the route reaches it by throwing
  // into `(site)/error.tsx`, and the style guide renders it through here.
  if (state === "error") return <FeedNotice headingLevel="h1" standalone />;

  return (
    <section className={styles.statePanel} role="status">
      <Sparkle aria-hidden="true" size={24} weight="fill" />
      <p className="eyebrow">Yeni içerik hazırlanıyor</p>
      <h1 className="font-editorial">Ege&apos;den yeni hikâyeler birazdan burada.</h1>
      <p>Editörlerimiz günün öne çıkan gelişmelerini hazırlıyor.</p>
    </section>
  );
}

export function HomepageLoading() {
  return (
    <div className={styles.homeLoading} aria-label="Ana sayfa yükleniyor" role="status">
      <div className={styles.loadingRibbon} />
      <div className={styles.loadingHero}>
        <div />
        <div />
      </div>
      <span className="sr-only">İçerik yükleniyor</span>
    </div>
  );
}

export function Homepage({ content }: { content: HomepageContent }) {
  if (content.featured.length === 0) return <HomepageState state="empty" />;

  return (
    <div className={styles.home}>
      <div className="shell-container">
        {content.breakingNews && <BreakingRibbon article={content.breakingNews} />}

        <section className={styles.heroGrid} aria-label="Günün öne çıkan haberleri">
          <FeaturedCarousel slides={content.featured} />
          <div className={styles.secondaryStories}>
            {content.secondary.map((article) => (
              <ArticleCard article={article} variant="secondary" key={article.id} />
            ))}
          </div>
        </section>

        <AdSlot placement="HOME_LEADER" />

        <section className={styles.latestSection}>
          <SectionHeading
            eyebrow="Dakika dakika"
            title="Ege'den son gelişmeler"
            href="/son-dakika"
          />
          <div className={styles.latestFeed}>
            {content.latest.map((article) => (
              <ArticleCard article={article} variant="feed" key={article.id} />
            ))}
          </div>
        </section>

        <div className={styles.topicSections}>
          {content.topicSections.map((section, index) => (
            <section
              className={`${styles.topicSection} ${index % 2 === 1 ? styles.topicSectionReverse : ""}`}
              key={section.slug}
            >
              <SectionHeading
                eyebrow="Bölgesel dosya"
                title={section.name}
                href={`/kategori/${section.slug}`}
              />
              <div className={styles.topicLayout}>
                <ArticleCard article={section.lead} variant="feature" />
                <div className={styles.topicSideStories}>
                  {section.stories.map((article) => (
                    <ArticleCard
                      article={article}
                      variant="topic"
                      key={`${section.slug}-${article.id}`}
                    />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        <NewsletterPanel spotlight={newsletterSpotlight(content)} />

        <AdSlot placement="HOME_INLINE" compact />
      </div>
    </div>
  );
}
