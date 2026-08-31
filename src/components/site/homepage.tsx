import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { BellRinging } from "@phosphor-icons/react/dist/ssr/BellRinging";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
import type { ArticlePreview, HomepageContent } from "@/lib/homepage";
import { ArticleCard } from "@/components/site/article-card";
import { FeaturedCarousel } from "@/components/site/featured-carousel";
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

export function HomepageState({ state }: { state: "empty" | "error" }) {
  const isError = state === "error";

  return (
    <section className={styles.statePanel} role={isError ? "alert" : "status"}>
      <Sparkle aria-hidden="true" size={24} weight="fill" />
      <p className="eyebrow">{isError ? "Bağlantı kurulamadı" : "Yeni içerik hazırlanıyor"}</p>
      <h1 className="font-editorial">
        {isError
          ? "Haber akışına şu anda ulaşamıyoruz."
          : "Ege'den yeni hikâyeler birazdan burada."}
      </h1>
      <p>
        {isError
          ? "Sayfayı kısa bir süre sonra yeniden deneyebilirsiniz."
          : "Editörlerimiz günün öne çıkan gelişmelerini hazırlıyor."}
      </p>
      {isError && (
        <Link className="button button-primary" href="/">
          Yeniden dene
        </Link>
      )}
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
        <BreakingRibbon article={content.breakingNews} />

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
          <div className={styles.latestLayout}>
            <div className={styles.latestTimeline}>
              {content.latest.map((article) => (
                <ArticleCard article={article} variant="timeline" key={article.id} />
              ))}
            </div>
            <aside className={styles.editorNote}>
              <span className="eyebrow">Editörün notu</span>
              <h3 className="font-editorial">Günün gündemini gürültüden ayırıyoruz.</h3>
              <p>
                Ege&apos;nin şehirlerinden, kıyılarından ve üretim alanlarından seçilmiş gelişmeler;
                kısa, anlaşılır ve güvenilir bir akışta.
              </p>
              <Link href="/kunye">
                Yayın yaklaşımımız <ArrowRight aria-hidden="true" size={16} weight="bold" />
              </Link>
            </aside>
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

        <section className={styles.newsletter}>
          <div className={styles.newsletterIcon}>
            <EnvelopeSimple aria-hidden="true" size={30} weight="duotone" />
          </div>
          <div>
            <span className="eyebrow">Haftalık Ege mektubu</span>
            <h2 className="font-editorial">Bölgenin önemli hikâyeleri doğrudan gelen kutunda.</h2>
            <p>Haftada bir kez; seçilmiş haberler, kültür rotaları ve yerel yaşam notları.</p>
          </div>
          <NewsletterForm idPrefix="anasayfa-bulten" variant="compact" />
        </section>

        <AdSlot placement="HOME_INLINE" compact />
      </div>
    </div>
  );
}
