import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { formatFullDate } from "@/lib/article-preview";
import type { ArticlePreview, HomepageContent } from "@/lib/homepage";
import { AdSlot } from "@/components/site/ad-slot";
import { ArticleCard, MediaSurface } from "@/components/site/article-card";
import { FeaturedCarousel } from "@/components/site/featured-carousel";
import { FeedNotice } from "@/components/site/feed-notice";
import styles from "./homepage.module.css";

function SectionHeading({
  eyebrow,
  title,
  href,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
}) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        {eyebrow && <span>{eyebrow}</span>}
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

function HeroCard({ article }: { article: ArticlePreview }) {
  return (
    <Link className={styles.heroCard} href={`/haber/${article.slug}`}>
      <MediaSurface
        tone={article.mediaTone}
        label={article.location}
        hero={article.hero}
        sizes="(max-width: 767px) calc(100vw - 2rem), 286px"
        className={styles.heroCardMedia}
      />
      <span className={styles.heroCardText}>
        <strong className={styles.heroCardTitle}>{article.title}</strong>
      </span>
    </Link>
  );
}

/** The newest story, badged "Son dakika" when it is actually breaking. */
function BreakingCard({ article, isBreaking }: { article: ArticlePreview; isBreaking: boolean }) {
  return (
    <Link className={styles.breakingCard} href={`/haber/${article.slug}`}>
      <span className={styles.breakingTop}>
        {isBreaking && (
          <span className={styles.breakingPill}>
            <span className={styles.breakingDot} aria-hidden="true" />
            Son dakika
          </span>
        )}
        <span className={styles.breakingTime}>{article.publishedLabel}</span>
      </span>
      <strong className={styles.breakingTitle}>{article.title}</strong>
    </Link>
  );
}

function HeroRail({ content }: { content: HomepageContent }) {
  const cardArticle = content.breakingNews ?? content.latest[0] ?? null;
  const stories = content.latest.filter((article) => article.id !== cardArticle?.id).slice(0, 4);

  return (
    <>
      {cardArticle && (
        <BreakingCard article={cardArticle} isBreaking={Boolean(content.breakingNews)} />
      )}
      <ul className={styles.rail}>
        {stories.map((article) => (
          <li key={article.id}>
            <Link className={styles.railItem} href={`/haber/${article.slug}`}>
              <MediaSurface
                tone={article.mediaTone}
                label={article.location}
                hero={article.hero}
                sizes="104px"
                className={styles.railThumb}
              />
              <span className={styles.railText}>
                <span className={styles.railTitle}>{article.title}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * The reader-ranked grid under the hero: nine stories, three across, with the
 * rank drawn as a large numeral. The data comes from `view_count`, so it is the
 * one list on the page whose order has nothing to do with publication time.
 */
function MostRead({ articles }: { articles: ArticlePreview[] }) {
  if (articles.length === 0) return null;

  return (
    <section className={styles.mostRead} aria-labelledby="en-cok-okunanlar-baslik">
      <div className={styles.mostReadRule} aria-hidden="true" />
      <h2 className={styles.mostReadHeading} id="en-cok-okunanlar-baslik">
        En Çok Okunanlar
      </h2>
      <ol className={styles.mostReadList}>
        {articles.map((article, index) => (
          <li className={styles.mostReadItem} key={article.id}>
            <Link className={styles.mostReadLink} href={`/haber/${article.slug}`}>
              {/* The numeral is decoration: the list itself already carries the order. */}
              <span className={styles.mostReadNumber} aria-hidden="true">
                {index + 1}
              </span>
              <span className={styles.mostReadTitle}>{article.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
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
              <time dateTime={spotlight.publishedAt}>{formatFullDate(spotlight.publishedAt)}</time>
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
        <section className={styles.hero} aria-label="Günün öne çıkan haberleri">
          <div className={styles.heroCenter}>
            <FeaturedCarousel slides={content.featured} />
          </div>
          <div className={styles.heroLeft}>
            {content.secondary.slice(0, 2).map((article) => (
              <HeroCard article={article} key={article.id} />
            ))}
          </div>
          <div className={styles.heroRight}>
            <HeroRail content={content} />
          </div>
        </section>

        <MostRead articles={content.mostRead} />

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
