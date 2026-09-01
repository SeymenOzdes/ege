import type { ReactNode } from "react";
import Link from "next/link";
import { CORPORATE_PAGES } from "@/lib/corporate-pages";
import styles from "./corporate.module.css";

/**
 * Henüz doldurulmamış gerçek bilgi.
 *
 * Bilerek göze batıyor: künyede boş bırakılmış bir adres, yanlış doldurulmuş bir
 * adresten daha az tehlikeli ama fark edilmezse ikisi de yayına çıkar. İşaretli
 * hâli hem tarayıcıda hem de `pnpm build` çıktısındaki HTML'de aranabilir.
 *
 * Hepsinin dökümü `docs/kurumsal-sayfa-bilgileri.md` içinde.
 */
export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <mark className={styles.placeholder} data-doldurulacak="">
      [DOLDURULACAK: {children}]
    </mark>
  );
}

export type CorporateDocumentProps = {
  eyebrow: string;
  title: string;
  lede: string;
  /** Kendi yolunu vererek kardeş bağlantı listesinden çıkarılır. */
  path: string;
  children: ReactNode;
};

/**
 * Kurumsal belgelerin ortak kabuğu: künye, yayın ilkeleri, gizlilik ve
 * kardeşleri. Haberden farklı olarak tek sütun, sola hizalı ve dar — bu metinler
 * taranarak değil, madde madde okunuyor.
 */
export function CorporateDocument({
  eyebrow,
  title,
  lede,
  path,
  children,
}: CorporateDocumentProps) {
  const siblings = CORPORATE_PAGES.filter((page) => page.path !== path);

  return (
    <article className={styles.document}>
      <header className={styles.header}>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className={`font-editorial ${styles.title}`}>{title}</h1>
        <p className={styles.lede}>{lede}</p>

        {/* Metinler hukukçu onayından geçmeden yayına çıkmamalı; uyarı sayfanın
            kendisinde duruyor ki sadece geliştirici değil okur da görsün. */}
        <div className={styles.draftNotice} role="note">
          <span className="eyebrow">Taslak metin</span>
          <p>
            Bu sayfa yayına hazırlanıyor. İşaretli alanlardaki bilgiler kurum kayıtlarıyla
            doldurulup hukuki denetimden geçmeden bağlayıcı sayılmaz.
          </p>
        </div>
      </header>

      <div className={styles.prose}>{children}</div>

      <nav className={styles.related} aria-label="Diğer kurumsal sayfalar">
        <span className="eyebrow">Diğer belgeler</span>
        <div className={styles.relatedLinks}>
          {siblings.map((page) => (
            <Link href={page.path} key={page.path}>
              {page.label}
            </Link>
          ))}
        </div>
      </nav>
    </article>
  );
}

/** Künye ve iletişim satırları: etiket üstte, değer altta. */
export function FactList({ children }: { children: ReactNode }) {
  return <dl className={styles.factList}>{children}</dl>;
}

export function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
