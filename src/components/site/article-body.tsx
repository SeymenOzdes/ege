import type { ReactNode } from "react";
import { isExternalHref, sanitizeHref } from "@/lib/article-links";
import type { ArticleBodyBlock, ArticleInlineSpan } from "@/lib/articles";
import styles from "./article-detail.module.css";

/**
 * Gövde bloklarının tipografisini taşıyan sarmalayıcı sınıf. `.articleBody > p`,
 * `.articleBody h2` ve `.articleBody blockquote` kuralları bu sınıfa bağlı, bu
 * yüzden blokları çizen her yüzey aynı sarmalayıcıyı kullanmalı.
 */
export const articleBodyClassName = styles.articleBody;

/**
 * Tek bir biçimli metin parçası.
 *
 * Adres burada bir kez daha süzülüyor. `parseArticleBody` ve
 * `tiptapDocToBlocks` zaten süzüyor ama bu bileşen `href`'i doğrudan DOM'a
 * yazan son halka; süzgecin burada da durması, çağıranlardan biri değişse bile
 * `javascript:` bir adresin sayfaya ulaşmayacağını garanti ediyor.
 */
function InlineSpan({ span }: { span: ArticleInlineSpan }) {
  let node: ReactNode = span.text;

  if (span.bold) node = <strong>{node}</strong>;
  if (span.italic) node = <em>{node}</em>;
  if (span.underline) node = <u>{node}</u>;
  if (span.strike) node = <s>{node}</s>;

  const href = sanitizeHref(span.href);
  if (href !== undefined) {
    node = (
      <a href={href} rel="noopener noreferrer" target={isExternalHref(href) ? "_blank" : undefined}>
        {node}
      </a>
    );
  }

  return <>{node}</>;
}

/** `spans` yoksa metin düz basılıyor: TipTap öncesi kaydedilmiş bloklar böyle. */
function Inline({ content }: { content: { text: string; spans?: ArticleInlineSpan[] } }) {
  if (!content.spans) return <>{content.text}</>;

  return (
    <>
      {content.spans.map((span, index) => (
        <InlineSpan key={index} span={span} />
      ))}
    </>
  );
}

/**
 * Tek bir gövde bloğu.
 *
 * Haber detayıyla yönetim panelindeki önizleme aynı bileşeni çiziyor:
 * `articles_public_select` taslakları gizlediği için editör yayımlanmamış
 * işini yalnızca o önizlemede görebiliyor ve önizlemenin yayınla aynı
 * görünmesi bu yüzden önemli.
 */
export function BodyBlock({ block, index }: { block: ArticleBodyBlock; index: number }) {
  if (block.type === "heading") {
    const Heading = block.level === 3 ? "h3" : "h2";
    return (
      <Heading>
        <Inline content={block} />
      </Heading>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote>
        <p>
          “<Inline content={block} />”
        </p>
        <cite>{block.attribution}</cite>
      </blockquote>
    );
  }

  if (block.type === "list") {
    const List = block.ordered ? "ol" : "ul";
    return (
      <List>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>
            <Inline content={item} />
          </li>
        ))}
      </List>
    );
  }

  return (
    <p className={index === 0 ? styles.leadParagraph : undefined}>
      <Inline content={block} />
    </p>
  );
}
