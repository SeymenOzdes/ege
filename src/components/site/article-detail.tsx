import Image from "next/image";
import Link from "next/link";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import { NotePencil } from "@phosphor-icons/react/dist/ssr/NotePencil";
import type { ArticleDetail as ArticleDetailType } from "@/lib/articles";
import { siteConfig } from "@/lib/site";
import { MediaSurface } from "@/components/site/article-card";
import { ArticleActions } from "@/components/site/article-actions";
import { BodyBlock } from "@/components/site/article-body";
import styles from "./article-detail.module.css";

function AdSlot({ placement }: { placement: "ARTICLE_MID" }) {
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
        <div className={styles.titleBlock}>
          <h1 className="font-editorial">{article.title}</h1>
          <p className={styles.summary}>{article.summary}</p>

          {/* Künyenin tamamı sayfa sonunda; başlıkta yalnızca tazelik sinyali kalıyor. */}
          <p className={styles.headerMeta}>
            <Clock aria-hidden="true" size={15} weight="duotone" />
            <time dateTime={article.publishedAt}>{article.publishedDisplay}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readingTime} okuma</span>
          </p>
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
        <div className={styles.articleBody}>
          {article.body.map((block, index) => (
            <BodyBlock block={block} index={index} key={`${block.type}-${index}`} />
          ))}
        </div>

        {/* Künye haberin parçası: okuma sütununda, son paragrafın hemen altında
            tek satır. Yayın saati başlıkta zaten var; burada yalnız güncelleme. */}
        <footer className={styles.byline} aria-label="Haber künyesi">
          <p className={styles.bylineLine}>
            {/* An article with no author row falls back to a blank slug, so the
                link would land on /yazar/ — a 404. Mirrors the JSON-LD guard above. */}
            {article.author.slug ? (
              <Link className={styles.bylineName} href={`/yazar/${article.author.slug}`}>
                {article.author.name}
              </Link>
            ) : (
              <span className={styles.bylineName}>{article.author.name}</span>
            )}
            <span className={styles.bylineRole}>{article.author.role}</span>
            {article.updatedAt && article.updatedDisplay && (
              <span className={styles.bylineUpdated}>
                Güncellendi <time dateTime={article.updatedAt}>{article.updatedDisplay}</time>
              </span>
            )}
          </p>
          <ArticleActions title={article.title} slug={article.slug} />
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

        <AdSlot placement="ARTICLE_MID" />
      </div>

      {/* İlgili haberler: her kartta yalnız görsel ve başlık. */}
      {article.related.length > 0 && (
        <section className={styles.related} aria-labelledby="related-title">
          <div className={styles.relatedInner}>
            <h2 id="related-title" className={`font-editorial ${styles.relatedHeading}`}>
              Okumaya devam
            </h2>
            <div className={styles.relatedList}>
              {article.related.map((relatedArticle) => (
                <article key={relatedArticle.id}>
                  <MediaSurface
                    tone={relatedArticle.mediaTone}
                    label={relatedArticle.location}
                    hero={relatedArticle.hero}
                    sizes="(max-width: 759px) calc(100vw - 2rem), 320px"
                    className={styles.relatedMedia}
                  />
                  <h3 className="font-editorial">
                    <Link href={`/haber/${relatedArticle.slug}`}>{relatedArticle.title}</Link>
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
