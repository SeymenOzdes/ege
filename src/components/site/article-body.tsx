import type { ArticleBodyBlock } from "@/lib/articles";
import styles from "./article-detail.module.css";

/**
 * Gövde bloklarının tipografisini taşıyan sarmalayıcı sınıf. `.articleBody > p`,
 * `.articleBody h2` ve `.articleBody blockquote` kuralları bu sınıfa bağlı, bu
 * yüzden blokları çizen her yüzey aynı sarmalayıcıyı kullanmalı.
 */
export const articleBodyClassName = styles.articleBody;

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
