import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { Clock } from "@phosphor-icons/react/dist/ssr/Clock";
import { MapPin } from "@phosphor-icons/react/dist/ssr/MapPin";
import { MegaphoneSimple } from "@phosphor-icons/react/dist/ssr/MegaphoneSimple";
import { NotePencil } from "@phosphor-icons/react/dist/ssr/NotePencil";
import type { ArticleBodyBlock, ArticleDetail as ArticleDetailType } from "@/lib/articles";
import { siteConfig } from "@/lib/site";
import { ArticleActions } from "@/components/site/article-actions";
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

function BodyBlock({ block, index }: { block: ArticleBodyBlock; index: number }) {
  if (block.type === "heading") {
    return <h2>{block.text}</h2>;
  }

  if (block.type === "quote") {
    return (
      <blockquote>
        <p>“{block.text}”</p>
        <cite>{block.attribution}</cite>
      </blockquote>
    );
  }

  return <p className={index === 0 ? styles.leadParagraph : undefined}>{block.text}</p>;
}

type ArticleDetailProps = {
  article: ArticleDetailType;
  /** Kaydet düğmesinin sunucudan gelen başlangıç durumu. */
  isSaved: boolean;
  isSignedIn: boolean;
};

export function ArticleDetail({ article, isSaved, isSignedIn }: ArticleDetailProps) {
  const articleUrl = new URL(`/haber/${article.slug}`, siteConfig.url).toString();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    mainEntityOfPage: articleUrl,
    image: [new URL(article.hero.src, siteConfig.url).toString()],
    author: {
      "@type": "Person",
      name: article.author.name,
      url: new URL(`/yazar/${article.author.slug}`, siteConfig.url).toString(),
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

      <header className={`${styles.articleHeader} shell-container`}>
        <div className={styles.breadcrumbs} aria-label="İçerik yolu">
          <Link href="/">Ana sayfa</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/kategori/${article.topicSlug}`}>{article.topic}</Link>
        </div>

        <div className={styles.headerGrid}>
          <div className={styles.titleBlock}>
            <div className={styles.storyLabels}>
              <span>{article.topic}</span>
              <span>
                <MapPin aria-hidden="true" size={14} weight="fill" /> {article.location}
              </span>
              {article.sponsored ? (
                <span>
                  <MegaphoneSimple aria-hidden="true" size={13} weight="fill" /> Sponsorlu içerik
                </span>
              ) : null}
            </div>
            <h1 className="font-editorial">{article.title}</h1>
            <p className={styles.summary}>{article.summary}</p>
          </div>

          <aside className={styles.storyMeta} aria-label="Haber bilgileri">
            <div>
              <span>Hazırlayan</span>
              <Link href={`/yazar/${article.author.slug}`}>{article.author.name}</Link>
              <small>{article.author.role}</small>
            </div>
            <div className={styles.timeMeta}>
              <Clock aria-hidden="true" size={18} weight="duotone" />
              <p>
                <time dateTime={article.publishedAt}>{article.publishedDisplay}</time>
                {article.updatedAt && article.updatedDisplay && (
                  <small>
                    Güncellendi: <time dateTime={article.updatedAt}>{article.updatedDisplay}</time>
                  </small>
                )}
                <small>{article.readingTime} okuma</small>
              </p>
            </div>
            <ArticleActions
              title={article.title}
              slug={article.slug}
              initialSaved={isSaved}
              isSignedIn={isSignedIn}
            />
          </aside>
        </div>
      </header>

      <figure className={`${styles.hero} shell-container`}>
        <div className={styles.heroImage}>
          <Image
            src={article.hero.src}
            alt={article.hero.alt}
            fill
            priority
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1280px) calc(100vw - 4rem), 1216px"
          />
        </div>
        <figcaption>
          <span>{article.hero.caption}</span>
          <small>{article.hero.credit}</small>
        </figcaption>
      </figure>

      <div className={`${styles.readingLayout} shell-container`}>
        <aside className={styles.readingAside}>
          <span className="eyebrow">Dosya</span>
          <p>Yerel üretim, mahalle ekonomisi ve gıda dayanışması üzerine.</p>
        </aside>

        <div className={styles.articleBody}>
          {article.body.map((block, index) => (
            <BodyBlock block={block} index={index} key={`${block.type}-${index}`} />
          ))}
          <AdSlot placement="ARTICLE_MID" />
        </div>
      </div>

      <section
        className={`${styles.correction} shell-container`}
        aria-labelledby="correction-title"
      >
        <NotePencil aria-hidden="true" size={24} weight="duotone" />
        <div>
          <span className="eyebrow">Şeffaflık notu</span>
          <h2 id="correction-title" className="font-editorial">
            Düzeltmeler
          </h2>
          <p>{article.correction}</p>
        </div>
      </section>

      <section className={`${styles.related} shell-container`} aria-labelledby="related-title">
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
