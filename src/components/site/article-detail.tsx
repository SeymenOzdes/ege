import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import { MapPin } from "@phosphor-icons/react/dist/ssr/MapPin";
import { NotePencil } from "@phosphor-icons/react/dist/ssr/NotePencil";
import type { ArticleDetail as ArticleDetailType } from "@/lib/articles";
import { siteConfig } from "@/lib/site";
import { ArticleActions } from "@/components/site/article-actions";
import { BodyBlock } from "@/components/site/article-body";
import styles from "./article-detail.module.css";

function AdSlot({ placement }: { placement: "ARTICLE_MID" | "ARTICLE_END" }) {
  return (
    <aside className={styles.adSlot} aria-label="Reklam alanı">
      <span>Reklam</span>
      <p>Ege&apos;nin yerel markaları için ayrılmış sade yayın alanı</p>
      <small>{placement}</small>
    </aside>
  );
}

export function ArticleDetail({ article }: { article: ArticleDetailType }) {
  const articleUrl = new URL(`/haber/${article.slug}`, siteConfig.url).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    mainEntityOfPage: articleUrl,
    // `JSON.stringify` drops undefined members, so an article without a hero
    // simply omits `image` rather than emitting a broken URL.
    image: article.hero ? [new URL(article.hero.src, siteConfig.url).toString()] : undefined,
    author: {
      "@type": "Person",
      name: article.author.name,
      url: article.author.slug
        ? new URL(`/yazar/${article.author.slug}`, siteConfig.url).toString()
        : undefined,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <article className={styles.articlePage}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className={styles.articleHeader}>
        <div className={styles.breadcrumbs} aria-label="İçerik yolu">
          <Link href="/">Ana sayfa</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/kategori/${article.topicSlug}`}>{article.topic}</Link>
        </div>

        <div className={styles.titleBlock}>
          <div className={styles.storyLabels}>
            <span>{article.topic}</span>
            <span>
              <MapPin aria-hidden="true" size={14} weight="fill" /> {article.location}
            </span>
          </div>
          <h1 className="font-editorial">{article.title}</h1>
          <p className={styles.summary}>{article.summary}</p>

          {/* Künyenin tamamı sayfa sonunda; başlıkta yalnızca tazelik sinyali kalıyor. */}
          <p className={styles.headerMeta}>
            <Clock aria-hidden="true" size={15} weight="duotone" />
            <time dateTime={article.publishedAt}>{article.publishedDisplay}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readingTime} okuma</span>
          </p>

          <ArticleActions title={article.title} slug={article.slug} />
        </div>
      </header>

      {article.hero && (
        <figure className={styles.hero}>
          <div className={styles.heroImage}>
            <Image
              src={article.hero.src}
              alt={article.hero.alt}
              fill
              priority
              sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1088px) calc(100vw - 4rem), 1024px"
              style={{ objectFit: "cover", objectPosition: article.hero.objectPosition }}
            />
          </div>
          {/* Caption and credit are optional on the asset; an empty figcaption would
              otherwise leave a stray gap under every uncredited photograph. */}
          {(article.hero.caption || article.hero.credit) && (
            <figcaption>
              {article.hero.caption ? <span>{article.hero.caption}</span> : null}
              {article.hero.credit ? <small>{article.hero.credit}</small> : null}
            </figcaption>
          )}
        </figure>
      )}

      <div className={styles.readingLayout}>
        {article.topicDescription && (
          <aside className={styles.readingAside}>
            <span className="eyebrow">Dosya</span>
            <p>{article.topicDescription}</p>
          </aside>
        )}

        <div className={styles.articleBody}>
          {article.body.map((block, index) => (
            <BodyBlock block={block} index={index} key={`${block.type}-${index}`} />
          ))}
          <AdSlot placement="ARTICLE_MID" />
        </div>
      </div>

      <footer className={styles.byline} aria-labelledby="byline-title">
        <div className={styles.bylineAuthor}>
          <span className="eyebrow" id="byline-title">
            Hazırlayan
          </span>
          <Link href={`/yazar/${article.author.slug}`}>{article.author.name}</Link>
          <small>{article.author.role}</small>
        </div>
        <dl className={styles.bylineTimes}>
          <div>
            <dt>Yayımlandı</dt>
            <dd>
              <time dateTime={article.publishedAt}>{article.publishedDisplay}</time>
            </dd>
          </div>
          {article.updatedAt && article.updatedDisplay && (
            <div>
              <dt>Son güncelleme</dt>
              <dd>
                <time dateTime={article.updatedAt}>{article.updatedDisplay}</time>
              </dd>
            </div>
          )}
          <div>
            <dt>Okuma süresi</dt>
            <dd>{article.readingTime}</dd>
          </div>
        </dl>
      </footer>

      {article.correction && (
        <section className={styles.correction} aria-labelledby="correction-title">
          <NotePencil aria-hidden="true" size={24} weight="duotone" />
          <div>
            <span className="eyebrow">Şeffaflık notu</span>
            <h2 id="correction-title" className="font-editorial">
              Düzeltmeler
            </h2>
            <p>{article.correction}</p>
          </div>
        </section>
      )}

      <section className={styles.related} aria-labelledby="related-title">
        <div className={styles.relatedHeading}>
          <div>
            <span className="eyebrow">Okumaya devam</span>
            <h2 id="related-title" className="font-editorial">
              İlgili hikâyeler
            </h2>
          </div>
          <Link href={`/kategori/${article.topicSlug}`}>
            Yaşam dosyası <ArrowRight aria-hidden="true" size={17} weight="bold" />
          </Link>
        </div>
        <div className={styles.relatedList}>
          {article.related.map((relatedArticle) => (
            <article key={relatedArticle.id}>
              <div>
                <span>{relatedArticle.topic}</span>
                <span>{relatedArticle.location}</span>
              </div>
              <h3 className="font-editorial">
                <Link href={`/haber/${relatedArticle.slug}`}>{relatedArticle.title}</Link>
              </h3>
              <p>{relatedArticle.summary}</p>
              <small>
                {relatedArticle.publishedLabel} · {relatedArticle.readingTime} okuma
              </small>
            </article>
          ))}
        </div>
        <AdSlot placement="ARTICLE_END" />
      </section>
    </article>
  );
}
